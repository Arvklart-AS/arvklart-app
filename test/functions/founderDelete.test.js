// founder-delete (supabase/functions/_shared/founderDelete.ts): bare founders med tofaktor kan slette et bo eller en
// kundekonto, alltid med dry run først og bekreftelse med boets navn / kontoens e-post. Andre bo, kontoene til
// medlemmene, demoen og filer som deles med andre bo røres ikke. Hver sletting logges uten navn.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { fakeSupabase, manyFiles } from './fakeSupabase.js'

const TS = !!process.features?.typescript
const mod = TS ? await import('../../supabase/functions/_shared/founderDelete.ts') : null
const skip = !TS && 'Node uten TypeScript-støtte'

const FOUNDER = 'f0000000-0000-0000-0000-000000000001'
const FOUNDER2 = 'f0000000-0000-0000-0000-000000000002'
const KARI = 'a0000000-0000-0000-0000-00000000000a' // kunde, alene i bo A, medlem i delt bo B
const OLA = 'a0000000-0000-0000-0000-00000000000b'  // kunde, medlem i bo B
const MONA = 'a0000000-0000-0000-0000-00000000000d' // demokonto
const A = 'e0000000-0000-0000-0000-00000000000a'
const B = 'e0000000-0000-0000-0000-00000000000b'
const DEMO = 'deed0001-0000-0000-0000-000000000001'
const URL = 'https://p.supabase.co/storage/v1/object/public/item-images/'

const b64url = o => Buffer.from(JSON.stringify(o)).toString('base64url')
const jwt = claims => `${b64url({ alg: 'HS256' })}.${b64url(claims)}.sig`
const TOKENS = {
  founder: { user: { id: FOUNDER, email: 'founder@arvklart.no' }, aal: 'aal2' },
  'founder-aal1': { user: { id: FOUNDER, email: 'founder@arvklart.no' }, aal: 'aal1' },
  kunde: { user: { id: OLA, email: 'ola@test.no' }, aal: 'aal2' },
  demo: { user: { id: MONA, email: 'mona.demo@heirsplit.no', app_metadata: { arvklart_demo: 'mona' } }, aal: 'aal2' },
}
const bearer = name => `Bearer ${jwt({ sub: TOKENS[name].user.id, aal: TOKENS[name].aal })}`
const getUser = async req => Object.values(TOKENS).find(t => req.headers.get('Authorization') === `Bearer ${jwt({ sub: t.user.id, aal: t.aal })}`)?.user ?? null

const setup = (opts = {}) => fakeSupabase({
  tables: {
    founders: [{ user_id: FOUNDER }, { user_id: FOUNDER2 }],
    founder_audit_log: [],
    estates: [
      { id: A, name: 'Dødsbo etter Ragnhild', owner_id: KARI, branding_logo: null },
      { id: B, name: 'Bo Olsen', owner_id: OLA, branding_logo: URL + 'logos/felles.png' },
      { id: DEMO, name: 'Demo', owner_id: MONA, branding_logo: null },
    ],
    estate_members: [
      { id: 1, estate_id: A, user_id: KARI, role: 'admin', joined_at: '1' },
      { id: 2, estate_id: B, user_id: OLA, role: 'admin', joined_at: '1' },
      { id: 3, estate_id: B, user_id: KARI, role: 'member', joined_at: '2' },
      { id: 4, estate_id: DEMO, user_id: MONA, role: 'admin', joined_at: '1' },
    ],
    heirs: [{ id: 'h1', estate_id: A, name: 'Kari' }, { id: 'h2', estate_id: B, name: 'Ola' }],
    items: [
      { id: 'i1', estate_id: A, title: 'Gyngestol', image_url: URL + 'items/felles.jpg', extra_images: [URL + `${A}/a1.jpg`], value_suggestions: [], value_voter_ids: [], ai_analysis: null },
      { id: 'i2', estate_id: A, title: 'Lampe', image_url: URL + 'items/bare-a.jpg', extra_images: [], value_suggestions: [], value_voter_ids: [], ai_analysis: null },
      { id: 'i3', estate_id: B, title: 'Klokke', image_url: URL + 'items/felles.jpg', extra_images: [], value_suggestions: [], value_voter_ids: [], ai_analysis: null },
    ],
    documents: [
      { id: 'd1', estate_id: A, file_path: `documents/${A}/testament.pdf` },
      { id: 'd2', estate_id: A, file_path: 'documents/eldre/felles.pdf' },
      { id: 'd3', estate_id: B, file_path: 'documents/eldre/felles.pdf' },
    ],
    feedback: [{ id: 'f1', estate_id: A, user_id: KARI, content: 'om A' }, { id: 'f2', estate_id: B, user_id: OLA, content: 'om B' }],
    interests: [{ id: 1, item_id: 'i3', user_id: KARI }],
    item_passes: [], comments: [], profiles: [{ id: 1, user_id: KARI }, { id: 2, user_id: OLA }],
  },
  storage: {
    'item-images': { ...manyFiles(A, 3), [`${A}/a1.jpg`]: {}, ...manyFiles(B, 2), 'items/felles.jpg': {}, 'items/bare-a.jpg': {}, 'logos/felles.png': {} },
    'estate-docs': { [`documents/${A}/testament.pdf`]: {}, 'documents/eldre/felles.pdf': {}, [`documents/${B}/x.pdf`]: {} },
  },
  users: [
    { id: KARI, email: 'Kari@Test.no' }, { id: OLA, email: 'ola@test.no' }, { id: FOUNDER2, email: 'f2@arvklart.no' },
    { id: MONA, email: 'mona.demo@heirsplit.no', app_metadata: { arvklart_demo: 'mona' } },
  ],
  ...opts,
})

