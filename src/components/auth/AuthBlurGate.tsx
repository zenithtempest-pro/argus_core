'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Lock, LogIn, UserPlus } from 'lucide-react';

interface AuthBlurGateProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  redirectPath?: string;
  className?: string;
}

export function AuthBlurGate({
  children,
  title = "🔒 Sign Up or Log In to Unlock Full Reconnaissance Data",
  subtitle = "You are viewing a limited preview. Create a free account or log in to reveal full infrastructure records, subdomain nodes, and deep forensic telemetry.",
  redirectPath,
  className = "",
}: AuthBlurGateProps) {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // When authenticated, render children directly with zero blur
  if (mounted && isAuthenticated) {
    return <div className={className}>{children}</div>;
  }

  const loginUrl = redirectPath ? `/auth/login?redirect=${encodeURIComponent(redirectPath)}` : '/auth/login';
  const signupUrl = redirectPath ? `/auth/signup?redirect=${encodeURIComponent(redirectPath)}` : '/auth/signup';

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Blurred Preview Content */}
      <div className="blur-md select-none pointer-events-none opacity-50 transition-all filter">
        {children}
      </div>

      {/* Centered Glassmorphic Lock Card Overlay */}
      <div className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 dark:bg-black/70 backdrop-blur-[3px]">
        <div className="max-w-md w-full bg-white/95 dark:bg-[#131b2e]/95 backdrop-blur-xl border border-argus-200 dark:border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-card">
            <Lock className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-argus-900 dark:text-white tracking-tight leading-snug">
              {title}
            </h3>
            <p className="text-xs text-argus-600 dark:text-slate-300 leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={loginUrl}
              className="w-full sm:w-auto px-5 py-2.5 bg-argus-100 hover:bg-argus-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-argus-900 dark:text-white text-xs font-bold rounded-xl border border-argus-300 dark:border-slate-600 transition-all flex items-center justify-center gap-1.5 shadow-subtle"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </Link>
            <Link
              href={signupUrl}
              className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow-card transition-all flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up Free</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
