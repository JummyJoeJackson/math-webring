import { useState } from 'react';
import type { Member } from '../data';

interface Props {
  members: Member[];
  highlightedSite?: string | null;
}

const W = 480;
const H = 370;

// Structural key points of π, in priority order (most prominent first)
const KEY_POINTS = [
  { x: 40,  y: 75  },  // left end of bar
  { x: 440, y: 75  },  // right end of bar
  { x: 158, y: 338 },  // bottom of left leg
  { x: 322, y: 338 },  // bottom of right leg
  { x: 240, y: 75  },  // midpoint of bar
  { x: 168, y: 75  },  // left leg junction
  { x: 312, y: 75  },  // right leg junction
  { x: 163, y: 207 },  // midpoint of left leg
  { x: 317, y: 207 },  // midpoint of right leg
  { x: 104, y: 75  },  // quarter point of bar (left)
  { x: 376, y: 75  },  // quarter point of bar (right)
  { x: 163, y: 122 },  // upper-quarter of left leg
  { x: 317, y: 122 },  // upper-quarter of right leg
  { x: 160, y: 290 },  // lower-quarter of left leg
  { x: 320, y: 290 },  // lower-quarter of right leg
];

export default function NetworkPi({ members, highlightedSite }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const positions = members.map((_, i) => KEY_POINTS[i % KEY_POINTS.length]);

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', maxWidth: W, height: 'auto' }}
    >
      {/* π outline — thick and visible */}
      <line x1="40"  y1="75" x2="440" y2="75"  stroke="#e8508a" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      <line x1="168" y1="75" x2="158" y2="338" stroke="#e8508a" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      <line x1="312" y1="75" x2="322" y2="338" stroke="#e8508a" strokeWidth="3" strokeLinecap="round" opacity="0.35" />

      {/* Nodes */}
      {members.map((member, i) => {
        const pos = positions[i];
        const hostname = new URL(member.website).hostname;
        const normalizedHighlight = highlightedSite
          ?.replace(/^https?:\/\//, '')
          .replace(/\/$/, '');
        const isHighlighted =
          hostname === normalizedHighlight ||
          member.website.replace(/\/$/, '') === highlightedSite;
        const isHovered = hovered === i;
        const isActive = isHovered || isHighlighted;

        const tooltipLeft = pos.x > W / 2;
        const labelW = Math.max(member.name.length, hostname.length) * 6.5 + 24;
        const ttX = tooltipLeft ? pos.x - labelW - 14 : pos.x + 14;
        const ttY = pos.y - 26;

        return (
          <g
            key={member.website}
            style={{ cursor: 'pointer' }}
            onClick={() => window.open(member.website, '_blank')}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {isActive && <circle cx={pos.x} cy={pos.y} r={16} fill="#e8508a15" />}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={isActive ? 8 : 6}
              fill={isActive ? '#e8508a' : '#1a1a1a'}
              stroke="#e8508a"
              strokeWidth="2"
              style={{ transition: 'r 0.2s, fill 0.2s' }}
            />

            {isHovered && (
              <g>
                <rect
                  x={ttX} y={ttY}
                  width={labelW} height={44}
                  rx={5}
                  fill="#1a1a1a"
                  stroke="#2a2a2a"
                  strokeWidth="1"
                />
                <text
                  x={ttX + labelW / 2} y={ttY + 16}
                  fill="#e8e8e8" fontSize="11" fontWeight="700"
                  fontFamily="Space Grotesk, sans-serif"
                  textAnchor="middle"
                >
                  {member.name}
                </text>
                <text
                  x={ttX + labelW / 2} y={ttY + 32}
                  fill="#e8508a" fontSize="10"
                  fontFamily="Courier New, monospace"
                  textAnchor="middle"
                >
                  {hostname}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
