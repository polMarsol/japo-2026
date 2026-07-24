-- Ejecutar en Supabase -> SQL Editor (ademas de los setups previos, ya
-- aplicados). Crea la tabla para la fitxa medica basica per viatger: grup
-- sanguini i al·lergies a medicaments, una fila per persona (upsert).

create table if not exists medical_info (
  person text primary key,
  blood_type text not null default '',
  allergies text not null default '',
  updated_at timestamptz default now()
);

alter table medical_info enable row level security;

create policy "auth read/write" on medical_info
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

alter publication supabase_realtime add table medical_info;
