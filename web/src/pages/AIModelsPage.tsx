import { useEffect, useState } from 'react'

type ProviderId = 'openai' | 'anthropic' | 'google'

export default function AIModelsPage() {
  const [activeProvider, setActiveProvider] = useState<ProviderId>(() => (localStorage.getItem('mm.ai.activeProvider') as ProviderId) || 'openai')
  const [activeModel, setActiveModel] = useState<string>(() => localStorage.getItem('mm.ai.activeModel') || '')
  const [openaiKey, setOpenaiKey] = useState<string>(() => localStorage.getItem('mm.ai.key.openai') || '')
  const [anthropicKey, setAnthropicKey] = useState<string>(() => localStorage.getItem('mm.ai.key.anthropic') || '')
  const [googleKey, setGoogleKey] = useState<string>(() => localStorage.getItem('mm.ai.key.google') || '')
  const [openaiModels, setOpenaiModels] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('mm.ai.models.openai') || '[]') } catch { return [] } })
  const [anthropicModels, setAnthropicModels] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('mm.ai.models.anthropic') || '[]') } catch { return [] } })
  const [googleModels, setGoogleModels] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('mm.ai.models.google') || '[]') } catch { return [] } })
  const [prompt, setPrompt] = useState<string>('')

  useEffect(() => { localStorage.setItem('mm.ai.activeProvider', activeProvider) }, [activeProvider])
  useEffect(() => { localStorage.setItem('mm.ai.activeModel', activeModel) }, [activeModel])

  const modelsForProvider = (p: ProviderId) => 
    p === 'openai' ? openaiModels : 
    p === 'anthropic' ? anthropicModels : 
    googleModels

  const setModelsForProvider = (p: ProviderId, list: string[]) => { 
    if (p === 'openai') setOpenaiModels(list)
    else if (p === 'anthropic') setAnthropicModels(list)
    else setGoogleModels(list)
  }

  const seedDefaults = (p: ProviderId) => 
    p === 'openai' ? ['gpt-4o', 'gpt-4o-mini', 'o1-mini', 'gpt-4-turbo'] :
    p === 'anthropic' ? ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'] :
    ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro']

  const discoverModels = async () => {
    try {
      const res = await fetch('/api/ai/discover')
      if (!res.ok) throw new Error(await res.text())
      const text = await res.text()
      
      // Check if we got HTML (local dev) instead of JSON
      if (text.trim().startsWith('<')) {
        throw new Error('Local development: Netlify functions not available')
      }
      
      const data = JSON.parse(text) as { providers: Array<{ id: string; models: Array<{ id: string; label: string }> }> }
      const p = activeProvider
      const entry = data.providers.find(x => x.id === p)
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
      localStorage.setItem('mm.ai.models.google', JSON.stringify(p === 'google' ? merged : googleModels))
      alert(`Discovered ${discovered.length} ${p} models`)
    } catch (e: any) {
      // In local dev, provide curated discovery results
      const p = activeProvider
      const curatedDiscovery = p === 'openai' 
        ? ['gpt-4o', 'gpt-4o-mini', 'o1-mini', 'gpt-4-turbo', 'gpt-3.5-turbo']
        : p === 'anthropic' 
        ? ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229']
        : ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro', 'gemini-pro-vision']
      
      const current = modelsForProvider(p)
      const merged = Array.from(new Set([...current, ...curatedDiscovery])).sort()
      setModelsForProvider(p, merged)
      if (activeProvider === p && (!activeModel || !merged.includes(activeModel))) setActiveModel(merged[0] || '')
      // persist
      localStorage.setItem('mm.ai.models.openai', JSON.stringify(p === 'openai' ? merged : openaiModels))
      localStorage.setItem('mm.ai.models.anthropic', JSON.stringify(p === 'anthropic' ? merged : anthropicModels))
      localStorage.setItem('mm.ai.models.google', JSON.stringify(p === 'google' ? merged : googleModels))
      alert(`Discovery (local): Added ${curatedDiscovery.length} curated ${p} models`)
    }
  }

  const fetchModels = async (p: ProviderId) => {
    try {
      if (p === 'openai') {
        if (!openaiKey) throw new Error('Missing OpenAI API key')
        const res = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${openaiKey}` } })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        const names: string[] = (data.data || []).map((m: any) => m.id).filter((id: string) => /gpt|o1|4o/i.test(id))
        const list = Array.from(new Set(names)).sort()
        setOpenaiModels(list.length ? list : seedDefaults('openai'))
        if (!list.includes(activeModel) && activeProvider === 'openai') setActiveModel(list[0] || '')
      } else if (p === 'anthropic') {
        if (!anthropicKey) throw new Error('Missing Anthropic API key')
        const res = await fetch('https://api.anthropic.com/v1/models', { headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' } })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        const names: string[] = (data.data || []).map((m: any) => m.id || m.name).filter((id: string) => /claude/i.test(id))
        const list = Array.from(new Set(names)).sort()
        setAnthropicModels(list.length ? list : seedDefaults('anthropic'))
        if (!list.includes(activeModel) && activeProvider === 'anthropic') setActiveModel(list[0] || '')
      } else {
        if (!googleKey) throw new Error('Missing Google AI API key')
        const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + googleKey)
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        const names: string[] = (data.models || []).map((m: any) => m.name).filter((name: string) => name.includes('gemini')).map((name: string) => name.replace('models/', ''))
        const list = Array.from(new Set(names)).sort()
        setGoogleModels(list.length ? list : seedDefaults('google'))
        if (!list.includes(activeModel) && activeProvider === 'google') setActiveModel(list[0] || '')
      }
      localStorage.setItem('mm.ai.models.openai', JSON.stringify(openaiModels))
      localStorage.setItem('mm.ai.models.anthropic', JSON.stringify(anthropicModels))
      localStorage.setItem('mm.ai.models.google', JSON.stringify(googleModels))
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
              <option value="google">Google AI</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => fetchModels(activeProvider)}>Fetch models</button>
            <button onClick={discoverModels}>Discover (no key)</button>
            <button onClick={() => { const seeded = seedDefaults(activeProvider); setModelsForProvider(activeProvider, seeded); if (!seeded.includes(activeModel)) setActiveModel(seeded[0] || '') }}>Use defaults</button>
          </div>
        </div>

        <div>
          <label htmlFor="ai-key">API Key ({activeProvider})</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.5rem', alignItems: 'end' }}>
            <input
              id="ai-key"
              type="password"
              placeholder={`Enter your ${activeProvider === 'openai' ? 'OpenAI' : activeProvider === 'anthropic' ? 'Anthropic' : 'Google AI'} API key`}
              value={activeProvider === 'openai' ? openaiKey : activeProvider === 'anthropic' ? anthropicKey : googleKey}
              onChange={e => {
                if (activeProvider === 'openai') {
                  setOpenaiKey(e.target.value)
                } else if (activeProvider === 'anthropic') {
                  setAnthropicKey(e.target.value)
                } else {
                  setGoogleKey(e.target.value)
                }
              }}
            />
            <button 
              onClick={() => {
                const key = activeProvider === 'openai' ? openaiKey : activeProvider === 'anthropic' ? anthropicKey : googleKey
                if (key.trim()) {
                  localStorage.setItem(`mm.ai.key.${activeProvider}`, key)
                  alert('API key saved')
                } else {
                  alert('Please enter an API key first')
                }
              }}
            >
              Save
            </button>
            <button 
              onClick={() => {
                if (activeProvider === 'openai') {
                  setOpenaiKey('')
                  localStorage.removeItem('mm.ai.key.openai')
                } else if (activeProvider === 'anthropic') {
                  setAnthropicKey('')
                  localStorage.removeItem('mm.ai.key.anthropic')
                } else {
                  setGoogleKey('')
                  localStorage.removeItem('mm.ai.key.google')
                }
                alert('API key cleared')
              }}
            >
              Clear
            </button>
          </div>
          <small className="help">
            Required for "Fetch models" button.
            {activeProvider === 'openai' && ' Get yours at: https://platform.openai.com/api-keys'}
            {activeProvider === 'anthropic' && ' Get yours at: https://console.anthropic.com/settings/keys'}
            {activeProvider === 'google' && ' Get yours at: https://aistudio.google.com/app/apikey'}
          </small>
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
