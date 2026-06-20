import { useState } from 'react'
import type { OrderSide, Quote } from '../types/forex'
import { usePlaceOrder } from '../hooks/useTrading'
import { formatPrice, formatUnits } from '../lib/format'

const UNIT_PRESETS = [1_000, 10_000, 100_000]

export function TradePanel({ quote }: { quote: Quote }) {
  const [units, setUnits] = useState(10_000)
  const placeOrder = usePlaceOrder()

  const submit = (side: OrderSide) => {
    placeOrder.mutate({ pair: quote.pair, side, units })
  }

  return (
    <section className="trade-panel">
      <div className="trade-panel__sizes" role="radiogroup" aria-label="Order size">
        {UNIT_PRESETS.map((value) => (
          <button
            key={value}
            type="button"
            className={`chip${units === value ? ' chip--active' : ''}`}
            onClick={() => setUnits(value)}
          >
            {formatUnits(value)}
          </button>
        ))}
      </div>

      <div className="trade-panel__actions">
        <button
          type="button"
          className="btn btn--sell"
          disabled={placeOrder.isPending}
          onClick={() => submit('sell')}
        >
          <span className="btn__label">Sell</span>
          <span className="btn__price">{formatPrice(quote.bid, quote.decimals)}</span>
        </button>
        <button
          type="button"
          className="btn btn--buy"
          disabled={placeOrder.isPending}
          onClick={() => submit('buy')}
        >
          <span className="btn__label">Buy</span>
          <span className="btn__price">{formatPrice(quote.ask, quote.decimals)}</span>
        </button>
      </div>

      {placeOrder.data && (
        <p className="trade-panel__confirmation">
          {placeOrder.data.side === 'buy' ? 'Bought' : 'Sold'}{' '}
          {formatUnits(placeOrder.data.units)} {placeOrder.data.pair} @{' '}
          {formatPrice(placeOrder.data.price, quote.decimals)}
        </p>
      )}
      {placeOrder.isError && (
        <p className="trade-panel__error">Order failed — please try again.</p>
      )}
    </section>
  )
}
