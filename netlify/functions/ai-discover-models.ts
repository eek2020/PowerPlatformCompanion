// Aggregates model catalogs from public sources without requiring API keys.
// Returns a normalized provider->models list. Best-effort: some providers may be unreachable or require keys; those are skipped.
// Response: { providers: Array<{ id: string; name: string; source: string; models: Array<{ id: string; label: string; source: string }> }> }

interface DiscoverResponse {
  providers: Array<{
    id: string
    name: string
    source: string
    models: Array<{ id: string; label: string; source: string }>
  }>
}

async function fetchJson<T = any>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, init)
    if (!res.ok) return null
    const text = await res.text()
    if (!text.trim() || text.startsWith('<')) return null // Skip HTML responses
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export default async function handler(_event: Request): Promise<Response> {
  try {
    const out: DiscoverResponse = { providers: [] }

    // 1) OpenRouter models endpoint (public, no key required)
    try {
      const orModels = await fetchJson<{ data?: Array<{ id: string; name?: string }> }>(
        'https://openrouter.ai/api/v1/models'
      )
      if (orModels?.data && Array.isArray(orModels.data)) {
        const models = orModels.data.slice(0, 50).map((m) => ({ id: m.id, label: m.name || m.id, source: 'openrouter' }))
        out.providers.push({ id: 'openrouter', name: 'OpenRouter (aggregator)', source: 'https://openrouter.ai', models })
      }
    } catch {}

    // 2) Hugging Face trending text-generation models (public, but rate-limited)
    try {
      const hf = await fetchJson<Array<{ id: string; modelId?: string }>>(
        'https://huggingface.co/api/models?pipeline_tag=text-generation&sort=downloads&direction=-1&limit=30'
      )
      if (hf && Array.isArray(hf)) {
        const models = hf.map((m) => ({ id: m.id || m.modelId || '', label: m.id || m.modelId || '', source: 'huggingface' }))
          .filter(m => m.id)
        out.providers.push({ id: 'huggingface', name: 'Hugging Face (hub)', source: 'https://huggingface.co', models })
      }
    } catch {}

    // 3) Static curated lists for OpenAI/Anthropic (docs do not expose unauthenticated JSON lists)
    const curatedOpenAI = ['gpt-4o', 'gpt-4o-mini', 'o1-mini', 'gpt-4-turbo']
    out.providers.push({
      id: 'openai',
      name: 'OpenAI (curated)',
      source: 'curated',
      models: curatedOpenAI.map((id) => ({ id, label: id, source: 'curated' })),
    })
    
    const curatedAnthropic = ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229']
    out.providers.push({
      id: 'anthropic',
      name: 'Anthropic (curated)',
      source: 'curated',
      models: curatedAnthropic.map((id) => ({ id, label: id, source: 'curated' })),
    })

    return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } })
  } catch (error: any) {
    // Always return valid JSON, even on error
    const fallback: DiscoverResponse = {
      providers: [
        {
          id: 'openai',
          name: 'OpenAI (fallback)',
          source: 'fallback',
          models: [
            { id: 'gpt-4o', label: 'gpt-4o', source: 'fallback' },
            { id: 'gpt-4o-mini', label: 'gpt-4o-mini', source: 'fallback' }
          ]
        },
        {
          id: 'anthropic',
          name: 'Anthropic (fallback)',
          source: 'fallback',
          models: [
            { id: 'claude-3-5-sonnet-20241022', label: 'claude-3-5-sonnet-20241022', source: 'fallback' },
            { id: 'claude-3-5-haiku-20241022', label: 'claude-3-5-haiku-20241022', source: 'fallback' }
          ]
        }
      ]
    }
    return new Response(JSON.stringify(fallback), { headers: { 'Content-Type': 'application/json' } })
  }
}
