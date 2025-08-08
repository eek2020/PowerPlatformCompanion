import { useEffect, useMemo, useState } from 'react'
import { snippetsMock, type Snippet } from '../data/snippetsMock'
import { isSnippetArray } from '../utils/validators'

export default function SnippetsPage() {
  const [query, setQuery] = useState('')
  const [snippets, setSnippets] = useState<Snippet[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [platform, setPlatform] = useState<'all' | 'automate' | 'apps'>(() => (localStorage.getItem('mm.snippets.platform') as any) || 'all')

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch('/snippets.example.json', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!isSnippetArray(data)) {
          throw new Error('Invalid schema for snippets JSON')
        }
        if (active) setSnippets(data as Snippet[])
      } catch (e: any) {
        // Fallback to embedded mock
        if (active) {
          setError('Using embedded examples (failed to load or validate public JSON).')
          setSnippets(snippetsMock)
        }
      }
    }
    load()
    return () => { active = false }
  }, [])

  const platformOf = (sn: Snippet): 'automate' | 'apps' | 'unknown' => {
    const tags = (sn.tags || []).map(t => t.toLowerCase())
    const isAutomate = tags.some(t => t.includes('automate') || t.includes('flow'))
    const isApps = tags.some(t => t.includes('power apps') || t.includes('canvas') || t.includes('power fx'))
    if (isAutomate && !isApps) return 'automate'
    if (isApps && !isAutomate) return 'apps'
    if (isAutomate && isApps) return 'apps' // prefer Apps if both; most Fx is for Apps
    return 'unknown'
  }

  useEffect(() => { localStorage.setItem('mm.snippets.platform', platform) }, [platform])

  const filtered: Snippet[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    const source = snippets ?? snippetsMock
    const textFiltered = q
      ? source.filter(s =>
          s.title.toLowerCase().includes(q) ||
          s.tags.some(t => t.toLowerCase().includes(q)) ||
          s.code.toLowerCase().includes(q)
        )
      : source
    if (platform === 'all') return textFiltered
    return textFiltered.filter(s => platformOf(s) === platform)
  }, [query, snippets, platform])

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // eslint-disable-next-line no-alert
      alert('Copied to clipboard')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <main className="container">
      <h1>Power Fx Snippets</h1>
      {error && <p style={{ color: '#ffb703' }}>{error}</p>}
      {!snippets && <p>Loading examples…</p>}
      <label htmlFor="snip-search">Search</label>
      <input id="snip-search" type="search" placeholder="Filter by title, tag, or code…" value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', margin: '0.5rem 0 1rem' }}>
        <button aria-pressed={platform==='all'} onClick={() => setPlatform('all')} style={{ display: 'flex', alignItems: 'center', gap: 6, border: platform==='all' ? '2px solid #5aa0ff' : '1px solid #2b3a66', borderRadius: 8, padding: '4px 8px', background: 'transparent' }}>All</button>
        <button aria-label="Filter: Power Automate" aria-pressed={platform==='automate'} onClick={() => setPlatform('automate')} style={{ display: 'flex', alignItems: 'center', gap: 6, border: platform==='automate' ? '2px solid #5aa0ff' : '1px solid #2b3a66', borderRadius: 8, padding: '4px 8px', background: 'transparent' }}>
          <span dangerouslySetInnerHTML={{ __html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e9efff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 7l6 5-6 5V7z"/><path d="M10 7h6l-6 5 6 5h-6l-6-5 6-5z" fill="none" /></svg>' }} />
          <small className="help">Power Automate</small>
        </button>
        <button aria-label="Filter: Power Apps" aria-pressed={platform==='apps'} onClick={() => setPlatform('apps')} style={{ display: 'flex', alignItems: 'center', gap: 6, border: platform==='apps' ? '2px solid #5aa0ff' : '1px solid #2b3a66', borderRadius: 8, padding: '4px 8px', background: 'transparent' }}>
          <span dangerouslySetInnerHTML={{ __html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e9efff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polygon points="12 3 21 12 12 21 3 12 12 3" fill="none"/><polygon points="12 6.5 17.5 12 12 17.5 6.5 12 12 6.5" /></svg>' }} />
          <small className="help">Power Apps</small>
        </button>
      </div>
      <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem', maxWidth: '100%' }}>
        {filtered.map(sn => (
          <article key={sn.id} style={{ border: '1px solid #2f2f2f', borderRadius: 8, padding: '0.75rem 1rem', maxWidth: '100%' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                <h3 style={{ margin: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{sn.title}</h3>
                <small className="help">{sn.tags.join(' • ')}</small>
                <div style={{ marginTop: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
                  {(() => {
                    const p = platformOf(sn)
                    return (
                      <>
                        {p === 'automate' && (
                          <span title="Power Automate" dangerouslySetInnerHTML={{ __html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e9efff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 7l6 5-6 5V7z"/><path d="M10 7h6l-6 5 6 5h-6l-6-5 6-5z" fill="none" /></svg>' }} />
                        )}
                        {p === 'apps' && (
                          <span title="Power Apps" dangerouslySetInnerHTML={{ __html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e9efff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polygon points="12 3 21 12 12 21 3 12 12 3" fill="none"/><polygon points="12 6.5 17.5 12 12 17.5 6.5 12 12 6.5" /></svg>' }} />
                        )}
                        {p === 'unknown' && <small className="help">Platform: Unknown</small>}
                      </>
                    )
                  })()}
                </div>
                {(sn.source || sn.tested !== undefined) && (
                  <div>
                    <small className="help">
                      {sn.source ? `Source: ${sn.source}` : ''}
                      {sn.source && sn.tested !== undefined ? ' • ' : ''}
                      {sn.tested !== undefined ? `Tested: ${sn.tested ? 'Yes' : 'No'}` : ''}
                    </small>
                  </div>
                )}
              </div>
              <button style={{ flex: '0 0 auto' }} onClick={() => copy(sn.code)}>Copy</button>
            </header>
            <pre style={{ overflowX: 'auto', maxWidth: '100%' }}><code style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{sn.code}</code></pre>
            {sn.explanation && <p style={{ opacity: 0.85 }}>{sn.explanation}</p>}
          </article>
        ))}
        {filtered.length === 0 && <p>No snippets match your search.</p>}
      </div>
    </main>
  )
}
