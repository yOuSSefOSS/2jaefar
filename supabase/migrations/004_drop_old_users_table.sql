-- ============================================================
-- Migration 004: Drop old users table
-- Depends on: 001, 002, 003
-- ============================================================

-- Safely remove the old 'users' table which is now replaced
-- by 'workspaces', 'workspace_members', and 'profiles'.

DROP TABLE IF EXISTS public.users CASCADE;
