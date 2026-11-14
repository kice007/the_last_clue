import { z } from 'zod'
import { FactStatus, Id, LocalizedText } from './common'

/**
 * Contenu PUBLIC d'une affaire : ce que le navigateur peut recevoir.
 * La solution n'y figure jamais (voir caseSecret.ts).
 */

export const CaseCategory = z.enum(['historical', 'fictional'])
export const Difficulty = z.enum(['easy', 'medium', 'hard'])

export const EvidenceCategory = z.enum(['physical', 'documentary', 'digital', 'testimony'])
export const DiscoveryState = z.enum(['undiscovered', 'discovered', 'collected'])
/** Évaluation des enquêteurs, jamais une vérité du scénario (§4.4). */
export const EvidenceAssessment = z.enum(['collected', 'to_verify', 'disputed', 'corroborated', 'refuted'])

export const Vec3 = z.tuple([z.number(), z.number(), z.number()])

export const Evidence = z.object({
  id: Id,
  title: LocalizedText,
  description: LocalizedText,
  category: EvidenceCategory,
  locationId: Id,
  /** Position dans la scène 3D, si l'indice est un objet de scène. */
  position: Vec3.optional(),
  origin: LocalizedText.optional(),
  time: z.string().optional(),
  limits: LocalizedText.optional(),
  relatedEntityIds: z.array(Id).default([]),
  /** Visibilité : un indice peut n'apparaître qu'après un déblocage. */
  unlockedBy: z.array(Id).default([]),
  asset: z.string().optional(),
})

export const Character = z.object({
  id: Id,
  role: z.enum(['victim', 'suspect', 'witness']),
  name: z.string(),
  age: z.number().int().optional(),
  occupation: LocalizedText,
  relationToVictim: LocalizedText,
  biography: LocalizedText,
  initialStatement: LocalizedText.optional(),
  declaredAlibi: LocalizedText.optional(),
  portrait: z.string().optional(),
})

export const Location = z.object({
  id: Id,
  name: LocalizedText,
  description: LocalizedText,
  scene: z.string(),
})

export const Condition = z.object({
  requiresEvidence: z.array(Id).default([]),
  requiresQuestions: z.array(Id).default([]),
})

export const Question = z.object({
  id: Id,
  characterId: Id,
  prompt: LocalizedText,
  answer: LocalizedText,
  when: Condition.default({ requiresEvidence: [], requiresQuestions: [] }),
  /** Preuve à présenter pour déclencher cette réponse (confrontation). */
  presentEvidenceId: Id.optional(),
  unlocks: z.array(Id).default([]),
  flagsContradiction: z.boolean().default(false),
})

export const TimelineEvent = z.object({
  id: Id,
  time: z.string(),
  label: LocalizedText,
  certainty: z.enum(['established', 'reported', 'uncertain']),
  sourceIds: z.array(Id).default([]),
})

export const HistoricalSource = z.object({
  id: Id,
  title: z.string(),
  url: z.string().url().optional(),
  status: FactStatus,
  note: LocalizedText.optional(),
})

export const InvestigationCasePublic = z.object({
  id: Id,
  title: z.string(),
  category: CaseCategory,
  difficulty: Difficulty,
  durationMinutes: z.tuple([z.number(), z.number()]),
  summary: LocalizedText,
  introduction: LocalizedText,
  location: LocalizedText,
  incidentDate: z.string().optional(),
  victimId: Id,
  characters: z.array(Character),
  locations: z.array(Location),
  evidence: z.array(Evidence),
  questions: z.array(Question),
  timeline: z.array(TimelineEvent),
  historicalSources: z.array(HistoricalSource).optional(),
})

export type InvestigationCasePublic = z.infer<typeof InvestigationCasePublic>
export type Evidence = z.infer<typeof Evidence>
export type Character = z.infer<typeof Character>
export type Question = z.infer<typeof Question>

/** Fiche catalogue : métadonnées seules, pour l'écran de sélection. */
export const CaseSummary = InvestigationCasePublic.pick({
  id: true,
  title: true,
  category: true,
  difficulty: true,
  durationMinutes: true,
  summary: true,
  location: true,
  incidentDate: true,
})
export type CaseSummary = z.infer<typeof CaseSummary>
