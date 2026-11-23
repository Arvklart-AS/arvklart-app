// Sletting av et bo eller en kundekonto fra founder-dashboardet (/founder), på forespørsel etter GDPR art. 17.
// Bare founders med tofaktor (aal2) kan slette; kunder kan ikke slette et bo selv (de kan bare slette sin egen konto
// under «Min konto», delete-account). Testes i test/functions/founderDelete.test.js.
//
// Flyten er alltid to kall:
//   1. { kind, id, dry_run: true }  → hva som ville blitt slettet (antall), og hva som må skrives for å bekrefte
//   2. { kind, id, confirm }        → slettingen; confirm må være boets navn eller kontoens e-post
//
// • Bo: deleteEstate (filer som også brukes av et annet bo, slettes ikke; tilbakemeldinger knyttet til boet; boet med
//   alt innhold via on delete cascade). Kontoene til medlemmene består.
// • Konto: deleteAccountData, samme sletting som når kunden sletter kontoen selv (bo kunden er alene om slettes,
//   i delte bo fjernes navnet og administratorrollen gis videre).
// • Aldri demoboet eller demokontoene, aldri egen konto (bruk «Min konto») og aldri en annen founder (fjern
//   founder-rollen først).
// • Hver sletting logges i founder_audit_log før den starter og oppdateres med utfallet: bare id-er og antall,
//   ingen navn, e-post, titler eller filstier. Kan ikke loggen skrives, slettes ingenting.
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { countEstateFiles, deleteEstate } from './estateFiles.ts'
import { deleteAccountData } from './deleteAccount.ts'
import { isDemoUser } from './demoIdentity.ts'

export const DEMO_ESTATE_ID = 'deed0001-0000-0000-0000-000000000001'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type User = { id: string; email?: string | null; app_metadata?: Record<string, unknown> | null }
export type FounderDeleteDeps = {
  preflight: (req: Request) => Response | null
  getUser: (req: Request) => Promise<User | null>
  admin: () => SupabaseClient
  json: (body: unknown, status?: number) => Response
  log?: (line: string) => void
  safeError?: (e: unknown) => unknown
  deleteEstate?: (admin: SupabaseClient, estateId: string) => Promise<unknown>
  deleteAccount?: (admin: SupabaseClient, userId: string) => Promise<Record<string, unknown>>
}

// Tofaktornivået i JWT-en. Leses bare etter at getUser() har godtatt den samme JWT-en hos Supabase Auth.
export function aalOf(req: Request): string | null {
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
  const part = token.split('.')[1]
  if (!part) return null
  try {
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=')
    const claims = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0))))
    return typeof claims?.aal === 'string' ? claims.aal : null
  } catch {
    return null
  }
}

const norm = (s: unknown) => String(s ?? '').trim().replace(/\s+/g, ' ')
const must = <T>(res: { data: T; error: unknown }) => {
  if (res.error) throw res.error
  return res.data
}

async function count(admin: SupabaseClient, table: string, column: string, value: string) {
  const { count, error } = await admin.from(table).select('id', { count: 'exact', head: true }).eq(column, value)
  if (error) throw error
  return count ?? 0
}

// Hva som ville blitt slettet med boet (bare antall)
async function describeEstate(admin: SupabaseClient, estateId: string) {
  return {
    members: await count(admin, 'estate_members', 'estate_id', estateId),
    heirs: await count(admin, 'heirs', 'estate_id', estateId),
    items: await count(admin, 'items', 'estate_id', estateId),
    documents: await count(admin, 'documents', 'estate_id', estateId),
    feedback: await count(admin, 'feedback', 'estate_id', estateId),
    files: await countEstateFiles(admin, estateId),
  }
}

// Hva som skjer med kontoen (bare antall): bo kunden er alene om slettes, delte bo beholdes uten navnet
async function describeUser(admin: SupabaseClient, userId: string) {
  const memberships = must(await admin.from('estate_members').select('estate_id').eq('user_id', userId)) as { estate_id: string }[] || []
  let soleEstates = 0
  for (const { estate_id } of memberships) {
    if ((await count(admin, 'estate_members', 'estate_id', estate_id)) <= 1) soleEstates++
  }
  return {
    estates_deleted: soleEstates,
    estates_kept: memberships.length - soleEstates,
    interests: await count(admin, 'interests', 'user_id', userId),
    feedback: await count(admin, 'feedback', 'user_id', userId),
  }
}

