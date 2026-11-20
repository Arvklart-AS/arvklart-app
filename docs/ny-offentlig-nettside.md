# Ny offentlig nettside — integrasjon av designpakken av 19.11.2026

De fire offentlige sidene (`/`, `/slik-fungerer-det`, `/om-oss`, `/kontakt`) er bygget opp igjen i
React fra integrasjonspakken. Appen, demoen, Supabase, innloggingen, invitasjonene, veiviseren og
personvernerklæringens innhold er ikke endret. Ingen migreringer, ingen edge-funksjoner, ingen
demodata.

`senere/guider-skisse.html` er ikke publisert og ligger ikke i repoet.

---

## 1. Hva som er bygget

```
src/site/                 felles grunnlag for de offentlige sidene
  site.css                all CSS, avgrenset til rotklassen «.ak»
  SiteLayout.jsx          header, meny, bunntekst, demoknapp, hoppelenke, språkvalg
  PageHero.jsx            sidetopp med brødsmule (undersidene)
  Rotator.jsx             ordskiftet i overskriften + pause/start (WCAG 2.2.2)
  Signature.jsx           overgangen fra mørke til lys, med enhetsgruppen
  Journey.jsx             produktreisen, fire steg
  Faq.jsx                 spørsmål og svar
  MobileDock.jsx          fast demoknapp på mobil
  Shot.jsx                skjermbilder med etikett og faste mål
  icons.jsx, useDemo.js, useHydrated.js

public/nettsted/          18 skjermbilder og portretter + logo-maske.png
public/fonter/            Bodoni Moda (normal + kursiv) og SIL OFL-lisensen
```

* **All CSS er avgrenset til `.ak`.** Se punkt 6 for hva avgrensningen faktisk dekker.
* **`.ak-js` settes av `useHydrated()`**, ikke av et skript i HTML-en. HTML-en fra
  forhåndsrenderingen er derfor den ferdige versjonen uten JavaScript, og hydreringen legger bare
  til — den fjerner ingen noder (`test/e2e/seo.mjs` håndhever det).
* **«Prøv demo» er alltid en `<a href="/#demo">`.** Uten JavaScript går den til demoseksjonen på
  forsiden; med JavaScript stoppes navigeringen og `startDemoSession()` kjører — nøyaktig den samme
  flyten som før. Ingen ny demo.

---

## 2. Hva som er rettet i denne runden

### 2.1 Produktpåstandene

Tre påstander stemte ikke med koden. De er rettet, ikke erstattet med nye løfter.
`test/seo/nettsted.test.js` feiler hvis de gamle formuleringene kommer tilbake.

| Sto før | Står nå | Hva koden gjør |
|---|---|---|
| «Hvem som velger når, og hvor mange runder, avtaler dere selv» | «Administrator setter rekkefølgen, enten som listen står eller trukket tilfeldig. Den som velger sist i én runde, velger først i neste. Rundene går til det ikke er mer å velge.» | `ConflictPage.jsx:468–492`: rekkefølgen er listen eller `shuffleSnake()`; rundene snur; de går til gjenstandene er oppbrukt |
| «filtreres på … hva bare én vil ha, og hva ingen har svart på ennå» | «filtreres på dine egne svar, på hva flere har sagt ja til, hva noen vil ha, hva ingen har sagt ja til, og hva som allerede er tildelt» | `EstatePage.jsx:145–152`: Alle / Mine / Ettertraktede / Noen vil ha / Ingen vil ha / Tildelt |
| «Alle kan foreslå en verdi» | «Er det satt et KI-anslag, kan hver deltaker si seg uenig og foreslå et annet beløp. Fordelingsverdien … settes av den som administrerer boet.» | `ItemDetailPage.jsx:265–332` + `vote_item_value`: bare som «Uenig», én gang per bruker, og bare når gjenstanden har `estimated_value` |

I tillegg, der begrensningen er relevant for leseren:

