#!/usr/bin/env node
// Henter dagens spotpris for sølv og gull i NOK per gram fra MetalCharts og skriver src/lib/metalPrices.js.
// Kjøres for hånd omtrent én gang i måneden (prisen vises ikke når den er eldre enn 60 dager), og endringen går
// i en vanlig PR. Ett kall per kjøring; gratisnivået har 200 i måneden.
//
//   METALCHARTS_API_KEY=mc_live_... node scripts/metal-price.mjs           # skriver fila
//   METALCHARTS_API_KEY=mc_live_... node scripts/metal-price.mjs --dry-run # viser bare prisene
//
// Nøkkelen leses bare fra miljøet og skrives aldri til disk. Legg den aldri i repoet eller i frontend.
// Vilkår (metalcharts.org/api-terms): kommersiell bruk er tillatt på gratisnivået mot en synlig lenke til
// metalcharts.org ved tallet (MetalValueNote). Ikke kopier priser fra nettsiden: det tillater ikke vilkårene.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const API_URL = 'https://api.metalcharts.org/v1/prices/?symbols=XAG,XAU&currency=NOK&unit=g'
const OUT = fileURLToPath(new URL('../src/lib/metalPrices.js', import.meta.url))
// Rimelige grenser (NOK per gram rent metall), så et feil svar aldri blir et tall i appen
const BOUNDS = { silver: [2, 500], gold: [200, 20000] }

export function pricesFrom(body) {
  if (!body?.success || !body.data) throw new Error('Uventet svar fra MetalCharts')
  const pick = (symbol, kind) => {
    const q = body.data[symbol]
    if (!q) throw new Error(`Mangler ${symbol} i svaret`)
    if (q.currency !== 'NOK' || q.unit !== 'g') throw new Error(`${symbol} er ikke i NOK per gram (${q.currency}/${q.unit})`)
    if (q.stale) throw new Error(`${symbol} er ikke oppdatert hos MetalCharts (stale)`)
    const [lo, hi] = BOUNDS[kind]
    if (!(q.price >= lo && q.price <= hi)) throw new Error(`${symbol}: ${q.price} NOK/g er utenfor ${lo}–${hi}`)
    return { price: Math.round(q.price * 100) / 100, date: String(q.timestamp).slice(0, 10) }
  }
  const silver = pick('XAG', 'silver')
  const gold = pick('XAU', 'gold')
  const date = silver.date < gold.date ? silver.date : gold.date // den eldste av de to
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Mangler dato i svaret')
  return { date, silver: silver.price, gold: gold.price }
}

export function fileContent(p) {
  return `// Spotpris for rent sølv og gull i NOK per gram, med datoen prisen gjelder. Lages av scripts/metal-price.mjs
// (MetalCharts' API, gratisnivået: kommersiell bruk tillatt mot lenken «Metallpriser fra MetalCharts» ved tallet).
// Ikke skriv inn tall for hånd, og ikke kopier dem fra nettsiden: det er bare API-et vilkårene tillater.
// Uten pris (null), eller med pris eldre enn 60 dager, vises ingen metallverdi (src/lib/metalValue.js).
export const METAL_PRICES = {
  date: '${p.date}',
  currency: 'NOK',
  unit: 'g',
  silver: ${p.silver},
  gold: ${p.gold},
}
`
}

async function main() {
  const key = process.env.METALCHARTS_API_KEY
  if (!key) { console.error('Mangler METALCHARTS_API_KEY i miljøet.'); process.exit(1) }
  const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' } })
  if (!res.ok) { console.error(`MetalCharts svarte ${res.status}`); process.exit(1) }
  const p = pricesFrom(await res.json())
  console.log(`Sølv ${p.silver} NOK/g, gull ${p.gold} NOK/g (${p.date})`)
  if (process.argv.includes('--dry-run')) return
  writeFileSync(OUT, fileContent(p))
  console.log(`Skrev ${OUT}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch(e => { console.error(e.message); process.exit(1) })
