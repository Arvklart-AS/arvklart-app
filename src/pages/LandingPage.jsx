import { useState } from 'react'
import SiteLayout, { DemoCta, DemoError } from '../site/SiteLayout'
import useDemo from '../site/useDemo'
import Rotator, { RotatorPause } from '../site/Rotator'
import Signature from '../site/Signature'
import Journey from '../site/Journey'
import Faq from '../site/Faq'
import MobileDock from '../site/MobileDock'
import { ArrowLink, Check } from '../site/icons'
import { Cap, Img } from '../site/Shot'
import { L } from '../lib/lang'
import { HOME } from '../lib/routes'

// Den offentlige forsiden (/). Forhåndsrendres av src/seo/vitePlugin.js og hydreres i nettleseren.
// Designfasit: integrasjonspakken av 19.11.2026. All CSS ligger i src/site/site.css under «.ak».
//
// Innlogget vises forsiden bare når appen ber om den («Tilbake til hjemmesiden», LANDING_STATE).
// Da ligger menyen i TopBar, så sidens egen header er skjult, og demoknappen går til «Mine bo».

const TEAM = [
  { bilde: 't-bard.webp', navn: 'Bård Jakobsen Rinnan', rolle: L('Produkt og marked', 'Product and market') },
  { bilde: 't-andrea.webp', navn: 'Andrea Hufthammer Vik', rolle: L('Drift og fremdrift', 'Operations and delivery') },
  { bilde: 't-orjan.webp', navn: 'Ørjan Westre', rolle: L('Teknologi og økonomi', 'Technology and finance') },
  { bilde: 't-julie.webp', navn: 'Julie Tvedt', rolle: L('Brukeropplevelse og piloter', 'User experience and pilots') },
]

