// Metallverdien av sølv og gull ut fra familiens svar på «Er det ekte sølv?» (src/components/MetalQuestion.jsx),
// f.eks. «Sølv 830S, 166 g»: vekt × finhet × spotpris. Ren funksjon, testes i test/lib/metalValue.test.js.
//
// Hvorfor: i kalibreringen (eval/, 2026-11-19) ble et sølvbestikk anslått 12 ganger for lavt, fordi AI-en trodde det
// var forsølvet. Metallverdien er et gulv familien kan regne med uten AI: gjenstanden kan være verdt mer (design,
// produsent, etterspørsel), men en gullsmed som kjøper inn for omsmelting, betaler ofte mindre enn spotprisen.
//
// Regnes bare når familien selv har oppgitt både finhet og vekt (aldri ut fra AI-ens gjetning eller et stempel
// AI-en har lest), og bare med en pris som er høyst 60 dager gammel.
import { METAL_PRICES } from './metalPrices.js'

export const MAX_PRICE_AGE_DAYS = 60

// Gull: karat og tusendeler (14K = 585); sølv: tusendeler (830S, 925S, Sterling = 925)
const GOLD_KARAT = { 8: 333, 9: 375, 10: 417, 14: 585, 18: 750, 20: 833, 21: 875, 22: 916, 23: 958, 24: 999 }
const GOLD_FINE = [333, 375, 417, 585, 750, 833, 875, 916, 958, 999]
const SILVER_FINE = [800, 813, 826, 830, 835, 875, 900, 925, 935, 958, 999]

const norm = s => (typeof s === 'string' ? s.toLocaleLowerCase('nb') : '')
// Svar som ikke er ekte metall, eller der familien ikke vet
const NOT_SOLID = /forsølv|forsolv|forgyl|plett|plated|nysølv|alpakka|ukjent|usikker|vet ikke|unknown|not sure/
const GRAMS = /(\d{1,5}(?:[.,]\d{1,2})?)\s?(?:g|gr|gram)\b/

// { kind: 'silver'|'gold', fineness: 830|null, grams: 166|null } eller null når teksten ikke er ekte sølv eller gull
export function parseMetal(text) {
  const t = norm(text)
  if (!t.trim() || NOT_SOLID.test(t)) return null
  const kind = /gull|gold/.test(t) ? 'gold' : /sølv|solv|sylv|silver|sterling/.test(t) ? 'silver' : null
  if (!kind) return null
  const g = t.match(GRAMS)
  const grams = g ? Number(g[1].replace(',', '.')) : null
  const rest = g ? t.replace(g[0], ' ') : t // vekten skal ikke leses som finhet
  let fineness = null
  if (kind === 'gold') {
    const k = rest.match(/\b(8|9|10|14|18|20|21|22|23|24)\s?(?:k|kt|karat|ct)\b/)
    const n = rest.match(/\b(\d{3})\b/)
    fineness = k ? GOLD_KARAT[k[1]] : n && GOLD_FINE.includes(Number(n[1])) ? Number(n[1]) : null
  } else {
    const n = rest.match(/\b(\d{3})\s?s?\b/)
    fineness = n && SILVER_FINE.includes(Number(n[1])) ? Number(n[1]) : /sterling/.test(rest) ? 925 : null
  }
  return { kind, fineness, grams: grams > 0 && grams < 100000 ? grams : null }
}

const daysBetween = (from, to) => (to.getTime() - Date.parse(`${from}T00:00:00Z`)) / 86_400_000

// { kind, fineness, grams, value, perGram, date } eller null
export function metalValue(record, { prices = METAL_PRICES, today = new Date() } = {}) {
  const answer = record?.corrections?.material
  if (!answer || typeof answer !== 'object' || typeof answer.value !== 'string') return null
  const m = parseMetal(answer.value)
  if (!m?.fineness || !m.grams) return null
  const perGram = Number(prices?.[m.kind])
  if (!(perGram > 0) || !prices?.date || !/^\d{4}-\d{2}-\d{2}$/.test(prices.date)) return null
  const age = daysBetween(prices.date, today)
  if (!(age >= -1 && age <= MAX_PRICE_AGE_DAYS)) return null
  const raw = m.grams * (m.fineness / 1000) * perGram
  return { ...m, value: Math.max(10, Math.round(raw / 10) * 10), perGram, date: prices.date }
}
