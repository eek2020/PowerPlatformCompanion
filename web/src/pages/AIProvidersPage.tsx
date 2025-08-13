import { useEffect, useState, useMemo } from 'react'
import { secrets } from '../lib/secrets'
import {
  ALL_PROCESSES,
  type ProviderId,
  type ProcessId,
  getModels,
  setModels,
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
        models: getModels('openai'),
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        apiKey: localStorage.getItem('mm.ai.key.anthropic') || '',
        baseUrl: 'https://api.anthropic.com',
        isExpanded: true,
        models: getModels('anthropic'),
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
        if (provider.apiKey) secrets.set('ai.key.openai', provider.apiKey); else secrets.delete('ai.key.openai')
        // Keep the shared models store (used by bindings) in sync
        if (Array.isArray(provider.models)) setModels('openai', provider.models)
      } else if (provider.id === 'anthropic') {
        localStorage.setItem('mm.ai.key.anthropic', provider.apiKey)
        if (provider.apiKey) secrets.set('ai.key.anthropic', provider.apiKey); else secrets.delete('ai.key.anthropic')
        if (Array.isArray(provider.models)) setModels('anthropic', provider.models)
      }
      
      // Generic secret key for custom providers
      const keyName = `ai.key.${provider.id}`
      if (provider.apiKey) secrets.set(keyName, provider.apiKey); else secrets.delete(keyName)
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
    // reflect immediately in secrets
    const keyName = id === 'openai' ? 'ai.key.openai' : id === 'anthropic' ? 'ai.key.anthropic' : `ai.key.${id}`
    if (apiKey) secrets.set(keyName, apiKey); else secrets.delete(keyName)
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
    if (newProvider.apiKey) secrets.set(`ai.key.${id}`, newProvider.apiKey)
    setNewProvider({ name: '', apiKey: '', baseUrl: '' })
    setIsAddingProvider(false)
  }

  const removeProvider = (id: string) => {
    if (!confirm(`Remove provider "${providers.find(p => p.id === id)?.name}"?`)) return
    setProviders(prev => prev.filter(p => p.id !== id))
  }

  const addModel = (providerId: string) => {
    if (!newModel.trim()) {
      alert('Please provide model name')
      return
    }

    setProviders(prev => prev.map(p => 
      p.id === providerId 
        ? { ...p, models: [...new Set([...p.models, newModel])].sort() }
        : p
    ))
    // Also reflect in the shared models store immediately
    const current = providers.find(p => p.id === providerId)
    if (current) setModels(current.id as ProviderId, [...new Set([...current.models, newModel])].sort())
    setNewModel('')
  }

  const removeModel = (providerId: string, model: string) => {
    setProviders(prev => prev.map(p => 
      p.id === providerId 
        ? { ...p, models: p.models.filter(m => m !== model) }
        : p
    ))
    const current = providers.find(p => p.id === providerId)
    if (current) setModels(current.id as ProviderId, current.models.filter(m => m !== model))
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
    // wipe known secrets
    secrets.delete('ai.key.openai')
    secrets.delete('ai.key.anthropic')
    providers.forEach(p => secrets.delete(`ai.key.${p.id}`))
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
          <div style={{ border: '1px solid var(--vscode-input-border)', borderRadius: 8, padding: 16, marginBottom: '1rem' }}>
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
            <div key={provider.id} style={{ border: '1px solid var(--vscode-input-border)', borderRadius: 8 }}>
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button className="provider-header" onClick={() => toggleProvider(provider.id)} aria-expanded={provider.isExpanded} aria-controls={`prov-${provider.id}`} style={{ fontSize: 18, lineHeight: '1', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    {provider.isExpanded ? '▼' : '▶'}
                  </button>
                  <strong>{provider.name}</strong>
                  <small style={{ color: 'var(--vscode-muted-foreground)' }}>({provider.id})</small>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={() => removeProvider(provider.id)}>Remove</button>
                  {/* Discover models only wired for OpenAI for now */}
                  {provider.id === 'openai' && (
                    <button
                      onClick={async () => {
                        try {
                          const { listModels } = await import('../lib/ai/client')
                          const resp = await listModels({ provider: 'openai', apiKey: provider.apiKey })
                          const ids = (resp.models || []).map(m => m.id).sort()
                          // Save to shared store and local provider state
                          setModels('openai', ids)
                          setProviders(prev => prev.map(p => p.id === provider.id ? { ...p, models: ids } : p))
                          alert(`Discovered ${ids.length} models for OpenAI`)
                        } catch (e: any) {
                          alert(`Failed to discover models: ${e?.message || String(e)}`)
                        }
                      }}
                    >Discover models</button>
                  )}
                </div>
              </div>
              {provider.isExpanded && (
                <div id={`prov-${provider.id}`} style={{ padding: '0 12px 12px 12px', borderTop: '1px solid var(--vscode-input-border)', display: 'grid', gap: 12 }}>
                  <div style={{ display: 'grid', gap: 6, maxWidth: 500 }}>
                    <label htmlFor={`key-${provider.id}`}>API Key</label>
                    <input id={`key-${provider.id}`} type="password" value={provider.apiKey} onChange={e => updateProviderKey(provider.id, e.target.value)} placeholder="Set your API key" />
                  </div>
                  <div>
                    <h4>Models</h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '8px',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      padding: '8px',
                      border: '1px solid var(--vscode-input-border)',
                      borderRadius: '4px',
                    }}>
                      {(provider.models || []).map(model => (
                        <div key={model} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--vscode-input-background)',
                          border: '1px solid var(--vscode-input-border)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                        }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '8px' }}>
                            {model}
                          </span>
                          <button onClick={() => removeModel(provider.id, model)} style={{ background: 'transparent', border: 'none', color: 'var(--vscode-foreground)', cursor: 'pointer', padding: '0 4px' }}>&times;</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                    <input type="text" placeholder="Add model id (e.g., gpt-4o-mini)" value={newModel} onChange={e => setNewModel(e.target.value)} style={{ minWidth: 260 }} />
                    <button onClick={() => addModel(provider.id)}>Add Model</button>
                  </div>
                </div>
              )}
            </div>
          ))}
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
              <div key={id} style={{ border: '1px solid var(--vscode-input-border)', borderRadius: 8 }}>
                <button
                  type="button"
                  className="process-binding-header"
                  onClick={() => toggleBinding(id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'transparent', border: 'none', borderBottom: open ? '1px solid var(--vscode-input-border)' : 'none',
                    color: 'var(--vscode-foreground)'
                  }}
                  aria-expanded={open}
                  aria-controls={`pb-${id}`}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: 'bold',
                      minWidth: '16px',
                      display: 'inline-block',
                      color: '#1E1E1E'
                    }}>
                      {open ? '▼' : '▶'}
                    </span>
                    <strong style={{ 
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1E1E1E'
                    }}>
                      {label}
                    </strong>
                  </span>
                  <span className={`status-text ${b ? 'custom' : 'global'}`}>
                    {b ? 'Custom' : 'Using global'}
                  </span>
                </button>
                {open && (
                  <div id={`pb-${id}`} style={{ padding: 12, borderTop: '1px solid var(--vscode-input-border)' }}>
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
        <button onClick={clearAll} style={{ background: 'var(--vscode-errorForeground)', color: 'white' }}>
          Clear All AI Settings
        </button>
        <div style={{ marginTop: 8 }}>
          <small className="help">Tip: For production, prefer a serverless proxy so keys are never stored in the browser.</small>
        </div>
      </section>
    </main>
  )
}

