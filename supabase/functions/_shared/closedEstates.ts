// Automatisk sletting av bo som har vært avsluttet lenger enn en fastsatt lagringstid. IKKE I DRIFT: ingen cron,
// og appen og personvernerklæringen lover ingen frist. Lagringstiden er ikke vedtatt, så jobben har ingen standard:
// uten hemmeligheten CLOSED_ESTATE_RETENTION_MONTHS (heltall 1–120) nekter den å kjøre, også som dry_run
// (fail closed). Se docs/sletting-av-bo.md før den settes i drift.
// Logikken ligger her (ikke i index.ts) så den kan testes uten Deno: test/functions/closedEstates.test.js.
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { countEstateFiles, deleteEstate } from './estateFiles.ts'
import { finishRun, hasValidCronSecret, httpStatus, readDryRun, runStatus, safeError, startRun } from './cleanup.ts'

const JOB = 'cleanup-closed-estates'

// Lagringstiden i hele måneder, eller null når den mangler eller er ugyldig (da kjører ingenting)
export function parseRetentionMonths(value: string | undefined | null): number | null {
  if (!value || !/^\d{1,3}$/.test(value.trim())) return null
  const n = Number(value.trim())
  return n >= 1 && n <= 120 ? n : null
}

export function cutoffDate(now: Date, months: number) {
  const d = new Date(now)
  d.setUTCMonth(d.getUTCMonth() - months)
  return d
}

export async function findExpiredEstates(admin: SupabaseClient, now: Date, months: number): Promise<string[]> {
  const { data, error } = await admin.from('estates')
    .select('id').eq('status', 'closed').lt('closed_at', cutoffDate(now, months).toISOString()).order('closed_at')
  if (error) throw error
  return (data || []).map(e => e.id)
}

// Bare lesing: antall rader og filer per bo som ville blitt slettet. Ingen navn, titler eller filstier.
export async function describeEstate(admin: SupabaseClient, estateId: string) {
  const count = async (table: string, column = 'estate_id') => {
    const { count, error } = await admin.from(table).select('id', { count: 'exact', head: true }).eq(column, estateId)
    if (error) throw error
    return count ?? 0
  }
  return {
    id: estateId,
    items: await count('items'),
    documents: await count('documents'),
    feedback: await count('feedback'),
    files: await countEstateFiles(admin, estateId),
  }
}

type Deps = { secret: string | undefined; retentionMonths: number | null; admin: () => SupabaseClient; now?: Date; log?: (line: string) => void }

export async function handleCleanupClosedEstates(req: Request, deps: Deps): Promise<{ status: number; body: unknown }> {
  if (!hasValidCronSecret(req.headers.get('x-cron-secret'), deps.secret)) return { status: 401, body: { error: 'Unauthorized' } }
  if (req.method !== 'POST') return { status: 405, body: { error: 'Bruk POST' } }

  const months = deps.retentionMonths
  if (!months) return { status: 503, body: { error: 'retention_not_configured' } }

  const log = deps.log ?? console.log
  const now = deps.now ?? new Date()
  const { dryRun } = await readDryRun(req)
  const admin = deps.admin()
  const estates = await findExpiredEstates(admin, now, months)

  if (dryRun) {
    const plan = []
    for (const id of estates) plan.push(await describeEstate(admin, id))
    log(JSON.stringify({ job: JOB, dry_run: true, estates: plan.length }))
    return { status: 200, body: { dry_run: true, cutoff: cutoffDate(now, months).toISOString(), retention_months: months, estates: plan } }
  }

  const runId = await startRun(admin, JOB)
  const deleted: string[] = []
  const failed: { id: string; error: string }[] = []
  let files = 0
  for (const id of estates) {
    try {
      files += (await deleteEstate(admin, id)).removed
      deleted.push(id)
    } catch (e) {
      failed.push({ id, error: safeError(e) })
    }
  }
  const status = runStatus(deleted.length, failed.length)
  await finishRun(admin, runId, status, deleted.length, failed.length, { deleted, failed, files })
  log(JSON.stringify({ job: JOB, run_id: runId, status, deleted: deleted.length, failed: failed.length, files }))
  return { status: httpStatus(status), body: { run_id: runId, status, deleted, failed } }
}
