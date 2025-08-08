import { useEffect, useMemo, useState } from 'react'

export type TShirt = 'XS' | 'S' | 'M' | 'L' | 'XL'
export type Complexity = 'Simple' | 'Moderate' | 'Complex'

export type PlanItem = {
  id: string
  category: 'Power Platform' | 'Azure' | 'Other'
  component: string
  complexity: Complexity
  size: TShirt
  qty: number
  notes?: string
}

const DEFAULTS: PlanItem[] = [
  { id: 'pp-app', category: 'Power Platform', component: 'Power Apps', complexity: 'Simple', size: 'S', qty: 1 },
  { id: 'pp-flow', category: 'Power Platform', component: 'Power Automate', complexity: 'Simple', size: 'S', qty: 1 },
  { id: 'pp-dataverse', category: 'Power Platform', component: 'Dataverse', complexity: 'Moderate', size: 'M', qty: 0, notes: 'Tables count' },
  { id: 'az-keyvault', category: 'Azure', component: 'Key Vault', complexity: 'Moderate', size: 'M', qty: 0 },
  { id: 'az-functions', category: 'Azure', component: 'Functions', complexity: 'Moderate', size: 'M', qty: 0 },
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

export default function PlanningPage() {
  const [items, setItems] = useState<PlanItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PlanItem>[]
        return parsed.map(p => ({
          id: p.id!,
          category: (p.category as PlanItem['category']) ?? 'Power Platform',
          component: p.component ?? 'Power Apps',
          complexity: (p as any).complexity ?? 'Simple',
          size: (p.size as TShirt) ?? 'M',
          qty: typeof p.qty === 'number' ? p.qty : 1,
          notes: p.notes
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

  const addCustom = () => {
    const id = `custom-${Date.now()}`
    setItems(prev => [...prev, { id, category: 'Power Platform', component: componentsConfig['Power Platform'][0] ?? 'Power Apps', complexity: 'Simple', size: 'M', qty: 1 }])
  }

  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const update = (id: string, patch: Partial<PlanItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))
  }

  const csv = useMemo(() => {
    const header = ['Category', 'Component', 'Complexity', 'T-Shirt', 'Qty', 'Notes']
    const rows = items.map(i => [i.category, i.component, i.complexity, i.size, String(i.qty), i.notes ?? ''])
    const escape = (v: string) => /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v
    return [header, ...rows].map(r => r.map(escape).join(',')).join('\n')
  }, [items])

  const downloadCSV = () => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'planning.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const totals = useMemo(() => {
    const byKey = new Map<string, number>()
    for (const i of items) {
      const key = `${i.component}|${i.size}`
      byKey.set(key, (byKey.get(key) ?? 0) + (Number.isFinite(i.qty) ? i.qty : 0))
    }
    return Array.from(byKey.entries()).map(([k, qty]) => {
      const [component, size] = k.split('|')
      return { component, size, qty }
    })
  }, [items])

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
              <th style={{ textAlign: 'left', borderBottom: '1px solid #2f2f2f' }}>Component</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #2f2f2f' }}>Complexity</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #2f2f2f' }}>T-Shirt</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #2f2f2f' }}>Qty</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #2f2f2f' }}>Notes</th>
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
                    <select value={i.component} onChange={e => update(i.id, { component: e.target.value })}>
                      {componentsConfig['Power Platform'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  )}
                  {i.category === 'Azure' && (
                    <select value={i.component} onChange={e => update(i.id, { component: e.target.value })}>
                      {componentsConfig.Azure.map(c => <option key={c}>{c}</option>)}
                    </select>
                  )}
                  {i.category === 'Other' && (
                    <input value={i.component} onChange={e => update(i.id, { component: e.target.value })} style={{ width: '100%' }} placeholder="Component" />
                  )}
                </td>
                <td style={{ padding: '0.25rem 0', minWidth: 160 }}>
                  <select value={i.complexity} onChange={e => update(i.id, { complexity: e.target.value as Complexity })}>
                    {complexities.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <br />
                  <small className="help">
                    {i.category === 'Power Platform' && i.component === 'Power Apps' && 'Guide: ~3 basic screens = Simple; 4–8 screens with forms = Moderate; >8 screens, complex logic = Complex.'}
                    {i.category === 'Power Platform' && i.component === 'Power Automate' && 'Guide: 1–3 actions = Simple; 4–10 actions with conditions = Moderate; >10 actions/connectors/orchestration = Complex.'}
                    {i.category === 'Power Platform' && i.component === 'Dataverse' && 'Guide: 1–3 tables = Simple; 4–8 tables with relationships = Moderate; >8 tables, complex security = Complex.'}
                    {i.category === 'Azure' && i.component === 'Functions' && 'Guide: 1 function = Simple; 2–5 functions with bindings = Moderate; >5 functions, multiple triggers = Complex.'}
                    {i.category === 'Azure' && i.component === 'Key Vault' && 'Guide: 1 vault, few secrets = Simple; multiple apps/secrets = Moderate; HA/multi-region, rotation policies = Complex.'}
                  </small>
                </td>
                <td style={{ padding: '0.25rem 0' }}>
                  <select value={i.size} onChange={e => update(i.id, { size: e.target.value as TShirt })}>
                    {sizes.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ padding: '0.25rem 0' }}>
                  <input type="number" min={0} value={i.qty} onChange={e => update(i.id, { qty: Number(e.target.value) })} style={{ width: 100 }} />
                </td>
                <td style={{ padding: '0.25rem 0' }}>
                  <input value={i.notes ?? ''} onChange={e => update(i.id, { notes: e.target.value })} style={{ width: '100%' }} placeholder="Optional" />
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
        <h2 style={{ marginTop: 0 }}>Totals</h2>
        {totals.length === 0 && <p>No items yet.</p>}
        {totals.length > 0 && (
          <ul>
            {totals.map(t => (
              <li key={`${t.component}|${t.size}`}>{t.component} ({t.size}) × {t.qty}</li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
