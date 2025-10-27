-- Create RLS policies for schedules table following existing patterns

-- Users can only view their own schedules (no update/delete)
CREATE POLICY "schedules_select_own" ON public.schedules
  FOR SELECT USING (user_id = (auth.jwt() ->> 'sub'::text));

-- Users can insert their own schedules
CREATE POLICY "schedules_insert_own" ON public.schedules
  FOR INSERT WITH CHECK (user_id = (auth.jwt() ->> 'sub'::text));

-- Managers can view schedules of team members
CREATE POLICY "schedules_select_team_members" ON public.schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE t.manager_id = (auth.jwt() ->> 'sub'::text)
        AND tm.user_id = schedules.user_id
    )
  );

-- Managers can insert schedules for team members
CREATE POLICY "schedules_insert_team_members" ON public.schedules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE t.manager_id = (auth.jwt() ->> 'sub'::text)
        AND tm.user_id = schedules.user_id
    )
  );

-- Managers can update schedules of team members
CREATE POLICY "schedules_update_team_members" ON public.schedules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE t.manager_id = (auth.jwt() ->> 'sub'::text)
        AND tm.user_id = schedules.user_id
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE t.manager_id = (auth.jwt() ->> 'sub'::text)
        AND tm.user_id = schedules.user_id
    )
  );

-- Managers can delete schedules of team members
CREATE POLICY "schedules_delete_team_members" ON public.schedules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE t.manager_id = (auth.jwt() ->> 'sub'::text)
        AND tm.user_id = schedules.user_id
    )
  );

-- Admins can do anything
CREATE POLICY "schedules_admin_all" ON public.schedules
  FOR ALL USING (private.is_admin())
  WITH CHECK (private.is_admin());
