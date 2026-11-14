import { useMemo } from 'react'
import * as THREE from 'three'
import { handkerchiefTexture, laceTexture, ledgerTexture, paperFragmentTexture, pearlButtonTexture } from '@/game/materials/procedural'

/**
 * Modèles des pièces à conviction du vertical slice, centrés sur l'origine.
 * Utilisés dans la scène (positionnés) et dans la vue d'examen (rotation libre).
 */

function crumpledPlane(size: number, seed: number) {
  const geo = new THREE.PlaneGeometry(size, size, 24, 24)
  const pos = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z =
      Math.sin(x * 38 + seed) * 0.006 +
      Math.cos(y * 44 + seed * 2) * 0.005 +
      Math.sin((x + y) * 90) * 0.0022 +
      Math.max(0, 0.03 - Math.hypot(x - 0.03, y + 0.02) * 0.3)
    pos.setZ(i, z)
  }
  geo.computeVertexNormals()
  return geo
}

/** E03 — verre à demi plein d'eau rosée, mouchoir froissé. */
export function GlassAndHandkerchief() {
  const hanky = useMemo(handkerchiefTexture, [])
  const cloth = useMemo(() => crumpledPlane(0.26, 2), [])
  return (
    <group>
      {/* verre */}
      <group position={[0, 0, 0]}>
        <mesh castShadow position={[0, 0.055, 0]}>
          <cylinderGeometry args={[0.034, 0.028, 0.11, 40, 1, true]} />
          <meshPhysicalMaterial
            color="#f2f6f7"
            transmission={1}
            thickness={0.004}
            ior={1.5}
            roughness={0.02}
            clearcoat={1}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0.004, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.008, 40]} />
          <meshPhysicalMaterial color="#dfe8ea" transparent opacity={0.5} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.032, 0]}>
          <cylinderGeometry args={[0.0305, 0.0278, 0.05, 40]} />
          <meshPhysicalMaterial color="#d79a8f" transparent opacity={0.55} roughness={0.05} transmission={0.2} />
        </mesh>
      </group>
      {/* mouchoir */}
      <mesh geometry={cloth} rotation={[-Math.PI / 2, 0, 0.6]} position={[-0.17, 0.004, 0.06]} castShadow receiveShadow>
        <meshStandardMaterial map={hanky} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/** E07 — tas de cendres, braises, fragment de papier, lambeau de dentelle. */
export function AshesFragment() {
  const paper = useMemo(paperFragmentTexture, [])
  const lace = useMemo(laceTexture, [])
  const ashGeo = useMemo(() => {
    const g = new THREE.SphereGeometry(0.2, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2)
    const p = g.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i)
      p.setY(i, y * 0.28 + Math.sin(p.getX(i) * 40) * 0.004 + Math.cos(p.getZ(i) * 36) * 0.004)
    }
    g.computeVertexNormals()
    return g
  }, [])
  const embers = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => {
        const a = i * 2.4
        const r = 0.04 + ((i * 37) % 13) / 100
        return [Math.cos(a) * r, 0.03 + ((i * 7) % 5) / 400, Math.sin(a) * r] as [number, number, number]
      }),
    [],
  )
  return (
    <group>
      <mesh geometry={ashGeo} receiveShadow castShadow>
        <meshStandardMaterial color="#3a3734" roughness={1} />
      </mesh>
      {embers.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.0035 + (i % 3) * 0.0012, 8, 8]} />
          <meshStandardMaterial color="#2a0f05" emissive="#ff5a1a" emissiveIntensity={1.6 + (i % 4) * 0.6} />
        </mesh>
      ))}
      <mesh position={[0.015, 0.082, 0.015]} rotation={[-Math.PI / 2 + 0.08, 0, 0.4]}>
        <planeGeometry args={[0.17, 0.125]} />
        <meshStandardMaterial map={paper} transparent alphaTest={0.05} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.085, 0.07, 0.07]} rotation={[-Math.PI / 2 + 0.15, 0, -0.5]}>
        <planeGeometry args={[0.12, 0.06]} />
        <meshStandardMaterial map={lace} transparent alphaTest={0.3} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/** E08 — bouton de nacre et bout de fil de soie. */
