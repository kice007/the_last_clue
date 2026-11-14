import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePbr } from '@/game/materials/pbr'
import { rugTexture } from '@/game/materials/procedural'

/** Pièce : x ∈ [-3.5, 3.5], z ∈ [-3, 3], hauteur 3.4 m. */
export const ROOM = { w: 7, d: 6, h: 3.4, wainscot: 1.1 }
const T = 0.12 // épaisseur des murs

type Box = { pos: [number, number, number]; size: [number, number, number] }

function useWallMaterials() {
  const panel = usePbr('dark_paneled_wood', 2, 1)
  const plaster = usePbr('plastered_wall_04', 2, 1.4)
  return useMemo(
    () => ({
      panel: new THREE.MeshStandardMaterial({ ...panel, color: '#7a5a42', roughness: 0.7 }),
      plaster: new THREE.MeshStandardMaterial({ ...plaster, color: '#4a5a4c', roughness: 0.95 }),
      trim: new THREE.MeshStandardMaterial({ color: '#2a1a12', roughness: 0.55 }),
    }),
    [panel, plaster],
  )
}

/** Mur découpé en tranches basse (lambris) / haute (enduit) à partir de boîtes. */
function WallBoxes({ boxes, materials }: { boxes: Box[]; materials: ReturnType<typeof useWallMaterials> }) {
  return (
    <>
      {boxes.map((b, i) => {
        const [x, y, z] = b.pos
        const [sx, sy, sz] = b.size
        const bottom = y - sy / 2
        const top = y + sy / 2
        const split = ROOM.wainscot
        const parts: { y: number; h: number; m: THREE.Material }[] = []
        if (bottom < split) parts.push({ y: (bottom + Math.min(top, split)) / 2, h: Math.min(top, split) - bottom, m: materials.panel })
        if (top > split) parts.push({ y: (Math.max(bottom, split) + top) / 2, h: top - Math.max(bottom, split), m: materials.plaster })
        return parts.map((p, j) => (
          <mesh key={`${i}-${j}`} position={[x, p.y, z]} material={p.m} castShadow receiveShadow>
            <boxGeometry args={[sx, p.h, sz]} />
          </mesh>
        ))
      })}
    </>
  )
}

function RainGlass() {
  const mat = useRef<THREE.ShaderMaterial>(null)
  useFrame(({ clock }) => {
    if (mat.current) mat.current.uniforms.uTime!.value = clock.elapsedTime
  })
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  return (
    <mesh position={[0, 1.875, -3 + T / 2 - 0.02]}>
      <planeGeometry args={[1.7, 2.25]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`
          varying vec2 vUv; uniform float uTime;
          float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
          float drops(vec2 uv, float t, float scale){
            vec2 g = vec2(scale, scale * 0.5);
            vec2 id = floor(uv * g);
            vec2 f = fract(uv * g) - 0.5;
            float n = h(id);
            float speed = 0.15 + n * 0.35;
            float y = fract(n * 7.0 - t * speed) - 0.5;
            vec2 d = f - vec2((n - 0.5) * 0.6, y);
            d.x *= 1.8;
            float drop = smoothstep(0.08, 0.0, length(d));
            float trail = smoothstep(0.05, 0.0, abs(f.x - (n - 0.5) * 0.6)) * smoothstep(-0.05, 0.4, f.y - y) * smoothstep(0.5, 0.0, f.y - y) * 0.35;
            return drop + trail * step(0.45, n);
          }
          void main(){
            vec2 uv = vUv;
            float d = drops(uv, uTime, 14.0) + drops(uv * 1.7 + 3.1, uTime * 1.2, 22.0) * 0.6;
            float grad = smoothstep(0.0, 1.0, uv.y);
            vec3 night = mix(vec3(0.03,0.05,0.08), vec3(0.10,0.16,0.24), grad);
            vec3 col = night + vec3(0.55,0.68,0.85) * d * 0.55;
            gl_FragColor = vec4(col, 0.82);
          }`}
      />
    </mesh>
  )
}

