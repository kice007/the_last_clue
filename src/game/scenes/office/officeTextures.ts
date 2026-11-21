import * as THREE from 'three'

/**
 * Textures dessinées au canevas pour le bureau de l'inspecteur (aucun fichier externe).
 * Graine fixe : le décor est identique d'une visite à l'autre.
 */

function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return { c, g: c.getContext('2d')! }
}

function finish(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** Papier vieilli : dégradé, fibres, auréoles. */
function agedPaper(g: CanvasRenderingContext2D, w: number, h: number, r: () => number, light = '#e4d7b8', dark = '#b8a47c') {
  const grad = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.1, w / 2, h / 2, Math.max(w, h) * 0.75)
  grad.addColorStop(0, light)
  grad.addColorStop(1, dark)
  g.fillStyle = grad
  g.fillRect(0, 0, w, h)
  for (let i = 0; i < (w * h) / 300; i++) {
    g.fillStyle = `rgba(80, 60, 30, ${r() * 0.05})`
    g.fillRect(r() * w, r() * h, 1 + r() * 3, 1)
  }
  for (let i = 0; i < 5; i++) {
    g.strokeStyle = `rgba(110, 80, 40, ${0.05 + r() * 0.06})`
    g.lineWidth = 2 + r() * 4
    g.beginPath()
    g.arc(r() * w, r() * h, 20 + r() * 70, 0, Math.PI * 2)
    g.stroke()
  }
}

/** Lignes d'écriture simulées (traits fins irréguliers). */
function scribble(g: CanvasRenderingContext2D, x: number, y: number, w: number, lines: number, gap: number, r: () => number, color = 'rgba(40,30,20,0.55)') {
  g.strokeStyle = color
  g.lineWidth = 1.4
  for (let l = 0; l < lines; l++) {
    let cx = x
    const end = x + w * (l === lines - 1 ? 0.4 + r() * 0.3 : 0.85 + r() * 0.15)
    while (cx < end) {
      const word = 10 + r() * 34
      g.beginPath()
      g.moveTo(cx, y + l * gap)
      for (let k = 0; k < word; k += 3) g.lineTo(cx + k, y + l * gap + Math.sin(k * 0.9 + r() * 6) * 2.2)
      g.stroke()
      cx += word + 7
    }
  }
}

