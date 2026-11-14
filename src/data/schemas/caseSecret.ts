import { z } from 'zod'
import { Id, LocalizedText } from './common'

/**
 * Solution canonique — SERVEUR UNIQUEMENT.
 * Ce schéma décrit la forme stockée dans une table non accessible au rôle client
 * (case_secret_solutions) et lue par une Edge Function au moment du verdict.
 * Aucune donnée de ce type ne doit être importée par le code du navigateur.
 */
export const CaseSecretSolution = z.object({
  caseId: Id,
  culpritId: Id,
  motive: LocalizedText,
  method: LocalizedText,
  explanation: LocalizedText,
  requiredEvidenceIds: z.array(Id),
  decisiveContradictions: z.array(LocalizedText).default([]),
  redHerrings: z.array(z.object({ characterId: Id, why: LocalizedText })).default([]),
})
export type CaseSecretSolution = z.infer<typeof CaseSecretSolution>
