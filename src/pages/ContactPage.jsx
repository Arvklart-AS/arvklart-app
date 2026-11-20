import SiteLayout from '../site/SiteLayout'
import PageHero from '../site/PageHero'
import useDemo from '../site/useDemo'
import { CONTACT_EMAIL } from '../seo/pages'
import { L, isEn } from '../lib/lang'

// /kontakt — én oppgave: å gjøre adressen umulig å overse. Derfor er e-postadressen selve
// overskriftsmaterialet, ikke en linje nederst. Ingen skjema: pakken har ikke mottaker eller
// behandlingsgrunnlag for et, se docs/ny-offentlig-nettside.md.
//
// Emnet i mailto-lenkene står på samme språk som siden, så svaret kommer med gjenkjennelig emne.

const mail = (subject) => `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`

const VEIER = () => [
  {
    key: 'sporsmal',
    who: ['koord', L('Spørsmål', 'Question')],
    h: L('Still et spørsmål', 'Ask a question'),
    d: L(
      'Om hvordan noe fungerer, hva løsningen gjør og ikke gjør, eller om den passer i en situasjon som ligner deres.',
      'About how something works, what the tool does and does not do, or whether it fits a situation like yours.',
    ),
    punkter: [
      L('Hva familien må gjøre selv', 'What the family has to do itself'),
      L('Hva dokumentasjonen fra Arvklart faktisk viser', 'What the documentation from Arvklart actually shows'),
      L('Hvordan vi behandler opplysningene dere legger inn', 'How we handle the information you put in'),
    ],
    knapp: L('Still et spørsmål', 'Ask a question'),
    emne: L('Spørsmål om Arvklart', 'Question about Arvklart'),
  },
  {
    key: 'eget-bo',
    who: ['arv', L('Eget bo', 'Your own estate')],
    h: L('Meld interesse for å prøve Arvklart', 'Register interest in trying Arvklart'),
    d: L(
      'Skriv kort om situasjonen deres, så tar vi det derfra.',
      'Write a few lines about your situation, and we will take it from there.',
    ),
    punkter: [
      L('Omtrent hvor mange som skal dele', 'Roughly how many of you will be sharing'),
      L('Omtrent når dere skal i gang', 'Roughly when you will start'),
      L('Hva dere håper et verktøy kan hjelpe med', 'What you hope a tool can help with'),
    ],
    knapp: L('Meld interesse', 'Register interest'),
    emne: L('Interesse for å prøve Arvklart', 'Interest in trying Arvklart'),
  },
]

