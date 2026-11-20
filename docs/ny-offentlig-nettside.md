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

### 2.7 Tomrommet nederst, og overlappen med pauseknappen

**Årsaken ble målt, ikke gjettet.** Et skript leste `padding-bottom` på `.ak`, høyden på
samtykkespørsmålet og avstanden fra bunnteksten til dokumentets slutt, på `/`, `/kontakt` og
`/slik-fungerer-det`, ved 390 og 1440 px, på begge språk, med samtykket ubesvart og avslått:

| | `.ak` padding-bottom | Tomrom under bunnteksten | Bannerets høyde |
|---|---|---|---|
| 390 px, ubesvart | 290 px | 290 px | 235 px |
| 390 px, avslått | 0 px | 0 px | — |
| 1440 px, ubesvart | 260 px | 260 px | 214–235 px |
| 1440 px, avslått | 0 px | 0 px | — |

Det var altså ikke en marg som ble stående etter at banneret lukket seg, ikke `min-height`, ikke
`safe-area-inset` og ingen usynlige elementer: det var regelen
`body:has(.consent-ask) .ak { padding-bottom: 290px/260px }` som jeg selv la inn forrige runde for
å gi bunnteksten plass til å rulles fri.

**Løsningen tar bort behovet for plassen i stedet for å skjule den.** Målingen viste at et
bunnforankret banner i full bredde på mobil dekker *hele* lenkelisten i bunnteksten (8–9 lenker) og
29 px av pauseknappen i heroen. På markedssidene (`.ak`) står spørsmålet derfor nå **øverst**, rett
under den klebrige headeren (74 px, 62 px under 981 px bredde), med `z-index` under headeren (50),
så headeren, den åpne mobilmenyen og «Hopp til innholdet» (999) ligger over. Da dekker det bare
innledende tekst, ingenting trenger å reserveres, og den faste demoknappen kan stå framme mens
spørsmålet vises. `/personvern` og guidene bruker appens utforming og beholder plasseringen nederst,
uendret fra `main`.

Samtykkelogikken, teksten og de to like tydelige valgene er urørt. `CONSENT_VERSION` er ikke økt.

**Kontrollert i 48 kombinasjoner** (360/390/1440 px × norsk/engelsk × `/`, `/slik-fungerer-det`,
`/kontakt`, `/veiviser` × samtykke ubesvart/avslått): reservert plass 0 px, tomrom under
bunnteksten 0 px, og pauseknapp, demo-CTA og bunnmeny fri i alle 48.

### 2.8 Felles header på veiviseren, og «Kontakt» i menyen

`/veiviser` bruker nå den samme header-komponenten som de andre offentlige sidene: `SiteHeader`
eksporteres fra `SiteLayout.jsx` og brukes der — ingen kopi. Veiviserens innhold, meldinger
(`veiviser-ready`, `-context`, `-save`, `-saved`, `-back`, `-navigate`) og adresser er urørt, og
iframen brukes som før fra et bo, ved navigering inne i appen og for engelsk veiviser.

«Tilbake til hjemmesiden» er tatt ut **der headeren står over**, siden logoen og menyen fører samme
vei. To navigasjoner over hverandre tok en tredel av første skjermbilde på mobil, og startkortet
havnet under folden. Inne i et bo (`/estate/:id/guide`) og for innloggede er linjen uendret.

Språkvalget er ærlig: menyen følger brukerens språk, men veiviserens innhold er norsk, og linjen
under headeren sier det på engelsk. Ingen oversettelse er lovet.

«Kontakt» er lagt i hovedmenyen, som er **den samme listen** på brede skjermer og i mobilmenyen.
Fem punkter får plass fra 981 px uten overflyt, uten linjebrudd og uten mindre skrift (29 px fra
siste lenke til «Prøv demo»), så bruddpunktet på 980 px står. Appens og innloggingens header er
ikke rørt.

