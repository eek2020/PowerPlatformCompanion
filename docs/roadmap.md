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

---

## Epic: Solution Architecture Workspace

Features to plan and implement:

- __Requirements Ingestion & Dual Solutioning__
  - Import a spreadsheet (CSV/XLSX) of requirements into a structured table.
  - For each requirement, generate two detailed solution options:
    - Option A: Power Platform approach.
    - Option B: Azure approach.
  - Allow SAs to edit/refine the AI-generated responses inline.
  - Support export (CSV/Markdown/PDF/DOCX) once all requirements are addressed.
  - Technical notes: use SheetJS for ingest; serverless AI via OpenAI/Azure OpenAI; persist drafts locally and/or in workspace storage.

- __HLD Generator with Mermaid__
  - Accept input docs (briefs/notes) and produce Mermaid diagrams (C4/HLD style) plus narrative.
  - Preview Mermaid, allow edit of code and text, and export (PNG/SVG/MD).
  - Technical notes: client-side mermaid rendering; AI prompt scaffolds for diagram and narrative; file upload pipeline.

- __Azure ARM Catalog & One-Click Deploy__
  - Browse curated catalog (seed from Microsoft Quickstart templates).
  - Upload custom ARM templates and surface as clickable deployments.
  - Parameterize and launch to Azure Portal or via CLI workflow.

- __ERD Designer__
  - Define tables, fields, datatypes, and attributes; import/export CSVs.
  - Generate ERD (Mermaid erDiagram or alternative) and allow edits.
  - Optional AI assist to propose schema from requirement text.
  - Export ERD as PNG/SVG/MD.

Backlog tasks (initial cut):
- [ ] Define data schemas: `Requirement`, `SolutionOption`, `HLDArtifact`, `ArmTemplate`, `Entity`, `Field`.
- [ ] Spreadsheet ingest (CSV/XLSX) pipeline and mapping UI.
- [ ] AI service abstraction (provider-agnostic) and serverless endpoints.
- [ ] Dual-option solution UI with edit + status tracking (done/todo/needs-review).
- [ ] Exporters (CSV, Markdown; stretch: PDF/DOCX).
- [ ] Mermaid preview/editor component shared across HLD/ERD.
- [ ] ARM catalog data model + upload flow + deploy action.
- [ ] ERD designer CRUD + CSV round-trip + diagram export.
- [ ] Auth/keys: secure storage for AI keys (if used) and ARM deploy contexts.

See `docs/solution-architecture.md` for detailed specs.
