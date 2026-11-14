import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import frCommon from './locales/fr/common.json'
import frLanding from './locales/fr/landing.json'
import frScreens from './locales/fr/screens.json'
import frInvestigation from './locales/fr/investigation.json'
import enCommon from './locales/en/common.json'

/**
 * Architecture multilingue.
 * MVP : français uniquement. L'anglais est déclaré mais incomplet :
 * les clés manquantes retombent sur le français (fallbackLng).
 * Le contenu des affaires (dialogues, documents) est localisé dans les
 * données de l'affaire elles-mêmes (champs LocalizedText), pas ici.
 */
export const SUPPORTED_LOCALES = ['fr', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'fr'

export const resources = {
  fr: { common: frCommon, landing: frLanding, screens: frScreens, investigation: frInvestigation },
  en: { common: enCommon },
} as const

void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  defaultNS: 'common',
  ns: ['common', 'landing', 'screens', 'investigation'],
  interpolation: { escapeValue: false },
  returnNull: false,
})

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

export default i18n
