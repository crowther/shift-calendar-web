# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server at http://localhost:3000/shift-calendar/
npm run build        # Production build to dist/
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run format:check # Prettier (check only)
```

No test suite exists. The build (`npm run build`) is the main correctness check.

The dev server proxies `/shift-calendar/calendars/*` and `/shift-calendar/health` to a locally-running API at `http://localhost:8000`. The app will load without the API but all calendar data will fail to fetch.

## Architecture

Single-page React app. All state lives in `App.jsx` and is passed down as props — there is no global state library.

**Data flow:**
1. `useCalendarData` (hook) fetches ICS files from the API and parses them via `parseICS` in `utils.js`. It fetches ±1 year on mount and extends the range lazily as the user navigates.
2. `App.jsx` holds `selectedShifts`, `view`, `currentDate`, and `page` (calendar vs subscribe). These are synced to the URL via `updateURL` in `utils.js`.
3. Events flow down to `GridView` (FullCalendar wrapper) or `ListView` (custom table) depending on `view`.

**URL state:** `?shifts=1-3-5&view=grid&month=2026-04`. The subscribe page is a separate client-side route at `/shift-calendar/subscribe` (no router — just `window.history.pushState`).

**ICS source:** The API serves per-shift ICS files (`shift1.ics` … `shift5.ics`, `all_shifts.ics`). Events carry custom `X-SHIFT-NUMBER`, `X-SHIFT-TYPE`, and `X-SHIFT-CODE` properties, parsed into `extendedProps` on each event object.

**Shift colours:** CSS variables `--s1` through `--s5` defined in `src/index.css`. Classes `shift-event-N` (GridView), `shift-bg-N` (ListView), and `sub-shift-N` (SubscribePage) all use these variables.

**`buildCalendarPath(shifts)`** in `utils.js` is the single source of truth for which ICS filename to request — used by both `useCalendarData` and `SubscribePage`.

## Deployment

Push to `master` → GitHub Actions builds a Docker image → pushes to GHCR → SSH deploys to VPS via `docker compose pull web && docker compose up -d`. No manual deploy step needed.

The app is served under the `/shift-calendar/` base path (set in `vite.config.js`). All asset paths and the `BASE_URL` env var reflect this.

The generator API (`generator.py`) runs as a separate service and is volume-mounted — changes to it only need `docker compose restart api`, not a full image rebuild.
