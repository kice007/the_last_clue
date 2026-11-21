import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { AudioToggle } from '@/components/ui/AudioToggle'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAmbience } from '@/hooks/useAmbience'
import { isWebGLAvailable } from '@/utils/webgl'

const TitleDeskScene = lazy(() => import('@/game/scenes/LandingStudyScene'))

const reveal = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: 0.9 + i * 0.22, duration: 1.3, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

/**
 * Écran titre (maquette « 00 — Écran titre ») : la lettre cachetée et la montre sous la lampe.
 * Jeu privé : une seule entrée. La connexion s'intercalera ici quand Supabase sera branché.
 */
export function TitleScreen() {
  const { t } = useTranslation('menu')
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const webgl = isWebGLAvailable()
  const [leaving, setLeaving] = useState(false)
  useAmbience(['rain'])

  const enter = useCallback(() => {
    if (leaving) return
    setLeaving(true)
    window.setTimeout(() => void navigate('/office'), reducedMotion ? 0 : 1100)
  }, [leaving, navigate, reducedMotion])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) enter()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enter])

  return (
    <main className="relative h-dvh min-h-[560px] w-full overflow-hidden bg-[#050607] text-paper">
      <div className="absolute inset-0">
        {webgl && (
          <Suspense fallback={null}>
            <motion.div className="size-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.4, ease: 'easeOut' }}>
              <TitleDeskScene reducedMotion={reducedMotion} />
            </motion.div>
          </Suspense>
        )}
      </div>
      <div className="vignette" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgb(5_6_7/0.92)_0%,rgb(5_6_7/0.62)_38%,transparent_66%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050607] to-transparent" />

      <div className="absolute top-8 right-6 z-10 md:right-10">
        <AudioToggle />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center px-6 md:px-16 lg:px-24">
        <motion.h1 variants={reveal} initial="hidden" animate="show" custom={0} className="font-wordmark leading-[0.95]">
          <span className="block text-[clamp(1rem,1.5vw,1.375rem)] tracking-[0.6em] text-paper-muted">THE</span>
          <span className="mt-2 block text-[clamp(3.5rem,8.4vw,7.5rem)] tracking-[0.06em]">LAST CLUE</span>
        </motion.h1>
        <motion.div variants={reveal} initial="hidden" animate="show" custom={1}>
          <span aria-hidden className="mt-4 block h-px w-[min(260px,40vw)] bg-gradient-to-r from-brass to-transparent" />
          <p className="mt-5 font-display text-[clamp(1.375rem,2.1vw,1.875rem)] text-paper italic">{t('title.tagline')}</p>
        </motion.div>
        <motion.div variants={reveal} initial="hidden" animate="show" custom={2} className="mt-[clamp(3rem,10vh,6.5rem)]">
          <button
            type="button"
            onClick={enter}
            className="inline-flex h-[52px] items-center bg-brass px-8 text-[13px] font-medium tracking-[0.2em] text-ink uppercase transition-[background-color,transform] duration-500 ease-[var(--ease-cinematic)] hover:bg-[#d6b47c] active:scale-[0.98]"
          >
            {t('title.enter')}
          </button>
          <p className="mt-5 font-mono text-[10px] tracking-[0.24em] text-paper-faint uppercase">{t('title.private')}</p>
        </motion.div>
      </div>

      <motion.p
        variants={reveal}
        initial="hidden"
        animate="show"
        custom={4}
        aria-hidden
        className="absolute bottom-12 left-6 z-10 font-mono text-[10px] tracking-[0.28em] text-paper uppercase md:left-16 lg:left-24"
      >
        <span className="animate-[press-blink_2.6s_ease-in-out_infinite]">{t('title.press')}</span>
      </motion.p>

      <AnimatePresence>
        {leaving && (
          <motion.div
            className="absolute inset-0 z-50 bg-[#050607]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reducedMotion ? 0 : 1, ease: 'easeIn' }}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
