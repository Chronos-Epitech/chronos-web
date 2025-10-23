-- Add RLS policy to allow managers to select all users
-- This is needed so managers can see available users to add to their team

-- Create a security definer function to check if current user is a manager
-- This bypasses RLS to avoid infinite recursion
create or replace function private.is_manager()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.users
    where id = (select auth.jwt() ->> 'sub')
      and role = 'manager'
  );
$$;

-- Drop existing policy if it exists (idempotent)
drop policy if exists users_manager_select_all on public.users;

-- Managers can SELECT all users
create policy users_manager_select_all
  on public.users
  as permissive
  for select
  to authenticated
  using (
    private.is_manager()
  );

