import { useEffect, useRef } from 'react'
import { Img } from './Shot'
import { L } from '../lib/lang'

// SIGNATUREN — overgangen fra mørke til lys
//
// Alt kjører på én variabel, --lift, som skrives på .cross av én rAF-løkke. Alt annet leser den.
// Uten dette skriptet står --lift på 1, som er sluttilstanden: produktet lyst, skarpt og lesbart.
// Løkka går bare mens heroen eller overgangen er på skjermen, og stopper helt når den er i ro.
//
// Enhetsgruppen er tre ekte skjermbilder fra den offentlige demoen, tatt i samme økt. Rammene er
// tegnet i CSS; skjerminnholdet er uendret. Under 980 px byttes riggen ut med ett telefonbilde.
//
// Utsnittene er beskjært, ikke redigert: nettbrettet viser galleriet fra rad to (uten gyngestolen),
// PC-en oversikten over boet ned til «Alt i boet». Demodataene er urørt. Tatt på nytt i det mørke
// uttrykket 23.11.2026, med samme filnavn og mål (se docs/ny-offentlig-nettside.md, 2.13).

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
              <Img src="d-galleri.webp" w={400} h={533}
                alt={L(
                  'Skjermbilde fra Arvklart-demoen på nettbrett: gjenstandsgalleriet med bokhylle, oljemaleri, gifteringer, halskjede og familiealbum, med verdi og navn under hvert kort.',
                  'Screenshot from the Arvklart demo on a tablet (Norwegian interface): the item gallery with a bookcase, an oil painting, wedding rings, a necklace and a family album, with a value and names under each card.',
                )} />
            </div>
          </div>
          <span className="rigg__gulv" aria-hidden="true" />
          <div className="dev dev--lap">
            <span className="dev__base" aria-hidden="true" />
            <div className="dev__sk">
              <Img src="d-oversikt.webp" w={885} h={553}
                alt={L(
                  'Skjermbilde fra Arvklart-demoen på PC: oversikten over Fam. Hansen sitt bo med hvor mange gjenstander som er fordelt, og «Anbefalt nå»: «Du har 10 gjenstander du ikke har tatt stilling til» med knappen «Gå gjennom nå».',
                  'Screenshot from the Arvklart demo on a computer (Norwegian interface): the overview of the Hansen family estate with how many items have been divided, and «Anbefalt nå» (Recommended now): «Du har 10 gjenstander du ikke har tatt stilling til» (You have 10 items you have not answered) with the button «Gå gjennom nå» (Go through now).',
                )} />
            </div>
          </div>
          <div className="dev dev--phone">
            <div className="dev__sk">
              <Img src="d-phone.webp" w={470} h={1017}
                alt={L(
                  'Skjermbilde fra Arvklart-demoen på telefon: «Flere ønsker denne (2)» med begrunnelsene fra Lars Hansen og Kari Hansen om oljemaleriet.',
                  'Screenshot from the Arvklart demo on a phone (Norwegian interface): «Flere ønsker denne (2)» (Several want this) with the explanations from Lars Hansen and Kari Hansen about the oil painting.',
                )} />
            </div>
          </div>
          <div className="rigg__veil" aria-hidden="true" />
        </div>

        <div className="rigg__mobil">
          <div className="frame">
            <div className="frame__win">
              <Img src="m-hero.webp" w={620} h={1342}
                alt={L(
                  'Skjermbilde fra Arvklart-demoen på mobil: oversikten over Fam. Hansen sitt bo med hvor mange gjenstander som er fordelt, «Anbefalt nå» og starten på «Hva vil du gjøre?».',
                  'Screenshot from the Arvklart demo on a phone (Norwegian interface): the overview of the Hansen family estate with how many items have been divided, «Anbefalt nå» (Recommended now) and the start of «Hva vil du gjøre?» (What do you want to do?).',
                )} />
              <div className="frame__veil" aria-hidden="true" />
            </div>
          </div>
        </div>
      </figure>
      {/* div, ikke figcaption: teksten står utenfor <figure> i pakkens markup, og en figcaption
          må være første eller siste barn av en figure. Utseendet styres av klassen og er uendret. */}
      <div className="cross__cap">
        <span className="cap cap--c">
          <span className="label">{L('Skjermbilde fra demoen', 'Screenshot from the demo (Norwegian interface)')}</span>
          <i>{L(
            'Eksempel fra Arvklart: gjenstander og familiens ønsker samlet i samme oversikt.',
            'An example from Arvklart: the items and the family’s wishes gathered in one overview.',
          )}</i>
        </span>
      </div>
    </div>
  )
}
