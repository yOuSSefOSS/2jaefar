-- ============================================================
-- Migration 002: Simulation Data Tables
-- Depends on: 001_workspace_model.sql
-- ============================================================

-- ─── SAVED SIMULATIONS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_simulations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  airfoil_name TEXT NOT NULL,
  parameters   JSONB NOT NULL,  -- { alpha, reynolds, mach, wind_speed, density }
  results      JSONB NOT NULL,  -- { cl_values, cd_values, ... }
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE saved_simulations IS
  'Simulation runs saved by a user. Scoped to a workspace for B2B sharing.';

CREATE INDEX IF NOT EXISTS idx_saved_simulations_workspace
  ON saved_simulations (workspace_id);

-- ─── CUSTOM AIRFOILS ──────────────────────────────────────
-- Only metadata is stored here. The actual .dat file lives in Supabase Storage
-- under the path: workspaces/{workspace_id}/airfoils/{id}.dat
CREATE TABLE IF NOT EXISTS custom_airfoils (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  uploaded_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  storage_path TEXT NOT NULL,  -- Supabase Storage object path
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE custom_airfoils IS
  'Metadata for user-uploaded .dat airfoil files. Binary data lives in Supabase Storage.';

CREATE INDEX IF NOT EXISTS idx_custom_airfoils_workspace
  ON custom_airfoils (workspace_id);

-- ─── SIMULATION CACHE ─────────────────────────────────────
-- Deterministic lookup by input parameters.
-- Cache is service-role only — no user RLS required.
CREATE TABLE IF NOT EXISTS simulation_cache (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airfoil_hash    TEXT NOT NULL,
  alpha           NUMERIC(8,2) NOT NULL,
  reynolds_number NUMERIC(16,2) NOT NULL,
  mach_number     NUMERIC(6,4) NOT NULL,
  result          JSONB NOT NULL,
  hit_count       INTEGER NOT NULL DEFAULT 1,
  cached_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_simulation_params
    UNIQUE (airfoil_hash, alpha, reynolds_number, mach_number)
);

COMMENT ON TABLE simulation_cache IS
  'PostgreSQL-backed deterministic cache for NeuralFoil results.
   Keyed on (airfoil_hash, alpha, reynolds_number, mach_number).
   Written and read exclusively by the Node.js gateway using the service role.';

-- Covering index for the exact lookup the gateway performs
CREATE INDEX IF NOT EXISTS idx_sim_cache_lookup
  ON simulation_cache (airfoil_hash, alpha, reynolds_number, mach_number);

-- Utility function to safely increment hit count without a read-modify-write race
CREATE OR REPLACE FUNCTION increment_hit_count()
RETURNS INTEGER AS $$
  SELECT 1;  -- placeholder; actual increment is done inline via update
$$ LANGUAGE SQL IMMUTABLE;
