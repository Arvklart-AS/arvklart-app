import { HOME } from '../lib/routes'

// SIDETOPP PÅ UNDERSIDENE
// Ikke forsidens hero. Lavere, venstrestilt, med brødsmule, så besøkende ser med én gang at de
// står et annet sted enn forsiden.
export default function PageHero({ className = '', crumb, overline, h1, lead, children }) {
  return (
    <section className={`ground g-natt phero ${className}`.trim()}>
      <div className="rules" aria-hidden="true"><i /></div>
      <div className="wrap">
        <div className="phero__in">
          <nav className="crumb" aria-label="Du er her">
            <a href={HOME}>Forsiden</a>{' '}
            <span aria-hidden="true">/</span>{' '}
            <span aria-current="page">{crumb}</span>
          </nav>
          <p className="overline">{overline}</p>
          <h1>{h1}</h1>
          <p className="lead">{lead}</p>
          {children}
        </div>
      </div>
    </section>
  )
}
