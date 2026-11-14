import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import { pointerState } from '@/game/interactions/pointerState'

// Les mouvements de caméra suivent le temps réel, même si l'image chute (machine lente).
gsap.ticker.lagSmoothing(0)

export interface CameraShot {
  position: [number, number, number]
  target: [number, number, number]
  fov?: number
}

interface CameraDirectorProps {
  shot: CameraShot
  reducedMotion: boolean
  /** Rotation à la souris autorisée (désactivée pendant l'examen d'un objet). */
  interactive: boolean
  /** Appelé à la fin d'une rotation : mémorise le nouveau cadrage. */
  onLook: (shot: CameraShot) => void
}

const YAW_SPEED = 0.0028
const PITCH_SPEED = 0.0022
const MAX_PITCH = THREE.MathUtils.degToRad(38)
const DRAG_THRESHOLD = 4

/**
 * Caméra cinématique : points de vue fixes avec transitions douces (GSAP),
 * rotation de la tête en maintenant le clic.
 */
export function CameraDirector({ shot, reducedMotion, interactive, onLook }: CameraDirectorProps) {
  const { camera, pointer, gl } = useThree()
  const base = useRef(new THREE.Vector3(...shot.position))
  const target = useRef(new THREE.Vector3(...shot.target))
  const fov = useRef(shot.fov ?? 45)
  const look = useMemo(() => new THREE.Vector3(), [])
  const first = useRef(true)
  const tween = useRef<gsap.core.Timeline | null>(null)
  const manual = useRef(false)

  useEffect(() => {
    // Cadrage identique à la position actuelle (fin d'une rotation) : rien à animer.
    const same =
      base.current.distanceTo(new THREE.Vector3(...shot.position)) < 1e-3 &&
      target.current.distanceTo(new THREE.Vector3(...shot.target)) < 1e-3
    if (same && !first.current) return
    manual.current = false
    const dur = first.current || reducedMotion ? 0 : 1.6
    first.current = false
    const tl = gsap.timeline({ defaults: { duration: dur, ease: 'power3.inOut' } })
    tl.to(base.current, { x: shot.position[0], y: shot.position[1], z: shot.position[2] }, 0)
    tl.to(target.current, { x: shot.target[0], y: shot.target[1], z: shot.target[2] }, 0)
    tl.to(fov, { current: shot.fov ?? 45 }, 0)
    tween.current = tl
    return () => {
      tl.kill()
    }
  }, [shot, reducedMotion])

  // Rotation : clic maintenu + glisser.
  useEffect(() => {
    const el = gl.domElement
    let down = false
    let startX = 0
    let startY = 0
    let lastX = 0
    let lastY = 0
    const dir = new THREE.Vector3()
    const right = new THREE.Vector3()
    const up = new THREE.Vector3(0, 1, 0)

    const onDown = (e: PointerEvent) => {
      if (!interactive || e.button !== 0) return
      down = true
      pointerState.dragged = false
      startX = lastX = e.clientX
      startY = lastY = e.clientY
    }
    const onMove = (e: PointerEvent) => {
      if (!down) return
      if (!pointerState.dragged && Math.hypot(e.clientX - startX, e.clientY - startY) < DRAG_THRESHOLD) return
      if (!pointerState.dragged) {
        pointerState.dragged = true
        tween.current?.kill()
        el.setPointerCapture(e.pointerId)
        el.style.cursor = 'grabbing'
      }
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      dir.copy(target.current).sub(base.current)
      const dist = dir.length()
      dir.normalize()
      // lacet (gauche / droite)
      dir.applyAxisAngle(up, -dx * YAW_SPEED)
      // tangage (haut / bas), borné
      right.crossVectors(dir, up).normalize()
      const pitch = Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1))
      const next = THREE.MathUtils.clamp(pitch - dy * PITCH_SPEED, -MAX_PITCH, MAX_PITCH)
      dir.applyAxisAngle(right, next - pitch)
      target.current.copy(base.current).addScaledVector(dir, dist)
      manual.current = true
    }
    const onUp = (e: PointerEvent) => {
      if (!down) return
      down = false
      if (pointerState.dragged) {
        el.releasePointerCapture?.(e.pointerId)
        el.style.cursor = ''
        onLook({
          position: base.current.toArray() as [number, number, number],
          target: target.current.toArray() as [number, number, number],
          fov: fov.current,
        })
        // laisse passer le clic synthétique qui suit le relâchement
        window.setTimeout(() => (pointerState.dragged = false), 0)
      }
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [gl, interactive, onLook])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const sway = reducedMotion ? 0 : 1
    camera.position.set(
      base.current.x + Math.sin(t * 0.35) * 0.008 * sway,
      base.current.y + Math.sin(t * 0.5) * 0.006 * sway,
      base.current.z,
    )
    look.copy(target.current)
    // léger mouvement de tête au survol, coupé dès que le joueur oriente lui-même la caméra
    const parallax = manual.current || !interactive ? 0 : sway
    look.x += pointer.x * 0.12 * parallax
    look.y += pointer.y * 0.07 * parallax
    camera.lookAt(look)
    const cam = camera as THREE.PerspectiveCamera
    if (Math.abs(cam.fov - fov.current) > 0.01) {
      cam.fov = fov.current
      cam.updateProjectionMatrix()
    }
  })

  return null
}
