# Ny offentlig nettside — integrasjon av designpakken av 19.11.2026

Dette dokumentet beskriver hvordan integrasjonspakken (`integrasjon/`, bygget 19. november 2026) er
tatt inn i produktrepoet, hvilke valg som er tatt underveis, hva som er testet, og hva som må
avklares før sidene publiseres.

Appen, demoen, Supabase, innloggingen, invitasjonene, veiviseren og personvernerklæringen er ikke
endret. Ingen migreringer, ingen edge-funksjoner, ingen demodata.

---

## 1. Hva som er bygget

| Rute | Komponent | Status |
|---|---|---|
| `/` | `src/pages/LandingPage.jsx` | Erstatter dagens forside |
| `/slik-fungerer-det` | `src/pages/HowItWorksPage.jsx` | Ny |
| `/om-oss` | `src/pages/AboutPage.jsx` | Ny |
| `/kontakt` | `src/pages/ContactPage.jsx` | Erstatter dagens kontaktside |

`senere/guider-skisse.html` er **ikke** publisert og ligger ikke i repoet.

### Filer

```
src/site/                 felles grunnlag for de offentlige sidene
  site.css                all CSS, avgrenset til rotklassen «.ak»
  SiteLayout.jsx          header, meny, bunntekst, demoknapp, hoppelenke
  PageHero.jsx            sidetopp med brødsmule (undersidene)
  Rotator.jsx             ordskiftet i forsidens overskrift
  Signature.jsx           overgangen fra mørke til lys, med enhetsgruppen
  Journey.jsx             produktreisen, fire steg
  Faq.jsx                 spørsmål og svar
  MobileDock.jsx          fast demoknapp på mobil
  Shot.jsx                skjermbilder med etikett og faste mål
  icons.jsx               pilene og haken fra pakken
  useDemo.js              demoinngangen (samme flyt som før)
  useHydrated.js          «ak-js» settes først når React har tatt over

public/nettsted/          18 skjermbilder og portretter + logo-maske.png
public/fonter/            Bodoni Moda (normal + kursiv) og SIL OFL-lisensen
```

### Slik henger det sammen

* **All CSS er avgrenset til `.ak`.** Appen, demoen og innloggingen treffes ikke av en eneste regel
  herfra, og ingen av deres regler treffer inn. `test/seo/seo.test.js` og e2e-testene av appen
  kjører uendret.
* **`.ak-js` settes av `useHydrated()`**, ikke av et skript i HTML-en. HTML-en fra
  forhåndsrenderingen er derfor den ferdige versjonen uten JavaScript, og hydreringen legger bare
  til — den fjerner ingen noder (`test/e2e/seo.mjs` håndhever det).
* **Flatene (`.g-natt` / `.g-papir` / `.g-jord`)** setter `--ink`, `--muted`, `--rule`, `--accent`,
  `--btn-bg` og `--focus` videre, slik pakken krever. Mønsteret er beholdt.
* **«Prøv demo» er alltid en `<a href="/#demo">`**, aldri en `<button>`. Uten JavaScript går den til
  demoseksjonen på forsiden; med JavaScript stoppes navigeringen og `startDemoSession()` kjører —
  nøyaktig den samme flyten som før. Elementtypen er lik før og etter hydrering, så DOM-en er
  uendret. Ingen ny demo er bygget.

---

## 2. Valg som er tatt

### 2.1 CSS i egen fil, ikke i en `<style>` i komponenten

Pakken har ~1 000 linjer CSS. Lagt i en JavaScript-streng ville den gått inn i hovedfilen, som
allerede lå på 155 kB gzip mot et budsjett på 175 kB (`JS_BUDGET_GZIP`). `src/site/site.css`
importeres i stedet av `SiteLayout.jsx` og blir et eget stilark (48 kB rå, **9,6 kB gzip**), som
ikke teller mot JavaScript-budsjettet, minimeres, og caches for seg.

Det er et avvik fra «ingen CSS-filer» i `CLAUDE.md`. Regelen gjelder komponenter som bruker inline
`style`-props; et designsystem på 1 000 linjer hører ikke hjemme der. `CLAUDE.md` er oppdatert.

### 2.2 Fonter: Bodoni Moda selvhostet, Karla fortsatt fra Google

