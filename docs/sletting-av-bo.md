# Sletting av bo og kundekontoer

Dette dokumentet beskriver hvordan Arvklart sletter et bo eller en kundekonto, hva som skjer med hver del av dataene, rutinen for en forespørsel og et **forslag** til lagringstider. Lagringstidene er ikke vedtatt. Det finnes ingen automatisk sletting, og ingen tekst i appen eller personvernerklæringen lover en frist.

## Hvem kan slette hva

| Hva | Hvem | Hvor |
|---|---|---|
| Egen konto | Kunden selv | «Min konto» (`/konto`, edge-funksjonen `delete-account`) |
| Et helt bo | Bare founders (nettstedets administratorer) med tofaktor | Founder-dashboardet `/founder` → fanen «Sletting (GDPR)» (søk) eller «Boer» → «Slett …» (`founder-delete`) |
| En kundekonto | Bare founders med tofaktor | `/founder` → «Sletting (GDPR)» (søk) eller «Brukere» → «Slett …» (`founder-delete`) |

Fanen **«Sletting (GDPR)»** i `/founder` samler alt: om slettefunksjonen er rullet ut (ellers vises kommandoen), at automatisk sletting ikke er i drift, søk etter bo og kontoer, rutinen under, sletteloggen (med «Prøv igjen» på slettinger som ikke ble fullført), avsluttede bo og forslaget til lagringstider. Dataene kommer fra `founder-delete` (`{ action: 'overview' }`), fordi `founder_audit_log` bare kan leses med service role.

Administratoren av et bo kan ikke slette boet selv. Hen ber om det på admin@arvklart.no, slik personvernerklæringen sier.

## Rutine for en forespørsel om sletting

1. **Kontroller forespørselen.**
   - Bo: forespørselen kommer fra en administrator av boet, fra e-postadressen på kontoen. Personvernerklæringen lover at dette sjekkes før noe slettes.
   - Konto: forespørselen kommer fra kontoens e-postadresse. Ellers bekreftes den ved å svare til den adressen.
2. **Varsle de andre medlemmene ved behov.** Når et delt bo skal slettes, bør administratoren gi beskjed og la de andre laste ned protokollen først. Slettingen gjelder alle, og den kan ikke angres.
3. **Slett i `/founder` (krever tofaktor i økten).** Dialogen viser først hva som slettes. Slettingen skjer bare når du skriver boets navn eller kontoens e-post. Demoboet, demokontoene, din egen konto og andre founders kan ikke slettes her.
4. **Svar kunden innen én måned** (art. 12 nr. 3). Si at dataene er slettet fra tjenesten, og at de forsvinner fra sikkerhetskopiene når de roterer ut.
5. **Kontroller loggen** i fanen «Sletting (GDPR)», eller i SQL Editor:

   ```sql
   select created_at, action, details->>'status' as status, details
   from founder_audit_log
   where action in ('delete_estate', 'delete_user')
   order by created_at desc;
   ```

   - `status = 'ok'`: slettingen er fullført.
   - `failed` eller `started`: noe sto igjen. Prøv igjen fra dashboardet. Slettingen er idempotent: det som allerede er slettet, hoppes over, og det som står igjen, er urørt.

Loggen inneholder bare id-er og antall, ingen navn, e-post, titler eller filstier. Den viser at slettingen er gjort (ansvar etter art. 5 nr. 2) og kan bare leses i fanen «Sletting (GDPR)» (via edge-funksjonen) og i SQL Editor.

## Hva som slettes med et bo

Et bo slettes i tre trinn (`deleteEstate` i `supabase/functions/_shared/estateFiles.ts`):

1. **Filene.** Det gjelder boets mapper (`item-images/<bo-id>/`, `estate-docs/documents/<bo-id>/`) og filer boet refererer til utenfor mappene: eldre bilder under `items/`, logo og eldre dokumenter. **En fil som også brukes av et annet bo, slettes ikke** (`withoutSharedFiles`). Mappene sjekkes på nytt etter slettingen. Står noe igjen, stoppes slettingen før databasen røres.
2. **Tilbakemeldinger** knyttet til boet (`feedback.estate_id` er `on delete set null`, så de slettes uttrykkelig).
3. **Boet.** Resten går med via fremmednøklene:

