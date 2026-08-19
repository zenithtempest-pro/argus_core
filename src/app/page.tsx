'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Search, ArrowRight, Globe, UserCheck, FileText, Cpu, CheckCircle2, Zap, Database, Download, Terminal, MailCheck, AlertOctagon, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function LandingPage() {
  const router = useRouter();
  const [searchTarget, setSearchTarget] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('supertool');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTarget.trim()) return;
    router.push(`/tools/${selectedCategory}?q=${encodeURIComponent(searchTarget.trim())}`);
  };

  const diagnosticFeatures = [
    {
      id: 'supertool',
      name: 'SuperTool Command Center',
      icon: Zap,
      badge: 'Universal',
      desc: 'Multi-prefix query bar supporting mx:, blacklist:, dmarc:, a:, whois:, spf:, and tcp: prefixes.',
      link: '/tools/supertool',
    },
    {
      id: 'blacklist',
      name: 'Blacklist / Blocklist Checker',
      icon: AlertOctagon,
      badge: '50+ DNSBLs',
      desc: 'Check if mail server IP address or domain is listed on Spamhaus, Barracuda, SORBS, or SpamCop.',
      link: '/tools/blacklist',
    },
    {
      id: 'mx-lookup',
      name: 'MX Record Lookup',
      icon: MailCheck,
      badge: 'RFC 5321',
      desc: 'Query Domain Mail Exchanger records, priority preferences, IP resolution, and SMTP port 25 banners.',
      link: '/tools/mx-lookup',
    },
    {
      id: 'dmarc',
      name: 'DMARC Record Inspector',
      icon: ShieldCheck,
      badge: 'Phishing Shield',
      desc: 'Parse _dmarc.domain.com TXT records, inspect p= policy enforcement, and verify RFC 7489 alignment.',
      link: '/tools/dmarc',
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-[#090d16] transition-colors">
      
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-argus-200 dark:border-slate-800 bg-gradient-to-b from-argus-50/80 dark:from-[#0d1424] via-white dark:via-[#090d16] to-white dark:to-[#090d16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Top Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-light dark:bg-brand/20 border border-brand-border dark:border-brand/40 text-brand dark:text-blue-400 text-xs font-semibold mb-6 shadow-2xs">
            <Shield className="w-3.5 h-3.5" />
            <span>ArgusCore MXToolbox Diagnostic Suite Active</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-argus-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Network Diagnostics & Threat Intelligence Suite
          </h1>
          <p className="mt-5 text-base sm:text-lg text-argus-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Execute MX lookups, DNSBL blacklist audits, DMARC record analyses, and email header forensics with high-speed async resolution.
          </p>

          {/* Unified Hero Search Bar */}
          <div className="mt-10 max-w-3xl mx-auto bg-white dark:bg-[#131b2e] p-2.5 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated">
            
            {/* Tool Selector Tabs */}
            <div className="flex items-center justify-center gap-1 mb-2.5 pb-2 border-b border-argus-100 dark:border-slate-800 overflow-x-auto">
              {[
                { id: 'supertool', label: 'SuperTool' },
                { id: 'blacklist', label: 'Blacklist Check' },
                { id: 'mx-lookup', label: 'MX Lookup' },
                { id: 'dmarc', label: 'DMARC Check' },
                { id: 'header-analyzer', label: 'Header Analyzer' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === tab.id
                      ? 'bg-amber-600 text-white shadow-card'
                      : 'text-argus-600 dark:text-slate-300 hover:bg-argus-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleHeroSearch} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-argus-400" />
                <input
                  type="text"
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(e.target.value)}
                  placeholder="Enter Domain or Server IP (e.g. cloudflare.com, 1.1.1.1, mx:example.com)..."
                  className="w-full pl-11 pr-4 py-3 text-sm font-mono font-medium text-argus-900 dark:text-white bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-argus-400"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <span>Execute Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-white dark:bg-[#131b2e] border border-argus-200 dark:border-slate-800 shadow-subtle text-center">
              <div className="text-2xl font-bold text-argus-900 dark:text-white">50+</div>
              <div className="text-xs font-medium text-argus-500 dark:text-slate-400 mt-1">DNSBL Blocklists</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#131b2e] border border-argus-200 dark:border-slate-800 shadow-subtle text-center">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">3.5s</div>
              <div className="text-xs font-medium text-argus-500 dark:text-slate-400 mt-1">Max Async Timeout</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#131b2e] border border-argus-200 dark:border-slate-800 shadow-subtle text-center">
              <div className="text-2xl font-bold text-argus-900 dark:text-white">RFC 7489</div>
              <div className="text-xs font-medium text-argus-500 dark:text-slate-400 mt-1">DMARC Compliance</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#131b2e] border border-argus-200 dark:border-slate-800 shadow-subtle text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-xs font-medium text-argus-500 dark:text-slate-400 mt-1">Non-Blocking Async</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Diagnostic Tools Grid */}
      <section className="py-20 bg-white dark:bg-[#090d16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">MXToolbox Diagnostic Suite</h2>
            <h3 className="text-3xl font-extrabold text-argus-900 dark:text-white tracking-tight">Core Infrastructure Diagnostics</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {diagnosticFeatures.map((cat) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-argus-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] p-6 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <IconComp className="w-6 h-6 stroke-[2]" />
                      </div>
                      <Badge variant="info">{cat.badge}</Badge>
                    </div>

                    <h4 className="text-xl font-bold text-argus-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-argus-600 dark:text-slate-300 leading-relaxed mb-6">
                      {cat.desc}
                    </p>
                  </div>

                  <Link
                    href={cat.link}
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-argus-100 dark:bg-slate-800 hover:bg-amber-600 hover:text-white text-argus-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
                  >
                    <span>Launch Diagnostic</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
