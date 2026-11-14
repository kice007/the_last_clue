let cached: boolean | null = null

export function isWebGLAvailable(): boolean {
  if (cached !== null) return cached
  try {
    const canvas = document.createElement('canvas')
    cached = Boolean(window.WebGL2RenderingContext && canvas.getContext('webgl2')) ||
      Boolean(window.WebGLRenderingContext && canvas.getContext('webgl'))
  } catch {
    cached = false
  }
  return cached
}
