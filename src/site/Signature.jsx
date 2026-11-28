import { useEffect, useRef, useState } from 'react'
import { L, isEn } from '../lib/lang'

// PRODUKTFILMEN UNDER HEROEN (seksjonen heter fortsatt #cross, som lenker og tester bruker)
//
// Fra designdemo v4: filmen står stille i lyset, i en smaragdramme som de andre produktbildene.
// Den scrolldrevne overgangen fra mørke til lys (--lift, én rAF-løkke) er tatt bort. Den fulgte
// rullingen og var i praksis en parallakseeffekt, og v4 klarer seg uten.
//
// I rammen står produktfilmen (47 sekunder, uten lyd), på norsk eller engelsk etter språkvalget.
//
// INGEN VIDEOBYTES FØR NOEN TRYKKER. Først vises bare plakaten — 16:9 over 980 px, 4:5 under.
// <video> settes ikke inn i det hele tatt før knappen trykkes, så hverken filmen eller en <source>
// kan lastes i forkant.
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

  const altTekst = L(
    'Skjermbilde fra Arvklart-demoen: gjenstandsoversikten med middagsservise, oljemaleri og vase, og visningen der administratoren velger hvem som skal ha serviset.',
    'Screenshot from the Arvklart demo: the item overview with a dinner service, an oil painting and a vase, and the view where the administrator chooses who should have the service.',
  )

  return (
    <section className="ground g-papir filmsone" id="cross"
      aria-label={L('Film om eksempelboet', 'Film about the example estate')}>
      <div className="wrap">
      <figure className="filmsone__fig">
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
    </section>
  )
}
