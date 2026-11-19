import { useEffect, useRef } from 'react'
import { Img } from './Shot'

// SIGNATUREN — overgangen fra mørke til lys
//
// Alt kjører på én variabel, --lift, som skrives på .cross av én rAF-løkke. Alt annet leser den.
// Uten dette skriptet står --lift på 1, som er sluttilstanden: produktet lyst, skarpt og lesbart.
// Løkka går bare mens heroen eller overgangen er på skjermen, og stopper helt når den er i ro.
//
// Enhetsgruppen er tre ekte skjermbilder fra den offentlige demoen, tatt i samme økt. Rammene er
// tegnet i CSS; skjerminnholdet er uendret. Under 980 px byttes riggen ut med ett telefonbilde.

export default function Signature() {
  const cross = useRef(null)

  useEffect(() => {
    const el = cross.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const hero = document.getElementById('top')
    let lift = 1, written = -1, raf = 0, awake = true, inView = true

    const clamp = v => (v < 0 ? 0 : v > 1 ? 1 : v)

    const read = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      // 0 når båndet akkurat har kommet inn nedenfra, 1 når det er løftet forbi
      const span = r.height * 0.78
      return clamp((vh * 0.78 - r.top) / (span || 1))
    }

    const frame = () => {
      raf = 0
      if (!awake || !inView) return
      const target = read()
      lift += (target - lift) * 0.16            // mykt etterslep
      if (Math.abs(target - lift) < 0.0015) lift = target
      if (Math.abs(lift - written) > 0.0012) {
        // skrives på .cross, ikke på <html>, så bare dette treet regnes om
        written = lift
        el.style.setProperty('--lift', lift.toFixed(4))
      } else if (lift === target) {
        return                                  // i ro: løkka stopper, og starter på neste rulling
      }
      raf = requestAnimationFrame(frame)
    }

    const tick = () => { if (!raf && awake && inView && !reduce.matches) raf = requestAnimationFrame(frame) }

    const start = () => {
      if (reduce.matches) {
        el.style.setProperty('--lift', '1')
        if (raf) { cancelAnimationFrame(raf); raf = 0 }
        return
      }
      lift = read(); written = -1
      tick()
    }

    let io
    if ('IntersectionObserver' in window) {
      const seen = new Set()
      io = new IntersectionObserver(entries => {
        entries.forEach(e => { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target) })
        inView = seen.size !== 0
        if (inView) start()
        else if (raf) { cancelAnimationFrame(raf); raf = 0 }
      }, { rootMargin: '120px' })
      ;[hero, el].forEach(t => { if (t) { seen.add(t); io.observe(t) } })
    }

    const onVis = () => {
      awake = !document.hidden
      if (awake) start()
      else if (raf) { cancelAnimationFrame(raf); raf = 0 }
    }
    document.addEventListener('visibilitychange', onVis)
    reduce.addEventListener('change', start)
    window.addEventListener('resize', start, { passive: true })
    // vekker bare løkka; all utregning skjer i requestAnimationFrame
    window.addEventListener('scroll', tick, { passive: true })
    start()

    return () => {
      if (raf) cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVis)
      reduce.removeEventListener('change', start)
      window.removeEventListener('resize', start)
      window.removeEventListener('scroll', tick)
      io?.disconnect()
      el.style.removeProperty('--lift')
    }
  }, [])

  return (
    <div className="cross" id="cross" ref={cross}>
      <div className="cross__bg" aria-hidden="true">
        <div className="cross__dark" />
        <div className="cross__line" />
      </div>
      <div className="rules" aria-hidden="true" />
      <figure className="cross__fig">
        <div className="rigg">
          <div className="dev dev--tab">
            <div className="dev__sk">
              <Img src="d-tablet.webp" w={700} h={933}
                alt="Skjermbilde fra Arvklart-demoen på nettbrett: gjenstandsgalleriet med gitar, gyngestol, sofa, bokhylle, maleri, vase, gifteringer, halskjede, middagsservise og familiealbum." />
            </div>
          </div>
          <span className="rigg__gulv" aria-hidden="true" />
          <div className="dev dev--lap">
            <span className="dev__base" aria-hidden="true" />
            <div className="dev__sk">
              <Img src="d-laptop.webp" w={1280} h={800}
                alt="Skjermbilde fra Arvklart-demoen på PC: oversikten over Fam. Hansen sitt bo med status for boet, varsel om gjenstander som ikke er besvart, og snarveier til veiviser, arvinger og løsningsmetoder." />
            </div>
          </div>
          <div className="dev dev--phone">
            <div className="dev__sk">
              <Img src="d-phone.webp" w={470} h={1017}
                alt="Skjermbilde fra Arvklart-demoen på telefon: «Flere ønsker denne (2)» med begrunnelsene fra Lars Hansen og Kari Hansen om oljemaleriet." />
            </div>
          </div>
          <div className="rigg__veil" aria-hidden="true" />
        </div>

        <div className="rigg__mobil">
          <div className="frame">
            <div className="frame__win">
              <Img src="m-hero.webp" w={620} h={1342}
                alt="Skjermbilde fra Arvklart-demoen på mobil: oversikten over Fam. Hansen sitt bo med status for boet og snarveier." />
              <div className="frame__veil" aria-hidden="true" />
            </div>
          </div>
        </div>
      </figure>
      {/* div, ikke figcaption: teksten står utenfor <figure> i pakkens markup, og en figcaption
          må være første eller siste barn av en figure. Utseendet styres av klassen og er uendret. */}
      <div className="cross__cap">
        <span className="cap cap--c">
          <span className="label">Skjermbilde fra demoen</span>
          <i>Eksempel fra Arvklart: gjenstander og familiens ønsker samlet i samme oversikt.</i>
        </span>
      </div>
    </div>
  )
}
