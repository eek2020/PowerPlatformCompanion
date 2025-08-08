import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './NavBar.css'

export default function NavBar() {
  const [collapsed, setCollapsed] = useState(false)
  const [estimatingOpen, setEstimatingOpen] = useState(false)
  const [errorHelpOpen, setErrorHelpOpen] = useState(false)

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
      <nav className="sidebar__nav" role="navigation" aria-label="Primary" id="primary-navigation">
        <ul className="nav__list">
          <li>
            <NavLink to="/snippets" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
              <span className="nav__label">Snippets</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/formatter" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
              <span className="nav__label">Flow Formatter</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/resources" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
              <span className="nav__label">Resources</span>
            </NavLink>
          </li>
          <li className="nav__section" aria-label="Error Help">
            <button
              className="nav__section__toggle"
              aria-expanded={errorHelpOpen}
              aria-controls="error-help-group"
              onClick={() => setErrorHelpOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                width: '100%', background: 'transparent', border: 'none', color: 'inherit',
                cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left'
              }}
            >
              <span>{errorHelpOpen ? '▾' : '▸'}</span>
              <span>Error Help</span>
            </button>
          </li>
          {errorHelpOpen && (
            <>
              <li>
                <NavLink to="/expression" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
                  <span className="nav__label">Expression Tester</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/delegation" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
                  <span className="nav__label">Delegation Check</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/diagnostics" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
                  <span className="nav__label">Diagnostics</span>
                </NavLink>
              </li>
            </>
          )}
          <li className="nav__section" aria-label="Estimating">
            <button
              className="nav__section__toggle"
              aria-expanded={estimatingOpen}
              aria-controls="estimating-group"
              onClick={() => setEstimatingOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                width: '100%', background: 'transparent', border: 'none', color: 'inherit',
                cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left'
              }}
            >
              <span>{estimatingOpen ? '▾' : '▸'}</span>
              <span>Estimating</span>
            </button>
          </li>
          {estimatingOpen && (
            <>
              <li>
                <NavLink to="/planning" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
                  <span className="nav__label">Planning</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/licensing" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
                  <span className="nav__label">Licensing</span>
                </NavLink>
              </li>
            </>
          )}
          <li>
            <NavLink to="/icons" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
              <span className="nav__label">Icons</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/diagnostics" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
              <span className="nav__icon">🩺</span>
              <span className="nav__label">Diagnostics</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/roadmap" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
              <span className="nav__label">Roadmap</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/packs" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
              <span className="nav__label">Packs</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dataverse" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
              <span className="nav__label">Dataverse Lookup</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
              <span className="nav__label">Settings</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
              <span className="nav__label">About</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="sidebar__footer">
        <small>v0.1</small>
      </div>
    </aside>
  )
}
