import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Composition provisoire de la landing (aucun asset externe) :
 * un plateau de bureau en bois sombre, la lettre cachetée et une montre de gousset,
 * éclairés par une lampe chaude et la lune froide. Sera remplacée par les vrais modèles.
 */

function makeWoodTexture() {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 512
  const g = c.getContext('2d')!
  g.fillStyle = '#1f150f'
  g.fillRect(0, 0, c.width, c.height)
  for (let i = 0; i < 260; i++) {
    const y = Math.random() * c.height
    const amp = 2 + Math.random() * 6
    const freq = 0.004 + Math.random() * 0.01
    g.strokeStyle = `rgba(${60 + Math.random() * 40}, ${38 + Math.random() * 20}, ${22 + Math.random() * 12}, ${0.08 + Math.random() * 0.22})`
    g.lineWidth = 0.6 + Math.random() * 2.2
    g.beginPath()
    for (let x = 0; x <= c.width; x += 8) {
      const yy = y + Math.sin(x * freq + i) * amp
      if (x === 0) g.moveTo(x, yy)
      else g.lineTo(x, yy)
    }
    g.stroke()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 1)
  tex.anisotropy = 8
  return tex
}

function makeEnvelopeTexture() {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 640
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(512, 320, 80, 512, 320, 640)
  grad.addColorStop(0, '#e2d5b8')
  grad.addColorStop(1, '#b9a882')
  g.fillStyle = grad
  g.fillRect(0, 0, c.width, c.height)
  // fibres et taches
  for (let i = 0; i < 1400; i++) {
    g.fillStyle = `rgba(90, 70, 40, ${Math.random() * 0.05})`
    g.fillRect(Math.random() * c.width, Math.random() * c.height, 1 + Math.random() * 3, 1)
  }
  for (let i = 0; i < 6; i++) {
    g.fillStyle = 'rgba(120, 90, 50, 0.05)'
    g.beginPath()
    g.arc(Math.random() * c.width, Math.random() * c.height, 30 + Math.random() * 90, 0, Math.PI * 2)
    g.fill()
  }
  // mention manuscrite discrète, coin inférieur gauche (dos de l'enveloppe)
  g.fillStyle = 'rgba(38, 28, 20, 0.7)'
  g.font = 'italic 500 38px "Cormorant Garamond", Georgia, serif'
  g.fillText('Blackwood Manor', 70, 560)
  g.font = 'italic 400 30px "Cormorant Garamond", Georgia, serif'
  g.fillText('14 · XI · 1908', 70, 600)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

function makeWatchFaceTexture() {
  const s = 512
  const c = document.createElement('canvas')
  c.width = c.height = s
  const g = c.getContext('2d')!
  g.fillStyle = '#e9e1cd'
  g.beginPath()
  g.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = '#2a241c'
  g.fillStyle = '#2a241c'
  g.lineWidth = 3
  g.beginPath()
  g.arc(s / 2, s / 2, s / 2 - 28, 0, Math.PI * 2)
  g.stroke()
  const numerals = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']
  g.font = '500 44px "Cinzel", Georgia, serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  numerals.forEach((n, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2
    g.fillText(n, s / 2 + Math.cos(a) * 170, s / 2 + Math.sin(a) * 170)
  })
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2
    const r1 = s / 2 - 30
    const r2 = r1 - (i % 5 === 0 ? 16 : 7)
    g.lineWidth = i % 5 === 0 ? 3 : 1.2
    g.beginPath()
    g.moveTo(s / 2 + Math.cos(a) * r1, s / 2 + Math.sin(a) * r1)
    g.lineTo(s / 2 + Math.cos(a) * r2, s / 2 + Math.sin(a) * r2)
    g.stroke()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function Envelope() {
  const texture = useMemo(makeEnvelopeTexture, [])
  const flap = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-0.6, 0.375)
    shape.lineTo(0.6, 0.375)
    shape.lineTo(0, -0.06)
    shape.closePath()
    return shape
  }, [])
  return (
    <group position={[0.56, 0.006, -0.05]} rotation={[-Math.PI / 2, 0, 0.16]}>
      <mesh receiveShadow castShadow>
        <planeGeometry args={[1.2, 0.75]} />
        <meshStandardMaterial map={texture} roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.002]} castShadow>
        <shapeGeometry args={[flap]} />
        <meshStandardMaterial color="#cdbd99" roughness={0.95} transparent opacity={0.55} />
      </mesh>
      {/* cachet de cire */}
      <group position={[0, -0.04, 0.012]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.085, 0.092, 0.02, 48]} />
          <meshStandardMaterial color="#6e1a16" roughness={0.38} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0, 0.011]}>
          <torusGeometry args={[0.055, 0.006, 12, 48]} />
          <meshStandardMaterial color="#8a2520" roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

