import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { Prop } from '@/game/objects/Prop'

/** Planche de comparaison des assets (développement uniquement). */
const IDS = [
  'round_spectacles', 'cigarette_case', 'vintage_lighter', 'postcard_set_01', 'chess_set', 'wooden_candlestick',
  'standing_picture_frame_01', 'standing_picture_frame_02', 'seadogs_compass', 'marble_bust_01', 'antique_ceramic_vase_01',
  'brass_goblets', 'jug_01', 'tea_set_01', 'wine_bottles_01', 'vintage_binocular', 'carved_wooden_elephant', 'horse_statue_01',
  'pocket_watch', 'vintage_pocket_watch', 'brass_vase_01', 'vintage_suitcase', 'magnifying_glass_01', 'mantel_clock_01',
]
const COLS = 6

export function AssetGalleryPage() {
  return (
    <main className="h-dvh bg-[#2a2622]">
      <Canvas camera={{ position: [0, 3.2, 5.2], fov: 38 }} shadows dpr={[1, 2]}>
        <color attach="background" args={['#2a2622']} />
        <hemisphereLight args={['#fff4e0', '#3a3028', 0.9]} />
        <directionalLight position={[3, 5, 4]} intensity={2.4} castShadow />
        <Suspense fallback={null}>
          {IDS.map((id, i) => {
            const x = (i % COLS) - (COLS - 1) / 2
            const z = Math.floor(i / COLS) - 1.5
            return (
              <group key={id} position={[x * 1.05, 0, z * 1.15]}>
                <Prop id={id} height={0.62} fit="max" rotation={0.5} />
                <Html position={[0, -0.02, 0.42]} center>
                  <span style={{ font: '10px monospace', color: '#e8dcc0', whiteSpace: 'nowrap' }}>{id}</span>
                </Html>
              </group>
            )
          })}
        </Suspense>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#3a342e" />
        </mesh>
        <OrbitControls target={[0, 0, 0]} />
      </Canvas>
    </main>
  )
}
