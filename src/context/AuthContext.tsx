'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserAccount,
  registerUser,
  loginUser,
  getCurrentUserSession,
  clearCurrentUserSession,
  setCurrentUserSession,
} from '@/lib/auth';

interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoggedIn: boolean; // Alias for backward compatibility
  login: (email: string, password?: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoggedIn: false,
  login: () => ({ success: false }),
  signup: () => ({ success: false }),
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const session = getCurrentUserSession();
    if (session) {
      setUser(session);
    }
  }, []);

  const login = (email: string, password?: string) => {
    if (password) {
      const res = loginUser(email, password);
      if (res.success && res.user) {
        setUser({ id: res.user.id, name: res.user.name, email: res.user.email, role: res.user.role });
        return { success: true };
      }
      return { success: false, error: res.error || 'Invalid credentials' };
    } else {
      // Fallback for OAuth social triggers
      const fallbackUser: UserAccount = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email: email,
        passwordHash: 'social_oauth',
        createdAt: new Date().toISOString().split('T')[0],
        role: 'Enterprise Security Analyst',
      };
      setCurrentUserSession(fallbackUser);
      setUser({ id: fallbackUser.id, name: fallbackUser.name, email: fallbackUser.email, role: fallbackUser.role });
      return { success: true };
    }
  };

  const signup = (name: string, email: string, password: string) => {
    const res = registerUser(name, email, password);
    if (res.success && res.user) {
      setUser({ id: res.user.id, name: res.user.name, email: res.user.email, role: res.user.role });
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to create account' };
  };

  const logout = () => {
    clearCurrentUserSession();
    setUser(null);
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoggedIn: isAuthenticated,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
