# Contributing to Power Platform Companion

Thank you for your interest in contributing! This project is a React + TypeScript SPA built with Vite, focused on offline‑friendly developer utilities for Power Platform.

## Getting Started

1. Clone and open the repo.
2. Install dependencies and run the web app:

```bash
cd web
npm install
npm run dev
```

3. Open http://localhost:5173 and verify pages load.

## Project Structure

See `README.md` and `docs/structure.md` for a high‑level overview. Key paths:

- `web/` — React app (Vite)
- `web/src/pages/` — one feature per page (e.g., `IconsPage.tsx`)
- `web/src/components/` — reusable UI components (e.g., `NavBar.tsx`)
- `web/public/*.example.json` — static example data (snippets, resources, roadmap)
- `docs/` — architecture, routing, security, schemas, background, vision

## Coding Standards

- TypeScript strictness: prefer explicit types in exported functions/components.
- One feature per page under `web/src/pages/`. Extract reusable logic to `web/src/utils/`.
- Keep components small and testable. Avoid tight coupling between pages.
- Persist only user preferences in `localStorage` (no sensitive data).
- External links should use `rel="noreferrer"`.
- UK English spelling in UI and docs.

## UI/UX

- Left sidebar navigation (`web/src/components/NavBar.tsx`).
- Keep layouts simple; put cross‑cutting styles in `web/src/index.css`.
- Prefer accessibility-friendly controls and sensible defaults.

## Data & Schemas

- MVP data is static and loaded from `web/public/*.example.json`.
- Document and validate shapes (see `docs/schemas.md`).
- Avoid adding real/tenant-specific data to the repo.

## Commit Messages

- Conventional style is preferred, e.g.:
  - `feat(Icons): add Lucide import support`
  - `docs(vision): add success metrics`
  - `chore: normalise markdown spacing`

## Pull Requests

1. Create a branch off `main` with a concise name, e.g. `feat/icons-import`, `docs/security-hardening`.
2. Keep PRs small and focused. Link issues if applicable.
3. Describe changes, testing steps, and screenshots/GIFs for UI changes.
4. Ensure the app builds and runs locally (`npm run dev`).
5. Address review feedback promptly.

## Issue Reports

When filing an issue, include:

- Expected vs actual behaviour
- Steps to reproduce (with input data where relevant)
- Environment details (OS, browser)
- Screenshots for UI issues

## Security

- No secrets or tokens in the repo.
- Treat imported SVG safely; avoid executing untrusted content.
- See `docs/security.md` for the current security posture and future plans.

## Roadmap

- Short‑term items are tracked in `docs/vision.md` under Near‑term.
- For new proposals, open an issue and discuss before large changes.

Thanks again for contributing!
