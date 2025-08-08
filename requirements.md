# Power Platform Companion – Requirements

> Working title: **MakerMate** (renameable). A lightweight, offline-first companion tool for Power Platform makers that accelerates design, build, troubleshooting, and governance.

---

## 1. Goals
- Speed up day-to-day maker tasks (Power Apps, Power Automate, Dataverse) with utilities, patterns, and checklists.
- Work **offline where practical** (no tenant data), with a path to optional cloud sync later.
- Keep it **auth-agnostic** for v1.x (no tenant connections required), but design for future connectors.
- Be **search-first**: everything is discoverable by fuzzy search and tags.
- Export outputs in maker-friendly formats (Markdown, CSV, JSON, PNG/SVG).

## 2. Users
- Primary: Power Platform makers, solution architects, and Power Automate developers.
- Secondary: Project managers, Business Analysts, QA, and governance leads supporting PP work.

## 3. Non-Goals (v1.x)
- No live reads of tenant DLP policies, environments, or Dataverse metadata.
- No automated deployment to Power Platform (informational exports only).
- No storage of customer/tenant data by default.

## 4. High-Level Architecture (proposed)
- **Client:** Web (React + Tailwind), runs locally; optional desktop wrapper (Tauri/Electron).
- **Data:** Local JSON/SQLite for content, with import/export.
- **Content packs:** Versioned bundles (e.g., Snippets, Patterns, MVP Directory, Licensing docs).
- **Extensibility:** Plugin system for new tools, checklist templates, or pattern libraries.

## 5. Core Feature Set (v1.0 MVP)
- **Power Fx Snippet Bank**: curated snippets with tags (delegation-safe, collections, datetime). Quick copy.
- **Flow/Expression Tester**: evaluate common functions (utcNow, addDays, formatDateTime) with sample inputs.
- **Delegation Checker (Offline Rules)**: parse formulas and flag likely non-delegable patterns per data source.
- **Regex Sandbox**: quick tester for Power Automate regex; include common recipes.
- **Issue Resolution Search**: local knowledge index of frequent errors and fixes; search by message text or connector.

## 6. Expanded Feature Set

### 6.1 Learning & Community
- **Microsoft MVP Directory**
  - Preseed notable MVPs (e.g., Matthew Devaney, April Dunham, Shane Young, and many others).
  - Searchable directory with tags (Power Apps, Automate, Dataverse, PCF, Governance).
  - Open profile → access **YouTube channel** + **blog** directly.
  - **Add More MVPs**: user selects a name; app fetches and adds their YouTube + blog links (via metadata lookups when online); stored locally for offline use.

### 6.2 Licensing & Costing
- **Licensing Docs Capture**
  - Import the **latest Microsoft licensing PDFs** (typically updated quarterly).
  - Extract text and key tables, normalize for search, annotate with version/date.
  - Present side-by-side diff between versions; bookmark frequently referenced sections.
- **Licensing Calculator**
  - Inputs: user counts, per-app/per-user mix, API call needs, storage estimates (DB/File/Log), capacity add-ons.
  - Outputs: monthly/annual cost ranges, assumptions log, “what-if” scenarios.

### 6.3 Project Planning & Estimation
- **Project Planner**
  - Input: requirements/features, target users, environments, data sources, integration needs.
  - **Stack Recommender**: suggests components (Dataverse/SharePoint/Azure Functions/Connectors/PCF) with rationale.
  - **Estimator**: time and cost by work package; factor **developer capability levels** (junior/mid/senior) and confidence bands.
  - Export: WBS CSV/Markdown + risk flags.

### 6.4 Prompt Library (Local)
- Curated prompts for **Copilot, Power Apps, Power Automate, Copilot Studio**.
- Tagging, versioning, examples; export to **JSON/Markdown**.

### 6.5 Formula & Expression Composer
- Offline snippets for **Power Fx**, **OData filter queries**, **DAX**.
- Pattern builders: date math, delegation-safe filters, patch templates.
- Copy-ready outputs + terse explanations.

### 6.6 OData Filter Query Builder
- Wizard for `$filter`, `$select`, `$orderby` targeting SharePoint/Dataverse APIs.
- Validates operators, encodes special characters, previews results.

### 6.7 Naming Convention & Solution Skeleton Generator
- Enforce prefixes/patterns (e.g., `app-`, `flw-`, `tbl-`).
- Generate **solution blueprint**: README, folder/file scaffold, variable list, environment variables template.

