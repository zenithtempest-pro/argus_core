'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Network, 
  Globe, 
  Server, 
  Mail, 
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
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { AuthBlurGate } from '@/components/auth/AuthBlurGate';

export interface HostRecord {
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

export interface DnsRecord {
  type: string;
  prefix: string;
  value: string;
  ttl: number;
  status: string;
}

export default function DnsInfrastructurePage() {
  const searchParams = useSearchParams();
  const initialDomain = searchParams.get('q') || searchParams.get('domain') || '';
  const { showToast } = useToast();

  const [domainInput, setDomainInput] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [filterText, setFilterText] = useState('');
  const [activeMenuIdx, setActiveMenuIdx] = useState<number | null>(null);
  const [copiedHost, setCopiedHost] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    if (initialDomain) {
      handleInfrastructureRecon(initialDomain);
    }
  }, [initialDomain]);

  const handleInfrastructureRecon = async (overrideDomain?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryDomain = overrideDomain || domainInput;
    if (!queryDomain.trim()) {
      showToast('Input Required', 'Please enter a target domain name (e.g. cloudflare.com)', 'error');
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
          tool: 'dns',
        }),
      });

      const data = await res.json();
      setResultData(data);
      showToast('Infrastructure Recon Complete', `Discovered ${data.subdomains?.length || 0} subdomains across ${data.uniqueIpCount || 0} IPs`, 'success');
    } catch (err: any) {
      showToast('Recon Error', err.message || 'Failed to complete infrastructure reconnaissance', 'error');
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
    a.download = `argusrecon_${resultData.targetDomain}_report.json`;
    a.click();
    showToast('Exported', 'Downloaded JSON reconnaissance report', 'success');
  };

  const exportAsCSV = () => {
    if (!resultData || !resultData.subdomains) return;
    const headers = ['Subdomain', 'IP Address', 'CIDR', 'Country', 'ASN', 'ASN Name', 'Services', 'Reverse IP Count'];
    const rows = resultData.subdomains.map((h: HostRecord) => [
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
    a.download = `argusrecon_${resultData.targetDomain}_hosts.csv`;
    a.click();
    showToast('Exported', 'Downloaded CSV host list', 'success');
  };

  // Live filter for subdomains
  const filteredSubdomains = resultData?.subdomains?.filter((h: HostRecord) => {
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
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white flex items-center gap-2 flex-wrap">
                ArgusRecon Subdomain & Infrastructure Mapper
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
                  ENTERPRISE INFRASTRUCTURE OSINT
                </span>
              </h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Passive Certificate Transparency (crt.sh) subdomain discovery, full DNS records (A, AAAA, CNAME, NS, MX, TXT, SOA), GeoIP cluster mapping, and topology graph
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            RFC 1035 Passive Recon
          </Badge>
        </div>

        {/* Input Search Bar */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated space-y-4">
          <form onSubmit={(e) => handleInfrastructureRecon(undefined, e)} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-argus-400" />
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="Enter Target Domain (e.g. cloudflare.com, github.com, example.com)..."
                className="w-full pl-10 pr-4 py-3 text-xs font-mono font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-argus-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Network className="w-4 h-4" />}
              <span>{loading ? 'Discovering Hosts...' : 'Run Infrastructure Recon'}</span>
            </button>
          </form>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 text-xs text-argus-500 dark:text-slate-400 flex-wrap pt-1">
            <span className="font-semibold text-argus-700 dark:text-slate-300">Quick Samples:</span>
            <button
              type="button"
              onClick={() => { setDomainInput('cloudflare.com'); handleInfrastructureRecon('cloudflare.com'); }}
              className="hover:text-amber-600 underline font-mono text-[11px]"
            >
              cloudflare.com
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setDomainInput('github.com'); handleInfrastructureRecon('github.com'); }}
              className="hover:text-amber-600 underline font-mono text-[11px]"
            >
              github.com
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setDomainInput('example.com'); handleInfrastructureRecon('example.com'); }}
              className="hover:text-amber-600 underline font-mono text-[11px]"
            >
              example.com
            </button>
          </div>
        </div>

        {/* Results Recon View */}
        {resultData && (
          <div className="space-y-8 animate-in fade-in">
            
            {/* 1. Header & Interactive Metrics Row (ALWAYS VISIBLE TEASER SECTION) */}
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
                  Discovered Host Nodes
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

            {/* DETAILED LOWER SECTIONS WRAPPED INSIDE AuthBlurGate */}
            <AuthBlurGate redirectPath="/tools/dns">
              <div className="space-y-8">
                
                {/* 2. UNIFIED CONSOLIDATED DNS RESOURCE RECORDS (A, AAAA, CNAME, NS, MX, TXT, SOA) */}
                {resultData.dnsRecords && (
                  <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
                    <div className="p-4 bg-argus-50/70 dark:bg-slate-900/80 border-b border-argus-200 dark:border-slate-800 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-argus-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-500" /> Authoritative DNS Resource Records (A, AAAA, CNAME, NS, MX, TXT, SOA)
                      </h3>
                      <Badge variant="info">{resultData.dnsRecords.length} Consolidated Records</Badge>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-argus-50/50 dark:bg-slate-900/50 text-argus-500 dark:text-slate-400 font-bold border-b border-argus-200 dark:border-slate-800">
                            <th className="py-3 px-4">Record Type</th>
                            <th className="py-3 px-4">Host / Prefix</th>
                            <th className="py-3 px-4">Resolved Target / Value</th>
                            <th className="py-3 px-4">TTL</th>
                            <th className="py-3 px-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-argus-200 dark:divide-slate-800 font-mono">
                          {resultData.dnsRecords.map((r: DnsRecord, idx: number) => (
                            <tr key={idx} className="hover:bg-argus-50/50 dark:hover:bg-slate-900/50 transition-colors">
                              <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">{r.type}</td>
                              <td className="py-3 px-4 text-argus-900 dark:text-white">{r.prefix}</td>
                              <td className="py-3 px-4 text-argus-700 dark:text-slate-300 break-all">{r.value}</td>
                              <td className="py-3 px-4 text-argus-500 dark:text-slate-400">{r.ttl}s</td>
                              <td className="py-3 px-4 text-right">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                  <Check className="w-3 h-3" /> {r.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. DNS Nameservers & Mail Exchangers Grid */}
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

                {/* 4. VISUAL NETWORK & DOMAIN GRAPH (Interactive Topology Map) */}
                <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-4">
                  <div className="flex items-center justify-between border-b border-argus-200 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
                        <Network className="w-4.5 h-4.5 text-amber-500" /> Visual Network & Domain Topology Diagram
                      </h3>
                      <p className="text-xs text-argus-500 dark:text-slate-400 mt-0.5">
                        Interactive topology graph illustrating host distribution, MX routes, and clustered cloud assets
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

                {/* 5. COMPREHENSIVE SUBDOMAINS & HOSTS TABLE */}
                <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden space-y-4">
                  
                  {/* Table Controls Header: Search Filter & Export Buttons */}
                  <div className="p-5 bg-argus-50/80 dark:bg-slate-900/80 border-b border-argus-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
                        <Server className="w-4 h-4 text-emerald-500" /> Discovered Subdomains & Host Table ({filteredSubdomains.length})
                      </h3>
                      <p className="text-xs text-argus-500 dark:text-slate-400 mt-0.5">
                        Enterprise host table output with IP CIDR, ASN Name, open technologies, and RevIP co-hosted counts
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
                          placeholder="Filter host, IP, ASN..."
                          className="pl-8.5 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-lg text-argus-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        />
                      </div>

                      {/* Export Action Buttons */}
                      <button
                        onClick={exportAsCSV}
                        className="px-3 py-1.5 bg-argus-100 hover:bg-argus-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-argus-800 dark:text-slate-200 text-xs font-semibold rounded-lg border border-argus-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>

                      <button
                        onClick={exportAsJSON}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-card transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Export JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Responsive Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-argus-50/50 dark:bg-slate-900/50 text-argus-500 dark:text-slate-400 font-bold border-b border-argus-200 dark:border-slate-800">
                          <th className="py-3 px-4">Subdomain Host</th>
                          <th className="py-3 px-4">IP Address & Subnet</th>
                          <th className="py-3 px-4">Geographic Location</th>
                          <th className="py-3 px-4">Autonomous System (ASN)</th>
                          <th className="py-3 px-4">Detected Tech / Services</th>
                          <th className="py-3 px-4 text-center">RevIP</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-argus-200 dark:divide-slate-800">
                        {filteredSubdomains.map((h: HostRecord, idx: number) => (
                          <tr key={idx} className="hover:bg-argus-50/50 dark:hover:bg-slate-900/50 transition-colors">
                            {/* Subdomain */}
                            <td className="py-3.5 px-4 font-mono font-bold text-argus-900 dark:text-white">
                              <div className="flex items-center gap-1.5">
                                <span className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer" onClick={() => copyToClipboard(h.subdomain)}>
                                  {h.subdomain}
                                </span>
                                {copiedHost === h.subdomain && (
                                  <span className="text-[10px] text-emerald-500 font-sans font-normal">Copied!</span>
                                )}
                              </div>
                            </td>

                            {/* IP / CIDR */}
                            <td className="py-3.5 px-4 font-mono">
                              <div className="text-amber-600 dark:text-amber-400 font-semibold">{h.ip}</div>
                              <div className="text-[10px] text-argus-500 dark:text-slate-400">{h.cidr}</div>
                            </td>

                            {/* Geo Location */}
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-argus-800 dark:text-slate-200">{h.country}</span>
                              <span className="text-[10px] text-argus-500 dark:text-slate-400 block font-mono">[{h.countryCode}]</span>
                            </td>

                            {/* ASN */}
                            <td className="py-3.5 px-4">
                              <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{h.asn}</div>
                              <div className="text-[10px] text-argus-500 dark:text-slate-400 truncate max-w-[180px]">{h.asnName}</div>
                            </td>

                            {/* Services / Tech */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1 flex-wrap max-w-xs">
                                {h.services.map((svc: string, sIdx: number) => (
                                  <span key={sIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-argus-100 dark:bg-slate-800 text-argus-700 dark:text-slate-300 border border-argus-200 dark:border-slate-700">
                                    {svc}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* RevIP Count */}
                            <td className="py-3.5 px-4 text-center font-mono">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-argus-100 dark:bg-slate-800 text-argus-700 dark:text-slate-300">
                                {h.revIpCount}
                              </span>
                            </td>

                            {/* Context Menu Action */}
                            <td className="py-3.5 px-4 text-right relative">
                              <button
                                onClick={() => setActiveMenuIdx(activeMenuIdx === idx ? null : idx)}
                                className="p-1.5 hover:bg-argus-100 dark:hover:bg-slate-800 rounded-lg text-argus-500 dark:text-slate-400 transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {activeMenuIdx === idx && (
                                <div className="absolute right-4 top-10 w-48 bg-white dark:bg-[#131b2e] border border-argus-200 dark:border-slate-700 rounded-xl shadow-elevated p-1.5 z-40 text-left space-y-1 animate-in fade-in">
                                  <button
                                    onClick={() => { copyToClipboard(h.subdomain); setActiveMenuIdx(null); }}
                                    className="w-full px-2.5 py-1.5 text-xs text-argus-700 dark:text-slate-300 hover:bg-argus-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2"
                                  >
                                    <Copy className="w-3.5 h-3.5" /> Copy Hostname
                                  </button>
                                  <button
                                    onClick={() => { copyToClipboard(h.ip); setActiveMenuIdx(null); }}
                                    className="w-full px-2.5 py-1.5 text-xs text-argus-700 dark:text-slate-300 hover:bg-argus-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2"
                                  >
                                    <Copy className="w-3.5 h-3.5" /> Copy IP Address
                                  </button>
                                  <a
                                    href={`https://ipinfo.io/${h.ip}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full px-2.5 py-1.5 text-xs text-argus-700 dark:text-slate-300 hover:bg-argus-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" /> View IP Geolocation ↗
                                  </a>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </AuthBlurGate>

          </div>
        )}

        {/* Documentation Block */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-subtle space-y-3 text-xs">
          <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-brand" /> ABOUT ARGUSRECON INFRASTRUCTURE & SUBDOMAIN MAPPER
          </h3>
          <p className="text-argus-600 dark:text-slate-300 leading-relaxed">
            <strong>ArgusRecon</strong> is an enterprise infrastructure reconnaissance engine that discovers subdomains, authoritative DNS resource records (A, AAAA, CNAME, NS, MX, TXT, SOA), and global IP footprint distributions of a target domain. By harvesting public Certificate Transparency logs (crt.sh) and conducting passive DNS resolution, security analysts gain full visibility into external attack surfaces without interacting directly with target infrastructure.
          </p>
        </div>

      </div>
    </div>
  );
}
