import SiteLayout, { DemoCta, DemoError } from '../site/SiteLayout'
import PageHero from '../site/PageHero'
import useDemo from '../site/useDemo'
import { ArrowLink } from '../site/icons'
import { Cap, Img } from '../site/Shot'

// /slik-fungerer-det — hvem gjør hva, fulgt gjennom ett oljemaleri fra eksempelboet.
// Alle seks stegene står alltid med full tekst. Det eneste som skifter er hvilket skjermbilde som
// vises ved siden av, og det gjøres med radioknapper og :has() i CSS. Siden er derfor fullt lesbar
// uten at noen trykker på noe, og uten JavaScript.
//
// MERK: to av påstandene på denne siden er ikke dekket av produktkoden (vekslende runder og
// filtrene i galleriet). Se docs/ny-offentlig-nettside.md, «Uavklarte spørsmål».

const GANG = [
  {
    id: 'g1', n: '01', who: ['alle', 'Alle i boet'], t: 'Gjenstandene samles',
    d: 'Ta et bilde. Se over. Lagre. Kategorier og søk gjør det lettere å finne igjen en bestemt ting senere.',
  },
  {
    id: 'g2', n: '02', who: ['koord', 'Du som organiserer'], t: 'Familien inviteres inn',
    d: 'Du registrerer navn og e-postadresse. Arvklart lager en invitasjonsmelding med lenke, som du sender videre selv. Den som er invitert logger inn med den samme e-postadressen.',
  },
  {
    id: 'g3', n: '03', who: ['arv', 'Du som deltar'], t: 'Alle ser den samme oversikten',
    d: 'Galleriet kan filtreres på hva flere har sagt ja til, hva bare én vil ha, og hva ingen har svart på ennå.',
  },
  {
    id: 'g4', n: '04', who: ['arv', 'Du som deltar'], t: 'Hver gjenstand får ett svar',
    d: '«Registrer interesse» eller «Ikke interessert». Ett valg av gangen, og du kan skrive hvorfor gjenstanden betyr noe for deg.',
  },
  {
    id: 'g5', n: '05', who: ['alle', 'Alle i boet'], t: 'Flere vil ha det samme',
    d: 'Løsningen viser begrunnelsene ved siden av hverandre og ber dere snakke sammen først. Blir dere ikke enige, ligger fordelingsmetodene klare som støtte.',
  },
  {
    id: 'g6', n: '06', who: ['koord', 'Du som organiserer'], t: 'Fordelingen registreres og dokumenteres',
    d: 'Tildelingene registreres i boet. Dere ser hvem som får hva, og kan hente ut et utkast som PDF.',
  },
]

const METODER = [
  {
    t: 'Loddtrekning',
    d: 'Tilfeldig trekning blant dem som ønsker gjenstanden.',
    k: 'Et valg familien kan ta når begrunnelsene veier likt.',
  },
  {
    t: 'Vekslende runder',
    d: 'Deltakerne velger gjenstander etter tur.',
    k: 'Hvem som velger når, og hvor mange runder, avtaler dere selv.',
  },
  {
    t: 'Jevn verdifordeling',
    d: 'Et forslag som balanserer fordelingsverdiene mellom mottakerne.',
    k: 'Gjelder gjenstandene i boet. Det er ikke en beregning av arveandeler.',
  },
]

const Who = ({ k, children }) => <span className={`who who--${k}`}>{children}</span>

