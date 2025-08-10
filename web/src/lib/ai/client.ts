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