| Tabell | Kobling | Ved sletting av boet | Persondata |
|---|---|---|---|
| `estate_members` | `estate_id` cascade | slettes | hvem som er med |
| `heirs` | `estate_id` cascade | slettes (sperren `guard_heir_change` slipper gjennom når boet slettes) | navn, e-post, relasjon, andel |
| `heir_representatives` | `estate_id` cascade | slettes | fullmakt/verge med grunnlag |
| `items` | `estate_id` cascade | slettes | titler, beskrivelser, bilder, verdiforslag med navn |
| `interests`, `item_passes`, `comments` | `item_id` cascade | slettes | ønsker med begrunnelse, «nei takk», kommentarer |
| `categories`, `tasks`, `chores`, `goodwill_log` | `estate_id` cascade | slettes | lite (hvem som fullførte) |
| `documents` | `estate_id` cascade | slettes (filene i trinn 1) | dokumenter |
| `estate_events` | `estate_id` cascade | slettes | fordelingsloggen |
| `distribution_versions` → `distribution_responses` | `estate_id` / `version_id` cascade | slettes (uforanderligheten gjelder bare endring, ikke sletting) | godkjenninger med navn og e-post |
| `feedback` | `estate_id` set null | **slettes i trinn 2** | tilbakemeldingstekst |
| `ai_usage` | `estate_id` set null | **blir stående uten bo**, slettes med kontoen | antall, kostnad, ingen bilder eller tekst |
| `founder_audit_log` | ingen kobling til bo | blir stående | bare id-er og antall |
| Kontoene (`auth.users`, `profiles`) | ingen | **blir stående** | medlemmene kan ha andre bo |

Dette er testet mot ekte Postgres i `test/db/cleanup.mjs`, med tildeling til person, logg, godkjenningsversjon med svar, fullmakt og AI-bruk. Det er også testet mot den simulerte klienten i `test/functions/founderDelete.test.js` og `estateFiles.test.js`.

## Hva som slettes med en kundekonto

Det er den samme slettingen som når kunden sletter kontoen selv (`deleteAccountData` i `supabase/functions/_shared/deleteAccount.ts`, beskrevet i personvernerklæringen):

- Bo kunden er alene om, slettes som over.
- I delte bo fjernes navnet fra det kunden har lagt inn, og administratorrollen og eierskapet gis videre.
- Profil, ønsker, «nei takk», kommentarer, tilbakemeldinger og medlemskap slettes.
- AI-bruken slettes av databasen (`on delete cascade`).
- Fordelingsloggen anonymiseres.

## Sikkerhetskopier

Supabase tar sikkerhetskopier av databasen. Slettede data ligger der til kopiene roterer ut (tiden avhenger av planen; se Supabase-dashbordet → Database → Backups). Kopiene kan ikke redigeres, så slettingen fra dem skjer ved at de utløper. Dette står i personvernerklæringen.

**Ved gjenoppretting fra en sikkerhetskopi** kommer slettede bo og kontoer tilbake. Kjør da slettingene på nytt fra `founder_audit_log` (alle `delete_estate`/`delete_user` med `status = 'ok'` etter tidspunktet for kopien) før tjenesten åpnes igjen.

Storage (bilder og dokumenter) har ingen sikkerhetskopi i Arvklart. En slettet fil er borte.

## Automatisk sletting (ikke i drift)

`cleanup-closed-estates` kan slette bo som har vært avsluttet lenger enn en lagringstid. Den er ikke i drift, og den har ingen standard lagringstid: uten hemmeligheten `CLOSED_ESTATE_RETENTION_MONTHS` (heltall 1–120) nekter den å kjøre, også som dry run (`503 retention_not_configured`). Før den settes i drift, må fire ting være på plass:

1. Lagringstiden er vedtatt (se forslaget under).
2. Personvernerklæringen er oppdatert med fristen.
3. Det er utpekt en ansvarlig, med kontrollintervall for `cleanup_runs`.
4. Det er bestemt om administratoren skal varsles før boet slettes.

