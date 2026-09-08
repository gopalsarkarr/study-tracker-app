import { supabase } from '../lib/supabase';

export const scoreService = {
  /**
   * Fetch current and highest study score for user
   */
  async getScore(userId) {
    try {
      const { data, error } = await supabase
        .from('study_scores')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return {
        score: data || { current_score: 500, highest_score: 500 },
        error: null,
      };
    } catch (err) {
      return { score: { current_score: 500, highest_score: 500 }, error: err.message };
    }
  },

  /**
   * Update study score in cloud
   */
  async updateScore(userId, currentScore, highestScore) {
    try {
      const { data, error } = await supabase
        .from('study_scores')
        .upsert({
          user_id: userId,
          current_score: Math.min(1000, Math.max(0, currentScore)),
          highest_score: Math.min(1000, Math.max(0, Math.max(currentScore, highestScore))),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { score: data, error: null };
    } catch (err) {
      return { score: null, error: err.message };
    }
  },
};
