# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `frontend/`:

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint via Next.js
```

No test runner is configured yet (`frontend/src/test/` and `frontend/vitest.config.ts` are stubbed but empty).

## Environment

Copy `.env.local` in `frontend/` and set:

```
NEXT_PUBLIC_MAPBOX_TOKEN=<your mapbox public token>
```

Without this token the map will not render.

## Architecture

This is a **Next.js 14 App Router** app (frontend-only, no database). The root page redirects to `/globe`, which dynamically imports `GlobeMap` with SSR disabled (Mapbox GL requires browser globals).

### Data

Location data lives in `frontend/src/data/locations.json` — a static JSON array of user check-ins. Each entry has a `userId`, `lastVisited`, and a `locations` array of `{ coordinate, logo, city, country, continent, createdAt }`. The `frontend/src/app/api/checkin/` and `frontend/src/app/api/locations/` route directories are empty stubs for future backend work.

### GlobeMap component

`src/components/GlobeMap/index.tsx` is the core of the app. It owns the Mapbox GL instance and orchestrates:

- **Markers & clustering** — individual location pins (SVG logos + labels) are grouped when within 70px of each other on screen; cluster badges show the hidden count. Markers are rebuilt on every camera move.
- **Country highlighting** — `src/lib/mapbox.ts` manages feature-state on the `country-boundaries` source; all visited countries get a lighter fill, hovered country gets a blue overlay.
- **Journey line** — a `LineString` GeoJSON source connecting all coordinates in visit order.
- **Auto-rotation** — `requestAnimationFrame` loop; stops on any user pointer/keyboard interaction.
- **Theme switching** — swaps the Mapbox style URL (dark-v11 / light-v11) and re-applies atmosphere via `applyAtmosphere()` in `src/lib/mapbox.ts`.

### Styling

SCSS modules per component. Design tokens (colors, spacing, motion curves, shadows) are CSS custom properties in `src/styles/_variables.scss`, scoped to `[data-theme="dark"]` / `[data-theme="light"]` on `<html>`. Shared mixins (glassmorphism, focus ring, reduced-motion guard) are in `src/styles/_mixins.scss`.

### Path alias

`@/*` resolves to `src/*` (configured in `tsconfig.json` and `next.config.mjs`).
