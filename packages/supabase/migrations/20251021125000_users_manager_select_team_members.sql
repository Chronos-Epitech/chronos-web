-- Add RLS policy to allow managers and members to select users in their team

-- Drop existing policies if they exist (idempotent)
drop policy if exists users_manager_select_team_members on public.users;
drop policy if exists users_member_select_team_members on public.users;

-- Managers can SELECT users who are members of teams they manage
create policy users_manager_select_team_members
  on public.users
  as permissive
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.teams t
      inner join public.team_members tm on tm.team_id = t.id
      where t.manager_id = (select auth.jwt() ->> 'sub')
        and tm.user_id = users.id
    )
  );

-- Members can SELECT users who are in the same team(s) as them
-- Also allows members to view the manager of their team
-- Note: This policy uses a subquery with SECURITY INVOKER to avoid infinite recursion
create policy users_member_select_team_members
  on public.users
  as permissive
  for select
  to authenticated
  using (
    -- Can view other members in the same team OR the manager of their team
    users.id in (
      -- Get all user_ids from team_members where current user is also a member
      select tm2.user_id
      from public.team_members tm1
      inner join public.team_members tm2 on tm1.team_id = tm2.team_id
      where tm1.user_id = (select auth.jwt() ->> 'sub')
      
      union
      
      -- Get manager_ids from teams where current user is a member
      select t.manager_id
      from public.team_members tm
      inner join public.teams t on tm.team_id = t.id
      where tm.user_id = (select auth.jwt() ->> 'sub')
    )
  );

