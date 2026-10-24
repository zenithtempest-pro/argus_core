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
        let errorMsg = error.message || 'Invalid email or password.';
        if (errorMsg.toLowerCase().includes('unsupported provider') || errorMsg.toLowerCase().includes('not enabled')) {
          errorMsg = 'Email provider is disabled in Supabase. Please enable "Email" under Authentication -> Providers in your Supabase Dashboard.';
        }
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
        let errorMsg = error.message;
        if (errorMsg.toLowerCase().includes('unsupported provider') || errorMsg.toLowerCase().includes('not enabled')) {
          errorMsg = 'Email provider is disabled in Supabase. Enable "Email" under Authentication -> Providers in Supabase.';
        }
        setAuthError(errorMsg);
        showToast('Reset Error', errorMsg, 'error');
      } else {
        showToast('Password Reset Sent', `Password reset instructions sent to ${email.trim()}`, 'success');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send reset email';
      setAuthError(errorMsg);
      showToast('Reset Error', errorMsg, 'error');
    } finally {
      setResetLoading(false);
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

        {/* Standard Email & Password Authentication Form */}
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
              autoComplete="email"
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
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-argus-400 hover:text-argus-700 dark:hover:text-slate-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

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
