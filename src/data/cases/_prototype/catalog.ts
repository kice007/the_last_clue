import type { CaseSummary } from '@/data/schemas/case'

/** Catalogue fictif de prototype. Voir README.md de ce dossier. */
export const prototypeCatalog: CaseSummary[] = [
  {
    id: 'the_last_letter',
    title: 'THE LAST LETTER',
    category: 'fictional',
    difficulty: 'medium',
    durationMinutes: [45, 60],
    summary: {
      fr: "Alexander Whitmore est retrouvé mort dans son bureau fermé à clé, pendant une réception. Plusieurs témoins affirment l'avoir vu vivant après l'heure de sa mort.",
    },
    location: { fr: 'Blackwood Manor, Yorkshire du Nord' },
    incidentDate: '1908-11-14',
  },
]
