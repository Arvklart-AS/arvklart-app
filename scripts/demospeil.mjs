// DEMOSPEILET — den ekte appen med demoens innhold, mot en SIMULERT Supabase.
//
// Til visuell kontroll og til skjermbildene på nettsiden (public/nettsted/), uten å røre produksjonen:
// ingen kall går til Supabase-prosjektet, ingen demo-innlogging kjøres, og demoboet nullstilles ikke.
// Appen startes mot https://test.supabase.co (som e2e-testene), og alle kall fanges i nettleseren.
//
// Innholdet er demoboet slik det står i repoet: gjenstandene og beskrivelsene fra
// supabase/seed/demo_estate.sql, ønskene og begrunnelsene fra reset_demo_estate()
// (supabase/migrations/20261109210000_demo_content_fixes.sql) og bildene i supabase/seed/demo-images/.
// Ti gjenstander, tre arvinger (Mona er administrator og den besøkende; Kari og Lars har svart).
// Avvik fra produksjonsdemoen er mulig hvis noe er endret direkte i databasen; det er ikke kontrollert,
// fordi produksjonen ikke skal leses eller røres herfra.
//
// Bruk:
//   VITE_SUPABASE_URL=https://test.supabase.co VITE_SUPABASE_ANON_KEY=test npx vite --port 5179
//   node scripts/demospeil.mjs [base-url]      # åpner sentrale visninger og lagrer skjermbilder i ./demospeil/
// eller importer demoSetup() i et eget skript.
import { readFileSync, readdirSync, mkdirSync } from 'node:fs'
import { BASE, EST, UID, DEMO, launch, setup } from '../test/e2e/fixtures.mjs'

const MIG = readFileSync(new URL('../supabase/migrations/20261109210000_demo_content_fixes.sql', import.meta.url), 'utf8')
const IMG_DIR = new URL('../supabase/seed/demo-images/', import.meta.url)
const IMAGES = new Set(readdirSync(IMG_DIR).filter(f => f.endsWith('.jpg')))
const wish = (item, who) => MIG.match(new RegExp(`\\('${item}-[0-9a-f-]+'::uuid, '${who}'\\s*,\\s+'([^']+)'\\)`))?.[1] ?? null

const T0 = '2026-11-20T10:00:00.000Z'
const CATS = [
  ['c1', 'Møbler', '🛋️'], ['c2', 'Kunst og bilder', '🖼️'], ['c3', 'Smykker og ur', '💍'],
  ['c4', 'Elektronikk', '📺'], ['c5', 'Kjøkken og porselen', '🍳'], ['c6', 'Minner og arvestykker', '🪆'],
].map(([id, label, emoji]) => ({ id, label, emoji, estate_id: EST }))
const cat = id => CATS.find(c => c.id === id)

