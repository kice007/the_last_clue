import * as THREE from 'three'

/** Textures dessinées en Canvas 2D : créations originales, aucune ressource externe. */

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!] as const
}

function toTexture(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

const rand = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

/** Tapis d'Orient : bordures, champ à losanges, médaillon central. */
export function rugTexture() {
  const [c, g] = canvas(2048, 1408)
  const W = c.width
  const H = c.height
  const r = rand(7)
  const field = '#5a1a17'
  const navy = '#16202e'
  const gold = '#b88a4a'
  const ivory = '#cdbb94'
  g.fillStyle = navy
  g.fillRect(0, 0, W, H)
  const bands: [number, string][] = [[0, '#2a1410'], [26, gold], [38, navy], [118, gold], [128, '#3c1512'], [150, ivory], [158, field]]
  for (const [inset, color] of bands) {
    g.fillStyle = color
    g.fillRect(inset, inset, W - inset * 2, H - inset * 2)
  }
  // motifs de bordure
  g.fillStyle = ivory
  for (let x = 60; x < W - 60; x += 56) {
    for (const y of [70, H - 86]) {
      g.beginPath()
      g.moveTo(x, y + 8)
      g.lineTo(x + 14, y - 8)
      g.lineTo(x + 28, y + 8)
      g.lineTo(x + 14, y + 24)
      g.closePath()
      g.fill()
    }
  }
  for (let y = 60; y < H - 60; y += 56) {
    for (const x of [62, W - 90]) {
      g.beginPath()
      g.moveTo(x + 8, y)
      g.lineTo(x + 24, y + 14)
      g.lineTo(x + 8, y + 28)
      g.lineTo(x - 8, y + 14)
      g.closePath()
      g.fill()
    }
  }
  // champ : treillis de losanges
  g.strokeStyle = 'rgba(184,138,74,0.35)'
  g.lineWidth = 3
  for (let x = 180; x < W - 180; x += 120) {
    for (let y = 180; y < H - 180; y += 120) {
      g.beginPath()
      g.moveTo(x + 60, y)
      g.lineTo(x + 120, y + 60)
      g.lineTo(x + 60, y + 120)
      g.lineTo(x, y + 60)
      g.closePath()
      g.stroke()
      g.fillStyle = 'rgba(22,32,46,0.55)'
      g.beginPath()
      g.arc(x + 60, y + 60, 9, 0, Math.PI * 2)
      g.fill()
    }
  }
  // médaillon
  const cx = W / 2
  const cy = H / 2
  for (const [rx, ry, color] of [[420, 300, navy], [380, 262, gold], [360, 244, '#3c1512'], [250, 168, ivory], [232, 150, navy], [110, 74, gold]] as const) {
    g.fillStyle = color
    g.beginPath()
    g.moveTo(cx - rx, cy)
    g.quadraticCurveTo(cx - rx * 0.5, cy - ry * 0.4, cx, cy - ry)
    g.quadraticCurveTo(cx + rx * 0.5, cy - ry * 0.4, cx + rx, cy)
    g.quadraticCurveTo(cx + rx * 0.5, cy + ry * 0.4, cx, cy + ry)
    g.quadraticCurveTo(cx - rx * 0.5, cy + ry * 0.4, cx - rx, cy)
    g.fill()
  }
  // usure et fibres
  for (let i = 0; i < 26000; i++) {
    g.fillStyle = `rgba(${r() > 0.5 ? '255,240,210' : '0,0,0'},${r() * 0.06})`
    g.fillRect(r() * W, r() * H, 1 + r() * 3, 1)
  }
  const wear = g.createRadialGradient(W * 0.45, H * 0.5, 50, W * 0.45, H * 0.5, W * 0.6)
  wear.addColorStop(0, 'rgba(200,170,130,0.12)')
  wear.addColorStop(1, 'rgba(0,0,0,0.25)')
  g.fillStyle = wear
  g.fillRect(0, 0, W, H)
  return toTexture(c)
}

/** Fragment de papier à demi brûlé, quelques mots à l'encre. */
export function paperFragmentTexture() {
  const [c, g] = canvas(512, 384)
  const r = rand(3)
  g.clearRect(0, 0, 512, 384)
  g.save()
  g.beginPath()
  const pts = 28
  for (let i = 0; i <= pts; i++) {
    const a = (i / pts) * Math.PI * 2
    const rr = 150 + r() * 46
    g.lineTo(256 + Math.cos(a) * rr * 1.35, 192 + Math.sin(a) * rr * 0.9)
  }
  g.closePath()
  g.clip()
  const grad = g.createRadialGradient(240, 180, 30, 256, 192, 260)
  grad.addColorStop(0, '#ece0c2')
  grad.addColorStop(0.62, '#d4bd8f')
  grad.addColorStop(0.85, '#6b4a22')
  grad.addColorStop(1, '#120a05')
  g.fillStyle = grad
  g.fillRect(0, 0, 512, 384)
  g.fillStyle = 'rgba(22,14,8,0.95)'
  g.font = 'italic 600 54px "Cormorant Garamond", Georgia, serif'
  g.fillText('…nnan, Ada, 7 a…', 78, 182)
  g.font = 'italic 500 38px "Cormorant Garamond", Georgia, serif'
  g.fillText('…sur mon ord…', 140, 238)
  g.restore()
  return toTexture(c)
}

/** Dentelle blanche roussie (alpha). */
export function laceTexture() {
  const [c, g] = canvas(512, 256)
  g.fillStyle = '#e8e2d4'
  g.fillRect(0, 0, 512, 256)
  g.globalCompositeOperation = 'destination-out'
  for (let x = 0; x < 512; x += 32) {
    for (let y = 0; y < 256; y += 32) {
      g.beginPath()
      g.arc(x + 16, y + 16, 9, 0, Math.PI * 2)
      g.fill()
      g.beginPath()
      g.arc(x, y, 4, 0, Math.PI * 2)
      g.fill()
    }
  }
  g.globalCompositeOperation = 'source-atop'
  const burn = g.createLinearGradient(0, 0, 512, 0)
  burn.addColorStop(0, 'rgba(20,10,5,0.95)')
  burn.addColorStop(0.35, 'rgba(90,50,20,0.6)')
  burn.addColorStop(0.7, 'rgba(0,0,0,0)')
  g.fillStyle = burn
  g.fillRect(0, 0, 512, 256)
  return toTexture(c)
}

/** Mouchoir de lin, ourlet, monogramme, taches brunes. */
export function handkerchiefTexture() {
  const [c, g] = canvas(512, 512)
  const r = rand(11)
  g.fillStyle = '#ece6d8'
  g.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 512; i += 3) {
    g.fillStyle = 'rgba(120,110,90,0.05)'
    g.fillRect(i, 0, 1, 512)
    g.fillRect(0, i, 512, 1)
  }
  g.strokeStyle = 'rgba(150,140,120,0.6)'
  g.lineWidth = 3
  g.strokeRect(22, 22, 468, 468)
  g.fillStyle = 'rgba(70,60,50,0.75)'
  g.font = 'italic 600 52px "Cormorant Garamond", Georgia, serif'
  g.fillText('A. W.', 360, 470)
  for (let i = 0; i < 9; i++) {
    const x = 120 + r() * 240
    const y = 120 + r() * 240
    const rad = 14 + r() * 46
    const st = g.createRadialGradient(x, y, 2, x, y, rad)
    st.addColorStop(0, 'rgba(92,30,20,0.7)')
    st.addColorStop(0.6, 'rgba(120,52,36,0.35)')
    st.addColorStop(1, 'rgba(140,80,60,0)')
    g.fillStyle = st
    g.beginPath()
    g.arc(x, y, rad, 0, Math.PI * 2)
    g.fill()
  }
  return toTexture(c)
}

