import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import type { SubscriptionTier } from '@/config/constants';

interface AuthState {
  user: null | { id: string; email: string };
  activeWorkspaceId: string | null;
  subscriptionTier: SubscriptionTier;
  importsCount: number;
  isAuthLoading: boolean;
  initAuth: () => () => void;
  fetchUserData: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  activeWorkspaceId: null,
  subscriptionTier: 'free',
  importsCount: 0,
  isAuthLoading: true,

  initAuth: () => {
    // DEV BYPASS
    if (import.meta.env.MODE === 'development') {
      set({ user: { id: 'dev-mock-user', email: 'dev@localhost' }, activeWorkspaceId: 'dev-mock-workspace', subscriptionTier: 'pro_max', isAuthLoading: false });
      return () => {};
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      set({ user: user ? { id: user.id, email: user.email ?? '' } : null });
      if (user) useAuthStore.getState().fetchUserData(user.id);
      else set({ isAuthLoading: false });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      set({ user: user ? { id: user.id, email: user.email ?? '' } : null });
      if (user) useAuthStore.getState().fetchUserData(user.id);
      else set({ activeWorkspaceId: null, subscriptionTier: 'free', importsCount: 0, isAuthLoading: false });
    });

    return () => subscription.unsubscribe();
  },

  fetchUserData: async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('active_workspace_id')
        .eq('id', userId)
        .single();
        
      if (!profileError && profileData) {
        const workspaceId = profileData.active_workspace_id;
        
        const { data: memberData } = await supabase
          .from('workspace_members')
          .select('workspaces(plan)')
          .eq('user_id', userId)
          .eq('workspace_id', workspaceId)
          .single();

        const { count } = await supabase
          .from('custom_airfoils')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspaceId);

        set({ 
          activeWorkspaceId: workspaceId,
          subscriptionTier: (memberData?.workspaces?.plan as SubscriptionTier) || 'free', 
          importsCount: count || 0 
        });
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      set({ isAuthLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, activeWorkspaceId: null, subscriptionTier: 'free' });
  },
}));
