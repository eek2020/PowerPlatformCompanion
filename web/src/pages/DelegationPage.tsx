import { useState } from 'react'

export default function DelegationPage() {
  const [formula, setFormula] = useState('')

  const analyse = () => {
    // TODO: integrate prompt-driven analysis
    // eslint-disable-next-line no-alert
    alert('Analysis coming soon')
  }

  return (
    <main className="container">
      <h1>Delegation Checker</h1>
      <label htmlFor="fx">Power Fx Formula</label>
      <textarea id="fx" rows={8} placeholder="Paste your formula here…" value={formula} onChange={e => setFormula(e.target.value)} />
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={analyse}>Analyse</button>
        <button onClick={() => setFormula('')}>Clear</button>
      </div>
    </main>
  )
}
