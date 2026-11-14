import { z } from 'zod'

/** Variables publiques uniquement (préfixe VITE_). Aucun secret serveur ici. */
const EnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional().or(z.literal('')),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
  VITE_DATA_SOURCE: z.enum(['mock', 'supabase']).default('mock'),
})

const parsed = EnvSchema.safeParse(import.meta.env)

if (!parsed.success) {
  console.warn('[env] Variables invalides, retour au mode prototype.', parsed.error.issues)
}

const raw = parsed.success ? parsed.data : { VITE_DATA_SOURCE: 'mock' as const }

export const env = {
  supabaseUrl: raw.VITE_SUPABASE_URL || undefined,
  supabaseAnonKey: raw.VITE_SUPABASE_ANON_KEY || undefined,
  dataSource: raw.VITE_DATA_SOURCE,
} as const

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey)
