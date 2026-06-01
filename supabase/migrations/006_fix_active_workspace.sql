-- ============================================================
-- Migration 006: Fix active_workspace_id for all workspace members
-- ============================================================
-- This fixes users who were manually added to a workspace but
-- whose profiles.active_workspace_id still points to an old
-- personal workspace. Run this in Supabase SQL Editor.
-- ============================================================

-- For every user who is a member of workspace 7baec122-...,
-- set their active_workspace_id to that workspace.
UPDATE public.profiles
SET active_workspace_id = '7baec122-9241-4aaf-9f07-7147acd6b10b'
WHERE id IN (
  SELECT user_id
  FROM public.workspace_members
  WHERE workspace_id = '7baec122-9241-4aaf-9f07-7147acd6b10b'
);
