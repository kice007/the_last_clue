import type { CaseSummary } from '@/data/schemas/case'

/**
 * Contrat d'accès aux données du jeu.
 * Deux implémentations : `mock` (prototype local, sans réseau) et `supabase`.
 * Les composants n'importent jamais un adaptateur directement : ils passent par getGateway().
 * La base reste la source de vérité : les abonnements temps réel ne font que prévenir
 * qu'il faut relire (jamais d'état reconstruit à partir des seules notifications).
 */

/** Profil d'inspecteur : le nom de service affiché à son partenaire. */
export interface Inspector {
  id: string
  displayName: string
}

export type SessionStatus = 'waiting' | 'ready' | 'in_progress' | 'completed' | 'abandoned'

export interface SessionPlayer {
  userId: string
  displayName: string
  seat: 1 | 2
  ready: boolean
}

export interface GameSession {
  id: string
  caseId: string
  status: SessionStatus
  createdBy: string
  createdAt: string
  startedAt: string | null
  /** Fin de validité du code d'invitation (null une fois la partie lancée). */
  codeExpiresAt: string | null
  players: SessionPlayer[]
}

export interface CollectedEvidence {
  examinableId: string
  number: number
  collectedBy: string
  collectedAt: string
  assessment: 'to_verify' | 'disputed' | 'corroborated' | 'refuted'
}

/** Erreurs connues, traduisibles à l'écran (`errors.<code>` dans i18n). */
export type GatewayErrorCode =
  | 'not_authenticated'
  | 'invalid_credentials'
  | 'email_taken'
  | 'weak_password'
  | 'confirmation_required'
  | 'invalid_display_name'
  | 'unknown_case'
  | 'invalid_code'
  | 'room_full'
  | 'rate_limited'
  | 'not_started'
  | 'forbidden'
  | 'network'
  | 'unknown'

export class GatewayError extends Error {
  readonly code: GatewayErrorCode
  constructor(code: GatewayErrorCode, message?: string) {
    super(message ?? code)
    this.name = 'GatewayError'
    this.code = code
  }
}

export interface AuthGateway {
  /** Inspecteur connecté (session mémorisée par le navigateur), ou null. */
  getCurrentInspector(): Promise<Inspector | null>
  /** Prévenu à chaque connexion, déconnexion ou changement de nom. Renvoie la fonction de désabonnement. */
  onChange(listener: (inspector: Inspector | null) => void): () => void
  signUp(input: { email: string; password: string; displayName: string }): Promise<Inspector>
  signIn(input: { email: string; password: string }): Promise<Inspector>
  signOut(): Promise<void>
  updateDisplayName(displayName: string): Promise<Inspector>
}

export interface CaseCatalogGateway {
  listCases(): Promise<CaseSummary[]>
  getCaseSummary(caseId: string): Promise<CaseSummary | null>
}

export interface SessionsGateway {
  /** Ouvre une salle ; le code n'est connu qu'ici (le serveur n'en garde que l'empreinte). */
  create(caseId: string): Promise<{ sessionId: string; inviteCode: string }>
  /** Rejoint avec un code ; renvoie l'identifiant de la session. Reconnexion acceptée. */
  join(code: string): Promise<string>
  setReady(sessionId: string, ready: boolean): Promise<SessionStatus>
  get(sessionId: string): Promise<GameSession | null>
  /** Sessions du joueur, les plus récentes d'abord (sert à « Reprendre »). */
  listMine(): Promise<GameSession[]>
  /** Prévient quand la session ou ses joueurs changent. */
  subscribe(sessionId: string, onChange: () => void): () => void
}

export interface EvidenceGateway {
  /** Met une pièce au dossier ; renvoie son numéro (idempotent). */
  collect(sessionId: string, examinableId: string): Promise<number>
  list(sessionId: string): Promise<CollectedEvidence[]>
  subscribe(sessionId: string, onChange: () => void): () => void
}

export interface GameGateway {
  readonly source: 'mock' | 'supabase'
  auth: AuthGateway
  cases: CaseCatalogGateway
  sessions: SessionsGateway
  evidence: EvidenceGateway
}
