import { z } from 'zod'

/**
 * Texte localisé : chaque contenu narratif porte ses traductions.
 * Le français est obligatoire (langue du MVP), les autres langues optionnelles.
 */
export const LocalizedText = z.object({
  fr: z.string().min(1),
  en: z.string().optional(),
})
export type LocalizedText = z.infer<typeof LocalizedText>

export const Id = z.string().regex(/^[a-z0-9_]+$/, 'identifiant en snake_case')

/** Statut éditorial d'une information (exigence affaires historiques, §5.4). */
export const FactStatus = z.enum([
  'documented_fact',
  'judicial_finding',
  'reported_testimony',
  'hypothesis',
  'gameplay_reconstruction',
])