* **Bodoni Moda** (normal + kursiv) selvhostes fra `public/fonter/`. Ny familie, ingen konflikt.
  `font-optical-sizing: none` er beholdt, slik pakken krever.
* **Karla** hentes fortsatt fra Google Fonts, som i dag. En lokal `@font-face` med familienavnet
  `Karla` ville blitt deklarert *etter* `<link>`-en i `index.html` og dermed overstyrt appens egne
  vekter (300/500/600) med den ene 400-fila i pakken. Det ville endret typografien i appen, som
  oppgaven sier skal være urørt.
* Reservefontene `Bodoni reserve` og `Karla reserve` med målte `size-adjust`-verdier er beholdt.

**Verdt å vite:** pakkens `karla-400-latin.woff2` er en *variabel* font (vekt 300–700, kontrollert i
nettleseren) på 15 kB. Den dekker alle vektene appen bruker. Å selvhoste Karla for hele nettstedet
ville fjernet et tredjepartskall til Google (personvern) og tre statiske fontfiler, men det endrer
appens typografi og hører derfor til i en egen endring. Se punkt 5.

### 2.3 Språk: sidene er på norsk

Pakken er bare norsk. Dagens forside og kontaktside er tospråklige (`L()`).

Valgt løsning, som ikke fjerner funksjonalitet:

* De fire sidene er på norsk, og innholdet er merket `lang="nb"` på `.ak`.
* I `src/seo/pages.js` er `title_en`/`description_en` satt lik den norske teksten — samme mønster
  som guidene i `content/guider/`, som også bare finnes på norsk. En besøkende med engelsk språkvalg
  får dermed norsk tittel over norsk innhold, ikke en engelsk tittel over norsk tekst.
* Lenken «English» står igjen i bunnteksten. Språkvalget gjelder appen, veiviseren og innloggingen
  som før.

**Ingen engelsk oversettelse er skrevet.** Se punkt 5.

### 2.4 Logoen

Pakkens README anbefaler den ekte SVG-logoen med `fill="currentColor"`. Den kan ikke brukes:
`public/ARVKLART Horizontal Negative.svg` er ikke en path-logo, men et punktbilde pakket inn i SVG
med filtre og masker (72 kB, sideforhold 3,56). Pakkens `logo-maske.png` (460×122, sideforhold 3,77,
11 kB) er laget for formålet og er lagt i `public/nettsted/`. Den lastes som vanlig fil fra samme
opphav, så CORS-problemet README beskriver (som gjaldt `file://`) finnes ikke her.

### 2.5 Strukturerte data

Pakken har `Organization`, `WebSite`, `WebPage`, `SoftwareApplication` og `FAQPage` i en `@graph`.
Bare `WebSite` og `Organization` på forsiden er tatt med — det repoet allerede gjør, og det
`test/seo/seo.test.js` håndhever («bare opplysninger som står på nettstedet», ingen `offers`,
`aggregateRating` eller `review`).

`FAQPage` er utelatt fordi Google i 2023 sluttet å vise FAQ-utdrag for andre enn myndigheter og
helseinstitusjoner. `SoftwareApplication` uten pris eller vurdering gir ingen kjent effekt. Begge kan
legges til hvis dere vil — si fra, så gjør jeg det i en egen endring.

### 2.6 Navigering med vanlige lenker

Alle interne lenker mellom de offentlige sidene er vanlige `<a href>`, ikke `react-router`-lenker.
Det er mønsteret de offentlige sidene allerede bruker, det gir hver side den forhåndsrendrede
HTML-en (rask og komplett uten JavaScript), og det gir riktige sidevisninger i GA4 uten oppsett i
GTM-containeren.

---

## 3. Avvik fra pakken

