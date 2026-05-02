import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import type { SubscriptionTier } from '@/config/constants';

interface AuthState {
  user: null | { id: string; email: string };
  subscriptionTier: SubscriptionTier;
  importsCount: number;
  isAuthLoading: boolean;
  initAuth: () => () => void;
  fetchUserData: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  subscriptionTier: 'free',
  importsCount: 0,
  isAuthLoading: true,

  initAuth: () => {
    // DEV BYPASS
    if (import.meta.env.MODE === 'development') {
      set({ user: { id: 'dev-mock-user', email: 'dev@localhost' }, subscriptionTier: 'pro_max', isAuthLoading: false });
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
      else set({ subscriptionTier: 'free', importsCount: 0, isAuthLoading: false });
    });

    return () => subscription.unsubscribe();
  },

  fetchUserData: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_tier, imports_count')
        .eq('user_id', userId)
        .single();
      if (!error && data) {
        set({ subscriptionTier: (data.subscription_tier as SubscriptionTier) || 'free', importsCount: data.imports_count || 0 });
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      set({ isAuthLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, subscriptionTier: 'free' });
  },
}));
