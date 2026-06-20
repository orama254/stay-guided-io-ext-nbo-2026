import type { PairSymbol } from '../types/forex'

interface PairTabsProps {
  pairs: readonly PairSymbol[]
  active: PairSymbol
  onSelect: (pair: PairSymbol) => void
}

export function PairTabs({ pairs, active, onSelect }: PairTabsProps) {
  return (
    <nav className="pair-tabs" aria-label="Currency pairs">
      {pairs.map((pair) => (
        <button
          key={pair}
          type="button"
          className={`pair-tabs__tab${pair === active ? ' pair-tabs__tab--active' : ''}`}
          onClick={() => onSelect(pair)}
        >
          {pair}
        </button>
      ))}
    </nav>
  )
}
