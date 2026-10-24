'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Eye, EyeOff, ChevronDown, ChevronUp, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { validatePassword } from '@/lib/auth';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/dashboard';
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showReqs, setShowReqs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      const msg = 'Please complete all required fields.';
      setAuthError(msg);
      showToast('Missing Fields', msg, 'error');
      return;
    }

    // Client-side password validation
    const passCheck = validatePassword(password);
    if (!passCheck.isValid) {
      const msg = passCheck.message || 'Password does not meet security requirements.';
      setAuthError(msg);
      showToast('Weak Password', msg, 'error');
      return;
    }

    setLoading(true);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const emailRedirectTo = origin ? `${origin}/auth/callback?next=${encodeURIComponent(redirect)}` : undefined;

      // Direct call to Supabase Auth signUp as required:
      // supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo } })
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: cleanName,
          },
        },
      });

      if (error) {
        let errorMsg = error.message || 'Failed to create account.';
        if (errorMsg.toLowerCase().includes('unsupported provider') || errorMsg.toLowerCase().includes('not enabled')) {
          errorMsg = 'Email signups are disabled in your Supabase project. In your Supabase Dashboard, navigate to Authentication -> Providers -> Email and ensure "Enable Email provider" is turned ON.';
        }
        setAuthError(errorMsg);
        showToast('Registration Error', errorMsg, 'error');
        setLoading(false);
        return;
      }

      // Check if user already exists (Supabase returns empty identities array when email confirmation is enabled)
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        const errorMsg = 'An account with this email address already exists. Please log in.';
        setAuthError(errorMsg);
        showToast('Registration Error', errorMsg, 'error');
        setLoading(false);
        return;
      }

      // Successful signup handling
      if (data.user) {
        if (data.session) {
          // Instant sign in (email confirmation disabled or auto-confirmed)
          showToast('Account Created', `Welcome to ArgusCore, ${cleanName}! Your workspace is ready.`, 'success');
          router.push(redirect);
        } else {
          // Email confirmation is required by project settings
          showToast(
            'Verification Required',
            'Registration successful! Please check your email to confirm your account.',
            'info'
          );
          router.push(`/auth/login?confirmed=pending&email=${encodeURIComponent(cleanEmail)}`);
        }
      } else {
        showToast('Registration Error', 'Unable to complete signup. Please try again.', 'error');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred during signup.';
      setAuthError(errorMsg);
      showToast('Registration Error', errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full">
      {/* Header Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand text-white shadow-card mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white tracking-tight">Create Your Account</h1>
        <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
          Join ArgusCore OSINT & Diagnostics Platform
        </p>
      </div>

      {/* Card Container */}
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

        {/* Clean Error Message Display */}
        {authError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="flex-1 font-medium">{authError}</div>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-argus-800 dark:text-slate-200 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (authError) setAuthError(null);
              }}
              placeholder="e.g. Alex Vance"
              className="w-full px-3.5 py-2.5 text-xs font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none"
              required
            />
          </div>

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
            <label className="block text-xs font-semibold text-argus-800 dark:text-slate-200 mb-1">
              Password
            </label>
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

            {/* Collapsible Password Requirements Helper */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowReqs(!showReqs)}
                className="flex items-center gap-1 text-[11px] font-semibold text-argus-600 dark:text-slate-400 hover:text-brand transition-colors"
              >
                <span>Show password requirements</span>
                {showReqs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showReqs && (
                <div className="mt-2 p-3 bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-[11px] space-y-1.5 text-argus-600 dark:text-slate-300 animate-in fade-in">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${password.length >= 8 ? 'text-emerald-600' : 'text-argus-400'}`} />
                    <span>At least 8 characters long</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${/[A-Z]/.test(password) ? 'text-emerald-600' : 'text-argus-400'}`} />
                    <span>At least 1 uppercase letter (A-Z)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${/[0-9]/.test(password) ? 'text-emerald-600' : 'text-argus-400'}`} />
                    <span>At least 1 number (0-9)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${/[^a-zA-Z0-9]/.test(password) ? 'text-emerald-600' : 'text-argus-400'}`} />
                    <span>At least 1 special character (!@#$%^&*)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Continue Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account with Email'}</span>
          </button>
        </form>

        {/* Sub-link to Log In */}
        <div className="pt-2 text-center text-xs text-argus-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            href={redirect ? `/auth/login?redirect=${encodeURIComponent(redirect)}` : '/auth/login'}
            className="font-bold text-brand dark:text-blue-400 hover:underline"
          >
            Log In here
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

export default function SignupPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-argus-50 dark:bg-[#090d16] transition-colors">
      <Suspense fallback={
        <div className="text-center text-xs text-argus-500 dark:text-slate-400 py-12">
          Loading registration workspace...
        </div>
      }>
        <SignupForm />
      </Suspense>
    </div>
  );
}