### 2.9 «Slik fungerer det» bygget om

Siden var 10 403 px høy på PC og 12 235 px på mobil, med åtte seksjoner og mye liten tekst. Den er
nå bygget rundt fire hoveddeler — **6 516 px på PC og 5 776 px på mobil**:

1. Samle gjenstandene
2. Inviter familien og se ønskene
3. Finn en fordeling
4. Se og dokumenter resultatet

Hver del har én overskrift, én kort forklaring og én stor produktvisning. Utdypingene om roller,
fordelingsmåtene, KI-anslag og godkjenning ligger i ett `<details>`-felt per del, lukket fra start,
så hoveddelen leses uten ekstra klikk. Forbeholdene står ved funksjonen de gjelder: KI-anslaget i
del 1, «et manglende svar er ikke et nei» i del 3, BankID i del 4. Ingen faktakolonner, ingen
kursivblokker og ingen gjentatte forklaringer. Ett oljemaleri følger historien.

**Den trinnvise produktvisningen** i del 3 er fire trinn som hver sier hva du gjør og hva som
skjer. Byttet er radioknapper og `:has()` i CSS — ingen automatikk, ingen karusell, ingen bevegelse
som må gå ferdig, og den virker uten JavaScript (trinn 1 står framme). Radioknappen dekker hele
trinnknappen, så fokusringen havner rundt knappen og ingen tabulatorstopp er usynlig. Ruten er like
høy i alle fire trinn (395 px), så siden ikke hopper ved bytte. Piltaster bytter trinn, som i en
radiogruppe.

Brødtekst og forklaringer er minst 16 px på 360 og 390 px, uten avkuttet tekst og uten vannrett
rulling, på begge språk. Ingen hel mobilskjerm i en liten telefonramme: `m-dok.webp` er delt i to
lesbare utsnitt.

### 2.10 Skjermbildene med gyngestolfeilen

Demoens «Bestemors gyngestol» har et foto av en vanlig trestol. Bildene er **beskåret**, ikke
redigert; ingen demodata er endret og ingenting er satt sammen eller tegnet inn.

| Før | Nå | Utsnittet |
|---|---|---|
| `d-laptop.webp` | `d-oversikt.webp` (885×553, 16/10) | Boets oversikt ned til og med filtrene, uten kortradene der gyngestolen lå |
| `d-tablet.webp` | `d-galleri.webp` (400×533, 3/4) | To kolonner fra rad to og ned: bokhylle, oljemaleri, gifteringer, halskjede, familiealbum |
| `f-ettertraktet.webp` | `f-filtre.webp` + `f-flere.webp` | Filterraden, og de to riktige kortene merket «2 vil ha» |
| `m-dok.webp` (hel skjerm) | `m-fordeling.webp` + `m-godkjenning.webp` | To lesbare utsnitt i stedet for en hel mobilskjerm |
| `i-skjema.webp` (hel skjerm) | `i-legg-til.webp` | Utsnittet av skjemaet: bildefeltene og navnefeltet |

De fire ubrukte filene (`d-laptop`, `d-tablet`, `f-ettertraktet`, `fd-ny-lagret`) er slettet.
`test/seo/nettsted.test.js` feiler hvis et bilde mangler eller blir liggende ubrukt.

På smale skjermer brukes `--zoom`-mekanismen som allerede fantes i `site.css`: brede skjermbilder
vises forstørret med uttoning mot høyre i stedet for skrumpet til uleselig skrift.

### 2.11 Roller, opphavsavsnitt og to rettelser

* Rollene er avklart (punkt 5.1) og står likt på forsiden og «Om oss», på begge språk.
  `TEAM` på forsiden var en konstant som kalte `L()` ved import, så rollene ville stått i språket
  siden ble lastet i, også etter språkbytte. Den er nå en funksjon, som `FOLK()`.
