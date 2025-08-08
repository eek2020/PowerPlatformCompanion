# Directory Structure

High‑level folders and purpose.

```text
PowerPlatformCompanion-1/
├─ web/                     # React + TS app (Vite)
│  ├─ public/               # Static assets and example JSON data
│  └─ src/
│     ├─ components/        # Reusable UI components (e.g. NavBar)
│     ├─ pages/             # Page‑level features (Snippets, Delegation, Formatter, ...)
│     ├─ data/              # Local mock data used by pages
│     ├─ utils/             # Small utilities (validators, helpers)
│     └─ index.css          # Global styles, layout utilities
├─ packs/                   # Content pack schemas (e.g., snippets.schema.json)
├─ docs/                    # Project documentation (this folder)
├─ context/                 # Runtime prompt/config surface for assistant (kept minimal)
├─ eval/                    # Test rubrics and golden cases (planned)
└─ README.md                # Root overview
```

## Conventions

- Pages live in `web/src/pages/` and are routed in `web/src/App.tsx`.
- One feature per page; keep logic small and testable; extract helpers to `web/src/utils/` when reused.
- Example data lives in `web/public/*.example.json` to enable offline development.
- Keep cross‑cutting styles in `web/src/index.css`; component‑specific styles close to components.
