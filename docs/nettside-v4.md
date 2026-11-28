# Nettsiden etter designdemo v4 — smaragd, silke og en kortere prosess

Forslag til oppdatert offentlig nettside, bygget på `arvklart-designdemo-v4.html` (teamets foretrukne
retning etter flere runder) og tilbakemeldingene fra Julie og Andrea. **Ikke en godkjent
produksjonsrelease**: grenen er `baard/nettside-v4`, og den skal ikke merges uten gjennomgang.

Grunnlaget før denne endringen er beskrevet i `docs/ny-offentlig-nettside.md` (PR #72 og
etterfølgende rettelser). Alt som står der om produktpåstander, språk, SEO, samtykke og filmen,
gjelder fortsatt.

Ikke endret: URL-er, rutene, `src/seo/pages.js` (titler, beskrivelser, canonical, strukturerte data),
sitemap, `vercel.json`, CSP, appen, demoen, Supabase, veiviserens innhold, personvernerklæringen,
samtykket og analysen.

---

## 1. Designvalg

| Valg | Hvorfor |
|---|---|
| **Smaragd bare i hero, veiviser og bunntekst** (som v4) | Resten er lys silke (`g-papir`) og varm lin (`g-lin`). «Slik fungerer det» hadde fire mørke seksjoner; med smaragd i alle ville siden druknet. |
| **Myke, asymmetriske overganger** (`kurve-ned`, `kurve-begge`) | Fra v4: den mørke flaten maskeres med en bred kurve og legges over naboen. Ren CSS-maske, ingen animasjon. Naboen får like mye ekstra luft (`--inn`/`--ut`). |
| **Statiske materialer** | Korn og silkefolder er CSS-gradienter og et lite SVG-korn (`data:`, tillatt i CSP). **v4s glidende foldelag (70 s) er ikke tatt med**: det er nesten usynlig, men krever et fullskjermslag og ville utløst et nytt pausekrav (WCAG 2.2.2). |
| **Ingen scrolldrevet overgang** under heroen | Den gamle signaturen (`--lift`, rAF-løkke) fulgte rullingen og var i praksis en parallakse. Filmen står nå stille i lyset. Filmlogikken er uendret: plakaten er LCP og lastes ivrig, `<video>` settes inn først ved trykk, tekstalternativet står. |
| **Skjermbildene i smaragdramme** (Julie) | Appen er mørk (Natt, grønnsort), og bildene er ekte. I v4 sto de i beige passepartout og ble tunge, brune blokker på lys silke. En ramme av samme smaragd som heroen gjør dem til en del av siden. Selve bildene er urørte: ingen filter, tone eller redigering. |
| **Rolige knapper** | Ingen løft eller glød ved hover, bare fargeskifte. 54 px høye, pilleform. |
| **Ingen kursiv i overskriftene** | Det kursive ordet i nesten hver overskrift («Hva kan vi hjelpe deg *med*?») var en stor del av den variasjonen Andrea pekte på. v4 har ingen. |
| **Fem tekststørrelser** (`--fs-h1` … `--fs-small`) | Overskrifter, FAQ, teamnavn, stegtitler og bildetekster brukte ulike `clamp()`-verdier. Nå er det én skala. Brødtekst er 17 px på mobil og 18 px på PC (var 16–17,6). |
| **Fast smaragd header** | V4 lar headeren skifte farge etter seksjonen under. Det krever et skript og gjør navigasjonen mindre forutsigbar; en fast header er enklere for målgruppen. |

### Palett og kontrast

Råpalettens navn er beholdt (`--natt`, `--papir` …), så komponentene følger med uten omskriving.
Målt kontrast (WCAG 2.2 AA), også på det lyseste punktet i smaragdgradienten (`#36644A`):