* Opphavsavsnittet på «Om oss» er erstattet med den avklarte teksten, oversatt til engelsk med samme
  innhold. Overskriften er kortet til «Slik begynte det.» og andre avsnitt justert, så historien
  ikke gjentar seg. Meta-beskrivelsen for `/om-oss` er oppdatert tilsvarende.
* «Et verdianslag er ikke en takst.» er fjernet fra forsiden (står fortsatt som forbehold ved
  KI-anslaget på «Slik fungerer det», der funksjonen forklares).
* **`Signature.jsx` hadde ingen `L()`-kall**: alt-tekstene og bildeteksten på forsiden sto bare på
  norsk, også i den engelske versjonen. Det var et hull i den engelske dekningen jeg meldte som
  ferdig forrige runde. Rettet.

---

## 3. Testresultater

### Kjørt nå, på `166abaa`, etter alle endringene over

| Suite | Resultat |
|---|---|
| `npm run build` | OK |
| `npm test` | **472 av 472** |
| `npm run test:e2e` (Chromium) | **294 OK, 0 feil** |
| Samtykke, bunntekst og pauseknapp (48 kombinasjoner) | **48 av 48** |
| Meny, bredde og fast demoknapp (18 sjekker) | **18 av 18** |
| Sluttkontroll: uten JavaScript, tastatur, redusert bevegelse, engelsk (29 sjekker) | **29 av 29** |
| JavaScript-budsjettet på offentlige sider | **169,54 kB av 175 kB** gzip |
| `npm run test:db` | **Ikke kjørt her.** Krever Docker, som ikke finnes i dette miljøet. Ingen SQL er endret i denne greina; den kjøres i CI på hver commit |

### Rapportert tidligere, i tidligere runder

Tallene fra runde 1 (466 / 293) og runde 2 (472 / 294) er ikke de samme målingene. Antallet
enhetstester er uendret fra forrige runde, men innholdet er ikke: tester som pekte på tekst og
markering som er fjernet i ombyggingen, er skrevet om (`test/seo/nettsted.test.js`,
`test/seo/httpChecks.mjs`, `test/e2e/a11y.mjs`, `test/e2e/seo.mjs`, `test/e2e/veiviser.mjs`).

**Én test var feil, ikke produktet:** `test/e2e/fixtures.mjs` nullstilte `hs_lang` ved hver
lasting, også etter at språkbyttet laster siden på nytt. Testen av språkbyttet målte derfor bare
den forhåndsrendrede norske HTML-en i det korte øyeblikket før appen tok over — ikke selve byttet.
Oppsettet har nå `resetLang`, og testen venter på at valget faktisk er lagret.

### Hva kontrollene dekker

* **Engelsk**: alle fire sidene har riktig overskrift, tittel, `lang="en"` på innholdet, én
  canonical uten språk i adressen, ingen `hreflang`, og ingen norsk hovedtekst igjen. Språkbytte
  fra bunnteksten gir samme side på det andre språket, overlever oppfriskning og virker ved direkte
  inngang på undersidene.
* **Mobil og desktop, 360 / 390 / 1440 px, på begge språk**: ingen avkuttet tekst, ingen horisontal
  rulling, og demoknappen og «ingen registrering» er synlige i første skjermbilde på forsiden.
* **Faste elementer**: samtykkespørsmålet dekker **ingen** kontroll i noen av de 48 kombinasjonene
  (punkt 2.7). Hele pauseknappen og demo-CTA-en er tilgjengelige mens spørsmålet vises, bunnmenyen
  er fri, den faste demoknappen og spørsmålet overlapper ikke, og det er 0 px tomrom under
  bunnteksten før og etter samtykke.
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

### 5.1 Rollebetegnelsene — avklart 20.11.2026

Titlene er bekreftet av eier og beskriver **arbeidsområder**, ikke formelle roller eller
ansvarsområder. De står likt på forsiden (`src/pages/LandingPage.jsx`, `TEAM()`) og på «Om oss»
(`src/pages/AboutPage.jsx`, `FOLK()`).

