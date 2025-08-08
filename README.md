# PowerPlatformCompanion

A MacOS companion to help with all things Power Platform

## Documentation

- **Vision**: see `docs/vision.md` for the product concept and MVP goals.
- **Background**: see `docs/background.md` for history, prior exploration, and decisions.
- **Architecture**: see `docs/architecture.md` for app layout, state, and extensibility.
- **Routing**: see `docs/routing.md` for routes and navigation.
- **Directory Structure**: see `docs/structure.md` for folder overview and conventions.
- **Security**: see `docs/security.md` for current boundaries and future hardening.
- **Schemas**: see `docs/schemas.md` for JSON shapes and localStorage keys.

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

- **Snippets**: Searchable snippet bank loaded from `web/public/snippets.example.json` with runtime validation.
- **Delegation Check**: Heuristic analysis of expressions by data source (Dataverse/SharePoint/SQL/Other).
- **Flow Formatter**: JSON pretty‑printer with large payload warnings and copy support.
- **Expression Tester (new)**: Basic heuristics to correct common non‑Power Fx syntax (e.g. `&&` → `And`, `||` → `Or`, `!` → `Not`, `==` → `=`). Provides a before/after preview and Apply.
- **Resources (new)**: Curated YouTube channels and blogs. Loads from `web/public/resources.example.json` with a search box. Planned: live discovery and recommendations.
- **Diagnostics (new)**: Error message helper with seed heuristics for context and next steps. Planned: inline fixes and diffs.
- **Roadmap (enhanced)**: Search/filter with icon quick filters, due‑soon notifications, and a modal details view. Uses caching and periodic refresh. Loads from `web/public/roadmap.example.json` by default; optionally uses the M365 Public Roadmap API via `/api/m365`.
- **Settings (enhanced)**: Controls the roadmap notification window in months, persisted in `localStorage` key `mm.notifyWindowMonths`.
- **Icons (new)**: Browse a small built‑in set, customise (size/stroke/colour), import your SVG, and copy as SVG/Data URI/Power Apps Image formula. Route: `/icons`.

### Data files

- `web/public/snippets.example.json` – sample snippets catalog.
- `web/public/resources.example.json` – sample YouTube/blog resources.
- `web/public/roadmap.example.json` – sample roadmap items for UI development.

### Notes

- Discovery/recommendation for Resources and official Roadmap ingestion are planned next steps.
- All features are designed to be testable and progressively enhanced.
