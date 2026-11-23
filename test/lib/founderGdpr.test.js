import { test } from 'node:test'
import assert from 'node:assert/strict'
import { searchDeletable, summarizeLog, monthsSince, shortId, DEMO_ESTATE_ID } from '../../src/lib/founderGdpr.js'

const estates = [
  { id: 'e1', name: 'Dødsbo etter Ragnhild', profiles: { display_name: 'Kari Nordmann', email: 'kari@test.no' } },
  { id: 'e2', name: 'Bo Olsen', profiles: { display_name: 'Ola', email: 'ola@test.no' } },
  { id: DEMO_ESTATE_ID, name: 'Demo: Dødsbo', profiles: { display_name: 'Mona', email: 'mona.demo@heirsplit.no' } },
]
const profiles = [
  { user_id: 'u1', display_name: 'Kari Nordmann', email: 'kari@test.no' },
  { user_id: 'u2', display_name: 'Ola', email: 'ola@test.no' },
  { user_id: 'me', display_name: 'Founder', email: 'founder@arvklart.no' },
]

test('søket finner bo og kontoer på navn og e-post, uten demoboet og egen konto', () => {
  assert.deepEqual(searchDeletable('dødsbo', estates, profiles, 'me').estates.map(e => e.id), ['e1'])
  assert.deepEqual(searchDeletable('DODSBO', estates, profiles, 'me').estates.map(e => e.id), ['e1'])
  const kari = searchDeletable('kari@', estates, profiles, 'me')
  assert.deepEqual(kari.estates.map(e => e.id), ['e1'])
  assert.deepEqual(kari.users.map(u => u.user_id), ['u1'])
  assert.deepEqual(searchDeletable('founder', estates, profiles, 'me').users, [])
  assert.deepEqual(searchDeletable('k', estates, profiles, 'me'), { estates: [], users: [] })
  assert.deepEqual(searchDeletable('  ', estates, profiles, 'me'), { estates: [], users: [] })
})

test('loggen oppsummeres: fullførte, uferdige og siste 30 dager', () => {
  const now = new Date('2026-11-23T12:00:00Z')
  const log = [
    { status: 'ok', created_at: '2026-11-20T00:00:00Z' },
    { status: 'ok', created_at: '2026-09-01T00:00:00Z' },
    { status: 'failed', created_at: '2026-11-21T00:00:00Z' },
    { status: 'started', created_at: '2026-11-22T00:00:00Z' },
  ]
  assert.deepEqual(summarizeLog(log, now), { done: 2, unfinished: 2, last30: 1 })
  assert.deepEqual(summarizeLog([], now), { done: 0, unfinished: 0, last30: 0 })
})

test('hele måneder siden avslutning', () => {
  const now = new Date(2026, 10, 23)
  assert.equal(monthsSince(new Date(2025, 10, 23), now), 12)
  assert.equal(monthsSince(new Date(2025, 10, 24), now), 11)
  assert.equal(monthsSince(new Date(2026, 11, 1), now), 0)
  assert.equal(monthsSince('tull', now), 0)
  assert.equal(shortId('e0000000-0000-0000-0000-00000000000a'), 'e0000000')
  assert.equal(shortId(null), '—')
})
