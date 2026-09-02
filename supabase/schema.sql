-- YoPancho — esquema de base de datos para Supabase
-- Pegá todo este archivo en: tu proyecto de Supabase → SQL Editor → New query → Run

create table if not exists kv_store (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Row Level Security: lo activamos porque Supabase lo recomienda siempre,
-- pero dejamos policies abiertas de lectura/escritura para el rol "anon".
-- Esto es necesario porque tanto el cliente (que hace pedidos sin loguearse)
-- como el panel admin (protegido hoy solo por PIN) usan la misma clave
-- pública para hablar con la base. Es aceptable para el tamaño de este
-- proyecto, pero es la razón por la que reemplazar el PIN por un login real
-- sigue figurando como pendiente en la propuesta: mientras tanto, cualquiera
-- que tenga la URL del proyecto podría, en teoría, leer o escribir esta
-- tabla directamente (no solo a través de la app).
alter table kv_store enable row level security;

create policy "Lectura pública" on kv_store
  for select using (true);

create policy "Escritura pública" on kv_store
  for insert with check (true);

create policy "Actualización pública" on kv_store
  for update using (true);

create policy "Borrado público" on kv_store
  for delete using (true);

-- Índice para las búsquedas por prefijo que usa storage.list()
create index if not exists kv_store_key_prefix_idx on kv_store (key text_pattern_ops);
