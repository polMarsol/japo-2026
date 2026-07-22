-- Ejecutar en Supabase -> SQL Editor (ademas de los setups previos, ya
-- aplicados). Crea la tabla para el checklist de equipatge: cada fila es
-- "esta persona ha marcat aquest item" (existencia = marcat; no hi ha
-- booleana, l'ausencia de fila vol dir sense marcar).

create table if not exists packing_checks (
  id text primary key,        -- "<persona>:<item_id>"
  person text not null,
  item_id text not null,
  checked_at timestamptz default now()
);

alter table packing_checks enable row level security;

create policy "auth read/write" on packing_checks
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

alter publication supabase_realtime add table packing_checks;
