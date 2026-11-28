import { L } from '../lib/lang'
import { HOME } from '../lib/routes'

// SIDETOPP PÅ UNDERSIDENE
// Ikke forsidens hero. Lavere, venstrestilt, med brødsmule, så besøkende ser med én gang at de
// står et annet sted enn forsiden.
//
// `aside` er valgfri, og brukes i dag bare av «Slik fungerer det», som har filmen der. Uten den
// er markeringen nøyaktig som før, så de andre sidene ikke berøres: de er forhåndsrendret, og
// hydreringen sammenligner den rendrede HTML-en med den klienten bygger.
export default function PageHero({ className = '', crumb, overline, h1, lead, aside, children }) {
  const tekst = (
    <div className="phero__in">
      <nav className="crumb" aria-label={L('Du er her', 'You are here')}>
        <a href={HOME}>{L('Forsiden', 'Home')}</a>{' '}
        <span aria-hidden="true">/</span>{' '}
        <span aria-current="page">{crumb}</span>
      </nav>
      <p className="overline">{overline}</p>
      <h1>{h1}</h1>
      <p className="lead">{lead}</p>
      {children}
    </div>
  )
  return (
    <section className={`ground g-natt phero kurve-ned ${className}`.trim()}>
      <div className="wrap">
        {aside
          // Teksten står først i markeringen, så overskriften blir stående øverst på mobil,
          // der de to kolonnene legges under hverandre.
          ? <div className="phero__med">{tekst}<div className="phero__side">{aside}</div></div>
          : tekst}
      </div>
    </section>
  )
}
