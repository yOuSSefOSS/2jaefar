-- ============================================================
-- Migration 007: Account Types & Academy Invites
-- ============================================================

-- 1. Add account_type to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'pending'
CHECK (account_type IN ('pending', 'workspace', 'academy', 'superadmin'));

-- Update existing profiles (Backfill)
UPDATE public.profiles
SET account_type = 'workspace'
WHERE active_workspace_id IS NOT NULL AND account_type = 'pending';

UPDATE public.profiles
SET account_type = 'academy'
WHERE academy_id IS NOT NULL AND account_type = 'pending';

-- 2. Update role constraint in profiles if necessary
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'student';

-- 3. Create academy_invites table
CREATE TABLE IF NOT EXISTS public.academy_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    used BOOLEAN DEFAULT false,
    used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for academy_invites
ALTER TABLE public.academy_invites ENABLE ROW LEVEL SECURITY;

-- Superadmins and Academy Owners can view/manage their academy's invites
CREATE POLICY "Academy admins can view invites" ON public.academy_invites
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.account_type = 'superadmin' OR (p.role = 'academy_owner' AND p.academy_id = academy_invites.academy_id))
  )
);

CREATE POLICY "Academy admins can insert invites" ON public.academy_invites
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.account_type = 'superadmin' OR (p.role = 'academy_owner' AND p.academy_id = academy_id))
  )
);

-- Users can update an invite (set to used) if they are claiming it
CREATE POLICY "Users can claim an invite" ON public.academy_invites
FOR UPDATE USING (
  used = false -- Can only claim unused invites
);

-- 4. Rewrite handle_new_user trigger
-- Replace the auto-provisioning of workspaces with simply creating a pending profile.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile row with pending state
  INSERT INTO profiles (id, display_name, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'first_name' || ' ' || (NEW.raw_user_meta_data->>'last_name')),
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
