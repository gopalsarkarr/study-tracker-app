import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [isSetupCredentialsOpen, setIsSetupCredentialsOpen] = useState(false);

  // Check if user needs to configure custom credentials (username & password)
  const checkCredentialsPrompt = useCallback((currentUser) => {
    if (!currentUser) return;
    const isConfigured = currentUser.user_metadata?.credentials_configured;
    const isSkipped = sessionStorage.getItem('credentials_setup_skipped') === 'true';
    if (!isConfigured && !isSkipped) {
      // Small timeout to allow UI transitions to complete smoothly
      setTimeout(() => {
        setIsSetupCredentialsOpen(true);
      }, 500);
    }
  }, []);

  // Load user profile
  const fetchUserProfile = useCallback(async (userId, fallbackName, fallbackEmail) => {
    if (!userId) return;
    const { profile: p, error } = await profileService.getProfile(userId);
    if (p) {
      setProfile(p);
    } else {
      // Auto-create minimal profile if missing
      const defaultName = fallbackName || fallbackEmail?.split('@')[0] || 'Architect';
      const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fallbackEmail || userId)}`;
      const { profile: created } = await profileService.updateProfile(userId, {
        fullName: defaultName,
        avatarUrl: defaultAvatar,
      });
      if (created) setProfile(created);
    }
  }, []);

  // Listen to Supabase auth state changes
  useEffect(() => {
    let isMounted = true;

    // Check initial session
    authService.getSession().then(({ session: initialSession }) => {
      if (!isMounted) return;
      if (initialSession?.user) {
        setSession(initialSession);
        setUser(initialSession.user);
        fetchUserProfile(
          initialSession.user.id,
          initialSession.user.user_metadata?.full_name,
          initialSession.user.email
        );
        checkCredentialsPrompt(initialSession.user);
      }
      setLoading(false);
    });

    const { data: authListener } = authService.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);

      if (currentUser) {
        await fetchUserProfile(
          currentUser.id,
          currentUser.user_metadata?.full_name,
          currentUser.email
        );
        checkCredentialsPrompt(currentUser);
      } else {
        setProfile(null);
        setIsSetupCredentialsOpen(false);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, [fetchUserProfile, checkCredentialsPrompt]);

  // Sign up
  const signUp = useCallback(async ({ email, password, fullName, username }) => {
    setAuthError(null);
    const { data, error } = await authService.signUp({ email, password, fullName, username });
    if (error) {
      setAuthError(error);
      return { success: false, error };
    }
    if (data?.user) {
      setUser(data.user);
      await fetchUserProfile(data.user.id, fullName, email);
      setIsAuthModalOpen(false);
    }
    return { success: true, data };
  }, [fetchUserProfile]);

  // Log in (supports either Username OR Email)
  const login = useCallback(async ({ identifier, email, password }) => {
    setAuthError(null);
    const input = identifier || email;
    const { data, error } = await authService.signIn({ identifier: input, password });
    if (error) {
      setAuthError(error);
      return { success: false, error };
    }
    if (data?.user) {
      setUser(data.user);
      await fetchUserProfile(data.user.id, data.user.user_metadata?.full_name, data.user.email);
      setIsAuthModalOpen(false);
    }
    return { success: true, data };
  }, [fetchUserProfile]);

  // Log out
  const logout = useCallback(async () => {
    setAuthError(null);
    await authService.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    // Clear user cache so next login starts clean
    try {
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email) => {
    setAuthError(null);
    const { data, error } = await authService.resetPassword(email);
    if (error) {
      setAuthError(error);
      return { success: false, error };
    }
    return { success: true };
  }, []);

  // Update profile
  const updateProfile = useCallback(async ({ fullName, avatarUrl }) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    const { profile: updated, error } = await profileService.updateProfile(user.id, {
      fullName,
      avatarUrl,
    });
    if (error) return { success: false, error };
    setProfile(updated);
    return { success: true, profile: updated };
  }, [user]);

  // Delete account
  const deleteAccount = useCallback(async () => {
    if (!user) return { success: false };
    const { error } = await profileService.deleteAccount(user.id);
    if (error) return { success: false, error };
    setUser(null);
    setProfile(null);
    setSession(null);
    return { success: true };
  }, [user]);

  // Sign in with Google OAuth
  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    const { data, error } = await authService.signInWithGoogle();
    if (error) {
      setAuthError(error);
      return { success: false, error };
    }
    return { success: true, data };
  }, []);

  // Set custom credentials (username and password)
  const setupUserCredentials = useCallback(async ({ username, password }) => {
    setAuthError(null);
    const { data, error } = await authService.setupUserCredentials({ username, password });
    if (error) {
      setAuthError(error);
      return { success: false, error };
    }
    if (data) {
      setUser(data);
      await fetchUserProfile(data.id, data.user_metadata?.full_name, data.email);
      setIsSetupCredentialsOpen(false);
      try {
        sessionStorage.removeItem('credentials_setup_skipped');
      } catch (e) {}
    }
    return { success: true, data };
  }, [fetchUserProfile]);

  const openSetupCredentialsModal = useCallback(() => {
    setAuthError(null);
    setIsSetupCredentialsOpen(true);
  }, []);

  const closeSetupCredentialsModal = useCallback((skipped = false) => {
    if (skipped) {
      try {
        sessionStorage.setItem('credentials_setup_skipped', 'true');
      } catch (e) {}
    }
    setIsSetupCredentialsOpen(false);
    setAuthError(null);
  }, []);

  const openAuthModal = useCallback((tab = 'login') => {
    setAuthModalTab(tab);
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  }, []);

  const value = {
    user,
    profile,
    session,
    loading,
    authError,
    isConfigured: isSupabaseConfigured,
    isAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    openAuthModal,
    closeAuthModal,
    isSetupCredentialsOpen,
    openSetupCredentialsModal,
    closeSetupCredentialsModal,
    setupUserCredentials,
    signInWithGoogle,
    signUp,
    login,
    logout,
    resetPassword,
    updateProfile,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
