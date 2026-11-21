-- Headerens bakgrunnsfarge: #1F221E, den samme som headeren på de offentlige sidene (--natt i
-- src/site/site.css). Toppen av appen og toppen av markedssidene ser da like ut.
--
-- «branding_color» er en verdi per bo, ikke en konstant i koden. Koden er allerede endret, men den
-- slår bare inn der boet ikke har en lagret farge. Alle bo i produksjon har en lagret verdi, så
-- denne migreringen må til for at endringen skal synes på bo som finnes fra før.
--
-- Fargene i databasen i dag (lest 20.11.2026):
--   #1a1410  kolonnens opprinnelige standard (supabase/legacy/01_setup.sql). Demo-boet og 7 andre
--            bo har denne. Ingen har valgt den – den ble satt av databasen.
--   #3A2F26  appens tidligere standard, satt automatisk ved opprettelsen (EstatesPage, wizardEstate).
--            ~12 bo har denne. Ingen har valgt den heller.
--   andre    valgt av administrator under «Merkevare» på /estate/:id/admin. Skal ikke røres.
--
-- Derfor oppdateres bare de to standardverdiene. Et bo med en egen farge beholder sin.
--
-- Nullstillingen av demoen (reset_demo_estate) rører bare «owner_id» på bo-raden, så fargen blir
-- stående mellom demoinnlogginger.

begin;

-- 1. Kolonnens standard, så bo som opprettes utenom appen får den samme fargen
alter table estates alter column branding_color set default '#1F221E';

-- 2. Demo-boet. Eksplisitt på id, så det aldri er tvil om at demoen er med.
update estates
   set branding_color = '#1F221E'
 where id = 'deed0001-0000-0000-0000-000000000001'
   and branding_color in ('#1a1410', '#3A2F26');

-- 3. Bo som aldri har fått en farge valgt av et menneske: begge de historiske standardene.
--    Kjøres med vilje som et eget steg – fjern det hvis eksisterende bo skal beholde fargen sin.
update estates
   set branding_color = '#1F221E'
 where branding_color in ('#1a1410', '#3A2F26');

commit;

-- Tilbakerulling (hvis fargen skal av igjen): sett standarden tilbake og la bo-radene stå, eller
--   alter table estates alter column branding_color set default '#3A2F26';
--   update estates set branding_color = '#3A2F26' where branding_color = '#1F221E';
-- Det siste kan ikke skille bo som har valgt #1F221E selv, fra dem denne migreringen endret.