function Window({ trim }: { trim: THREE.Material }) {
  const y0 = 0.75
  const y1 = 3.0
  const x0 = -0.85
  const x1 = 0.85
  const z = -3 + T / 2
  const bars: Box[] = []
  for (const x of [-0.425, 0, 0.425]) bars.push({ pos: [x, (y0 + y1) / 2, z], size: [0.025, y1 - y0, 0.05] })
  for (let y = y0 + 0.28; y < y1; y += 0.28) bars.push({ pos: [0, y, z], size: [x1 - x0, 0.018, 0.04] })
  return (
    <group>
      <RainGlass />
      {/* ciel nocturne derrière la vitre */}
      <mesh position={[0, 1.9, -3.9]}>
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial color="#14202e" />
      </mesh>
      {bars.map((b, i) => (
        <mesh key={i} position={b.pos} material={trim} castShadow>
          <boxGeometry args={b.size} />
        </mesh>
      ))}
      {/* encadrement */}
      {[
        { pos: [0, y1 + 0.05, z + 0.03], size: [x1 - x0 + 0.24, 0.12, 0.16] },
        { pos: [x0 - 0.07, (y0 + y1) / 2, z + 0.03], size: [0.14, y1 - y0 + 0.1, 0.16] },
        { pos: [x1 + 0.07, (y0 + y1) / 2, z + 0.03], size: [0.14, y1 - y0 + 0.1, 0.16] },
        { pos: [0, y0 - 0.04, z + 0.1], size: [x1 - x0 + 0.34, 0.06, 0.3] },
      ].map((b, i) => (
        <mesh key={`f${i}`} position={b.pos as Box['pos']} material={trim} castShadow receiveShadow>
          <boxGeometry args={b.size as Box['size']} />
        </mesh>
      ))}
    </group>
  )
}

function Curtain({ x, flip }: { x: number; flip: boolean }) {
  const velvet = usePbr('velour_velvet', 1.5, 3)
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.75, 3.15, 60, 1)
    const p = g.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i)
      const v = p.getY(i)
      const gather = flip ? (0.375 - u) : (u + 0.375)
      p.setZ(i, Math.sin(u * 44) * 0.045 + Math.sin(u * 17) * 0.02 + (v < -1 ? gather * 0.0 : 0))
    }
    g.computeVertexNormals()
    return g
  }, [flip])
  return (
    <mesh geometry={geo} position={[x, 1.6, -2.86]} castShadow receiveShadow>
      <meshStandardMaterial {...velvet} color="#6a1d1f" roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
  )
}

function Rug() {
  const tex = useMemo(rugTexture, [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.25, 0.006, -0.85]} receiveShadow>
      <planeGeometry args={[3.4, 2.34]} />
      <meshStandardMaterial map={tex} roughness={1} />
    </mesh>
  )
}

/** Cheminée sur le mur gauche (x = -3.5), foyer centré en z = -0.4. */
function Fireplace({ materials }: { materials: ReturnType<typeof useWallMaterials> }) {
  const marble = usePbr('marble_01', 0.6, 0.6)
  const marbleMat = useMemo(
    () => new THREE.MeshStandardMaterial({ normalMap: marble.normalMap, normalScale: new THREE.Vector2(0.15, 0.15), color: '#2a302c', roughness: 0.42 }),
    [marble],
  )
  const soot = useMemo(() => new THREE.MeshStandardMaterial({ color: '#040303', roughness: 1 }), [])
  const brass = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b08a4e', metalness: 1, roughness: 0.32 }), [])
  const bx0 = -3.5 + T / 2
  const bx1 = -3.12
  const bxc = (bx0 + bx1) / 2
  const bd = bx1 - bx0
  const cz = -0.4
  return (
    <group>
      {/* manteau de cheminée en maçonnerie autour de l'ouverture */}
      <WallBoxes
        materials={materials}
        boxes={[
          { pos: [bxc, ROOM.h / 2, cz - 0.725], size: [bd, ROOM.h, 0.55] },
          { pos: [bxc, ROOM.h / 2, cz + 0.725], size: [bd, ROOM.h, 0.55] },
          { pos: [bxc, (0.8 + ROOM.h) / 2, cz], size: [bd, ROOM.h - 0.8, 0.9] },
        ]}
      />
      {/* foyer */}
      <mesh position={[bx0 + 0.02, 0.4, cz]} material={soot} receiveShadow>
        <boxGeometry args={[0.04, 0.8, 0.9]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(bx0 + bx1 + 0.12) / 2, 0.4, cz + s * 0.44]} material={soot}>
          <boxGeometry args={[bx1 + 0.12 - bx0, 0.8, 0.02]} />
        </mesh>
      ))}
      <mesh position={[(bx0 + bx1 + 0.12) / 2, 0.004, cz]} material={soot}>
        <boxGeometry args={[bx1 + 0.12 - bx0, 0.008, 0.9]} />
      </mesh>
      <mesh position={[(bx0 + bx1 + 0.12) / 2, 0.8, cz]} material={soot}>
        <boxGeometry args={[bx1 + 0.12 - bx0, 0.02, 0.9]} />
      </mesh>
      {/* encadrement de marbre */}
      {[
        { pos: [bx1 + 0.06, 0.62, cz - 0.6], size: [0.12, 1.24, 0.3] },
        { pos: [bx1 + 0.06, 0.62, cz + 0.6], size: [0.12, 1.24, 0.3] },
        { pos: [bx1 + 0.06, 1.0, cz], size: [0.1, 0.36, 1.5] },
        { pos: [bx1 + 0.12, 1.24, cz], size: [0.4, 0.07, 1.9] },
        { pos: [-2.93, 0.025, cz], size: [0.42, 0.05, 1.6] },
      ].map((b, i) => (
        <mesh key={i} position={b.pos as Box['pos']} material={marbleMat} castShadow receiveShadow>
          <boxGeometry args={b.size as Box['size']} />
        </mesh>
      ))}
      {/* garde-feu en laiton */}
      <mesh position={[-2.72, 0.13, cz]} material={brass} castShadow>
        <boxGeometry args={[0.025, 0.025, 1.45]} />
      </mesh>
      {[-0.72, 0.72].map((z) => (
        <mesh key={z} position={[-2.72, 0.07, cz + z]} material={brass} castShadow>
          <cylinderGeometry args={[0.018, 0.022, 0.14, 16]} />
        </mesh>
      ))}
      {/* trace sombre sur l'angle du garde-feu */}
      <mesh position={[-2.705, 0.135, cz + 0.62]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.06, 0.025]} />
        <meshStandardMaterial color="#2a0d08" roughness={0.6} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

