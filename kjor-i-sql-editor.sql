-- Lim inn alt dette i Supabase SQL Editor (prosjekt swmuztsejghweqmaogol) og kjør én gang.
-- Alt kjører i én transaksjon: enten går alt gjennom, eller ingenting.
-- Tilsvarer supabase/migrations/20261120170000_header_farge.sql, pluss raden i schema_migrations
-- slik supabase/README.md krever.

begin;

-- Les tilstanden før, så den står i loggen
select branding_color, count(*) from estates group by 1 order by 2 desc;

-- 1. Kolonnens standard
alter table estates alter column branding_color set default '#1F221E';

-- 2. Demo-boet, eksplisitt på id
update estates
   set branding_color = '#1F221E'
 where id = 'deed0001-0000-0000-0000-000000000001'
   and branding_color in ('#1a1410', '#3A2F26');

-- 3. Bo som står med en av de to historiske standardene.
--    Fjern dette steget hvis eksisterende bo skal beholde fargen sin.
update estates
   set branding_color = '#1F221E'
 where branding_color in ('#1a1410', '#3A2F26');

-- 4. Registrer migreringen
insert into supabase_migrations.schema_migrations (version, name)
values ('20261120170000', 'header_farge');

-- Etterkontroll: demo-boet skal være #1F221E, og #ff0055 skal stå urørt
select branding_color, count(*) from estates group by 1 order by 2 desc;
select name, branding_color from estates where id = 'deed0001-0000-0000-0000-000000000001';

commit;
