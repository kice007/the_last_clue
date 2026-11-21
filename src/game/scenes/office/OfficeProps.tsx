import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { usePbr } from '@/game/materials/pbr'
import { RainGlass, useWallMaterials, WallBoxes, type Box } from '@/game/scenes/study/Room'
import { certificateTexture, countyMapTexture, folderTexture, noticeTexture, reportTexture } from './officeTextures'

/**
 * Bureau de l'inspecteur Hale, poste de police de Thornby (1908).
 * Repère : pièce de 6 × 5 m, x ∈ [-3, 3], z ∈ [-2.5, 2.5], hauteur 3.2 m, origine au centre du sol.
 * Le joueur regarde le mur du fond (z = -2.5) depuis la porte.
 */
export const OFFICE = { w: 6, d: 5, h: 3.2, wainscot: 1.0, T: 0.12 }
export const WINDOW = { x0: 0.35, x1: 1.55, y0: 0.95, y1: 2.75 }

/** Hauteur du plateau du bureau (repris du bureau de Whitmore). */
export const DESK_TOP = 0.772
export const DESK_POS: [number, number, number] = [0.05, 0, -0.95]

function useMaterials() {
  const walnut = usePbr('black_walnut_veneer_01', 1, 1)
  return useMemo(
    () => ({
      oak: new THREE.MeshStandardMaterial({ ...walnut, color: '#8a6a48', roughness: 0.5 }),
      darkWood: new THREE.MeshStandardMaterial({ ...walnut, color: '#4a3424', roughness: 0.55 }),
      brass: new THREE.MeshStandardMaterial({ color: '#b48b4c', metalness: 1, roughness: 0.32 }),
      bakelite: new THREE.MeshPhysicalMaterial({ color: '#0d0c0b', roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.2 }),
      paper: new THREE.MeshStandardMaterial({ color: '#d9cfb6', roughness: 0.95 }),
      wool: new THREE.MeshStandardMaterial({ color: '#3b3029', roughness: 1 }),
      felt: new THREE.MeshStandardMaterial({ color: '#1a1714', roughness: 0.95 }),
    }),
    [walnut],
  )
}

