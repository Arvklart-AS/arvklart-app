import { useRef, useState } from 'react'
import { Arrow, ArrowLink } from './icons'
import { Cap, Img } from './Shot'

// PRODUKTREISEN — fire steg, én gjenstand hele veien
//
// Bryteren er radioknapper og :has() i CSS. Den virker uten JavaScript: alle fire stegene finnes i
// HTML-en, og radioknappene bytter mellom dem av seg selv. «Neste steg» er bare et tillegg for den
// som heller vil klikke framover, og er skjult uten JavaScript (.ak-js .nostep).
//
// Radioknappen dekker hele raden sin i stedet for å være ett usynlig punkt, så fokusringen havner
// rundt raden den gjelder og ingen tabulatorstopp er usynlig (se CSS).

const STEG = [
  { id: 'r1', n: '01', t: 'Samle gjenstandene' },
  { id: 'r2', n: '02', t: 'Se familiens ønsker' },
  { id: 'r3', n: '03', t: 'Finn en fordeling' },
  { id: 'r4', n: '04', t: 'Dokumenter resultatet' },
]

// Ramme rundt et utsnitt inne i produktreisen
const Sh = ({ src, w, h, alt, caption, kilde, frameStyle }) => (
  <figure className="sh">
    <div className="sh__f" style={frameStyle}><Img src={src} w={w} h={h} alt={alt} /></div>
    <Cap kilde={kilde}>{caption}</Cap>
  </figure>
)

const Next = ({ children }) => (
  <p className="st__next"><Arrow /><span>{children}</span></p>
)

