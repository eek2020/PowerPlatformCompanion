# Routing

The SPA uses `react-router-dom` with a left sidebar for primary navigation. Routes are declared in `web/src/App.tsx`.

## Current routes

- `/` → Landing page (`LandingPage`)
- `/snippets` → `SnippetsPage` (Developer Tools)
- `/expression` → `ExpressionPage`
- `/delegation` → `DelegationPage`
- `/formatter` → `FormatterPage` (Developer Tools)
- `/resources` → `ResourcesPage`
- `/icons` → `IconsPage` (Developer Tools)
- `/diagnostics` → `DiagnosticsPage`
- `/roadmap` → `RoadmapPage` (shown under Solution Architecture rail)
- `/packs` → `PacksPage`
- `/dataverse` → `DataversePage`
- `/licensing` → `LicensingPage` (shown under Solution Architecture rail)
- `/settings` → `SettingsPage`
- `/about` → `AboutPage`
- `/sa/requirements` → `SARequirementsPage`
- `/sa/hld` → `SAHldPage`
- `/sa/arm` → `SAArmCatalogPage`
- `/sa/erd` → `SAErdPage`
- `/sa/estimating` → `PlanningPage` (Estimating)
  - Note: legacy route `/planning` remains available and maps to the same page for backward compatibility.

Missing pages fall through to a simple 404 element.

## Navigation UI

The sidebar component `web/src/components/NavBar.tsx`:

- Collapsible sidebar (two states: collapsed rail and expanded panel).
- Labels hidden when collapsed; tooltips and a hover flyout assist discovery.
- Layout offset handled by `#root { padding-left: … }` in `web/src/index.css`.
- Collapsed width is controlled by CSS var `--sidebar-w-collapsed` (80px) in `web/src/index.css`.
- Clicking a main rail navigates without auto-expanding when collapsed. Expansion is manual.
- Hover flyout appears only when the sidebar is collapsed. In expanded state the inline panel is used (no flyout).
- Rails:
  - Developer Tools: Snippets, Flow Formatter, Dataverse Lookup, Packs, Icons.
  - Solution Arch: Estimating, Requirements, HLD, ARM Catalog, ERD, Roadmap, Licensing.
  - Resources: About.
