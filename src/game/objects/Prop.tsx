import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface PropProps {
  id: string
  /** Hauteur cible en mètres : le modèle est normalisé, base posée à y = 0. */
  height: number
  /** 'height' : hauteur imposée ; 'max' : plus grande dimension imposée (petits objets couchés). */
  fit?: 'height' | 'max'
  position?: [number, number, number]
  rotation?: number
  /** Bascule autour de X avant mise à l'échelle (objet couché). */
  tilt?: number
  castShadow?: boolean
}

export const propUrl = (id: string) => `/assets/props/polyhaven/${id}/${id}.gltf`

/** Modèle Poly Haven (CC0) mis à l'échelle et posé au sol. */
export function Prop({ id, height, fit = 'height', position = [0, 0, 0], rotation = 0, tilt = 0, castShadow = true }: PropProps) {
  const { scene } = useGLTF(propUrl(id))
  const { object, scale, offset } = useMemo(() => {
    const object = scene.clone(true)
    object.rotation.x = tilt
    object.updateMatrixWorld(true)
    object.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = castShadow
        o.receiveShadow = true
      }
    })
    const box = new THREE.Box3().setFromObject(object)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = height / (fit === 'max' ? Math.max(size.x, size.y, size.z) : size.y)
    return {
      object,
      scale,
      offset: new THREE.Vector3(-center.x * scale, -box.min.y * scale, -center.z * scale),
    }
  }, [scene, height, fit, tilt, castShadow])
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <primitive object={object} scale={scale} position={offset} />
    </group>
  )
}
