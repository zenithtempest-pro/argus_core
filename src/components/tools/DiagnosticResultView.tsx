'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  ShieldCheck, 
  Clock, 
  Server, 
  Globe, 
  Check, 
  HelpCircle 
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { JsonViewer } from '@/components/ui/JsonViewer';

export interface MainRecordItem {
  type: string;
  prefix?: string;
  value: string;
  ttl?: number | string;
  ip?: string;
  hostname?: string;
  priority?: number;
  status?: string;
}

export interface AssessmentTestItem {
  status: 'pass' | 'warn' | 'fail' | 'info';
  test: string;
  assessment: string;
}

export interface RelatedPill {
  label: string;
  status: 'pass' | 'warn' | 'fail' | 'info';
  action?: () => void;
}

export interface DiagnosticResultViewProps {
  target: string;
  queryType: string;
  timestamp?: string;
  records?: MainRecordItem[];
  assessments?: AssessmentTestItem[];
  relatedPills?: RelatedPill[];
  rawJson?: any;
  onRerun?: () => void;
  reporter?: string;
}

export function DiagnosticResultView({
  target,
  queryType,
  timestamp = new Date().toUTCString(),
  records = [],
  assessments = [],
  relatedPills = [],
  rawJson,
  onRerun,
  reporter = 'arguscore-dns',
}: DiagnosticResultViewProps) {
  const [showRaw, setShowRaw] = useState(false);

  // Helper for status icon
  const renderStatusIcon = (status: 'pass' | 'warn' | 'fail' | 'info') => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'info':
      default:
        return <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  // Helper to format values as links if IP or domain
  const renderFormattedValue = (val: string) => {
    if (!val) return '-';
    // Clean string
    const clean = val.trim();
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(clean);
    const isDomain = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(clean);

    if (isIp) {
      return (
        <a 
          href={`https://ipinfo.io/${clean}`} 
          target="_blank" 
          rel="noreferrer" 
          className="text-amber-600 dark:text-amber-400 hover:underline font-mono inline-flex items-center gap-1"
        >
          {clean} <ExternalLink className="w-2.5 h-2.5 opacity-70" />
        </a>
      );
    }

    if (isDomain) {
      return (
        <a 
          href={`/tools/supertool?q=${encodeURIComponent(clean)}`} 
          className="text-argus-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 font-mono font-medium inline-flex items-center gap-1"
        >
          {clean}
        </a>
      );
    }

    return <span className="font-mono text-argus-800 dark:text-slate-200 break-all">{clean}</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* 1. MXToolbox Header Bar */}
      <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-argus-900 dark:text-white font-mono">
                {target}
              </h2>
              <Badge variant="info" size="sm">{queryType}</Badge>
            </div>
            <p className="text-xs text-argus-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Reported by {reporter} at {timestamp}
            </p>
          </div>
        </div>

        {/* Action Button: Find Problems / Re-run */}
        {onRerun && (
          <button
            onClick={onRerun}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-run Diagnostic</span>
          </button>
        )}
      </div>

      {/* 2. Related Tests Quick Status Bar */}
      {relatedPills.length > 0 && (
        <div className="bg-white dark:bg-[#131b2e] p-4 rounded-xl border border-argus-200 dark:border-slate-800 shadow-subtle flex items-center gap-3 flex-wrap text-xs">
          <span className="font-bold text-argus-700 dark:text-slate-300 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-amber-500" /> Security Quick Probes:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {relatedPills.map((pill, idx) => (
              <span
                key={idx}
                onClick={pill.action}
                className={`px-3 py-1 rounded-lg border font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                  pill.status === 'pass'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400'
                    : pill.status === 'warn'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:border-amber-400'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:border-rose-400'
                }`}
              >
                {renderStatusIcon(pill.status)}
                <span>{pill.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3. Main Record Table */}
      {records.length > 0 && (
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="p-4 bg-argus-50/70 dark:bg-slate-900/80 border-b border-argus-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-argus-800 dark:text-slate-200 flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-500" /> Main Record Output ({records.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-argus-50/50 dark:bg-slate-900/50 text-argus-500 dark:text-slate-400 font-bold border-b border-argus-200 dark:border-slate-800">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Domain / Prefix</th>
                  <th className="py-3 px-4">IP Address / Target Value</th>
                  <th className="py-3 px-4">TTL</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-argus-200 dark:divide-slate-800">
                {records.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-argus-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {rec.type || 'TXT'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-argus-900 dark:text-white">
                      {rec.prefix || target}
                    </td>
                    <td className="py-3.5 px-4">
                      {renderFormattedValue(rec.value || rec.hostname || rec.ip || '')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-argus-500 dark:text-slate-400">
                      {rec.ttl ? `${rec.ttl}s` : '300s'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <Check className="w-3 h-3" /> {rec.status || 'OK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Test & Assessment Status Table */}
      {assessments.length > 0 && (
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="p-4 bg-argus-50/70 dark:bg-slate-900/80 border-b border-argus-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-argus-800 dark:text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Test & Diagnostic Assessment Status
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-argus-50/50 dark:bg-slate-900/50 text-argus-500 dark:text-slate-400 font-bold border-b border-argus-200 dark:border-slate-800">
                  <th className="py-3 px-4 w-16 text-center">Status</th>
                  <th className="py-3 px-4 w-48">Test Name</th>
                  <th className="py-3 px-4">Result / Detailed Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-argus-200 dark:divide-slate-800">
                {assessments.map((ass, idx) => (
                  <tr key={idx} className="hover:bg-argus-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center">
                        {renderStatusIcon(ass.status)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-argus-900 dark:text-white">
                      {ass.test}
                    </td>
                    <td className="py-3.5 px-4 text-argus-600 dark:text-slate-300">
                      {ass.assessment}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Footer & Collapsible Raw JSON Toggle */}
      <div className="bg-white dark:bg-[#131b2e] rounded-xl border border-argus-200 dark:border-slate-800 p-4 flex items-center justify-between text-xs shadow-subtle">
        <div className="text-argus-500 dark:text-slate-400 font-mono text-[11px]">
          Reported by <strong>{reporter}</strong> on {timestamp} (UTC)
        </div>

        <button
          onClick={() => setShowRaw(!showRaw)}
          className="px-3 py-1.5 bg-argus-100 dark:bg-slate-800 hover:bg-argus-200 dark:hover:bg-slate-700 text-argus-800 dark:text-slate-200 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Code2 className="w-3.5 h-3.5 text-amber-500" />
          <span>{showRaw ? 'Hide Raw Data' : 'Transcript / Raw Data'}</span>
          {showRaw ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Collapsed Raw Data */}
      {showRaw && rawJson && (
        <div className="animate-in fade-in">
          <JsonViewer data={rawJson} title={`Raw Output Transcript (${queryType})`} />
        </div>
      )}

    </div>
  );
}
