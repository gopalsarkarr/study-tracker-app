import { supabase } from '../lib/supabase';

export const authService = {
  /**
   * Sign up with email, password, and full name
   */
  async signUp({ email, password, fullName }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message || 'Failed to sign up.' };
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message || 'Invalid email or password.' };
    }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err.message || 'Failed to log out.' };
    }
  },

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message || 'Failed to send password reset email.' };
    }
  },

  /**
   * Update current user's password
   */
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message || 'Failed to update password.' };
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session: data?.session, error: null };
    } catch (err) {
      return { session: null, error: err.message };
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
