import { useEffect, useState, useMemo } from 'react'
import {
  ALL_PROCESSES,
  type ProviderId,
  type ProcessId,
  getModels,
  getPrompt,
  setPrompt,
  getBindings,
  setBinding,
  resolveConfig,
} from '../lib/ai'

interface Provider {
  id: string
  name: string
  apiKey: string
  baseUrl?: string
  isExpanded: boolean
  models: string[]
}

interface NewProvider {
  name: string
  apiKey: string
  baseUrl: string
}

function useModels(provider: ProviderId) {
  const [models, setModels] = useState<string[]>(() => getModels(provider))
  useEffect(() => { setModels(getModels(provider)) }, [provider])
  return models
}

export default function AIProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>(() => {
    const savedProviders = localStorage.getItem('mm.ai.providers')
    if (savedProviders) {
      return JSON.parse(savedProviders)
    }
    return [
      {
        id: 'openai',
        name: 'OpenAI',
        apiKey: localStorage.getItem('mm.ai.key.openai') || '',
        baseUrl: 'https://api.openai.com/v1',
        isExpanded: true,
        models: []
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        apiKey: localStorage.getItem('mm.ai.key.anthropic') || '',
        baseUrl: 'https://api.anthropic.com',
        isExpanded: true,
        models: []
      }
    ]
  })

  const [newProvider, setNewProvider] = useState<NewProvider>({
    name: '',
    apiKey: '',
    baseUrl: ''
  })
  const [isAddingProvider, setIsAddingProvider] = useState(false)
  const [newModel, setNewModel] = useState('')
  const [selectedProviderId, setSelectedProviderId] = useState('')
  const [bindingsVersion, setBindingsVersion] = useState(0)
  const [openBindings, setOpenBindings] = useState<Record<ProcessId, boolean>>({} as Record<ProcessId, boolean>)
  const toggleBinding = (id: ProcessId) => setOpenBindings(prev => ({ ...prev, [id]: !prev[id] }))
  
  // Trigger re-render when bindings change
  useMemo(() => getBindings(), [bindingsVersion])

  // Save providers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mm.ai.providers', JSON.stringify(providers))
    // Also save individual keys for backward compatibility
    providers.forEach(provider => {
      if (provider.id === 'openai') {
        localStorage.setItem('mm.ai.key.openai', provider.apiKey)
      } else if (provider.id === 'anthropic') {
        localStorage.setItem('mm.ai.key.anthropic', provider.apiKey)
      }
    })
  }, [providers])

  const toggleProvider = (id: string) => {
    setProviders(prev => prev.map(p => 
      p.id === id ? { ...p, isExpanded: !p.isExpanded } : p
    ))
  }

  const updateProviderKey = (id: string, apiKey: string) => {
    setProviders(prev => prev.map(p => 
      p.id === id ? { ...p, apiKey } : p
    ))
  }

  const addProvider = () => {
    if (!newProvider.name.trim() || !newProvider.apiKey.trim()) {
      alert('Please provide both provider name and API key')
      return
    }

    const id = newProvider.name.toLowerCase().replace(/\s+/g, '-')
    const provider: Provider = {
      id,
      name: newProvider.name,
      apiKey: newProvider.apiKey,
      baseUrl: newProvider.baseUrl || undefined,
      isExpanded: true,
      models: []
    }

    setProviders(prev => [...prev, provider])
    setNewProvider({ name: '', apiKey: '', baseUrl: '' })
    setIsAddingProvider(false)
  }

  const removeProvider = (id: string) => {
    if (!confirm(`Remove provider "${providers.find(p => p.id === id)?.name}"?`)) return
    setProviders(prev => prev.filter(p => p.id !== id))
  }

  const addModel = () => {
    if (!newModel.trim() || !selectedProviderId) {
      alert('Please provide model name and select a provider')
      return
    }

    setProviders(prev => prev.map(p => 
      p.id === selectedProviderId 
        ? { ...p, models: [...p.models, newModel] }
        : p
    ))
    setNewModel('')
    setSelectedProviderId('')
  }

  const removeModel = (providerId: string, model: string) => {
    setProviders(prev => prev.map(p => 
      p.id === providerId 
        ? { ...p, models: p.models.filter(m => m !== model) }
        : p
    ))
  }

  const clearAll = () => {
    if (!confirm('Clear all stored AI providers, keys, and model lists from this browser?')) return
    localStorage.removeItem('mm.ai.providers')
    localStorage.removeItem('mm.ai.key.openai')
    localStorage.removeItem('mm.ai.key.anthropic')
    localStorage.removeItem('mm.ai.models.openai')
    localStorage.removeItem('mm.ai.models.anthropic')
    localStorage.removeItem('mm.ai.activeModel')
    localStorage.removeItem('mm.ai.activeProvider')
    setProviders([])
    alert('AI settings cleared from localStorage.')
  }

  return (
    <main className="container">
      <h1>AI Providers</h1>
      <p>Manage AI providers, API keys, and models. Configure process bindings to control which AI models are used for different tasks.</p>

      {/* Provider Management Section */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Providers</h2>
          <button onClick={() => setIsAddingProvider(true)}>Add Provider</button>
        </div>

        {isAddingProvider && (
          <div style={{ border: '1px solid var(--muted, #e5e7eb)', borderRadius: 8, padding: 16, marginBottom: '1rem' }}>
            <h3>Add New Provider</h3>
            <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 400 }}>
              <div>
                <label htmlFor="new-provider-name">Provider Name</label>
                <input 
                  id="new-provider-name"
                  type="text" 
                  placeholder="e.g., Custom OpenAI"
                  value={newProvider.name}
                  onChange={e => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="new-provider-key">API Key</label>
                <input 
                  id="new-provider-key"
                  type="password" 
                  placeholder="Your API key"
                  value={newProvider.apiKey}
                  onChange={e => setNewProvider(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="new-provider-url">Base URL (optional)</label>
                <input 
                  id="new-provider-url"
                  type="url" 
                  placeholder="https://api.example.com/v1"
                  value={newProvider.baseUrl}
                  onChange={e => setNewProvider(prev => ({ ...prev, baseUrl: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={addProvider}>Add Provider</button>
                <button onClick={() => setIsAddingProvider(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {providers.map(provider => (
            <div key={provider.id} style={{ border: '1px solid var(--muted, #e5e7eb)', borderRadius: 8 }}>
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: 12,
                  cursor: 'pointer',
                  borderBottom: provider.isExpanded ? '1px solid var(--muted, #e5e7eb)' : 'none'
                }}
                onClick={() => toggleProvider(provider.id)}
              >
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                  {provider.isExpanded ? '▼' : '▶'} {provider.name}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {provider.id !== 'openai' && provider.id !== 'anthropic' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeProvider(provider.id) }}
                      style={{ fontSize: '0.8rem', padding: '2px 6px' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              
              {provider.isExpanded && (
                <div style={{ padding: 12 }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor={`provider-${provider.id}-key`}>API Key</label>
                    <input 
                      id={`provider-${provider.id}-key`}
                      type="password" 
                      placeholder="Enter API key..."
                      value={provider.apiKey}
                      onChange={e => updateProviderKey(provider.id, e.target.value)}
                    />
                    {provider.baseUrl && (
                      <small className="help">Base URL: {provider.baseUrl}</small>
                    )}
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Custom Models</h4>
                    {provider.models.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                        {provider.models.map(model => (
                          <span 
                            key={model}
                            style={{ 
                              background: 'var(--muted, #f3f4f6)', 
                              padding: '2px 6px', 
                              borderRadius: 4, 
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {model}
                            <button 
                              onClick={() => removeModel(provider.id, model)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                fontSize: '0.7rem',
                                padding: 0,
                                color: 'var(--danger, #dc2626)'
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground, #6b7280)', margin: '0 0 0.5rem 0' }}>
                        No custom models added
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Add Model Section */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Add Model</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end', maxWidth: 600 }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="new-model-name">Model Name</label>
            <input 
              id="new-model-name"
              type="text" 
              placeholder="e.g., gpt-4-custom"
              value={newModel}
              onChange={e => setNewModel(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="model-provider-select">Provider</label>
            <select 
              id="model-provider-select"
              value={selectedProviderId}
              onChange={e => setSelectedProviderId(e.target.value)}
            >
              <option value="">Select provider...</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>{provider.name}</option>
              ))}
            </select>
          </div>
          <button onClick={addModel}>Add Model</button>
        </div>
      </section>

      {/* AI Process Bindings Section */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>AI Process Bindings</h2>
        <p>Choose which provider/model and prompt each app process should use. If no custom binding is set, the process will use the global active provider/model and its system prompt.</p>

        <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 900 }}>
          {ALL_PROCESSES.map(({ id, label }) => {
            const b = getBindings()[id]
            const open = !!openBindings[id]
            return (
              <div key={id} style={{ border: '1px solid var(--muted, #e5e7eb)', borderRadius: 8 }}>
                <button
                  type="button"
                  onClick={() => toggleBinding(id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'transparent', border: 'none', borderBottom: open ? '1px solid var(--muted, #e5e7eb)' : 'none'
                  }}
                  aria-expanded={open}
                  aria-controls={`pb-${id}`}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{open ? '▼' : '▶'}</span>
                    <strong>{label}</strong>
                  </span>
                  <span style={{ fontSize: '0.8rem', color: b ? 'var(--success, #16a34a)' : 'var(--muted-foreground, #6b7280)' }}>
                    {b ? 'Custom' : 'Using global'}
                  </span>
                </button>
                {open && (
                  <div id={`pb-${id}`} style={{ padding: 12 }}>
                    <ProcessBindingCard proc={id} label={label} onChange={() => setBindingsVersion(v => v + 1)} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Clear All Section */}
      <section>
        <button onClick={clearAll} style={{ background: 'var(--danger, #dc2626)', color: 'white' }}>
          Clear All AI Settings
        </button>
        <div style={{ marginTop: 8 }}>
          <small className="help">Tip: For production, prefer a serverless proxy so keys are never stored in the browser.</small>
        </div>
      </section>
    </main>
  )
}

function ProcessBindingCard({ proc, label, onChange }: { proc: ProcessId; label: string; onChange: () => void }) {
  const bound = getBindings()[proc]
  const isCustom = !!bound
  const provider: ProviderId = bound?.provider ?? (resolveConfig(proc).provider)
  const models = useModels(provider)
  const model = bound?.model ?? resolveConfig(proc).model

  const defaultPrompt = getPrompt(provider, model)
  const [useOverride, setUseOverride] = useState<boolean>(!!bound?.promptOverride)
  const [overrideText, setOverrideText] = useState<string>(bound?.promptOverride ?? '')

  useEffect(() => {
    // If changing model under a custom binding and not overriding, reflect default prompt
    if (!useOverride) {
      const p = getPrompt(provider, model)
      setOverrideText(p)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, model, useOverride])

  const setCustom = (enabled: boolean) => {
    if (!enabled) {
      setBinding(proc, undefined)
      onChange()
      return
    }
    setBinding(proc, { provider, model, promptOverride: useOverride ? overrideText : undefined })
    onChange()
  }

  const changeProvider = (p: ProviderId) => {
    if (!isCustom) setCustom(true)
    setBinding(proc, { provider: p, model: '', promptOverride: useOverride ? overrideText : undefined })
    onChange()
  }

  const changeModel = (m: string) => {
    if (!isCustom) setCustom(true)
    setBinding(proc, { provider, model: m, promptOverride: useOverride ? overrideText : undefined })
    onChange()
  }

  const saveDefaultPrompt = () => {
    if (!model) return
    setPrompt(provider, model, overrideText)
    alert('Saved as the default system prompt for this provider+model')
  }

  const clearBinding = () => {
    if (!confirm(`Clear custom binding for ${label}?`)) return
    setBinding(proc, undefined)
    onChange()
  }

  return (
    <div style={{ border: '1px solid var(--muted, #e5e7eb)', borderRadius: 8, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{label}</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={isCustom} onChange={e => setCustom(e.target.checked)} />
            <span>Custom binding</span>
          </label>
          {isCustom && (
            <button onClick={clearBinding} style={{ fontSize: '0.8rem', padding: '2px 6px' }}>Clear</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: 8 }}>
        <div>
          <label htmlFor={`${proc}-provider`}>Provider</label>
          <select id={`${proc}-provider`} value={provider} onChange={e => changeProvider(e.target.value as ProviderId)}>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>

        <div>
          <label htmlFor={`${proc}-model`}>Model</label>
          <select id={`${proc}-model`} value={model} onChange={e => changeModel(e.target.value)}>
            <option value="">Select a model...</option>
            {models.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input 
              type="checkbox" 
              checked={useOverride} 
              onChange={e => {
                setUseOverride(e.target.checked)
                if (isCustom) {
                  setBinding(proc, { provider, model, promptOverride: e.target.checked ? overrideText : undefined })
                  onChange()
                }
              }} 
            />
            <span>System prompt</span>
          </label>
          {useOverride && model && (
            <button onClick={saveDefaultPrompt} style={{ fontSize: '0.8rem', padding: '2px 6px' }}>
              Save as default
            </button>
          )}
        </div>
        <textarea 
          rows={4} 
          value={useOverride ? overrideText : defaultPrompt}
          onChange={e => {
            setOverrideText(e.target.value)
            if (isCustom && useOverride) {
              setBinding(proc, { provider, model, promptOverride: e.target.value })
              onChange()
            }
          }}
          disabled={!useOverride}
          style={{ width: '100%', resize: 'vertical' }}
        />
      </div>
    </div>
  )
}
