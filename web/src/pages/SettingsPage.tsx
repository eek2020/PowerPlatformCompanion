import { useEffect, useMemo, useState } from 'react'

export default function SettingsPage() {

  const [notifyMonths, setNotifyMonths] = useState<number>(() => {
    const v = Number(localStorage.getItem('mm.notifyWindowMonths') ?? '1')
    return Number.isFinite(v) && v >= 0 ? v : 1
  })

  type ComponentsConfig = { 'Power Platform': string[]; Azure: string[] }
  const DEFAULT_COMPONENTS: ComponentsConfig = {
    'Power Platform': ['Power Apps', 'Power Automate', 'Power BI', 'Power Pages', 'Dataverse'],
    Azure: ['Functions', 'Key Vault', 'App Service', 'Storage Account', 'Service Bus']
  }
  const COMPONENTS_KEY = 'mm.planning.components.v1'
  const SIZE_HOURS_KEY = 'mm.planning.sizeHours.v1'

  const [ppList, setPpList] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(COMPONENTS_KEY)
      if (raw) return (JSON.parse(raw) as ComponentsConfig)['Power Platform'].join(', ')
    } catch {}
    return DEFAULT_COMPONENTS['Power Platform'].join(', ')
  })
  const [azList, setAzList] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(COMPONENTS_KEY)
      if (raw) return (JSON.parse(raw) as ComponentsConfig).Azure.join(', ')
    } catch {}
    return DEFAULT_COMPONENTS.Azure.join(', ')
  })

  const parsedConfig: ComponentsConfig = useMemo(() => {
    const norm = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean)
    return { 'Power Platform': norm(ppList), Azure: norm(azList) }
  }, [ppList, azList])

  type SizeHours = { XS: number; S: number; M: number; L: number; XL: number }
  const DEFAULT_SIZE_HOURS: SizeHours = { XS: 2, S: 8, M: 24, L: 56, XL: 120 }
  const [sizeHours, setSizeHours] = useState<SizeHours>(() => {
    try {
      const raw = localStorage.getItem(SIZE_HOURS_KEY)
      if (raw) return { ...DEFAULT_SIZE_HOURS, ...JSON.parse(raw) }
    } catch {}
    return DEFAULT_SIZE_HOURS
  })

  useEffect(() => {
    localStorage.setItem('mm.notifyWindowMonths', String(notifyMonths))
  }, [notifyMonths])

  useEffect(() => {
    localStorage.setItem(COMPONENTS_KEY, JSON.stringify(parsedConfig))
  }, [parsedConfig])

  useEffect(() => {
    localStorage.setItem(SIZE_HOURS_KEY, JSON.stringify(sizeHours))
  }, [sizeHours])

  return (
    <main className="container">
      <h1>Settings</h1>
      <p>Configure app preferences and experimental features.</p>
      <section style={{ display: 'grid', gap: '0.75rem', maxWidth: 520 }}>
        <div>
          <label htmlFor="set-notify">Roadmap notification window (months)</label>
          <input
            id="set-notify"
            type="number"
            min={0}
            max={12}
            value={notifyMonths}
            onChange={e => setNotifyMonths(Math.max(0, Math.min(12, Number(e.target.value))))}
          />
          <small className="help">Controls how far ahead/behind to flag items as "Due soon" or "Due now/recent" on the Roadmap.</small>
        </div>

        <div>
          <h2 style={{ fontSize: '1.1rem' }}>Planning components</h2>
          <label htmlFor="set-pp">Power Platform components (comma‑separated)</label>
          <input id="set-pp" value={ppList} onChange={e => setPpList(e.target.value)} />
          <small className="help">Shown in Planning when category is Power Platform.</small>
          <label htmlFor="set-az" style={{ marginTop: 8, display: 'block' }}>Azure components (comma‑separated)</label>
          <input id="set-az" value={azList} onChange={e => setAzList(e.target.value)} />
          <small className="help">Shown in Planning when category is Azure.</small>
          <div style={{ marginTop: 8, display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => { setPpList(DEFAULT_COMPONENTS['Power Platform'].join(', ')); setAzList(DEFAULT_COMPONENTS.Azure.join(', ')) }}>Reset to defaults</button>
            <span style={{ alignSelf: 'center' }}>
              <small>{parsedConfig['Power Platform'].length} PP / {parsedConfig.Azure.length} Azure</small>
            </span>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '1.1rem' }}>T‑shirt size estimates (hours)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '0.5rem', maxWidth: 520 }}>
            {(['XS','S','M','L','XL'] as const).map(k => (
              <label key={k} style={{ display: 'grid', gap: 4 }}>
                <span>{k}</span>
                <input type="number" min={0} value={sizeHours[k]} onChange={e => setSizeHours({ ...sizeHours, [k]: Math.max(0, Number(e.target.value)) })} />
              </label>
            ))}
          </div>
          <small className="help">Used by Planning to compute an estimated time per row and total.</small>
        </div>

        {/* AI Settings */}
        <div>
          <h2 style={{ fontSize: '1.1rem' }}>AI Settings</h2>
          <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#888' }}>
            Configure AI providers, models, and cost management.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a href="/settings/ai/providers" style={{ textDecoration: 'none' }}>
              <button>AI Providers</button>
            </a>
            <a href="/settings/ai/playground" style={{ textDecoration: 'none' }}>
              <button>AI Playground</button>
            </a>
            <a href="/settings/ai/costs" style={{ textDecoration: 'none' }}>
              <button>Cost Calculator</button>
            </a>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '1.1rem' }}>Coming Soon</h2>
          <ul>
            <li>Theme and accessibility options</li>
            <li>Experimental flags</li>
            <li>Data sources and authentication</li>
          </ul>
        </div>
      </section>
    </main>
  )
}


