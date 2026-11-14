import type { CaseSummary } from '@/data/schemas/case'

/**
 * Contrat d'accès aux données du jeu.
 * Deux implémentations : `mock` (prototype local) et `supabase` (étape 3).
 * Les composants n'importent jamais un adaptateur directement : ils passent par getGateway().
 */
export interface CaseCatalogGateway {
  listCases(): Promise<CaseSummary[]>
  getCaseSummary(caseId: string): Promise<CaseSummary | null>
}

export interface GameGateway {
  readonly source: 'mock' | 'supabase'
  cases: CaseCatalogGateway
  // Étape 3 : auth, sessions (create/join/ready), présence, événements d'enquête.
}
