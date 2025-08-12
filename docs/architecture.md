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
  --sidebar-w: 476px;
  --sidebar-w-collapsed: 80px;
}

#root { padding-left: var(--sidebar-w); }
body.sidebar-collapsed #root { padding-left: var(--sidebar-w-collapsed); }

@media (max-width: 768px) {
  #root { padding-left: var(--sidebar-w-collapsed); }
}
```

The sidebar itself uses `box-sizing: border-box` to ensure its declared width includes padding/border exactly and prevent content from bleeding underneath.

When collapsed, clicking a main rail auto-expands the sidebar and opens the corresponding submenu. A hover flyout is shown only in collapsed mode; in expanded mode the inline panel is used.

Global overflow protections are applied in `web/src/index.css`:

- `body { overflow-x: hidden }` to suppress accidental horizontal scrolling.
- `*, *::before, *::after { box-sizing: border-box }` to keep layout widths predictable.
- Long-content guards for code and text: `pre, code { white-space: pre-wrap; overflow-wrap: anywhere; }` and media `max-width: 100%`.

Snippets page cards (`web/src/pages/SnippetsPage.tsx`) are constrained with `maxWidth: '100%'`, allow header wrapping, and set `minWidth: 0` on content columns so that long titles or buttons do not force horizontal overflow.

## State & persistence

- UI preferences (e.g., roadmap notification window, icon defaults) are persisted in `localStorage` under the `mm.*` namespace.
- Data for pages (snippets/resources/roadmap) load from `/public/*.example.json` as placeholders and can be replaced with remote sources later.
- AI configuration is centralized in `web/src/lib/ai.ts` with the following responsibilities:
  - Active provider/model getters/setters (`mm.ai.activeProvider`, `mm.ai.activeModel`).
  - Model lists per provider (`mm.ai.models.openai`, `mm.ai.models.anthropic`).
  - Per provider+model system prompts (`mm.ai.prompt.<provider>.<model>`).
  - Per‑process bindings map (`mm.ai.bindings.v1`) and `resolveConfig(process)` to determine effective provider/model/prompt.

### AI settings pages

- `web/src/pages/AIProvidersPage.tsx`: Consolidated management of AI providers. Features: collapsible provider sections; add/edit API keys (OpenAI/Anthropic and custom providers); add/remove providers; manage provider‑scoped models; and manage AI Process Bindings directly within this page. For development, keys are stored locally; use a serverless proxy in production.
- `web/src/pages/AIModelsPage.tsx`: Choose active provider/model, fetch or seed model lists, and edit per‑model system prompts.

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
- Production uses a Netlify Function at `/.netlify/functions/m365` with a redirect from `/api/m365` (see `netlify.toml` and `netlify/functions/m365.ts`).
- When enabled, fetches from `/api/m365`, maps items into the internal `RoadmapItem` shape, and caches under:
  - `mm.roadmap.m365.cache.v1`
  - `mm.roadmap.m365.cacheAt`
- If API is unavailable or returns no items, falls back to local JSON and embedded examples.
- Deep link uses the API-provided `link` when present; otherwise falls back to `https://roadmap.microsoft.com/?search=<title+area>`.

#### Enable in dev

1. Create `web/.env.local` with `VITE_M365_SOURCE=on`.
2. Run the dev server; the Vite proxy serves `/api/m365`.

#### Enable in production (Netlify)

1. Ensure `netlify.toml` is present at repo root (functions dir + redirects configured).
2. Deploy on Netlify; the function proxy is available at `/api/m365`.
3. Set `VITE_M365_SOURCE=on` in the site env variables.

## Extensibility

- Each feature lives in its own page component under `web/src/pages/` with small utilities colocated or in `web/src/utils/`.
- CSS is kept simple with a small number of utility rules in `web/src/index.css`.

## Planning

- Page: `web/src/pages/PlanningPage.tsx`.
- Add/edit items across categories (Power Platform/Azure/Other) with cascading component dropdowns.
- Fields: Category, Component, Complexity (Simple/Moderate/Complex), T‑shirt size (XS‑XL).
- Inline ℹ️ opens an accessible guidance modal per component to help choose complexity.
- Estimated hours per row are derived from T‑shirt size; a total is shown for all rows.
- Data persists to `localStorage` under `mm.planning.v1`.
- CSV export headers: `Category, Component, Complexity, T‑Shirt, EstHours`.
- Configurable via Settings (`web/src/pages/SettingsPage.tsx`):
  - Component lists: `mm.planning.components.v1` for Power Platform/Azure.
  - Size→hours mapping: `mm.planning.sizeHours.v1`.

## Future backend

- Add a lightweight API (Node/Express/Azure Functions) to support authenticated sources, telemetry, and RAG retrieval.

## Accessibility

- WCAG 2.2 improvements:
  - Skip link and main landmark in `App.tsx` (`<a class="skip-link">`, `role="main"`, focus target for keyboard users).
  - Clear keyboard focus with `:focus-visible` in `web/src/App.css`.
  - `NavBar.tsx` uses `<nav role="navigation" aria-label="Primary">` and a semantic `<ul>/<li>` list; the collapse toggle exposes `aria-expanded` and `aria-controls`.
  - Guidance modal: labeled (`aria-labelledby`/`aria-describedby`), focus-trapped, Escape/backdrop close, and returns focus to invoker.
