import { useEffect, useState } from 'react'
import { members } from './data'
import { handleNavRedirect } from './nav'
import MemberList from './components/MemberList'

export default function App() {
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (handleNavRedirect()) {
      setRedirecting(true)
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

      <main>
        <MemberList members={members} />
      </main>

      <footer className="footer">
        <a
          href="https://github.com/ryanli/math-webring"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <span>·</span>
        <a
          href="https://github.com/ryanli/math-webring#joining-the-webring"
          target="_blank"
          rel="noopener noreferrer"
        >
          Join
        </a>
      </footer>
    </div>
  )
}
