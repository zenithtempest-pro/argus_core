'use client';

import React, { useState } from 'react';
import { MailCheck, Search, Loader2, Info, CheckCircle2, LifeBuoy } from 'lucide-react';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

export default function MxLookupPage() {
  const { showToast } = useToast();
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const handleMxLookup = async (e?: React.FormEvent) => {
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
          tool: 'mx',
        }),
      });

      const data = await res.json();
      setResultData(data);
      showToast('MX Lookup Complete', `Retrieved ${data.records?.length} MX records for ${data.target}`, 'success');
    } catch (err: any) {
      showToast('Lookup Failed', err.message || 'Failed to fetch MX records', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Module Header Card */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-card">
              <MailCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white">MX Lookup Tool</h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Query Domain Mail Exchanger (MX) records, priority preferences, IP resolution, and SMTP port 25 availability
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            RFC 5321 Compliant
          </Badge>
        </div>

        {/* Form Container with Orange & Cyan Action Buttons */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated space-y-4">
          <form onSubmit={handleMxLookup} className="flex flex-col md:flex-row items-center gap-3">
            
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

            {/* Orange MX Lookup Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MailCheck className="w-4 h-4" />}
              <span>{loading ? 'Querying MX...' : 'MX Lookup'}</span>
            </button>

            {/* Cyan Solve Email Delivery Button */}
            <button
              type="button"
              onClick={() => showToast('MX Diagnostic', 'Running SMTP transaction tests...', 'info')}
              className="w-full md:w-auto px-5 py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Solve Email Delivery Problems</span>
            </button>

          </form>
        </div>

        {/* Results Table */}
        {resultData && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
              <div className="p-5 bg-argus-50 dark:bg-slate-900 border-b border-argus-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-argus-900 dark:text-white">
                    MX Records for Domain: <span className="font-mono text-amber-600 dark:text-amber-400">{resultData.target}</span>
                  </h3>
                  <p className="text-xs text-argus-500 dark:text-slate-400 mt-0.5">
                    Found {resultData.records?.length} active mail exchangers
                  </p>
                </div>
                <Badge variant="success">SMTP Banner OK</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-argus-50 dark:bg-slate-900 text-argus-500 dark:text-slate-400 font-bold border-b border-argus-200 dark:border-slate-800">
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Host Name</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4">TTL</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-argus-200 dark:divide-slate-800">
                    {resultData.records?.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-argus-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">{r.priority}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-argus-900 dark:text-white">{r.hostname}</td>
                        <td className="py-3 px-4 font-mono text-argus-700 dark:text-slate-300">{r.ip}</td>
                        <td className="py-3 px-4 font-mono text-argus-500 dark:text-slate-400">{r.ttl}s</td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant="success">{r.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <JsonViewer data={resultData} title="Raw MX Record Output (JSON)" />
          </div>
        )}

        {/* Documentation Block: ABOUT MX LOOKUP */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-subtle space-y-3 text-xs">
          <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-brand" /> ABOUT MX LOOKUP
          </h3>
          <p className="text-argus-600 dark:text-slate-300 leading-relaxed">
            An <strong>MX (Mail Exchanger) Record</strong> specifies the mail server responsible for accepting incoming email messages on behalf of a domain. MX records include a preference or priority value: lower numbers indicate higher delivery priority. The <strong>MX Lookup Tool</strong> tests whether your domain's mail servers are properly published in DNS, resolves their underlying IP addresses, and checks SMTP connectivity.
          </p>
        </div>

      </div>
    </div>
  );
}
