import { L } from '../lib/lang'
import { ArrowLink } from './icons'
import { Cap, Img } from './Shot'

// PROSESSEN PÅ FORSIDEN — fire steg, alle synlige samtidig
//
// Erstatter Journey.jsx (fire faner med ett steg synlig om gangen). Andreas tilbakemelding: delen
// var lang, og man fikk ikke oversikt over hele prosessen på én skjerm. Nå står de fire stegene
// side om side på PC og som en kort liste på mobil. Detaljene ligger på «Slik fungerer det».
//
// Påstandene er kontrollert mot koden (se docs/ny-offentlig-nettside.md og docs/nettside-v4.md):
//  1. alle medlemmer kan legge inn gjenstander, og bilde er valgfritt (AddItemPage)
//  2. invitasjonen sendes av et menneske (InviteCard); svarene er «vil ha» / «nei takk», og
//     begrunnelsen er valgfri (interests.reason)
//  3. begrunnelsene står side om side (TalkFirstList); metodene er loddtrekning, vekslende runder
//     og jevn verdifordeling (ConflictPage), og de gjennomføres av administrator
//  4. «Fordelingen» viser hvem som får hva, med PDF (distributionPdf.js); beslutningstakerne
//     godkjenner i Arvklart (ApprovalPanel) — ikke BankID, og det sies ikke at det er bindende
//
// Ikke-lineær: gjenstander kan legges til når som helst, og tildeling kan skje én og én eller samlet.
// Det sies i ingressen, så stegene ikke leses som en fast rekkefølge.

const STEG = () => [
  {
    t: L('Legg inn gjenstandene', 'Add the belongings'),
    d: L(
      'Ta bilder og gi hver gjenstand et navn og en kategori. Alle i boet kan legge inn, og bilde er valgfritt.',
      'Take photos and give each item a name and a category. Everyone in the estate can add items, and a photo is optional.',
    ),
    bilde: { src: 'i-legg-til.webp', w: 640, h: 344 },
    alt: L('Skjermbilde fra demoen: skjemaet «Legg til gjenstand» med knappene «Ta bilder» og «Velg bilder» og feltet for navn.',
      'Screenshot from the demo: the «Legg til gjenstand» (Add item) form with the «Ta bilder» (Take photos) and «Velg bilder» (Choose photos) buttons and the name field.'),
    cap: L('«Legg til gjenstand».', '«Legg til gjenstand» (Add item).'),
  },
  {
    t: L('Samle familiens ønsker', "Gather the family's wishes"),
    d: L(
      'Inviter de andre. Hver svarer «vil ha» eller «nei takk», og kan skrive hvorfor gjenstanden betyr noe.',
      'Invite the others. Each person answers «want it» or «no thanks», and can write why the item matters to them.',
    ),
    bilde: { src: 'f-flere.webp', w: 640, h: 360 },
    alt: L('Skjermbilde fra demoen: oljemaleriet og familiealbumet, begge merket «2 vil ha», med navnene på dem som ønsker dem.',
      'Screenshot from the demo: the oil painting and the family album, both marked «2 vil ha» (2 want this), with the names of those who want them.'),
    cap: L('Hvem som ønsker hva, per gjenstand.', 'Who wants what, item by item.'),
  },
  {
    t: L('Fordel gjenstandene', 'Divide the belongings'),
    d: L(
      'Der flere ønsker det samme, står begrunnelsene side om side. Blir dere ikke enige, finnes loddtrekning, runder og jevn verdifordeling.',
      'Where several want the same thing, their reasons sit side by side. If you cannot agree, there is a lottery, alternating rounds and an even value split.',
    ),
    bilde: { src: 'p-metoder.webp', w: 680, h: 469 },
    alt: L('Skjermbilde fra demoen: valget mellom Loddtrekning, Vekslende runder og Jevn verdifordeling.',
      'Screenshot from the demo: the choice between Loddtrekning (lottery), Vekslende runder (alternating rounds) and Jevn verdifordeling (even value split).'),
    cap: L('Fordelingsmåtene.', 'The ways to divide.'),
  },
  {
    t: L('Dokumenter det dere blir enige om', 'Document what you agree on'),
    d: L(
      'Se hvem som får hva, og last ned fordelingen som PDF. De som skal godkjenne, gjør det i Arvklart.',
      'See who gets what, and download the division as a PDF. Those who need to approve do so in Arvklart.',
    ),
    bilde: { src: 'm-fordeling.webp', w: 620, h: 525 },
    alt: L('Skjermbilde fra demoen: siden «Fordelingen» med knappen «Last ned utkast (PDF)».',
      'Screenshot from the demo: the «Fordelingen» (The distribution) page with the «Last ned utkast (PDF)» (Download draft) button.'),
    cap: L('«Fordelingen», med utkast som PDF.', '«Fordelingen», with a draft as PDF.'),
  },
]

export default function Prosess() {
  return (
    <>
      <ol className="prosess" aria-label={L('Fire steg i Arvklart', 'Four steps in Arvklart')}>
        {STEG().map((s, i) => (
          <li key={s.bilde.src}>
            <span className="prosess__n" aria-hidden="true">{i + 1}</span>
            <figure className="sh prosess__bilde">
              <div className="sh__f"><Img src={s.bilde.src} w={s.bilde.w} h={s.bilde.h} alt={s.alt} lazy /></div>
              <figcaption className="visuelt-skjult">{s.cap}</figcaption>
            </figure>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </li>
        ))}
      </ol>
      {/* Én synlig etikett for alle fire bildene i stedet for fire like: de er utsnitt fra demoen,
          ikke levende komponenter (redelighetskravet i test/seo/nettsted.test.js). */}
      <Cap as="p">{L('Utsnitt fra eksempelboet, beskåret, ikke redigert.', 'Excerpts from the example estate, cropped, not edited.')}</Cap>
      <div className="prosess__fot">
        <p>{L(
          'Med et bilde kan KI foreslå navn, kategori og et verdianslag. Dere ser over forslagene og bestemmer selv.',
          'From a photo, AI can suggest a name, a category and an estimated value. You check the suggestions and decide.',
        )}</p>
        {L(
          <ArrowLink href="/slik-fungerer-det" last="det">Les mer om hvert steg i Slik fungerer</ArrowLink>,
          <ArrowLink href="/slik-fungerer-det" last="works">Read more about each step in How it</ArrowLink>,
        )}
      </div>
    </>
  )
}
