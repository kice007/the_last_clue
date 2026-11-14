import { env, isSupabaseConfigured } from '@/lib/env'
import { mockGateway } from './mock'
import { createSupabaseGateway } from './supabase'
import type { GameGateway } from './types'

let gateway: GameGateway | null = null

export function getGateway(): GameGateway {
  if (gateway) return gateway
  if (env.dataSource === 'supabase') {
    if (!isSupabaseConfigured) {
      console.warn('[data] VITE_DATA_SOURCE=supabase mais Supabase non configuré : retour au prototype.')
      gateway = mockGateway
    } else {
      gateway = createSupabaseGateway()
    }
  } else {
    gateway = mockGateway
  }
  return gateway
}

export type { GameGateway } from './types'
