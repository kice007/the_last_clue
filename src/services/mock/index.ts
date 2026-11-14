import { prototypeCatalog } from '@/data/cases/_prototype/catalog'
import type { GameGateway } from '../types'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Adaptateur de prototype : données locales fictives, latence simulée. */
export const mockGateway: GameGateway = {
  source: 'mock',
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
}
