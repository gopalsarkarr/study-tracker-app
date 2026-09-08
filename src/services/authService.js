import { supabase } from '../lib/supabase';

export const authService = {
  /**
   * Helper to resolve an identifier (which could be a username or an email) into an email address
   */
  async resolveEmail(identifier) {
    if (!identifier) return '';
    const cleanId = identifier.trim().toLowerCase();

    // 1. If it contains '@', it is already an email address
    if (cleanId.includes('@')) {
      return cleanId;
    }

    // 2. Try Supabase RPC 'get_email_by_username' (safe server-side lookup across auth.users)
    try {
      const { data: rpcEmail, error: rpcErr } = await supabase.rpc('get_email_by_username', {
        username_input: cleanId,
      });
      if (rpcEmail && !rpcErr) {
        return rpcEmail.trim().toLowerCase();
      }
    } catch (e) {
      // RPC might not be deployed yet, continue to fallbacks
    }

    // 3. Try querying the profiles table
    try {
      const { data: profileData, error: pErr } = await supabase
        .from('profiles')
        .select('email')
        .ilike('username', cleanId)
        .maybeSingle();

      if (profileData?.email && !pErr) {
        return profileData.email.trim().toLowerCase();
      }
    } catch (e) {
      // Profile query failed or not permitted
    }

    // 4. Try checking local device mapping cache
    try {
      const localCachedEmail = localStorage.getItem(`aura_user_lookup_${cleanId}`);
      if (localCachedEmail) {
        return localCachedEmail.trim().toLowerCase();
      }
    } catch (e) {}

    // Fallback: return cleanId as-is so supabase will attempt sign in and give standard message
    return cleanId;
  },

  /**
   * Sign up with email, password, full name, and username
   */
  async signUp({ email, password, fullName, username }) {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanUsername = username 
        ? username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '') 
        : cleanEmail.split('@')[0].toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            username: cleanUsername,
            full_name: fullName.trim(),
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername || cleanEmail)}`,
          },
        },
      });

      if (error) throw error;

      // Upsert profile record with username & email so it's searchable for login
      if (data?.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: cleanUsername,
            email: cleanEmail,
            full_name: fullName.trim(),
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername || cleanEmail)}`,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Profile username sync warning:', e);
        }

        // Cache locally for instant multi-account / username login
        try {
          localStorage.setItem(`aura_user_lookup_${cleanUsername}`, cleanEmail);
        } catch (e) {}
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message || 'Failed to sign up.' };
    }
  },

  /**
   * Sign in with identifier (Username OR Email) and password
   */
  async signIn({ identifier, email, password }) {
    try {
      const rawInput = identifier || email || '';
      const resolvedEmail = await this.resolveEmail(rawInput);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      });

      if (error) throw error;

      // Once signed in, cache user's username -> email mapping locally
      if (data?.user) {
        const uName = data.user.user_metadata?.username;
        if (uName && data.user.email) {
          try {
            localStorage.setItem(`aura_user_lookup_${uName.toLowerCase()}`, data.user.email.toLowerCase());
          } catch (e) {}
        }
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message || 'Invalid username/email or password.' };
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