## Forslag til lagringstider (ikke vedtatt)

Grunnlaget er dataminimering og lagringsbegrensning (art. 5 nr. 1 bokstav c og e), retten til sletting (art. 17) og ansvarsprinsippet (art. 5 nr. 2). Arvklart er behandlingsansvarlig for kontoene og tjenesten. Innholdet i et bo registreres av familien, og behandlingen bygger på avtalen med kunden (art. 6 nr. 1 bokstav b).

| Datakategori | Forslag | Begrunnelse | Rettslig grunnlag |
|---|---|---|---|
| Konto og profil | Til kunden sletter kontoen. Forslag: varsle etter 24 måneder uten innlogging, slette etter 3 måneder til | Kontoen trengs så lenge kunden bruker tjenesten. Inaktive kontoer bør ikke ligge for alltid (art. 5 nr. 1 e) | Avtale (6 nr. 1 b) |
| Aktivt bo (innhold, bilder, dokumenter) | Så lenge boet er i bruk | Formålet er arveoppgjøret | Avtale (6 nr. 1 b) |
| Avsluttet bo | Forslag: 12 måneder etter avslutning, med varsel til administratoren 30 dager før | Familien kan trenge protokollen og bildene en tid etter oppgjøret (tvister, skatt, spørsmål). Ett år er et vanlig kompromiss. Protokollen kan lastes ned før boet slettes | Avtale; berettiget interesse (6 nr. 1 f) for tiden etter avslutning |
| Fordelingslogg og godkjenninger | Som boet | Dokumentasjon av oppgjøret for familien; har ingen verdi utenfor boet | Som boet |
| AI-bruk (`ai_usage`) | Forslag: 13 måneder, så aggregeres eller slettes radene; slettes alltid med kontoen | Kvoter og misbruk krever kort historikk; kostnadsstatistikk trenger ikke bruker-id over tid | Berettiget interesse (6 nr. 1 f) |
| Tilbakemeldinger | Forslag: 24 måneder, eller til kontoen eller boet slettes | Produktforbedring | Berettiget interesse |
| `founder_audit_log` (bare id-er og antall) | Forslag: 5 år | Viser at slettinger og tilgang er gjennomført (art. 5 nr. 2). Inneholder ingen navn eller e-post | Rettslig forpliktelse (ansvar) og berettiget interesse |
| `cleanup_runs` | Forslag: 5 år | Som over | Som over |
| Sikkerhetskopier | Leverandørens rotasjon (Supabase-plan) | Kan ikke slettes selektivt; rutinen for gjenoppretting står over | Art. 32 (sikkerhet) |
| Betalings- og fakturagrunnlag (når betaling innføres) | 5 år etter regnskapsårets slutt | Bokføringsloven § 13 første ledd. Gjelder Arvklarts egne regnskapsopplysninger, ikke innholdet i boene | Rettslig forpliktelse (6 nr. 1 c) |

**Særlov.** Arveloven og skifteloven pålegger arvingene, ikke Arvklart, å ta vare på dokumentasjon av et privat skifte. Arvklart har derfor ingen egen plikt til å oppbevare boets innhold, og familien må laste ned protokollen før boet slettes. Bokføringsloven gjelder bare Arvklarts egne regnskapsopplysninger.

**Krever juridisk vurdering, hvis det blir aktuelt:**

1. Om Arvklart er databehandler for familien, ikke behandlingsansvarlig, for innholdet i boene. Det påvirker hvem som bestemmer lagringstiden.
2. Om én administrator kan be om sletting av et delt bo når andre arvinger motsetter seg det.

## Åpne valg for Arvklart

- Vedta lagringstidene over, eller endre dem, og oppdater personvernerklæringen før noen frist settes i drift.
- Utpek en ansvarlig for forespørsler om sletting og for å kontrollere `founder_audit_log` og `cleanup_runs`.
- Sjekk og noter hvor lenge Supabase oppbevarer sikkerhetskopiene på planen dere har.
- Bestem om delte bo bare skal slettes når alle medlemmene samtykker.
