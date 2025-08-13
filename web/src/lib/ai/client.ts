// Provider-agnostic AI client for Solution Architecture features
// Calls are proxied via Netlify Functions. Keys are user-supplied in UI (local-only).
// Desktop targets can override the transport (e.g., IPC) via setAITransport().

type Transport = {
  post<TReq, TRes>(path: string, body: TReq): Promise<TRes>
}

const httpTransport: Transport = {
  async post<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`${path} failed: ${res.status} ${res.statusText}`)
    return res.json() as Promise<TRes>
  },
}

let transport: Transport = httpTransport

export function setAITransport(t: Transport) {
  transport = t
}

export type AIProvider = 'openai' | 'azure-openai'

export interface GenerateOptionsRequest {
  requirements: Array<{ id: string; title: string; description: string }>
  provider?: AIProvider
  model?: string
  systemPrompt?: string
}

export interface GenerateOptionsResponseItem {
  requirementId: string
  options: [
    { optionType: 'PowerPlatform'; architectureSummary: string; components: string[]; services: string[]; tradeoffs: string },
    { optionType: 'Azure'; architectureSummary: string; components: string[]; services: string[]; tradeoffs: string }
  ]
}

export async function generateOptions(req: GenerateOptionsRequest): Promise<GenerateOptionsResponseItem[]> {
  return transport.post<GenerateOptionsRequest, GenerateOptionsResponseItem[]>('/api/sa/generate-options', req)
}

export interface HldDraftRequest {
  brief: string
  docs?: string[]
}
export interface HldDraftResponse {
  mermaidCode: string
  narrative: string
}

export async function hldDraft(req: HldDraftRequest): Promise<HldDraftResponse> {
  return transport.post<HldDraftRequest, HldDraftResponse>('/api/sa/hld-draft', req)
}

export interface ErdDraftRequest {
  description: string
}
export interface ErdDraftResponse {
  entities: Array<{ id: string; name: string }>
  fields: Array<{ id: string; entityId: string; name: string; type: string; required: boolean }>
  mermaidCode: string
}

export async function erdDraft(req: ErdDraftRequest): Promise<ErdDraftResponse> {
  return transport.post<ErdDraftRequest, ErdDraftResponse>('/api/sa/erd-draft', req)
}

// Triple options (PP only, Hybrid, Azure only)
export interface TripleOption {
  architectureSummary: string
  components: string[]
  services: string[]
  tradeoffs: string
  implementationNotes: string
  security: string
  costConsiderations: string
  complexity: 'low' | 'medium' | 'high'
  scale: 'small' | 'medium' | 'large'
}

export interface GenerateTripleOptionsItem {
  requirementId: string
  responses: {
    powerPlatformOnly: TripleOption
    hybrid: TripleOption
    azureOnly: TripleOption
  }
}

export interface GenerateTripleOptionsRequest {
  requirements: Array<{ id: string; title: string; description: string }>
  provider?: AIProvider
  model?: string
  systemPrompt?: string
  // Optional: API key to be used server-side. Prefer server-side env vars in production.
  apiKey?: string
}

export async function generateTripleOptions(req: GenerateTripleOptionsRequest): Promise<GenerateTripleOptionsItem[]> {
  return transport.post<GenerateTripleOptionsRequest, GenerateTripleOptionsItem[]>('/api/sa/generate-triple-options', req)
}

// Models listing
export interface ListModelsRequest {
  provider: AIProvider
  apiKey?: string
}
export interface ListModelsResponse {
  models: Array<{ id: string; label: string; deprecated?: boolean }>
}

export async function listModels(req: ListModelsRequest): Promise<ListModelsResponse> {
  return transport.post<ListModelsRequest, ListModelsResponse>('/api/ai/list-models', req)
}
