// Akseptansetester for «Sammenlign med markedet» på gjenstandssiden (M1): søkelenker, familiens egne
// sammenligninger og verdianslaget fra estimate-value, i Chromium med simulert Supabase. Kjøres av test/e2e/run.sh.
import { BASE, EST, UID, ITEM, FIXTURES, launch, checker, assert } from './fixtures.mjs'
import { METAL_PRICES } from '../../src/lib/metalPrices.js'
import { metalValue } from '../../src/lib/metalValue.js'

const browser = await launch()
const results = []
const check = checker(browser, results)

const ref = (n, price) => ({ id: `r${n}`, title: `Gyngestol eik ${n}`, price, price_type: 'sold_price', url: `https://www.finn.no/${n}`, date: '2026-09-1' + n, by: UID, at: '2026-10-01T00:00:00Z' })
const withRefs = refs => ({ fixtures: { items: [{ ...FIXTURES.items[0], ai_analysis: { v: 2, meta: {}, ai: null, review: {}, corrections: { references: refs }, valuation: null } }] } })
const patches = page => {
  const bodies = []
  page.on('request', r => { if (r.method() === 'PATCH' && r.url().includes('/rest/v1/items')) bodies.push(JSON.parse(r.postData() || '{}')) })
  return bodies
}
const open = async page => {
  await page.goto(`${BASE}/estate/${EST}/item/${ITEM}`)
  await page.getByText('Sammenlign med markedet').click()
}

await check('Søkelenker til FINN og Tradera ut fra navnet, åpnes i ny fane', async page => {
  await open(page)
  const finn = page.getByRole('link', { name: /Søk på FINN/ })
  assert(await finn.getAttribute('href') === 'https://www.finn.no/recommerce/forsale/search?q=Gyngestol', `feil FINN-lenke: ${await finn.getAttribute('href')}`)
  assert(await finn.getAttribute('target') === '_blank', 'åpnes ikke i ny fane')
  await page.getByRole('link', { name: /Søk på Tradera/ }).waitFor()
})

await check('Legg til en sammenligning: lagres i ai_analysis.corrections.references, også uten AI-analyse; ugyldig pris gir melding', async page => {
  const sent = patches(page)
  await open(page)
  await page.getByRole('button', { name: 'Legg til en sammenligning' }).click()
  await page.getByLabel('Hva er det?').fill('Gyngestol i eik, FINN')
  await page.getByLabel('Pris i kroner').fill('null')
  await page.getByRole('button', { name: 'Lagre sammenligningen' }).click()
  await page.getByRole('alert').getByText(/Skriv prisen i kroner/).waitFor()
  assert(sent.length === 0, 'lagret med ugyldig pris')
  await page.getByLabel('Pris i kroner').fill('1 200')
  await page.getByLabel('Lenke (valgfri)').fill('https://www.finn.no/recommerce/forsale/item/1')
  await page.getByRole('button', { name: 'Lagre sammenligningen' }).click()
  await page.getByText('Sammenligningen er lagt til').waitFor()
  const refs = sent[0]?.ai_analysis?.corrections?.references
  assert(refs?.length === 1, 'sammenligningen ble ikke sendt')
  assert(refs[0].price === 1200 && refs[0].price_type === 'sold_price' && refs[0].by === UID && refs[0].url.endsWith('/item/1'), `feil innhold: ${JSON.stringify(refs[0])}`)
  assert(sent[0].ai_analysis.ai === null, 'gjenstanden uten analyse fikk et AI-forslag')
})

