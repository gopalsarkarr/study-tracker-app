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

class MockQueryBuilder {
  constructor(table, storageKey) {
    this.table = table;
    this.storageKey = storageKey;
    this.queryFilters = [];
    this.orderConfig = null;
    this.limitCount = null;
    this.isSingle = false;
    this.pendingOperation = null;
  }

  getStore() {
    try {
      const d = localStorage.getItem(this.storageKey);
      return d ? JSON.parse(d) : [];
    } catch {
      return [];
    }
  }

  setStore(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }

  select(columns = '*') {
    return this;
  }

  eq(column, value) {
    this.queryFilters.push({ column, op: 'eq', value });
    return this;
  }

  neq(column, value) {
    this.queryFilters.push({ column, op: 'neq', value });
    return this;
  }

  gte(column, value) {
    this.queryFilters.push({ column, op: 'gte', value });
    return this;
  }

  lte(column, value) {
    this.queryFilters.push({ column, op: 'lte', value });
    return this;
  }

  order(column, options = {}) {
    this.orderConfig = { column, ascending: options.ascending !== false };
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(records) {
    this.pendingOperation = () => {
      const list = Array.isArray(records) ? records : [records];
      const current = this.getStore();
      const created = list.map(item => ({
        ...item,
        id: item.id || 'id-' + Math.random().toString(36).substring(2, 9),
        created_at: item.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      this.setStore([...current, ...created]);
      return created;
    };
    return this;
  }

  upsert(records, options = {}) {
    this.pendingOperation = () => {
      const list = Array.isArray(records) ? records : [records];
      const current = this.getStore();
      const updated = [...current];
      const upsertedList = [];

      list.forEach(rec => {
        const idx = updated.findIndex(u => {
          if (rec.id && u.id === rec.id) return true;
          if (rec.user_id && rec.date && u.user_id === rec.user_id && u.date === rec.date) return true;
          if (rec.user_id && rec.task_id && rec.date && u.user_id === rec.user_id && u.task_id === rec.task_id && u.date === rec.date) return true;
          if (rec.user_id && !rec.date && !rec.task_id && u.user_id === rec.user_id) return true;
          return false;
        });

        if (idx >= 0) {
          updated[idx] = { ...updated[idx], ...rec, updated_at: new Date().toISOString() };
          upsertedList.push(updated[idx]);
        } else {
          const newRow = {
            ...rec,
            id: rec.id || 'id-' + Math.random().toString(36).substring(2, 9),
            created_at: rec.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          updated.push(newRow);
          upsertedList.push(newRow);
        }
      });

      this.setStore(updated);
      return upsertedList;
    };
    return this;
  }

  update(updates) {
    this.pendingOperation = () => {
      const current = this.getStore();
      const updatedList = [];
      const updated = current.map(row => {
        const matches = this.queryFilters.every(f => {
          if (f.op === 'eq') return row[f.column] === f.value;
          if (f.op === 'neq') return row[f.column] !== f.value;
          return true;
        });
        if (matches) {
          const mod = { ...row, ...updates, updated_at: new Date().toISOString() };
          updatedList.push(mod);
          return mod;
        }
        return row;
      });
      this.setStore(updated);
      return updatedList;
    };
    return this;
  }

  delete() {
    this.pendingOperation = () => {
      const current = this.getStore();
      const deletedList = [];
      const remaining = current.filter(row => {
        const matches = this.queryFilters.every(f => {
          if (f.op === 'eq') return row[f.column] === f.value;
          if (f.op === 'neq') return row[f.column] !== f.value;
          return true;
        });
        if (matches) {
          deletedList.push(row);
          return false;
        }
        return true;
      });
      this.setStore(remaining);
      return deletedList;
    };
    return this;
  }

  async execute() {
    let result = [];
    if (this.pendingOperation) {
      result = this.pendingOperation();
    } else {
      let rows = this.getStore();
      result = rows.filter(r => {
        return this.queryFilters.every(f => {
          if (f.op === 'eq') return r[f.column] === f.value;
          if (f.op === 'neq') return r[f.column] !== f.value;
          if (f.op === 'gte') return r[f.column] >= f.value;
          if (f.op === 'lte') return r[f.column] <= f.value;
          return true;
        });
      });

      if (this.orderConfig) {
        const { column, ascending } = this.orderConfig;
        result.sort((a, b) => {
          if (a[column] < b[column]) return ascending ? -1 : 1;
          if (a[column] > b[column]) return ascending ? 1 : -1;
          return 0;
        });
      }

      if (typeof this.limitCount === 'number') {
        result = result.slice(0, this.limitCount);
      }
    }

    if (this.isSingle) {
      return { data: Array.isArray(result) ? (result[0] || null) : result, error: null };
    }
    return { data: Array.isArray(result) ? result : [result], error: null };
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

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
    return new MockQueryBuilder(table, storageKey);
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