export function Room() {
  const materials = useWallMaterials()
  const floor = usePbr('herringbone_parquet', 3.5, 3)
  const { w, d, h } = ROOM
  const hw = w / 2
  const hd = d / 2
  const winX0 = -0.85
  const winX1 = 0.85
  const winY0 = 0.75
  const winY1 = 3.0
  const walls: Box[] = [
    // fond, autour de la fenêtre
    { pos: [(-hw + winX0) / 2, h / 2, -hd], size: [winX0 + hw, h, T] },
    { pos: [(hw + winX1) / 2, h / 2, -hd], size: [hw - winX1, h, T] },
    { pos: [0, winY0 / 2, -hd], size: [winX1 - winX0, winY0, T] },
    { pos: [0, (winY1 + h) / 2, -hd], size: [winX1 - winX0, h - winY1, T] },
    // côtés
    { pos: [-hw, h / 2, 0], size: [T, h, d] },
    { pos: [hw, h / 2, 0], size: [T, h, d] },
    // façade (porte en x ≈ -2.3)
    { pos: [0.85, h / 2, hd], size: [5.3, h, T] },
    { pos: [-3.25, h / 2, hd], size: [0.5, h, T] },
    { pos: [-2.3, (2.3 + h) / 2, hd], size: [1.4, h - 2.3, T] },
  ]
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial {...floor} color="#8a6a4e" roughness={0.55} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#17130f" roughness={1} />
      </mesh>
      <WallBoxes boxes={walls} materials={materials} />
      {/* cimaise et corniche */}
      {[
        { pos: [0, ROOM.wainscot, -hd + T / 2 + 0.015], size: [w, 0.05, 0.04] },
        { pos: [-hw + T / 2 + 0.015, ROOM.wainscot, 0], size: [0.04, 0.05, d] },
        { pos: [hw - T / 2 - 0.015, ROOM.wainscot, 0], size: [0.04, 0.05, d] },
        { pos: [0, h - 0.06, -hd + T / 2 + 0.04], size: [w, 0.12, 0.1] },
        { pos: [-hw + T / 2 + 0.04, h - 0.06, 0], size: [0.1, 0.12, d] },
        { pos: [hw - T / 2 - 0.04, h - 0.06, 0], size: [0.1, 0.12, d] },
      ].map((b, i) => (
        <mesh key={i} position={b.pos as Box['pos']} material={materials.trim} receiveShadow>
          <boxGeometry args={b.size as Box['size']} />
        </mesh>
      ))}
      {/* porte (fermée, panneau sombre) */}
      <mesh position={[-2.3, 1.15, hd - 0.02]} material={materials.trim}>
        <boxGeometry args={[1.0, 2.3, 0.06]} />
      </mesh>
      <Window trim={materials.trim} />
      <Curtain x={-1.25} flip={false} />
      <Curtain x={1.25} flip />
      <Rug />
      <Fireplace materials={materials} />
    </group>
  )
}