export function OfficeRoom() {
  const materials = useWallMaterials()
  const floor = usePbr('herringbone_parquet', 3, 2.5)
  const { w, d, h, T, wainscot } = OFFICE
  const hw = w / 2
  const hd = d / 2
  const { x0, x1, y0, y1 } = WINDOW
  const walls: Box[] = [
    { pos: [(-hw + x0) / 2, h / 2, -hd], size: [x0 + hw, h, T] },
    { pos: [(hw + x1) / 2, h / 2, -hd], size: [hw - x1, h, T] },
    { pos: [(x0 + x1) / 2, y0 / 2, -hd], size: [x1 - x0, y0, T] },
    { pos: [(x0 + x1) / 2, (y1 + h) / 2, -hd], size: [x1 - x0, h - y1, T] },
    { pos: [-hw, h / 2, 0], size: [T, h, d] },
    { pos: [hw, h / 2, 0], size: [T, h, d] },
  ]
  const zWin = -hd + T / 2
  const cx = (x0 + x1) / 2
  const bars: Box[] = [
    { pos: [cx, (y0 + y1) / 2, zWin], size: [0.03, y1 - y0, 0.05] },
    ...[0.6, 1.2].map((dy): Box => ({ pos: [cx, y0 + dy, zWin], size: [x1 - x0, 0.022, 0.04] })),
  ]
  const frame: Box[] = [
    { pos: [cx, y1 + 0.05, zWin + 0.03], size: [x1 - x0 + 0.22, 0.12, 0.16] },
    { pos: [x0 - 0.06, (y0 + y1) / 2, zWin + 0.03], size: [0.12, y1 - y0 + 0.1, 0.16] },
    { pos: [x1 + 0.06, (y0 + y1) / 2, zWin + 0.03], size: [0.12, y1 - y0 + 0.1, 0.16] },
    { pos: [cx, y0 - 0.04, zWin + 0.1], size: [x1 - x0 + 0.32, 0.06, 0.3] },
  ]
  const trims: Box[] = [
    { pos: [0, wainscot, -hd + T / 2 + 0.015], size: [w, 0.05, 0.04] },
    { pos: [-hw + T / 2 + 0.015, wainscot, 0], size: [0.04, 0.05, d] },
    { pos: [hw - T / 2 - 0.015, wainscot, 0], size: [0.04, 0.05, d] },
    { pos: [0, h - 0.06, -hd + T / 2 + 0.04], size: [w, 0.12, 0.1] },
    { pos: [-hw + T / 2 + 0.04, h - 0.06, 0], size: [0.1, 0.12, d] },
    { pos: [hw - T / 2 - 0.04, h - 0.06, 0], size: [0.1, 0.12, d] },
    { pos: [0, 0.08, -hd + T / 2 + 0.02], size: [w, 0.16, 0.04] },
  ]
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial {...floor} color="#7a5c42" roughness={0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#15120e" roughness={1} />
      </mesh>
      <WallBoxes boxes={walls} materials={materials} wainscot={wainscot} />
      {[...trims, ...frame, ...bars].map((b, i) => (
        <mesh key={i} position={b.pos} material={materials.trim} castShadow receiveShadow>
          <boxGeometry args={b.size} />
        </mesh>
      ))}
      <RainGlass position={[cx, (y0 + y1) / 2, zWin - 0.02]} size={[x1 - x0, y1 - y0]} />
      {/* lueur de la rue : réverbère lointain derrière la vitre */}
      <mesh position={[cx + 0.2, 1.6, -3.6]}>
        <planeGeometry args={[5, 4]} />
        <meshBasicMaterial color="#121c28" />
      </mesh>
      <mesh position={[cx + 0.35, 1.35, -3.5]}>
        <circleGeometry args={[0.05, 16]} />
        <meshBasicMaterial color="#ffcf8a" toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Carte d'état-major du comté, encadrée de bois, et avis punaisés. */
export function WallMap() {
  const tex = useMemo(countyMapTexture, [])
  const notices = useMemo(() => [noticeTexture(3), noticeTexture(7), noticeTexture(5)], [])
  const z = -OFFICE.d / 2 + OFFICE.T / 2
  return (
    <group>
      <mesh position={[-1.4, 2.0, z + 0.025]} castShadow>
        <boxGeometry args={[1.62, 1.1, 0.03]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.6} />
      </mesh>
      <mesh position={[-1.4, 2.0, z + 0.042]} receiveShadow>
        <planeGeometry args={[1.54, 1.02]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
      {(
        [
          [-0.25, 2.12, 0.2, 0.27, 0.05, 0],
          [-0.22, 1.66, 0.2, 0.27, -0.06, 1],
          [-2.55, 1.6, 0.18, 0.24, 0.04, 2],
        ] as const
      ).map(([x, y, w, hh, rot, i]) => (
        <group key={i} position={[x, y, z + 0.012 + i * 0.001]} rotation={[0, 0, rot]}>
          <mesh receiveShadow>
            <planeGeometry args={[w, hh]} />
            <meshStandardMaterial map={notices[i]} roughness={0.95} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, hh / 2 - 0.02, 0.006]}>
            <sphereGeometry args={[0.007, 8, 8]} />
            <meshStandardMaterial color="#8c2a22" roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Deux diplômes encadrés (mur du fond, à droite de la fenêtre). */
export function Diplomas() {
  const m = useMaterials()
  const texA = useMemo(() => certificateTexture(1), [])
  const texB = useMemo(() => certificateTexture(2), [])
  return (
    <group>
      {(
        [
          [-0.22, 0.06, texA],
          [0.24, -0.06, texB],
        ] as const
      ).map(([x, y, tex], i) => (
        <group key={i} position={[x, y, 0.03]}>
          <RoundedBox args={[0.4, 0.52, 0.035]} radius={0.008} smoothness={2} material={m.darkWood} castShadow />
          <mesh position={[0, 0, 0.0185]}>
            <planeGeometry args={[0.33, 0.45]} />
            <meshStandardMaterial map={tex} roughness={0.8} />
          </mesh>
          {/* vitre */}
          <mesh position={[0, 0, 0.021]}>
            <planeGeometry args={[0.33, 0.45]} />
            <meshPhysicalMaterial transparent opacity={0.12} roughness={0.05} clearcoat={1} color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Classeur à tiroirs en chêne, tiroir du haut ouvert sur les chemises des affaires. Façade vers +z. */
export function FilingCabinet() {
  const m = useMaterials()
  const folders = useMemo(() => [0, 1, 2, 3].map(folderTexture), [])
  const W = 0.5
  const H = 1.34
  const D = 0.64
  const rows = [0.19, 0.51, 0.83]
  const open = 0.44
  const topY = 1.15
  const items = useMemo(() => {
    let s = 9
    const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
    return Array.from({ length: 22 }, (_, i) => ({ z: -D / 2 + 0.06 + i * 0.024 + open, tilt: (r() - 0.5) * 0.14 - 0.06, h: 0.24 + r() * 0.03, tex: i % 4 }))
  }, [])
  return (
    <group>
      {/* caisson */}
      <RoundedBox args={[W, H, D]} radius={0.01} smoothness={2} position={[0, H / 2, 0]} material={m.oak} castShadow receiveShadow />
      <mesh position={[0, H + 0.015, 0]} material={m.darkWood} castShadow>
        <boxGeometry args={[W + 0.04, 0.03, D + 0.04]} />
      </mesh>
      {/* tiroirs fermés */}
      {rows.map((y) => (
        <group key={y} position={[0, y, D / 2]}>
          <RoundedBox args={[W - 0.05, 0.28, 0.02]} radius={0.006} smoothness={2} material={m.oak} castShadow />
          <mesh position={[0, 0.07, 0.014]} material={m.brass}>
            <boxGeometry args={[0.1, 0.045, 0.006]} />
          </mesh>
          <mesh position={[0, 0.07, 0.016]}>
            <planeGeometry args={[0.085, 0.032]} />
            <meshStandardMaterial color="#e2d6b8" roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.03, 0.03]} rotation={[0, 0, Math.PI / 2]} material={m.brass}>
            <cylinderGeometry args={[0.008, 0.008, 0.12, 12]} />
          </mesh>
        </group>
      ))}
      {/* tiroir du haut, tiré */}
      <group position={[0, topY, open]}>
        <mesh position={[0, -0.13, 0]} material={m.oak} receiveShadow>
          <boxGeometry args={[W - 0.06, 0.012, D - 0.04]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (W / 2 - 0.035), -0.03, 0]} material={m.oak} castShadow receiveShadow>
            <boxGeometry args={[0.012, 0.2, D - 0.04]} />
          </mesh>
        ))}
        <mesh position={[0, -0.03, -D / 2 + 0.03]} material={m.oak}>
          <boxGeometry args={[W - 0.06, 0.2, 0.012]} />
        </mesh>
        <group position={[0, 0, D / 2]}>
          <RoundedBox args={[W - 0.05, 0.28, 0.022]} radius={0.006} smoothness={2} material={m.oak} castShadow />
          <mesh position={[0, 0.07, 0.014]} material={m.brass}>
            <boxGeometry args={[0.1, 0.045, 0.006]} />
          </mesh>
          <mesh position={[0, -0.03, 0.03]} rotation={[0, 0, Math.PI / 2]} material={m.brass}>
            <cylinderGeometry args={[0.008, 0.008, 0.12, 12]} />
          </mesh>
        </group>
      </group>
      {/* chemises dans le tiroir ouvert */}
      {items.map((f, i) => (
        <group key={i} position={[0, topY - 0.12 + f.h / 2, f.z]} rotation={[f.tilt, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[W - 0.1, f.h, 0.004]} />
            <meshStandardMaterial map={folders[f.tex]} roughness={0.9} />
          </mesh>
          {/* onglet */}
          <mesh position={[-0.12 + (i % 4) * 0.08, f.h / 2 + 0.018, 0]}>
            <boxGeometry args={[0.07, 0.036, 0.004]} />
            <meshStandardMaterial color={i % 5 === 0 ? '#8c2a22' : '#c8b48a'} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Lampe de banquier : socle laiton, abat-jour de verre vert. L'ampoule est éclairée par la scène. */
export function BankersLamp({ glowRef }: { glowRef?: React.Ref<THREE.MeshStandardMaterial> }) {
  const m = useMaterials()
  const shadeGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.085, 0.085, 0.34, 32, 1, true, 0, Math.PI)
    g.rotateZ(Math.PI / 2)
    return g
  }, [])
  return (
    <group>
      <mesh position={[0, 0.012, 0]} material={m.brass} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.085, 0.024, 32]} />
      </mesh>
      <mesh position={[0, 0.03, 0]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.02, 24]} />
      </mesh>
      <mesh position={[0, 0.17, 0]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.009, 0.011, 0.28, 12]} />
      </mesh>
      {/* bras */}
      <mesh position={[0, 0.31, 0.02]} rotation={[Math.PI / 2, 0, 0]} material={m.brass}>
        <cylinderGeometry args={[0.007, 0.007, 0.06, 10]} />
      </mesh>
      <group position={[0, 0.34, 0.04]} rotation={[0.12, 0, 0]}>
        <mesh geometry={shadeGeo} castShadow>
          <meshPhysicalMaterial color="#0d5a3a" roughness={0.12} clearcoat={1} emissive="#0b4a2c" emissiveIntensity={0.55} side={THREE.FrontSide} />
        </mesh>
        <mesh geometry={shadeGeo} scale={0.97}>
          <meshStandardMaterial ref={glowRef} color="#fff3d6" emissive="#ffd9a0" emissiveIntensity={0.9} side={THREE.BackSide} toneMapped={false} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.172, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={m.brass}>
            <cylinderGeometry args={[0.087, 0.087, 0.006, 32, 1, false, 0, Math.PI]} />
          </mesh>
        ))}
        {/* tirette */}
        <mesh position={[0.05, -0.08, 0.03]} material={m.brass}>
          <cylinderGeometry args={[0.002, 0.002, 0.07, 6]} />
        </mesh>
        <mesh position={[0.05, -0.118, 0.03]} material={m.brass}>
          <sphereGeometry args={[0.007, 10, 10]} />
        </mesh>
      </group>
    </group>
  )
}

/** Téléphone chandelier (années 1900) : socle, colonne, micro, écouteur accroché. */
export function CandlestickPhone() {
  const m = useMaterials()
  return (
    <group>
      <mesh position={[0, 0.016, 0]} material={m.bakelite} castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.068, 0.032, 32]} />
      </mesh>
      <mesh position={[0, 0.04, 0]} material={m.brass}>
        <cylinderGeometry args={[0.032, 0.04, 0.012, 24]} />
      </mesh>
      <mesh position={[0, 0.18, 0]} material={m.bakelite} castShadow>
        <cylinderGeometry args={[0.013, 0.016, 0.27, 16]} />
      </mesh>
      {/* micro */}
      <group position={[0, 0.32, 0.03]} rotation={[Math.PI / 2 - 0.25, 0, 0]}>
        <mesh material={m.bakelite} castShadow>
          <cylinderGeometry args={[0.03, 0.018, 0.06, 24]} />
        </mesh>
        <mesh position={[0, -0.031, 0]} material={m.brass}>
          <cylinderGeometry args={[0.03, 0.03, 0.004, 24]} />
        </mesh>
      </group>
      {/* crochet */}
      <mesh position={[0.03, 0.27, 0]} rotation={[0, 0, -Math.PI / 2.4]} material={m.brass}>
        <cylinderGeometry args={[0.004, 0.004, 0.05, 8]} />
      </mesh>
      {/* écouteur */}
      <group position={[0.058, 0.215, 0]}>
        <mesh material={m.bakelite} castShadow>
          <cylinderGeometry args={[0.014, 0.017, 0.11, 16]} />
        </mesh>
        <mesh position={[0, 0.066, 0]} material={m.bakelite}>
          <cylinderGeometry args={[0.03, 0.016, 0.026, 24]} />
        </mesh>
      </group>
      {/* cordon */}
      <mesh position={[0.04, 0.09, 0.02]} rotation={[0.3, 0, 0.5]}>
        <torusGeometry args={[0.05, 0.003, 6, 24, Math.PI]} />
        <meshStandardMaterial color="#1a120c" roughness={0.8} />
      </mesh>
    </group>
  )
}

