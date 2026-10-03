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
--
-- Las claves "order:<id>" son una copia liviana de cada pedido individual
-- (además de la lista completa en "orders-list"), para que el seguimiento
-- en vivo del cliente pueda consultar solo SU pedido en vez de descargar el
-- historial entero cada vez que sondea el estado — importante a partir de
-- cierto volumen de pedidos acumulados.
create policy "kv_store_write_orders" on kv_store
  for insert with check (key in ('orders-list', 'order-counter') or key like 'order:%');

create policy "kv_store_update_orders" on kv_store
  for update using (key in ('orders-list', 'order-counter') or key like 'order:%');

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


-- =====================================================================
-- PEDIDOS EN UNA TABLA REAL (una fila por pedido)
-- =====================================================================
-- Reemplaza la lista única de pedidos que antes vivía en kv_store
-- ("orders-list" + "order-counter" + "order:<id>"). Resuelve:
--   1. Pedidos que se pisaban al guardar a la vez (la lista completa se
--      reescribía en cada alta o cambio de estado).
--   2. El panel admin descargando todo el historial cada pocos segundos.
--   3. Datos de clientes (nombre, teléfono, dirección) legibles por
--      cualquiera con la clave pública.
--   4. La numeración diaria, que se reiniciaba a las 21:00 (hora UTC).
-- Es seguro correr este bloque más de una vez.

create table if not exists public.orders (
  id          text primary key,
  short_code  integer     not null,
  order_date  date        not null,
  status      text        not null default 'nuevo',
  data        jsonb       not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_updated_at_idx on public.orders (updated_at desc);
create index if not exists orders_code_idx       on public.orders (short_code, created_at desc);

create table if not exists public.order_counters (
  order_date date    primary key,
  seq        integer not null default 0
);

alter table public.orders         enable row level security;
alter table public.order_counters enable row level security;

revoke all on public.orders         from anon;
revoke all on public.order_counters from anon, authenticated;

-- Solo el personal logueado lee/modifica la tabla directamente. Los
-- clientes (sin login) solo pasan por las funciones de más abajo.
-- (order_counters queda sin políticas a propósito: solo la toca place_order.)
drop policy if exists "orders_select_staff" on public.orders;
drop policy if exists "orders_update_staff" on public.orders;
create policy "orders_select_staff" on public.orders for select to authenticated using (true);
create policy "orders_update_staff" on public.orders for update to authenticated using (true) with check (true);

create or replace function public.orders_touch() returns trigger
language plpgsql as $fn$
begin
  new.updated_at := now();
  return new;
end
$fn$;
drop trigger if exists orders_touch_trg on public.orders;
create trigger orders_touch_trg before update on public.orders
  for each row execute function public.orders_touch();

-- place_order: crea el pedido Y su número en una sola operación atómica.
-- El contador por día usa hora argentina y no puede repetir números aun
-- con pedidos simultáneos. La hora y el estado los fija el servidor
-- (lo que mande el cliente en esos campos se ignora).
create or replace function public.place_order(p_order jsonb) returns jsonb
language plpgsql security definer set search_path = public as $fn$
declare
  d      date := (now() at time zone 'America/Argentina/Salta')::date;
  n      integer;
  v_id   text;
  v_data jsonb;
begin
  if jsonb_typeof(p_order->'items') is distinct from 'array'
     or jsonb_array_length(p_order->'items') = 0 then
    raise exception 'Pedido vacío';
  end if;
  if jsonb_array_length(p_order->'items') > 60 or length(p_order::text) > 20000 then
    raise exception 'Pedido demasiado grande';
  end if;
  if (p_order->>'total') is null or (p_order->>'total')::numeric < 0 then
    raise exception 'Total inválido';
  end if;

  v_id := coalesce(nullif(p_order->>'id', ''), md5(random()::text || clock_timestamp()::text));

  insert into order_counters (order_date, seq) values (d, 1)
  on conflict (order_date) do update set seq = order_counters.seq + 1
  returning seq into n;

  v_data := (p_order - 'servedBy' - 'servedByName')
            || jsonb_build_object('id', v_id, 'shortCode', n, 'status', 'nuevo', 'createdAt', to_jsonb(now()));

  insert into orders (id, short_code, order_date, status, data)
  values (v_id, n, d, 'nuevo', v_data);

  return v_data;
end
$fn$;

-- Seguimiento del cliente: solo devuelve lo mínimo (sin nombre, teléfono
-- ni dirección). Por id (inadivinable) o por número + teléfono.
create or replace function public.get_order_public(p_id text) returns jsonb
language sql security definer set search_path = public stable as $fn$
  select jsonb_build_object('id', id, 'shortCode', short_code, 'status', status,
                            'createdAt', data->'createdAt', 'total', data->'total', 'mode', data->'mode')
  from orders where id = p_id;
$fn$;

create or replace function public.lookup_order_public(p_code integer, p_phone text) returns jsonb
language sql security definer set search_path = public stable as $fn$
  select jsonb_build_object('id', id, 'shortCode', short_code, 'status', status,
                            'createdAt', data->'createdAt', 'total', data->'total', 'mode', data->'mode')
  from orders
  where short_code = p_code
    and regexp_replace(coalesce(data->>'phone', ''), '\s+', '', 'g') = regexp_replace(coalesce(p_phone, ''), '\s+', '', 'g')
  order by created_at desc
  limit 1;
$fn$;

-- Panel admin: la primera carga trae las últimas 36 horas; después solo lo
-- que cambió desde la última consulta (con 10 s de solape por seguridad).
-- Casi siempre devuelve una lista vacía.
create or replace function public.admin_orders(p_since timestamptz default null) returns jsonb
language sql stable security invoker set search_path = public as $fn$
  with picked as (
    select data, status, created_at from orders
    where case when p_since is null
               then created_at > now() - interval '36 hours'
               else updated_at > p_since - interval '10 seconds' end
    order by created_at desc
    limit 500
  )
  select jsonb_build_object(
    'orders', coalesce((select jsonb_agg(data || jsonb_build_object('status', status) order by created_at desc) from picked), '[]'::jsonb),
    'cursor', now()
  );
$fn$;

-- Cambio de estado: toca solo ESE pedido, de forma atómica.
create or replace function public.update_order(p_id text, p_patch jsonb) returns jsonb
language plpgsql security invoker set search_path = public as $fn$
declare v jsonb;
begin
  if p_patch ? 'status' and (p_patch->>'status') not in ('nuevo', 'preparando', 'listo', 'entregado') then
    raise exception 'Estado inválido';
  end if;
  update orders
     set data   = data || (p_patch - 'id' - 'shortCode'),
         status = coalesce(nullif(p_patch->>'status', ''), status)
   where id = p_id
   returning data into v;
  return v;
end
$fn$;

-- Reporte de ventas calculado en la base: respuesta chica sin importar
-- cuántos pedidos haya acumulados.
create or replace function public.sales_report(p_from timestamptz default null) returns jsonb
language sql stable security invoker set search_path = public as $fn$
  with sold as (
    select data from orders
    where status = 'entregado' and (p_from is null or created_at >= p_from)
  ),
  totals as (
    select coalesce(sum((data->>'total')::numeric), 0) as revenue, count(*) as n from sold
  ),
  by_staff as (
    select coalesce(nullif(data->>'servedByName', ''), nullif(data->>'servedBy', ''), 'Sin asignar') as name,
           sum((data->>'total')::numeric) as revenue, count(*) as n
    from sold group by 1
  ),
  by_product as (
    select (it->>'name') || case when coalesce(it->>'variantLabel', '') <> '' then ' (' || (it->>'variantLabel') || ')' else '' end as name,
           sum((it->>'qty')::numeric) as qty,
           sum((it->>'price')::numeric * (it->>'qty')::numeric) as revenue
    from sold, jsonb_array_elements(sold.data->'items') as it
    group by 1
    order by 2 desc
    limit 10
  )
  select jsonb_build_object(
    'revenue', (select revenue from totals),
    'count',   (select n from totals),
    'byStaff', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'revenue', revenue, 'count', n) order by revenue desc) from by_staff), '[]'::jsonb),
    'topProducts', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'qty', qty, 'revenue', revenue) order by qty desc) from by_product), '[]'::jsonb)
  );
