import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  role: string;
  avatarUrl?: string;
}

export interface ProfileRecord {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string;
  avatar_url?: string | null;
}

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 uppercase letter (A-Z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 number (0-9).' };
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 special character (!@#$%^&*).' };
  }
  return { isValid: true };
};

/**
 * Format Supabase User into application UserAccount
 */
export function formatSupabaseUser(user: User): UserAccount {
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    name: metadata.full_name || metadata.name || user.email?.split('@')[0] || 'Security Analyst',
    email: user.email || '',
    role: metadata.role || 'Enterprise Security Analyst',
    createdAt: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : undefined,
  };
}
