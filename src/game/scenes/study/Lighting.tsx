import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

/** Lune froide par la fenêtre, lampe à pétrole, feu couvert. Éclairs rares. */
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
      fire.current.intensity = 1.5 + Math.sin(t * 9.1) * 0.35 + Math.sin(t * 23.7) * 0.25 + Math.sin(t * 3.3) * 0.3
    }
    if (lamp.current) lamp.current.intensity = 5.2 + Math.sin(t * 6.1) * 0.08
    if (!reducedMotion && t > nextFlash.current) {
      flash.current = 1
      nextFlash.current = t + 22 + Math.random() * 24
    }
    flash.current = Math.max(0, flash.current - dt * 3.2)
    const f = flash.current > 0 ? flash.current * (0.6 + Math.sin(t * 60) * 0.4) : 0
    if (moon.current) moon.current.intensity = 1.5 + f * 9
  })

  return (
    <>
      <hemisphereLight args={['#1c2a3a', '#120c08', 0.45]} />
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
        position={[-0.56, 1.12, -1.86]}
        color="#ffae5e"
        intensity={5.2}
        distance={9}
        decay={1.7}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.002}
      />
      <mesh position={[-0.56, 1.08, -1.86]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color="#ffd49a" toneMapped={false} />
      </mesh>
      {/* feu couvert */}
      <pointLight
        ref={fire}
        position={[-3.12, 0.3, -0.4]}
        color="#ff7a2e"
        intensity={2.6}
        distance={6}
        decay={1.8}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.003}
      />
      {/* lumière renvoyée (sans ombre) : coin du fauteuil, bibliothèque */}
      <pointLight position={[-2.2, 1.3, 1.3]} color="#ff9a55" intensity={0.7} distance={3.2} decay={2} />
      <pointLight position={[2.3, 2.1, 0.1]} color="#e8b07a" intensity={0.9} distance={4} decay={2} />
      {/* reflets discrets pour le laiton et le verre (aucun fichier HDR externe) */}
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={0.25} color="#8fa8d0" position={[1, 3, -4]} scale={[2, 2, 1]} />
      </Environment>
    </>
  )
}
