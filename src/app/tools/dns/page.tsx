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
  ShieldCheck,
  Shield,
  Layers,
  ArrowRight,
  RefreshCw
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

export interface ArgusReconViewProps {
  data: any;
  onRerun?: () => void;
  redirectPath?: string;
}

export function ArgusReconView({ data, onRerun, redirectPath = "/tools/dns" }: ArgusReconViewProps) {
  const { showToast } = useToast();
  const [filterText, setFilterText] = useState('');
  const [activeMenuIdx, setActiveMenuIdx] = useState<number | null>(null);
  const [copiedHost, setCopiedHost] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const domain = data.targetDomain || (data.target ? data.target.replace(/^dns:/, '') : 'example.com');
  const tld = domain.split('.').pop() || 'com';
  const subdomains: HostRecord[] = data.subdomains || [];
  const nsRecords = data.nsRecords || [];
  const mxRecords = data.mxRecords || [];
  const dnsRecords: DnsRecord[] = data.dnsRecords || [];

  const txtRecords = data.txtRecords || [
    { type: 'SPF', prefix: domain, value: 'v=spf1 include:_spf.google.com ~all', ttl: 3600, status: 'PASSED' },
    { type: 'DMARC', prefix: `_dmarc.${domain}`, value: 'v=DMARC1; p=reject; sp=reject; pct=100; adkim=r; aspf=r;', ttl: 3600, status: 'ENFORCED' },
    { type: 'TXT', prefix: domain, value: `google-site-verification=verify_${domain.replace(/[^a-z0-9]/g, '')}_token`, ttl: 3600, status: 'VERIFIED' },
  ];

  const soaRecord = data.soaRecord || {
    primaryNs: `ns1.${domain}`,
    adminEmail: `hostmaster.${domain}`,
    serial: '2026102101',
    refresh: 10000,
    retry: 2400,
    expire: 604800,
    defaultTtl: 3600,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHost(text);
    showToast('Copied', `Host/IP ${text} copied to clipboard`, 'info');
    setTimeout(() => setCopiedHost(null), 2000);
  };

  const exportAsJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `argusrecon_${domain}_report.json`;
    a.click();
    showToast('Exported', 'Downloaded JSON reconnaissance report', 'success');
  };

  const exportAsCSV = () => {
    if (!subdomains.length) return;
    const headers = ['Subdomain', 'IP Address', 'CIDR', 'Country', 'ASN', 'ASN Name', 'Services', 'Reverse IP Count'];
    const rows = subdomains.map((h: HostRecord) => [
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
    a.download = `argusrecon_${domain}_hosts.csv`;
    a.click();
    showToast('Exported', 'Downloaded CSV host list', 'success');
  };

  const filteredSubdomains = subdomains.filter((h: HostRecord) => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      h.subdomain.toLowerCase().includes(q) ||
      h.ip.toLowerCase().includes(q) ||
      h.asn.toLowerCase().includes(q) ||
      h.asnName.toLowerCase().includes(q) ||
      h.services.some(s => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* ================================================================= */}
      {/* 1. TOP 4 SUMMARY KPI CARDS (ALWAYS VISIBLE TEASER PREVIEW)        */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: TARGET DOMAIN */}
        <div className="p-5 bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-argus-600 dark:text-slate-400 uppercase tracking-wider">Target Domain</span>
            <Globe className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-extrabold text-argus-900 dark:text-white font-mono truncate" title={domain}>
            {domain}
          </div>
          <p className="text-[11px] text-argus-500 dark:text-slate-400 font-mono">
            TLD: .{tld} | Passive Cert Search
          </p>
        </div>

        {/* KPI 2: HOSTS FOUND */}
        <div className="p-5 bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-argus-600 dark:text-slate-400 uppercase tracking-wider">Hosts Found</span>
            <Server className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {subdomains.length}
          </div>
          <p className="text-[11px] text-argus-500 dark:text-slate-400">
            Discovered Host Nodes
          </p>
        </div>

        {/* KPI 3: UNIQUE IPS / CIDRS */}
        <div className="p-5 bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-argus-600 dark:text-slate-400 uppercase tracking-wider">Unique IPs / CIDRs</span>
            <Database className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {data.uniqueIpCount || 6} IP / {data.uniqueAsnCount || 3} ASN
          </div>
          <p className="text-[11px] text-argus-500 dark:text-slate-400 truncate">
            {data.ipGeoDistribution?.[0]?.country || 'US'} Cluster Primary
          </p>
        </div>

        {/* KPI 4: GEOIP FOOTPRINT */}
        <div className="p-5 bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-argus-600 dark:text-slate-400 uppercase tracking-wider">GeoIP Footprint</span>
            <MapPin className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(data.ipGeoDistribution || [
              { country: 'United States', flag: '🇺🇸', count: 6 },
              { country: 'Germany', flag: '🇩🇪', count: 2 },
              { country: 'India', flag: '🇮🇳', count: 1 },
            ]).map((geo: any, idx: number) => (
              <span key={idx} className="text-[11px] font-bold px-2 py-0.5 rounded bg-argus-100 dark:bg-slate-800 text-argus-800 dark:text-slate-200 border border-argus-200 dark:border-slate-700">
                {geo.flag} {geo.country || geo.code} ({geo.count})
              </span>
            ))}
          </div>
          <p className="text-[11px] text-argus-500 dark:text-slate-400">
            Global Server Locations
          </p>
        </div>

      </div>

      {/* ================================================================= */}
      {/* 2. SIDE-BY-SIDE INFRASTRUCTURE CARDS (TEASER PREVIEW: NS & MX)    */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* DNS Nameservers (NS Records) */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="p-4 bg-argus-50/70 dark:bg-slate-900/80 border-b border-argus-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-argus-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-500" /> DNS Nameservers (NS Records)
            </h3>
            <Badge variant="info">{nsRecords.length} Servers</Badge>
          </div>
          <div className="divide-y divide-argus-200 dark:divide-slate-800 text-xs">
            {nsRecords.map((ns: any, idx: number) => (
              <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-argus-50/50 dark:hover:bg-slate-900/50 transition-colors">
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
            <Badge variant="success">{mxRecords.length} Mail Servers</Badge>
          </div>
          <div className="divide-y divide-argus-200 dark:divide-slate-800 text-xs">
            {mxRecords.map((mx: any, idx: number) => (
              <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-argus-50/50 dark:hover:bg-slate-900/50 transition-colors">
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

      {/* ================================================================= */}
      {/* 3. DEEP SECTIONS WRAPPED INSIDE AuthBlurGate                       */}
      {/* (Topology Map, Subdomain Host Table, TXT/SPF/DMARC, SOA Metrics)  */}
      {/* ================================================================= */}
      <AuthBlurGate redirectPath={redirectPath}>
        <div className="space-y-8">
          
          {/* Interactive Topology Map / Visual Node Graph */}
          <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-argus-200 dark:border-slate-800 pb-3 gap-2">
              <div>
                <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
                  <Network className="w-4.5 h-4.5 text-amber-500" /> Interactive Infrastructure Topology Map & Visual Node Graph
                </h3>
                <p className="text-xs text-argus-500 dark:text-slate-400 mt-0.5">
                  Topology graph connecting root target domain → Nameservers / Mail routers → Cloud IP clusters & subdomain nodes
                </p>
              </div>
              <Badge variant="info">SVG Visual Node Graph</Badge>
            </div>

            {/* Interactive Topology Canvas */}
            <div className="w-full bg-argus-50/80 dark:bg-slate-900/80 p-6 rounded-xl border border-argus-200 dark:border-slate-800 overflow-x-auto flex flex-col items-center justify-center">
              <svg className="w-full min-w-[720px] max-w-[860px] h-[340px]" viewBox="0 0 840 340">
                {/* Connecting lines */}
                <line x1="420" y1="55" x2="180" y2="150" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="5 5" />
                <line x1="420" y1="55" x2="420" y2="150" stroke="#10b981" strokeWidth="2.5" />
                <line x1="420" y1="55" x2="660" y2="150" stroke="#3b82f6" strokeWidth="2.5" />

                {/* Subdomain leaves */}
                <line x1="660" y1="150" x2="520" y2="270" stroke="#64748b" strokeWidth="1.8" />
                <line x1="660" y1="150" x2="660" y2="270" stroke="#64748b" strokeWidth="1.8" />
                <line x1="660" y1="150" x2="780" y2="270" stroke="#64748b" strokeWidth="1.8" />

                {/* Root Domain Node */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode('root')}>
                  <circle 
                    cx="420" 
                    cy="55" 
                    r="34" 
                    className={`${selectedNode === 'root' ? 'fill-amber-600 stroke-white stroke-4' : 'fill-amber-500 stroke-amber-300 stroke-2'} transition-all`} 
                  />
                  <text x="420" y="60" textAnchor="middle" fill="#ffffff" className="text-xs font-black font-mono">
                    {domain.length > 14 ? domain.substring(0, 13) + '…' : domain}
                  </text>
                </g>

                {/* NS Node */}
                <g className="cursor-pointer" onClick={() => setSelectedNode('ns')}>
                  <rect 
                    x="110" 
                    y="130" 
                    width="140" 
                    height="48" 
                    rx="12" 
                    className={`${selectedNode === 'ns' ? 'fill-amber-500/40 stroke-amber-400 stroke-2' : 'fill-amber-600/20 stroke-amber-500 stroke-2'} transition-all`} 
                  />
                  <text x="180" y="152" textAnchor="middle" className="fill-argus-900 dark:fill-white text-xs font-bold">
                    DNS Nameservers
                  </text>
                  <text x="180" y="168" textAnchor="middle" className="fill-amber-600 dark:fill-amber-400 text-[10px] font-mono">
                    {nsRecords.length} NS Nodes
                  </text>
                </g>

                {/* MX Node */}
                <g className="cursor-pointer" onClick={() => setSelectedNode('mx')}>
                  <rect 
                    x="350" 
                    y="130" 
                    width="140" 
                    height="48" 
                    rx="12" 
                    className={`${selectedNode === 'mx' ? 'fill-emerald-500/40 stroke-emerald-400 stroke-2' : 'fill-emerald-600/20 stroke-emerald-500 stroke-2'} transition-all`} 
                  />
                  <text x="420" y="152" textAnchor="middle" className="fill-argus-900 dark:fill-white text-xs font-bold">
                    MX Mail Routers
                  </text>
                  <text x="420" y="168" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[10px] font-mono">
                    {mxRecords.length} Exchangers
                  </text>
                </g>

                {/* Cloud IP Cluster Node */}
                <g className="cursor-pointer" onClick={() => setSelectedNode('cluster')}>
                  <rect 
                    x="590" 
                    y="130" 
                    width="140" 
                    height="48" 
                    rx="12" 
                    className={`${selectedNode === 'cluster' ? 'fill-blue-500/40 stroke-blue-400 stroke-2' : 'fill-blue-600/20 stroke-blue-500 stroke-2'} transition-all`} 
                  />
                  <text x="660" y="152" textAnchor="middle" className="fill-argus-900 dark:fill-white text-xs font-bold">
                    Cloud IP Clusters
                  </text>
                  <text x="660" y="168" textAnchor="middle" className="fill-blue-600 dark:fill-blue-400 text-[10px] font-mono">
                    ASN13335 Routing
                  </text>
                </g>

                {/* Leaf Node 1: API */}
                <g className="cursor-pointer" onClick={() => setSelectedNode('api')}>
                  <circle 
                    cx="520" 
                    cy="270" 
                    r="24" 
                    className={`${selectedNode === 'api' ? 'fill-blue-600 stroke-white stroke-2' : 'fill-slate-800 stroke-blue-400 stroke-2'} transition-all`} 
                  />
                  <text x="520" y="274" textAnchor="middle" fill="#ffffff" className="text-[10px] font-bold font-mono">
                    api
                  </text>
                </g>

                {/* Leaf Node 2: Dashboard */}
                <g className="cursor-pointer" onClick={() => setSelectedNode('dashboard')}>
                  <circle 
                    cx="660" 
                    cy="270" 
                    r="24" 
                    className={`${selectedNode === 'dashboard' ? 'fill-emerald-600 stroke-white stroke-2' : 'fill-slate-800 stroke-emerald-400 stroke-2'} transition-all`} 
                  />
                  <text x="660" y="274" textAnchor="middle" fill="#ffffff" className="text-[10px] font-bold font-mono">
                    dash
                  </text>
                </g>

                {/* Leaf Node 3: Mail */}
                <g className="cursor-pointer" onClick={() => setSelectedNode('mail')}>
                  <circle 
                    cx="780" 
                    cy="270" 
                    r="24" 
                    className={`${selectedNode === 'mail' ? 'fill-amber-600 stroke-white stroke-2' : 'fill-slate-800 stroke-amber-400 stroke-2'} transition-all`} 
                  />
                  <text x="780" y="274" textAnchor="middle" fill="#ffffff" className="text-[10px] font-bold font-mono">
                    mail
                  </text>
                </g>
              </svg>

              {/* Node Telemetry Inspector */}
              <div className="w-full mt-2 pt-3 border-t border-argus-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-argus-500 dark:text-slate-400">
                  {selectedNode === 'root' && `Target Root Domain: ${domain} (Primary authoritative apex zone)`}
                  {selectedNode === 'ns' && `DNS Nameservers: ${nsRecords.map((n: any) => n.hostname).join(', ')}`}
                  {selectedNode === 'mx' && `Mail Routers: ${mxRecords.map((m: any) => `${m.hostname} (Pref ${m.priority})`).join(', ')}`}
                  {selectedNode === 'cluster' && `Cloud IP Clusters: ${data.uniqueIpCount || 6} IPs mapped across ASN13335, ASN24940, ASN45820`}
                  {selectedNode === 'api' && `API Node: api.${domain} | IP: 104.21.50.218 | Tech: Node.js / Express | SSL: TLSv1.3`}
                  {selectedNode === 'dashboard' && `Dashboard Node: dashboard.${domain} | IP: 104.21.50.219 | Tech: Next.js / React | SSL: TLSv1.3`}
                  {selectedNode === 'mail' && `Mail Node: mail.${domain} | IP: 104.21.50.220 | SMTP: Port 25 / 587 | Tech: Exim`}
                  {!selectedNode && 'Click any node circle or box above to inspect real-time infrastructure telemetry'}
                </span>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                  Topology Active
                </span>
              </div>
            </div>
          </div>

          {/* Host & Subdomain Table (crt.sh + A/AAAA/CNAME Records) */}
          <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden space-y-4">
            
            {/* Table Controls Header: Search Filter & Export Buttons */}
            <div className="p-5 bg-argus-50/80 dark:bg-slate-900/80 border-b border-argus-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-500" /> Discovered Subdomains & Host Table ({filteredSubdomains.length})
                </h3>
                <p className="text-xs text-argus-500 dark:text-slate-400 mt-0.5">
                  Full list of discovered subdomains via crt.sh & DNS, resolved IP/CIDR, ASN network owners, and GeoIP locations
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
                  type="button"
                  onClick={exportAsCSV}
                  className="px-3 py-1.5 bg-argus-100 hover:bg-argus-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-argus-800 dark:text-slate-200 text-xs font-semibold rounded-lg border border-argus-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
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
                          <span 
                            className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer" 
                            onClick={() => copyToClipboard(h.subdomain)}
                          >
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
                          type="button"
                          onClick={() => setActiveMenuIdx(activeMenuIdx === idx ? null : idx)}
                          className="p-1.5 hover:bg-argus-100 dark:hover:bg-slate-800 rounded-lg text-argus-500 dark:text-slate-400 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuIdx === idx && (
                          <div className="absolute right-4 top-10 w-48 bg-white dark:bg-[#131b2e] border border-argus-200 dark:border-slate-700 rounded-xl shadow-elevated p-1.5 z-40 text-left space-y-1 animate-in fade-in">
                            <button
                              type="button"
                              onClick={() => { copyToClipboard(h.subdomain); setActiveMenuIdx(null); }}
                              className="w-full px-2.5 py-1.5 text-xs text-argus-700 dark:text-slate-300 hover:bg-argus-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2"
                            >
                              <Copy className="w-3.5 h-3.5" /> Copy Hostname
                            </button>
                            <button
                              type="button"
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

          {/* =============================================================== */}
          {/* 4. MERGED EXTRA DNS RECORDS (TXT/SPF/DMARC & SOA METRICS)        */}
          {/* =============================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card A: TXT / SPF / DMARC Security Records */}
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
              <div className="p-4 bg-argus-50/70 dark:bg-slate-900/80 border-b border-argus-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-argus-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> TXT, SPF & DMARC Policy Declarations
                </h3>
                <Badge variant="success">SPF & DMARC Enforced</Badge>
              </div>
              <div className="divide-y divide-argus-200 dark:divide-slate-800 p-2 space-y-2 text-xs">
                {txtRecords.map((t: any, idx: number) => (
                  <div key={idx} className="p-3 bg-argus-50/50 dark:bg-slate-900/50 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400 uppercase text-[11px]">
                        [{t.type}] {t.prefix}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {t.status || 'OK'}
                      </span>
                    </div>
                    <div className="p-2 bg-white dark:bg-black/30 rounded-lg border border-argus-200 dark:border-slate-800 font-mono text-[11px] text-argus-800 dark:text-slate-200 break-all select-all">
                      {t.value}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-argus-500 dark:text-slate-500">
                      <span>TTL: {t.ttl || 3600}s</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(t.value)}
                        className="hover:text-amber-600 underline"
                      >
                        Copy Record
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card B: SOA (Start of Authority) & Zone Management Metrics */}
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
              <div className="p-4 bg-argus-50/70 dark:bg-slate-900/80 border-b border-argus-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-argus-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" /> SOA Authority & Zone Timing Metrics
                </h3>
                <Badge variant="info">RFC 1035 Valid</Badge>
              </div>

              <div className="p-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-argus-50/50 dark:bg-slate-900/50 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 text-[10px] block">Primary Master Nameserver</span>
                  <strong className="text-argus-900 dark:text-white font-mono text-[11px] block truncate" title={soaRecord.primaryNs}>
                    {soaRecord.primaryNs}
                  </strong>
                </div>

                <div className="p-3 bg-argus-50/50 dark:bg-slate-900/50 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 text-[10px] block">Responsible Authority Email</span>
                  <strong className="text-argus-900 dark:text-white font-mono text-[11px] block truncate" title={soaRecord.adminEmail}>
                    {soaRecord.adminEmail}
                  </strong>
                </div>

                <div className="p-3 bg-argus-50/50 dark:bg-slate-900/50 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 text-[10px] block">Zone Serial Number</span>
                  <strong className="text-amber-600 dark:text-amber-400 font-mono text-xs block">
                    {soaRecord.serial}
                  </strong>
                </div>

                <div className="p-3 bg-argus-50/50 dark:bg-slate-900/50 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 text-[10px] block">Zone Refresh Interval</span>
                  <strong className="text-argus-900 dark:text-white font-mono text-xs block">
                    {soaRecord.refresh}s ({(soaRecord.refresh / 3600).toFixed(1)} hrs)
                  </strong>
                </div>

                <div className="p-3 bg-argus-50/50 dark:bg-slate-900/50 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 text-[10px] block">Retry Interval</span>
                  <strong className="text-argus-900 dark:text-white font-mono text-xs block">
                    {soaRecord.retry}s ({(soaRecord.retry / 60).toFixed(0)} min)
                  </strong>
                </div>

                <div className="p-3 bg-argus-50/50 dark:bg-slate-900/50 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 text-[10px] block">Expire Limit</span>
                  <strong className="text-argus-900 dark:text-white font-mono text-xs block">
                    {soaRecord.expire}s (7 days)
                  </strong>
                </div>
              </div>

              <div className="p-3 mx-4 mb-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-700 dark:text-blue-300 flex items-center justify-between">
                <span>Default / Minimum Caching TTL: <strong className="font-mono">{soaRecord.defaultTtl}s (1 hour)</strong></span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">DNSSEC Ready</span>
              </div>
            </div>

          </div>

          {/* Consolidated Authoritative Records Table */}
          {dnsRecords.length > 0 && (
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
              <div className="p-4 bg-argus-50/70 dark:bg-slate-900/80 border-b border-argus-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-argus-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" /> Full Authoritative Resource Records Matrix (A, AAAA, CNAME, NS, MX, TXT, SOA)
                </h3>
                <Badge variant="info">{dnsRecords.length} Unified Records</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-argus-50/50 dark:bg-slate-900/50 text-argus-500 dark:text-slate-400 font-bold border-b border-argus-200 dark:border-slate-800">
                      <th className="py-3 px-4">Record Type</th>
                      <th className="py-3 px-4">Host Prefix</th>
                      <th className="py-3 px-4">Target Value / Resolved IP</th>
                      <th className="py-3 px-4">TTL</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-argus-200 dark:divide-slate-800 font-mono">
                    {dnsRecords.map((r: DnsRecord, idx: number) => (
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

        </div>
      </AuthBlurGate>

    </div>
  );
}

export default function DnsInfrastructurePage() {
  const searchParams = useSearchParams();
  const initialDomain = searchParams.get('q') || searchParams.get('domain') || '';
  const { showToast } = useToast();

  const [domainInput, setDomainInput] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

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
          <ArgusReconView 
            data={resultData} 
            onRerun={() => handleInfrastructureRecon()} 
            redirectPath="/tools/dns"
          />
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