const json = (body, status = 200) => new Response(JSON.stringify(body), { status })
const preflight = req => (req.method === 'OPTIONS' ? new Response('ok') : null)
const call = async (fake, who, body, { method = 'POST', extra = {} } = {}) => {
  const lines = []
  const req = new Request('https://x/functions/v1/founder-delete', {
    method, headers: who ? { Authorization: bearer(who) } : {}, body: body && method !== 'GET' ? JSON.stringify(body) : undefined,
  })
  const res = await mod.handleFounderDelete(req, { preflight, getUser, json, admin: () => fake.client, log: l => lines.push(l), safeError: e => String(e?.message ?? e), ...extra })
  return { status: res.status, body: await res.json().catch(() => null), lines }
}
const files = (fake, bucket) => [...fake.buckets[bucket].keys()].sort()
const snapshot = fake => JSON.stringify(fake.db) + files(fake, 'item-images') + files(fake, 'estate-docs')

describe('founder-delete: tilgang', { skip }, () => {
  test('aalOf leser tofaktornivået fra JWT-en', () => {
    const r = who => new Request('https://x', { headers: { Authorization: bearer(who) } })
    assert.equal(mod.aalOf(r('founder')), 'aal2')
    assert.equal(mod.aalOf(r('founder-aal1')), 'aal1')
    assert.equal(mod.aalOf(new Request('https://x', { headers: { Authorization: 'Bearer tull' } })), null)
    assert.equal(mod.aalOf(new Request('https://x')), null)
  })

  for (const [name, who, status, code] of [
    ['uten innlogging', null, 401, 'unauthorized'],
    ['vanlig kunde (også administrator i eget bo)', 'kunde', 403, 'not_founder'],
    ['demokontoen', 'demo', 403, 'not_founder'],
    ['founder uten tofaktor i denne økten', 'founder-aal1', 403, 'mfa_required'],
  ]) {
    test(`${name} → ${status} og ingenting endres`, async () => {
      const fake = setup()
      const before = snapshot(fake)
      for (const body of [{ kind: 'estate', id: A, dry_run: true }, { kind: 'estate', id: B, confirm: 'Bo Olsen' }, { kind: 'user', id: KARI, confirm: 'kari@test.no' }]) {
        const r = await call(fake, who, body)
        assert.equal(r.status, status)
        assert.equal(r.body.code, code)
      }
      assert.equal(snapshot(fake), before)
      assert.deepEqual(fake.deletedUsers, [])
    })
  }

  test('bare POST', async () => {
    const fake = setup()
    assert.equal((await call(fake, 'founder', null, { method: 'GET' })).status, 405)
    assert.equal((await call(fake, 'founder', null, { method: 'OPTIONS' })).status, 200)
  })

  test('ugyldig forespørsel → 400', async () => {
    const fake = setup()
    for (const body of [{}, { kind: 'item', id: A }, { kind: 'estate', id: 'ikke-en-id' }, { kind: 'user' }]) {
      assert.equal((await call(fake, 'founder', body)).status, 400)
    }
  })
})