await check('Anslå verdi med tre sammenligninger: markedsbasert, spenn i treff, og «Bruk som verdi» lagrer verdi og anslag', async page => {
  const sent = patches(page)
  await page.route('https://test.supabase.co/functions/v1/estimate-value', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {
    v: 3, status: 'ok', method: 'market_sold', price_type: 'sold_price', range_kind: 'hits', market_area: 'NO', currency: 'NOK',
    estimate: { low: 900, likely: 1200, high: 1500 }, confidence: 'medium', uncertainty: { widened: false, reasons: ['family_reported'] },
    stats: { n_used: 3 }, explanation: 'Basert på 3 salgspriser oppgitt av familien. Spenn i 3 treff: 900 kr–1 500 kr, median 1 200 kr.',
    references: [], queries: ['Gyngestol'], links: [], summary: { low_nok: 900, likely_nok: 1200, high_nok: 1500 },
  } }) }))
  await page.addInitScript(() => localStorage.setItem('aiConsented', 'true'))
  await open(page)
  await page.getByText('Gyngestol eik 1').waitFor()
  await page.getByRole('button', { name: 'Anslå verdi' }).click()
  await page.getByText('Anslag ut fra priser familien har oppgitt (ikke bekreftet av en kilde)').waitFor()
  await page.getByText(/Spenn i 3 treff/).first().waitFor()
  await page.getByText(/Basert på 3 salgspriser oppgitt av familien/).waitFor()
  await page.getByRole('button', { name: /^Bruk .*1\s?200.* som verdi$/ }).click()
  await page.getByText('Verdien er lagret').waitFor()
  const b = sent[0]
  assert(b.estimated_value === 1200 && b.estimate_confidence === 'medium', `feil verdi: ${JSON.stringify(b)}`)
  assert(b.ai_analysis.valuation.method === 'market_sold' && b.ai_analysis.valuation.range_kind === 'hits', 'anslaget ble ikke lagret i ai_analysis.valuation')
  assert(b.ai_analysis.corrections.references.length === 3, 'sammenligningene forsvant')
}, withRefs([ref(1, 900), ref(2, 1200), ref(3, 1500)]))

await check('Arving på andres gjenstand: ser sammenligningene og søkelenkene, men kan ikke endre eller anslå', async page => {
  await open(page)
  await page.getByText('Gyngestol eik 1').waitFor()
  for (const name of ['Legg til en sammenligning', 'Anslå verdi', 'Fjern «Gyngestol eik 1»']) assert(await page.getByRole('button', { name }).count() === 0, `«${name}» vises`)
}, { fixtures: { ...withRefs([ref(1, 900)]).fixtures, items: [{ ...withRefs([ref(1, 900)]).fixtures.items[0], added_by: 'annen' }],
  estate_members: [{ ...FIXTURES.estate_members[0], role: 'member' }] } })

await check('AI-gjetning på kunst: «få den vurdert» i stedet for et tall, ingen «Bruk som verdi», og veien til en solgt pris', async page => {
  const sent = patches(page)
  await page.route('https://test.supabase.co/functions/v1/estimate-value', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {
    v: 3, status: 'ok', method: 'model', price_type: 'estimated_price', market_area: 'NO', currency: 'NOK',
    estimate: { low: 3000, likely: 8000, high: 25000 }, confidence: 'low', uncertainty: { widened: true, reasons: ['not_identified'] },
    basis: { used_analysis: true, identified: [], specificity: 'generic', category_key: 'art' },
    reasoning: 'Usignert oljemaleri.', references: [], queries: ['Oljemaleri'], links: [], summary: { low_nok: 3000, likely_nok: 8000, high_nok: 25000 },
  } }) }))
  await page.addInitScript(() => localStorage.setItem('aiConsented', 'true'))
  await open(page)
  await page.getByRole('button', { name: /Anslå verdi/ }).click()
  await page.getByText('Kan ha reell verdi – få den vurdert').waitFor()
  assert(await page.getByRole('button', { name: /som verdi$/ }).count() === 0, '«Bruk som verdi» vises')
  assert(await page.getByText(/8\s?000/).count() === 0, 'beløpet vises')
  await page.getByRole('button', { name: 'Legg inn en solgt pris' }).click()
  await page.getByLabel('Hva er det?').waitFor()
  assert(sent.length === 0, 'noe ble lagret')
})

