-- Quién entra al panel y cuándo. Lee auth.users, que el cliente no puede
-- tocar, así que la función corre con permisos elevados y el candado está
-- acá adentro: solo la cuenta con rol "owner" en app_metadata (que el
-- usuario no puede editarse a sí mismo) obtiene datos.
create or replace function public.accesos_del_personal()
returns table (
  email            text,
  rol              text,
  creada           timestamptz,
  ultimo_ingreso   timestamptz,
  ultima_actividad timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'owner' then
    raise exception 'solo el dueño puede ver los accesos' using errcode = '42501';
  end if;

  return query
    select u.email::text,
           (u.raw_app_meta_data ->> 'role')::text,
           u.created_at,
           u.last_sign_in_at,
           -- El "último ingreso" solo cambia al iniciar sesión de nuevo:
           -- quien deja la sesión abierta puede usar la app todos los días
           -- sin volver a ingresar. Por eso también la última actividad.
           (select max(s.updated_at) from auth.sessions s where s.user_id = u.id)
      from auth.users u
     order by 5 desc nulls last;
end;
$$;

revoke all on function public.accesos_del_personal() from public;
revoke all on function public.accesos_del_personal() from anon;
grant execute on function public.accesos_del_personal() to authenticated;
