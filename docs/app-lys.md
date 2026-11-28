# Appen og demoen i det nye uttrykket — lyse arbeidsflater, smaragd topplinje

Videreføring av nettsidens uttrykk (designdemo v4, `docs/nettside-v4.md`) til den innloggede appen og den
interaktive demoen. **En visuell oppdatering**: ingen endring i funksjoner, brukerreiser, fordelingslogikk,
tilgangsregler, roller, database, autentisering, juridiske formuleringer eller demoens innhold.

Demoen er appen, logget inn som demokontoen. Den har ingen egne stiler, så den følger med automatisk.

---

## 1. Designvalg

| Valg | Hvorfor |
|---|---|
| **Lyse arbeidsflater** (silke `#F1F3EA`, kort i naturhvit `#FCFCF9`) | Appen er et arbeidsverktøy for folk i 50-, 60- og 70-årene. Mørk bakgrunn med lys tekst er tyngre å lese over tid, særlig med nedsatt syn, og bildene av gjenstandene (det viktigste i appen) ser mer naturlige ut på lys bakgrunn. |
| **Smaragd topplinje** (`#1B3527`) | Samme mønster som nettsiden: smaragd øverst, lyst innhold under. Navigasjonen er alltid på samme sted og i samme farge. |
| **Én smaragdflate i arbeidsflaten**: «Anbefalt nå» | Den ene handlingen appen anbefaler, får samme materiale som heroen på nettsiden. Resten er lyst, så det ikke konkurrerer. |
| **Ingen bakgrunnseffekter** | Ingen gradienter, korn eller lys i arbeidsflatene (det mørke uttrykket hadde et varmt lys øverst og rammelinjer). Konsentrasjon går foran stemning. |
| **Primær = fylt smaragd, sekundær = kontur** | I den mørke appen var primær en fylt lin-knapp og sekundær en mørk knapp med svak kant. Lyst ville sekundær blitt hvitt på hvitt; konturen er derfor hevet til 3:1. |
| **Deaktiverte knapper kan leses** (`#5E6A61`, lin tekst 5,1:1) | Mørkt ble «deaktivert» en svak tone med lin tekst. Lyst ble det lin tekst på nesten hvitt — uleselig. En eldre bruker skal kunne lese hva knappen gjør, også før den kan trykkes. |
| **«Vil ha» og «Nei takk» like sterke** | Begge med farget kant og tekst, like store. Arvklart skal ikke dytte mot «Vil ha». Valgt tilstand vises alltid med tekst («Du er interessert – klikk for å angre»), ikke bare farge. |
| **Lyse menyer under topplinjen** | Kontomenyen og Arvklart-menyen er hvite paneler med tydelig skygge. Tekststørrelse-valget står der. |
| **Varmt demobanner** (`#EFE4D3`) | Var granskog, nesten likt topplinjen. Nå skiller opplysningen seg fra navigasjonen. Teksten og størrelsen er uendret (sveipetestene krever at knappene synes på små telefoner med banneret). |
| **Ingen hover-løft** | Som på nettsiden: fargen skifter, knappen flytter seg ikke. |
| **Litt større forklaringstekst på oversikten** (14–15 px, var 13–14) | Bare der det ikke endrer layouten. Resten dekkes av «Tekststørrelse» i kontomenyen (Normal / Stor / Ekstra stor). |

## 2. Hvordan omleggingen er gjort

Appen hadde ingen fargetokens i sidene: ~2 000 hardkodede farger i ~45 filer, nesten alle fra den mørke paletten
(ni verdier dekket ~85 %). Samme farge betydde ulike ting etter hvor den sto: lin `#F2EEE6` er tekst i `color`, men en
fylt primærknapp i `background`. Omleggingen er derfor gjort **etter CSS-egenskap**: for hver fargeverdi ble
egenskapen foran slått opp (inline style, CSS-tekst, props og semantiske nøkler som `text:`/`bg:`), og fargen mappet
etter om den er tekst, bakgrunn eller kant/skygge. Ukjent egenskap ble ikke endret, men gått gjennom for hånd.

| Mørk | Som tekst | Som bakgrunn | Som kant/skygge |
|---|---|---|---|
| `#F2EEE6` lin | `#2A1D14` blekk | `#24392A` smaragd | `#24392A` |
| `#B9B4A8` lin dempet | `#4F463A` dempet | `#4F463A` | `rgba(42,29,20,.5)` |
| `#1F221E` natt | `#F4F2EB` (tekst på smaragd) | `#F1F3EA` side | `#F1F3EA` |
| `#272A25` flate | — | `#FCFCF9` flate | `#FCFCF9` |
| `#30342D` flate høy | — | `#EEF1E6` | `#EEF1E6` |
| `#9DAA8C` mose | `#2F573E` jade | `#2F573E` | `#2F573E` |
| `#C79A6B` messing lys | `#6E4A2A` | `#8A5A34` | `#8A5A34` |
| `#E08A7A` rust lys | `#9A3B2E` | `#9A3B2E` | `#9A3B2E` |
| `rgba(242,238,230,a)` | `rgba(79,70,58,≥.8)` | `rgba(42,29,20,a·.8)` | `rgba(42,29,20,a)`, ≥ .3 → .5 |

