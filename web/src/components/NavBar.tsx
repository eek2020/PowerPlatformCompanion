import { Link, NavLink } from 'react-router-dom'
import './NavBar.css'

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="brand">MakerMate</Link>
        <nav className="nav">
          <NavLink to="/snippets" className={({ isActive }) => isActive ? 'nav__link active' : 'nav__link'}>
            Snippets
          </NavLink>
          <NavLink to="/delegation" className={({ isActive }) => isActive ? 'nav__link active' : 'nav__link'}>
            Delegation Check
          </NavLink>
          <NavLink to="/formatter" className={({ isActive }) => isActive ? 'nav__link active' : 'nav__link'}>
            Flow Formatter
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
