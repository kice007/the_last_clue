import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProgress } from '@react-three/drei'
import { useTranslation } from 'react-i18next'
import { FolderOpen } from 'lucide-react'
import { Link } from 'react-router'
import { AudioToggle } from '@/components/ui/AudioToggle'
import { WebGLGuard } from '@/components/layout/WebGLGuard'
import { Wordmark } from '@/components/ui/Wordmark'
import { examinableById } from '@/data/cases/_prototype/studySlice'
import { studyViewpoints } from '@/game/camera/viewpoints'
import { useAmbience } from '@/hooks/useAmbience'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useInvestigationStore } from '@/stores/investigationStore'
import { cn } from '@/utils/cn'
import { InspectPanel } from './InspectPanel'

const StudyScene = lazy(() => import('@/game/scenes/study/StudyScene'))

function Loader() {
  const { t } = useTranslation('investigation')
  const { active, progress } = useProgress()
  const [gone, setGone] = useState(false)
  useEffect(() => {
    if (!active && progress >= 100) {
      const id = window.setTimeout(() => setGone(true), 2600)
      return () => window.clearTimeout(id)
    }
  }, [active, progress])
  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="absolute inset-0 z-40 grid place-items-center bg-[#050607]"
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
        >
          <div className="text-center">
            {progress < 100 ? (
              <>
                <p className="eyebrow">{t('loading')}</p>
                <div className="mx-auto mt-6 h-px w-56 bg-line">
                  <div className="h-px bg-brass transition-[width] duration-300" style={{ width: `${progress}%` }} />
                </div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                <p className="eyebrow text-brass/80">{t('intro.date')}</p>
                <p className="mt-5 font-display text-4xl text-paper">{t('title')}</p>
                <p className="mt-3 font-display text-xl italic text-paper-muted">{t('intro.line')}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ViewNavigator() {
  const { t } = useTranslation('investigation')
  const view = useInvestigationStore((s) => s.view)
  const free = useInvestigationStore((s) => s.freeShot !== null)
  const setView = useInvestigationStore((s) => s.setView)
  return (
    <nav aria-label={t('views.label')} className="pointer-events-auto flex items-center gap-1 border border-line bg-ink/70 p-1 backdrop-blur-md">
      {studyViewpoints.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => setView(v.id)}
          aria-current={!free && view === v.id}
          className={cn(
            'h-10 px-4 font-display text-[17px] transition-colors duration-300',
            !free && view === v.id ? 'bg-brass-soft text-brass' : 'text-paper-muted hover:text-paper',
          )}
        >
          {t(`views.${v.id}`)}
        </button>
      ))}
    </nav>
  )
}

