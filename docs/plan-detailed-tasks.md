# Plan — Detailed Actions & Tasks (Past, Present, Future)

Authoritative task list tracking what has happened, what is in progress, and what will be done to deliver all features.

## Conventions
- Status: [Done] / [In Progress] / [Planned]
- Scope tags: [Licensing], [Requirements], [AI], [HLD], [ARM], [ERD], [Security], [Prod], [Desktop], [Docs], [Testing]

## Past (Done)
- [Done][Licensing][Infra] Initialize React + Vite app in `web/` and routing skeleton.
- [Done][Infra] Configure Netlify project and serverless functions.
- [Done][Licensing] Create function `netlify/functions/licensing-fetch.ts` to fetch PDFs.
- [Done][Licensing] Harden licensing fetch: add `normalizeUrl`, browser-like headers, improved error payload.
- [Done][Infra] Verify local dev server flow: `npm install` + `npm run dev` (Vite) — app loads.
- [Done][Docs] Add roadmap progress note and Solution Architecture epic overview.
- [Done][Docs] Create comprehensive product plan and link from roadmap.

## Present (In Progress)
- [In Progress][Licensing] Licensing Phase 2: robust fetch strategies and PDF parsing plan (UI behind flag).
- [In Progress][Docs] Consolidating planning docs into two canonical files: high-level phases/history and detailed tasks (this doc).

## Future (Planned)

### Requirements Ingestion & Dual Solutioning
- [Planned][Requirements] Define data schemas: `Requirement`, `SolutionOption`.
- [Planned][Requirements] Implement CSV/XLSX ingest via SheetJS with column mapping UI.
- [Planned][AI] Build provider-agnostic AI service (OpenAI/Azure OpenAI) via Netlify function.
- [Planned][Requirements] Generate Option A (Power Platform) and Option B (Azure) per requirement with structured guidance.
- [Planned][Requirements] Inline editors with markdown support; status tracking (todo/needs-review/done).
- [Planned][Requirements] Export results to CSV and Markdown; stretch: DOCX/PDF.
- [Planned][Requirements] JSON import/export for local-first persistence.

### HLD Generator (Mermaid)
- [Planned][HLD] Mermaid editor + live preview component.
- [Planned][AI] Prompt to draft Mermaid diagram + narrative from brief and optional uploaded docs.
- [Planned][HLD] Edit & refine flow; export Mermaid MD plus PNG/SVG snapshots.
- [Planned][Security] Sanitize uploaded text; limit file types/sizes client-side.

### Azure ARM Catalog & One-Click Deploy
- [Planned][ARM] Seed catalog from Microsoft Quickstart templates.
- [Planned][ARM] Model: `ArmTemplate { title, description, parametersSchema, templateUrl|fileRef }`.
- [Planned][ARM] Upload custom templates; validate basic schema client-side.
- [Planned][ARM] Deploy action: open Azure Portal link or show az CLI command with parameters.

### ERD Designer
- [Planned][ERD] Data models: `Entity`, `Field` with PK/FK relations.
- [Planned][ERD] CRUD UI for entities/fields; CSV import/export.
- [Planned][ERD] Render Mermaid `erDiagram`; export PNG/SVG/MD.
- [Planned][AI] Optional AI assist to sketch schema from requirement text.

### Licensing Phase 2
- [Planned][Licensing] Resilient fetch: HEAD-then-GET fallback, retries/backoff, alt mirrors.
- [Planned][Licensing] Parse PDFs to normalized dataset; surface key licensing info in UI.
- [Planned][Testing] E2E tests across fetch/parse/display.

### Security, Keys, and Auth
- [Planned][Security] API keys stored locally by default; masked in UI.
- [Planned][Security] Netlify functions: input validation, rate limiting, redaction, timeouts.
- [Planned][Security] Content Security Policy; dependency audits.
- [Planned][Auth] Optional sign-in (Microsoft/GitHub) — behind feature flag.

### Deployment to Production
- [Planned][Prod] Netlify build configuration; feature flags per epic.
- [Planned][Prod] Preview deploys for PRs; tagged releases for milestones.
- [Planned][Prod] Release checklist (security review, tests, docs updated).

### Desktop App Path
- [Planned][Desktop] Evaluate Tauri packaging; POC with local storage and secure key vault.
- [Planned][Desktop] Decision checkpoint post-MVP web release.

### Error Handling, Observability, and Testing
- [Planned][Testing] Unit tests for parsers/mappers; contract tests for functions; E2E for key flows.
- [Planned][Observability] Structured logs in functions; optional Sentry behind flag.
- [Planned][UX] Error boundaries and actionable toasts; log viewer for user diagnostics.

### Documentation & Guides
- [Planned][Docs] User Guide: Getting Started, Requirements, Dual Options, HLD, ARM, ERD, Exports, Settings/Keys, FAQ.
- [Planned][Docs] Developer Docs: architecture, models, endpoints, runbook, contributing, release process.

## Cross-References
- High-level plan: `docs/plan-high-level.md`
- Specs: `docs/solution-architecture.md` (superseded by high-level + this doc for planning; still useful for detail)
- Product plan (superseded): `docs/product-delivery-plan.md`
