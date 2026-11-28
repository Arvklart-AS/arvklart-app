import SiteLayout, { DemoCta, DemoError } from '../site/SiteLayout'
import PageHero from '../site/PageHero'
import useDemo from '../site/useDemo'
import { ArrowLink } from '../site/icons'
import { Cap, Img } from '../site/Shot'
import { L } from '../lib/lang'

// /slik-fungerer-det — produktet forklart i fire deler, fulgt gjennom ett oljemaleri fra
// eksempelboet. Forsiden introduserer verdien; denne siden viser hvordan verktøyet brukes.
//
// Oppbygning:
//  - Fire hoveddeler. Hver har én overskrift, én kort forklaring og én stor produktvisning.
//    Det som hører til, men ikke må leses for å forstå delen (roller, fordelingsmåtene,
//    KI-anslag, godkjenning), ligger i ett <details>-felt per del. Viktige forbehold står
//    ved funksjonen de gjelder, ikke samlet til slutt.
//  - Del 3 har en brukerstyrt trinnvis produktvisning: fire trinn med radioknapper og :has()
//    i CSS. Ingen automatikk, ingen bevegelse som må gå ferdig, og den virker uten JavaScript.
//    Hvert trinn sier hva du gjør og hva som skjer.
//
// Påstandene er kontrollert mot koden (se docs/ny-offentlig-nettside.md):
//  - filtrene i galleriet er de som finnes i EstatePage.jsx, og «Ingen vil ha» samler også det
//    ingen har svart på ennå (getStatusBreakdown i estateProgress.js)
//  - vekslende runder: administrator setter rekkefølgen (som den står, eller trukket tilfeldig),
//    og rundene snur (ConflictPage.jsx)
//  - verdiforslag: bare som «Uenig» på et eksisterende KI-anslag (vote_item_value)
//  - fordelingsverdien settes av administrator (set_agreed_values), og godkjenning er registrert
//    med innlogging, ikke BankID (20261020/20261021)
//
// Skjermbildene er beskårne utsnitt fra demoen og Arvklart. Ingen demodata er endret, og
// ingenting er satt sammen eller tegnet inn.

