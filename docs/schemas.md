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
- `mm.planning.components.v1: { Power Platform: string[]; Azure: string[] }` — configurable component lists for cascading dropdowns.
- `mm.planning.sizeHours.v1: { XS:number; S:number; M:number; L:number; XL:number }` — estimates in hours per T‑shirt size.
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

### Solution Architecture workspace keys

The SA workspace uses the following keys (see types in `web/src/types/sa.ts`):

- `mm.sa.requirements.v1: Requirement[]` — imported/edited requirements.
- `mm.sa.options.v1: SolutionOption[]` — generated and edited dual solution options.
- `mm.sa.hld.v1: HLDArtifact | null` — the current HLD draft (Mermaid + narrative).
- `mm.sa.erd.v1: { entities: Entity[]; fields: Field[] }` — ERD designer state.
- `mm.sa.catalog.v1: ArmTemplate[]` — local ARM templates catalog.

## Future data sources

- Official roadmap feed (normalized into the above shape).
- Pack registries for snippets/examples with JSON schema validation in `packs/`.
