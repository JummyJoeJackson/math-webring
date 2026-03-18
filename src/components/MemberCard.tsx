import type { Member } from '../data'

interface Props {
  member: Member
}

export default function MemberCard({ member }: Props) {
  const hostname = new URL(member.website).hostname

  return (
    <a
      className="member-card"
      href={member.website}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="member-name">{member.name}</span>
      <span className="member-site">{hostname}</span>
      <span className="member-year">{member.year}</span>
    </a>
  )
}
