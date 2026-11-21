/**
 * Types du schéma `public`, écrits à la main d'après
 * `supabase/migrations/20261114000000_init.sql` (même forme que `supabase gen types`).
 * À tenir à jour à chaque migration, ou à régénérer :
 *   npx supabase gen types typescript --project-id <id> --schema public > src/lib/supabase/database.types.ts
 * Le schéma `private` (solution, tentatives) n'est jamais exposé au navigateur.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type SessionStatusDb = 'waiting' | 'ready' | 'in_progress' | 'completed' | 'abandoned'
export type EvidenceAssessmentDb = 'to_verify' | 'disputed' | 'corroborated' | 'refuted'

export interface Database {
  public: {
    Tables: {
      profiles: Table<{ id: string; display_name: string; created_at: string }, never, { display_name?: string }>
      cases: Table<
        {
          id: string
          title: string
          category: 'fictional' | 'historical'
          difficulty: 'easy' | 'medium' | 'hard'
          duration_min: number
          duration_max: number
          summary: Json
          published: boolean
          sort_order: number
        },
        never,
        never
      >
      game_sessions: Table<
        {
          id: string
          case_id: string
          created_by: string
          status: SessionStatusDb
          code_hash: string | null
          code_expires_at: string | null
          created_at: string
          started_at: string | null
          completed_at: string | null
        },
        never,
        never
      >
      session_players: Table<
        { session_id: string; user_id: string; seat: 1 | 2; ready: boolean; joined_at: string },
        never,
        never
      >
      session_evidence: Table<
        {
          session_id: string
          examinable_id: string
          number: number
          collected_by: string
          collected_at: string
          assessment: EvidenceAssessmentDb
        },
        never,
        { assessment?: EvidenceAssessmentDb }
      >
      session_interrogations: Table<{ session_id: string; node_id: string; triggered_by: string; triggered_at: string }, never, never>
      session_unlocks: Table<{ session_id: string; unlock_id: string; unlocked_by: string; unlocked_at: string }, never, never>
      session_notes: Table<
        {
          id: string
          session_id: string
          author_id: string
          visibility: 'shared' | 'private'
          target_ref: string | null
          body: string
          created_at: string
          updated_at: string
        },
        {
          id?: string
          session_id: string
          author_id: string
          visibility: 'shared' | 'private'
          target_ref?: string | null
          body: string
        },
        { body?: string; target_ref?: string | null; visibility?: 'shared' | 'private'; updated_at?: string }
      >
      session_board_cards: Table<
        { session_id: string; ref: string; x: number; y: number; placed_by: string; updated_at: string },
        { session_id: string; ref: string; x: number; y: number; placed_by: string; updated_at?: string },
        { x?: number; y?: number; placed_by?: string; updated_at?: string }
      >
      session_links: Table<
        { id: string; session_id: string; from_ref: string; to_ref: string; label: string | null; author_id: string; created_at: string },
        { id?: string; session_id: string; from_ref: string; to_ref: string; label?: string | null; author_id: string },
        never
      >
      session_timeline: Table<
        { session_id: string; ref: string; minute_of_day: number; placed_by: string },
        { session_id: string; ref: string; minute_of_day: number; placed_by: string },
        { minute_of_day?: number; placed_by?: string }
      >
      session_verdicts: Table<
        {
          session_id: string
          payload: Json
          signed_by: string[]
          hints_used: number
          submitted_at: string | null
          result: Json | null
        },
        never,
        never
      >
    }
    Views: { [_ in never]: never }
    Functions: {
      is_session_member: { Args: { p_session: string }; Returns: boolean }
      create_session: { Args: { p_case: string }; Returns: { session_id: string; invite_code: string }[] }
      join_session: { Args: { p_code: string }; Returns: string }
      set_ready: { Args: { p_session: string; p_ready: boolean }; Returns: SessionStatusDb }
      collect_evidence: { Args: { p_session: string; p_examinable: string }; Returns: number }
      record_interrogation: { Args: { p_session: string; p_node: string }; Returns: undefined }
      save_verdict_draft: { Args: { p_session: string; p_payload: Json }; Returns: undefined }
      sign_verdict: { Args: { p_session: string }; Returns: Json }
    }
    Enums: { session_status: SessionStatusDb }
    CompositeTypes: { [_ in never]: never }
  }
}
