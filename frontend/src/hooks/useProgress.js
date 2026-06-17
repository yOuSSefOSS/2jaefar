import { supabase } from '../services/supabaseClient';
import { useAppContext } from '../context/AppContext';

export const useProgress = () => {
  const { user } = useAppContext();

  const markModuleComplete = async (moduleId, score = null, timeSpentSeconds = null) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert(
          {
            user_id: user.id,
            module_id: moduleId,
            status: 'completed',
            score,
            time_spent_seconds: timeSpentSeconds,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id, module_id' }
        );

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error marking module complete:', err);
      return null;
    }
  };

  const startModule = async (moduleId) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          module_id: moduleId,
          status: 'started'
        });

      // Ignore unique constraint error if already started
      if (error && error.code !== '23505') throw error;
      return data;
    } catch (err) {
      console.error('Error starting module:', err);
      return null;
    }
  };

  return { markModuleComplete, startModule };
};
