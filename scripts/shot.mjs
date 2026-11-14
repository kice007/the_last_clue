// Capture visuelle + erreurs console. Usage : node scripts/shot.mjs <path> <out.png> [largeur] [full]
import puppeteer from 'puppeteer-core'

const [, , path = '/', out = 'shot.png', W = '1440', full = ''] = process.argv
const width = Number(W)
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  defaultViewport: { width, height: width < 600 ? 844 : Math.round(width * 0.5625) },
})
const page = await browser.newPage()
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && console.log(`console.${m.type()}:`, m.text()))
page.on('pageerror', (e) => console.log('pageerror:', e.message))
await page.goto('http://localhost:5190' + path, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, Number(process.env.WAIT || 6500)))
if (full) {
  const h = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < h; y += 400) {
    await page.evaluate((y) => window.scrollTo(0, y), y)
    await new Promise((r) => setTimeout(r, 150))
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await new Promise((r) => setTimeout(r, 800))
}
await page.screenshot({ path: out, fullPage: Boolean(full) })
await browser.close()
