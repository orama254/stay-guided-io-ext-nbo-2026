# Modern Web Guidance — I/O Extended Nairobi 2026 Workshop

> **Build polished micro-interactions with AI-assisted coding and modern web APIs.**

This repository contains the companion code for the *Modern Web Guidance* workshop. It is organized into three folders, each representing a different stage of the project.

---

## 📁 Repository Structure

```
.
├── base/           ← Starting point — plain app, no skills installed
├── guided/         ← Completed recap — skills installed, interactions implemented
└── unguided/       ← Challenge recap — skills NOT installed, interactions implemented independently
```

### [`base/`](base/)

The **starting point** for the workshop. This is the vanilla Forex Trader app with a deliberately plain, mobile-first UI. No AI skills are installed and no micro-interactions have been added — it's the blank canvas you'll work from during the live session.

**Use this folder to:**
- Follow along with the live workshop
- Start fresh and implement micro-interactions yourself

### [`guided/`](guided/)

The **guided recap** of the completed workshop. This folder contains the finished project with the `modern-web-guidance` skill already installed (`.agents/skills/`) and all micro-interactions implemented. Think of it as the "answer key."

**Use this folder to:**
- Review the final implementation after the workshop
- See how the `modern-web-guidance` skill was used
- Compare your work against the reference solution

### [`unguided/`](unguided/)

The **unguided recap** of the workshop. This folder has the same micro-interactions implemented, but *without* the `modern-web-guidance` skill installed — the code was written independently by an AI agent without best-practice guidance.

**Use this folder to:**
- Compare skill-guided vs. unguided AI output
- Explore differences in implementation quality and approach
- Challenge yourself to improve on the unguided solution

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Minimum | Check |
|---|---|---|
| Node.js | 22 LTS (Vite 7 requires ≥ 20.19) | `node -v` |
| pnpm | 9+ | `corepack enable` or `npm i -g pnpm` |

### Running Any Folder

Each folder contains an independent Forex Trader app. To run any of them:

```bash
# 1. Navigate into the project directory
cd base/forex-trader        # or guided/forex-trader, or unguided/forex-trader-unguided

# 2. Install dependencies
pnpm install

# 3. Start the dev server (auto-generates src/routeTree.gen.ts)
pnpm dev
```

Open **http://localhost:3000** in your browser.

For a **mobile webview demo**, run `pnpm dev --host` and point your device at your machine's LAN IP.

### Other Commands

```bash
pnpm typecheck    # tsc --noEmit
pnpm build        # production build
pnpm start        # run the production server
```

---

## 🏗️ Architecture

All three folders share the same app architecture:

```
src/
├── server/
│   ├── market-engine.ts   — Mock price engine (random-walk → candles/quotes)
│   ├── portfolio.ts       — In-memory trade log + position calculation
│   └── functions.ts       — TanStack Start server functions (API surface)
├── hooks/
│   ├── useMarket.ts       — Market data polling (TanStack Query, 1s interval)
│   └── useTrading.ts      — Positions + order placement (2s polling)
├── components/
│   ├── PairTabs.tsx        — Currency pair selector
│   ├── TickerHeader.tsx    — Live price ticker
│   ├── CandleChart.tsx     — SVG candlestick chart
│   ├── TradePanel.tsx      — Buy/sell controls ← main interaction target
│   ├── PositionsList.tsx   — Open positions display
│   └── BottomNav.tsx       — Tab navigation
├── routes/
│   ├── __root.tsx          — App shell layout
│   ├── index.tsx           — Trade screen (/)
│   └── history.tsx         — Trade log (/history)
├── lib/                    — Formatting utilities
├── types/                  — TypeScript type definitions
├── styles.css              — All styles (main file modified during workshop)
└── router.tsx              — TanStack Router setup
```

> **Note:** State resets on server restart — ideal for a repeatable demo.

---

## 🎯 Workshop Focus: Micro-Interactions

The workshop focuses on enhancing the `TradePanel` component and surrounding UI with polished micro-interactions. The key changes between `base/` and the completed versions include:

| Interaction | What changed |
|---|---|
| **Swipe-to-Trade Slider** | Simple Buy/Sell buttons → drag-to-confirm swipe sliders with directional feedback |
| **Position-Aware Close** | Added swipe-left-to-close with rubberband resistance when no position exists |
| **Visual Drag Feedback** | Background overlays that reveal proportionally as the user swipes |
| **Pending State Spinner** | Button disabled state → animated spinner in the handle during order submission |
| **Enhanced CSS** | ~160 additional lines of CSS for the slider component (overlays, handles, labels, animations) |

### Guided vs. Unguided Differences

| Aspect | Guided | Unguided |
|---|---|---|
| **Skill installed** | ✅ `modern-web-guidance` in `.agents/skills/` | ❌ No skill |
| **Drag implementation** | Pointer Events API (`setPointerCapture`) | Mouse/Touch event listeners on `window` |
| **Layout** | Vertical stack (`flex-direction: column`) | Vertical stack (`flex-direction: column`) |
| **Handle design** | BUY/SELL label + price, centered handle | Directional arrows (◀ ▶) + price |
| **Close interaction** | Rubberband resistance + explicit "No Position" label | Disabled label with reduced opacity |
| **CSS class naming** | `swipe-slider__*` (BEM) | `swipe-track__*` / `swipe-handle__*` (BEM) |

---

## 🔧 The `modern-web-guidance` Skill

The guided folder includes the [`modern-web-guidance`](guided/forex-trader/.agents/skills/modern-web-guidance/SKILL.md) skill from [`GoogleChrome/modern-web-guidance`](https://github.com/GoogleChrome/modern-web-guidance). This skill provides AI coding agents with up-to-date best practices for modern web development.

### How to Use the Skill

```bash
# Search for relevant guides
npx -y modern-web-guidance@latest search "swipe to confirm interaction"

# Retrieve a specific guide by ID
npx -y modern-web-guidance@latest retrieve "<guide-id>"

# List all available guides
npx -y modern-web-guidance@latest list
```

The skill covers categories including: accessibility, CSS, CSS layout, forms, HTML, performance, privacy, security, user experience, and more.

---

## 📝 License

Workshop materials for I/O Extended Nairobi 2026.


## Extra Resources

Workshop Content: https://bit.ly/ramaioextnbo26