* På «Slik fungerer det» §4 står det nå uttrykkelig at **«Ingen vil ha» samler både det alle har
  sagt nei takk til og det ingen har rukket å svare på** (`getStatusBreakdown` i
  `estateProgress.js` teller gjenstander uten interesser), og at den som administrerer boet ser
  hvem som mangler.
* «Ingen frist i løsningen» → **«Ingen frist fra Arvklart»**. Familien kan selv sette datoer på
  oppgaver i boet (`TasksPage.jsx`); Arvklart setter ingen.
* Forsidens steg 2 sa «hva som ennå ikke er besvart». Oversikten viser ditt eget antall ubesvarte,
  ikke en egen fane, så teksten sier nå **«hvor mange gjenstander du selv ikke har tatt stilling
  til»**.

Kontrollert og uendret, fordi de stemmer: invitasjonen deles av et menneske og deltakeren logger
inn med den registrerte e-posten; administrator setter fordelingsverdien; et KI-anslag er ikke en
takst; godkjenning er ikke BankID; loddtrekning skjer blant dem som ønsker gjenstanden; metodene
gjennomføres av administrator; «3 arvinger og 10 gjenstander»; «Last ned utkast (PDF)»;
begrunnelsen er valgfri; en gjenstand kan legges inn uten bilde; alle medlemmer kan registrere.

### 2.2 Pause/start for ordskiftet (WCAG 2.2.2)

`RotatorPause` i `src/site/Rotator.jsx`, plassert i heroen ved siden av «Ingen registrering».

* `<button>` med `aria-pressed`, og navnet skifter mellom «Pause ordskiftet» og «Start ordskiftet»
  (engelsk: «Pause/Resume the word animation»).
* Står **alltid** i HTML-en og er `visibility:hidden` til `.ak-js` er satt. Da flytter ikke heroen
  seg når JavaScript tar over, og uten JavaScript er knappen verken synlig, fokuserbar eller i
  tilgjengelighetstreet.
* Ved `prefers-reduced-motion: reduce` er det ingen bevegelse å stanse, og knappen tas helt bort.
* På pause blir uttrykket som står, stående — den hopper ikke tilbake til det første.
* Overskriften har fortsatt **én stabil tilgjengelig tekst**: båndet er `aria-hidden`, og det
  første uttrykket ligger som visuelt skjult tekst ved siden av.

Manuelt kontrollert i Chromium, ikke bare med axe: knappen er tabulatorstopp nr. 10 (1440 px) og
nr. 7 (390 px), alle stopp har synlig fokusring, `aria-pressed` skifter, ordskiftet står virkelig
stille på pause (samme uttrykk etter 4,6 s) og starter igjen etterpå. Skjermbilde med fokusring i
leveransen.

### 2.3 Selskapsopplysningene

Verifisert 19.11.2026 mot Enhetsregisterets offisielle API
(`data.brreg.no/enhetsregisteret/api/enheter/938816085`):

```
ARVKLART AS · org.nr. 938 816 085 · Aksjeselskap
registrert i Enhets- og Foretaksregisteret 05.11.2026, stiftet 02.11.2026
Tertnesgrenden 13, 5113 Tertnes (Bergen)
konkurs: nei · under avvikling: nei
vedtektsfestet formål: «Produsere digital løsning for å gjøre arveoppgjør enklere og mer
oversiktlig for familier.»
```

`COMPANY` i `src/pages/OtherPages.jsx` er satt til `Arvklart AS` / `938 816 085`, så
personvernerklæringen og bunnteksten oppgir det samme. `test/seo/nettsted.test.js` feiler hvis de
to skiller lag.

Forretningsadressen er **ikke** lagt inn i personvernerklæringen; den sto ikke der fra før, og det
er en vurdering dere bør ta (GDPR art. 13 krever identiteten og kontaktopplysningene til
behandlingsansvarlig — e-postadressen står der).

### 2.4 Engelsk

