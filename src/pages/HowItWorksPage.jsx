import SiteLayout, { DemoCta, DemoError } from '../site/SiteLayout'
import PageHero from '../site/PageHero'
import useDemo from '../site/useDemo'
import { ArrowLink } from '../site/icons'
import { Cap, Img } from '../site/Shot'
import { L } from '../lib/lang'

// /slik-fungerer-det — hvem gjør hva, fulgt gjennom ett oljemaleri fra eksempelboet.
// Alle seks stegene står alltid med full tekst. Det eneste som skifter er hvilket skjermbilde som
// vises ved siden av, og det gjøres med radioknapper og :has() i CSS. Siden er derfor fullt lesbar
// uten at noen trykker på noe, og uten JavaScript.
//
// Påstandene her er kontrollert mot koden (se docs/ny-offentlig-nettside.md):
//  - filtrene i galleriet er de som finnes i EstatePage.jsx, og «Ingen vil ha» samler også det
//    ingen har svart på ennå (getStatusBreakdown i estateProgress.js)
//  - vekslende runder: administrator setter rekkefølgen (som den står, eller trukket tilfeldig),
//    og rundene snur (ConflictPage.jsx)
//  - verdiforslag: bare som «Uenig» på et eksisterende KI-anslag (vote_item_value)

const GANG = () => [
  {
    id: 'g1', n: '01', who: ['alle', L('Alle i boet', 'Everyone in the estate')],
    t: L('Gjenstandene samles', 'The items are gathered'),
    d: L(
      'Ta et bilde. Se over. Lagre. Kategorier og søk gjør det lettere å finne igjen en bestemt ting senere.',
      'Take a photo. Check it. Save. Categories and search make it easier to find a particular thing again later.',
    ),
  },
  {
    id: 'g2', n: '02', who: ['koord', L('Du som organiserer', 'You, organising')],
    t: L('Familien inviteres inn', 'The family is invited in'),
    d: L(
      'Du registrerer navn og e-postadresse. Arvklart lager en invitasjonsmelding med lenke, som du sender videre selv. Den som er invitert logger inn med den samme e-postadressen.',
      'You register names and email addresses. Arvklart writes an invitation message with a link, which you send on yourself. The person invited logs in with that same email address.',
    ),
  },
  {
    id: 'g3', n: '03', who: ['arv', L('Du som deltar', 'You, taking part')],
    t: L('Alle ser den samme oversikten', 'Everyone sees the same overview'),
    // Faner som faktisk finnes: Alle, Mine, Ettertraktede, Noen vil ha, Ingen vil ha, Tildelt
    d: L(
      'Galleriet kan filtreres på dine egne svar, på hva flere har sagt ja til, hva noen vil ha, hva ingen har sagt ja til, og hva som allerede er tildelt.',
      'The gallery can be filtered by your own answers, by what several people have said yes to, what someone wants, what no one has said yes to, and what has already been allocated.',
    ),
  },
  {
    id: 'g4', n: '04', who: ['arv', L('Du som deltar', 'You, taking part')],
    t: L('Hver gjenstand får ett svar', 'Each item gets one answer'),
    d: L(
      '«Registrer interesse» eller «Ikke interessert». Ett valg av gangen, og du kan skrive hvorfor gjenstanden betyr noe for deg.',
      '«Registrer interesse» (register interest) or «Ikke interessert» (not interested). One choice at a time, and you can write why the item matters to you.',
    ),
  },
  {
    id: 'g5', n: '05', who: ['alle', L('Alle i boet', 'Everyone in the estate')],
    t: L('Flere vil ha det samme', 'Several want the same thing'),
    d: L(
      'Løsningen viser begrunnelsene ved siden av hverandre og ber dere snakke sammen først. Blir dere ikke enige, ligger fordelingsmetodene klare som støtte.',
      'The tool shows the explanations side by side and asks you to talk it over first. If you cannot agree, the distribution methods are there as support.',
    ),
  },
  {
    id: 'g6', n: '06', who: ['koord', L('Du som organiserer', 'You, organising')],
    t: L('Fordelingen registreres og dokumenteres', 'The division is registered and documented'),
    d: L(
      'Tildelingene registreres i boet. Dere ser hvem som får hva, og kan hente ut et utkast som PDF.',
      'The allocations are registered in the estate. You see who gets what, and can take out a draft as a PDF.',
    ),
  },
]

