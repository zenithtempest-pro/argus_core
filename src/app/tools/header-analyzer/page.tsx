'use client';

import React, { useState } from 'react';
import { FileCode, Search, Loader2, Info, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

export default function HeaderAnalyzerPage() {
  const { showToast } = useToast();
  const [rawHeader, setRawHeader] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const sampleRawHeader = `Received: from mail-node1.example.com (mail-node1.example.com [104.21.48.92])
    by mx.google.com with ESMTPS id x19-20260818.1200
    for <analyst@agency.gov>; Tue, 18 Aug 2026 12:00:01 -0700 (PDT)
ARC-Authentication-Results: i=1; mx.google.com;
    dkim=pass header.i=@example.com header.s=google header.b=X8A912;
    spf=pass (google.com: domain of security@example.com designates 104.21.48.92 as permitted sender)
Subject: ArgusCore Security Intelligence Alert
From: Security Operations <security@example.com>
To: analyst@agency.gov
Date: Tue, 18 Aug 2026 12:00:00 -0700`;

  const handleAnalyzeHeader = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rawHeader.trim()) {
      showToast('Input Required', 'Please paste RFC 822 email headers into the textarea', 'error');
      return;
    }

    setLoading(true);
    setResultData(null);

    try {
      const res = await fetch('/api/osint/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: 'example.com',
          tool: 'header-analyzer',
          rawHeader: rawHeader.trim(),
        }),
      });

      const data = await res.json();
      setResultData(data);
      showToast('Header Analysis Complete', 'Parsed email hop delays & SPF/DKIM authentication', 'success');
    } catch (err: any) {
      showToast('Analysis Failed', err.message || 'Failed to parse RFC 822 header', 'error');
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
              <FileCode className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white">Email Header Analyzer</h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Paste raw RFC 822 email headers to calculate hop delays, verify SPF/DKIM signatures, and detect phishing relays
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            RFC 822 Forensics
          </Badge>
        </div>

        {/* Textarea Input Form */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated space-y-4">
          <form onSubmit={handleAnalyzeHeader} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-argus-800 dark:text-slate-200">
                Paste Raw Email Headers (RFC 822)
              </label>
              <button
                type="button"
                onClick={() => setRawHeader(sampleRawHeader)}
                className="text-xs font-semibold text-brand dark:text-blue-400 hover:underline"
              >
                Load Sample Header
              </button>
            </div>

            <textarea
              rows={7}
              value={rawHeader}
              onChange={(e) => setRawHeader(e.target.value)}
              placeholder="Paste raw email header here starting with Received: from..."
              className="w-full p-3.5 text-xs font-mono bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-argus-400"
              required
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCode className="w-4 h-4" />}
                <span>{loading ? 'Analyzing Hops...' : 'Analyze Header'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results Breakdown */}
        {resultData && (
          <div className="space-y-6 animate-in fade-in">
            {/* Hop Delays Table */}
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
              <div className="p-5 bg-argus-50 dark:bg-slate-900 border-b border-argus-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-argus-900 dark:text-white">
                    Email Delivery Hops & Delay Analysis
                  </h3>
                  <p className="text-xs text-argus-500 dark:text-slate-400 mt-0.5">
                    Subject: <strong>{resultData.subject}</strong>
                  </p>
                </div>
                <Badge variant="success">Spam Score: {resultData.spamVerdict?.score}</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-argus-50 dark:bg-slate-900 text-argus-500 dark:text-slate-400 font-bold border-b border-argus-200 dark:border-slate-800">
                      <th className="py-3 px-4">Hop #</th>
                      <th className="py-3 px-4">From Host</th>
                      <th className="py-3 px-4">Received By</th>
                      <th className="py-3 px-4">Protocol</th>
                      <th className="py-3 px-4 text-right">Delay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-argus-200 dark:divide-slate-800">
                    {resultData.hopDelays?.map((h: any, idx: number) => (
                      <tr key={idx} className="hover:bg-argus-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">Hop {h.hop}</td>
                        <td className="py-3 px-4 font-mono text-argus-900 dark:text-white">{h.from}</td>
                        <td className="py-3 px-4 font-mono text-argus-700 dark:text-slate-300">{h.by}</td>
                        <td className="py-3 px-4 font-mono text-argus-500 dark:text-slate-400">{h.protocol}</td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {h.delaySec}s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SPF / DKIM Authentication Breakdown */}
              <div className="p-5 border-t border-argus-200 dark:border-slate-800 bg-argus-50/50 dark:bg-slate-900/50 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-argus-500 uppercase block mb-1">SPF Status</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{resultData.authentication?.spf?.status}</span>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-argus-500 uppercase block mb-1">DKIM Signature</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{resultData.authentication?.dkim?.status} (selector: {resultData.authentication?.dkim?.selector})</span>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-argus-500 uppercase block mb-1">Spam Verdict</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{resultData.spamVerdict?.verdict}</span>
                  </div>
                </div>
              </div>

            </div>

            <JsonViewer data={resultData} title="Parsed Email Header JSON" />
          </div>
        )}

        {/* Documentation Block: ABOUT EMAIL HEADERS */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-subtle space-y-3 text-xs">
          <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-brand" /> ABOUT EMAIL HEADERS
          </h3>
          <p className="text-argus-600 dark:text-slate-300 leading-relaxed">
            Email headers contain crucial metadata detailing the path an email message traveled from sender to recipient. Each mail transfer agent (MTA) appends a <code className="font-mono text-amber-600">Received:</code> header tag with exact timestamps. Analyzing email headers allows security analysts to calculate hop delays, trace origin IP addresses, verify cryptographic SPF/DKIM signatures, and uncover email spoofing or phishing attempts.
          </p>
        </div>

      </div>
    </div>
  );
}
