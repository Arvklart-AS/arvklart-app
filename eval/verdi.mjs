// Kalibrering av verdianslaget: kjører bildeanalysen og verdianslaget med nøyaktig samme prompt, skjema, validering
// og regler som analyze-item og estimate-value i prod, mot gjenstander med kjent pris, og lagrer svarene.
// Rapporten lages av eval/rapport.mjs. Kaller ikke Supabase og lagrer ingenting i prod.
//
// Kjør (Node 22.18+, som leser edge-koden i TypeScript direkte):
//   ANTHROPIC_API_KEY=… node eval/verdi.mjs <datamappe> [--runder 2] [--modell claude-haiku-5-5] [--innsats low] [--ut fil.json]
// <datamappe> har testsett.json og bilder/<nr>_<finnkode>_<n>.jpg. Data og bilder legges aldri i repoet.
// --prøv kjører bare to gjenstander. --bekreft må være med når hele settet kjøres (skriptet viser anslått kostnad).
//
// Tre veier gjennom appen per gjenstand:
//   bilde:        bare bilder, som «Legg til flere» med kamera. Verdianslaget får AI-ens tittel, beskrivelse og tilstand.
//   bilde+familie: samme bildeanalyse, og det familien vet (type, merke, detaljer, tilstand), som «Legg til gjenstand».
//   tekst:        det familien vet, uten bilder (verdianslag uten bildeanalyse).
// Prisen familien vet, og annonsens fritekst (som kan nevne pris), sendes aldri.
import fs from 'node:fs'
import path from 'node:path'
import { buildParams, interpretReply, nextAttempt, estimateCostUsd, readEstimateInput, categoryKeyFor, depreciatedValue, analyzeEffort } from '../supabase/functions/_shared/aiCore.ts'
import { ANALYSIS_SCHEMA, analysisSystem, normalizeAnalysis } from '../supabase/functions/_shared/analysis.ts'
import { ESTIMATE_SCHEMA_V2, conditionGuidance, describeItem, finalizeEstimate, insufficientWithoutCall, validateEstimateV2, valuationSystem } from '../supabase/functions/_shared/valuation.ts'
import { buildQueries, compute, identityOf, matchAndFilter, specificityOf } from '../supabase/functions/_shared/market.ts'
import { valueAdvice } from '../src/lib/valueAdvice.js'

// Kategoriene et nytt bo får (DEFAULT_CATEGORIES i src/lib/supabase.js, som ikke kan importeres i Node)
const CATEGORIES = ['Møbler', 'Kunst og bilder', 'Smykker og ur', 'Elektronikk', 'Kjøkken og porselen', 'Minner og arvestykker']
// FINNs tilstandsskala → appens tilstand
const CONDITION = { 'Helt ny': 'excellent', 'Som ny': 'excellent', 'Pent brukt': 'good', 'Godt brukt': 'fair', 'Må fikses': 'poor' }
const conditionOf = t => CONDITION[Object.keys(CONDITION).find(k => (t || '').startsWith(k))] ?? null
const known = v => v && !/^ukjent\b/i.test(v.trim()) && !/ikke oppgitt/i.test(v)

const args = process.argv.slice(2)
const flag = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt }
const dir = args.find(a => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'))
if (!dir) { console.error('Bruk: node eval/verdi.mjs <datamappe> [--runder N] [--modell …] [--innsats low|medium] [--ut fil] [--prøv] [--bekreft]'); process.exit(2) }
const MODEL = flag('--modell', 'claude-haiku-5-5')
const EFFORT = analyzeEffort(flag('--innsats', 'low'))
const ROUNDS = Number(flag('--runder', '1'))
const OUT = flag('--ut', path.join(dir, `resultat-${MODEL}-${EFFORT}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '')}.json`))
const API = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'
const KEY = process.env.ANTHROPIC_API_KEY
if (!KEY) { console.error('Mangler ANTHROPIC_API_KEY'); process.exit(2) }

const set = JSON.parse(fs.readFileSync(path.join(dir, 'testsett.json'), 'utf8'))
let items = set.items
if (args.includes('--prøv')) items = items.slice(0, 2)
else if (!args.includes('--bekreft')) {
  // Målt i prod: ca. 0,0014 USD per bildeanalyse og 0,0003 per verdianslag (Haiku 5.5); 4.5 koster ca. 10 ganger mer
  const per = (MODEL === 'claude-haiku-5-5' ? 1 : 10) * (0.0014 + 3 * 0.0003)
  console.log(`${items.length} gjenstander × ${ROUNDS} runde(r), modell ${MODEL}, innsats ${EFFORT}: anslått ${(per * items.length * ROUNDS).toFixed(2)} USD. Kjør med --bekreft.`)
  process.exit(0)
}

// ── Kallet: som callStructured i _shared/ai.ts (samme parametre, ett nytt forsøk ved avkuttet eller ugyldig svar) ──
async function post(body) {
  for (let attempt = 1; ; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 45_000)
    try {
      const r = await fetch(`${API}/v1/messages`, {
        method: 'POST', signal: ctrl.signal,
        headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify(body),
      })
      if ((r.status === 429 || r.status >= 500) && attempt < 3) { await new Promise(res => setTimeout(res, 2000 * attempt)); continue }
      const json = await r.json()
      if (!r.ok) throw new Error(`API ${r.status}: ${json?.error?.message || ''}`)
      return json
    } finally { clearTimeout(timer) }
  }
}

