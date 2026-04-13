# Palette

AI-powered color exploration tool with three modes — mood-driven palettes, monochrome shade scales, and full brand systems — with live UI previews.

Born out of the back-and-forth of picking colors for real products. The goal: test color directions quickly and think about color in a more dynamic, intuitive way.

---

## Modes

**Mood** — Describe a scene or feeling. Claude generates a named palette of 5–7 colors and 2–3 gradients with evocative names, roles, and usage notes.

**Monochrome** — Pick a base color in HEX, RGB, or HSL. Get a full 50–950 shade scale, a gradient strip, and one-click export as CSS custom properties or a Tailwind config block.

**Brand** — Enter a brand name, personality description, and optional product names. Get a complete color system: primary, secondary, neutrals, per-product accents, and gradients.

All generated palettes preview live across five UI contexts: Cards, Dashboard, Charts, Gradients, and Typography.

---

## Setup

**Requirements:** Node.js 20.18+

```bash
git clone <repo>
cd palette
npm install
```

Copy the env file and add your Anthropic API key:

```bash
cp .env.example .env
```

Open `.env` and set:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Start the app:

```bash
npm run dev
```

This starts two processes together:
- **API server** → `http://127.0.0.1:3001` (holds the API key, never exposed to the browser)
- **Vite dev server** → `http://127.0.0.1:5173`

Open `http://127.0.0.1:5173` in your browser.

---

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- chroma-js — color math (shade scales, contrast, conversions)
- Anthropic SDK (claude-sonnet-4-6) — server-side only
- Express + express-rate-limit — local API proxy

---

## Security model

The Anthropic API key lives exclusively in the Express server process. The browser never sees it — all Claude calls go through `/api/*`, which Vite proxies to the local server. The server binds to `127.0.0.1` (loopback only) and enforces rate limiting and input validation on every request.