// ── Del 3: de fire trinnene gjennom oljemaleriet ────────────────────────────
const TRINN = () => [
  {
    id: 'tr1',
    k: L('Du svarer «Vil ha»', 'You answer «Vil ha»'),
    gjor: L('Du trykker «Registrer interesse» på maleriets side.', 'You press «Registrer interesse» (register interest) on the painting’s page.'),
    skjer: L(
      'Svaret registreres på deg. Du kan skrive hvorfor gjenstanden betyr noe for deg, men du må ikke.',
      'The answer is registered to you. You can write why the item matters to you, but you do not have to.',
    ),
    bilde: { src: 'j-svar.webp', w: 900, h: 141, zoom: 1.5 },
    alt: L(
      'Skjermbilde fra demoen: knappene «Registrer interesse» og «Ikke interessert» på oljemaleriets side.',
      'Screenshot from the demo (Norwegian interface): the «Registrer interesse» and «Ikke interessert» buttons on the painting’s page.',
    ),
    cap: L('To knapper, og ingenting mer å ta stilling til her.', 'Two buttons, and nothing else to decide here.'),
  },
  {
    id: 'tr2',
    k: L('Flere vil ha det samme', 'Several want the same thing'),
    gjor: L('Kari og Lars har svart det samme på maleriet.', 'Kari and Lars have given the same answer on the painting.'),
    skjer: L(
      'Gjenstanden merkes «2 vil ha» i galleriet, med navnene på dem som har svart. Filteret «Ettertraktede» samler alle slike gjenstander.',
      'The item is marked «2 vil ha» (2 want it) in the gallery, with the names of those who answered. The «Ettertraktede» (contested) filter gathers every item like it.',
    ),
    bilde: { src: 'f-flere.webp', w: 640, h: 360, zoom: 1.4 },
    alt: L(
      'Skjermbilde fra demoen: to gjenstandskort merket «2 vil ha» — oljemaleriet og familiealbumet — med navnene Lars Hansen og Kari Hansen under.',
      'Screenshot from the demo (Norwegian interface): two item cards marked «2 vil ha» (2 want it) — the oil painting and the family album — with the names Lars Hansen and Kari Hansen below.',
    ),
    cap: L('Merket står på kortet, sammen med hvem som har svart.', 'The mark sits on the card, together with who has answered.'),
  },
  {
    id: 'tr3',
    k: L('Begrunnelsene står side om side', 'The explanations sit side by side'),
    gjor: L('Dere åpner maleriet og leser hva hver av dere har skrevet.', 'You open the painting and read what each of you has written.'),
    skjer: L(
      'Arvklart ber dere snakke sammen først, og viser begrunnelsene ved siden av hverandre i stedet for i hver sin samtale. Hver av dere kan trekke sitt eget ønske.',
      'Arvklart asks you to talk it over first, and shows the explanations next to each other instead of in separate conversations. Each of you can withdraw your own wish.',
    ),
    bilde: { src: 'j-onsker.webp', w: 1060, h: 454, zoom: 2.1 },
    alt: L(
      'Skjermbilde fra demoen: «Flere ønsker denne (2)» med teksten «Snakk sammen først» og begrunnelsene fra Lars Hansen og Kari Hansen.',
      'Screenshot from the demo (Norwegian interface): «Flere ønsker denne (2)» (Several want this) with the text «Snakk sammen først» (Talk it over first) and the explanations from Lars Hansen and Kari Hansen.',
    ),
    cap: L('Begge begrunnelsene er synlige for alle i boet.', 'Both explanations are visible to everyone in the estate.'),
  },
  {
    id: 'tr4',
    k: L('Dere velger en fordelingsmåte', 'You choose a method'),
    gjor: L('Blir dere ikke enige, åpner administrator «Løsningsmetoder».', 'If you cannot agree, the administrator opens «Løsningsmetoder» (methods).'),
    skjer: L(
      'Ingen metode starter av seg selv. Administrator gjennomfører den valgte metoden, og resultatet er et forslag dere kan justere før det registreres.',
      'No method starts on its own. The administrator carries out the chosen method, and the result is a proposal you can adjust before it is registered.',
    ),
    bilde: { src: 'p-metoder.webp', w: 680, h: 469, zoom: 1.4 },
    alt: L(
      'Skjermbilde fra demoen: valget mellom Loddtrekning, Vekslende runder og Jevn verdifordeling.',
      'Screenshot from the demo (Norwegian interface): the choice between Loddtrekning (lottery), Vekslende runder (alternating rounds) and Jevn verdifordeling (even value split).',
    ),
    cap: L('De tre metodene, slik de står i løsningen.', 'The three methods, as they appear in the tool.'),
  },
]

const METODER = () => [
  [L('Loddtrekning', 'Lottery'),
    L('Tilfeldig trekning blant dem som ønsker gjenstanden. Et valg familien kan ta når begrunnelsene veier likt.',
      'A random draw among those who want the item. A choice the family can make when the explanations weigh equally.')],
  // Rekkefølgen settes av administrator – som listen står, eller trukket tilfeldig – og snur hver runde
  [L('Vekslende runder', 'Alternating rounds'),
    L('Deltakerne velger én gjenstand hver, etter tur. Administrator setter rekkefølgen, enten som listen står eller trukket tilfeldig, og den som velger sist i én runde velger først i neste.',
      'Participants pick one item each, in turn. The administrator sets the order, either as the list stands or drawn at random, and whoever picks last in one round picks first in the next.')],
  [L('Jevn verdifordeling', 'Even value split'),
    L('Et forslag som balanserer fordelingsverdiene mellom mottakerne. Det gjelder gjenstandene i boet, og er ikke en beregning av arveandeler.',
      'A proposal that balances the distribution values between the recipients. It applies to the items in the estate, and is not a calculation of inheritance shares under Norwegian law.')],
]

// Utdypingen til én del: alltid lukket fra start, så hoveddelen leses uten ekstra klikk.
function Utdyp({ tittel, children }) {
  return (
    <div className="utdyp">
      <details>
        <summary>
          <span className="utdyp__q">{tittel}</span>
          <span className="faq__i" aria-hidden="true" />
        </summary>
        <div className="utdyp__a">{children}</div>
      </details>
    </div>
  )
}