| Tekst | Bakgrunn | Kontrast |
|---|---|---|
| Lin `#F4F2EB` | smaragd `#1B3527` / lyseste punkt | 11,8 / 6,1 |
| Dempet `#E2DED2` | smaragd / lyseste punkt | 9,9 / 5,1 |
| Overlinje `#EDE4C9` | smaragd / lyseste punkt | 10,4 / 5,4 |
| Ordfargen `#D7BA9A` (bare h1) | lyseste punkt | 3,7 (stor tekst, krav 3:1) |
| Blekk `#2A1D14` | silke `#ECF0E2` / lin `#EFE9DC` | 14,1 / 13,4 |
| Dempet `#4F463A` | silke / lin | 8,0 / 7,6 |
| Messing `#654527` (lenker, overlinjer) | silke / lin | 7,5 / 7,1 |
| Knapp `#24392A` med lin tekst | — | 11,1 |

Lysflekken midt i smaragden er dempet fra v4 (alfa ,88 → ,5) for å holde disse tallene.

## 2. Andreas tilbakemelding: prosessen på én skjerm

**Før:** fire faner på forsiden, ett steg synlig om gangen, ~1 300 px på 1440×900. Tre av fire steg
lå bak et klikk, og KI-båndet kom i tillegg.

**Nå (`src/site/Prosess.jsx`):** fire steg side om side, hvert med ett ekte skjermbilde, én tittel og
to korte setninger. Stegene følger Andreas forslag, tilpasset produktet:

1. Legg inn gjenstandene
2. Samle familiens ønsker (invitasjonen hører hjemme her)
3. Fordel gjenstandene
4. Dokumenter det dere blir enige om

Ingressen sier at rekkefølgen ikke er fast («Dere kan legge til gjenstander underveis og fordele i
flere omganger»), fordi produktet fungerer slik. KI-hjelpen er én linje under stegene i stedet for et
eget bånd. Detaljene står på «Slik fungerer det».

Målt i Chromium med seksjonen rullet til toppen, rett under headeren (px fra toppen av vinduet):

| Skjerm | De fire stegene slutter | Fotlinjen (KI + lenke) slutter | Alle fire steg synlige |
|---|---|---|---|
| 1920×1080 | 702 | 857 | ja, med fotlinjen |
| 1440×900 | 698 | 854 | ja, med fotlinjen |
| 1366×768 | 683 | 839 | ja; fotlinjen under |
| 1280×720 | 666 | 820 | ja; fotlinjen under |

Mobil: én kolonne, nummer til venstre, lite bilde under teksten.

**«Slik fungerer det»** er strammet inn uten å fjerne innhold: delene med ett hovedbilde står i to
kolonner over 1024 px (tekst og utdyping til venstre, bildet til høyre i omtrent egen størrelse).
Før ble 620–680 px store skjermbilder skalert opp til 900 px — uskarpt og høyt. Siden er
**5 947 px** høy på 1440 px (var 7 551). Forsiden er **5 959 px** (var 6 646; v4 var 8 293).

## 3. Julies tilbakemelding: demobildene

> **Oppdatert:** etter at appen fikk lyse arbeidsflater (`docs/app-lys.md`) er skjermbildene tatt på nytt fra
> demospeilet, og rammen er gjort om til et lite «appvindu» med en smal smaragdlist øverst. Smaragdrammen beskrevet
> under gjelder nå bare produktfilmen.

* Alle produktbilder (forsiden, «Slik fungerer det», filmplakaten) står i samme smaragdramme med
  myk skygge og 14 px hjørner; telefonrammen i veiviserseksjonen er den samme i mørk variant.
* Bildene er ekte utsnitt fra demoen og ikke endret. Ingen nye bilder er laget, og ingen funksjoner
  vises som ikke finnes.
* Forsiden bruker fire eksisterende utsnitt (`i-legg-til`, `f-flere`, `p-metoder`, `m-fordeling`).
  Én synlig etikett («Skjermbilde fra demoen — utsnitt fra eksempelboet, beskåret, ikke redigert»)
  står under alle fire, i stedet for fire like; hvert bilde har fortsatt sin egen alt-tekst og en
  skjult bildetekst.
* `i-skjema.webp`, `j-maleri.webp` og `m-dok.webp` ble bare brukt av fanene og er slettet
  (testen krever at hver fil i `public/nettsted/` er i bruk). De ligger i git-historikken.

**Ikke gjort, og et forslag:** den beste løsningen på lang sikt er nye skjermbilder tatt fra demoen
i samme utsnitt og målestokk (f.eks. 1280 px bredde, samme zoom), slik at tekststørrelsen inni
bildene blir lik. Det krever å ta bildene på nytt fra demoen, ikke å redigere dem.

