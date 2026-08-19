'use client';

import React, { useState } from 'react';
import { AlertOctagon, Search, Loader2, Info, CheckCircle2, ShieldAlert, LifeBuoy } from 'lucide-react';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

export default function BlacklistPage() {
  const { showToast } = useToast();
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const handleBlacklistCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!target.trim()) {
      showToast('Input Required', 'Please enter a Server IP or Domain', 'error');
      return;
    }

    setLoading(true);
    setResultData(null);

    try {
      const res = await fetch('/api/osint/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: target.trim(),
          tool: 'blacklist',
        }),
      });

      const data = await res.json();
      setResultData(data);
      showToast('Blacklist Audit Complete', `Checked ${data.totalChecked} DNSBL databases for ${data.target}`, 'success');
    } catch (err: any) {
      showToast('Check Failed', err.message || 'Failed to query DNSBL blocklists', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSolveDelivery = () => {
    showToast('Email Delivery Assistant', 'Initiating MXToolbox-style Email Deliverability Diagnostic wizard...', 'info');
  };

  return (
    <div className="py-10 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Module Header Card */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-card">
              <AlertOctagon className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white">Email Blacklist / Blocklist Checker</h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Check if your mail server IP address or domain is listed on major anti-spam DNSBL databases (Spamhaus, Barracuda, SORBS, SpamCop)
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            Checks 50+ DNSBLs
          </Badge>
        </div>

        {/* Input Form with Orange & Cyan Action Buttons */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated space-y-4">
          <form onSubmit={handleBlacklistCheck} className="flex flex-col md:flex-row items-center gap-3">
            
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-argus-400" />
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Server IP or Domain (e.g. 104.21.48.92 or mail.example.com)..."
                className="w-full pl-10 pr-4 py-3 text-xs font-mono font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-argus-400"
              />
            </div>

            {/* Action Button 1: MXToolbox Orange Blacklist Check */}
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertOctagon className="w-4 h-4" />}
              <span>{loading ? 'Scanning DNSBLs...' : 'Blacklist Check'}</span>
            </button>

            {/* Action Button 2: MXToolbox Cyan Solve Email Delivery Problems */}
            <button
              type="button"
              onClick={handleSolveDelivery}
              className="w-full md:w-auto px-5 py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Solve Email Delivery Problems</span>
            </button>

          </form>
        </div>

        {/* Results Panel */}
        {resultData && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
              <div className="p-5 bg-argus-50 dark:bg-slate-900 border-b border-argus-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-argus-900 dark:text-white">
                    DNSBL Reputation Audit: <span className="font-mono text-amber-600 dark:text-amber-400">{resultData.targetIp}</span>
                  </h3>
                  <p className="text-xs text-argus-500 dark:text-slate-400 mt-0.5">
                    Checked {resultData.totalChecked} major blocklist databases
                  </p>
                </div>
                <Badge variant={resultData.listedCount === 0 ? 'success' : 'error'}>
                  {resultData.listedCount === 0 ? '0 Blocklist Hits (CLEAN)' : `${resultData.listedCount} LISTED`}
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-argus-50 dark:bg-slate-900 text-argus-500 dark:text-slate-400 font-bold border-b border-argus-200 dark:border-slate-800">
                      <th className="py-3 px-4">DNSBL Server</th>
                      <th className="py-3 px-4">Database Name</th>
                      <th className="py-3 px-4">Response Time</th>
                      <th className="py-3 px-4 text-right">Reputation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-argus-200 dark:divide-slate-800">
                    {resultData.providers.map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-argus-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-argus-900 dark:text-white">{p.dnsbl}</td>
                        <td className="py-3 px-4 font-semibold text-argus-800 dark:text-slate-200">{p.name}</td>
                        <td className="py-3 px-4 font-mono text-argus-500 dark:text-slate-400">{p.delayMs}ms</td>
                        <td className="py-3 px-4 text-right">
                          {p.status === 'OK' ? (
                            <Badge variant="success">OK</Badge>
                          ) : (
                            <Badge variant="error">LISTED</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <JsonViewer data={resultData} title="Raw Blacklist JSON Response" />
          </div>
        )}

        {/* Documentation Block: ABOUT BLACKLIST CHECK */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-subtle space-y-3 text-xs">
          <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-brand" /> ABOUT BLACKLIST CHECK
          </h3>
          <p className="text-argus-600 dark:text-slate-300 leading-relaxed">
            The <strong>Blacklist Checker</strong> queries your mail server’s IP address against major Domain Name System-based Blackhole Lists (DNSBLs). If an IP address becomes listed on a blocklist like Spamhaus or Barracuda, outbound email from that server may be bounced or flagged as spam by receiving mail providers (Gmail, Outlook, Yahoo). Performing regular blacklist checks ensures high email deliverability and alerts administrators to potential server compromises.
          </p>
        </div>

      </div>
    </div>
  );
}
