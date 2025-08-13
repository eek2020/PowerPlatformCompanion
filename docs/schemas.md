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

### AI settings and bindings

- `mm.ai.activeProvider: 'openai' | 'anthropic'` — current global provider selection.
- `mm.ai.activeModel: string` — current global model selection.
- `mm.ai.models.openai: string[]` — cached/fetched list of OpenAI model ids.
- `mm.ai.models.anthropic: string[]` — cached/fetched list of Anthropic model ids.
- `mm.ai.prompt.<provider>.<model>: string` — per provider+model system prompt text.
- `mm.ai.bindings.v1: Record<ProcessId, { provider: ProviderId; model: string; promptOverride?: string } | undefined>` — per‑process overrides.

Types live in `web/src/lib/ai.ts`:

- `type ProviderId = 'openai' | 'anthropic'`
- `type ProcessId = 'snippets' | 'delegation' | 'expression' | 'diagnostics' | 'formatter' | 'dataverse' | 'packs' | 'icons' | 'estimating' | 'requirements' | 'hld' | 'arm' | 'erd' | 'roadmap' | 'licensing'`
- `type Binding = { provider: ProviderId; model: string; promptOverride?: string }`

### Solution Architecture workspace keys

The SA workspace uses the following keys (see types in `web/src/types/sa.ts`):

- `mm.sa.requirements.v1: Requirement[]` — imported/edited requirements.
- `mm.sa.options.v1: SolutionOption[]` — generated and edited dual solution options.
- `mm.sa.hld.v1: HLDArtifact | null` — the current HLD draft (Mermaid + narrative).
- `mm.sa.erd.v1: { entities: Entity[]; fields: Field[] }` — ERD designer state.
- `mm.sa.catalog.v1: ArmTemplate[]` — local ARM templates catalog.

## Serverless API Schemas (SA)

### POST /api/sa/generate-options

- Request body:
  - `requirements: { id: string; title: string; description: string }[]` — each item sends both title and description.
  - `provider?: 'openai' | 'azure-openai'`
  - `model?: string`
  - `systemPrompt?: string`
  - `apiKey: string` — required; provided by client from `SecretStore` and not stored server-side.

- Response body:
  - `Array<{
        requirementId: string,
        options: Array<{
          optionType: 'PowerPlatform' | 'Azure',
          architectureSummary?: string,
          components?: string[],
          services?: string[],
          tradeoffs?: string,
          [k: string]: unknown
        }>
      }>`

Notes:
- The Netlify function constructs prompts from both `title` and `description`.
- Returns 401 when `apiKey` is missing.

## Future data sources

- Official roadmap feed (normalized into the above shape).
- Pack registries for snippets/examples with JSON schema validation in `packs/`.
