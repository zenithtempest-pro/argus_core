'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, UserCheck, FileText, Cpu, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function ToolsIndexPage() {
  const categories = [
    {
      id: 'network',
      name: 'DNS & Infrastructure Recon',
      icon: Globe,
      speed: 'Instant (<1s)',
      description: 'Comprehensive DNS enumeration (A, AAAA, MX, TXT, NS, SOA), WHOIS domain registrar queries, IP Geolocation, and reverse DNS lookup.',
      tools: ['DNS Enumeration', 'Domain Whois', 'IP Geolocation & ASN', 'Subdomain Discovery'],
      sample: 'e.g. google.com, 1.1.1.1',
    },
    {
      id: 'identity',
      name: 'Social Media & Username Recon',
      icon: UserCheck,
      speed: '1-3s Concurrent',
      description: 'Search target usernames across 10+ major social media platforms (GitHub, X/Twitter, Reddit, Instagram, Telegram, LinkedIn, YouTube, TikTok).',
      tools: ['Multi-Platform Username Hunter', 'Email Deliverability & MX Check', 'Breach Record Mapping'],
      sample: 'e.g. @satoshi, alex_sec',
    },
    {
      id: 'media-docs',
      name: 'EXIF Metadata & Document Forensics',
      icon: FileText,
      speed: 'Instant (Client-Side)',
      description: 'Extract EXIF/IPTC camera data, GPS coordinates, author metadata, software stamps from images and generate targeted Google Dork queries.',
      tools: ['EXIF Image Metadata Extractor', 'Google Dork Query Generator', 'Document Leaks Builder'],
      sample: 'e.g. filetype:pdf confidential',
    },
    {
      id: 'scanners',
      name: 'Safe Network Port & Header Audit',
      icon: Cpu,
      speed: '2-4s',
      description: 'Non-intrusive TCP service port checker (HTTP, HTTPS, SSH, FTP, SMTP, DNS, MySQL) and HTTP security header compliance inspector.',
      tools: ['Common TCP Port Auditor', 'HTTP Response Header Audit', 'SSL/TLS Cipher Checker'],
      sample: 'e.g. target.domain.com',
    },
  ];

  return (
    <div className="py-12 bg-argus-50 min-h-[90vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Header */}
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="info" size="md" className="mb-3">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> OSINT Engine Directory
          </Badge>
          <h1 className="text-3xl font-extrabold text-argus-900 tracking-tight">Investigative Reconnaissance Modules</h1>
          <p className="mt-3 text-sm text-argus-600">
            Select a specialized OSINT module to execute passive reconnaissance, generate structured reports, and export raw JSON output.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <div
                key={cat.id}
                className="bg-white border border-argus-200 rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-light text-brand flex items-center justify-center">
                      <IconComponent className="w-6 h-6 stroke-[2]" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                      <Zap className="w-3 h-3" />
                      <span>{cat.speed}</span>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-argus-900 mb-2">{cat.name}</h2>
                  <p className="text-xs text-argus-600 leading-relaxed mb-6">{cat.description}</p>

                  <div className="p-3 bg-argus-50 rounded-xl border border-argus-200 mb-6">
                    <div className="text-[11px] font-bold text-argus-500 uppercase tracking-wider mb-2">Available Utilities</div>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.tools.map((t, idx) => (
                        <span key={idx} className="text-xs font-semibold bg-white text-argus-800 border border-argus-200 px-2.5 py-1 rounded-lg">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-argus-100 flex items-center justify-between">
                  <span className="text-xs text-argus-400 font-mono">{cat.sample}</span>
                  <Link
                    href={cat.id === 'media-docs' ? '/tools/media-docs' : `/tools/${cat.id}`}
                    className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-xl shadow-card transition-all flex items-center gap-2"
                  >
                    <span>Launch Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