// [nøkkel, tittel, beskrivelse, kategori, bildefil|null, verdi, tilstand, hvem som ønsker]
const ITEMS = [
  ['face0001', 'Bestemors gyngestol', 'Gyngestol i mørklakkert tre med dreide spiler. Stoppet sete og rygg i lyst, mønstret stoff, og mørk nakkepute. Stoffet er slitt.', 'c1', 'face0001_gyngestol.jpg', 8500, 'good', ['lars', 'kari']],
  ['face0002', 'Grønn 3-seters sofa', 'Tre-seters sofa i mørkegrønn velur, med to ryggputer, to valseputer og skrå ben i tre.', 'c1', 'face0002.jpg', 24000, 'fair', ['lars']],
  ['face0003', 'Mahognibokhylle fra 1940', 'Stor bokhylle i mahogni med glassdører. Plass til ca. 300 bøker. Tilhørende boksamling medfølger.', 'c1', 'face0003.jpg', 4800, 'good', ['lars']],
  // Verdien som i demoen slik den er vist på nettsiden («ca. 4 000 kr»); seed-filen har et eldre tall
  ['face0004', 'Oljemaleri av blomster', 'Oljemaleri med en stor blomsterbukett i vase mot mørk bakgrunn. Har hengt i stua så lenge barna kan huske.', 'c2', 'face0004.jpg', 4000, 'excellent', ['kari', 'lars']],
  ['face0005', 'Kinesisk porselensvase', 'Blå og hvit porselensvase, antagelig fra Qing-dynastiet (1800-tall). Trolig kopi, men av høy kvalitet.', 'c2', null, 6500, 'excellent', ['kari']],
  ['face0006', 'Gifteringer i gull, 2 stk.', 'To gifteringer i gull.', 'c3', 'face0006.jpg', 45000, 'fair', ['kari']],
  ['face0007', 'Perle- og diamanthalskjede', 'Hvitt gull med 18 søsterperler og diamantlås. Bryllupsgave til Astrid i 1961.', 'c3', null, 18000, 'excellent', []],
  ['face0008', 'Bang & Olufsen musikksystem', 'B&O Beosound stereo fra 2019. Høyttalere + forsterker + CD-spiller. Fungerer perfekt.', 'c4', 'face0008.jpg', 12000, 'good', ['kari', 'lars']],
  ['face0009', 'Middagsservise', 'Middagsservise fra familiens kjøkken. Antall deler og produsent er ikke registrert.', 'c5', null, 3200, 'fair', []],
  ['face0012', 'Familiealbum 1954–1959', 'Familiealbum med bilder fra 1954–1959.', 'c6', 'face0012.jpg', null, 'fair', ['kari', 'lars']],
]
export const itemId = k => `${k}-0000-0000-0000-0000000000${k.slice(-2)}`

// as: 'mona' (administrator, demokontoen) eller 'kari' (arving uten administratorrolle, vanlig konto)
export function demoData(as = 'mona') {
  const id = {
    mona: as === 'mona' ? UID : '11111111-0000-0000-0000-00000000000a',
    kari: as === 'kari' ? UID : '11111111-0000-0000-0000-00000000000b',
    lars: '11111111-0000-0000-0000-00000000000c',
  }
  const people = [
    { user_id: id.mona, display_name: 'Mona Hansen-Dahl', avatar_color: '#7aaa7a', email: 'mona.demo@arvklart.no' },
    { user_id: id.kari, display_name: 'Kari Hansen', avatar_color: '#c4855a', email: 'kari.demo@arvklart.no' },
    { user_id: id.lars, display_name: 'Lars Hansen', avatar_color: '#6b8fa8', email: 'lars.demo@arvklart.no' },
  ]
  const estate = {
    id: EST, name: 'Fam. Hansen sitt bo', owner_id: id.mona, invite_code: 'HANSEN2025', status: 'active', split_mode: 'equal', created_at: T0,
    description: 'Boet etter Astrid og Per Hansen – Bærum, 2025. Hus, innbo og familieklenodier fordeles mellom tre arvinger.',
  }
  const interests = ITEMS.flatMap(([k, , , , , , , who]) => who.map(w => ({
    id: `${k}-${w}`, item_id: itemId(k), user_id: id[w], reason: wish(k, w), created_at: T0,
  })))
  // Kari og Lars har svart på alt (nei takk til resten); Mona, den besøkende, har ikke svart ennå
  const item_passes = ITEMS.flatMap(([k, , , , , , , who]) => ['kari', 'lars'].filter(w => !who.includes(w))
    .map(w => ({ id: `${k}-pass-${w}`, item_id: itemId(k), user_id: id[w], created_at: T0 })))
  const items = ITEMS.map(([k, title, description, c, img, value, condition]) => ({
    id: itemId(k), estate_id: EST, title, description, category_id: c, categories: cat(c), status: 'active', condition,
    image_url: img ? `https://test.supabase.co/storage/v1/object/public/item-images/${EST}/demo__${img}` : null, extra_images: [],
    estimated_value: value == null ? null : String(value), agreed_value: null, added_by: id.mona, added_by_name: 'Demo', created_at: T0,
    interests: interests.filter(x => x.item_id === itemId(k)).map(x => ({ user_id: x.user_id, reason: x.reason })), comments: [],
  }))
  return {
    as, id,
    fixtures: {
      profiles: people, estates: [estate], categories: CATS, items, interests, item_passes,
      estate_members: people.map(p => ({ estate_id: EST, user_id: p.user_id, role: p.user_id === id.mona ? 'admin' : 'member', joined_at: T0, estates: estate, profiles: p })),
      heirs: people.map(p => ({ id: `h-${p.user_id}`, estate_id: EST, name: p.display_name, email: p.email, relationship: 'Barn', percentage: 33.3,
        user_id: p.user_id, receives_items: true, must_approve: true, created_at: T0 })),
      tasks: [], documents: [], comments: [], estate_events: [], distribution_versions: [], heir_representatives: [], value_suggestions: [],
    },
  }
}

