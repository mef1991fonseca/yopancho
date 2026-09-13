-- YoPancho — esquema de base de datos para Supabase
-- Pegá todo este archivo en: tu proyecto de Supabase → SQL Editor → New query → Run
--
-- Si ya habías corrido una versión anterior de este script, este es seguro
-- de volver a correr: borra y recrea solo las políticas de seguridad, sin
-- tocar la tabla ni los datos que ya tengas cargados.

create table if not exists kv_store (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table kv_store enable row level security;

-- Limpiamos políticas de una versión anterior de este script, si existían.
drop policy if exists "Lectura pública" on kv_store;
drop policy if exists "Escritura pública" on kv_store;
drop policy if exists "Actualización pública" on kv_store;
drop policy if exists "Borrado público" on kv_store;

-- LECTURA: pública para todo. La tienda necesita leer el menú sin login, y
-- el cliente necesita poder buscar su propio pedido por número + teléfono
-- sin loguearse. (Nota de privacidad: esto significa que, en teoría,
-- cualquiera con la clave pública del proyecto podría leer la lista
-- completa de pedidos —incluyendo nombre y teléfono de otros clientes—
-- directamente por API, no solo a través de la app. Achicar esto del todo
-- requeriría mover esa lectura detrás de una función propia del servidor;
-- queda anotado como una mejora de privacidad a futuro, no bloqueante para
-- este tamaño de proyecto.)
create policy "kv_store_select_public" on kv_store
  for select using (true);

-- ESCRITURA de pedidos y numeración: pública, porque el cliente crea su
-- pedido sin loguearse. El panel admin (ya autenticado) también escribe acá
-- para actualizar el estado del pedido (Nuevo → Preparando → Listo…).
create policy "kv_store_write_orders" on kv_store
  for insert with check (key in ('orders-list', 'order-counter'));

create policy "kv_store_update_orders" on kv_store
  for update using (key in ('orders-list', 'order-counter'));

-- ESCRITURA del menú: SOLO administradores logueados. Antes de esto,
-- cualquiera con la clave pública podía editar precios o el menú completo
-- sin pasar por el panel — ahora hace falta haber iniciado sesión.
create policy "kv_store_write_menu_admin_only" on kv_store
  for insert with check (key = 'menu-catalog' and auth.role() = 'authenticated');

create policy "kv_store_update_menu_admin_only" on kv_store
  for update using (key = 'menu-catalog' and auth.role() = 'authenticated');

-- BORRADO: solo administradores logueados, para cualquier clave.
create policy "kv_store_delete_admin_only" on kv_store
  for delete using (auth.role() = 'authenticated');

-- Índice para las búsquedas por prefijo que usa storage.list()
create index if not exists kv_store_key_prefix_idx on kv_store (key text_pattern_ops);
