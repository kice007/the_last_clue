import type { ViewId } from '@/stores/investigationStore'

export interface Viewpoint {
  id: ViewId
  position: [number, number, number]
  target: [number, number, number]
  fov: number
}

/** Points de vue fixes du bureau de Whitmore (repère : pièce 7 × 6 m, origine au centre du sol). */
export const studyViewpoints: Viewpoint[] = [
  { id: 'seuil', position: [-2.35, 1.68, 2.55], target: [0.1, 0.95, -1.5], fov: 48 },
  { id: 'bureau', position: [0.95, 1.48, -0.35], target: [0.1, 0.78, -1.75], fov: 42 },
  { id: 'cheminee', position: [-1.45, 1.32, 0.75], target: [-3.3, 0.75, -0.4], fov: 44 },
  { id: 'fauteuil', position: [-1.35, 1.5, -0.3], target: [-2.5, 0.55, 1.35], fov: 48 },
  { id: 'bibliotheque', position: [0.75, 1.55, 0.55], target: [3.2, 1.45, -0.2], fov: 52 },
  { id: 'fenetre', position: [0.35, 1.6, -0.75], target: [0, 1.85, -3], fov: 50 },
  { id: 'tapis', position: [0.16, 0.3, -0.82], target: [-0.08, 0.0, -1.62], fov: 40 },
]

export const viewpointById = Object.fromEntries(studyViewpoints.map((v) => [v.id, v])) as Record<ViewId, Viewpoint>
