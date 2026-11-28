import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, getItems } from '../lib/supabase'
import { loadStatusExtras } from '../lib/decisions'
import { L } from '../lib/lang'
import { formatNOK } from '../lib/format'
import { itemValue, singleInterestAssignments } from '../lib/distribution'
import { assignItems } from '../lib/assignments'
import { Modal, Overline } from '../components/UI'
import { summarizeDistribution, diffText, snapshotInput } from '../lib/distributionSummary'
import { makeNameOf } from '../lib/eventText'
import { heirStatusText } from '../lib/approval'
import ApprovalPanel from '../components/ApprovalPanel'
import ItemThumb, { ItemHead } from '../components/ItemThumb'
import { dispositionLabel } from '../lib/dispositionLabels'

// «Fordelingen»: oversikt slik den står nå – per arving, gjenstander ingen vil ha og det som ikke er avklart –
// forslag og godkjenning (F6), og protokollen som PDF (utkast, endelig fra det godkjente forslaget, eller
// papirversjon når forslaget ikke kan godkjennes digitalt). Verdiutjevningen er beslutningsstøtte.
export default function DistributionPage({ session, onToast, isDemo }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [proposal, setProposal] = useState({ version: null, status: null })
  const [singleOpen, setSingleOpen] = useState(false)
  const [singleBusy, setSingleBusy] = useState(false)

  const fetchData = async () => {
    const [{ data: items }, extras, { data: estate }, { data: mem }] = await Promise.all([
      getItems(id), loadStatusExtras(id),
      supabase.from('estates').select('name, split_mode, shares_confirmed, status').eq('id', id).maybeSingle(),
      supabase.from('estate_members').select('role').eq('estate_id', id).eq('user_id', session.user.id).maybeSingle(),
    ])
    return { items: items || [], members: extras.members, heirs: extras.heirs, passes: extras.passes, estate, isAdmin: mem?.role === 'admin' }
  }
  const load = async () => setData(await fetchData())

  useEffect(() => { load() }, [id])

  // «Tildel alle som bare én ønsker»: bare avklarte gjenstander, til den ene personen som ønsker dem.
  // Rett før tildelingen hentes alt på nytt; har noe endret seg, tildeles ingenting. Databasen sjekker det samme
  // (assign_items med metoden 'single') og hopper over det som ikke lenger stemmer.
  const assignSingles = async (shown) => {
    setSingleBusy(true)
    const fresh = await fetchData()
    const now = singleInterestAssignments(fresh.items, fresh.members, fresh.passes, fresh.heirs).ready
    const same = shown.every(r => now.some(n => n.item.id === r.item.id && n.heir.id === r.heir.id))
    if (!same) {
      setSingleBusy(false); setSingleOpen(false); setData(fresh)
      onToast(L('Ønskene er endret – ingenting ble tildelt. Se over listen på nytt.', 'The wishes have changed – nothing was assigned. Please review the list again.'), 'error')
      return
    }
    const { data: res, error } = await assignItems(id, shown.map(r => ({ item_id: r.item.id, heir_id: r.heir.id })), 'single')
    setSingleBusy(false); setSingleOpen(false)
    await load()
    if (error) { onToast(L('Ingenting ble tildelt. Prøv igjen.', 'Nothing was assigned. Please try again.'), 'error'); return }
    const n = res?.assigned || 0
    const skipped = res?.skipped?.length || 0
    if (skipped) onToast(L(`${n} tildelt. ${skipped} ble hoppet over fordi ønskene eller tildelingen var endret.`, `${n} assigned. ${skipped} skipped because the wishes or the assignment had changed.`), 'error')
    else onToast(L(`${n} ${n === 1 ? 'gjenstand' : 'gjenstander'} tildelt`, `${n} ${n === 1 ? 'item' : 'items'} assigned`))
  }

  if (!data) return <div style={{ padding: '80px', textAlign: 'center', color: '#4F463A', fontFamily: 'Karla, sans-serif' }}>{L('Laster…', 'Loading…')}</div>
  const s = summarizeDistribution(data)
  const canAssign = data.isAdmin && data.estate?.status !== 'closed' // også i demoen: tildelingene nullstilles ved neste demoinnlogging
  const single = canAssign ? singleInterestAssignments(data.items, data.members, data.passes, data.heirs) : null
  const notSettled = s.pending.length + s.unwanted.undecided.length

  const nameOf = makeNameOf(data.members)
  const { version, status } = proposal
  // Endelig protokoll lages fra det godkjente forslaget; papirversjon fra forslaget når det ikke kan godkjennes digitalt
  const pdfKind = isDemo ? 'demo' : status?.state === 'approved' ? 'final' : status?.state === 'not_digitally_approvable' ? 'paper' : 'draft'
  const pdfLabel = { final: L('Last ned godkjent protokoll (PDF)', 'Download the approved record (PDF)'), paper: L('Last ned protokoll for signering på papir (PDF)', 'Download the record for signing on paper (PDF)'),
    draft: L('Last ned utkast (PDF)', 'Download draft (PDF)'), demo: L('Last ned utkast (PDF)', 'Download draft (PDF)') }[pdfKind]
  const download = async () => {
    try {
      const { buildDistributionPdf } = await import('../lib/distributionPdf')
      const fromSnapshot = (pdfKind === 'final' || pdfKind === 'paper') && version?.snapshot
      const summary = fromSnapshot ? summarizeDistribution(snapshotInput(version.snapshot)) : s
      const deciders = (status?.heirs || []).map(h => ({ name: h.name, statusText: pdfKind === 'paper' ? null : heirStatusText(h, nameOf),
        representation: h.representative ? L(`${h.representative.kind === 'verge' ? 'Verge' : 'Fullmektig'}: ${nameOf(h.representative.user_id)}. Registrert i Arvklart og bekreftet av en annen beslutningstaker; fullmakten eller vergemålet er ikke kontrollert juridisk av Arvklart.`, `${h.representative.kind === 'verge' ? 'Guardian' : 'Proxy'}: ${nameOf(h.representative.user_id)}. Registered in Arvklart and confirmed by another decision-maker; the power of attorney or guardianship has not been checked legally by Arvklart.`) : null }))
      const doc = buildDistributionPdf({ estateName: data.estate?.name, summary, kind: pdfKind, version, deciders })
      doc.save(`${pdfKind === 'final' ? L('fordeling-godkjent', 'distribution-approved') : pdfKind === 'paper' ? L('fordeling-til-signering', 'distribution-for-signing') : L('fordeling-utkast', 'distribution-draft')}-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch {
      onToast(L('Kunne ikke lage PDF-en. Prøv igjen.', 'Could not create the PDF. Please try again.'), 'error')
    }
  }

  const card = { background: '#FCFCF9', border: '1px solid rgba(42, 29, 20, 0.14)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }
  const h2 = { fontFamily: "'Bodoni Moda', 'Times New Roman', serif", fontSize: '1.25rem', fontWeight: 400, color: '#2A1D14', margin: '24px 0 10px' }
  const small = { fontSize: '0.8125rem', color: '#2A1D14', lineHeight: 1.6, margin: 0 }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '28px 16px 64px', fontFamily: 'Karla, sans-serif' }}>
      <button onClick={() => navigate(`/estate/${id}`)} style={{ background: 'none', border: 'none', color: '#4F463A', cursor: 'pointer', fontSize: '0.8125rem', padding: '0 0 16px', fontFamily: 'Karla, sans-serif' }}>{L('← Tilbake til boet', '← Back to the estate')}</button>
      <Overline>{L('Fordeling', 'Distribution')}</Overline>
      <h1 style={{ fontFamily:"'Bodoni Moda', 'Times New Roman', serif", fontSize:'clamp(1.9rem, 1.3rem + 2.6vw, 3rem)', lineHeight:1.08, letterSpacing:'-0.02em', fontWeight: 400, color: '#2A1D14', marginBottom: '8px' }}>{L('Fordelingen', 'The distribution')}</h1>
      <p style={{ ...small, fontSize: '0.875rem', marginBottom: '16px' }}>
        {L('Slik står fordelingen nå. Verdiene er fordelingsverdiene dere har satt; verdiutjevningen er beslutningsstøtte, ikke en fasit. Alt er foreløpig til alle har godkjent fordelingen.',
          'This is how the distribution stands now. The values are the distribution values you have set; the value balance is decision support, not a final answer. Everything is provisional until everyone has approved the distribution.')}
      </p>

      <div role="status" style={{ ...card, background: notSettled ? '#F1F3EA' : '#EEF1E6', borderColor: notSettled ? 'rgba(42, 29, 20, 0.14)' : 'rgba(42, 29, 20, 0.14)' }}>
        <p style={{ ...small, color: '#2A1D14', fontWeight: 600 }}>
          {notSettled
            ? L(`${notSettled} ${notSettled === 1 ? 'gjenstand er' : 'gjenstander er'} ikke avklart ennå`, `${notSettled} ${notSettled === 1 ? 'item is' : 'items are'} not settled yet`)
            : L('Alle gjenstandene er avklart', 'All items are settled')}
        </p>
        <p style={small}>{L(`${s.itemCount} gjenstander i alt · ${formatNOK(s.totalKnown)} i fordelingsverdi tildelt`, `${s.itemCount} items in total · ${formatNOK(s.totalKnown)} in distribution value assigned`)}</p>
        <button onClick={download} style={{ marginTop: '10px', minHeight: '44px', padding: '8px 14px', background: '#FCFCF9', border: '1px solid rgba(42, 29, 20, 0.5)', borderRadius: '999px', cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'Karla, sans-serif', color: '#2A1D14' }}>
          {pdfLabel}
        </button>
      </div>

      <ApprovalPanel estateId={id} userId={session.user.id} isAdmin={data.isAdmin} isDemo={isDemo} closed={data.estate?.status === 'closed'}
        items={data.items} nameOf={nameOf} onVersion={(v, st) => setProposal({ version: v, status: st })} onToast={onToast} />

      <h2 style={h2}>{L('Per arving', 'Per heir')}</h2>
      {!s.hasRecipients && (
        <div style={{ ...card, background: '#F1F3EA' }}>
          <p style={{ ...small, color: '#2A1D14' }}>{L('Ingen er registrert som mottakere ennå. Legg inn personene som skal få gjenstander – også dem som ikke har konto i Arvklart.', 'No one is registered as a recipient yet. Add the people who will receive items – including those without an Arvklart account.')}</p>
          <button onClick={() => navigate(`/estate/${id}/heirs`)} style={{ marginTop: '10px', minHeight: '44px', padding: '8px 14px', background: '#24392A', color: '#F4F2EB', border: 'none', borderRadius: '999px', cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'Karla, sans-serif' }}>{L('Legg inn mottakere', 'Add recipients')}</button>
        </div>
      )}
      {!s.weighted && s.totalKnown > 0 && <p style={{ ...small, marginBottom: '10px' }}>{L('Sammenlignet med en lik andel. Arveandeler brukes bare når administrator har bekreftet dem under «Arvinger».', 'Compared with an equal share. Inheritance shares are only used when the administrator has confirmed them under «Heirs».')}</p>}
      {s.perHeir.map(h => (
        <section key={h.heir_id || h.user_id || h.name} aria-label={h.name} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', alignItems: 'baseline' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2A1D14', margin: 0 }}>{h.name}</h3>
            <span style={{ fontFamily: "'Bodoni Moda', 'Times New Roman', serif", fontSize: '1.125rem', color: '#2A1D14' }}>{formatNOK(h.sum)}</span>
          </div>
          <p style={small}>
            {L(`${h.items.length} ${h.items.length === 1 ? 'gjenstand' : 'gjenstander'}`, `${h.items.length} ${h.items.length === 1 ? 'item' : 'items'}`)}
            {h.unknown > 0 && L(` · ${h.unknown} uten fordelingsverdi`, ` · ${h.unknown} without distribution value`)}
            {s.totalKnown > 0 && !h.unconfirmed && ` · ${diffText(h, s)}`}
          </p>
          {h.unconfirmed && (
            <div style={{ marginTop: '8px' }}>
              <p style={small}>{h.user_id
                ? L('Tildelt kontoen, men ikke bekreftet som en person på listen. Bekreft hvem som skal ha gjenstanden:', 'Assigned to the account, but not confirmed as a person on the list. Confirm who should have the item:')
                : L('Kontoen gjenstanden var tildelt, er slettet. Bekreft hvem som skal ha gjenstanden:', 'The account the item was assigned to has been deleted. Confirm who should have the item:')}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 8px', display: 'grid', gap: '10px' }}>
                {h.items.map(i => <li key={i.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}><ItemThumb item={i} size={72} /><button onClick={() => navigate(`/estate/${id}/item/${i.id}`)} style={{ background: 'none', border: 'none', padding: '4px 0', minHeight: '32px', color: '#6E4A2A', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'Karla, sans-serif' }}>{i.title}</button></li>)}
              </ul>
            </div>
          )}
          {h.items.length > 0 && (
            <details style={{ marginTop: '6px' }}>
              <summary style={{ cursor: 'pointer', fontSize: '0.8125rem', color: '#2A1D14', minHeight: '44px', display: 'flex', alignItems: 'center' }}>{L('Vis gjenstandene', 'Show the items')}</summary>
              <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 9.5rem), 1fr))', gap: '12px' }}>
                {h.items.map(i => (
                  <li key={i.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8125rem' }}>
                    <ItemThumb item={i} fill />
                    <span style={{ fontFamily: "'Bodoni Moda', 'Times New Roman', serif", fontSize: '1.05rem', color: '#2A1D14' }}>{i.title}</span>
                    <span style={{ color: '#4F463A' }}>{itemValue(i) === null ? L('uten fordelingsverdi', 'no distribution value') : formatNOK(itemValue(i))}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      ))}

      <h2 style={h2}>{L('Ingen vil ha', 'No one wants')}</h2>
      <div style={card}>
        {['sell', 'donate', 'discard'].map(d => <p key={d} style={small}>{dispositionLabel(d)}: {s.unwanted[d].length}</p>)}
        <p style={small}>{L('Ikke bestemt', 'Not decided')}: {s.unwanted.undecided.length}</p>
        <button onClick={() => navigate(`/estate/${id}/ingen-vil-ha`)} style={{ marginTop: '8px', background: 'none', border: 'none', padding: 0, minHeight: '44px', color: '#6E4A2A', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'Karla, sans-serif' }}>{L('Gå til «Ingen vil ha»', 'Go to «No one wants»')}</button>
      </div>

      {s.pending.length > 0 && (
        <>
          <h2 style={h2}>{L('Ønsket, men ikke tildelt ennå', 'Wanted, but not assigned yet')}</h2>
          <div style={card}>
            {single && single.ready.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <button onClick={() => setSingleOpen(true)} style={{ minHeight: '44px', padding: '8px 14px', background: '#24392A', color: '#F4F2EB', border: 'none', borderRadius: '999px', cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'Karla, sans-serif' }}>
                  {L(`Tildel ${single.ready.length} ${single.ready.length === 1 ? 'gjenstand' : 'gjenstander'} som bare én ønsker`, `Assign ${single.ready.length} ${single.ready.length === 1 ? 'item' : 'items'} only one person wants`)}
                </button>
              </div>
            )}
            {single && single.waiting.length > 0 && (
              <p style={{ ...small, marginBottom: '8px' }}>{L(`${single.waiting.length} ${single.waiting.length === 1 ? 'gjenstand' : 'gjenstander'} som bare én ønsker, venter på svar fra andre og tas ikke med. Manglende svar regnes ikke som nei takk.`, `${single.waiting.length} ${single.waiting.length === 1 ? 'item' : 'items'} only one person wants ${single.waiting.length === 1 ? 'is' : 'are'} waiting for answers from others and not included. Not answering is not counted as no thanks.`)}</p>
            )}
            {single && single.unlinked.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <p style={small}>{L('Kan ikke tildeles automatisk, fordi den som ønsker gjenstanden, ikke står på listen som en person som kan få gjenstander:', 'Cannot be assigned automatically, because the person who wants the item is not on the list as someone who can receive items:')}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 8px', display: 'grid', gap: '10px' }}>
                  {single.unlinked.map(({ item }) => <li key={item.id} style={{ display: 'flex' }}><ItemHead item={item} size={72} /></li>)}
                </ul>
                <button onClick={() => navigate(`/estate/${id}/heirs`)} style={{ background: 'none', border: 'none', padding: 0, minHeight: '44px', color: '#6E4A2A', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'Karla, sans-serif' }}>{L('Gå til «Arvinger»', 'Go to «Heirs»')}</button>
              </div>
            )}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 8px', display: 'grid', gap: '10px' }}>
              {s.pending.map(i => <li key={i.id} style={{ display: 'flex' }}><ItemHead item={i} size={72}><span style={{ fontSize: '0.8125rem' }}>{L(`Ønskes av ${i.interests.length}`, `Wanted by ${i.interests.length}`)}</span></ItemHead></li>)}
            </ul>
            <button onClick={() => navigate(`/estate/${id}/conflicts`)} style={{ marginTop: '8px', background: 'none', border: 'none', padding: 0, minHeight: '44px', color: '#6E4A2A', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'Karla, sans-serif' }}>{L('Gå til «Løsningsmetoder»', 'Go to «Resolution methods»')}</button>
          </div>
        </>
      )}

      {singleOpen && single && (
        <Modal onClose={() => !singleBusy && setSingleOpen(false)} labelledBy="single-title" maxWidth={460}>
          <h2 id="single-title" style={{ fontFamily: "'Bodoni Moda', 'Times New Roman', serif", fontSize: '1.25rem', fontWeight: 400, color: '#2A1D14', margin: '0 0 8px' }}>{L('Tildel det bare én ønsker', 'Assign what only one person wants')}</h2>
          <p style={{ ...small, marginBottom: '10px' }}>{L('Alle som skal ta stilling, har svart på disse gjenstandene, og bare én ønsker hver av dem. Hver tildeling logges.', 'Everyone who should decide has answered on these items, and only one person wants each of them. Each assignment is logged.')}</p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '10px', maxHeight: '50vh', overflowY: 'auto', margin: '0 0 16px' }}>
            {single.ready.map(r => <li key={r.item.id} style={{ display: 'flex' }}><ItemHead item={r.item} size={72} still><span style={{ fontSize: '0.875rem', color: '#2A1D14' }}>{L('Til', 'To')} <strong>{r.heir.name}</strong></span></ItemHead></li>)}
          </ul>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setSingleOpen(false)} disabled={singleBusy} style={{ flex: '1 1 120px', minHeight: '44px', padding: '10px', background: 'none', border: '1px solid rgba(42, 29, 20, 0.5)', borderRadius: '999px', cursor: 'pointer', color: '#2A1D14', fontSize: '0.875rem', fontFamily: 'Karla, sans-serif' }}>{L('Avbryt', 'Cancel')}</button>
            <button onClick={() => assignSingles(single.ready)} disabled={singleBusy} style={{ flex: '2 1 180px', minHeight: '44px', padding: '10px', background: '#24392A', color: '#F4F2EB', border: 'none', borderRadius: '999px', cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'Karla, sans-serif' }}>
              {singleBusy ? L('Tildeler…', 'Assigning…') : L(`Tildel ${single.ready.length}`, `Assign ${single.ready.length}`)}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
