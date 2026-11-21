import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Lumières en temps réel : elles n'éclairent plus que les objets examinables (la pièce a sa lumière
 * précalculée dans Blender, voir BakedRoom). Intensités réglées pour l'exposition AgX de la scène.
 */
export function Lighting({ reducedMotion }: { reducedMotion: boolean }) {
  const moon = useRef<THREE.DirectionalLight>(null)
  const fire = useRef<THREE.PointLight>(null)
  const lamp = useRef<THREE.PointLight>(null)
  const moonTarget = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(-0.3, 0, -0.6)
    return o
  }, [])
  const nextFlash = useRef(12)
  const flash = useRef(0)

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    if (fire.current) {
      fire.current.intensity = 0.6 + Math.sin(t * 9.1) * 0.14 + Math.sin(t * 23.7) * 0.1 + Math.sin(t * 3.3) * 0.12
    }
    if (lamp.current) lamp.current.intensity = 1.6 + Math.sin(t * 6.1) * 0.03
    if (!reducedMotion && t > nextFlash.current) {
      flash.current = 1
      nextFlash.current = t + 22 + Math.random() * 24
    }
    flash.current = Math.max(0, flash.current - dt * 3.2)
    const f = flash.current > 0 ? flash.current * (0.6 + Math.sin(t * 60) * 0.4) : 0
    if (moon.current) moon.current.intensity = 0.5 + f * 3
  })

  return (
    <>
      <hemisphereLight args={['#1c2a3a', '#120c08', 0.18]} />
      <primitive object={moonTarget} />
      <directionalLight
        ref={moon}
        position={[1.6, 5.2, -8]}
        target={moonTarget}
        color="#8fa8d0"
        intensity={1.5}
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
      {/* lampe à pétrole sur le bureau */}
      <pointLight
        ref={lamp}
        position={[-0.56, 1.09, -1.86]}
        color="#ffb46a"
        intensity={1.6}
        distance={9}
        decay={1.7}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.002}
      />
      {/* feu couvert */}
      <pointLight
        ref={fire}
        position={[-3.12, 0.3, -0.4]}
        color="#ff7a2e"
        intensity={0.6}
        distance={6}
        decay={1.8}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.003}
      />
      {/* lumière renvoyée (sans ombre) : coin du fauteuil, bibliothèque */}
      <pointLight position={[-2.2, 1.3, 1.3]} color="#ff9a55" intensity={0.3} distance={3.2} decay={2} />
      <pointLight position={[2.3, 2.1, 0.1]} color="#e8b07a" intensity={0.35} distance={4} decay={2} />
      {/* reflets discrets pour le laiton et le verre (aucun fichier HDR externe) */}
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={0.25} color="#8fa8d0" position={[1, 3, -4]} scale={[2, 2, 1]} />
      </Environment>
    </>
  )
}
