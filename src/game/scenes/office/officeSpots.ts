import { DESK_POS, DESK_TOP } from './OfficeProps'

/** Objets du bureau de l'inspecteur qui servent de menu (maquette « Menu A »). */
export type OfficeSpotId = 'classeur' | 'telephone' | 'papiers' | 'diplomes' | 'lampe' | 'portemanteau'

type V3 = [number, number, number]

export interface OfficeSpot {
  id: OfficeSpotId
  /** Position de l'objet dans la pièce. */
  position: V3
  rotation?: number
  /** Volume de survol (boîte invisible), dans le repère de l'objet (position + rotation). */
  hit: { center: V3; size: V3 }
  /** Plaque gravée et repère : position relative à `position`. */
  plaque: V3
  marker: V3
  /** De combien l'objet se soulève au survol (0 pour les objets fixés au mur ou au sol). */
  lift: number
  /** Cadrage de la caméra quand le joueur choisit l'objet. */
  focus: { position: V3; target: V3 }
}

const [dx, , dz] = DESK_POS
const top = DESK_TOP

export const officeSpots: OfficeSpot[] = [
  {
    id: 'classeur',
    position: [-1.4, 0, 0.3],
    rotation: 0.75,
    hit: { center: [0, 0.72, 0.2], size: [0.6, 1.5, 0.95] },
    plaque: [0.25, 1.05, 0.75],
    marker: [0, 1.42, 0.35],
    lift: 0,
    focus: { position: [-0.55, 1.85, 1.3], target: [-1.2, 1.05, 0.5] },
  },
  {
    id: 'telephone',
    position: [dx - 0.58, top, dz + 0.24],
    rotation: 0.5,
    hit: { center: [0.02, 0.18, 0], size: [0.2, 0.38, 0.2] },
    plaque: [-0.05, -0.12, 0.3],
    marker: [0, 0.42, 0],
    lift: 0.025,
    focus: { position: [dx - 0.05, 1.42, dz + 1.45], target: [dx - 0.35, top + 0.12, dz + 0.24] },
  },
  {
    id: 'lampe',
    position: [dx - 0.28, top, dz - 0.18],
    rotation: 0.15,
    hit: { center: [0, 0.22, 0.03], size: [0.4, 0.45, 0.24] },
    plaque: [0, 0.62, 0],
    marker: [0, 0.5, 0.04],
    lift: 0.02,
    focus: { position: [dx - 0.1, 1.3, dz + 0.65], target: [dx - 0.28, top + 0.25, dz - 0.18] },
  },
  {
    id: 'papiers',
    position: [dx + 0.35, top, dz + 0.08],
    rotation: -0.2,
    hit: { center: [0, 0.04, 0], size: [0.5, 0.1, 0.36] },
    plaque: [0.02, -0.12, 0.3],
    marker: [0.05, 0.06, 0],
    lift: 0.02,
    focus: { position: [dx + 0.4, 1.45, dz + 0.55], target: [dx + 0.35, top, dz + 0.05] },
  },
  {
    id: 'diplomes',
    position: [2.05, 2.02, -2.41],
    hit: { center: [0, 0, 0.05], size: [0.95, 0.65, 0.1] },
    plaque: [0, -0.5, 0.1],
    marker: [-0.22, 0.38, 0.06],
    lift: 0,
    focus: { position: [1.75, 1.85, -1.0], target: [2.05, 1.95, -2.41] },
  },
  {
    id: 'portemanteau',
    position: [2.45, 0, -1.25],
    rotation: -0.6,
    hit: { center: [0, 1.15, 0.06], size: [0.55, 2.0, 0.5] },
    plaque: [-0.05, 0.6, 0.35],
    marker: [-0.04, 2.08, 0],
    lift: 0,
    focus: { position: [1.4, 1.65, 0.6], target: [2.45, 1.3, -1.25] },
  },
]

export const officeSpotById = Object.fromEntries(officeSpots.map((s) => [s.id, s])) as Record<OfficeSpotId, OfficeSpot>

/** Cadrage d'ensemble depuis la porte. */
export const officeShot = { position: [0.2, 1.6, 2.6] as V3, target: [0.05, 1.12, -1.3] as V3, fov: 54 }
