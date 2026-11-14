import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AudioState {
  enabled: boolean
  ambienceVolume: number
  effectsVolume: number
  musicVolume: number
  toggle: () => void
  setVolume: (channel: 'ambienceVolume' | 'effectsVolume' | 'musicVolume', value: number) => void
}

/** Préférences audio, mémorisées localement. Son coupé par défaut (pas de lecture sans geste). */
export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      enabled: false,
      ambienceVolume: 0.5,
      effectsVolume: 0.7,
      musicVolume: 0.35,
      toggle: () => set((s) => ({ enabled: !s.enabled })),
      setVolume: (channel, value) => set({ [channel]: Math.min(1, Math.max(0, value)) }),
    }),
    { name: 'tlc.audio' },
  ),
)
