import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { usePbr } from '@/game/materials/pbr'
import { bookSpineTexture } from '@/game/materials/procedural'
import { Prop } from '@/game/objects/Prop'

/** Bureau à double caisson, plateau gainé de cuir. Tiroirs côté -z. Par défaut, centre : (0, 0, -1.7). */
export function Desk({ position = [0, 0, -1.7], rotation = 0 }: { position?: [number, number, number]; rotation?: number }) {
  const walnut = usePbr('black_walnut_veneer_01', 1, 1)
  const leather = usePbr('brown_leather', 1.5, 1)
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ ...walnut, color: '#a57d5a', roughness: 0.45 }), [walnut])
  const top = useMemo(() => new THREE.MeshStandardMaterial({ ...leather, color: '#3d4a33', roughness: 0.75 }), [leather])
  const brass = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b48b4c', metalness: 1, roughness: 0.3 }), [])
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[1.7, 0.05, 0.86]} radius={0.018} smoothness={4} position={[0, 0.745, 0]} material={wood} castShadow receiveShadow />
      <RoundedBox args={[1.62, 0.03, 0.8]} radius={0.01} smoothness={3} position={[0, 0.712, 0]} material={wood} castShadow />
      <mesh position={[0, 0.7705, 0]} rotation={[-Math.PI / 2, 0, 0]} material={top} receiveShadow>
        <planeGeometry args={[1.52, 0.68]} />
      </mesh>
      {[-0.58, 0.58].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <RoundedBox args={[0.5, 0.68, 0.8]} radius={0.012} smoothness={3} position={[0, 0.38, 0]} material={wood} castShadow receiveShadow />
          {[0.6, 0.38, 0.16].map((y) => (
            <group key={y}>
              <RoundedBox args={[0.44, 0.19, 0.016]} radius={0.005} smoothness={2} position={[0, y, -0.402]} material={wood} />
              <mesh position={[0, y, -0.412]} material={brass}>
                <sphereGeometry args={[0.012, 12, 12]} />
              </mesh>
            </group>
          ))}
          <RoundedBox args={[0.54, 0.06, 0.84]} radius={0.01} smoothness={3} position={[0, 0.03, 0]} material={wood} castShadow receiveShadow />
        </group>
      ))}
      {/* tiroir central */}
      <mesh position={[0, 0.67, -0.38]} material={wood} castShadow>
        <boxGeometry args={[0.66, 0.1, 0.06]} />
      </mesh>
    </group>
  )
}

function Papers() {
  const sheets: [number, number, number, number][] = [
    [0.18, -1.52, 0.4, 0.0005],
    [0.25, -1.58, -0.25, 0.001],
    [-0.42, -1.48, 0.15, 0.0005],
  ]
  return (
    <>
      {sheets.map(([x, z, r, dy], i) => (
        <mesh key={i} position={[x, 0.772 + dy, z]} rotation={[-Math.PI / 2, 0, r]} receiveShadow castShadow>
          <planeGeometry args={[0.21, 0.29]} />
          <meshStandardMaterial color="#d9cfb8" roughness={0.95} />
        </mesh>
      ))}
      {/* encrier et plume */}
      <mesh position={[-0.3, 0.8, -1.92]} castShadow>
        <cylinderGeometry args={[0.03, 0.035, 0.055, 24]} />
        <meshPhysicalMaterial color="#1b2430" roughness={0.1} clearcoat={1} />
      </mesh>
      <mesh position={[-0.22, 0.776, -1.86]} rotation={[0, 0.9, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.004, 0.003, 0.18, 8]} />
        <meshStandardMaterial color="#1a1410" roughness={0.4} />
      </mesh>
    </>
  )
}