Alle fire sidene finnes nå på norsk og engelsk, med prosjektets egen `L()`-løsning. Oversatt:
navigasjon, brødsmuler, overskrifter, brødtekst, knapper, FAQ, bildetekster, `alt`-tekster,
`aria-label`-er, tilgjengelige navn, feilmeldinger, mailto-emner og metadata.

* **Norsk juridisk kontekst er beholdt.** Ingen tilpasning til britisk eller amerikansk arverett:
  «does not determine inheritance rights under Norwegian law», «official Norwegian resources»,
  «not a calculation of inheritance shares under Norwegian law».
* **Skjermbildene er ikke manipulert.** Den engelske etiketten sier «Screenshot from the demo
  (Norwegian interface)», og norske knappenavn i `alt`-tekster står i anførselstegn med en engelsk
  forklaring etter.
* **Veiviseren er fortsatt norsk.** Den engelske teksten lover ikke engelsk innhold: lenkene heter
  «Open the guide (in Norwegian)».
* **Demoen og appen** er på engelsk når brukeren har valgt engelsk; demo-boets eget innhold
  (gjenstander og begrunnelser) er norsk, slik det står i databasen.

#### Begrensning: engelsk kan ikke indekseres med dagens språkarkitektur

Språket følger kontoen og `hs_lang` i `localStorage`, ikke URL-en, så **begge språk ligger på samme
adresse**. Konsekvensen:

* `canonical` er den ene adressen, lik for begge språk.
* **Ingen `hreflang`.** Det ville krevd én adresse per språk, og de finnes ikke. Å legge inn
  oppdiktede språkadresser ville vært verre enn å la det være.
* Den forhåndsrendrede HTML-en — versjonen søkemotorene leser — er norsk. Engelsk rendres i
  nettleseren etter at språkvalget er lest.

**Minste avgrensede løsning hvis engelsk skal kunne indekseres:** gi hver offentlig side en engelsk
søsteradresse (`/en/`, `/en/how-it-works`, …), legg dem inn i `src/seo/pages.js` med `lang: 'en'`,
la forhåndsrenderingen rendre dem med engelsk språkvalg, og sett `hreflang` mellom paret. Det er en
avgrenset endring i `pages.js`, `vitePlugin.js` og `App.jsx` — men det er en endring i rutingen, og
jeg har ikke gjort den uten at dere har bedt om det.

### 2.5 CSS, mobil og Safari-fallback

* **`color-mix()` har nå statisk fallback.** `--ordfarge` (`#D7BA9A`) og enhetsrammenes
  `--skall`/`--skallkant`/`--skallmork` får faste verdier rett foran `color-mix()`-varianten.
  Uttrykket er uendret der `color-mix()` støttes; uten den får man sluttilstandens lyse enheter.
* **Margene settes uttrykkelig.** `.ak dl, dt, dd, figure, figcaption, blockquote, fieldset` får
  `margin:0; padding:0` i `site.css` i stedet for å bygge på nettleserens standardverdier — se
  punkt 6.
* **`justify-self:start` på e-postlenken** på `/kontakt`: klikkflaten strakte seg over hele spalten
  selv om teksten er kort.

### 2.6 Samtykkebanneret

Logikken, teksten og de to like tydelige valgene er uendret. Bare plasseringen er flyttet ut av
komponenten og inn i `index.html` under `.consent-ask`:

* Brede skjermer (≥ 760 px): nederst **til høyre** og smalere (380 px). Før dekket det den første
  faktakolonnen på «Slik fungerer det» og kantet inn over pauseknappen i heroen.
* Mens spørsmålet står framme, holdes **den faste demoknappen på mobil** nede
  (`body:has(.consent-ask) .ak .dock`), så de to aldri dekker hverandre.
* Siden får bunnmarg mens spørsmålet står framme, så **bunnteksten kan rulles fri**.

---

## 3. Testresultater

### Kjørt nå, på denne greina, etter alle endringene over

