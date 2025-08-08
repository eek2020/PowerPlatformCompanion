import { useEffect, useMemo, useState } from 'react'

export type TShirt = 'XS' | 'S' | 'M' | 'L' | 'XL'

export type PlanItem = {
  id: string
  category: 'Power Platform' | 'Azure' | 'Other'
  component: string
  size: TShirt
  qty: number
  notes?: string
}

const DEFAULTS: PlanItem[] = [
  { id: 'pp-app-simple', category: 'Power Platform', component: 'Power App (simple)', size: 'S', qty: 1 },
  { id: 'pp-flow-simple', category: 'Power Platform', component: 'Power Automate Flow (simple)', size: 'S', qty: 1 },
  { id: 'pp-flow-complex', category: 'Power Platform', component: 'Power Automate Flow (complex)', size: 'L', qty: 0 },
  { id: 'pp-dataverse-tables', category: 'Power Platform', component: 'Dataverse tables', size: 'M', qty: 0, notes: 'Number of tables' },
  { id: 'az-keyvault', category: 'Azure', component: 'Azure Key Vault', size: 'M', qty: 0 },
  { id: 'az-functions', category: 'Azure', component: 'Azure Functions', size: 'M', qty: 0 },
]

const STORAGE_KEY = 'mm.planning.v1'

export default function PlanningPage() {
  const [items, setItems] = useState<PlanItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as PlanItem[]
    } catch {}
    return DEFAULTS
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const sizes: TShirt[] = ['XS', 'S', 'M', 'L', 'XL']

  const addCustom = () => {
    const id = `custom-${Date.now()}`
    setItems(prev => [...prev, { id, category: 'Other', component: 'Custom item', size: 'M', qty: 1 }])
  }

  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const update = (id: string, patch: Partial<PlanItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))
  }

  const csv = useMemo(() => {
    const header = ['Category', 'Component', 'T-Shirt', 'Qty', 'Notes']
    const rows = items.map(i => [i.category, i.component, i.size, String(i.qty), i.notes ?? ''])
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
                  <select value={i.category} onChange={e => update(i.id, { category: e.target.value as PlanItem['category'] })}>
                    <option>Power Platform</option>
                    <option>Azure</option>
                    <option>Other</option>
                  </select>
                </td>
                <td style={{ padding: '0.25rem 0' }}>
                  <input value={i.component} onChange={e => update(i.id, { component: e.target.value })} style={{ width: '100%' }} />
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
