# Plan — High-Level Phases & History

Authoritative high-level plan capturing phases of delivery and history of major events/decisions.

## Vision
A companion for Solution Architects to plan, design, and validate Microsoft solutions (Power Platform & Azure), accelerating discovery-to-design with AI assistance.

## Phase Timeline (History → Now → Next)

- Phase 0 — Foundation (Past)
  - Repo scaffolding, React + Vite app (`web/`), Netlify setup.
  - Initial pages and routing. Basic docs/roadmap established.

- Phase 1 — Licensing Assistant (Past/In Progress)
  - Netlify function to fetch PDFs from Microsoft sources (`netlify/functions/licensing-fetch.ts`).
  - Hardening: URL normalization, browser-like headers, improved errors.
  - Next: robust fetch strategies, PDF parsing and mapping to normalized schema; UI surfacing behind flag.

- Phase 2 — Solution Architecture Workspace (Next)
  - Requirements ingestion from spreadsheets.
  - Dual solutioning (Power Platform vs Azure) with editable AI drafts and exports.
  - HLD generator (Mermaid) + narrative; preview/edit/export.
  - Azure ARM catalog (one-click deploy) + uploads.
  - ERD designer with CSV round-trip and exports; optional AI assist.

- Phase 3 — Productization & Hardening (Planned)
  - Security review, input validation, rate limiting, logging hygiene.
  - Error handling UX, observability, tests (unit/contract/E2E).
  - Documentation (user guide + developer docs) and release process.

- Phase 4 — Optional Desktop & Cloud (Planned)
  - Desktop packaging (Tauri preferred) for offline and secure key storage.
  - Optional auth (Microsoft/GitHub) and cloud persistence (e.g., Supabase) with RLS.

## Release Strategy
- Local-first by default. Serverless for AI and utility endpoints.
- Feature flags for major epics (Licensing parsing, Solution Architecture).
- Tagged releases at phase milestones; preview deploys per PR.

## Deployment to Production
- Host on Netlify; use environment variables for feature flags.
- No server-stored AI keys by default; keys remain local unless explicitly configured by user.

## Security & Privacy (Principles)
- Least-privilege serverless endpoints with strict validation and redaction.
- CSP and dependency hygiene; avoid unnecessary third-party scripts.

## References
- Detailed tasks: `docs/plan-detailed-tasks.md`
- Previous docs merged here: `docs/product-delivery-plan.md` (superseded), `docs/solution-architecture.md` (superseded).
