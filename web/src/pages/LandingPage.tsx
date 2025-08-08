import { Link } from 'react-router-dom'
import logo from '/makermate.svg'
import './landing.css'

export default function LandingPage() {
  return (
    <section className="landing" aria-labelledby="landing-title">
      <div className="landing__container">
        <div className="landing__intro">
          <img src={logo} alt="MakerMate logo" className="landing__logo" />
          <h1 id="landing-title" className="landing__title">MakerMate</h1>
          <p className="landing__tagline">Your offline‑friendly companion for building on Microsoft Power Platform.</p>
          <p className="landing__desc">
            MakerMate brings together everyday maker utilities in one lightweight, privacy‑respecting tool.
            Test expressions, check delegation, format flows, explore resources, and plan work — all in your browser.
          </p>
          <div className="landing__cta" role="navigation" aria-label="Primary actions">
            <Link className="btn btn--primary" to="/snippets">Explore Snippets</Link>
            <Link className="btn btn--ghost" to="/expression">Try Expression Tester</Link>
          </div>
        </div>
        <div className="landing__grid" aria-label="Highlights">
          <Feature title="Snippets" emoji="📄" to="/snippets">
            Curated examples for Power Fx and Power Automate to speed up common tasks.
          </Feature>
          <Feature title="Delegation Check" emoji="🔍" to="/delegation">
            Quickly sanity‑check query patterns for delegation limitations.
          </Feature>
          <Feature title="Flow Formatter" emoji="🧰" to="/formatter">
            Make large flow JSON readable for reviews and diffs.
          </Feature>
          <Feature title="Resources" emoji="🌐" to="/resources">
            Hand‑picked links, docs, and community articles.
          </Feature>
        </div>
      </div>
    </section>
  )
}

function Feature({ title, emoji, to, children }: { title: string; emoji: string; to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="feature" aria-label={`${title} — open`}>
      <span className="feature__icon" aria-hidden="true">{emoji}</span>
      <div className="feature__body">
        <h2 className="feature__title">{title}</h2>
        <p className="feature__text">{children}</p>
      </div>
    </Link>
  )
}