describe('founder-delete: bo', { skip }, () => {
  test('dry run viser antall og hva som må skrives, uten å endre noe', async () => {
    const fake = setup()
    const before = snapshot(fake)
    const r = await call(fake, 'founder', { kind: 'estate', id: A, dry_run: true })
    assert.equal(r.status, 200)
    assert.equal(r.body.confirm_with, 'Dødsbo etter Ragnhild')
    assert.deepEqual(r.body.counts, { members: 1, heirs: 1, items: 2, documents: 2, feedback: 1, files: { documents: 1, images: 5 } })
    assert.equal(snapshot(fake), before)
    assert.deepEqual(fake.mutations, [])
  })

  test('feil bekreftelse → 400, ingenting slettes og ingenting logges', async () => {
    const fake = setup()
    const before = snapshot(fake)
    for (const confirm of [undefined, '', 'Bo Olsen', 'dødsbo etter ragnhild', A]) {
      const r = await call(fake, 'founder', { kind: 'estate', id: A, confirm })
      assert.equal(r.status, 400)
      assert.equal(r.body.code, 'confirm_mismatch')
    }
    assert.equal(snapshot(fake), before)
  })

  test('sletter bare det valgte boet; delte filer, andre bo og kontoene består', async () => {
    const fake = setup()
    const r = await call(fake, 'founder', { kind: 'estate', id: A, confirm: '  Dødsbo  etter Ragnhild ' })
    assert.equal(r.status, 200, JSON.stringify(r.body))

    assert.deepEqual(fake.db.estates.map(e => e.id).sort(), [B, DEMO].sort())
    for (const t of ['items', 'documents', 'heirs', 'estate_members', 'feedback']) {
      assert.ok(!fake.db[t].some(row => row.estate_id === A), `${t} fra A er borte`)
    }
    assert.deepEqual(fake.db.items.map(i => i.id), ['i3'], 'gjenstanden i B står')
    assert.deepEqual(fake.db.feedback.map(f => f.id), ['f2'])
    assert.ok(fake.db.estate_members.some(m => m.estate_id === B && m.user_id === KARI), 'Kari er fortsatt med i B')
    assert.deepEqual(fake.deletedUsers, [], 'ingen kontoer slettes')

    assert.deepEqual(files(fake, 'item-images'), [...Object.keys(manyFiles(B, 2)), 'items/felles.jpg', 'logos/felles.png'].sort(),
      'As mappe og bildet bare A brukte er borte; bildet og logoen B bruker står')
    assert.deepEqual(files(fake, 'estate-docs'), ['documents/eldre/felles.pdf', `documents/${B}/x.pdf`].sort())

    const [log] = fake.db.founder_audit_log
    assert.equal(log.action, 'delete_estate')
    assert.equal(log.founder_id, FOUNDER)
    assert.equal(log.details.status, 'ok')
    assert.equal(log.details.estate_id, A)
    const text = JSON.stringify(fake.db.founder_audit_log) + r.lines.join('')
    for (const secret of ['Ragnhild', 'Gyngestol', 'testament', '.jpg', 'Kari']) assert.ok(!text.includes(secret), `loggen har ikke «${secret}»`)
  })

  test('demoboet kan ikke slettes, heller ikke med riktig navn', async () => {
    const fake = setup()
    const before = snapshot(fake)
    for (const body of [{ kind: 'estate', id: DEMO, dry_run: true }, { kind: 'estate', id: DEMO, confirm: 'Demo' }]) {
      const r = await call(fake, 'founder', body)
      assert.equal(r.status, 403)
      assert.equal(r.body.code, 'demo')
    }
    assert.equal(snapshot(fake), before)
  })

  test('ukjent bo → 404', async () => {
    const r = await call(setup(), 'founder', { kind: 'estate', id: 'e0000000-0000-0000-0000-0000000000ff', dry_run: true })
    assert.equal(r.status, 404)
  })

  test('feiler filslettingen, står boet igjen og loggen sier «failed»; nytt forsøk fullfører', async () => {
    let broken = true
    const fake = setup({ failRemove: () => (broken ? 'error' : false) })
    const first = await call(fake, 'founder', { kind: 'estate', id: A, confirm: 'Dødsbo etter Ragnhild' })
    assert.equal(first.status, 500)
    assert.equal(first.body.code, 'delete_failed')
    assert.ok(fake.db.estates.some(e => e.id === A))
    assert.equal(fake.db.founder_audit_log[0].details.status, 'failed')
    assert.equal(fake.db.founder_audit_log[0].details.estate_id, A)

    broken = false
    const second = await call(fake, 'founder', { kind: 'estate', id: A, confirm: 'Dødsbo etter Ragnhild' })
    assert.equal(second.status, 200)
    assert.ok(!fake.db.estates.some(e => e.id === A))
  })

  test('kan ikke slettingen logges, slettes ingenting', async () => {
    const fake = setup({ failInsert: true })
    const r = await call(fake, 'founder', { kind: 'estate', id: A, confirm: 'Dødsbo etter Ragnhild' })
    assert.equal(r.status, 500)
    assert.equal(fake.db.estates.length, 3)
    assert.equal(fake.mutations.filter(m => m.op !== 'insert').length, 0)
  })
})

