/**
 * Ambiances procédurales (Web Audio), en attendant les fichiers sourcés.
 * Couches : pluie (bruit filtré + gouttes), feu (crépitements), horloge (tic-tac).
 */
export type AmbienceLayer = 'rain' | 'fire' | 'clock'

export class Ambience {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private timers: number[] = []
  private sources: AudioScheduledSourceNode[] = []

  start(layers: AmbienceLayer[], volume: number) {
    if (this.ctx) return this.setVolume(volume)
    const ctx = new AudioContext()
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    this.ctx = ctx
    this.master = master
    if (layers.includes('rain')) this.rain()
    if (layers.includes('fire')) this.fire()
    if (layers.includes('clock')) this.clock()
    this.setVolume(volume)
  }

  private noiseBuffer(seconds: number) {
    const ctx = this.ctx!
    const length = ctx.sampleRate * seconds
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const d = buffer.getChannelData(ch)
      let b0 = 0
      let b1 = 0
      let b2 = 0
      for (let i = 0; i < length; i++) {
        const w = Math.random() * 2 - 1
        b0 = 0.99765 * b0 + w * 0.099046
        b1 = 0.963 * b1 + w * 0.2965164
        b2 = 0.57 * b2 + w * 1.0526913
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.12
      }
    }
    return buffer
  }

  private loop(buffer: AudioBuffer, filters: BiquadFilterNode[], gain: number) {
    const ctx = this.ctx!
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.loop = true
    const g = ctx.createGain()
    g.gain.value = gain
    let chain: AudioNode = src
    for (const f of filters) chain = chain.connect(f)
    chain.connect(g).connect(this.master!)
    src.start()
    this.sources.push(src)
  }

  private every(fn: () => number) {
    const tick = () => {
      if (!this.ctx) return
      this.timers.push(window.setTimeout(tick, fn()))
    }
    tick()
  }

  private blip(freq: number, end: number, peak: number, dur: number, type: OscillatorType = 'sine') {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(end, ctx.currentTime + dur * 0.7)
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + 0.003)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    osc.connect(g).connect(this.master!)
    osc.start()
    osc.stop(ctx.currentTime + dur + 0.02)
  }

  private filter(type: BiquadFilterType, frequency: number) {
    const f = this.ctx!.createBiquadFilter()
    f.type = type
    f.frequency.value = frequency
    return f
  }

  private rain() {
    this.loop(this.noiseBuffer(4), [this.filter('highpass', 280), this.filter('lowpass', 2200)], 1)
    this.every(() => {
      this.blip(1800 + Math.random() * 1600, 600, 0.004 + Math.random() * 0.02, 0.07)
      return 80 + Math.random() * 420
    })
  }

  private fire() {
    this.loop(this.noiseBuffer(3), [this.filter('lowpass', 420)], 0.9)
    this.every(() => {
      const n = 1 + Math.floor(Math.random() * 3)
      for (let i = 0; i < n; i++) this.blip(2400 + Math.random() * 3000, 900, 0.01 + Math.random() * 0.035, 0.025, 'triangle')
      return 60 + Math.random() * 380
    })
  }

  private clock() {
    let tock = false
    this.every(() => {
      tock = !tock
      this.blip(tock ? 1250 : 1500, tock ? 700 : 900, 0.016, 0.05, 'square')
      return 1000
    })
  }

  setVolume(volume: number) {
    if (!this.ctx || !this.master) return
    this.master.gain.setTargetAtTime(volume * 0.6, this.ctx.currentTime, 0.6)
  }

  stop() {
    if (!this.ctx || !this.master) return
    const ctx = this.ctx
    this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.3)
    this.timers.forEach((t) => window.clearTimeout(t))
    const sources = this.sources
    window.setTimeout(() => {
      sources.forEach((s) => s.stop())
      void ctx.close()
    }, 1200)
    this.ctx = null
    this.master = null
    this.timers = []
    this.sources = []
  }
}
