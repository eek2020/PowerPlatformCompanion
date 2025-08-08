# Roadmap

## Progress 2025-08-08

- Verified local app boot via Vite (`npm run dev`) in `web/`.
- Hardened Netlify function `netlify/functions/licensing-fetch.ts`:
  - Added URL path normalization (`normalizeUrl`).
  - Switched to browser-like headers (User-Agent/Accept/Language/Cache-Control).
  - Improved error payload with `statusText` and echo of final URL.

## Licensing Phase 2: PDF Fetch + Parsing

Status: Paused (UI hidden behind feature flag)

Outstanding tasks:
- [ ] Implement resilient serverless fetch for Microsoft CDN
  - Path normalization (done)
  - Add browser-like headers (done)
  - Consider HEAD-then-GET fallback
  - Consider alternative mirrors or official endpoints
  - Add retry/backoff for transient 5xx
- [ ] Parse PDF into structured `LicensingDataset`
  - Choose parser (pdf.js in Node, or pdf-parse)
  - Extract text and sections relevant to entitlements, limits, SKUs
  - Map into normalized schema (see `packs/licensing.schema.json`)
- [ ] Surface parsed data in UI
  - Rich view for SKUs/entitlements
  - Tie into “Derived capabilities” rules
- [ ] QA and e2e tests

Notes:
- Feature flag in `web/src/pages/LicensingPage.tsx` (`enablePdfPhase2`) currently false.
- Netlify function: `netlify/functions/licensing-fetch.ts`.
- Redirect: `/api/licensing/fetch` → `/.netlify/functions/licensing-fetch` in `netlify.toml`.