/** Pile de rapports et chemise ouverte sur le bureau. */
export function DeskPapers() {
  const m = useMaterials()
  const reports = useMemo(() => [reportTexture(4), reportTexture(8)], [])
  const folder = useMemo(() => folderTexture(2), [])
  return (
    <group>
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0.08]} receiveShadow castShadow>
        <planeGeometry args={[0.46, 0.32]} />
        <meshStandardMaterial map={folder} roughness={0.9} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[0.05 + (i % 2) * 0.006, 0.006 + i * 0.0025, 0.005 * Math.sin(i * 2)]} rotation={[-Math.PI / 2, 0, 0.12 - i * 0.025]} castShadow receiveShadow>
          <planeGeometry args={[0.21, 0.29]} />
          <meshStandardMaterial map={i >= 5 ? reports[i - 5] : undefined} color={i >= 5 ? '#ffffff' : '#d8ceb4'} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[-0.17, 0.025, 0.03]} rotation={[0, 0.6, 0]} material={m.bakelite} castShadow>
        <cylinderGeometry args={[0.028, 0.032, 0.05, 20]} />
      </mesh>
      <mesh position={[-0.12, 0.006, 0.09]} rotation={[0, 1.1, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.004, 0.003, 0.16, 8]} />
        <meshStandardMaterial color="#1a1410" roughness={0.4} />
      </mesh>
    </group>
  )
}