## 4. Øvrige sider

* **Om oss, Kontakt:** samme flater og rammer; portrettene i myke hjørner uten rutenett. «Hvorfor vi
  holder på» på «Om oss» er smaragd med kurver, som veiviseren på forsiden.
* **Innlogging (`LoginPage.jsx`):** bare visuelle verdier, ingen logikk: silkebakgrunn, logoen i stedet
  for vekt-ikonet (navnet «Arvklart» står fortsatt som h1 for skjermlesere), knappefargen, Bodoni Moda
  i stedet for Fraunces, og en lenke **«← Til forsiden»** — siden hadde ingen vei tilbake.
* **404-siden:** hadde fortsatt espresso-paletten fra før nettsidebyttet. Nå smaragd header, silke,
  Bodoni Moda (selvhostet) og pilleknapper. Markering og lenker er uendret.
* **Veiviseren:** får den nye headeren (felles `SiteHeader`). Veiviserens eget innhold og CSS er
  **ikke** endret: tekstene er låst av fasittestene, og samme CSS brukes i iframen inne i boene.
* **Personvern:** rendres av appen og er juridisk innhold; ikke endret.

## 5. Tekstendringer (til vurdering)

Søkeordene i titler, beskrivelser og h1 er uendret (`pages.js` er ikke rørt). Påstandene er
kontrollert mot koden som før; ingen nye produktpåstander eller garantier.

| Side | Før | Nå | Hvorfor |
|---|---|---|---|
| Forsiden, h1 | med *én felles* oversikt | med én felles oversikt | kursiv tatt bort, samme tekst |
| Forsiden, prosess h2 | Se tingene og hvem som *ønsker* dem | Slik fordeler dere innboet | beskriver hva delen er; «fordele innbo» er et søkeord |
| Forsiden, prosess ingress | Møbler, servise, smykker og andre eiendeler kan samles … | Fire steg, men ingen fast rekkefølge. Dere kan legge til gjenstander underveis og fordele i flere omganger. | sier at prosessen ikke er lineær |
| Forsiden, stegene | fire faner, 3–4 avsnitt hver | fire steg, to setninger hver | Andrea: for lang |
| Forsiden, KI | eget bånd: «KI foreslår. Dere bestemmer.» + avsnitt + lenke | én linje: «Med et bilde kan KI foreslå navn, kategori og et verdianslag. Dere ser over forslagene og bestemmer selv.» | slagord tatt bort; samme innhold |
| Forsiden, team | Ideen til Arvklart kom fra et behov i egen familie. … Nå tar vi Arvklart videre for å gjøre fordelingen av innbo enklere for flere familier. | Ideen kom fra et behov i egen familie. … ble vi fire som ville bygge løsningen sammen, så flere familier kan fordele innbo med mindre strev. | kortere |
| Forsiden, veiviser | Veiviseren samler prosessen i faser … Den kan hjelpe deg å finne informasjon om … | Veiviseren deler arveoppgjøret i faser, forklarer begrepene og lenker til offentlige kilder. Der finner du det som kommer før og etter fordelingen av innboet. | kortere, mer direkte |
| Forsiden, demo | Utforsk et ferdig eksempelbo og se hvordan gjenstander, ønsker og fordeling vises i Arvklart. | Åpne et eksempelbo med tre arvinger og ti gjenstander. Du kan se gjenstandene, vise interesse og prøve fordelingen. | konkret i stedet for abstrakt |
| Kontakt, h2 | Samme innboks, *ulikt* emne | Hva gjelder henvendelsen? | slagord |
| Kontakt | Begge valgene går til den samme adressen. Emnet er fylt ut på forhånd, så du slipper å forklare … | Begge knappene åpner en e-post til samme adresse, med emnet ferdig utfylt. | kortere |
| Kontakt, h2 | Tre steder du finner svar *med en gang* | Kanskje svaret finnes allerede | mindre salgsaktig |
| Kontakt | Noen spørsmål er det raskere å se svaret på selv enn å vente på en e-post fra oss. | Her finner du svar uten å vente på oss. | kortere |
| Kontakt, h2 | Du skriver til de samme fire som har *bygget* det | Det er vi fire som svarer | slagord |
| Kontakt | Fire personer står bak Arvklart. Det er de samme som leser e-posten din. | E-posten din leses av de fire som har laget Arvklart. | gjentok overskriften |
| Slik fungerer det, del 4 | Tildelingene står registrert i boet, med hvem som får hva. … står oppført som uavklart i stedet for å utelates. | Boet viser hvem som får hva. Dere kan laste ned fordelingen som PDF underveis. Det som ikke er avklart, står for seg, så ingenting faller ut. | kortere, samme påstand |
| Slik fungerer det, slutt h2 | Den raskeste måten å forstå dette på er å *klikke* i det | Prøv eksempelboet selv | kortere |
| Slik fungerer det, slutt | Eksempelboet har 3 arvinger og 10 gjenstander. Du kan utforske … + «Ingen registrering. Du utforsker et offentlig eksempelbo.» | Se gjenstandene, vis interesse og prøv fordelingsmåtene, uten å registrere deg. | tallene og «ingen registrering» sto allerede i sidetoppen |
| Alle sider | kursiv på ett ord i overskriftene | ingen kursiv | se over |
| Innlogging | — | «← Til forsiden» | siden hadde ingen vei tilbake |

