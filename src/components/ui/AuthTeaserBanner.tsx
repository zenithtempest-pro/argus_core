'use client';

import React from 'react';
import Link from 'next/link';

interface AuthBannerProps {
  redirectPath?: string;
  message?: string;
}

export function AuthTeaserBanner({
  redirectPath = '/tools/phone-lookup',
  message = "🔒 Analyst Account Required to View Full Forensics — Sign up or Log in to unlock full circle telemetry, carrier hops, and EXIF coordinates.",
}: AuthBannerProps) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/70 backdrop-blur-md rounded-2xl text-center border border-brand/30 shadow-2xl animate-in fade-in">
      <div className="max-w-lg space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand/20 text-brand dark:text-blue-400 border border-brand/40 shadow-card">
          <span className="text-xl">🔒</span>
        </div>

        <p className="text-sm font-semibold text-white leading-relaxed px-2">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/auth/signup?redirect=${encodeURIComponent(redirectPath)}`}
            className="w-full sm:w-auto px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-card transition-all"
          >
            Create Free Account
          </Link>
          <Link
            href={`/auth/login?redirect=${encodeURIComponent(redirectPath)}`}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            Log In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
