// Akseptansetester for teknisk SEO mot det bygde nettstedet med hodene og omskrivingene fra vercel.json
// (test/e2e/staticServer.mjs): forhåndsrendret HTML uten JavaScript, robots.txt og sitemap.xml som filer,
// noindex på alt som ikke er offentlige sider, én canonical, og at hydreringen ikke endrer noe for brukerne
// (norsk/engelsk, innlogget/ikke innlogget, demo, innlogging og direkte lenker). Kjøres av test/e2e/run.sh.
import { BASE, EST, launch, checker, assert, sessionFor, DEMO } from './fixtures.mjs'
import { PUBLIC_PAGES, SITE_URL } from '../../src/seo/pages.js'
import { runHttpChecks, H1_NAME } from '../seo/httpChecks.mjs'

const browser = await launch()
const results = []
const check = checker(browser, results)
// Forsidens overskrift. Uttrykket i båndet skifter, så teksten kontrolleres som det tilgjengelige
// navnet, som alltid er den samme hele setningen (src/site/Rotator.jsx).
const H1_NO = H1_NAME
const H1_EN = 'Divide the belongings with one shared overview'
// De fire offentlige sidene finnes bare på norsk (src/seo/pages.js). Et engelsk språkvalg gjelder
// appen, veiviseren og innloggingen; disse sidene vises på norsk uansett.
const h1Name = async page => (await page.locator('h1').ariaSnapshot()).match(/heading "([^"]+)"/)?.[1]
const demoKnapp = page => page.locator('.hdr a.btn')
// På smale skjermer (testenes standard er 390 px) ligger menylenkene i <details class="menu">
const loggInn = async page => {
  const nav = page.locator('.hdr .nav a[href="/logg-inn"]')
  if (await nav.isVisible()) return nav
  await page.locator('.menu > summary').click()
  return page.locator('.menu__panel a[href="/logg-inn"]')
}

// ── HTTP: det søkemotorene får før JavaScript (samme sjekker som scripts/check-seo.mjs kjører mot Vercel) ─────
for (const line of await runHttpChecks(BASE)) results.push(line)

// ── Nettleseren ────────────────────────────────────────────────────────────────────────────────────────
// Følger siden fra første byte: synligheten av den forhåndsrendrede teksten før appens skript kjører, om noe i
// #root fjernes (hydreringen skal ikke bytte ut DOM-en), layoutskift, konsollfeil og brudd på innholdsreglene.
async function observe(page, { lang } = {}) {
  const errors = []
  // Unntatt: nettverksfeil fra den simulerte Supabase (ingen sanntid på wss://test.supabase.co) og stengte skrifttyper
  page.on('console', m => { if (['error', 'warning'].includes(m.type()) && !/Failed to load resource|WebSocket connection to 'wss:\/\/test\.supabase\.co/.test(m.text())) errors.push(m.text().slice(0, 200)) })
  page.on('pageerror', e => errors.push(e.message.slice(0, 200)))
  // Skrifttypene stenges, så bytte av skrift ikke gir layoutskift i målingen
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort())
  // Bare første lasting: skriptet kjører på hver navigering og ville ellers overskrevet et
  // språkbytte brukeren gjør i testen (toggleLang laster siden på nytt). Språket ligger
  // i localStorage og følger likevel med til neste side.
  if (lang) await page.addInitScript(l => { if (localStorage.getItem('hs_lang') === null) localStorage.setItem('hs_lang', l) }, lang)
  await page.addInitScript(() => {
    window.__seo = { removed: 0, visibility: null, h1: null, shift: 0, csp: [] }
    document.addEventListener('securitypolicyviolation', e => window.__seo.csp.push(`${e.violatedDirective} ${e.blockedURI}`))
    new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__seo.shift += e.value }).observe({ type: 'layout-shift', buffered: true })
    document.addEventListener('readystatechange', () => {
      if (document.readyState !== 'interactive') return // HTML-en er lest, appens skript har ikke kjørt
      const root = document.getElementById('root')
      window.__seo.visibility = getComputedStyle(root).visibility
      window.__seo.h1 = root.querySelector('h1')
      window.__seo.prerendered = root.hasAttribute('data-prerendered')
      new MutationObserver(ms => { for (const m of ms) window.__seo.removed += m.removedNodes.length }).observe(root, { childList: true, subtree: true })
    })
  })
  return async () => page.evaluate(() => ({ ...window.__seo, sameH1: window.__seo.h1 === document.querySelector('#root h1'), h1: undefined }))
    .then(s => ({ ...s, errors }))
}
const settle = page => page.waitForTimeout(800)
const noErrors = s => assert(s.errors.length === 0 && s.csp.length === 0, `feil: ${[...s.errors, ...s.csp].join(' | ')}`)
const canonicals = page => page.evaluate(() => [...document.querySelectorAll('link[rel=canonical]')].map(l => l.href))

