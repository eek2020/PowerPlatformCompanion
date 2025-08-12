import { useEffect, useMemo, useState } from 'react'

// Minimal built‑in icon samples (paths mimic stroke icons similar to Lucide)
// Each path string is full SVG path/shape markup inside <svg> (without the root tag)
// Optional anim per icon, used when Animation mode = "Per icon"
const BUILT_IN_ICONS: { name: string; tags: string[]; inner: string; anim?: AnimKind }[] = [
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
  },
  { name: 'x', tags: ['close', 'cancel'], inner: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' },
  { name: 'plus', tags: ['add', 'new'], inner: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' },
  { name: 'minus', tags: ['remove'], inner: '<line x1="5" y1="12" x2="19" y2="12"/>' },
  { name: 'play', tags: ['start'], inner: '<polygon points="8 5 19 12 8 19 8 5" />' },
  { name: 'pause', tags: ['stop'], inner: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>' },
  { name: 'stop', tags: ['square'], inner: '<rect x="6" y="6" width="12" height="12"/>' },
  { name: 'download', tags: ['arrow'], inner: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>' },
  { name: 'upload', tags: ['arrow'], inner: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 5 17 10"/><line x1="12" y1="5" x2="12" y2="21"/>' },
  { name: 'share', tags: ['export'], inner: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98"/><path d="M15.41 6.51l-6.82 3.98"/>' },
  { name: 'cloud', tags: ['weather'], inner: '<path d="M17.5 19H7a4 4 0 1 1 .9-7.9A5 5 0 1 1 17.5 19Z"/>' },
  { name: 'home', tags: ['house'], inner: '<path d="M3 11l9-7 9 7"/><path d="M9 22V12h6v10"/>' },
  { name: 'calendar', tags: ['date'], inner: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
  { name: 'clock', tags: ['time'], inner: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
  { name: 'message', tags: ['chat'], inner: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>' },
  { name: 'mail', tags: ['email'], inner: '<rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/>' },
  { name: 'phone', tags: ['call'], inner: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.54 2.37a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.71-1.06a2 2 0 0 1 2.11-.45c.77.24 1.56.42 2.37.54A2 2 0 0 1 22 16.92z"/>' },
  { name: 'map-pin', tags: ['location'], inner: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/>' },
  { name: 'image', tags: ['photo'], inner: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>' },
  { name: 'camera', tags: ['photo'], inner: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>' }
]

// Note: Icons page is Power Apps–centric only; no platform filters here.

//

type AnimKind = 'none' | 'spin' | 'pulse' | 'per'

function buildSvg(inner: string, size: number, strokeWidth: number, stroke: string, fill: string, rounded: boolean, anim: AnimKind = 'none') {
  const common = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="${rounded ? 'round' : 'square'}" stroke-linejoin="${rounded ? 'round' : 'miter'}" xmlns="http://www.w3.org/2000/svg"`;
  const animEl =
    anim === 'spin'
      ? '<animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="2s" repeatCount="indefinite" />'
      : anim === 'pulse'
      ? '<animateTransform attributeName="transform" type="scale" values="1;1.12;1" dur="1.4s" repeatCount="indefinite" additive="replace"/>'
      : ''
  return `<svg ${common}>${animEl}${inner}</svg>`
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
  // Use a higher-contrast default stroke so icons are visible on light backgrounds
  const [stroke, setStroke] = useState<string>(() => localStorage.getItem('mm.icons.strokeColor') ?? '#334155')
  const [fill, setFill] = useState<string>(() => localStorage.getItem('mm.icons.fillColor') ?? 'none')
  const [rounded, setRounded] = useState<boolean>(() => (localStorage.getItem('mm.icons.rounded') ?? '1') === '1')
  const [customSvg, setCustomSvg] = useState<string>('')
  const [anim, setAnim] = useState<AnimKind>(() => (localStorage.getItem('mm.icons.anim') as AnimKind) || 'none')

  useEffect(() => { localStorage.setItem('mm.icons.size', String(size)) }, [size])
  useEffect(() => { localStorage.setItem('mm.icons.stroke', String(strokeWidth)) }, [strokeWidth])
  useEffect(() => { localStorage.setItem('mm.icons.strokeColor', stroke) }, [stroke])
  useEffect(() => { localStorage.setItem('mm.icons.fillColor', fill) }, [fill])
  useEffect(() => { localStorage.setItem('mm.icons.rounded', rounded ? '1' : '0') }, [rounded])
  useEffect(() => { localStorage.setItem('mm.icons.anim', anim) }, [anim])

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

  const renderCard = (icon: { name: string; inner: string; anim?: AnimKind }) => {
    const useAnim: AnimKind = anim === 'per' ? (icon.anim ?? 'none') : anim
    const svg = buildSvg(icon.inner, size, strokeWidth, stroke, fill, rounded, useAnim)
    const btnStyle: React.CSSProperties = { fontSize: 12, padding: '2px 6px', borderRadius: 6 }
    return (
      <article key={icon.name} style={{ border: '1px solid #2b3a66', borderRadius: 10, padding: '0.5rem' }}>
        <div style={{ display: 'grid', placeItems: 'center', height: 84 }}>
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <small className="help" style={{ fontSize: 12 }}>{icon.name}</small>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: 6, justifyContent: 'center' }}>
          <button style={btnStyle} onClick={() => copy(buildSvg(icon.inner, size, strokeWidth, stroke, fill, rounded, 'none'))}>SVG</button>
          <button style={btnStyle} onClick={() => copy(svg)}>SVG (anim)</button>
          <button style={btnStyle} onClick={() => copy(toDataUri(svg))}>Data URI</button>
          <button style={btnStyle} onClick={() => copy(toPowerAppsImageFormula(svg))}>Power Apps</button>
        </div>
      </article>
    )
  }

  //

  const handleFile = (f: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      setCustomSvg(text)
    }
    reader.readAsText(f)
  }

  const customOut = customSvg ? buildSvg(customSvg.replace(/^[\s\S]*?<svg[^>]*>([\s\S]*?)<\/svg>[\s\S]*$/i, '$1'), size, strokeWidth, stroke, fill, rounded, anim === 'per' ? 'none' : anim) : ''

  return (
    <main className="container">
      <h1>Icons</h1>
      {/* Compact UI: removed verbose description */}

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
          <div>
            <label htmlFor="icons-anim">Animation</label>
            <select id="icons-anim" value={anim} onChange={e => setAnim(e.target.value as AnimKind)}>
              <option value="none">None</option>
              <option value="spin">Spin</option>
              <option value="pulse">Pulse</option>
              <option value="per">Per icon</option>
            </select>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Built‑in Icons</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {list.map(renderCard)}
        </div>
      </section>

      {/* Expression Differences section removed per request */}

      <section style={{ marginTop: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Import your SVG</h2>
        <input type="file" accept="image/svg+xml,.svg" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        {customSvg && (
          <div style={{ marginTop: '0.75rem', border: '1px solid #2b3a66', borderRadius: 10, padding: '0.75rem' }}>
            <div style={{ display: 'grid', placeItems: 'center', minHeight: 120 }} dangerouslySetInnerHTML={{ __html: customOut }} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => navigator.clipboard.writeText(buildSvg(customSvg.replace(/^[\s\S]*?<svg[^>]*>([\s\S]*?)<\/svg>[\s\S]*$/i, '$1'), size, strokeWidth, stroke, fill, rounded, 'none'))}>Copy SVG</button>
              <button onClick={() => navigator.clipboard.writeText(customOut)}>Copy SVG (animated)</button>
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
