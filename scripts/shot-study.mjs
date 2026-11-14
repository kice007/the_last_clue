// Captures du prototype 3D : chaque point de vue, puis l'examen de chaque pièce.
import puppeteer from 'puppeteer-core'

const out = process.argv[2] || '.'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  defaultViewport: { width: 1440, height: 810 },
})
const page = await browser.newPage()
page.on('pageerror', (e) => console.log('pageerror:', e.message))
page.on('console', (m) => ['error','warn','warning'].includes(m.type()) && console.log('console.' + m.type() + ':', m.text().slice(0, 300)))
await page.goto('http://localhost:5190/prototype/bureau', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 15000))
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const run = (fn, arg) => page.evaluate(fn, arg)
for (const v of (process.env.VIEWS || 'bureau,cheminee,fenetre,tapis').split(',')) {
  await run((v) => window.__investigation.getState().setView(v), v)
  await wait(3500)
  await page.screenshot({ path: `${out}/view-${v}.png` })
}
for (const id of (process.env.INSPECT || 'e07_ashes').split(',').filter(Boolean)) {
  await run((id) => window.__investigation.getState().inspect(id), id)
  await wait(4500)
  await page.screenshot({ path: `${out}/inspect-${id}.png` })
  await run(() => window.__investigation.getState().inspect(null))
  await wait(1500)
}
await browser.close()