await check('Uten JavaScript: forsiden viser overskrift, tekst og lenker', async () => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/`)
  assert(await h1Name(page) === H1_NO, `overskriften vises ikke: ${await h1Name(page)}`)
  assert(await page.getByText('Se tingene og hvem som ønsker dem').isVisible(), 'teksten vises ikke')
  // «Kontakt» står både i hovedmenyen og i bunnmenyen
  assert(await page.getByRole('link', { name: 'Kontakt', exact: true }).count() === 2, 'lenken til Kontakt mangler i hovedmenyen eller bunnmenyen')
  for (const [path, h1] of [['/kontakt', 'Hva kan vi hjelpe deg med?'], ['/slik-fungerer-det', 'Slik fordeler dere innbo med Arvklart'], ['/om-oss', 'Teamet bak Arvklart']]) {
    await page.goto(BASE + path)
    assert(await h1Name(page) === h1, `${path} er ikke forhåndsrendret: ${await h1Name(page)}`)
  }
  await ctx.close()
}, { loggedIn: false })

await check('Norsk, ikke innlogget: hydrering uten at noe byttes ut, uten layoutskift og uten feil', async page => {
  const state = await observe(page)
  await page.goto(`${BASE}/`)
  await demoKnapp(page).waitFor()
  await settle(page)
  const s = await state()
  assert(s.prerendered && s.visibility === 'visible', `forhåndsrendret ${s.prerendered}, synlighet ${s.visibility}`)
  assert(s.sameH1, 'overskriften ble byttet ut')
  assert(s.removed === 0, `${s.removed} noder ble fjernet fra #root`)
  assert(s.shift < 0.01, `layoutskift ${s.shift}`)
  noErrors(s)
  assert(JSON.stringify(await canonicals(page)) === JSON.stringify([`${SITE_URL}/`]), `canonical: ${await canonicals(page)}`)
  // Siden er interaktiv: menyen på mobil åpnes (<details>, lukkes med Escape)
  await page.locator('.menu > summary').click()
  assert(await page.locator('.menu').evaluate(e => e.open), 'menyen reagerer ikke')
  await page.keyboard.press('Escape')
  assert(!(await page.locator('.menu').evaluate(e => e.open)), 'menyen lukkes ikke med Escape')
}, { loggedIn: false })

await check('Norsk, ikke innlogget: kontaktsiden hydreres uten feil', async page => {
  const state = await observe(page)
  await page.goto(`${BASE}/kontakt`)
  await settle(page)
  const s = await state()
  assert(s.prerendered && s.sameH1 && s.removed === 0, `byttet ut: ${s.removed}`)
  noErrors(s)
  assert(await page.title() === 'Kontakt | Arvklart', `tittel: ${await page.title()}`)
}, { loggedIn: false })

