// SPØRSMÅL OG SVAR
// <details>/<summary>, så siden virker uten JavaScript. Spørsmål 02 står åpent fra starten, slik
// det gjør i integrasjonspakken, så det er tydelig at radene kan åpnes.
const SPM = [
  {
    q: 'Kan jeg prøve uten å opprette en konto?',
    a: 'Ja. Den offentlige demoen åpner et eksempelbo. Du kan utforske gjenstandene, vise interesse og se fordelingsmetodene uten å registrere deg.',
  },
  {
    q: 'Hvordan blir resten av familien med?',
    a: 'Den som oppretter boet registrerer navn og e-postadresse på de andre. Arvklart lager en invitasjonsmelding med en lenke, som du sender videre selv. Den som er invitert logger inn med den samme e-postadressen.',
    open: true,
  },
  {
    q: 'Må vi sette en pris på alle tingene?',
    a: 'Nei. Dere kan registrere gjenstander og ønsker uten å sette verdi på alt. Fordelingsverdien er tallet gjenstanden regnes med i fordelingen, og den settes av den som administrerer boet.',
  },
  {
    q: 'Hva skjer hvis flere ønsker samme gjenstand?',
    a: 'Dere kan se hverandres ønsker og begrunnelser og bruke dem som utgangspunkt for en samtale. Arvklart tilbyr også ulike fordelingsmetoder dere kan velge mellom. Familien bestemmer hvordan dere vil gå videre.',
  },
  {
    q: 'Tar Arvklart hånd om hele arveoppgjøret?',
    a: 'Arvklart hjelper dere med oversikt og fordeling av innbo og løsøre. Tjenesten avgjør ikke arverett og erstatter ikke juridisk rådgivning.',
  },
]

export default function Faq() {
  return (
    <ol className="faq">
      {SPM.map((s, i) => (
        <li key={s.q}>
          <details open={s.open || undefined}>
            <summary>
              <span className="faq__n">{String(i + 1).padStart(2, '0')}</span>{' '}
              <span className="faq__q">{s.q}</span>
              <span className="faq__i" aria-hidden="true" />
            </summary>
            <p className="faq__a">{s.a}</p>
          </details>
        </li>
      ))}
    </ol>
  )
}
