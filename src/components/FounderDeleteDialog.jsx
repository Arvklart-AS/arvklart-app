import { useEffect, useState } from 'react'
import { Modal } from './UI'
import { founderDelete } from '../lib/founder'
import { L } from '../lib/lang'

// Sletting av et bo eller en kundekonto fra founder-dashboardet (GDPR art. 17, på forespørsel).
// Viser først hva som slettes (dry run fra edge-funksjonen founder-delete), og sletter bare når founderen skriver
// boets navn eller kontoens e-post. Selve slettingen og reglene står i supabase/functions/_shared/founderDelete.ts.
// Lyst oppsett som resten av /founder (produktpaletten).
const INK = '#1F2326', SLATE = '#575B5E', LINE = '#CFC8BA', PAPER = '#F5F2EB', RUST = '#9A3B2E'

export function founderDeleteMessage(code) {
  switch (code) {
    case 'mfa_required': return L('Bekreft tofaktor på nytt og prøv igjen.', 'Confirm two-factor again and retry.')
    case 'not_founder': case 'unauthorized': return L('Bare founders med tofaktor kan slette.', 'Only founders with two-factor can delete.')
    case 'demo': return L('Demoboet og demokontoene kan ikke slettes.', 'The demo estate and demo accounts cannot be deleted.')
    case 'self': return L('Din egen konto slettes under «Min konto».', 'Delete your own account under “My account”.')
    case 'founder': return L('Kontoen er founder. Fjern founder-rollen først.', 'This account is a founder. Remove the founder role first.')
    case 'not_found': return L('Finnes ikke lenger. Den kan allerede være slettet.', 'No longer exists. It may already have been deleted.')
    case 'confirm_mismatch': return L('Teksten stemmer ikke. Ingenting er slettet.', 'The text does not match. Nothing was deleted.')
    case 'unreachable': return L('Fikk ikke kontakt med slettefunksjonen (founder-delete). Den er trolig ikke rullet ut i Supabase. Ingenting er slettet.', 'Could not reach the delete function (founder-delete). It is probably not deployed in Supabase. Nothing was deleted.')
    case 'not_deployed': return L('Slettefunksjonen er ikke rullet ut i Supabase ennå (founder-delete). Ingenting er slettet.', 'The delete function is not deployed in Supabase yet (founder-delete). Nothing was deleted.')
    default: return L('Slettingen ble ikke fullført. Det som sto igjen, er urørt; prøv igjen.', 'The deletion did not complete. Anything left is untouched; try again.')
  }
}

const estateRows = c => [
  [L('Medlemmer (kontoene består)', 'Members (accounts are kept)'), c.members],
  [L('Personer på arvelisten', 'People on the heir list'), c.heirs],
  [L('Gjenstander', 'Items'), c.items],
  [L('Dokumenter', 'Documents'), c.documents],
  [L('Tilbakemeldinger knyttet til boet', 'Feedback linked to the estate'), c.feedback],
  [L('Filer (bilder og dokumenter)', 'Files (images and documents)'), (c.files?.images ?? 0) + (c.files?.documents ?? 0)],
]
const userRows = c => [
  [L('Bo kunden er alene om (slettes)', 'Estates the customer is alone in (deleted)'), c.estates_deleted],
  [L('Delte bo (beholdes uten kundens navn)', 'Shared estates (kept without the name)'), c.estates_kept],
  [L('Ønsker', 'Wishes'), c.interests],
  [L('Tilbakemeldinger', 'Feedback'), c.feedback],
]

