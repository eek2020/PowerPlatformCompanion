import { useEffect, useMemo, useState } from 'react'

// Minimal built‑in icon samples (paths mimic stroke icons similar to Lucide)
// Each path string is full SVG path/shape markup inside <svg> (without the root tag)
const BUILT_IN_ICONS: { name: string; tags: string[]; inner: string }[] = [
  {
    name: 'search',
    tags: ['find', 'magnify', 'lookup'],
    inner: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'
  },
  {
    name: 'settings',
    tags: ['cog', 'gear', 'prefs'],
    inner: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.62 4a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>'
  },
  {
    name: 'clipboard',
    tags: ['copy', 'paste'],
    inner: '<rect x="9" y="4" width="6" height="3" rx="1"/><path d="M9 7H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/>'
  },
  {
    name: 'code',
    tags: ['dev', 'brackets'],
    inner: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'
  },
  {
    name: 'alert-circle',
    tags: ['warning', 'error'],
    inner: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
  },
  {
    name: 'check',
    tags: ['success', 'ok'],
    inner: '<polyline points="20 6 9 17 4 12"/>'
  }
]

// Note: Icons page is Power Apps–centric only; no platform filters here.

// Common Power Automate vs Power Apps expression/operator differences
const EXPRESSION_DIFFS: { name: string; automate: string; apps: string; note?: string }[] = [
  { name: 'logical-and', automate: '&&', apps: 'And', note: 'Logical AND' },
  { name: 'logical-or', automate: '||', apps: 'Or', note: 'Logical OR' },
  { name: 'logical-not', automate: '!', apps: 'Not', note: 'Logical NOT' },
  { name: 'equal', automate: '==', apps: '=', note: 'Equality' },
  { name: 'not-equal', automate: '!=', apps: '<>', note: 'Inequality' },
  { name: 'strict-equal', automate: '===', apps: '=', note: 'No strict vs loose in Power Fx' },
  { name: 'strict-not-equal', automate: '!==', apps: '<>', note: 'No strict vs loose in Power Fx' },
  { name: 'null-vs-blank', automate: 'null', apps: 'Blank()', note: 'Null vs Blank value' },
  { name: 'ternary', automate: 'cond ? a : b', apps: 'If(cond, a, b)', note: 'Conditional' },
  { name: 'concat', automate: 'a + b', apps: 'Concatenate(a, b)', note: 'String concatenation' }
]