// Åpner en side som Mona (demokontoen, med demobanneret) eller Kari (arving). Bildene serveres fra repoet.
// patch(data): endre innholdet før siden åpnes (en tilstand et skjermbilde trenger). scale: 2 gir skarpe bilder.
export async function demoSetup(browser, { as = 'mona', viewport = { width: 1440, height: 900 }, rpc = {}, patch = null, scale = 1 } = {}) {
  const d = demoData(as)
  if (patch) patch(d)
  const login = as === 'mona' ? { ...DEMO } : { email: 'kari.demo@arvklart.no' }
  const { ctx, page, calls } = await setup(browser, { viewport, deviceScaleFactor: scale, fixtures: d.fixtures, rpc, ...login })
  // Signerte bilde-URL-er: svaret peker tilbake hit, og bildet leses fra supabase/seed/demo-images/
  await page.route('https://test.supabase.co/storage/v1/object/sign/**', async route => {
    const req = route.request()
    if (req.method() === 'POST') {
      const { paths = [] } = JSON.parse(req.postData() || '{}')
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(paths.map(p => ({ path: p, signedURL: `/object/sign/item-images/${p}?token=demospeil`, error: null }))) })
    }
    const file = decodeURIComponent(new URL(req.url()).pathname.split('/').pop()).replace(/^demo__/, '')
    if (!IMAGES.has(file)) return route.fulfill({ status: 404, body: '' })
    return route.fulfill({ contentType: 'image/jpeg', body: readFileSync(new URL(file, IMG_DIR)) })
  })
  return { ctx, page, calls, data: d }
}

// Kjørt direkte: skjermbilder av de sentrale visningene, som administrator og som arving, PC og mobil.
if (import.meta.url === `file://${process.argv[1]}`) {
  const base = process.argv[2] || BASE
  const out = process.argv[3] || 'demospeil'
  mkdirSync(out, { recursive: true })
  const browser = await launch()
  const VIEWS = [
    ['oversikt', `/estate/${EST}`], ['gjenstander', `/estate/${EST}/gjenstander`], ['maleri', `/estate/${EST}/item/${itemId('face0004')}`],
    ['ta-stilling', `/estate/${EST}/swipe`], ['legg-til', `/estate/${EST}/add`], ['losning', `/estate/${EST}/conflicts`],
    ['fordeling', `/estate/${EST}/fordeling`], ['arvinger', `/estate/${EST}/heirs`], ['ingen-vil-ha', `/estate/${EST}/ingen-vil-ha`],
    ['mine-bo', '/app'],
  ]
  for (const as of ['mona', 'kari']) for (const [vn, viewport] of [['pc', { width: 1440, height: 900 }], ['mobil', { width: 390, height: 844 }]]) {
    const { ctx, page } = await demoSetup(browser, { as, viewport })
    const errs = []
    page.on('pageerror', e => errs.push(e.message))
    for (const [name, path] of VIEWS) {
      await page.goto(base + path, { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await page.screenshot({ path: `${out}/${as}-${vn}-${name}.png`, fullPage: true })
    }
    console.log(`${as} ${vn}: ${VIEWS.length} visninger${errs.length ? `, JS-feil: ${errs.join(' | ')}` : ''}`)
    await ctx.close()
  }
  await browser.close()
}
