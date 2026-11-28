import { useState } from 'react'
import SiteLayout, { DemoCta, DemoError } from '../site/SiteLayout'
import useDemo from '../site/useDemo'
import Rotator, { RotatorPause } from '../site/Rotator'
import Signature from '../site/Signature'
import Prosess from '../site/Prosess'
import Faq from '../site/Faq'
import MobileDock from '../site/MobileDock'
import { ArrowLink, Check } from '../site/icons'
import { Cap, Img } from '../site/Shot'
import { L } from '../lib/lang'
import { HOME } from '../lib/routes'

// Den offentlige forsiden (/). Forhåndsrendres av src/seo/vitePlugin.js og hydreres i nettleseren.
// Designfasit: designdemo v4 (smaragd og silke), se docs/nettside-v4.md. All CSS ligger i
// src/site/site.css under «.ak».
//
// Innlogget vises forsiden bare når appen ber om den («Tilbake til hjemmesiden», LANDING_STATE).
// Da ligger menyen i TopBar, så sidens egen header er skjult, og demoknappen går til «Mine bo».

// Kalles ved visning, ikke ved import, så L() leser språket som gjelder nå.
// Titlene beskriver arbeidsområder, ikke formelle ansvarsområder.
const TEAM = () => [
  { bilde: 't-bard.webp', navn: 'Bård Jakobsen Rinnan', rolle: L('CEO | Produkt og marked', 'CEO | Product and Marketing') },
  { bilde: 't-andrea.webp', navn: 'Andrea Hufthammer Vik', rolle: L('COO | Drift og fremdrift', 'COO | Operations and Delivery') },
  { bilde: 't-orjan.webp', navn: 'Ørjan Westre', rolle: L('Teknologi og økonomi', 'Technology and Finance') },
  { bilde: 't-julie.webp', navn: 'Julie Tvedt', rolle: L('Brukeropplevelse og piloter', 'User Experience and Pilots') },
]