| Person | Norsk | Engelsk |
|---|---|---|
| Bård Jakobsen Rinnan | `CEO \| Produkt og marked` | `CEO \| Product and Marketing` |
| Andrea Hufthammer Vik | `COO \| Drift og fremdrift` | `COO \| Operations and Delivery` |
| Ørjan Westre | `Teknologi og økonomi` | `Technology and Finance` |
| Julie Tvedt | `Brukeropplevelse og piloter` | `User Experience and Pilots` |

`TEAM` på forsiden var en konstant som kalte `L()` ved import, så rollene ville stått i det språket
siden ble lastet i, også etter språkbytte. Den er nå en funksjon, som `FOLK()` på «Om oss».

### 5.2 Skjermbildene — løst ved beskjæring, men rotårsaken står igjen

Bildene som viste «Bestemors gyngestol» med et foto av en vanlig trestol, er byttet ut med utsnitt
uten den gjenstanden (punkt 2.10). Ingen demodata er endret og ingen skjermbilder er manipulert.

**Rotårsaken står igjen, og hører hjemme i en egen endring:** `face0001` heter «Bestemors
gyngestol» og beskrives som en gyngestol i `supabase/seed/demo_estate.sql:100`, mens fotoet i
lagringen viser en vanlig stol. Det bryter med repoets egen regel om at demotekstene bare skal
beskrive det bildene viser. Rettingen er enten nytt foto eller ny tittel — og den krever en
migrering, som er utenfor denne oppgaven.

Så lenge rotårsaken står, kan ikke nye skjermbilder tas fra et galleri som viser hele boet, og
`i-legg-til.webp` viser skjemaets egen plassholdertekst «f.eks. Bestemors gyngestol». Det er appens
faktiske grensesnitt, ikke et feil bilde.

**Trenger ikke byttes:** gitarens kategori («Sigma akustisk gitar» under «Elektronikk») er **ikke
synlig** i noe skjermbilde. Galleriet viser tittel, pris og hvem som ønsker gjenstanden, ikke
kategori.

### 5.3 Engelsk indeksering — avklart 20.11.2026: egen oppfølging

Den fulle engelske versjonen beholdes. Egne engelske adresser og indeksering er en **egen sak**, og
rutingen er ikke utvidet i denne runden. Begrensningen med dagens språkvalg står i punkt 2.4:
begge språk ligger på samme adresse, det finnes én canonical og ingen `hreflang`, den
forhåndsrendrede HTML-en er norsk, og engelsk kan derfor ikke indekseres.

### 5.4 Forretningsadressen — avklart 20.11.2026: ikke nå

Verifisert selskapsnavn, organisasjonsnummer og e-postadresse står. `Tertnesgrenden 13, 5113
Tertnes` er **ikke** lagt inn som ny synlig kontaktopplysning i denne runden.

### 5.5 `CONSENT_VERSION` er ikke økt

Ordlyden i samtykkespørsmålet og listen i personvernerklæringen er rettet (de nevnte fire sider;
det er nå seks pluss guidene). **Formål, mottakere, lagringstid og samtykkestyring er uendret** —
teknisk kontrollert over: samme GA4-container, samme samtykkemodus, samme `localStorage`-nøkkel,
samme sletting av `_ga` ved avslag, samme avgrensning til offentlige sider. Derfor er
`CONSENT_VERSION` ikke økt, og ingen blir spurt på nytt.

Dette er en teknisk konklusjon, ikke en juridisk. **Vil dere at alle skal spørres på nytt, er det
én linje.**

### 5.6 Overlappen med pauseknappen — løst

Den gjenstående overlappen ved 390 px er borte: samtykkespørsmålet står nå øverst på markedssidene,
og hele pauseknappen er tilgjengelig mens det vises. Se punkt 2.7 for målingene.

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
