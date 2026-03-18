import { members } from './data'

/**
 * The webring widget links to:
 *   https://math-webring.vercel.app/#<site-url>?nav=prev
 *   https://math-webring.vercel.app/#<site-url>?nav=next
 *
 * This function parses window.location.hash, finds the current member,
 * and redirects to the appropriate neighbour. Returns true if a redirect
 * was triggered so the caller can skip rendering.
 */
export function handleNavRedirect(): boolean {
  const raw = window.location.hash.slice(1) // strip leading '#'
  if (!raw) return false

  // Split off the ?nav= query that some browsers append to the hash
  const [siteRaw, query = ''] = raw.split('?')
  const site = decodeURIComponent(siteRaw).replace(/\/$/, '')
  const params = new URLSearchParams(query)
  const nav = params.get('nav')

  if (!nav) return false // visiting the member's page directly, no redirect

  const idx = members.findIndex(
    (m) => m.website.replace(/\/$/, '') === site,
  )

  if (idx === -1) return false // unknown site, fall through to 404 state

  const total = members.length
  const target =
    nav === 'prev'
      ? members[(idx - 1 + total) % total]
      : members[(idx + 1) % total]

  window.location.href = target!.website
  return true
}
