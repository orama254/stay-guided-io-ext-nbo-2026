import { createServerFn } from '@tanstack/react-start'
import { PAIRS, type OrderSide, type PairSymbol } from '../types/forex'
import * as market from './market-engine'
import * as portfolio from './portfolio'

function assertPair(value: unknown): PairSymbol {
  if (typeof value === 'string' && (PAIRS as readonly string[]).includes(value)) {
    return value as PairSymbol
  }
  throw new Error(`Unknown currency pair: ${String(value)}`)
}

export const fetchQuotes = createServerFn({ method: 'GET' }).handler(() =>
  market.getAllQuotes(),
)

export const fetchCandles = createServerFn({ method: 'GET' })
  .inputValidator((pair: unknown) => assertPair(pair))
  .handler(({ data }) => market.getCandles(data))

interface OrderInput {
  pair: PairSymbol
  side: OrderSide
  units: number
}

export const submitOrder = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown): OrderInput => {
    const { pair, side, units } = input as Record<string, unknown>
    if (side !== 'buy' && side !== 'sell') {
      throw new Error('side must be "buy" or "sell"')
    }
    if (typeof units !== 'number' || !Number.isFinite(units) || units <= 0) {
      throw new Error('units must be a positive number')
    }
    return { pair: assertPair(pair), side, units }
  })
  .handler(({ data }) => portfolio.executeOrder(data.pair, data.side, data.units))

export const fetchPositions = createServerFn({ method: 'GET' }).handler(() =>
  portfolio.listPositions(),
)

export const fetchTrades = createServerFn({ method: 'GET' }).handler(() =>
  portfolio.listTrades(),
)
