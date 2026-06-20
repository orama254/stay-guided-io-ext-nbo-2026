import type { Candle } from '../types/forex'

const WIDTH = 360
const HEIGHT = 220
const PAD_Y = 10
const VISIBLE = 40

export function CandleChart({ candles, decimals }: { candles: Candle[]; decimals: number }) {
  if (candles.length === 0) {
    return <div className="chart chart--loading">Loading market data…</div>
  }

  const visible = candles.slice(-VISIBLE)
  const min = Math.min(...visible.map((c) => c.low))
  const max = Math.max(...visible.map((c) => c.high))
  const range = max - min || 1
  const toY = (price: number) => PAD_Y + ((max - price) / range) * (HEIGHT - PAD_Y * 2)
  const slot = WIDTH / VISIBLE
  const bodyWidth = slot * 0.6

  return (
    <div className="chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Candlestick price chart"
      >
        {[max, (max + min) / 2, min].map((level) => (
          <line
            key={level}
            x1={0}
            x2={WIDTH}
            y1={toY(level)}
            y2={toY(level)}
            className="chart__grid"
          />
        ))}
        {visible.map((candle, i) => {
          const x = i * slot + slot / 2
          const up = candle.close >= candle.open
          const bodyTop = toY(Math.max(candle.open, candle.close))
          const bodyHeight = Math.max(1, Math.abs(toY(candle.open) - toY(candle.close)))
          return (
            <g key={candle.time} className={up ? 'candle--up' : 'candle--down'}>
              <line
                x1={x}
                x2={x}
                y1={toY(candle.high)}
                y2={toY(candle.low)}
                className="candle__wick"
              />
              <rect
                x={x - bodyWidth / 2}
                y={bodyTop}
                width={bodyWidth}
                height={bodyHeight}
                className="candle__body"
              />
            </g>
          )
        })}
      </svg>
      <div className="chart__scale">
        <span>{max.toFixed(decimals)}</span>
        <span>{min.toFixed(decimals)}</span>
      </div>
    </div>
  )
}
