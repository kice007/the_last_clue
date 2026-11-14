import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getGateway } from '@/services'
import type { CaseSummary } from '@/data/schemas/case'
import { ButtonLink } from '@/components/ui/Button'

/** Chemise cartonnée du dossier mis en avant. Données via la couche services (prototype pour l'instant). */
export function CaseFileTeaser() {
  const { t, i18n } = useTranslation('landing')
  const [file, setFile] = useState<CaseSummary | null>(null)

  useEffect(() => {
    let alive = true
    void getGateway().cases.listCases().then((cases) => alive && setFile(cases[0] ?? null))
    return () => {
      alive = false
    }
  }, [])

  const lang = i18n.language as 'fr' | 'en'
  const date = file?.incidentDate
    ? new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(file.incidentDate))
    : null

  return (
    <div className="relative">
      <p className="eyebrow mb-6">{t('file.eyebrow')}</p>
      <article className="relative overflow-hidden bg-parchment text-parchment-ink shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)]">
        {/* onglet de chemise */}
        <div aria-hidden className="absolute -top-px left-10 h-2 w-40 bg-[#cdbf9f]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply [background:radial-gradient(ellipse_at_80%_10%,transparent_40%,rgb(120_90_50/0.35)_100%)]" />
        <div className="relative grid gap-10 p-8 md:grid-cols-[1.4fr_1fr] md:p-14">
          <div>
            {file ? (
              <>
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.24em] text-parchment-ink/60">
                  {t(`file.category.${file.category}`)} · {file.location[lang] ?? file.location.fr}
                </p>
                <h2 className="mt-5 font-wordmark text-[clamp(2rem,4vw,3.25rem)] leading-none tracking-[0.06em]">{file.title}</h2>
                <p className="mt-6 max-w-lg font-display text-xl leading-snug italic">{file.summary[lang] ?? file.summary.fr}</p>
                <span
                  aria-hidden
                  className="mt-10 inline-block -rotate-[4deg] border-2 border-blood/70 px-3 py-1 font-mono text-xs uppercase tracking-[0.3em] text-blood/80"
                >
                  {t('file.stamp')}
                </span>
              </>
            ) : (
              <p className="font-mono text-sm text-parchment-ink/60">{t('file.loading')}</p>
            )}
          </div>
          <div className="flex flex-col justify-between gap-8 border-parchment-ink/15 md:border-l md:pl-10">
            {file && (
              <dl className="space-y-4 font-mono text-[0.8125rem]">
                {date && (
                  <div className="flex justify-between gap-6 border-b border-parchment-ink/15 pb-3">
                    <dt className="text-parchment-ink/55">{t('file.labels.date')}</dt>
                    <dd>{date}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-6 border-b border-parchment-ink/15 pb-3">
                  <dt className="text-parchment-ink/55">{t('file.labels.difficulty')}</dt>
                  <dd>{t(`file.difficulty.${file.difficulty}`)}</dd>
                </div>
                <div className="flex justify-between gap-6 border-b border-parchment-ink/15 pb-3">
                  <dt className="text-parchment-ink/55">{t('file.labels.duration')}</dt>
                  <dd>{t('file.duration', { min: file.durationMinutes[0], max: file.durationMinutes[1] })}</dd>
                </div>
              </dl>
            )}
            <ButtonLink to="/auth" className="self-start bg-parchment-ink text-parchment hover:bg-[#3a3227]">
              {t('file.cta')}
            </ButtonLink>
          </div>
        </div>
      </article>
    </div>
  )
}
