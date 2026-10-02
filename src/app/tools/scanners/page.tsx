'use client';

import React, { useState } from 'react';
import { ShieldCheck, Search, Loader2, Server, CheckCircle2, XCircle, Clock, Lock, Globe, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

interface AuditResult {
  target: string;
  status: 'online' | 'unreachable';
  latencyMs: number;
  protocol: 'https' | 'http';
  securityHeaders: Record<string, string>;
  missingHeaders: string[];
}

const CANONICAL_HEADER_NAMES: Record<string, string> = {
  'strict-transport-security': 'Strict-Transport-Security (HSTS)',
  'content-security-policy': 'Content-Security-Policy (CSP)',
  'x-frame-options': 'X-Frame-Options',
  'x-content-type-options': 'X-Content-Type-Options',
  'referrer-policy': 'Referrer-Policy',
  'server': 'Server Header',
};

export default function ScannersPage() {
  const { showToast } = useToast();
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  const handleAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!target.trim()) {
      showToast('Input Required', 'Please enter a target domain or IP address', 'error');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/osint/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: target.trim(),
          tool: 'service-audit',
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: AuditResult = await res.json();
      setResult(data);
      if (data.status === 'online') {
        showToast('Audit Complete', `Service audit for ${data.target} completed successfully`, 'success');
      } else {
        showToast('Service Unreachable', `Could not connect to ${data.target}`, 'error');
      }
    } catch (err: any) {
      showToast('Audit Failed', err.message || 'Failed to complete security audit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const allMonitoredHeaders = [
    'strict-transport-security',
    'content-security-policy',
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy',
    'server',
  ];

  return (
    <div className="py-10 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-card">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white">Web Service & Security Header Auditor</h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Audit HTTP/HTTPS availability, measure round-trip latency, and inspect essential security headers
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            Passive Diagnostic Tool
          </Badge>
        </div>

        {/* Input Form */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated">
          <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-argus-400 dark:text-slate-500">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Enter domain or IP address (e.g. example.com or 104.21.48.92)"
                className="w-full pl-10 pr-4 py-3 text-sm bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-argus-400 dark:placeholder:text-slate-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-card shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Run Audit Engine</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Loading Spinner Indicator */}
        {loading && (
          <div className="bg-white dark:bg-[#131b2e] p-12 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-argus-900 dark:text-white">Executing Diagnostic Probes</h3>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Checking HTTP/HTTPS service availability and security header configuration...
              </p>
            </div>
          </div>
        )}

        {/* Audit Results */}
        {result && !loading && (
          <div className="space-y-6">
            
            {/* Card 1: Service Health Overview */}
            <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-4">
              <h2 className="text-lg font-bold text-argus-900 dark:text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-500" />
                Service Health Overview
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Reachability Status */}
                <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs text-argus-600 dark:text-slate-400 font-medium">Reachability Status</span>
                  <div className="flex items-center gap-2 pt-1">
                    {result.status === 'online' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">ONLINE</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-500" />
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">UNREACHABLE</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Round-Trip Latency Badge */}
                <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs text-argus-600 dark:text-slate-400 font-medium">Round-Trip Latency</span>
                  <div className="flex items-center gap-2 pt-1">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-bold font-mono text-argus-900 dark:text-white">
                      {result.status === 'online' ? `${result.latencyMs} ms` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Protocol / Encryption Status */}
                <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs text-argus-600 dark:text-slate-400 font-medium">Transport Protocol</span>
                  <div className="flex items-center gap-2 pt-1">
                    {result.protocol === 'https' ? (
                      <>
                        <Lock className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase">HTTPS (Encrypted)</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase">HTTP (Plaintext)</span>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Card 2: Security Header Audit Table */}
            <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-argus-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Security Header Audit Table
                </h2>
                <div className="text-xs font-medium text-argus-600 dark:text-slate-400">
                  Target: <span className="font-mono text-argus-900 dark:text-white">{result.target}</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-argus-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-argus-100 dark:bg-slate-900/80 text-argus-700 dark:text-slate-300 border-b border-argus-200 dark:border-slate-800 font-semibold">
                      <th className="p-3.5">Header Name</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Observed Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-argus-200 dark:divide-slate-800 text-argus-800 dark:text-slate-200 font-mono">
                    {allMonitoredHeaders.map((headerKey) => {
                      const presentValue = result.securityHeaders[headerKey];
                      const isPresent = Boolean(presentValue);
                      const displayName = CANONICAL_HEADER_NAMES[headerKey] || headerKey;

                      return (
                        <tr key={headerKey} className="hover:bg-argus-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 font-bold font-sans text-argus-900 dark:text-white">
                            {displayName}
                            <span className="block text-[10px] font-mono text-argus-500 dark:text-slate-400 font-normal">
                              {headerKey}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {isPresent ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold font-sans bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold font-sans bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Missing
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 max-w-md truncate text-argus-700 dark:text-slate-300">
                            {isPresent ? (
                              <span title={presentValue} className="bg-argus-100 dark:bg-slate-900 px-2 py-1 rounded border border-argus-200 dark:border-slate-800 text-[11px]">
                                {presentValue}
                              </span>
                            ) : (
                              <span className="text-argus-400 dark:text-slate-500 italic font-sans text-[11px]">
                                Not configured / header omitted
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
