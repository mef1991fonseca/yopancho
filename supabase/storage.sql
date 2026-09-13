-- YoPancho — almacenamiento de archivos (fotos y video de promos)
-- Pegá todo este archivo en: tu proyecto de Supabase → SQL Editor → New query → Run
-- Es seguro volver a correrlo si ya lo habías hecho antes.

-- Crea el "bucket" (carpeta de archivos) público llamado "media".
-- Público significa que cualquiera con el link puede VER el archivo (necesario
-- para que las fotos/videos se vean en la tienda) — pero no puede subir ni
-- borrar nada sin estar logueado como admin, por las políticas de abajo.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Limpiamos políticas de una corrida anterior de este script, si existían.
drop policy if exists "media_select_public" on storage.objects;
drop policy if exists "media_insert_admin_only" on storage.objects;
drop policy if exists "media_delete_admin_only" on storage.objects;

create policy "media_select_public" on storage.objects
  for select using (bucket_id = 'media');

create policy "media_insert_admin_only" on storage.objects
  for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "media_delete_admin_only" on storage.objects
  for delete using (bucket_id = 'media' and auth.role() = 'authenticated');
