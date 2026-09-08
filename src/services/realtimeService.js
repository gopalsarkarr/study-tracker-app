import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const realtimeService = {
  /**
   * Subscribe to multi-device real-time updates for a specific user
   */
  subscribeToUserChanges(userId, onChangeCallback) {
    if (!userId || !isSupabaseConfigured) {
      return { unsubscribe: () => {} };
    }

    try {
      const channel = supabase
        .channel(`user-sync-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'completed_tasks',
            filter: `user_id=eq.${userId}`,
          },
          payload => onChangeCallback('completed_tasks', payload)
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'daily_records',
            filter: `user_id=eq.${userId}`,
          },
          payload => onChangeCallback('daily_records', payload)
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'study_scores',
            filter: `user_id=eq.${userId}`,
          },
          payload => onChangeCallback('study_scores', payload)
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${userId}`,
          },
          payload => onChangeCallback('tasks', payload)
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'streaks',
            filter: `user_id=eq.${userId}`,
          },
          payload => onChangeCallback('streaks', payload)
        )
        .subscribe();

      return {
        unsubscribe: () => {
          supabase.removeChannel(channel);
        },
      };
    } catch (err) {
      console.error('Realtime subscription error:', err);
      return { unsubscribe: () => {} };
    }
  },
};
