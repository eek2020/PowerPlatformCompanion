import { useEffect, useMemo, useState } from 'react'

export type RoadmapItem = {
  id: string
  title: string
  area: string
  status: 'Planned' | 'Rolling out' | 'Launched' | 'In development'
  due: string // ISO date
  link?: string
  description?: string
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
            { id: 'rm1', title: 'Power Fx improvements', area: 'Power Apps', status: 'In development', due: new Date().toISOString(), link: 'https://roadmap.microsoft.com', description: 'Enhancements to Power Fx functions, performance, and editor experience.' },
            { id: 'rm2', title: 'Dataverse performance', area: 'Dataverse', status: 'Planned', due: new Date(new Date().setMonth(new Date().getMonth()+1)).toISOString(), description: 'Query optimisations and improved concurrency for high-throughput apps.' }
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

  // Simple icon svgs
  const svgAutomate = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e9efff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 7l6 5-6 5V7z"/><path d="M10 7h6l-6 5 6 5h-6l-6-5 6-5z" fill="none" /></svg>'
  const svgApps = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e9efff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polygon points="12 3 21 12 12 21 3 12 12 3" fill="none"/><polygon points="12 6.5 17.5 12 12 17.5 6.5 12 12 6.5" /></svg>'
  const svgDataverse = '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#e9efff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8-8-3.582-8-8z"/><path d="M7 12a5 5 0 0010 0 5 5 0 00-10 0z"/></svg>'

  // Compute deep link: prefer provided `link`; otherwise fallback to search
  const computeLink = (it: { title: string; area: string; link?: string }) => {
    if (it.link && it.link.trim()) return it.link
    const q = encodeURIComponent(`${it.title} ${it.area}`)
    // Fallback search to Microsoft Roadmap filtered by query
    return `https://roadmap.microsoft.com/?search=${q}`
  }

  // Lightweight modal for details
  const RoadmapModal = ({ item, onClose }: { item: RoadmapVM; onClose: () => void }) => {
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }, [onClose])
    return (
      <div aria-hidden={false} role="dialog" aria-modal="true" aria-labelledby="rm-modal-title"
           onClick={(e) => { if (e.currentTarget === e.target) onClose() }}
           style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 999 }}>
        <div style={{ background: 'var(--mm-surface, #0e1a3a)', color: '#e9efff', lineHeight: 1.5, border: '1px solid #2f2f2f', borderRadius: 10, width: 'min(720px, 92vw)', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '0.9rem 1rem', borderBottom: '1px solid #2f2f2f' }}>
            <h2 id="rm-modal-title" style={{ margin: 0, color: '#fff' }}>{item.title}</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <a className="nav__item" href={computeLink(item)} target="_blank" rel="noreferrer">Open</a>
              <button onClick={onClose}>Close</button>
            </div>
          </header>
          <div style={{ padding: '0.9rem 1rem' }}>
            <p style={{ opacity: 0.85, margin: '0 0 6px' }}>Area: <strong>{item.area}</strong></p>
            <p style={{ opacity: 0.85, margin: '0 0 6px' }}>Status: <strong>{item.status}</strong></p>
            <p style={{ opacity: 0.85, margin: 0 }}>Due: <strong>{new Date(item.due).toLocaleDateString()}</strong></p>
            <hr style={{ borderColor: '#2f2f2f', margin: '0.9rem 0' }} />
            <p style={{ margin: 0, opacity: 0.95 }}>{item.description || 'No additional details provided.'}</p>
          </div>
        </div>
      </div>
    )
  }

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
      {/* Icon filters for common areas */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        <button aria-pressed={area===''} onClick={() => setArea('')} style={{ display: 'flex', alignItems: 'center', gap: 6, border: area==='' ? '2px solid #5aa0ff' : '1px solid #2b3a66', borderRadius: 8, padding: '4px 8px', background: 'transparent' }}>All</button>
        <button aria-label="Filter: Power Automate" aria-pressed={area==='Power Automate'} onClick={() => setArea('Power Automate')} style={{ display: 'flex', alignItems: 'center', gap: 6, border: area==='Power Automate' ? '2px solid #5aa0ff' : '1px solid #2b3a66', borderRadius: 8, padding: '4px 8px', background: 'transparent' }}>
          <span dangerouslySetInnerHTML={{ __html: svgAutomate }} />
          <small className="help">Power Automate</small>
        </button>
        <button aria-label="Filter: Power Apps" aria-pressed={area==='Power Apps'} onClick={() => setArea('Power Apps')} style={{ display: 'flex', alignItems: 'center', gap: 6, border: area==='Power Apps' ? '2px solid #5aa0ff' : '1px solid #2b3a66', borderRadius: 8, padding: '4px 8px', background: 'transparent' }}>
          <span dangerouslySetInnerHTML={{ __html: svgApps }} />
          <small className="help">Power Apps</small>
        </button>
        <button aria-label="Filter: Dataverse" aria-pressed={area==='Dataverse'} onClick={() => setArea('Dataverse')} style={{ display: 'flex', alignItems: 'center', gap: 6, border: area==='Dataverse' ? '2px solid #5aa0ff' : '1px solid #2b3a66', borderRadius: 8, padding: '4px 8px', background: 'transparent' }}>
          <span dangerouslySetInnerHTML={{ __html: svgDataverse }} />
          <small className="help">Dataverse</small>
        </button>
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
                <a className="nav__item" href={computeLink(i)} target="_blank" rel="noreferrer">Open</a>
              </div>
            </header>
          </article>
        ))}
        {filtered.length === 0 && <p>No roadmap items match your filters.</p>}
      </div>
      {selected && <RoadmapModal item={selected} onClose={() => setSelected(null)} />}
      <small className="help">Auto-refresh every 30 minutes (with 6h cache). Select an item to view details.</small>
    </main>
  )
}