await check('Engelsk språkvalg, ikke innlogget: forsiden vises på engelsk, uten feil', async page => {
  // Den forhåndsrendrede HTML-en er norsk (det søkemotorene leser). Med engelsk språkvalg hydreres
  // den ikke; appen rendrer siden på engelsk, og den norske teksten er skjult til den er byttet ut.
  const state = await observe(page, { lang: 'en' })
  await page.goto(`${BASE}/`)
  await page.getByRole('heading', { level: 1, name: H1_EN }).waitFor()
  await settle(page)
  const s = await state()
  assert(s.prerendered && s.visibility === 'hidden', `synlighet før appen: ${s.visibility}`)
  assert(await page.locator('#root').evaluate(r => getComputedStyle(r).visibility) === 'visible', 'siden er fortsatt skjult')
  assert(await page.getByText('Fordel arvegjenstandene').count() === 0, 'norsk tekst står igjen')
  noErrors(s)
  assert(await page.title() === 'Sharing out household contents in an inheritance | Arvklart', `tittel: ${await page.title()}`)
  assert(await page.locator('.ak').getAttribute('lang') === 'en', 'innholdet er ikke merket som engelsk')
  // Begge språk ligger på samme adresse: én canonical, ingen hreflang (det finnes ingen språkadresser)
  assert(JSON.stringify(await canonicals(page)) === JSON.stringify([`${SITE_URL}/`]), 'én canonical')
  assert(await page.locator('link[rel=alternate][hreflang]').count() === 0, 'hreflang peker på språkadresser som ikke finnes')
}, { loggedIn: false })

await check('Engelsk: de tre undersidene, språkbytte fra bunnteksten og overgangen til demoen', async page => {
  const state = await observe(page, { lang: 'en' })
  for (const [path, h1, tittel] of [
    ['/slik-fungerer-det', 'How you share out a home with Arvklart', 'How you share out household contents with Arvklart'],
    ['/om-oss', 'The team behind Arvklart', 'About us | Arvklart'],
    ['/kontakt', 'What can we help you with?', 'Contact | Arvklart'],
  ]) {
    await page.goto(BASE + path)
    await page.getByRole('heading', { level: 1, name: h1 }).waitFor()
    assert(await page.title() === tittel, `${path}: tittel ${await page.title()}`)
    assert(await page.locator('.ak').getAttribute('lang') === 'en', `${path}: feil språkmerking`)
    assert(JSON.stringify(await canonicals(page)) === JSON.stringify([SITE_URL + path]), `${path}: ${await canonicals(page)}`)
  }
  // Språkbytte fra bunnteksten: samme side, nå på norsk
  await page.getByRole('link', { name: 'Norsk', exact: true }).click()
  await page.waitForFunction(() => localStorage.getItem('hs_lang') === 'no')
  await page.waitForFunction(() => document.querySelector('.ak')?.lang === 'nb')
  await page.getByRole('heading', { level: 1, name: 'Hva kan vi hjelpe deg med?' }).waitFor()
  assert(new URL(page.url()).pathname === '/kontakt', `språkbytte flyttet siden til ${page.url()}`)
  noErrors(await state())
  // resetLang: false — ellers fjerner oppsettet språkvalget igjen når toggleLang laster siden på nytt,
  // og testen måler bare den forhåndsrendrede norske HTML-en i stedet for selve byttet.
}, { loggedIn: false, resetLang: false })

for (const lang of ['no', 'en']) {
  await check(`Innlogget (${lang}) åpner «/» (bokmerke): forhåndsrendret tekst skjult, rett til appen på /app`, async page => {
    const state = await observe(page, { lang })
    await page.goto(`${BASE}/`)
    await page.waitForURL(`${BASE}/app`)
    await page.getByText('Testbo').first().waitFor()
    await settle(page)
    const s = await state()
    assert(s.prerendered && s.visibility === 'hidden', `synlighet før appen: ${s.visibility}`)
    assert(await page.locator('.ak').count() === 0, 'forsiden vises for en innlogget som åpnet «/» direkte')
    noErrors(s)
    assert((await canonicals(page)).length === 0, 'appen har canonical')
  })
}

