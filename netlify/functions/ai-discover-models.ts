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
    return (await res.json()) as T
  } catch {
    return null
  }
}

export default async function handler(_event: Request): Promise<Response> {
  const out: DiscoverResponse = { providers: [] }

  // 1) Ollama public registry tags (no key): https://registry.ollama.ai/v2/library/tags/list
  //    Docs: https://github.com/ollama/ollama/blob/main/docs/library.md
  try {
    const ollama = await fetchJson<{ name: string; tags: string[] }>(
      'https://registry.ollama.ai/v2/library/tags/list?n=1000'
    )
    if (ollama && Array.isArray(ollama.tags)) {
      const models = Array.from(new Set(ollama.tags)).sort().map((t) => ({ id: t, label: t, source: 'ollama:registry' }))
      out.providers.push({ id: 'ollama', name: 'Ollama (local models)', source: 'https://registry.ollama.ai', models })
    }
  } catch {}

  // 2) OpenRouter models endpoint (may require key; try and ignore failures)
  //    Docs: https://openrouter.ai/docs#models
  try {
    const orModels = await fetchJson<{ data?: Array<{ id: string; name?: string }> }>(
      'https://openrouter.ai/api/v1/models'
    )
    if (orModels?.data && Array.isArray(orModels.data)) {
      const models = orModels.data.map((m) => ({ id: m.id, label: m.name || m.id, source: 'openrouter' }))
      out.providers.push({ id: 'openrouter', name: 'OpenRouter (aggregator)', source: 'https://openrouter.ai', models })
    }
  } catch {}

  // 3) Hugging Face trending text-generation models (public, but rate-limited). If blocked, skip silently.
  //    Docs: https://huggingface.co/docs/api-references/hub
  try {
    const hf = await fetchJson<Array<{ id: string }>>(
      'https://huggingface.co/api/models?pipeline_tag=text-generation&sort=downloads&direction=-1&limit=50'
    )
    if (hf && Array.isArray(hf)) {
      const models = hf.map((m) => ({ id: m.id, label: m.id, source: 'huggingface' }))
      out.providers.push({ id: 'huggingface', name: 'Hugging Face (hub)', source: 'https://huggingface.co', models })
    }
  } catch {}

  // 4) Static curated lists for OpenAI/Anthropic (docs do not expose unauthenticated JSON lists)
  // Keep short and periodically updated in code.
  const curatedOpenAI = ['gpt-4o', 'gpt-4o-mini', 'o4-mini']
  out.providers.push({
    id: 'openai',
    name: 'OpenAI (curated)'
    , source: 'curated',
    models: curatedOpenAI.map((id) => ({ id, label: id, source: 'curated' })),
  })
  const curatedAnthropic = ['claude-3-5-sonnet-20240620', 'claude-3-5-haiku-20241022']
  out.providers.push({
    id: 'anthropic',
    name: 'Anthropic (curated)',
    source: 'curated',
    models: curatedAnthropic.map((id) => ({ id, label: id, source: 'curated' })),
  })

  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } })
}
