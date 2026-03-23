import { useRef, useEffect, useState, useCallback } from 'react';
import type { Member } from '../data';

interface Props {
  members: Member[];
  highlightedSite?: string | null;
}

const W = 720;
const H = 460;
const CX = W / 2 + 80;
const CY = H / 2;
const R = 150;       // strip radius (larger)
const SW = 65;       // strip half-width (larger)
const FOV = 420;
const TILT = 0.42;
const U_SEGS = 90;
const V_SEGS = 10;
const SPEED = 0.007;
const ICON_R = 11;   // favicon circle radius

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
  const highlightRef = useRef(highlightedSite);
  const faviconImgs = useRef<Map<number, HTMLImageElement | null>>(new Map());
  highlightRef.current = highlightedSite;

  const [hovered, setHovered] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);

  // Preload favicons
  useEffect(() => {
    members.forEach((member, idx) => {
      const hostname = new URL(member.website).hostname;
      const img = new Image();
      img.onload = () => faviconImgs.current.set(idx, img);
      img.onerror = () => {
        const img2 = new Image();
        img2.onload = () => faviconImgs.current.set(idx, img2);
        img2.onerror = () => faviconImgs.current.set(idx, null);
        img2.src = `https://${hostname}/favicon.svg`;
      };
      img.src = `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
    });
  }, [members]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function draw() {
      frameRef.current = requestAnimationFrame(draw);
      angleRef.current += SPEED;
      const ry = angleRef.current;

      ctx.clearRect(0, 0, W, H);

      // Strip faces
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

      // Member nodes
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
        const alpha = 0.35 + d * 0.65;
        const hostname = new URL(member.website).hostname;
        const norm = highlightRef.current?.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const isHighlighted = hostname === norm;
        const isActive = hoveredRef.current === idx || isHighlighted;
        const img = faviconImgs.current.get(idx);
        const imgReady = img && img.complete && img.naturalWidth > 0;

        // Glow
        if (isActive) {
          ctx.beginPath();
          ctx.arc(px, py, ICON_R + 8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(232,80,138,0.15)';
          ctx.fill();
        }

        if (imgReady) {
          // Circular clipped favicon
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(px, py, ICON_R, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img!, px - ICON_R, py - ICON_R, ICON_R * 2, ICON_R * 2);
          ctx.restore();
        } else {
          // Fallback filled circle
          ctx.beginPath();
          ctx.arc(px, py, ICON_R, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232,80,138,${alpha.toFixed(2)})`;
          ctx.fill();
        }

        // Border ring
        ctx.beginPath();
        ctx.arc(px, py, ICON_R, 0, Math.PI * 2);
        ctx.strokeStyle = isActive ? '#ffffff' : `rgba(255,255,255,${(alpha * 0.7).toFixed(2)})`;
        ctx.lineWidth = isActive ? 2 : 1;
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
    let closestDist = ICON_R + 12;
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
        onMouseLeave={() => { hoveredRef.current = null; setHovered(null); setTooltip(null); }}
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
