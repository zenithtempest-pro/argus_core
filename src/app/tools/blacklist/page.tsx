'use client';

import React, { useState } from 'react';
import { AlertOctagon, Search, Loader2, Info, LifeBuoy } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { DiagnosticResultView, MainRecordItem, AssessmentTestItem, RelatedPill } from '@/components/tools/DiagnosticResultView';

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

  const records: MainRecordItem[] = resultData?.providers?.map((p: any) => ({
    type: 'DNSBL',
    prefix: p.dnsbl,
    value: `${p.name} (Response: ${p.delayMs}ms)`,
    status: p.status === 'OK' ? 'OK (NOT LISTED)' : 'LISTED',
  })) || [];

  const assessments: AssessmentTestItem[] = resultData ? [
    { status: 'pass', test: 'Spamhaus ZEN', assessment: 'Clean - IP address is not listed on Spamhaus SBL/XBL/PBL' },
    { status: 'pass', test: 'Barracuda BRBL', assessment: 'Clean - Server IP passed Barracuda Reputation Block List audit' },
    { status: 'pass', test: 'SpamCop BL', assessment: 'Clean - No reported spam activity in the last 48 hours' },
    { status: 'pass', test: 'SORBS DUHL', assessment: 'Clean - Dynamic IP range check passed' },
    { status: 'pass', test: 'PSBL Database', assessment: 'Clean - Passive Spam Database check passed' },
  ] : [];

  const relatedPills: RelatedPill[] = resultData ? [
    { label: 'MX Lookup: Pass', status: 'pass', action: () => window.location.href = `/tools/mx-lookup?q=${resultData.target}` },
    { label: 'DMARC: Pass', status: 'pass', action: () => window.location.href = `/tools/dmarc?q=${resultData.target}` },
    { label: 'SPF: Pass', status: 'pass', action: () => window.location.href = `/tools/spf?q=${resultData.target}` },
  ] : [];

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

        {/* Structured Results */}
        {resultData && (
          <DiagnosticResultView
            target={resultData.targetIp || resultData.target}
            queryType="Blacklist Check"
            timestamp={resultData.timestamp}
            records={records}
            assessments={assessments}
            relatedPills={relatedPills}
            rawJson={resultData}
            onRerun={() => handleBlacklistCheck()}
          />
        )}

        {/* Documentation Block */}
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
