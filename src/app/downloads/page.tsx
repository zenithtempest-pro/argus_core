'use client';

import React, { useState, useEffect } from 'react';
import { Download, Terminal, Search, Shield, Copy, Check, Filter, Loader2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { scriptRepository, PythonScriptItem } from '@/data/scripts';

export default function DownloadsPage() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [copiedChecksum, setCopiedChecksum] = useState<string | null>(null);
  const [scripts, setScripts] = useState<PythonScriptItem[]>(scriptRepository);
  const [loading, setLoading] = useState(false);

  const fetchDynamicScripts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scripts');
      if (res.ok) {
        const dynamicScripts = await res.json();
        if (Array.isArray(dynamicScripts) && dynamicScripts.length > 0) {
          // Merge dynamic scripts with static repository items, matching by filename
          const merged = dynamicScripts.map((dyn: any) => {
            const staticMatch = scriptRepository.find(s => s.filename === dyn.filename);
            return staticMatch ? { ...staticMatch, checksum: dyn.checksum, size: dyn.size, lastUpdated: dyn.lastUpdated } : dyn;
          });
          setScripts(merged);
        }
      }
    } catch (err) {
      console.error('Failed to load dynamic scripts, using static fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDynamicScripts();
  }, []);

  const handleDownload = (script: PythonScriptItem) => {
    const a = document.createElement('a');
    a.href = script.downloadUrl;
    a.download = script.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Download Triggered', `Downloading ${script.filename} from repository...`, 'success');
  };

  const copyChecksum = (checksum: string) => {
    navigator.clipboard.writeText(checksum);
    setCopiedChecksum(checksum);
    showToast('Checksum Copied', 'SHA-256 hash copied to clipboard', 'info');
    setTimeout(() => setCopiedChecksum(null), 2000);
  };

  const filteredScripts = scripts.filter((s) => {
    const matchesCategory = categoryFilter === 'all' || s.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.filename.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-12 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="info" size="md">
              <Terminal className="w-3.5 h-3.5 mr-1" /> Open Source Code Hub
            </Badge>
            <button
              onClick={fetchDynamicScripts}
              disabled={loading}
              className="p-1 rounded-lg text-argus-500 hover:text-brand dark:text-slate-400 dark:hover:text-blue-400"
              title="Refresh scripts directory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <h1 className="text-3xl font-extrabold text-argus-900 dark:text-white tracking-tight">Python OSINT Script Repository</h1>
          <p className="text-sm text-argus-600 dark:text-slate-400">
            Verified, standalone Python CLI utilities loaded dynamically from <code className="font-mono text-brand dark:text-blue-400">/public/scripts/</code> with real-time SHA-256 checksum computation.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-argus-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Python tools, dependencies, or filenames..."
              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-brand/30 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="w-3.5 h-3.5 text-argus-400 shrink-0" />
            {['all', 'Network', 'Identity', 'Media', 'Scanners', 'Custom'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  categoryFilter === cat
                    ? 'bg-brand text-white shadow-card'
                    : 'bg-argus-100 dark:bg-slate-800 text-argus-700 dark:text-slate-300 hover:bg-argus-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'All Scripts' : cat}
              </button>
            ))}
          </div>

        </div>

        {/* Scripts List Cards */}
        <div className="space-y-6">
          {filteredScripts.map((script) => (
            <div
              key={script.id}
              className="bg-white dark:bg-[#131b2e] border border-argus-200 dark:border-slate-800 rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              
              {/* Left Column info */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-brand dark:text-blue-400 bg-brand-light dark:bg-brand/20 border border-brand-border dark:border-brand/40 px-2.5 py-0.5 rounded-md">
                    {script.filename}
                  </span>
                  <Badge variant="neutral">{script.version}</Badge>
                  <Badge variant="info">{script.pythonVersion}</Badge>
                  <span className="text-xs text-argus-500 dark:text-slate-400 font-mono">• Size: {script.size}</span>
                </div>

                <h3 className="text-lg font-bold text-argus-900 dark:text-white">{script.name}</h3>
                <p className="text-xs text-argus-600 dark:text-slate-300 leading-relaxed max-w-3xl">{script.description}</p>

                {/* Dependencies list */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[11px] font-semibold text-argus-500 dark:text-slate-400 uppercase tracking-wider">Dependencies:</span>
                  {script.dependencies.map((dep, idx) => (
                    <span key={idx} className="text-[11px] font-mono bg-argus-100 dark:bg-slate-900 text-argus-800 dark:text-slate-200 px-2 py-0.5 rounded border border-argus-200 dark:border-slate-800">
                      {dep}
                    </span>
                  ))}
                </div>

                {/* Checksum SHA-256 */}
                <div className="flex items-center gap-2 text-[11px] text-argus-500 dark:text-slate-400 pt-1">
                  <span className="font-semibold text-argus-600 dark:text-slate-300">SHA-256:</span>
                  <code className="font-mono text-[10px] bg-argus-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-argus-200 dark:border-slate-800 truncate max-w-xs text-argus-900 dark:text-slate-200">
                    {script.checksum}
                  </code>
                  <button
                    onClick={() => copyChecksum(script.checksum)}
                    className="text-brand dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    {copiedChecksum === script.checksum ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedChecksum === script.checksum ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Right Download Button */}
              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 border-t lg:border-t-0 lg:border-l border-argus-200 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6">
                <div className="text-xs text-argus-500 dark:text-slate-400 text-right">
                  <div><strong>{script.downloads.toLocaleString()}</strong> downloads</div>
                  <div className="text-[11px] text-argus-400 dark:text-slate-500">Updated: {script.lastUpdated}</div>
                </div>

                <button
                  onClick={() => handleDownload(script)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-xl shadow-card transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Script (.py)</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