function buildSvg(inner: string, size: number, strokeWidth: number, stroke: string, fill: string, rounded: boolean) {
  const common = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="${rounded ? 'round' : 'square'}" stroke-linejoin="${rounded ? 'round' : 'miter'}" xmlns="http://www.w3.org/2000/svg"`;
  return `<svg ${common}>${inner}</svg>`
}

function toDataUri(svg: string) {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
  return `data:image/svg+xml;utf8,${encoded}`
}

function toPowerAppsImageFormula(svg: string) {
  // For use in an Image control: "data:image/svg+xml;utf8," & EncodeUrl("<svg ...>")
  const escaped = svg.replace(/"/g, '""')
  return `"data:image/svg+xml;utf8," & EncodeUrl("${escaped}")`
}

export default function IconsPage() {
  const [q, setQ] = useState('')
  const [size, setSize] = useState<number>(() => Number(localStorage.getItem('mm.icons.size') ?? '24'))
  const [strokeWidth, setStrokeWidth] = useState<number>(() => Number(localStorage.getItem('mm.icons.stroke') ?? '2'))
  const [stroke, setStroke] = useState<string>(() => localStorage.getItem('mm.icons.strokeColor') ?? '#e9efff')
  const [fill, setFill] = useState<string>(() => localStorage.getItem('mm.icons.fillColor') ?? 'none')
  const [rounded, setRounded] = useState<boolean>(() => (localStorage.getItem('mm.icons.rounded') ?? '1') === '1')
  const [customSvg, setCustomSvg] = useState<string>('')

  useEffect(() => { localStorage.setItem('mm.icons.size', String(size)) }, [size])
  useEffect(() => { localStorage.setItem('mm.icons.stroke', String(strokeWidth)) }, [strokeWidth])
  useEffect(() => { localStorage.setItem('mm.icons.strokeColor', stroke) }, [stroke])
  useEffect(() => { localStorage.setItem('mm.icons.fillColor', fill) }, [fill])
  useEffect(() => { localStorage.setItem('mm.icons.rounded', rounded ? '1' : '0') }, [rounded])

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    const base = BUILT_IN_ICONS
    if (!term) return base
    return base.filter(i => i.name.includes(term) || i.tags.some(t => t.includes(term)))
  }, [q])

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    alert('Copied!')
  }

  const renderCard = (icon: { name: string; inner: string }) => {
    const svg = buildSvg(icon.inner, size, strokeWidth, stroke, fill, rounded)
    return (
      <article key={icon.name} style={{ border: '1px solid #2b3a66', borderRadius: 10, padding: '0.6rem' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <strong>{icon.name}</strong>
        </header>
        <div style={{ display: 'grid', placeItems: 'center', height: 96, marginTop: 6 }}>
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button onClick={() => copy(svg)}>Copy SVG</button>
          <button onClick={() => copy(toDataUri(svg))}>Copy Data URI</button>
          <button onClick={() => copy(toPowerAppsImageFormula(svg))}>Copy Power Apps (Image)</button>
        </div>
      </article>
    )
  }

  // Render small badge-like icons for expression differences
  const expressionIconInner = (text: string) => {
    const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    return `<rect x="2" y="4" width="20" height="16" rx="4" ry="4" fill="none" />
            <text x="12" y="16" text-anchor="middle" font-size="10" font-family="monospace" fill="${stroke}">${safe}</text>`
  }

  const renderExpressionCard = (item: { name: string; automate: string; apps: string; note?: string }) => {
    const svgAutomate = buildSvg(expressionIconInner(item.automate), size, strokeWidth, stroke, fill, rounded)
    const svgApps = buildSvg(expressionIconInner(item.apps), size, strokeWidth, stroke, fill, rounded)
    return (
      <article key={item.name} style={{ border: '1px solid #2b3a66', borderRadius: 10, padding: '0.6rem' }}>
        <header style={{ marginBottom: 6 }}>
          <strong>{item.note ?? item.name}</strong>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'grid', placeItems: 'center', height: 96 }} dangerouslySetInnerHTML={{ __html: svgAutomate }} />
          <div style={{ display: 'grid', placeItems: 'center', height: 96 }} dangerouslySetInnerHTML={{ __html: svgApps }} />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: 6 }}>
          <button title="Copy Automate form" onClick={() => copy(item.automate)}>Copy Automate</button>
          <button title="Copy Power Apps form" onClick={() => copy(item.apps)}>Copy Power Apps</button>
          <button title="Copy Automate SVG" onClick={() => copy(svgAutomate)}>Copy Automate SVG</button>
          <button title="Copy Power Apps SVG" onClick={() => copy(svgApps)}>Copy Power Apps SVG</button>
        </div>
      </article>
    )
  }

  const handleFile = (f: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      setCustomSvg(text)
    }
    reader.readAsText(f)
  }

  const customOut = customSvg ? buildSvg(customSvg.replace(/^[\s\S]*?<svg[^>]*>([\s\S]*?)<\/svg>[\s\S]*$/i, '$1'), size, strokeWidth, stroke, fill, rounded) : ''

  return (
    <main className="container">
      <h1>Icons</h1>
      <p>Browse, customise, and copy Power Apps‑ready icons. Import your own SVGs to recolour and export.</p>

      <section style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <label htmlFor="icons-search">Search icons</label>
          <input id="icons-search" type="search" placeholder="Search by name or tag" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: '0.5rem', alignItems: 'end' }}>
          <div>
            <label htmlFor="icons-size">Size (px)</label>
            <input id="icons-size" type="number" min={12} max={256} value={size} onChange={e => setSize(Number(e.target.value))} />
          </div>
          <div>
            <label htmlFor="icons-stroke">Stroke width</label>
            <input id="icons-stroke" type="number" min={1} max={4} value={strokeWidth} onChange={e => setStrokeWidth(Number(e.target.value))} />
          </div>
          <div>
            <label htmlFor="icons-strokecolor">Stroke colour</label>
            <input id="icons-strokecolor" type="color" value={stroke} onChange={e => setStroke(e.target.value)} />
          </div>
          <div>
            <label htmlFor="icons-fillcolor">Fill colour</label>
            <input id="icons-fillcolor" type="color" value={fill === 'none' ? '#00000000' : fill} onChange={e => setFill(e.target.value === '#00000000' ? 'none' : e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input id="icons-rounded" type="checkbox" checked={rounded} onChange={e => setRounded(e.target.checked)} />
            <label htmlFor="icons-rounded">Rounded joins</label>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Built‑in Icons</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {list.map(renderCard)}
        </div>
      </section>

      <section style={{ marginTop: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Expression Differences (Automate ↔ Power Apps)</h2>
        <p className="help">Quickly copy common operator/function equivalents between Power Automate style and Power Apps (Power Fx).</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {EXPRESSION_DIFFS.map(renderExpressionCard)}
        </div>
      </section>

      <section style={{ marginTop: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Import your SVG</h2>
        <input type="file" accept="image/svg+xml,.svg" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        {customSvg && (
          <div style={{ marginTop: '0.75rem', border: '1px solid #2b3a66', borderRadius: 10, padding: '0.75rem' }}>
            <div style={{ display: 'grid', placeItems: 'center', minHeight: 120 }} dangerouslySetInnerHTML={{ __html: customOut }} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => navigator.clipboard.writeText(customOut)}>Copy SVG</button>
              <button onClick={() => navigator.clipboard.writeText(toDataUri(customOut))}>Copy Data URI</button>
              <button onClick={() => navigator.clipboard.writeText(toPowerAppsImageFormula(customOut))}>Copy Power Apps (Image)</button>
            </div>
          </div>
        )}
      </section>

      <footer style={{ marginTop: '1.25rem' }}>
        <small className="help">Sample icons for development only. Add appropriate licensing/attribution for any external icon libraries used.</small>
      </footer>
    </main>
  )
}
