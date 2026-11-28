// SKJERMBILDENE PÅ NETTSIDEN, tatt fra demospeilet (scripts/demospeil.mjs).
//
// Den ekte appen med demoens innhold, mot simulert Supabase: ingen kall til produksjonen. Hvert bilde er avgrenset
// av et start- og et sluttelement i appen, så utsnittet blir det samme når bildene tas på nytt etter en endring i
// appen. Bildene beskjæres, men redigeres ikke.
//
//   VITE_SUPABASE_URL=https://test.supabase.co VITE_SUPABASE_ANON_KEY=test npx vite --port 5179
//   node scripts/nettsidebilder.mjs [base-url] [mappe]       # PNG i 2x oppløsning
//   python3 -I scripts/til-webp.py mappe public/nettsted     # WebP uten metadata, i målene sidene bruker
//
// Etterpå: sjekk at width/height i sidene stemmer med bildene (test/seo/nettsted.test.js sjekker at filene finnes og
// er uten metadata), og at alt-tekstene fortsatt beskriver det bildene viser.
import { mkdirSync } from 'node:fs'
import { BASE, EST, launch } from '../test/e2e/fixtures.mjs'
import { demoSetup, itemId } from './demospeil.mjs'

const base = process.argv[2] || BASE
const out = process.argv[3] || 'nettsidebilder'
mkdirSync(out, { recursive: true })

const MALERI = itemId('face0004')
// Mona har svart på alt (nei takk til det hun ikke vil ha), så fordelingsmåtene kan brukes
const monaSvart = d => {
  for (const it of d.fixtures.items) if (!it.interests.some(x => x.user_id === d.id.mona)) {
    d.fixtures.item_passes.push({ id: `${it.id}-pass-mona`, item_id: it.id, user_id: d.id.mona, created_at: it.created_at })
  }
}

// Avgrensning: fra toppen av `fra` til bunnen av `til`, i bredden til `ramme` (eller `fra` sin forelder), med luft rundt
async function utsnitt(page, { fra, til = fra, ramme = null, luft = 12, luftBunn = luft }) {
  const a = await page.locator(fra).first().boundingBox()
  const b = await page.locator(til).first().boundingBox()
  const r = ramme ? await page.locator(ramme).first().boundingBox() : a
  if (!a || !b || !r) throw new Error(`fant ikke ${fra} / ${til} / ${ramme}`)
  const y = Math.max(0, a.y - luft)
  return { x: Math.max(0, r.x - luft), y, width: r.width + 2 * luft, height: b.y + b.height + luftBunn - y }
}

const BILDER = [
  { fil: 'i-legg-til', vindu: [390, 844], sti: `/estate/${EST}/add`,
    fra: 'text=Bilder (valgfri, maks 5)', til: 'input#title, input[placeholder*="gyngestol"]', ramme: 'input[placeholder*="gyngestol"]' },
  { fil: 'f-flere', vindu: [390, 844], sti: `/estate/${EST}/gjenstander?vis=ettertraktede`,
    fra: '.bo-rutenett > :nth-child(1)', til: '.bo-rutenett > :nth-child(2)', ramme: '.bo-rutenett', luft: 6 },
  { fil: 'f-filtre', vindu: [1440, 900], sti: `/estate/${EST}/gjenstander`, fra: '.bo-verktoy', ramme: '.bo-verktoy', luft: 6 },
  { fil: 'j-svar', vindu: [1280, 900], sti: `/estate/${EST}/item/${MALERI}`,
    fra: 'button:has-text("Registrer interesse")', til: 'button:has-text("Ikke interessert")', ramme: 'button:has-text("Registrer interesse") >> xpath=..', luft: 10 },
  { fil: 'j-onsker', vindu: [1280, 900], sti: `/estate/${EST}/item/${MALERI}`,
    fra: 'text=/^Flere ønsker denne/', til: 'text=/Ønsker flere det, tar vi en prat først/', ramme: 'text=/^Snakk sammen først: se hvorfor/', luft: 14, luftBunn: 26 },
  { fil: 'p-metoder', vindu: [390, 844], sti: `/estate/${EST}/conflicts`, patch: monaSvart,
    fra: 'text=/^Loddtrekning$/ >> xpath=ancestor::button[1]', til: 'text=/^Jevn verdifordeling$/ >> xpath=ancestor::button[1]', ramme: 'text=/^Loddtrekning$/ >> xpath=ancestor::button[1]', luft: 10 },
  { fil: 'm-fordeling', vindu: [390, 844], sti: `/estate/${EST}/fordeling`,
    fra: 'text=/^← Tilbake til boet$/', til: 'text=/^Last ned utkast \\(PDF\\)$/', ramme: 'h1', luft: 16, luftBunn: 28 },
  { fil: 'm-godkjenning', vindu: [390, 844], sti: `/estate/${EST}/fordeling`,
    fra: 'h2:has-text("Godkjenning")', til: 'button:has-text("Legg frem forslag")', ramme: 'h1', luft: 16, luftBunn: 28 },
  { fil: 'j-verdi', vindu: [1280, 900], sti: `/estate/${EST}/item/${MALERI}`,
    patch: d => { Object.assign(d.fixtures.items.find(i => i.id === MALERI), { agreed_value: 4000, agreed_value_source: 'ai' }) },
    fra: 'h1', til: 'text=/^Verdiestimat \\(veiledende\\)$/ >> xpath=..', ramme: 'text=/^Verdiestimat \\(veiledende\\)$/ >> xpath=..', luft: 20, luftBunn: 10 },
]

const browser = await launch()
for (const b of BILDER) {
  const { ctx, page } = await demoSetup(browser, { viewport: { width: b.vindu[0], height: b.vindu[1] }, scale: 2, patch: b.patch })
  await page.goto(base + b.sti, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  // Demobanneret og den faste lagrelinjen hører ikke med i et utsnitt
  await page.addStyleTag({ content: '.bottom-bar{display:none!important}' })
  await page.evaluate(() => document.activeElement?.blur())  // ingen fokusring fra autofokus i bildet
  try {
    const clip = await utsnitt(page, b)
    await page.screenshot({ path: `${out}/${b.fil}.png`, clip, fullPage: true })
    console.log(`OK   ${b.fil}  ${Math.round(clip.width)}×${Math.round(clip.height)} (css px)`)
  } catch (e) { console.log(`FEIL ${b.fil}: ${e.message.split('\n')[0]}`) }
  await ctx.close()
}
await browser.close()
