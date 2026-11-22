import SiteLayout, { DemoError } from '../site/SiteLayout'
import PageHero from '../site/PageHero'
import useDemo from '../site/useDemo'
import { ArrowLink } from '../site/icons'
import { Img } from '../site/Shot'
import { L } from '../lib/lang'

// /om-oss — en side om fire personer. Portrettene er det største elementet, og teksten står smalt
// ved siden av, som i en programbok.
//
// MERK: rollebetegnelsene er foreløpige og skal bekreftes av hver enkelt før publisering
// (integrasjonspakkens README, punkt 6.2). Se docs/ny-offentlig-nettside.md.

const FOLK = () => [
  { bilde: 't-bard.webp', navn: 'Bård Jakobsen Rinnan', rolle: L('CEO | Produkt og marked', 'CEO | Product and Marketing') },
  { bilde: 't-andrea.webp', navn: 'Andrea Hufthammer Vik', rolle: L('COO | Drift og fremdrift', 'COO | Operations and Delivery') },
  { bilde: 't-orjan.webp', navn: 'Ørjan Westre', rolle: L('Teknologi og økonomi', 'Technology and Finance') },
  { bilde: 't-julie.webp', navn: 'Julie Tvedt', rolle: L('Brukeropplevelse og piloter', 'User Experience and Pilots') },
]

