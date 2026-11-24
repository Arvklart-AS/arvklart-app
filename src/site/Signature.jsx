import { useEffect, useRef, useState } from 'react'
import { L, isEn } from '../lib/lang'

// SIGNATUREN — overgangen fra mørke til lys
//
// Alt kjører på én variabel, --lift, som skrives på .cross av én rAF-løkke. Alt annet leser den.
// Uten dette skriptet står --lift på 1, som er sluttilstanden: produktet lyst, skarpt og lesbart.
// Løkka går bare mens heroen eller overgangen er på skjermen, og stopper helt når den er i ro.
//
// I rammen står produktfilmen (47 sekunder, uten lyd), på norsk eller engelsk etter språkvalget.
//
// INGEN VIDEOBYTES FØR NOEN TRYKKER. Først vises bare plakaten — 16:9 over 980 px, 4:5 under,
// samme grense som skilte PC-riggen fra mobilbildet før. <video> settes ikke inn i det hele tatt
// før knappen trykkes, så hverken filmen eller en <source> kan lastes i forkant.
//
// Tekstalternativet (WCAG 1.2.1, film uten lyd): plakaten har ekte alt-tekst, og filmen peker med
// aria-describedby på en visuelt skjult beskrivelse. <video> har ingen alt-attributt, så dette er
// det nærmeste som finnes.

const PLAKAT = { bredde: 1280, hoyde: 720, mobilBredde: 720, mobilHoyde: 900 }

// Filnavnene står i sin helhet, ikke satt sammen av biter: test/seo/nettsted.test.js leser
// kildefilene og krever at hver fil i public/nettsted/ er i bruk, og den leter etter hele
// filnavn i anførselstegn. En mal som `forsidefilm-${sp}.mp4` ville gjort filene «ubrukte».
const FILM = {
  no: {
    pc: '/nettsted/forsidefilm-no.mp4',
    mobil: '/nettsted/forsidefilm-no-mobil.mp4',
    plakat: '/nettsted/forsidefilm-no-plakat.webp',
    mobilplakat: '/nettsted/forsidefilm-no-mobil-plakat.webp',
  },
  en: {
    pc: '/nettsted/forsidefilm-en.mp4',
    mobil: '/nettsted/forsidefilm-en-mobil.mp4',
    plakat: '/nettsted/forsidefilm-en-plakat.webp',
    mobilplakat: '/nettsted/forsidefilm-en-mobil-plakat.webp',
  },
}

export default function Signature() {
  const cross = useRef(null)
  const video = useRef(null)
  const [spiller, setSpiller] = useState(false)
  const fil = isEn() ? FILM.en : FILM.no

  // Filmen velges først når det trykkes: bredden kan ha endret seg siden siden ble lastet
  const start = () => setSpiller(true)

  useEffect(() => {
    if (!spiller) return
    const el = video.current
    if (!el) return
    const bred = window.matchMedia('(min-width: 981px)').matches
    el.src = bred ? fil.pc : fil.mobil
    el.play().catch(() => {}) // nekter nettleseren, står kontrollene der og brukeren kan trykke selv
  }, [spiller, fil])

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

  const altTekst = L(
    'Skjermbilde fra Arvklart-demoen: gjenstandsoversikten med middagsservise, oljemaleri og vase, og visningen der administratoren velger hvem som skal ha serviset.',
    'Screenshot from the Arvklart demo: the item overview with a dinner service, an oil painting and a vase, and the view where the administrator chooses who should have the service.',
  )

  return (
    <div className="cross" id="cross" ref={cross}>
      <div className="cross__bg" aria-hidden="true">
        <div className="cross__dark" />
        <div className="cross__line" />
      </div>
      <div className="rules" aria-hidden="true" />
      <figure className="cross__fig">
        <div className="film">
          <div className="film__vindu">
          {spiller ? (
            <video
              ref={video}
              className="film__media"
              controls
              playsInline
              preload="none"
              poster={fil.plakat}
              aria-label={L('Film om hvordan Arvklart fungerer, 47 sekunder, uten lyd',
                'Film about how Arvklart works, 47 seconds, without sound')}
              aria-describedby="film-tekst"
            />
          ) : (
            <>
              <picture>
                <source
                  media="(min-width: 981px)"
                  srcSet={fil.plakat}
                  width={PLAKAT.bredde}
                  height={PLAKAT.hoyde}
                />
                <img
                  className="film__media"
                  src={fil.mobilplakat}
                  width={PLAKAT.mobilBredde}
                  height={PLAKAT.mobilHoyde}
                  /* Ikke lazy. Plakaten stikker inn i første visning (målt: 12 % synlig på
                     1440x900, 31 % på 390x844) og er derfor LCP-elementet. `loading="lazy"`
                     nedprioriterer nettopp det bildet LCP måles på, så den lastes ivrig med høy
                     prioritet i stedet. Se PR-en for tallene før og etter. */
                  fetchPriority="high"
                  decoding="async"
                  alt={altTekst}
                />
              </picture>
              {/* Lysgrensen inne i rammen følger den ute på siden. Ligger bare over plakaten:
                  når filmen spiller, er <video> det eneste som står her. */}
              <div className="film__slor" aria-hidden="true" />
            </>
          )}
          </div>
          {!spiller && (
              <button
                type="button"
                className="film__btn"
                onClick={start}
                /* Det tilgjengelige navnet må INNEHOLDE den synlige teksten (WCAG 2.5.3 «Label in
                   Name»), ellers treffer ikke talestyring knappen når noen sier det de ser. axe
                   fanget det: «Se video om hvordan …» begynner annerledes enn «Se video · 0:47».
                   Derfor står den synlige teksten først, og resten som utdyping. */
                aria-label={L('Se video · 0:47 – om hvordan Arvklart fungerer, uten lyd',
                  'Watch video · 0:47 – about how Arvklart works, without sound')}
              >
                <span className="film__ikon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" focusable="false">
                    <path d="M9 7.5v9l7.5-4.5z" fill="currentColor" />
                  </svg>
                </span>
                <span>{L('Se video · 0:47', 'Watch video · 0:47')}</span>
              </button>
          )}
        </div>
      </figure>
      {/* Tekstalternativet til filmen (WCAG 1.2.1). Skjult, fordi bildeteksten under rammen er
          tatt bort – men den står i markupen og leses av skjermlesere via aria-describedby. */}
      <p id="film-tekst" className="visuelt-skjult">{L(
        'Filmen viser eksempelboet i Arvklart: en gjenstand legges inn med bilde, navn og kategori; familien får én felles oversikt over gjenstandene med verdianslag og hvem som ønsker hva; hver arving kan skrive hvorfor en gjenstand betyr noe; og til slutt velger administratoren hvem som skal ha den. Filmen er uten lyd.',
        'The film shows the example estate in Arvklart: an item is added with a photo, a name and a category; the family gets one shared overview of the items with estimated values and who wants what; each heir can write why an item matters to them; and finally the administrator chooses who should have it. The film has no sound.',
      )}</p>
    </div>
  )
}
