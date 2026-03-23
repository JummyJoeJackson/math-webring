import { useEffect, useState } from 'react'
import { members } from './data'
import { handleNavRedirect } from './nav'
import MemberList from './components/MemberList'
import MobiusStrip from './components/MobiusStrip'

export default function App() {
  const [redirecting, setRedirecting] = useState(false)
  const [highlightedSite, setHighlightedSite] = useState<string | null>(null)

  useEffect(() => {
    if (handleNavRedirect()) {
      setRedirecting(true)
    } else {
      const raw = window.location.hash.slice(1)
      if (raw) {
        const [siteRaw] = raw.split('?')
        setHighlightedSite(decodeURIComponent(siteRaw).replace(/\/$/, ''))
      }
    }
  }, [])

  if (redirecting) {
    return (
      <div className="redirect">
        <p>Redirecting…</p>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="uw-logo-wrap">
        <img
          src="/uw-logo.avif"
          alt="University of Waterloo"
          className="uw-logo"
        />
      </div>
      <div className="content">
        <div className="content-left">
          <header className="header">
            <img src="/math-webring-pink.svg" alt="Math Webring logo" className="logo" />
            <div>
              <h1>UW Math Webring</h1>
              <p className="tagline">
                A webring for Mathematics students &amp; alumni at the University of Waterloo
              </p>
            </div>
          </header>
          <main className="content-list">
            <MemberList members={members} highlightedSite={highlightedSite} />
          </main>
        </div>
        <div className="content-pi">
          <MobiusStrip members={members} highlightedSite={highlightedSite} />
        </div>
      </div>

      <footer className="footer">
        <a
          href="https://github.com/JummyJoeJackson/math-webring"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <span>·</span>
        <a
          href="https://github.com/JummyJoeJackson/math-webring#joining-the-webring"
          target="_blank"
          rel="noopener noreferrer"
        >
          Join
        </a>
        <span>·</span>
        <p>&copy; 2026 Math Roomies :) et al.</p>
      </footer>
    </div>
  )
}
