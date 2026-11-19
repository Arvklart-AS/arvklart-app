import { useEffect, useRef } from 'react'
import { isEn, setLang } from '../lib/lang'
import { HOME } from '../lib/routes'
import { useHydrated } from './useHydrated'
import './site.css'

// Rammen rundt de fire offentlige sidene (/, /slik-fungerer-det, /om-oss, /kontakt).
//
// All CSS ligger i site.css og er avgrenset til rotklassen «ak». Appen, demoen og innloggingen
// bruker ingen av reglene, og ingen av dem treffer inn hit.
//
// Sidene er på norsk. Språkvalget på kontoen gjelder appen, veiviseren og innloggingen som før,
// så lenken «English» står igjen i bunnteksten; innholdet her er merket lang="nb" uansett valg,
// siden det ikke finnes en engelsk versjon av disse sidene ennå (se docs/ny-offentlig-nettside.md).
//
// «Prøv demo» er alltid en lenke til /#demo, så den virker uten JavaScript. Med JavaScript starter
// den demoen med én gang (src/site/useDemo.js). Elementtypen endres ikke ved hydrering.

const NAV = [
  { href: '/slik-fungerer-det', label: 'Slik fungerer det' },
  { href: '/veiviser', label: 'Veiviser' },
  { href: '/om-oss', label: 'Om oss' },
  { href: '/logg-inn', label: 'Logg inn' },
]

const FOOT = [
  { href: HOME, label: 'Forsiden' },
  { href: '/slik-fungerer-det', label: 'Slik fungerer det' },
  { href: '/om-oss', label: 'Om oss' },
  { href: '/veiviser', label: 'Veiviser' },
  { href: '/kontakt', label: 'Kontakt' },
  { href: '/personvern', label: 'Personvern' },
  { href: '/personvern#vilkar', label: 'Vilkår' },
  { href: '/logg-inn', label: 'Logg inn' },
]

// Språkbytte for besøkende som ikke er innlogget (innloggede bytter i TopBar og under «Min konto»)
const toggleLang = (e) => {
  e.preventDefault()
  setLang(isEn() ? 'no' : 'en')
  window.location.reload()
}

export function DemoCta({ demo, className = 'btn', idle = 'Prøv demo', tabIndex }) {
  return (
    <a className={className} href={demo.href} onClick={demo.onClick} tabIndex={tabIndex} aria-busy={demo.busy || undefined}>
      {demo.label(idle)}
    </a>
  )
}

// Feilmelding fra demoinngangen. Står der knappen står, så den ikke kan overses.
export function DemoError({ demo, center = false }) {
  if (!demo.error) return null
  return (
    <p className="micro" role="alert" style={{
      marginTop: '12px', color: '#F3C9C2', background: 'rgba(0,0,0,.3)',
      border: '1px solid rgba(243,201,194,.45)', borderRadius: '2px', padding: '10px 14px',
      maxWidth: '44ch', ...(center ? { marginInline: 'auto' } : {}),
    }}>{demo.error}</p>
  )
}

function Header({ demo, current, onFront }) {
  const menu = useRef(null)
  useEffect(() => {
    const onKey = (e) => {
      const el = menu.current
      if (e.key === 'Escape' && el?.open) { el.open = false; el.querySelector('summary')?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  const closeMenu = (e) => { if (e.target.closest('.menu__panel a') && menu.current) menu.current.open = false }
  const mark = (href) => (href === current ? { 'aria-current': 'page' } : {})

  return (
    <header className="hdr">
      <div className="hdr__in">
        <a className="brand" href={onFront ? '#top' : HOME}
          aria-label={onFront ? 'Arvklart, til toppen av siden' : 'Arvklart, til forsiden'}>
          <span className="brand__mark" aria-hidden="true" />
        </a>

        <nav className="nav" aria-label="Hovedmeny">
          {NAV.map(l => <a key={l.href} href={l.href} {...mark(l.href)}>{l.label}</a>)}
        </nav>

        <details className="menu" ref={menu} onClick={closeMenu}>
          <summary>Meny</summary>
          <div className="menu__panel">
            {NAV.map(l => <a key={l.href} href={l.href} {...mark(l.href)}>{l.label}</a>)}
          </div>
        </details>

        <DemoCta demo={demo} />
      </div>
    </header>
  )
}

function Footer({ current }) {
  const links = FOOT.filter(l => !(current === HOME && l.href === HOME))
  return (
    <footer className="ground g-natt foot">
      <div className="rules" aria-hidden="true" />
      <div className="wrap">
        <div className="foot__in">
          <p className="foot__t">Arvklart er et digitalt verktøy for fordeling av innbo og løsøre.
            Familien tar beslutningene.</p>
          <nav className="foot__links" aria-label="Bunnmeny">
            {links.map(l => (
              <a key={l.href} href={l.href} {...(l.href === current ? { 'aria-current': 'page' } : {})}>{l.label}</a>
            ))}
            {/* Språkvalget gjelder appen, veiviseren og innloggingen; disse sidene finnes bare på norsk */}
            <a href="#" onClick={toggleLang} lang={isEn() ? 'no' : 'en'}>{isEn() ? 'Norsk' : 'English'}</a>
          </nav>
          <p className="foot__org">Arvklart AS &middot; Org.nr. 938&nbsp;816&nbsp;085</p>
        </div>
      </div>
    </footer>
  )
}

export default function SiteLayout({ current, demo, loggedIn = false, children, after = null }) {
  const hydrated = useHydrated()
  const onFront = current === HOME
  return (
    <div className={`ak${hydrated ? ' ak-js' : ''}${loggedIn ? ' ak--innlogget' : ''}`} lang="nb">
      {/* Innlogget ligger menyen i TopBar, og «Hopp til innholdet» hører til den */}
      {!loggedIn && <a className="skip" href="#innhold">Hopp til innholdet</a>}
      {!loggedIn && <Header demo={demo} current={current} onFront={onFront} />}
      <main id="innhold">{children}</main>
      {/* etter <main>: den faste demoknappen på mobil, som ikke er en del av innholdet */}
      {after}
      <Footer current={current} />
    </div>
  )
}