| Suite | Resultat |
|---|---|
| `npm run build` | OK |
| `npm test` | **472 av 472** |
| `npm run test:e2e` (Chromium) | **294 OK, 0 feil** |
| Egen språk- og tilgjengelighetskontroll (33 sjekker) | **33 av 33** |
| Egen mobil- og samtykkekontroll (67 sjekker) | **66 av 67** — se punkt 5.6 |
| `npm run test:db` | **Ikke kjørt her** (krever Docker). Kjørte grønt i CI på forrige commit, og denne endringen rører ikke databasen |

### Rapportert tidligere, i forrige runde

De 466 enhetstestene og 293 e2e-sjekkene fra forrige runde er ikke de samme tallene: antallet har
økt fordi det er lagt til tester for selskapsopplysningene, de rettede påstandene, pauseknappen,
`color-mix`-fallbacken, oversettelsene og bildene (`test/seo/nettsted.test.js`, 11 tester).

### Hva kontrollene dekker

* **Engelsk**: alle fire sidene har riktig overskrift, tittel, `lang="en"` på innholdet, én
  canonical uten språk i adressen, ingen `hreflang`, og ingen norsk hovedtekst igjen. Språkbytte
  fra bunnteksten gir samme side på det andre språket, overlever oppfriskning og virker ved direkte
  inngang på undersidene.
* **Mobil og desktop, 360 / 390 / 1440 px, på begge språk**: ingen avkuttet tekst, ingen horisontal
  rulling, og demoknappen og «ingen registrering» er synlige i første skjermbilde på forsiden.
* **Faste elementer**: samtykkespørsmålet dekker ingen kontroll på sju av åtte kombinasjoner (se
  punkt 5.6), den faste demoknappen og spørsmålet overlapper ikke, og bunnteksten kan rulles fri.
* **Sporing** (teknisk måling, ikke en juridisk konklusjon): med samtykke lastes
  `googletagmanager.com` på nøyaktig de seks offentlige sidene og ingen andre. `/logg-inn`,
  `/nytt-passord`, `/join/…` og 404-siden laster ingenting. `/app`, `/konto` og `/estate/…` uten
  innlogging sender brukeren til forsiden, og målingen skjer da på forsiden — ikke på en privat
  rute. Innlogget lastes GTM aldri (`test/e2e/analytics.mjs`).
* **Eksterne kall fra de offentlige sidene**: `fonts.googleapis.com` og `fonts.gstatic.com`
  (Karla og Fraunces) i alle samtykketilstander, og `googletagmanager.com` bare etter «Godta».
  Ingen andre. Bodoni Moda er selvhostet.

### Ikke testet

* **Safari og fysisk mobil.** Det finnes ingen WebKit i dette miljøet, bare Chromium. Se punkt 7
  for en manuell sjekkliste.
* **Vercel-forhåndsvisningen.** Forhåndsvisninger er beskyttet, og jeg har ikke
  `VERCEL_AUTOMATION_BYPASS_SECRET`; `*.vercel.app` er dessuten utenfor miljøets tillatte nett. Se
  punkt 5.7.
* **Pikselavvikene fra forrige runde** (0 px på `/om-oss` og `/kontakt`, +1 px på forsiden mobil,
  −18 px på `/slik-fungerer-det`) er **seksjonshøyder og layoutmål**, målt med samme font på begge
  sider. De sier at oppsettet stemmer, ikke at sidene er visuelt identiske: farger, typografi,
  ombrekking og bevegelse er ikke sammenlignet piksel for piksel. Etter denne runden gjelder tallene
  dessuten ikke lenger uendret — pauseknappen, den rettede teksten og den engelske versjonen endrer
  høyder bevisst.

---

## 4. Avvik fra integrasjonspakken