/** Carte d'état-major du comté : côte, rivières, routes, parcelles, cartouche. */
export function countyMapTexture() {
  const W = 1536
  const H = 1024
  const { c, g } = canvas(W, H)
  const r = rng(11)
  agedPaper(g, W, H, r, '#d9caa4', '#a8915f')
  // mer à l'est
  g.fillStyle = 'rgba(70, 95, 105, 0.28)'
  g.beginPath()
  g.moveTo(W, 0)
  let x = W * 0.78
  for (let y = 0; y <= H; y += 24) {
    x += (r() - 0.5) * 40
    g.lineTo(x, y)
  }
  g.lineTo(W, H)
  g.closePath()
  g.fill()
  // courbes de niveau
  for (let k = 0; k < 9; k++) {
    g.strokeStyle = `rgba(120, 85, 45, ${0.18 + r() * 0.12})`
    g.lineWidth = 1.2
    g.beginPath()
    const cx = W * (0.15 + r() * 0.5)
    const cy = H * (0.2 + r() * 0.6)
    for (let ring = 1; ring < 5; ring++) {
      g.beginPath()
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.2) {
        const rad = ring * 26 * (1 + Math.sin(a * 3 + k) * 0.18)
        const px = cx + Math.cos(a) * rad * 1.4
        const py = cy + Math.sin(a) * rad
        if (a === 0) g.moveTo(px, py)
        else g.lineTo(px, py)
      }
      g.stroke()
    }
  }
  // rivières
  for (let k = 0; k < 3; k++) {
    g.strokeStyle = 'rgba(55, 85, 110, 0.55)'
    g.lineWidth = 3 - k * 0.6
    g.beginPath()
    let px = r() * W * 0.4
    let py = 0
    g.moveTo(px, py)
    while (py < H && px < W * 0.8) {
      px += 18 + r() * 30
      py += 10 + r() * 34
      g.lineTo(px, py)
    }
    g.stroke()
  }
  // routes
  g.strokeStyle = 'rgba(150, 50, 35, 0.6)'
  g.lineWidth = 2.5
  for (let k = 0; k < 6; k++) {
    g.beginPath()
    g.moveTo(r() * W * 0.8, r() * H)
    g.bezierCurveTo(r() * W, r() * H, r() * W, r() * H, r() * W * 0.8, r() * H)
    g.stroke()
  }
  // villages
  g.fillStyle = 'rgba(40, 30, 20, 0.75)'
  for (let k = 0; k < 26; k++) {
    const px = r() * W * 0.76
    const py = r() * H
    g.fillRect(px, py, 6, 6)
    scribble(g, px + 10, py + 4, 70, 1, 0, r, 'rgba(40,30,20,0.6)')
  }
  // quadrillage
  g.strokeStyle = 'rgba(60, 45, 30, 0.12)'
  g.lineWidth = 1
  for (let gx = 0; gx < W; gx += 128) {
    g.beginPath()
    g.moveTo(gx, 0)
    g.lineTo(gx, H)
    g.stroke()
  }
  for (let gy = 0; gy < H; gy += 128) {
    g.beginPath()
    g.moveTo(0, gy)
    g.lineTo(W, gy)
    g.stroke()
  }
  // punaises et épingles de l'inspecteur
  for (const [px, py] of [[420, 380], [610, 520], [880, 300], [300, 700]] as const) {
    g.fillStyle = 'rgba(0,0,0,0.3)'
    g.beginPath()
    g.arc(px + 4, py + 5, 11, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#8c2a22'
    g.beginPath()
    g.arc(px, py, 10, 0, Math.PI * 2)
    g.fill()
  }
  g.strokeStyle = 'rgba(140, 42, 34, 0.7)'
  g.lineWidth = 2
  g.beginPath()
  g.moveTo(420, 380)
  g.lineTo(610, 520)
  g.lineTo(880, 300)
  g.stroke()
  // cartouche
  g.fillStyle = 'rgba(228, 214, 182, 0.92)'
  g.fillRect(W * 0.06, H * 0.78, 360, 150)
  g.strokeStyle = 'rgba(40, 30, 20, 0.7)'
  g.lineWidth = 3
  g.strokeRect(W * 0.06 + 8, H * 0.78 + 8, 344, 134)
  g.fillStyle = 'rgba(40, 30, 20, 0.85)'
  g.font = '600 30px Georgia, serif'
  g.fillText('NORTH RIDING', W * 0.06 + 40, H * 0.78 + 58)
  g.font = 'italic 20px Georgia, serif'
  g.fillText('of the County of York · 1906', W * 0.06 + 40, H * 0.78 + 98)
  // cadre
  g.strokeStyle = 'rgba(30, 22, 14, 0.8)'
  g.lineWidth = 10
  g.strokeRect(5, 5, W - 10, H - 10)
  return finish(c)
}

