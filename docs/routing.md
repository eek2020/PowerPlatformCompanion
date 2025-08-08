# Routing

The SPA uses `react-router-dom` with a left sidebar for primary navigation. Routes are declared in `web/src/App.tsx`.

## Current routes

- `/` → redirects to `/snippets`
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

Missing pages fall through to a simple 404 element.

## Navigation UI

The sidebar component `web/src/components/NavBar.tsx`:
- Collapsible (`body.sidebar-collapsed` toggled via state).
- Icons + labels (labels hidden when collapsed).
- Layout offset handled by `#root { padding-left: … }` in `web/src/index.css`.
