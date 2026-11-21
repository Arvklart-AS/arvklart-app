// Familiens egne sammenligninger (src/lib/marketRefs.js): validering, lagring i ai_analysis og søkefrasen.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { emptyRecord, familyReferences, marketQuery, parseListingUrl, searchLinks, withReference, withoutReference, MAX_REFERENCES } from '../../src/lib/marketRefs.js'

const AT = '2026-10-09T12:00:00.000Z'
const ok = { title: ' Figgjo Lotte, FINN ', price: '1 200 kr', price_type: 'sold_price', url: 'https://www.finn.no/1', date: '2026-09-14' }

describe('sammenligninger', () => {
  test('gyldig sammenligning legges til med hvem og når, også på en gjenstand uten analyse', () => {
    const { record } = withReference(null, ok, 'u1', { at: AT, id: 'r1' })
    assert.equal(record.ai, null)
    assert.deepEqual(familyReferences(record), [{ id: 'r1', title: 'Figgjo Lotte, FINN', price: 1200, price_type: 'sold_price', url: 'https://www.finn.no/1', date: '2026-09-14', by: 'u1', at: AT }])
  })
  test('rettelser og AI-forslag beholdes; lenke og dato er valgfrie', () => {
    const before = { ...emptyRecord(), ai: { identification: {} }, corrections: { brand: { value: 'Figgjo' } } }
    const { record } = withReference(before, { ...ok, url: '', date: '' }, 'u1', { at: AT, id: 'r2' })
    assert.equal(record.corrections.brand.value, 'Figgjo')
    assert.equal(record.ai, before.ai)
    assert.equal(familyReferences(record)[0].url, null)
    assert.equal(familyReferences(record)[0].date, null)
  })
  test('manglende tittel, pris 0 eller tekst, ukjent type, rar lenke og for mange gir en melding', () => {
    for (const bad of [{ title: '', url: '' }, { price: '0' }, { price: 'mye' }, { price_type: 'estimate' }, { url: 'javascript:alert(1)' }, { date: '14.09.2026' }])
      assert.ok(withReference(null, { ...ok, ...bad }, 'u1').error, JSON.stringify(bad))
    let rec = null
    for (let i = 0; i < MAX_REFERENCES; i++) rec = withReference(rec, { ...ok, url: `https://www.finn.no/recommerce/forsale/item/10000${i}` }, 'u1', { id: `r${i}` }).record
    assert.equal(familyReferences(rec).length, MAX_REFERENCES)
    assert.ok(withReference(rec, { ...ok, url: '' }, 'u1').error)
  })
  test('fjerning tar bare den ene', () => {
    let rec = withReference(null, ok, 'u1', { id: 'a' }).record
    rec = withReference(rec, { ...ok, url: 'https://www.finn.no/recommerce/forsale/item/222222' }, 'u1', { id: 'b' }).record
    assert.deepEqual(familyReferences(withoutReference(rec, 'a')).map(r => r.id), ['b'])
  })
})

describe('lenker limt inn (leses som tekst, åpnes aldri)', () => {
  test('FINN: annonsenummeret fra de vanlige formene, uten sporing og #', () => {
    const cases = [
      ['https://www.finn.no/recommerce/forsale/item/446017411', 'https://www.finn.no/recommerce/forsale/item/446017411'],
      ['Se denne: https://www.finn.no/recommerce/forsale/item/446017411?utm_source=app&utm_medium=share#bilder.', 'https://www.finn.no/recommerce/forsale/item/446017411'],
      ['https://m.finn.no/bap/forsale/ad.html?finnkode=123456789&fbclid=abc', 'https://m.finn.no/bap/forsale/ad.html?finnkode=123456789'],
      ['https://www.finn.no/446017411', 'https://www.finn.no/446017411'],
    ]
    for (const [text, url] of cases) {
      const r = parseListingUrl(text)
      assert.equal(r.provider, 'finn', text)
      assert.equal(r.url, url, text)
      assert.match(r.label, /^FINN-annonse \d+$/, text)
    }
  })
  test('Tradera og andre sider', () => {
    assert.deepEqual(parseListingUrl('https://www.tradera.com/item/341/612345678/solvskje'), { url: 'https://www.tradera.com/item/341/612345678/solvskje', provider: 'tradera', code: '612345678', label: 'Tradera-annonse 612345678' })
    assert.deepEqual(parseListingUrl('https://www.blomqvist.no/auksjon/1?gclid=x'), { url: 'https://www.blomqvist.no/auksjon/1', provider: 'other', code: null, label: 'blomqvist.no' })
  })
  test('ikke en lenke: null', () => {
    for (const t of ['', 'javascript:alert(1)', 'data:text/html,x', 'finn.no/446017411', 'ftp://finn.no/1', null]) assert.equal(parseListingUrl(t), null, String(t))
  })
  test('uten tittel brukes annonsenummeret, og lenken lagres uten sporing', () => {
    const { record } = withReference(null, { title: '', price: '2000', price_type: 'sold_price', url: 'Se denne: https://www.finn.no/recommerce/forsale/item/446017411?utm_source=x' }, 'u1', { at: AT, id: 'r1' })
    const [ref] = familyReferences(record)
    assert.equal(ref.title, 'FINN-annonse 446017411')
    assert.equal(ref.url, 'https://www.finn.no/recommerce/forsale/item/446017411')
  })
  test('samme annonse to ganger avvises, også med en annen form av lenken', () => {
    const rec = withReference(null, { ...ok, url: 'https://www.finn.no/recommerce/forsale/item/446017411' }, 'u1', { id: 'a' }).record
    for (const url of ['https://www.finn.no/recommerce/forsale/item/446017411?utm_source=x', 'https://m.finn.no/bap/forsale/ad.html?finnkode=446017411'])
      assert.match(withReference(rec, { ...ok, url }, 'u1').error, /allerede lagt inn/, url)
    assert.ok(withReference(rec, { ...ok, url: 'https://www.finn.no/recommerce/forsale/item/999999' }, 'u1').record, 'en annen annonse')
  })
})

describe('søkefrase og lenker', () => {
  const F = (value, basis = 'observed') => ({ value, basis, evidence: '' })
  test('merke og modell (med familiens rettelser) og type; ellers AI-ens søkefrase; ellers navnet', () => {
    const rec = { ai: { search_query: 'blå tallerken', identification: { brand: F('Figgjo'), model: F('Lotte', 'probable'), object_type: F('Tallerken') } }, corrections: { model: { value: 'Market' } } }
    assert.equal(marketQuery(rec), 'Figgjo Market Tallerken')
    assert.equal(marketQuery({ ai: { search_query: 'blå tallerken', identification: {} } }, 'Tallerken'), 'blå tallerken')
    assert.equal(marketQuery(null, 'Gyngestol'), 'Gyngestol')
  })
  test('lenkene går til søk på FINN og Tradera', () => {
    assert.deepEqual(searchLinks('Figgjo Lotte').map(l => l.url), ['https://www.finn.no/recommerce/forsale/search?q=Figgjo%20Lotte', 'https://www.tradera.com/search?q=Figgjo%20Lotte'])
    assert.deepEqual(searchLinks(''), [])
  })
})