| Avvik | Hvorfor |
|---|---|
| Rettet produkttekst (punkt 2.1) | Pakkens tekst stemte ikke med koden |
| Pause/start for ordskiftet (punkt 2.2) | WCAG 2.2.2, godkjent av dere |
| Engelsk versjon (punkt 2.4) | Nettstedet er tospråklig |
| `.cross__cap` er en `<div>`, ikke `<figcaption>` | En `figcaption` må være første eller siste barn av en `figure`. Utseendet er uendret |
| `overflow-x: clip` i stedet for `hidden` | Pakken setter det på `<body>`. På en `<div>` ville `hidden` gjort flaten til en rulleflate og flyttet den klebrige headeren inn i den |
| `overflow-wrap: break-word` på `.ak` | Ved 135 % tekst på 360 px rant «Brukeropplevelse» og «eksempelboet» ut av spalten. Gjelder også pakken |
| `-webkit-backdrop-filter` på `.dock` | Safari under 18 kjenner bare den prefiksede varianten |
| «Åpne veiviseren **på arvklart.no**» → «Åpne veiviseren» | Formuleringen hørte til da sidene var frittstående filer |
| Bunnteksten bruker `.foot__org` på alle fire sidene | Forskjellen mot `.foot__note` er 0,05 rem |
| «English»/«Norsk» i bunnteksten | Språkvalget fantes i dagens bunntekst |
| Ubrukt CSS fjernet | `.ki*`, `.quotes*`, `.tabs*`, `.s3__*`, `.faser*`, `.omtopp`, `.vifte`, `.utkast` m.fl. hadde ingen markup |
| 18 px mindre luft under faktaraden på `/slik-fungerer-det` | Margen kom fra nettleserens standard `<dl>`-marg. Den settes nå uttrykkelig til 0 (punkt 6) |

Palett, typografi, rutenett, hårstreker, bevegelse, ordskiftet, produktreisen, signaturovergangen,
den faste demoknappen, spørsmål og svar og mobilmenyen er beholdt.

---

## 5. Hva jeg trenger fra deg

### 5.1 Rollebetegnelsene på «Om oss» og forsiden

Pakkens README sier de er foreløpige og skal bekreftes av hver enkelt. De står uendret, nå også på
engelsk. **Bekreft eller rett hver enkelt:**

| Person | Norsk | Engelsk |
|---|---|---|
| Bård Jakobsen Rinnan | Produkt og marked | Product and market |
| Andrea Hufthammer Vik | Drift og fremdrift | Operations and delivery |
| Ørjan Westre | Teknologi og økonomi | Technology and finance |
| Julie Tvedt | Brukeropplevelse og piloter | User experience and pilots |

Jeg har ikke endret ansvarsområdene.

### 5.2 Skjermbilder som må byttes før publisering

Jeg kan ikke ta nye skjermbilder: det krever innlogging i den ekte demoen, og demodata skal ikke
røres i denne oppgaven. Bildene er kontrollert ett for ett.

**Må byttes — viser «Bestemors gyngestol» med et foto av en vanlig trestol:**

| Fil | Hvor |
|---|---|
| `public/nettsted/d-tablet.webp` | Enhetsgruppen i forsidens hero (nettbrett) |
| `public/nettsted/d-laptop.webp` | Enhetsgruppen i forsidens hero (PC) |
| `public/nettsted/f-ettertraktet.webp` | «Slik fungerer det», steg 03 — tydeligst her |

**Trenger ikke byttes:** gitarens kategori («Sigma akustisk gitar» under «Elektronikk») er **ikke
synlig** i noe skjermbilde. Galleriet viser tittel, pris og hvem som ønsker gjenstanden, ikke
kategori. De øvrige 15 bildene viser ikke feilen.

Rotårsaken er demodataene, ikke bildene: `face0001` heter «Bestemors gyngestol» og beskrives som en
gyngestol i `supabase/seed/demo_estate.sql:100`, mens fotoet i lagringen viser en vanlig stol. Det
bryter med repoets egen regel om at demotekstene bare skal beskrive det bildene viser. Rettingen
hører hjemme i en egen endring — enten nytt foto eller ny tittel.

### 5.3 Engelsk indeksering