Deretter for hånd: `estateThemeCss.js` (oversikten og galleriet), `App.jsx` (skallet og demobanneret), `TopBar.jsx`
(topplinjen beholder lys tekst; menyene ble lyse), deaktiverte knapper (16 steder), sekundærknappenes kant
(47 steder), sveipeknappene, statusfargene i «Analyse», og forhåndsvisningen av «Merkevare» på admin-siden (lys
tekst på bo-fargen, som den ekte toppmenyen).

**Ikke endret:** `branding_color: '#1F221E'` i `EstatesPage.jsx`/`AdminPage.jsx` er standardverdien som *lagres* for
nye bo (data, ikke visning). Avatarfargene og mappefargene er identitetsfarger. Kameraet (`CameraCapture`), founder-
sidene, veiviseren, guidene og PDF-ene har sitt eget oppsett.

Sidene for utloggede (innlogging, nytt passord, invitasjon/oppsett av profil, personvern) er flyttet fra den eldre
lyse produktpaletten (`#F5F2EB`, `#2F4A43`, `#1F2326`) til appens, så overgangen fra innlogging til appen er sømløs.

## 3. Demospeilet og skjermbildene på nettsiden

`scripts/demospeil.mjs` kjører **den ekte appen med demoens innhold** — gjenstandene og beskrivelsene fra
`supabase/seed/demo_estate.sql`, ønskene og begrunnelsene fra `reset_demo_estate()` og bildene i
`supabase/seed/demo-images/` — mot en **simulert** Supabase (samme oppsett som e2e-testene). Ingen kall går til
produksjonen, ingen demo-innlogging kjøres, og demoboet nullstilles ikke. Mona (administrator, demokontoen med
banneret) og Kari (arving uten administratorrolle) kan begge åpnes.

* `node scripts/demospeil.mjs <url> <mappe>` tar skjermbilder av ti sentrale visninger, som Mona og Kari, PC og mobil.
* `node scripts/nettsidebilder.mjs <url> <mappe>` tar de ni produktutsnittene på nettsiden, avgrenset av elementer i
  appen, så de blir like neste gang. `python3 -I scripts/til-webp.py <mappe> public/nettsted` lager WebP uten metadata.
* Begrensning: speilet er demoboet *slik det står i repoet*. Er noe endret direkte i produksjonsdatabasen, vises det
  ikke her. Det er ikke kontrollert, fordi produksjonen ikke skal leses eller røres fra dette arbeidet. Maleriets verdi
  er satt til 4 000 kr, som i demoen slik den er vist på nettsiden (seed-filen har et eldre tall).

Nye bilder: `i-legg-til`, `f-flere`, `f-filtre`, `j-svar`, `j-onsker`, `p-metoder`, `m-fordeling`, `m-godkjenning`,
`j-verdi`. `f-flere` viser nå gyngestolen og maleriet (var maleriet og albumet), og alt-tekstene er rettet etter det.
Rammen rundt bildene på nettsiden er gjort om til et lite «appvindu» (smal smaragdlist øverst, som topplinjen).

**Ikke oppdatert:** produktfilmene (`forsidefilm-*.mp4`, `produktvideo.mp4`) og plakatene deres viser fortsatt det
mørke grensesnittet. De må tas opp på nytt med samme manus; det er ikke gjort her. `m-veiviser.webp` (veiviseren) og
`p-rapport.webp` (PDF-en) er uendret, fordi de ikke er endret.

## 4. Testing

* `npm test`: 557/557. `npm run build`: OK.
* `npm run test:e2e`: alle filer grønne etter to rettinger e2e fant (se under).
* axe (WCAG 2.2 A/AA) i demospeilet: 20 appvisninger × Mona/Kari × 1280/390 px = 80 kjøringer, 0 brudd, ingen vannrett
  rulling, ingen JS-feil.
* Funnet og rettet av e2e: kontrast i forhåndsvisningen av «Merkevare» (admin), og at sveipeknappene havnet under
  folden på små telefoner med «Ekstra stor» tekst etter at banneret og knappene var gjort større. Størrelsene er
  tilbake til det testene krever.
* Visuell kontroll av oversikten, galleriet, gjenstandssiden (som administrator og arving), «Legg til», sveiping,
  løsningsmetodene, fordelingen, godkjenning, arvingene, «Ingen vil ha», «Hva gjenstår», «Analyse», «Mine bo», kontomenyen
  og tildelingsdialogen, på PC og mobil.
