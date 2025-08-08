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
        <NavLink to="/expression" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
          <span className="nav__icon">🧪</span>
          <span className="nav__label">Expression Tester</span>
        </NavLink>
        <NavLink to="/delegation" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
          <span className="nav__icon">🔍</span>
          <span className="nav__label">Delegation Check</span>
        </NavLink>
        <NavLink to="/formatter" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
          <span className="nav__icon">🧰</span>
          <span className="nav__label">Flow Formatter</span>
        </NavLink>
        <NavLink to="/resources" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
          <span className="nav__icon">🌐</span>
          <span className="nav__label">Resources</span>
        </NavLink>
        <NavLink to="/planning" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
          <span className="nav__icon">🗓️</span>
          <span className="nav__label">Planning</span>
        </NavLink>
        <NavLink to="/icons" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
          <span className="nav__icon">🎨</span>
          <span className="nav__label">Icons</span>
        </NavLink>
        <NavLink to="/diagnostics" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
          <span className="nav__icon">🩺</span>
          <span className="nav__label">Diagnostics</span>
        </NavLink>
        <NavLink to="/roadmap" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
          <span className="nav__icon">🗺️</span>
          <span className="nav__label">Roadmap</span>
        </NavLink>
        <NavLink to="/packs" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
          <span className="nav__icon">📦</span>
          <span className="nav__label">Packs</span>
        </NavLink>
        <NavLink to="/dataverse" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
          <span className="nav__icon">🗂️</span>
          <span className="nav__label">Dataverse Lookup</span>
        </NavLink>
        <NavLink to="/licensing" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
          <span className="nav__icon">🧾</span>
          <span className="nav__label">Licensing</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
          <span className="nav__icon">⚙️</span>
          <span className="nav__label">Settings</span>
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'nav__item active' : 'nav__item'}>
          <span className="nav__icon">ℹ️</span>
          <span className="nav__label">About</span>
        </NavLink>
      </nav>
      <div className="sidebar__footer">
        <small>v0.1</small>
      </div>
    </aside>
  )
}