export function PearlButton() {
  const face = useMemo(pearlButtonTexture, [])
  const thread = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.002, 0.004, 0.002),
          new THREE.Vector3(0.012, 0.005, 0.008),
          new THREE.Vector3(0.022, 0.002, 0.004),
          new THREE.Vector3(0.03, 0.001, 0.012),
        ]),
        20,
        0.0006,
        6,
      ),
    [],
  )
  return (
    <group>
      <mesh castShadow position={[0, 0.0016, 0]}>
        <cylinderGeometry args={[0.0075, 0.0075, 0.0032, 40]} />
        <meshPhysicalMaterial
          attach="material"
          color="#ece6dc"
          roughness={0.18}
          iridescence={1}
          iridescenceIOR={1.6}
          sheen={0.6}
          sheenColor="#cfe0ff"
        />
      </mesh>
      <mesh position={[0, 0.0033, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.0074, 40]} />
        <meshPhysicalMaterial map={face} roughness={0.15} iridescence={1} iridescenceIOR={1.5} />
      </mesh>
      <mesh geometry={thread}>
        <meshStandardMaterial color="#efe6d0" roughness={0.6} />
      </mesh>
    </group>
  )
}

/** Registre relié : couvertures de cuir, bloc de pages bombé, ruban marque-page. */
export function Ledger() {
  const tex = useMemo(ledgerTexture, [])
  const pages = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.48, 0.3, 48, 1)
    const p = g.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      const u = Math.abs(x) / 0.24
      p.setZ(i, 0.022 * Math.sin(Math.min(1, u) * Math.PI * 0.5) * (1 - u * 0.35) - (u < 0.06 ? 0.012 * (1 - u / 0.06) : 0))
    }
    g.computeVertexNormals()
    return g
  }, [])
  const leather = <meshStandardMaterial color="#3d2416" roughness={0.62} />
  return (
    <group rotation={[0, 0.12, 0]}>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.128, 0.004, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.262, 0.008, 0.33]} />
            {leather}
          </mesh>
          <mesh position={[side * 0.122, 0.014, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.236, 0.016, 0.31]} />
            <meshStandardMaterial color="#d9cba8" roughness={0.95} />
          </mesh>
        </group>
      ))}
      <mesh geometry={pages} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, 0]} receiveShadow castShadow>
        <meshStandardMaterial map={tex} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.02, 0.026, 0.14]} rotation={[-Math.PI / 2, 0, 0.08]}>
        <planeGeometry args={[0.012, 0.11]} />
        <meshStandardMaterial color="#7a1418" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/** Carafe de cristal taillé, à moitié pleine, bouchon posé à côté. */
export function Carafe() {
  const body = useMemo(() => {
    const pts = [
      [0.0, 0], [0.048, 0], [0.062, 0.03], [0.066, 0.09], [0.058, 0.13], [0.03, 0.17], [0.018, 0.2], [0.017, 0.245], [0.024, 0.255],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(pts, 12)
  }, [])
  const water = useMemo(() => {
    const pts = [[0, 0.006], [0.044, 0.006], [0.058, 0.03], [0.061, 0.075], [0, 0.075]].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(pts, 32)
  }, [])
  const crystal = (
    <meshPhysicalMaterial color="#eef4f5" transmission={1} thickness={0.01} ior={1.55} roughness={0.03} clearcoat={1} flatShading transparent opacity={0.92} side={THREE.DoubleSide} depthWrite={false} />
  )
  return (
    <group>
      <mesh geometry={body} castShadow>
        {crystal}
      </mesh>
      <mesh geometry={water}>
        <meshPhysicalMaterial color="#cfe2e6" transmission={0.9} roughness={0.02} transparent opacity={0.6} />
      </mesh>
      <group position={[0.1, 0, 0.03]} rotation={[0, 0, Math.PI / 2]}>
        <mesh position={[0.02, 0, 0]} castShadow>
          <sphereGeometry args={[0.022, 10, 8]} />
          {crystal}
        </mesh>
        <mesh position={[-0.01, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.009, 0.04, 10]} />
          {crystal}
        </mesh>
      </group>
    </group>
  )
}

export type EvidenceKey = 'glass_handkerchief' | 'ashes' | 'button' | 'ledger' | 'carafe'

export const evidenceModels: Record<EvidenceKey, { Component: () => React.JSX.Element; inspectScale: number }> = {
  glass_handkerchief: { Component: GlassAndHandkerchief, inspectScale: 3.2 },
  ashes: { Component: AshesFragment, inspectScale: 2.1 },
  button: { Component: PearlButton, inspectScale: 26 },
  ledger: { Component: Ledger, inspectScale: 1.6 },
  carafe: { Component: Carafe, inspectScale: 2.6 },
}
