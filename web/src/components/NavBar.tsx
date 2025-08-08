import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import './NavBar.css'

// Outline SVG icons (monochrome, scalable)
const IconHome = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="rail__icon" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11.5 12 4l9 7.5"/>
    <path d="M5.5 10v9a1 1 0 0 0 1 1H17.5a1 1 0 0 0 1-1v-9"/>
  </svg>
)
const IconCalc = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="rail__icon" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="2"/>
    <path d="M8 7h8"/>
    <path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 17.5h8"/>
  </svg>
)
const IconAlert = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="rail__icon" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>
    <path d="M12 9v5"/>
    <path d="M12 17h.01"/>
  </svg>
)
const IconWrench = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="rail__icon" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a4.5 4.5 0 0 1 4.98-1.02L16 8.96l-.04.04L8.96 16l-2.68 2.68a2 2 0 0 1-2.83-2.83L6.41 13l7.55-7.55c.25.31.48.64.74.85Z"/>
  </svg>
)
const IconGlobe = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="rail__icon" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M3 12h18"/>
    <path d="M12 3c3 3.5 3 14.5 0 18M12 3C9 6.5 9 17.5 12 21"/>
  </svg>
)
const IconGear = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="rail__icon" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.25 2.25c.41 0 .75.34.75.75v1.38a5.24 5.24 0 0 1 2.06.85l1.22-.7a.75.75 0 0 1 .98.27l.75 1.3a.75.75 0 0 1-.26 1.02l-1.19.69c.12.34.21.7.27 1.07l1.38.23c.36.06.63.37.63.74v1.5c0 .37-.27.68-.63.74l-1.38.23c-.06.37-.15.73-.27 1.07l1.19.69c.35.2.47.64.27.99l-.75 1.3a.75.75 0 0 1-.98.27l-1.22-.7c-.63.36-1.32.64-2.06.85v1.38c0 .41-.34.75-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.38a5.24 5.24 0 0 1-2.06-.85l-1.22.7a.75.75 0 0 1-.98-.27l-.75-1.3a.75.75 0 0 1 .26-1.02l1.19-.69a8.2 8.2 0 0 1-.27-1.07l-1.38-.23a.75.75 0 0 1-.63-.74v-1.5c0-.37.27-.68.63-.74l1.38-.23c.06-.37.15-.73.27-1.07l-1.19-.69a.75.75 0 0 1-.27-1l.75-1.31a.75.75 0 0 1 .99-.27l1.22.7c.63-.36 1.32-.64 2.06-.85V3c0-.41.34-.75.75-.75h1.5Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
export default function NavBar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  type RailKey = 'home' | 'estimating' | 'error' | 'tools' | 'resources' | 'settings'
  const routeRail: RailKey = useMemo(() => {
    const p = location.pathname
    if (p.startsWith('/planning') || p.startsWith('/licensing')) return 'estimating'
    if (p.startsWith('/expression') || p.startsWith('/delegation') || p.startsWith('/diagnostics')) return 'error'
    if (p.startsWith('/snippets') || p.startsWith('/formatter') || p.startsWith('/dataverse') || p.startsWith('/packs')) return 'tools'
    if (p.startsWith('/icons') || p.startsWith('/roadmap') || p.startsWith('/about')) return 'resources'
    if (p.startsWith('/settings')) return 'settings'
    return 'home'
  }, [location.pathname])

  const [activeRail, setActiveRail] = useState<RailKey>('home')
  useEffect(() => { setActiveRail(routeRail) }, [routeRail])

  useEffect(() => {
    const cls = 'sidebar-collapsed'
    if (collapsed) document.body.classList.add(cls)
    else document.body.classList.remove(cls)
  }, [collapsed])

  return (
    <aside className={collapsed ? 'sidebar collapsed' : 'sidebar'} aria-label="Sidebar">
      <div className="sidebar__top">
        <Link to="/" className="brand" aria-label="MakerMate Home">
          <span className="brand__logo">⚡️</span>
          <span className="brand__name">MakerMate</span>
        </Link>
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(v => !v)}
          aria-label="Toggle sidebar"
          aria-expanded={!collapsed}
          aria-controls="primary-navigation"
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>
      <div className="sidebar__container">
        <aside className="sidebar__rail" aria-label="Primary sections">
          <button className={activeRail==='home'? 'rail__btn active':'rail__btn'} onClick={() => setActiveRail('home')} aria-label="Home">
            <IconHome />
          </button>
          <button className={activeRail==='estimating'? 'rail__btn active':'rail__btn'} onClick={() => setActiveRail('estimating')} aria-label="Estimating">
            <IconCalc />
          </button>
          <button className={activeRail==='error'? 'rail__btn active':'rail__btn'} onClick={() => setActiveRail('error')} aria-label="Error Help">
            <IconAlert />
          </button>
          <button className={activeRail==='tools'? 'rail__btn active':'rail__btn'} onClick={() => setActiveRail('tools')} aria-label="Tools">
            <IconWrench />
          </button>
          <button className={activeRail==='resources'? 'rail__btn active':'rail__btn'} onClick={() => setActiveRail('resources')} aria-label="Resources">
            <IconGlobe />
          </button>
          <button className={activeRail==='settings'? 'rail__btn active':'rail__btn'} onClick={() => setActiveRail('settings')} aria-label="Settings">
            <IconGear />
          </button>
        </aside>
        {!collapsed && (
          <nav className="sidebar__panel" role="navigation" aria-label="Primary" id="primary-navigation">
            {activeRail === 'home' && (
              <ul className="panel__list">
                <li className="panel__title">Home</li>
                <li><NavLink to="/" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Dashboard</NavLink></li>
                <li><NavLink to="/about" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>About</NavLink></li>
              </ul>
            )}
            {activeRail === 'estimating' && (
              <ul className="panel__list">
                <li className="panel__title">Estimating</li>
                <li><NavLink to="/planning" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Planning</NavLink></li>
                <li><NavLink to="/licensing" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Licensing</NavLink></li>
              </ul>
            )}
            {activeRail === 'error' && (
              <ul className="panel__list">
                <li className="panel__title">Error Help</li>
                <li><NavLink to="/expression" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Expression Tester</NavLink></li>
                <li><NavLink to="/delegation" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Delegation Check</NavLink></li>
                <li><NavLink to="/diagnostics" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Diagnostics</NavLink></li>
              </ul>
            )}
            {activeRail === 'tools' && (
              <ul className="panel__list">
                <li className="panel__title">Tools</li>
                <li><NavLink to="/snippets" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Snippets</NavLink></li>
                <li><NavLink to="/formatter" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Flow Formatter</NavLink></li>
                <li><NavLink to="/dataverse" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Dataverse Lookup</NavLink></li>
                <li><NavLink to="/packs" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Packs</NavLink></li>
              </ul>
            )}
            {activeRail === 'resources' && (
              <ul className="panel__list">
                <li className="panel__title">Resources</li>
                <li><NavLink to="/icons" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Icons</NavLink></li>
                <li><NavLink to="/roadmap" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Roadmap</NavLink></li>
              </ul>
            )}
            {activeRail === 'settings' && (
              <ul className="panel__list">
                <li className="panel__title">Settings</li>
                <li><NavLink to="/settings" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>General</NavLink></li>
              </ul>
            )}
          </nav>
        )}
      </div>
      <div className="sidebar__footer">
        <small>v0.1</small>
      </div>
    </aside>
  )
}