await check('Innlogget: «Tilbake til hjemmesiden» viser forsiden, og «Gå til mine bo» går til /app', async page => {
  const state = await observe(page)
  await page.goto(`${BASE}/estate/${EST}`)
  await page.getByText('Testbo').first().waitFor()
  await page.locator('.tb-logo').click()
  await page.getByRole('menuitem', { name: /Tilbake til hjemmesiden/ }).click()
  await page.waitForURL(`${BASE}/`)
  await page.locator('.ak.ak--innlogget').waitFor()
  await page.getByRole('link', { name: 'Gå til mine bo' }).first().click()
  await page.waitForURL(`${BASE}/app`)
  await page.getByText('Testbo').first().waitFor()
  await page.locator('.tb-logo').click()
  await page.getByRole('menuitem', { name: 'Mine bo' }).click()
  await page.waitForURL(`${BASE}/app`)
  noErrors(await state())
})

await check('Gammel adresse /home: permanent til «/» (ikke innlogget: forsiden; innlogget: appen)', async page => {
  const r = await fetch(`${BASE}/home`, { redirect: 'manual' })
  assert(r.status === 308 && r.headers.get('location') === '/', `/home: ${r.status} ${r.headers.get('location')}`)
  await page.goto(`${BASE}/home`)
  await page.waitForURL(`${BASE}/app`)
  await page.getByText('Testbo').first().waitFor()
})

await check('Gammel adresse /home uten innlogging: forsiden på «/»', async page => {
  await page.goto(`${BASE}/home`)
  await page.waitForURL(`${BASE}/`)
  await demoKnapp(page).waitFor()
}, { loggedIn: false })

await check('E-postbekreftelse (#access_token på «/»): forsiden hydreres ikke, brukeren havner i appen', async page => {
  const { session } = await import('./fixtures.mjs')
  await page.route('https://test.supabase.co/auth/v1/user', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(session.user) }))
  const state = await observe(page)
  await page.goto(`${BASE}/#access_token=${session.access_token}&refresh_token=r&expires_in=3600&token_type=bearer&type=signup`)
  await page.waitForURL(`${BASE}/app`)
  await page.getByText('Testbo').first().waitFor()
  const s = await state()
  assert(s.prerendered && s.visibility === 'hidden', `forsiden ble vist før appen: ${s.visibility}`)
  assert(!page.url().includes('access_token'), 'økten står igjen i adressen')
  assert(await page.evaluate(() => Object.keys(localStorage).some(k => /^sb-.+-auth-token$/.test(k))), 'økten ble ikke lagret')
  noErrors(s)
}, { loggedIn: false })

await check('Lenke for nytt passord (#type=recovery på /nytt-passord): skjemaet vises som før', async page => {
  const { session } = await import('./fixtures.mjs')
  await page.route('https://test.supabase.co/auth/v1/user', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(session.user) }))
  await page.goto(`${BASE}/nytt-passord#access_token=${session.access_token}&refresh_token=r&expires_in=3600&token_type=bearer&type=recovery`)
  await page.getByRole('heading', { name: 'Velg nytt passord' }).waitFor()
  assert(new URL(page.url()).pathname === '/nytt-passord', `sendt videre til ${page.url()}`)
}, { loggedIn: false })

await check('Invitasjon uten innlogging: til innlogging, og koden huskes til etter innlogging', async page => {
  await page.goto(`${BASE}/join/ABC123`)
  await page.waitForURL(`${BASE}/logg-inn`)
  await page.getByText(/Du er invitert til et bo/).waitFor()
  assert(await page.evaluate(() => localStorage.getItem('pendingJoinCode')) === 'ABC123', 'invitasjonskoden ble ikke husket')
}, { loggedIn: false })

