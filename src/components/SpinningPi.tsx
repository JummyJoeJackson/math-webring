import { useEffect, useRef } from 'react'

const COLS = 72
const ROWS = 26
const CHARS = '.,-~:;=!*#$@'

const K2 = 6.0
const K1 = 135
const D = 0.25  // extrusion half-depth

const LL = Math.sqrt(0.5 * 0.5 + 0.8 * 0.8 + 1.0 * 1.0)
const LX = 0.5 / LL, LY = 0.8 / LL, LZ = -1.0 / LL

type Vec3 = [number, number, number]
interface Face { origin: Vec3; uDir: Vec3; vDir: Vec3; normal: Vec3 }

// Rectangular box faces, optionally skipping the bottom face
function boxFaces(x0: number, x1: number, y0: number, y1: number, skipBottom = false): Face[] {
  const dx = x1 - x0, dy = y1 - y0, dz = 2 * D
  const faces: Face[] = [
    { origin: [x0, y0,  D], uDir: [dx, 0, 0],  vDir: [0, dy, 0],  normal: [0, 0,  1] }, // front
    { origin: [x1, y0, -D], uDir: [-dx, 0, 0], vDir: [0, dy, 0],  normal: [0, 0, -1] }, // back
    { origin: [x0, y1,  D], uDir: [dx, 0, 0],  vDir: [0, 0, -dz], normal: [0, 1,  0] }, // top
    { origin: [x1, y0, -D], uDir: [0, dy, 0],  vDir: [0, 0, dz],  normal: [1, 0,  0] }, // right
    { origin: [x0, y0,  D], uDir: [0, dy, 0],  vDir: [0, 0, -dz], normal: [-1, 0, 0] }, // left
  ]
  if (!skipBottom) {
    faces.push({ origin: [x0, y0, -D], uDir: [dx, 0, 0], vDir: [0, 0, dz], normal: [0, -1, 0] })
  }
  return faces
}

// Pi: top bar (full box) + two legs (open-bottomed, capped with a semicylinder)
const TOP_BAR  = boxFaces(-1.0, 1.0, 0.52, 0.88)
const LEFT_LEG = boxFaces(-0.85, -0.45, -0.88, 0.52, true)
const RIGHT_LEG = boxFaces(0.45, 0.85, -0.88, 0.52, true)
const ALL_FLAT_FACES = [...TOP_BAR, ...LEFT_LEG, ...RIGHT_LEG]

// Rounded bottom caps: one per leg
// cx/cy = center of the semicircle, r = leg half-width (= 0.2)
const LEG_CAPS = [
  { cx: -0.65, cy: -0.88, r: 0.2 },
  { cx:  0.65, cy: -0.88, r: 0.2 },
]

export default function SpinningPi() {
  const preRef = useRef<HTMLPreElement>(null)
  const rafRef = useRef<number>(0)
  const tRef = useRef(0)

  useEffect(() => {
    const frame = () => {
      const t = tRef.current
      const A = Math.sin(t * 0.4) * 0.35  // gentle X wobble
      const B = t                           // Y spin

      const cosA = Math.cos(A), sinA = Math.sin(A)
      const cosB = Math.cos(B), sinB = Math.sin(B)

      const output = new Array(COLS * ROWS).fill(' ')
      const zbuf = new Array(COLS * ROWS).fill(-Infinity)

      // Project a 3D point onto the grid with z-buffering
      function plot(x: number, y: number, z: number, ch: string) {
        const ry1 = y * cosA - z * sinA
        const rz1 = y * sinA + z * cosA
        const rx2 = x * cosB + rz1 * sinB
        const ry2 = ry1
        const rz2 = -x * sinB + rz1 * cosB
        const zd = rz2 + K2
        if (zd <= 0.1) return
        const depth = 1 / zd
        const xp = Math.round(COLS / 2 + K1 * rx2 * depth)
        const yp = Math.round(ROWS / 2 - K1 * ry2 * depth * 0.45)
        if (xp < 0 || xp >= COLS || yp < 0 || yp >= ROWS) return
        const idx = yp * COLS + xp
        if (depth > zbuf[idx]) { zbuf[idx] = depth; output[idx] = ch }
      }

      // Compute char from a rotated normal + light
      function charFromNormal(nx: number, ny: number, nz: number): string {
        const nry1 = ny * cosA - nz * sinA
        const nrz1 = ny * sinA + nz * cosA
        const nrx2 = nx * cosB + nrz1 * sinB
        const nry2 = nry1
        const nrz2 = -nx * sinB + nrz1 * cosB
        const dot = nrx2 * LX + nry2 * LY + nrz2 * LZ
        const lum = 0.15 + 0.85 * Math.max(0, dot)
        return CHARS[Math.min(CHARS.length - 1, Math.floor(lum * (CHARS.length - 1)))]
      }

      // --- Flat rectangular faces ---
      const N = 85
      for (const { origin, uDir, vDir, normal } of ALL_FLAT_FACES) {
        const ch = charFromNormal(...normal)
        for (let si = 0; si <= N; si++) {
          const s = si / N
          for (let ti = 0; ti <= N; ti++) {
            const tv = ti / N
            plot(
              origin[0] + s * uDir[0] + tv * vDir[0],
              origin[1] + s * uDir[1] + tv * vDir[1],
              origin[2] + s * uDir[2] + tv * vDir[2],
              ch,
            )
          }
        }
      }

      // --- Rounded leg bottoms ---
      const NT = 50  // angular samples around semicircle
      const NZ = 20  // z samples along cylinder
      const NR = 15  // radial samples for end caps

      for (const { cx, cy, r } of LEG_CAPS) {
        // Cylinder surface: lower semicircle, theta from π → 2π
        for (let ti = 0; ti <= NT; ti++) {
          const theta = Math.PI + (ti / NT) * Math.PI
          const ct = Math.cos(theta), st = Math.sin(theta)
          const ch = charFromNormal(ct, st, 0)  // outward radial normal
          for (let zi = 0; zi <= NZ; zi++) {
            const z = -D + (zi / NZ) * 2 * D
            plot(cx + r * ct, cy + r * st, z, ch)
          }
        }

        // Flat semicircular end caps at z = ±D
        for (const [z_cap, nz_cap] of [[ D, 1], [-D, -1]] as [number, number][]) {
          const ch = charFromNormal(0, 0, nz_cap)
          for (let ti = 0; ti <= NT; ti++) {
            const theta = Math.PI + (ti / NT) * Math.PI
            const ct = Math.cos(theta), st = Math.sin(theta)
            for (let ri = 0; ri <= NR; ri++) {
              const rad = (ri / NR) * r
              plot(cx + rad * ct, cy + rad * st, z_cap, ch)
            }
          }
        }
      }

      if (preRef.current) {
        let text = ''
        for (let row = 0; row < ROWS; row++) {
          text += output.slice(row * COLS, (row + 1) * COLS).join('') + '\n'
        }
        preRef.current.textContent = text
      }

      tRef.current += 0.006
      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <pre
      ref={preRef}
      aria-hidden="true"
      style={{
        fontFamily: 'var(--mono)',
        fontSize: '13px',
        lineHeight: '1.2',
        color: 'var(--pink)',
        textAlign: 'center',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    />
  )
}
