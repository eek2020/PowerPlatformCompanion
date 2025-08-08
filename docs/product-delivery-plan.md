# Product & Delivery Plan

This plan consolidates vision, scope, feature set, status, architecture decisions, delivery milestones, and operational concerns (security, auth, keys, data, deployment, error handling, user docs) for PowerPlatformCompanion.

## Vision & Goals

- Deliver a companion that helps Solution Architects plan, design, and validate Microsoft-focused solutions (Power Platform and Azure).
- Accelerate discovery-to-design via requirement ingestion, AI-assisted options, HLD diagrams, deployable templates, and data modeling tools.

## Success Criteria

- Import requirements and produce two viable, editable options per requirement (Power Platform and Azure) with exportable outputs.
- Generate and edit Mermaid-based HLDs and ERDs with previews and exports.
- One-click deployment flows for curated ARM templates.
- Stable web app with clear error handling, documented usage, and secure handling of API keys.

## Feature Set & Status

- Requirements Ingestion & Dual Solutioning — Planned
- HLD Generator with Mermaid — Planned
- Azure ARM Catalog & One-Click Deploy — Planned
- ERD Designer — Planned
- Licensing PDF parsing (separate epic) — In progress (Phase 2 paused behind flag)

See also `docs/solution-architecture.md` and `docs/roadmap.md`.

## Scope (MVP vs Stretch)

- MVP
  - Import CSV/XLSX requirements; AI-generate dual options; inline editing; export CSV/Markdown.
  - Mermaid HLD editor with AI draft from brief; export MD/PNG/SVG.
  - ARM catalog listing with link-based deploy; upload custom ARM.
  - ERD manual editor + Mermaid erDiagram export; CSV round-trip for entities/fields.

- Stretch
  - DOCX/PDF exports; team collaboration; template library for options; retry/backoff on AI; richer deploy UX; diagram layout helpers; RBAC & cloud persistence.

## Architecture Overview

- Frontend
  - React + Vite (in `web/`). Mermaid for diagrams. SheetJS for CSV/XLSX. Local-first state with JSON import/export.

- Serverless
  - Netlify functions for AI calls, PDF fetching, and optional signed uploads. Provider-agnostic AI service.

- Data
  - Local storage for drafts and workspace files. Optional future: hosted DB (e.g., Supabase/Postgres) behind feature flag.

## Security & Privacy

- API keys are user-provided and stored locally only (never committed). Optional: environment injection for serverless if user opts in.
- Netlify functions must validate inputs, rate-limit, and redact sensitive fields from logs.
- Content Security Policy for the app; avoid third-party scripts unless essential.

## Authentication

- MVP: no login required; local-only keys and data exports.
- Stretch: optional sign-in (e.g., GitHub/Microsoft) to enable cloud sync and team collaboration.

## Deployment to Production

- Hosting: Netlify (current). Build via Vite. Preview branch deploys for PRs.
- Env configuration: use Netlify environment variables for feature flags; no API keys stored by default.
- Release policy: semantic commits, CI checks, tagged releases for milestone features.

## Desktop App Path

- Option A: Tauri (lightweight, Rust backend, good for local file access and secure key storage).
- Option B: Electron (ecosystem maturity but heavier). Start with web, evaluate Tauri for offline packaging.

## Database Considerations

- MVP: local-first JSON with import/export for portability.
- Future: hosted Postgres (Supabase) for multi-user, with RLS and row-level access.
- Encryption at rest for any sensitive data if stored server-side.

## Error Handling & Observability

- Frontend
  - Centralized error boundary; toast notifications with actionable guidance.
  - Per-feature logging to console with IDs; optional user-friendly log viewer.

- Serverless
  - Structured logs (JSON) with request IDs. Proper status codes. Redacted inputs.
  - Retries/backoff for transient errors; timeouts; circuit-breaker for AI providers.

- Monitoring
  - Netlify function logs; optional Sentry integration (frontend + functions) behind a flag.

## Testing & Quality

- Unit tests for utilities (parsers, mappers). Snapshot tests for Mermaid transforms.
- Contract tests for serverless endpoints. E2E happy-path flows (Playwright) for MVP features.
- QA checklist for requirements import → generate → edit → export; HLD draft/preview/export; ARM upload/deploy link; ERD CSV round-trip.

## Documentation & User Guide

- User Guide structure
  - Getting Started, Requirements Import, Dual Options, HLD Editor, ARM Catalog, ERD Designer, Exports, Settings & Keys, FAQ.

- Developer Docs
  - Architecture, data models, serverless endpoints, running locally, contributing, release process.

## Risks & Mitigations

- AI variability → Provide editable outputs, history, and deterministic settings where possible.
- Vendor lock-in → Provider-agnostic AI interface; local-first data.
- Security misconfig → Keys local-only by default; strict input validation and logging hygiene.
- Diagram complexity → Keep Mermaid MVP; evaluate alternatives if usability stalls.

## Milestones & Timeline (indicative)

- M1: Requirements MVP (import → dual options → edit → export)
- M2: HLD Mermaid MVP (draft → edit → export)
- M3: ARM Catalog MVP (seed → upload → deploy link)
- M4: ERD MVP (CRUD → CSV → export)
- M5: Hardening (error handling, docs, tests, security review)

Each milestone ends with a tagged release and user docs update.

## Acceptance Criteria (MVP)

- Requirements: import a sample CSV; generate A/B solutions; edit; export CSV/MD without errors.
- HLD: produce valid Mermaid diagram and narrative from a brief; export works.
- ARM: select catalog template; open deploy link with parameters; upload validated template.
- ERD: create three entities with relations; export diagram; export/import CSV round-trip.

## Governance & Ways of Working

- Branching: feature branches → PRs with preview deploys → squash merge.
- Code review: 1 reviewer minimum; checklist includes security and UX considerations.
- Issue tracking: roadmap epics and tasks tracked in repo (GitHub issues).

## Open Questions

- Which AI provider(s) to support first and default models?
- Do we need offline export-to-PDF in-browser or via function?
- How soon to introduce optional auth + cloud sync?