$fn$;

-- Permisos: los clientes solo pueden crear y consultar su propio pedido;
-- todo lo demás es solo para personal logueado.
revoke all on function public.place_order(jsonb)                  from public, anon, authenticated;
revoke all on function public.get_order_public(text)              from public, anon, authenticated;
revoke all on function public.lookup_order_public(integer, text)  from public, anon, authenticated;
revoke all on function public.admin_orders(timestamptz)           from public, anon, authenticated;
revoke all on function public.update_order(text, jsonb)           from public, anon, authenticated;
revoke all on function public.sales_report(timestamptz)           from public, anon, authenticated;

grant execute on function public.place_order(jsonb)                 to anon, authenticated;
grant execute on function public.get_order_public(text)             to anon, authenticated;
grant execute on function public.lookup_order_public(integer, text) to anon, authenticated;
grant execute on function public.admin_orders(timestamptz)          to authenticated;
grant execute on function public.update_order(text, jsonb)          to authenticated;
grant execute on function public.sales_report(timestamptz)          to authenticated;

-- Migración única de los pedidos que estaban en la lista vieja (idempotente).
insert into public.orders (id, short_code, order_date, status, data, created_at, updated_at)
select o->>'id',
       (o->>'shortCode')::int,
       ((o->>'createdAt')::timestamptz at time zone 'America/Argentina/Salta')::date,
       coalesce(o->>'status', 'nuevo'),
       o,
       (o->>'createdAt')::timestamptz,
       now()
from kv_store k, jsonb_array_elements(k.value::jsonb) as o
where k.key = 'orders-list'
on conflict (id) do nothing;

insert into public.order_counters (order_date, seq)
select order_date, max(short_code) from public.orders group by order_date
on conflict (order_date) do update set seq = greatest(order_counters.seq, excluded.seq);

-- Las claves "orders-list", "order-counter" y "order:<id>" de kv_store ya no
-- las usa la app. Una vez confirmado que todo anda con la tabla nueva, se
-- pueden archivar y sacar de las políticas públicas de kv_store (ver arriba).
