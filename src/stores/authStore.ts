import { create } from 'zustand'
import { getGateway } from '@/services'
import type { Inspector } from '@/services/types'

/**
 * Inspecteur connecté, miroir de la session d'authentification (Supabase ou prototype).
 * `loading` tant que la session mémorisée n'a pas été relue.
 */
interface AuthState {
  status: 'loading' | 'signedOut' | 'signedIn'
  inspector: Inspector | null
  set: (inspector: Inspector | null) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'loading',
  inspector: null,
  set: (inspector) => set({ inspector, status: inspector ? 'signedIn' : 'signedOut' }),
}))

let started = false

/** À appeler une fois au démarrage : relit la session puis suit les changements. */
export function startAuth() {
  if (started) return
  started = true
  const gateway = getGateway()
  const { set } = useAuthStore.getState()
  gateway.auth.onChange(set)
  gateway.auth.getCurrentInspector().then(set, (e: unknown) => {
    console.warn('[auth] session illisible, déconnecté.', e)
    set(null)
  })
}
