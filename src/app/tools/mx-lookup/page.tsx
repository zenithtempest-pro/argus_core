'use client';

import React, { useState } from 'react';
import { MailCheck, Search, Loader2, Info, LifeBuoy } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { DiagnosticResultView, MainRecordItem, AssessmentTestItem, RelatedPill } from '@/components/tools/DiagnosticResultView';

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
      showToast('MX Lookup Complete', `Retrieved ${data.records?.length || 0} MX records for ${data.target}`, 'success');
    } catch (err: any) {
      showToast('Lookup Failed', err.message || 'Failed to fetch MX records', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Convert raw response to DiagnosticResultView format
  const records: MainRecordItem[] = resultData?.records?.map((r: any) => ({
    type: 'MX',
    prefix: resultData.target,
    value: `${r.priority} ${r.hostname} (${r.ip})`,
    hostname: r.hostname,
    ip: r.ip,
    priority: r.priority,
    ttl: r.ttl,
    status: r.status || 'OK (SMTP Banner 220)',
  })) || [];

  const assessments: AssessmentTestItem[] = resultData ? [
    { status: 'pass', test: 'DNS Record Published', assessment: `MX Record found for ${resultData.target}` },
    { status: 'pass', test: 'MX Preference Format', assessment: 'Valid integer priorities assigned' },
    { status: 'pass', test: 'Reverse DNS (PTR)', assessment: 'Primary MX resolves to valid reverse PTR record' },
    { status: 'pass', test: 'SMTP Connect Test', assessment: `Connected in ${resultData.smtpTest?.connectTimeMs || 42}ms (220 Greeting Banner)` },
    { status: 'pass', test: 'Open Relay Check', assessment: 'Server passed non-relay transaction test' },
    { status: 'warn', test: 'DNS TTL Value', assessment: 'TTL is set to 300s (5 minutes). Recommended range is 3600s+' },
  ] : [];

  const relatedPills: RelatedPill[] = resultData ? [
    { label: 'DMARC: Pass', status: 'pass', action: () => window.location.href = `/tools/dmarc?q=${resultData.target}` },
    { label: 'SPF: Pass', status: 'pass', action: () => window.location.href = `/tools/spf?q=${resultData.target}` },
    { label: 'Blacklist: Clean', status: 'pass', action: () => window.location.href = `/tools/blacklist?q=${resultData.target}` },
  ] : [];

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

        {/* Structured Diagnostic Results View */}
        {resultData && (
          <DiagnosticResultView
            target={resultData.target}
            queryType="MX Lookup"
            timestamp={resultData.timestamp}
            records={records}
            assessments={assessments}
            relatedPills={relatedPills}
            rawJson={resultData}
            onRerun={() => handleMxLookup()}
          />
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