describe('founder-delete: kundekonto', { skip }, () => {
  test('dry run viser hva som skjer med kontoen', async () => {
    const fake = setup()
    const before = snapshot(fake)
    const r = await call(fake, 'founder', { kind: 'user', id: KARI, dry_run: true })
    assert.equal(r.status, 200)
    assert.equal(r.body.confirm_with, 'kari@test.no')
    assert.deepEqual(r.body.counts, { estates_deleted: 1, estates_kept: 1, interests: 1, feedback: 1 })
    assert.equal(snapshot(fake), before)
  })

  test('sletter kontoen som ved egen sletting: bo kunden er alene om slettes, delte bo består', async () => {
    const fake = setup()
    const r = await call(fake, 'founder', { kind: 'user', id: KARI, confirm: 'KARI@test.no ' })
    assert.equal(r.status, 200, JSON.stringify(r.body))
    assert.deepEqual(fake.deletedUsers, [KARI])
    assert.ok(!fake.db.estates.some(e => e.id === A), 'bo A (bare Kari) er slettet')
    assert.ok(fake.db.estates.some(e => e.id === B), 'delt bo B består')
    assert.ok(!fake.db.estate_members.some(m => m.user_id === KARI))
    assert.ok(fake.db.estate_members.some(m => m.user_id === OLA))
    assert.ok(fake.buckets['item-images'].has('items/felles.jpg'), 'bildet B bruker står')
    const [log] = fake.db.founder_audit_log
    assert.equal(log.action, 'delete_user')
    assert.equal(log.details.user_id, KARI)
    assert.equal(log.details.status, 'ok')
    assert.ok(!JSON.stringify(log).toLowerCase().includes('kari@'), 'loggen har ikke e-posten')
  })

  for (const [name, id, code] of [
    ['egen konto', FOUNDER, 'self'],
    ['en annen founder', FOUNDER2, 'founder'],
    ['demokontoen', MONA, 'demo'],
  ]) {
    test(`${name} kan ikke slettes herfra (${code})`, async () => {
      const fake = setup()
      const r = await call(fake, 'founder', { kind: 'user', id, dry_run: true })
      assert.equal(r.status, 403)
      assert.equal(r.body.code, code)
      assert.deepEqual(fake.deletedUsers, [])
    })
  }

  test('feil e-post → 400, ingenting slettes', async () => {
    const fake = setup()
    const r = await call(fake, 'founder', { kind: 'user', id: KARI, confirm: 'ola@test.no' })
    assert.equal(r.status, 400)
    assert.deepEqual(fake.deletedUsers, [])
    assert.equal(fake.db.founder_audit_log.length, 0)
  })

  test('ukjent konto → 404', async () => {
    const r = await call(setup(), 'founder', { kind: 'user', id: 'a0000000-0000-0000-0000-0000000000ff', dry_run: true })
    assert.equal(r.status, 404)
  })
})
