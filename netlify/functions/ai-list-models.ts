// Lists available models for a provider. For now returns a mocked list.
// Later, implement real provider API calls (OpenAI: GET /v1/models; Azure OpenAI: via management or configured deployments).
// Request body: { provider: 'openai' | 'azure-openai', apiKey?: string }
// Response: { models: Array<{ id: string; label: string; deprecated?: boolean }> }

interface ListModelsRequest {
  provider: 'openai' | 'azure-openai'
  apiKey?: string
}
export default async function handler(event: Request): Promise<Response> {
  if (event.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }
  try {
    const req = (await event.json()) as ListModelsRequest
    if (!req?.provider) {
      return new Response(JSON.stringify({ error: 'provider is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // If apiKey provided and provider supports it, fetch live list via provider API.
    let models: Array<{ id: string; label: string; deprecated?: boolean }> = []
    if (req.provider === 'openai') {
      const curated = [
        { id: 'gpt-4o', label: 'GPT‑4o (General)' },
        { id: 'gpt-4o-mini', label: 'GPT‑4o mini (Fast, cost‑eff.)' },
        { id: 'o4-mini', label: 'o4‑mini (Reasoning, fast)' },
        { id: 'gpt-4.1', label: 'GPT‑4.1', deprecated: true },
        { id: 'gpt-3.5-turbo', label: 'GPT‑3.5 Turbo', deprecated: true },
      ]
      if (req.apiKey) {
        try {
          const res = await fetch('https://api.openai.com/v1/models', {
            headers: { Authorization: `Bearer ${req.apiKey}` },
          })
          if (!res.ok) throw new Error(await res.text())
          const data = await res.json() as { data?: Array<{ id: string }> }
          const ids = Array.from(new Set((data.data || []).map(m => m.id)))
          // Filter to relevant chat/completion/capable families (tweak as needed)
          const allow = ids.filter(id => /(gpt|o1|4o|text-davinci|davinci)/i.test(id))
          const mapped = allow.map(id => ({ id, label: id }))
          // Ensure stable sort
          models = mapped.sort((a, b) => a.id.localeCompare(b.id))
          if (!models.length) models = curated
        } catch (e) {
          // On any error, fall back to curated defaults
          models = curated
        }
      } else {
        models = curated
      }
    } else if (req.provider === 'azure-openai') {
      // Azure OpenAI typically uses deployments, not listing generic models.
      // For now return curated placeholders; TODO: integrate with Azure deployments discovery.
      models = [
        { id: 'gpt-4o-azure', label: 'Azure GPT‑4o (Deployment)' },
        { id: 'gpt-4o-mini-azure', label: 'Azure GPT‑4o mini (Deployment)' },
      ]
    }

    return new Response(JSON.stringify({ models }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
