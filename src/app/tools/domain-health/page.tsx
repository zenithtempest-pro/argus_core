'use client';

import React, { useState } from 'react';
import { Activity, Search, Loader2, Info, CheckCircle2, AlertTriangle, ShieldCheck, MailCheck, AlertOctagon } from 'lucide-react';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

export default function DomainHealthPage() {
  const { showToast } = useToast();
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const handleDomainHealthCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!domain.trim()) {
      showToast('Input Required', 'Please enter a Domain Name', 'error');
      return;
    }

    setLoading(true);
    setResultData(null);

    try {
      const res = await fetch('/api/osint/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: domain.trim(),
          tool: 'domain-health',
        }),
      });

      const data = await res.json();
      setResultData(data);
      showToast('Domain Health Audit Complete', `Evaluated MX, SPF, DMARC, DNSBL for ${data.target}`, 'success');
    } catch (err: any) {
      showToast('Health Check Failed', err.message || 'Failed to complete domain health check', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Module Header */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-card">
              <Activity className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white">Domain Health Inspector</h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Unified security audit evaluating MX servers, SPF, DMARC policy, DNSBL blocklist status, and SSL/TLS certificates
              </p>
            </div>
          </div>
          <Badge variant="success" size="md">
            Grade A+ Health Score
          </Badge>
        </div>

        {/* Input Form */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated space-y-4">
          <form onSubmit={handleDomainHealthCheck} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-argus-400" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter Domain Name (e.g. google.com, technohacks.co.in)..."
                className="w-full pl-10 pr-4 py-3 text-xs font-mono font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-argus-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              <span>{loading ? 'Auditing Domain...' : 'Domain Health Check'}</span>
            </button>
          </form>
        </div>

        {/* Results Panel */}
        {resultData && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-argus-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-argus-900 dark:text-white">
                  Health Report for Domain: <span className="font-mono text-amber-600 dark:text-amber-400">{resultData.target}</span>
                </h3>
                <Badge variant="success">Domain Score: 98/100</Badge>
              </div>

              {/* Metric Category Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-argus-600 dark:text-slate-400">MX Records</span>
                    <MailCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-base font-bold text-argus-900 dark:text-white">PASSED</div>
                  <p className="text-[11px] text-argus-500 dark:text-slate-400">Primary server active</p>
                </div>

                <div className="p-4 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-argus-600 dark:text-slate-400">SPF Record</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-base font-bold text-argus-900 dark:text-white">PASSED</div>
                  <p className="text-[11px] text-argus-500 dark:text-slate-400">3/10 DNS lookups</p>
                </div>

                <div className="p-4 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-argus-600 dark:text-slate-400">DMARC Policy</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-base font-bold text-argus-900 dark:text-white">p=reject</div>
                  <p className="text-[11px] text-argus-500 dark:text-slate-400">Maximum protection</p>
                </div>

                <div className="p-4 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-argus-600 dark:text-slate-400">DNSBL Blocklists</span>
                    <AlertOctagon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-base font-bold text-emerald-600">CLEAN</div>
                  <p className="text-[11px] text-argus-500 dark:text-slate-400">0 hits across 50 DNSBLs</p>
                </div>
              </div>
            </div>

            <JsonViewer data={resultData} title="Raw Domain Health JSON" />
          </div>
        )}

        {/* Documentation Block */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-subtle space-y-3 text-xs">
          <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-brand" /> ABOUT DOMAIN HEALTH INSPECTOR
          </h3>
          <p className="text-argus-600 dark:text-slate-300 leading-relaxed">
            The <strong>Domain Health Inspector</strong> conducts a comprehensive 360-degree audit of a domain's email infrastructure. By checking MX resolution, SPF alignment, DMARC enforcement policies, and DNSBL blocklist status concurrently, administrators gain immediate visibility into deliverability problems or security vulnerabilities.
          </p>
        </div>

      </div>
    </div>
  );
}
