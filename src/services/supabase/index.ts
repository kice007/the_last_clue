import type { AuthError, PostgrestError, SupabaseClient, User } from '@supabase/supabase-js'
import { prototypeCatalog } from '@/data/cases/_prototype/catalog'
import { CaseSummary } from '@/data/schemas/case'
import { getSupabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import {
  GatewayError,
  type CollectedEvidence,
  type GameGateway,
  type GameSession,
  type GatewayErrorCode,
  type Inspector,
  type SessionStatus,
} from '../types'

type Db = SupabaseClient<Database>
type CaseRow = Database['public']['Tables']['cases']['Row']
type SessionRow = Database['public']['Tables']['game_sessions']['Row']
type PlayerRow = Database['public']['Tables']['session_players']['Row']

/**
 * Messages levés par les fonctions SQL (`raise exception`) → codes d'erreur du jeu.
 * Voir supabase/migrations/20261114000000_init.sql.
 */
const SQL_ERRORS: [RegExp, GatewayErrorCode][] = [
  [/non authentifié/i, 'not_authenticated'],
  [/affaire inconnue/i, 'unknown_case'],
  [/code invalide ou expiré/i, 'invalid_code'],
  [/salle est complète/i, 'room_full'],
  [/trop de tentatives/i, 'rate_limited'],
  [/enquête non démarrée/i, 'not_started'],
  [/accès refusé/i, 'forbidden'],
]

function fromPostgrest(error: PostgrestError): GatewayError {
  for (const [re, code] of SQL_ERRORS) if (re.test(error.message)) return new GatewayError(code, error.message)
  if (error.code === '42501' || error.code === 'PGRST301') return new GatewayError('forbidden', error.message)
  if (/fetch|network/i.test(error.message)) return new GatewayError('network', error.message)
  return new GatewayError('unknown', error.message)
}

function fromAuth(error: AuthError): GatewayError {
  switch (error.code) {
    case 'invalid_credentials':
      return new GatewayError('invalid_credentials', error.message)
    case 'user_already_exists':
    case 'email_exists':
      return new GatewayError('email_taken', error.message)
    case 'weak_password':
      return new GatewayError('weak_password', error.message)
    case 'email_not_confirmed':
      return new GatewayError('confirmation_required', error.message)
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return new GatewayError('rate_limited', error.message)
  }
  if (error.status === 0 || /fetch|network/i.test(error.message)) return new GatewayError('network', error.message)
  return new GatewayError('unknown', error.message)
}

/** Lève une GatewayError si Supabase a renvoyé une erreur ou rien du tout, sinon renvoie les données. */
function unwrap<T>(res: { data: T | null; error: PostgrestError | null }): T {
  if (res.error) throw fromPostgrest(res.error)
  if (res.data === null) throw new GatewayError('unknown', 'réponse vide')
  return res.data
}

/** Pour `maybeSingle()` : null signifie « introuvable », pas une erreur. */
function unwrapMaybe<T>(res: { data: T | null; error: PostgrestError | null }): T | null {
  if (res.error) throw fromPostgrest(res.error)
  return res.data
}

/** Pour les écritures qui ne renvoient rien. */
function check(res: { error: PostgrestError | null }) {
  if (res.error) throw fromPostgrest(res.error)
}

/** Utilisateur de la session mémorisée (sans appel réseau). */
async function requireUser(db: Db): Promise<User> {
  const { data } = await db.auth.getSession()
  if (!data.session) throw new GatewayError('not_authenticated')
  return data.session.user
}

async function loadInspector(db: Db, user: User): Promise<Inspector> {
  const profile = unwrapMaybe<{ id: string; display_name: string }>(await db.from('profiles').select('id, display_name').eq('id', user.id).maybeSingle())
  // Profil créé par un déclencheur à l'inscription ; repli sur les métadonnées s'il tarde.
  const fallback = typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : 'Inspecteur'
  return { id: user.id, displayName: profile?.display_name ?? fallback }
}

/** Les métadonnées de lieu et de date restent dans les données locales de l'affaire. */
function toCaseSummary(row: CaseRow): CaseSummary | null {
  const local = prototypeCatalog.find((c) => c.id === row.id)
  const parsed = CaseSummary.safeParse({
    id: row.id,
    title: row.title,
    category: row.category,
    difficulty: row.difficulty,
    durationMinutes: [row.duration_min, row.duration_max],
    summary: row.summary,
    location: local?.location ?? { fr: '—' },
    incidentDate: local?.incidentDate,
  })
  if (!parsed.success) {
    console.warn('[data] affaire ignorée, format inattendu :', row.id, parsed.error.issues)
    return null
  }
  return parsed.data
}

async function loadSessions(db: Db, ids: string[]): Promise<GameSession[]> {
  if (ids.length === 0) return []
  const sessions = unwrap(await db.from('game_sessions').select('*').in('id', ids).order('created_at', { ascending: false }))
  const players = unwrap(await db.from('session_players').select('*').in('session_id', ids))
  const userIds = [...new Set(players.map((p) => p.user_id))]
  const profiles = userIds.length ? unwrap(await db.from('profiles').select('id, display_name').in('id', userIds)) : []
  const names = new Map(profiles.map((p) => [p.id, p.display_name]))
  return sessions.map((s: SessionRow) => ({
    id: s.id,
    caseId: s.case_id,
    status: s.status,
    createdBy: s.created_by,
    createdAt: s.created_at,
    startedAt: s.started_at,
    codeExpiresAt: s.code_expires_at,
    players: players
      .filter((p: PlayerRow) => p.session_id === s.id)
      .sort((a, b) => a.seat - b.seat)
      .map((p) => ({ userId: p.user_id, displayName: names.get(p.user_id) ?? 'Inspecteur', seat: p.seat, ready: p.ready })),
  }))
}

/** Abonnement Realtime à des tables filtrées sur une session : prévient, ne transporte pas l'état. */
function watch(db: Db, name: string, tables: { table: string; column: string }[], sessionId: string, onChange: () => void) {
  let channel = db.channel(`${name}:${sessionId}`)
  for (const { table, column } of tables) {
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `${column}=eq.${sessionId}` }, () => onChange())
  }
  channel.subscribe()
  return () => {
    void db.removeChannel(channel)
  }
}

