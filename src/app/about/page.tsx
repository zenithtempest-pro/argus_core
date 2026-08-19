'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, BookOpen, Lock, Server, CheckCircle2, ArrowRight, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function AboutPage() {
  return (
    <div className="py-12 bg-white dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header Header */}
        <div className="text-center space-y-4">
          <Badge variant="info" size="md">
            <BookOpen className="w-3.5 h-3.5 mr-1" /> Methodology & Charter
          </Badge>
          <h1 className="text-4xl font-extrabold text-argus-900 dark:text-white tracking-tight">The ArgusCore OSINT Framework</h1>
          <p className="text-sm text-argus-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            ArgusCore is engineered to provide security analysts with passive, reliable, and legally compliant reconnaissance utilities to investigate threat vectors safely.
          </p>
        </div>

        {/* 1. System Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-argus-200 dark:border-slate-800 bg-argus-50/50 dark:bg-[#131b2e] shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-light dark:bg-brand/20 text-brand dark:text-blue-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-argus-900 dark:text-white">Passive Reconnaissance</h3>
            <p className="text-xs text-argus-600 dark:text-slate-300 leading-relaxed">
              All DNS, Whois, IP Geolocation, and Header probes query existing public ledgers and APIs without performing unauthorized network intrusion.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-argus-200 dark:border-slate-800 bg-argus-50/50 dark:bg-[#131b2e] shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-argus-900 dark:text-white">Zero Target Footprint</h3>
            <p className="text-xs text-argus-600 dark:text-slate-300 leading-relaxed">
              Requests pass through distributed caching proxies, preventing your analyst IP from being logged in target firewall sensors.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-argus-200 dark:border-slate-800 bg-argus-50/50 dark:bg-[#131b2e] shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-argus-900 dark:text-white">Structured Data Pipelines</h3>
            <p className="text-xs text-argus-600 dark:text-slate-300 leading-relaxed">
              Outputs are normalized into strict JSON schemas, allowing immediate ingestion into SIEM tools like Splunk, Elastic, or Sentinel.
            </p>
          </div>
        </div>

        {/* 2. Intelligence Methodology & Ethical Charter */}
        <div className="bg-argus-50 dark:bg-[#131b2e] p-8 rounded-3xl border border-argus-200 dark:border-slate-800 space-y-6">
          <h2 className="text-xl font-bold text-argus-900 dark:text-white">Ethical Reconnaissance Charter</h2>
          <div className="space-y-3 text-xs text-argus-700 dark:text-slate-300 leading-relaxed">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Strict Authorization Boundaries:</strong> Users must only perform reconnaissance against domains, IPs, and assets they own or have explicit written permission to assess.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Privacy & GDPR Compliance:</strong> Identity searches only query publicly accessible handles. Personally Identifiable Information (PII) is masked by default.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Rate Limiting & Defensive Respect:</strong> System probes incorporate automatic throttle intervals to prevent denial-of-service on remote WHOIS servers.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-argus-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-argus-600 dark:text-slate-400 font-semibold">Direct Analyst Connection:</span>
            <a href="mailto:supportarguscore@gmail.com" className="font-mono text-brand dark:text-blue-400 hover:underline flex items-center gap-1.5 font-bold">
              <Mail className="w-3.5 h-3.5" /> supportarguscore@gmail.com
            </a>
          </div>
        </div>

        {/* 3. Call to action */}
        <div className="text-center pt-6">
          <Link
            href="/tools/supertool"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-xl shadow-card transition-all"
          >
            <span>Explore OSINT Recon Engines</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
