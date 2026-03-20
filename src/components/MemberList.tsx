import type { Member } from '../data'
import MemberCard from './MemberCard'

interface Props {
  members: Member[]
  highlightedSite?: string | null
}

export default function MemberList({ members, highlightedSite }: Props) {
  if (members.length === 0) {
    return (
      <p className="empty">
        No members yet —{' '}
        <a
          href="https://github.com/JummyJoeJackson/math-webring#joining-the-webring"
          target="_blank"
          rel="noopener noreferrer"
        >
          be the first to join!
        </a>
      </p>
    )
  }

  return (
    <ul className="member-list">
      {members.map((member) => {
        const isHighlighted = member.website.replace(/\/$/, '') === highlightedSite;
        return (
          <li key={member.website}>
            <MemberCard member={member} isHighlighted={isHighlighted} />
          </li>
        )
      })}
    </ul>
  )
}
