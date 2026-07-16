-- Ejecutar en Supabase -> SQL Editor. Crea las tablas para el modo admin
-- de la PWA (reservas, fotos, texto del itinerario) con RLS abierta a
-- cualquier usuario autenticado (incluida la auth anonima que usa la app).

create table if not exists reservation_overrides (
  id text primary key,
  concept text,
  status_key text,
  cost_total numeric,
  cost_per_person numeric,
  notes text,
  link text,
  deleted boolean default false,
  updated_at timestamptz default now()
);

create table if not exists custom_reservations (
  id uuid primary key default gen_random_uuid(),
  date text,
  concept text not null,
  link text,
  status_key text default 'unknown',
  cost_total numeric,
  cost_per_person numeric,
  responsible text,
  notes text,
  notes_link text,
  created_at timestamptz default now()
);

create table if not exists photo_overrides (
  place text primary key,
  file text not null,
  credit text,
  license text,
  source_title text,
  updated_at timestamptz default now()
);

create table if not exists day_text_overrides (
  id text primary key,
  overrides jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table reservation_overrides enable row level security;
alter table custom_reservations enable row level security;
alter table photo_overrides enable row level security;
alter table day_text_overrides enable row level security;

create policy "auth read/write" on reservation_overrides
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "auth read/write" on custom_reservations
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "auth read/write" on photo_overrides
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "auth read/write" on day_text_overrides
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

alter publication supabase_realtime add table reservation_overrides;
alter publication supabase_realtime add table custom_reservations;
alter publication supabase_realtime add table photo_overrides;
alter publication supabase_realtime add table day_text_overrides;