| Avvik | Hvorfor |
|---|---|
| `.cross__cap` er en `<div>`, ikke `<figcaption>` | En `figcaption` må være første eller siste barn av en `figure`. I pakken står den utenfor. Utseendet styres av klassen og er uendret. |
| `overflow-x: clip` i stedet for `hidden` på rotflaten | Pakken setter det på `<body>`. På en `<div>` ville `hidden` gjort flaten til en rulleflate og flyttet den klebrige headeren inn i den. `clip` klipper uten å lage rulleflate. |
| `overflow-wrap: break-word` lagt til på `.ak` | Ved 135 % tekst på 360 px rant «Brukeropplevelse» ut av teamkolonnen og «eksempelboet» ut av den faste demoknappen. Slår bare inn når et ord ikke får plass. Gjelder også pakken (kontrollert). |
| `-webkit-backdrop-filter` lagt til på `.dock` | Safari under 18 kjenner bare den prefiksede varianten. |
| «Åpne veiviseren **på arvklart.no**» → «Åpne veiviseren» | Formuleringen hørte til da sidene var frittstående filer. Nå er vi på arvklart.no. |
| Bunnteksten bruker `.foot__org` på alle fire sidene | Forsiden i pakken brukte `.foot__note` med en inline fargeoverstyring. Forskjellen er 0,05 rem og `letter-spacing: .01em`. |
| «English» lagt til i bunnteksten | Språkvalget fantes i dagens bunntekst og skulle ikke fjernes. |
| `aria-current="page"` fjernet fra lenken til siden man står på i bunnteksten på forsiden | Forsiden lenker ikke til seg selv; den lenken er tatt ut i stedet. |
| Ubrukt CSS fjernet | `.ki*`, `.quotes*`, `.tabs*`, `.s3__*`, `.faser*`, `.omtopp`, `.vifte`, `.utkast`, `.dragnote`, `.sh--foto`, `.sh--sim`, `.reise__teller` m.fl. hadde ingen markup på de fire sidene. |
| 18 px mindre luft under faktaraden på `/slik-fungerer-det` | Appens globale reset (`* { margin: 0 }` i `index.html`) nullstiller standardmargen på `<dl>`. I pakkens frittstående fil sto den igjen. |

Alt annet — palett, typografi, rutenett, hårstreker, bevegelse, ordskiftet, produktreisen,
signaturovergangen, den faste demoknappen, spørsmål og svar, mobilmenyen — er beholdt.

### Målt mot prototypen

Med samme font på begge sider (Karla slått av, så bare oppsettet sammenlignes), 1440×900 og 390×844:

| Side | Avvik i høyde |
|---|---|
| Forside, PC | 0 px (hero, signatur, produktreise, team, spørsmål, veiviser, avslutning, bunntekst alle identiske) |
| Forside, mobil | +1 px (den ekstra «English»-lenken i bunnteksten) |
| `/slik-fungerer-det`, PC | −18 px (se tabellen over) |
| `/om-oss`, PC og mobil | 0 px |
| `/kontakt`, PC og mobil | 0 px |

Med Karla fra Google i stedet for pakkens variable Karla brekker enkelte avsnitt én linje
annerledes. Det er den samme Karla resten av arvklart.no allerede bruker.

---

## 4. Testresultater

Kjørt 19.11.2026 på denne greina.

| Suite | Resultat |
|---|---|
| `npm run build` | OK |
| `npm test` (enhetstester) | **461 av 461** |
| `npm run test:e2e` (Chromium) | **293 OK, 0 feil** |
| `npm run test:db` | **Ikke kjørt** — krever Docker, som ikke finnes i dette miljøet. Endringen rører ikke databasen (ingen migreringer, ingen SQL, ingen policyer), så suiten er ikke berørt. |

### Hva e2e-testene dekker etter endringen

* Forhåndsrendret HTML uten JavaScript for alle fire sidene: overskrift, hovedinnhold, brødsmule,
  canonical, lenkene til veiviser, kontakt, personvern og innlogging.
* Hydrering på forsiden uten at noder byttes ut, uten layoutskift (< 0,01) og uten konsollfeil.
* Engelsk språkvalg: forsiden vises på norsk med norsk tittel, og innholdet er merket `lang="nb"`.
* Demo-CTA fra forsiden åpner demo-boet; innlogging fra forsiden ender på `/app`.
* `/home` → `/` (308), `/veiviser.html` → `/veiviser` (308), ukjente adresser og utkast gir 404.
* `noindex` på appen, innlogging, invitasjoner og `/konto`; ingen `noindex` på de fem offentlige
  sidene eller de to nye.
* Invitasjonslenke, lenke for nytt passord og e-postbekreftelse med økt i adressen virker som før.
* axe (WCAG 2.2 A/AA) på `/`, `/slik-fungerer-det` og `/om-oss`: ingen alvorlige eller kritiske avvik.
* 135 % tekst på 360 px: ingen horisontal rulling og ingen kuttet tekst på noen av sidene.
* Samtykke til statistikk: spørsmålet vises på de nye sidene, ingenting hentes fra Google før valget,
  og demoen og appen måles aldri.
