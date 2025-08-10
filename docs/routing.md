# Routing

The SPA uses `react-router-dom` with a left sidebar for primary navigation. Routes are declared in `web/src/App.tsx`.

## Current routes

- `/` → Landing page (`LandingPage`)
- `/snippets` → `SnippetsPage`
- `/expression` → `ExpressionPage`
- `/delegation` → `DelegationPage`
- `/formatter` → `FormatterPage`
- `/resources` → `ResourcesPage`
- `/icons` → `IconsPage`
- `/diagnostics` → `DiagnosticsPage`
- `/roadmap` → `RoadmapPage`
- `/packs` → `PacksPage`
- `/dataverse` → `DataversePage`
- `/licensing` → `LicensingPage`
- `/settings` → `SettingsPage`
- `/about` → `AboutPage`
- `/sa/requirements` → `SARequirementsPage`
- `/sa/hld` → `SAHldPage`
- `/sa/arm` → `SAArmCatalogPage`
- `/sa/erd` → `SAErdPage`

Missing pages fall through to a simple 404 element.

## Navigation UI

The sidebar component `web/src/components/NavBar.tsx`:

- Collapsible (`body.sidebar-collapsed` toggled via state).
- Icons + labels (labels hidden when collapsed).
- Layout offset handled by `#root { padding-left: … }` in `web/src/index.css`.
- Collapsed width is controlled by CSS var `--sidebar-w-collapsed` (currently `80px`) in `web/src/index.css`.
- Clicking a main rail item auto-expands the sidebar (if collapsed) and navigates to that rail's default route. Implemented via `openRail()` in `NavBar.tsx`.
- Solution Architecture has its own rail labeled “Solution Arch”, with routes:
  - `/sa/requirements`, `/sa/hld`, `/sa/arm`, `/sa/erd`.
