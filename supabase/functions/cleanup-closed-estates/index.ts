// Sletter bo som har vært avsluttet lenger enn lagringstiden, med alle filer og tilbakemeldinger knyttet til boet.
// IKKE I DRIFT: ingen cron, og ingen frist er lovet. Lagringstiden er ikke vedtatt (docs/sletting-av-bo.md), så
// funksjonen nekter å kjøre (503 retention_not_configured) til CLOSED_ESTATE_RETENTION_MONTHS er satt.
// Kalles med headeren x-cron-secret (se supabase/README.md). POST ?dry_run=1 viser hva som ville blitt slettet.
//
// Hemmeligheter: CRON_SECRET (minst 32 tilfeldige tegn) og CLOSED_ESTATE_RETENTION_MONTHS (heltall 1–120).
import { adminClient, json, preflight } from '../_shared/http.ts'
import { handleCleanupClosedEstates, parseRetentionMonths } from '../_shared/closedEstates.ts'
import { safeError } from '../_shared/cleanup.ts'

Deno.serve(async (req) => {
  const pre = preflight(req)
  if (pre) return pre
  try {
    const { status, body } = await handleCleanupClosedEstates(req, {
      secret: Deno.env.get('CRON_SECRET'),
      retentionMonths: parseRetentionMonths(Deno.env.get('CLOSED_ESTATE_RETENTION_MONTHS')),
      admin: adminClient,
    })
    return json(body, status)
  } catch (e) {
    console.error(JSON.stringify({ job: 'cleanup-closed-estates', error: safeError(e) }))
    return json({ error: safeError(e) }, 500)
  }
})
