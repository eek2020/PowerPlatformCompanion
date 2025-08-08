import { useState } from 'react'

export default function FormatterPage() {
  const [raw, setRaw] = useState('')
  const [pretty, setPretty] = useState('')
  const [error, setError] = useState<string | null>(null)

  const prettyPrint = () => {
    try {
      setError(null)
      const parsed = JSON.parse(raw)
      setPretty(JSON.stringify(parsed, null, 2))
    } catch (e: any) {
      setPretty('')
      setError(e?.message ?? 'Invalid JSON')
    }
  }

  const clearAll = () => {
    setRaw('')
    setPretty('')
    setError(null)
  }

  return (
    <main className="container">
      <h1>Flow Output Formatter</h1>
      <label htmlFor="json">Paste Flow JSON</label>
      <textarea id="json" rows={10} placeholder='{ "name": "example" }' value={raw} onChange={e => setRaw(e.target.value)} />
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={prettyPrint}>Pretty Print</button>
        <button onClick={clearAll}>Clear</button>
      </div>
      {error && <p style={{ color: '#ff6b6b' }}>Error: {error}</p>}
      {pretty && (
        <section style={{ marginTop: '1rem' }}>
          <label>Formatted</label>
          <pre style={{ border: '1px solid #2f2f2f', borderRadius: 8, padding: '0.75rem 1rem', overflowX: 'auto' }}>
            <code>{pretty}</code>
          </pre>
        </section>
      )}
    </main>
  )
}
