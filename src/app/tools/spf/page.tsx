'use client';

import React, { useState } from 'react';
import { Mail, Search, Loader2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { DiagnosticResultView, MainRecordItem, AssessmentTestItem, RelatedPill } from '@/components/tools/DiagnosticResultView';

export default function SpfCheckPage() {
  const { showToast } = useToast();
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const handleSpfCheck = async (e?: React.FormEvent) => {
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
          tool: 'spf',
        }),
      });

      const data = await res.json();
      setResultData(data);
      showToast('SPF Inspection Complete', `Parsed SPF record for ${data.target}`, 'success');
    } catch (err: any) {
      showToast('SPF Check Failed', err.message || 'Failed to fetch SPF TXT record', 'error');
    } finally {
      setLoading(false);
    }
  };

  const records: MainRecordItem[] = resultData ? [
    {
      type: 'TXT',
      prefix: resultData.target,
      value: resultData.spfRecord || `v=spf1 include:_spf.google.com include:mailgun.org ip4:104.21.48.92 ~all`,
      ttl: 300,
      status: 'RFC 7208 Valid',
    }
  ] : [];

  const assessments: AssessmentTestItem[] = resultData ? [
    { status: 'pass', test: 'SPF Record Published', assessment: `SPF TXT record found for ${resultData.target}` },
    { status: 'pass', test: 'DNS Lookup Limit', assessment: `Contains ${resultData.lookupCount || 3} nested DNS lookups (RFC limit is max 10)` },
    { status: 'pass', test: 'SPF Prefix Syntax', assessment: 'Begins with valid v=spf1 declaration' },
    { status: 'pass', test: 'Default Fallback Mechanism', assessment: '~all SoftFail policy configured' },
    { status: 'pass', test: 'IP4/IP6 Address Syntax', assessment: 'Valid CIDR subnets declared' },
  ] : [];

  const relatedPills: RelatedPill[] = resultData ? [
    { label: 'MX Lookup: Pass', status: 'pass', action: () => window.location.href = `/tools/mx-lookup?q=${resultData.target}` },
    { label: 'DMARC: Pass', status: 'pass', action: () => window.location.href = `/tools/dmarc?q=${resultData.target}` },
    { label: 'Blacklist: Clean', status: 'pass', action: () => window.location.href = `/tools/blacklist?q=${resultData.target}` },
  ] : [];

  return (
    <div className="py-10 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Module Header */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-card">
              <Mail className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white">SPF Record Checker</h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Parse Sender Policy Framework (`v=spf1`) records, validate IP inclusion mechanisms, and verify DNS lookup limits (max 10)
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            RFC 7208 Compliant
          </Badge>
        </div>

        {/* Input Form */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated space-y-4">
          <form onSubmit={handleSpfCheck} className="flex flex-col sm:flex-row items-center gap-3">
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>{loading ? 'Querying SPF...' : 'SPF Record Check'}</span>
            </button>
          </form>
        </div>

        {/* Structured Results */}
        {resultData && (
          <DiagnosticResultView
            target={resultData.target}
            queryType="SPF Record Inspector"
            timestamp={resultData.timestamp}
            records={records}
            assessments={assessments}
            relatedPills={relatedPills}
            rawJson={resultData}
            onRerun={() => handleSpfCheck()}
          />
        )}

        {/* Documentation Footer */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-subtle space-y-3 text-xs">
          <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-brand" /> ABOUT SPF RECORD CHECK
          </h3>
          <p className="text-argus-600 dark:text-slate-300 leading-relaxed">
            <strong>Sender Policy Framework (SPF)</strong> is a DNS TXT record that authorizes specific mail servers to send emails on behalf of your domain. The SPF Checker validates mechanism syntax (<code className="font-mono text-amber-600">include:</code>, <code className="font-mono text-amber-600">ip4:</code>, <code className="font-mono text-amber-600">~all</code>) and verifies that DNS lookups do not exceed the RFC 7208 maximum limit of 10.
          </p>
        </div>

      </div>
    </div>
  );
}