Punkt 2.4. Si fra om dere vil ha engelske søsteradresser, så gjør jeg den avgrensede endringen.

### 5.4 Forretningsadressen i personvernerklæringen

Punkt 2.3. Skal `Tertnesgrenden 13, 5113 Tertnes` inn som kontaktopplysning for behandlingsansvarlig?

### 5.5 `CONSENT_VERSION` er ikke økt

Ordlyden i samtykkespørsmålet og listen i personvernerklæringen er rettet (de nevnte fire sider;
det er nå seks pluss guidene). **Formål, mottakere, lagringstid og samtykkestyring er uendret** —
teknisk kontrollert over: samme GA4-container, samme samtykkemodus, samme `localStorage`-nøkkel,
samme sletting av `_ga` ved avslag, samme avgrensning til offentlige sider. Derfor er
`CONSENT_VERSION` ikke økt, og ingen blir spurt på nytt.

Dette er en teknisk konklusjon, ikke en juridisk. **Vil dere at alle skal spørres på nytt, er det
én linje.**

### 5.6 Én gjenstående overlapp

På forsiden ved 390 px dekker samtykkespørsmålet de nederste ~29 px av pauseknappen til det er
besvart. Knappens øvre halvdel er synlig og klikkbar, og den blir helt fri så snart man svarer
eller ruller ~30 px. Et fast bunnbanner vil alltid ligge over noe nederst i skjermbildet; jeg har
prioritert at ingen **primær** handling dekkes. Si fra hvis dere heller vil at pauseknappen skal
ligge over spørsmålet.

### 5.7 Forhåndsvisningen

For at jeg skal kunne kontrollere forhåndsvisningen selv, trenger jeg to ting:

1. `*.vercel.app` (eller den konkrete forhåndsvisningsadressen) åpnet i miljøets nettverksregler.
2. `VERCEL_AUTOMATION_BYPASS_SECRET` — den kan ikke tas inn gjennom skjemaet for nettverkshemmeligheter,
   fordi hodet `x-vercel-protection-bypass` ikke er en av de tillatte hodeformene.

Uten begge kan verken `scripts/check-seo.mjs` eller `scripts/smoke-browser.mjs` kjøres herfra.
**Begge kjøres uansett automatisk i CI** på hver commit (`.github/workflows/seo-preview.yml` og
`smoke.yml`), med hemmeligheten som allerede ligger i GitHub — resultatene står på PR-en.

---

## 6. CSS-avgrensningen, presist

Påstanden «appen treffes ikke av en eneste regel» gjelder **én vei**.

**Fra de offentlige sidene og ut:** ingen regel i `src/site/site.css` kan treffe utenfor `.ak`.
Hver eneste selektor i fila begynner med `.ak`, og `test/seo/nettsted.test.js` sjekker det.
`@font-face` definerer bare familien `Bodoni Moda`, som appen ikke bruker, og de to
reservefamiliene.

**Inn i de offentlige sidene:** appens globale regler i `index.html` gjelder også inne i `.ak`:

| Regel i `index.html` | Virkning inne i `.ak` |
|---|---|
| `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }` | Nullstiller standardmargene. Merkbar på `<dl>` (faktaraden mistet 18 px) |
| `html { font-size: 100% }` + `font: -apple-system-body` på iOS | Grunnstørrelsen, som alle `rem`-verdiene bygger på |
| `:focus-visible { outline: 3px solid #5F6E52 }` | Overstyres av `.ak :focus-visible` (høyere spesifisitet) |
| `@media (max-width:600px) { input, select, textarea { font-size: max(16px,1rem) } }` | Ingen felt på disse sidene |
| `body { background:#FBF9F5; font-family:'Karla' }` | Overstyres av `.ak` |
| `.consent-ask`, `body:has(.consent-ask) .ak …` | Med vilje: plasseringen av samtykkespørsmålet |

