// Akseptansetester for fanen «Sletting (GDPR)» i founder-dashboardet (/founder): status, sletteloggen, avsluttede
// bo, søk og sletting via dialogen, og meldingen når edge-funksjonen founder-delete ikke er rullet ut. I Chromium med
// simulert Supabase (founder med tofaktor). Kjøres av test/e2e/run.sh.
import { BASE, UID, launch, checker, assert } from './fixtures.mjs'

const browser = await launch()
const results = []
const check = checker(browser, results)

const E1 = 'e1000000-0000-0000-0000-000000000001'
const E2 = 'e2000000-0000-0000-0000-000000000002'
const K1 = 'a1000000-0000-0000-0000-000000000001'
const now = new Date().toISOString()
const dashboard = {
  profiles: [
    { id: 1, user_id: UID, display_name: 'Founder Test', email: 'test@test.no', plan: 'free', created_at: now },
    { id: 2, user_id: K1, display_name: 'Kari Nordmann', email: 'kari@test.no', plan: 'free', created_at: now },
  ],
  estates: [
    { id: E1, name: 'Dødsbo etter Ragnhild', owner_id: K1, status: 'active', created_at: now, item_count: 4, profiles: { display_name: 'Kari Nordmann', email: 'kari@test.no' } },
    { id: E2, name: 'Bo Olsen', owner_id: K1, status: 'closed', created_at: now, item_count: 2, profiles: { display_name: 'Kari Nordmann', email: 'kari@test.no' } },
  ],
  feedback: [],
  item_count: 6,
}
const founderOpts = {
  meta: { aal: 'aal2', amr: [{ method: 'totp', timestamp: Math.floor(Date.now() / 1000) }] },
  rpc: { am_i_founder: { body: true }, founder_dashboard: { body: dashboard } },
  viewport: { width: 1100, height: 900 },
}

// Simulert founder-delete: { action: 'overview' }, dry run og sletting. bodies samler alle kall.
const fakeFunction = async (page, { deployed = true } = {}) => {
  const bodies = []
  const log = [
    { id: 'l2', created_at: '2026-11-20T10:00:00Z', kind: 'user', founder_id: UID, target_id: K1, status: 'failed', counts: { estates_deleted: 1, estates_kept: 0 } },
    { id: 'l1', created_at: '2026-11-02T10:00:00Z', kind: 'estate', founder_id: 'f9999999-0000-0000-0000-000000000000', target_id: 'e9999999-0000-0000-0000-000000000000', status: 'ok', counts: { items: 3, members: 2, files: { images: 5, documents: 1 } } },
  ]
  await page.route('https://test.supabase.co/functions/v1/founder-delete', async route => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 200, body: 'ok' })
    const body = JSON.parse(route.request().postData() || '{}')
    bodies.push(body)
    const reply = (b, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(b) })
    if (!deployed) return reply({ code: 'NOT_FOUND', message: 'Requested function was not found' }, 404)
    if (body.action === 'overview') return reply({ success: true, log, closed_estates: [{ id: E2, name: 'Bo Olsen', closed_at: '2025-08-01T00:00:00Z' }], retention_months: null })
    if (body.dry_run) return reply({ success: true, dry_run: true, kind: body.kind, confirm_with: 'Dødsbo etter Ragnhild', counts: { members: 1, heirs: 1, items: 4, documents: 0, feedback: 0, files: { images: 4, documents: 0 } } })
    if (body.confirm !== 'Dødsbo etter Ragnhild') return reply({ success: false, code: 'confirm_mismatch' }, 400)
    log.unshift({ id: 'l3', created_at: new Date().toISOString(), kind: 'estate', founder_id: UID, target_id: E1, status: 'ok', counts: { items: 4, members: 1, files: { images: 4, documents: 0 } } })
    return reply({ success: true, kind: 'estate' })
  })
  return bodies
}
const openTab = async page => {
  await page.goto(`${BASE}/founder`)
  await page.getByRole('button', { name: 'Sletting (GDPR)' }).click()
}