/** Diplôme encadré : en-tête calligraphié, texte, sceau de cire. */
export function certificateTexture(seed: number) {
  const W = 512
  const H = 680
  const { c, g } = canvas(W, H)
  const r = rng(seed)
  agedPaper(g, W, H, r, '#ede2c6', '#c4ad80')
  g.strokeStyle = 'rgba(120, 90, 40, 0.65)'
  g.lineWidth = 6
  g.strokeRect(24, 24, W - 48, H - 48)
  g.lineWidth = 1.5
  g.strokeRect(38, 38, W - 76, H - 76)
  g.fillStyle = 'rgba(40, 28, 16, 0.85)'
  g.textAlign = 'center'
  g.font = '600 34px Georgia, serif'
  g.fillText(seed % 2 ? 'Metropolitan Police' : 'Certificate of Merit', W / 2, 130)
  g.font = 'italic 22px Georgia, serif'
  g.fillText(seed % 2 ? 'Criminal Investigation Department' : 'awarded to Inspector E. Hale', W / 2, 172)
  scribble(g, 90, 250, W - 180, 7, 34, r)
  // sceau
  g.fillStyle = '#7a1f1a'
  g.beginPath()
  for (let a = 0; a <= Math.PI * 2; a += 0.15) {
    const rad = 46 + Math.sin(a * 9) * 4
    g.lineTo(W / 2 + Math.cos(a) * rad, H - 140 + Math.sin(a) * rad)
  }
  g.fill()
  g.strokeStyle = 'rgba(255, 200, 170, 0.25)'
  g.lineWidth = 2
  g.beginPath()
  g.arc(W / 2, H - 140, 30, 0, Math.PI * 2)
  g.stroke()
  return finish(c)
}

/** Feuille punaisée : avis de recherche, note de service, coupure de journal. */
export function noticeTexture(seed: number) {
  const W = 360
  const H = 480
  const { c, g } = canvas(W, H)
  const r = rng(seed)
  agedPaper(g, W, H, r, '#e6dcc4', '#bfae88')
  g.fillStyle = 'rgba(30, 22, 14, 0.85)'
  g.textAlign = 'center'
  if (seed % 3 === 0) {
    g.font = '700 46px Georgia, serif'
    g.fillText('WANTED', W / 2, 74)
    g.fillStyle = 'rgba(40, 32, 24, 0.55)'
    g.fillRect(90, 100, 180, 200)
    g.fillStyle = 'rgba(30, 22, 14, 0.85)'
    scribble(g, 50, 340, W - 100, 4, 28, r)
  } else if (seed % 3 === 1) {
    g.font = '600 24px Georgia, serif'
    g.fillText('POLICE NOTICE', W / 2, 60)
    scribble(g, 40, 110, W - 80, 10, 30, r)
  } else {
    g.font = '700 28px Georgia, serif'
    g.fillText('THE THORNBY GAZETTE', W / 2, 52)
    g.fillRect(30, 66, W - 60, 3)
    for (const col of [0, 1]) scribble(g, 34 + col * 152, 100, 132, 11, 28, r)
  }
  return finish(c)
}

/** Dos de chemise cartonnée, avec onglet et étiquette manuscrite. */
export function folderTexture(seed: number) {
  const W = 256
  const H = 160
  const { c, g } = canvas(W, H)
  const r = rng(seed)
  const tones = ['#a98b5c', '#9a7a4c', '#b39a6c', '#8f7448']
  g.fillStyle = tones[seed % tones.length]!
  g.fillRect(0, 0, W, H)
  for (let i = 0; i < 400; i++) {
    g.fillStyle = `rgba(60, 40, 20, ${r() * 0.08})`
    g.fillRect(r() * W, r() * H, 1 + r() * 2, 1)
  }
  g.fillStyle = 'rgba(240, 230, 205, 0.85)'
  g.fillRect(30 + (seed % 4) * 40, 14, 90, 30)
  scribble(g, 36 + (seed % 4) * 40, 32, 76, 1, 0, r, 'rgba(30,20,10,0.7)')
  return finish(c)
}

/** Feuille dactylographiée vue de dessus (pile de rapports sur le bureau). */
export function reportTexture(seed: number) {
  const W = 360
  const H = 500
  const { c, g } = canvas(W, H)
  const r = rng(seed)
  agedPaper(g, W, H, r, '#ece4cf', '#cdbf9c')
  g.fillStyle = 'rgba(30, 22, 14, 0.8)'
  g.font = '600 20px Georgia, serif'
  g.fillText('REPORT', 34, 52)
  scribble(g, 34, 92, W - 68, 12, 30, r, 'rgba(30,25,20,0.6)')
  return finish(c)
}
