import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Html, Lightformer, Sparkles, useGLTF } from '@react-three/drei'
import { Bloom, EffectComposer, Noise, Outline, Select, Selection, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import { Prop, propUrl } from '@/game/objects/Prop'
import { Desk } from '@/game/scenes/study/Furniture'
import { cn } from '@/utils/cn'
import {
  BankersLamp,
  CandlestickPhone,
  CoatRack,
  DESK_POS,
  DESK_TOP,
  DeskPapers,
  Diplomas,
  FilingCabinet,
  OfficeRoom,
  PendantLamp,
  WallMap,
} from './OfficeProps'
import { officeShot, officeSpotById, officeSpots, type OfficeSpotId } from './officeSpots'

const PROPS = ['GreenChair_01', 'mantel_clock_01', 'magnifying_glass_01', 'ClassicConsole_01']
PROPS.forEach((id) => useGLTF.preload(propUrl(id)))

export interface OfficeSceneProps {
  reducedMotion: boolean
  hovered: OfficeSpotId | null
  focus: OfficeSpotId | null
  disabled: ReadonlySet<OfficeSpotId>
  onHover: (id: OfficeSpotId | null) => void
  onSelect: (id: OfficeSpotId) => void
}

const SPOT_MODELS: Record<OfficeSpotId, React.ReactNode> = {
  classeur: <FilingCabinet />,
  telephone: <CandlestickPhone />,
  lampe: <BankersLamp />,
  papiers: <DeskPapers />,
  diplomes: <Diplomas />,
  portemanteau: <CoatRack />,
}

/** Caméra : cadrage fixe depuis la porte, léger parallaxe à la souris, approche de l'objet choisi. */
function OfficeCamera({ focus, reducedMotion }: { focus: OfficeSpotId | null; reducedMotion: boolean }) {
  const { camera, pointer } = useThree()
  const pos = useRef(new THREE.Vector3(officeShot.position[0] - 0.15, officeShot.position[1] + 0.05, officeShot.position[2] + 0.9))
  const look = useRef(new THREE.Vector3(...officeShot.target))
  const goalPos = useMemo(() => new THREE.Vector3(), [])
  const goalLook = useMemo(() => new THREE.Vector3(), [])
  useFrame((_, dt) => {
    const shot = focus ? officeSpotById[focus].focus : officeShot
    goalPos.set(...shot.position)
    goalLook.set(...shot.target)
    if (!focus && !reducedMotion) {
      goalPos.x += pointer.x * 0.12
      goalPos.y += pointer.y * 0.05
      goalLook.x += pointer.x * 0.18
      goalLook.y += pointer.y * 0.1
    }
    const k = reducedMotion ? 1 : 1 - Math.exp(-dt * (focus ? 3.2 : 1.6))
    pos.current.lerp(goalPos, k)
    look.current.lerp(goalLook, k)
    camera.position.copy(pos.current)
    camera.lookAt(look.current)
  })
  return null
}

/** Lumières : lune par la fenêtre, lampe de banquier, suspension, éclairs rares. */
function OfficeLighting({ reducedMotion }: { reducedMotion: boolean }) {
  const moon = useRef<THREE.DirectionalLight>(null)
  const lamp = useRef<THREE.PointLight>(null)
  const nextFlash = useRef(9)
  const flash = useRef(0)
  const moonTarget = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(0.3, 0.4, 0)
    return o
  }, [])
  const lampSpot = officeSpotById.lampe.position
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    if (lamp.current) lamp.current.intensity = 3.4 + Math.sin(t * 5.3) * 0.05
    if (!reducedMotion && t > nextFlash.current) {
      flash.current = 1
      nextFlash.current = t + 20 + Math.random() * 25
    }
    flash.current = Math.max(0, flash.current - dt * 3.2)
    const f = flash.current > 0 ? flash.current * (0.6 + Math.sin(t * 60) * 0.4) : 0
    if (moon.current) moon.current.intensity = 1.3 + f * 9
  })
  return (
    <>
      <hemisphereLight args={['#22303f', '#140e09', 0.6]} />
      <primitive object={moonTarget} />
      <directionalLight
        ref={moon}
        position={[1.4, 4.2, -7]}
        target={moonTarget}
        color="#8fa8d0"
        intensity={1.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-near={1}
        shadow-camera-far={20}
      />
      {/* lampe de banquier : lumière chaude rabattue sur le plateau */}
      <pointLight
        ref={lamp}
        position={[lampSpot[0], lampSpot[1] + 0.3, lampSpot[2] + 0.1]}
        color="#ffbf73"
        intensity={3.4}
        distance={6}
        decay={1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.002}
      />
      {/* suspension, très douce */}
      <pointLight position={[DESK_POS[0], 2.35, DESK_POS[2] + 0.1]} color="#ffcf8f" intensity={1.1} distance={5} decay={2} />
      {/* débouchage des coins : classeur et porte-manteau */}
      <pointLight position={[-1.2, 1.8, 1.4]} color="#e8b07a" intensity={0.9} distance={3.6} decay={2} />
      <pointLight position={[1.7, 2.0, -0.2]} color="#c9a87e" intensity={1.1} distance={3.2} decay={2} />
      <pointLight position={[-1.4, 2.4, -1.4]} color="#e8b07a" intensity={0.5} distance={3} decay={2} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={0.3} color="#8fa8d0" position={[1, 3, -4]} scale={[2, 2, 1]} />
        <Lightformer form="rect" intensity={0.15} color="#ffbf73" position={[-2, 2, 2]} scale={[2, 1, 1]} />
      </Environment>
    </>
  )
}

