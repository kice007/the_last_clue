import { lazy, Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ButtonLink, buttonClass } from '@/components/ui/Button'
import { Wordmark } from '@/components/ui/Wordmark'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { isWebGLAvailable } from '@/utils/webgl'
import { CaseFileTeaser } from './CaseFileTeaser'

const LandingStudyScene = lazy(() => import('@/game/scenes/LandingStudyScene'))

const reveal = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: 1.1 + i * 0.18, duration: 1.2, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

interface Step {
  n: string
  title: string
  body: string
}

function useFontsReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let alive = true
    void document.fonts.ready.then(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [])
  return ready
}

export function LandingPage() {
  const { t } = useTranslation('landing')
  const { t: tc } = useTranslation()
  const reducedMotion = useReducedMotion()
  const fontsReady = useFontsReady()
  const webgl = isWebGLAvailable()
  const steps = t('how.steps', { returnObjects: true }) as Step[]

  return (
    <main>
      {/* ——— Ouverture ——— */}
      <section className="relative h-dvh min-h-[640px] overflow-hidden bg-ink-deep">
        <div className="absolute inset-0">
          {webgl && fontsReady && (
            <Suspense fallback={null}>
              <motion.div
                className="size-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2.4, ease: 'easeOut' }}
              >
                <LandingStudyScene reducedMotion={reducedMotion} />
              </motion.div>
            </Suspense>
          )}
        </div>
        <div className="vignette" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,rgb(10_12_14/0.94)_0%,rgb(10_12_14/0.7)_34%,transparent_62%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_12_14/0.15)_0%,rgb(10_12_14/0.88)_42%)] md:hidden"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

        <p className="eyebrow absolute top-24 right-6 hidden text-right md:right-10 md:block">{t('dateline')}</p>

        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-16 md:px-10 md:pb-20 lg:px-16">
          <motion.p className="eyebrow text-brass/80" variants={reveal} initial="hidden" animate="show" custom={0}>
            {t('caseFile')}
          </motion.p>
          <motion.div variants={reveal} initial="hidden" animate="show" custom={1} className="mt-6">
            <Wordmark size="xl" />
          </motion.div>
          <motion.p
            className="mt-10 max-w-xl font-display text-[clamp(1.375rem,2.2vw,1.875rem)] italic leading-snug text-paper"
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={2}
          >
            {tc('tagline')}
          </motion.p>
          <motion.p
            className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-paper-muted"
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={3}
          >
            {t('hook')}
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap gap-3"
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={4}
          >
            <ButtonLink to="/auth">{t('cta.primary')}</ButtonLink>
            <a href="#comment-on-joue" className={buttonClass('ghost')}>
              {t('cta.secondary')}
            </a>
          </motion.div>
          <motion.dl
            className="mt-14 flex flex-wrap gap-x-10 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-paper-faint"
            variants={reveal}
            initial="hidden"
            animate="show"
            custom={5}
          >
            {(['players', 'duration', 'platform'] as const).map((k) => (
              <div key={k} className="flex items-center gap-3">
                <span aria-hidden className="size-1 rounded-full bg-brass/70" />
                <dd>{t(`facts.${k}`)}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </section>

      {/* ——— Comment on joue ——— */}
      <section id="comment-on-joue" className="relative scroll-mt-0 px-6 py-28 md:px-10 lg:px-16 lg:py-36">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">{t('how.eyebrow')}</p>
          <h2 className="mt-5 max-w-2xl font-display text-[clamp(2.25rem,4.4vw,3.75rem)] font-medium leading-[1.05]">
            {t('how.title')}
          </h2>
          <ol className="mt-20 grid gap-14 md:grid-cols-3 md:gap-0">
            {steps.map((s, i) => (
              <motion.li
                key={s.n}
                className="md:border-l md:border-line md:px-10 md:first:border-l-0 md:first:pl-0"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-15%' }}
                transition={{ delay: i * 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="font-display text-5xl italic text-brass">{s.n}</span>
                <h3 className="mt-6 font-display text-2xl font-medium">{s.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-paper-muted">{s.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ——— Dossier en cours ——— */}
      <section className="relative px-6 pb-32 md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <CaseFileTeaser />
        </div>
      </section>

      <footer className="border-t border-line px-6 py-10 md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Wordmark />
          <p className="font-mono text-[0.6875rem] text-paper-faint">{t('footer')}</p>
        </div>
      </footer>
    </main>
  )
}
