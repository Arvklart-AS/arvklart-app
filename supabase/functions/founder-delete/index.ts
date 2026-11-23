// Sletting av et bo eller en kundekonto fra founder-dashboardet (/founder), på forespørsel (GDPR art. 17).
// Bare founders med tofaktor (aal2). Logikken og reglene står i _shared/founderDelete.ts.
// Deployes med --no-verify-jwt: innloggingen sjekkes her med getUser() mot Supabase Auth, og founder-rollen og
// tofaktor sjekkes etterpå (founders-tabellen og aal i den samme JWT-en).
import { adminClient, getUser, json, preflight } from '../_shared/http.ts'
import { handleFounderDelete } from '../_shared/founderDelete.ts'
import { safeError } from '../_shared/cleanup.ts'

Deno.serve(req => handleFounderDelete(req, {
  preflight, getUser, json, safeError,
  admin: adminClient,
  log: line => console.log(line),
}))
