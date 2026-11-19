import SiteLayout, { DemoError } from '../site/SiteLayout'
import PageHero from '../site/PageHero'
import useDemo from '../site/useDemo'
import { ArrowLink } from '../site/icons'
import { Img } from '../site/Shot'

// /om-oss — en side om fire personer. Portrettene er det største elementet, og teksten står smalt
// ved siden av, som i en programbok.
//
// MERK: rollebetegnelsene er foreløpige og skal bekreftes av hver enkelt før publisering
// (integrasjonspakkens README, punkt 6.2). Se docs/ny-offentlig-nettside.md.

const FOLK = [
  { bilde: 't-bard.webp', navn: 'Bård Jakobsen Rinnan', rolle: 'Produkt og marked' },
  { bilde: 't-andrea.webp', navn: 'Andrea Hufthammer Vik', rolle: 'Drift og fremdrift' },
  { bilde: 't-orjan.webp', navn: 'Ørjan Westre', rolle: 'Teknologi og økonomi' },
  { bilde: 't-julie.webp', navn: 'Julie Tvedt', rolle: 'Brukeropplevelse og piloter' },
]

export default function AboutPage({ loggedIn = false }) {
  const demo = useDemo({ loggedIn })

  return (
    <SiteLayout current="/om-oss" demo={demo} loggedIn={loggedIn}>
      <PageHero className="phero--om" crumb="Om oss" overline="Om oss"
        h1={<>Teamet bak <em>Arvklart</em></>}
        lead="Vi er fire som bygger et verktøy for familier som skal få oversikt over og fordele innbo og løsøre." />

      {/* ============ §1 OPPHAVET ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-1">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <p className="overline">Hvor det begynte</p>
          <div className="opphav">
            <h2 className="opphav__sitat" id="h2-1">Ideen til Arvklart kom fra et behov i egen familie.</h2>
            <div className="opphav__txt">
              <p className="body">Da en i familien skulle flytte til en mindre bolig, skulle mange
                gjenstander finne nye hjem. Familien trengte en felles oversikt over tingene og
                hvem som ønsket hva.</p>
              <p className="body">Gjennom Venture Creation ved NHH ble vi et team og bestemte oss for
                å utvikle ideen videre. Nå bygger vi Arvklart for familier som skal få oversikt
                over og fordele innbo og løsøre.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ §2 TEAMET ============ */}
      <section className="ground g-papir sec sec--tight" aria-labelledby="h2-2">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <p className="overline">De fire</p>
          <h2 id="h2-2" style={{ margin: 'clamp(14px,1.6vw,22px) 0 clamp(16px,2vw,26px)', maxWidth: '17ch' }}>
            Fire personer, fire <em>ansvarsområder</em></h2>
          <p className="body">Vi deler arbeidet mellom oss. Har du spørsmål om løsningen, er det
            én innboks å skrive til, uansett hvem av oss som svarer.</p>

          <ul className="folk">
            {FOLK.map(p => (
              <li key={p.navn}>
                <Img lazy src={p.bilde} w={460} h={575} alt={`Portrett av ${p.navn}.`} />
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
          <p className="overline">Hvorfor vi holder på</p>
          <div className="hvorfor">
            <div className="hvorfor__txt">
              <h2 id="h2-3">Vi bygger for den <em>praktiske</em> delen</h2>
              <p className="body">Et arveoppgjør har mange sider. Arvklart tar for seg én av dem: å få
                oversikt over gjenstandene, samle hva hver enkelt ønsker seg, og holde orden på
                hva dere blir enige om.</p>
              <p className="body">Et verktøy kan ikke ta en vanskelig samtale for noen. Det vi kan
                gjøre, er å samle det dere trenger å snakke ut fra på ett sted.</p>
            </div>
            <div className="hvorfor__ved">
              <p className="label">Hva Arvklart er</p>
              <p className="hvorfor__kort">Arvklart hjelper familien med oversikt og praktisk fordeling
                av innbo. Familien tar beslutningene. Tjenesten erstatter ikke juridisk
                rådgivning.</p>
              <p className="micro">Vi ønsker kontakt med familier som vil prøve Arvklart og gi
                tilbakemeldinger på hva som fungerer, og hva som bør bli bedre.</p>
            </div>
          </div>

          <p style={{ marginTop: 'clamp(30px,3.6vw,50px)' }}>
            <ArrowLink href="/slik-fungerer-det" small last="praksis">Se hvordan verktøyet
              fungerer i</ArrowLink>
          </p>
        </div>
      </section>

      {/* ============ §4 AVSLUTNING ============ */}
      <section className="ground g-papir sec" aria-labelledby="h2-4">
        <div className="rules" aria-hidden="true" />
        <div className="wrap">
          <div className="end">
            <p className="overline overline--c">Ta kontakt</p>
            <h2 id="h2-4">Vi vil gjerne høre fra familier som står i <em>dette</em> nå</h2>
            <p className="body">Skriv til oss hvis dere vil prøve Arvklart, eller se først hvordan
              løsningen ser ut.</p>
            <p className="end__cta">
              <a className="btn" href="/kontakt">Kontakt oss</a>
              <a className="ul ul--sub" href={demo.href} onClick={demo.onClick}>{demo.busy ? 'Åpner demo …' : 'Prøv demoen først'}</a>
            </p>
            <DemoError demo={demo} center />
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