await check('Fanen viser status, sletteloggen, avsluttede bo og forslaget til lagringstider', async page => {
  await fakeFunction(page)
  await openTab(page)
  await page.getByText('Klar', { exact: true }).waitFor()
  await page.getByText('Ikke i drift', { exact: true }).waitFor()
  await page.getByText(/1 ikke fullført/).waitFor()
  const log = page.getByRole('region', { name: 'Slettelogg' })
  await log.getByText('Fullført').waitFor()
  await log.getByText('Feilet').waitFor()
  await log.getByText('Founder Test').waitFor()
  await log.getByText('Tidligere founder').waitFor()
  await log.getByText(/3 gjenstander · 6 filer · 2 medlemmer/).waitFor()
  // Den feilede kontoslettingen kan prøves igjen, fordi kontoen fortsatt finnes
  assert(await log.getByRole('button', { name: 'Prøv igjen …' }).count() === 1, 'mangler «Prøv igjen» på den feilede slettingen')
  const closed = page.getByRole('region', { name: 'Avsluttede bo' })
  await closed.getByText('Bo Olsen').waitFor()
  await closed.getByText(/måneder siden/).waitFor()
  await page.getByText('Forslag, ikke vedtatt').waitFor()
  await page.screenshot({ path: process.env.SHOT_DIR ? `${process.env.SHOT_DIR}/founder-gdpr.png` : '/dev/null', fullPage: true }).catch(() => {})
}, founderOpts)

await check('Søk opp et bo og slett det: dry run, bekreftelse med navnet, loggen hentes på nytt', async page => {
  const bodies = await fakeFunction(page)
  await openTab(page)
  await page.getByText('Klar', { exact: true }).waitFor()
  await page.getByLabel('Søk etter bo, navn eller e-post').fill('dodsbo')
  await page.getByRole('button', { name: 'Slett boet Dødsbo etter Ragnhild' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByText('Gjenstander').waitFor()
  const del = dialog.getByRole('button', { name: 'Slett for godt' })
  assert(await del.isDisabled(), 'slett-knappen er aktiv før navnet er skrevet')
  await dialog.getByRole('textbox').fill('Dødsbo etter Ragnhild')
  await del.click()
  await dialog.waitFor({ state: 'detached' })
  await page.getByRole('region', { name: 'Slettelogg' }).getByText('Fullført').nth(1).waitFor()
  assert(bodies.filter(b => b.action === 'overview').length === 2, 'loggen ble ikke hentet på nytt etter slettingen')
  assert(bodies.some(b => b.dry_run && b.id === E1) && bodies.some(b => b.confirm === 'Dødsbo etter Ragnhild' && b.id === E1), `feil kall: ${JSON.stringify(bodies)}`)
}, founderOpts)

await check('Ikke rullet ut: fanen sier det og viser kommandoen; dialogen sletter ingenting', async page => {
  const bodies = await fakeFunction(page, { deployed: false })
  await openTab(page)
  await page.getByText('Ikke rullet ut', { exact: true }).waitFor()
  await page.getByText('supabase functions deploy founder-delete --no-verify-jwt --use-api').waitFor()
  await page.getByText('Loggen vises når slettefunksjonen svarer.').waitFor()
  await page.getByLabel('Søk etter bo, navn eller e-post').fill('kari')
  await page.getByRole('button', { name: 'Slett kontoen til Kari Nordmann' }).click()
  await page.getByRole('dialog').getByRole('alert').getByText(/ikke rullet ut/).waitFor()
  assert(!bodies.some(b => b.confirm), 'sendte sletting')
}, founderOpts)

await check('Mobil: fanen gir ingen horisontal scrolling av siden', async page => {
  await fakeFunction(page)
  await openTab(page)
  await page.getByRole('region', { name: 'Slettelogg' }).getByText('Feilet').waitFor()
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  assert(over <= 0, `siden er ${over}px for bred`)
}, { ...founderOpts, viewport: { width: 390, height: 844 } })

await browser.close()
console.log(results.join('\n'))
if (results.some(r => r.startsWith('FAIL'))) process.exit(1)
