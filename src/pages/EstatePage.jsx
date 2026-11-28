import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useEstateData } from '../hooks/useEstateData'
import { buildRemainingSteps } from '../lib/estateProgress'
import { overviewCounts, recommendation, overviewGroups } from '../lib/estateOverview'
import { boCss } from '../lib/estateThemeCss'
import { L, locale } from '../lib/lang'
import { APP_HOME } from '../lib/routes'

// Oversikten i et bo. Den svarer bare på «hva vil du gjøre?»:
//  1. Hvor langt boet har kommet (én linje).
//  2. «Anbefalt nå»: det viktigste for denne brukeren akkurat nå, med én knapp.
//  3. Fire nummererte nedtrekksgrupper (Gjenstander, Fordeling, Arvinger, Praktisk) med lenker videre til egne
//     sider, i samme stil som «Før dere begynner» på arvklart.no.
// Gjenstandene med bilder, søk, filter og analyse ligger på /estate/:id/gjenstander (EstateItemsPage).
// Hva som vises for administrator, arving og demo, bestemmes i src/lib/estateOverview.js.
export default function EstatePage({ session, isDemo }) {
  const { id } = useParams()
  const userId = session.user.id
  const { loading, estate, items, myRole, extras, proposal } = useEstateData(id, userId, { withProgress: true })
  const [openGroups, setOpenGroups] = useOpenGroups(id)

  if (loading) return <Message>{L('Laster…', 'Loading…')}</Message>
  if (!estate) return <Message>{L('Fant ikke boet. Det kan være slettet, eller du er ikke medlem.', 'Estate not found. It may have been deleted, or you are not a member.')}</Message>

  const isAdmin = myRole === 'admin'
  const counts = overviewCounts({ items, userId, extras })
  const steps = extras ? buildRemainingSteps({ estateId: id, userId, items, ...extras, proposal }) : null
  const next = recommendation({ estateId: id, estate, counts, steps, isAdmin, isDemo })
  const groups = overviewGroups({ estateId: id, counts, steps, isAdmin, isDemo })
  const progress = counts.total ? Math.round(counts.assigned / counts.total * 100) : 0

  return (
    <div className="bo-flate">
      <style>{boCss}</style>
      <div className="bo-side">
        {/* Demoen har bare ett bo, og kan ikke administreres (notForDemo i App.jsx) */}
        {!isDemo && (
          <div className="bo-topplinje">
            <Link to={APP_HOME} className="bo-lenke">{L('← Alle bo', '← All estates')}</Link>
            {isAdmin && <Link to={`/estate/${id}/admin`} className="bo-lenke">{L('Administrer boet', 'Manage the estate')}</Link>}
          </div>
        )}

        <header className="bo-hode">
          <p className="bo-overlinje">{L('Ditt bo', 'Your estate')}</p>
          <h1>{estate.name}</h1>
          {estate.description && <p className="bo-ingress">{estate.description}</p>}
          <p className="bo-status">
            {counts.total > 0 && <span className="bo-spor" aria-hidden="true"><span style={{ width: `${progress}%` }} /></span>}
            <span>
              {counts.total > 0
                ? L(`${counts.assigned} av ${counts.total} gjenstander fordelt`, `${counts.assigned} of ${counts.total} items distributed`)
                : L('Ingen gjenstander ennå', 'No items yet')}
              {counts.members !== null && ` · ${counts.members} ${counts.members === 1 ? L('medlem', 'member') : L('medlemmer', 'members')}`}
            </span>
          </p>
        </header>

        {estate.status === 'closed' && (
          <p className="bo-melding">
            {L('Boet er avsluttet', 'This estate is closed')}
            {estate.closed_at && ` (${new Date(estate.closed_at).toLocaleDateString(locale(), { day: 'numeric', month: 'long', year: 'numeric' })})`}.{' '}
            {L('Det oppbevares med bilder og dokumenter til det slettes. Det finnes ingen automatisk sletting; administratoren kan be Arvklart slette boet.', 'It is kept with its photos and documents until it is deleted. There is no automatic deletion; the administrator can ask Arvklart to delete the estate.')}
          </p>
        )}

        {next && (
          <section className="bo-anbefalt" aria-labelledby="anbefalt-tittel">
            <div className="tekst">
              <p className="bo-overlinje">{L('Anbefalt nå', 'Recommended now')}</p>
              <h2 id="anbefalt-tittel"><Emphasize text={next.title} /></h2>
              {next.text && <p>{next.text}</p>}
            </div>
            <Link to={next.path} className="bo-knapp fylt">{next.action} →</Link>
          </section>
        )}

        <section aria-labelledby="valg-tittel" className="bo-valgseksjon">
          <p className="bo-overlinje">{L('Alt i boet', 'Everything in the estate')}</p>
          <h2 id="valg-tittel" className="bo-stor">{L('Hva vil du gjøre?', 'What do you want to do?')}</h2>
          <div className="bo-grupper">
            {groups.map((group, n) => (
              <details key={group.key} className="bo-gruppe" open={!!openGroups[group.key]}
                onToggle={e => setOpenGroups(group.key, e.currentTarget.open)}>
                <summary>
                  <span className="bo-nr" aria-hidden="true">{String(n + 1).padStart(2, '0')}</span>
                  <span>
                    <span className="tittel">{group.title}</span>
                    <span className="beskrivelse">{group.desc}</span>
                  </span>
                  <span className="bo-hint">{group.hint}</span>
                  <span className="bo-pluss" aria-hidden="true" />
                </summary>
                <ul className="bo-valg">
                  {group.links.map(link => (
                    <li key={link.key}>
                      <Link to={link.path}>
                        <span>
                          <span className="navn">{link.title}</span>
                          <span className="forklaring">{link.desc}</span>
                        </span>
                        <Count link={link} />
                        <span className="til" aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

// Tallet til høyre på en lenke: uthevet når noe venter på deg, ellers nøytralt
function Count({ link }) {
  if (link.badge > 0) return <span className="bo-tall venter">{link.badge}</span>
  if (link.countLabel) return <span className="bo-tall noytral">{link.countLabel}</span>
  if (link.count !== undefined && link.count !== null) return <span className="bo-tall noytral">{link.count}</span>
  return <span />
}

// Hvilke grupper som er åpne, husket i fanen per bo. «Gjenstander» er åpen første gang.
function useOpenGroups(estateId) {
  const key = `bo_grupper_${estateId}`
  const [open, setOpen] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(key)) || { gjenstander: true } } catch { return { gjenstander: true } }
  })
  const set = (group, isOpen) => setOpen(prev => {
    if (!!prev[group] === isOpen) return prev
    const next = { ...prev, [group]: isOpen }
    try { sessionStorage.setItem(key, JSON.stringify(next)) } catch { /* privat modus: huskes ikke */ }
    return next
  })
  return [open, set]
}

function Message({ children }) {
  return (
    <div className="bo-flate">
      <style>{boCss}</style>
      <p role="status" className="bo-dempet" style={{ padding: '80px 16px', textAlign: 'center' }}>{children}</p>
    </div>
  )
}

// Tallet i en overskrift («Du har 4 gjenstander …») fremheves i ordfargen, som ordene i store overskrifter på nettsiden
function Emphasize({ text }) {
  const m = /\d+/.exec(text)
  if (!m) return text
  return <>{text.slice(0, m.index)}<span className="bo-ord">{m[0]}</span>{text.slice(m.index + m[0].length)}</>
}
