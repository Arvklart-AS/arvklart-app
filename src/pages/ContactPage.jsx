import SiteLayout from '../site/SiteLayout'
import PageHero from '../site/PageHero'
import useDemo from '../site/useDemo'
import { CONTACT_EMAIL } from '../seo/pages'

// /kontakt — én oppgave: å gjøre adressen umulig å overse. Derfor er e-postadressen selve
// overskriftsmaterialet, ikke en linje nederst. Ingen skjema: pakken har ikke mottaker eller
// behandlingsgrunnlag for et, se docs/ny-offentlig-nettside.md.

const mail = (subject) => `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`

const VEIER = [
  {
    who: ['koord', 'Spørsmål'],
    h: 'Still et spørsmål',
    d: 'Om hvordan noe fungerer, hva løsningen gjør og ikke gjør, eller om den passer i en situasjon som ligner deres.',
    punkter: [
      'Hva familien må gjøre selv',
      'Hva dokumentasjonen fra Arvklart faktisk viser',
      'Hvordan vi behandler opplysningene dere legger inn',
    ],
    knapp: 'Still et spørsmål',
    emne: 'Spørsmål om Arvklart',
  },
  {
    who: ['arv', 'Eget bo'],
    h: 'Meld interesse for å prøve Arvklart',
    d: 'Skriv kort om situasjonen deres, så tar vi det derfra.',
    punkter: [
      'Omtrent hvor mange som skal dele',
      'Omtrent når dere skal i gang',
      'Hva dere håper et verktøy kan hjelpe med',
    ],
    knapp: 'Meld interesse',
    emne: 'Interesse for å prøve Arvklart',
  },
]

export default function ContactPage({ loggedIn = false }) {
  const demo = useDemo({ loggedIn })

  return (
    <SiteLayout current="/kontakt" demo={demo} loggedIn={loggedIn}>
      <PageHero crumb="Kontakt" overline="Kontakt"
        h1={<>Hva kan vi hjelpe deg <em>med</em>?</>}
        lead="Lurer du på om Arvklart passer for familien deres, eller ønsker du å prøve løsningen med eget bo? Send oss en e-post.">
        <div className="adr">
          <a className="adr__e" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <p className="adr__m">Beskriv gjerne situasjonen kort, uten fødselsnumre eller sensitive
            opplysninger.</p>
        </div>
      </PageHero>

      {/* ============ §1 TO VEIER INN ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-1">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <p className="overline">To grunner til å skrive</p>
          <h2 id="h2-1" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '18ch' }}>
            Samme innboks, <em>ulikt</em> emne</h2>
          <p className="body">Begge valgene går til den samme adressen. Emnet er fylt ut på forhånd,
            så du slipper å forklare hva det gjelder to ganger.</p>

          <div className="veier">
            {VEIER.map(v => (
              <article className="vei" key={v.emne}>
                <span className={`who who--${v.who[0]}`}>{v.who[1]}</span>
                <h3>{v.h}</h3>
                <p className="vei__d">{v.d}</p>
                <ul>{v.punkter.map(p => <li key={p}>{p}</li>)}</ul>
                <p className="vei__cta"><a className="btn" href={mail(v.emne)}>{v.knapp}</a></p>
                <p className="vei__emne">Emne: <b>{v.emne}</b></p>
              </article>
            ))}
          </div>

          <p className="note" style={{ marginTop: 'clamp(24px,3vw,38px)' }}>Vi trenger ikke navn på avdøde,
            fødselsnumre eller lister over eiendeler for å svare på en henvendelse.</p>
        </div>
      </section>

      {/* ============ §2 FØR DU SKRIVER ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-3">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <p className="overline">Kanskje raskere enn et svar</p>
          <h2 id="h2-3" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '19ch' }}>
            Tre steder du finner svar <em>med en gang</em></h2>
          <p className="body">Noen spørsmål er det raskere å se svaret på selv enn å vente på en
            e-post fra oss.</p>

          <ul className="foer">
            <li>
              <b>Prøv demoen</b>
              <p>Et ferdig eksempelbo med tre arvinger og ti gjenstander. Ingen registrering.</p>
              <a className="ul" href={demo.href} onClick={demo.onClick}>{demo.busy ? 'Åpner demo …' : 'Åpne eksempelboet'}</a>
            </li>
            <li>
              <b>Les hvordan det fungerer</b>
              <p>Hvem som gjør hva, hvordan ønsker registreres, og hva godkjenning betyr.</p>
              <a className="ul" href="/slik-fungerer-det">Slik fordeler dere innbo</a>
            </li>
            <li>
              <b>Se hele arveprosessen</b>
              <p>Veiviseren dekker fasene rundt innbofordelingen, med lenker til offentlige kilder.</p>
              <a className="ul" href="/veiviser">Åpne veiviseren</a>
            </li>
          </ul>
          {demo.error && <p className="note" role="alert" style={{ marginTop: 'clamp(18px,2vw,26px)' }}>{demo.error}</p>}
        </div>
      </section>

      {/* ============ §3 AVSLUTNING ============ */}
      <section className="ground g-natt sec" aria-labelledby="h2-4">
        <div className="rules" aria-hidden="true"><i /></div>
        <div className="wrap">
          <div className="end">
            <p className="overline overline--c">Hvem vi er</p>
            <h2 id="h2-4">Du skriver til de samme fire som har <em>bygget</em> det</h2>
            <p className="body">Fire personer står bak Arvklart. Det er de samme som leser e-posten
              din.</p>
            <p className="end__cta">
              <a className="btn" href="/om-oss">Møt teamet</a>
              <a className="ul ul--sub" href={demo.href} onClick={demo.onClick}>{demo.busy ? 'Åpner demo …' : 'Prøv demoen'}</a>
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
