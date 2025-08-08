import { useEffect, useMemo, useState } from 'react'

export type RoadmapItem = {
  id: string
  title: string
  area: string
  status: 'Planned' | 'Rolling out' | 'Launched' | 'In development'
  due: string // ISO date
  link?: string
}

function monthsBetween(a: Date, b: Date) {
  const years = b.getFullYear() - a.getFullYear()
  const months = b.getMonth() - a.getMonth()
  return years * 12 + months
}

export default function RoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[] | null>(null)
  const [q, setQ] = useState('')
  const [area, setArea] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notifyMonths, setNotifyMonths] = useState<number>(() => {
    const v = Number(localStorage.getItem('mm.notifyWindowMonths') ?? '1')
    return Number.isFinite(v) && v >= 0 ? v : 1
  })

  useEffect(() => { localStorage.setItem('mm.notifyWindowMonths', String(notifyMonths)) }, [notifyMonths])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch('/roadmap.example.json', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json() as RoadmapItem[]
        if (active) setItems(data)
      } catch (e) {
        if (active) {
          setError('Using embedded examples (failed to load roadmap).')
          setItems([
            { id: 'rm1', title: 'Power Fx improvements', area: 'Power Apps', status: 'In development', due: new Date().toISOString(), link: 'https://roadmap.microsoft.com' },
            { id: 'rm2', title: 'Dataverse performance', area: 'Dataverse', status: 'Planned', due: new Date(new Date().setMonth(new Date().getMonth()+1)).toISOString() }
          ])
        }
      }
    }
    load()
    return () => { active = false }
  }, [])

  const now = new Date()
  const filtered = useMemo(() => {
    const list = (items ?? []).filter(i => !area || i.area === area)
    const ql = q.trim().toLowerCase()
    const searched = !ql ? list : list.filter(i =>
      i.title.toLowerCase().includes(ql) || i.area.toLowerCase().includes(ql) || (i.status ?? '').toLowerCase().includes(ql)
    )
    return searched.map(i => {
      const due = new Date(i.due)
      const delta = monthsBetween(now, due)
      const dueThisOrPrev = delta <= 0 && delta >= -notifyMonths
      const dueSoon = delta > 0 && delta <= notifyMonths
      return { ...i, due, dueThisOrPrev, dueSoon }
    })
  }, [items, q, area, notifyMonths])

  const areas = useMemo(() => Array.from(new Set((items ?? []).map(i => i.area))), [items])

  return (
    <main className="container">
      <h1>Power Platform Roadmap</h1>
      {error && <p style={{ color: '#ffb703' }}>{error}</p>}
      <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: '1fr 220px 220px', alignItems: 'end' }}>
        <div>
          <label htmlFor="rm-q">Search</label>
          <input id="rm-q" type="search" placeholder="Filter by title, area, status" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div>
          <label htmlFor="rm-area">Area</label>
          <select id="rm-area" value={area} onChange={e => setArea(e.target.value)}>
            <option value="">All</option>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="rm-window">Notify window (months)</label>
          <input id="rm-window" type="number" min={0} max={12} value={notifyMonths} onChange={e => setNotifyMonths(Number(e.target.value))} />
        </div>
      </div>
      <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
        {filtered.map(i => (
          <article key={i.id} style={{ border: '1px solid #2f2f2f', borderRadius: 8, padding: '0.75rem 1rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>{i.title}</h3>
                <small className="help">{i.area} • {i.status} • Due {i.due.toLocaleDateString()}</small>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {i.dueThisOrPrev && <span style={{ color: '#ff6b6b' }}>Due now/recent</span>}
                {i.dueSoon && <span style={{ color: '#ffb703' }}>Due soon</span>}
                {i.link && <a className="nav__item" href={i.link} target="_blank" rel="noreferrer">Open</a>}
              </div>
            </header>
          </article>
        ))}
        {filtered.length === 0 && <p>No roadmap items match your filters.</p>}
      </div>
      <small className="help">Planned: live fetch from official roadmap & notifications.</small>
    </main>
  )
}
