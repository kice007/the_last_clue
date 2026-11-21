import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

const url = (id: string, map: string, res: string) => `/assets/textures/materials/${id}/${id}_${map}_${res}.jpg`

type PbrMaps = { map: THREE.Texture; normalMap: THREE.Texture; roughnessMap: THREE.Texture }

/** Jeu de textures PBR Poly Haven (diffuse, normale, rugosité), répétées. */
export function usePbr(id: string, repeatX = 1, repeatY = 1, rotation = 0, res: '1k' | '2k' = '1k'): PbrMaps {
  const maps = useTexture({ map: url(id, 'diffuse', res), normalMap: url(id, 'nor_gl', res), roughnessMap: url(id, 'rough', res) })
  return useMemo(() => {
    const out = {} as PbrMaps
    for (const key of ['map', 'normalMap', 'roughnessMap'] as const) {
      const t = maps[key].clone()
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(repeatX, repeatY)
      t.rotation = rotation
      t.anisotropy = 8
      if (key === 'map') t.colorSpace = THREE.SRGBColorSpace
      t.needsUpdate = true
      out[key] = t
    }
    return out
  }, [maps, repeatX, repeatY, rotation])
}
