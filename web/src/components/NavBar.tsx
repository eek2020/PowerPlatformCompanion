import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import './NavBar.css'

// Outline SVG icons (monochrome, scalable)
const IconHome = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="rail__icon" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11.5 12 4l9 7.5"/>
    <path d="M5.5 10v9a1 1 0 0 0 1 1H17.5a1 1 0 0 0 1-1v-9"/>
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
// Simple blocks icon for Solution Architecture rail
const IconBlocks = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="rail__icon" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="8" height="8" rx="1"/>
    <rect x="13" y="3" width="8" height="8" rx="1"/>
    <rect x="3" y="13" width="8" height="8" rx="1"/>
    <rect x="13" y="13" width="8" height="8" rx="1"/>
  </svg>
)
export default function NavBar() {
  // Start collapsed on load for a cleaner initial view
  const [collapsed, setCollapsed] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  type RailKey = 'home' | 'error' | 'devtools' | 'sa' | 'resources' | 'settings'
  const routeRail: RailKey = useMemo(() => {
    const p = location.pathname
    if (p.startsWith('/planning')) return 'sa'
    if (p.startsWith('/licensing')) return 'sa'
    if (p.startsWith('/expression') || p.startsWith('/delegation') || p.startsWith('/diagnostics')) return 'error'
    if (p.startsWith('/snippets') || p.startsWith('/formatter') || p.startsWith('/dataverse') || p.startsWith('/packs')) return 'devtools'
    if (p.startsWith('/icons')) return 'devtools'
    if (p.startsWith('/sa/')) return 'sa'
    if (p.startsWith('/roadmap')) return 'sa'
    if (p.startsWith('/about')) return 'resources'
    if (p.startsWith('/settings')) return 'settings'
    return 'home'
  }, [location.pathname])

  const [activeRail, setActiveRail] = useState<RailKey>('home')
  // Hover state for flyout
  const [hoveredRail, setHoveredRail] = useState<RailKey | null>(null)
  const [flyoutTop, setFlyoutTop] = useState<number>(0)
  const [flyoutArrowTop, setFlyoutArrowTop] = useState<number>(20)
  const [flyoutTargetCenter, setFlyoutTargetCenter] = useState<number>(0)
  const flyoutRef = useRef<HTMLDivElement | null>(null)
  const [hoveredLabel, setHoveredLabel] = useState<string>('')
  useEffect(() => { setActiveRail(routeRail) }, [routeRail])

  useEffect(() => {
    const cls = 'sidebar-collapsed'
    if (collapsed) document.body.classList.add(cls)
    else document.body.classList.remove(cls)
  }, [collapsed])

  // Clicking a rail navigates but does not auto-expand; preserves screen space.
  const openRail = (rail: RailKey, path: string) => {
    setActiveRail(rail)
    if (path) navigate(path)
  }

  // When hovering a rail, compute initial target center Y
  const onRailHover = (rail: RailKey, e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const btnRect = e.currentTarget.getBoundingClientRect()
      // Measure relative to the flyout's positioned container
      const container = e.currentTarget.closest('.sidebar__container') as HTMLElement | null
      const baseTop = container ? container.getBoundingClientRect().top : 0
      const center = btnRect.top - baseTop + btnRect.height / 2
      setFlyoutTargetCenter(center)
      // Label for custom tooltip
      const labelMap: Record<RailKey, string> = {
        home: 'Home',
        error: 'Error Help',
        devtools: 'Developer Tools',
        sa: 'Solution Architecture',
        resources: 'Resources',
        settings: 'Settings',
      }
      setHoveredLabel(labelMap[rail])
    } catch {
      setFlyoutTop(0)
    }
    setHoveredRail(rail)
  }

  // After flyout renders, center it to the hovered rail and position arrow
  useEffect(() => {
    const el = flyoutRef.current
    if (!el || !hoveredRail) return
    const padding = 6
    const viewportH = window.innerHeight
    const h = el.offsetHeight
    // Try to align the flyout's title center to the hovered rail center
    const titleEl = el.querySelector('.panel__title') as HTMLElement | null
    const titleTop = titleEl ? titleEl.offsetTop : 0
    const titleH = titleEl ? titleEl.offsetHeight : 0
    // Compute top so that: (top + titleTop + titleH/2) == flyoutTargetCenter
    let top = Math.round(flyoutTargetCenter - (titleTop + Math.max(0, titleH) / 2))
    // Clamp within viewport with small padding
    top = Math.max(padding, Math.min(viewportH - h - padding, top))
    // Arrow position relative to flyout
    const arrowTop = Math.round(flyoutTargetCenter - top)
    setFlyoutTop(top)
    setFlyoutArrowTop(Math.max(14, Math.min(h - 14, arrowTop)))
  }, [hoveredRail, flyoutTargetCenter])

  const clearHover = () => { setHoveredRail(null); setHoveredLabel('') }

  return (
    <aside
      className={collapsed ? 'sidebar collapsed' : 'sidebar'}
      aria-label="Sidebar"
    >
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
      <div className="sidebar__container" onMouseLeave={clearHover}>
        <aside className="sidebar__rail" aria-label="Primary sections">
          <button
            className={activeRail==='home'? 'rail__btn active':'rail__btn'}
            onClick={() => openRail('home','/')}
            onMouseEnter={(e) => onRailHover('home', e)}
            aria-label="Home"
          >
            <IconHome />
            <span className="rail__label">Home</span>
          </button>
          {/* Estimating moved under Solution Architecture rail */}
          <button
            className={activeRail==='error'? 'rail__btn active':'rail__btn'}
            onClick={() => openRail('error','/expression')}
            onMouseEnter={(e) => onRailHover('error', e)}
            aria-label="Error Help"
          >
            <IconAlert />
            <span className="rail__label">Error Help</span>
          </button>
          <button
            className={activeRail==='devtools'? 'rail__btn active':'rail__btn'}
            onClick={() => openRail('devtools','/snippets')}
            onMouseEnter={(e) => onRailHover('devtools', e)}
            aria-label="Developer Tools"
          >
            <IconWrench />
            <span className="rail__label">Developer Tools</span>
          </button>
          <button
            className={activeRail==='sa'? 'rail__btn active':'rail__btn'}
            onClick={() => openRail('sa','/sa/requirements')}
            onMouseEnter={(e) => onRailHover('sa', e)}
            aria-label="Solution Architecture"
          >
            <IconBlocks />
            <span className="rail__label">Solution Arch</span>
          </button>
          <button
            className={activeRail==='resources'? 'rail__btn active':'rail__btn'}
            onClick={() => openRail('resources','/icons')}
            onMouseEnter={(e) => onRailHover('resources', e)}
            aria-label="Resources"
          >
            <IconGlobe />
            <span className="rail__label">Resources</span>
          </button>
          <button
            className={activeRail==='settings'? 'rail__btn active':'rail__btn'}
            onClick={() => openRail('settings','/settings')}
            onMouseEnter={(e) => onRailHover('settings', e)}
            aria-label="Settings"
          >
            <IconGear />
            <span className="rail__label">Settings</span>
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
            {/* Estimating panel removed; links relocated under SA and Resources */}
            {activeRail === 'error' && (
              <ul className="panel__list">
                <li className="panel__title">Error Help</li>
                <li><NavLink to="/expression" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Expression Tester</NavLink></li>
                <li><NavLink to="/delegation" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Delegation Check</NavLink></li>
                <li><NavLink to="/diagnostics" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Diagnostics</NavLink></li>
              </ul>
            )}
            {activeRail === 'devtools' && (
              <ul className="panel__list">
                <li className="panel__title">Developer Tools</li>
                <li><NavLink to="/snippets" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Snippets</NavLink></li>
                <li><NavLink to="/formatter" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Flow Formatter</NavLink></li>
                <li><NavLink to="/dataverse" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Dataverse Lookup</NavLink></li>
                <li><NavLink to="/packs" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Packs</NavLink></li>
                <li><NavLink to="/icons" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Icons</NavLink></li>
              </ul>
            )}
            {activeRail === 'sa' && (
              <ul className="panel__list">
                <li className="panel__title">Solution Architecture</li>
                <li><NavLink to="/sa/estimating" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Estimating</NavLink></li>
                <li><NavLink to="/sa/requirements" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Requirements</NavLink></li>
                <li><NavLink to="/sa/hld" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>HLD</NavLink></li>
                <li><NavLink to="/sa/arm" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>ARM Catalog</NavLink></li>
                <li><NavLink to="/sa/erd" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>ERD</NavLink></li>
                <li><NavLink to="/roadmap" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Roadmap</NavLink></li>
                <li><NavLink to="/licensing" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Licensing</NavLink></li>
              </ul>
            )}
            {activeRail === 'resources' && (
              <ul className="panel__list">
                <li className="panel__title">Resources</li>
                <li><NavLink to="/about" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>About</NavLink></li>
              </ul>
            )}
            {activeRail === 'settings' && (
             <ul className="panel__list">
               <li className="panel__title">Settings</li>
               <li><NavLink to="/settings" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>General</NavLink></li>
               <li><NavLink to="/settings/ai/providers" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>AI Providers</NavLink></li>
               <li><NavLink to="/settings/ai/models" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>AI Models</NavLink></li>
               <li><NavLink to="/settings/ai/costs" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Cost Calculator</NavLink></li>
                {/* AI Bindings removed; consolidated into AI Providers page */}
             </ul>
           )}
         </nav>
        )}
        {collapsed && hoveredRail && (
          <nav
            className="sidebar__flyout"
            role="navigation"
            aria-label="Primary flyout"
            ref={flyoutRef}
            style={{ top: flyoutTop, ['--flyout-arrow-top' as any]: `${flyoutArrowTop}px` }}
            onMouseLeave={clearHover}
          >
            {hoveredRail === 'home' && (
              <ul className="panel__list">
                <li className="panel__title">Home</li>
                <li><NavLink to="/" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Dashboard</NavLink></li>
                <li><NavLink to="/about" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>About</NavLink></li>
              </ul>
            )}
            {hoveredRail === 'error' && (
              <ul className="panel__list">
                <li className="panel__title">Error Help</li>
                <li><NavLink to="/expression" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Expression Tester</NavLink></li>
                <li><NavLink to="/delegation" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Delegation Check</NavLink></li>
                <li><NavLink to="/diagnostics" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Diagnostics</NavLink></li>
              </ul>
            )}
            {hoveredRail === 'devtools' && (
              <ul className="panel__list">
                <li className="panel__title">Developer Tools</li>
                <li><NavLink to="/snippets" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Snippets</NavLink></li>
                <li><NavLink to="/formatter" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Flow Formatter</NavLink></li>
                <li><NavLink to="/dataverse" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Dataverse Lookup</NavLink></li>
                <li><NavLink to="/packs" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Packs</NavLink></li>
                <li><NavLink to="/icons" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Icons</NavLink></li>
              </ul>
            )}
            {hoveredRail === 'sa' && (
              <ul className="panel__list">
                <li className="panel__title">Solution Architecture</li>
                <li><NavLink to="/sa/estimating" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Estimating</NavLink></li>
                <li><NavLink to="/sa/requirements" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Requirements</NavLink></li>
                <li><NavLink to="/sa/hld" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>HLD</NavLink></li>
                <li><NavLink to="/sa/arm" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>ARM Catalog</NavLink></li>
                <li><NavLink to="/sa/erd" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>ERD</NavLink></li>
                <li><NavLink to="/roadmap" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Roadmap</NavLink></li>
                <li><NavLink to="/licensing" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Licensing</NavLink></li>
              </ul>
            )}
            {hoveredRail === 'resources' && (
              <ul className="panel__list">
                <li className="panel__title">Resources</li>
                <li><NavLink to="/icons" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Icons</NavLink></li>
                <li><NavLink to="/roadmap" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Roadmap</NavLink></li>
                <li><NavLink to="/licensing" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Licensing</NavLink></li>
              </ul>
            )}
            {hoveredRail === 'settings' && (
             <ul className="panel__list">
               <li className="panel__title">Settings</li>
               <li><NavLink to="/settings" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>General</NavLink></li>
               <li><NavLink to="/settings/ai/providers" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>AI Providers</NavLink></li>
               <li><NavLink to="/settings/ai/models" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>AI Models</NavLink></li>
               <li><NavLink to="/settings/ai/costs" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>Cost Calculator</NavLink></li>
                {/* AI Bindings removed; consolidated into AI Providers page */}
             </ul>
           )}
         </nav>
        )}
        {collapsed && hoveredRail && (
          <div
            className="sidebar__tooltip"
            style={{ top: flyoutTargetCenter }}
          >{hoveredLabel}</div>
        )}
      </div>
      <div className="sidebar__footer">
        <small>v0.1</small>
      </div>
    </aside>
  )
}
