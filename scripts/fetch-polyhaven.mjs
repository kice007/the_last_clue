// Télécharge des assets CC0 de Poly Haven (glTF 1k + textures 1k) et écrit un manifeste de provenance.
// Usage : node scripts/fetch-polyhaven.mjs
import { mkdir, writeFile, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const EXTRA = process.argv.slice(2)
const MODELS = EXTRA.length ? EXTRA : [
  'GreenChair_01', 'ArmChair_01', 'mantel_clock_01', 'vintage_oil_lamp', 'book_encyclopedia_set_01',
  'decorative_book_set_01', 'vintage_cabinet_01', 'fancy_picture_frame_01', 'ornate_mirror_01',
  'Chandelier_01', 'brass_candleholders', 'magnifying_glass_01', 'vintage_grandfather_clock_01',
  'ClassicConsole_01', 'vintage_pocket_watch', 'side_table_01',
]
const TEXTURES = EXTRA.length ? [] : ['herringbone_parquet', 'dark_paneled_wood', 'plastered_wall_04', 'marble_01', 'velour_velvet', 'black_walnut_veneer_01', 'brown_leather']
const MAPS = ['Diffuse', 'nor_gl', 'Rough', 'arm']
const ROOT = 'public/assets'
const UA = { headers: { 'User-Agent': 'the-last-clue-asset-fetch' } }

const exists = (p) => access(p).then(() => true, () => false)
async function get(url, json = true) {
  const r = await fetch(url, UA)
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return json ? r.json() : Buffer.from(await r.arrayBuffer())
}
async function save(path, url) {
  if (await exists(path)) return
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, await get(url, false))
}

const manifest = []
for (const id of MODELS) {
  const [files, info] = await Promise.all([get(`https://api.polyhaven.com/files/${id}`), get(`https://api.polyhaven.com/info/${id}`)])
  const g = files.gltf?.['1k']?.gltf
  if (!g) { console.warn('pas de glTF 1k :', id); continue }
  const dir = join(ROOT, 'props/polyhaven', id)
  await save(join(dir, `${id}.gltf`), g.url)
  for (const [rel, f] of Object.entries(g.include)) await save(join(dir, rel), f.url)
  manifest.push({ id, kind: 'model', name: info.name, authors: Object.keys(info.authors), path: `${dir}/${id}.gltf`, source: `https://polyhaven.com/a/${id}` })
  console.log('modèle', id)
}
for (const id of TEXTURES) {
  const [files, info] = await Promise.all([get(`https://api.polyhaven.com/files/${id}`), get(`https://api.polyhaven.com/info/${id}`)])
  const dir = join(ROOT, 'textures/materials', id)
  for (const m of MAPS) {
    const f = files[m]?.['1k']?.jpg
    if (f) await save(join(dir, `${id}_${m.toLowerCase()}_1k.jpg`), f.url)
  }
  manifest.push({ id, kind: 'texture', name: info.name, authors: Object.keys(info.authors), path: dir, source: `https://polyhaven.com/a/${id}` })
  console.log('texture', id)
}
const prev = await import('node:fs/promises').then((fs) => fs.readFile('docs/polyhaven-manifest.json', 'utf8')).then(JSON.parse).catch(() => ({ items: [] }))
const merged = [...prev.items.filter((i) => !manifest.some((m) => m.id === i.id)), ...manifest]
await writeFile('docs/polyhaven-manifest.json', JSON.stringify({ fetchedAt: new Date().toISOString(), license: 'CC0', items: merged }, null, 2))
console.log('ok', manifest.length)
