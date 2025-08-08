import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './NavBar.css'

export default function NavBar() {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const cls = 'sidebar-collapsed'
    if (collapsed) document.body.classList.add(cls)
    else document.body.classList.remove(cls)
  }, [collapsed])

  return (
    <aside className={collapsed ? 'sidebar collapsed' : 'sidebar'}>
      <div className="sidebar__top">
        <Link to="/" className="brand" aria-label="MakerMate Home">
          <span className="brand__logo">⚡️</span>
          <span className="brand__name">MakerMate</span>
        </Link>
        <button className="sidebar__toggle" onClick={() => setCollapsed(v => !v)} aria-label="Toggle sidebar">
          {collapsed ? '›' : '‹'}
        </button>
      </div>
      <nav className="sidebar__nav">
        <NavLink to="/snippets" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
          <span className="nav__icon">📄</span>
          <span className="nav__label">Snippets</span>
        </NavLink>
        <NavLink to="/delegation" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
          <span className="nav__icon">🔍</span>
          <span className="nav__label">Delegation Check</span>
        </NavLink>
        <NavLink to="/formatter" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
          <span className="nav__icon">🧰</span>
          <span className="nav__label">Flow Formatter</span>
        </NavLink>
      </nav>
      <div className="sidebar__footer">
        <small>v0.1</small>
      </div>
    </aside>
  )
}