/** Face du bouton de nacre : reflets et quatre trous. */
export function pearlButtonTexture() {
  const [c, g] = canvas(256, 256)
  const grad = g.createRadialGradient(110, 100, 10, 128, 128, 128)
  grad.addColorStop(0, '#fbf7ef')
  grad.addColorStop(0.5, '#e6e0d6')
  grad.addColorStop(0.8, '#d6dde4')
  grad.addColorStop(1, '#c9c1b4')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  g.strokeStyle = 'rgba(160,150,140,0.5)'
  g.lineWidth = 6
  g.beginPath()
  g.arc(128, 128, 96, 0, Math.PI * 2)
  g.stroke()
  g.fillStyle = '#2b2620'
  for (const [x, y] of [[104, 104], [152, 104], [104, 152], [152, 152]] as const) {
    g.beginPath()
    g.arc(x, y, 11, 0, Math.PI * 2)
    g.fill()
  }
  g.strokeStyle = '#efe6d2'
  g.lineWidth = 4
  g.beginPath()
  g.moveTo(104, 104)
  g.lineTo(152, 152)
  g.moveTo(152, 104)
  g.lineTo(104, 152)
  g.stroke()
  return toTexture(c)
}

/** Registre ouvert : pages lignées, écriture illisible à distance. */
export function ledgerTexture() {
  const [c, g] = canvas(1024, 640)
  const r = rand(5)
  g.fillStyle = '#ddd0b0'
  g.fillRect(0, 0, 1024, 640)
  const shade = g.createLinearGradient(440, 0, 584, 0)
  shade.addColorStop(0, 'rgba(0,0,0,0)')
  shade.addColorStop(0.5, 'rgba(60,40,20,0.35)')
  shade.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = shade
  g.fillRect(440, 0, 144, 640)
  g.strokeStyle = 'rgba(80,90,130,0.35)'
  g.lineWidth = 1
  for (const x0 of [40, 552]) {
    for (let y = 90; y < 600; y += 26) {
      g.beginPath()
      g.moveTo(x0, y)
      g.lineTo(x0 + 432, y)
      g.stroke()
      g.fillStyle = 'rgba(40,30,22,0.55)'
      let x = x0 + 8
      while (x < x0 + 400 * (0.6 + r() * 0.4)) {
        const w = 8 + r() * 46
        g.fillRect(x, y - 9, w, 2 + r() * 2)
        x += w + 8
      }
    }
  }
  g.fillStyle = 'rgba(40,30,22,0.8)'
  g.font = 'italic 600 30px "Cormorant Garamond", Georgia, serif'
  g.fillText('Filature Whitmore — Bradford, 1878', 56, 60)
  return toTexture(c)
}

