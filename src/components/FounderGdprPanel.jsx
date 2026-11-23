import { useEffect, useMemo, useState } from 'react'
import { founderDeletionOverview } from '../lib/founder'
import { founderDeleteMessage } from './FounderDeleteDialog'
import { searchDeletable, summarizeLog, monthsSince, shortId } from '../lib/founderGdpr'
import { L, locale } from '../lib/lang'

// Fanen «Sletting (GDPR)» i founder-dashboardet: om slettefunksjonen er rullet ut, sletting på forespørsel (søk),
// rutinen, sletteloggen, avsluttede bo og forslaget til lagringstider. Selve slettingen skjer i FounderDeleteDialog
// (onDelete åpner den). Dataene kommer fra edge-funksjonen founder-delete ({ action: 'overview' }), fordi
// founder_audit_log bare kan leses med service role. Lyst oppsett (produktpaletten), som resten av /founder.
const INK = '#1F2326', SLATE = '#575B5E', LINE = '#CFC8BA', PAPER = '#F5F2EB', RUST = '#9A3B2E', SPRUCE = '#2F4A43', BRASS = '#8A5A34'

const DEPLOY_CMD = 'supabase functions deploy founder-delete --no-verify-jwt --use-api'

const card = { background: '#fff', border: `1px solid ${LINE}`, borderRadius: '12px', padding: '20px' }
const h2 = { fontFamily: 'Fraunces, serif', fontSize: '1.125rem', fontWeight: 400, color: INK, margin: '0 0 6px' }
const lead = { fontSize: '0.875rem', color: SLATE, lineHeight: 1.6, margin: '0 0 14px' }
const th = { padding: '10px 12px', textAlign: 'left', fontSize: '0.75rem', color: SLATE, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }
const td = { padding: '10px 12px', fontSize: '0.8125rem', color: INK, verticalAlign: 'top' }
const pill = (color) => ({ display: 'inline-block', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '999px', border: `1px solid ${color}`, color, whiteSpace: 'nowrap' })
const deleteBtn = { padding: '5px 12px', borderRadius: '999px', border: `1px solid ${RUST}`, background: 'transparent', color: RUST, fontSize: '0.75rem', fontFamily: 'Karla, sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }

const fmtDate = (d, withTime = false) => new Date(d).toLocaleString(locale(), withTime
  ? { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  : { day: 'numeric', month: 'short', year: 'numeric' })

const statusOf = s => s === 'ok'
  ? { text: L('Fullført', 'Completed'), color: SPRUCE }
  : s === 'failed' ? { text: L('Feilet', 'Failed'), color: RUST } : { text: L('Ikke fullført', 'Not completed'), color: RUST }

function scope(row) {
  const c = row.counts || {}
  if (row.kind === 'estate') {
    const files = (c.files?.images ?? 0) + (c.files?.documents ?? 0)
    return L(`${c.items ?? 0} gjenstander · ${files} filer · ${c.members ?? 0} medlemmer`, `${c.items ?? 0} items · ${files} files · ${c.members ?? 0} members`)
  }
  return L(`${c.estates_deleted ?? 0} bo slettet · ${c.estates_kept ?? 0} delte bo beholdt`, `${c.estates_deleted ?? 0} estates deleted · ${c.estates_kept ?? 0} shared estates kept`)
}

const RETENTION = () => [
  [L('Konto og profil', 'Account and profile'), L('Til kunden sletter kontoen. Forslag: varsel etter 24 måneder uten innlogging', 'Until the customer deletes it. Proposal: notice after 24 months without sign-in')],
  [L('Aktivt bo', 'Active estate'), L('Så lenge boet er i bruk', 'As long as the estate is in use')],
  [L('Avsluttet bo', 'Closed estate'), L('Forslag: 12 måneder etter avslutning, med varsel 30 dager før', 'Proposal: 12 months after closing, with notice 30 days before')],
  [L('AI-bruk', 'AI usage'), L('Forslag: 13 måneder; slettes alltid med kontoen', 'Proposal: 13 months; always deleted with the account')],
  [L('Tilbakemeldinger', 'Feedback'), L('Forslag: 24 måneder, eller til kontoen eller boet slettes', 'Proposal: 24 months, or until the account or estate is deleted')],
  [L('Sletteloggen', 'Deletion log'), L('Forslag: 5 år (bare id-er og antall)', 'Proposal: 5 years (ids and counts only)')],
  [L('Sikkerhetskopier', 'Backups'), L('Supabase-planens rotasjon', 'The Supabase plan’s rotation')],
  [L('Betaling og faktura', 'Payments and invoices'), L('5 år etter regnskapsårets slutt (bokføringsloven § 13)', '5 years after the end of the financial year (Bookkeeping Act § 13)')],
]

export default function FounderGdprPanel({ estates, profiles, selfId, refreshKey, onDelete }) {
  const [data, setData] = useState(null)
  const [errorCode, setErrorCode] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let live = true
    setErrorCode(null)
    founderDeletionOverview()
      .then(d => { if (live) setData(d) })
      .catch(e => { if (live) { setData(null); setErrorCode(e.code || 'delete_failed') } })
    return () => { live = false }
  }, [refreshKey])

  const results = useMemo(() => searchDeletable(query, estates, profiles, selfId), [query, estates, profiles, selfId])
  const nameOf = useMemo(() => {
    const m = new Map(profiles.map(p => [p.user_id, p.display_name || p.email]))
    return id => (id ? m.get(id) || L('Tidligere founder', 'Former founder') : '—')
  }, [profiles])

  const loading = !data && !errorCode
  const notDeployed = errorCode === 'not_deployed' || errorCode === 'unreachable'
  const log = data?.log || []
  const sum = summarizeLog(log)
  const closed = data?.closed_estates || []
  const estateById = new Map(estates.map(e => [e.id, e]))
  const profileById = new Map(profiles.map(p => [p.user_id, p]))

  const openEstate = e => onDelete({ kind: 'estate', id: e.id, label: e.name })
  const openUser = p => onDelete({ kind: 'user', id: p.user_id, label: `${p.display_name || '—'} · ${p.email || ''}` })
  // En uferdig sletting kan prøves igjen så lenge boet eller kontoen fortsatt finnes
  const retryTarget = row => row.status !== 'ok' && (row.kind === 'estate' ? estateById.get(row.target_id) : profileById.get(row.target_id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: INK }}>
      {/* Status */}
      <section aria-labelledby="gdpr-status" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <h2 id="gdpr-status" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{L('Status for sletting', 'Deletion status')}</h2>
        <div style={card}>
          <div style={{ fontSize: '0.75rem', color: BRASS, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{L('Sletting på forespørsel', 'Deletion on request')}</div>
          {loading && <p role="status" style={{ fontSize: '0.875rem', color: SLATE, margin: 0 }}>{L('Sjekker …', 'Checking …')}</p>}
          {data && <><span style={pill(SPRUCE)}>{L('Klar', 'Ready')}</span><p style={{ fontSize: '0.8125rem', color: SLATE, margin: '8px 0 0', lineHeight: 1.5 }}>{L('Slettefunksjonen er rullet ut og svarer.', 'The delete function is deployed and responding.')}</p></>}
          {errorCode && <><span style={pill(RUST)}>{notDeployed ? L('Ikke rullet ut', 'Not deployed') : L('Feil', 'Error')}</span><p style={{ fontSize: '0.8125rem', color: SLATE, margin: '8px 0 0', lineHeight: 1.5 }}>{founderDeleteMessage(errorCode)}</p></>}
        </div>
        <div style={card}>
          <div style={{ fontSize: '0.75rem', color: BRASS, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{L('Automatisk sletting', 'Automatic deletion')}</div>
          <span style={pill(SLATE)}>{L('Ikke i drift', 'Not running')}</span>
          <p style={{ fontSize: '0.8125rem', color: SLATE, margin: '8px 0 0', lineHeight: 1.5 }}>
            {data?.retention_months
              ? L(`Lagringstiden er satt til ${data.retention_months} måneder, men jobben kjøres ikke automatisk. Ingen frist er lovet kundene.`, `Retention is set to ${data.retention_months} months, but the job does not run automatically. No deadline is promised to customers.`)
              : L('Ingen lagringstid er vedtatt. Avsluttede bo oppbevares til administratoren ber om sletting.', 'No retention period has been adopted. Closed estates are kept until the admin asks for deletion.')}
          </p>
        </div>
        <div style={card}>
          <div style={{ fontSize: '0.75rem', color: BRASS, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{L('Slettinger', 'Deletions')}</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem' }}>{data ? sum.done : '–'}</div>
          <p style={{ fontSize: '0.8125rem', color: SLATE, margin: '4px 0 0', lineHeight: 1.5 }}>
            {data ? L(`fullført, ${sum.last30} de siste 30 dagene`, `completed, ${sum.last30} in the last 30 days`) : L('vises når funksjonen svarer', 'shown when the function responds')}
            {data && sum.unfinished > 0 && <><br /><strong style={{ color: RUST }}>{L(`${sum.unfinished} ikke fullført – se loggen`, `${sum.unfinished} not completed – see the log`)}</strong></>}
          </p>
        </div>
      </section>

      {notDeployed && (
        <section style={{ ...card, borderColor: RUST }}>
          <h2 style={h2}>{L('Slå på slettingen', 'Turn on deletion')}</h2>
          <p style={lead}>{L('Funksjonen må rulles ut i Supabase én gang. Kjør dette fra repoet (krever Supabase CLI og innlogging i prosjektet). Til da slettes ingenting.', 'The function must be deployed to Supabase once. Run this from the repo (requires the Supabase CLI and access to the project). Until then nothing is deleted.')}</p>
          <pre style={{ margin: 0, padding: '12px 14px', background: PAPER, border: `1px solid ${LINE}`, borderRadius: '8px', fontSize: '0.8125rem', overflowX: 'auto', whiteSpace: 'pre' }}><code>{DEPLOY_CMD}</code></pre>
        </section>
      )}

      {/* Sletting på forespørsel */}
      <section style={card} aria-labelledby="gdpr-request">
        <h2 id="gdpr-request" style={h2}>{L('Slett etter forespørsel', 'Delete on request')}</h2>
        <p style={lead}>{L('Søk opp boet eller kontoen. Dialogen viser først hva som slettes, og du bekrefter med boets navn eller kontoens e-post. Demoboet, din egen konto og andre founders kan ikke slettes.', 'Find the estate or account. The dialog first shows what will be deleted, and you confirm with the estate name or account email. The demo estate, your own account and other founders cannot be deleted.')}</p>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '12px' }}>
          {L('Søk etter bo, navn eller e-post', 'Search for estate, name or email')}
          <input type="search" value={query} onChange={e => setQuery(e.target.value)} autoComplete="off" spellCheck={false}
            style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: '6px', padding: '10px 12px', fontSize: '1rem', fontFamily: 'Karla, sans-serif', color: INK, background: '#fff', border: `1px solid ${SLATE}`, borderRadius: '8px' }} />
        </label>
        {query.trim().length >= 2 && (
          results.estates.length + results.users.length === 0
            ? <p role="status" style={{ fontSize: '0.875rem', color: SLATE, margin: 0 }}>{L('Ingen treff.', 'No matches.')}</p>
            : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, border: `1px solid ${LINE}`, borderRadius: '8px' }}>
                {[...results.estates.map(e => ({ key: 'e' + e.id, tag: L('Bo', 'Estate'), title: e.name, sub: L(`Eier: ${e.profiles?.display_name || e.profiles?.email || '—'} · ${e.item_count || 0} gjenstander`, `Owner: ${e.profiles?.display_name || e.profiles?.email || '—'} · ${e.item_count || 0} items`), open: () => openEstate(e), aria: L(`Slett boet ${e.name}`, `Delete the estate ${e.name}`) })),
                  ...results.users.map(p => ({ key: 'u' + p.user_id, tag: L('Konto', 'Account'), title: p.display_name || '—', sub: p.email, open: () => openUser(p), aria: L(`Slett kontoen til ${p.display_name || p.email}`, `Delete the account of ${p.display_name || p.email}`) }))]
                  .map((r, i, all) => (
                    <li key={r.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderBottom: i < all.length - 1 ? `1px solid ${LINE}` : 'none' }}>
                      <span style={pill(SLATE)}>{r.tag}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.875rem', overflowWrap: 'anywhere' }}>{r.title}</div>
                        <div style={{ fontSize: '0.75rem', color: SLATE, overflowWrap: 'anywhere' }}>{r.sub}</div>
                      </div>
                      <button type="button" style={deleteBtn} aria-label={r.aria} onClick={r.open}>{L('Slett …', 'Delete …')}</button>
                    </li>
                  ))}
              </ul>
            )
        )}
      </section>

      {/* Rutine */}
      <section style={card} aria-labelledby="gdpr-routine">
        <h2 id="gdpr-routine" style={h2}>{L('Rutine for en forespørsel', 'Routine for a request')}</h2>
        <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem', lineHeight: 1.7 }}>
          <li>{L('Kontroller hvem som spør: et bo slettes bare når en administrator av boet ber om det fra e-posten på kontoen; en konto bare når forespørselen kommer fra kontoens e-post.', 'Check who is asking: an estate is deleted only when an admin of the estate asks from the account email; an account only when the request comes from the account email.')}</li>
          <li>{L('Delt bo: be administratoren varsle de andre medlemmene og la dem laste ned protokollen først. Slettingen kan ikke angres.', 'Shared estate: ask the admin to notify the other members and let them download the protocol first. Deletion cannot be undone.')}</li>
          <li>{L('Slett her (krever tofaktor i økten).', 'Delete here (requires two-factor in the session).')}</li>
          <li>{L('Svar kunden innen én måned (GDPR art. 12 nr. 3): dataene er slettet fra tjenesten og forsvinner fra sikkerhetskopiene når de roterer ut.', 'Reply to the customer within one month (GDPR Art. 12(3)): the data is deleted from the service and disappears from backups as they rotate out.')}</li>
          <li>{L('Sjekk at slettingen står som «Fullført» i loggen under. «Feilet» eller «Ikke fullført»: prøv igjen; det som allerede er slettet, hoppes over.', 'Check that the deletion shows as “Completed” in the log below. “Failed” or “Not completed”: try again; what is already deleted is skipped.')}</li>
        </ol>
      </section>

      {/* Slettelogg */}
      <section style={card} aria-labelledby="gdpr-log">
        <h2 id="gdpr-log" style={h2}>{L('Slettelogg', 'Deletion log')}</h2>
        <p style={lead}>{L('Hver sletting logges før den starter. Loggen har bare id-er og antall, ingen navn eller e-post, og viser at forespørsler er fulgt opp (GDPR art. 5 nr. 2).', 'Each deletion is logged before it starts. The log has only ids and counts, no names or emails, and shows that requests were handled (GDPR Art. 5(2)).')}</p>
        {!data
          ? <p style={{ fontSize: '0.875rem', color: SLATE, margin: 0 }}>{loading ? L('Laster …', 'Loading …') : L('Loggen vises når slettefunksjonen svarer.', 'The log is shown when the delete function responds.')}</p>
          : log.length === 0
            ? <p style={{ fontSize: '0.875rem', color: SLATE, margin: 0 }}>{L('Ingen slettinger ennå.', 'No deletions yet.')}</p>
            : (
              <div className="fd-table" style={{ overflowX: 'auto', border: `1px solid ${LINE}`, borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                  <thead><tr style={{ background: PAPER, borderBottom: `1px solid ${LINE}` }}>
                    {[L('Tidspunkt', 'Time'), L('Hva', 'What'), 'Id', L('Utført av', 'Done by'), 'Status', L('Omfang', 'Scope'), ''].map((h, i) => <th key={i} style={th}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {log.map((r, i) => {
                      const st = statusOf(r.status)
                      const retry = retryTarget(r)
                      return (
                        <tr key={r.id} style={{ borderBottom: i < log.length - 1 ? `1px solid ${LINE}` : 'none' }}>
                          <td style={{ ...td, whiteSpace: 'nowrap' }}>{fmtDate(r.created_at, true)}</td>
                          <td style={td}>{r.kind === 'estate' ? L('Bo', 'Estate') : L('Kundekonto', 'Customer account')}</td>
                          <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }} title={r.target_id || ''}>{shortId(r.target_id)}</td>
                          <td style={td}>{nameOf(r.founder_id)}</td>
                          <td style={td}><span style={pill(st.color)}>{st.text}</span></td>
                          <td style={{ ...td, color: SLATE }}>{scope(r)}</td>
                          <td style={{ ...td, textAlign: 'right' }}>
                            {retry && <button type="button" style={deleteBtn} onClick={() => (r.kind === 'estate' ? openEstate(retry) : openUser(retry))}>{L('Prøv igjen …', 'Retry …')}</button>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
      </section>

      {/* Avsluttede bo */}
      <section style={card} aria-labelledby="gdpr-closed">
        <h2 id="gdpr-closed" style={h2}>{L('Avsluttede bo', 'Closed estates')}</h2>
        <p style={lead}>{L('Bo administratoren har avsluttet. De slettes ikke automatisk, og kundene er ikke lovet noen frist; de oppbevares til administratoren ber om sletting.', 'Estates the admin has closed. They are not deleted automatically and customers are promised no deadline; they are kept until the admin asks for deletion.')}</p>
        {!data
          ? <p style={{ fontSize: '0.875rem', color: SLATE, margin: 0 }}>{loading ? L('Laster …', 'Loading …') : L('Listen vises når slettefunksjonen svarer.', 'The list is shown when the delete function responds.')}</p>
          : closed.length === 0
            ? <p style={{ fontSize: '0.875rem', color: SLATE, margin: 0 }}>{L('Ingen avsluttede bo.', 'No closed estates.')}</p>
            : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, border: `1px solid ${LINE}`, borderRadius: '8px' }}>
                {closed.map((e, i) => {
                  const m = monthsSince(e.closed_at)
                  return (
                    <li key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderBottom: i < closed.length - 1 ? `1px solid ${LINE}` : 'none' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.875rem', overflowWrap: 'anywhere' }}>{e.name}</div>
                        <div style={{ fontSize: '0.75rem', color: SLATE }}>
                          {L(`Avsluttet ${fmtDate(e.closed_at)} · ${m} ${m === 1 ? 'måned' : 'måneder'} siden`, `Closed ${fmtDate(e.closed_at)} · ${m} ${m === 1 ? 'month' : 'months'} ago`)}
                        </div>
                      </div>
                      <button type="button" style={deleteBtn} aria-label={L(`Slett boet ${e.name}`, `Delete the estate ${e.name}`)} onClick={() => openEstate(e)}>{L('Slett …', 'Delete …')}</button>
                    </li>
                  )
                })}
              </ul>
            )}
      </section>

      {/* Lagringstider */}
      <section style={card} aria-labelledby="gdpr-retention">
        <h2 id="gdpr-retention" style={h2}>{L('Lagringstider', 'Retention periods')} <span style={{ ...pill(BRASS), fontFamily: 'Karla, sans-serif', verticalAlign: 'middle', marginLeft: '6px' }}>{L('Forslag, ikke vedtatt', 'Proposal, not adopted')}</span></h2>
        <p style={lead}>{L('Ingen av fristene er satt i drift eller lovet kundene. Begrunnelsen (GDPR art. 5 og 17 og særlov) står i docs/sletting-av-bo.md i repoet. Vedta eller endre dem, og oppdater personvernerklæringen før noen frist tas i bruk.', 'None of these are in effect or promised to customers. The reasoning (GDPR Art. 5 and 17 and special legislation) is in docs/sletting-av-bo.md in the repo. Adopt or change them, and update the privacy policy before any deadline is used.')}</p>
        <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, max-content) 1fr', gap: '8px 20px', margin: 0, fontSize: '0.875rem' }}>
          {RETENTION().map(([k, v]) => [
            <dt key={k + 't'} style={{ color: SLATE }}>{k}</dt>,
            <dd key={k + 'd'} style={{ margin: 0 }}>{v}</dd>,
          ])}
        </dl>
      </section>
    </div>
  )
}
