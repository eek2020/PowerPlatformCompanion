import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const [notifyMonths, setNotifyMonths] = useState<number>(() => {
    const v = Number(localStorage.getItem('mm.notifyWindowMonths') ?? '1')
    return Number.isFinite(v) && v >= 0 ? v : 1
  })

  useEffect(() => {
    localStorage.setItem('mm.notifyWindowMonths', String(notifyMonths))
  }, [notifyMonths])

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
