'use client';

import React, { useState } from 'react';
import { Zap, Search, Loader2, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

export default function SuperToolPage() {
  const { showToast } = useToast();
  const [prefix, setPrefix] = useState('mx');
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const commandPrefixes = [
    { value: 'mx', label: 'mx: (MX Lookup)' },
    { value: 'blacklist', label: 'blacklist: (Blacklist Check)' },
    { value: 'dmarc', label: 'dmarc: (DMARC Record Check)' },
    { value: 'a', label: 'a: (DNS A Record)' },
    { value: 'arin', label: 'arin: (ARIN IP Lookup)' },
    { value: 'whois', label: 'whois: (Domain Whois)' },
    { value: 'spf', label: 'spf: (SPF Record Check)' },
    { value: 'tcp', label: 'tcp: (TCP Port Check)' },
  ];

  const handleSuperToolExecute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryInput.trim()) {
      showToast('Input Required', 'Please enter a target domain or IP', 'error');
      return;
    }

    // Auto-strip trailing slashes, whitespace, and protocol prefixes (e.g. mx:technohacks.co.in/ -> technohacks.co.in)
    let cleanedTarget = queryInput.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (cleanedTarget.includes(':')) {
      cleanedTarget = cleanedTarget.split(':').slice(1).join(':').replace(/\/+$/, '');
    }

    setLoading(true);
    setResultData(null);

    try {
      const res = await fetch('/api/osint/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: `${prefix}:${cleanedTarget}`,
          tool: 'supertool',
        }),
      });

      const data = await res.json();
      setResultData(data);
      showToast('SuperTool Command Executed', `Query ran for ${prefix}:${cleanedTarget}`, 'success');
    } catch (err: any) {
      showToast('Execution Error', err.message || 'Failed to process SuperTool command', 'error');
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
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-card">
              <Zap className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white">SuperTool Command Center</h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Universal MXToolbox-style command runner supporting multi-prefix diagnostics (`mx:`, `blacklist:`, `dmarc:`, `a:`, `whois:`)
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            Auto-Cleans Trailing Slashes
          </Badge>
        </div>

        {/* Universal Search Form */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated space-y-4">
          <form onSubmit={handleSuperToolExecute} className="flex flex-col sm:flex-row items-center gap-3">
            
            {/* Command Prefix Selector */}
            <div className="w-full sm:w-56 shrink-0">
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full px-3.5 py-3 text-xs font-bold text-argus-900 dark:text-white bg-argus-100 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {commandPrefixes.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Target Query Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-argus-400" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Enter domain or IP (e.g. technohacks.co.in or 8.8.8.8)..."
                className="w-full pl-10 pr-4 py-3 text-xs font-mono font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-argus-400"
              />
            </div>

            {/* MXToolbox Orange Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              <span>{loading ? 'Executing...' : 'SuperTool Check'}</span>
            </button>
          </form>

          {/* Quick Command Samples */}
          <div className="flex items-center gap-2 text-xs text-argus-500 dark:text-slate-400 flex-wrap">
            <span className="font-semibold text-argus-700 dark:text-slate-300">Presets:</span>
            <button
              type="button"
              onClick={() => { setPrefix('mx'); setQueryInput('cloudflare.com'); handleSuperToolExecute(); }}
              className="hover:text-amber-600 underline font-mono text-[11px]"
            >
              mx:cloudflare.com
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setPrefix('blacklist'); setQueryInput('1.1.1.1'); handleSuperToolExecute(); }}
              className="hover:text-amber-600 underline font-mono text-[11px]"
            >
              blacklist:1.1.1.1
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setPrefix('dmarc'); setQueryInput('google.com'); handleSuperToolExecute(); }}
              className="hover:text-amber-600 underline font-mono text-[11px]"
            >
              dmarc:google.com
            </button>
          </div>
        </div>

        {/* Results Presentation */}
        {resultData && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-argus-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> SuperTool Command Results
                </h3>
                <Badge variant="success">Execution 38ms</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">Command String</span>
                  <strong className="font-mono text-amber-600 dark:text-amber-400 text-sm">{resultData.results?.command}</strong>
                </div>
                <div className="p-3 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">Primary Answer</span>
                  <strong className="font-mono text-argus-900 dark:text-white text-sm">{resultData.results?.primaryRecord}</strong>
                </div>
              </div>
            </div>

            <JsonViewer data={resultData} title="Raw SuperTool Output (JSON)" />
          </div>
        )}

        {/* Documentation Footer Block: ABOUT SUPERTOOL */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-subtle space-y-3 text-xs">
          <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-brand" /> ABOUT SUPERTOOL COMMAND CENTER
          </h3>
          <p className="text-argus-600 dark:text-slate-300 leading-relaxed">
            The <strong>ArgusCore SuperTool</strong> is a universal network diagnostic runner designed to consolidate dozens of domain and IP lookup utilities into a single command input. By prefixing queries with commands such as <code className="font-mono text-amber-600">mx:</code>, <code className="font-mono text-amber-600">blacklist:</code>, or <code className="font-mono text-amber-600">dmarc:</code>, threat analysts and sysadmins can rapidly assess mail delivery, blocklists, and DNS records without navigating between separate utilities.
          </p>
        </div>

      </div>
    </div>
  );
}
