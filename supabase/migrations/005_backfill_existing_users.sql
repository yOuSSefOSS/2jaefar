-- ============================================================
-- Migration 005: Backfill Workspaces for Existing Users
-- ============================================================

DO $$
DECLARE
    user_record RECORD;
    new_workspace_id UUID;
BEGIN
    FOR user_record IN 
        SELECT id, email, raw_user_meta_data->>'display_name' AS display_name 
        FROM auth.users 
        WHERE id NOT IN (SELECT id FROM public.profiles)
    LOOP
        -- 1. Create a Personal Workspace for the existing user
        INSERT INTO public.workspaces (name, plan, owner_id)
        VALUES (COALESCE(user_record.display_name, split_part(user_record.email, '@', 1)) || '''s Workspace', 'free', user_record.id)
        RETURNING id INTO new_workspace_id;

        -- 2. Add the user as the Owner of this workspace
        INSERT INTO public.workspace_members (workspace_id, user_id, role)
        VALUES (new_workspace_id, user_record.id, 'owner');

        -- 3. Create their Profile and set the active workspace
        INSERT INTO public.profiles (id, active_workspace_id, display_name)
        VALUES (user_record.id, new_workspace_id, COALESCE(user_record.display_name, split_part(user_record.email, '@', 1)));
        
    END LOOP;
END;
$$;
