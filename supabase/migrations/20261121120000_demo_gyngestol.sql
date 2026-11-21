-- Demoens «Bestemors gyngestol» (face0001): riktig bilde og en beskrivelse som holder seg til det
-- bildet viser.
--
-- Feilen: bildet viste en vanlig stol med fire rette ben, ikke en gyngestol, og beskrivelsen var
-- diktet opp («Eiketre gyngestol fra 1960-tallet, håndlaget av bestefar Per … Original pute med
-- blomstermønster»). Ingenting av det kan ses i bildet, og det bryter med regelen i CLAUDE.md om at
-- demotekstene bare skal beskrive det bildene viser.
--
-- Rettelsen:
--  • Nytt bilde: familiens eget bilde av gyngestolen, gitt til demoen av Bård 21.11.2026, skalert
--    til 600 px og lagret uten metadata (supabase/seed/demo-images/face0001_gyngestol.jpg).
--  • Nytt navn i bøtten: demo__face0001_gyngestol.jpg. Det gamle demo__face0001.jpg røres ikke.
--    Opplastingsskriptet overskriver aldri, og et nytt navn unngår at Smart CDN serverer det gamle
--    bildet fra hurtigbufferen (se APPLIED.md, 20261014).
--  • Ny beskrivelse: bare det som er synlig — mørklakkert tre, dreide spiler, stoppet sete og rygg
--    i lyst mønstret stoff, mørk nakkepute, slitt stoff. Ingen treslag, årstall, opphav eller
--    mønster som ikke kan bekreftes.
--
-- Som 20261109210000_demo_content_fixes.sql endres feltene bare når de fortsatt har den gamle
-- verdien, så en senere rettelse aldri overskrives. Bildet kobles bare til når fila finnes i
-- bøtten: last opp først (supabase/seed/upload_demo_images.mjs face0001_gyngestol --apply, eller i
-- dashbordet under Storage → item-images → deed0001-…, med nøyaktig det filnavnet), og kjør
-- migreringen etterpå — eller kjør den på nytt.
--
-- reset_demo_estate() rører verken tittel, beskrivelse eller bilde, så rettelsen blir stående
-- mellom demoinnlogginger.

begin;

do $$
declare
  v_estate uuid := 'deed0001-0000-0000-0000-000000000001';
  v_item uuid := 'face0001-0000-0000-0000-000000000001';
  v_gammel text := 'Eiketre gyngestol fra 1960-tallet, håndlaget av bestefar Per. Har stått i stua i over 60 år. Original pute med blomstermønster.';
  v_ny text := 'Gyngestol i mørklakkert tre med dreide spiler. Stoppet sete og rygg i lyst, mønstret stoff, og mørk nakkepute. Stoffet er slitt.';
  v_fil text := 'demo__face0001_gyngestol.jpg';
begin
  if not exists (select 1 from public.estates where id = v_estate) then
    raise notice 'Demoboet finnes ikke her – ingenting gjort.';
    return;
  end if;

  -- Beskrivelsen: bare hvis den fortsatt er den oppdiktede
  update public.items
     set description = v_ny
   where id = v_item and estate_id = v_estate and description = v_gammel;

  -- Bildet: bare når fila faktisk ligger i bøtten, og bare hvis gjenstanden fortsatt peker på det gamle
  if exists (select 1 from storage.objects
              where bucket_id = 'item-images' and name = v_estate::text || '/' || v_fil) then
    update public.items
       set image_url = regexp_replace(image_url, 'demo__face0001\.jpg$', v_fil)
     where id = v_item and estate_id = v_estate and image_url like '%demo__face0001.jpg';
    raise notice 'Bildet koblet til: %', v_fil;
  else
    raise notice 'Fant ikke %/% i item-images – bildet er ikke endret. Last opp fila og kjør migreringen på nytt.', v_estate, v_fil;
  end if;
end $$;

commit;

-- Etterkontroll:
--   select title, description, image_url from items where id = 'face0001-0000-0000-0000-000000000001';
--
-- Tilbakerulling:
--   update items set description = 'Eiketre gyngestol fra 1960-tallet, håndlaget av bestefar Per. Har stått i stua i over 60 år. Original pute med blomstermønster.',
--                    image_url = regexp_replace(image_url, 'demo__face0001_gyngestol\.jpg$', 'demo__face0001.jpg')
--    where id = 'face0001-0000-0000-0000-000000000001';
-- og slett raden i schema_migrations.
