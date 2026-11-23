import { supabase } from './supabase'

// Founder-tilgang håndheves i databasen (is_founder() krever founders-rad + aal2 i JWT).
// Funksjonene her er bare klientsiden av flyten. Se supabase/migrations/20261006_founder_security.sql.

export const amIFounder = async () => {
  const { data, error } = await supabase.rpc('am_i_founder')
  return !error && data === true
}

// 'aal2' betyr at tofaktor er bekreftet i denne sesjonen
export const getAssuranceLevel = async () => {
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  return data?.currentLevel || null
}

// Første bekreftede TOTP-faktor, eller null hvis tofaktor ikke er satt opp
export const getVerifiedTotpFactor = async () => {
  const { data } = await supabase.auth.mfa.listFactors()
  return data?.totp?.[0] || null
}

// Starter oppsett av tofaktor. Rydder bort halvferdige forsøk først, ellers feiler enroll.
export const enrollTotp = async () => {
  const { data: factors } = await supabase.auth.mfa.listFactors()
  const stale = (factors?.all || []).filter(f => f.factor_type === 'totp' && f.status === 'unverified')
  for (const f of stale) await supabase.auth.mfa.unenroll({ factorId: f.id })
  return supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'ArvKlart founder' })
}

// Bekrefter en 6-sifret kode. Ved suksess oppgraderes sesjonen til aal2.
export const verifyTotp = (factorId, code) =>
  supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() })

export const getFounderDashboard = () => supabase.rpc('founder_dashboard')

export const setUserPlan = (userId, plan) =>
  supabase.rpc('founder_set_plan', { p_user_id: userId, p_plan: plan })

export const listFounders = () => supabase.rpc('founder_list_founders')

export const addFounder = (email) => supabase.rpc('founder_add_founder', { p_email: email.trim() })

export const removeFounder = (userId) => supabase.rpc('founder_remove_founder', { p_user_id: userId })

// Sletting av et bo eller en kundekonto (edge-funksjonen founder-delete, GDPR art. 17). Bare founders med tofaktor.
// Først { dryRun: true } (antall + hva som må skrives for å bekrefte), så { confirm } med boets navn / kontoens e-post.
// Feil får en fast kode (not_founder, mfa_required, demo, self, founder, not_found, confirm_mismatch, delete_failed,
// not_deployed); aldri råtekst fra serveren.
export async function founderDelete({ kind, id, dryRun = false, confirm }) {
  const body = dryRun ? { kind, id, dry_run: true } : { kind, id, confirm }
  const { data, error } = await supabase.functions.invoke('founder-delete', { body })
  if (!error) return data
  let details = null
  try { details = await error.context?.json() } catch { /* ikke JSON */ }
  const status = error.context?.status
  // 404 uten vår egen kode betyr at funksjonen ikke er rullet ut (Supabase svarer da med sin egen feil)
  const code = status === 404 && details?.code !== 'not_found' ? 'not_deployed' : details?.code || 'delete_failed'
  throw Object.assign(new Error('founder-delete'), { code })
}