export default function Journey() {
  const inputs = useRef([])
  const [aktiv, setAktiv] = useState(0)

  const sisteSteg = aktiv >= STEG.length - 1
  const neste = () => {
    const i = inputs.current.findIndex(e => e?.checked)
    const n = ((i < 0 ? 0 : i) + 1) % STEG.length
    const el = inputs.current[n]
    if (!el) return
    el.checked = true
    setAktiv(n)
    const st = document.querySelector('.stage')
    if (st && st.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      st.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }
  }

  return (
    <div className="reise">
      <ol className="rail" aria-label="Fire steg gjennom Arvklart">
        {STEG.map((s, i) => (
          <li key={s.id}>
            <input type="radio" name="reise" id={s.id} defaultChecked={i === 0}
              ref={el => { inputs.current[i] = el }} onChange={() => setAktiv(i)} />
            <label className="rail__b" htmlFor={s.id}>
              <span className="rail__n">{s.n}</span>{' '}
              <span className="rail__t">{s.t}</span>
            </label>
          </li>
        ))}
      </ol>

      <div className="stage">
        {/* STEG 1 */}
        <article className="st s1" aria-labelledby="st1">
          <div className="st__txt">
            <p className="st__nr">Steg 1 av 4</p>
            <h3 id="st1">Ta et bilde. Se over. <em>Lagre</em>.</h3>
            <p>Legg inn bilder og opplysninger, slik at familien får en felles oversikt over
              det som skal fordeles.</p>
            <p>Dere kan legge inn flere gjenstander om gangen, og bruke kategorier og søk
              når dere vil finne igjen en bestemt ting. En gjenstand kan også legges inn
              uten bilde.</p>
            <Next>Vi følger oljemaleriet gjennom resten av stegene.</Next>
          </div>
          <div className="st__shots st__shots--duo">
            <Sh src="i-skjema.webp" w={640} h={837}
              alt="Skjermbilde fra demoen: skjemaet «Legg til gjenstand» med felt for bilder, navn og kategori."
              caption="«Legg til gjenstand»: bilde, navn, kategori og tilstand." />
            <Sh src="j-maleri.webp" w={680} h={216}
              alt="Skjermbilde fra demoen: oljemaleriet av blomster slik det ligger i boet etter at det er registrert."
              caption="Oljemaleriet, slik det ligger i boet etterpå." />
          </div>
        </article>

        {/* STEG 2 */}
        <article className="st s2" aria-labelledby="st2">
          <div className="st__txt">
            <p className="st__nr">Steg 2 av 4</p>
            <h3 id="st2">Hver deltaker sier hva <em>de</em> ønsker seg</h3>
            <p>Hver deltaker kan vise interesse og forklare hvorfor en gjenstand betyr noe
              for dem.</p>
            <p>Oversikten viser hva én, flere eller ingen har sagt ja til, og hva som ennå
              ikke er besvart.</p>
            <p className="note">Svaret gis på gjenstandens side, eller ved å gå gjennom boet
              én ting av gangen. Begrunnelsen er valgfri, og valget kan angres.</p>
            <Next>To av tre arvinger har allerede svart ja til maleriet.</Next>
          </div>
          <div className="st__shots">
            <Sh src="j-svar.webp" w={900} h={141} frameStyle={{ maxWidth: '560px' }}
              alt="Skjermbilde fra demoen: knappene «Registrer interesse» og «Ikke interessert» på oljemaleriets side."
              caption="To knapper. Ja eller nei takk, én gjenstand av gangen." />
          </div>
        </article>

        {/* STEG 3 */}
        <article className="st s3" aria-labelledby="st3">
          <div className="st__txt">
            <p className="st__nr">Steg 3 av 4</p>
            <h3 id="st3">Se hvor ønskene <em>møtes</em></h3>
            <p>Se hvor ønskene møtes, og bruk fordelingsmetodene som støtte når flere ønsker
              det samme.</p>
            <p>Begrunnelsene står ved siden av hverandre, ikke i en egen samtale et annet
              sted. Blir dere ikke enige, kan familien velge loddtrekning, vekslende runder
              eller jevn verdifordeling.</p>
            <p className="note">Et manglende svar regnes ikke som «nei takk». Skal en gjenstand
              fordeles med en metode, må svarene fra dem det gjelder være på plass først.</p>
            <Next>Metodene er støtte til beslutningen, ikke beslutningen.</Next>
          </div>
          <div className="st__shots st__shots--pair">
            <Sh src="j-onsker.webp" w={1060} h={454}
              alt="Skjermbilde fra demoen: «Flere ønsker denne (2)» med teksten «Snakk sammen først» og begrunnelsene fra Lars Hansen og Kari Hansen om oljemaleriet."
              caption="«Snakk sammen først»: hver arvings begrunnelse står side om side." />
            <Sh src="p-metoder.webp" w={680} h={469}
              alt="Skjermbilde fra demoen: valget mellom Loddtrekning, Vekslende runder og Jevn verdifordeling."
              caption="Metodevalget slik det står i demoen." />
          </div>
        </article>

        {/* STEG 4 */}
        <article className="st s4" aria-labelledby="st4">
          <div className="st__txt">
            <p className="st__nr">Steg 4 av 4</p>
            <h3 id="st4">Ta vare på det dere har <em>avklart</em></h3>
            <p>Få oversikt over hvem som får hva, og hent ut dokumentasjon på det dere har
              registrert.</p>
            <p>Det som fortsatt er uavklart, står for seg i stedet for å utelates.</p>
            <p className="note">Arvklart dokumenterer registrerte tildelinger og godkjenninger.
              Godkjenning i løsningen er ikke BankID-signering.</p>
            <Next>Alle fire stegene finnes i det offentlige eksempelboet.</Next>
          </div>
          <div className="st__shots">
            <Sh src="m-dok.webp" w={620} h={1342} frameStyle={{ maxWidth: '300px' }}
              alt="Skjermbilde fra demoen: siden «Fordelingen» med knappen «Last ned utkast (PDF)», avsnittet om godkjenning og status per arving."
              caption="«Fordelingen» med utkast til protokoll og status per arving." />
          </div>
        </article>
      </div>

      <p className="reise__nav">
        <button className="btn btn--sm nostep" type="button" id="neste" onClick={neste}>
          {sisteSteg ? 'Begynn på nytt' : 'Neste steg'}
        </button>
        <ArrowLink href="/slik-fungerer-det" last="det">Se hele arbeidsflyten i Slik fungerer</ArrowLink>
      </p>
    </div>
  )
}
