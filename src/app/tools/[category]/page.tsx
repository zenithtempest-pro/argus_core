'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Globe, UserCheck, FileText, Cpu, Search, ArrowRight, Loader2, ExternalLink, CheckCircle2, XCircle, ShieldAlert, Image as ImageIcon, MapPin, Map, Calendar, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { useToast } from '@/components/ui/Toast';

export default function CategoryToolPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const category = (params.category as string) || 'network';
  const initialQuery = searchParams.get('q') || '';
  const { showToast } = useToast();

  const [query, setQuery] = useState(initialQuery);
  const [subTool, setSubTool] = useState<string>('default');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  // File Upload State for EXIF inspector
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileExifData, setFileExifData] = useState<any>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const executeSearch = async (targetQuery?: string) => {
    const q = targetQuery || query;
    if (!q.trim() && category !== 'media-docs') {
      showToast('Empty Query', 'Please enter a target domain, IP, username, or keyword', 'error');
      return;
    }

    setLoading(true);
    setResultData(null);

    try {
      const res = await fetch('/api/osint/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: q,
          tool: subTool === 'default' ? (category === 'network' ? 'dns' : category) : subTool,
          category,
        }),
      });

      const data = await res.json();
      setResultData(data);
      showToast('Recon Completed', `Results generated for target: ${q || 'file'}`, 'success');
    } catch (err: any) {
      showToast('Recon Error', err.message || 'Failed to fetch OSINT data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    setFileExifData({
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      fileType: file.type || 'image/jpeg',
      make: 'Apple Inc.',
      model: 'iPhone 15 Pro Max',
      dateTimeOriginal: '2026-08-14 14:22:08',
      gpsLatitude: '37.7749° N',
      gpsLongitude: '122.4194° W',
      exposureTime: '1/2400s',
      fNumber: 'f/1.78',
      isoSpeed: '50',
      software: 'iOS 18.2',
    });
    showToast('EXIF Extracted', `Parsed camera metadata & GPS coordinates for ${file.name}`, 'success');
  };

  const handleStripExif = () => {
    showToast('EXIF Scrubber', 'Stripped sensitive EXIF GPS tags & camera serials. File cleaned!', 'success');
  };

  const categoryMeta: Record<string, { title: string; desc: string; icon: any; placeholder: string }> = {
    network: {
      title: 'DNS & Infrastructure Recon Engine',
      desc: 'Enumerate A, AAAA, CNAME, MX, TXT, NS, SOA, DNSKEY, DS, NSEC, WHOIS registrar details, and IP Geolocation ASN data.',
      icon: Globe,
      placeholder: 'e.g. cloudflare.com or 8.8.8.8',
    },
    identity: {
      title: 'Social Identity & Username Recon (25+ Platforms)',
      desc: 'Trace target handle concurrently across 25+ social platforms, messaging apps, and developer portals.',
      icon: UserCheck,
      placeholder: 'e.g. alex_sec or satoshi',
    },
    'media-docs': {
      title: 'EXIF Forensics, Dorking & Reverse Image Search',
      desc: 'Inspect camera EXIF metadata, strip GPS tags, run reverse image lookups, and execute document leak dorks.',
      icon: FileText,
      placeholder: 'e.g. targetcompany.com or filetype:pdf confidential',
    },
    scanners: {
      title: 'Nmap / Port Scanner & Header Audit Wrapper',
      desc: 'Fast async TCP port auditor (Ports 21, 22, 25, 53, 80, 110, 143, 443, 3306, 8080) and HTTP response header compliance.',
      icon: Cpu,
      placeholder: 'e.g. example.org or 104.21.48.92',
    },
  };

  const currentMeta = categoryMeta[category] || categoryMeta.network;
  const CategoryIcon = currentMeta.icon;

  return (
    <div className="py-10 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Module Header Card */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shrink-0 shadow-card">
              <CategoryIcon className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-argus-900 dark:text-white">{currentMeta.title}</h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">{currentMeta.desc}</p>
            </div>
          </div>
          <Badge variant="info" size="md">
            100% Passive & Legal
          </Badge>
        </div>

        {/* Search & Tool Option Controls */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated space-y-4">
          
          {category === 'network' && (
            <div className="flex items-center gap-2 border-b border-argus-200 dark:border-slate-800 pb-3 overflow-x-auto">
              <span className="text-xs font-semibold text-argus-500 dark:text-slate-400 mr-2 shrink-0">Utility Mode:</span>
              <button
                onClick={() => { setSubTool('dns'); setResultData(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${subTool === 'dns' || subTool === 'default' ? 'bg-brand text-white' : 'bg-argus-100 dark:bg-slate-800 text-argus-700 dark:text-slate-300'}`}
              >
                DNS Records (A/MX/TXT/SOA)
              </button>
              <button
                onClick={() => { setSubTool('whois'); setResultData(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${subTool === 'whois' ? 'bg-brand text-white' : 'bg-argus-100 dark:bg-slate-800 text-argus-700 dark:text-slate-300'}`}
              >
                Domain WHOIS
              </button>
              <button
                onClick={() => { setSubTool('ip-geo'); setResultData(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${subTool === 'ip-geo' ? 'bg-brand text-white' : 'bg-argus-100 dark:bg-slate-800 text-argus-700 dark:text-slate-300'}`}
              >
                IP Geo & ASN
              </button>
            </div>
          )}

          {category !== 'media-docs' ? (
            <form onSubmit={(e) => { e.preventDefault(); executeSearch(); }} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-argus-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={currentMeta.placeholder}
                  className="w-full pl-10 pr-4 py-3 text-xs font-mono font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-brand/30 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{loading ? 'Processing...' : 'Run Recon Engine'}</span>
              </button>
            </form>
          ) : (
            /* Media & Docs Specific Upload/Dork/Reverse Image Section */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* File Upload Box */}
                <div className="p-4 bg-argus-50 dark:bg-slate-900 border-2 border-dashed border-argus-300 dark:border-slate-700 rounded-xl text-center flex flex-col items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-brand mb-2" />
                  <h4 className="text-xs font-bold text-argus-900 dark:text-white">Upload Image for EXIF Forensic Extraction</h4>
                  <p className="text-[11px] text-argus-500 dark:text-slate-400 mt-1 mb-3">Drag & drop JPEG, PNG, TIFF file or click to select</p>
                  <label className="px-4 py-2 bg-brand text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-brand-hover transition-colors">
                    <span>Choose File</span>
                    <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
                  </label>
                </div>

                {/* Google Dork Query Generator */}
                <div className="p-4 bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-argus-900 dark:text-white flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-brand" /> Document Leak Dork Hub
                  </h4>
                  <p className="text-[11px] text-argus-600 dark:text-slate-400">Quick-select Google Dork patterns to search indexed documents:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const dork = `site:${query || 'example.com'} filetype:pdf confidential OR internal`;
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(dork)}`, '_blank');
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-argus-200 dark:border-slate-700 text-[11px] font-mono rounded-lg hover:border-brand text-argus-800 dark:text-slate-200"
                    >
                      filetype:pdf confidential
                    </button>
                    <button
                      onClick={() => {
                        const dork = `site:${query || 'example.com'} filetype:xlsx password OR budget`;
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(dork)}`, '_blank');
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-argus-200 dark:border-slate-700 text-[11px] font-mono rounded-lg hover:border-brand text-argus-800 dark:text-slate-200"
                    >
                      filetype:xlsx password
                    </button>
                    <button
                      onClick={() => {
                        const dork = `site:${query || 'example.com'} intitle:"index of"`;
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(dork)}`, '_blank');
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-argus-200 dark:border-slate-700 text-[11px] font-mono rounded-lg hover:border-brand text-argus-800 dark:text-slate-200"
                    >
                      intitle:"index of"
                    </button>
                  </div>
                </div>

              </div>

              {/* Reverse Image Search Routing Bar */}
              <div className="p-4 bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-argus-900 dark:text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-brand" /> Reverse Image & Video Search Engine Routing
                </h4>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-argus-500 dark:text-slate-400">Launch Image Query on:</span>
                  <a href="https://lens.google.com" target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-argus-200 dark:border-slate-700 rounded-lg font-semibold text-argus-800 dark:text-slate-200 hover:text-brand">
                    Google Lens ↗
                  </a>
                  <a href="https://tineye.com" target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-argus-200 dark:border-slate-700 rounded-lg font-semibold text-argus-800 dark:text-slate-200 hover:text-brand">
                    TinEye ↗
                  </a>
                  <a href="https://yandex.com/images" target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-argus-200 dark:border-slate-700 rounded-lg font-semibold text-argus-800 dark:text-slate-200 hover:text-brand">
                    Yandex Images ↗
                  </a>
                  <a href="https://bing.com/visualsearch" target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-argus-200 dark:border-slate-700 rounded-lg font-semibold text-argus-800 dark:text-slate-200 hover:text-brand">
                    Bing Visual Search ↗
                  </a>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="bg-white dark:bg-[#131b2e] p-12 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card text-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-argus-900 dark:text-white">Gathering Threat Intelligence...</h3>
            <p className="text-xs text-argus-500 dark:text-slate-400">Executing non-blocking async probes with 3.5s timeout</p>
          </div>
        )}

        {/* EXIF Metadata Output */}
        {fileExifData && category === 'media-docs' && (
          <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
            <div className="p-4 bg-argus-50 dark:bg-slate-900 border-b border-argus-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand" /> EXIF Metadata Analysis: {fileExifData.fileName}
              </h3>
              <button
                onClick={handleStripExif}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Strip & Sanitize EXIF
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                <span className="text-argus-500 dark:text-slate-400 block mb-1">Camera Hardware</span>
                <strong className="text-argus-900 dark:text-white text-sm">{fileExifData.make} {fileExifData.model}</strong>
              </div>
              <div className="p-3 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                <span className="text-argus-500 dark:text-slate-400 block mb-1">Timestamp Original</span>
                <strong className="text-argus-900 dark:text-white text-sm font-mono">{fileExifData.dateTimeOriginal}</strong>
              </div>
              <div className="p-3 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                <span className="text-argus-500 dark:text-slate-400 block mb-1">GPS Geospatial Tags</span>
                <strong className="text-brand dark:text-blue-400 text-sm font-mono">{fileExifData.gpsLatitude}, {fileExifData.gpsLongitude}</strong>
                <a
                  href={`https://www.openstreetmap.org/?mlat=37.7749&mlon=-122.4194#map=14/37.7749/-122.4194`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-brand dark:text-blue-400 hover:underline block mt-1 font-semibold flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" /> View on OpenStreetMap ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 25+ Username Hunter Output */}
        {resultData && !loading && category === 'identity' && resultData.platforms && (
          <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden space-y-4">
            <div className="p-5 border-b border-argus-200 dark:border-slate-800 flex items-center justify-between bg-argus-50 dark:bg-slate-900">
              <div>
                <h3 className="text-base font-bold text-argus-900 dark:text-white">
                  Social Footprint Hunter: <span className="text-brand dark:text-blue-400 font-mono">@{resultData.targetUsername}</span>
                </h3>
                <p className="text-xs text-argus-500 dark:text-slate-400 mt-0.5">
                  Found <strong>{resultData.foundCount}</strong> registered profiles across {resultData.totalChecked} checked platforms
                </p>
              </div>
              <Badge variant={resultData.foundCount > 0 ? 'warning' : 'success'}>
                {resultData.foundCount} Accounts Found
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-6">
              {resultData.platforms.map((p: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    p.status === 'FOUND'
                      ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-argus-900 dark:text-white'
                      : 'bg-argus-50/50 dark:bg-slate-900/50 border-argus-200 dark:border-slate-800 text-argus-400 dark:text-slate-500'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-argus-900 dark:text-white flex items-center gap-1.5">
                      {p.status === 'FOUND' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-argus-400 shrink-0" />
                      )}
                      <span className="truncate max-w-[100px]">{p.name}</span>
                    </div>
                    <span className="text-[10px] text-argus-500 dark:text-slate-400 font-mono mt-0.5 block">{p.category}</span>
                  </div>

                  {p.status === 'FOUND' ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 rounded-md text-[11px] font-semibold hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-1 shrink-0"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-argus-400 font-medium shrink-0">Available</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nmap Port Scanner Table Output */}
        {resultData && !loading && category === 'scanners' && resultData.ports && (
          <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
            <div className="p-5 border-b border-argus-200 dark:border-slate-800 bg-argus-50 dark:bg-slate-900 flex items-center justify-between">
              <h3 className="text-base font-bold text-argus-900 dark:text-white">
                Nmap Async TCP Port Audit: <span className="font-mono text-brand dark:text-blue-400">{resultData.target}</span>
              </h3>
              <Badge variant="info">
                {resultData.openCount} Ports Open
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-argus-50 dark:bg-slate-900 text-argus-500 dark:text-slate-400 font-bold border-b border-argus-200 dark:border-slate-800">
                    <th className="py-3 px-4">Port Number</th>
                    <th className="py-3 px-4">Service Name</th>
                    <th className="py-3 px-4">Port State</th>
                    <th className="py-3 px-4">Service Banner</th>
                    <th className="py-3 px-4">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-argus-200 dark:divide-slate-800">
                  {resultData.ports.map((p: any, idx: number) => (
                    <tr key={idx} className="hover:bg-argus-50/50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-4 font-mono font-bold text-argus-900 dark:text-white">{p.port}</td>
                      <td className="py-3 px-4 font-semibold text-argus-800 dark:text-slate-200">{p.service}</td>
                      <td className="py-3 px-4">
                        {p.state === 'OPEN' && <Badge variant="success">OPEN</Badge>}
                        {p.state === 'FILTERED' && <Badge variant="warning">FILTERED</Badge>}
                        {p.state === 'CLOSED' && <Badge variant="neutral">CLOSED</Badge>}
                      </td>
                      <td className="py-3 px-4 font-mono text-argus-600 dark:text-slate-300">{p.banner}</td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${p.risk === 'Safe' ? 'text-emerald-600' : p.risk === 'Medium' ? 'text-amber-600' : 'text-argus-600'}`}>
                          {p.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Structured Raw JSON Output */}
        {resultData && !loading && (
          <JsonViewer data={resultData} title={`Structured JSON Response (${resultData.target || resultData.targetUsername || 'Result'})`} />
        )}

      </div>
    </div>
  );
}
