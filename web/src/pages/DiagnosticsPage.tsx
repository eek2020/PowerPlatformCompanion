import { useState } from 'react'

export default function DiagnosticsPage() {
  const [message, setMessage] = useState('')
  const [analysis, setAnalysis] = useState<string[] | null>(null)

  const analyse = () => {
    const steps: string[] = []
    const msg = message.trim()
    if (!msg) { setAnalysis([]); return }

    // Very light heuristics to seed UI; real implementation will be LLM-driven and/or rules-based
    if (/delegat/i.test(msg)) steps.push('Check if your data source supports delegation for the operators you use.')
    if (/invalid|unexpected/i.test(msg)) steps.push('Locate the token/character index in the message and inspect the expression around it.')
    if (/reference|not defined|unknown/i.test(msg)) steps.push('Verify control, variable, or column names for typos and scope.')
    if (/permission|auth|401|403/i.test(msg)) steps.push('Verify credentials/connection references and API permissions.')
    if (/timeout|429|throttle/i.test(msg)) steps.push('Consider pagination/batching and exponential backoff.')
    if (steps.length === 0) steps.push('Search known issues and consult feature docs for the component that emitted this error.')

    setAnalysis(steps)
  }

  return (
    <main className="container">
      <h1>Error Diagnostics (Coming Soon)</h1>
      <p>Paste an error message to understand context and potential fixes. Planned: inline fix suggestions and diffs.</p>
      <label htmlFor="err">Error Message</label>
      <textarea id="err" rows={8} placeholder="Paste error output here…" value={message} onChange={e => setMessage(e.target.value)} />
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={analyse}>Analyse</button>
        <button onClick={() => { setMessage(''); setAnalysis(null) }}>Clear</button>
      </div>
      {analysis && (
        <section style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Suggested Next Steps</h2>
          {analysis.length === 0 ? <p>No suggestions yet.</p> : (
            <ol>
              {analysis.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          )}
          <small className="help">Heuristics only — rich, context-aware recommendations are planned.</small>
        </section>
      )}
    </main>
  )
}
