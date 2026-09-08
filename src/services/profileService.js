import { supabase } from '../lib/supabase';

export const profileService = {
  /**
   * Fetch profile by user ID
   */
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { profile: data, error: null };
    } catch (err) {
      return { profile: null, error: err.message };
    }
  },

  /**
   * Update profile (name, avatar)
   */
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: updates.fullName,
          avatar_url: updates.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (err) {
      return { profile: null, error: err.message };
    }
  },

  /**
   * Delete account and all associated user data (cascaded via foreign keys)
   */
  async deleteAccount(userId) {
    try {
      // Delete user profile which triggers cascades, and call auth signOut
      await supabase.from('profiles').delete().eq('id', userId);
      await supabase.auth.signOut();
      return { error: null };
    } catch (err) {
      return { error: err.message };
    }
  },
};
