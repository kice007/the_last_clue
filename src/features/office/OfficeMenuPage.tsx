import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProgress } from '@react-three/drei'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { AudioToggle } from '@/components/ui/AudioToggle'
import { Button } from '@/components/ui/Button'
import { WebGLGuard } from '@/components/layout/WebGLGuard'
import { Wordmark } from '@/components/ui/Wordmark'
import type { OfficeSpotId } from '@/game/scenes/office/officeSpots'
import { useAmbience } from '@/hooks/useAmbience'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { getGateway } from '@/services'
import type { GameSession } from '@/services/types'
import { useAuthStore } from '@/stores/authStore'

const OfficeScene = lazy(() => import('@/game/scenes/office/OfficeScene'))

/** Seule affaire pour l'instant : le classeur mène directement à sa page. */
const FIRST_CASE = 'the_last_letter'
/** Même alphabet que `private.new_invite_code()` (sans caractères ambigus). */
const CODE_RE = /^[A-HJ-NP-Z2-9]{6}$/

/** Destination de chaque objet ; le téléphone ouvre le standard sur place. */
function destination(id: Exclude<OfficeSpotId, 'telephone'>, resume: GameSession | null): string {
  switch (id) {
    case 'classeur':
      return `/cases/${FIRST_CASE}`
    case 'papiers':
      return resume?.status === 'in_progress' ? `/session/${resume.id}/briefing` : `/lobby`
    case 'diplomes':
      return '/history'
    case 'lampe':
      return '/options'
    case 'portemanteau':
      return '/'
  }
}

/** Dernière enquête non terminée du joueur (salle en attente ou partie en cours). */
function useResumableSession() {
  const status = useAuthStore((s) => s.status)
  const [session, setSession] = useState<GameSession | null>(null)
  useEffect(() => {
    if (status !== 'signedIn') {
      setSession(null)
      return
    }
    let alive = true
    getGateway()
      .sessions.listMine()
      .then((list) => alive && setSession(list.find((s) => s.status === 'in_progress' || s.status === 'waiting') ?? null))
      .catch((e: unknown) => console.warn('[office] sessions illisibles', e))
    return () => {
      alive = false
    }
  }, [status])
  return session
}

function Curtain({ ready, leaving }: { ready: boolean; leaving: boolean }) {
  const { t } = useTranslation('menu')
  const { progress } = useProgress()
  return (
    <AnimatePresence>
      {(!ready || leaving) && (
        <motion.div
          key={leaving ? 'out' : 'in'}
          className="absolute inset-0 z-40 grid place-items-center bg-[#050607]"
          initial={{ opacity: leaving ? 0 : 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.4, ease: 'easeInOut' } }}
          transition={{ duration: 0.7, ease: 'easeIn' }}
        >
          {!leaving && (
            <div className="text-center">
              <p className="eyebrow">{t('office.loading')}</p>
              <div className="mx-auto mt-6 h-px w-56 bg-line">
                <div className="h-px bg-brass transition-[width] duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PhonePanel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('menu')
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const id = window.setTimeout(() => input.current?.focus(), 450)
    return () => window.clearTimeout(id)
  }, [])
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!CODE_RE.test(code)) {
      setError(true)
      return
    }
    void navigate(`/lobby/${code}`)
  }
  return (
    <motion.aside
      role="dialog"
      aria-labelledby="phone-title"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0, transition: { delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, x: 24 }}
      className="pointer-events-auto absolute top-1/2 right-6 w-[min(440px,calc(100vw-48px))] -translate-y-1/2 border border-line bg-surface/90 p-8 backdrop-blur-md md:right-12"
    >
      <p className="eyebrow text-brass/80">{t('office.phone.eyebrow')}</p>
      <h2 id="phone-title" className="mt-4 font-display text-[34px] leading-tight font-medium">
        {t('office.phone.title')}
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-paper-muted">{t('office.phone.body')}</p>
      <form onSubmit={submit} className="mt-8" noValidate>
        <label htmlFor="room-code" className="eyebrow block">
          {t('office.phone.label')}
        </label>
        <input
          ref={input}
          id="room-code"
          value={code}
          onChange={(e) => {
            setError(false)
            setCode(e.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '').slice(0, 6))
          }}
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          aria-invalid={error}
          aria-describedby={error ? 'room-code-error' : undefined}
          placeholder="······"
          className="mt-3 h-16 w-full border-b border-line-strong bg-transparent font-mono text-[32px] tracking-[0.5em] text-paper outline-none placeholder:text-paper-faint focus:border-brass"
        />
        <p id="room-code-error" role="alert" className="mt-2 min-h-5 font-mono text-[11px] text-blood">
          {error ? t('office.phone.invalid') : ''}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" className="inline-flex h-12 items-center bg-brass px-7 text-[13px] font-medium tracking-[0.18em] text-ink uppercase transition-colors hover:bg-[#d6b47c]">
            {t('office.phone.join')}
          </button>
          <Button variant="ghost" onClick={onClose}>
            {t('office.phone.hangUp')}
          </Button>
        </div>
      </form>
    </motion.aside>
  )
}

