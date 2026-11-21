// Captures de l'écran titre et du bureau de l'inspecteur (menu A), avec survol de chaque objet.
// Usage : node scripts/shot-menu.mjs <dossier>   (serveur de dev sur le port 5190)
import puppeteer from 'puppeteer-core'

const out = process.argv[2] || '.'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  defaultViewport: { width: 1440, height: 900 },
})
const page = await browser.newPage()
page.on('pageerror', (e) => console.log('pageerror:', e.message))
page.on('console', (m) => ['error', 'warn', 'warning'].includes(m.type()) && console.log('console.' + m.type() + ':', m.text().slice(0, 300)))
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

await page.goto('http://localhost:5190/', { waitUntil: 'networkidle0' })
await wait(6000)
await page.screenshot({ path: `${out}/title.png` })

await page.goto('http://localhost:5190/office', { waitUntil: 'networkidle0' })
await wait(Number(process.env.SETTLE || 16000))
await page.mouse.move(720, 450)
await wait(2500)
await page.screenshot({ path: `${out}/office.png` })
for (const id of (process.env.SPOTS || 'classeur,telephone,lampe,papiers,diplomes,portemanteau').split(',')) {
  const el = await page.$(`button[data-spot="${id}"]`)
  if (!el) {
    console.log('plaque introuvable', id)
    continue
  }
  await el.focus()
  await wait(Number(process.env.HOVER || 9000))
  await page.screenshot({ path: `${out}/hover-${id}.png` })
  await el.evaluate((b) => b.blur())
}
await browser.close()