Engelsk er oppdatert tilsvarende. Engelsk kan fortsatt ikke indekseres (se
`docs/ny-offentlig-nettside.md` 2.4).

## 6. Teknisk

* `src/site/site.css`: ny palett og typografisk skala, flatene `g-natt`/`g-papir`/`g-lin`/`g-jord`,
  kurvene, rammene, prosessen og filmsonen. Død CSS fra fanene, radfanene og signaturen er fjernet.
* `src/site/Prosess.jsx` (ny) erstatter `src/site/Journey.jsx` (slettet). Testene som pekte på
  `Journey.jsx` (`nettsted.test.js`, `demoContent.test.js`) peker nå på `Prosess.jsx` med samme krav.
* `src/site/Signature.jsx`: rAF-løkken og overgangen er fjernet; filmen og tekstalternativet er uendret.
* `src/site/PageHero.jsx`: kurven under sidetoppen. `SiteLayout.jsx`: den døde `.rules`-streken.
* Ingen nye avhengigheter, skript, eksterne kall eller CSP-endringer. Pauseknappen for ordskiftet
  (WCAG 2.2.2) er uendret, og det er fortsatt den eneste bevegelsen som starter av seg selv.

## 7. Forhåndsvisningen og data

* Vercel-prosjektet `arvklart` har **de samme `VITE_SUPABASE_URL`/`ANON_KEY` for Production og
  Preview**. En forhåndsvisning snakker altså med produksjonsdatabasen.
* «Prøv demo» i forhåndsvisningen kaller `demo-login` i produksjon, som nullstiller demoboet
  (syntetiske data, nullstilles ved hver demoinnlogging uansett). Det er likevel en skriving i prod.
  Demoflyten er derfor testet mot simulert Supabase (`test/e2e/demo.mjs`), ikke i forhåndsvisningen.
* Forhåndsvisningen er beskyttet (Vercel Authentication, alle utrullinger unntatt egne domener), og
  Vercel setter `X-Robots-Tag: noindex` på forhåndsvisninger.
* **Anbefaling:** en egen Supabase-gren eller et testprosjekt for Preview-miljøet, slik at
  forhåndsvisninger aldri kan skrive til produksjon. Det er en endring i Vercel-konfigurasjonen og er
  ikke gjort her.

## 8. Andreas forslag om fremdrift i «Ditt bo»

Egen konseptskisse, ikke implementert: `design-forslag/2-fremdrift-ditt-bo.html`. Kort: mye finnes
allerede (fremdriftslinjen, «Anbefalt nå», «Se hva som gjenstår»), og PR #87 jobber med stegene i
samme oversikt. Forslaget er å gjøre den ene linjen om til fire tellere (gjenstander, ønsker,
fordeling, godkjenning) bygget på tallene `overviewCounts()` allerede regner ut — uten ny logikk
eller nye tabeller, og uten å late som rekkefølgen er fast.
