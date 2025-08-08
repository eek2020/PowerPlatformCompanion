# Schemas

This MVP is client‑only and uses simple JSON files plus `localStorage`. Below are the current schemas and keys.

## JSON files

### Snippets (`web/public/snippets.example.json`)

- Array of objects with fields:
  - `id: string`
  - `title: string`
  - `tags: string[]`
  - `code: string`
  - `explanation: string`
  - `source?: string`
  - `tested?: boolean`

A lightweight validator exists in `web/src/utils/validators.ts`.

### Resources (`web/public/resources.example.json`)

- Array of objects:
  - `id: string`
  - `title: string`
  - `url: string`
  - `type: 'youtube' | 'blog'`
  - `channel?: string`

### Roadmap (`web/public/roadmap.example.json`)

- Array of objects:
  - `id: string`
  - `title: string`
  - `area: string` (e.g., "Power Apps", "Dataverse")
  - `status: 'Planned' | 'Rolling out' | 'Launched' | 'In development'`
  - `due: string` ISO date
  - `link?: string`
  - `description?: string`

## Browser storage (localStorage)

- `mm.planning.v1: PlanItem[]` — saved Planning items.
- `mm.notifyWindowMonths: number` — roadmap notification window in months.
- `mm.roadmap.cache.v1: RoadmapItem[]` — cached local roadmap items.
- `mm.roadmap.cacheAt: number` — timestamp of local roadmap cache.
- `mm.roadmap.m365.cache.v1: RoadmapItem[]` — cached M365 API items (when enabled).
- `mm.roadmap.m365.cacheAt: number` — timestamp of M365 cache.
- `mm.icons.size: number` — default icon size.
- `mm.icons.stroke: number` — default icon stroke width.
- `mm.icons.strokeColor: string` — default icon stroke colour (hex or CSS color).
- `mm.icons.fillColor: string` — default icon fill colour or `none`.
- `mm.icons.rounded: '0' | '1'` — rounded linecap/linejoin toggle.

## Future data sources

- Official roadmap feed (normalized into the above shape).
- Pack registries for snippets/examples with JSON schema validation in `packs/`.
