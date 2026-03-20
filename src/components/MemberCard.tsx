import type { Member } from '../data'

interface Props {
  member: Member
  isHighlighted?: boolean
}

export default function MemberCard({ member, isHighlighted }: Props) {
  const hostname = new URL(member.website).hostname

  return (
    <a
      className={`member-card ${isHighlighted ? 'highlighted' : ''}`.trim()}
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
