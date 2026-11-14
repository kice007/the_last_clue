import { Suspense, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { Select } from '@react-three/postprocessing'
import * as THREE from 'three'
import { examinables } from '@/data/cases/_prototype/studySlice'
import { ExaminableModelView, examinableHeight } from '@/game/objects/ExaminableModel'
import { useInvestigationStore } from '@/stores/investigationStore'
import { pointerState } from './pointerState'

/** Repère discret au-dessus d'un objet examinable : point laiton qui respire. */
function Marker({ visible }: { visible: boolean }) {
  const ring = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ring.current) return
    ring.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2.2) * 0.15)
    const m = ring.current.material as THREE.MeshBasicMaterial
    m.opacity = visible ? THREE.MathUtils.lerp(m.opacity, 0.75, 0.08) : 0
  })
  return (
    <Billboard>
      <mesh ref={ring}>
        <ringGeometry args={[0.011, 0.015, 32]} />
        <meshBasicMaterial color="#e8c48a" transparent opacity={0} toneMapped={false} depthTest={false} />
      </mesh>
    </Billboard>
  )
}

/**
 * Tous les objets examinables : même repère, même contour au survol, même examen.
 * Le joueur ne sait pas ce qui compte avant d'y avoir réfléchi.
 */
export function EvidenceHotspots({ onHover }: { onHover: (id: string | null) => void }) {
  const view = useInvestigationStore((s) => s.view)
  const inspecting = useInvestigationStore((s) => s.inspecting)
  const inspect = useInvestigationStore((s) => s.inspect)
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <>
      {examinables.map((e) => {
        const h = examinableHeight(e)
        return (
          <group key={e.id} position={e.position}>
            <Select enabled={hovered === e.id && !inspecting}>
              <Suspense fallback={null}>
                <ExaminableModelView model={e.model} />
              </Suspense>
            </Select>
            <group position={[0, h + 0.05, 0]}>
              <Marker visible={!inspecting && e.view === view} />
            </group>
            <mesh
              visible={false}
              position={[0, h / 2, 0]}
              onPointerOver={(ev) => {
                ev.stopPropagation()
                setHovered(e.id)
                onHover(e.id)
                document.body.style.cursor = 'pointer'
              }}
              onPointerOut={() => {
                setHovered(null)
                onHover(null)
                document.body.style.cursor = ''
              }}
              onClick={(ev) => {
                ev.stopPropagation()
                if (pointerState.dragged) return
                document.body.style.cursor = ''
                inspect(e.id)
              }}
            >
              <sphereGeometry args={[e.hit, 12, 12]} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}
