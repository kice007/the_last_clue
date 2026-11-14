import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Center, Environment, Lightformer } from '@react-three/drei'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import type { Examinable } from '@/data/cases/_prototype/studySlice'
import { ExaminableModelView } from '@/game/objects/ExaminableModel'
import { useInvestigationStore } from '@/stores/investigationStore'
import { Button } from '@/components/ui/Button'

/** Vue d'examen : objet en rotation libre + fiche de pièce à conviction sur papier. */
export function InspectPanel({ evidence }: { evidence: Examinable }) {
  const { t } = useTranslation('investigation')
  const number = useInvestigationStore((s) => s.collected.indexOf(evidence.id) + 1)
  const collected = number > 0
  const collect = useInvestigationStore((s) => s.collect)
  const inspect = useInvestigationStore((s) => s.inspect)

  return (
    <motion.aside
      key={evidence.id}
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0 }}
      transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto absolute top-24 right-6 bottom-24 flex w-[400px] flex-col overflow-hidden bg-parchment text-parchment-ink shadow-[0_40px_80px_-20px_rgb(0_0_0/0.85)] md:right-10"
    >
      <div className="relative h-[220px] shrink-0 bg-[radial-gradient(ellipse_at_50%_40%,#3a3025_0%,#141210_75%)]">
        <Canvas camera={{ position: [0, 0.45, 0.9], fov: 32 }} dpr={[1, 2]}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[1.5, 2, 1.5]} intensity={2.2} color="#ffe2b8" />
          <directionalLight position={[-2, 1, -1]} intensity={0.8} color="#8fa8d0" />
          <Environment resolution={64} frames={1}>
            <Lightformer form="rect" intensity={1.2} color="#ffe2b8" position={[2, 2, 2]} scale={[2, 2, 1]} />
            <Lightformer form="rect" intensity={0.6} color="#8fa8d0" position={[-2, 1, -2]} scale={[2, 2, 1]} />
          </Environment>
          <Suspense fallback={null}>
            <Center>
              <ExaminableModelView model={evidence.model} inspect />
            </Center>
          </Suspense>
          <OrbitControls enablePan={false} enableZoom minDistance={0.5} maxDistance={1.6} autoRotate autoRotateSpeed={0.8} />
        </Canvas>
        <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50">
          {t('inspect.rotate')}
        </p>
        <span className="absolute top-4 left-4 font-mono text-[11px] tracking-[0.2em] text-paper/80">
          {collected ? t('inspect.number', { n: number }) : t('inspect.unlisted')}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-7 pt-6 pb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-parchment-ink/55">{evidence.where.fr}</p>
          <h2 className="mt-2 font-display text-[28px] leading-[1.05] font-semibold">{evidence.title.fr}</h2>
        </div>
        <p className="text-[14px] leading-relaxed text-parchment-ink/85">{evidence.description.fr}</p>
        <div className="border-l-2 border-blood/70 pl-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-blood/90">{t('inspect.observation')}</p>
          <p className="mt-1 font-display text-[18px] leading-snug italic">{evidence.observation.fr}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 border-t border-parchment-ink/15 px-7 py-5">
          {collected ? (
            <span className="inline-flex h-12 items-center gap-2 border border-parchment-ink/30 px-5 font-mono text-[11px] uppercase tracking-[0.2em]">
              <Check size={14} strokeWidth={1.75} /> {t('inspect.added')}
            </span>
          ) : (
            <Button onClick={() => collect(evidence.id)} className="min-w-0 flex-1 bg-parchment-ink px-3 text-[12px] tracking-[0.1em] text-parchment hover:bg-[#3a3227]">
              {t('inspect.add')}
            </Button>
          )}
          <Button variant="ghost" onClick={() => inspect(null)} className="shrink-0 border-parchment-ink/30 px-4 text-[12px] tracking-[0.1em] text-parchment-ink hover:border-parchment-ink hover:text-parchment-ink">
            {t('inspect.back')}
          </Button>
      </div>
    </motion.aside>
  )
}
