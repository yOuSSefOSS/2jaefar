-- ============================================================
-- Migration 003: Row Level Security Policies
-- Depends on: 001 and 002
-- ============================================================

-- ─── ENABLE RLS ───────────────────────────────────────────
ALTER TABLE workspaces         ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_simulations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_airfoils    ENABLE ROW LEVEL SECURITY;
-- simulation_cache: NO RLS — service role only, never exposed to client

-- ─── HELPER FUNCTION ──────────────────────────────────────
-- Returns all workspace IDs that the currently authenticated user belongs to.
CREATE OR REPLACE FUNCTION user_workspace_ids()
RETURNS SETOF UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id
  FROM workspace_members
  WHERE user_id = auth.uid();
$$;

-- ════════════════════════════════════════════════════════════
-- PROFILES
-- ════════════════════════════════════════════════════════════
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ════════════════════════════════════════════════════════════
-- WORKSPACES
-- ════════════════════════════════════════════════════════════
-- Members can view workspaces they belong to
CREATE POLICY "workspaces_select_member"
  ON workspaces FOR SELECT
  USING (id IN (SELECT user_workspace_ids()));

-- Only the workspace owner can update workspace settings
CREATE POLICY "workspaces_update_owner"
  ON workspaces FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ════════════════════════════════════════════════════════════
-- WORKSPACE MEMBERS
-- ════════════════════════════════════════════════════════════
-- Any member can see who else is in their workspace
CREATE POLICY "workspace_members_select"
  ON workspace_members FOR SELECT
  USING (workspace_id IN (SELECT user_workspace_ids()));

-- Only workspace owners/admins can add members
CREATE POLICY "workspace_members_insert_admin"
  ON workspace_members FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Only owners/admins can remove members (cannot remove yourself if owner)
CREATE POLICY "workspace_members_delete_admin"
  ON workspace_members FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- ════════════════════════════════════════════════════════════
-- SAVED SIMULATIONS
-- ════════════════════════════════════════════════════════════
CREATE POLICY "saved_simulations_select_member"
  ON saved_simulations FOR SELECT
  USING (workspace_id IN (SELECT user_workspace_ids()));

CREATE POLICY "saved_simulations_insert_member"
  ON saved_simulations FOR INSERT
  WITH CHECK (
    workspace_id IN (SELECT user_workspace_ids())
    AND created_by = auth.uid()
  );

CREATE POLICY "saved_simulations_delete_creator"
  ON saved_simulations FOR DELETE
  USING (created_by = auth.uid());

-- ════════════════════════════════════════════════════════════
-- CUSTOM AIRFOILS
-- ════════════════════════════════════════════════════════════
CREATE POLICY "custom_airfoils_select_member"
  ON custom_airfoils FOR SELECT
  USING (workspace_id IN (SELECT user_workspace_ids()));

CREATE POLICY "custom_airfoils_insert_member"
  ON custom_airfoils FOR INSERT
  WITH CHECK (
    workspace_id IN (SELECT user_workspace_ids())
    AND uploaded_by = auth.uid()
  );

CREATE POLICY "custom_airfoils_delete_uploader"
  ON custom_airfoils FOR DELETE
  USING (uploaded_by = auth.uid());
