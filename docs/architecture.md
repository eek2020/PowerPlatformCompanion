# Architecture

This project ships a React + TypeScript single‑page app (SPA) built with Vite. The goal is a maintainable MVP with clear feature boundaries and simple data flows.

- Frontend: React 18, TypeScript, React Router.
- Build tooling: Vite.
- Data: public JSON examples; browser `localStorage` for lightweight state; no backend service yet.
- Styling: global CSS (`web/src/index.css`) + component CSS modules where needed (e.g. `NavBar.css`).

## High‑level layout

- `NavBar` provides a left collapsible sidebar. It toggles `body.sidebar-collapsed` and shifts `#root` via CSS padding.
- Main pages render into `<Routes>` inside `App.tsx`.

### Responsive layout & overflow guards

The app uses a fixed left sidebar and offsets the main app container using CSS variables defined in `web/src/index.css`:

```css
:root {
  --sidebar-w: 248px;
  --sidebar-w-collapsed: 64px;
}

#root { padding-left: var(--sidebar-w); }
body.sidebar-collapsed #root { padding-left: var(--sidebar-w-collapsed); }

@media (max-width: 768px) {
  #root { padding-left: var(--sidebar-w-collapsed); }
}
```

The sidebar itself uses `box-sizing: border-box` to ensure its declared width includes padding/border exactly and prevent content from bleeding underneath.

Global overflow protections are applied in `web/src/index.css`:

- `body { overflow-x: hidden }` to suppress accidental horizontal scrolling.
- `*, *::before, *::after { box-sizing: border-box }` to keep layout widths predictable.
- Long-content guards for code and text: `pre, code { white-space: pre-wrap; overflow-wrap: anywhere; }` and media `max-width: 100%`.

Snippets page cards (`web/src/pages/SnippetsPage.tsx`) are constrained with `maxWidth: '100%'`, allow header wrapping, and set `minWidth: 0` on content columns so that long titles or buttons do not force horizontal overflow.

## State & persistence

- UI preferences (e.g., roadmap notification window, icon defaults) are persisted in `localStorage` under the `mm.*` namespace.
- Data for pages (snippets/resources/roadmap) load from `/public/*.example.json` as placeholders and can be replaced with remote sources later.

## Error handling

- Client pages rely on try/catch with user‑friendly fallbacks (embedded examples) and small warnings in the UI.

## Roadmap data model & refresh

- The Roadmap page (`web/src/pages/RoadmapPage.tsx`) loads from `/roadmap.example.json`.
- Responses are cached in `localStorage` under `mm.roadmap.cache.v1` with a timestamp `mm.roadmap.cacheAt`.
- The UI serves cached data immediately if present and less than 6 hours old, then refreshes in the background.
- Auto-refresh runs every 30 minutes and also on tab focus.
- Items are mapped to a view-model adding flags (`dueSoon`, `dueThisOrPrev`) and converting `due` to `Date` for display.
- Users can select an item to open an inline details panel with quick actions and link out to the official source when available.

### Optional M365 Public Roadmap API

- Enable via `VITE_M365_SOURCE=on` (e.g. in `web/.env.local`).
- Dev-only Vite proxy maps `/api/m365` → `https://www.microsoft.com/releasecommunications/api/v1/m365` to avoid CORS.
- When enabled, fetches from `/api/m365`, maps items into the internal `RoadmapItem` shape, and caches under:
  - `mm.roadmap.m365.cache.v1`
  - `mm.roadmap.m365.cacheAt`
- If API is unavailable or returns no items, falls back to local JSON and embedded examples.
- Deep link uses the API-provided `link` when present; otherwise falls back to `https://roadmap.microsoft.com/?search=<title+area>`.

## Extensibility

- Each feature lives in its own page component under `web/src/pages/` with small utilities colocated or in `web/src/utils/`.
- Future backend: add a lightweight API (Node/Express/Azure Functions) to support authenticated sources, telemetry, and RAG retrieval.
