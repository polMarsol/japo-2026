-- Ejecutar en Supabase -> SQL Editor (ademas de supabase_setup.sql y
-- supabase_setup_expenses.sql, ya aplicados). Crea las tablas para JipiWise
-- (division de gastos al estilo Splitwise, INDEPENDIENTE de la bolsa comun
-- de la seccion "Gastos"), mismo modelo de RLS que el resto del proyecto.

create table if not exists jipiwise_expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount numeric not null,
  currency text not null default 'EUR',
  category text not null,
  split_method text not null default 'equal',
  payers jsonb not null,     -- [{"name": "Pol", "amount": 12.5}, ...]
  shares jsonb not null,     -- [{"name": "Marc", "amount": 6.25}, ...] (lo que debe cada participante)
  receipt_url text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists jipiwise_settlements (
  id uuid primary key default gen_random_uuid(),
  from_person text not null,
  to_person text not null,
  amount_eur numeric not null,
  created_at timestamptz default now()
);

alter table jipiwise_expenses enable row level security;
alter table jipiwise_settlements enable row level security;

create policy "auth read/write" on jipiwise_expenses
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "auth read/write" on jipiwise_settlements
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

alter publication supabase_realtime add table jipiwise_expenses;
alter publication supabase_realtime add table jipiwise_settlements;

-- Bucket publico para las fotos de recibos (solo referencia visual, sin
-- lectura automatica de importes).
insert into storage.buckets (id, name, public)
  values ('receipts', 'receipts', true)
  on conflict (id) do nothing;

create policy "receipts public read" on storage.objects
  for select using (bucket_id = 'receipts');
create policy "receipts auth insert" on storage.objects
  for insert with check (bucket_id = 'receipts' and auth.uid() is not null);
create policy "receipts auth delete" on storage.objects
  for delete using (bucket_id = 'receipts' and auth.uid() is not null);
