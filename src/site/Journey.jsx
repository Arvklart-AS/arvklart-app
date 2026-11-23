import { useRef, useState } from 'react'
import { L } from '../lib/lang'
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

const STEG = () => [
  { id: 'r1', n: '01', t: L('Samle gjenstandene', 'Gather the items') },
  { id: 'r2', n: '02', t: L('Se familiens ønsker', "See the family's wishes") },
  { id: 'r3', n: '03', t: L('Finn en fordeling', 'Find a way to divide') },
  { id: 'r4', n: '04', t: L('Dokumenter resultatet', 'Document the result') },
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
  const steg = STEG()

  const sisteSteg = aktiv >= steg.length - 1
  const neste = () => {
    const i = inputs.current.findIndex(e => e?.checked)
    const n = ((i < 0 ? 0 : i) + 1) % steg.length
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
      <ol className="rail" aria-label={L('Fire steg gjennom Arvklart', 'Four steps through Arvklart')}>
        {steg.map((s, i) => (
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
            <p className="st__nr">{L('Steg 1 av 4', 'Step 1 of 4')}</p>
            <h3 id="st1">{L(<>Ta et bilde. Se over. <em>Lagre</em>.</>, <>Take a photo. Check it. <em>Save</em>.</>)}</h3>
            <p>{L(
              'Legg inn bilder og opplysninger, så familien får én felles oversikt over det som skal fordeles.',
              'Add photos and details, so the family gets one shared overview of what is to be divided.',
            )}</p>
            <p>{L(
              'Flere gjenstander om gangen, med kategorier og søk. En gjenstand kan også legges inn uten bilde.',
              'Several items at a time, with categories and search. An item can also be added without a photo.',
            )}</p>
            <Next>{L('Vi følger oljemaleriet gjennom resten av stegene.', 'We follow the oil painting through the rest of the steps.')}</Next>
          </div>
          <div className="st__shots st__shots--duo">
            <Sh src="i-skjema.webp" w={640} h={837}
              alt={L('Skjermbilde fra demoen: skjemaet «Legg til gjenstand» med knappene «Ta bilder» og «Velg bilder» og feltet for navn.',
                'Screenshot from the demo: the «Legg til gjenstand» (Add item) form with the «Ta bilder» (Take photos) and «Velg bilder» (Choose photos) buttons and the name field.')}
              caption={L('«Legg til gjenstand»: bilde, navn, kategori og tilstand.', '«Legg til gjenstand»: photo, name, category and condition.')} />
            <Sh src="j-maleri.webp" w={680} h={216}
              alt={L('Skjermbilde fra demoen: oljemaleriet av blomster slik det ligger i boet etter at det er registrert.',
                'Screenshot from the demo: the oil painting of flowers as it appears in the estate once registered.')}
              caption={L('Oljemaleriet, slik det ligger i boet etterpå.', 'The oil painting, as it appears in the estate afterwards.')} />
          </div>
        </article>

        {/* STEG 2 */}
        <article className="st s2" aria-labelledby="st2">
          <div className="st__txt">
            <p className="st__nr">{L('Steg 2 av 4', 'Step 2 of 4')}</p>
            <h3 id="st2">{L(<>Hver deltaker sier hva <em>de</em> ønsker seg</>, <>Everyone says what <em>they</em> would like</>)}</h3>
            <p>{L(
              'Hver deltaker viser interesse, og kan forklare hvorfor en gjenstand betyr noe for dem.',
              'Each participant registers interest, and can explain why an item matters to them.',
            )}</p>
            {/* Oversikten viser akkurat dette: fordelingen per gjenstand */}
            <p>{L(
              'Oversikten viser hva én, flere eller ingen har sagt ja til.',
              'The overview shows what one, several or no one has said yes to.',
            )}</p>
            <p className="note">{L(
              'Begrunnelsen er valgfri, og valget kan angres.',
              'The explanation is optional, and you can change your mind.',
            )}</p>
            <Next>{L('To av tre arvinger har allerede svart ja til maleriet.', 'Two of the three heirs have already said yes to the painting.')}</Next>
          </div>
          <div className="st__shots">
            <Sh src="j-svar.webp" w={900} h={141} frameStyle={{ maxWidth: '560px' }}
              alt={L('Skjermbilde fra demoen: knappene «Registrer interesse» og «Ikke interessert» på oljemaleriets side.',
                'Screenshot from the demo: the buttons «Registrer interesse» (Register interest) and «Ikke interessert» (Not interested) on the painting’s page.')}
              caption={L('To knapper. Ja eller nei takk, én gjenstand av gangen.', 'Two buttons. Yes or no thanks, one item at a time.')} />
          </div>
        </article>

        {/* STEG 3 */}
        <article className="st s3" aria-labelledby="st3">
          <div className="st__txt">
            <p className="st__nr">{L('Steg 3 av 4', 'Step 3 of 4')}</p>
            <h3 id="st3">{L(<>Se hvor ønskene <em>møtes</em></>, <>See where the wishes <em>meet</em></>)}</h3>
            <p>{L(
              'Når flere ønsker det samme, står begrunnelsene side om side — ikke i en egen samtale et annet sted.',
              'When several want the same thing, the explanations sit side by side — not in a separate conversation somewhere else.',
            )}</p>
            <p>{L(
              'Blir dere ikke enige: loddtrekning, vekslende runder eller jevn verdifordeling.',
              'If you cannot agree: a lottery, alternating rounds or an even value split.',
            )}</p>
            <p className="note">{L(
              'Et manglende svar regnes aldri som «nei takk» — svarene må være inne før en metode kan brukes.',
              'A missing answer is never counted as «no thanks» — the answers have to be in before a method can be used.',
            )}</p>
            <Next>{L('Metodene er støtte til beslutningen, ikke beslutningen.', 'The methods support the decision; they are not the decision.')}</Next>
          </div>
          <div className="st__shots st__shots--pair">
            <Sh src="j-onsker.webp" w={1060} h={454}
              alt={L('Skjermbilde fra demoen: «Flere ønsker denne (2)» med teksten «Snakk sammen først» og begrunnelsene fra Lars Hansen og Kari Hansen om oljemaleriet.',
                'Screenshot from the demo: «Flere ønsker denne (2)» (Several want this) with the text «Snakk sammen først» (Talk it over first) and the explanations from Lars Hansen and Kari Hansen about the oil painting.')}
              caption={L('«Snakk sammen først»: hver arvings begrunnelse står side om side.', '«Snakk sammen først»: each heir’s explanation sits side by side.')} />
            <Sh src="p-metoder.webp" w={680} h={469}
              alt={L('Skjermbilde fra demoen: valget mellom Loddtrekning, Vekslende runder og Jevn verdifordeling.',
                'Screenshot from the demo: the choice between Loddtrekning (lottery), Vekslende runder (alternating rounds) and Jevn verdifordeling (even value split).')}
              caption={L('Metodevalget slik det står i demoen.', 'The choice of method as it appears in the demo.')} />
          </div>
        </article>

        {/* STEG 4 */}
        <article className="st s4" aria-labelledby="st4">
          <div className="st__txt">
            <p className="st__nr">{L('Steg 4 av 4', 'Step 4 of 4')}</p>
            <h3 id="st4">{L(<>Ta vare på det dere har <em>avklart</em></>, <>Keep what you have <em>settled</em></>)}</h3>
            <p>{L(
              'Se hvem som får hva, og hent ut dokumentasjon på det dere har registrert.',
              'See who gets what, and take out documentation of what you have registered.',
            )}</p>
            <p>{L(
              'Det som fortsatt er uavklart, står for seg.',
              'Whatever is still unsettled is listed separately.',
            )}</p>
            <p className="note">{L(
              'Godkjenning her er ikke BankID-signering.',
              'Approving here is not a BankID signature.',
            )}</p>
            <Next>{L('Alle fire stegene finnes i det offentlige eksempelboet.', 'All four steps are in the public example estate.')}</Next>
          </div>
          <div className="st__shots">
            <Sh src="m-dok.webp" w={620} h={1342} frameStyle={{ maxWidth: '300px' }}
              alt={L('Skjermbilde fra demoen: siden «Fordelingen» med knappen «Last ned utkast (PDF)», avsnittet om godkjenning og status per arving.',
                'Screenshot from the demo: the «Fordelingen» (The distribution) page with the «Last ned utkast (PDF)» (Download draft) button, the section on approval and the status per heir.')}
              caption={L('«Fordelingen» med utkast til protokoll og status per arving.', '«Fordelingen» with the draft record and the status per heir.')} />
          </div>
        </article>
      </div>

      <p className="reise__nav">
        <button className="btn btn--sm nostep" type="button" id="neste" onClick={neste}>
          {sisteSteg ? L('Begynn på nytt', 'Start over') : L('Neste steg', 'Next step')}
        </button>
        {L(
          <ArrowLink href="/slik-fungerer-det" last="det">Se hele arbeidsflyten i Slik fungerer</ArrowLink>,
          <ArrowLink href="/slik-fungerer-det" last="works">See the whole workflow in How it</ArrowLink>,
        )}
      </p>
    </div>
  )
}
