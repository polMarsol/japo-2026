-- Ejecutar en Supabase -> SQL Editor (además del supabase_setup.sql ya
-- aplicado). Crea las tablas para la seccion de Gastos comunes (bolsa
-- compartida + registro de gastos), mismo modelo de RLS que el resto.

create table if not exists expense_pool (
  id text primary key,
  total numeric not null default 0,
  updated_at timestamptz default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null,
  currency text not null default 'EUR',
  category text not null,
  payer text not null,
  notes text,
  created_at timestamptz default now()
);

alter table expense_pool enable row level security;
alter table expenses enable row level security;

create policy "auth read/write" on expense_pool
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "auth read/write" on expenses
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

alter publication supabase_realtime add table expense_pool;
alter publication supabase_realtime add table expenses;

insert into expense_pool (id, total) values ('main', 0)
  on conflict (id) do nothing;
