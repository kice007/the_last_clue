import type { CaseSummary } from '@/data/schemas/case'

/** Catalogue fictif de prototype. Voir README.md de ce dossier. */
export const prototypeCatalog: CaseSummary[] = [
  {
    id: 'the_last_letter',
    title: 'THE LAST LETTER',
    category: 'fictional',
    difficulty: 'hard',
    durationMinutes: [60, 75],
    summary: {
      fr: "Alexander Whitmore est retrouvé mort dans son bureau, porte fermée à clé. Sa fille avoue l'avoir tué. Trois témoins l'ont vu vivant après.",
    },
    location: { fr: 'Blackwood Manor, Yorkshire du Nord' },
    incidentDate: '1908-11-14',
  },
]
