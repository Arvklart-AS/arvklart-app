// Rapport fra kalibreringen (eval/verdi.mjs): hvor mye anslaget bommer mot kjent pris, om spennet treffer, om
// «høy/middels/lav sikkerhet» henger sammen med hvor mye det bommer, og om «få det vurdert» (src/lib/valueAdvice.js)
// skjuler de anslagene som bommer mest. Kjør: node eval/rapport.mjs <resultat.json> [flere.json …]
import fs from 'node:fs'

const files = process.argv.slice(2)
if (!files.length) { console.error('Bruk: node eval/rapport.mjs <resultat.json> …'); process.exit(2) }

const median = xs => { const s = [...xs].sort((a, b) => a - b); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : NaN }
const pct = (a, b) => (b ? `${Math.round((100 * a) / b)} %` : '–')
const kr = n => `${Math.round(n).toLocaleString('nb-NO')} kr`
// Faktor anslaget bommer med, uansett retning: 2 = halvparten eller dobbelt så mye
const factor = (likely, price) => Math.max(likely / price, price / likely)
const norm = s => (s || '').toLocaleLowerCase('nb').normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9æøå]+/g, ' ').trim()

function summary(rows, label) {
  const ok = rows.filter(r => r.s.status === 'ok')
  const f = ok.map(r => factor(r.s.estimate.likely, r.price))
  const hit = ok.filter(r => r.s.estimate.low <= r.price && r.price <= r.s.estimate.high).length
  const over = ok.filter(r => r.s.estimate.likely > r.price).length
  const width = ok.map(r => r.s.estimate.high / Math.max(1, r.s.estimate.low))
  return [
    `${label}: ${ok.length} anslag av ${rows.length}` + (rows.length - ok.length ? ` (${rows.length - ok.length} uten verdi: ${[...new Set(rows.filter(r => r.s.status !== 'ok').map(r => r.s.status))].join(', ')})` : ''),
    ok.length ? `  bommer med faktor (median) ${median(f).toFixed(2)} · innen ±25 %: ${pct(f.filter(x => x <= 1.25).length, ok.length)} · innen ±50 %: ${pct(f.filter(x => x <= 1.5).length, ok.length)} · mer enn dobbelt feil: ${pct(f.filter(x => x > 2).length, ok.length)}` : '',
    ok.length ? `  prisen innenfor spennet: ${pct(hit, ok.length)} · spennets bredde (høy/lav, median) ${median(width).toFixed(1)}× · anslaget over prisen: ${pct(over, ok.length)}` : '',
  ].filter(Boolean).join('\n')
}

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  const res = data.results.filter(r => !r.error)
  console.log(`\n═══ ${file}\nModell ${data.model}, innsats ${data.effort}, ${data.rounds} runde(r), ${res.length} kjøringer, kostnad ${data.cost_usd.toFixed(4)} USD`)
  console.log(`Fasit: ${data.price_definition}\n`)

  for (const sc of ['bilde', 'bilde+familie', 'tekst']) {
    const rows = res.map(r => ({ ...r, s: r.scenarios[sc] }))
    console.log(summary(rows, `▸ ${sc}`))
    // Kalibrering: henger sikkerheten sammen med treffsikkerheten?
    for (const c of ['high', 'medium', 'low']) {
      const g = rows.filter(r => r.s.status === 'ok' && r.s.confidence === c)
      if (!g.length) continue
      const f = g.map(r => factor(r.s.estimate.likely, r.price))
      const hit = g.filter(r => r.s.estimate.low <= r.price && r.price <= r.s.estimate.high).length
      console.log(`    sikkerhet ${c.padEnd(6)} n=${String(g.length).padStart(2)}  bommer (median) ${median(f).toFixed(2)}×  spennet treffer ${pct(hit, g.length)}`)
    }
    // «Få det vurdert»: skjules de verste?
    for (const adv of ['instead', 'suggest', 'none']) {
      const g = rows.filter(r => r.s.status === 'ok' && r.s.advice === adv)
      if (!g.length) continue
      const f = g.map(r => factor(r.s.estimate.likely, r.price))
      console.log(`    advice ${adv.padEnd(7)} n=${String(g.length).padStart(2)}  bommer (median) ${median(f).toFixed(2)}×  mer enn dobbelt feil: ${pct(f.filter(x => x > 2).length, g.length)}`)
    }
    console.log('')
  }

  // Identifikasjon fra bildene: fant AI-en merket når annonsen oppgir det?
  const withBrand = res.filter(r => r.analysis?.brands && r.merke && !/^ukjent/i.test(r.merke))
  const found = withBrand.filter(r => r.analysis.brands.some(b => norm(r.merke).split(' ').some(w => w.length >= 3 && norm(b.value).includes(w))))
  const wrong = withBrand.filter(r => r.analysis.brands.length && !found.includes(r))
  const invented = res.filter(r => r.analysis?.brands?.length && /^ukjent/i.test(r.merke || ''))
  console.log(`Identifikasjon fra bilder: merke funnet ${found.length} av ${withBrand.length} der annonsen oppgir merke · feil merke ${wrong.length} · merke oppgitt der annonsen sier ukjent ${invented.length}`)
  const analysisMeta = res.map(r => r.analysis?.meta).filter(Boolean)
  console.log(`Svartid bildeanalyse (median) ${(median(analysisMeta.map(m => m.ms)) / 1000).toFixed(1)} s · nye forsøk ${analysisMeta.filter(m => m.attempts > 1).length}`)

  // Gjenstand for gjenstand
  console.log('\nnr  pris        bilde                           bilde+familie                   tekst                           merke fra bilde')
  for (const r of res) {
    const cell = s => s.status === 'ok' ? `${kr(s.estimate.likely)} (${s.estimate.low}–${s.estimate.high}) ${s.confidence[0]}${s.advice === 'instead' ? ' ⚑' : ''}` : s.status
    console.log(`${String(r.nr).padStart(2)}${r.round > 1 ? `·${r.round}` : '  '} ${kr(r.price).padEnd(10)}  ${cell(r.scenarios.bilde).padEnd(31)} ${cell(r.scenarios['bilde+familie']).padEnd(31)} ${cell(r.scenarios.tekst).padEnd(31)} ${(r.analysis?.brands || []).map(b => `${b.value}${b.basis === 'observed' ? '' : '?'}`).join(', ')}`)
  }
  console.log('\n⚑ = «få det vurdert» (beløpet vises ikke i appen). Sikkerhet: h/m/l. «?» = sannsynlig, ikke lest på gjenstanden.')
}
