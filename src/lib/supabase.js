import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== '' &&
  supabaseUrl.startsWith('https://')
);

// Fallback in-memory/localStorage mock store for demo mode if Supabase env vars are not set
class MockSupabaseClient {
  constructor() {
    this.subscribers = new Set();
    this.mockUser = this.loadMockUser();
  }

  loadRegisteredUsers() {
    try {
      const saved = localStorage.getItem('aura_registered_accounts_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveRegisteredUsers(accounts) {
    try {
      localStorage.setItem('aura_registered_accounts_v1', JSON.stringify(accounts));
    } catch (e) {
      console.error(e);
    }
  }

  loadMockUser() {
    try {
      const saved = localStorage.getItem('aura_mock_user_session_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  saveMockUser(user) {
    this.mockUser = user;
    if (user) {
      localStorage.setItem('aura_mock_user_session_v1', JSON.stringify(user));
    } else {
      localStorage.removeItem('aura_mock_user_session_v1');
    }
    this.notifyAuthSubscribers(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null);
  }

  notifyAuthSubscribers(event, session) {
    this.subscribers.forEach(cb => {
      try { cb(event, session); } catch (e) { console.error(e); }
    });
  }

  auth = {
    signUp: async ({ email, password, options = {} }) => {
      await new Promise(r => setTimeout(r, 400));
      if (!email || !password) {
        return { data: null, error: { message: 'Email and password are required.' } };
      }

      const normalizedEmail = email.trim().toLowerCase();
      const accounts = this.loadRegisteredUsers();

      // Check if user is already registered
      const existing = accounts.find(a => a.email.toLowerCase() === normalizedEmail);
      if (existing) {
        return { 
          data: null, 
          error: { message: 'An account with this email already exists. Please log in instead.' } 
        };
      }

      // Create new user account
      const newUser = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        email: normalizedEmail,
        password: password, // preserved in registered accounts store
        user_metadata: {
          full_name: options?.data?.full_name || email.split('@')[0],
          avatar_url: options?.data?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(normalizedEmail)}`,
        },
        created_at: new Date().toISOString(),
      };

      accounts.push(newUser);
      this.saveRegisteredUsers(accounts);
      this.saveMockUser(newUser);

      return { data: { user: newUser, session: { user: newUser } }, error: null };
    },

    signInWithPassword: async ({ email, password }) => {
      await new Promise(r => setTimeout(r, 400));
      if (!email || !password) {
        return { data: null, error: { message: 'Email and password are required.' } };
      }

      const normalizedEmail = email.trim().toLowerCase();
      const accounts = this.loadRegisteredUsers();

      // Look for registered account
      const account = accounts.find(a => a.email.toLowerCase() === normalizedEmail);

      if (!account) {
        return { 
          data: null, 
          error: { message: 'No account found with this email. Please sign up first!' } 
        };
      }

      if (account.password !== password) {
        return { 
          data: null, 
          error: { message: 'Incorrect password. Please verify your credentials and try again.' } 
        };
      }

      // Password matches! Log in
      this.saveMockUser(account);
      return { data: { user: account, session: { user: account } }, error: null };
    },

    signOut: async () => {
      await new Promise(r => setTimeout(r, 200));
      this.saveMockUser(null);
      return { error: null };
    },

    resetPasswordForEmail: async (email) => {
      await new Promise(r => setTimeout(r, 400));
      const normalizedEmail = email.trim().toLowerCase();
      const accounts = this.loadRegisteredUsers();
      const account = accounts.find(a => a.email.toLowerCase() === normalizedEmail);
      if (!account) {
        return { data: null, error: { message: 'No account found with this email address.' } };
      }
      return { data: {}, error: null };
    },

    updateUser: async (attributes) => {
      if (!this.mockUser) return { data: null, error: { message: 'Not logged in' } };
      const updated = {
        ...this.mockUser,
        user_metadata: {
          ...this.mockUser.user_metadata,
          ...attributes.data,
        },
      };
      
      // Update in accounts store as well
      const accounts = this.loadRegisteredUsers().map(a => 
        a.id === updated.id ? { ...a, ...updated } : a
      );
      this.saveRegisteredUsers(accounts);
      this.saveMockUser(updated);

      return { data: { user: updated }, error: null };
    },

    getSession: async () => {
      return { data: { session: this.mockUser ? { user: this.mockUser } : null }, error: null };
    },

    getUser: async () => {
      return { data: { user: this.mockUser }, error: null };
    },

    onAuthStateChange: (callback) => {
      this.subscribers.add(callback);
      callback(this.mockUser ? 'INITIAL_SESSION' : 'NO_SESSION', this.mockUser ? { user: this.mockUser } : null);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              this.subscribers.delete(callback);
            },
          },
        },
      };
    },
  };

  from(table) {
    const storageKey = `aura_cloud_table_${table}`;
    const getStore = () => {
      try {
        const d = localStorage.getItem(storageKey);
        return d ? JSON.parse(d) : [];
      } catch {
        return [];
      }
    };
    const setStore = (data) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (e) {
        console.error(e);
      }
    };

    let queryFilters = [];

    const builder = {
      select: (columns = '*') => {
        return builder;
      },
      eq: (column, value) => {
        queryFilters.push({ column, value });
        return builder;
      },
      order: () => builder,
      limit: () => builder,
      single: async () => {
        const rows = getStore();
        const filtered = rows.filter(r => queryFilters.every(f => r[f.column] === f.value));
        return { data: filtered[0] || null, error: null };
      },
      then: async (resolve) => {
        const rows = getStore();
        const filtered = rows.filter(r => queryFilters.every(f => r[f.column] === f.value));
        resolve({ data: filtered, error: null });
      },
      insert: async (records) => {
        const list = Array.isArray(records) ? records : [records];
        const current = getStore();
        const created = list.map(item => ({
          ...item,
          id: item.id || 'id-' + Math.random().toString(36).substring(2, 9),
          created_at: item.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        setStore([...current, ...created]);
        return { data: created, error: null };
      },
      upsert: async (records) => {
        const list = Array.isArray(records) ? records : [records];
        const current = getStore();
        const updated = [...current];

        list.forEach(rec => {
          const idx = updated.findIndex(u => {
            if (rec.id && u.id === rec.id) return true;
            if (rec.user_id && rec.date && u.user_id === rec.user_id && u.date === rec.date) return true;
            if (rec.user_id && rec.task_id && rec.date && u.user_id === rec.user_id && u.task_id === rec.task_id && u.date === rec.date) return true;
            return false;
          });
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], ...rec, updated_at: new Date().toISOString() };
          } else {
            updated.push({
              ...rec,
              id: rec.id || 'id-' + Math.random().toString(36).substring(2, 9),
              created_at: rec.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        });

        setStore(updated);
        return { data: list, error: null };
      },
      update: async (updates) => {
        const current = getStore();
        const updated = current.map(row => {
          if (queryFilters.every(f => row[f.column] === f.value)) {
            return { ...row, ...updates, updated_at: new Date().toISOString() };
          }
          return row;
        });
        setStore(updated);
        return { data: updated, error: null };
      },
      delete: async () => {
        const current = getStore();
        const remaining = current.filter(row => !queryFilters.every(f => row[f.column] === f.value));
        setStore(remaining);
        return { data: remaining, error: null };
      },
    };

    return builder;
  }

  channel() {
    return {
      on: () => ({
        subscribe: () => ({
          unsubscribe: () => {},
        }),
      }),
    };
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : new MockSupabaseClient();
