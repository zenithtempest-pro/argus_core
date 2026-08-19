'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, RotateCw, Trash2, Download, Bookmark, Shield, Globe, UserCheck, FileText, Cpu, Filter, ExternalLink, ArrowUpRight, Zap, AlertOctagon, MailCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

interface HistoryItem {
  id: string;
  query: string;
  category: string;
  toolName: string;
  timestamp: string;
  status: 'Completed' | 'Flagged' | 'Clean';
  resultSummary: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchHistoryTerm, setSearchHistoryTerm] = useState('');

  const [historyList, setHistoryList] = useState<HistoryItem[]>([
    { id: '1', query: 'mx:technohacks.co.in', category: 'tools/supertool', toolName: 'SuperTool Command', timestamp: '2026-08-18 22:15', status: 'Clean', resultSummary: 'Primary MX mail.technohacks.co.in (104.21.48.92)' },
    { id: '2', query: '185.220.101.5', category: 'tools/blacklist', toolName: 'Blacklist Checker', timestamp: '2026-08-18 21:40', status: 'Flagged', resultSummary: 'Listed on SORBS DUHL blocklist' },
    { id: '3', query: 'cloudflare.com', category: 'tools/mx-lookup', toolName: 'MX Record Lookup', timestamp: '2026-08-18 20:12', status: 'Clean', resultSummary: '2 MX records (isaac.ns.cloudflare.com)' },
    { id: '4', query: '_dmarc.google.com', category: 'tools/dmarc', toolName: 'DMARC Record Check', timestamp: '2026-08-18 19:30', status: 'Completed', resultSummary: 'Policy p=reject; pct=100' },
    { id: '5', query: 'alex_cybersec', category: 'tools/identity', toolName: 'Social Username Checker', timestamp: '2026-08-18 15:12', status: 'Completed', resultSummary: 'Found active accounts on 7/11 platforms' },
  ]);

  const handleRerun = (item: HistoryItem) => {
    showToast('Re-running Query', `Launching ${item.toolName} for ${item.query}...`, 'info');
    router.push(`/${item.category}?q=${encodeURIComponent(item.query)}`);
  };

  const handleDeleteItem = (id: string) => {
    setHistoryList((prev) => prev.filter((item) => item.id !== id));
    showToast('Query Log Deleted', 'Removed search entry from history', 'info');
  };

  const filteredHistory = historyList.filter((item) => {
    const matchesCategory = filterCategory === 'all' || item.category.includes(filterCategory);
    const matchesSearch = item.query.toLowerCase().includes(searchHistoryTerm.toLowerCase()) ||
                          item.toolName.toLowerCase().includes(searchHistoryTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-10 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-argus-500 dark:text-slate-400 uppercase tracking-wider">Active Workspace</span>
            </div>
            <h1 className="text-2xl font-bold text-argus-900 dark:text-white">Analyst Overview & Search History</h1>
            <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
              Logged in as <strong>Senior Threat Intelligence Analyst (Tier 3)</strong>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tools/supertool"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>SuperTool Command</span>
            </Link>
          </div>
        </div>

        {/* Analytics & Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-argus-500 dark:text-slate-400">Total Queries</span>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <Search className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-argus-900 dark:text-white mt-2">1,248</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +14% this week
            </div>
          </div>

          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-argus-500 dark:text-slate-400">Saved Workspaces</span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Bookmark className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-argus-900 dark:text-white mt-2">8</div>
            <div className="text-[11px] text-argus-500 dark:text-slate-400 mt-1">3 Active cases</div>
          </div>

          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-argus-500 dark:text-slate-400">Tools Downloaded</span>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <Download className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-argus-900 dark:text-white mt-2">14</div>
            <div className="text-[11px] text-argus-500 dark:text-slate-400 mt-1">Python OSINT scripts</div>
          </div>

          <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-argus-500 dark:text-slate-400">Flagged Indicators</span>
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-argus-900 dark:text-white mt-2">32</div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">High risk IPs / domains</div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
          
          <div className="p-5 border-b border-argus-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-argus-900 dark:text-white">Query History Logs</h2>
              <p className="text-xs text-argus-500 dark:text-slate-400">Filter, inspect, or re-run past network diagnostics</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full sm:w-auto pl-8 pr-8 py-2 text-xs font-semibold text-argus-800 dark:text-slate-200 bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option value="all">All Tool Categories</option>
                  <option value="supertool">SuperTool</option>
                  <option value="blacklist">Blacklist Check</option>
                  <option value="mx-lookup">MX Lookup</option>
                  <option value="dmarc">DMARC Check</option>
                </select>
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-argus-400" />
              </div>

              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-argus-400" />
                <input
                  type="text"
                  value={searchHistoryTerm}
                  onChange={(e) => setSearchHistoryTerm(e.target.value)}
                  placeholder="Search logs..."
                  className="w-full sm:w-48 pl-8 pr-3 py-2 text-xs font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-argus-50 dark:bg-slate-900 text-[11px] font-bold text-argus-500 dark:text-slate-400 uppercase tracking-wider border-b border-argus-200 dark:border-slate-800">
                  <th className="py-3 px-4">Target Query</th>
                  <th className="py-3 px-4">Tool Engine</th>
                  <th className="py-3 px-4">Result Summary</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-argus-200 dark:divide-slate-800 text-xs">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-argus-50/80 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-argus-900 dark:text-white">
                      {item.query}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-argus-800 dark:text-slate-200">
                      {item.toolName}
                    </td>
                    <td className="py-3.5 px-4 text-argus-600 dark:text-slate-300 max-w-xs truncate">
                      {item.resultSummary}
                    </td>
                    <td className="py-3.5 px-4 text-argus-500 dark:text-slate-400 font-mono text-[11px]">
                      {item.timestamp}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'Clean' && <Badge variant="success">Clean</Badge>}
                      {item.status === 'Completed' && <Badge variant="info">Completed</Badge>}
                      {item.status === 'Flagged' && <Badge variant="warning">Flagged Alert</Badge>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRerun(item)}
                          className="p-1.5 text-argus-600 dark:text-slate-400 hover:text-brand rounded-lg transition-colors"
                          title="Re-run Query"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-argus-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}