/** Porte-manteau tripode avec pardessus et chapeau melon. */
export function CoatRack() {
  const m = useMaterials()
  const coatGeo = useMemo(() => {
    const pts = [
      [0.05, 0], [0.13, -0.04], [0.19, -0.12], [0.2, -0.3], [0.19, -0.6], [0.21, -0.9], [0.25, -1.15], [0.24, -1.18],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    const g = new THREE.LatheGeometry(pts, 40)
    const p = g.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      const z = p.getZ(i)
      const y = p.getY(i)
      const a = Math.atan2(z, x)
      const fold = 1 + Math.sin(a * 7 + y * 3) * 0.04 * Math.min(1, -y * 2)
      p.setX(i, x * fold)
      p.setZ(i, z * 0.62 * fold)
    }
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI * 2) / 3) * 0.16, 0.06, Math.sin((i * Math.PI * 2) / 3) * 0.16]} rotation={[0, -(i * Math.PI * 2) / 3, -1.15]} material={m.darkWood} castShadow>
          <cylinderGeometry args={[0.014, 0.018, 0.36, 10]} />
        </mesh>
      ))}
      <mesh position={[0, 0.95, 0]} material={m.darkWood} castShadow>
        <cylinderGeometry args={[0.022, 0.028, 1.82, 14]} />
      </mesh>
      <mesh position={[0, 1.88, 0]} material={m.darkWood}>
        <sphereGeometry args={[0.035, 16, 12]} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos(i * 1.57) * 0.07, 1.74, Math.sin(i * 1.57) * 0.07]} rotation={[Math.sin(i * 1.57) * 0.9, 0, -Math.cos(i * 1.57) * 0.9]} material={m.darkWood}>
          <cylinderGeometry args={[0.008, 0.01, 0.16, 8]} />
        </mesh>
      ))}
      {/* pardessus */}
      <mesh geometry={coatGeo} position={[0, 1.72, 0.09]} material={m.wool} castShadow receiveShadow />
      <mesh position={[0, 1.7, 0.1]} rotation={[0.2, 0, 0]} material={m.wool}>
        <torusGeometry args={[0.07, 0.025, 8, 20, Math.PI]} />
      </mesh>
      {/* chapeau melon */}
      <group position={[-0.08, 1.9, -0.02]} rotation={[0.15, 0, 0.35]}>
        <mesh position={[0, 0.05, 0]} material={m.felt} castShadow>
          <sphereGeometry args={[0.085, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[0, 0.025, 0]} material={m.felt} castShadow>
          <cylinderGeometry args={[0.085, 0.085, 0.05, 24]} />
        </mesh>
        <mesh material={m.felt} castShadow>
          <cylinderGeometry args={[0.135, 0.13, 0.008, 32]} />
        </mesh>
        <mesh position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.087, 0.087, 0.016, 24]} />
          <meshStandardMaterial color="#3a1712" roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

/** Suspension émaillée au-dessus du bureau. */
export function PendantLamp() {
  return (
    <group position={[DESK_POS[0], OFFICE.h, DESK_POS[2] + 0.1]}>
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.7, 6]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0, -0.76, 0]} castShadow>
        <coneGeometry args={[0.2, 0.14, 32, 1, true]} />
        <meshStandardMaterial color="#1c2a24" roughness={0.4} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.8, 0]}>
        <sphereGeometry args={[0.035, 16, 12]} />
        <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
      </mesh>
    </group>
  )
}