/** Bibliothèque murale (mur droit), livres reliés en instances. */
function Bookcase() {
  const walnut = usePbr('black_walnut_veneer_01', 1, 2)
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ ...walnut, color: '#7d5b3e', roughness: 0.5 }), [walnut])
  const W = 2.2
  const H = 2.6
  const D = 0.36
  const shelves = [0.12, 0.62, 1.1, 1.58, 2.06]
  const spine = useMemo(bookSpineTexture, [])
  const books = useMemo(() => {
    const colors = ['#4a1a14', '#1f2a22', '#2b2318', '#5a4426', '#1a1f2e', '#3a1c10', '#24301f', '#5e1f1a']
    const list: { x: number; y: number; w: number; h: number; d: number; c: string; tilt: number }[] = []
    let seed = 3
    const r = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    for (const y of shelves) {
      let x = -W / 2 + 0.06
      while (x < W / 2 - 0.08) {
        if (r() < 0.06) {
          x += 0.12 + r() * 0.2
          continue
        }
        const w = 0.028 + r() * 0.04
        const h = 0.26 + r() * 0.14
        list.push({ x: x + w / 2, y: y + 0.02 + h / 2, w, h, d: 0.2 + r() * 0.06, c: colors[Math.floor(r() * colors.length)]!, tilt: r() < 0.05 ? 0.25 : 0 })
        x += w + 0.002
      }
    }
    return list
  }, [])
  return (
    <group position={[3.5 - 0.06 - D / 2, 0, 1.25]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, H / 2, -D / 2 + 0.01]} material={wood} receiveShadow>
        <boxGeometry args={[W, H, 0.02]} />
      </mesh>
      {[-W / 2, W / 2].map((x) => (
        <mesh key={x} position={[x, H / 2, 0]} material={wood} castShadow receiveShadow>
          <boxGeometry args={[0.05, H, D]} />
        </mesh>
      ))}
      {[...shelves, H - 0.02].map((y) => (
        <mesh key={y} position={[0, y, 0]} material={wood} castShadow receiveShadow>
          <boxGeometry args={[W, 0.035, D]} />
        </mesh>
      ))}
      <mesh position={[0, H + 0.04, 0.02]} material={wood} castShadow>
        <boxGeometry args={[W + 0.12, 0.08, D + 0.06]} />
      </mesh>
      {books.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, -0.02]} rotation={[0, 0, b.tilt]} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial map={spine} color={b.c} roughness={0.55} />
        </mesh>
      ))}
    </group>
  )
}

export function Furniture() {
  return (
    <group>
      <Desk />
      <Papers />
      <Bookcase />
      {/* sur le bureau */}
      <Prop id="vintage_oil_lamp" height={0.5} position={[-0.56, 0.772, -1.86]} />
      {/* fauteuil de bureau, repoussé de travers */}
      <Prop id="GreenChair_01" height={0.98} position={[0.3, 0, -2.42]} rotation={Math.PI + 0.45} />
      {/* coin cheminée */}
      <Prop id="ArmChair_01" height={1.0} position={[-2.05, 0, 1.0]} rotation={-Math.PI / 2 - 0.55} />
      <Prop id="side_table_01" height={0.62} position={[-2.75, 0, 1.75]} />
      <Prop id="book_encyclopedia_set_01" height={0.3} position={[3.24, 2.68, 1.7]} rotation={-Math.PI / 2} />
      <Prop id="ornate_mirror_01" height={1.05} position={[-3.08, 1.42, -0.4]} rotation={Math.PI / 2} />
      <Prop id="brass_candleholders" height={0.3} position={[-3.18, 1.275, -1.18]} rotation={Math.PI / 2} />
      {/* murs */}
      <Prop id="vintage_grandfather_clock_01" height={2.2} position={[2.95, 0, -2.6]} rotation={-Math.PI / 4} />
      <Prop id="vintage_cabinet_01" height={1.9} position={[3.2, 0, -1.0]} rotation={-Math.PI / 2} />
      <Prop id="fancy_picture_frame_01" height={0.85} position={[-2.2, 1.4, -2.93]} />
      <Prop id="fancy_picture_frame_01" height={0.7} position={[2.0, 1.5, -2.93]} />
      <Prop id="Chandelier_01" height={0.85} position={[0, 2.55, -0.4]} castShadow={false} />
    </group>
  )
}
