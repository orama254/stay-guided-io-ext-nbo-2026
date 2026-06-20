import type { OrderSide, PairSymbol, Position, Trade } from '../types/forex'
import { getDecimals, getQuote } from './market-engine'

const g = globalThis as typeof globalThis & { __fxTrades?: Trade[] }

function getStore(): Trade[] {
  g.__fxTrades ??= []
  return g.__fxTrades
}

export function executeOrder(pair: PairSymbol, side: OrderSide, units: number): Trade {
  const quote = getQuote(pair)
  const trade: Trade = {
    id: crypto.randomUUID(),
    pair,
    side,
    units,
    price: side === 'buy' ? quote.ask : quote.bid,
    executedAt: Date.now(),
  }
  getStore().unshift(trade)
  return trade
}

export function listTrades(): Trade[] {
  return getStore()
}

export function listPositions(): Position[] {
  const byPair = new Map<PairSymbol, Trade[]>()
  for (const trade of getStore()) {
    const group = byPair.get(trade.pair) ?? []
    group.push(trade)
    byPair.set(trade.pair, group)
  }

  const positions: Position[] = []
  for (const [pair, trades] of byPair) {
    let units = 0
    let cost = 0
    for (const trade of trades) {
      const signed = trade.side === 'buy' ? trade.units : -trade.units
      units += signed
      cost += signed * trade.price
    }
    if (units === 0) continue

    const avgEntry = cost / units
    const { mid } = getQuote(pair)
    positions.push({
      pair,
      units,
      avgEntry,
      currentPrice: mid,
      // Simplified: P/L expressed in the quote currency
      unrealizedPl: (mid - avgEntry) * units,
      decimals: getDecimals(pair),
    })
  }
  return positions
}
