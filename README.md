# PowerPlatformCompanion

A companion to help with all things Power Platform

## Documentation

- **Vision**: see `docs/vision.md` for the product concept and MVP goals.
- **Background**: see `docs/background.md` for history, prior exploration, and decisions.
- **App Conversion (Desktop)**: see `docs/appconversion.md` for non‑store macOS/Windows packaging via Tauri/Electron, signing/notarization, and installers.
- **Architecture**: see `docs/architecture.md` for app layout, state, and extensibility.
- **Routing**: see `docs/routing.md` for routes and navigation.
- **Directory Structure**: see `docs/structure.md` for folder overview and conventions.
- **Security**: see `docs/security.md` for current boundaries and future hardening.
- **Schemas**: see `docs/schemas.md` for JSON shapes and localStorage keys.
- **Solution Architecture (spec)**: see `docs/solution-architecture.md` for the workspace overview, acceptance criteria, data contracts, and flows.
  
AI integration docs updates:

- **AI Settings**: The app has dedicated pages for AI configuration under Settings:
  - Providers (`/settings/ai/providers`) — enhanced management of API keys (OpenAI/Anthropic and custom providers), collapsible provider sections, add/remove providers, manage provider‑scoped models, and manage AI process bindings directly within this page. Keys are stored locally for development.
  - Providers (`/settings/ai/providers`) — enhanced management of API keys (OpenAI/Anthropic and custom providers), collapsible provider sections, add/remove providers, manage provider‑scoped models, and manage AI process bindings directly within this page. Binding cards are now collapsible per process. Keys are stored locally for development.
    - Processes covered for bindings (see `web/src/lib/ai.ts` `ALL_PROCESSES`): Snippets, Delegation, Expression Tester, Diagnostics, Flow Formatter, Dataverse Lookup, Packs, Icons, Estimating, Requirements, HLD, ARM Catalog, ERD, Roadmap, Licensing.
  - Models (`/settings/ai/models`) — select active provider/model, fetch or seed model lists, edit per‑model system prompts.
  - Helper module: `web/src/lib/ai.ts` centralizes provider/model/prompt storage, per‑process bindings, and `resolveConfig(process)`.

## Repo Structure (high‑level)

- **`context/`**: Runtime prompt surface for the assistant.
  - `system.md`, `persona.md`, `style.md`, `safety.md`, `glossary.md`, `tools.json`
  - Keep this minimal and focused on rules the model should follow at run time.
- **`docs/`**: Project documentation (vision, background, architecture, ADRs, roadmap).
  - Non‑runtime materials live here to avoid polluting the active context.
- **`prompts/`**: Feature prompt templates (repeatable patterns, input/output contracts).
- **`retrieval/`**: RAG schemas and router prompts.
- **`memory/`**: Templates for user/session state.
- **`packs/`**: Content pack schemas (snippets, issues, MVPs, licensing).
- **`eval/`**: Guardrail rubrics, red‑team cases, and golden testcases.

## Features (MVP, in progress)

These are available in the React app under `web/` and surfaced via the left sidebar:

Sidebar notes:

- Collapsed width is controlled by CSS var `--sidebar-w-collapsed` (80px) in `web/src/index.css` and used to offset `#root`.
- Clicking a main rail auto-expands the sidebar and opens the corresponding submenu.
- Hover flyout appears only when collapsed; expanded state shows the inline panel (no flyout).

- **Developer Tools**:
  - **Snippets**: Searchable snippet bank loaded from `web/public/snippets.example.json` with runtime validation.
  - **Flow Formatter**: JSON pretty‑printer with large payload warnings and copy support.
  - **Dataverse Lookup**: Helper tooling for Dataverse.
  - **Packs**: Content packs.
  - **Icons**: Browse a small built‑in set, customise (size/stroke/colour), import SVG, and copy as SVG/Data URI/Power Apps Image formula. Route: `/icons`.
- **Delegation Check**: Heuristic analysis of expressions by data source (Dataverse/SharePoint/SQL/Other).
- **Expression Tester (new)**: Basic heuristics to correct common non‑Power Fx syntax (e.g. `&&` → `And`, `||` → `Or`, `!` → `Not`, `==` → `=`). Provides a before/after preview and Apply.
- **Resources (new)**: Curated YouTube channels and blogs. Loads from `web/public/resources.example.json` with a search box. Planned: live discovery and recommendations.
- **Diagnostics (new)**: Error message helper with seed heuristics for context and next steps. Planned: inline fixes and diffs.
- **Solution Architecture (new, scaffolded)**: Workspace appears as its own rail labeled “Solution Arch”.
  - Routes: `/sa/estimating`, `/sa/requirements`, `/sa/hld`, `/sa/arm`, `/sa/erd`, plus surfaced under this rail: `/roadmap`, `/licensing`
  - Tabs under SA rail: Estimating, Requirements, HLD, ARM Catalog, ERD, Roadmap, Licensing.
  - Serverless endpoints (mock): `/api/sa/generate-options`, `/api/sa/hld-draft`, `/api/sa/erd-draft` (see `netlify/functions/` and `netlify.toml`).
  - Types and contracts in `web/src/types/sa.ts`; client abstraction in `web/src/lib/ai/client.ts`.
- **Roadmap (enhanced)**: Search/filter with icon quick filters, due‑soon notifications, and a modal details view. Uses caching and periodic refresh. Loads from `web/public/roadmap.example.json` by default; optionally uses the M365 Public Roadmap API via `/api/m365`.
- **Settings (enhanced)**: Controls the roadmap notification window in months, persisted in `localStorage` key `mm.notifyWindowMonths`.
  - **AI Providers** (`/settings/ai/providers`): manage API keys for OpenAI/Anthropic and custom providers, provider models, and AI process bindings in one consolidated page.
  - **AI Models** (`/settings/ai/models`): choose active provider/model, manage model lists, and edit per‑model system prompts. Components that run AI should call `resolveConfig('<process>')` from `web/src/lib/ai.ts`.

### Development server

- Run the app with Vite. Default dev URL: `http://localhost:5173/`.

### Data files

- `web/public/snippets.example.json` – sample snippets catalog.
- `web/public/resources.example.json` – sample YouTube/blog resources.
- `web/public/roadmap.example.json` – sample roadmap items for UI development.

### Notes

- Discovery/recommendation for Resources and official Roadmap ingestion are planned next steps.
- All features are designed to be testable and progressively enhanced.

## M365 Public Roadmap integration

- Dev: create `web/.env.local` with `VITE_M365_SOURCE=on`. The dev server proxies `/api/m365` to Microsoft to avoid CORS.
- Prod (Netlify): `netlify.toml` config and `netlify/functions/m365.ts` provide a proxy at `/api/m365`. Set `VITE_M365_SOURCE=on` in site env.
