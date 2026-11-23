// Ren logikk for fanen «Sletting (GDPR)» i founder-dashboardet (src/components/FounderGdprPanel.jsx).
// Testes i test/lib/founderGdpr.test.js.

export const DEMO_ESTATE_ID = 'deed0001-0000-0000-0000-000000000001'

const fold = s => String(s ?? '').toLocaleLowerCase('nb').replace(/ø/g, 'o').replace(/æ/g, 'ae').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')

// Bo og kontoer som passer søket (navn på boet, eierens navn/e-post, kontoens navn/e-post).
// Demoboet og founderens egen konto tas aldri med; edge-funksjonen avviser dem uansett.
export function searchDeletable(query, estates = [], profiles = [], selfId = null, max = 8) {
  const q = fold(query).trim()
  if (q.length < 2) return { estates: [], users: [] }
  const hit = (...fields) => fields.some(f => fold(f).includes(q))
  return {
    estates: estates
      .filter(e => e.id !== DEMO_ESTATE_ID && hit(e.name, e.profiles?.display_name, e.profiles?.email))
      .slice(0, max),
    users: profiles
      .filter(p => p.user_id && p.user_id !== selfId && hit(p.display_name, p.email))
      .slice(0, max),
  }
}

// Tall til statuskortene: fullførte slettinger, uferdige (failed eller started) og slettinger de siste 30 dagene
export function summarizeLog(log = [], now = new Date()) {
  const since = now.getTime() - 30 * 24 * 60 * 60 * 1000
  return {
    done: log.filter(r => r.status === 'ok').length,
    unfinished: log.filter(r => r.status !== 'ok').length,
    last30: log.filter(r => r.status === 'ok' && new Date(r.created_at).getTime() >= since).length,
  }
}

// Hele måneder fra date til now (0 hvis date er i fremtiden eller mangler)
export function monthsSince(date, now = new Date()) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return 0
  let m = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
  if (now.getDate() < d.getDate()) m--
  return Math.max(0, m)
}

// Kort id til loggen (de første 8 tegnene); hele id-en vises som title
export const shortId = id => (id ? String(id).slice(0, 8) : '—')
