'use client';

import React, { useState } from 'react';
import { ShieldCheck, Search, Loader2, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

export default function DmarcPage() {
  const { showToast } = useToast();
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const handleDmarcCheck = async (e?: React.FormEvent) => {
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
          tool: 'dmarc',
        }),
      });

      const data = await res.json();
      setResultData(data);
      showToast('DMARC Check Completed', `Analyzed DMARC policy for ${data.target}`, 'success');
    } catch (err: any) {
      showToast('DMARC Query Failed', err.message || 'Failed to fetch DMARC TXT record', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-card">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white">DMARC Record Inspector</h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Parse `_dmarc.domain.com` TXT records, inspect enforcement policy (`p=reject|quarantine|none`), and verify RFC 7489 alignment
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            RFC 7489 Compliant
          </Badge>
        </div>

        {/* Input Form */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated space-y-4">
          <form onSubmit={handleDmarcCheck} className="flex flex-col sm:flex-row items-center gap-3">
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{loading ? 'Inspecting DMARC...' : 'DMARC Check'}</span>
            </button>
          </form>
        </div>

        {/* Results Panel */}
        {resultData && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-argus-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-argus-900 dark:text-white">
                  DMARC Record for <span className="font-mono text-amber-600 dark:text-amber-400">{resultData.dmarcHost}</span>
                </h3>
                <Badge variant={resultData.complianceStatus === 'PASS' ? 'success' : 'warning'}>
                  DMARC {resultData.complianceStatus}
                </Badge>
              </div>

              {/* Raw Record String */}
              <div className="p-3 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-argus-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Raw TXT Record
                </span>
                <code className="font-mono text-xs text-argus-900 dark:text-white block break-all">
                  {resultData.rawRecord}
                </code>
              </div>

              {/* Parsed Tags Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {Object.entries(resultData.parsedTags || {}).map(([tag, val]: any, idx) => (
                  <div key={idx} className="p-3 bg-argus-50/50 dark:bg-slate-900/50 rounded-xl border border-argus-200 dark:border-slate-800">
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs uppercase">{tag}</span>
                    <p className="text-xs text-argus-800 dark:text-slate-200 mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            <JsonViewer data={resultData} title="Raw DMARC Record JSON" />
          </div>
        )}

        {/* Documentation Block: ABOUT DMARC RECORD CHECK */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-subtle space-y-3 text-xs">
          <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-brand" /> ABOUT DMARC RECORD CHECK
          </h3>
          <p className="text-argus-600 dark:text-slate-300 leading-relaxed">
            <strong>DMARC (Domain-based Message Authentication, Reporting, and Conformance)</strong> is an email authentication protocol that builds upon SPF and DKIM. It allows domain owners to declare how receiving mail servers should handle unauthenticated emails sending from their domain (e.g., <code className="font-mono text-amber-600">p=reject</code> or <code className="font-mono text-amber-600">p=quarantine</code>). DMARC prevents phishing and domain spoofing attacks.
          </p>
        </div>

      </div>
    </div>
  );
}
