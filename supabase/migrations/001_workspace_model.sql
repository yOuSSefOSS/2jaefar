-- ============================================================
-- Migration 001: Workspace / Organization Model
-- Run this in the Supabase SQL editor FIRST.
-- ============================================================

-- ─── WORKSPACES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspaces (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  owner_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                   TEXT NOT NULL DEFAULT 'free'
                           CHECK (plan IN ('free', 'pro', 'pro_max', 'enterprise')),
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE workspaces IS
  'Top-level billing and access unit. Every user has at least one Personal Workspace auto-created on signup.';

-- ─── WORKSPACE MEMBERS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'member'
                 CHECK (role IN ('owner', 'admin', 'member')),
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

COMMENT ON TABLE workspace_members IS
  'Junction table linking users to workspaces with a role. A user can belong to multiple workspaces.';

-- ─── PROFILES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name        TEXT,
  avatar_url          TEXT,
  active_workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS
  'One-to-one extension of auth.users. Tracks which workspace is currently active for the session.';

-- ─── AUTO-PROVISION TRIGGER ───────────────────────────────
-- Fires when a new user signs up, creating their profile and
-- a default Personal Workspace in a single transaction.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace_id UUID;
  workspace_name   TEXT;
BEGIN
  -- Derive a friendly workspace name from metadata or email
  workspace_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  ) || '''s Workspace';

  -- 1. Insert profile row (empty — filled in by user later)
  INSERT INTO profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create the personal workspace
  INSERT INTO workspaces (name, owner_id, plan)
  VALUES (workspace_name, NEW.id, 'free')
  RETURNING id INTO new_workspace_id;

  -- 3. Make the user the owner of their workspace
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, NEW.id, 'owner');

  -- 4. Set it as the active workspace on their profile
  UPDATE profiles
  SET active_workspace_id = new_workspace_id
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- Drop old trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
