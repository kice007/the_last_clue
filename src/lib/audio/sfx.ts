import { Howl } from 'howler'

/**
 * Registre des effets sonores (Howler). Vide en phase 1 :
 * chaque entrée sera ajoutée quand le fichier sourcé et sa licence seront validés
 * (docs/ASSET_LICENSES.md). Nommage : snake_case, chemin sous /assets/audio/.
 */
export const SFX = {} as const satisfies Record<string, string>
export type SfxId = keyof typeof SFX

const cache = new Map<string, Howl>()

export function playSfx(id: SfxId, volume = 1) {
  const src = SFX[id] as string | undefined
  if (!src) return
  let howl = cache.get(src)
  if (!howl) {
    howl = new Howl({ src: [src], volume })
    cache.set(src, howl)
  }
  howl.volume(volume)
  howl.play()
}