await check('Spennet er hovedtallet: AI-anslag på vanlig innbo vises som «fra–til»', async page => {
  await page.route('https://test.supabase.co/functions/v1/estimate-value', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {
    v: 3, status: 'ok', method: 'model', price_type: 'estimated_price', market_area: 'NO', currency: 'NOK',
    estimate: { low: 400, likely: 700, high: 1100 }, confidence: 'medium', uncertainty: { widened: false, reasons: [] },
    basis: { used_analysis: true, identified: [], specificity: 'generic', category_key: 'furniture' },
    reasoning: 'Brukt gyngestol.', references: [], queries: ['Gyngestol'], links: [], summary: { low_nok: 400, likely_nok: 700, high_nok: 1100 },
  } }) }))
  await page.addInitScript(() => localStorage.setItem('aiConsented', 'true'))
  await open(page)
  await page.getByRole('button', { name: /Anslå verdi/ }).click()
  await page.getByText(/400.*–.*1\s?100/).first().waitFor()
  await page.getByText('Sannsynlig spenn', { exact: false }).waitFor()
  assert(await page.getByText(/sikkerhet/i).count() === 0, '«sikkerhet» vises fortsatt')
})

// Sølja fra kalibreringen: bildeanalysen sa «Sølv, oksidert»
const brooch = { v: 2, meta: {}, review: {}, corrections: {}, valuation: null, ai: {
  suggestion: { title: 'Sølje', description: 'Bunadsølje.', category: null, category_key: 'jewelry_watches', confidence: 'medium' },
  identification: { object_type: { value: 'Sølje', basis: 'observed', evidence: '' }, brand: { value: 'Sylvsmidja', basis: 'probable', evidence: '' }, manufacturer: null, model: null, variant: null,
    material: { value: 'Sølv, oksidert', basis: 'probable', evidence: '' }, colour: null, period: null, designer_or_artist: null, model_number: null },
  unknown: [], marks: [], size_class: 'small', condition_suggestion: 'good', condition_observations: [], condition_not_visible: [], condition_confidence: 'low',
  multiple_items: { detected: false, count: null, note: null }, photo_suggestions: [], search_query: 'Sylvsmidja sølje',
} }

await check('Kan være sølv: spørsmålet om stempel på gjenstandssiden, og svaret lagres som familiens rettelse', async page => {
  const sent = patches(page)
  await open(page)
  await page.getByRole('heading', { name: 'Er det ekte sølv?' }).waitFor()
  await page.getByRole('button', { name: 'Forsølvet eller plett' }).click()
  for (let i = 0; i < 50 && !sent.length; i++) await page.waitForTimeout(100)
  assert(sent[0]?.ai_analysis?.corrections?.material?.value === 'Forsølvet (plett)', `feil rettelse: ${JSON.stringify(sent[0])}`)
  assert(sent[0].ai_analysis.ai.identification.material.value === 'Sølv, oksidert', 'AI-forslaget ble endret')
}, { fixtures: { items: [{ ...FIXTURES.items[0], ai_analysis: brooch }] } })

// Metallverdien når familien har oppgitt stempel og vekt (src/lib/metalValue.js), med prisen som ligger i repoet.
// Er prisen eldre enn 30 dager, settes klokken tilbake til dagen etter prisdatoen, så testen ikke blir rød når prisen
// blir for gammel til å vises. Aldri fram i tid: innloggingen i testoppsettet går ut etter en time.
const priceClock = page => {
  const at = METAL_PRICES.date ? Date.parse(`${METAL_PRICES.date}T12:00:00Z`) + 86_400_000 : null
  return at && Date.now() - at > 30 * 86_400_000 ? page.clock.setFixedTime(at) : null
}
const answeredBrooch = { ...brooch, corrections: { material: { value: 'Sølv 830S, 166 g', by: UID, at: '2026-11-21T00:00:00Z' } } }
await check('Metallverdi: «Ca. … i metall» med dato og lenken til MetalCharts når stempel og vekt er oppgitt, for alle i boet', async page => {
  await priceClock(page)
  await open(page)
  await page.getByRole('link', { name: /Søk på FINN/ }).waitFor()
  assert(await page.getByRole('heading', { name: 'Er det ekte sølv?' }).count() === 0, 'spørsmålet vises etter svar')
  const note = page.getByRole('heading', { name: /i metall$/ })
  if (!METAL_PRICES.date) return assert(await note.count() === 0, 'metallverdi uten pris')
  await note.waitFor()
  const expected = metalValue(answeredBrooch, { today: new Date(`${METAL_PRICES.date}T12:00:00Z`) }).value
  const shown = Number((await note.textContent()).replace(/\D/g, ''))
  assert(shown === expected, `viser ${shown}, ventet ${expected}`)
  const link = page.getByRole('link', { name: /Metallpriser fra MetalCharts/ })
  assert(await link.getAttribute('href') === 'https://metalcharts.org', 'mangler kildelenken')
}, { fixtures: { items: [{ ...FIXTURES.items[0], ai_analysis: answeredBrooch }], estate_members: [{ ...FIXTURES.estate_members[0], role: 'member' }] } })