/**
 * Menu de jeu (maquette « Menu A ») : le bureau de l'inspecteur en 3D.
 * Chaque objet en relief ouvre une partie du jeu.
 */
export function OfficeMenuPage() {
  const { t } = useTranslation('menu')
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const { active, progress } = useProgress()
  const [ready, setReady] = useState(false)
  const [hovered, setHovered] = useState<OfficeSpotId | null>(null)
  const [focus, setFocus] = useState<OfficeSpotId | null>(null)
  const [phone, setPhone] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const hoverOut = useRef<number | undefined>(undefined)
  useAmbience(['rain', 'clock'])

  const inspector = useAuthStore((s) => s.inspector)
  const resume = useResumableSession()
  const disabled = useMemo<ReadonlySet<OfficeSpotId>>(() => new Set<OfficeSpotId>(resume ? [] : ['papiers']), [resume])

  useEffect(() => {
    if (!active && progress >= 100) {
      const id = window.setTimeout(() => setReady(true), 400)
      return () => window.clearTimeout(id)
    }
  }, [active, progress])

  // La plaque (HTML) et l'objet (3D) se passent le survol : on attend un instant avant de l'éteindre.
  const onHover = useCallback((id: OfficeSpotId | null) => {
    window.clearTimeout(hoverOut.current)
    if (id) setHovered(id)
    else hoverOut.current = window.setTimeout(() => setHovered(null), 120)
  }, [])

  const onSelect = useCallback(
    (id: OfficeSpotId) => {
      if (focus || leaving || disabled.has(id)) return
      setHovered(null)
      setFocus(id)
      if (id === 'telephone') {
        setPhone(true)
        return
      }
      const to = destination(id, resume)
      if (id === 'portemanteau' && inspector) void getGateway().auth.signOut()
      window.setTimeout(() => setLeaving(true), reducedMotion ? 0 : 650)
      window.setTimeout(() => void navigate(to), reducedMotion ? 0 : 1350)
    },
    [focus, leaving, disabled, navigate, reducedMotion, resume, inspector],
  )

  const closePhone = useCallback(() => {
    setPhone(false)
    setFocus(null)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phone) closePhone()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phone, closePhone])

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#050607] text-paper select-none">
      <h1 className="sr-only">{t('office.place', { name: inspector?.displayName ?? 'Hale' })}</h1>
      <WebGLGuard>
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <OfficeScene
              reducedMotion={reducedMotion}
              hovered={hovered}
              focus={focus}
              disabled={disabled}
              onHover={onHover}
              onSelect={onSelect}
            />
          </Suspense>
        </div>
      </WebGLGuard>

      <div className="pointer-events-none absolute inset-0 z-30">
        <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/60 to-transparent px-6 pt-8 pb-16 md:px-10">
          <div>
            <Wordmark />
            <p className="mt-3 font-mono text-[10px] tracking-[0.24em] text-paper-faint uppercase">{t('office.place', { name: inspector?.displayName ?? 'Hale' })}</p>
          </div>
          <div className="pointer-events-auto">
            <AudioToggle />
          </div>
        </div>

        <AnimatePresence>{phone && <PhonePanel onClose={closePhone} />}</AnimatePresence>

        <AnimatePresence>
          {!focus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 bg-gradient-to-t from-black/60 to-transparent px-6 pt-16 pb-8 md:px-10"
            >
              <div className="flex items-center gap-3 rounded-full border border-line bg-ink/60 py-1.5 pr-5 pl-1.5 backdrop-blur-md">
                <span className="grid size-9 place-items-center rounded-full border border-line-strong bg-surface-raised font-display text-base text-paper-muted">R</span>
                <span>
                  <span className="block text-[12px] font-semibold">{t('office.partner.name')}</span>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-paper-faint">
                    <span className="size-1.5 rounded-full bg-paper-faint" /> {t('office.partner.status')}
                  </span>
                </span>
              </div>
              <p className="hidden font-mono text-[10px] tracking-[0.22em] text-paper-faint uppercase md:block">{t('office.hint')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Curtain ready={ready} leaving={leaving} />
    </main>
  )
}
