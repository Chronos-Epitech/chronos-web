-- Add RLS policy to allow members to view all team_members records in teams they belong to

-- Create a security definer function to check if user is a member of a team
-- This bypasses RLS to avoid infinite recursion
create or replace function private.is_member_of_team_direct(check_team_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.team_members
    where team_id = check_team_id
      and user_id = (select auth.jwt() ->> 'sub')
  );
$$;

-- Drop existing policy if it exists (idempotent)
drop policy if exists team_members_select_teammates on public.team_members;

-- Members can SELECT all team_members records for teams they are part of
create policy team_members_select_teammates
  on public.team_members
  as permissive
  for select
  to authenticated
  using (
    private.is_member_of_team_direct(team_members.team_id)
  );

