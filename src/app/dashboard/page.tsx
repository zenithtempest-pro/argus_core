'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, RotateCw, Trash2, Shield, Globe, UserCheck, Cpu, Filter,
  ArrowUpRight, Zap, AlertOctagon, Activity,
  Check, ArrowRight, ShieldCheck, FileCode, Users, Copy, CheckCircle,
  Database, Sparkles, Terminal, Code2
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface HistoryItem {
  id: string;
  query: string;
  category: string;
  toolName: string;
  timestamp: string;
  status: 'Completed' | 'Flagged' | 'Clean';
  resultSummary: string;
}

export interface DashboardUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  lastSignInAt?: string;
  provider: string;
  isConfirmed: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const { showToast } = useToast();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchHistoryTerm, setSearchHistoryTerm] = useState('');
  const [completedGuidance, setCompletedGuidance] = useState<Record<string, boolean>>({});

  // Supabase User Directory State
  const [registeredUsers, setRegisteredUsers] = useState<DashboardUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [userDirectorySource, setUserDirectorySource] = useState<string>('initializing');
  const [searchUserTerm, setSearchUserTerm] = useState<string>('');
  const [filterUserRole, setFilterUserRole] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState<boolean>(false);

  // Unauthenticated protection: redirect once auth has initialized
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  // Client-side and server-side fetcher for Supabase user directory / profiles
  const fetchSupabaseUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      let profilesFound = false;

      // 1. Client-side query: try reading public.profiles from Supabase
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && profiles && profiles.length > 0) {
          const mapped: DashboardUser[] = profiles.map((p) => ({
            id: p.id,
            email: p.email || (user && user.id === p.id ? user.email : 'user@domain.com'),
            fullName: p.full_name || p.name || 'Security Analyst',
            role: p.role || 'Enterprise Security Analyst',
            createdAt: p.created_at,
            lastSignInAt: p.updated_at || p.created_at,
            provider: 'supabase',
            isConfirmed: true,
          }));

          setRegisteredUsers(mapped);
          setUserDirectorySource('supabase_profiles_table');
          profilesFound = true;
        }
      } catch (err) {
        // Fallback to route handler
      }

      // 2. Server API fallback: /api/admin/users
      if (!profilesFound) {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          if (data.users && data.users.length > 0) {
            setRegisteredUsers(data.users);
            setUserDirectorySource(data.source || 'server_api');
          } else if (user) {
            // Active session user representation
            setRegisteredUsers([
              {
                id: user.id || 'usr_session_active',
                email: user.email,
                fullName: user.name,
                role: user.role || 'Enterprise Security Analyst',
                createdAt: new Date().toISOString(),
                provider: 'email',
                isConfirmed: true,
              },
            ]);
            setUserDirectorySource('supabase_session_active');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching Supabase users:', err);
      showToast('Directory Error', 'Could not fetch live Supabase user directory.', 'error');
    } finally {
      setLoadingUsers(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSupabaseUsers();
    }
  }, [isAuthenticated, fetchSupabaseUsers]);

  const [historyList, setHistoryList] = useState<HistoryItem[]>([
    { id: '1', query: 'mx:technohacks.co.in', category: 'tools/supertool', toolName: 'SuperTool Command', timestamp: '2026-10-08 14:15', status: 'Clean', resultSummary: 'Primary MX mail.technohacks.co.in (104.21.48.92)' },
    { id: '2', query: '185.220.101.5', category: 'tools/blacklist', toolName: 'Blacklist Checker', timestamp: '2026-10-08 13:40', status: 'Flagged', resultSummary: 'Listed on SORBS DUHL blocklist' },
    { id: '3', query: 'cloudflare.com', category: 'tools/mx-lookup', toolName: 'MX Record Lookup', timestamp: '2026-10-08 12:12', status: 'Clean', resultSummary: '2 MX records (isaac.ns.cloudflare.com)' },
    { id: '4', query: '_dmarc.google.com', category: 'tools/dmarc', toolName: 'DMARC Record Check', timestamp: '2026-10-08 11:30', status: 'Completed', resultSummary: 'Policy p=reject; pct=100' },
    { id: '5', query: 'alex_cybersec', category: 'tools/identity', toolName: 'Social Username Checker', timestamp: '2026-10-08 09:12', status: 'Completed', resultSummary: 'Found active accounts on 7/11 platforms' },
  ]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-argus-50 dark:bg-[#090d16]">
        <div className="text-center space-y-3">
          <Activity className="w-8 h-8 text-brand animate-spin mx-auto" />
          <p className="text-xs text-argus-600 dark:text-slate-400 font-medium">Authenticating security workspace...</p>
        </div>
      </div>
    );
  }

  const toggleGuidance = (key: string) => {
    setCompletedGuidance(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (next[key]) {
        showToast('Hardening Step Completed', 'Updated website security checklist state.', 'success');
      }
      return next;
    });
  };

  const handleRerun = (item: HistoryItem) => {
    showToast('Re-running Query', `Launching ${item.toolName} for ${item.query}...`, 'info');
    router.push(`/${item.category}?q=${encodeURIComponent(item.query)}`);
  };

  const handleDeleteItem = (id: string) => {
    setHistoryList((prev) => prev.filter((item) => item.id !== id));
    showToast('Query Log Deleted', 'Removed search entry from history', 'info');
  };

  const handleCopyUserId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast('ID Copied', 'Supabase User UUID copied to clipboard.', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredHistory = historyList.filter((item) => {
    const matchesCategory = filterCategory === 'all' || item.category.includes(filterCategory);
    const matchesSearch = item.query.toLowerCase().includes(searchHistoryTerm.toLowerCase()) ||
                          item.toolName.toLowerCase().includes(searchHistoryTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredUsers = registeredUsers.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchUserTerm.toLowerCase());
    const matchesRole = filterUserRole === 'all' || u.role.toLowerCase().includes(filterUserRole.toLowerCase());
    return matchesSearch && matchesRole;
  });

  const websiteHardeningChecklist = [
    {
      id: 'dmarc-spf',
      title: 'DMARC & SPF Enforcement',
      category: 'Email Authentication',
      description: 'Configure strict p=reject policies and SPF include mechanisms to block domain email spoofing.',
      codeSnippet: 'v=DMARC1; p=reject; sp=reject; rua=mailto:dmarc-reports@domain.com',
      actionUrl: '/tools/dmarc',
      actionText: 'Run DMARC Inspection',
    },
    {
      id: 'csp-headers',
      title: 'Content Security Policy (CSP)',
      category: 'Application Defenses',
      description: 'Implement nonce-based script restrictions to neutralize Cross-Site Scripting (XSS) vectors.',
      codeSnippet: "Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-rAnd0m'; object-src 'none';",
      actionUrl: '/tools/header-analyzer',
      actionText: 'Audit Headers',
    },
    {
      id: 'hsts-tls',
      title: 'HSTS & TLS 1.3 Strict Preloading',
      category: 'Transport Security',
      description: 'Enforce Strict-Transport-Security with domain preloading flags across all subdomains.',
      codeSnippet: 'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload',
      actionUrl: '/tools/domain-health',
      actionText: 'Check TLS Grade',
    },
    {
      id: 'dnssec-hijack',
      title: 'Subdomain & DNS Hijacking Defense',
      category: 'DNS Infrastructure',
      description: 'Verify dangling CNAME records and enable DNSSEC cryptographic zone signing.',
      codeSnippet: 'dig +dnssec domain.com SOA',
      actionUrl: '/tools/supertool',
      actionText: 'SuperTool DNS Query',
    },
    {
      id: 'owasp-mitigation',
      title: 'OWASP Top 10 Mitigation Matrix',
      category: 'API Sanitation',
      description: 'Apply strict SSRF boundary validation, rate limiting, and parameter cleansing.',
      codeSnippet: 'const safeInput = encodeURIComponent(target.replace(/[^a-zA-Z0-9.-]/g, ""));',
      actionUrl: '/tools/scanners',
      actionText: 'Scan System Endpoints',
    },
  ];

  return (
    <div className="py-10 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. Analyst Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-card">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-argus-500 dark:text-slate-400 uppercase tracking-wider">
                  Live Supabase Auth Session
                </span>
                {isSupabaseConfigured() ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Connected
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Env Config Pending
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black text-argus-900 dark:text-white tracking-tight">
                Security Dashboard
              </h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1 font-mono">
                Authenticated as <strong className="text-argus-900 dark:text-white font-sans">{user?.name}</strong> ({user?.email}) • Role: <strong className="text-brand dark:text-blue-400 font-sans">{user?.role}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tools/supertool"
              className="px-4 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>SuperTool Recon Engine</span>
            </Link>
          </div>
        </div>

        {/* 2. System Diagnostics Telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-argus-500 dark:text-slate-400">Total Scans Executed</span>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-brand dark:text-blue-400">
                <Search className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-argus-900 dark:text-white mt-2">1,248</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +14% active telemetry
            </div>
          </div>

          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-argus-500 dark:text-slate-400">Registered Users</span>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-argus-900 dark:text-white mt-2">
              {registeredUsers.length}
            </div>
            <div className="text-[11px] text-brand dark:text-blue-400 font-medium mt-1 flex items-center gap-1">
              <Database className="w-3 h-3" /> Supabase Auth Directory
            </div>
          </div>

          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-argus-500 dark:text-slate-400">Health Score Index</span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-argus-900 dark:text-white mt-2">98%</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Optimal Security posture</div>
          </div>

          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-argus-500 dark:text-slate-400">Non-Blocking SLA Status</span>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-argus-900 dark:text-white mt-2">3.5s SLA</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Async Promise.allSettled</div>
          </div>
        </div>

        {/* 3. NEW: Supabase Registered Users & Profiles Table */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="p-5 border-b border-argus-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-argus-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand" /> Registered Users & Profiles Directory
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand dark:text-blue-400 border border-brand/20">
                  Live Supabase Auth
                </span>
              </div>
              <p className="text-xs text-argus-500 dark:text-slate-400 mt-0.5">
                Live query against Supabase Auth identities and profiles directory table
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search User Input */}
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-argus-400" />
                <input
                  type="text"
                  value={searchUserTerm}
                  onChange={(e) => setSearchUserTerm(e.target.value)}
                  placeholder="Filter users..."
                  className="w-full sm:w-44 pl-8 pr-3 py-2 text-xs font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Role Filter */}
              <div className="relative w-full sm:w-auto">
                <select
                  value={filterUserRole}
                  onChange={(e) => setFilterUserRole(e.target.value)}
                  className="w-full sm:w-auto pl-3 pr-8 py-2 text-xs font-semibold text-argus-800 dark:text-slate-200 bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="analyst">Security Analyst</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => {
                  fetchSupabaseUsers();
                  showToast('Syncing Directory', 'Fetching latest users from Supabase...', 'info');
                }}
                disabled={loadingUsers}
                className="p-2 text-argus-600 dark:text-slate-300 hover:text-brand bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl transition-colors disabled:opacity-50"
                title="Refresh Supabase Users"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin text-brand' : ''}`} />
              </button>

              {/* SQL Schema Helper Button */}
              <button
                onClick={() => setShowSqlGuide(!showSqlGuide)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-argus-700 dark:text-slate-300 hover:text-brand bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl transition-colors"
                title="Show Supabase SQL Schema helper"
              >
                <Code2 className="w-3.5 h-3.5 text-brand" />
                <span>{showSqlGuide ? 'Hide SQL' : 'Profiles Schema'}</span>
              </button>
            </div>
          </div>

          {/* Optional Collapsible Supabase Profiles Setup Guide */}
          {showSqlGuide && (
            <div className="p-5 bg-argus-100/60 dark:bg-slate-950/70 border-b border-argus-200 dark:border-slate-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-brand" />
                  <h4 className="text-xs font-bold text-argus-900 dark:text-white">
                    Supabase Profiles Table & Auth Trigger (Optional SQL Migration)
                  </h4>
                </div>
                <button
                  onClick={() => {
                    const sql = `-- Create profiles table\ncreate table if not exists public.profiles (\n  id uuid references auth.users on delete cascade primary key,\n  full_name text,\n  email text,\n  role text default 'Enterprise Security Analyst',\n  created_at timestamp with time zone default timezone('utc'::text, now()) not null\n);\n\n-- Create trigger function for automatic profile sync\ncreate or replace function public.handle_new_user()\nreturns trigger as $$\nbegin\n  insert into public.profiles (id, full_name, email, role)\n  values (\n    new.id,\n    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),\n    new.email,\n    coalesce(new.raw_user_meta_data->>'role', 'Enterprise Security Analyst')\n  );\n  return new;\nend;\n$$ language plpgsql security definer;\n\ncreate or replace trigger on_auth_user_created\n  after insert on auth.users\n  for each row execute procedure public.handle_new_user();`;
                    navigator.clipboard.writeText(sql);
                    showToast('SQL Copied', 'Copied migration script to clipboard. Paste in Supabase SQL Editor.', 'success');
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy SQL</span>
                </button>
              </div>
              <p className="text-[11px] text-argus-600 dark:text-slate-400">
                Run this quick SQL snippet in your Supabase Dashboard SQL Editor if you want Supabase to automatically synchronize every new user from <code className="font-mono text-brand">auth.users</code> into a queryable <code className="font-mono text-brand">public.profiles</code> table.
              </p>
              <pre className="p-3 bg-argus-900 dark:bg-black text-slate-200 rounded-xl text-[10px] font-mono overflow-x-auto leading-relaxed border border-argus-700 dark:border-slate-800">
{`-- 1. Create public profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  role text default 'Enterprise Security Analyst',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Trigger function to auto-sync newly registered auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'Enterprise Security Analyst')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();`}
              </pre>
            </div>
          )}

          {/* User Directory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-argus-50 dark:bg-slate-900 text-[11px] font-bold text-argus-500 dark:text-slate-400 uppercase tracking-wider border-b border-argus-200 dark:border-slate-800">
                  <th className="py-3 px-4">User & Identity</th>
                  <th className="py-3 px-4">Role / Permissions</th>
                  <th className="py-3 px-4">User ID (UUID)</th>
                  <th className="py-3 px-4">Auth Provider</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-argus-200 dark:divide-slate-800 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-argus-500 dark:text-slate-400">
                      {loadingUsers ? 'Loading registered users from Supabase...' : 'No users found matching current filter criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isCurrentUser = user?.id === u.id || user?.email === u.email;
                    return (
                      <tr key={u.id} className="hover:bg-argus-50/80 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand dark:text-blue-400 border border-brand/20 flex items-center justify-center font-bold text-xs shrink-0">
                              {u.fullName[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-argus-900 dark:text-white flex items-center gap-1.5">
                                <span>{u.fullName}</span>
                                {isCurrentUser && (
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-brand text-white">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-argus-500 dark:text-slate-400 font-mono">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-argus-800 dark:text-slate-200">
                          <Badge variant={u.role.includes('Admin') ? 'warning' : 'info'}>
                            {u.role}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-argus-600 dark:text-slate-400">
                          <span className="truncate max-w-[120px] inline-block align-middle" title={u.id}>
                            {u.id.length > 18 ? `${u.id.substring(0, 14)}...` : u.id}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-argus-700 dark:text-slate-300 capitalize">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                            {u.provider}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {u.isConfirmed ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-[11px] font-medium">
                              <span>Unconfirmed</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-argus-500 dark:text-slate-400">
                          {u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : 'Recent'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleCopyUserId(u.id)}
                            className="inline-flex items-center gap-1 p-1.5 text-argus-500 hover:text-brand hover:bg-argus-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-[11px]"
                            title="Copy Supabase User ID"
                          >
                            {copiedId === u.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Telemetry */}
          <div className="p-3 bg-argus-50 dark:bg-slate-900 border-t border-argus-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-argus-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-brand" />
              <span>Data Source: <strong className="font-mono text-argus-700 dark:text-slate-300">{userDirectorySource}</strong></span>
            </div>
            <div>
              Showing {filteredUsers.length} of {registeredUsers.length} total users
            </div>
          </div>
        </div>

        {/* 4. Website Hardening & Security Guidance Action Panel */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-argus-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-argus-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand" /> Website Hardening & Security Guidance Panel
              </h2>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-0.5">
                Step-by-step interactive security mitigation matrix for domain administrators and security analysts
              </p>
            </div>
            <Badge variant="info" size="md">
              5 Security Pillars Enforced
            </Badge>
          </div>

          <div className="space-y-4">
            {websiteHardeningChecklist.map((item) => {
              const isChecked = Boolean(completedGuidance[item.id]);
              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isChecked
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800 hover:border-brand/40'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleGuidance(item.id)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white dark:bg-slate-800 border-argus-300 dark:border-slate-700 text-transparent hover:border-brand'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand dark:text-blue-400 bg-brand/10 border border-brand/20 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <h3 className={`text-sm font-bold ${isChecked ? 'line-through text-argus-500 dark:text-slate-500' : 'text-argus-900 dark:text-white'}`}>
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-argus-600 dark:text-slate-300 leading-relaxed pl-7">
                        {item.description}
                      </p>
                      <div className="pl-7 pt-1">
                        <code className="text-[11px] font-mono bg-white dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-argus-200 dark:border-slate-800 block text-argus-800 dark:text-slate-300 overflow-x-auto">
                          {item.codeSnippet}
                        </code>
                      </div>
                    </div>

                    <div className="pl-7 lg:pl-0 shrink-0">
                      <Link
                        href={item.actionUrl}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-argus-100 dark:hover:bg-slate-700 text-argus-800 dark:text-slate-200 text-xs font-semibold rounded-xl border border-argus-200 dark:border-slate-700 transition-all shadow-subtle"
                      >
                        <span>{item.actionText}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-brand" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Advanced Security Reconnaissance Launcher */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card p-6 space-y-4">
          <h2 className="text-base font-bold text-argus-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" /> Advanced Security Reconnaissance Launcher
          </h2>
          <p className="text-xs text-argus-600 dark:text-slate-400">
            One-click triggers for enterprise domain auditing, email header breakdown, and 50+ DNSBL blocklist verification
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <Link
              href="/tools/domain-health"
              className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800 hover:border-brand transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <Globe className="w-5 h-5 text-blue-500" />
                <ArrowUpRight className="w-4 h-4 text-argus-400 group-hover:text-brand transition-colors" />
              </div>
              <h3 className="text-xs font-bold text-argus-900 dark:text-white">Domain Health Audit</h3>
              <p className="text-[11px] text-argus-500 dark:text-slate-400">Evaluate SPF, DMARC, MX, & DNSBL into an A+ score</p>
            </Link>

            <Link
              href="/tools/header-analyzer"
              className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800 hover:border-brand transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <FileCode className="w-5 h-5 text-purple-500" />
                <ArrowUpRight className="w-4 h-4 text-argus-400 group-hover:text-brand transition-colors" />
              </div>
              <h3 className="text-xs font-bold text-argus-900 dark:text-white">Header Compliance Audit</h3>
              <p className="text-[11px] text-argus-500 dark:text-slate-400 font-sans">Trace MTA relays, hop delays & SPF/DKIM flags</p>
            </Link>

            <Link
              href="/tools/blacklist"
              className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800 hover:border-brand transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <AlertOctagon className="w-5 h-5 text-amber-500" />
                <ArrowUpRight className="w-4 h-4 text-argus-400 group-hover:text-brand transition-colors" />
              </div>
              <h3 className="text-xs font-bold text-argus-900 dark:text-white">50+ DNSBL Checker</h3>
              <p className="text-[11px] text-argus-500 dark:text-slate-400">Query Spamhaus, Barracuda, and SORBS blocklists</p>
            </Link>

            <Link
              href="/tools/scanners"
              className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800 hover:border-brand transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <Cpu className="w-5 h-5 text-emerald-500" />
                <ArrowUpRight className="w-4 h-4 text-argus-400 group-hover:text-brand transition-colors" />
              </div>
              <h3 className="text-xs font-bold text-argus-900 dark:text-white">Nmap Port Auditor</h3>
              <p className="text-[11px] text-argus-500 dark:text-slate-400">Scan TCP ports 21-8080 with banner grabbing</p>
            </Link>
          </div>
        </div>

        {/* 6. History Table */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
          
          <div className="p-5 border-b border-argus-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-argus-900 dark:text-white">Query History Logs</h2>
              <p className="text-xs text-argus-500 dark:text-slate-400">Filter, inspect, or re-run past network diagnostics</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full sm:w-auto pl-8 pr-8 py-2 text-xs font-semibold text-argus-800 dark:text-slate-200 bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option value="all">All Tool Categories</option>
                  <option value="supertool">SuperTool</option>
                  <option value="blacklist">Blacklist Check</option>
                  <option value="mx-lookup">MX Lookup</option>
                  <option value="dmarc">DMARC Check</option>
                </select>
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-argus-400" />
              </div>

              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-argus-400" />
                <input
                  type="text"
                  value={searchHistoryTerm}
                  onChange={(e) => setSearchHistoryTerm(e.target.value)}
                  placeholder="Search logs..."
                  className="w-full sm:w-48 pl-8 pr-3 py-2 text-xs font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-argus-50 dark:bg-slate-900 text-[11px] font-bold text-argus-500 dark:text-slate-400 uppercase tracking-wider border-b border-argus-200 dark:border-slate-800">
                  <th className="py-3 px-4">Target Query</th>
                  <th className="py-3 px-4">Tool Engine</th>
                  <th className="py-3 px-4">Result Summary</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-argus-200 dark:divide-slate-800 text-xs">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-argus-50/80 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-argus-900 dark:text-white">
                      {item.query}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-argus-800 dark:text-slate-200">
                      {item.toolName}
                    </td>
                    <td className="py-3.5 px-4 text-argus-600 dark:text-slate-300 max-w-xs truncate">
                      {item.resultSummary}
                    </td>
                    <td className="py-3.5 px-4 text-argus-500 dark:text-slate-400 font-mono text-[11px]">
                      {item.timestamp}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'Clean' && <Badge variant="success">Clean</Badge>}
                      {item.status === 'Completed' && <Badge variant="info">Completed</Badge>}
                      {item.status === 'Flagged' && <Badge variant="warning">Flagged Alert</Badge>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRerun(item)}
                          className="p-1.5 text-argus-600 dark:text-slate-400 hover:text-brand rounded-lg transition-colors"
                          title="Re-run Query"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-argus-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}