* JavaScript før interaktiv: **162 kB gzip** av et budsjett på 175 kB (var 155 kB før).

### Egen funksjonell kontroll (18 av 18)

Ordskiftet bytter uttrykk og stanser ved redusert bevegelse · overskriftens tilgjengelige navn er
«Fordel arvegjenstandene med én felles oversikt», uendret ved hvert bytte · `--lift` endrer seg ved
rulling og står på 1 ved redusert bevegelse · den faste demoknappen på mobil vises etter heroen,
forsvinner ved demoseksjonen og synkroniserer `aria-hidden` og `tabIndex` · mobilmenyen åpnes, lukkes
med Escape og gir fokus tilbake · produktreisen byttes med radioknapp og «Neste steg», og går rundt ·
alle tabulatorstopp på forsiden har synlig fokusring · uten JavaScript: alle fire overskriftene står,
stegene er klikkbare, «Neste steg» er skjult og demoknappen peker på `/#demo` · portrettene laster.

### Ikke testet

* **Safari og fysisk mobil.** Det finnes ingen WebKit i dette miljøet, bare Chromium. Pakkens README
  sier det samme om prototypen. CSS-en bruker `color-mix()` (Safari 16.2+), `svh` (15.4+), `:has()`
  (15.4+), `overflow-x: clip` (16+) og `size-adjust` i `@font-face` (16.4+). På eldre Safari vil
  enhetsrammene i signaturen miste fargene sine, siden de bygger på `color-mix()`. **Dette bør
  kontrolleres manuelt på en Mac og en iPhone før publisering.**
* **Vercel-forhåndsvisning.** `scripts/check-seo.mjs <url>` og `scripts/smoke-browser.mjs` kjører mot
  en ekte utrulling og er ikke kjørt herfra. Etterligningen i `test/e2e/staticServer.mjs` er ikke
  bevis for hvordan Vercel tolker omskrivinger og hoder.

---

## 5. Uavklarte spørsmål før publisering

### Må avklares

**1. To påstander på `/slik-fungerer-det` er ikke dekket av produktkoden.**
Teksten er beholdt ordrett fra pakken, slik oppgaven ber om, men den stemmer ikke med koden:

* *«Hvem som velger når, og hvor mange runder, avtaler dere selv»* (Vekslende runder).
  `src/pages/ConflictPage.jsx:468–492` gir bare startrekkefølgen eller «Tilfeldig rekkefølge».
  Det finnes ingen måte å sette rekkefølgen manuelt på, og antall runder følger av gjenstandene.
* *«Galleriet kan filtreres på … hva bare én vil ha, og hva ingen har svart på ennå»* (steg 03).
  Fanene er Alle / Mine / Ettertraktede / Noen vil ha / Ingen vil ha / Tildelt
  (`src/pages/EstatePage.jsx:145–152`). Det finnes ingen «bare én»-fane, og «Ingen vil ha» teller
  gjenstander uten interesser — altså også dem ingen har svart på.

Velg: rett teksten, eller bygg funksjonen. Jeg har ikke skrevet nye formuleringer.

**2. «Alle kan foreslå en verdi» er bare delvis riktig.**
Står på `/slik-fungerer-det` to steder. I appen går det bare som «Uenig» på et eksisterende
KI-anslag (`vote_item_value`), én gang per bruker, og bare når gjenstanden har `estimated_value`
(`src/pages/ItemDetailPage.jsx:265–332`). Uten anslag finnes det ingen måte å foreslå en verdi på.

**3. «Arvklart AS · Org.nr. 938 816 085» i bunnteksten er ikke verifisert.**
Kontrollsifferet stemmer (mod-11), men brreg.no er utenfor dette miljøets tillatte nett.
I tillegg: `COMPANY = { name: '', orgnr: '' }` i `src/pages/OtherPages.jsx:151` er tom, så
personvernerklæringen oppgir ingen behandlingsansvarlig mens bunnteksten gjør det. Bekreft
organisasjonsnummeret og fyll inn `COMPANY`, ellers bør org.nr. tas ut av bunnteksten.

**4. Rollebetegnelsene på `/om-oss` og forsiden.**
Pakkens README sier de er foreløpige og skal bekreftes av hver enkelt.

