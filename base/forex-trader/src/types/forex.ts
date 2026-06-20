export const PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'] as const
export type PairSymbol = (typeof PAIRS)[number]

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export interface Quote {
  pair: PairSymbol
  bid: number
  ask: number
  mid: number
  change: number
  changePct: number
  decimals: number
  timestamp: number
}

export type OrderSide = 'buy' | 'sell'

export interface Trade {
  id: string
  pair: PairSymbol
  side: OrderSide
  units: number
  price: number
  executedAt: number
}

export interface Position {
  pair: PairSymbol
  units: number
  avgEntry: number
  currentPrice: number
  unrealizedPl: number
  decimals: number
}