const METODER = () => [
  {
    t: L('Loddtrekning', 'Lottery'),
    d: L('Tilfeldig trekning blant dem som ønsker gjenstanden.', 'A random draw among those who want the item.'),
    k: L('Et valg familien kan ta når begrunnelsene veier likt.', 'A choice the family can make when the explanations weigh equally.'),
  },
  {
    t: L('Vekslende runder', 'Alternating rounds'),
    d: L('Deltakerne velger én gjenstand hver, etter tur.', 'Participants pick one item each, in turn.'),
    // Rekkefølgen settes av administrator – som listen står, eller trukket tilfeldig – og snur hver runde
    k: L(
      'Administrator setter rekkefølgen, enten som listen står eller trukket tilfeldig. Den som velger sist i én runde, velger først i neste. Rundene går til det ikke er mer å velge.',
      'The administrator sets the order, either as the list stands or drawn at random. Whoever picks last in one round picks first in the next. The rounds run until there is nothing left to pick.',
    ),
  },
  {
    t: L('Jevn verdifordeling', 'Even value split'),
    d: L('Et forslag som balanserer fordelingsverdiene mellom mottakerne.', 'A proposal that balances the distribution values between the recipients.'),
    k: L('Gjelder gjenstandene i boet. Det er ikke en beregning av arveandeler.', 'It applies to the items in the estate. It is not a calculation of inheritance shares under Norwegian law.'),
  },
]

const LETT = () => [
  [L('Ingenting å installere', 'Nothing to install'),
    L('Arvklart åpnes i nettleseren som allerede står på telefonen, nettbrettet eller PC-en.',
      'Arvklart opens in the browser already on your phone, tablet or computer.')],
  [L('Du logger inn med din egen e-postadresse', 'You log in with your own email address'),
    L('Den samme som du ble invitert med. Svarene dine registreres på deg.',
      'The same one you were invited with. Your answers are registered to you.')],
  [L('Én ting av gangen', 'One thing at a time'),
    L('Hver gjenstand har sitt eget bilde og sine to knapper.',
      'Each item has its own photo and its two buttons.')],
  [L('Begrunnelsen er valgfri', 'The explanation is optional'),
    L('Du kan svare uten å skrive noe. Skriver du likevel, er det den teksten de andre ser når flere vil ha det samme.',
      'You can answer without writing anything. If you do write, that is the text the others see when several people want the same thing.')],
  [L('Du må ikke registrere noe selv', 'You do not have to register anything yourself'),
    L('Å svare på det som allerede ligger der holder.',
      'Answering what is already there is enough.')],
  // Arvklart setter ingen frister. Familien kan selv sette datoer på oppgaver i boet.
  [L('Ingen frist fra Arvklart', 'No deadline from Arvklart'),
    L('Det er familien, ikke Arvklart, som bestemmer når dere går videre.',
      'It is the family, not Arvklart, that decides when you move on.')],
]

const Who = ({ k, children }) => <span className={`who who--${k}`}>{children}</span>

