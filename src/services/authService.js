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
   * Check if a username is already taken by another user
   */
  async checkUsernameAvailable(username, currentUserId = null) {
    if (!username) return false;
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (clean.length < 3) return false;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', clean)
        .maybeSingle();

      if (error) return true; // optimistic
      if (!data) return true; // available
      return data.id === currentUserId;
    } catch (e) {
      return true;
    }
  },

  /**
   * Sign in / Sign up with Google OAuth
   */
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message || 'Failed to initialize Google Sign-In.' };
    }
  },

  /**
   * Set custom Username and Password on an authenticated user (e.g. after Google OAuth)
   */
  async setupUserCredentials({ username, password }) {
    try {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
      if (cleanUsername.length < 3) {
        throw new Error('Username must be at least 3 characters long.');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      // 1. Get current session/user
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error('No authenticated user session found.');

      // 2. Check if username is already taken by someone else
      const isAvailable = await this.checkUsernameAvailable(cleanUsername, user.id);
      if (!isAvailable) {
        throw new Error(`Username "@${cleanUsername}" is already taken. Please choose another.`);
      }

      // 3. Update auth.users with the new password and metadata flag
      const { data: updatedAuth, error: authUpdateErr } = await supabase.auth.updateUser({
        password: password,
        data: {
          username: cleanUsername,
          credentials_configured: true,
        },
      });
      if (authUpdateErr) throw authUpdateErr;

      // 4. Upsert/Update the profiles table with this username & email
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          username: cleanUsername,
          email: user.email?.toLowerCase(),
          full_name: user.user_metadata?.full_name || cleanUsername,
          avatar_url: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`,
          updated_at: new Date().toISOString(),
        });
      } catch (pErr) {
        console.warn('Profile username sync warning:', pErr);
      }

      // 5. Cache locally for instant username resolution on this device
      try {
        if (user.email) {
          localStorage.setItem(`aura_user_lookup_${cleanUsername}`, user.email.toLowerCase());
        }
        localStorage.setItem('study_tracker_username', cleanUsername);
      } catch (e) {}

      return { data: updatedAuth.user || user, error: null };
    } catch (err) {
      return { data: null, error: err.message || 'Failed to setup credentials.' };
    }
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
            credentials_configured: true,
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
