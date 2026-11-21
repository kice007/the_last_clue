import { prototypeCatalog } from '@/data/cases/_prototype/catalog'
import {
  GatewayError,
  type CollectedEvidence,
  type GameGateway,
  type GameSession,
  type Inspector,
} from '../types'

/**
 * Adaptateur de prototype : tout reste dans ce navigateur, sans réseau.
 * Il applique les mêmes règles que la base (2 joueurs, code de 6 signes, numérotation
 * sans doublon) pour que l'interface se comporte pareil dans les deux modes.
 * Un seul joueur réel : pour tester à deux, il faut le mode Supabase.
 */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const STORAGE_KEY = 'tlc.mock.inspector'

function readStoredInspector(): Inspector | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Inspector) : null
  } catch {
    return null
  }
}

function storeInspector(inspector: Inspector | null) {
  try {
    if (inspector) localStorage.setItem(STORAGE_KEY, JSON.stringify(inspector))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* stockage indisponible : la connexion dure le temps de l'onglet */
  }
}

function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return Array.from(bytes, (b) => ALPHABET[b % 32]).join('')
}

let current: Inspector | null = readStoredInspector()
const listeners = new Set<(i: Inspector | null) => void>()
const emit = () => listeners.forEach((l) => l(current))

const sessions = new Map<string, GameSession & { code: string | null }>()
const evidence = new Map<string, CollectedEvidence[]>()
const watchers = new Map<string, Set<() => void>>()
const notify = (sessionId: string) => watchers.get(sessionId)?.forEach((w) => w())

function me(): Inspector {
  if (!current) throw new GatewayError('not_authenticated')
  return current
}

function member(sessionId: string) {
  const s = sessions.get(sessionId)
  if (!s || !s.players.some((p) => p.userId === me().id)) throw new GatewayError('forbidden')
  return s
}

function publicSession({ code: _code, ...s }: GameSession & { code: string | null }): GameSession {
  return structuredClone(s)
}

function subscribe(sessionId: string, onChange: () => void) {
  const set = watchers.get(sessionId) ?? new Set()
  set.add(onChange)
  watchers.set(sessionId, set)
  return () => set.delete(onChange)
}

export const mockGateway: GameGateway = {
  source: 'mock',

  auth: {
    async getCurrentInspector() {
      return current
    },
    onChange(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    async signUp({ displayName }) {
      await delay(200)
      const name = displayName.trim()
      if (name.length < 2 || name.length > 40) throw new GatewayError('invalid_display_name')
      current = { id: crypto.randomUUID(), displayName: name }
      storeInspector(current)
      emit()
      return current
    },
    async signIn({ email }) {
      await delay(200)
      current = readStoredInspector() ?? { id: crypto.randomUUID(), displayName: email.split('@')[0] || 'Inspecteur' }
      storeInspector(current)
      emit()
      return current
    },
    async signOut() {
      current = null
      storeInspector(null)
      emit()
    },
    async updateDisplayName(displayName) {
      const name = displayName.trim()
      if (name.length < 2 || name.length > 40) throw new GatewayError('invalid_display_name')
      current = { ...me(), displayName: name }
      storeInspector(current)
      emit()
      return current
    },
  },

  cases: {
    async listCases() {
      await delay(120)
      return prototypeCatalog
    },
    async getCaseSummary(caseId) {
      await delay(80)
      return prototypeCatalog.find((c) => c.id === caseId) ?? null
    },
  },

  sessions: {
    async create(caseId) {
      const user = me()
      if (!prototypeCatalog.some((c) => c.id === caseId)) throw new GatewayError('unknown_case')
      const id = crypto.randomUUID()
      const code = newCode()
      sessions.set(id, {
        id,
        caseId,
        status: 'waiting',
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        startedAt: null,
        codeExpiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
        code,
        players: [{ userId: user.id, displayName: user.displayName, seat: 1, ready: false }],
      })
      return { sessionId: id, inviteCode: code }
    },
    async join(code) {
      const user = me()
      const s = [...sessions.values()].find((x) => x.code === code.trim().toUpperCase())
      if (!s || s.status !== 'waiting' || (s.codeExpiresAt && Date.parse(s.codeExpiresAt) < Date.now())) {
        throw new GatewayError('invalid_code')
      }
      if (s.players.some((p) => p.userId === user.id)) return s.id
      if (s.players.length >= 2) throw new GatewayError('room_full')
      s.players.push({ userId: user.id, displayName: user.displayName, seat: 2, ready: false })
      notify(s.id)
      return s.id
    },
    async setReady(sessionId, ready) {
      const s = member(sessionId)
      s.players.find((p) => p.userId === me().id)!.ready = ready
      if (s.status === 'waiting' || s.status === 'ready') {
        const all = s.players.length === 2 && s.players.every((p) => p.ready)
        s.status = all ? 'in_progress' : 'waiting'
        if (all) {
          s.startedAt ??= new Date().toISOString()
          s.code = null
          s.codeExpiresAt = null
        }
      }
      notify(sessionId)
      return s.status
    },
    async get(sessionId) {
      const s = sessions.get(sessionId)
      return s && s.players.some((p) => p.userId === current?.id) ? publicSession(s) : null
    },
    async listMine() {
      const user = me()
      return [...sessions.values()]
        .filter((s) => s.players.some((p) => p.userId === user.id))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(publicSession)
    },
    subscribe,
  },

  evidence: {
    async collect(sessionId, examinableId) {
      const s = member(sessionId)
      if (s.status !== 'in_progress') throw new GatewayError('not_started')
      const list = evidence.get(sessionId) ?? []
      const found = list.find((e) => e.examinableId === examinableId)
      if (found) return found.number
      const item: CollectedEvidence = {
        examinableId,
        number: list.length + 1,
        collectedBy: me().id,
        collectedAt: new Date().toISOString(),
        assessment: 'to_verify',
      }
      evidence.set(sessionId, [...list, item])
      notify(sessionId)
      return item.number
    },
    async list(sessionId) {
      member(sessionId)
      return structuredClone(evidence.get(sessionId) ?? [])
    },
    subscribe,
  },
}
