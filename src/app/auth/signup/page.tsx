'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, ChevronDown, ChevronUp, CheckCircle2, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showReqs, setShowReqs] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Missing Fields', 'Please complete all required fields', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Weak Password', 'Password must be at least 8 characters', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Account Created', 'Welcome to ArgusCore! Your workspace is ready.', 'success');
      router.push('/dashboard');
    }, 1200);
  };

  const handleSocialSignup = (provider: string) => {
    showToast('Social Registration', `Creating account via ${provider}...`, 'info');
    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-argus-50 dark:bg-[#090d16] transition-colors">
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
          
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-argus-800 dark:text-slate-200 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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
              className="w-full py-3 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating Account...' : 'Continue >'}</span>
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-argus-200 dark:border-slate-800 w-full"></div>
            <span className="bg-white dark:bg-[#131b2e] px-3 text-xs text-argus-500 dark:text-slate-400 font-medium shrink-0">
              or
            </span>
          </div>

          {/* Sub-link to Log In */}
          <div className="text-center text-xs text-argus-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-bold text-brand dark:text-blue-400 hover:underline">
              Log In here
            </Link>
          </div>

          {/* Social Signup Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleSocialSignup('Google')}
              className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 border border-argus-200 dark:border-slate-700 hover:bg-argus-50 dark:hover:bg-slate-800 text-argus-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign Up with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialSignup('LinkedIn')}
              className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 border border-argus-200 dark:border-slate-700 hover:bg-argus-50 dark:hover:bg-slate-800 text-argus-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5"
            >
              <svg className="w-4 h-4 fill-[#0A66C2] shrink-0" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>Sign Up with LinkedIn</span>
            </button>
          </div>

        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 text-center text-xs text-argus-500 dark:text-slate-500 flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-brand" />
          <span>Terms of Service & Privacy Policy Applied</span>
        </div>

      </div>
    </div>
  );
}
