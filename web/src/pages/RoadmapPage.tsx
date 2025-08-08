import { useEffect, useMemo, useState } from 'react'

export type RoadmapItem = {
  id: string
  title: string
  area: string
  status: 'Planned' | 'Rolling out' | 'Launched' | 'In development'
  due: string // ISO date
  link?: string
}

// View model used after filtering/mapping where `due` becomes a Date and we add flags
type RoadmapVM = RoadmapItem & { due: Date; dueThisOrPrev?: boolean; dueSoon?: boolean }

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
  const [selected, setSelected] = useState<RoadmapVM | null>(null)
  const [notifyMonths, setNotifyMonths] = useState<number>(() => {
    const v = Number(localStorage.getItem('mm.notifyWindowMonths') ?? '1')
    return Number.isFinite(v) && v >= 0 ? v : 1
  })

  useEffect(() => { localStorage.setItem('mm.notifyWindowMonths', String(notifyMonths)) }, [notifyMonths])

  useEffect(() => {
    let active = true

    const CACHE_KEY = 'mm.roadmap.cache.v1'
    const CACHE_AT_KEY = 'mm.roadmap.cacheAt'
    const TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

    const applyData = (data: RoadmapItem[]) => {
      if (!active) return
      setItems(data)
      // Preserve selection only if the item still exists; keep the VM instance
      if (selected && !data.some(d => d.id === selected.id)) setSelected(null)
    }

    const load = async () => {
      try {
        const res = await fetch('/roadmap.example.json', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json() as RoadmapItem[]
        localStorage.setItem(CACHE_KEY, JSON.stringify(data))
        localStorage.setItem(CACHE_AT_KEY, String(Date.now()))
        applyData(data)
      } catch (e) {
        // Use cache or fallback samples
        const raw = localStorage.getItem(CACHE_KEY)
        if (raw) {
          try { applyData(JSON.parse(raw)) } catch {}
        }
        if (active && !raw) {
          setError('Using embedded examples (failed to load roadmap).')
          applyData([
            { id: 'rm1', title: 'Power Fx improvements', area: 'Power Apps', status: 'In development', due: new Date().toISOString(), link: 'https://roadmap.microsoft.com' },
            { id: 'rm2', title: 'Dataverse performance', area: 'Dataverse', status: 'Planned', due: new Date(new Date().setMonth(new Date().getMonth()+1)).toISOString() }
          ])
        }
      }
    }

    // Serve cached first if fresh, then background refresh
    const cached = localStorage.getItem(CACHE_KEY)
    const cachedAt = Number(localStorage.getItem(CACHE_AT_KEY) || '0')
    if (cached) {
      try {
        const data = JSON.parse(cached) as RoadmapItem[]
        applyData(data)
      } catch {}
    }
    if (!cached || Date.now() - cachedAt > TTL_MS) {
      load()
    }

    // Periodic refresh every 30 minutes
    const interval = window.setInterval(load, 30 * 60 * 1000)
    // Refresh on tab focus
    const onFocus = () => load()
    window.addEventListener('visibilitychange', onFocus)

    return () => {
      active = false
      window.clearInterval(interval)
      window.removeEventListener('visibilitychange', onFocus)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'minmax(0,1fr) 220px 220px', alignItems: 'end' }}>
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
      <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem', gridTemplateColumns: 'minmax(0,1fr)', maxWidth: '100%' }}>
        {filtered.map(i => (
          <article key={i.id} style={{ border: '1px solid #2f2f2f', borderRadius: 8, padding: '0.75rem 1rem', maxWidth: '100%' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                <h3 style={{ margin: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{i.title}</h3>
                <small className="help">{i.area} • {i.status} • Due {i.due.toLocaleDateString()}</small>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {i.dueThisOrPrev && <span style={{ color: '#ff6b6b' }}>Due now/recent</span>}
                {i.dueSoon && <span style={{ color: '#ffb703' }}>Due soon</span>}
                <button onClick={() => setSelected(i as RoadmapVM)}>View</button>
                {i.link && <a className="nav__item" href={i.link} target="_blank" rel="noreferrer">Open</a>}
              </div>
            </header>
          </article>
        ))}
        {filtered.length === 0 && <p>No roadmap items match your filters.</p>}
      </div>
      {selected && (
        <section aria-live="polite" style={{ marginTop: '1rem', border: '1px solid #2f2f2f', borderRadius: 8, padding: '0.75rem 1rem', maxWidth: '100%' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0 }}>{selected.title}</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              {selected.link && <a className="nav__item" href={selected.link} target="_blank" rel="noreferrer">Open</a>}
              <button onClick={() => setSelected(null)}>Close</button>
            </div>
          </header>
          <p style={{ opacity: 0.85, marginTop: 6 }}>Area: <strong>{selected.area}</strong></p>
          <p style={{ opacity: 0.85 }}>Status: <strong>{selected.status}</strong></p>
          <p style={{ opacity: 0.85 }}>Due: <strong>{new Date(selected.due).toLocaleDateString()}</strong></p>
          {!selected.link && <small className="help">No external link provided.</small>}
        </section>
      )}
      <small className="help">Auto-refresh every 30 minutes (with 6h cache). Select an item to view details.</small>
    </main>
  )
}
