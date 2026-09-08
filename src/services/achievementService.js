import { supabase } from '../lib/supabase';

export const achievementService = {
  /**
   * Fetch user achievements
   */
  async getAchievements(userId) {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false });

      if (error) throw error;
      return { achievements: data || [], error: null };
    } catch (err) {
      return { achievements: [], error: err.message };
    }
  },

  /**
   * Award achievement to user if not already earned
   */
  async awardAchievement(userId, achievementType, achievementName) {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .upsert({
          user_id: userId,
          achievement_type: achievementType,
          achievement_name: achievementName,
          achieved_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { achievement: data, error: null };
    } catch (err) {
      return { achievement: null, error: err.message };
    }
  },
};
