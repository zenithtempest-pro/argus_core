'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, RotateCw, Trash2, Download, Bookmark, Shield, Globe, UserCheck, FileText, Cpu, Filter,
  ExternalLink, ArrowUpRight, Zap, AlertOctagon, MailCheck, CheckCircle2, ChevronRight, Activity,
  Lock, ShieldAlert, Key, Server, Check, ArrowRight, ShieldCheck, FileCode
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';

interface HistoryItem {
  id: string;
  query: string;
  category: string;
  toolName: string;
  timestamp: string;
  status: 'Completed' | 'Flagged' | 'Clean';
  resultSummary: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchHistoryTerm, setSearchHistoryTerm] = useState('');
  const [completedGuidance, setCompletedGuidance] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Unauthenticated protection: redirect to /auth/login?redirect=/dashboard
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [isAuthenticated, router]);

  const [historyList, setHistoryList] = useState<HistoryItem[]>([
    { id: '1', query: 'mx:technohacks.co.in', category: 'tools/supertool', toolName: 'SuperTool Command', timestamp: '2026-10-08 14:15', status: 'Clean', resultSummary: 'Primary MX mail.technohacks.co.in (104.21.48.92)' },
    { id: '2', query: '185.220.101.5', category: 'tools/blacklist', toolName: 'Blacklist Checker', timestamp: '2026-10-08 13:40', status: 'Flagged', resultSummary: 'Listed on SORBS DUHL blocklist' },
    { id: '3', query: 'cloudflare.com', category: 'tools/mx-lookup', toolName: 'MX Record Lookup', timestamp: '2026-10-08 12:12', status: 'Clean', resultSummary: '2 MX records (isaac.ns.cloudflare.com)' },
    { id: '4', query: '_dmarc.google.com', category: 'tools/dmarc', toolName: 'DMARC Record Check', timestamp: '2026-10-08 11:30', status: 'Completed', resultSummary: 'Policy p=reject; pct=100' },
    { id: '5', query: 'alex_cybersec', category: 'tools/identity', toolName: 'Social Username Checker', timestamp: '2026-10-08 09:12', status: 'Completed', resultSummary: 'Found active accounts on 7/11 platforms' },
  ]);

  if (!isAuthenticated) {
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

  const filteredHistory = historyList.filter((item) => {
    const matchesCategory = filterCategory === 'all' || item.category.includes(filterCategory);
    const matchesSearch = item.query.toLowerCase().includes(searchHistoryTerm.toLowerCase()) ||
                          item.toolName.toLowerCase().includes(searchHistoryTerm.toLowerCase());
    return matchesCategory && matchesSearch;
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
                  Dashboard
                </span>
              </div>
              <h1 className="text-2xl font-black text-argus-900 dark:text-white tracking-tight">
                Security Dashboard
              </h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1 font-mono">
                Welcome back, {user?.name || 'Alex Vance'} ({user?.email || 'user@arguscore.com'}) • Tier: <strong className="text-brand dark:text-blue-400 font-sans">Member</strong>
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
              <span className="text-xs font-medium text-argus-500 dark:text-slate-400">Active Monitored Domains</span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-argus-900 dark:text-white mt-2">38</div>
            <div className="text-[11px] text-argus-500 dark:text-slate-400 mt-1">100% DNSBL Clean</div>
          </div>

          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-argus-500 dark:text-slate-400">Health Score Index</span>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
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

        {/* 3. Website Hardening & Security Guidance Action Panel */}
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

        {/* 4. Advanced Security Reconnaissance Launcher */}
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

        {/* 5. History Table */}
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