export default function HowItWorksPage({ loggedIn = false }) {
  const demo = useDemo({ loggedIn })

  return (
    <SiteLayout current="/slik-fungerer-det" demo={demo} loggedIn={loggedIn}>
      <PageHero className="phero--slik" crumb={L('Slik fungerer det', 'How it works')}
        overline={L('Slik fungerer det', 'How it works')}
        h1={L(<>Slik fordeler dere innbo med <em>Arvklart</em></>, <>How you share out a home with <em>Arvklart</em></>)}
        lead={L(
          'Én person oppretter boet og inviterer familien. Dere samler gjenstandene, legger inn ønsker og dokumenterer fordelingen dere blir enige om.',
          'One person creates the estate and invites the family. You gather the items, register wishes and document the division you agree on.',
        )}>
        <p className="phero__cta">
          <DemoCta demo={demo} />
          <a className="ul ul--sub" href={demo.href} onClick={demo.onClick}>{L('Ingen registrering', 'No sign-up')}</a>
        </p>
        <DemoError demo={demo} />

        <dl className="fakta">
          <div><dt>{L('Eksempelboet i demoen', 'The example estate in the demo')}</dt><dd>{L('3 arvinger og 10 gjenstander', '3 heirs and 10 items')}</dd></div>
          <div><dt>{L('Slik blir du med', 'How you join')}</dt><dd>{L('En invitasjonslenke fra familien', 'An invitation link from the family')}</dd></div>
          <div><dt>{L('Hver deltaker gjør', 'Each participant does')}</dt><dd>{L('Ett svar per gjenstand', 'One answer per item')}</dd></div>
        </dl>
      </PageHero>

      {/* ============ §1 HELE LØPET ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-1">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <p className="overline">{L('Fra første bilde til dokumentert fordeling', 'From the first photo to a documented division')}</p>
          <h2 id="h2-1" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '20ch' }}>
            {L(<>Seks steg, fulgt gjennom <em>ett</em> oljemaleri</>, <>Six steps, followed through <em>one</em> oil painting</>)}</h2>
          <p className="body">{L(
            'Alle seks stegene står her i tekst. Velg et steg for å se skjermbildet som hører til. Eksempelet er «Oljemaleri av blomster» fra eksempelboet, som to av de tre arvingene ender opp med å ønske seg.',
            'All six steps are written out here. Choose a step to see the screenshot that goes with it. The example is «Oljemaleri av blomster» (oil painting of flowers) from the example estate, which two of the three heirs end up wanting.',
          )}</p>

          <div className="gang">
            <ol className="rows">
              {GANG().map((g, i) => (
                <li key={g.id}>
                  <input type="radio" name="gang" id={g.id} defaultChecked={i === 0} />
                  <label className="row" htmlFor={g.id}>
                    <span className="row__n">{g.n}</span>{' '}
                    <span className="row__w"><Who k={g.who[0]}>{g.who[1]}</Who></span>{' '}
                    <span className="row__t">{g.t}</span>{' '}
                    <span className="row__d">{g.d}</span>
                  </label>
                </li>
              ))}
            </ol>

            <div className="scene">
              <figure className="shotfig g1">
                <div className="duo">
                  <div className="deskframe">
                    <Img lazy src="i-skjema.webp" w={640} h={837}
                      alt={L('Skjermbilde fra demoen: skjemaet «Legg til gjenstand» med felt for bilder, navn og kategori.',
                        'Screenshot from the demo: the «Legg til gjenstand» (Add item) form with fields for photos, name and category.')} />
                  </div>
                  <div className="deskframe">
                    <Img lazy src="j-maleri.webp" w={680} h={216}
                      alt={L('Skjermbilde fra demoen: oljemaleriet av blomster slik det ligger i boet etter at det er registrert.',
                        'Screenshot from the demo: the oil painting of flowers as it appears in the estate once registered.')} />
                  </div>
                </div>
                <Cap>{L('Skjemaet til venstre, og maleriet slik det står i boet etterpå.', 'The form on the left, and the painting as it stands in the estate afterwards.')}</Cap>
              </figure>

              <figure className="shotfig g2">
                <div className="deskframe">
                  <Img lazy src="fd-ny-lagret.jpg" w={722} h={474}
                    alt={L('Skjermbilde fra Arvklart: «1 gjenstand lagt til i boet», med knappen «Inviter arvingene» uthevet.',
                      'Screenshot from Arvklart: «1 gjenstand lagt til i boet» (1 item added to the estate), with the «Inviter arvingene» (Invite the heirs) button highlighted.')} />
                </div>
                <Cap kilde="arvklart">{L('«Inviter arvingene» står som det anbefalte neste steget.', '«Inviter arvingene» is shown as the recommended next step.')}</Cap>
              </figure>

              <figure className="shotfig g3">
                <div className="deskframe">
                  <Img lazy src="f-ettertraktet.webp" w={1060} h={700}
                    alt={L('Skjermbilde fra demoen: gjenstandsgalleriet med fanen «Ettertraktede 3» valgt, og tre gjenstander igjen i galleriet.',
                      'Screenshot from the demo: the item gallery with the «Ettertraktede 3» (Contested 3) tab selected, and three items left in the gallery.')} />
                </div>
                <Cap>{L('Filteret «Ettertraktede» viser bare det flere har sagt ja til.', 'The «Ettertraktede» filter shows only what several people have said yes to.')}</Cap>
              </figure>

              <figure className="shotfig g4">
                <div className="deskframe">
                  <Img lazy src="j-svar.webp" w={900} h={141}
                    alt={L('Skjermbilde fra demoen: knappene «Registrer interesse» og «Ikke interessert» på oljemaleriets side.',
                      'Screenshot from the demo: the «Registrer interesse» and «Ikke interessert» buttons on the painting’s page.')} />
                </div>
                <Cap>{L('To knapper, og ingenting mer å ta stilling til på dette steget.', 'Two buttons, and nothing else to decide at this step.')}</Cap>
              </figure>

              <figure className="shotfig g5">
                <div className="deskframe">
                  <Img lazy src="j-onsker.webp" w={1060} h={454}
                    alt={L('Skjermbilde fra demoen: «Flere ønsker denne (2)» med teksten «Snakk sammen først» og begrunnelsene fra Lars Hansen og Kari Hansen.',
                      'Screenshot from the demo: «Flere ønsker denne (2)» (Several want this) with the text «Snakk sammen først» (Talk it over first) and the explanations from Lars Hansen and Kari Hansen.')} />
                </div>
                <Cap>{L('Begge begrunnelsene står side om side, ikke i hver sin samtale.', 'Both explanations sit side by side, not in separate conversations.')}</Cap>
              </figure>

              <figure className="shotfig g6">
                <div className="phoneframe" style={{ maxWidth: '290px' }}>
                  <Img lazy src="m-dok.webp" w={620} h={1342}
                    alt={L('Skjermbilde fra demoen: siden «Fordelingen» med knappen «Last ned utkast (PDF)», avsnittet om godkjenning og status per arving.',
                      'Screenshot from the demo: the «Fordelingen» (The distribution) page with the «Last ned utkast (PDF)» button, the section on approval and the status per heir.')} />
                </div>
                <Cap>{L('Siden «Fordelingen», med utkastet og godkjenningen under.', 'The «Fordelingen» page, with the draft and the approval below.')}</Cap>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* ============ §2 HVEM KAN GJØRE HVA ============ */}
      <section className="ground g-natt sec" aria-labelledby="h2-2">
        <div className="rules" aria-hidden="true"><i /></div>
        <div className="wrap">
          <p className="overline">{L('Hvem kan gjøre hva', 'Who can do what')}</p>
          <h2 id="h2-2" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '19ch' }}>
            {L(<>Alle bidrar. <em>Én</em> holder i trådene</>, <>Everyone helps. <em>One</em> holds the threads</>)}</h2>
          <p className="body">{L(
            'Registrering er ikke forbeholdt den som opprettet boet. Alle som er med kan legge inn gjenstander, laste opp bilder og si hva de ønsker seg. Invitasjonene, fordelingsverdiene og selve tildelingen ligger hos den som administrerer boet.',
            'Registering is not reserved for whoever created the estate. Everyone taking part can add items, upload photos and say what they would like. The invitations, the distribution values and the allocation itself rest with whoever administers the estate.',
          )}</p>

          <div className="baner">
            <div className="bane">
              <div className="bane__h">
                <Who k="koord">{L('Du som organiserer', 'You, organising')}</Who>
                <p className="bane__t">{L('Få oversikt og følg opp', 'Get an overview and follow up')}</p>
              </div>
              <ol>
                <li><span><b>{L('Opprett boet', 'Create the estate')}</b> {L('og gi det et navn familien kjenner igjen.', 'and give it a name the family recognises.')}</span></li>
                <li><span><b>{L('Inviter familien.', 'Invite the family.')}</b> {L('Du registrerer navn og e-postadresse, og deler invitasjonslenken selv.', 'You register names and email addresses, and share the invitation link yourself.')}</span></li>
                <li><span><b>{L('Sett fordelingsverdiene', 'Set the distribution values')}</b> {L('som fordelingen regnes ut fra.', 'that the division is calculated from.')}</span></li>
                <li><span><b>{L('Gjennomfør fordelingen', 'Carry out the division')}</b> {L('og registrer tildelingene i verktøyet.', 'and register the allocations in the tool.')}</span></li>
              </ol>
            </div>
            <div className="bane">
              <div className="bane__h">
                <Who k="arv">{L('Du som deltar', 'You, taking part')}</Who>
                <p className="bane__t">{L('Se tingene og si hva du vil ha', 'See the things and say what you want')}</p>
              </div>
              <ol>
                <li><span><b>{L('Logg inn', 'Log in')}</b> {L('med e-postadressen du er invitert med.', 'with the email address you were invited with.')}</span></li>
                <li><span><b>{L('Se gjennom gjenstandene', 'Look through the items')}</b> {L('som allerede ligger der.', 'that are already there.')}</span></li>
                {/* Verdiforslag går bare som «Uenig» på et KI-anslag (vote_item_value) */}
                <li><span><b>{L('Legg gjerne til noe selv,', 'Feel free to add something yourself,')}</b> {L(
                  'med bilde og opplysninger. Er det satt et KI-anslag på en gjenstand, kan du si deg uenig og foreslå et annet beløp.',
                  'with a photo and details. If an item has an AI estimate, you can disagree and suggest a different figure.',
                )}</span></li>
                <li><span><b>{L('Svar på én gjenstand av gangen,', 'Answer one item at a time,')}</b> {L('og skriv gjerne hvorfor.', 'and do write why.')}</span></li>
              </ol>
            </div>
          </div>

          <div className="sammen">
            <div className="sammen__h">
              <Who k="alle">{L('Verdt å vite', 'Worth knowing')}</Who>
              <p className="bane__t">{L('Tre ting som ofte blandes sammen', 'Three things that are often confused')}</p>
            </div>
            <ul>
              <li><b>{L('Å administrere er ikke å bestemme', 'Administering is not deciding')}</b>{L(
                'Administratorrollen er en tilgang i verktøyet. Familien tar beslutningene sammen.',
                'The administrator role is an access level in the tool. The family makes the decisions together.',
              )}</li>
              <li><b>{L('Verdiforslag og fordelingsverdi', 'Value suggestions and the distribution value')}</b>{L(
                'Er det satt et KI-anslag, kan hver deltaker si seg uenig og foreslå et annet beløp. Fordelingsverdien – tallet fordelingen regnes ut fra – settes av den som administrerer boet.',
                'If an AI estimate has been set, each participant can disagree and suggest a different figure. The distribution value – the figure the division is calculated from – is set by whoever administers the estate.',
              )}</li>
              <li><b>{L('Invitasjonen sendes av et menneske', 'A person sends the invitation')}</b>{L(
                'Arvklart lager meldingen med lenken. Det er du som sender den videre, for eksempel på SMS.',
                'Arvklart writes the message with the link. You are the one who sends it on, by text message for instance.',
              )}</li>
            </ul>
          </div>

          <figure className="shotfig" style={{ marginTop: 'clamp(34px,4vw,56px)', maxWidth: '620px' }}>
            <div className="deskframe">
              <Img lazy src="fd-ny-lagret.jpg" w={722} h={474}
                alt={L('Skjermbilde fra Arvklart: bekreftelsen «1 gjenstand lagt til i boet» med teksten «Neste steg: inviter arvingene, så de kan se gjenstandene og vise interesse».',
                  'Screenshot from Arvklart: the confirmation «1 gjenstand lagt til i boet» with the text «Neste steg: inviter arvingene» (Next step: invite the heirs).')} />
            </div>
            <Cap kilde="arvklart">{L('Løsningen sier selv hva neste steg er: å invitere arvingene.', 'The tool says what the next step is: inviting the heirs.')}</Cap>
          </figure>
        </div>
      </section>

      {/* ============ §3 Å DELTA ============ */}
      <section className="ground g-jord sec" aria-labelledby="h2-3">
        <div className="rules" aria-hidden="true"><i /></div>
        <div className="wrap">
          <p className="overline">{L('Å delta', 'Taking part')}</p>
          <h2 id="h2-3" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '20ch' }}>
            {L(<>Den som blir invitert har <em>lite</em> å forholde seg til</>, <>Whoever is invited has <em>little</em> to deal with</>)}</h2>
          <p className="body">{L(
            'Oppgaven er å se på bilder av ting du kjenner igjen, og svare ja eller nei takk. Slik ser det ut i praksis.',
            'The job is to look at photos of things you recognise, and answer yes or no thanks. Here is what that looks like in practice.',
          )}</p>

          <ul className="lett">
            {LETT().map(([t, d]) => <li key={t}><b>{t}</b>{d}</li>)}
          </ul>
        </div>
      </section>

      {/* ============ §4 FORDELINGSMÅTENE ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-4">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <p className="overline">{L('Når flere vil ha det samme', 'When several want the same thing')}</p>
          <h2 id="h2-4" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '18ch' }}>
            {L(<>Tre måter å <em>fordele</em> på</>, <>Three ways to <em>divide</em></>)}</h2>
          <p className="body">{L(
            'Metodene ligger klare i løsningen, men ingen av dem starter av seg selv. Dere velger om dere vil bruke en, og dere kan la være. Det er den som administrerer boet som gjennomfører metoden og registrerer resultatet.',
            'The methods are ready in the tool, but none of them starts on its own. You choose whether to use one, and you can leave them be. It is whoever administers the estate who carries the method out and registers the result.',
          )}</p>

          <ul className="met">
            {METODER().map(m => (
              <li key={m.t}>
                <p className="met__t">{m.t}</p>
                <p className="met__d">{m.d}</p>
                <p className="met__k">{m.k}</p>
              </li>
            ))}
          </ul>

          <div className="metgrid">
            <div>
              <p className="big">{L('Et manglende svar er ikke et nei.', 'A missing answer is not a no.')}</p>
              <p className="body" style={{ marginTop: 'clamp(12px,1.4vw,18px)' }}>{L(
                'Skal en gjenstand fordeles med en av metodene, må svarene fra dem det gjelder være på plass først. Har noen ikke svart ennå, er ikke gjenstanden klar.',
                'Before an item can be divided with one of the methods, the answers from those concerned have to be in. If someone has not answered yet, the item is not ready.',
              )}</p>
              {/* «Ingen vil ha» teller gjenstander uten interesser, også de ubesvarte (getStatusBreakdown) */}
              <p className="body" style={{ marginTop: 'clamp(12px,1.4vw,18px)' }}>{L(
                'Det er verdt å merke seg i oversikten: «Ingen vil ha» samler både det alle har sagt nei takk til, og det ingen har rukket å svare på. Hvem som mangler, ser den som administrerer boet.',
                'One thing to note in the overview: «Ingen vil ha» (no one wants it) covers both what everyone has declined and what no one has got round to answering. Whoever administers the estate can see who is missing.',
              )}</p>
              <p className="note" style={{ marginTop: 'clamp(16px,2vw,24px)' }}>{L(
                'Metodene er støtte til beslutningen, ikke beslutningen. Resultatet blir et forslag dere kan justere før det registreres.',
                'The methods support the decision; they are not the decision. The result is a proposal you can adjust before it is registered.',
              )}</p>
            </div>
            <figure className="shotfig">
              <div className="deskframe">
                <Img lazy src="p-metoder.webp" w={680} h={469}
                  alt={L('Skjermbilde fra demoen: valget mellom Loddtrekning, Vekslende runder og Jevn verdifordeling.',
                    'Screenshot from the demo: the choice between Loddtrekning (lottery), Vekslende runder (alternating rounds) and Jevn verdifordeling (even value split).')} />
              </div>
              <Cap>{L('Metodevalget slik det står i løsningen.', 'The choice of method as it appears in the tool.')}</Cap>
            </figure>
          </div>
        </div>
      </section>

      {/* ============ §5 VALGFRI KI-HJELP OG VERDSETTING ============ */}
      <section className="ground g-natt sec" aria-labelledby="h2-5">
        <div className="rules" aria-hidden="true"><i /></div>
        <div className="wrap">
          <p className="overline">{L('Valgfri hjelp', 'Optional help')}</p>
          <h2 id="h2-5" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '20ch' }}>
            {L(<>KI foreslår. <em>Dere</em> bestemmer</>, <>AI suggests. <em>You</em> decide</>)}</h2>
          <p className="body">{L(
            'Begge delene under er støtte dere kan bruke eller la være. Verken registreringen eller fordelingen krever dem.',
            'Both of the things below are support you can use or leave. Neither registering nor dividing requires them.',
          )}</p>

          <div className="metgrid">
            <div>
              <div className="def">
                <div>
                  <p className="def__t">{L('Forslag til opplysninger', 'Suggestions for the details')}</p>
                  <p className="def__d">{L(
                    'Tar du et bilde, kan KI foreslå navn, kategori og tilstand. Du ser over forslaget før du lagrer. En gjenstand kan også legges inn uten bilde.',
                    'If you take a photo, AI can suggest a name, a category and a condition. You look the suggestion over before saving. An item can also be added without a photo.',
                  )}</p>
                </div>
                <div>
                  <p className="def__t">{L('Tre tall som ikke er det samme', 'Three figures that are not the same')}</p>
                  {/* KI-anslag → deltakerne kan si seg uenige og foreslå et annet beløp → admin setter fordelingsverdien */}
                  <p className="def__d">{L(
                    'KI kan gi et anslag. Er anslaget satt, kan hver deltaker si seg enig eller foreslå et annet beløp. Fordelingsverdien, som fordelingen regnes ut fra, settes av den som administrerer boet.',
                    'AI can give an estimate. Once an estimate is set, each participant can agree with it or suggest a different figure. The distribution value, which the division is calculated from, is set by whoever administers the estate.',
                  )}</p>
                </div>
                <div>
                  <p className="def__t">{L('Et anslag er ikke en takst', 'An estimate is not a valuation')}</p>
                  <p className="def__d">{L(
                    'Trenger dere en verdi som skal stå seg utenfor familien, er det en takstmann som gir den.',
                    'If you need a value that will hold up outside the family, a professional valuer is the one to give it.',
                  )}</p>
                </div>
              </div>
            </div>
            <figure className="shotfig">
              <div className="deskframe">
                <Img lazy src="j-verdi.webp" w={900} h={440}
                  alt={L('Skjermbilde fra demoen: oljemaleriets side med «Fordelingsverdi (foreslått) 4 000 kr — fra AI-anslaget» og forklaringen under.',
                    'Screenshot from the demo: the painting’s page with «Fordelingsverdi (foreslått) 4 000 kr» (proposed distribution value, from the AI estimate) and the explanation below.')} />
              </div>
              <Cap>{L('Anslaget står oppgitt som forslag, med kilden ved siden av tallet.', 'The estimate is shown as a proposal, with its source next to the figure.')}</Cap>
            </figure>
          </div>
        </div>
      </section>

      {/* ============ §6 GODKJENNING OG DOKUMENTASJON ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-6">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <p className="overline">{L('Godkjenning og dokumentasjon', 'Approval and documentation')}</p>
          <h2 id="h2-6" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '19ch' }}>
            {L(<>Hva <em>godkjent</em> betyr i Arvklart</>, <>What <em>approved</em> means in Arvklart</>)}</h2>
          <p className="body">{L(
            'Arvklart dokumenterer registrerte tildelinger og godkjenninger. Godkjenning i løsningen er ikke BankID-signering.',
            'Arvklart documents registered allocations and approvals. Approving in the tool is not a BankID signature.',
          )}</p>

          <div className="dok">
            <figure className="shotfig">
              <div className="phoneframe">
                <Img lazy src="m-dok.webp" w={620} h={1342}
                  alt={L('Skjermbilde fra demoen: siden «Fordelingen» med knappen «Last ned utkast (PDF)», avsnittet om godkjenning og status per arving.',
                    'Screenshot from the demo: the «Fordelingen» page with the «Last ned utkast (PDF)» button, the section on approval and the status per heir.')} />
              </div>
              <Cap>{L('Siden «Fordelingen», med utkastet og godkjenningen under.', 'The «Fordelingen» page, with the draft and the approval below.')}</Cap>
            </figure>

            <div className="dok__txt">
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
                  <p className="def__d">{L('Arvklart verifiserer ikke identitet med BankID.', 'Arvklart does not verify identity with BankID.')}</p>
                </div>
                <div>
                  <p className="def__t">{L('Dere kan ta ut et utkast som PDF', 'You can take out a draft as a PDF')}</p>
                  <p className="def__d">{L(
                    'Det som ikke er avklart ennå, står oppført som uavklart i stedet for å utelates.',
                    'Whatever is not settled yet is listed as unsettled rather than left out.',
                  )}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ §7 EN DEL AV ARVEOPPGJØRET ============ */}
      <section className="ground g-natt sec" aria-labelledby="h2-7">
        <div className="rules" aria-hidden="true"><i /></div>
        <div className="wrap">
          <p className="overline">{L('Sammenhengen', 'The wider picture')}</p>
          <h2 id="h2-7" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '18ch' }}>
            {L(<>En del av <em>arveoppgjøret</em></>, <>One part of the <em>estate settlement</em></>)}</h2>
          <p className="body">{L(
            'Arvklart hjelper med oversikten over og fordelingen av innbo. Veiviseren gir en bredere oversikt over arveprosessen og viser videre til relevante ressurser.',
            'Arvklart helps with the overview and the sharing out of a home’s contents. The guide gives a broader overview of the Norwegian inheritance process and points on to relevant resources.',
          )}</p>

          <p style={{ marginTop: 'clamp(26px,3vw,40px)' }}>
            {L(
              <ArrowLink href="/veiviser" small>Åpne veiviseren</ArrowLink>,
              <ArrowLink href="/veiviser" small>Open the guide (in Norwegian)</ArrowLink>,
            )}
          </p>
        </div>
      </section>

      {/* ============ §8 VIDERE ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-8">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <div className="end">
            <p className="overline overline--c">{L('Prøv det selv', 'Try it yourself')}</p>
            <h2 id="h2-8">{L(
              <>Den raskeste måten å forstå dette på er å <em>klikke</em> i det</>,
              <>The quickest way to understand this is to <em>click</em> around in it</>,
            )}</h2>
            <p className="body">{L(
              'Utforsk et ferdig eksempelbo og se hvordan gjenstander, ønsker og fordeling vises i Arvklart.',
              'Explore a ready-made example estate and see how items, wishes and the division appear in Arvklart.',
            )}</p>
            <p className="end__cta">
              <DemoCta demo={demo} />
              <a className="ul ul--sub" href="/kontakt">{L('Spør oss om noe', 'Ask us something')}</a>
            </p>
            <DemoError demo={demo} center />
            <p className="micro">{L('Ingen registrering. Du utforsker et eksempelbo.', 'No sign-up. You explore an example estate.')}</p>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