export default function FounderDeleteDialog({ target, onClose, onDeleted }) {
  const { kind, id, label } = target
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState(null)
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let live = true
    founderDelete({ kind, id, dryRun: true })
      .then(d => { if (live) setPlan(d) })
      .catch(e => { if (live) setError(founderDeleteMessage(e.code)) })
    return () => { live = false }
  }, [kind, id])

  const expected = plan?.confirm_with || ''
  const matches = !!expected && (kind === 'user' ? typed.trim().toLowerCase() === expected : typed.trim().replace(/\s+/g, ' ') === expected.trim().replace(/\s+/g, ' '))

  const run = async () => {
    setBusy(true)
    setError(null)
    try {
      await founderDelete({ kind, id, confirm: typed })
      onDeleted(id)
    } catch (e) {
      setError(founderDeleteMessage(e.code))
      setBusy(false)
    }
  }

  const title = kind === 'estate' ? L('Slett boet', 'Delete the estate') : L('Slett kundekontoen', 'Delete the customer account')
  const rows = plan ? (kind === 'estate' ? estateRows(plan.counts) : userRows(plan.counts)) : []

  return (
    <Modal onClose={busy ? () => {} : onClose} labelledBy="founder-delete-title" maxWidth={480}
      panelStyle={{ background: PAPER, color: INK, border: `1px solid ${LINE}` }}>
      <h2 id="founder-delete-title" style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, fontSize: '1.375rem', marginBottom: '6px' }}>{title}</h2>
      <p style={{ fontSize: '0.875rem', color: SLATE, marginBottom: '16px', overflowWrap: 'anywhere' }}>{label}</p>

      <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '14px' }}>
        {kind === 'estate'
          ? L('Boet slettes med gjenstander, bilder, dokumenter, ønsker, historikk og godkjenninger. Filer som også brukes av et annet bo, blir liggende. Kontoene til medlemmene slettes ikke.',
            'The estate is deleted with items, images, documents, wishes, history and approvals. Files also used by another estate are kept. Members’ accounts are not deleted.')
          : L('Kontoen slettes som når kunden sletter den selv: bo kunden er alene om, slettes; i delte bo fjernes navnet, og administratorrollen gis videre.',
            'The account is deleted as when customers delete it themselves: estates they are alone in are deleted; in shared estates the name is removed and the admin role is handed over.')}
        {' '}<strong>{L('Det kan ikke angres.', 'This cannot be undone.')}</strong>
        {' '}{L('Slettede data ligger i Supabase sine sikkerhetskopier til de roterer ut.', 'Deleted data stays in Supabase backups until they rotate out.')}
      </p>

      {!plan && !error && <p role="status" style={{ fontSize: '0.875rem', color: SLATE }}>{L('Teller hva som slettes …', 'Counting what will be deleted …')}</p>}

      {plan && (
        <dl style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 16px', fontSize: '0.875rem', margin: '0 0 18px', padding: '12px 14px', border: `1px solid ${LINE}`, borderRadius: '8px' }}>
          {rows.map(([k, v]) => [
            <dt key={k + 't'} style={{ color: SLATE }}>{k}</dt>,
            <dd key={k + 'd'} style={{ margin: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{v ?? 0}</dd>,
          ])}
        </dl>
      )}

      {plan && (
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '16px' }}>
          {kind === 'estate' ? L('Skriv navnet på boet for å bekrefte:', 'Type the estate name to confirm:') : L('Skriv e-posten til kontoen for å bekrefte:', 'Type the account email to confirm:')}
          <span style={{ display: 'block', fontWeight: 600, margin: '4px 0 6px', overflowWrap: 'anywhere' }}>{expected}</span>
          <input value={typed} onChange={e => setTyped(e.target.value)} disabled={busy} autoComplete="off" spellCheck={false}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', fontSize: '1rem', fontFamily: 'Karla, sans-serif', color: INK, background: '#fff', border: `1px solid ${SLATE}`, borderRadius: '8px' }} />
        </label>
      )}

      {error && <p role="alert" style={{ fontSize: '0.875rem', color: RUST, marginBottom: '14px' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button type="button" onClick={onClose} disabled={busy}
          style={{ padding: '10px 18px', borderRadius: '999px', border: `1px solid ${SLATE}`, background: 'transparent', color: INK, fontFamily: 'Karla, sans-serif', fontSize: '0.875rem', cursor: 'pointer' }}>
          {L('Avbryt', 'Cancel')}
        </button>
        {plan && (
          <button type="button" onClick={run} disabled={!matches || busy}
            style={{ padding: '10px 18px', borderRadius: '999px', border: 'none', background: RUST, color: '#fff', fontFamily: 'Karla, sans-serif', fontSize: '0.875rem', cursor: matches && !busy ? 'pointer' : 'not-allowed', opacity: matches && !busy ? 1 : 0.55 }}>
            {busy ? L('Sletter …', 'Deleting …') : L('Slett for godt', 'Delete permanently')}
          </button>
        )}
      </div>
    </Modal>
  )
}
