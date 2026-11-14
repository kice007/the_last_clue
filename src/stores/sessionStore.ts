import { create } from 'zustand'

/**
 * État client de la session de jeu (affichage uniquement).
 * La source de vérité est la base de données : ce store est un miroir,
 * rechargé à la reconnexion et mis à jour par les notifications Realtime (étape 3).
 */
export type SessionStatus = 'idle' | 'waiting' | 'ready' | 'in_progress' | 'completed' | 'abandoned'

interface SessionState {
  sessionId: string | null
  caseId: string | null
  status: SessionStatus
  setSession: (sessionId: string, caseId: string | null) => void
  setStatus: (status: SessionStatus) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  sessionId: null,
  caseId: null,
  status: 'idle',
  setSession: (sessionId, caseId) => set({ sessionId, caseId }),
  setStatus: (status) => set({ status }),
  reset: () => set({ sessionId: null, caseId: null, status: 'idle' }),
}))