await check('Metallverdi: vises ikke når vekten mangler', async page => {
  await priceClock(page)
  await open(page)
  await page.getByRole('link', { name: /Søk på FINN/ }).waitFor()
  assert(await page.getByRole('heading', { name: /i metall$/ }).count() === 0, 'metallverdi uten vekt')
}, { fixtures: { items: [{ ...FIXTURES.items[0], ai_analysis: { ...brooch, corrections: { material: { value: 'Sølv 830S', by: UID, at: '2026-11-21T00:00:00Z' } } } }] } })

// Uten AI-tall (sølv, kunst, smykker) kan arvingene likevel foreslå en verdi; sølja fra kalibreringen
const votes = page => {
  const bodies = []
  page.on('request', r => { if (r.url().includes('/rest/v1/rpc/vote_item_value')) bodies.push(JSON.parse(r.postData() || '{}')) })
  return bodies
}
const noValue = analysis => ({ fixtures: { items: [{ ...FIXTURES.items[0], estimated_value: null, ai_analysis: analysis }], estate_members: [{ ...FIXTURES.estate_members[0], role: 'member' }] },
  rpc: { vote_item_value: { status: 200, body: { ok: true } } } })

await check('Hva er den verdt?: arvingen kan foreslå en verdi på sølv uten AI-tall; tomt beløp sender ingenting', async page => {
  const sent = votes(page)
  await page.goto(`${BASE}/estate/${EST}/item/${ITEM}`)
  await page.getByRole('heading', { name: 'Hva er den verdt?' }).waitFor()
  await page.getByRole('button', { name: 'Foreslå verdi' }).click()
  await page.getByText('Skriv forslaget som et beløp', { exact: false }).waitFor()
  assert(sent.length === 0, 'tomt forslag ble sendt')
  await page.getByLabel('Ditt forslag i kroner').fill('3 900')
  await page.getByRole('button', { name: 'Foreslå verdi' }).click()
  await page.getByText('Forslaget ditt er registrert').waitFor()
  assert(sent[0]?.p_vote === 'disagree' && sent[0]?.p_value === 3900, `feil forslag: ${JSON.stringify(sent[0])}`)
}, noValue(brooch))

await check('Hva er den verdt?: vises ikke for vanlig innbo uten AI-tall', async page => {
  await page.goto(`${BASE}/estate/${EST}/item/${ITEM}`)
  await page.getByText('Gyngestol').first().waitFor()
  assert(await page.getByRole('heading', { name: 'Hva er den verdt?' }).count() === 0, 'boksen vises for vanlig innbo')
}, noValue({ ...brooch, ai: { ...brooch.ai, suggestion: { ...brooch.ai.suggestion, category_key: 'furniture' }, identification: { ...brooch.ai.identification, brand: null, material: { value: 'Eik', basis: 'probable', evidence: '' } } } }))

await browser.close()
console.log(results.join('\n'))
process.exit(results.some(r => r.startsWith('FAIL')) ? 1 : 0)