export function createSupabaseGateway(): GameGateway {
  const db = getSupabase()
  if (!db) throw new Error('Supabase non configuré (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).')

  return {
    source: 'supabase',

    auth: {
      async getCurrentInspector() {
        const { data } = await db.auth.getSession()
        if (!data.session) return null
        return loadInspector(db, data.session.user)
      },
      onChange(listener) {
        const { data } = db.auth.onAuthStateChange((event, session) => {
          if (event === 'INITIAL_SESSION') return
          // Ne jamais attendre un appel Supabase dans ce rappel (verrou interne) : on diffère.
          window.setTimeout(() => {
            if (!session) return listener(null)
            loadInspector(db, session.user).then(listener, () => listener(null))
          }, 0)
        })
        return () => data.subscription.unsubscribe()
      },
      async signUp({ email, password, displayName }) {
        const name = displayName.trim()
        if (name.length < 2 || name.length > 40) throw new GatewayError('invalid_display_name')
        const { data, error } = await db.auth.signUp({ email, password, options: { data: { display_name: name } } })
        if (error) throw fromAuth(error)
        // « Confirm email » actif : compte créé mais pas encore de session.
        if (!data.session || !data.user) throw new GatewayError('confirmation_required')
        return loadInspector(db, data.user)
      },
      async signIn({ email, password }) {
        const { data, error } = await db.auth.signInWithPassword({ email, password })
        if (error) throw fromAuth(error)
        return loadInspector(db, data.user)
      },
      async signOut() {
        const { error } = await db.auth.signOut()
        if (error) throw fromAuth(error)
      },
      async updateDisplayName(displayName) {
        const name = displayName.trim()
        if (name.length < 2 || name.length > 40) throw new GatewayError('invalid_display_name')
        const user = await requireUser(db)
        check(await db.from('profiles').update({ display_name: name }).eq('id', user.id))
        return { id: user.id, displayName: name }
      },
    },

    cases: {
      async listCases() {
        const rows = unwrap(await db.from('cases').select('*').order('sort_order'))
        return rows.map(toCaseSummary).filter((c): c is CaseSummary => c !== null)
      },
      async getCaseSummary(caseId) {
        const row = unwrapMaybe(await db.from('cases').select('*').eq('id', caseId).maybeSingle())
        return row ? toCaseSummary(row) : null
      },
    },

    sessions: {
      async create(caseId) {
        await requireUser(db)
        const rows = unwrap(await db.rpc('create_session', { p_case: caseId }))
        const row = rows[0]
        if (!row) throw new GatewayError('unknown')
        return { sessionId: row.session_id, inviteCode: row.invite_code }
      },
      async join(code) {
        await requireUser(db)
        return unwrap(await db.rpc('join_session', { p_code: code.trim().toUpperCase() }))
      },
      async setReady(sessionId, ready) {
        await requireUser(db)
        return unwrap(await db.rpc('set_ready', { p_session: sessionId, p_ready: ready })) as SessionStatus
      },
      async get(sessionId) {
        const [session] = await loadSessions(db, [sessionId])
        return session ?? null
      },
      async listMine() {
        const user = await requireUser(db)
        const mine = unwrap(await db.from('session_players').select('session_id').eq('user_id', user.id))
        return loadSessions(db, mine.map((m) => m.session_id))
      },
      subscribe(sessionId, onChange) {
        return watch(db, 'session', [
          { table: 'game_sessions', column: 'id' },
          { table: 'session_players', column: 'session_id' },
        ], sessionId, onChange)
      },
    },

    evidence: {
      async collect(sessionId, examinableId) {
        await requireUser(db)
        return unwrap(await db.rpc('collect_evidence', { p_session: sessionId, p_examinable: examinableId }))
      },
      async list(sessionId) {
        const rows = unwrap(await db.from('session_evidence').select('*').eq('session_id', sessionId).order('number'))
        return rows.map(
          (r): CollectedEvidence => ({
            examinableId: r.examinable_id,
            number: r.number,
            collectedBy: r.collected_by,
            collectedAt: r.collected_at,
            assessment: r.assessment,
          }),
        )
      },
      subscribe(sessionId, onChange) {
        return watch(db, 'evidence', [{ table: 'session_evidence', column: 'session_id' }], sessionId, onChange)
      },
    },
  }
}
