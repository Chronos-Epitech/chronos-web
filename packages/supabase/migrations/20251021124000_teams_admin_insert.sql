-- Add admin-only INSERT policy for teams table
-- Allows admins to create teams with any manager_id

-- Drop existing admin insert policy if it exists (idempotent)
drop policy if exists teams_admin_insert on public.teams;

-- Admins can INSERT teams with any manager_id
create policy teams_admin_insert
  on public.teams
  as permissive
  for insert
  to authenticated
  with check ((select private.is_admin()));
