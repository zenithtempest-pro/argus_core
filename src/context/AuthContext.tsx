'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  supabaseUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoggedIn: boolean; // Alias for backward compatibility
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; requiresConfirmation?: boolean }>;
  logout: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github', redirectPath?: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  session: null,
  isAuthenticated: false,
  isLoggedIn: false,
  loading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: async () => {},
  signInWithOAuth: async () => ({}),
});

function mapUser(user: User | null): AuthUser | null {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  const name =
    metadata.full_name ||
    metadata.name ||
    user.email?.split('@')[0] ||
    'Security Analyst';
  const role = metadata.role || 'Enterprise Security Analyst';

  return {
    id: user.id,
    name,
    email: user.email || '',
    role,
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronize live user session from Supabase
  useEffect(() => {
    let isMounted = true;

    const fetchCurrentSession = async () => {
      try {
        // Fetch live user using supabase.auth.getUser()
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();

        if (isMounted) {
          if (currentUser && !error) {
            setSupabaseUser(currentUser);
            setUser(mapUser(currentUser));
          } else {
            setSupabaseUser(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error fetching Supabase user session:', err);
        if (isMounted) {
          setSupabaseUser(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCurrentSession();

    // Listen to real-time auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;

        setSession(currentSession);
        const liveUser = currentSession?.user ?? null;

        if (liveUser) {
          setSupabaseUser(liveUser);
          setUser(mapUser(liveUser));
        } else {
          setSupabaseUser(null);
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          setSupabaseUser(data.user);
          setUser(mapUser(data.user));
          setSession(data.session);
          return { success: true };
        }

        return { success: false, error: 'Authentication failed.' };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred during login.';
        return { success: false, error: message };
      }
    },
    []
  );

  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string; requiresConfirmation?: boolean }> => {
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const emailRedirectTo = origin ? `${origin}/auth/callback?next=/dashboard` : undefined;

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo,
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        // Supabase returns empty identities array if user already exists (when email confirmation is enabled)
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          return {
            success: false,
            error: 'An account with this email address is already registered. Please log in.',
          };
        }

        if (data.user) {
          setSupabaseUser(data.user);
          setUser(mapUser(data.user));
          setSession(data.session);

          // If no immediate session, email confirmation is required
          const requiresConfirmation = !data.session;
          return { success: true, requiresConfirmation };
        }

        return { success: false, error: 'Failed to create account.' };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred during sign up.';
        return { success: false, error: message };
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out of Supabase:', err);
    } finally {
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
    }
  }, []);

  const signInWithOAuth = useCallback(
    async (provider: 'google' | 'github', redirectPath?: string): Promise<{ error?: string }> => {
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const target = redirectPath || '/dashboard';
        const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(target)}`;

        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
          },
        });

        if (error) {
          return { error: error.message };
        }

        return {};
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'OAuth sign in failed';
        return { error: message };
      }
    },
    []
  );

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isAuthenticated,
        isLoggedIn: isAuthenticated,
        loading,
        login,
        signup,
        logout,
        signInWithOAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
