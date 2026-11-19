import SiteLayout, { DemoCta, DemoError } from '../site/SiteLayout'
import useDemo from '../site/useDemo'
import Rotator from '../site/Rotator'
import Signature from '../site/Signature'
import Journey from '../site/Journey'
import Faq from '../site/Faq'
import MobileDock from '../site/MobileDock'
import { ArrowLink, Check } from '../site/icons'
import { Cap, Img } from '../site/Shot'
import { HOME } from '../lib/routes'

// Den offentlige forsiden (/). Forhåndsrendres av src/seo/vitePlugin.js og hydreres i nettleseren.
// Designfasit: integrasjonspakken av 19.11.2026. All CSS ligger i src/site/site.css under «.ak».
//
// Innlogget vises forsiden bare når appen ber om den («Tilbake til hjemmesiden», LANDING_STATE).
// Da ligger menyen i TopBar, så sidens egen header er skjult, og demoknappen går til «Mine bo».

const TEAM = [
  { bilde: 't-bard.webp', navn: 'Bård Jakobsen Rinnan', rolle: 'Produkt og marked' },
  { bilde: 't-andrea.webp', navn: 'Andrea Hufthammer Vik', rolle: 'Drift og fremdrift' },
  { bilde: 't-orjan.webp', navn: 'Ørjan Westre', rolle: 'Teknologi og økonomi' },
  { bilde: 't-julie.webp', navn: 'Julie Tvedt', rolle: 'Brukeropplevelse og piloter' },
]

export default function LandingPage({ loggedIn = false }) {
  const demo = useDemo({ loggedIn })

  return (
    <SiteLayout current={HOME} demo={demo} loggedIn={loggedIn}
      after={<MobileDock demo={demo} />}>

      {/* ====================== §1 FØRSTE SKJERMBILDE ====================== */}
      <section className="ground g-natt hero" id="top" aria-labelledby="h1">
        <div className="rules" aria-hidden="true"><i /></div>
        <div className="hero__glow" aria-hidden="true" />
        <div className="wrap">
          <div className="hero__in">
            <p className="overline overline--c">Digitalt verktøy for fordeling av innbo og arvegjenstander</p>
            {/* Overskriften har én stabil tilgjengelig tekst, se src/site/Rotator.jsx */}
            {/* Mellomrommene er med vilje: uten dem blir ren tekst «Fordelarvegjenstandene…».
                Det tilgjengelige navnet er riktig uansett, men teksten leses også av søkemotorer. */}
            <h1 id="h1">
              <span className="h1__r1">Fordel</span>{' '}
              <Rotator />{' '}
              <span className="h1__r2">med <em>én felles</em> oversikt</span>
            </h1>
            <p className="lead">Legg inn bilder av eiendelene, se hvem som ønsker hva, og dokumenter
              fordelingen dere blir enige om.</p>
            <div className="hero__cta">
              <DemoCta demo={demo} />
              <a className="ul ul--sub" href="/kontakt">Kontakt oss</a>
            </div>
            <p className="hero__micro">
              <Check />
              <span>Ingen registrering. Du utforsker et eksempelbo.</span>
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
            <p className="overline">Fra første bilde til dokumentert fordeling</p>
            <h2 id="h2-reise">Se tingene og hvem som <em>ønsker</em> dem</h2>
            <p className="lead">Møbler, servise, smykker og andre eiendeler kan samles med bilder og
              beskrivelser. Familien får et felles sted å se gjennom innboet og legge inn ønsker.</p>
          </div>

          <Journey />

          {/* KI og verdi: valgfri støtte, ikke et eget hovedsteg */}
          <aside className="valgfri" aria-labelledby="h3-valgfri">
            <div className="valgfri__grid">
              <div>
                <p className="label">Valgfri hjelp</p>
                <h3 id="h3-valgfri">KI foreslår. Dere bestemmer.</h3>
              </div>
              <div className="valgfri__t">
                <p>Tar dere et bilde, kan KI foreslå navn, kategori og tilstand, og gi et
                  verdianslag. Dere ser over forslagene og bestemmer hva dere vil bruke.
                  Et verdianslag er ikke en takst.</p>
                <p><a className="ul ul--sub" href="/slik-fungerer-det">Les om
                  KI-hjelp og de tre verditallene</a></p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ============ §5 TEAMET ============ */}
      <section className="ground g-natt sec" aria-labelledby="h2-5">
        <div className="rules" aria-hidden="true"><i /></div>
        <div className="wrap">
          <p className="overline">Om oss</p>
          <h2 id="h2-5" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '14ch' }}>
            Teamet bak <em>Arvklart</em></h2>
          <p className="body">Ideen til Arvklart kom fra et behov i egen familie. Gjennom Venture
            Creation ved NHH ble vi et team som ville utvikle løsningen sammen. Nå tar vi Arvklart
            videre for å gjøre fordelingen av innbo enklere for flere familier.</p>

          <ul className="team">
            {TEAM.map(p => (
              <li key={p.navn}>
                <div className="portrait portrait--foto">
                  <Img src={p.bilde} w={460} h={575} alt={`Portrett av ${p.navn}, en av de fire bak Arvklart.`} />
                </div>
                <p className="team__n">{p.navn}</p>
                <p className="team__r">{p.rolle}</p>
              </li>
            ))}
          </ul>

          <p className="team__links">
            <a className="ul" href="/om-oss">Les om oss</a>
            <a className="ul" href="/kontakt">Kontakt oss</a>
          </p>
        </div>
      </section>

      {/* ============ §6 SPØRSMÅL OG SVAR ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-6">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <p className="overline">Spørsmål og svar</p>
          <h2 id="h2-6" style={{ margin: 'clamp(14px,1.6vw,22px) 0 0', maxWidth: '14ch' }}>
            Før dere <em>begynner</em></h2>
          <Faq />
        </div>
      </section>

      {/* ============ §7 VEIVISER ============ */}
      <section className="ground g-natt sec" aria-labelledby="h2-7">
        <div className="rules" aria-hidden="true"><i /></div>
        <div className="wrap">
          <div className="split split--rev">
            <div className="split__txt">
              <p className="overline">Veiviser</p>
              <h2 id="h2-7" style={{ maxWidth: '17ch' }}>Trenger du oversikt over <em>arveprosessen</em>?</h2>
              <p className="body">Veiviseren samler prosessen i faser, forklarer begreper og lenker til
                offentlige ressurser. Den kan hjelpe deg å finne informasjon om det som kommer før og
                etter fordelingen av innboet.</p>
              <p><ArrowLink href="/veiviser" last="">Åpne veiviseren</ArrowLink></p>
            </div>
            <figure className="split__fig">
              <div className="phoneframe">
                <Img src="m-veiviser.webp" w={620} h={1272}
                  alt="Skjermbilde fra demoen: veiviseren «Fra dødsfall til fordelt bo — steg for steg» med kortet «Hvem arver – og hvor mye?»." />
              </div>
              <Cap>Veiviserens inngang og faseoversikt.</Cap>
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
            <p className="overline overline--c">Prøv det selv</p>
            <h2 id="h2-8">Se hvordan Arvklart fungerer for en <em>familie</em></h2>
            <p className="body">Utforsk et ferdig eksempelbo og se hvordan gjenstander, ønsker og
              fordeling vises i Arvklart.</p>
            <p><DemoCta demo={demo} /></p>
            <DemoError demo={demo} center />
            <p className="micro">Usikker på om Arvklart passer for dere?{' '}
              <a className="ul" href="/kontakt">Kontakt oss</a>.</p>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
