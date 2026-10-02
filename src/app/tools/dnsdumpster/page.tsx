'use client';

import React, { useState } from 'react';
import { 
  Network, 
  Globe, 
  Server, 
  Mail, 
  ShieldCheck, 
  Search, 
  Loader2, 
  Download, 
  Copy, 
  ExternalLink, 
  MoreVertical, 
  Check, 
  FileText, 
  Database, 
  Zap, 
  Filter, 
  Info,
  MapPin,
  Cpu
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { DiagnosticResultView } from '@/components/tools/DiagnosticResultView';

export interface DnsDumpsterHost {
  subdomain: string;
  ip: string;
  cidr: string;
  country: string;
  countryCode: string;
  asn: string;
  asnName: string;
  services: string[];
  revIpCount: number;
}

export default function DnsDumpsterPage() {
  const { showToast } = useToast();
  const [domainInput, setDomainInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [filterText, setFilterText] = useState('');
  const [activeMenuIdx, setActiveMenuIdx] = useState<number | null>(null);
  const [copiedHost, setCopiedHost] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleDnsDumpsterRecon = async (overrideDomain?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryDomain = overrideDomain || domainInput;
    if (!queryDomain.trim()) {
      showToast('Input Required', 'Please enter a target domain name (e.g. nyxscans.com)', 'error');
      return;
    }

    // Clean input
    const cleanDomain = queryDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');

    setLoading(true);
    setResultData(null);
    setActiveMenuIdx(null);
    setSelectedNode(null);

    try {
      const res = await fetch('/api/osint/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: cleanDomain,
          tool: 'dnsdumpster',
        }),
      });

      const data = await res.json();
      setResultData(data);
      showToast('DNSDumpster Recon Complete', `Discovered ${data.subdomains?.length || 0} subdomains across ${data.uniqueIpCount || 0} IPs`, 'success');
    } catch (err: any) {
      showToast('Recon Error', err.message || 'Failed to complete DNSDumpster reconnaissance', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHost(text);
    showToast('Copied', `Host/IP ${text} copied to clipboard`, 'info');
    setTimeout(() => setCopiedHost(null), 2000);
  };

  // Export handlers
  const exportAsJSON = () => {
    if (!resultData) return;
    const blob = new Blob([JSON.stringify(resultData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dnsdumpster_${resultData.targetDomain}_report.json`;
    a.click();
    showToast('Exported', 'Downloaded JSON reconnaissance report', 'success');
  };

  const exportAsCSV = () => {
    if (!resultData || !resultData.subdomains) return;
    const headers = ['Subdomain', 'IP Address', 'CIDR', 'Country', 'ASN', 'ASN Name', 'Services', 'Reverse IP Count'];
    const rows = resultData.subdomains.map((h: DnsDumpsterHost) => [
      h.subdomain,
      h.ip,
      h.cidr,
      h.country,
      h.asn,
      `"${h.asnName.replace(/"/g, '""')}"`,
      `"${h.services.join('; ')}"`,
      h.revIpCount,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dnsdumpster_${resultData.targetDomain}_hosts.csv`;
    a.click();
    showToast('Exported', 'Downloaded CSV host list', 'success');
  };

  // Live filter for subdomains
  const filteredSubdomains = resultData?.subdomains?.filter((h: DnsDumpsterHost) => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      h.subdomain.toLowerCase().includes(q) ||
      h.ip.toLowerCase().includes(q) ||
      h.asn.toLowerCase().includes(q) ||
      h.asnName.toLowerCase().includes(q) ||
      h.services.some(s => s.toLowerCase().includes(q))
    );
  }) || [];

  return (
    <div className="py-10 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Module Header */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-card">
              <Network className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white flex items-center gap-2">
                DNSDumpster Subdomain & Infrastructure Mapper
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
                  DNSDumpster Grade OSINT
                </span>
              </h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Passive Certificate Transparency (crt.sh) subdomain discovery, GeoIP server clustering, DNS nameservers, MX mail exchangers, and interactive topology map
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            RFC 1035 Passive Recon
          </Badge>
        </div>

        {/* Input Search Bar */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated space-y-4">
          <form onSubmit={(e) => handleDnsDumpsterRecon(undefined, e)} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-argus-400" />
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="Enter Target Domain (e.g. nyxscans.com, cloudflare.com, github.com)..."
                className="w-full pl-10 pr-4 py-3 text-xs font-mono font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-argus-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Network className="w-4 h-4" />}
              <span>{loading ? 'Discovering Hosts...' : 'DNSDumpster Recon'}</span>
            </button>
          </form>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 text-xs text-argus-500 dark:text-slate-400 flex-wrap pt-1">
            <span className="font-semibold text-argus-700 dark:text-slate-300">Quick Samples:</span>
            <button
              type="button"
              onClick={() => { setDomainInput('nyxscans.com'); handleDnsDumpsterRecon('nyxscans.com'); }}
              className="hover:text-amber-600 underline font-mono text-[11px]"
            >
              nyxscans.com
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setDomainInput('cloudflare.com'); handleDnsDumpsterRecon('cloudflare.com'); }}
              className="hover:text-amber-600 underline font-mono text-[11px]"
            >
              cloudflare.com
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setDomainInput('github.com'); handleDnsDumpsterRecon('github.com'); }}
              className="hover:text-amber-600 underline font-mono text-[11px]"
            >
              github.com
            </button>
          </div>
        </div>

        {/* Results Recon View */}
        {resultData && (
          <div className="space-y-8 animate-in fade-in">
            
            {/* 1. DNSDumpster Header & Interactive Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Card 1: Target Summary */}
              <div className="p-5 bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-argus-600 dark:text-slate-400 uppercase tracking-wider">Target Domain</span>
                  <Globe className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-lg font-extrabold text-argus-900 dark:text-white font-mono truncate">
                  {resultData.targetDomain}
                </div>
                <p className="text-[11px] text-argus-500 dark:text-slate-400 font-mono">
                  TLD: .{resultData.targetDomain.split('.').pop()} | Passive Cert Search
                </p>
              </div>

              {/* Card 2: Subdomains & Hosts Count */}
              <div className="p-5 bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-argus-600 dark:text-slate-400 uppercase tracking-wider">Hosts Found</span>
                  <Server className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {resultData.subdomains?.length || 0}
                </div>
                <p className="text-[11px] text-argus-500 dark:text-slate-400">
                  Unique IPv4 Hosts Discovered
                </p>
              </div>

              {/* Card 3: Unique IPs & Subnets */}
              <div className="p-5 bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-argus-600 dark:text-slate-400 uppercase tracking-wider">Unique IPs / CIDRs</span>
                  <Database className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {resultData.uniqueIpCount} IP / {resultData.uniqueAsnCount} ASN
                </div>
                <p className="text-[11px] text-argus-500 dark:text-slate-400 truncate">
                  {resultData.ipGeoDistribution?.[0]?.country || 'US'} Cluster Primary
                </p>
              </div>

              {/* Card 4: Global Map / GeoIP Distribution */}
              <div className="p-5 bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-argus-600 dark:text-slate-400 uppercase tracking-wider">GeoIP Footprint</span>
                  <MapPin className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {resultData.ipGeoDistribution?.map((geo: any, idx: number) => (
                    <span key={idx} className="text-[11px] font-bold px-2 py-0.5 rounded bg-argus-100 dark:bg-slate-800 text-argus-800 dark:text-slate-200 border border-argus-200 dark:border-slate-700">
                      {geo.flag} {geo.country} ({geo.count})
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-argus-500 dark:text-slate-400">
                  Global Server Locations
                </p>
              </div>

            </div>

            {/* 2. DNS RECORD CATEGORIZED SECTIONS (NS, MX, Root A/AAAA, TXT/SPF) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* DNS Servers (NS Records) */}
              <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
                <div className="p-4 bg-argus-50/70 dark:bg-slate-900/80 border-b border-argus-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-argus-900 dark:text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-amber-500" /> DNS Nameservers (NS Records)
                  </h3>
                  <Badge variant="info">{resultData.nsRecords?.length || 0} Servers</Badge>
                </div>
                <div className="divide-y divide-argus-200 dark:divide-slate-800 text-xs">
                  {resultData.nsRecords?.map((ns: any, idx: number) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-argus-50/50 dark:hover:bg-slate-900/50">
                      <div>
                        <span className="font-mono font-bold text-argus-900 dark:text-white block">{ns.hostname}</span>
                        <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400">{ns.ip}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[11px] block">{ns.flag} {ns.country}</span>
                        <span className="text-[10px] text-argus-500 dark:text-slate-400 font-mono">{ns.asn} ({ns.asnName})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mail Exchangers (MX Records) */}
              <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
                <div className="p-4 bg-argus-50/70 dark:bg-slate-900/80 border-b border-argus-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-argus-900 dark:text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-500" /> Mail Servers (MX Records)
                  </h3>
                  <Badge variant="success">{resultData.mxRecords?.length || 0} Mail Servers</Badge>
                </div>
                <div className="divide-y divide-argus-200 dark:divide-slate-800 text-xs">
                  {resultData.mxRecords?.map((mx: any, idx: number) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-argus-50/50 dark:hover:bg-slate-900/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">Pref {mx.priority}</span>
                          <span className="font-mono font-bold text-argus-900 dark:text-white">{mx.hostname}</span>
                        </div>
                        <span className="font-mono text-[11px] text-argus-500 dark:text-slate-400">{mx.ip}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[11px] block">{mx.flag} {mx.country}</span>
                        <span className="text-[10px] text-argus-500 dark:text-slate-400 font-mono">{mx.asnName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 3. VISUAL NETWORK & DOMAIN GRAPH (Interactive Topology Map) */}
            <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-argus-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
                    <Network className="w-4.5 h-4.5 text-amber-500" /> Visual Network & Domain Topology Diagram
                  </h3>
                  <p className="text-xs text-argus-500 dark:text-slate-400 mt-0.5">
                    Click nodes to highlight corresponding records or subdomains in the table below
                  </p>
                </div>
                <Badge variant="info">SVG Topology Map</Badge>
              </div>

              {/* Topology SVG Map */}
              <div className="w-full bg-argus-50/80 dark:bg-slate-900/80 p-6 rounded-xl border border-argus-200 dark:border-slate-800 overflow-x-auto flex items-center justify-center">
                <svg className="w-full min-w-[700px] h-[320px]" viewBox="0 0 800 320">
                  {/* Lines connect Root to NS/MX/Clusters */}
                  <line x1="400" y1="50" x2="160" y2="140" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="400" y1="50" x2="400" y2="140" stroke="#10b981" strokeWidth="2" />
                  <line x1="400" y1="50" x2="640" y2="140" stroke="#3b82f6" strokeWidth="2" />

                  {/* Subdomain lines */}
                  <line x1="640" y1="140" x2="520" y2="250" stroke="#64748b" strokeWidth="1.5" />
                  <line x1="640" y1="140" x2="640" y2="250" stroke="#64748b" strokeWidth="1.5" />
                  <line x1="640" y1="140" x2="760" y2="250" stroke="#64748b" strokeWidth="1.5" />

                  {/* Root Node */}
                  <g className="cursor-pointer" onClick={() => setSelectedNode('root')}>
                    <circle cx="400" cy="50" r="32" className="fill-amber-500 stroke-amber-300 stroke-2" />
                    <text x="400" y="55" textAnchor="middle" fill="#ffffff" className="text-xs font-black font-mono">
                      {resultData.targetDomain}
                    </text>
                  </g>

                  {/* NS Node */}
                  <g className="cursor-pointer" onClick={() => setSelectedNode('ns')}>
                    <rect x="100" y="120" width="120" height="45" rx="10" className="fill-amber-600/20 stroke-amber-500 stroke-2" />
                    <text x="160" y="147" textAnchor="middle" className="fill-argus-900 dark:fill-white text-xs font-bold">
                      DNS NS ({resultData.nsRecords?.length})
                    </text>
                  </g>

                  {/* MX Node */}
                  <g className="cursor-pointer" onClick={() => setSelectedNode('mx')}>
                    <rect x="340" y="120" width="120" height="45" rx="10" className="fill-emerald-600/20 stroke-emerald-500 stroke-2" />
                    <text x="400" y="147" textAnchor="middle" className="fill-argus-900 dark:fill-white text-xs font-bold">
                      MX Servers ({resultData.mxRecords?.length})
                    </text>
                  </g>

                  {/* Cloud/IP Cluster Node */}
                  <g className="cursor-pointer" onClick={() => setSelectedNode('cluster')}>
                    <rect x="580" y="120" width="120" height="45" rx="10" className="fill-blue-600/20 stroke-blue-500 stroke-2" />
                    <text x="640" y="147" textAnchor="middle" className="fill-argus-900 dark:fill-white text-xs font-bold">
                      Cloud IP Cluster
                    </text>
                  </g>

                  {/* Subdomain Leaf 1 */}
                  <g className="cursor-pointer" onClick={() => setSelectedNode('api')}>
                    <circle cx="520" cy="250" r="22" className="fill-slate-800 stroke-blue-400 stroke-2" />
                    <text x="520" y="254" textAnchor="middle" fill="#ffffff" className="text-[10px] font-bold font-mono">
                      api
                    </text>
                  </g>

                  {/* Subdomain Leaf 2 */}
                  <g className="cursor-pointer" onClick={() => setSelectedNode('dashboard')}>
                    <circle cx="640" cy="250" r="22" className="fill-slate-800 stroke-emerald-400 stroke-2" />
                    <text x="640" y="254" textAnchor="middle" fill="#ffffff" className="text-[10px] font-bold font-mono">
                      dash
                    </text>
                  </g>

                  {/* Subdomain Leaf 3 */}
                  <g className="cursor-pointer" onClick={() => setSelectedNode('mail')}>
                    <circle cx="760" cy="250" r="22" className="fill-slate-800 stroke-amber-400 stroke-2" />
                    <text x="760" y="254" textAnchor="middle" fill="#ffffff" className="text-[10px] font-bold font-mono">
                      mail
                    </text>
                  </g>
                </svg>
              </div>
            </div>

            {/* 4. COMPREHENSIVE SUBDOMAINS & HOSTS TABLE */}
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden space-y-4">
              
              {/* Table Controls Header: Search Filter & Export Buttons */}
              <div className="p-5 bg-argus-50/80 dark:bg-slate-900/80 border-b border-argus-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-500" /> Discovered Subdomains & Host Table ({filteredSubdomains.length})
                  </h3>
                  <p className="text-xs text-argus-500 dark:text-slate-400 mt-0.5">
                    Matches DNSDumpster table output with IP CIDR, ASN Name, open technologies, and RevIP co-hosted counts
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Live Search Input */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-argus-400" />
                    <input
                      type="text"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      placeholder="Filter subdomains, IP, ASN..."
                      className="pl-9 pr-3 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* CSV Export */}
                  <button
                    onClick={exportAsCSV}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>

                  {/* JSON Export */}
                  <button
                    onClick={exportAsJSON}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-argus-50/50 dark:bg-slate-900/50 text-argus-500 dark:text-slate-400 font-bold border-b border-argus-200 dark:border-slate-800">
                      <th className="py-3 px-4">Host / Subdomain</th>
                      <th className="py-3 px-4">IP Address & CIDR</th>
                      <th className="py-3 px-4">ASN & ASN Name</th>
                      <th className="py-3 px-4">Open Services & Tech</th>
                      <th className="py-3 px-4 text-center">RevIP</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-argus-200 dark:divide-slate-800">
                    {filteredSubdomains.map((h: DnsDumpsterHost, idx: number) => (
                      <tr key={idx} className="hover:bg-argus-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        
                        {/* Subdomain */}
                        <td className="py-3.5 px-4 font-mono font-bold text-argus-900 dark:text-white">
                          <div className="flex items-center gap-1.5">
                            <span>{h.subdomain}</span>
                            <button onClick={() => copyToClipboard(h.subdomain)} className="text-argus-400 hover:text-amber-500 p-0.5">
                              {copiedHost === h.subdomain ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        {/* IP & CIDR */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="text-amber-600 dark:text-amber-400 font-bold">{h.ip}</div>
                          <div className="text-[10px] text-argus-500 dark:text-slate-400">{h.cidr} ({h.country})</div>
                        </td>

                        {/* ASN */}
                        <td className="py-3.5 px-4 font-mono text-xs">
                          <div className="font-bold text-argus-800 dark:text-slate-200">{h.asn}</div>
                          <div className="text-[10px] text-argus-500 dark:text-slate-400 truncate max-w-[180px]">{h.asnName}</div>
                        </td>

                        {/* Services Badges */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {h.services.map((s: string, sIdx: number) => (
                              <span key={sIdx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* RevIP Count */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                          {h.revIpCount}
                        </td>

                        {/* Row Action Three-Dot Menu */}
                        <td className="py-3.5 px-4 text-right relative">
                          <button
                            onClick={() => setActiveMenuIdx(activeMenuIdx === idx ? null : idx)}
                            className="p-1 text-argus-500 dark:text-slate-400 hover:text-amber-500 rounded-lg hover:bg-argus-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Three Dot Floating Dropdown Menu */}
                          {activeMenuIdx === idx && (
                            <div className="absolute right-4 top-10 w-48 bg-white dark:bg-[#131b2e] border border-argus-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-left space-y-0.5 animate-in fade-in zoom-in-95">
                              <button
                                onClick={() => { window.location.href = `/tools/supertool?q=dns:${h.subdomain}`; }}
                                className="w-full px-3 py-1.5 text-xs text-argus-800 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-500 font-semibold flex items-center gap-2"
                              >
                                <Globe className="w-3.5 h-3.5" /> DNS Lookup
                              </button>
                              <button
                                onClick={() => { window.location.href = `/tools/supertool?q=asn:${h.ip}`; }}
                                className="w-full px-3 py-1.5 text-xs text-argus-800 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-500 font-semibold flex items-center gap-2"
                              >
                                <Database className="w-3.5 h-3.5" /> ASN Lookup
                              </button>
                              <button
                                onClick={() => { window.location.href = `/tools/supertool?q=arin:${h.ip}`; }}
                                className="w-full px-3 py-1.5 text-xs text-argus-800 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-500 font-semibold flex items-center gap-2"
                              >
                                <Network className="w-3.5 h-3.5" /> Subnet Lookup
                              </button>
                              <button
                                onClick={() => { window.location.href = `/tools/supertool?q=tcp:${h.ip}`; }}
                                className="w-full px-3 py-1.5 text-xs text-argus-800 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-500 font-semibold flex items-center gap-2"
                              >
                                <Cpu className="w-3.5 h-3.5" /> Port / Service Check
                              </button>
                              <button
                                onClick={() => { window.location.href = `/tools/supertool?q=ptr:${h.ip}`; }}
                                className="w-full px-3 py-1.5 text-xs text-argus-800 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-500 font-semibold flex items-center gap-2"
                              >
                                <Server className="w-3.5 h-3.5" /> Reverse IP (RevIP)
                              </button>
                              <button
                                onClick={() => { window.location.href = `/tools/supertool?q=whois:${h.subdomain}`; }}
                                className="w-full px-3 py-1.5 text-xs text-argus-800 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-500 font-semibold flex items-center gap-2"
                              >
                                <FileText className="w-3.5 h-3.5" /> Whois Lookup
                              </button>
                            </div>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Diagnostic Result View Component */}
            <DiagnosticResultView
              target={resultData.targetDomain}
              queryType="DNSDumpster Recon"
              timestamp={resultData.timestamp}
              records={resultData.subdomains?.map((s: any) => ({
                type: 'A',
                prefix: s.subdomain,
                value: `${s.ip} (${s.asnName})`,
                ttl: 300,
                status: 'RESOLVED',
              }))}
              rawJson={resultData}
              onRerun={() => handleDnsDumpsterRecon()}
            />

          </div>
        )}

        {/* Documentation Block */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-subtle space-y-3 text-xs">
          <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-brand" /> ABOUT DNSDUMPSTER RECONNAISSANCE
          </h3>
          <p className="text-argus-600 dark:text-slate-300 leading-relaxed">
            <strong>DNSDumpster</strong> is a domain research tool that discovers subdomains, DNS servers, mail exchangers, and IP footprint distributions of a target domain. By harvesting public Certificate Transparency logs (crt.sh) and conducting passive DNS resolution, security analysts gain full visibility into attack surfaces without interacting directly with target infrastructure.
          </p>
        </div>

      </div>
    </div>
  );
}
