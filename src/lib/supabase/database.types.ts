/**
 * Types générés depuis le schéma Supabase.
 * À régénérer à l'étape 3 :
 *   npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
 * Squelette vide en attendant.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
