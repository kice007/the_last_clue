import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import baked from './bakedStudy.json'

/**
 * Bureau de Whitmore construit et éclairé dans Blender (tools/blender/whitmore_study.py + bake_study.py).
 * La lumière est précalculée dans des lightmaps : la pièce n'utilise aucune lumière en temps réel
 * (matériaux « basic »), ce qui donne l'éclairage de Cycles pour un coût minime.
 * Les objets examinables ne sont pas dans ce fichier : le jeu les rend à part, éclairés en temps réel.
 */
const BASE = '/assets/scenes/whitmore/'
const DRACO = '/draco/'
export const BAKED_ROOM_URL = BASE + baked.glb
useGLTF.preload(BAKED_ROOM_URL, DRACO)

const LIGHTMAP_URLS = Object.fromEntries(Object.entries(baked.lightmaps).map(([group, file]) => [group, BASE + file]))
/** three divise l'éclairement d'une lightmap par π ; les textures ont été divisées par `scale`. */
const LIGHTMAP_INTENSITY = Math.PI * baked.scale

function lightmapGroup(o: THREE.Object3D | null): string | undefined {
  while (o) {
    const g = o.userData?.lightmap as string | undefined
    if (g) return g
    o = o.parent
  }
  return undefined
}

/** Groupe dont la lumière est stockée dans les sommets (objets sculptés très denses) et non dans une lightmap. */
const VERTEX_GROUP = 'vc'

interface Lit {
  lightmapped: THREE.MeshBasicMaterial[]
  vertexLit: { material: THREE.MeshBasicMaterial; base: THREE.Color }[]
}

function toBaked(src: THREE.Material, group: string | undefined, lightMap: THREE.Texture | undefined, lit: Lit) {
  const s = src as THREE.MeshPhysicalMaterial
  // verre (transmission) : vitre légère, sans lumière imprimée
  if ((s.transmission ?? 0) > 0.3) {
    return new THREE.MeshBasicMaterial({ name: s.name, color: '#c8d2dc', transparent: true, opacity: 0.12, depthWrite: false, side: s.side })
  }
  const emissive = s.emissive && s.emissive.r + s.emissive.g + s.emissive.b > 0.01 ? s.emissive.clone().multiplyScalar(s.emissiveIntensity ?? 1) : null
  if (group === VERTEX_GROUP && !emissive) {
    // couleur des sommets = éclairement / scale (linéaire) ; three multiplie couleur × texture × sommets
    const base = s.color.clone().multiplyScalar(baked.scale)
    const m = new THREE.MeshBasicMaterial({ name: s.name, map: s.map ?? null, color: base.clone(), vertexColors: true, transparent: s.transparent, opacity: s.opacity, alphaTest: s.alphaTest, side: s.side })
    lit.vertexLit.push({ material: m, base })
    return m
  }
  const m = new THREE.MeshBasicMaterial({
    name: s.name,
    map: s.map ?? null,
    color: emissive ?? s.color,
    alphaMap: s.alphaMap ?? null,
    transparent: s.transparent,
    opacity: s.opacity,
    alphaTest: s.alphaTest,
    depthWrite: s.depthWrite,
    side: s.side,
    lightMap: emissive ? null : (lightMap ?? null),
    lightMapIntensity: LIGHTMAP_INTENSITY,
  })
  if (!emissive && lightMap) lit.lightmapped.push(m)
  return m
}

export function BakedRoom({ reducedMotion }: { reducedMotion: boolean }) {
  const { scene } = useGLTF(BAKED_ROOM_URL, DRACO)
  const maps = useTexture(LIGHTMAP_URLS)
  const { root, lit } = useMemo(() => {
    for (const t of Object.values(maps)) {
      t.flipY = false // même convention que les textures glTF (UV exportées par Blender)
      t.channel = 1 // second jeu d'UV : « Lightmap »
      t.colorSpace = THREE.SRGBColorSpace
      t.needsUpdate = true
    }
    const lit: Lit = { lightmapped: [], vertexLit: [] }
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const group = lightmapGroup(mesh)
      const lm = group ? (maps as Record<string, THREE.Texture>)[group] : undefined
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map((m) => toBaked(m, group, lm, lit)) : toBaked(mesh.material, group, lm, lit)
    })
    return { root: scene, lit }
  }, [scene, maps])

  // flamme de la lampe et éclairs rares : on module toute la lumière imprimée
  const flash = useMemo(() => ({ next: 14, level: 0 }), [])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    let k = 1
    if (!reducedMotion) {
      k += Math.sin(t * 6.1) * 0.012 + Math.sin(t * 13.7) * 0.008
      if (t > flash.next) {
        flash.level = 1
        flash.next = t + 22 + Math.random() * 24
      }
      flash.level = Math.max(0, flash.level - dt * 3.2)
      if (flash.level > 0) k += flash.level * (0.6 + Math.sin(t * 60) * 0.4) * 0.35
    }
    for (const m of lit.lightmapped) m.lightMapIntensity = LIGHTMAP_INTENSITY * k
    for (const v of lit.vertexLit) v.material.color.copy(v.base).multiplyScalar(k)
  })

  return <primitive object={root} />
}
