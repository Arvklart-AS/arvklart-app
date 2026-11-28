// Appens uttrykk: lyse, rolige arbeidsflater med en smaragdgrønn topplinje, i samme familie som den offentlige
// nettsiden (src/site/site.css, docs/nettside-v4.md). Smaragd øverst og lyst innhold, som heroen og seksjonene der.
// Ingen bakgrunnseffekter i arbeidsflatene: konsentrasjon og lesbarhet går foran stemning.
//
// Oversikten og gjenstandslisten bruker klassene i estateThemeCss.js; de andre sidene har fargene i inline style,
// lagt om fra den mørke paletten med samme betydning (se docs/app-lys.md for tabellen).
//
// Denne filen er liten med vilje: App.jsx bruker den, og den havner da i hovedfilen som også lastes på de
// offentlige sidene. CSS-en for sidene ligger i estateThemeCss.js, som bare lastes med bo-sidene.
//
// Kontrast (målt): blekk 15,9:1 og dempet 9,0:1 mot flate; jade 7,3:1, messing 7,0:1 og rust 6,2:1 mot siden;
// lin tekst på smaragd 11,1:1; feltkanter 3,1:1 (WCAG 1.4.11).

export const C = {
  side: '#F1F3EA',      // bakgrunnen i appen (lys silke, flat)
  flate: '#FCFCF9',     // kort, paneler og grupper (naturhvit)
  flateHoy: '#EEF1E6',  // bokser inne i kort, bildebakgrunn, valgte rader
  blekk: '#2A1D14',     // tekst
  dempet: '#4F463A',    // sekundærtekst
  kant: 'rgba(42, 29, 20, 0.12)',   // hårstreker, bare pynt
  linje: 'rgba(42, 29, 20, 0.5)',   // feltkanter og konturknapper uten farge (3:1)
  smaragd: '#24392A',   // primærknapper, valgt tilstand
  smaragdHover: '#2F573E',
  jade: '#2F573E',      // aksent, «ferdig», fokusring, fremdrift
  messing: '#6E4A2A',   // overlinjene
  ordfarge: '#7A5230',  // fremhevet ord i en stor overskrift
  rust: '#9A3B2E',      // sletting og feil
  lin: '#F4F2EB',       // tekst på smaragd og rust
  jord: '#EFE4D3',      // merket «N vil ha» på kortene (varm lin)
  topp: '#1B3527',      // topplinjen (som headeren på nettsiden)
}

// Sidene som også vises for utloggede og har sitt eget oppsett (forsiden, veiviseren, personvern, kontakt, guidene,
// invitasjonen, nytt passord og founder). De får ikke appens bakgrunn og globale stiler.
export const isLightAppPath = pathname =>
  pathname === '/' || /^\/(veiviser|personvern|kontakt|guider|join|nytt-passord|founder|home)(\/|$)/.test(pathname) ||
  /^\/estate\/[^/]+\/guide\/?$/.test(pathname)

// Global CSS for appen: Bodoni Moda fra /fonter (som src/site/site.css), fokusring i jade, skjemafelt med synlig
// kant, og rullemarg under det faste toppfeltet. Fargene på hver side står i sidene selv.
export const appCss = `
@font-face{font-family:'Bodoni Moda';font-style:normal;font-weight:400 700;font-display:swap;src:url('/fonter/bodoni-moda-400-latin.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2122,U+2212}
.app-flate{color:#2A1D14;color-scheme:light;font-optical-sizing:none;background:#F1F3EA}
/* Toppfeltet står fast øverst: det som rulles frem eller får fokus, skal ikke havne under det (WCAG 2.4.11) */
html:has(.app-shell){scroll-padding-top:72px}
.app-flate :focus-visible{outline-color:#2F573E}
.app-flate input::placeholder,.app-flate textarea::placeholder{color:rgba(79,70,58,.8)}
.app-flate option{background:#FCFCF9;color:#2A1D14}
`
