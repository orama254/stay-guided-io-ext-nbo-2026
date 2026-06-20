# FX Trader — TanStack Start demo base

Base Forex trading app for a live technical demo on micro-interactions in a
mobile-friendly webview. Mock backend (server functions + in-memory price
engine), polling market data via TanStack Query, buy/sell with an in-memory
portfolio, deliberately plain mobile-first UI.

## Prerequisites

- Node.js 22 LTS (Vite 7 requires >= 20.19) — check with `node -v`
- pnpm 9+ — `corepack enable` or `npm i -g pnpm`

## Getting started

```bash
pnpm install
pnpm dev          # generates src/routeTree.gen.ts automatically
```

Open http://localhost:3000. For a mobile webview demo, run
`pnpm dev --host` and point the device at your machine's LAN IP.

Other commands:

```bash
pnpm typecheck    # tsc --noEmit
pnpm build        # production build
pnpm start        # run the production server
```

## Architecture

- `src/server/market-engine.ts` — mock price engine (random walk -> candles/quotes).
  Lazy ticking: prices advance based on elapsed wall-clock time on each request,
  so no background interval is needed.
- `src/server/portfolio.ts` — in-memory trade log + position calculation.
- `src/server/functions.ts` — TanStack Start server functions (the API surface).
- `src/hooks/` — data layer (TanStack Query polling: 1s quotes/candles, 2s positions).
- `src/components/` — dumb, props-driven UI components.
- `src/routes/` — file-based routes: `/` (trade screen), `/history` (trade log).

State resets on server restart — ideal for a repeatable demo.

## Extension seams for the micro-interactions session

- Animate `ticker__price` on quote change
- Candle entry transitions in `CandleChart`
- Press feedback on `.btn--buy` / `.btn--sell`
- A toast replacing `trade-panel__confirmation`

All isolated in `src/components/` + `src/styles.css` — no data-layer changes needed.