export default function HowItWorksPage({ loggedIn = false }) {
  const demo = useDemo({ loggedIn })

  return (
    <SiteLayout current="/slik-fungerer-det" demo={demo} loggedIn={loggedIn}>
      <PageHero className="phero--slik" crumb="Slik fungerer det" overline="Slik fungerer det"
        h1={<>Slik fordeler dere innbo med <em>Arvklart</em></>}
        lead="Én person oppretter boet og inviterer familien. Dere samler gjenstandene, legger inn ønsker og dokumenterer fordelingen dere blir enige om.">
        <p className="phero__cta">
          <DemoCta demo={demo} />
          <a className="ul ul--sub" href={demo.href} onClick={demo.onClick}>Ingen registrering</a>
        </p>
        <DemoError demo={demo} />

        <dl className="fakta">
          <div><dt>Eksempelboet i demoen</dt><dd>3 arvinger og 10 gjenstander</dd></div>
          <div><dt>Slik blir du med</dt><dd>En invitasjonslenke fra familien</dd></div>
          <div><dt>Hver deltaker gjør</dt><dd>Ett svar per gjenstand</dd></div>
        </dl>
      </PageHero>

      {/* ============ §1 HELE LØPET ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-1">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <p className="overline">Fra første bilde til dokumentert fordeling</p>
          <h2 id="h2-1" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '20ch' }}>
            Seks steg, fulgt gjennom <em>ett</em> oljemaleri</h2>
          <p className="body">Alle seks stegene står her i tekst. Velg et steg for å se skjermbildet
            som hører til. Eksempelet er «Oljemaleri av blomster» fra eksempelboet, som to av de
            tre arvingene ender opp med å ønske seg.</p>

          <div className="gang">
            <ol className="rows">
              {GANG.map((g, i) => (
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
                      alt="Skjermbilde fra demoen: skjemaet «Legg til gjenstand» med felt for bilder, navn og kategori." />
                  </div>
                  <div className="deskframe">
                    <Img lazy src="j-maleri.webp" w={680} h={216}
                      alt="Skjermbilde fra demoen: oljemaleriet av blomster slik det ligger i boet etter at det er registrert." />
                  </div>
                </div>
                <Cap>Skjemaet til venstre, og maleriet slik det står i boet etterpå.</Cap>
              </figure>

              <figure className="shotfig g2">
                <div className="deskframe">
                  <Img lazy src="fd-ny-lagret.jpg" w={722} h={474}
                    alt="Skjermbilde fra Arvklart: «1 gjenstand lagt til i boet», med knappen «Inviter arvingene» uthevet." />
                </div>
                <Cap kilde="arvklart">«Inviter arvingene» står som det anbefalte neste steget.</Cap>
              </figure>

              <figure className="shotfig g3">
                <div className="deskframe">
                  <Img lazy src="f-ettertraktet.webp" w={1060} h={700}
                    alt="Skjermbilde fra demoen: gjenstandsgalleriet med fanen «Ettertraktede 3» valgt, og tre gjenstander igjen i galleriet." />
                </div>
                <Cap>Filteret «Ettertraktede» viser bare det flere har sagt ja til.</Cap>
              </figure>

              <figure className="shotfig g4">
                <div className="deskframe">
                  <Img lazy src="j-svar.webp" w={900} h={141}
                    alt="Skjermbilde fra demoen: knappene «Registrer interesse» og «Ikke interessert» på oljemaleriets side." />
                </div>
                <Cap>To knapper, og ingenting mer å ta stilling til på dette steget.</Cap>
              </figure>

              <figure className="shotfig g5">
                <div className="deskframe">
                  <Img lazy src="j-onsker.webp" w={1060} h={454}
                    alt="Skjermbilde fra demoen: «Flere ønsker denne (2)» med teksten «Snakk sammen først» og begrunnelsene fra Lars Hansen og Kari Hansen." />
                </div>
                <Cap>Begge begrunnelsene står side om side, ikke i hver sin samtale.</Cap>
              </figure>

              <figure className="shotfig g6">
                <div className="phoneframe" style={{ maxWidth: '290px' }}>
                  <Img lazy src="m-dok.webp" w={620} h={1342}
                    alt="Skjermbilde fra demoen: siden «Fordelingen» med knappen «Last ned utkast (PDF)», avsnittet om godkjenning og status per arving." />
                </div>
                <Cap>Siden «Fordelingen», med utkastet og godkjenningen under.</Cap>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* ============ §2 HVEM KAN GJØRE HVA ============ */}
      <section className="ground g-natt sec" aria-labelledby="h2-2">
        <div className="rules" aria-hidden="true"><i /></div>
        <div className="wrap">
          <p className="overline">Hvem kan gjøre hva</p>
          <h2 id="h2-2" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '19ch' }}>
            Alle bidrar. <em>Én</em> holder i trådene</h2>
          <p className="body">Registrering er ikke forbeholdt den som opprettet boet. Alle som er med
            kan legge inn gjenstander, laste opp bilder og si hva de ønsker seg. Invitasjonene,
            fordelingsverdiene og selve tildelingen ligger hos den som administrerer boet.</p>

          <div className="baner">
            <div className="bane">
              <div className="bane__h">
                <Who k="koord">Du som organiserer</Who>
                <p className="bane__t">Få oversikt og følg opp</p>
              </div>
              <ol>
                <li><span><b>Opprett boet</b> og gi det et navn familien kjenner igjen.</span></li>
                <li><span><b>Inviter familien.</b> Du registrerer navn og e-postadresse, og deler
                  invitasjonslenken selv.</span></li>
                <li><span><b>Sett fordelingsverdiene</b> som fordelingen regnes ut fra.</span></li>
                <li><span><b>Gjennomfør fordelingen</b> og registrer tildelingene i verktøyet.</span></li>
              </ol>
            </div>
            <div className="bane">
              <div className="bane__h">
                <Who k="arv">Du som deltar</Who>
                <p className="bane__t">Se tingene og si hva du vil ha</p>
              </div>
              <ol>
                <li><span><b>Logg inn</b> med e-postadressen du er invitert med.</span></li>
                <li><span><b>Se gjennom gjenstandene</b> som allerede ligger der.</span></li>
                <li><span><b>Legg gjerne til noe selv,</b> med bilde og opplysninger. Du kan også
                  foreslå en verdi.</span></li>
                <li><span><b>Svar på én gjenstand av gangen,</b> og skriv gjerne hvorfor.</span></li>
              </ol>
            </div>
          </div>

          <div className="sammen">
            <div className="sammen__h">
              <Who k="alle">Verdt å vite</Who>
              <p className="bane__t">Tre ting som ofte blandes sammen</p>
            </div>
            <ul>
              <li><b>Å administrere er ikke å bestemme</b>Administratorrollen er en tilgang i
                verktøyet. Familien tar beslutningene sammen.</li>
              <li><b>Verdiforslag og fordelingsverdi</b>Alle kan foreslå en verdi.
                Fordelingsverdien settes av den som administrerer boet.</li>
              <li><b>Invitasjonen sendes av et menneske</b>Arvklart lager meldingen med lenken. Det
                er du som sender den videre, for eksempel på SMS.</li>
            </ul>
          </div>

          <figure className="shotfig" style={{ marginTop: 'clamp(34px,4vw,56px)', maxWidth: '620px' }}>
            <div className="deskframe">
              <Img lazy src="fd-ny-lagret.jpg" w={722} h={474}
                alt="Skjermbilde fra Arvklart: bekreftelsen «1 gjenstand lagt til i boet» med teksten «Neste steg: inviter arvingene, så de kan se gjenstandene og vise interesse»." />
            </div>
            <Cap kilde="arvklart">Løsningen sier selv hva neste steg er: å invitere arvingene.</Cap>
          </figure>
        </div>
      </section>

      {/* ============ §3 Å DELTA ============ */}
      <section className="ground g-jord sec" aria-labelledby="h2-3">
        <div className="rules" aria-hidden="true"><i /></div>
        <div className="wrap">
          <p className="overline">Å delta</p>
          <h2 id="h2-3" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '20ch' }}>
            Den som blir invitert har <em>lite</em> å forholde seg til</h2>
          <p className="body">Oppgaven er å se på bilder av ting du kjenner igjen, og svare ja eller
            nei takk. Slik ser det ut i praksis.</p>

          <ul className="lett">
            <li><b>Ingenting å installere</b>Arvklart åpnes i nettleseren som allerede står på
              telefonen, nettbrettet eller PC-en.</li>
            <li><b>Du logger inn med din egen e-postadresse</b>Den samme som du ble invitert med.
              Svarene dine registreres på deg.</li>
            <li><b>Én ting av gangen</b>Hver gjenstand har sitt eget bilde og sine to knapper.</li>
            <li><b>Begrunnelsen er valgfri</b>Du kan svare uten å skrive noe. Skriver du likevel,
              er det den teksten de andre ser når flere vil ha det samme.</li>
            <li><b>Du må ikke registrere noe selv</b>Å svare på det som allerede ligger der
              holder.</li>
            <li><b>Ingen frist i løsningen</b>Det er familien, ikke Arvklart, som bestemmer når
              dere går videre.</li>
          </ul>
        </div>
      </section>

      {/* ============ §4 FORDELINGSMÅTENE ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-4">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <p className="overline">Når flere vil ha det samme</p>
          <h2 id="h2-4" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '18ch' }}>
            Tre måter å <em>fordele</em> på</h2>
          <p className="body">Metodene ligger klare i løsningen, men ingen av dem starter av seg selv.
            Dere velger om dere vil bruke en, og dere kan la være. Det er den som administrerer
            boet som gjennomfører metoden og registrerer resultatet.</p>

          <ul className="met">
            {METODER.map(m => (
              <li key={m.t}>
                <p className="met__t">{m.t}</p>
                <p className="met__d">{m.d}</p>
                <p className="met__k">{m.k}</p>
              </li>
            ))}
          </ul>

          <div className="metgrid">
            <div>
              <p className="big">Et manglende svar er ikke et nei.</p>
              <p className="body" style={{ marginTop: 'clamp(12px,1.4vw,18px)' }}>Skal en gjenstand fordeles
                med en av metodene, må svarene fra dem det gjelder være på plass først. Har noen
                ikke svart ennå, er ikke gjenstanden klar.</p>
              <p className="note" style={{ marginTop: 'clamp(16px,2vw,24px)' }}>Metodene er støtte til
                beslutningen, ikke beslutningen. Resultatet blir et forslag dere kan justere før
                det registreres.</p>
            </div>
            <figure className="shotfig">
              <div className="deskframe">
                <Img lazy src="p-metoder.webp" w={680} h={469}
                  alt="Skjermbilde fra demoen: valget mellom Loddtrekning, Vekslende runder og Jevn verdifordeling." />
              </div>
              <Cap>Metodevalget slik det står i løsningen.</Cap>
            </figure>
          </div>
        </div>
      </section>

      {/* ============ §5 VALGFRI KI-HJELP OG VERDSETTING ============ */}
      <section className="ground g-natt sec" aria-labelledby="h2-5">
        <div className="rules" aria-hidden="true"><i /></div>
        <div className="wrap">
          <p className="overline">Valgfri hjelp</p>
          <h2 id="h2-5" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '20ch' }}>
            KI foreslår. <em>Dere</em> bestemmer</h2>
          <p className="body">Begge delene under er støtte dere kan bruke eller la være. Verken
            registreringen eller fordelingen krever dem.</p>

          <div className="metgrid">
            <div>
              <div className="def">
                <div>
                  <p className="def__t">Forslag til opplysninger</p>
                  <p className="def__d">Tar du et bilde, kan KI foreslå navn, kategori og tilstand. Du
                    ser over forslaget før du lagrer. En gjenstand kan også legges inn uten bilde.</p>
                </div>
                <div>
                  <p className="def__t">Tre tall som ikke er det samme</p>
                  <p className="def__d">KI kan gi et estimat. Deltakere kan foreslå sin egen verdi.
                    Fordelingsverdien, som fordelingen regnes ut fra, settes av den som
                    administrerer boet.</p>
                </div>
                <div>
                  <p className="def__t">Et anslag er ikke en takst</p>
                  <p className="def__d">Trenger dere en verdi som skal stå seg utenfor familien, er det
                    en takstmann som gir den.</p>
                </div>
              </div>
            </div>
            <figure className="shotfig">
              <div className="deskframe">
                <Img lazy src="j-verdi.webp" w={900} h={440}
                  alt="Skjermbilde fra demoen: oljemaleriets side med «Fordelingsverdi (foreslått) 4 000 kr — fra AI-anslaget» og forklaringen under." />
              </div>
              <Cap>Anslaget står oppgitt som forslag, med kilden ved siden av tallet.</Cap>
            </figure>
          </div>
        </div>
      </section>

      {/* ============ §6 GODKJENNING OG DOKUMENTASJON ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-6">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <p className="overline">Godkjenning og dokumentasjon</p>
          <h2 id="h2-6" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '19ch' }}>
            Hva <em>godkjent</em> betyr i Arvklart</h2>
          <p className="body">Arvklart dokumenterer registrerte tildelinger og godkjenninger.
            Godkjenning i løsningen er ikke BankID-signering.</p>

          <div className="dok">
            <figure className="shotfig">
              <div className="phoneframe">
                <Img lazy src="m-dok.webp" w={620} h={1342}
                  alt="Skjermbilde fra demoen: siden «Fordelingen» med knappen «Last ned utkast (PDF)», avsnittet om godkjenning og status per arving." />
              </div>
              <Cap>Siden «Fordelingen», med utkastet og godkjenningen under.</Cap>
            </figure>

            <div className="dok__txt">
              <div className="def">
                <div>
                  <p className="def__t">Forslag, tildeling og godkjenning er tre ting</p>
                  <p className="def__d">Et forslag er noe dere ser på. En tildeling er registrert i
                    boet. Godkjenningen er det hver beslutningstaker gjør til slutt.</p>
                </div>
                <div>
                  <p className="def__t">Alt er foreløpig til alle har godkjent</p>
                  <p className="def__d">Fordelingen står som et utkast underveis. Først når alle
                    beslutningstakerne har godkjent, regnes den som godkjent i løsningen.</p>
                </div>
                <div>
                  <p className="def__t">Godkjenningen knyttes til kontoen som er logget inn</p>
                  <p className="def__d">Arvklart verifiserer ikke identitet med BankID.</p>
                </div>
                <div>
                  <p className="def__t">Dere kan ta ut et utkast som PDF</p>
                  <p className="def__d">Det som ikke er avklart ennå, står oppført som uavklart i
                    stedet for å utelates.</p>
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
          <p className="overline">Sammenhengen</p>
          <h2 id="h2-7" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '18ch' }}>
            En del av <em>arveoppgjøret</em></h2>
          <p className="body">Arvklart hjelper med oversikten over og fordelingen av innbo. Veiviseren
            gir en bredere oversikt over arveprosessen og viser videre til relevante ressurser.</p>

          <p style={{ marginTop: 'clamp(26px,3vw,40px)' }}>
            <ArrowLink href="/veiviser" small>Åpne veiviseren</ArrowLink>
          </p>
        </div>
      </section>

      {/* ============ §8 VIDERE ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-8">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <div className="end">
            <p className="overline overline--c">Prøv det selv</p>
            <h2 id="h2-8">Den raskeste måten å forstå dette på er å <em>klikke</em> i det</h2>
            <p className="body">Utforsk et ferdig eksempelbo og se hvordan gjenstander, ønsker og
              fordeling vises i Arvklart.</p>
            <p className="end__cta">
              <DemoCta demo={demo} />
              <a className="ul ul--sub" href="/kontakt">Spør oss om noe</a>
            </p>
            <DemoError demo={demo} center />
            <p className="micro">Ingen registrering. Du utforsker et eksempelbo.</p>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
