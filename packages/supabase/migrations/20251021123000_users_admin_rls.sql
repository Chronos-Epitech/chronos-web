-- RLS policies to allow admins to fully manage public.users
-- Mirrors style used on public.teams (uses private.is_admin() and role authenticated)

-- Ensure RLS is enabled (idempotent if already enabled)
alter table if exists public.users enable row level security;

-- Drop existing policies if they exist (idempotent)
drop policy if exists users_admin_select on public.users;
drop policy if exists users_admin_insert on public.users;
drop policy if exists users_admin_update on public.users;
drop policy if exists users_admin_delete on public.users;

-- Admins can SELECT any user
create policy users_admin_select
  on public.users
  as permissive
  for select
  to authenticated
  using ((select private.is_admin()));

-- Admins can INSERT any user
create policy users_admin_insert
  on public.users
  as permissive
  for insert
  to authenticated
  with check ((select private.is_admin()));

-- Admins can UPDATE any user
create policy users_admin_update
  on public.users
  as permissive
  for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- Admins can DELETE any user
create policy users_admin_delete
  on public.users
  as permissive
  for delete
  to authenticated
  using ((select private.is_admin()));


