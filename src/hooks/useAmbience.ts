import { useEffect, useRef } from 'react'
import { Ambience, type AmbienceLayer } from '@/lib/audio/ambience'
import { useAudioStore } from '@/stores/audioStore'

/** Joue les couches d'ambiance demandées quand l'utilisateur a activé le son. */
export function useAmbience(layers: AmbienceLayer[] = ['rain']) {
  const enabled = useAudioStore((s) => s.enabled)
  const volume = useAudioStore((s) => s.ambienceVolume)
  const ref = useRef<Ambience | null>(null)
  const key = layers.join(',')

  useEffect(() => {
    const a = new Ambience()
    ref.current = a
    return () => a.stop()
  }, [key])

  useEffect(() => {
    const a = ref.current
    if (!a) return
    if (enabled) a.start(key.split(',') as AmbienceLayer[], volume)
    else a.stop()
  }, [enabled, volume, key])
}
