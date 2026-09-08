import { supabase } from '../lib/supabase';

export const streakService = {
  /**
   * Fetch streak data for user
   */
  async getStreak(userId) {
    try {
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return {
        streak: data || { current_streak: 0, longest_streak: 0, last_active_date: null },
        error: null,
      };
    } catch (err) {
      return { streak: { current_streak: 0, longest_streak: 0, last_active_date: null }, error: err.message };
    }
  },

  /**
   * Update streak data
   */
  async updateStreak(userId, currentStreak, longestStreak, lastActiveDate) {
    try {
      const { data, error } = await supabase
        .from('streaks')
        .upsert({
          user_id: userId,
          current_streak: currentStreak,
          longest_streak: Math.max(currentStreak, longestStreak),
          last_active_date: lastActiveDate,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { streak: data, error: null };
    } catch (err) {
      return { streak: null, error: err.message };
    }
  },
};
