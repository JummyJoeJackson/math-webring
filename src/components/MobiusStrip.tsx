import { useRef, useEffect, useState, useCallback } from 'react';
import type { Member } from '../data';

interface Props {
  members: Member[];
  highlightedSite?: string | null;
}

const W = 500;
const H = 390;
const CX = W / 2;
const CY = H / 2;
const R = 115;       // strip radius
const SW = 52;       // strip half-width
const FOV = 380;     // perspective
const TILT = 0.42;   // static X tilt
const U_SEGS = 90;   // smoothness around loop
const V_SEGS = 10;   // divisions across width
const SPEED = 0.007; // rotation speed

function mobiusPoint(u: number, v: number): [number, number, number] {
  return [
    (R + SW * v * Math.cos(u / 2)) * Math.cos(u),
    (R + SW * v * Math.cos(u / 2)) * Math.sin(u),
    SW * v * Math.sin(u / 2),
  ];
}

function rotateXZ(x: number, y: number, z: number, rx: number, ry: number): [number, number, number] {
  const y1 = y * Math.cos(rx) - z * Math.sin(rx);
  const z1 = y * Math.sin(rx) + z * Math.cos(rx);
  return [
    x * Math.cos(ry) + z1 * Math.sin(ry),
    y1,
    -x * Math.sin(ry) + z1 * Math.cos(ry),
  ];
}

function project(x: number, y: number, z: number): [number, number] {
  const s = FOV / (FOV - z);
  return [CX + x * s, CY + y * s];
}

export default function MobiusStrip({ members, highlightedSite }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const angleRef = useRef(0);
  const nodeScreenPos = useRef<{ x: number; y: number; z: number }[]>([]);
  const hoveredRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const highlightRef = useRef(highlightedSite);
  highlightRef.current = highlightedSite;

  const [hovered, setHovered] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function draw() {
      frameRef.current = requestAnimationFrame(draw);
      if (!pausedRef.current) angleRef.current += SPEED;
      const ry = angleRef.current;

      ctx.clearRect(0, 0, W, H);

      // --- Build strip faces ---
      type Face = { pts: [number, number][]; avgZ: number };
      const faces: Face[] = [];

      for (let i = 0; i < U_SEGS; i++) {
        for (let j = 0; j < V_SEGS; j++) {
          const u0 = (i / U_SEGS) * 2 * Math.PI;
          const u1 = ((i + 1) / U_SEGS) * 2 * Math.PI;
          const v0 = -1 + (2 * j) / V_SEGS;
          const v1 = -1 + (2 * (j + 1)) / V_SEGS;

          const rotated = (
            [mobiusPoint(u0, v0), mobiusPoint(u1, v0), mobiusPoint(u1, v1), mobiusPoint(u0, v1)] as [number, number, number][]
          ).map(([x, y, z]) => rotateXZ(x, y, z, TILT, ry));

          const avgZ = rotated.reduce((s, [,, z]) => s + z, 0) / 4;
          faces.push({ pts: rotated.map(([x, y, z]) => project(x, y, z)), avgZ });
        }
      }

      faces.sort((a, b) => a.avgZ - b.avgZ);

      for (const { pts, avgZ } of faces) {
        const d = (avgZ + R + SW) / (2 * (R + SW));
        const alpha = (0.06 + d * 0.22).toFixed(3);
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
        ctx.closePath();
        ctx.fillStyle = `rgba(232,80,138,${alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(232,80,138,${alpha})`;
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }

      // --- Draw member nodes on center line (v=0) ---
      const n = members.length;
      const nodeData = members.map((member, idx) => {
        const u = (idx / Math.max(n, 1)) * 2 * Math.PI;
        const [mx, my, mz] = mobiusPoint(u, 0);
        const [rx, ry2, rz] = rotateXZ(mx, my, mz, TILT, ry);
        const [px, py] = project(rx, ry2, rz);
        return { member, idx, px, py, rz };
      });

      nodeData.sort((a, b) => a.rz - b.rz);
      const newPos: typeof nodeScreenPos.current = [];

      for (const { member, idx, px, py, rz } of nodeData) {
        newPos[idx] = { x: px, y: py, z: rz };

        const d = (rz + R + SW) / (2 * (R + SW));
        const alpha = 0.3 + d * 0.7;
        const nodeR = 3.5 + d * 3;

        const hostname = new URL(member.website).hostname;
        const norm = highlightRef.current?.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const isHighlighted = hostname === norm;
        const isHovered = hoveredRef.current === idx;
        const isActive = isHovered || isHighlighted;

        if (isActive) {
          ctx.beginPath();
          ctx.arc(px, py, nodeR + 9, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(232,80,138,0.12)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(px, py, isActive ? nodeR + 2.5 : nodeR, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#e8508a' : `rgba(232,80,138,${alpha.toFixed(2)})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${(alpha * 0.55).toFixed(2)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      nodeScreenPos.current = newPos;
    }

    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [members]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);

    let closest = -1;
    let closestDist = 28;
    nodeScreenPos.current.forEach((pos, i) => {
      const d = Math.hypot(pos.x - mx, pos.y - my);
      if (d < closestDist) { closestDist = d; closest = i; }
    });

    hoveredRef.current = closest >= 0 ? closest : null;
    setHovered(closest >= 0 ? closest : null);
    setTooltip(closest >= 0 ? { x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
  }, []);

  const hoveredMember = hovered !== null ? members[hovered] : null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ display: 'block', maxWidth: '100%', cursor: hovered !== null ? 'pointer' : 'default' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; hoveredRef.current = null; setHovered(null); setTooltip(null); }}
        onClick={() => hovered !== null && window.open(members[hovered].website, '_blank')}
      />
      {hoveredMember && tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltip.x > W * 0.6 ? tooltip.x - 160 : tooltip.x + 14,
          top: tooltip.y - 20,
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: 5,
          padding: '6px 12px',
          pointerEvents: 'none',
          zIndex: 10,
          whiteSpace: 'nowrap',
        }}>
          <div style={{ color: '#e8e8e8', fontSize: 11, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            {hoveredMember.name}
          </div>
          <div style={{ color: '#e8508a', fontSize: 10, fontFamily: 'Courier New, monospace' }}>
            {new URL(hoveredMember.website).hostname}
          </div>
        </div>
      )}
    </div>
  );
}
