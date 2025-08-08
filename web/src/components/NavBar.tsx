import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import './NavBar.css'

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
            <span className="rail__icon">🏠</span>
          </button>
          <button className={activeRail==='estimating'? 'rail__btn active':'rail__btn'} onClick={() => setActiveRail('estimating')} aria-label="Estimating">
            <span className="rail__icon">🧮</span>
          </button>
          <button className={activeRail==='error'? 'rail__btn active':'rail__btn'} onClick={() => setActiveRail('error')} aria-label="Error Help">
            <span className="rail__icon">🛟</span>
          </button>
          <button className={activeRail==='tools'? 'rail__btn active':'rail__btn'} onClick={() => setActiveRail('tools')} aria-label="Tools">
            <span className="rail__icon">🧰</span>
          </button>
          <button className={activeRail==='resources'? 'rail__btn active':'rail__btn'} onClick={() => setActiveRail('resources')} aria-label="Resources">
            <span className="rail__icon">🌐</span>
          </button>
          <button className={activeRail==='settings'? 'rail__btn active':'rail__btn'} onClick={() => setActiveRail('settings')} aria-label="Settings">
            <span className="rail__icon">⚙️</span>
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
                <li><NavLink to="/about" className={({isActive}) => isActive? 'panel__item active':'panel__item'}>About</NavLink></li>
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
