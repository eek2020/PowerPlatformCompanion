import { useMemo, useState } from 'react'
import { snippetsMock, type Snippet } from '../data/snippetsMock'

export default function SnippetsPage() {
  const [query, setQuery] = useState('')

  const filtered: Snippet[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return snippetsMock
    return snippetsMock.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q)) ||
      s.code.toLowerCase().includes(q)
    )
  }, [query])

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
      <label htmlFor="snip-search">Search</label>
      <input id="snip-search" type="search" placeholder="Filter by title, tag, or code…" value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
        {filtered.map(sn => (
          <article key={sn.id} style={{ border: '1px solid #2f2f2f', borderRadius: 8, padding: '0.75rem 1rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>{sn.title}</h3>
                <small className="help">{sn.tags.join(' • ')}</small>
              </div>
              <button onClick={() => copy(sn.code)}>Copy</button>
            </header>
            <pre style={{ overflowX: 'auto' }}><code>{sn.code}</code></pre>
            {sn.explanation && <p style={{ opacity: 0.85 }}>{sn.explanation}</p>}
          </article>
        ))}
        {filtered.length === 0 && <p>No snippets match your search.</p>}
      </div>
    </main>
  )
}
