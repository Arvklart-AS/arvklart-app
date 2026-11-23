// Automatisk sletting av avsluttede bo mot ekte Postgres + PostgREST (som service_role, slik edge-funksjonen
// kjører): spørringene i supabase/functions/_shared/closedEstates.ts, on delete cascade og kjøreloggen.
// Storage simuleres. Kjøres av test/db/run.sh. Krever Node 22.18+ (TypeScript).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { PostgrestClient } from '@supabase/postgrest-js'
import { fakeSupabase, manyFiles } from '../functions/fakeSupabase.js'

const TS = !!process.features?.typescript
const { handleCleanupClosedEstates } = TS ? await import('../../supabase/functions/_shared/closedEstates.ts') : {}
const { handleFounderDelete } = TS ? await import('../../supabase/functions/_shared/founderDelete.ts') : {}

const SECRET = 'super-secret-jwt-token-with-at-least-32-characters'
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url')
const jwt = claims => {
  const head = b64({ alg: 'HS256', typ: 'JWT' }), body = b64({ ...claims, exp: Math.floor(Date.now() / 1000) + 3600 })
  return `${head}.${body}.${crypto.createHmac('sha256', SECRET).update(`${head}.${body}`).digest('base64url')}`
}
const db = new PostgrestClient('http://localhost:54330', { headers: { Authorization: `Bearer ${jwt({ role: 'service_role' })}` } })
const CRON = 'c'.repeat(40)
const OWNER = '00000000-0000-0000-0000-00000000000a'
const OLD = '55555555-0000-0000-0000-000000000001'
const RECENT = '55555555-0000-0000-0000-000000000002'
const month = n => new Date(Date.now() - n * 30.5 * 24 * 3600 * 1000).toISOString()
const must = async q => { const r = await q; assert.equal(r.error, null, r.error?.message); return r.data }

test('sletter bo avsluttet for over 12 måneder med alt innhold, og logger kjøringen', { skip: !TS && 'Node uten TypeScript-støtte' }, async () => {
  await must(db.from('estates').insert([
    { id: OLD, name: 'Gammelt bo', owner_id: OWNER, invite_code: 'CLN001', status: 'closed' },
    { id: RECENT, name: 'Nylig avsluttet', owner_id: OWNER, invite_code: 'CLN002', status: 'closed' },
  ]))
  // closed_at settes etter status (som i prod, der en trigger setter closed_at når status endres)
  await must(db.from('estates').update({ closed_at: month(13) }).eq('id', OLD))
  await must(db.from('estates').update({ closed_at: month(11) }).eq('id', RECENT))
  await must(db.from('estate_members').insert({ estate_id: OLD, user_id: OWNER, role: 'admin' }))
  const [item] = await must(db.from('items').insert({ estate_id: OLD, title: 'Stol', added_by: OWNER }).select('id'))
  await must(db.from('interests').insert({ item_id: item.id, user_id: OWNER }))
  await must(db.from('comments').insert({ item_id: item.id, user_id: OWNER, content: 'hei' }))
  await must(db.from('documents').insert({ estate_id: OLD, name: 't.pdf', file_url: 'x', file_path: `documents/${OLD}/t.pdf` }))
  await must(db.from('heirs').insert({ estate_id: OLD, name: 'Arving', email: 'arving@test.no' }))
  await must(db.from('feedback').insert([{ user_id: OWNER, estate_id: OLD, content: 'om boet' }, { user_id: OWNER, estate_id: null, content: 'generell' }]))

  const storage = fakeSupabase({ storage: { 'item-images': { ...manyFiles(OLD, 1200), ...manyFiles(RECENT, 2) }, 'estate-docs': { [`documents/${OLD}/t.pdf`]: {} } } })
  const admin = { from: t => db.from(t), storage: storage.client.storage }
  const run = (query = '') => handleCleanupClosedEstates(
    new Request(`https://x/cleanup${query}`, { method: 'POST', headers: { 'x-cron-secret': CRON } }),
    { secret: CRON, retentionMonths: 12, admin: () => admin, log: () => {} })

  // dry_run: viser boet, endrer ingenting
  const dry = await run('?dry_run=1')
  assert.equal(dry.status, 200)
  const plan = dry.body.estates.find(e => e.id === OLD)
  assert.deepEqual(plan, { id: OLD, items: 1, documents: 1, feedback: 1, files: { documents: 1, images: 1200 } })
  assert.ok(!dry.body.estates.some(e => e.id === RECENT))
  assert.equal((await must(db.from('estates').select('id').eq('id', OLD))).length, 1)
  assert.equal((await must(db.from('cleanup_runs').select('id'))).length, 0, 'dry_run logges ikke')

  // ekte kjøring
  const real = await run()
  assert.equal(real.status, 200, JSON.stringify(real.body))
  assert.deepEqual(real.body.deleted, [OLD])
  for (const [table, col] of [['estates', 'id'], ['estate_members', 'estate_id'], ['items', 'estate_id'], ['documents', 'estate_id'], ['heirs', 'estate_id']]) {
    assert.equal((await must(db.from(table).select('*').eq(col, OLD))).length, 0, `${table} er tom`)
  }
  assert.equal((await must(db.from('interests').select('id').eq('item_id', item.id))).length, 0)
  assert.equal((await must(db.from('comments').select('id').eq('item_id', item.id))).length, 0)
  assert.deepEqual((await must(db.from('feedback').select('content').eq('user_id', OWNER))).map(f => f.content), ['generell'])
  assert.equal((await must(db.from('estates').select('id').eq('id', RECENT))).length, 1, 'nylig avsluttet bo står')
  assert.deepEqual([...storage.buckets['item-images'].keys()].sort(), Object.keys(manyFiles(RECENT, 2)).sort())
  const [log] = await must(db.from('cleanup_runs').select('*'))
  assert.equal(log.status, 'ok')
  assert.equal(log.deleted_count, 1)
  assert.ok(log.finished_at)

  await must(db.from('estates').delete().eq('id', RECENT))
  await must(db.from('cleanup_runs').delete().gt('id', 0))
})

