import { useEffect, useMemo, useState } from 'react'

type Resource = {
  id: string
  title: string
  url: string
  type: 'youtube' | 'blog'
  channel?: string
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[] | null>(null)
  const [q, setQ] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch('/resources.example.json', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json() as Resource[]
        if (active) setResources(data)
      } catch (e) {
        if (active) {
          setError('Using embedded examples (failed to load resources).')
          setResources([
            { id: 'r1', title: 'Microsoft Power Platform YouTube', url: 'https://www.youtube.com/@MicrosoftPowerPlatform', type: 'youtube', channel: 'Official' },
            { id: 'r2', title: 'Reza Dorrani', url: 'https://www.youtube.com/@rezadorrani', type: 'youtube' },
            { id: 'r3', title: 'I Am Architect (Luise Freese)', url: 'https://www.missfision.com/', type: 'blog' },
            { id: 'r4', title: 'Low Code Lewis', url: 'https://www.youtube.com/@LowCodeLewis', type: 'youtube' }
          ])
        }
      }
    }
    load()
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    const list = resources ?? []
    if (!query) return list
    return list.filter(r =>
      r.title.toLowerCase().includes(query) ||
      r.url.toLowerCase().includes(query) ||
      (r.channel ?? '').toLowerCase().includes(query)
    )
  }, [q, resources])

  return (
    <main className="container">
      <h1>Resources (YouTube & Blogs)</h1>
      {error && <p style={{ color: '#ffb703' }}>{error}</p>}
      <label htmlFor="res-search">Search resources</label>
      <input id="res-search" type="search" placeholder="Filter by title, channel, or URL" value={q} onChange={e => setQ(e.target.value)} />
      <p className="help">Planned: live discovery and recommendations based on your history.</p>
      <div style={{ marginTop: '1rem', display: 'grid', gap: '0.6rem' }}>
        {filtered.map(r => (
          <a key={r.id} className="nav__item" href={r.url} target="_blank" rel="noreferrer">
            <span className="nav__icon">{r.type === 'youtube' ? '▶️' : '✍️'}</span>
            <span className="nav__label">{r.title}{r.channel ? ` • ${r.channel}` : ''}</span>
          </a>
        ))}
        {filtered.length === 0 && <p>No resources match your search.</p>}
      </div>
    </main>
  )
}