function PocketWatch() {
  const face = useMemo(makeWatchFaceTexture, [])
  // aiguilles figées sur une heure sans signification narrative (10 h 08)
  return (
    <group position={[0.12, 0.018, 0.78]} rotation={[0, -0.9, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.036, 64]} />
        <meshStandardMaterial color="#a8834a" metalness={1} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.0185, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.148, 64]} />
        <meshStandardMaterial map={face} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.021, 0]} rotation={[-Math.PI / 2, 0, -0.18]}>
        <planeGeometry args={[0.008, 0.09]} />
        <meshStandardMaterial color="#1a1612" />
      </mesh>
      <mesh position={[0.03, 0.022, -0.02]} rotation={[-Math.PI / 2, 0, 1.0]}>
        <planeGeometry args={[0.006, 0.12]} />
        <meshStandardMaterial color="#1a1612" />
      </mesh>
      {/* verre bombé */}
      <mesh position={[0, 0.02, 0]} scale={[1, 0.12, 1]}>
        <sphereGeometry args={[0.15, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial transparent opacity={0.18} roughness={0.05} transmission={0.6} thickness={0.02} />
      </mesh>
      {/* bélière */}
      <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.03, 0.008, 12, 32]} />
        <meshStandardMaterial color="#a8834a" metalness={1} roughness={0.3} />
      </mesh>
      {/* chaîne */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh
          key={i}
          position={[0.04 * Math.sin(i * 0.5), 0, -0.24 - i * 0.035]}
          rotation={[Math.PI / 2, 0, i % 2 ? Math.PI / 2 : 0]}
          castShadow
        >
          <torusGeometry args={[0.012, 0.0035, 8, 16]} />
          <meshStandardMaterial color="#9c7a45" metalness={1} roughness={0.35} />
        </mesh>
      ))}
    </group>
  )
}

function Lamp() {
  const light = useRef<THREE.SpotLight>(null)
  const target = useMemo(() => new THREE.Object3D(), [])
  useFrame(({ clock }) => {
    if (!light.current) return
    const t = clock.elapsedTime
    light.current.intensity = 26 + Math.sin(t * 7.3) * 0.5 + Math.sin(t * 13.1) * 0.35
  })
  return (
    <>
      <primitive object={target} position={[0, 0, 0.1]} />
      <spotLight
        ref={light}
        position={[-1.6, 2.1, 1.1]}
        target={target}
        angle={0.55}
        penumbra={0.9}
        distance={8}
        decay={1.6}
        color="#ffb36b"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
    </>
  )
}

function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera, pointer } = useThree()
  const start = useRef(performance.now())
  const look = useMemo(() => new THREE.Vector3(-0.12, 0, 0.25), [])
  useFrame(() => {
    const t = Math.min(1, (performance.now() - start.current) / 4200)
    const ease = reducedMotion ? 1 : 1 - Math.pow(1 - t, 3)
    const dolly = THREE.MathUtils.lerp(4.1, 3.0, ease)
    const px = reducedMotion ? 0 : pointer.x * 0.12
    const py = reducedMotion ? 0 : pointer.y * 0.06
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0.35 + px, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.7 + py, 0.05)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, dolly, 0.08)
    camera.lookAt(look)
  })
  return null
}

function Desk() {
  const wood = useMemo(makeWoodTexture, [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[9, 5]} />
      <meshStandardMaterial map={wood} roughness={0.58} metalness={0.05} />
    </mesh>
  )
}

function SceneContents({ reducedMotion }: { reducedMotion: boolean }) {
  const { gl } = useThree()
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 0.95
  }, [gl])
  return (
    <>
      <color attach="background" args={['#0b0d0f']} />
      <fog attach="fog" args={['#0b0d0f', 2.4, 6.5]} />
      <ambientLight intensity={0.05} color="#8aa0b8" />
      {/* lune froide, par la fenêtre derrière */}
      <directionalLight position={[2.5, 3, -3]} intensity={0.55} color="#7894b8" />
      <Lamp />
      <Desk />
      <Envelope />
      <PocketWatch />
      {!reducedMotion && (
        <Sparkles count={70} scale={[2.6, 1.4, 1.6]} position={[0.2, 0.8, 0.4]} size={1.6} speed={0.18} opacity={0.35} color="#f0cf96" />
      )}
      <CameraRig reducedMotion={reducedMotion} />
    </>
  )
}

export default function LandingStudyScene({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.75]}
      camera={{ position: [0.05, 1.55, 3.6], fov: 30, near: 0.1, far: 20 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <SceneContents reducedMotion={reducedMotion} />
    </Canvas>
  )
}
