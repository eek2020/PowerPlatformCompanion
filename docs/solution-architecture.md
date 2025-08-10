# Solution Architecture Workspace

This document outlines the design for the new Solution Architecture features: Requirements Ingestion & Dual Solutioning, HLD Generator with Mermaid, Azure ARM Catalog, and ERD Designer.

## Goals
- Enable SAs to import requirements and generate two solution options per requirement (Power Platform vs Azure), editable and exportable.
- Generate HLD diagrams and narrative using Mermaid with preview/edit/export.
- Provide a catalog of one-click ARM templates and allow uploads.
- Design an ERD tool with CSV round-trip and optional AI assistance.

## MVP Scope
- Import CSV/XLSX requirements and present in a table.
- For each row, generate Option A (Power Platform) and Option B (Azure) with structured fields.
- Inline editing of both options, with status tracking (todo/in-progress/done/needs-review).
- Export aggregated results to CSV and Markdown (PDF/DOCX as stretch).
- HLD editor with Mermaid preview; AI prompt to draft initial diagram + narrative from a brief.
- ARM catalog: list seeded templates; upload custom ARM; provide deploy action to Azure Portal.
- ERD: manually define entities/fields, render Mermaid `erDiagram`, export to PNG/SVG/MD; CSV import/export.

## Data Model (initial)
- Requirement: { id, title, description, category?, priority?, source?, acceptanceCriteria?, metadata }.
- SolutionOption: { id, requirementId, optionType: 'PowerPlatform'|'Azure', architectureSummary, components[], services[], tradeoffs, security, costConsiderations, implementationNotes, rationale, status, lastEditedAt }.
- HLDArtifact: { id, title, mermaidCode, narrative, references[], attachments[], updatedAt }.
- ArmTemplate: { id, title, description, source: 'catalog'|'uploaded', parametersSchema, templateUrl|fileRef, tags[], updatedAt }.
- Entity: { id, name, description?, tags[] }.
- Field: { id, entityId, name, type, required, pk?, fk?: { targetEntity, targetField }, notes? }.

Implementation detail: store as client state persisted to local storage initially; support export/import JSON to avoid backend dependency. Serverless endpoints only for AI calls and (optionally) signed uploads.

## UI Overview
- Nav: "Solution Architecture" section with tabs:
  - Requirements
  - HLD
  - ARM Catalog
  - ERD

### Requirements
- Toolbar: Import CSV/XLSX, Export, AI Provider Settings.
- Table: columns for Requirement fields + status + quick actions.
- Drawer/Panel: shows Option A and Option B editors side-by-side with markdown-rich text and structured sections.
- Actions: "Generate Options", "Refine", "Mark as Done", "Compare", "Export".

### HLD
- Inputs: free-text brief, optional file upload(s).
- Outputs: Mermaid code editor with live preview; narrative editor.
- Actions: "Draft from Brief", "Refine", "Export (PNG/SVG/MD)".

### ARM Catalog
- List: cards with title, description, tags, source (Microsoft Quickstart or Uploaded).
- Detail: parameters form (generated from template schema) + deploy button (opens Azure Portal or CLI instructions).
- Upload: add custom ARM templates; validate basic schema; store reference in workspace.

### ERD
- Entities list + canvas preview of Mermaid erDiagram.
- Entity/Field editors; CSV import/export for Entities/Fields.
- Actions: "Generate from Text" (optional AI), "Export (PNG/SVG/MD)".

## Integrations / Tech Choices
- Spreadsheet ingest: SheetJS (xlsx) for CSV/XLSX parsing client-side.
- Mermaid: mermaid@latest rendered in client; export via canvas/svg snapshot.
- AI abstraction: provider-agnostic interface supporting OpenAI/Azure OpenAI. Key stored locally; calls via Netlify functions.
- ARM: seed catalog from Microsoft Quickstart templates (public GitHub). Deploy via Azure Portal links or az CLI guidance.

## Serverless Endpoints (proposed)
- POST /api/sa/generate-options { requirements[], provider, model, systemPrompt? } → [{ requirementId, options: [A,B] }]
- POST /api/sa/hld-draft { brief, docs? } → { mermaidCode, narrative }
- POST /api/sa/erd-draft { description } → { entities[], fields[], mermaidCode }

Notes: Implement rate limiting, input validation, and redact PII. Streaming responses optional.

## Exports
- Requirements + options: CSV and Markdown; stretch: DOCX/PDF using headless export (e.g., `pagedjs` or `docx` lib).
- HLD & ERD: MD with embedded Mermaid; PNG/SVG snapshots for diagrams.
- Catalog: JSON export of catalog entries.

## Security & Keys
- Do not store AI keys on server; user provides key and it is stored locally (or in secure vault if added later).
- Sanitize inputs; validate uploaded ARM templates minimally (size/type) client-side.

## Open Questions
- Should we add backend persistence (e.g., Supabase) or remain local-first?
- Access control/multi-user collaboration?
- Which diagram libraries beyond Mermaid for ERD (e.g., d2)?

## Milestones
1. MVP: Requirements import → dual options → edit → export.
2. HLD Mermaid editor + AI draft.
3. ARM catalog seed + upload + deploy.
4. ERD designer with CSV round-trip + export.
5. Polish, tests, docs.

## Requirements Import & AI Analysis

### Flow
- __Import__: Parse CSV/XLSX in-browser using SheetJS (`xlsx`), map to `Requirement` records.
- __Analyze__: Call `POST /api/sa/generate-options` with a batch of requirements. The serverless function selects the provider/model and returns two structured options per requirement.
- __Persist__: Store results via `StorageService` (`web/src/lib/storage.ts`) to avoid re-calling AI for unchanged rows.

### Cost‑Effective Testing Strategy
- __Mock by default (free)__
  - Keep Netlify functions in mock mode for local dev and CI. This validates UI flows, schemas, and regression tests at zero cost.
- __Local LLM option (free)__
  - Run a small local model via Ollama (e.g., `llama3.1:8b-instruct`) and proxy `/api/sa/generate-options` to it in a dev-only branch. Use `setAITransport()` in `web/src/lib/ai/client.ts` to point to a local endpoint when needed.
- __Paid smoke tests (low cost)__
  - Use a small, cost‑efficient model (e.g., OpenAI `gpt-4o-mini` or provider equivalent) for a tiny sample (5–10 requirements) to validate quality.
  - Keep prompts concise and enforce a compact JSON schema to cap output size.
  - Batch carefully (small groups), set conservative limits server‑side, and cache results so re-runs are free.

### Cost Controls (implementation notes)
- __Caching__: Skip AI calls when a requirement’s content hash hasn’t changed. Persist options in local storage.
- __Batching__: Send small batches to reduce peak tokens and ease debugging.
- __Determinism__: Low temperature during tests for stable snapshots; switch higher only for exploratory runs.
- __Redaction__: Trim/clean requirement text before sending to reduce tokens and remove PII.