function Plaque({
  id,
  visible,
  disabled,
  onHover,
  onSelect,
}: {
  id: OfficeSpotId
  visible: boolean
  disabled: boolean
  onHover: (id: OfficeSpotId | null) => void
  onSelect: (id: OfficeSpotId) => void
}) {
  const { t } = useTranslation('menu')
  return (
    <button
      type="button"
      data-spot={id}
      aria-disabled={disabled}
      onPointerEnter={() => onHover(id)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(id)}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(id)}
      className={cn(
        'plaque block min-w-48 px-5 py-2 text-center whitespace-nowrap transition-[opacity,transform] duration-300 ease-[var(--ease-cinematic)]',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-1 opacity-0 focus:pointer-events-auto focus:opacity-100',
        disabled && 'plaque-off',
      )}
    >
      <span className="block font-wordmark text-[13px] font-semibold tracking-[0.14em]">{t(`office.spots.${id}.title`)}</span>
      <span className="mt-0.5 block font-mono text-[9px] tracking-[0.16em] opacity-80">{t(`office.spots.${id}.${disabled ? 'off' : 'sub'}`)}</span>
    </button>
  )
}

/** Un objet-menu : modèle, contour au survol, soulèvement, repère et plaque. */
function Spot({
  id,
  hovered,
  focus,
  disabled,
  onHover,
  onSelect,
}: {
  id: OfficeSpotId
  hovered: boolean
  focus: OfficeSpotId | null
  disabled: boolean
  onHover: (id: OfficeSpotId | null) => void
  onSelect: (id: OfficeSpotId) => void
}) {
  const spot = officeSpotById[id]
  const lifted = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!lifted.current) return
    const goal = hovered && !disabled ? spot.lift : 0
    lifted.current.position.y = THREE.MathUtils.damp(lifted.current.position.y, goal, 10, dt)
  })
  return (
    <group position={spot.position} rotation={[0, spot.rotation ?? 0, 0]}>
      <Select enabled={hovered && !focus}>
        <group ref={lifted}>{SPOT_MODELS[id]}</group>
      </Select>
      <mesh
        visible={false}
        position={spot.hit.center}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(id)
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(id)
        }}
      >
        <boxGeometry args={spot.hit.size} />
      </mesh>
      {!focus && (
        <>
          <Html position={spot.marker} center zIndexRange={[10, 0]} pointerEvents="none">
            <span
              aria-hidden
              className={cn('office-marker', disabled && 'office-marker-off', hovered && 'opacity-0')}
            />
          </Html>
          <Html position={spot.plaque} center zIndexRange={[20, 11]}>
            <Plaque id={id} visible={hovered} disabled={disabled} onHover={onHover} onSelect={onSelect} />
          </Html>
        </>
      )}
    </group>
  )
}

function Decor() {
  const [dx, , dz] = DESK_POS
  return (
    <>
      <Desk position={DESK_POS} />
      <Prop id="GreenChair_01" height={0.98} position={[dx + 0.15, 0, dz - 0.72]} rotation={Math.PI + 0.25} />
      <Prop id="magnifying_glass_01" height={0.2} fit="max" position={[dx + 0.05, DESK_TOP, dz + 0.22]} rotation={0.9} tilt={-Math.PI / 2} />
      <Prop id="mantel_clock_01" height={0.28} position={[-1.4, 1.37, 0.3]} rotation={0.75} />
      <Prop id="ClassicConsole_01" height={0.85} position={[-2.68, 0, -1.25]} rotation={Math.PI / 2} />
      <WallMap />
      <PendantLamp />
    </>
  )
}

export default function OfficeScene({ reducedMotion, hovered, focus, disabled, onHover, onSelect }: OfficeSceneProps) {
  useEffect(() => {
    document.body.style.cursor = hovered && !disabled.has(hovered) && !focus ? 'pointer' : ''
    return () => {
      document.body.style.cursor = ''
    }
  }, [hovered, focus, disabled])

  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.6]}
      camera={{ position: officeShot.position, fov: officeShot.fov, near: 0.02, far: 40 }}
      gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.08 }}
    >
      <color attach="background" args={['#050607']} />
      <fog attach="fog" args={['#07090b', 5, 12]} />
      <Suspense fallback={null}>
        <Selection>
          <OfficeLighting reducedMotion={reducedMotion} />
          <OfficeRoom />
          <Decor />
          {officeSpots.map((s) => (
            <Spot
              key={s.id}
              id={s.id}
              hovered={hovered === s.id}
              focus={focus}
              disabled={disabled.has(s.id)}
              onHover={onHover}
              onSelect={onSelect}
            />
          ))}
          {!reducedMotion && (
            <Sparkles count={70} scale={[2.2, 1.4, 1.6]} position={[0.2, 1.4, -1]} size={1.4} speed={0.15} opacity={0.3} color="#f3d6a0" />
          )}
          <EffectComposer multisampling={4} autoClear={false}>
            <Outline visibleEdgeColor={0xe8c48a} hiddenEdgeColor={0x6b5634} edgeStrength={4} blur width={1200} />
            <Bloom intensity={0.7} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur />
            <Noise opacity={0.045} blendFunction={BlendFunction.OVERLAY} />
            <Vignette offset={0.28} darkness={0.8} />
          </EffectComposer>
        </Selection>
      </Suspense>
      <OfficeCamera focus={focus} reducedMotion={reducedMotion} />
    </Canvas>
  )
}
