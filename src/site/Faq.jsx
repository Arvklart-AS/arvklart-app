import { L } from '../lib/lang'

// SPØRSMÅL OG SVAR
// <details>/<summary>, så siden virker uten JavaScript. Spørsmål 02 står åpent fra starten, slik
// det gjør i integrasjonspakken, så det er tydelig at radene kan åpnes.
//
// Svarene er kontrollert mot koden: invitasjonen deles av et menneske (InviteCard), deltakeren
// logger inn med den registrerte e-posten (join_estate), og fordelingsverdien settes av
// administrator (set_agreed_values). Se docs/ny-offentlig-nettside.md.
const SPM = () => [
  {
    q: L('Kan jeg prøve uten å opprette en konto?', 'Can I try it without creating an account?'),
    a: L(
      'Ja. Den offentlige demoen åpner et eksempelbo. Du kan utforske gjenstandene, vise interesse og se fordelingsmetodene uten å registrere deg.',
      'Yes. The public demo opens an example estate. You can explore the items, register interest and look at the distribution methods without signing up.',
    ),
  },
  {
    q: L('Hvordan blir resten av familien med?', 'How does the rest of the family join?'),
    a: L(
      'Den som oppretter boet registrerer navn og e-postadresse på de andre. Arvklart lager en invitasjonsmelding med en lenke, som du sender videre selv. Den som er invitert logger inn med den samme e-postadressen.',
      'Whoever creates the estate registers the names and email addresses of the others. Arvklart writes an invitation message with a link, which you send on yourself. The person invited logs in with that same email address.',
    ),
    open: true,
  },
  {
    q: L('Må vi sette en pris på alle tingene?', 'Do we have to put a price on everything?'),
    a: L(
      'Nei. Dere kan registrere gjenstander og ønsker uten å sette verdi på alt. Fordelingsverdien er tallet gjenstanden regnes med i fordelingen, og den settes av den som administrerer boet.',
      'No. You can register items and wishes without putting a value on everything. The distribution value is the figure an item counts for when things are divided, and it is set by whoever administers the estate.',
    ),
  },
  {
    q: L('Hva skjer hvis flere ønsker samme gjenstand?', 'What happens if several people want the same item?'),
    a: L(
      'Dere kan se hverandres ønsker og begrunnelser og bruke dem som utgangspunkt for en samtale. Arvklart tilbyr også ulike fordelingsmetoder dere kan velge mellom. Familien bestemmer hvordan dere vil gå videre.',
      'You can see each other’s wishes and explanations and use them as a starting point for a conversation. Arvklart also offers different methods to choose between. The family decides how to go on.',
    ),
  },
  {
    q: L('Tar Arvklart hånd om hele arveoppgjøret?', 'Does Arvklart handle the whole estate settlement?'),
    a: L(
      'Arvklart hjelper dere med oversikt og fordeling av innbo og løsøre. Tjenesten avgjør ikke arverett og erstatter ikke juridisk rådgivning.',
      'Arvklart helps you with the overview and the sharing out of household contents and personal belongings. The service does not determine inheritance rights under Norwegian law, and it does not replace legal advice.',
    ),
  },
]

export default function Faq() {
  return (
    <ol className="faq">
      {SPM().map((s, i) => (
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