### 6.8 Connector Selection Wizard (What‑if)
- Given a scenario, suggest viable connectors and auth models; list pros/cons and common pitfalls.
- Knowledge-based (no live tenant data).

### 6.9 Data Model Designer (Offline)
- Define tables, columns, data types, relationships.
- Export CSV/JSON + “create steps” checklist.

### 6.10 App IA & Navigation Mapper
- Sketch screens, components, and navigation flows.
- Export **PNG/SVG** + build checklist.

### 6.11 Flow Blueprint Designer
- Draft trigger → actions as a pseudo-swimlane.
- Export CSV/Markdown task list for later implementation.

### 6.12 Theme & Token Builder
- Build color tokens + typography.
- Export token JSON and a Power Fx theme snippet.

### 6.13 ALM Readiness & DoD Checklists
- One-click checklists for solution packaging, variables, env refs, connection refs, and Definition of Done.
- Export YAML/Markdown.

### 6.14 Nice‑to‑Have (v1.x, still auth‑agnostic)
- **Performance Heuristics Assistant**: tips for delegation, paging, image optimization, caching, concurrency.
- **Test Case & Acceptance Criteria Generator**: from user stories; export CSV/XLSX.
- **Accessibility & UX Pack**: WCAG checklist + Power Apps control pitfalls; color contrast checker.
- **Change Comms Pack Generator**: drafts email/Teams/release notes templates per change type.
- **Risk & Readiness Scorecard**: simple RICE/MoSCoW scoring; exportable.
- **Licensing & Cost Estimator (Indicative)**: offline calculator mirroring Licensing Calculator basics.
- **DLP “What‑If” Explainer**: simulate typical DLP groupings and impacts.
- **Reusable Component Gallery (Local)**: store PCF/component descriptors and usage notes.
- **Clipboard Vault**: save frequently used snippets (Power Fx, headers, JSON payloads).
- **Template Pack Hub**: house style docs (PR/FAQs, README, runbooks, diagrams).

### 6.15 Design & Ideation
- **Control Catalogue**: offline gallery of controls w/ properties, pros/cons, styling tips.
- **Formula Pattern Matcher**: paste a Power Fx formula → get simplifications/best-practice patterns.
- **Screen Size & Device Simulator**: test layouts for mobile/tablet/desktop; scaling guidelines.
- **Component Anatomy Viewer**: visual breakdown of common components and data bindings.
- **Data Flow Diagram Builder**: model data movement across connectors, flows, apps.

### 6.16 Build Accelerators
- **Expression Autocomplete Sandbox**: predicts Power Fx/OData functions as you type (local dictionary).
- **Regex Helper for Power Automate**: build/test with action-friendly examples.
- **JSON Shape Designer**: craft mock payloads; auto-generate **Parse JSON** schemas.
- **Dynamic Content Reference Finder**: catalogue common trigger/action tokens with descriptions.
- **HTTP Request Composer (Mock)**: design/preview API calls; export cURL/JSON.

### 6.17 Testing & Validation
- **Delegation Checker (Offline Rules)**: validate against known data-source limits.
- **Control Accessibility Checker**: simulate color blindness and screen reader interpretation.
- **Performance Budget Planner**: estimate gallery load times, memory, image cache sizes.
- **Mock Data Generator**: create fake datasets (CSV/JSON) for offline building.
- **Flow Logic Simulator**: step through logic on sample data without running a real flow.

### 6.18 Documentation & Governance
- **Solution Architecture Diagram Templates**: stencils for common PP setups (Visio, Draw.io).
- **Change Impact Matrix Builder**: map affected users, flows, apps by change scenario.
- **Release Notes Compiler**: convert change list → versioned notes.
- **Maker Portfolio Tracker**: log personal apps/flows, versions, notes.
- **Reusable Script Snippets Library**: store JS snippets for model-driven/PCF (local only).

### 6.19 Strategy & Planning
- **Solution Blueprint Generator**: scope, data, integrations, security layers → exportable packs.
- **Architecture Pattern Library**: offline catalog of proven patterns (CRUD, RPA+API hybrid, cross-tenant).
- **Integration Mapping Tool**: map systems/APIs/events, dependencies, bottlenecks.
- **Business Capability Mapping**: tie solutions to business capabilities.
- **Technology Decision Matrix**: compare PP vs Azure Functions vs 3rd party; weighted scoring.

