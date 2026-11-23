// Metallverdien ut fra familiens svar på «Er det ekte sølv?» (src/lib/metalValue.js), og skriptet som henter
// prisen (scripts/metal-price.mjs).
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { parseMetal, metalValue, MAX_PRICE_AGE_DAYS } from '../../src/lib/metalValue.js'
import { METAL_PRICES } from '../../src/lib/metalPrices.js'
import { pricesFrom, fileContent } from '../../scripts/metal-price.mjs'

const prices = { date: '2026-11-20', currency: 'NOK', unit: 'g', silver: 10, gold: 1000 }
const today = new Date('2026-11-23T12:00:00Z')
const answered = value => ({ v: 2, ai: null, corrections: { material: { value, by: 'u1', at: '2026-11-21T00:00:00Z' } } })

describe('parseMetal: tekstene MetalQuestion lagrer, og det folk skriver selv', () => {
  test('sølv med stempel og vekt', () => {
    assert.deepEqual(parseMetal('Sølv 830S, 166 g'), { kind: 'silver', fineness: 830, grams: 166 })
    assert.deepEqual(parseMetal('Silver 925S, 100 g'), { kind: 'silver', fineness: 925, grams: 100 })
    assert.deepEqual(parseMetal('Sterling sølv, 250 gram'), { kind: 'silver', fineness: 925, grams: 250 })
  })
  test('gull i karat og tusendeler, desimalvekt med komma', () => {
    assert.deepEqual(parseMetal('Gull 18K, 5,5 g'), { kind: 'gold', fineness: 750, grams: 5.5 })
    assert.deepEqual(parseMetal('Gull 585, 3.2 g'), { kind: 'gold', fineness: 585, grams: 3.2 })
    assert.deepEqual(parseMetal('14 karat gull'), { kind: 'gold', fineness: 585, grams: null })
  })
  test('vekten leses ikke som finhet', () => {
    assert.deepEqual(parseMetal('Sølv med stempel, 925 g'), { kind: 'silver', fineness: null, grams: 925 })
  })
  test('ikke ekte metall, eller familien vet ikke: ingenting', () => {
    for (const t of ['Forsølvet (plett)', 'Forgylt', 'Ukjent om det er ekte sølv', 'Ukjent om det er sølv eller gull', 'Nysølv', 'Tinn', '']) {
      assert.equal(parseMetal(t), null, t)
    }
  })
})

describe('metalValue', () => {
  test('vekt × finhet × pris, avrundet til nærmeste tier', () => {
    const mv = metalValue(answered('Sølv 830S, 166 g'), { prices, today })
    assert.equal(mv.value, 1380) // 166 × 0,830 × 10 = 1377,8
    assert.equal(mv.date, '2026-11-20')
    assert.equal(metalValue(answered('Gull 18K, 5,5 g'), { prices, today }).value, 4130) // 5,5 × 0,750 × 1000 = 4125
  })
  test('bare familiens eget svar, med både finhet og vekt', () => {
    assert.equal(metalValue(answered('Sølv med stempel'), { prices, today }), null, 'uten vekt')
    assert.equal(metalValue(answered('Sølv, 166 g'), { prices, today }), null, 'uten finhet')
    const aiOnly = { v: 2, ai: { identification: { material: { value: 'Sølv 830S, 166 g' } } } }
    assert.equal(metalValue(aiOnly, { prices, today }), null, 'AI-ens gjetning teller ikke')
    assert.equal(metalValue({ v: 2, corrections: { material: { value: null } } }, { prices, today }), null)
    assert.equal(metalValue(null, { prices, today }), null)
  })
  test(`ingen pris, eller pris eldre enn ${MAX_PRICE_AGE_DAYS} dager: ingenting`, () => {
    const rec = answered('Sølv 830S, 166 g')
    assert.equal(metalValue(rec, { prices: { ...prices, silver: null }, today }), null)
    assert.equal(metalValue(rec, { prices: { ...prices, date: null }, today }), null)
    assert.equal(metalValue(rec, { prices: { ...prices, date: '2026-09-01' }, today }), null)
    assert.ok(metalValue(rec, { prices: { ...prices, date: '2026-09-25' }, today }))
  })
  test('prisfila i repoet er gyldig: enten tom eller med dato og to priser', () => {
    if (METAL_PRICES.date === null) return assert.equal(METAL_PRICES.silver, null)
    assert.match(METAL_PRICES.date, /^\d{4}-\d{2}-\d{2}$/)
    assert.ok(METAL_PRICES.silver > 0 && METAL_PRICES.gold > METAL_PRICES.silver)
    assert.equal(METAL_PRICES.currency, 'NOK')
  })
})

describe('scripts/metal-price.mjs', () => {
  const body = {
    success: true,
    data: {
      XAG: { symbol: 'XAG', price: 11.234, currency: 'NOK', unit: 'g', stale: false, timestamp: '2026-11-23T10:00:00Z' },
      XAU: { symbol: 'XAU', price: 1123.456, currency: 'NOK', unit: 'g', stale: false, timestamp: '2026-11-23T10:00:00Z' },
    },
  }
  test('leser NOK per gram og datoen', () => {
    assert.deepEqual(pricesFrom(body), { date: '2026-11-23', silver: 11.23, gold: 1123.46 })
  })
  test('avviser feil valuta, utdatert pris og urimelige tall', () => {
    const with_ = (sym, patch) => ({ ...body, data: { ...body.data, [sym]: { ...body.data[sym], ...patch } } })
    assert.throws(() => pricesFrom(with_('XAG', { currency: 'USD' })), /NOK per gram/)
    assert.throws(() => pricesFrom(with_('XAU', { stale: true })), /stale/)
    assert.throws(() => pricesFrom(with_('XAG', { price: 0.5 })), /utenfor/)
    assert.throws(() => pricesFrom({ success: false }), /Uventet/)
  })
  test('fila skriptet lager, gir samme priser tilbake', async () => {
    const src = fileContent({ date: '2026-11-23', silver: 11.23, gold: 1123.46 })
    const mod = await import(`data:text/javascript,${encodeURIComponent(src)}`)
    assert.deepEqual(mod.METAL_PRICES, { date: '2026-11-23', currency: 'NOK', unit: 'g', silver: 11.23, gold: 1123.46 })
  })
})
