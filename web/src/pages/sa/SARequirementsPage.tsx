import { useEffect, useMemo, useRef, useState } from 'react'
import type { Requirement } from '../../types/sa'
import { SA_STORAGE_KEYS } from '../../types/sa'
import { storage } from '../../lib/storage'
import { secrets } from '../../lib/secrets'
import * as XLSX from 'xlsx'
import { exportToCsv } from '../../lib/csv'

export default function SARequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>(() => {
    return storage.getItem<Requirement[]>(SA_STORAGE_KEYS.requirements, [])
  })
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  type ParsedRow = Record<string, unknown>
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [mapping, setMapping] = useState<{ id?: string; title?: string; description?: string }>({})
  const [error, setError] = useState<string | null>(null)
  const [sheetName, setSheetName] = useState<string>('')
  const [sheetNames, setSheetNames] = useState<string[]>([])

  type ParsedSheet = { headers: string[]; rows: ParsedRow[] }
  const [sheets, setSheets] = useState<Record<string, ParsedSheet>>({})

  const hasParsed = rows.length > 0 && headers.length > 0

  // Work queue and view state
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hideMethodology, setHideMethodology] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(25)

  const mappedPreview = useMemo<Requirement[]>(() => {
    // Require at least one of title/description to be mapped
    if (!hasParsed || (!mapping.title && !mapping.description)) return []
    return rows
      .map((r, idx) => {
        const idSource = mapping.id && r[mapping.id]
        const id = (typeof idSource === 'string' && idSource.trim()) || crypto.randomUUID()
        const titleRaw = mapping.title ? String(r[mapping.title] ?? '').trim() : ''
        const descriptionRaw = mapping.description ? String(r[mapping.description] ?? '').trim() : ''
        // If title missing, derive from description (first 80 chars)
        const derivedTitle = !titleRaw && descriptionRaw
          ? (descriptionRaw.length > 80 ? descriptionRaw.slice(0, 77) + '…' : descriptionRaw)
          : titleRaw
        const title = derivedTitle
        const description = descriptionRaw || ''
        if (!title && !description) return null
        const known = new Set([mapping.id, mapping.title, mapping.description].filter(Boolean) as string[])
        const metadata: Record<string, unknown> = {}
        for (const h of headers) {
          if (!known.has(h)) metadata[h] = r[h]
        }
        const item: Requirement = {
          id,
          title: title || `(Untitled ${idx + 1})`,
          description,
          metadata: Object.keys(metadata).length ? metadata : undefined,
        }
        return item
      })
      .filter((v): v is Requirement => v != null)
  }, [rows, headers, mapping, hasParsed])

  function buildFromAoA(aoa: unknown[][]): ParsedSheet {
    // Find header row: first row with at least 1 non-empty cell
    let headerIdx = -1
    for (let i = 0; i < Math.min(aoa.length, 50); i++) {
      const cells = (aoa[i] || []).map((c) => (c == null ? '' : String(c).trim()))
      const nonEmpty = cells.filter((c) => c !== '')
      if (nonEmpty.length >= 1) {
        headerIdx = i
        break
      }
    }
    if (headerIdx === -1) return { headers: [], rows: [] }
    const hdrs = (aoa[headerIdx] || []).map((c) => String(c ?? '').trim())
    const dataRows = aoa.slice(headerIdx + 1)
    const outRows: ParsedRow[] = dataRows.map((r) => {
      const o: ParsedRow = {}
      hdrs.forEach((h, i) => {
        if (!h) return
        o[h] = r[i]
      })
      return o
    })
    return { headers: hdrs.filter((h) => h && h !== ''), rows: outRows }
  }

  function applySheet(name: string, parsed: Record<string, ParsedSheet>) {
    const ps = parsed[name]
    if (!ps) return
    setSheetName(name)
    setHeaders(ps.headers)
    setRows(ps.rows)
    // infer mapping heuristics from headers
    const lower = new Set(ps.headers.map((h) => h.toLowerCase()))
    const tryFind = (cands: string[]) => cands.find((c) => lower.has(c))
    setMapping({
      id: tryFind(['id', 'req id', 'requirement id', 'req no', 'req #', 'reference']),
      title: tryFind(['title', 'name', 'summary', 'requirement title', 'req title', 'heading']),
      description: tryFind(['description', 'details', 'requirement', 'requirement description', 'req details', 'detail']),
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        setError(null)
        const data = new Uint8Array(reader.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const names = wb.SheetNames || []
        const parsed: Record<string, ParsedSheet> = {}
        for (const n of names) {
          const ws = wb.Sheets[n]
          const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false }) as unknown[][]
          parsed[n] = buildFromAoA(aoa)
        }
        setSheetNames(names)
        setSheets(parsed)
        const first = names[0]
        if (!first || parsed[first].headers.length === 0) {
          setHeaders([])
          setRows([])
          setError('No headers detected. Please check the first non-empty row contains column names.')
        } else {
          applySheet(first, parsed)
        }
      } catch (err) {
        console.error('Failed to parse file', err)
        setError('Could not read this file. Ensure it is a valid CSV/XLSX and not password-protected.')
        setHeaders([])
        setRows([])
      }
    }
    reader.readAsArrayBuffer(f)
    // reset input to allow re-upload same file
    e.currentTarget.value = ''
  }

  function handleSheetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const name = e.target.value
    if (!name) return
    applySheet(name, sheets)
  }

  function saveMapped() {
    if (!mappedPreview.length) return
    // merge with existing by id
    const byId = new Map<string, Requirement>()
    for (const r of requirements) byId.set(r.id, r)
    for (const r of mappedPreview) byId.set(r.id, r)
    const next = Array.from(byId.values())
    setRequirements(next)
    storage.setItem(SA_STORAGE_KEYS.requirements, next)
    // clear transient parse state
    setHeaders([])
    setRows([])
    setMapping({})
  }

  function handleExportCsv() {
    if (!requirements.length) return
    const rows = requirements.map((r) => ({ id: r.id, title: r.title, description: r.description, ...(r.metadata || {}) }))
    exportToCsv('requirements.csv', rows)
  }

  const filteredRequirements = useMemo(() => {
    return requirements.filter((r) => {
      if (!hideMethodology) return true
      const cat = (r.category || (r.metadata as any)?.category || '').toString().toLowerCase()
      return cat !== 'methodology' && cat !== 'method'
    })
  }, [requirements, hideMethodology])

  const totalPages = Math.max(1, Math.ceil(filteredRequirements.length / pageSize))
  const pageClamped = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (pageClamped - 1) * pageSize
    return filteredRequirements.slice(start, start + pageSize)
  }, [filteredRequirements, pageClamped, pageSize])

  // Editor state for selected requirement
  const selectedReq = useMemo(() => requirements.find((r) => r.id === selectedId) || null, [requirements, selectedId])
  const [editCategory, setEditCategory] = useState<string>('')
  const [editResponse, setEditResponse] = useState<string>('')
  const [aiPowerPlatformOnly, setAiPowerPlatformOnly] = useState<string>('')
  const [aiHybrid, setAiHybrid] = useState<string>('')
  const [aiAzureOnly, setAiAzureOnly] = useState<string>('')
  const [aiBusy, setAiBusy] = useState<boolean>(false)
  const [aiError, setAiError] = useState<string>('')
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [aiSelected, setAiSelected] = useState<'pp' | 'hybrid' | 'azure' | ''>('')
  type Feature = 'requirements' | 'hld' | 'erd'
  const [selectedFeature, setSelectedFeature] = useState<Feature>('requirements')
  const [aiProvider, setAiProvider] = useState<'openai' | 'azure-openai'>(() => storage.getItem<'openai' | 'azure-openai'>('sa.ai.bindings.requirements.provider', 'openai'))
  const [aiModel, setAiModel] = useState<string>(() => storage.getItem<string>('sa.ai.bindings.requirements.model', 'gpt-4o-mini'))
  const [apiKey, setApiKey] = useState<string>('')
  const defaultPrompt = 'You are a senior Microsoft Solution Architect. Return ONLY JSON with the specified schema for three options (Power Platform Only, Hybrid, Azure Only). Keep architectureSummary concise and populate fields as described.'
  const [aiPrompt, setAiPrompt] = useState<string>(() => storage.getItem<string>('sa.ai.bindings.requirements.prompt', defaultPrompt))
  const [modelOptions, setModelOptions] = useState<Array<{ id: string; label: string; deprecated?: boolean }>>([])
  const [modelsLoading, setModelsLoading] = useState<boolean>(false)
  const [modelsError, setModelsError] = useState<string>('')
  const [manualModel, setManualModel] = useState<boolean>(false)

  async function handleGenerateAI() {
    if (!selectedReq) return
    try {
      setAiBusy(true)
      setAiError('')
      const { generateTripleOptions } = await import('../../lib/ai/client')
      // Always use Requirements bindings for this page's generate
      const reqProvider = storage.getItem<'openai' | 'azure-openai'>('sa.ai.bindings.requirements.provider', aiProvider)
      const reqModel = storage.getItem<string>('sa.ai.bindings.requirements.model', aiModel)
      const reqPrompt = storage.getItem<string>('sa.ai.bindings.requirements.prompt', aiPrompt)
      const reqKey = secrets.get('ai.requirements.apiKey') || apiKey
      const res = await generateTripleOptions({
        requirements: [{ id: selectedReq.id, title: selectedReq.title || '', description: selectedReq.description || '' }],
        provider: reqProvider,
        model: reqModel,
        systemPrompt: reqPrompt,
        // For now we pass apiKey to the function; in production prefer server-side secrets.
        // @ts-expect-error include apiKey for function side use
        apiKey: reqKey,
      })
      const item = res[0]
      if (item?.responses) {
        setAiPowerPlatformOnly(item.responses.powerPlatformOnly?.architectureSummary || '')
        setAiHybrid(item.responses.hybrid?.architectureSummary || '')
        setAiAzureOnly(item.responses.azureOnly?.architectureSummary || '')
      }
    } catch (e: any) {
      setAiError(e?.message || String(e))
    } finally {
      setAiBusy(false)
    }
  }

  // Load editor when selection changes
  function openEditor(r: Requirement) {
    setSelectedId(r.id)
    setEditCategory(r.category || ((r.metadata as any)?.category as string) || '')
    setEditResponse(((r.metadata as any)?.response as string) || '')
    setAiPowerPlatformOnly((((r.metadata as any)?.ai as any)?.powerPlatformOnly as string) || '')
    setAiHybrid((((r.metadata as any)?.ai as any)?.hybrid as string) || '')
    setAiAzureOnly((((r.metadata as any)?.ai as any)?.azureOnly as string) || '')
  }

  // Focus modal when opened
  useEffect(() => {
    if (selectedReq && editorRef.current) {
      editorRef.current.focus()
    }
  }, [selectedReq])

  // Helpers for per-feature storage keys
  function kProvider(f: Feature) { return `sa.ai.bindings.${f}.provider` }
  function kModel(f: Feature) { return `sa.ai.bindings.${f}.model` }
  function kPrompt(f: Feature) { return `sa.ai.bindings.${f}.prompt` }
  function kKey(f: Feature) { return `ai.${f}.apiKey` }

  // Load state when feature changes
  useEffect(() => {
    const p = storage.getItem<'openai' | 'azure-openai'>(kProvider(selectedFeature), 'openai')
    const m = storage.getItem<string>(kModel(selectedFeature), 'gpt-4o-mini')
    const pr = storage.getItem<string>(kPrompt(selectedFeature), defaultPrompt)
    const key = secrets.get(kKey(selectedFeature)) || ''
    setAiProvider(p)
    setAiModel(m)
    setAiPrompt(pr)
    setApiKey(key)
  }, [selectedFeature])

  // Load models when provider or api key changes
  async function refreshModels() {
    try {
      setModelsLoading(true)
      setModelsError('')
      const { listModels } = await import('../../lib/ai/client')
      const r = await listModels({ provider: aiProvider, apiKey })
      setModelOptions(r.models || [])
      // If current model not in list and not manual, keep as is but allow manual toggle
    } catch (e: any) {
      setModelsError(e?.message || String(e))
    } finally {
      setModelsLoading(false)
    }
  }

  useEffect(() => {
    refreshModels()
  }, [aiProvider, apiKey])

  function saveEditor() {
    if (!selectedReq) return
    const next = requirements.map((r) => {
      if (r.id !== selectedReq.id) return r
      const metadata = { ...(r.metadata || {}) } as Record<string, unknown>
      if (editResponse) metadata.response = editResponse
      else delete (metadata as any).response
      if (editCategory) metadata.category = editCategory
      else delete (metadata as any).category
      // persist AI drafts if present
      const ai: Record<string, unknown> = {}
      if (aiPowerPlatformOnly) ai.powerPlatformOnly = aiPowerPlatformOnly
      if (aiHybrid) ai.hybrid = aiHybrid
      if (aiAzureOnly) ai.azureOnly = aiAzureOnly
      if (Object.keys(ai).length) (metadata as any).ai = ai
      else delete (metadata as any).ai
      return { ...r, category: editCategory || undefined, metadata: Object.keys(metadata).length ? metadata : undefined }
    })
    setRequirements(next)
    storage.setItem(SA_STORAGE_KEYS.requirements, next)
  }

  function clearEditor() {
    setSelectedId(null)
    setEditCategory('')
    setEditResponse('')
  }

  function clearCurrentEdits() {
    if (!selectedReq) return
    const next = requirements.map((r) => (r.id === selectedReq.id ? { ...r, category: undefined, metadata: undefined } : r))
    setRequirements(next)
    storage.setItem(SA_STORAGE_KEYS.requirements, next)
    setEditCategory('')
    setEditResponse('')
    setAiPowerPlatformOnly('')
    setAiHybrid('')
    setAiAzureOnly('')
  }

  function deleteSelected() {
    if (!selectedReq) return
    if (!confirm(`Delete requirement ${selectedReq.id}? This cannot be undone.`)) return
    const next = requirements.filter((r) => r.id !== selectedReq.id)
    setRequirements(next)
    storage.setItem(SA_STORAGE_KEYS.requirements, next)
    clearEditor()
  }

  return (
    <div className="container">
      <h1>Solution Architecture — Requirements</h1>
      <p>Import CSV/XLSX, generate dual options (Power Platform vs Azure), and edit inline. Local-first data.</p>
      <p>
        <small>
          Items stored in localStorage key <code>{SA_STORAGE_KEYS.requirements}</code>.
        </small>
      </p>

      <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <strong>Total requirements:</strong> {requirements.length}
        <button onClick={() => fileInputRef.current?.click()}>Import CSV/XLSX</button>
        <button onClick={handleExportCsv} disabled={!requirements.length}>
          Export CSV
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {sheetNames.length > 1 && (
          <label style={{ marginLeft: 8 }}>
            Sheet:
            <select value={sheetName} onChange={handleSheetChange} style={{ marginLeft: 6 }}>
              {sheetNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {error && (
        <div className="card" style={{ marginTop: 12, color: 'crimson' }}>
          <strong>Import error:</strong> {error}
        </div>
      )}

      {hasParsed && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Column Mapping</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['id', 'title', 'description'].map((field) => (
              <label key={field} style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{field}</span>
                <select
                  value={(mapping as any)[field] || ''}
                  onChange={(e) => setMapping((m) => ({ ...m, [field]: e.target.value || undefined }))}
                >
                  <option value="">— not mapped —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <small>Detected columns: {headers.join(', ') || 'None'}</small>
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={saveMapped} disabled={(!mapping.title && !mapping.description) || !mappedPreview.length}>
              Save {mappedPreview.length} rows
            </button>
          </div>
          <div style={{ marginTop: 12, overflow: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>id</th>
                  <th>title</th>
                  <th>description</th>
                </tr>
              </thead>
              <tbody>
                {mappedPreview.slice(0, 20).map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>{r.id}</td>
                    <td>{r.title}</td>
                    <td style={{ maxWidth: 600, whiteSpace: 'pre-wrap' }}>{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mappedPreview.length > 20 && <p>Showing first 20 of {mappedPreview.length} rows…</p>}
          </div>
        </div>
      )}

      {requirements.length > 0 && (
        <div className="card" style={{ marginTop: 16, overflow: 'auto' }}>
          <h3>Current Requirements</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={hideMethodology} onChange={(e) => setHideMethodology(e.target.checked)} />
              Hide Methodology
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              Page size
              <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1) }}>
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <span>
              Page {pageClamped} / {totalPages}
            </span>
            <div>
              <button onClick={() => setPage(1)} disabled={pageClamped <= 1}>« First</button>{' '}
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageClamped <= 1}>‹ Prev</button>{' '}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageClamped >= totalPages}>Next ›</button>{' '}
              <button onClick={() => setPage(totalPages)} disabled={pageClamped >= totalPages}>Last »</button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>id</th>
                <th>title</th>
                <th>description</th>
                <th>category</th>
                <th>actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.title}</td>
                  <td style={{ maxWidth: 600, whiteSpace: 'pre-wrap' }}>{r.description}</td>
                  <td>{r.category || (r.metadata as any)?.category || ''}</td>
                  <td>
                    <button onClick={() => openEditor(r)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 8 }}>
            Showing {paged.length} of {filteredRequirements.length} filtered rows (total {requirements.length}).
          </div>
        </div>
      )}

      {selectedReq && (
        <div
          aria-hidden={!selectedReq}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}
          onClick={(e) => { if (e.target === e.currentTarget) clearEditor() }}
        >
          <div
            ref={editorRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className="card"
            style={{ maxWidth: 1000, width: '100%', maxHeight: '90vh', overflow: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Edit Requirement</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={clearCurrentEdits} title="Clear all fields for this requirement">Clear</button>
                <button onClick={deleteSelected} title="Delete this requirement">Delete</button>
                <button onClick={clearEditor} title="Close editor">Close</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
              <div>
                <label style={{ display: 'block' }}>
                  <strong>ID:</strong>
                  <div>{selectedReq.id}</div>
                </label>
                <label style={{ display: 'block', marginTop: 8 }}>
                  <strong>Title</strong>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{selectedReq.title}</div>
                </label>
                <label style={{ display: 'block', marginTop: 8 }}>
                  <strong>Description</strong>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{selectedReq.description}</div>
                </label>
              </div>
              <div>
                <label style={{ display: 'block' }}>
                  Category
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                    <option value="">—</option>
                    <option value="System">System</option>
                    <option value="Non-Functional">Non-Functional</option>
                    <option value="Methodology">Methodology</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label style={{ display: 'block', marginTop: 8 }}>
                  Response
                  <textarea value={editResponse} onChange={(e) => setEditResponse(e.target.value)} rows={8} style={{ width: '100%' }} />
                </label>
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={saveEditor}>Save</button>
                </div>
              </div>
            </div>

            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Bindings — {selectedFeature.charAt(0).toUpperCase() + selectedFeature.slice(1)}</summary>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                <label style={{ display: 'flex', flexDirection: 'column' }}>
                  Feature
                  <select value={selectedFeature} onChange={(e) => setSelectedFeature(e.target.value as Feature)}>
                    <option value="requirements">Requirements</option>
                    <option value="hld">HLD</option>
                    <option value="erd">ERD</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column' }}>
                  Provider
                  <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value as 'openai' | 'azure-openai')}>
                    <option value="openai">OpenAI</option>
                    <option value="azure-openai">Azure OpenAI</option>
                  </select>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 260 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Model</span>
                    <button type="button" onClick={refreshModels} disabled={modelsLoading} title="Refresh models">{modelsLoading ? 'Refreshing…' : 'Refresh'}</button>
                  </label>
                  {!manualModel ? (
                    <select value={aiModel} onChange={(e) => setAiModel(e.target.value)}>
                      {modelOptions.length === 0 && <option value={aiModel}>{aiModel || 'Enter a model'}</option>}
                      {modelOptions.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}{m.deprecated ? ' (deprecated)' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={aiModel} onChange={(e) => setAiModel(e.target.value)} placeholder="e.g. gpt-4o-mini" />
                  )}
                  <label style={{ marginTop: 6 }}>
                    <input type="checkbox" checked={manualModel} onChange={(e) => setManualModel(e.target.checked)} /> Manual override
                  </label>
                  {modelsError && <div style={{ color: 'crimson' }}>{modelsError}</div>}
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', minWidth: 280 }}>
                  API Key
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." />
                </label>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <button onClick={() => { storage.setItem(kProvider(selectedFeature), aiProvider); storage.setItem(kModel(selectedFeature), aiModel); storage.setItem(kPrompt(selectedFeature), aiPrompt); secrets.set(kKey(selectedFeature), apiKey) }}>Save Bindings</button>
                  <button onClick={() => { secrets.delete(kKey(selectedFeature)); setApiKey('') }}>Clear Key</button>
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <label style={{ display: 'block' }}>
                  Prompt
                  <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={4} style={{ width: '100%' }} />
                </label>
              </div>
            </details>

            <div style={{ marginTop: 12 }}>
              <h4 style={{ marginTop: 0 }}>AI Draft Responses</h4>
              {aiError && <div style={{ color: 'crimson', marginBottom: 8 }}>{aiError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <label style={{ display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <input type="radio" name="ai-choice" checked={aiSelected === 'pp'} onChange={() => setAiSelected('pp')} />
                    <strong>Power Platform Only</strong>
                  </div>
                  <textarea value={aiPowerPlatformOnly} onChange={(e) => setAiPowerPlatformOnly(e.target.value)} rows={10} style={{ width: '100%' }} />
                </label>
                <label style={{ display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <input type="radio" name="ai-choice" checked={aiSelected === 'hybrid'} onChange={() => setAiSelected('hybrid')} />
                    <strong>Hybrid (Azure + Power Platform)</strong>
                  </div>
                  <textarea value={aiHybrid} onChange={(e) => setAiHybrid(e.target.value)} rows={10} style={{ width: '100%' }} />
                </label>
                <label style={{ display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <input type="radio" name="ai-choice" checked={aiSelected === 'azure'} onChange={() => setAiSelected('azure')} />
                    <strong>Azure Only</strong>
                  </div>
                  <textarea value={aiAzureOnly} onChange={(e) => setAiAzureOnly(e.target.value)} rows={10} style={{ width: '100%' }} />
                </label>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={handleGenerateAI} disabled={aiBusy}>Generate with AI</button>
                <button onClick={() => { setAiPowerPlatformOnly(''); setAiHybrid(''); setAiAzureOnly(''); }}>Clear Drafts</button>
                <button onClick={() => {
                  const chosen = aiSelected === 'pp' ? aiPowerPlatformOnly : aiSelected === 'hybrid' ? aiHybrid : aiSelected === 'azure' ? aiAzureOnly : ''
                  if (chosen) setEditResponse(chosen)
                }} disabled={!aiSelected}>Promote selected to Response</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
