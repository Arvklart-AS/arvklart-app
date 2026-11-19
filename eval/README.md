# Kalibrering av verdianslaget

Kjører bildeanalysen og verdianslaget med nøyaktig samme prompt, skjema, validering og regler som `analyze-item` og
`estimate-value` (koden importeres fra `supabase/functions/_shared/`), mot gjenstander med kjent pris. Kaller bare
Anthropic, aldri Supabase.

Data og bilder legges **aldri** i repoet (`eval/data/` er ignorert). En datamappe har `testsett.json` og
`bilder/<nr>_<finnkode>_<n>.jpg`.

```bash
# Node 22.18+ (leser TypeScript direkte). Ingen npm-pakker trengs.
export ANTHROPIC_API_KEY=…                                   # aldri i repoet eller i chat
node eval/verdi.mjs eval/data/finn                            # viser anslått kostnad
node eval/verdi.mjs eval/data/finn --prøv                     # to gjenstander
node eval/verdi.mjs eval/data/finn --bekreft --runder 2       # hele settet, to runder
node eval/rapport.mjs eval/data/finn/resultat-*.json          # rapport
```

Valg: `--modell claude-haiku-4-5` (sammenligning), `--innsats medium` (bildeanalysen), `--ut fil.json`.

Tre veier per gjenstand: **bilde** (bare bilder, som «Legg til flere»), **bilde+familie** (samme analyse og det
familien vet: type, merke, detaljer, tilstand) og **tekst** (det familien vet, uten bilder). Prisen og annonsens
fritekst sendes aldri.

Fasiten i FINN-settet er annonsert pris da annonsen ble markert solgt, ikke avtalt sluttpris, og én annonse er ett
salg, ikke markedsverdien. Med 20 gjenstander er tallene retningsgivende, ikke statistisk sikre.