export async function handleFounderDelete(req: Request, d: FounderDeleteDeps): Promise<Response> {
  const pre = d.preflight(req)
  if (pre) return pre
  const fail = (code: string, status: number) => d.json({ success: false, code }, status)
  if (req.method !== 'POST') return fail('method_not_allowed', 405)

  let audit: { id: string; details: Record<string, unknown> } | null = null
  let admin: SupabaseClient | null = null
  // Loggraden skrives før slettingen starter; feiler skrivingen, kastes feilen og ingenting slettes
  const startAudit = async (row: Record<string, unknown>, details: Record<string, unknown>) => {
    const res = await admin!.from('founder_audit_log').insert({ ...row, details: { ...details, status: 'started' } }).select('id').single()
    if (res.error) throw res.error
    audit = { id: (res.data as { id: string }).id, details }
  }
  const finishAudit = async (extra: Record<string, unknown>) =>
    must(await admin!.from('founder_audit_log').update({ details: { ...audit!.details, status: 'ok', ...extra } }).eq('id', audit!.id))
  try {
    const user = await d.getUser(req)
    if (!user?.id) return fail('unauthorized', 401)
    if (isDemoUser(user)) return fail('not_founder', 403)
    admin = d.admin()
    const founder = must(await admin.from('founders').select('user_id').eq('user_id', user.id).maybeSingle())
    if (!founder) return fail('not_founder', 403)
    if (aalOf(req) !== 'aal2') return fail('mfa_required', 403)

    let body: Record<string, unknown> = {}
    try { body = await req.json() } catch { /* tom body */ }
    const kind = body.kind
    const id = typeof body.id === 'string' ? body.id : ''
    const dryRun = body.dry_run === true
    if ((kind !== 'estate' && kind !== 'user') || !UUID.test(id)) return fail('invalid_request', 400)

    if (kind === 'estate') {
      if (id === DEMO_ESTATE_ID) return fail('demo', 403)
      const estate = must(await admin.from('estates').select('id, name').eq('id', id).maybeSingle()) as { id: string; name: string } | null
      if (!estate) return fail('not_found', 404)
      const counts = await describeEstate(admin, id)
      if (dryRun) return d.json({ success: true, dry_run: true, kind, confirm_with: estate.name, counts })
      if (!norm(estate.name) || norm(body.confirm) !== norm(estate.name)) return fail('confirm_mismatch', 400)

      await startAudit({ founder_id: user.id, action: 'delete_estate' }, { estate_id: id, counts })
      await (d.deleteEstate ?? deleteEstate)(admin, id)
      await finishAudit({})
      d.log?.(JSON.stringify({ fn: 'founder-delete', kind, status: 'ok' }))
      return d.json({ success: true, kind, counts })
    }

    // kind === 'user'
    if (id === user.id) return fail('self', 403)
    const { data: target, error: targetError } = await admin.auth.admin.getUserById(id)
    if (targetError || !target?.user) return fail('not_found', 404)
    if (isDemoUser(target.user)) return fail('demo', 403)
    const otherFounder = must(await admin.from('founders').select('user_id').eq('user_id', id).maybeSingle())
    if (otherFounder) return fail('founder', 403)
    const email = (target.user.email || '').toLowerCase()
    const counts = await describeUser(admin, id)
    if (dryRun) return d.json({ success: true, dry_run: true, kind, confirm_with: email, counts })
    if (!email || norm(body.confirm).toLowerCase() !== email) return fail('confirm_mismatch', 400)

    // target_user_id blir null når kontoen slettes (on delete set null); id-en står i details
    await startAudit({ founder_id: user.id, action: 'delete_user', target_user_id: id }, { user_id: id, counts })
    const result = await (d.deleteAccount ?? deleteAccountData)(admin, id)
    await finishAudit({ result })
    d.log?.(JSON.stringify({ fn: 'founder-delete', kind, status: 'ok' }))
    return d.json({ success: true, kind, counts })
  } catch (e) {
    const error = d.safeError ? d.safeError(e) : 'error'
    d.log?.(JSON.stringify({ fn: 'founder-delete', error }))
    // Loggraden viser at slettingen feilet; den kan prøves på nytt med samme resultat
    const started = audit as { id: string; details: Record<string, unknown> } | null
    if (started && admin) {
      try { await admin.from('founder_audit_log').update({ details: { ...started.details, status: 'failed', error } }).eq('id', started.id) } catch { /* logget over */ }
    }
    return fail('delete_failed', 500)
  }
}