function Dossier() {
  const { t } = useTranslation('investigation')
  const collected = useInvestigationStore((s) => s.collected)
  const inspect = useInvestigationStore((s) => s.inspect)
  const [open, setOpen] = useState(false)
  return (
    <div className="pointer-events-auto relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 items-center gap-3 border border-line bg-ink/70 px-4 backdrop-blur-md transition-colors hover:border-brass"
      >
        <FolderOpen size={16} strokeWidth={1.5} className="text-brass" />
        <span className="text-[13px] font-medium">{t('dossier.label')}</span>
        <span className="font-mono text-[11px] text-paper-faint">{t('dossier.count', { n: collected.length })}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-14 left-0 w-80 border border-line bg-surface/95 p-4 backdrop-blur-md"
          >
            {collected.length === 0 ? (
              <p className="font-display text-lg italic text-paper-muted">{t('dossier.empty')}</p>
            ) : (
              <ul className="space-y-2">
                {collected.map((id) => {
                  const e = examinableById[id]!
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => {
                          inspect(id)
                          setOpen(false)
                        }}
                        className="flex w-full items-baseline gap-3 border-b border-line pb-2 text-left hover:text-brass"
                      >
                        <span className="font-mono text-[11px] text-brass">{t('inspect.number', { n: collected.indexOf(id) + 1 })}</span>
                        <span className="font-display text-lg">{e.title.fr}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Toast() {
  const { t } = useTranslation('investigation')
  const last = useInvestigationStore((s) => s.lastCollected)
  const count = useInvestigationStore((s) => s.collected.length)
  const [shown, setShown] = useState<string | null>(null)
  useEffect(() => {
    if (!last) return
    setShown(last)
    const id = window.setTimeout(() => setShown(null), 3200)
    return () => window.clearTimeout(id)
  }, [last, count])
  const e = shown ? examinableById[shown] : null
  const n = useInvestigationStore((s) => (shown ? s.collected.indexOf(shown) + 1 : 0))
  return (
    <AnimatePresence>
      {e && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="absolute top-24 left-1/2 -translate-x-1/2 border-l-2 border-brass bg-surface/95 px-5 py-3 backdrop-blur-md"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">{t('toast', { n })}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Vertical slice : le bureau de Whitmore en 3D, points de vue fixes, 3 pièces examinables. */
export function StudyPrototypePage() {
  const { t } = useTranslation('investigation')
  const reducedMotion = useReducedMotion()
  const [hovered, setHovered] = useState<string | null>(null)
  const inspecting = useInvestigationStore((s) => s.inspecting)
  const inspect = useInvestigationStore((s) => s.inspect)
  const view = useInvestigationStore((s) => s.view)
  const setView = useInvestigationStore((s) => s.setView)
  useAmbience(['rain', 'fire', 'clock'])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') inspect(null)
      if (inspecting) return
      const i = studyViewpoints.findIndex((v) => v.id === view)
      if (e.key === 'ArrowRight') setView(studyViewpoints[(i + 1) % studyViewpoints.length]!.id)
      if (e.key === 'ArrowLeft') setView(studyViewpoints[(i - 1 + studyViewpoints.length) % studyViewpoints.length]!.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, inspecting, inspect, setView])

  const current = inspecting ? examinableById[inspecting] : null
  const hoveredEv = hovered && !inspecting ? examinableById[hovered] : null

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#050607] text-paper select-none">
      <WebGLGuard>
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <StudyScene reducedMotion={reducedMotion} onHover={setHovered} />
          </Suspense>
        </div>
      </WebGLGuard>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/70 to-transparent px-6 pt-5 pb-16 md:px-10">
          <div>
            <Link to="/" className="pointer-events-auto">
              <Wordmark />
            </Link>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.24em] text-paper-faint">{t('place')}</p>
            <p className="mt-1 font-display text-[28px] leading-none">{t('title')}</p>
            <p className="mt-2 font-display text-[16px] italic text-paper-muted">{t('time')}</p>
          </div>
          <div className="pointer-events-auto flex items-center gap-3">
            <span className="hidden border border-blood/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-blood/90 lg:inline">
              {t('prototype')}
            </span>
            <div className="flex items-center gap-3 rounded-full border border-line bg-ink/60 py-1.5 pr-4 pl-1.5 backdrop-blur-md">
              <span className="grid size-8 place-items-center rounded-full border border-brass/70 bg-surface-raised font-display text-base text-brass">R</span>
              <span>
                <span className="block text-[12px] font-semibold">{t('partner.name')}</span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-paper-faint">
                  <span className="size-1.5 rounded-full bg-[#7FA37A]" /> {t('partner.where')}
                </span>
              </span>
            </div>
            <AudioToggle />
          </div>
        </div>

        <AnimatePresence>
          {hoveredEv && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 mt-10 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.24em] text-brass"
            >
              {t('hover')}
            </motion.p>
          )}
        </AnimatePresence>

        <Toast />

        <AnimatePresence>{current && <InspectPanel evidence={current} />}</AnimatePresence>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 bg-gradient-to-t from-black/70 to-transparent px-6 pt-20 pb-6 md:px-10">
          <Dossier />
          <AnimatePresence>
            {!inspecting && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-col items-center gap-3">
                <ViewNavigator />
                <p className="font-mono text-[10px] tracking-[0.18em] text-paper-faint">{t('keys')}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="hidden w-[220px] text-right font-mono text-[10px] uppercase tracking-[0.2em] text-paper-faint lg:block">
            {t('examinables')}
          </div>
        </div>
      </div>

      <Loader />
    </main>
  )
}
