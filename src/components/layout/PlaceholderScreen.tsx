import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/components/ui/Button'

type ScreenKey =
  | 'auth' | 'profile' | 'lobby' | 'cases' | 'briefing' | 'office' | 'scene'
  | 'evidence' | 'suspects' | 'interrogation' | 'board' | 'verdict' | 'revelation' | 'history'

interface PlaceholderScreenProps {
  screen: ScreenKey
  phase: number
}

/** Écran réservé : la route existe, le contenu viendra avec la maquette validée. */
export function PlaceholderScreen({ screen, phase }: PlaceholderScreenProps) {
  const { t } = useTranslation()
  const { t: ts } = useTranslation('screens')
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-6">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#1c2228_0%,#101316_60%)]" />
      <div className="relative max-w-xl text-center">
        <p className="eyebrow">{t('placeholder.status')} · {t('placeholder.phase', { phase })}</p>
        <h1 className="mt-6 font-display text-5xl font-medium text-paper md:text-6xl">{ts(`${screen}.title`)}</h1>
        <p className="mt-4 font-display text-xl italic text-paper-muted">{ts(`${screen}.summary`)}</p>
        <p className="mt-10 font-mono text-xs text-paper-faint">{t('placeholder.note')}</p>
        <ButtonLink to="/" variant="ghost" className="mt-10">
          {t('nav.home')}
        </ButtonLink>
      </div>
    </main>
  )
}
