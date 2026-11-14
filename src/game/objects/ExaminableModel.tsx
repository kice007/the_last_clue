import type { Examinable, ExaminableModel } from '@/data/cases/_prototype/studySlice'
import { evidenceModels } from './evidence/EvidenceModels'
import { Prop } from './Prop'

/** Rendu d'un objet examinable, en scène ou dans la vue d'examen. */
export function ExaminableModelView({ model, inspect = false }: { model: ExaminableModel; inspect?: boolean }) {
  if (model.type === 'evidence') {
    const { Component, inspectScale } = evidenceModels[model.key]
    return inspect ? (
      <group scale={inspectScale}>
        <Component />
      </group>
    ) : (
      <Component />
    )
  }
  return inspect ? (
    <Prop id={model.id} height={0.5} fit="max" tilt={model.tilt} />
  ) : (
    <Prop id={model.id} height={model.size} fit={model.fit} rotation={model.rotation} tilt={model.tilt} />
  )
}

const EVIDENCE_HEIGHT: Record<string, number> = { glass_handkerchief: 0.12, ashes: 0.1, button: 0.01, ledger: 0.04, carafe: 0.26 }

/** Hauteur approximative de l'objet posé (pour repère et cadrage). */
export function examinableHeight(e: Examinable) {
  if (e.model.type === 'evidence') return EVIDENCE_HEIGHT[e.model.key] ?? 0.1
  return e.model.fit === 'max' ? Math.min(e.model.size, 0.06) : e.model.size
}
