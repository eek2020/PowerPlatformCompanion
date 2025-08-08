import { useEffect, useMemo, useState } from 'react'

export type TShirt = 'XS' | 'S' | 'M' | 'L' | 'XL'
export type Complexity = 'Simple' | 'Moderate' | 'Complex'

export type PlanItem = {
  id: string
  category: 'Power Platform' | 'Azure' | 'Other'
  component: string
  complexity: Complexity
  size: TShirt
  // qty and notes removed per new design
}

const DEFAULTS: PlanItem[] = [
  { id: 'pp-app', category: 'Power Platform', component: 'Power Apps', complexity: 'Simple', size: 'S' },
  { id: 'pp-flow', category: 'Power Platform', component: 'Power Automate', complexity: 'Simple', size: 'S' },
  { id: 'pp-dataverse', category: 'Power Platform', component: 'Dataverse', complexity: 'Moderate', size: 'M' },
  { id: 'az-keyvault', category: 'Azure', component: 'Key Vault', complexity: 'Moderate', size: 'M' },
  { id: 'az-functions', category: 'Azure', component: 'Functions', complexity: 'Moderate', size: 'M' },
]

type ComponentsConfig = {
  'Power Platform': string[]
  Azure: string[]
}

const DEFAULT_COMPONENTS: ComponentsConfig = {
  'Power Platform': ['Power Apps', 'Power Automate', 'Power BI', 'Power Pages', 'Dataverse'],
  Azure: ['Functions', 'Key Vault', 'App Service', 'Storage Account', 'Service Bus']
}

const COMPONENTS_KEY = 'mm.planning.components.v1'

const STORAGE_KEY = 'mm.planning.v1'
const SIZE_HOURS_KEY = 'mm.planning.sizeHours.v1'

