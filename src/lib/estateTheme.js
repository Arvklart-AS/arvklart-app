// Det mørke uttrykket i den innloggede appen, som på arvklart.no. Fargene er fra fargepaletten «Landingssiden
// (mørk)», pluss Granskog. Oversikten og gjenstandslisten bruker klassene i estateThemeCss.js; de andre sidene
// har fargene i inline style.
//
// Denne filen er liten med vilje: App.jsx bruker den, og den havner da i hovedfilen som også lastes på de
// offentlige sidene. CSS-en for sidene ligger i estateThemeCss.js, som bare lastes med bo-sidene.

export const C = {
  natt: '#1F221E',      // bakgrunn
  jord: '#3A3129',      // merket «vil ha» på kortene
  granskog: '#2F4A43',  // mørk grønn flate (demobanneret)
  flate: '#272A25',     // kort og grupper (Natt løftet litt)
  flateHoy: '#30342D',  // dialoger, menyer, bokser og bildebakgrunn
  lin: '#F2EEE6',       // tekst og knappekanter
  linDempet: '#B9B4A8', // sekundærtekst (8,5:1 mot Natt)
  linje: 'rgba(242, 238, 230, 0.4)',  // feltkanter (3,4:1 mot Natt)
  kant: 'rgba(242, 238, 230, 0.14)',  // hårstreker, bare pynt
  mose: '#9DAA8C',      // aksent og fokusring (6,9:1 mot Natt)
  messing: '#C79A6B',   // Messing lys: overlinjene (som på nettsiden)
  ordfarge: '#D7BA9A',  // fremhevet ord i en stor overskrift (som «arvegjenstandene» på forsiden)
  rust: '#E08A7A',      // sletting og feil
}

// Hele den innloggede appen har det mørke uttrykket. Unntakene er sidene som også vises for utloggede og har sitt
// eget lyse oppsett: forsiden, veiviseren, personvern, kontakt, guidene, invitasjonen, nytt passord og founder.
export const isLightAppPath = pathname =>
  pathname === '/' || /^\/(veiviser|personvern|kontakt|guider|join|nytt-passord|founder|home)(\/|$)/.test(pathname) ||
  /^\/estate\/[^/]+\/guide\/?$/.test(pathname)

// Global CSS for det mørke uttrykket i appen (som arvklart.no): Bodoni Moda fra /fonter (som src/site/site.css),
// fokusring i Mose, mørke skjemafelt, et svakt, varmt lys øverst med tynne rammelinjer på brede skjermer, og
// rullemarg under det faste toppfeltet.
// Fargene på hver side står i sidene selv.
export const appDarkCss = `
@font-face{font-family:'Bodoni Moda';font-style:normal;font-weight:400 700;font-display:swap;src:url('/fonter/bodoni-moda-400-latin.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2122,U+2212}
.app-mork{color:#F2EEE6;color-scheme:dark;font-optical-sizing:none;background:radial-gradient(1100px 520px at 50% -6%,rgba(199,154,107,.10),transparent 62%) no-repeat,#1F221E}
@media (min-width:80rem){.app-mork{background:radial-gradient(1100px 520px at 50% -6%,rgba(199,154,107,.10),transparent 62%) no-repeat,linear-gradient(90deg,transparent calc(50% - 38rem - 1px),rgba(242,238,230,.07) calc(50% - 38rem - 1px),rgba(242,238,230,.07) calc(50% - 38rem),transparent calc(50% - 38rem),transparent calc(50% + 38rem),rgba(242,238,230,.07) calc(50% + 38rem),rgba(242,238,230,.07) calc(50% + 38rem + 1px),transparent calc(50% + 38rem + 1px)),#1F221E}}
/* Toppfeltet står fast øverst: det som rulles frem eller får fokus, skal ikke havne under det (WCAG 2.4.11) */
html:has(.app-shell){scroll-padding-top:72px}
.app-mork :focus-visible{outline-color:#9DAA8C}
.app-mork input::placeholder,.app-mork textarea::placeholder{color:rgba(185,180,168,.75)}
.app-mork option{background:#30342D;color:#F2EEE6}
`
