'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ExternalLink, Activity, Lock, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-[#090d16] border-t border-argus-200 dark:border-slate-800 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Platform Overview */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-argus-900 dark:text-white">ArgusCore</span>
            </div>
            <p className="text-xs text-argus-600 dark:text-slate-400 leading-relaxed">
              Enterprise-grade Open Source Intelligence (OSINT) and MXToolbox network diagnostic framework for threat analysts and sysadmins.
            </p>
            <div className="text-xs text-argus-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
              <Mail className="w-3.5 h-3.5 text-brand" />
              <a href="mailto:supportarguscore@gmail.com" className="hover:underline font-mono">supportarguscore@gmail.com</a>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">All Diagnostic Services Operational</span>
            </div>
          </div>

          {/* Col 2: Diagnostic Tools */}
          <div>
            <h4 className="text-xs font-bold text-argus-900 dark:text-white uppercase tracking-wider mb-3">Diagnostic Suite</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/tools/supertool" className="text-argus-600 dark:text-slate-400 hover:text-brand dark:hover:text-blue-400 transition-colors">SuperTool Command</Link></li>
              <li><Link href="/tools/blacklist" className="text-argus-600 dark:text-slate-400 hover:text-brand dark:hover:text-blue-400 transition-colors">Blacklist Checker</Link></li>
              <li><Link href="/tools/mx-lookup" className="text-argus-600 dark:text-slate-400 hover:text-brand dark:hover:text-blue-400 transition-colors">MX Record Lookup</Link></li>
              <li><Link href="/tools/dmarc" className="text-argus-600 dark:text-slate-400 hover:text-brand dark:hover:text-blue-400 transition-colors">DMARC Record Check</Link></li>
              <li><Link href="/tools/header-analyzer" className="text-argus-600 dark:text-slate-400 hover:text-brand dark:hover:text-blue-400 transition-colors">Email Header Analyzer</Link></li>
            </ul>
          </div>

          {/* Col 3: Resources & Hub */}
          <div>
            <h4 className="text-xs font-bold text-argus-900 dark:text-white uppercase tracking-wider mb-3">Resources & Hub</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/downloads" className="text-argus-600 dark:text-slate-400 hover:text-brand dark:hover:text-blue-400 transition-colors">Python OSINT Repository</Link></li>
              <li><Link href="/dashboard" className="text-argus-600 dark:text-slate-400 hover:text-brand dark:hover:text-blue-400 transition-colors">Analyst Workspace</Link></li>
              <li><Link href="/methodology" className="text-argus-600 dark:text-slate-400 hover:text-brand dark:hover:text-blue-400 transition-colors">OSINT Methodology</Link></li>
              <li><Link href="/support" className="text-argus-600 dark:text-slate-400 hover:text-brand dark:hover:text-blue-400 transition-colors">Security Ticketing & Support</Link></li>
            </ul>
          </div>

          {/* Col 4: Compliance & Ethics */}
          <div>
            <h4 className="text-xs font-bold text-argus-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-brand dark:text-blue-400" /> Ethical Compliance
            </h4>
            <p className="text-xs text-argus-500 dark:text-slate-400 leading-relaxed mb-3">
              ArgusCore strictly operates under passive, authorized reconnaissance standards. No intrusive or destructive exploit payloads are permitted.
            </p>
            <div className="p-2.5 rounded-lg bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800 text-[11px] text-argus-600 dark:text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand dark:text-blue-400 shrink-0" />
              <span>Avg. API Latency: <strong>22ms</strong> | Uptime: <strong>99.99%</strong></span>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-argus-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-argus-500 dark:text-slate-400">
          <div>
            &copy; 2026 ArgusCore Intelligence Systems. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/methodology" className="hover:text-argus-800 dark:hover:text-white cursor-pointer">Ethical Guidelines</Link>
            <Link href="/about" className="hover:text-argus-800 dark:hover:text-white cursor-pointer">Privacy Policy</Link>
            <Link href="/support" className="hover:text-argus-800 dark:hover:text-white cursor-pointer">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
