// CSS for oversikten i boet og gjenstandslisten (fargene står i estateTheme.js). Uttrykket følger den offentlige
// nettsiden (src/site/site.css): Bodoni Moda på overskrifter, overlinjer med strek, pilleknapper, hårstreker og
// nummererte rader med pluss/minus, som «Før dere begynner» på arvklart.no.
// Sidene bruker en <style>-blokk med klasser (prefiks «bo-») i stedet for bare inline style: hover, fokus,
// <details>-gruppene og mobiloppsettet krever CSS. Alt er avgrenset til .bo-mork, så ingenting lekker ut.
import { C } from './estateTheme.js'

const SERIF = `'Bodoni Moda', 'Times New Roman', serif`
const EASE = 'cubic-bezier(.22, .61, .36, 1)'
// Pil ned i nedtrekkslister (data-URI er tillatt av CSP-en: img-src data:)
const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%23B9B4A8' stroke-width='1.6'/%3E%3C/svg%3E")`

export const darkCss = `
/* Lange ord («fordelingskalkulatoren») deles i stedet for å kuttes, også med ekstra stor tekst på smal skjerm */
.bo-mork { color: ${C.lin}; font-family: Karla, sans-serif; overflow-wrap: break-word; hyphens: auto; }
.bo-mork :focus-visible { outline: 3px solid ${C.mose}; outline-offset: 2px; }
.bo-mork h1, .bo-mork h2 { font-family: ${SERIF}; font-weight: 400; font-optical-sizing: none; letter-spacing: -0.015em; color: ${C.lin}; text-wrap: balance; }
.bo-side { max-width: 52rem; margin: 0 auto; padding: 1.5rem 1rem 4.5rem; display: flex; flex-direction: column; gap: 2rem; }
.bo-side.bred { max-width: 72rem; gap: 1.5rem; }
.bo-dempet { color: ${C.linDempet}; }
.bo-ingress { font-size: clamp(1.02rem, 0.95rem + 0.35vw, 1.2rem); line-height: 1.55; color: ${C.linDempet}; max-width: 60ch; }
.bo-ord { color: ${C.ordfarge}; }
/* Overlinje: liten etikett med en strek foran, som på nettsiden */
.bo-overlinje { display: flex; align-items: center; gap: 0.9em; margin: 0; font-size: 0.75rem; font-weight: 600; line-height: 1.4; letter-spacing: 0.22em; text-transform: uppercase; color: ${C.messing}; }
.bo-overlinje::before { content: ''; flex: 0 0 44px; height: 1px; background: currentColor; opacity: 0.85; }

/* Lenker og knapper: tynn understrek og pilleknapper med et lite løft, som på nettsiden */
.bo-topplinje { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: -1rem; }
.bo-lenke { display: inline-flex; align-items: center; min-height: 44px; padding: 0; background: none; border: 0; color: ${C.linDempet}; font: inherit; font-size: 0.875rem; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 5px; text-decoration-color: rgba(242, 238, 230, 0.35); cursor: pointer; }
.bo-lenke:hover { color: ${C.lin}; text-decoration-color: currentColor; }
.bo-knapp { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; min-height: 48px; padding: 0 1.7em; border-radius: 999px; border: 1px solid ${C.lin}; background: transparent; color: ${C.lin}; font: inherit; font-size: 0.9375rem; font-weight: 600; text-decoration: none; white-space: nowrap; cursor: pointer; transition: transform 0.24s ${EASE}, box-shadow 0.42s ${EASE}; }
.bo-knapp:hover { transform: translateY(-2px); box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.55); }
.bo-knapp.stille { border-color: rgba(242, 238, 230, 0.32); }
.bo-knapp.stille:hover { border-color: ${C.mose}; }
.bo-knapp.fylt { background: ${C.lin}; color: ${C.natt}; }
.bo-knapp.fylt:hover { background: #FFFFFF; }
.bo-knapp.slett { background: ${C.rust}; border-color: ${C.rust}; color: ${C.natt}; }
.bo-knapp:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

/* Oversikten */
.bo-hode { display: flex; flex-direction: column; gap: 1rem; }
.bo-hode h1 { font-size: clamp(2.1rem, 1.4rem + 3vw, 3.6rem); line-height: 1.05; letter-spacing: -0.025em; margin-top: -0.4rem; }
.bo-status { display: flex; align-items: center; gap: 0.875rem; flex-wrap: wrap; font-size: 0.875rem; color: ${C.linDempet}; font-variant-numeric: tabular-nums; }
.bo-spor { width: 11rem; max-width: 100%; height: 4px; border-radius: 2px; background: ${C.kant}; overflow: hidden; }
.bo-spor > span { display: block; height: 100%; background: ${C.mose}; }
.bo-melding { border: 1px solid ${C.linje}; border-radius: 6px; padding: 1rem 1.25rem; color: ${C.linDempet}; font-size: 0.875rem; line-height: 1.5; }
/* «Anbefalt nå»: et varmt lys og stor overskrift, som toppen av nettsiden */
.bo-anbefalt { background: radial-gradient(120% 160% at 0% 0%, rgba(199, 154, 107, 0.16), transparent 55%), ${C.flate}; border: 1px solid ${C.kant}; border-radius: 6px; padding: clamp(1.4rem, 1rem + 2vw, 2.4rem); display: flex; justify-content: space-between; align-items: center; gap: 1rem 1.5rem; flex-wrap: wrap; }
.bo-anbefalt .tekst { flex: 1 1 18rem; min-width: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.bo-anbefalt h2 { font-size: clamp(1.6rem, 1.15rem + 1.8vw, 2.5rem); line-height: 1.1; }
.bo-anbefalt p { color: ${C.linDempet}; line-height: 1.5; }
.bo-valgseksjon { display: flex; flex-direction: column; gap: 1rem; }
.bo-stor { font-size: clamp(1.85rem, 1.2rem + 2.4vw, 3rem); line-height: 1.08; letter-spacing: -0.02em; margin-top: -0.4rem; }

/* «Hva vil du gjøre?»: nummererte rader med hårstreker og pluss/minus */
.bo-grupper { display: flex; flex-direction: column; margin-top: 0.75rem; border-top: 1px solid ${C.kant}; }
.bo-gruppe { border-bottom: 1px solid ${C.kant}; }
.bo-gruppe[open] { border-bottom-color: ${C.linje}; }
.bo-gruppe > summary { list-style: none; display: grid; grid-template-columns: 3rem minmax(0, 1fr) auto 1.25rem; align-items: center; gap: 0.875rem; padding: 1.5rem 0; cursor: pointer; }
.bo-gruppe > summary::-webkit-details-marker { display: none; }
.bo-nr { font-family: ${SERIF}; font-size: 1rem; color: ${C.linDempet}; }
.bo-gruppe[open] .bo-nr { color: ${C.mose}; }
.bo-gruppe .tittel { display: block; font-family: ${SERIF}; font-optical-sizing: none; font-size: clamp(1.35rem, 1.05rem + 1.1vw, 1.9rem); line-height: 1.15; letter-spacing: -0.015em; }
.bo-gruppe .beskrivelse { display: block; margin-top: 0.2rem; font-size: 0.875rem; color: ${C.linDempet}; }
.bo-hint { font-size: 0.8125rem; font-weight: 600; color: ${C.mose}; white-space: nowrap; }
.bo-pluss { position: relative; width: 1.1rem; height: 1.1rem; justify-self: end; }
.bo-pluss::before, .bo-pluss::after { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: ${C.mose}; }
.bo-pluss::after { transform: rotate(90deg); transition: transform 0.24s ${EASE}; }
.bo-gruppe[open] .bo-pluss::after { transform: rotate(90deg) scaleX(0); }
.bo-valg { list-style: none; margin: 0; padding: 0 0 1.25rem 3rem; }
.bo-valg a { display: grid; grid-template-columns: minmax(0, 1fr) auto 1.125rem; align-items: center; gap: 0.875rem; padding: 0.95rem 0.75rem; border-top: 1px solid rgba(242, 238, 230, 0.09); color: ${C.lin}; text-decoration: none; }
.bo-valg li:first-child a { border-top-color: transparent; }
.bo-valg a:hover { background: rgba(242, 238, 230, 0.05); border-radius: 6px; }
.bo-valg a:hover .navn { text-decoration: underline; text-underline-offset: 4px; }
.bo-valg .navn { display: block; font-weight: 600; font-size: 1.02rem; }
.bo-valg .forklaring { display: block; font-size: 0.875rem; color: ${C.linDempet}; }
.bo-valg .til { color: ${C.linDempet}; }
.bo-tall { font-size: 0.8125rem; font-weight: 600; border-radius: 999px; padding: 0.0625rem 0.625rem; min-width: 1.75rem; text-align: center; font-variant-numeric: tabular-nums; white-space: nowrap; }
.bo-tall.venter { background: ${C.mose}; color: ${C.natt}; }
.bo-tall.noytral { color: ${C.linDempet}; border: 1px solid ${C.kant}; font-weight: 500; }

/* Gjenstandslisten */
.bo-listehode { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
.bo-listehode > div { display: flex; flex-direction: column; gap: 0.75rem; }
.bo-listehode h1 { font-size: clamp(2.1rem, 1.4rem + 3vw, 3.6rem); line-height: 1.05; letter-spacing: -0.025em; margin-top: -0.4rem; }
.bo-verktoy { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) auto; gap: 0.625rem; align-items: center; }
.bo-mork input[type="search"], .bo-mork select { width: 100%; min-width: 0; min-height: 48px; padding: 0.625rem 0.875rem; border-radius: 8px; border: 1px solid ${C.linje}; background-color: ${C.natt}; color: ${C.lin}; font: inherit; font-size: 1rem; }
.bo-mork select { appearance: none; -webkit-appearance: none; padding-right: 2.5rem; background-image: ${CHEVRON}; background-repeat: no-repeat; background-position: right 0.875rem center; background-size: 0.75rem; }
.bo-mork input::placeholder { color: rgba(185, 180, 168, 0.75); }
.bo-mork option { background: ${C.flateHoy}; color: ${C.lin}; }
.bo-bryter { display: inline-flex; justify-self: start; border: 1px solid ${C.linje}; border-radius: 999px; padding: 3px; gap: 2px; }
.bo-bryter button { min-height: 40px; padding: 0 0.875rem; border: 0; border-radius: 999px; background: none; color: ${C.linDempet}; font: inherit; font-size: 0.875rem; cursor: pointer; }
.bo-bryter button[aria-pressed="true"] { background: ${C.lin}; color: ${C.natt}; font-weight: 600; }
.bo-seksjon { display: flex; flex-direction: column; gap: 0.75rem; }
/* Mellomtitlene («Mine ønsker», «Andre gjenstander») som overlinjer */
.bo-mork .bo-seksjon > h2 { display: flex; align-items: center; gap: 0.9em; font-family: Karla, sans-serif; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: ${C.messing}; }
.bo-mork .bo-seksjon > h2::before { content: ''; flex: 0 0 44px; height: 1px; background: currentColor; opacity: 0.85; }
.bo-rutenett { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 14rem), 1fr)); gap: 1rem; }
.bo-kort { position: relative; display: flex; flex-direction: column; min-width: 0; background: ${C.flate}; border: 1px solid ${C.kant}; border-radius: 6px; overflow: hidden; }
.bo-kort.mitt { border: 2px solid ${C.mose}; }
.bo-kort > a { display: flex; flex-direction: column; flex: 1; color: inherit; text-decoration: none; }
.bo-kort > a:hover .navn { text-decoration: underline; text-underline-offset: 4px; }
.bo-bilde { position: relative; aspect-ratio: 4 / 3; max-width: 100%; background: ${C.flateHoy}; display: grid; place-items: center; overflow: hidden; }
.bo-bilde img { width: 100%; height: 100%; object-fit: contain; }
.bo-plassholder { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; color: ${C.linDempet}; font-size: 0.8125rem; padding: 0 0.5rem; text-align: center; }
.bo-plassholder .emoji { font-size: 2.5rem; line-height: 1; }
.bo-merke { position: absolute; left: 0.5rem; top: 0.5rem; font-size: 0.75rem; font-weight: 600; padding: 0.125rem 0.625rem; border-radius: 999px; }
.bo-merke.tildelt { background: ${C.mose}; color: ${C.natt}; }
.bo-merke.flere { background: ${C.jord}; color: ${C.lin}; box-shadow: inset 0 0 0 1px ${C.linje}; }
.bo-merke.disponert { background: ${C.natt}; color: ${C.lin}; box-shadow: inset 0 0 0 1px ${C.linje}; }
.bo-kort .tekst { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.75rem 0.875rem 0.875rem; }
/* Navnet på gjenstanden i Bodoni, som navnene på nettsiden */
.bo-kort .navn { font-family: ${SERIF}; font-optical-sizing: none; font-size: 1.15rem; letter-spacing: -0.01em; line-height: 1.25; overflow-wrap: anywhere; }
.bo-kort .verdi, .bo-kort .hvem { font-size: 0.8125rem; color: ${C.linDempet}; font-variant-numeric: tabular-nums; }
.bo-kort .hvem.ingen { font-style: italic; }
.bo-kort .begrunnelse { padding: 0.5rem 0.875rem 0.875rem; border-top: 1px solid ${C.kant}; }
/* «Slett» er dempet til den pekes på eller får fokus, så den ikke tar oppmerksomheten fra gjenstandene */
.bo-slett { position: absolute; right: 0.5rem; top: 0.5rem; z-index: 2; min-height: 36px; padding: 0 0.875rem; border: 0; border-radius: 999px; background: rgba(31, 34, 30, 0.88); color: ${C.linDempet}; font: inherit; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
.bo-slett:hover, .bo-slett:focus-visible { background: ${C.rust}; color: ${C.natt}; }
.bo-tom { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 1rem; text-align: center; color: ${C.linDempet}; }
.bo-panel { background: ${C.flate}; border: 1px solid ${C.kant}; border-radius: 6px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.bo-panel h2 { font-size: 1.4rem; }
.bo-analyse { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr)); gap: 1rem; }
.bo-stolper { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.625rem; }
.bo-stolper li { display: grid; grid-template-columns: minmax(0, 9rem) minmax(0, 1fr) 2rem; gap: 0.75rem; align-items: center; font-size: 0.875rem; }
.bo-stolper .navn { line-height: 1.3; }
.bo-stolper .stolpe { height: 0.75rem; border-radius: 3px; background: ${C.kant}; overflow: hidden; }
.bo-stolper .stolpe span { display: block; height: 100%; background: ${C.mose}; }
.bo-stolper .antall { text-align: right; color: ${C.linDempet}; font-variant-numeric: tabular-nums; }
.bo-stabel { display: flex; height: 0.875rem; border-radius: 4px; overflow: hidden; gap: 2px; background: ${C.kant}; }
.bo-tegnforklaring { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.375rem 1.25rem; font-size: 0.875rem; color: ${C.linDempet}; font-variant-numeric: tabular-nums; }
.bo-tegnforklaring i { display: inline-block; width: 0.625rem; height: 0.625rem; border-radius: 2px; margin-right: 0.375rem; }

@media (max-width: 45rem) {
  .bo-verktoy { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .bo-verktoy > :first-child { grid-column: 1 / -1; }
  .bo-verktoy .bo-bryter { grid-column: 1 / -1; justify-self: start; }
}
/* Smal mobil: én nedtrekksliste per linje, så antallet i «Vis» («Alle gjenstander (8)») ikke kuttes */
@media (max-width: 30rem) {
  .bo-verktoy { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 40rem) {
  .bo-side { padding-top: 1rem; gap: 1.5rem; }
  .bo-anbefalt .bo-knapp { flex: 1 1 100%; }
  .bo-gruppe > summary { grid-template-columns: 2.25rem minmax(0, 1fr) 1.25rem; gap: 0.25rem 0.75rem; padding: 1.2rem 0; }
  .bo-gruppe > summary > .bo-nr { grid-column: 1; grid-row: 1 / span 2; align-self: start; padding-top: 0.35rem; }
  .bo-gruppe > summary > :nth-child(2) { grid-column: 2; grid-row: 1; }
  .bo-gruppe > summary .bo-hint { grid-column: 2; grid-row: 2; white-space: normal; }
  .bo-gruppe > summary .bo-pluss { grid-column: 3; grid-row: 1 / span 2; }
  .bo-valg { padding-left: 0; }
}
@media (max-width: 37.5rem) {
  .bo-rutenett { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.625rem; }
  .bo-kort .tekst { padding: 0.625rem; }
  .bo-kort .begrunnelse { padding: 0.5rem 0.625rem 0.625rem; }
  .bo-stolper li { grid-template-columns: minmax(0, 6rem) minmax(0, 1fr) 1.75rem; }
}
@media (prefers-reduced-motion: reduce) {
  .bo-knapp, .bo-pluss::after { transition: none; }
  .bo-knapp:hover { transform: none; }
}
`