async function structured({ system, content, schema, validate, maxTokens, effort, cacheSystem }) {
  const started = Date.now()
  const usage = { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 }
  let attempts = 0
  for (;;) {
    attempts++
    const m = await post(buildParams({ model: MODEL, system, content, schema, maxTokens, effort, cacheSystem }))
    for (const k of Object.keys(usage)) usage[k] += m.usage?.[k] || 0
    const reply = interpretReply(m, validate)
    const meta = { attempts, ms: Date.now() - started, usage, cost_usd: estimateCostUsd(MODEL, usage) }
    if (reply.kind === 'ok') return { ok: true, value: reply.value, meta }
    if (reply.kind === 'refused') return { ok: false, error: 'ai_refused', meta }
    const next = nextAttempt(reply, attempts, maxTokens)
    if (!next.retry) return { ok: false, error: `ai_invalid: ${reply.kind === 'invalid' ? reply.reason : 'avkuttet'}`, meta }
    maxTokens = next.maxTokens
  }
}

// ── analyze-item (supabase/functions/analyze-item/index.ts) ──────────────────────────────────────────
function images(item) {
  const files = fs.readdirSync(path.join(dir, 'bilder')).filter(f => f.startsWith(`${String(item.nr).padStart(2, '0')}_${item.finn_kode}_`)).sort().slice(0, 3)
  return files.map(f => ({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: fs.readFileSync(path.join(dir, 'bilder', f)).toString('base64') } }))
}

async function analyze(item) {
  const imgs = images(item)
  if (!imgs.length) return { ok: false, error: 'ingen bilder', meta: null }
  return structured({
    system: analysisSystem(false), schema: ANALYSIS_SCHEMA, validate: normalizeAnalysis(CATEGORIES), maxTokens: 6000, effort: EFFORT, cacheSystem: true,
    content: [...imgs, { type: 'text', text: `${imgs.length > 1 ? `De ${imgs.length} bildene viser samme gjenstand fra ulike vinkler.` : 'Se på bildet.'}

- suggestion.title: kort tittel, f.eks. 'Gyngestol i eik' eller 'Figgjo Lotte tallerken'
- suggestion.description: 1–2 setninger: materiale, farge, stand og alder hvis det synes. Enkelt språk.
- suggestion.category: én av disse, skrevet nøyaktig som i listen, eller tom tekst hvis ingen passer: ${CATEGORIES.join(', ')}
- suggestion.category_key: den generelle typen gjenstand
- suggestion.confidence: hvor sikker du er på hva gjenstanden er` }],
  })
}

// ── estimate-value (supabase/functions/estimate-value/index.ts), uten familiens sammenligninger ──────
async function estimate(body, analysis) {
  const input = readEstimateInput(body)
  if (typeof input === 'string') return { status: 'feil', error: input }
  const key = analysis?.suggestion.category_key && analysis.suggestion.category_key !== 'other' ? analysis.suggestion.category_key : categoryKeyFor(input.category)
  const identity = identityOf(analysis, input.title)
  const specificity = specificityOf(identity)
  // Uten sammenligninger gir markedsmotoren aldri et anslag; den kjøres for å følge samme vei som prod
  const market = compute(matchAndFilter([], identity), specificity)
  if (market.status === 'ok') return { status: 'market' }
  const missing = insufficientWithoutCall(input.title, input.description, analysis, false)
  if (missing) return { status: 'insufficient', missing, called: false, basis: { category_key: key, specificity } }
  const depreciation = depreciatedValue(key, input.purchasePrice, input.purchaseYear)
  const r = await structured({
    system: valuationSystem('Norwegian (bokmål)'), schema: ESTIMATE_SCHEMA_V2, validate: validateEstimateV2, maxTokens: 2000, effort: 'low',
    content: `${describeItem({ title: input.title, description: input.description, category: input.category, condition: input.condition, purchasePrice: input.purchasePrice, purchaseYear: input.purchaseYear, identifiedModel: input.identifiedModel }, analysis, depreciation?.value ?? null)}

${conditionGuidance(key)}

Give status, low_nok, likely_nok and high_nok as whole NOK amounts (low ≤ likely ≤ high), reasoning, confidence (high, medium or low) and missing.`,
  })
  if (!r.ok) return { status: 'feil', error: r.error, meta: r.meta }
  const basis = { category_key: key, specificity }
  if (r.value.status === 'insufficient') return { status: 'insufficient', missing: r.value.missing, reasoning: r.value.reasoning, called: true, basis, meta: r.meta }
  const final = finalizeEstimate(r.value, { condition: input.condition, analysis, hasDescription: !!input.description })
  const response = { status: 'ok', method: 'model', estimate: { low: final.low, likely: final.likely, high: final.high }, confidence: final.confidence, basis }
  return {
    status: 'ok', estimate: response.estimate, model_estimate: { low: r.value.low, likely: r.value.likely, high: r.value.high, confidence: r.value.confidence },
    confidence: final.confidence, reasons: final.uncertainty.reasons, basis, advice: valueAdvice(response), reasoning: r.value.reasoning, meta: r.meta,
  }
}

