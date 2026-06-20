import type { Position } from '../types/forex'
import { formatPl, formatPrice, formatUnits } from '../lib/format'

export function PositionsList({ positions }: { positions: Position[] }) {
  if (positions.length === 0) {
    return <p className="empty">No open positions yet.</p>
  }

  return (
    <ul className="positions">
      {positions.map((position) => {
        const long = position.units >= 0
        const profitable = position.unrealizedPl >= 0
        return (
          <li key={position.pair} className="positions__row">
            <div className="positions__left">
              <span className="positions__pair">{position.pair}</span>
              <span className={`tag ${long ? 'tag--long' : 'tag--short'}`}>
                {long ? 'Long' : 'Short'} {formatUnits(Math.abs(position.units))}
              </span>
            </div>
            <div className="positions__right">
              <span className="positions__entry">
                avg {formatPrice(position.avgEntry, position.decimals)}
              </span>
              <span className={`pl ${profitable ? 'pl--up' : 'pl--down'}`}>
                {formatPl(position.unrealizedPl)}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