await check('Innlogging fra forsiden: etter innlogging til appen på /app', async page => {
  const { session } = await import('./fixtures.mjs')
  await page.route('https://test.supabase.co/auth/v1/token**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(session) }))
  await page.goto(`${BASE}/`)
  await (await loggInn(page)).click()
  await page.waitForURL(`${BASE}/logg-inn`)
  await page.locator('input[type=email]').fill('test@test.no')
  await page.locator('input[type=password]').fill('hemmelig')
  await page.locator('input[type=password]').press('Enter')
  await page.waitForURL(`${BASE}/app`)
  await page.getByText('Testbo').first().waitFor()
}, { loggedIn: false })

await check('Demo: «Prøv demo» fra forsiden «/» åpner demo-boet', async page => {
  const demo = sessionFor(DEMO.email, DEMO.meta)
  await page.route('https://test.supabase.co/functions/v1/demo-login', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: demo.access_token, refresh_token: 'r' }) }))
  await page.route('https://test.supabase.co/auth/v1/user', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(demo.user) }))
  const state = await observe(page)
  await page.goto(`${BASE}/`)
  await demoKnapp(page).click()
  await page.waitForURL(`${BASE}/estate/${EST}`)
  await page.getByText(/Du ser på en/).waitFor()
  noErrors(await state())
}, { loggedIn: false })

await check('Innlogging virker som før fra den forhåndsrendrede forsiden', async page => {
  await page.goto(`${BASE}/`)
  await (await loggInn(page)).click()
  await page.waitForURL(`${BASE}/logg-inn`)
  await page.locator('input[type=email]').waitFor()
  assert((await canonicals(page)).length === 0, 'innloggingssiden har canonical')
}, { loggedIn: false })

await check('Direkte lenke til en app-side med økt virker', async page => {
  await page.goto(`${BASE}/estate/${EST}`)
  await page.getByText('Testbo').first().waitFor()
  assert((await canonicals(page)).length === 0, 'app-siden har canonical')
  assert(await page.title() === 'Arvklart — Arvefordeling gjort enklere', `tittel: ${await page.title()}`)
})

await check('Ukjent adresse: HTTP 404 med 404-siden (uten appen), og «Til forsiden» virker', async page => {
  for (const path of ['/finnes-ikke', '/guider/finnes-ikke', '/a/b']) {
    const res = await page.goto(BASE + path)
    assert(res.status() === 404, `${path}: ${res.status()}`)
    await page.getByRole('heading', { name: 'Fant ikke siden' }).waitFor()
    assert(new URL(page.url()).pathname === path, `${path} sendte videre til ${page.url()}`)
  }
  await page.getByRole('link', { name: 'Til forsiden' }).click()
  await page.waitForURL(`${BASE}/`)
  await demoKnapp(page).waitFor()
}, { loggedIn: false })

await check('Ukjent adresse med innlogging: 404-siden, og «Mine bo» går til appen', async page => {
  const res = await page.goto(`${BASE}/finnes-ikke`)
  assert(res.status() === 404, `status ${res.status()}`)
  await page.getByRole('link', { name: 'Mine bo' }).click()
  await page.waitForURL(`${BASE}/app`)
  await page.getByText('Testbo').first().waitFor()
})

await check('Uten innlogging: «/» er forsiden; /app og app-sider ender der, med én canonical', async page => {
  await page.goto(`${BASE}/`)
  await page.locator('h1').waitFor()
  assert(new URL(page.url()).pathname === '/', `«/» sendte videre til ${page.url()}`)
  for (const path of ['/app', `/estate/${EST}`]) {
    await page.goto(BASE + path)
    await page.waitForURL(`${BASE}/`)
    await page.locator('h1').waitFor()
    assert(JSON.stringify(await canonicals(page)) === JSON.stringify([`${SITE_URL}/`]), `${path}: ${await canonicals(page)}`)
  }
}, { loggedIn: false })

await check('Sider som ikke er forhåndsrendret (personvern) får sin canonical og tittel fra pages.js i nettleseren', async page => {
  for (const p of PUBLIC_PAGES.filter(p => !p.prerender)) {
    await page.goto(BASE + p.path)
    await page.waitForFunction(t => document.title === t, p.title)
    assert(JSON.stringify(await canonicals(page)) === JSON.stringify([SITE_URL + p.path]), `${p.path}: ${await canonicals(page)}`)
  }
}, { loggedIn: false })

await browser.close()
console.log(results.join('\n'))
process.exit(results.some(r => r.startsWith('FAIL')) ? 1 : 0)
