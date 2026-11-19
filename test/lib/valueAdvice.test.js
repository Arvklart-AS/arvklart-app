// Når et verdianslag vises som spenn, med merknad om takst, eller ikke vises i det hele tatt (src/lib/valueAdvice.js)
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { valueAdvice, appraiseText, suggestText, formatRange, APPRAISE_ABOVE_NOK } from '../../src/lib/valueAdvice.js'

// Svar fra estimate-value v3 (også formen til valuationRecord)
const est = ({ likely = 500, method = 'model', key = 'furniture', specificity = 'generic', confidence = 'medium', status = 'ok' } = {}) => ({
  status, method, confidence, estimate: { low: Math.round(likely * 0.6), likely, high: Math.round(likely * 1.6) },
  basis: { category_key: key, specificity },
})

describe('valueAdvice', () => {
  test('vanlig innbo med AI-anslag: spennet vises', () => {
    assert.equal(valueAdvice(est()), 'none')
    assert.equal(valueAdvice(est({ key: 'kitchen_porcelain', likely: 300 })), 'none')
  })

  test('kunst, smykker og samleobjekter som AI-gjetning: ikke noe beløp', () => {
    for (const key of ['art', 'jewelry_watches', 'collectibles']) assert.equal(valueAdvice(est({ key })), 'instead', key)
  })

  test('tydelig identifisert i en usikker kategori: beløpet vises, med merknad om takst', () => {
    assert.equal(valueAdvice(est({ key: 'collectibles', specificity: 'precise' })), 'suggest')
    assert.equal(valueAdvice(est({ key: 'art', specificity: 'broad', confidence: 'high' })), 'suggest')
    // Bare merke, uten høy sikkerhet, er ikke nok
    assert.equal(valueAdvice(est({ key: 'art', specificity: 'broad', confidence: 'medium' })), 'instead')
  })

  test('over 10 000 kr som AI-gjetning: ikke noe beløp, uansett kategori og identifikasjon', () => {
    assert.equal(valueAdvice(est({ likely: APPRAISE_ABOVE_NOK + 1 })), 'instead')
    assert.equal(valueAdvice(est({ likely: 25000, key: 'electronics', specificity: 'precise', confidence: 'high' })), 'instead')
    assert.equal(valueAdvice(est({ likely: APPRAISE_ABOVE_NOK })), 'none', 'grensen er «over», ikke «fra»')
  })

  test('bygger på familiens sammenligninger: beløpet vises alltid, med merknad når det er dyrt eller usikker kategori', () => {
    assert.equal(valueAdvice(est({ method: 'market_sold', key: 'art' })), 'suggest')
    assert.equal(valueAdvice(est({ method: 'market_asking', likely: 30000 })), 'suggest')
    assert.equal(valueAdvice(est({ method: 'market_sold' })), 'none')
  })

  test('eldre svar uten method regnes som AI-anslag', () => {
    const old = est({ key: 'art' })
    delete old.method
    assert.equal(valueAdvice(old), 'instead')
  })

  test('uten anslag: ingenting å vurdere', () => {
    assert.equal(valueAdvice(null), 'none')
    assert.equal(valueAdvice(est({ status: 'insufficient' })), 'none')
    assert.equal(valueAdvice({ status: 'ok', estimate: { likely: 0 } }), 'none')
  })
})

describe('tekstene', () => {
  test('egen begrunnelse for usikker kategori og for høyt beløp', () => {
    assert.match(appraiseText(est({ key: 'art' })).body, /signatur/)
    assert.match(appraiseText(est({ likely: 20000 })).body, /10 000 kr/)
    assert.match(suggestText(est({ key: 'jewelry_watches' })), /takst/)
  })

  test('spennet skrives med begge beløp, eller ett hvis de er like', () => {
    assert.match(formatRange(300, 800), /300.*–.*800/)
    assert.doesNotMatch(formatRange(500, 500), /–/)
    assert.equal(formatRange(null, 800), '')
  })
})