export default function PlanningPage() {
  const [items, setItems] = useState<PlanItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as any[]
        return parsed.map(p => ({
          id: p.id!,
          category: (p.category as PlanItem['category']) ?? 'Power Platform',
          component: p.component ?? 'Power Apps',
          complexity: (p as any).complexity ?? 'Simple',
          size: (p.size as TShirt) ?? 'M',
          // drop qty/notes from older data
        }))
      }
    } catch {}
    return DEFAULTS
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const sizes: TShirt[] = ['XS', 'S', 'M', 'L', 'XL']
  const complexities: Complexity[] = ['Simple', 'Moderate', 'Complex']

  const componentsConfig: ComponentsConfig = useMemo(() => {
    try {
      const raw = localStorage.getItem(COMPONENTS_KEY)
      if (raw) return { ...DEFAULT_COMPONENTS, ...JSON.parse(raw) }
    } catch {}
    return DEFAULT_COMPONENTS
  }, [])

  // Hours per T-shirt size (configurable in Settings)
  type SizeHours = Record<TShirt, number>
  const DEFAULT_SIZE_HOURS: SizeHours = { XS: 2, S: 8, M: 24, L: 56, XL: 120 }
  const [sizeHours, setSizeHours] = useState<SizeHours>(() => {
    try {
      const raw = localStorage.getItem(SIZE_HOURS_KEY)
      if (raw) return { ...DEFAULT_SIZE_HOURS, ...JSON.parse(raw) }
    } catch {}
    return DEFAULT_SIZE_HOURS
  })
  useEffect(() => {
    const onStorage = () => {
      try {
        const raw = localStorage.getItem(SIZE_HOURS_KEY)
        if (raw) setSizeHours({ ...DEFAULT_SIZE_HOURS, ...JSON.parse(raw) })
      } catch {}
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addCustom = () => {
    const id = `custom-${Date.now()}`
    setItems(prev => [...prev, { id, category: 'Power Platform', component: componentsConfig['Power Platform'][0] ?? 'Power Apps', complexity: 'Simple', size: 'M' }])
  }

  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const update = (id: string, patch: Partial<PlanItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))
  }

  const csv = useMemo(() => {
    const header = ['Category', 'Component', 'Complexity', 'T-Shirt', 'EstHours']
    const rows = items.map(i => [i.category, i.component, i.complexity, i.size, String(sizeHours[i.size] ?? 0)])
    const escape = (v: string) => /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v
    return [header, ...rows].map(r => r.map(escape).join(',')).join('\n')
  }, [items, sizeHours])

  const downloadCSV = () => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'planning.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalHours = useMemo(() => items.reduce((sum, i) => sum + (sizeHours[i.size] ?? 0), 0), [items, sizeHours])


  // Guidance modal
  const [guideId, setGuideId] = useState<string | null>(null)
  const guideText = (i: PlanItem) => {
    if (i.category === 'Power Platform' && i.component === 'Power Apps') return 'Power Apps: ~3 basic screens = Simple; 4–8 screens with forms = Moderate; >8 screens with complex logic = Complex.'
    if (i.category === 'Power Platform' && i.component === 'Power Automate') return 'Power Automate: 1–3 actions = Simple; 4–10 actions with conditions = Moderate; >10 actions/connectors/orchestration = Complex.'
    if (i.category === 'Power Platform' && i.component === 'Dataverse') return 'Dataverse: 1–3 tables = Simple; 4–8 with relationships = Moderate; >8 tables with complex security = Complex.'
    if (i.category === 'Azure' && i.component === 'Functions') return 'Azure Functions: 1 function = Simple; 2–5 functions with bindings = Moderate; >5 functions/multiple triggers = Complex.'
    if (i.category === 'Azure' && i.component === 'Key Vault') return 'Key Vault: 1 vault/few secrets = Simple; multiple apps/secrets = Moderate; HA/multi‑region & rotation = Complex.'
    return 'Select a component to view guidance.'
  }

  return (
    <main className="container">
      <h1>Planning</h1>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={addCustom}>Add custom item</button>
        <button onClick={downloadCSV}>Export CSV</button>
        <small className="help">Data is saved locally to your browser.</small>
      </div>

      <section style={{ marginTop: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #2f2f2f' }}>Category</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #2f2f2f', minWidth: 260 }}>Component</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #2f2f2f' }}>Complexity</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #2f2f2f' }}>T-Shirt</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #2f2f2f' }}>Est. time</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #2f2f2f' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id}>
                <td style={{ padding: '0.25rem 0' }}>
                  <select
                    value={i.category}
                    onChange={e => {
                      const newCat = e.target.value as PlanItem['category']
                      if (newCat === 'Power Platform') {
                        update(i.id, { category: newCat, component: componentsConfig['Power Platform'][0] ?? 'Power Apps' })
                      } else if (newCat === 'Azure') {
                        update(i.id, { category: newCat, component: componentsConfig.Azure[0] ?? 'Functions' })
                      } else {
                        update(i.id, { category: newCat, component: 'Custom item' })
                      }
                    }}>
                    <option>Power Platform</option>
                    <option>Azure</option>
                    <option>Other</option>
                  </select>
                </td>
                <td style={{ padding: '0.25rem 0' }}>
                  {/* Cascading component options based on selected category */}
                  {i.category === 'Power Platform' && (
                    <select value={i.component} onChange={e => update(i.id, { component: e.target.value })} style={{ minWidth: 260 }}>
                      {componentsConfig['Power Platform'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  )}
                  {i.category === 'Azure' && (
                    <select value={i.component} onChange={e => update(i.id, { component: e.target.value })} style={{ minWidth: 260 }}>
                      {componentsConfig.Azure.map(c => <option key={c}>{c}</option>)}
                    </select>
                  )}
                  {i.category === 'Other' && (
                    <input value={i.component} onChange={e => update(i.id, { component: e.target.value })} style={{ width: '100%' }} placeholder="Component" />
                  )}
                </td>
                <td style={{ padding: '0.25rem 0', minWidth: 180 }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    {/* reserve space so overlay icon doesn't overlap text */}
                    <div style={{ paddingRight: 28 }}>
                      <select value={i.complexity} onChange={e => update(i.id, { complexity: e.target.value as Complexity })}>
                        {complexities.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <button
                      title="Guidance"
                      aria-label="Guidance"
                      onClick={() => setGuideId(i.id)}
                      style={{ position: 'absolute', right: 6, top: 4, width: 18, height: 18, lineHeight: '18px', textAlign: 'center', border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', padding: 0 }}
                    >
                      ℹ️
                    </button>
                  </div>
                </td>
                <td style={{ padding: '0.25rem 0' }}>
                  <select value={i.size} onChange={e => update(i.id, { size: e.target.value as TShirt })}>
                    {sizes.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ padding: '0.25rem 0', textAlign: 'center', minWidth: 90 }}>
                  <span>{sizeHours[i.size] ?? 0} h</span>
                </td>
                <td style={{ padding: '0.25rem 0' }}>
                  <button onClick={() => remove(i.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>Total time</h2>
        <p><strong>{totalHours} h</strong> estimated to deliver.</p>
      </section>

      {guideId && (() => {
        const item = items.find(x => x.id === guideId)
        if (!item) return null
        return (
          <div role="dialog" aria-modal="true" onClick={() => setGuideId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'var(--color-bg, #111)', color: 'inherit', padding: '1rem', borderRadius: 8, maxWidth: 520 }}>
              <h3 style={{ marginTop: 0 }}>Guidance</h3>
              <p style={{ lineHeight: 1.5 }}>{guideText(item)}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button onClick={() => setGuideId(null)}>Close</button>
              </div>
            </div>
          </div>
        )
      })()}
    </main>
  )
}
