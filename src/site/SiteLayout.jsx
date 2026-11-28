import { useEffect, useRef } from 'react'
import { L, isEn, setLang } from '../lib/lang'
import { HOME } from '../lib/routes'
import { useHydrated } from './useHydrated'
import './site.css'

// Rammen rundt de fire offentlige sidene (/, /slik-fungerer-det, /om-oss, /kontakt).
//
// All CSS ligger i site.css og er avgrenset til rotklassen «ak». Appen, demoen og innloggingen
// bruker ingen av reglene; se docs/ny-offentlig-nettside.md for hva avgrensningen dekker og ikke.
//
// Språk: sidene finnes på norsk og engelsk gjennom prosjektets egen løsning (L() i src/lib/lang.js).
// Begge språk ligger på samme adresse – språket følger kontoen og hs_lang, ikke URL-en – så det
// finnes ingen egne språkadresser å peke hreflang til. Rotelementet merkes med gjeldende språk.
//
// «Prøv demo» er alltid en lenke til /#demo, så den virker uten JavaScript. Med JavaScript starter
// den demoen med én gang (src/site/useDemo.js). Elementtypen endres ikke ved hydrering.

// Samme liste i hovedmenyen på brede skjermer og i mobilmenyen, så «Kontakt» finnes i begge.
// «Prøv demo» står utenfor listen, som den tydelige hovedhandlingen.
const NAV = () => [
  { href: '/slik-fungerer-det', label: L('Slik fungerer det', 'How it works') },
  { href: '/veiviser', label: L('Veiviser', 'Guide') },
  { href: '/om-oss', label: L('Om oss', 'About us') },
  { href: '/kontakt', label: L('Kontakt', 'Contact') },
  { href: '/logg-inn', label: L('Logg inn', 'Log in') },
]

const FOOT = () => [
  { href: HOME, label: L('Forsiden', 'Home') },
  { href: '/slik-fungerer-det', label: L('Slik fungerer det', 'How it works') },
  { href: '/om-oss', label: L('Om oss', 'About us') },
  { href: '/veiviser', label: L('Veiviser', 'Guide') },
  { href: '/kontakt', label: L('Kontakt', 'Contact') },
  { href: '/personvern', label: L('Personvern', 'Privacy') },
  { href: '/personvern#vilkar', label: L('Vilkår', 'Terms') },
  { href: '/logg-inn', label: L('Logg inn', 'Log in') },
]

// Språkbytte for besøkende som ikke er innlogget (innloggede bytter i TopBar og under «Min konto»).
// Siden lastes på nytt, så hele siden – inkludert tittel og lang-attributtet – bytter samtidig.
const toggleLang = (e) => {
  e.preventDefault()
  setLang(isEn() ? 'no' : 'en')
  window.location.reload()
}

export function DemoCta({ demo, className = 'btn', idle, tabIndex }) {
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

// Eksportert: /veiviser bruker den samme headeren (src/pages/GuidePage.jsx), ikke en kopi.
export function SiteHeader({ demo, current, onFront = false }) {
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
          aria-label={onFront ? L('Arvklart, til toppen av siden', 'Arvklart, to the top of the page') : L('Arvklart, til forsiden', 'Arvklart, to the home page')}>
          <span className="brand__mark" aria-hidden="true" />
        </a>

        <nav className="nav" aria-label={L('Hovedmeny', 'Main menu')}>
          {NAV().map(l => <a key={l.href} href={l.href} {...mark(l.href)}>{l.label}</a>)}
        </nav>

        <details className="menu" ref={menu} onClick={closeMenu}>
          <summary>{L('Meny', 'Menu')}</summary>
          <div className="menu__panel">
            {NAV().map(l => <a key={l.href} href={l.href} {...mark(l.href)}>{l.label}</a>)}
          </div>
        </details>

        <DemoCta demo={demo} />
      </div>
    </header>
  )
}

function Footer({ current }) {
  const links = FOOT().filter(l => !(current === HOME && l.href === HOME))
  return (
    <footer className="ground g-natt foot">
      <div className="wrap">
        <div className="foot__in">
          <p className="foot__t">{L(
            'Arvklart er et digitalt verktøy for fordeling av innbo og løsøre. Familien tar beslutningene.',
            'Arvklart is a digital tool for sharing out household contents and personal belongings. The family makes the decisions.',
          )}</p>
          <nav className="foot__links" aria-label={L('Bunnmeny', 'Footer menu')}>
            {links.map(l => (
              <a key={l.href} href={l.href} {...(l.href === current ? { 'aria-current': 'page' } : {})}>{l.label}</a>
            ))}
            <a href="#" onClick={toggleLang} lang={isEn() ? 'no' : 'en'}>{isEn() ? 'Norsk' : 'English'}</a>
          </nav>
          {/* Verifisert mot Enhetsregisteret 19.11.2026; samme opplysninger i personvernerklæringen */}
          <p className="foot__org">Arvklart AS &middot; {L('Org.nr.', 'Company no.')} 938&nbsp;816&nbsp;085</p>
        </div>
      </div>
    </footer>
  )
}

export default function SiteLayout({ current, demo, loggedIn = false, children, after = null }) {
  const hydrated = useHydrated()
  const onFront = current === HOME
  return (
    <div className={`ak${hydrated ? ' ak-js' : ''}${loggedIn ? ' ak--innlogget' : ''}`} lang={isEn() ? 'en' : 'nb'}>
      {/* Innlogget ligger menyen i TopBar, og «Hopp til innholdet» hører til den */}
      {!loggedIn && <a className="skip" href="#innhold">{L('Hopp til innholdet', 'Skip to content')}</a>}
      {!loggedIn && <SiteHeader demo={demo} current={current} onFront={onFront} />}
      <main id="innhold">{children}</main>
      {/* etter <main>: den faste demoknappen på mobil, som ikke er en del av innholdet */}
      {after}
      <Footer current={current} />
    </div>
  )
}
