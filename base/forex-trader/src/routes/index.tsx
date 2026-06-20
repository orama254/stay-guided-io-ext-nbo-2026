import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PAIRS, type PairSymbol } from '../types/forex'
import { useCandles, useQuotes } from '../hooks/useMarket'
import { usePositions } from '../hooks/useTrading'
import { PairTabs } from '../components/PairTabs'
import { TickerHeader } from '../components/TickerHeader'
import { CandleChart } from '../components/CandleChart'
import { TradePanel } from '../components/TradePanel'
import { PositionsList } from '../components/PositionsList'

export const Route = createFileRoute('/')({
  component: TradeScreen,
})

function TradeScreen() {
  const [pair, setPair] = useState<PairSymbol>(PAIRS[0])
  const { data: quotes } = useQuotes()
  const { data: candles = [] } = useCandles(pair)
  const { data: positions = [] } = usePositions()
  const quote = quotes?.find((q) => q.pair === pair)

  return (
    <main className="screen">
      <PairTabs pairs={PAIRS} active={pair} onSelect={setPair} />

      {quote ? (
        <TickerHeader quote={quote} />
      ) : (
        <div className="ticker ticker--loading">Connecting to market…</div>
      )}

      <CandleChart candles={candles} decimals={quote?.decimals ?? 5} />

      {quote && <TradePanel quote={quote} />}

      <section className="section">
        <h2 className="section__title">Open positions</h2>
        <PositionsList positions={positions} />
      </section>
    </main>
  )
}
