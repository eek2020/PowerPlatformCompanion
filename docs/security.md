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

### AI configuration (dev only)

- For developer convenience, AI provider API keys may be stored locally via the UI in `localStorage`.
- Do not ship production with API keys in the browser. Instead:
  - Use a serverless proxy (e.g., Netlify Functions/Azure Functions) to keep secrets server‑side.
  - The browser should call your proxy; the proxy calls the AI provider using server‑side keys.
  - Restrict origins and add basic abuse protection (rate limit/recaptcha) if exposing public endpoints.
  - Consider per‑user authentication if needed; never embed secrets in client code or `localStorage`.

### CORS and model lists

- Direct browser calls to AI model listing endpoints can be blocked by CORS.
- The app falls back to seeded model lists when network calls fail.
- In production, route model list and inference calls through the proxy noted above.

## External links & content

- Resource links (YouTube/blogs) open in a new tab with `rel="noreferrer"`.
- When adding external data sources later, validate JSON strictly and sanitize any injected HTML/SVG before render.

## Future hardening

- Introduce a backend for authenticated data (Dataverse, official roadmap) with OAuth/msal and API scoping.
- Content Security Policy (CSP) when hosting.
- Sanitization libraries for any rich HTML/SVG rendering.
- Telemetry: add privacy notice and opt‑in.