export default function LandingPage({ loggedIn = false }) {
  const demo = useDemo({ loggedIn })
  // WCAG 2.2.2: ordskiftet i overskriften kan stanses. Se src/site/Rotator.jsx.
  const [paused, setPaused] = useState(false)

  return (
    <SiteLayout current={HOME} demo={demo} loggedIn={loggedIn}
      after={<MobileDock demo={demo} />}>

      {/* ====================== §1 FØRSTE SKJERMBILDE ====================== */}
      <section className="ground g-natt hero kurve-ned" id="top" aria-labelledby="h1">
        <div className="wrap">
          <div className="hero__in">
            <p className="overline overline--c">{L(
              'Digitalt verktøy for fordeling av innbo og arvegjenstander',
              'A digital tool for sharing out household contents and inherited belongings',
            )}</p>
            {/* Mellomrommene er med vilje: uten dem blir ren tekst «Fordelarvegjenstandene…».
                Det tilgjengelige navnet er riktig uansett, men teksten leses også av søkemotorer. */}
            <h1 id="h1">
              <span className="h1__r1">{L('Fordel', 'Divide')}</span>{' '}
              <Rotator paused={paused} />{' '}
              <span className="h1__r2">{L('med én felles oversikt', 'with one shared overview')}</span>
            </h1>
            <p className="lead">{L(
              'Legg inn bilder av eiendelene, se hvem som ønsker hva, og dokumenter fordelingen dere blir enige om.',
              'Add photos of the belongings, see who wants what, and document the division you agree on.',
            )}</p>
            <div className="hero__cta">
              <DemoCta demo={demo} />
              <a className="ul ul--sub" href="/kontakt">{L('Kontakt oss', 'Contact us')}</a>
            </div>
            <p className="hero__micro">
              <Check />
              <span>{L('Ingen registrering. Du utforsker et eksempelbo.', 'No sign-up. You explore an example estate.')}</span>
              <RotatorPause paused={paused} onToggle={() => setPaused(p => !p)} />
            </p>
            <DemoError demo={demo} />
          </div>
        </div>
      </section>

      {/* ============ SIGNATUR: produktet løftes fra mørke til lys ============ */}
      <Signature />

      {/* ============ PROSESSEN: fire steg på én skjerm ============ */}
      <section className="ground g-papir sec sec--tight" aria-labelledby="h2-reise">
        <div className="wrap">
          <div className="prosess__hode">
            <div>
              <p className="overline">{L('Fra første bilde til dokumentert fordeling', 'From the first photo to a documented division')}</p>
              <h2 id="h2-reise">{L('Slik fordeler dere innboet', 'How you share out the contents')}</h2>
            </div>
            <p className="lead">{L(
              'Fire steg, men ingen fast rekkefølge. Dere kan legge til gjenstander underveis og fordele i flere omganger.',
              'Four steps, but no fixed order. You can add items as you go and divide things in more than one round.',
            )}</p>
          </div>
          <Prosess />
        </div>
      </section>

      {/* ============ §5 TEAMET ============ */}
      <section className="ground g-lin sec" aria-labelledby="h2-5">
        <div className="wrap">
          <p className="overline">{L('Om oss', 'About us')}</p>
          <h2 id="h2-5" className="h2-sek">{L('Teamet bak Arvklart', 'The team behind Arvklart')}</h2>
          <p className="body">{L(
            'Ideen kom fra et behov i egen familie. Gjennom Venture Creation ved NHH ble vi fire som ville bygge løsningen sammen, så flere familier kan fordele innbo med mindre strev.',
            'The idea came from a need in our own family. Through Venture Creation at NHH, four of us decided to build it together, so more families can share out a home with less strain.',
          )}</p>

          <ul className="team">
            {TEAM().map(p => (
              <li key={p.navn}>
                <div className="portrait portrait--foto">
                  <Img src={p.bilde} w={460} h={575} lazy
                    alt={L(`Portrett av ${p.navn}, en av de fire bak Arvklart.`, `Portrait of ${p.navn}, one of the four behind Arvklart.`)} />
                </div>
                <p className="team__n">{p.navn}</p>
                <p className="team__r">{p.rolle}</p>
              </li>
            ))}
          </ul>

          <p className="team__links">
            <a className="ul" href="/om-oss">{L('Les om oss', 'Read about us')}</a>
            <a className="ul" href="/kontakt">{L('Kontakt oss', 'Contact us')}</a>
          </p>
        </div>
      </section>

      {/* ============ §6 SPØRSMÅL OG SVAR ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-6">
        <div className="wrap faq-oppsett">
          <div>
            <p className="overline">{L('Spørsmål og svar', 'Questions and answers')}</p>
            <h2 id="h2-6" className="h2-sek">{L('Før dere begynner', 'Before you begin')}</h2>
          </div>
          <Faq />
        </div>
      </section>

      {/* ============ §7 VEIVISER ============ */}
      <section className="ground g-natt sec kurve-begge" aria-labelledby="h2-7">
        <div className="wrap">
          <div className="split split--rev">
            <div className="split__txt">
              <p className="overline">{L('Veiviser', 'Guide')}</p>
              <h2 id="h2-7" style={{ maxWidth: '17ch' }}>{L(
                <>Trenger du oversikt over arveprosessen?</>,
                <>Need an overview of the inheritance process?</>,
              )}</h2>
              <p className="body">{L(
                'Veiviseren deler arveoppgjøret i faser, forklarer begrepene og lenker til offentlige kilder. Der finner du det som kommer før og etter fordelingen av innboet.',
                'The guide splits the estate settlement into phases, explains the terms and links to official Norwegian sources. That is where you find what comes before and after the contents are shared out.',
              )}</p>
              {/* Veiviseren finnes foreløpig bare på norsk; det sies der det er relevant */}
              <p>{L(
                <ArrowLink href="/veiviser">Åpne veiviseren</ArrowLink>,
                <ArrowLink href="/veiviser">Open the guide (in Norwegian)</ArrowLink>,
              )}</p>
            </div>
            <figure className="split__fig">
              <div className="phoneframe">
                <Img src="m-veiviser.webp" w={620} h={1272}
                  alt={L('Skjermbilde fra demoen: veiviseren «Arveveiviser: fra dødsfall til fordelt bo, steg for steg» med kortet «Hvem arver – og hvor mye?».',
                    'Screenshot from the demo: the guide «Arveveiviser: fra dødsfall til fordelt bo, steg for steg» (Inheritance guide: from death to a settled estate, step by step) with the card «Hvem arver – og hvor mye?» (Who inherits, and how much?).')} />
              </div>
              <Cap>{L('Veiviserens inngang og faseoversikt.', 'The guide’s entry point and overview of phases.')}</Cap>
            </figure>
          </div>
        </div>
      </section>

      {/* ============ §8 PRØV DEMOEN ============ */}
      {/* id="demo": «Prøv demo» peker på /#demo, så lenken virker også uten JavaScript */}
      <section className="ground g-papir sec" id="demo" aria-labelledby="h2-8">
        <div className="wrap">
          <div className="end">
            <p className="overline overline--c">{L('Prøv det selv', 'Try it yourself')}</p>
            <h2 id="h2-8">{L(
              <>Se hvordan Arvklart fungerer for en familie</>,
              <>See how Arvklart works for a family</>,
            )}</h2>
            <p className="body">{L(
              'Åpne et eksempelbo med tre arvinger og ti gjenstander. Du kan se gjenstandene, vise interesse og prøve fordelingen.',
              'Open an example estate with three heirs and ten items. You can look at the items, register interest and try out the division.',
            )}</p>
            <p><DemoCta demo={demo} /></p>
            <DemoError demo={demo} center />
            <p className="micro">{L('Usikker på om Arvklart passer for dere?', 'Not sure whether Arvklart suits you?')}{' '}
              <a className="ul" href="/kontakt">{L('Kontakt oss', 'Contact us')}</a>.</p>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
