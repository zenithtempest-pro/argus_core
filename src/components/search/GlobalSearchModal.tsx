'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Shield, Globe, User, FileText, Cpu, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearch = (category: string) => {
    if (!query.trim()) return;
    onClose();
    router.push(`/tools/${category}?q=${encodeURIComponent(query)}`);
  };

  const quickToolCategories = [
    { id: 'network', name: 'DNS & Whois Recon', icon: Globe, desc: 'Lookup DNS, Registrar, IP Geolocation' },
    { id: 'identity', name: 'Identity & Social Recon', icon: User, desc: 'Check username across 10+ platforms' },
    { id: 'media-docs', name: 'Metadata & Document Dorking', icon: FileText, desc: 'Inspect EXIF data & document leaks' },
    { id: 'scanners', name: 'Port & Header Audit', icon: Cpu, desc: 'Scan HTTP/S, SSH, FTP & response headers' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-argus-900/40 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white border border-argus-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-argus-200 bg-argus-50">
          <Search className="w-5 h-5 text-argus-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Target Domain (e.g. example.com), IP (8.8.8.8), Username, or Hash..."
            className="w-full py-4 text-sm font-medium bg-transparent text-argus-900 focus:outline-none placeholder-argus-400"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch('network');
            }}
          />
          <button
            onClick={onClose}
            className="p-1 text-argus-400 hover:text-argus-700 rounded-lg hover:bg-argus-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-white">
          <div className="text-xs font-semibold text-argus-400 uppercase tracking-wider mb-3 px-2">
            Select OSINT Recon Engine
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickToolCategories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSearch(cat.id)}
                  className="flex items-start p-3 rounded-xl border border-argus-200 hover:border-brand hover:bg-brand-light/40 text-left transition-all group"
                >
                  <div className="p-2 rounded-lg bg-argus-100 group-hover:bg-brand group-hover:text-white text-argus-700 mr-3 transition-colors">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-argus-900 group-hover:text-brand flex items-center justify-between">
                      {cat.name}
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-argus-500 mt-0.5 line-clamp-1">{cat.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 py-3 bg-argus-50 border-t border-argus-200 flex items-center justify-between text-xs text-argus-500">
          <span>Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-argus-700 font-mono">ESC</kbd> to exit</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-brand" /> ArgusCore Intelligence Engine v1.0
          </span>
        </div>
      </div>
    </div>
  );
}
