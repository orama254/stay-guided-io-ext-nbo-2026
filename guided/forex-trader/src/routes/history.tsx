import { createFileRoute } from '@tanstack/react-router'
import { useTradeHistory } from '../hooks/useTrading'
import { formatPrice, formatTime, formatUnits } from '../lib/format'

export const Route = createFileRoute('/history')({
  component: HistoryScreen,
})

function HistoryScreen() {
  const { data: trades = [], isLoading } = useTradeHistory()

  return (
    <main className="screen">
      <header className="page-header">
        <h1 className="page-header__title">Trade history</h1>
        <p className="page-header__subtitle">All executed orders this session</p>
      </header>

      {isLoading && <p className="empty">Loading…</p>}
      {!isLoading && trades.length === 0 && (
        <p className="empty">No trades yet. Place an order on the Trade screen.</p>
      )}

      <ul className="trades">
        {trades.map((trade) => (
          <li key={trade.id} className="trades__row">
            <div className="trades__left">
              <span className={`tag ${trade.side === 'buy' ? 'tag--long' : 'tag--short'}`}>
                {trade.side === 'buy' ? 'Buy' : 'Sell'}
              </span>
              <span className="trades__pair">{trade.pair}</span>
            </div>
            <div className="trades__right">
              <span className="trades__detail">
                {formatUnits(trade.units)} @ {formatPrice(trade.price, trade.pair === 'USD/JPY' ? 3 : 5)}
              </span>
              <span className="trades__time">{formatTime(trade.executedAt)}</span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