### 6.20 Governance & Compliance
- **DLP Scenario Tester (Offline)**: simulate policy implications.
- **Security Role Reference Guide**: common Dataverse roles/permissions.
- **Solution Lifecycle Checklist**: ALM stages, gates, handover, exit conditions.
- **Risk Assessment Toolkit**: registers for security/performance/maintainability.
- **Compliance Mapper**: align features to GDPR/AI Act/ISO requirements.

### 6.21 Cost & Licensing
- **Licensing Estimator (Offline)**: per-app/per-user + API quotas + storage.
- **Capacity Planning Calculator**: Dataverse storage growth & API usage per period.
- **Cost/Benefit Scorecard**: ROI vs delivery cost vs time-to-value.
- **Connector Cost Impact Lookup**: premium status and potential cost triggers.

### 6.22 Design & Architecture Quality
- **Environment Strategy Planner**: Dev/Test/Prod + retention, dependencies.
- **Data Architecture Visualiser**: ERDs for Dataverse + external stores.
- **Integration Latency Estimator**: rough impact by connector/API choice.
- **Performance Pattern Library**: proven anti‑patterns and fixes.

### 6.23 Communication & Oversight
- **Executive Summary Generator**: translate tech to business language.
- **Stakeholder Map & RACI Builder**: roles and responsibilities per component.

## 7. Non‑Functional Requirements
- **Offline‑first** for all tools marked “offline”; no tenant data storage by default.
- **Search everywhere**: global search across snippets, prompts, docs, MVPs, patterns.
- **Performance**: sub‑100ms local searches on typical laptops; content indexing below 60s for 10k items.
- **Security & Privacy**: local-only storage; optional encryption at rest for saved vaults.
- **Extensibility**: pluggable modules and content packs; semantic versioning.
- **Portability**: Windows/macOS; optional web build.
- **Accessibility**: WCAG AA targets for color contrast and keyboard navigation.

## 8. Content & Data Sources
- **Preloaded packs**: snippets, patterns, MVP seed list, licensing doc placeholders.
- **User-imported**: PDFs (licensing), CSV/JSON (mock data, prompts), Markdown templates.
- **Metadata lookups (optional online)**: YouTube channel + blog discovery for MVPs.

## 9. Exports
- Markdown, CSV, JSON, PNG/SVG. Optional ZIP “solution blueprint”.

## 10. Telemetry (opt‑in, later)
- Anonymous usage stats for features used, to prioritize roadmap.

## 11. Roadmap
- **v1.0 (MVP)**: Snippet Bank, Expression Tester, Delegation Checker, Regex Sandbox, Issue Search, MVP Directory (seeded), Licensing PDF import & search, Licensing Calculator (basic), Project Planner (basic), Prompt Library, OData Builder, Naming/Skeleton Generator.
- **v1.1**: Data Model Designer, IA Mapper, Flow Blueprint, Theme/Token Builder, ALM & DoD Checklists, Accessibility Pack, Mock Data Generator, JSON Shape Designer.
- **v1.2**: DLP What‑If, Performance Heuristics, Change Comms, Risk Scorecard, Capacity Planner, Cost/Benefit Scorecard, Environment Strategy Planner.
- **Later**: Optional auth-enabled modules (tenant metadata readers), cloud sync, plugin marketplace.

## 12. Acceptance Criteria (samples)
- Global search returns results across **snippets, prompts, MVPs, licensing extracts** in <100ms for a 5k item corpus.
- Licensing PDF import extracts **text + tables** with section headings preserved; shows source version/date.
- MVP Directory allows adding a new MVP by name and stores **channel + blog** for offline access.
- Project Planner outputs a **WBS CSV** with estimates adjusted by dev capability levels.
- OData Builder validates and encodes filters; copy-to-clipboard provides a ready-to-paste string.

## 13. Open Questions
- Preferred packaging: web-only vs desktop wrapper?
- How far should formula parsing go for the Delegation Checker without connecting to a real data source?
- Do we include AI-assisted features in v1 (local LLM or cloud-only optional)?
- Should we ship with community-contributed packs by default, or offer a one-click import?

## 14. Glossary
- **ALM**: Application Lifecycle Management.
- **DoD**: Definition of Done.
- **MVP (person)**: Microsoft Most Valuable Professional.
- **MVP (product)**: Minimum Viable Product.

