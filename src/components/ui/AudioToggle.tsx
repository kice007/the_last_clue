import { Volume2, VolumeX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAudioStore } from '@/stores/audioStore'

export function AudioToggle() {
  const { t } = useTranslation()
  const enabled = useAudioStore((s) => s.enabled)
  const toggle = useAudioStore((s) => s.toggle)
  const label = enabled ? t('audio.on') : t('audio.off')
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={label}
      title={label}
      className="grid size-10 place-items-center rounded-full border border-line text-paper-muted transition-colors duration-300 hover:border-brass hover:text-brass"
    >
      {enabled ? <Volume2 size={16} strokeWidth={1.5} /> : <VolumeX size={16} strokeWidth={1.5} />}
    </button>
  )
}
