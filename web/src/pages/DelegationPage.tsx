import { useState } from 'react'

export default function DelegationPage() {
  const [formula, setFormula] = useState('')
  const [findings, setFindings] = useState<{ level: 'warn' | 'info'; message: string }[]>([])
  const [source, setSource] = useState<'Dataverse' | 'SharePoint' | 'SQL' | 'Other'>('Dataverse')

  const analyse = () => {
    const f = formula.trim()
    const results: { level: 'warn' | 'info'; message: string }[] = []

    const add = (level: 'warn' | 'info', message: string) => results.push({ level, message })

    // Heuristic checks (non-exhaustive)
    if (/\bSearch\s*\(/i.test(f)) {
      add('warn', `Search(...) is often non-delegable on ${source}. Consider StartsWith/Filter patterns.`)
    }
    if (/\bForAll\s*\(/i.test(f)) {
      add('warn', 'ForAll(...) forces client-side iteration and can break delegation. Ensure the inner operations are delegable or reconsider the approach.')
    }
    if (/\bAddColumns\s*\(/i.test(f)) {
      add('warn', 'AddColumns(...) is frequently non-delegable. Check if the computed column can be pushed to the source or refactored.')
    }
    if (/\bLookUp\s*\(/i.test(f)) {
      add('info', `LookUp(...) may be non-delegable on ${source} if the predicate isn’t delegable. Verify your condition and source capabilities.`)
    }
    if (/\bSortByColumns\s*\(/i.test(f)) {
      add('info', `SortByColumns(...) delegation depends on ${source} and the column type. Confirm source delegation support.`)
    }
    if (/[^A-Za-z]in[^A-Za-z]/i.test(f)) {
      add('warn', `The 'in' operator is often non-delegable on ${source}. Prefer StartsWith or exact filters where possible.`)
    }
    if (/\bStartsWith\s*\(/i.test(f)) {
      add('info', `StartsWith(...) can be delegable on ${source} for indexed text columns. Validate for your source.`)
    }
    if (/\bGroupBy\s*\(/i.test(f)) {
      add('warn', `GroupBy(...) is commonly non-delegable on ${source}. Consider pre-aggregating or using views.`)
    }
    if (/\bDistinct\s*\(/i.test(f)) {
      add('info', `Distinct(...) may have delegation limits on ${source}. Test with large datasets.`)
    }
    if (/\bFilter\s*\(.+\bIsBlank\s*\(/is.test(f)) {
      add('info', `Filter(... IsBlank(...)) can be tricky for delegation on ${source}. Consider explicit comparisons where possible.`)
    }

    setFindings(results)
  }

  return (
    <main className="container">
      <h1>Delegation Checker</h1>
      <label htmlFor="source">Data Source</label>
      <select id="source" value={source} onChange={e => setSource(e.target.value as any)}>
        <option>Dataverse</option>
        <option>SharePoint</option>
        <option>SQL</option>
        <option>Other</option>
      </select>
      <label htmlFor="fx">Power Fx Formula</label>
      <textarea id="fx" rows={8} placeholder="Paste your formula here…" value={formula} onChange={e => setFormula(e.target.value)} />
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={analyse}>Analyse</button>
        <button onClick={() => setFormula('')}>Clear</button>
      </div>
      {formula.trim() && (
        <section style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Heuristic Findings</h2>
          {findings.length === 0 ? (
            <p>No issues detected by heuristics. This does not guarantee delegation — verify with your data source’s delegation documentation.</p>
          ) : (
            <ul>
              {findings.map((f, i) => (
                <li key={i} style={{ color: f.level === 'warn' ? '#ffb703' : 'inherit' }}>{f.message}</li>
              ))}
            </ul>
          )}
          <small className="help">Heuristics only — for deeper checks, use the upcoming prompt-driven analyser.</small>
        </section>
      )}
    </main>
  )
}
