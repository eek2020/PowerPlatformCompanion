import { useMemo, useState } from 'react'

export default function ExpressionPage() {
  const [expr, setExpr] = useState('')
  const [suggested, setSuggested] = useState<string | null>(null)

  const suggestFix = () => {
    let s = expr
    // Heuristic fixes for common non-Power Fx operators
    s = s.replace(/&&/g, ' And ')
    s = s.replace(/\|\|/g, ' Or ')
    s = s.replace(/!\s*/g, ' Not ')
    // Equality often written as '==' from other languages
    s = s.replace(/==/g, '=')
    // Null/blank normalization
    s = s.replace(/null/gi, 'Blank()')
    // True/False capitalization
    s = s.replace(/\btrue\b/gi, 'true').replace(/\bfalse\b/gi, 'false')
    // Trim redundant whitespace
    s = s.replace(/\s+/g, ' ').trim()
    setSuggested(s === expr ? null : s)
  }

  const diff = useMemo(() => {
    if (!suggested) return null
    // minimal inline diff preview: show original and suggestion
    return { before: expr, after: suggested }
  }, [expr, suggested])

  return (
    <main className="container">
      <h1>Expression Tester</h1>
      <p>Paste a Power Fx expression. Use "Suggest fix" to auto-correct common syntax from other languages.</p>

      <label htmlFor="fx">Expression</label>
      <textarea id="fx" rows={6} placeholder="e.g. If(VarA && VarB, 1, 0)" value={expr} onChange={e => setExpr(e.target.value)} />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button onClick={suggestFix}>Suggest fix</button>
        <button onClick={() => { setExpr(''); setSuggested(null) }}>Clear</button>
      </div>

      {diff && (
        <section style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Suggested Correction</h2>
          <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem' }}>Before</h3>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{diff.before}</pre>
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem' }}>After</h3>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{diff.after}</pre>
              <button style={{ marginTop: '0.5rem' }} onClick={() => setExpr(diff.after)}>Apply</button>
            </div>
          </div>
          <small className="help">Heuristics only — future versions will include full parsing and linting.</small>
        </section>
      )}

      <section style={{ marginTop: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Coming Soon</h2>
        <ul>
          <li>Inline evaluation and error messages</li>
          <li>Sample record editor</li>
          <li>Delegation awareness hints</li>
        </ul>
      </section>
    </main>
  )
}
