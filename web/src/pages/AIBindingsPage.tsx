import { useEffect, useMemo, useState } from 'react'
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

/*
  DEPRECATED: This page is obsolete and is no longer routed.
  AI process bindings are now managed within the consolidated
  `AIProvidersPage` at `/settings/ai/providers`.
  Safe to delete this file after verifying no imports.
*/
function useModels(provider: ProviderId) {
  const [models, setModels] = useState<string[]>(() => getModels(provider))
  useEffect(() => { setModels(getModels(provider)) }, [provider])
  return models
}

export default function AIBindingsPage() {
  const [bindingsVersion, setBindingsVersion] = useState(0) // trigger re-render after updates
  useMemo(() => getBindings(), [bindingsVersion])

  return (
    <main className="container">
      <h1>AI Process Bindings</h1>
      <p>Choose which provider/model and prompt each app process should use. If no custom binding is set, the process will use the global active provider/model and its system prompt.</p>

      <section style={{ display: 'grid', gap: '1rem', maxWidth: 900 }}>
        {ALL_PROCESSES.map(({ id, label }) => (
          <ProcessBindingCard key={id} proc={id} label={label} onChange={() => setBindingsVersion(v => v + 1)} />
        ))}
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
        <h2 style={{ fontSize: '1.05rem', margin: 0 }}>{label}</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={isCustom} onChange={e => setCustom(e.target.checked)} />
            <span>Custom binding</span>
          </label>
          {isCustom && (
            <button onClick={clearBinding}>Reset to global</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '0.5rem', marginTop: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
          <div>
            <label htmlFor={`${proc}-provider`}>Provider</label>
            <select id={`${proc}-provider`} value={provider} onChange={e => changeProvider(e.target.value as ProviderId)} disabled={!isCustom}>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
          <div>
            <label htmlFor={`${proc}-model`}>Model</label>
            <select id={`${proc}-model`} value={model} onChange={e => changeModel(e.target.value)} disabled={!isCustom}>
              <option value="">Select a model…</option>
              {models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <details>
          <summary>System prompt</summary>
          <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={useOverride} onChange={e => { setUseOverride(e.target.checked); if (isCustom) { const prev = getBindings()[proc]; if (prev) { setBinding(proc, { ...prev, promptOverride: e.target.checked ? (overrideText || defaultPrompt) : undefined }); onChange(); } } }} disabled={!isCustom} />
                <span>Use a prompt override for this process</span>
              </label>
            </div>

            <label htmlFor={`${proc}-prompt`}>Prompt text</label>
            <textarea
              id={`${proc}-prompt`}
              rows={8}
              value={useOverride ? overrideText : defaultPrompt}
              onChange={e => {
                setOverrideText(e.target.value)
                if (isCustom) { const prev = getBindings()[proc]; if (prev) { setBinding(proc, { ...prev, promptOverride: e.target.value }); onChange(); } }
              }}
              placeholder="You are an assistant that…"
              disabled={!isCustom}
            />

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => { setOverrideText(defaultPrompt); if (isCustom) { const prev = getBindings()[proc]; if (prev) { setBinding(proc, { ...prev, promptOverride: defaultPrompt }); onChange(); } } }} disabled={!isCustom}>Revert to default</button>
              <button onClick={saveDefaultPrompt} disabled={!model}>Save as provider+model default</button>
            </div>
            <small className="help">Default prompt key: mm.ai.prompt.{`{provider}`}.{`{model}`}. Overrides are stored within the binding.</small>
          </div>
        </details>
      </div>
    </div>
  )
}
