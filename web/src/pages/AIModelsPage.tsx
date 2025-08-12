import { useEffect, useState } from 'react'

type ProviderId = 'openai' | 'anthropic'

export default function AIModelsPage() {
  const [activeProvider, setActiveProvider] = useState<ProviderId>(() => (localStorage.getItem('mm.ai.activeProvider') as ProviderId) || 'openai')
  const [activeModel, setActiveModel] = useState<string>(() => localStorage.getItem('mm.ai.activeModel') || '')
  const [openaiKey] = useState<string>(() => localStorage.getItem('mm.ai.key.openai') || '')
  const [anthropicKey] = useState<string>(() => localStorage.getItem('mm.ai.key.anthropic') || '')
  const [openaiModels, setOpenaiModels] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('mm.ai.models.openai') || '[]') } catch { return [] } })
  const [anthropicModels, setAnthropicModels] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('mm.ai.models.anthropic') || '[]') } catch { return [] } })
  const [prompt, setPrompt] = useState<string>('')

  useEffect(() => { localStorage.setItem('mm.ai.activeProvider', activeProvider) }, [activeProvider])
  useEffect(() => { localStorage.setItem('mm.ai.activeModel', activeModel) }, [activeModel])

  const modelsForProvider = (p: ProviderId) => p === 'openai' ? openaiModels : anthropicModels
  const setModelsForProvider = (p: ProviderId, list: string[]) => { if (p === 'openai') setOpenaiModels(list); else setAnthropicModels(list) }

  const seedDefaults = (p: ProviderId) => p === 'openai'
    ? ['gpt-4o', 'gpt-4o-mini', 'o4-mini', 'gpt-4.1-mini']
    : ['claude-3-5-sonnet-20240620', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229']

  const discoverModels = async () => {
    try {
      const res = await fetch('/api/ai/discover')
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json() as { providers: Array<{ id: string; models: Array<{ id: string; label: string }> }> }
      const p = activeProvider
      const entry = data.providers.find(x => (p === 'openai' ? x.id === 'openai' : x.id === 'anthropic'))
      if (!entry) {
        alert('No discovery results for the selected provider. Using defaults.')
        const seeded = seedDefaults(p)
        setModelsForProvider(p, seeded)
        if (activeProvider === p && !seeded.includes(activeModel)) setActiveModel(seeded[0] || '')
        return
      }
      const discovered = entry.models.map(m => m.id)
      const current = modelsForProvider(p)
      const merged = Array.from(new Set([...current, ...discovered])).sort()
      setModelsForProvider(p, merged)
      if (activeProvider === p && (!activeModel || !merged.includes(activeModel))) setActiveModel(merged[0] || '')
      // persist
      localStorage.setItem('mm.ai.models.openai', JSON.stringify(p === 'openai' ? merged : openaiModels))
      localStorage.setItem('mm.ai.models.anthropic', JSON.stringify(p === 'anthropic' ? merged : anthropicModels))
      alert(`Discovered ${discovered.length} ${p} models`)
    } catch (e: any) {
      const seeded = seedDefaults(activeProvider)
      setModelsForProvider(activeProvider, seeded)
      if (!seeded.includes(activeModel)) setActiveModel(seeded[0] || '')
      alert(`Discovery failed. Using defaults for ${activeProvider}. ${e?.message ?? ''}`)
    }
  }

  const fetchModels = async (p: ProviderId) => {
    try {
      if (p === 'openai') {
        if (!openaiKey) throw new Error('Missing OpenAI API key')
        const res = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${openaiKey}` } })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        const names: string[] = (data.data || []).map((m: any) => m.id).filter((id: string) => /gpt|o4|4o/i.test(id))
        const list = Array.from(new Set(names)).sort()
        setOpenaiModels(list.length ? list : seedDefaults('openai'))
        if (!list.includes(activeModel) && activeProvider === 'openai') setActiveModel(list[0] || '')
      } else {
        if (!anthropicKey) throw new Error('Missing Anthropic API key')
        const res = await fetch('https://api.anthropic.com/v1/models', { headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' } })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        const names: string[] = (data.data || []).map((m: any) => m.id || m.name).filter((id: string) => /claude/i.test(id))
        const list = Array.from(new Set(names)).sort()
        setAnthropicModels(list.length ? list : seedDefaults('anthropic'))
        if (!list.includes(activeModel) && activeProvider === 'anthropic') setActiveModel(list[0] || '')
      }
      localStorage.setItem('mm.ai.models.openai', JSON.stringify(openaiModels))
      localStorage.setItem('mm.ai.models.anthropic', JSON.stringify(anthropicModels))
      alert('Models updated')
    } catch (e: any) {
      const seeded = seedDefaults(p)
      setModelsForProvider(p, seeded)
      if (activeProvider === p && !seeded.includes(activeModel)) setActiveModel(seeded[0] || '')
      alert(`Using default ${p} models. ${e?.message ?? ''}`)
    }
  }

  useEffect(() => {
    const key = `mm.ai.prompt.${activeProvider}.${activeModel}`
    setPrompt(localStorage.getItem(key) || '')
  }, [activeProvider, activeModel])
  useEffect(() => {
    const key = `mm.ai.prompt.${activeProvider}.${activeModel}`
    if (activeModel) localStorage.setItem(key, prompt)
  }, [prompt, activeProvider, activeModel])

  return (
    <main className="container">
      <h1>AI Models & Prompts</h1>
      <p>Select your provider and model, then craft a system prompt per model. These settings are stored locally in your browser.</p>

      <section style={{ display: 'grid', gap: '0.75rem', maxWidth: 680 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'end' }}>
          <div>
            <label htmlFor="ai-provider">Provider</label>
            <select id="ai-provider" value={activeProvider} onChange={e => setActiveProvider(e.target.value as ProviderId)}>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => fetchModels(activeProvider)}>Fetch models</button>
            <button onClick={discoverModels}>Discover (no key)</button>
            <button onClick={() => { const seeded = seedDefaults(activeProvider); setModelsForProvider(activeProvider, seeded); if (!seeded.includes(activeModel)) setActiveModel(seeded[0] || '') }}>Use defaults</button>
          </div>
        </div>

        <div>
          <label htmlFor="ai-model">Model</label>
          <select id="ai-model" value={activeModel} onChange={e => setActiveModel(e.target.value)}>
            <option value="">Select a model…</option>
            {modelsForProvider(activeProvider).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ai-prompt">System prompt (per model)</label>
          <textarea id="ai-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={10} placeholder="You are an assistant that…" />
          <small className="help">Saved as mm.ai.prompt.{`{provider}`}.{`{model}`}</small>
        </div>
      </section>
    </main>
  )
}