export default function LandingPage({ loggedIn = false }) {
  const demo = useDemo({ loggedIn })
  // WCAG 2.2.2: ordskiftet i overskriften kan stanses. Se src/site/Rotator.jsx.
  const [paused, setPaused] = useState(false)

  return (
    <SiteLayout current={HOME} demo={demo} loggedIn={loggedIn}
      after={<MobileDock demo={demo} />}>

      {/* ====================== §1 FØRSTE SKJERMBILDE ====================== */}
      <section className="ground g-natt hero" id="top" aria-labelledby="h1">
        <div className="rules" aria-hidden="true"><i /></div>
        <div className="hero__glow" aria-hidden="true" />
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
              <span className="h1__r2">{L(<>med <em>én felles</em> oversikt</>, <>with <em>one shared</em> overview</>)}</span>
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

      {/* ============ PRODUKTREISEN ============ */}
      <section className="ground g-papir sec sec--tight" aria-labelledby="h2-reise">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <div className="s2__head">
            <p className="overline">{L('Fra første bilde til dokumentert fordeling', 'From the first photo to a documented division')}</p>
            <h2 id="h2-reise">{L(<>Se tingene og hvem som <em>ønsker</em> dem</>, <>See the things, and who <em>wants</em> them</>)}</h2>
            <p className="lead">{L(
              'Møbler, servise, smykker og andre eiendeler kan samles med bilder og beskrivelser. Familien får et felles sted å se gjennom innboet og legge inn ønsker.',
              'Furniture, china, jewellery and other belongings can be gathered with photos and descriptions. The family gets one place to go through the contents and register wishes.',
            )}</p>
          </div>

          <Journey />

          {/* KI og verdi: valgfri støtte, ikke et eget hovedsteg */}
          <aside className="valgfri" aria-labelledby="h3-valgfri">
            <div className="valgfri__grid">
              <div>
                <p className="label">{L('Valgfri hjelp', 'Optional help')}</p>
                <h3 id="h3-valgfri">{L('KI foreslår. Dere bestemmer.', 'AI suggests. You decide.')}</h3>
              </div>
              <div className="valgfri__t">
                <p>{L(
                  'Tar dere et bilde, kan KI foreslå navn, kategori og tilstand, og gi et verdianslag. Dere ser over forslagene og bestemmer hva dere vil bruke. Et verdianslag er ikke en takst.',
                  'If you take a photo, AI can suggest a name, a category and a condition, and give an estimated value. You look over the suggestions and decide what to use. An estimate is not a professional valuation.',
                )}</p>
                <p><a className="ul ul--sub" href="/slik-fungerer-det">{L(
                  'Les om KI-hjelp og de tre verditallene',
                  'Read about the AI help and the three different figures',
                )}</a></p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ============ §5 TEAMET ============ */}
      <section className="ground g-natt sec" aria-labelledby="h2-5">
        <div className="rules" aria-hidden="true"><i /></div>
        <div className="wrap">
          <p className="overline">{L('Om oss', 'About us')}</p>
          <h2 id="h2-5" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '14ch' }}>
            {L(<>Teamet bak <em>Arvklart</em></>, <>The team behind <em>Arvklart</em></>)}</h2>
          <p className="body">{L(
            'Ideen til Arvklart kom fra et behov i egen familie. Gjennom Venture Creation ved NHH ble vi et team som ville utvikle løsningen sammen. Nå tar vi Arvklart videre for å gjøre fordelingen av innbo enklere for flere familier.',
            'The idea for Arvklart came from a need in our own family. Through Venture Creation at NHH we became a team that wanted to build it together. Now we are taking Arvklart further, to make sharing out a home’s contents easier for more families.',
          )}</p>

          <ul className="team">
            {TEAM.map(p => (
              <li key={p.navn}>
                <div className="portrait portrait--foto">
                  <Img src={p.bilde} w={460} h={575}
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
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <p className="overline">{L('Spørsmål og svar', 'Questions and answers')}</p>
          <h2 id="h2-6" style={{ margin: 'clamp(14px,1.6vw,22px) 0 0', maxWidth: '14ch' }}>
            {L(<>Før dere <em>begynner</em></>, <>Before you <em>begin</em></>)}</h2>
          <Faq />
        </div>
      </section>

      {/* ============ §7 VEIVISER ============ */}
      <section className="ground g-natt sec" aria-labelledby="h2-7">
        <div className="rules" aria-hidden="true"><i /></div>
        <div className="wrap">
          <div className="split split--rev">
            <div className="split__txt">
              <p className="overline">{L('Veiviser', 'Guide')}</p>
              <h2 id="h2-7" style={{ maxWidth: '17ch' }}>{L(
                <>Trenger du oversikt over <em>arveprosessen</em>?</>,
                <>Need an overview of the <em>inheritance process</em>?</>,
              )}</h2>
              <p className="body">{L(
                'Veiviseren samler prosessen i faser, forklarer begreper og lenker til offentlige ressurser. Den kan hjelpe deg å finne informasjon om det som kommer før og etter fordelingen av innboet.',
                'The guide gathers the process into phases, explains the terms and links to official Norwegian resources. It can help you find information about what comes before and after the contents are shared out.',
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
                  alt={L('Skjermbilde fra demoen: veiviseren «Fra dødsfall til fordelt bo — steg for steg» med kortet «Hvem arver – og hvor mye?».',
                    'Screenshot from the demo: the guide «Fra dødsfall til fordelt bo» (From death to a settled estate) with the card «Hvem arver – og hvor mye?» (Who inherits, and how much?).')} />
              </div>
              <Cap>{L('Veiviserens inngang og faseoversikt.', 'The guide’s entry point and overview of phases.')}</Cap>
            </figure>
          </div>
        </div>
      </section>

      {/* ============ §8 PRØV DEMOEN ============ */}
      {/* id="demo": «Prøv demo» peker på /#demo, så lenken virker også uten JavaScript */}
      <section className="ground g-papir sec" id="demo" aria-labelledby="h2-8">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <div className="end">
            <p className="overline overline--c">{L('Prøv det selv', 'Try it yourself')}</p>
            <h2 id="h2-8">{L(
              <>Se hvordan Arvklart fungerer for en <em>familie</em></>,
              <>See how Arvklart works for a <em>family</em></>,
            )}</h2>
            <p className="body">{L(
              'Utforsk et ferdig eksempelbo og se hvordan gjenstander, ønsker og fordeling vises i Arvklart.',
              'Explore a ready-made example estate and see how items, wishes and the division appear in Arvklart.',
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
