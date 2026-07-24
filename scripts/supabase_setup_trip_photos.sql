-- Ejecutar en Supabase -> SQL Editor (ademas de los scripts anteriores ya
-- aplicados). Crea la tabla y el bucket para el album de fotos del viaje
-- (una foto por dia + lugar, subida por cualquier viatger), mismo modelo de
-- RLS y de storage publico que ya usa supabase_setup_jipiwise.sql.

create table if not exists trip_photos (
  id uuid primary key default gen_random_uuid(),
  day text not null,
  place text not null,
  uploaded_by text,
  url text not null,
  created_at timestamptz default now()
);

alter table trip_photos enable row level security;

create policy "auth read/write" on trip_photos
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

alter publication supabase_realtime add table trip_photos;

-- Bucket public per a les fotos del viatge.
insert into storage.buckets (id, name, public)
  values ('trip-photos', 'trip-photos', true)
  on conflict (id) do nothing;

create policy "trip-photos public read" on storage.objects
  for select using (bucket_id = 'trip-photos');
create policy "trip-photos auth insert" on storage.objects
  for insert with check (bucket_id = 'trip-photos' and auth.uid() is not null);
create policy "trip-photos auth delete" on storage.objects
  for delete using (bucket_id = 'trip-photos' and auth.uid() is not null);
