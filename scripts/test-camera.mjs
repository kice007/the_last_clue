// Test des gestes : glisser (rotation), clic sur objet.
import puppeteer from 'puppeteer-core'

const out = process.argv[2] || '.'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  defaultViewport: { width: 1440, height: 810 },
})
const page = await browser.newPage()
page.on('pageerror', (e) => console.log('pageerror:', e.message))
await page.goto('http://localhost:5190/prototype/bureau', { waitUntil: 'networkidle0' })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
await wait(15000)
const state = () => page.evaluate(() => {
  const s = window.__investigation.getState()
  return { view: s.view, inspecting: s.inspecting, free: s.freeShot && { p: s.freeShot.position.map((v) => +v.toFixed(2)), t: s.freeShot.target.map((v) => +v.toFixed(2)) } }
})
const m = page.mouse
// 1. glisser vers la gauche
await m.move(720, 400)
await m.down()
for (let i = 1; i <= 20; i++) { await m.move(720 - i * 15, 400); await wait(30) }
await m.up()
await wait(800)
console.log('après glisser :', JSON.stringify(await state()))
await page.screenshot({ path: `${out}/cam-drag.png` })
// 3. glisser qui finit sur un objet ne doit pas ouvrir l'examen
await page.evaluate(() => window.__investigation.getState().setView('bureau'))
await wait(3500)
await m.move(900, 300); await m.down()
for (let i = 1; i <= 10; i++) { await m.move(900 - i * 30, 300 + i * 15); await wait(30) }
await m.up(); await wait(600)
console.log('glisser sur objet → inspecting =', (await state()).inspecting)
// 4. simple clic sur le registre (vue bureau) : l'examen doit s'ouvrir
await page.evaluate(() => window.__investigation.getState().setView('bureau'))
await wait(3500)
await m.click(600, 390)
await wait(1500)
console.log('clic sur le registre → inspecting =', (await state()).inspecting)
await browser.close()
