import { useEffect, useMemo, useState } from 'react'
import { estimatingStore, type LicensingDataset } from '../state/estimating'

export default function LicensingPage() {
  const [snapshot, setSnapshot] = useState(estimatingStore.getState())
  const [status, setStatus] = useState<string>('')
  const [pdfUrl, setPdfUrl] = useState<string>('')

  useEffect(() => {
    const unsub = estimatingStore.subscribe(() => setSnapshot(estimatingStore.getState()))
    return () => unsub()
  }, [])

  const planningItems = snapshot.planningItems || []
  const dataset = snapshot.licensing

  const requiredCapabilities = useMemo(() => {
    // Placeholder derivation for Phase 1: map components to high-level capabilities
    // Will be replaced by rules in Phase 2 when dataset schema is formalized
    const caps = new Set<string>()
    for (const i of planningItems) {
      if (i.category === 'Power Platform') {
        if (i.component === 'Power Apps') caps.add('Power Apps app')
        if (i.component === 'Power Automate') caps.add('Cloud flow')
        if (i.component === 'Dataverse') caps.add('Dataverse table')
        if (i.component === 'Power BI') caps.add('Power BI')
        if (i.component === 'Power Pages') caps.add('Power Pages site')
      }
      if (i.category === 'Azure') {
        if (i.component === 'Functions') caps.add('Azure Functions integration')
        if (i.component === 'Key Vault') caps.add('Key Vault secret')
      }
    }
    return Array.from(caps)
  }, [planningItems])

  const onUploadJson = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const ds: LicensingDataset = {
        versionTag: data.versionTag || 'manual',
        sourceUrl: data.sourceUrl,
        fetchedAt: new Date().toISOString(),
        data,
      }
      estimatingStore.setLicensing(ds)
      setStatus(`Loaded dataset from ${file.name}`)
    } catch (e) {
      setStatus('Failed to parse JSON file.')
    }
  }

  const onUploadPdf = async (_file: File) => {
    // Phase 2: parse PDFs. For now, show a message.
    setStatus('PDF parsing will be added in Phase 2. Please upload JSON for now.')
  }

  const fetchPdfByUrl = async () => {
    if (!pdfUrl) {
      setStatus('Enter a PDF URL first.')
      return
    }
    try {
      setStatus('Fetching PDF…')
      // Try redirect path first (works in production and Netlify Dev). If 404 (e.g., plain Vite), retry direct functions path.
      let resp = await fetch('/api/licensing/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: pdfUrl })
      })
      if (resp.status === 404) {
        resp = await fetch('/.netlify/functions/licensing-fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: pdfUrl })
        })
      }
      if (!resp.ok) {
        const t = await resp.text()
        setStatus(`Fetch failed (${resp.status}). ${t}`)
        return
      }
      const payload = await resp.json()
      const ds: LicensingDataset = {
        versionTag: 'pdf:v1',
        sourceUrl: pdfUrl,
        fetchedAt: new Date().toISOString(),
        data: { pdf: payload }
      }
      estimatingStore.setLicensing(ds)
      setStatus(`Fetched PDF (${payload?.size ?? 0} bytes).`)
    } catch (e: any) {
      setStatus(`Error: ${String(e?.message || e)}`)
    }
  }

  return (
    <main className="container">
      <h1>Licensing</h1>

      <section style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'inline-block' }}>
          <input
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) onUploadJson(f)
              e.currentTarget.value = ''
            }}
          />
          <span role="button" aria-label="Upload licensing JSON" className="button-like">Upload JSON</span>
        </label>
        <label style={{ display: 'inline-block' }}>
          <input
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) onUploadPdf(f)
              e.currentTarget.value = ''
            }}
          />
          <span role="button" aria-label="Upload licensing PDF" className="button-like">Upload PDF (Phase 2)</span>
        </label>
        <input
          type="url"
          placeholder="https://.../licensing.pdf"
          value={pdfUrl}
          onChange={e => setPdfUrl(e.target.value)}
          style={{ minWidth: 300 }}
          aria-label="PDF URL"
        />
        <button onClick={fetchPdfByUrl} aria-label="Fetch licensing PDF" className="button-like">Fetch PDF</button>
        <div aria-live="polite" style={{ minHeight: 20, color: '#475569' }}>{status}</div>
      </section>

      <section style={{ marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>Dataset</h2>
        {dataset ? (
          <div>
            <p><strong>Version:</strong> {dataset.versionTag || 'n/a'} &nbsp; <strong>Source:</strong> {dataset.sourceUrl || 'manual upload'} &nbsp; <strong>Fetched:</strong> {dataset.fetchedAt || 'n/a'}</p>
            {dataset.data?.pdf && (
              <p><strong>PDF:</strong> {dataset.data.pdf.contentType} • {dataset.data.pdf.size} bytes</p>
            )}
            <details>
              <summary>View raw (first 1,000 chars)</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(dataset.data, null, 2).slice(0, 1000)}</pre>
            </details>
          </div>
        ) : (
          <p>No dataset loaded. Upload JSON or wait for Phase 2 auto-fetch.</p>
        )}
      </section>

      <section style={{ marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>From Planning</h2>
        {planningItems.length === 0 ? (
          <p>No items yet. Add items in Planning.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #2f2f2f' }}>Category</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #2f2f2f' }}>Component</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #2f2f2f' }}>Complexity</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #2f2f2f' }}>T‑Shirt</th>
              </tr>
            </thead>
            <tbody>
              {planningItems.map((i: any) => (
                <tr key={i.id}>
                  <td style={{ padding: '0.25rem 0' }}>{i.category}</td>
                  <td style={{ padding: '0.25rem 0' }}>{i.component}</td>
                  <td style={{ padding: '0.25rem 0' }}>{i.complexity}</td>
                  <td style={{ padding: '0.25rem 0' }}>{i.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>Derived capabilities (preview)</h2>
        {requiredCapabilities.length === 0 ? (
          <p>No capabilities inferred yet.</p>
        ) : (
          <ul>
            {requiredCapabilities.map(c => <li key={c}>{c}</li>)}
          </ul>
        )}
      </section>
    </main>
  )
}
