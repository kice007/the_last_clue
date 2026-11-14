import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env, isSupabaseConfigured } from '@/lib/env'
import type { Database } from './database.types'

/**
 * Client Supabase unique, créé à la demande.
 * Tant que Supabase n'est pas configuré (étape 3), getSupabase() renvoie null
 * et l'application fonctionne avec l'adaptateur de prototype (services/mock).
 * La clé service_role n'est JAMAIS utilisée côté navigateur.
 */
let client: SupabaseClient<Database> | null = null

export function getSupabase(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) return null
  if (!client) {
    client = createClient<Database>(env.supabaseUrl!, env.supabaseAnonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 10 } },
    })
  }
  return client
}
