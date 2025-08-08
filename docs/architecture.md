# Architecture

This project ships a React + TypeScript single‑page app (SPA) built with Vite. The goal is a maintainable MVP with clear feature boundaries and simple data flows.

- Frontend: React 18, TypeScript, React Router.
- Build tooling: Vite.
- Data: public JSON examples; browser `localStorage` for lightweight state; no backend service yet.
- Styling: global CSS (`web/src/index.css`) + component CSS modules where needed (e.g. `NavBar.css`).

## High‑level layout

- `NavBar` provides a left collapsible sidebar. It toggles `body.sidebar-collapsed` and shifts `#root` via CSS padding.
- Main pages render into `<Routes>` inside `App.tsx`.

## State & persistence

- UI preferences (e.g., roadmap notification window, icon defaults) are persisted in `localStorage` under the `mm.*` namespace.
- Data for pages (snippets/resources/roadmap) load from `/public/*.example.json` as placeholders and can be replaced with remote sources later.

## Error handling

- Client pages rely on try/catch with user‑friendly fallbacks (embedded examples) and small warnings in the UI.

## Extensibility

- Each feature lives in its own page component under `web/src/pages/` with small utilities colocated or in `web/src/utils/`.
- Future backend: add a lightweight API (Node/Express/Azure Functions) to support authenticated sources, telemetry, and RAG retrieval.
