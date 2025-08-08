# Security

This MVP is a client‑only SPA. There is no backend service and no authentication flow yet.

## Data boundaries

- Example data is loaded from `web/public/*.example.json`.
- User preferences persist in `localStorage` under the `mm.*` namespace.
- No PII is collected. No telemetry is sent.

## Browser storage

- Keys:
  - `mm.notifyWindowMonths` — Roadmap notification window.
  - `mm.icons.size`, `mm.icons.stroke`, `mm.icons.strokeColor`, `mm.icons.fillColor`, `mm.icons.rounded` — Icons defaults.
- Guidance: keep only non‑sensitive preferences in `localStorage`.

## External links & content

- Resource links (YouTube/blogs) open in a new tab with `rel="noreferrer"`.
- When adding external data sources later, validate JSON strictly and sanitize any injected HTML/SVG before render.

## Future hardening

- Introduce a backend for authenticated data (Dataverse, official roadmap) with OAuth/msal and API scoping.
- Content Security Policy (CSP) when hosting.
- Sanitization libraries for any rich HTML/SVG rendering.
- Telemetry: add privacy notice and opt‑in.
