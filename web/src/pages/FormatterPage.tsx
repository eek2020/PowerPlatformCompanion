import { useState } from 'react'

export default function FormatterPage() {
  const [raw, setRaw] = useState('')
  const [pretty, setPretty] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sizeWarning, setSizeWarning] = useState<string | null>(null)

  const prettyPrint = () => {
    try {
      setError(null)
      setSizeWarning(null)
      const parsed = JSON.parse(raw)
      const out = JSON.stringify(parsed, null, 2)
      setPretty(out)
      const bytes = new TextEncoder().encode(out).length
      if (bytes > 200 * 1024) {
        setSizeWarning(`Formatted payload is ${(bytes / 1024).toFixed(0)} KB; consider splitting or sampling data before sharing.`)
      }
    } catch (e: any) {
      setPretty('')
      setError(e?.message ?? 'Invalid JSON')
    }
  }

  const clearAll = () => {
    setRaw('')
    setPretty('')
    setError(null)
    setSizeWarning(null)
  }

  const copyPretty = async () => {
    if (!pretty) return
    try {
      await navigator.clipboard.writeText(pretty)
      // eslint-disable-next-line no-alert
      alert('Formatted JSON copied to clipboard')
    } catch {
      // noop
    }
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
      {sizeWarning && <p style={{ color: '#ffb703' }}>{sizeWarning}</p>}
      {pretty && (
        <section style={{ marginTop: '1rem' }}>
          <label>Formatted</label>
          <pre style={{ border: '1px solid #2f2f2f', borderRadius: 8, padding: '0.75rem 1rem', overflowX: 'auto' }}>
            <code>{pretty}</code>
          </pre>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={copyPretty}>Copy formatted</button>
          </div>
        </section>
      )}
    </main>
  )
}