// Sletting fra founder-dashboardet (founder-delete) mot ekte Postgres: kaskaden går gjennom tildelinger til personer,
// fordelingsloggen, godkjenningsversjoner med svar og fullmakter, uten at sperrene på arvinger og godkjenninger
// stopper den. Det andre boet, kontoene og delte filer består, og slettingen logges i founder_audit_log uten navn.
test('founder-delete sletter ett bo med godkjenninger, fullmakter og logg; andre bo og delte filer består', { skip: !TS && 'Node uten TypeScript-støtte' }, async () => {
  const FOUNDER = '00000000-0000-0000-0000-0000000000e1'
  const REP = '00000000-0000-0000-0000-0000000000f1'
  const A = '66666666-0000-0000-0000-00000000000a'
  const B = '66666666-0000-0000-0000-00000000000b'
  const IMG = 'https://p.supabase.co/storage/v1/object/public/item-images/'
  await must(db.from('founders').upsert({ user_id: FOUNDER }, { onConflict: 'user_id' }))
  await must(db.from('estates').insert([
    { id: A, name: 'Dødsbo A', owner_id: OWNER, invite_code: 'FDA001' },
    { id: B, name: 'Bo B', owner_id: OWNER, invite_code: 'FDB001' },
  ]))
  await must(db.from('estate_members').insert([{ estate_id: A, user_id: OWNER, role: 'admin' }, { estate_id: B, user_id: OWNER, role: 'admin' }]))
  const [heir] = await must(db.from('heirs').insert({ estate_id: A, name: 'Arving A', email: 'a@test.no', must_approve: true, user_id: OWNER }).select('id'))
  const [item] = await must(db.from('items').insert({ estate_id: A, title: 'Stol', added_by: OWNER, image_url: IMG + 'items/delt.jpg' }).select('id'))
  await must(db.from('items').update({ status: 'assigned', assigned_to: OWNER, assigned_heir_id: heir.id }).eq('id', item.id))
  const [itemB] = await must(db.from('items').insert({ estate_id: B, title: 'Klokke', added_by: OWNER, image_url: IMG + 'items/delt.jpg' }).select('id'))
  await must(db.from('interests').insert({ item_id: item.id, user_id: OWNER }))
  await must(db.from('estate_events').insert({ estate_id: A, item_id: item.id, actor: OWNER, kind: 'assigned', data: { heir_id: heir.id } }))
  const [rep] = await must(db.from('heir_representatives').insert({ estate_id: A, heir_id: heir.id, user_id: REP, kind: 'fullmakt', basis: 'Skriftlig fullmakt datert i dag' }).select('id'))
  const [version] = await must(db.from('distribution_versions').insert({ estate_id: A, version_no: 1, snapshot: {}, state_hash: 'x', required: [{ heir_id: heir.id }], created_by: OWNER }).select('id'))
  await must(db.from('distribution_responses').insert({ version_id: version.id, heir_id: heir.id, heir_name: 'Arving A', responder: REP, representative_id: rep.id, decision: 'approve', item_id: item.id }))
  await must(db.from('ai_usage').insert({ user_id: OWNER, fn: 'analyze-item', estate_id: A, session_id: 'founder-delete-test' }))

  const storage = fakeSupabase({ storage: { 'item-images': { ...manyFiles(A, 3), ...manyFiles(B, 1), 'items/delt.jpg': {} }, 'estate-docs': {} } })
  const admin = { from: t => db.from(t), storage: storage.client.storage }
  const auth = `Bearer ${b64({ alg: 'none' })}.${b64({ sub: FOUNDER, aal: 'aal2' })}.x`
  const call = body => handleFounderDelete(new Request('https://x/founder-delete', { method: 'POST', headers: { Authorization: auth }, body: JSON.stringify(body) }), {
    preflight: () => null, getUser: async () => ({ id: FOUNDER }), admin: () => admin,
    json: (b, status = 200) => new Response(JSON.stringify(b), { status }), safeError: e => String(e?.message ?? e),
  })

  const dry = await (await call({ kind: 'estate', id: A, dry_run: true })).json()
  assert.equal(dry.confirm_with, 'Dødsbo A')
  assert.deepEqual(dry.counts.files, { documents: 0, images: 3 }, 'det delte bildet telles ikke med')

  const res = await call({ kind: 'estate', id: A, confirm: 'Dødsbo A' })
  assert.equal(res.status, 200, await res.clone().text())
  for (const [table, col, val] of [['estates', 'id', A], ['items', 'estate_id', A], ['heirs', 'estate_id', A], ['estate_members', 'estate_id', A],
    ['estate_events', 'estate_id', A], ['heir_representatives', 'estate_id', A], ['distribution_versions', 'estate_id', A],
    ['distribution_responses', 'version_id', version.id], ['interests', 'item_id', item.id]]) {
    assert.equal((await must(db.from(table).select('*').eq(col, val))).length, 0, `${table} fra bo A er borte`)
  }
  assert.equal((await must(db.from('items').select('id').eq('id', itemB.id))).length, 1, 'gjenstanden i bo B står')
  assert.equal((await must(db.from('estate_members').select('user_id').eq('estate_id', B))).length, 1)
  assert.ok(storage.buckets['item-images'].has('items/delt.jpg'), 'bildet bo B bruker, står')
  assert.equal([...storage.buckets['item-images'].keys()].filter(p => p.startsWith(A)).length, 0)
  const [usage] = await must(db.from('ai_usage').select('estate_id').eq('session_id', 'founder-delete-test'))
  assert.equal(usage.estate_id, null, 'AI-bruken følger kontoen, ikke boet (on delete set null)')
  const [log] = await must(db.from('founder_audit_log').select('*').eq('action', 'delete_estate'))
  assert.equal(log.founder_id, FOUNDER)
  assert.equal(log.details.status, 'ok')
  assert.equal(log.details.estate_id, A)
  assert.ok(!JSON.stringify(log).includes('Dødsbo'), 'loggen har ikke navnet på boet')

  await must(db.from('ai_usage').delete().eq('session_id', 'founder-delete-test'))
  await must(db.from('estates').delete().eq('id', B))
  await must(db.from('founder_audit_log').delete().eq('founder_id', FOUNDER))
  await must(db.from('founders').delete().eq('user_id', FOUNDER))
})
