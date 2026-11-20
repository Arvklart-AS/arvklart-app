import { useEffect, useRef } from 'react'
import { L } from '../lib/lang'
import { DemoCta } from './SiteLayout'

// FAST DEMOKNAPP PÅ MOBIL
// Forsiden er lang. Knappen følger med fra man har rullet forbi heroen til man når den avsluttende
// demoseksjonen, og forsvinner der, så den aldri står oppå den samme handlingen to ganger.
// aria-hidden og tabIndex synkes, så skjermlesere ikke møter den samme lenken to ganger.
// Skjult uten JavaScript (CSS: .ak-js .dock).
export default function MobileDock({ demo, heroId = 'top', sluttId = 'h2-8' }) {
  const dock = useRef(null)

  useEffect(() => {
    const el = dock.current
    if (!el || !('IntersectionObserver' in window)) return
    const hero = document.getElementById(heroId)
    const slutt = document.getElementById(sluttId)
    let forbiHero = false, naaddSlutt = false
    const tegn = () => {
      const vis = forbiHero && !naaddSlutt
      el.setAttribute('data-vis', vis ? '1' : '0')
      el.setAttribute('aria-hidden', vis ? 'false' : 'true')
      const a = el.querySelector('a')
      if (a) a.tabIndex = vis ? 0 : -1
    }
    const obs = []
    if (hero) {
      const io = new IntersectionObserver(e => { forbiHero = !e[0].isIntersecting; tegn() }, { threshold: 0 })
      io.observe(hero); obs.push(io)
    }
    if (slutt) {
      const io = new IntersectionObserver(e => {
        naaddSlutt = e[0].isIntersecting || e[0].boundingClientRect.top < 0; tegn()
      }, { rootMargin: '0px 0px -30% 0px' })
      io.observe(slutt); obs.push(io)
    }
    tegn()
    return () => obs.forEach(io => io.disconnect())
  }, [heroId, sluttId])

  return (
    <div className="dock" id="dock" aria-hidden="true" ref={dock}>
      <div className="dock__in">
        <p className="dock__t">
          <b>{L('Prøv eksempelboet', 'Try the example estate')}</b>
          {L('Ingen registrering.', 'No sign-up.')}
        </p>
        <DemoCta demo={demo} tabIndex={-1} />
      </div>
    </div>
  )
}