export default function AboutPage({ loggedIn = false }) {
  const demo = useDemo({ loggedIn })

  return (
    <SiteLayout current="/om-oss" demo={demo} loggedIn={loggedIn}>
      <PageHero className="phero--om" crumb={L('Om oss', 'About us')} overline={L('Om oss', 'About us')}
        h1={L(<>Teamet bak <em>Arvklart</em></>, <>The team behind <em>Arvklart</em></>)}
        lead={L(
          'Vi er fire som bygger et verktøy for familier som skal få oversikt over og fordele innbo og løsøre.',
          'We are four people building a tool for families who need an overview of a home’s contents, and a way to share them out.',
        )} />

      {/* ============ §1 OPPHAVET ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-1">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <p className="overline">{L('Hvor det begynte', 'Where it started')}</p>
          <div className="opphav">
            {/* Overskriften er kort, så den ikke gjentar første setning i avsnittet under. */}
            <h2 className="opphav__sitat" id="h2-1">{L(
              'Slik begynte det.',
              'How it started.',
            )}</h2>
            <div className="opphav__txt">
              <p className="body">{L(
                'Ideen til Arvklart oppsto da familien til Bård skulle fordele gjenstander fra morfaren hans. Familien bodde spredt rundt i landet og trengte en enkel måte å se hva som skulle fordeles, og hvem som ønsket hva. Det ble utgangspunktet for Arvklart: én felles oversikt over gjenstandene og familiens ønsker.',
                'The idea for Arvklart came about when Bård’s family were sharing out belongings from his grandfather. The family lived in different parts of the country and needed a simple way to see what there was to share out, and who wanted what. That became the starting point for Arvklart: one shared overview of the belongings and of the family’s wishes.',
              )}</p>
              <p className="body">{L(
                'Gjennom Venture Creation ved NHH ble vi et team og bestemte oss for å utvikle ideen videre. I dag bygger vi den for familier som står i det samme.',
                'Through Venture Creation at NHH we became a team and decided to take the idea further. Today we are building it for families in the same situation.',
              )}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ §2 TEAMET ============ */}
      <section className="ground g-papir sec sec--tight" aria-labelledby="h2-2">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <p className="overline">{L('De fire', 'The four of us')}</p>
          <h2 id="h2-2" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '17ch' }}>
            {L(<>Fire personer, fire <em>ansvarsområder</em></>, <>Four people, four <em>areas of responsibility</em></>)}</h2>
          <p className="body">{L(
            'Vi deler arbeidet mellom oss. Har du spørsmål om løsningen, er det én innboks å skrive til, uansett hvem av oss som svarer.',
            'We share the work between us. If you have a question about the tool, there is one inbox to write to, whichever of us answers.',
          )}</p>

          <ul className="folk">
            {FOLK().map(p => (
              <li key={p.navn}>
                <Img lazy src={p.bilde} w={460} h={575}
                  alt={L(`Portrett av ${p.navn}.`, `Portrait of ${p.navn}.`)} />
                <p className="folk__n">{p.navn}</p>
                <p className="folk__r">{p.rolle}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ §3 HVORFOR ============ */}
      <section className="ground g-natt sec" aria-labelledby="h2-3">
        <div className="rules" aria-hidden="true"><i /></div>
        <div className="wrap">
          <p className="overline">{L('Hvorfor vi holder på', 'Why we keep at it')}</p>
          <div className="hvorfor">
            <div className="hvorfor__txt">
              <h2 id="h2-3">{L(
                <>Vi bygger for den <em>praktiske</em> delen</>,
                <>We build for the <em>practical</em> part</>,
              )}</h2>
              <p className="body">{L(
                'Et arveoppgjør har mange sider. Arvklart tar for seg én av dem: å få oversikt over gjenstandene, samle hva hver enkelt ønsker seg, og holde orden på hva dere blir enige om.',
                'Settling an estate has many sides. Arvklart takes on one of them: getting an overview of the items, gathering what each person would like, and keeping track of what you agree on.',
              )}</p>
              <p className="body">{L(
                'Et verktøy kan ikke ta en vanskelig samtale for noen. Det vi kan gjøre, er å samle det dere trenger å snakke ut fra på ett sted.',
                'A tool cannot have a difficult conversation for anyone. What we can do is gather what you need to talk from in one place.',
              )}</p>
            </div>
            <div className="hvorfor__ved">
              <p className="label">{L('Hva Arvklart er', 'What Arvklart is')}</p>
              <p className="hvorfor__kort">{L(
                'Arvklart hjelper familien med oversikt og praktisk fordeling av innbo. Familien tar beslutningene. Tjenesten erstatter ikke juridisk rådgivning.',
                'Arvklart helps the family with an overview and the practical sharing out of a home’s contents. The family makes the decisions. The service does not replace legal advice.',
              )}</p>
              <p className="micro">{L(
                'Vi ønsker kontakt med familier som vil prøve Arvklart og gi tilbakemeldinger på hva som fungerer, og hva som bør bli bedre.',
                'We would like to hear from families who want to try Arvklart and tell us what works, and what should be better.',
              )}</p>
            </div>
          </div>

          <p style={{ marginTop: 'clamp(30px,3.6vw,50px)' }}>
            {L(
              <ArrowLink href="/slik-fungerer-det" small last="praksis">Se hvordan verktøyet fungerer i</ArrowLink>,
              <ArrowLink href="/slik-fungerer-det" small last="practice">See how the tool works in</ArrowLink>,
            )}
          </p>
        </div>
      </section>

      {/* ============ §4 AVSLUTNING ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-4">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <div className="end">
            <p className="overline overline--c">{L('Ta kontakt', 'Get in touch')}</p>
            <h2 id="h2-4">{L(
              <>Vi vil gjerne høre fra familier som står i <em>dette</em> nå</>,
              <>We would like to hear from families going through <em>this</em> right now</>,
            )}</h2>
            <p className="body">{L(
              'Skriv til oss hvis dere vil prøve Arvklart, eller se først hvordan løsningen ser ut.',
              'Write to us if you want to try Arvklart, or look at the tool first.',
            )}</p>
            <p className="end__cta">
              <a className="btn" href="/kontakt">{L('Kontakt oss', 'Contact us')}</a>
              <a className="ul ul--sub" href={demo.href} onClick={demo.onClick}>
                {demo.busy ? L('Åpner demo …', 'Opening the demo …') : L('Prøv demoen først', 'Try the demo first')}
              </a>
            </p>
            <DemoError demo={demo} center />
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