Derfor settes marger på `dl`, `dt`, `dd`, `figure`, `figcaption`, `blockquote` og `fieldset`
uttrykkelig i `site.css`, i stedet for å bygge på nettleserens standardverdier.

**Målt begge veier** på bygget: de offentlige sidene og representative app-, demo- og
innloggingsvisninger er kontrollert etter endringene, og `npm run test:e2e` dekker `/logg-inn`,
`/app`, bo-sidene, gjenstandssiden, «Arvinger», «Løsningsmetoder», «Fordelingen», demoreisen på
mobil og «Min konto» med axe på to bredder, uendret.

---

## 7. Manuell sjekkliste for Safari og fysisk mobil

Kan ikke kjøres herfra (ingen WebKit). Minst Safari 16.2 kreves for fullt uttrykk.

1. **Safari 16.2+ på Mac, 1440 px** — `/`: enhetsgruppen i heroen skal ha lyse rammer som mørkner
   når du ruller opp igjen (`color-mix()`). Er rammene flate og lyse hele veien, slår fallbacken
   inn, og Safari er for gammel.
2. **Hele siden ruller** uten horisontal rulling på alle fire sidene (`overflow-x: clip`).
3. **Den klebrige headeren** blir stående øverst når du ruller.
4. **Logoen** vises (CSS-maske, `-webkit-mask`).
5. **Ordskiftet** i overskriften beveger seg, og pauseknappen stanser det.
6. **`prefers-reduced-motion`** (Systemvalg → Tilgjengelighet → Skjerm → Reduser bevegelse):
   overskriften står statisk, pauseknappen er borte, og ingenting er skjult.
7. **iPhone, Safari**: den faste demoknappen kommer opp etter heroen og forsvinner ved
   demoseksjonen; `backdrop-filter` gjør den uskarp bak (`-webkit-`-varianten).
8. **iPhone**: `env(safe-area-inset-bottom)` gir plass under demoknappen på modeller med hjemindikator.
9. **Språkbytte** i bunnteksten på begge enheter.
10. **135 % tekst** (Innstillinger → Tilgjengelighet → Skjerm og tekststørrelse): ingen avkuttet tekst.

---

## 8. Mindre forbedringer som kan vente

* **`og:image`** finnes ikke; delingskortene bruker `/hero-bg.jpg` fra den gamle forsiden.
* **Tittelseparator**: de fire nye sidene bruker «|», `/personvern` og `/veiviser` bruker «—».
* **Fraunces lastes på de offentlige sidene** selv om designet ikke bruker den — fordi
  samtykkebanneret gjør det. Forsvinner hvis banneret får markedssidenes typografi.
* **Selvhosting av Karla.** Pakkens `karla-400-latin.woff2` er en *variabel* font (vekt 300–700,
  kontrollert i nettleseren) på 15 kB som dekker alle vektene appen bruker. Å selvhoste den ville
  fjernet begge de eksterne fontkallene for hele nettstedet, men den endrer appens typografi og
  hører derfor til i en egen endring.
* **Pakkens `FAQPage`- og `SoftwareApplication`-markering** er ikke tatt med. Google sluttet i 2023
  å vise FAQ-utdrag for andre enn myndigheter og helseinstitusjoner, og `SoftwareApplication` uten
  pris eller vurdering gir ingen kjent effekt.

### Må følges med på

**JavaScript-budsjettet er nesten brukt opp: 171 kB av 175 kB gzip.** Den engelske teksten kostet
9 kB. De fire sidene ligger i hovedfilen fordi de forhåndsrendres og hydreres, og én side til med
mye tekst sprenger budsjettet. Jeg har **ikke** hevet grensen — den er en bevisst skranke.

Minste avgrensede løsning når det smeller: flytt den lange teksten ut av JavaScript-filene og inn i
datablokken i den forhåndsrendrede HTML-en, slik guidene allerede gjør (`src/seo/pageData.js`).
Da teller teksten ikke mot budsjettet, uansett hvor mange sider eller språk som kommer til.
