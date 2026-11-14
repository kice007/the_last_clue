import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/components/ui/Button'

export function NotFound() {
  const { t } = useTranslation()
  return (
    <main className="grid min-h-dvh place-items-center bg-ink px-6 text-center text-paper">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-6 font-display text-5xl">{t('notFound.title')}</h1>
        <p className="mt-3 font-display text-xl italic text-paper-muted">{t('notFound.body')}</p>
        <ButtonLink to="/" variant="ghost" className="mt-10">
          {t('notFound.cta')}
        </ButtonLink>
      </div>
    </main>
  )
}
