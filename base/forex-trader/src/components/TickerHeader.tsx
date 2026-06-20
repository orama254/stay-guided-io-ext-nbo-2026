import type { Quote } from '../types/forex'
import { formatPrice, formatSignedPct } from '../lib/format'

export function TickerHeader({ quote }: { quote: Quote }) {
  const up = quote.change >= 0

  return (
    <section className="ticker">
      <div className="ticker__top">
        <h1 className="ticker__pair">{quote.pair}</h1>
        <span className={`ticker__change ${up ? 'pl--up' : 'pl--down'}`}>
          {formatSignedPct(quote.changePct)}
        </span>
      </div>
      <div className="ticker__price">{formatPrice(quote.mid, quote.decimals)}</div>
      <div className="ticker__spread">
        <span>Bid {formatPrice(quote.bid, quote.decimals)}</span>
        <span>Ask {formatPrice(quote.ask, quote.decimals)}</span>
      </div>
    </section>
  )
}
