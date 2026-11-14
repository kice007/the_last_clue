import { Suspense, useCallback, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sparkles, useGLTF } from '@react-three/drei'
import { Bloom, EffectComposer, Noise, Outline, Selection, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { CameraDirector, type CameraShot } from '@/game/camera/CameraDirector'
import { viewpointById } from '@/game/camera/viewpoints'
import { EvidenceHotspots } from '@/game/interactions/EvidenceHotspots'
import { propUrl } from '@/game/objects/Prop'
import { examinableById, examinables } from '@/data/cases/_prototype/studySlice'
import { examinableHeight } from '@/game/objects/ExaminableModel'
import { useInvestigationStore } from '@/stores/investigationStore'
import { Furniture } from './Furniture'
import { Lighting } from './Lighting'
import { Room } from './Room'

const PROPS = [
  'vintage_oil_lamp', 'GreenChair_01', 'ArmChair_01', 'side_table_01', 'book_encyclopedia_set_01',
  'ornate_mirror_01', 'brass_candleholders', 'vintage_grandfather_clock_01', 'vintage_cabinet_01',
  'fancy_picture_frame_01', 'Chandelier_01',
  ...examinables.flatMap((e) => (e.model.type === 'prop' ? [e.model.id] : [])),
]
PROPS.forEach((id) => useGLTF.preload(propUrl(id)))

/** Gros plan : celui de l'objet s'il est défini, sinon on s'approche depuis son point de vue. */
function closeUpFor(id: string) {
  const e = examinableById[id]!
  if (e.closeUp) return e.closeUp
  const h = examinableHeight(e)
  const target = new THREE.Vector3(e.position[0], e.position[1] + h * 0.5, e.position[2])
  const from = new THREE.Vector3(...viewpointById[e.view].position)
  const dist = Math.max(0.38, e.hit * 3.4)
  const pos = target.clone().add(from.sub(target).normalize().multiplyScalar(dist))
  pos.y = Math.max(pos.y, target.y + dist * 0.35)
  return { position: pos.toArray() as [number, number, number], target: target.toArray() as [number, number, number] }
}

function Director({ reducedMotion }: { reducedMotion: boolean }) {
  const view = useInvestigationStore((s) => s.view)
  const freeShot = useInvestigationStore((s) => s.freeShot)
  const inspecting = useInvestigationStore((s) => s.inspecting)
  const setFreeShot = useInvestigationStore((s) => s.setFreeShot)
  const shot = useMemo<CameraShot>(() => {
    if (inspecting) return { ...closeUpFor(inspecting), fov: 34 }
    return freeShot ?? viewpointById[view]
  }, [view, freeShot, inspecting])
  const onLook = useCallback((s: CameraShot) => setFreeShot(s), [setFreeShot])
  return <CameraDirector shot={shot} reducedMotion={reducedMotion} interactive={!inspecting} onLook={onLook} />
}

export default function StudyScene({
  reducedMotion,
  onHover,
}: {
  reducedMotion: boolean
  onHover: (id: string | null) => void
}) {
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.6]}
      camera={{ position: [-2.35, 1.68, 2.55], fov: 48, near: 0.02, far: 40 }}
      gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
    >
      <color attach="background" args={['#050607']} />
      <fog attach="fog" args={['#07090b', 6, 14]} />
      <Suspense fallback={null}>
        <Selection>
          <Lighting reducedMotion={reducedMotion} />
          <Room />
          <Furniture />
          <EvidenceHotspots onHover={onHover} />
          {!reducedMotion && (
            <Sparkles count={90} scale={[1.6, 1.4, 1.4]} position={[-0.3, 1.3, -1.6]} size={1.4} speed={0.15} opacity={0.3} color="#f3d6a0" />
          )}
          <EffectComposer multisampling={4} autoClear={false}>
            <Outline visibleEdgeColor={0xe8c48a} hiddenEdgeColor={0x6b5634} edgeStrength={4} blur width={1200} />
            <Bloom intensity={0.75} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur />
            <Noise opacity={0.045} blendFunction={BlendFunction.OVERLAY} />
            <Vignette offset={0.28} darkness={0.78} />
          </EffectComposer>
        </Selection>
      </Suspense>
      <Director reducedMotion={reducedMotion} />
    </Canvas>
  )
}
