import { useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 400
const LINE_THRESHOLD = 0.35

function simplex3D(x: number, y: number, z: number) {
  return Math.sin(x * 1.2 + y * 0.7) * Math.cos(y * 1.3 + z * 0.9) * Math.sin(z * 1.1 + x * 0.8)
}

function PlexusParticles({ mode }: { mode: string }) {
  const ref = useRef<THREE.Points>(null!)
  const linesRef = useRef<THREE.LineSegments>(null!)
  const time = useRef(0)

  const { positions, colors, speeds, linePositions, lineColors } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const col = new Float32Array(COUNT * 3)
    const spd = new Float32Array(COUNT)
    const lPos = new Float32Array(COUNT * 6)
    const lCol = new Float32Array(COUNT * 6)

    const palettes: Record<string, [number, number, number][]> = {
      'converge': [[1.0, 0.15, 0.25], [1.0, 0.3, 0.4], [0.9, 0.1, 0.2]],
      'orbit': [[1.0, 0.2, 0.3], [0.95, 0.1, 0.2], [1.0, 0.35, 0.45]],
      'wave': [[1.0, 0.15, 0.25], [1.0, 0.25, 0.35], [0.9, 0.1, 0.2]],
      'clock': [[1.0, 0.2, 0.3], [0.95, 0.15, 0.25], [1.0, 0.3, 0.4]],
      'stream': [[1.0, 0.15, 0.25], [1.0, 0.3, 0.4], [0.9, 0.1, 0.2]],
      'pulse': [[1.0, 0.15, 0.25], [0.95, 0.1, 0.2], [1.0, 0.25, 0.35]],
    }
    const palette = palettes[mode] || palettes['converge']

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3
      pos[i3] = (Math.random() - 0.5) * 3
      pos[i3 + 1] = (Math.random() - 0.5) * 2.5
      pos[i3 + 2] = (Math.random() - 0.5) * 2
      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i3] = c[0] + (Math.random() - 0.5) * 0.1
      col[i3 + 1] = c[1] + (Math.random() - 0.5) * 0.1
      col[i3 + 2] = c[2] + (Math.random() - 0.5) * 0.1
      spd[i] = 0.3 + Math.random() * 2.0
    }
    return { positions: pos, colors: col, speeds: spd, linePositions: lPos, lineColors: lCol }
  }, [mode])

  const basePos = useMemo(() => new Float32Array(positions), [positions])
  const baseColors = useMemo(() => new Float32Array(colors), [colors])

  useFrame((_, delta) => {
    time.current += delta * 0.8
    const t = time.current
    const posAttr = ref.current.geometry.attributes.position
    const colAttr = ref.current.geometry.attributes.color
    const arr = posAttr.array as Float32Array
    const col = colAttr.array as Float32Array
    const lAttr = linesRef.current.geometry.attributes.position
    const lColAttr = linesRef.current.geometry.attributes.color
    const lArr = lAttr.array as Float32Array
    const lCol = lColAttr.array as Float32Array
    let lineIdx = 0

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3
      const spd = speeds[i]
      const bx = basePos[i3]
      const by = basePos[i3 + 1]
      const bz = basePos[i3 + 2]
      const bc0 = baseColors[i3]
      const bc1 = baseColors[i3 + 1]
      const bc2 = baseColors[i3 + 2]

      if (mode === 'converge') {
        const angle = (i / COUNT) * Math.PI * 2
        const layer = Math.floor(i / (COUNT / 3))
        const radius = 1.4 - ((t * 0.4 * spd + layer * 0.3) % 2.0)
        const r = Math.max(0.08, radius)
        arr[i3] = Math.cos(angle + t * 0.4 * spd) * r + simplex3D(bx * 2, t, bz) * 0.15
        arr[i3 + 1] = Math.sin(angle + t * 0.3 * spd) * r * 0.8 + simplex3D(by * 2, t + 1, bx) * 0.15
        arr[i3 + 2] = Math.sin(angle * 0.6 + t * 0.2) * r * 0.4
        const glow = Math.max(0, 1 - r / 0.3)
        col[i3] = Math.min(1, bc0 + glow * 0.5)
        col[i3 + 1] = bc1 * (0.6 + glow * 0.4)
        col[i3 + 2] = bc2 * (0.6 + glow * 0.4)
      } else if (mode === 'orbit') {
        const phi = (i / COUNT) * Math.PI * 2
        const theta = Math.acos(2 * ((i * 0.618033) % 1) - 1)
        const orbitSpeed = 0.3 + (i % 7) * 0.1
        const r = 0.7 + Math.sin(t * 0.5 + i * 0.1) * 0.3
        arr[i3] = Math.sin(theta + t * orbitSpeed) * Math.cos(phi + t * 0.2) * r
        arr[i3 + 1] = Math.sin(theta + t * orbitSpeed) * Math.sin(phi + t * 0.2) * r * 0.6
        arr[i3 + 2] = Math.cos(theta + t * orbitSpeed) * r * 0.5
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + i * 0.05)
        col[i3] = bc0 * (0.7 + pulse * 0.3)
        col[i3 + 1] = bc1 * (0.7 + pulse * 0.3)
        col[i3 + 2] = bc2 * (0.7 + pulse * 0.3)
      } else if (mode === 'wave') {
        const gridX = (i % 20) - 10
        const gridY = Math.floor(i / 20) - 10
        const x = gridX * 0.25
        const z = gridY * 0.25
        const wave1 = Math.sin(x * 2 + t * 2.5) * 0.35
        const wave2 = Math.cos(z * 1.8 + t * 1.8) * 0.25
        const wave3 = Math.sin((x + z) * 1.5 + t * 3) * 0.15
        arr[i3] = x
        arr[i3 + 1] = wave1 + wave2 + wave3
        arr[i3 + 2] = z
        const h = (arr[i3 + 1] + 0.7) / 1.4
        col[i3] = bc0 * (0.7 + h * 0.3)
        col[i3 + 1] = bc1 * (0.4 + h * 0.3)
        col[i3 + 2] = bc2 * (0.3 + h * 0.3)
      } else if (mode === 'clock') {
        const isSweep = i > COUNT * 0.85
        const isCenter = i > COUNT * 0.8 && i <= COUNT * 0.85
        if (isSweep) {
          const sweepAngle = (t * 0.8) % (Math.PI * 2)
          const idx = i - Math.floor(COUNT * 0.85)
          const spread = (idx / (COUNT * 0.15)) * 0.4
          const a = sweepAngle + spread * 0.1
          const r = 0.3 + spread * 0.7
          arr[i3] = Math.cos(a) * r
          arr[i3 + 1] = Math.sin(a) * r
          arr[i3 + 2] = 0.05 * Math.sin(t * 5 + idx)
          const fade = 1 - spread
          col[i3] = bc0 * fade * 1.5
          col[i3 + 1] = bc1 * fade * 1.5
          col[i3 + 2] = bc2 * fade * 1.5
        } else if (isCenter) {
          const pulse = 0.8 + 0.2 * Math.sin(t * 4)
          arr[i3] = (Math.random() - 0.5) * 0.15 * pulse
          arr[i3 + 1] = (Math.random() - 0.5) * 0.15 * pulse
          arr[i3 + 2] = 0.1
          col[i3] = bc0; col[i3 + 1] = bc1; col[i3 + 2] = bc2
        } else {
          const angle = (i / (COUNT * 0.8)) * Math.PI * 2
          const isMark = i % Math.floor(COUNT * 0.8 / 12) === 0
          const r = isMark ? 0.85 : 0.9
          arr[i3] = Math.cos(angle) * r
          arr[i3 + 1] = Math.sin(angle) * r
          arr[i3 + 2] = Math.sin(t + i) * 0.02
          col[i3] = isMark ? bc0 * 1.2 : bc0 * 0.8
          col[i3 + 1] = isMark ? bc1 * 1.2 : bc1 * 0.8
          col[i3 + 2] = isMark ? bc2 * 1.2 : bc2 * 0.8
        }
      } else if (mode === 'stream') {
        const isStream1 = i < COUNT * 0.4
        const isStream2 = i >= COUNT * 0.4 && i < COUNT * 0.8
        const isMerge = i >= COUNT * 0.8
        const progress = ((t * 0.6 * spd + i * 0.01) % 1.2) - 0.6
        if (isStream1) {
          arr[i3] = progress
          arr[i3 + 1] = 0.3 + Math.sin(progress * 3 + t) * 0.15
          arr[i3 + 2] = Math.sin(progress * 5 + t * 2 + i) * 0.1
        } else if (isStream2) {
          arr[i3] = progress
          arr[i3 + 1] = -0.3 + Math.sin(progress * 3 + t + 2) * 0.15
          arr[i3 + 2] = Math.sin(progress * 5 + t * 2 + i) * 0.1
        } else {
          const merge = Math.min(1, Math.max(0, progress + 0.6))
          const yOff = (1 - merge) * (i % 2 === 0 ? 0.3 : -0.3)
          arr[i3] = progress
          arr[i3 + 1] = yOff * (1 - merge)
          arr[i3 + 2] = Math.sin(progress * 4 + t * 3) * 0.1 * merge
        }
        const speed = Math.abs(progress)
        col[i3] = bc0 * (0.6 + speed * 0.4)
        col[i3 + 1] = bc1 * (0.6 + speed * 0.4)
        col[i3 + 2] = bc2 * (0.6 + speed * 0.4)
      } else if (mode === 'pulse') {
        const ring = i % 5
        const ringPhase = (t * 1.8 + ring * 0.6) % 4
        const radius = ringPhase * 0.45
        const angle = (i / COUNT) * Math.PI * 2 * (ring + 1) * 0.3 + t * 0.2 * (ring % 2 === 0 ? 1 : -1)
        const fade = Math.max(0, 1 - ringPhase / 4)
        arr[i3] = Math.cos(angle) * radius + simplex3D(bx + t, by, bz) * 0.05
        arr[i3 + 1] = Math.sin(angle) * radius * 0.8 + simplex3D(bx, by + t, bz) * 0.05
        arr[i3 + 2] = Math.sin(angle * 2 + t) * 0.08
        col[i3] = bc0 * fade * 1.5
        col[i3 + 1] = bc1 * fade * 1.5
        col[i3 + 2] = bc2 * fade * 1.5
      }
    }
    posAttr.needsUpdate = true
    colAttr.needsUpdate = true

    // Plexus lines
    lineIdx = 0
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        if (lineIdx >= lArr.length / 3) break
        const dx = arr[i * 3] - arr[j * 3]
        const dy = arr[i * 3 + 1] - arr[j * 3 + 1]
        const dz = arr[i * 3 + 2] - arr[j * 3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < LINE_THRESHOLD) {
          const alpha = 1 - dist / LINE_THRESHOLD
          const li = lineIdx * 6
          lArr[li] = arr[i * 3]; lArr[li + 1] = arr[i * 3 + 1]; lArr[li + 2] = arr[i * 3 + 2]
          lArr[li + 3] = arr[j * 3]; lArr[li + 4] = arr[j * 3 + 1]; lArr[li + 5] = arr[j * 3 + 2]
          lCol[li] = col[i * 3] * alpha; lCol[li + 1] = col[i * 3 + 1] * alpha; lCol[li + 2] = col[i * 3 + 2] * alpha
          lCol[li + 3] = col[j * 3] * alpha; lCol[li + 4] = col[j * 3 + 1] * alpha; lCol[li + 5] = col[j * 3 + 2] * alpha
          lineIdx++
        }
      }
    }
    // Clear remaining
    for (let k = lineIdx * 6; k < lArr.length; k++) { lArr[k] = 0; lCol[k] = 0 }
    lAttr.needsUpdate = true
    lColAttr.needsUpdate = true
    linesRef.current.geometry.setDrawRange(0, lineIdx * 2)
  })

  return (
    <>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} vertexColors transparent opacity={1.0} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </>
  )
}

const SCENES: Record<string, string> = {
  'multi-provider': 'converge',
  'secure-auth': 'orbit',
  'analytics': 'wave',
  'schedule-deploys': 'clock',
  'git-webhooks': 'stream',
  'notifications': 'pulse',
}

export function ParticleCanvas({ scene }: { scene: string }) {
  const mode = SCENES[scene]
  if (!mode) return null

  return (
    <div className="absolute inset-0 opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      >
        <PlexusParticles mode={mode} />
      </Canvas>
    </div>
  )
}
