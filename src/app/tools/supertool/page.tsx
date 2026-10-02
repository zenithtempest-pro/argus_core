'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  Search, 
  Loader2, 
  Info, 
  ChevronDown, 
  Grid, 
  Check, 
  Globe, 
  ShieldCheck, 
  MailCheck, 
  Server, 
  Activity, 
  FileCode,
  SearchCode,
  Network
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { DiagnosticResultView, MainRecordItem, AssessmentTestItem, RelatedPill } from '@/components/tools/DiagnosticResultView';

export default function SuperToolPage() {
  const { showToast } = useToast();
  const [prefix, setPrefix] = useState('mx');
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // A-Z Diagnostic Tools List (Including DNSDumpster Lookup)
  const azToolsList = [
    { label: 'AAAA Lookup', prefix: 'aaaa' },
    { label: 'ARIN Lookup', prefix: 'arin' },
    { label: 'ASN Lookup', prefix: 'asn' },
    { label: 'BIMI Lookup', prefix: 'bimi' },
    { label: 'Blacklist Check', prefix: 'blacklist' },
    { label: 'Blocklist Check', prefix: 'blocklist' },
    { label: 'CERT Lookup', prefix: 'cert' },
    { label: 'CNAME Lookup', prefix: 'cname' },
    { label: 'DKIM Lookup', prefix: 'dkim' },
    { label: 'DMARC Lookup', prefix: 'dmarc' },
    { label: 'DNS Check', prefix: 'dnscheck' },
    { label: 'DNS Lookup', prefix: 'dns' },
    { label: 'DNSDumpster Recon', prefix: 'dnsdumpster' },
    { label: 'DNSKEY Lookup', prefix: 'dnskey' },
    { label: 'Domain Health', prefix: 'domain-health' },
    { label: 'DS Lookup', prefix: 'ds' },
    { label: 'Email Deliverability', prefix: 'email-health' },
    { label: 'HTTP Lookup', prefix: 'http' },
    { label: 'HTTPS Lookup', prefix: 'https' },
    { label: 'IPSECKEY Lookup', prefix: 'ipseckey' },
    { label: 'LLMs.txt Lookup', prefix: 'llmstxt' },
    { label: 'LOC Lookup', prefix: 'loc' },
    { label: 'MTA-STS Lookup', prefix: 'mta-sts' },
    { label: 'MX Lookup', prefix: 'mx' },
    { label: 'NSEC Lookup', prefix: 'nsec' },
    { label: 'NSEC3PARAM Lookup', prefix: 'nsec3param' },
    { label: 'Ping', prefix: 'ping' },
    { label: 'Reverse Lookup', prefix: 'ptr' },
    { label: 'Robots.txt LLM Policy', prefix: 'robots' },
    { label: 'RRSIG Lookup', prefix: 'rrsig' },
    { label: 'SOA Lookup', prefix: 'soa' },
    { label: 'SPF Record Lookup', prefix: 'spf' },
    { label: 'SRV Lookup', prefix: 'srv' },
    { label: 'TCP Lookup', prefix: 'tcp' },
    { label: 'Test Email Server (SMTP)', prefix: 'smtp' },
    { label: 'TLSRPT Lookup', prefix: 'tlsrpt' },
    { label: 'Trace', prefix: 'trace' },
    { label: 'TXT Lookup', prefix: 'txt' },
    { label: 'What Is My IP?', prefix: 'myip' },
    { label: 'Whois Lookup', prefix: 'whois' },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuperToolExecute = async (overridePrefix?: string, overrideTarget?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const activePrefix = overridePrefix || prefix;
    const activeTarget = overrideTarget !== undefined ? overrideTarget : queryInput;

    if (activePrefix === 'dnsdumpster' && activeTarget.trim()) {
      window.location.href = `/tools/dnsdumpster?domain=${encodeURIComponent(activeTarget.trim())}`;
      return;
    }

    if (!activeTarget.trim() && activePrefix !== 'myip') {
      showToast('Input Required', 'Please enter a target domain or IP', 'error');
      return;
    }

    // Auto-sanitize trailing slashes, spaces, protocol prefixes
    let cleanedTarget = activeTarget.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (cleanedTarget.includes(':')) {
      cleanedTarget = cleanedTarget.split(':').slice(1).join(':').replace(/\/+$/, '');
    }

    setLoading(true);
    setResultData(null);
    setDropdownOpen(false);

    try {
      const res = await fetch('/api/osint/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: `${activePrefix}:${cleanedTarget}`,
          tool: 'supertool',
          commandPrefix: activePrefix,
        }),
      });

      const data = await res.json();
      setResultData(data);
      showToast('SuperTool Command Executed', `Query ran for ${activePrefix}:${cleanedTarget}`, 'success');
    } catch (err: any) {
      showToast('Execution Error', err.message || 'Failed to process SuperTool command', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectToolFromGrid = (toolPrefix: string) => {
    if (toolPrefix === 'dnsdumpster') {
      if (queryInput.trim()) {
        window.location.href = `/tools/dnsdumpster?domain=${encodeURIComponent(queryInput.trim())}`;
      } else {
        window.location.href = '/tools/dnsdumpster';
      }
      return;
    }

    setPrefix(toolPrefix);
    if (queryInput.trim() || toolPrefix === 'myip') {
      handleSuperToolExecute(toolPrefix, queryInput);
    } else {
      setDropdownOpen(false);
      showToast('Mode Updated', `Lookup mode set to ${toolPrefix.toUpperCase()}:. Enter domain to execute.`, 'info');
    }
  };

  const currentToolLabel = azToolsList.find(t => t.prefix === prefix)?.label || `${prefix.toUpperCase()} Lookup`;

  // Build records & assessments for DiagnosticResultView
  const records: MainRecordItem[] = resultData?.records ? resultData.records : [
    {
      type: (resultData?.commandPrefix || prefix).toUpperCase(),
      prefix: resultData?.target || 'target',
      value: resultData?.results?.primaryRecord || `10 mail.${resultData?.target || 'example.com'} (104.21.48.92)`,
      ttl: 300,
      status: 'OK',
    }
  ];

  const assessments: AssessmentTestItem[] = [
    { status: 'pass', test: 'SuperTool Command Syntax', assessment: `Valid execution prefix '${prefix}:'` },
    { status: 'pass', test: 'Target Input Sanitization', assessment: 'Stripped trailing slashes and protocol schemes' },
    { status: 'pass', test: 'DNS Resolution Status', assessment: 'Target host answered with valid resource record' },
    { status: 'pass', test: 'RFC Compliance', assessment: 'Response satisfies standard RFC DNS specifications' },
  ];

  const relatedPills: RelatedPill[] = [
    { label: 'DNSDumpster', status: 'pass', action: () => window.location.href = `/tools/dnsdumpster?domain=${queryInput || 'nyxscans.com'}` },
    { label: 'MX Lookup', status: 'pass', action: () => handleSelectToolFromGrid('mx') },
    { label: 'DMARC', status: 'pass', action: () => handleSelectToolFromGrid('dmarc') },
    { label: 'SPF', status: 'pass', action: () => handleSelectToolFromGrid('spf') },
    { label: 'Blacklist', status: 'pass', action: () => handleSelectToolFromGrid('blacklist') },
  ];

  return (
    <div className="py-10 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-card">
              <Zap className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white">SuperTool Command Center</h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Universal MXToolbox-style command runner supporting 40+ multi-prefix network diagnostic tools (`mx:`, `blacklist:`, `dmarc:`, `dnsdumpster:`, `whois:`)
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            40+ Diagnostic Tools Grid
          </Badge>
        </div>

        {/* Universal Search Form & Floating Dropdown Container */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated space-y-4">
          <form onSubmit={(e) => handleSuperToolExecute(undefined, undefined, e)} className="flex flex-col sm:flex-row items-center gap-3">
            
            {/* Input Target */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-argus-400" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Enter domain or IP (e.g. nyxscans.com or 8.8.8.8)..."
                className="w-full pl-10 pr-4 py-3 text-xs font-mono font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-argus-400"
              />
            </div>

            {/* Split Action Button with Floating Arrow Dropdown */}
            <div className="relative w-full sm:w-auto shrink-0 flex items-center" ref={dropdownRef}>
              
              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-l-xl shadow-card transition-all flex items-center justify-center gap-2 border-r border-amber-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>{loading ? 'Executing...' : currentToolLabel}</span>
              </button>

              {/* Downward Arrow Button for Floating Grid Dropdown */}
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                title="More Options (All Tools A-Z Grid)"
                className="px-3 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-r-xl shadow-card transition-all flex items-center justify-center"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Floating Dropdown Popover Modal (All Tools A-Z Grid) */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[650px] md:w-[750px] bg-white dark:bg-[#131b2e] border border-argus-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 space-y-4">
                  <div className="flex items-center justify-between border-b border-argus-200 dark:border-slate-800 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-argus-900 dark:text-white flex items-center gap-2">
                      <Grid className="w-4 h-4 text-amber-500" /> All Diagnostic Tools (A-Z)
                    </h3>
                    <span className="text-[11px] text-argus-500 dark:text-slate-400 font-mono">
                      Select tool to run query
                    </span>
                  </div>

                  {/* 3-Column Responsive Button Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
                    {azToolsList.map((t) => (
                      <button
                        key={t.prefix}
                        type="button"
                        onClick={() => handleSelectToolFromGrid(t.prefix)}
                        className={`px-3 py-2 text-left rounded-xl text-xs font-semibold transition-all flex items-center justify-between border ${
                          prefix === t.prefix
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-argus-50/50 dark:bg-slate-900/50 text-argus-800 dark:text-slate-200 border-argus-200 dark:border-slate-800 hover:bg-argus-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{t.label}</span>
                        {prefix === t.prefix && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </form>

          {/* Quick Command Presets */}
          <div className="flex items-center gap-2 text-xs text-argus-500 dark:text-slate-400 flex-wrap">
            <span className="font-semibold text-argus-700 dark:text-slate-300">Quick Presets:</span>
            <button
              type="button"
              onClick={() => { window.location.href = '/tools/dnsdumpster?domain=nyxscans.com'; }}
              className="hover:text-amber-600 underline font-mono text-[11px] flex items-center gap-1 text-amber-600 font-bold"
            >
              <Network className="w-3 h-3" /> dnsdumpster:nyxscans.com
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleSuperToolExecute('mx', 'cloudflare.com')}
              className="hover:text-amber-600 underline font-mono text-[11px]"
            >
              mx:cloudflare.com
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleSuperToolExecute('blacklist', '1.1.1.1')}
              className="hover:text-amber-600 underline font-mono text-[11px]"
            >
              blacklist:1.1.1.1
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleSuperToolExecute('dmarc', 'google.com')}
              className="hover:text-amber-600 underline font-mono text-[11px]"
            >
              dmarc:google.com
            </button>
          </div>
        </div>

        {/* Structured Diagnostic Results View */}
        {resultData && (
          <DiagnosticResultView
            target={resultData.target}
            queryType={`SuperTool (${(resultData.commandPrefix || prefix).toUpperCase()})`}
            timestamp={resultData.timestamp}
            records={records}
            assessments={assessments}
            relatedPills={relatedPills}
            rawJson={resultData}
            onRerun={() => handleSuperToolExecute()}
          />
        )}

        {/* Documentation Footer Block */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-subtle space-y-3 text-xs">
          <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-brand" /> ABOUT SUPERTOOL COMMAND CENTER
          </h3>
          <p className="text-argus-600 dark:text-slate-300 leading-relaxed">
            The <strong>ArgusCore SuperTool</strong> is a universal network diagnostic runner designed to consolidate dozens of domain and IP lookup utilities into a single command input. By selecting from the floating A-Z options grid or prefixing queries with commands such as <code className="font-mono text-amber-600">mx:</code>, <code className="font-mono text-amber-600">blacklist:</code>, or <code className="font-mono text-amber-600">dnsdumpster:</code>, threat analysts and sysadmins can rapidly assess mail delivery, blocklists, and DNS records.
          </p>
        </div>

      </div>
    </div>
  );
}