/** Dos de livre relié : nervures et filets dorés, pièce de titre. Teinté par la couleur du matériau. */
export function bookSpineTexture() {
  const [c, g] = canvas(128, 512)
  const r = rand(17)
  g.fillStyle = '#d8d8d8'
  g.fillRect(0, 0, 128, 512)
  for (let i = 0; i < 1800; i++) {
    g.fillStyle = `rgba(0,0,0,${r() * 0.08})`
    g.fillRect(r() * 128, r() * 512, 2, 2)
  }
  const gold = '#e9c77a'
  for (const y of [38, 120, 200, 360, 440]) {
    g.fillStyle = 'rgba(0,0,0,0.35)'
    g.fillRect(0, y - 6, 128, 14)
    g.fillStyle = gold
    g.fillRect(0, y - 4, 128, 3)
    g.fillRect(0, y + 4, 128, 2)
  }
  g.fillStyle = 'rgba(20,10,5,0.75)'
  g.fillRect(14, 232, 100, 96)
  g.strokeStyle = gold
  g.lineWidth = 3
  g.strokeRect(20, 238, 88, 84)
  g.fillStyle = gold
  for (let i = 0; i < 3; i++) g.fillRect(34, 258 + i * 18, 60 - i * 12, 5)
  return toTexture(c)
}