export default function ContactPage({ loggedIn = false }) {
  const demo = useDemo({ loggedIn })

  return (
    <SiteLayout current="/kontakt" demo={demo} loggedIn={loggedIn}>
      <PageHero crumb={L('Kontakt', 'Contact')} overline={L('Kontakt', 'Contact')}
        h1={L(<>Hva kan vi hjelpe deg <em>med</em>?</>, <>What can we help you <em>with</em>?</>)}
        lead={L(
          'Lurer du på om Arvklart passer for familien deres, eller ønsker du å prøve løsningen med eget bo? Send oss en e-post.',
          'Wondering whether Arvklart suits your family, or would you like to try it with your own estate? Send us an email.',
        )}>
        <div className="adr">
          <a className="adr__e" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <p className="adr__m">{L(
            'Beskriv gjerne situasjonen kort, uten fødselsnumre eller sensitive opplysninger.',
            'Do describe the situation briefly, without national identity numbers or sensitive information.',
          )}</p>
          {/* Vi svarer på norsk eller engelsk, men løsningens eget innhold er norsk */}
          {isEn() && <p className="adr__m">We answer in English or Norwegian.</p>}
        </div>
      </PageHero>

      {/* ============ §1 TO VEIER INN ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-1">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <p className="overline">{L('To grunner til å skrive', 'Two reasons to write')}</p>
          <h2 id="h2-1" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '18ch' }}>
            {L(<>Samme innboks, <em>ulikt</em> emne</>, <>Same inbox, <em>different</em> subject</>)}</h2>
          <p className="body">{L(
            'Begge valgene går til den samme adressen. Emnet er fylt ut på forhånd, så du slipper å forklare hva det gjelder to ganger.',
            'Both choices go to the same address. The subject is filled in for you, so you do not have to explain twice what it is about.',
          )}</p>

          <div className="veier">
            {VEIER().map(v => (
              <article className="vei" key={v.key}>
                <span className={`who who--${v.who[0]}`}>{v.who[1]}</span>
                <h3>{v.h}</h3>
                <p className="vei__d">{v.d}</p>
                <ul>{v.punkter.map(p => <li key={p}>{p}</li>)}</ul>
                <p className="vei__cta"><a className="btn" href={mail(v.emne)}>{v.knapp}</a></p>
                <p className="vei__emne">{L('Emne:', 'Subject:')} <b>{v.emne}</b></p>
              </article>
            ))}
          </div>

          <p className="note" style={{ marginTop: 'clamp(24px,3vw,38px)' }}>{L(
            'Vi trenger ikke navn på avdøde, fødselsnumre eller lister over eiendeler for å svare på en henvendelse.',
            'We do not need the name of the deceased, national identity numbers or lists of belongings in order to answer an enquiry.',
          )}</p>
        </div>
      </section>

      {/* ============ §2 FØR DU SKRIVER ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-3">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <p className="overline">{L('Kanskje raskere enn et svar', 'Perhaps quicker than a reply')}</p>
          <h2 id="h2-3" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '19ch' }}>
            {L(<>Tre steder du finner svar <em>med en gang</em></>, <>Three places you find answers <em>straight away</em></>)}</h2>
          <p className="body">{L(
            'Noen spørsmål er det raskere å se svaret på selv enn å vente på en e-post fra oss.',
            'For some questions it is quicker to see the answer yourself than to wait for an email from us.',
          )}</p>

          <ul className="foer">
            <li>
              <b>{L('Prøv demoen', 'Try the demo')}</b>
              <p>{L(
                'Et ferdig eksempelbo med tre arvinger og ti gjenstander. Ingen registrering.',
                'A ready-made example estate with three heirs and ten items. No sign-up.',
              )}</p>
              <a className="ul" href={demo.href} onClick={demo.onClick}>
                {demo.busy ? L('Åpner demo …', 'Opening the demo …') : L('Åpne eksempelboet', 'Open the example estate')}
              </a>
            </li>
            <li>
              <b>{L('Les hvordan det fungerer', 'Read how it works')}</b>
              <p>{L(
                'Hvem som gjør hva, hvordan ønsker registreres, og hva godkjenning betyr.',
                'Who does what, how wishes are registered, and what approval means.',
              )}</p>
              <a className="ul" href="/slik-fungerer-det">{L('Slik fordeler dere innbo', 'How you share out a home')}</a>
            </li>
            <li>
              <b>{L('Se hele arveprosessen', 'See the whole inheritance process')}</b>
              <p>{L(
                'Veiviseren dekker fasene rundt innbofordelingen, med lenker til offentlige kilder.',
                'The guide covers the phases around the sharing out, with links to official Norwegian sources. It is available in Norwegian only.',
              )}</p>
              <a className="ul" href="/veiviser">{L('Åpne veiviseren', 'Open the guide (in Norwegian)')}</a>
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
            <p className="overline overline--c">{L('Hvem vi er', 'Who we are')}</p>
            <h2 id="h2-4">{L(
              <>Du skriver til de samme fire som har <em>bygget</em> det</>,
              <>You are writing to the same four who <em>built</em> it</>,
            )}</h2>
            <p className="body">{L(
              'Fire personer står bak Arvklart. Det er de samme som leser e-posten din.',
              'Four people are behind Arvklart. They are the same ones who read your email.',
            )}</p>
            <p className="end__cta">
              <a className="btn" href="/om-oss">{L('Møt teamet', 'Meet the team')}</a>
              <a className="ul ul--sub" href={demo.href} onClick={demo.onClick}>
                {demo.busy ? L('Åpner demo …', 'Opening the demo …') : L('Prøv demoen', 'Try the demo')}
              </a>
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
