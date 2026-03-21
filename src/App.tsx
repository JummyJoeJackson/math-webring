import { useEffect, useState } from 'react'
import { members } from './data'
import { handleNavRedirect } from './nav'
import MemberList from './components/MemberList'
import SpinningPi from './components/SpinningPi'

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
      <header className="header">
        <img src="/math-webring-pink.svg" alt="Math Webring logo" className="logo" />
        <div>
          <h1>Math Webring</h1>
          <p className="tagline">
            A webring for Mathematics students &amp; alumni at the University of Waterloo
          </p>
        </div>
      </header>

      <div className="content">
        <main className="content-list">
          <MemberList members={members} highlightedSite={highlightedSite} />
        </main>
        <div className="content-pi">
          <SpinningPi />
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
      </footer>
    </div>
  )
}
