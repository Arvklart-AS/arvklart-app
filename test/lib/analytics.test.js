import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { CONSENT_KEY, CONSENT_VERSION, canLoadAnalytics, clearAnalyticsCookies, getConsent, setConsent } from '../../src/lib/analytics.js'

// Tilbaketrekking av samtykket skal ikke være avhengig av timing.
//
// Feilen som ble rettet: setConsent('denied') slettet informasjonskapslene FØR Google fikk beskjed.
// I vinduet mellom de to sto GA4 fortsatt i «granted», og en måling som allerede var på vei kunne
// skrive _ga tilbake før siden ble lastet på nytt. Røyktesten mot en ekte utrulling fanget det bare
// av og til (grønn de fleste ganger), så rekkefølgen sjekkes her i stedet.

const fakeStorage = () => {
  const m = new Map()
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }
}

// Minimal document.cookie: husker hva som er satt, sletter på Max-Age=0, og skriver hver sletting
// til den felles loggen, så rekkefølgen mot beskjeden til Google kan måles.
function fakeDocument(start = [], skriv = () => {}) {
  let kaker = new Map(start.map(n => [n, 'v']))
  return {
    get cookie() { return [...kaker].map(([k, v]) => `${k}=${v}`).join('; ') },
    set cookie(s) {
      const navn = s.split('=')[0].trim()
      if (/Max-Age=0/.test(s)) { if (kaker.delete(navn)) skriv(`slett:${navn}`) }
      else kaker.set(navn, s.split('=')[1].split(';')[0])
    },
    get navn() { return [...kaker.keys()] },
  }
}

let logg
beforeEach(() => {
  logg = []
  global.localStorage = fakeStorage()
  global.document = fakeDocument(['_ga', '_ga_168T1YN8RT', '_gid', 'hs_noe_annet'], m => logg.push(m))
  global.window = {
    location: { hostname: 'www.arvklart.no', reload: () => logg.push('reload') },
    dataLayer: { push: a => logg.push(`gtag:${a[0]}:${a[1]}:${JSON.stringify(a[2] ?? null)}`) },
    dispatchEvent: () => {},
    __arvklartGtm: true, // GTM er lastet
  }
  global.Event = class { constructor(t) { this.type = t } }
  // window.* leses som globale i modulen
  Object.defineProperty(global, 'document', { value: global.document, configurable: true, writable: true })
})

test('«Avslå»: Google får beskjed før informasjonskapslene slettes, og siden lastes på nytt', () => {
  setConsent('denied')
  const gtagIndeks = logg.findIndex(l => l.startsWith('gtag:consent:update'))
  const forsteSlett = logg.findIndex(l => l.startsWith('slett:'))
  const reloadIndeks = logg.indexOf('reload')
  assert.ok(gtagIndeks !== -1, 'Google fikk aldri beskjed om at samtykket er trukket tilbake')
  assert.ok(forsteSlett !== -1, 'ingen informasjonskapsler ble slettet')
  assert.ok(reloadIndeks !== -1, 'siden ble ikke lastet på nytt')
  // Kjernen i rettingen: GA4 må stoppes før kapslene fjernes, ellers kan en måling som er på vei
  // skrive _ga tilbake i vinduet mellom de to.
  assert.ok(gtagIndeks < forsteSlett,
    `beskjeden til Google må komme før slettingen – rekkefølgen var: ${logg.join(' → ')}`)
  assert.ok(forsteSlett < reloadIndeks, 'slettingen må skje før siden lastes på nytt')
  assert.match(logg[gtagIndeks], /analytics_storage":"denied"/)
  // Alle Googles informasjonskapsler er borte, og ingen andre er rørt
  assert.deepEqual(global.document.navn, ['hs_noe_annet'])
  assert.equal(getConsent(), 'denied')
})

test('clearAnalyticsCookies tar bare Googles informasjonskapsler', () => {
  global.document = fakeDocument(['_ga', '_ga_ABC', '_gid', 'hs_lang', 'hs_analytics_consent', '_gat_noe'])
  clearAnalyticsCookies()
  assert.deepEqual(global.document.navn.sort(), ['_gat_noe', 'hs_analytics_consent', 'hs_lang'].sort())
})

test('«Godta» rører ingen informasjonskapsler og laster ikke siden på nytt', () => {
  setConsent('granted')
  assert.equal(getConsent(), 'granted')
  assert.ok(!logg.includes('reload'), 'siden skal ikke lastes på nytt ved «Godta»')
  assert.deepEqual(global.document.navn.sort(), ['_ga', '_ga_168T1YN8RT', '_gid', 'hs_noe_annet'].sort())
})

test('et lagret valg fra en eldre CONSENT_VERSION teller ikke', () => {
  global.localStorage.setItem(CONSENT_KEY, JSON.stringify({ v: CONSENT_VERSION - 1, choice: 'granted' }))
  assert.equal(getConsent(), null, 'gammelt samtykke skal gi nytt spørsmål')
})

test('canLoadAnalytics: bare samtykke, offentlig side, ikke innlogget og ingen økt i adressen', () => {
  const side = { path: '/', kind: 'page' }
  assert.equal(canLoadAnalytics({ consent: 'granted', page: side, loggedIn: false, authInUrl: false }), true)
  assert.equal(canLoadAnalytics({ consent: 'denied', page: side, loggedIn: false, authInUrl: false }), false)
  assert.equal(canLoadAnalytics({ consent: 'granted', page: null, loggedIn: false, authInUrl: false }), false)
  assert.equal(canLoadAnalytics({ consent: 'granted', page: side, loggedIn: true, authInUrl: false }), false)
  assert.equal(canLoadAnalytics({ consent: 'granted', page: side, loggedIn: false, authInUrl: true }), false)
})
