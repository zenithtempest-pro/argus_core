'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Eye, EyeOff, ArrowRight, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/dashboard';
  const confirmationPending = searchParams?.get('confirmed') === 'pending';
  const initialEmail = searchParams?.get('email') || '';

  const { showToast } = useToast();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      const msg = 'Please enter both your email address and password.';
      setAuthError(msg);
      showToast('Missing Credentials', msg, 'error');
      return;
    }

    setLoading(true);

    try {
      // Direct call to Supabase Auth signInWithPassword as required:
      // supabase.auth.signInWithPassword({ email, password })
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const errorMsg = error.message || 'Invalid email or password.';
        setAuthError(errorMsg);
        showToast('Authentication Error', errorMsg, 'error');
        setLoading(false);
        return;
      }

      if (data.user) {
        showToast('Signed In', 'Welcome back to ArgusCore Workspace.', 'success');
        // On success, redirect the user to /dashboard (or redirect target)
        router.push(redirect);
      } else {
        showToast('Authentication Error', 'No active session returned. Please try again.', 'error');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred during authentication.';
      setAuthError(errorMsg);
      showToast('Authentication Error', errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Email Required', 'Please enter your email above to receive password reset instructions.', 'info');
      return;
    }

    setResetLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/auth/reset-password`,
      });

      if (error) {
        showToast('Reset Error', error.message, 'error');
      } else {
        showToast('Password Reset Sent', `Password reset instructions sent to ${email.trim()}`, 'success');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send reset email';
      showToast('Reset Error', errorMsg, 'error');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        },
      });

      if (error) {
        showToast('Social Auth Error', error.message, 'error');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'OAuth sign in failed';
      showToast('Social Auth Error', errorMsg, 'error');
    }
  };

  return (
    <div className="max-w-md w-full">
      {/* Header Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand text-white shadow-card mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white tracking-tight">Sign In</h1>
        <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
          Access your ArgusCore OSINT & Diagnostic Workspace
        </p>
      </div>

      {/* Form Container Card */}
      <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated p-6 sm:p-8 space-y-6">
        
        {/* Unconfigured Alert for Developer notice */}
        {!isSupabaseConfigured() && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Supabase Setup:</strong> Set <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[10px]">.env.local</code> to connect live authentication.
            </span>
          </div>
        )}

        {/* Confirmation Pending Notice */}
        {confirmationPending && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              Account created! If your Supabase project enforces email confirmation, please verify your email before logging in.
            </span>
          </div>
        )}

        {/* Clean Error Message Display */}
        {authError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="flex-1 font-medium">{authError}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-argus-800 dark:text-slate-200 mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (authError) setAuthError(null);
              }}
              placeholder="name@company.com"
              className="w-full px-3.5 py-2.5 text-xs font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-argus-800 dark:text-slate-200">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="text-[11px] font-semibold text-brand dark:text-blue-400 hover:underline disabled:opacity-50"
              >
                {resetLoading ? 'Sending...' : 'Forgot my password'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (authError) setAuthError(null);
                }}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 text-xs font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-argus-400 hover:text-argus-700 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Social Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-argus-200 dark:border-slate-800 w-full"></div>
          <span className="bg-white dark:bg-[#131b2e] px-3 text-xs text-argus-500 dark:text-slate-400 font-medium shrink-0">
            or
          </span>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 border border-argus-200 dark:border-slate-700 hover:bg-argus-50 dark:hover:bg-slate-800 text-argus-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('github')}
            className="w-full py-2.5 px-4 bg-[#24292e] hover:bg-[#1b1f23] text-white border border-transparent text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-sm"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Sub-link to Sign Up */}
        <div className="pt-2 text-center text-xs text-argus-600 dark:text-slate-400">
          Don't have an account?{' '}
          <Link
            href={redirect ? `/auth/signup?redirect=${encodeURIComponent(redirect)}` : '/auth/signup'}
            className="font-bold text-brand dark:text-blue-400 hover:underline"
          >
            Create a free account
          </Link>
        </div>

      </div>

      {/* Security Footer Notice */}
      <div className="mt-6 text-center text-xs text-argus-500 dark:text-slate-500 flex items-center justify-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-brand" />
        <span>256-bit SSL Encrypted • ArgusCore Supabase Auth</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-argus-50 dark:bg-[#090d16] transition-colors">
      <Suspense fallback={
        <div className="text-center text-xs text-argus-500 dark:text-slate-400 py-12">
          Loading authentication workspace...
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
