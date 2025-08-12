# Power Platform Companion (web)

React + TypeScript + Vite app.

## Development

- Install deps and run dev server:

```bash
npm install
npm run dev
```

- The dev server includes a proxy for the M365 Public Roadmap API at `/api/m365` to avoid CORS.

### AI settings (development)

- The app provides dedicated pages under Settings for AI configuration:
  - Providers: `/settings/ai/providers` — manage API keys, provider models, and process bindings (consolidated)
  - Models: `/settings/ai/models`
- API keys are stored in `localStorage` for convenience in development. For production, route requests via a serverless proxy and do not expose API keys in the browser.
- AI helper: `src/lib/ai.ts` exposes `resolveConfig(process)` to obtain the effective provider/model/prompt.

### Optional: enable M365 Roadmap source

Create `.env.local` in this folder with:

```ini
VITE_M365_SOURCE=on
```

When enabled, the Roadmap page will fetch via `/api/m365`. Otherwise it uses the local `public/roadmap.example.json`.

## Build

```bash
npm run build
```

Outputs to `dist/`.