// Component for managing a single process binding
function ProcessBindingCard({ proc, label, onChange }: { proc: ProcessId, label: string, onChange: () => void }) {
  const [provider, setProvider] = useState<ProviderId>(() => resolveConfig(proc).provider)
  const [model, setModel] = useState<string>(() => resolveConfig(proc).model)
  const [prompt, setLocalPrompt] = useState<string>(() => resolveConfig(proc).prompt)
  const models = useModels(provider)

  useEffect(() => {
    // When provider changes, if current model isn't in the new list, reset it.
    if (!models.includes(model)) {
      setModel(models[0] || '')
    }
  }, [provider, models, model])

  const handleProviderChange = (newProvider: ProviderId) => {
    setProvider(newProvider)
  }

  const saveBinding = () => {
    // A specific binding is being set for this process
    setBinding(proc, { provider, model, prompt })
    // The prompt is part of the binding, so we don't need a separate setPrompt call for the process
    onChange()
    alert(`Binding for '${label}' saved.`)
  }

  const resetBinding = () => {
    // Clear the specific binding for this process
    setBinding(proc, undefined)

    // Reflect the reset to global defaults immediately in the UI
    const globals = resolveConfig(proc)
    setProvider(globals.provider)
    setModel(globals.model)
    setLocalPrompt(globals.prompt)
    onChange()
    alert(`Binding for '${label}' reset to global default.`)
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label>Provider</label>
          <select value={provider} onChange={e => handleProviderChange(e.target.value as ProviderId)}>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            {/* Add other providers as they become available */}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Model</label>
          <select value={model} onChange={e => setModel(e.target.value)} disabled={!models.length}>
            {models.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label>System Prompt (overrides default)</label>
        <textarea 
          value={prompt} 
          onChange={e => setLocalPrompt(e.target.value)} 
          rows={3} 
          placeholder={`e.g., You are a helpful assistant specializing in ${label}.`}
        />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={saveBinding}>Save Binding</button>
        <button onClick={resetBinding}>Reset to Global</button>
      </div>
    </div>
  )
}
