import { create } from 'zustand'

/**
 * État local du prototype d'exploration (sans multijoueur).
 * À l'étape 3, `collected` deviendra le miroir de `session_evidence` (source : PostgreSQL).
 */
export type ViewId = 'seuil' | 'bureau' | 'cheminee' | 'fauteuil' | 'bibliotheque' | 'fenetre' | 'tapis'

export interface FreeShot {
  position: [number, number, number]
  target: [number, number, number]
  fov?: number
}

interface InvestigationState {
  view: ViewId
  /** Cadrage après rotation à la souris ; remis à zéro au choix d'un point de vue. */
  freeShot: FreeShot | null
  inspecting: string | null
  /** Ordre de mise au dossier : l'index + 1 donne le numéro de pièce. */
  collected: string[]
  lastCollected: string | null
  setView: (v: ViewId) => void
  setFreeShot: (shot: FreeShot | null) => void
  inspect: (id: string | null) => void
  collect: (id: string) => void
}

export const useInvestigationStore = create<InvestigationState>()((set) => ({
  view: 'seuil',
  freeShot: null,
  inspecting: null,
  collected: [],
  lastCollected: null,
  setView: (view) => set({ view, inspecting: null, freeShot: null }),
  setFreeShot: (freeShot) => set({ freeShot }),
  inspect: (inspecting) => set({ inspecting }),
  collect: (id) =>
    set((s) => (s.collected.includes(id) ? s : { collected: [...s.collected, id], lastCollected: id })),
}))

// Pilotage pour les captures automatisées (développement uniquement).
if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as unknown as { __investigation: typeof useInvestigationStore }).__investigation = useInvestigationStore
}