**5. WCAG 2.2.2 (nivå A): ordskiftet i overskriften har ingen pauseknapp.**
Det starter av seg selv og varer i mer enn fem sekunder. Pakken tok pauseknappen ut etter ønske fra
teamet, og README-en ber om at det vurderes på nytt. Jeg har bygget det som pakken sier, uten
pauseknapp, siden det er en synlig designendring. `prefers-reduced-motion` respekteres, og båndet
stanser når fanen skjules eller heroen rulles ut av bildet, men det er ikke en side-mekanisme etter
ordlyden i suksesskriteriet. axe fanger ikke 2.2.2.

Vil dere ha en pauseknapp, er endringen liten: eksporter `stopp`/`start` fra `Rotator.jsx` og legg en
`<button class="ul ul--sub">` under `.hero__micro` som veksler. Si fra, så gjør jeg det.

### Bør avklares

**6. Skjermbildene viser kjente feil i demodataene.**
«Bestemors gyngestol» (`face0001`) viser en vanlig trestol, og «Sigma akustisk gitar» (`db1836d7`,
finnes bare i produksjon) ligger under «Elektronikk». Det synes tydeligst i
`d-tablet.webp` (enhetsgruppen i heroen) og `f-ettertraktet.webp` (steg 03). Demodata skal ikke
endres i denne oppgaven. Bildene er ærlig merket «Skjermbilde fra demoen», så de viser demoen slik
den faktisk er — men de bør tas på nytt etter at demodataene er rettet.

**7. Engelsk versjon av de fire sidene.**
Sidene er bare norske. Jeg har ikke skrevet oversettelser, siden en ukontrollert oversettelse av
produktpåstander er verre enn ingen. Tre veier: (a) la det stå som nå, (b) oversett og få teksten
juridisk gjennomgått slik veiviseren venter på (`VITE_GUIDE_EN`), (c) ta «English» ut av de
offentlige sidene. (a) er det minst forpliktende.

**8. `og:image` finnes ikke.**
Delingskortene bruker `/hero-bg.jpg` (686 kB), som er et bakgrunnsbilde fra den gamle forsiden og
ikke passer til det nye designet. Et eget 1200×630-bilde bør lages.

**9. Samtykkebanneret er stilt i appens palett.**
Det er eksisterende funksjonalitet som oppgaven sier skal bevares, så det er ikke rørt. På de mørke
sidene står et lyst kort med Fraunces-overskrift midt i Bodoni-designet, og på
`/slik-fungerer-det` dekker det den første faktakolonnen. Teksten er oppdatert til «de offentlige
sidene» (den sa «forsiden og veiviseren», som nå ville vært feil), og listen i
personvernerklæringen er utvidet med de to nye sidene og guidene. `CONSENT_VERSION` er **ikke** økt:
formål og mottakere er uendret, bare listen over sider er lengre. Si fra hvis dere vil at alle skal
spørres på nytt.

**10. Tittelseparator.** De fire nye sidene bruker «|» (fra pakken), mens `/personvern` og
`/veiviser` bruker «—». Bør harmoniseres.

**11. Fraunces lastes på de offentlige sidene** selv om designet ikke bruker den — fordi
samtykkebanneret gjør det. Løses når punkt 9 løses.

**12. JavaScript-budsjettet er nesten brukt opp:** 162 kB av 175 kB gzip. De fire offentlige sidene
ligger i hovedfilen fordi de forhåndsrendres og hydreres. Neste offentlige side med mye markup kan
sprenge budsjettet. Løsningen er egne inngangspunkter per forhåndsrendret side — en større endring
som hører til for seg.

---

## 6. Før publisering

1. Avklar punkt 1–5 over.
2. Kontroller forhåndsvisningen hos Vercel:
   ```bash
   node scripts/check-seo.mjs <forhåndsvisnings-url>
   ```
   ```bash
   node scripts/smoke-browser.mjs <forhåndsvisnings-url>
   ```
   Begge krever `VERCEL_AUTOMATION_BYPASS_SECRET`.
3. Kontroller i Safari på Mac og iPhone (se punkt 4, «Ikke testet»).
4. Etter produksjonssetting, mot produksjon:
   ```bash
   node scripts/check-seo.mjs https://www.arvklart.no --production
   ```
5. Meld de to nye adressene inn i Google Search Console. `sitemap.xml` tar dem automatisk.