// En hoveddel: nummer, overskrift, én kort forklaring, og det som hører til under.
function Del({ n, id, overline, h2, lead, children }) {
  return (
    <section className={`ground ${n % 2 ? 'g-papir' : 'g-lin'} sec`} aria-labelledby={id}>
      <div className="wrap del">
        <p className="overline">{overline}</p>
        <h2 id={id} className="del__h">
          {/* Tallet og teksten må være hvert sitt element: en bar tekstnode og <em> ville blitt
              to grid-elementer, og overskriften ville brukket midt i. */}
          <span className="del__n" aria-hidden="true">{n}</span>
          <span className="del__t">{h2}</span>
        </h2>
        <p className="body del__lead">{lead}</p>
        {children}
      </div>
    </section>
  )
}

export default function HowItWorksPage({ loggedIn = false }) {
  const demo = useDemo({ loggedIn })
  const trinn = TRINN()

  return (
    <SiteLayout current="/slik-fungerer-det" demo={demo} loggedIn={loggedIn}>
      <PageHero className="phero--slik" crumb={L('Slik fungerer det', 'How it works')}
        overline={L('Slik fungerer det', 'How it works')}
        h1={L(<>Slik fordeler dere innbo med Arvklart</>, <>How you share out a home with Arvklart</>)}
        lead={L(
          'Fire deler, fra de første bildene til en fordeling dere kan dokumentere. Vi følger ett oljemaleri fra eksempelboet hele veien.',
          'Four parts, from the first photos to a division you can document. We follow one oil painting from the example estate all the way.',
        )}
        /* FILMEN
           Uten lyd, uten autostart og uten løkke: den starter bare når noen trykker, så den
           respekterer både «reduser bevegelse» og databruk. Plakatbildet har samme mål som
           videoen, så siden ikke hopper mens den lastes. Tekstalternativet (WCAG 1.2.1) er de
           fire delene under, slik reserveteksten i <video> sier. */
        aside={
          <figure className="vid">
            <video className="vid__v" controls playsInline preload="metadata"
              poster="/nettsted/produktvideo-plakat.webp" width={1920} height={1080}
              aria-label={L(
                'Film på 1 minutt og 15 sekunder, uten lyd: skjermbilder fra Arvklart som viser gjenstandene i et bo, ønskene fra familien og fordelingen.',
                'A film of 1 minute 15 seconds, without sound: screens from Arvklart showing the items in an estate, the family’s wishes and the division.',
              )}>
              <source src="/nettsted/produktvideo.mp4" type="video/mp4" />
              {L('Nettleseren din kan ikke spille av denne filmen. De fire delene under forklarer det samme i tekst.',
                 'Your browser cannot play this film. The four parts below explain the same thing in text.')}
            </video>
          </figure>
        }>
        <p className="phero__cta">
          <DemoCta demo={demo} />
          <a className="ul ul--sub" href={demo.href} onClick={demo.onClick}>{L('Ingen registrering', 'No sign-up')}</a>
        </p>
        <DemoError demo={demo} />
        <p className="micro">{L(
          'Eksempelboet har 3 arvinger og 10 gjenstander. Du trenger ingen konto for å se det.',
          'The example estate has 3 heirs and 10 items. You need no account to look at it.',
        )}</p>
      </PageHero>

      {/* ============ DEL 1 ============ */}
      <Del n={1} id="h2-1" overline={L('Del 1 av 4', 'Part 1 of 4')}
        h2={L(<>Samle gjenstandene</>, <>Gather the items</>)}
        lead={L(
          'Alle som er med i boet kan legge inn, ikke bare den som opprettet det. Ta et bilde, se over opplysningene og lagre. Kategorier og søk gjør at dere finner igjen én bestemt ting senere.',
          'Everyone taking part can add items, not just whoever created the estate. Take a photo, check the details and save. Categories and search make it possible to find one particular thing again later.',
        )}>
        <figure className="shotfig del__shot">
          <div className="deskframe" style={{ '--zoom': 1.5 }}>
            <Img lazy src="i-legg-til.webp" w={640} h={344}
              alt={L('Skjermbilde fra demoen: skjemaet «Legg til gjenstand» med «Bilder (valgfri, maks 5)», knappene «Ta bilder» og «Velg bilder», og feltet «Navn på gjenstand».',
                'Screenshot from the demo (Norwegian interface): the «Legg til gjenstand» (Add item) form with «Bilder (valgfri, maks 5)» (photos, optional, max 5), the «Ta bilder» (Take photos) and «Velg bilder» (Choose photos) buttons, and the «Navn på gjenstand» (Item name) field.')} />
          </div>
          <Cap>{L('Bildene er valgfrie. Bare navnet må fylles ut.', 'The photos are optional. Only the name has to be filled in.')}</Cap>
        </figure>

        <Utdyp tittel={L('Hvis dere vil bruke KI-hjelp', 'If you want to use the AI help')}>
          <p>{L(
            'KI-hjelpen er valgfri. Verken registreringen eller fordelingen krever den, og en gjenstand kan legges inn uten bilde.',
            'The AI help is optional. Neither registering nor dividing requires it, and an item can be added without a photo.',
          )}</p>
          <div className="def">
            <div>
              <p className="def__t">{L('Forslag til opplysninger', 'Suggestions for the details')}</p>
              <p className="def__d">{L(
                'Tar du et bilde, kan KI foreslå navn, kategori og tilstand. Du ser over forslaget før du lagrer.',
                'If you take a photo, AI can suggest a name, a category and a condition. You look the suggestion over before saving.',
              )}</p>
            </div>
            <div>
              {/* KI-anslag → deltakerne kan si seg uenige og foreslå et annet beløp → admin setter fordelingsverdien */}
              <p className="def__t">{L('Tre tall som ikke er det samme', 'Three figures that are not the same')}</p>
              <p className="def__d">{L(
                'KI kan gi et anslag. Er anslaget satt, kan hver deltaker si seg enig eller foreslå et annet beløp. Fordelingsverdien, som fordelingen regnes ut fra, settes av den som administrerer boet.',
                'AI can give an estimate. Once an estimate is set, each participant can agree with it or suggest a different figure. The distribution value, which the division is calculated from, is set by whoever administers the estate.',
              )}</p>
            </div>
            <div>
              <p className="def__t">{L('Trenger dere en verdi som skal stå seg utenfor familien', 'If you need a value that holds up outside the family')}</p>
              <p className="def__d">{L(
                'Da er det en takstmann som gir den. Anslaget i Arvklart er veiledende.',
                'Then a professional valuer is the one to give it. The estimate in Arvklart is indicative.',
              )}</p>
            </div>
          </div>
          <figure className="shotfig utdyp__shot">
            <div className="deskframe" style={{ '--zoom': 2.0 }}>
              <Img lazy src="j-verdi.webp" w={900} h={440}
                alt={L('Skjermbilde fra demoen: oljemaleriets side med «Fordelingsverdi (foreslått) 4 000 kr — fra AI-anslaget» og forklaringen under.',
                  'Screenshot from the demo (Norwegian interface): the painting’s page with «Fordelingsverdi (foreslått) 4 000 kr» (proposed distribution value, from the AI estimate) and the explanation below.')} />
            </div>
            <Cap>{L('Anslaget står oppgitt som forslag, med kilden ved siden av tallet.', 'The estimate is shown as a proposal, with its source next to the figure.')}</Cap>
          </figure>
        </Utdyp>
      </Del>

      {/* ============ DEL 2 ============ */}
      <Del n={2} id="h2-2" overline={L('Del 2 av 4', 'Part 2 of 4')}
        h2={L(<>Inviter familien og se ønskene</>, <>Invite the family and see the wishes</>)}
        lead={L(
          'Du registrerer navn og e-postadresse. Arvklart lager en invitasjonsmelding med en lenke, som du sender videre selv. Den som er invitert logger inn med den samme e-postadressen og svarer på én gjenstand av gangen.',
          'You register names and email addresses. Arvklart writes an invitation message with a link, which you send on yourself. The person invited logs in with that same email address and answers one item at a time.',
        )}>
        <figure className="shotfig del__shot del__shot--bred">
          <div className="deskframe" style={{ '--zoom': 1.7 }}>
            <Img lazy src="f-filtre.webp" w={1320} h={84}
              alt={L('Skjermbilde fra demoen: verktøylinjen over galleriet med søkefeltet, valget «Alle gjenstander (10)», «Alle kategorier» og byttet mellom Bilder og Analyse.',
                'Screenshot from the demo (Norwegian interface): the toolbar above the gallery with the search field, the «Alle gjenstander (10)» (all items) choice, «Alle kategorier» (all categories) and the switch between Bilder (pictures) and Analyse (analysis).')} />
          </div>
          <Cap>{L(
            'Galleriet kan filtreres på dine egne svar, på hva flere har sagt ja til, hva noen vil ha, hva ingen har sagt ja til, og hva som allerede er tildelt.',
            'The gallery can be filtered by your own answers, by what several people have said yes to, what someone wants, what no one has said yes to, and what has already been allocated.',
          )}</Cap>
        </figure>

        <Utdyp tittel={L('Hvem kan gjøre hva', 'Who can do what')}>
          <div className="def">
            <div>
              <p className="def__t">{L('Alle som er med i boet', 'Everyone taking part in the estate')}</p>
              <p className="def__d">{L(
                'Logger inn med e-postadressen de er invitert med, ser gjennom gjenstandene, legger gjerne til noe selv med bilde, og svarer «Vil ha» eller «Nei takk» på én gjenstand av gangen. Begrunnelsen er valgfri, men det er den teksten de andre ser når flere vil ha det samme.',
                'They log in with the email address they were invited with, look through the items, add something themselves if they like, and answer «Vil ha» (want it) or «Nei takk» (no thanks) one item at a time. The explanation is optional, but it is the text the others see when several people want the same thing.',
              )}</p>
            </div>
            <div>
              <p className="def__t">{L('Den som administrerer boet', 'Whoever administers the estate')}</p>
              <p className="def__d">{L(
                'Oppretter boet, inviterer familien, setter fordelingsverdiene som fordelingen regnes ut fra, gjennomfører fordelingen og registrerer tildelingene.',
                'Creates the estate, invites the family, sets the distribution values the division is calculated from, carries out the division and registers the allocations.',
              )}</p>
            </div>
            <div>
              <p className="def__t">{L('Å administrere er ikke å bestemme', 'Administering is not deciding')}</p>
              <p className="def__d">{L(
                'Administratorrollen er en tilgang i verktøyet. Familien tar beslutningene sammen, og Arvklart setter ingen frist for når dere skal være ferdige.',
                'The administrator role is an access level in the tool. The family makes the decisions together, and Arvklart sets no deadline for when you have to be finished.',
              )}</p>
            </div>
            <div>
              <p className="def__t">{L('Invitasjonen sendes av et menneske', 'A person sends the invitation')}</p>
              <p className="def__d">{L(
                'Arvklart lager meldingen med lenken. Det er du som sender den videre, for eksempel på SMS.',
                'Arvklart writes the message with the link. You are the one who sends it on, by text message for instance.',
              )}</p>
            </div>
          </div>
        </Utdyp>
      </Del>

      {/* ============ DEL 3 ============ */}
      <Del n={3} id="h2-3" overline={L('Del 3 av 4', 'Part 3 of 4')}
        h2={L(<>Finn en fordeling</>, <>Find a division</>)}
        lead={L(
          'To av de tre arvingene ønsker seg oljemaleriet. Her er de fire trinnene, slik de ser ut i løsningen. Velg et trinn for å se det.',
          'Two of the three heirs want the oil painting. Here are the four steps, as they look in the tool. Choose a step to see it.',
        )}>
        <div className="trinn">
          <ol className="trinn__valg" aria-label={L('Velg trinn', 'Choose a step')}>
            {trinn.map((t, i) => (
              <li key={t.id}>
                <input type="radio" name="trinn" id={t.id} defaultChecked={i === 0} />
                <label htmlFor={t.id}>
                  <span className="trinn__n" aria-hidden="true">{i + 1}</span>
                  <span className="trinn__k">{t.k}</span>
                </label>
              </li>
            ))}
          </ol>

          <div className="trinn__vis">
            {trinn.map((t, i) => (
              <div className={`trinn__steg s${i + 1}`} key={t.id}>
                <figure className="shotfig">
                  <div className="deskframe" style={{ '--zoom': t.bilde.zoom }}>
                    <Img lazy src={t.bilde.src} w={t.bilde.w} h={t.bilde.h} alt={t.alt} />
                  </div>
                  <Cap>{t.cap}</Cap>
                </figure>
                <div className="trinn__txt">
                  <p className="trinn__gjor"><b>{L('Du gjør:', 'You do:')}</b> {t.gjor}</p>
                  <p className="trinn__skjer"><b>{L('Da skjer:', 'What happens:')}</b> {t.skjer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Utdyp tittel={L('De tre fordelingsmåtene, og når de kan brukes', 'The three methods, and when they can be used')}>
          <div className="def">
            {METODER().map(([t, d]) => (
              <div key={t}>
                <p className="def__t">{t}</p>
                <p className="def__d">{d}</p>
              </div>
            ))}
            <div>
              <p className="def__t">{L('Et manglende svar er ikke et nei', 'A missing answer is not a no')}</p>
              <p className="def__d">{L(
                'Skal en gjenstand fordeles med en av metodene, må svarene fra dem det gjelder være på plass først. Har noen ikke svart ennå, er ikke gjenstanden klar.',
                'Before an item can be divided with one of the methods, the answers from those concerned have to be in. If someone has not answered yet, the item is not ready.',
              )}</p>
            </div>
            <div>
              {/* «Ingen vil ha» teller gjenstander uten interesser, også de ubesvarte (getStatusBreakdown) */}
              <p className="def__t">{L('«Ingen vil ha» betyr to ting', '«Ingen vil ha» covers two things')}</p>
              <p className="def__d">{L(
                'Filteret samler både det alle har sagt nei takk til, og det ingen har rukket å svare på. Hvem som mangler, ser den som administrerer boet.',
                'The filter covers both what everyone has declined and what no one has got round to answering. Whoever administers the estate can see who is missing.',
              )}</p>
            </div>
          </div>
        </Utdyp>
      </Del>

      {/* ============ DEL 4 ============ */}
      <Del n={4} id="h2-4" overline={L('Del 4 av 4', 'Part 4 of 4')}
        h2={L(<>Se og dokumenter resultatet</>, <>See and document the result</>)}
        lead={L(
          'Boet viser hvem som får hva. Dere kan laste ned fordelingen som PDF underveis. Det som ikke er avklart, står for seg, så ingenting faller ut.',
          'The estate shows who gets what. You can download the division as a PDF along the way. Anything not yet settled is listed separately, so nothing falls out.',
        )}>
        <figure className="shotfig del__shot del__shot--smal">
          <div className="deskframe" style={{ '--zoom': 1.6 }}>
            <Img lazy src="m-fordeling.webp" w={620} h={525}
              alt={L('Skjermbilde fra demoen: siden «Fordelingen» med teksten om at alt er foreløpig til alle har godkjent, og knappen «Last ned utkast (PDF)».',
                'Screenshot from the demo (Norwegian interface): the «Fordelingen» (The distribution) page with the text saying everything is provisional until everyone has approved, and the «Last ned utkast (PDF)» button.')} />
          </div>
          <Cap>{L('Siden «Fordelingen», med utkastet som PDF.', 'The «Fordelingen» page, with the draft as a PDF.')}</Cap>
        </figure>

        {/* Dokumentet selv. Laget av den samme koden som lager PDF-en i løsningen
            (src/lib/distributionPdf.js, kind: 'demo'), med gjenstandene og verdiene fra
            eksempelboet — ikke en tegning. DEMO-vannmerket står i PDF-en, ikke lagt på her. */}
        <figure className="shotfig del__shot">
          <div className="deskframe">
            <Img lazy src="p-rapport.webp" w={1100} h={1145}
              alt={L('Side 1 av PDF-en fra eksempelboet, med DEMO-vannmerke: overskriften «Fordeling av innbo og løsøre», gjenstandene per arving med beløp og avvik fra en lik andel, og til slutt tre gjenstander under «Ikke avklart – omfattes ikke av godkjenningen».',
                'Page 1 of the PDF from the example estate, watermarked DEMO: the heading «Fordeling av innbo og løsøre» (Division of household contents), the items per heir with amounts and the deviation from an equal share, and finally three items under «Ikke avklart» (Not settled).')} />
          </div>
          <Cap kilde="pdf">{L('Hvem som får hva, og det som ikke er avklart. Gjenstander uten fordelingsverdi står uten beløp, aldri som 0 kr.',
                  'Who gets what, and what is not settled. Items without a distribution value are shown without an amount, never as 0 kr.')}</Cap>
        </figure>

        <Utdyp tittel={L('Hva «godkjent» betyr i Arvklart', 'What «approved» means in Arvklart')}>
          <div className="def">
            <div>
              <p className="def__t">{L('Forslag, tildeling og godkjenning er tre ting', 'Proposal, allocation and approval are three things')}</p>
              <p className="def__d">{L(
                'Et forslag er noe dere ser på. En tildeling er registrert i boet. Godkjenningen er det hver beslutningstaker gjør til slutt.',
                'A proposal is something you look at. An allocation is registered in the estate. The approval is what each decision-maker does at the end.',
              )}</p>
            </div>
            <div>
              <p className="def__t">{L('Alt er foreløpig til alle har godkjent', 'Everything is provisional until everyone has approved')}</p>
              <p className="def__d">{L(
                'Fordelingen står som et utkast underveis. Først når alle beslutningstakerne har godkjent, regnes den som godkjent i løsningen.',
                'The division stands as a draft along the way. Only when every decision-maker has approved does it count as approved in the tool.',
              )}</p>
            </div>
            <div>
              <p className="def__t">{L('Godkjenningen knyttes til kontoen som er logget inn', 'The approval is tied to the account that is logged in')}</p>
              <p className="def__d">{L(
                'Arvklart verifiserer ikke identitet med BankID. Godkjenning i løsningen er ikke en BankID-signering.',
                'Arvklart does not verify identity with BankID. Approving in the tool is not a BankID signature.',
              )}</p>
            </div>
          </div>
          <figure className="shotfig utdyp__shot">
            <div className="deskframe" style={{ '--zoom': 1.6 }}>
              <Img lazy src="m-godkjenning.webp" w={620} h={405}
                alt={L('Skjermbilde fra demoen: avsnittet «Godkjenning», som sier at godkjenningen registreres med innloggingen din og at Arvklart ikke verifiserer identitet med BankID.',
                  'Screenshot from the demo (Norwegian interface): the «Godkjenning» (Approval) section, stating that the approval is registered with your login and that Arvklart does not verify identity with BankID.')} />
            </div>
            <Cap>{L('Løsningen sier det selv, på siden der dere godkjenner.', 'The tool says so itself, on the page where you approve.')}</Cap>
          </figure>
        </Utdyp>
      </Del>

      {/* ============ SAMMENHENGEN ============ */}
      <section className="ground g-jord sec kurve-begge" aria-labelledby="h2-5">
        <div className="wrap">
          <p className="overline">{L('Sammenhengen', 'The wider picture')}</p>
          <h2 id="h2-5" className="h2-sek">
            {L(<>En del av arveoppgjøret</>, <>One part of the estate settlement</>)}</h2>
          <p className="body">{L(
            'Arvklart hjelper med oversikten over og fordelingen av innbo og løsøre. Tjenesten avgjør ikke arverett og erstatter ikke juridisk rådgivning. Veiviseren gir en bredere oversikt over arveprosessen og viser videre til relevante ressurser.',
            'Arvklart helps with the overview and the sharing out of household contents and personal belongings. The service does not determine inheritance rights under Norwegian law, and it does not replace legal advice. The guide gives a broader overview of the Norwegian inheritance process and points on to relevant resources.',
          )}</p>
          <p style={{ marginTop: 'clamp(22px,2.6vw,34px)' }}>
            {L(
              <ArrowLink href="/veiviser" small>Åpne veiviseren</ArrowLink>,
              <ArrowLink href="/veiviser" small>Open the guide (in Norwegian)</ArrowLink>,
            )}
          </p>
        </div>
      </section>

      {/* ============ VIDERE ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-6">
        <div className="wrap">
          <div className="end">
            <p className="overline overline--c">{L('Prøv det selv', 'Try it yourself')}</p>
            <h2 id="h2-6">{L(
              'Prøv eksempelboet selv',
              'Try the example estate yourself',
            )}</h2>
            <p className="body">{L(
              'Se gjenstandene, vis interesse og prøv fordelingsmåtene, uten å registrere deg.',
              'Look at the items, register interest and try the ways to divide, without signing up.',
            )}</p>
            <p className="end__cta">
              <DemoCta demo={demo} />
              <a className="ul ul--sub" href="/kontakt">{L('Spør oss om noe', 'Ask us something')}</a>
            </p>
            <DemoError demo={demo} center />
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
