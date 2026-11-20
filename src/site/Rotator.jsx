import { useEffect, useRef } from 'react'
import { L } from '../lib/lang'

// ORDSKIFTET I OVERSKRIFTEN
// Ett uttrykk skyves ut mot venstre mens det neste kommer inn fra høyre. Resten av overskriften
// står helt stille. Portert fra integrasjonspakkens eget skript, med samme målte tider.
//
// Tre ting er bevisst beholdt:
//   1. Overskriften har én stabil tilgjengelig tekst. Båndet er aria-hidden, og uttrykket som står
//      først ligger som visuelt skjult tekst ved siden av. Da leses hele setningen én gang, og
//      ordskiftet annonseres ikke på nytt ved hvert bytte.
//   2. Plassen til det lengste uttrykket er reservert (inline-grid i CSS), så ingenting i heroen
//      flytter seg når ordet skifter.
//   3. Uten JavaScript og med «reduser bevegelse» står den komplette setningen statisk. Klassene
//      settes bare her, i en effekt, så den forhåndsrendrede HTML-en er den statiske versjonen.
//
// WCAG 2.2.2 (nivå A): ordskiftet starter av seg selv og varer i mer enn fem sekunder, så det må
// kunne stanses. RotatorPause under er den mekanismen. Den ligger i heroen, er synlig, har et
// forståelig navn og sier hvilken tilstand den er i. Ved «reduser bevegelse» er det ingenting å
// stanse, og knappen skjules i CSS.

export const ORD = () => [
  L('arvegjenstandene', 'the belongings'),
  L('mormors servise', "grandma's china"),
  L('pappas platesamling', "dad's records"),
]
const HVILE = 3400   // tiden et uttrykk blir stående, målt i videoen
const SKIFT = 560    // selve bevegelsen, målt i videoen

export default function Rotator({ heroId = 'top', paused = false }) {
  const slot = useRef(null)

  useEffect(() => {
    const el = slot.current
    if (!el) return
    const ord = [...el.querySelectorAll('.ordslot__i')]
    if (ord.length < 2) return

    const mindre = window.matchMedia('(prefers-reduced-motion: reduce)')
    let i = ord.findIndex(e => e.classList.contains('aktiv'))
    if (i < 0) i = 0
    let timer = 0, synlig = true, iBildet = true

    const kanGaa = () => !paused && !mindre.matches && synlig && iBildet
    const stopp = () => { if (timer) { clearTimeout(timer); timer = 0 } }

    const skift = () => {
      const n = (i + 1) % ord.length
      const naa = ord[i], neste = ord[n]
      // Sett det nye uttrykket på plass til høyre uten animasjon, og tving nettleseren til å regne
      // det ut før overgangen slås på igjen. Uten dette ville det glidd inn fra venstre, altså feil vei.
      neste.classList.remove('ut', 'aktiv')
      neste.style.transition = 'none'
      neste.style.transform = 'translateX(104%)'
      void neste.offsetWidth
      neste.style.transition = ''
      neste.style.transform = ''
      naa.classList.remove('aktiv')
      naa.classList.add('ut')
      neste.classList.add('aktiv')
      i = n
    }

    const planlegg = () => {
      stopp()
      if (!kanGaa()) return
      timer = setTimeout(() => { skift(); planlegg() }, HVILE + SKIFT)
    }

    const start = () => {
      if (mindre.matches) {
        // Tilbake til den statiske teksten. CSS gjør resten.
        stopp()
        ord.forEach(e => e.classList.remove('ut', 'aktiv'))
        i = 0
        return
      }
      // På pause blir uttrykket som står, stående – vi hopper ikke tilbake til det første
      if (!ord[i].classList.contains('aktiv')) {
        ord.forEach(e => e.classList.remove('ut', 'aktiv'))
        ord[i].classList.add('aktiv')
      }
      planlegg()
    }

    const onVis = () => { synlig = !document.hidden; if (synlig) planlegg(); else stopp() }
    document.addEventListener('visibilitychange', onVis)
    mindre.addEventListener('change', start)

    let io
    const hero = document.getElementById(heroId)
    if (hero && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(e => {
        iBildet = e[0].isIntersecting
        if (iBildet) planlegg(); else stopp()
      }, { rootMargin: '0px' })
      io.observe(hero)
    }

    start()
    return () => {
      stopp()
      document.removeEventListener('visibilitychange', onVis)
      mindre.removeEventListener('change', start)
      io?.disconnect()
    }
  }, [heroId, paused])

  const ord = ORD()
  return (
    <>
      <span className="ordslot" aria-hidden="true" ref={slot}>
        {ord.map(o => <span className="ordslot__i" key={o}>{o}</span>)}
      </span>
      <span className="visuelt-skjult">{ord[0]}</span>
    </>
  )
}

// Pause/start for ordskiftet. Alltid i HTML-en, så heroen ikke flytter seg når JavaScript tar over
// (CSS gjør den synlig først med «.ak-js», og skjuler den helt ved «reduser bevegelse»).
export function RotatorPause({ paused, onToggle }) {
  return (
    <button type="button" className="ordpause" onClick={onToggle} aria-pressed={paused}>
      <span className="ordpause__i" aria-hidden="true">
        {paused
          ? <svg width="11" height="12" viewBox="0 0 11 12" fill="none"><path d="M1 1.2 10 6l-9 4.8V1.2Z" fill="currentColor" /></svg>
          : <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><rect x="0.5" y="1" width="3" height="10" rx="1" fill="currentColor" /><rect x="6.5" y="1" width="3" height="10" rx="1" fill="currentColor" /></svg>}
      </span>
      {paused ? L('Start ordskiftet', 'Resume the word animation') : L('Pause ordskiftet', 'Pause the word animation')}
    </button>
  )
}
