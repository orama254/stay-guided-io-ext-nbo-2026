import { PAIRS, type Candle, type PairSymbol, type Quote } from '../types/forex'

interface PairConfig {
  basePrice: number
  volatility: number
  spread: number
  decimals: number
}

const CONFIG: Record<PairSymbol, PairConfig> = {
  'EUR/USD': { basePrice: 1.0842, volatility: 0.00012, spread: 0.00012, decimals: 5 },
  'GBP/USD': { basePrice: 1.2718, volatility: 0.00015, spread: 0.00015, decimals: 5 },
  'USD/JPY': { basePrice: 155.42, volatility: 0.018, spread: 0.018, decimals: 3 },
  'AUD/USD': { basePrice: 0.6651, volatility: 0.0001, spread: 0.00012, decimals: 5 },
}

const TICK_MS = 1_000
const CANDLE_MS = 5_000
const HISTORY_LENGTH = 60
const MAX_CATCHUP_STEPS = 600

interface PairState {
  price: number
  sessionOpen: number
  candles: Candle[]
  current: Candle
  lastTickAt: number
}

// Stored on globalThis so the simulated market survives Vite HMR in dev
const g = globalThis as typeof globalThis & { __fxMarket?: Map<PairSymbol, PairState> }

function round(value: number, decimals: number): number {
  return Number(value.toFixed(decimals))
}

function step(price: number, cfg: PairConfig): number {
  const meanReversion = (cfg.basePrice - price) * 0.002
  const noise = (Math.random() * 2 - 1) * cfg.volatility
  return round(price + meanReversion + noise, cfg.decimals)
}

function createPairState(pair: PairSymbol, now: number): PairState {
  const cfg = CONFIG[pair]
  let price = cfg.basePrice
  const candles: Candle[] = []
  let time = now - HISTORY_LENGTH * CANDLE_MS

  for (let i = 0; i < HISTORY_LENGTH; i++) {
    const open = price
    let high = open
    let low = open
    for (let s = 0; s < CANDLE_MS / TICK_MS; s++) {
      price = step(price, cfg)
      high = Math.max(high, price)
      low = Math.min(low, price)
    }
    candles.push({ time, open, high, low, close: price })
    time += CANDLE_MS
  }

  return {
    price,
    sessionOpen: candles[0].open,
    candles,
    current: { time, open: price, high: price, low: price, close: price },
    lastTickAt: now,
  }
}

function getMarket(): Map<PairSymbol, PairState> {
  if (!g.__fxMarket) {
    const now = Date.now()
    g.__fxMarket = new Map(PAIRS.map((pair) => [pair, createPairState(pair, now)]))
  }
  return g.__fxMarket
}

// Lazy ticking: prices advance based on elapsed wall-clock time on each read,
// so no background interval is needed and the engine works in any runtime.
function advance(pair: PairSymbol): PairState {
  const state = getMarket().get(pair)!
  const cfg = CONFIG[pair]
  const now = Date.now()
  const steps = Math.min(Math.floor((now - state.lastTickAt) / TICK_MS), MAX_CATCHUP_STEPS)

  for (let i = 0; i < steps; i++) {
    state.lastTickAt += TICK_MS
    state.price = step(state.price, cfg)

    const candle = state.current
    candle.close = state.price
    candle.high = Math.max(candle.high, state.price)
    candle.low = Math.min(candle.low, state.price)

    if (state.lastTickAt >= candle.time + CANDLE_MS) {
      state.candles.push({ ...candle })
      if (state.candles.length > HISTORY_LENGTH) state.candles.shift()
      state.current = {
        time: state.lastTickAt,
        open: state.price,
        high: state.price,
        low: state.price,
        close: state.price,
      }
    }
  }

  if (now - state.lastTickAt > TICK_MS * MAX_CATCHUP_STEPS) {
    state.lastTickAt = now
  }
  return state
}

export function getQuote(pair: PairSymbol): Quote {
  const state = advance(pair)
  const cfg = CONFIG[pair]
  const halfSpread = cfg.spread / 2
  return {
    pair,
    bid: round(state.price - halfSpread, cfg.decimals),
    ask: round(state.price + halfSpread, cfg.decimals),
    mid: state.price,
    change: round(state.price - state.sessionOpen, cfg.decimals),
    changePct: ((state.price - state.sessionOpen) / state.sessionOpen) * 100,
    decimals: cfg.decimals,
    timestamp: state.lastTickAt,
  }
}

export function getAllQuotes(): Quote[] {
  return PAIRS.map(getQuote)
}

export function getCandles(pair: PairSymbol): Candle[] {
  const state = advance(pair)
  return [...state.candles, { ...state.current }]
}

export function getDecimals(pair: PairSymbol): number {
  return CONFIG[pair].decimals
}
