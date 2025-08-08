# Power Platform Companion (web)

React + TypeScript + Vite app.

## Development

- Install deps and run dev server:

```bash
npm install
npm run dev
```

- The dev server includes a proxy for the M365 Public Roadmap API at `/api/m365` to avoid CORS.

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