// Det familien ville skrevet inn (fra annonsens strukturerte felt, aldri pris eller fritekst)
function familyBody(item, analysis) {
  const title = known(item.merke) ? `${item.type}, ${item.merke}` : item.type
  return {
    title,
    description: known(item.modell_detaljer) ? item.modell_detaljer : '',
    category: analysis?.suggestion.category || '',
    condition: conditionOf(item.tilstand),
  }
}

// Det «Legg til flere» sender når familien bare har tatt bilder (aiSuggestion i src/lib/itemAiHelpers.js)
function photoBody(a) {
  const s = a.suggestion
  const condition = a.condition_suggestion !== 'unknown' && a.condition_confidence !== 'low' ? a.condition_suggestion : null
  return { title: s.title, description: s.description, category: s.category || '', condition }
}

const brandOf = a => ['brand', 'manufacturer', 'designer_or_artist'].map(f => a?.identification?.[f]).filter(Boolean).map(v => ({ value: v.value, basis: v.basis }))

async function runItem(item, round) {
  const a = await analyze(item)
  const analysis = a.ok ? a.value : null
  const scenarios = {}
  scenarios.bilde = analysis ? await estimate(photoBody(analysis), analysis) : { status: 'feil', error: a.error }
  scenarios['bilde+familie'] = analysis ? await estimate(familyBody(item, analysis), analysis) : { status: 'feil', error: a.error }
  scenarios.tekst = await estimate(familyBody(item, null), null)
  return {
    nr: item.nr, round, price: item.pris_nok, group: item.kategorigruppe, type: item.type, merke: item.merke, tilstand: item.tilstand,
    analysis: analysis ? {
      title: analysis.suggestion.title, category: analysis.suggestion.category, category_key: analysis.suggestion.category_key, confidence: analysis.suggestion.confidence,
      brands: brandOf(analysis), model: analysis.identification.model?.value || null, condition: analysis.condition_suggestion, condition_confidence: analysis.condition_confidence,
      multiple: analysis.multiple_items.detected, meta: a.meta,
    } : { error: a.error, meta: a.meta },
    scenarios,
  }
}

const results = []
const queue = []
for (let round = 1; round <= ROUNDS; round++) for (const item of items) queue.push([item, round])
let next = 0
await Promise.all(Array.from({ length: 4 }, async () => {
  while (next < queue.length) {
    const [item, round] = queue[next++]
    try {
      const r = await runItem(item, round)
      results.push(r)
      const s = r.scenarios.bilde
      console.log(`#${item.nr} r${round} ${item.type}: pris ${item.pris_nok} · bilde ${s.status === 'ok' ? `${s.estimate.low}–${s.estimate.high} (${s.confidence}, ${s.advice})` : s.status}`)
    } catch (e) {
      results.push({ nr: item.nr, round, price: item.pris_nok, error: String(e.message || e) })
      console.log(`#${item.nr} r${round} FEIL: ${e.message}`)
    }
  }
}))
results.sort((x, y) => x.round - y.round || x.nr - y.nr)
const cost = results.reduce((s, r) => s + (r.analysis?.meta?.cost_usd || 0) + Object.values(r.scenarios || {}).reduce((t, x) => t + (x.meta?.cost_usd || 0), 0), 0)
fs.writeFileSync(OUT, JSON.stringify({ model: MODEL, effort: EFFORT, rounds: ROUNDS, at: new Date().toISOString(), price_definition: set.prisdefinisjon, cost_usd: cost, results }, null, 2))
console.log(`\nLagret ${OUT} · kostnad ${cost.toFixed(4)} USD`)
