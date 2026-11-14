import { useTranslation } from 'react-i18next'
import { isWebGLAvailable } from '@/utils/webgl'

/** Affiche un message clair si WebGL est indisponible (cahier §12.1). */
export function WebGLGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { t } = useTranslation()
  if (isWebGLAvailable()) return <>{children}</>
  if (fallback) return <>{fallback}</>
  return (
    <div role="alert" className="mx-auto max-w-md border border-blood/40 bg-surface p-6">
      <p className="font-display text-2xl text-paper">{t('webgl.title')}</p>
      <p className="mt-2 text-sm text-paper-muted">{t('webgl.body')}</p>
    </div>
  )
}
