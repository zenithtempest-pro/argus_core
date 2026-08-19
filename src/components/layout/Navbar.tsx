'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Search, Download, LayoutDashboard, Wrench, Info, Mail, Menu, X, UserCheck, LogIn, ChevronDown, Zap, AlertOctagon, MailCheck, ShieldCheck, FileCode, Activity, FileText, Image as ImageIcon, Cpu, Phone, Car } from 'lucide-react';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { ThemeToggle } from '../theme/ThemeToggle';

export function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const diagnosticGroup = [
    { href: '/tools/supertool', label: 'SuperTool Command', icon: Zap },
    { href: '/tools/blacklist', label: 'Blacklist Checker', icon: AlertOctagon },
    { href: '/tools/mx-lookup', label: 'MX Record Lookup', icon: MailCheck },
    { href: '/tools/dmarc', label: 'DMARC Record Check', icon: ShieldCheck },
    { href: '/tools/header-analyzer', label: 'Header Analyzer', icon: FileCode },
    { href: '/tools/spf', label: 'SPF Record Inspector', icon: Mail },
    { href: '/tools/domain-health', label: 'Domain Health Audit', icon: Activity },
  ];

  const osintGroup = [
    { href: '/tools/identity', label: '25+ Username Hunter', icon: UserCheck },
    { href: '/tools/phone-lookup', label: 'Phone Number Lookup', icon: Phone },
    { href: '/tools/vehicle-lookup', label: 'Vehicle & VIN Lookup', icon: Car },
    { href: '/tools/media-docs', label: 'EXIF & Document Dorking', icon: FileText },
    { href: '/tools/scanners', label: 'Nmap TCP Port Auditor', icon: Cpu },
    { href: '/tools/network', label: 'DNS Infrastructure & IP Geo', icon: Wrench },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md border-b border-argus-200 dark:border-slate-800 shadow-subtle transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white shadow-card group-hover:bg-brand-hover transition-colors">
                <Shield className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-argus-900 dark:text-white flex items-center gap-1.5">
                  ArgusCore
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-light dark:bg-brand/20 text-brand dark:text-blue-400 border border-brand-border dark:border-brand/40">
                    Enterprise
                  </span>
                </span>
                <span className="text-[11px] text-argus-500 dark:text-slate-400 font-medium -mt-0.5">OSINT & Network Diagnostics</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive('/') && pathname === '/'
                    ? 'bg-brand-light dark:bg-brand/20 text-brand dark:text-blue-400 border border-brand-border dark:border-brand/40'
                    : 'text-argus-600 dark:text-slate-300 hover:text-argus-900 dark:hover:text-white hover:bg-argus-100 dark:hover:bg-slate-800'
                }`}
              >
                Overview
              </Link>

              {/* OSINT Tools Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsToolsDropdownOpen(true)}
                onMouseLeave={() => setIsToolsDropdownOpen(false)}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    pathname?.startsWith('/tools')
                      ? 'bg-brand-light dark:bg-brand/20 text-brand dark:text-blue-400 border border-brand-border dark:border-brand/40'
                      : 'text-argus-600 dark:text-slate-300 hover:text-argus-900 dark:hover:text-white hover:bg-argus-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>OSINT & Diagnostics</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isToolsDropdownOpen && (
                  <div className="absolute left-0 top-full pt-1 w-96 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-white dark:bg-[#131b2e] border border-argus-200 dark:border-slate-700 rounded-xl shadow-elevated p-3 space-y-3">
                      
                      {/* Group 1: MXToolbox Diagnostics */}
                      <div>
                        <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1.5 px-2">
                          MXToolbox Diagnostic Suite
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {diagnosticGroup.map((tool) => {
                            const Icon = tool.icon;
                            return (
                              <Link
                                key={tool.href}
                                href={tool.href}
                                onClick={() => setIsToolsDropdownOpen(false)}
                                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-argus-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-argus-800 dark:text-slate-200 hover:text-brand"
                              >
                                <Icon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span className="truncate">{tool.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      {/* Group 2: OSINT Recon Engines */}
                      <div className="pt-2 border-t border-argus-200 dark:border-slate-800">
                        <div className="text-[10px] font-bold text-brand dark:text-blue-400 uppercase tracking-wider mb-1.5 px-2">
                          OSINT Recon Engines
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {osintGroup.map((tool) => {
                            const Icon = tool.icon;
                            return (
                              <Link
                                key={tool.href}
                                href={tool.href}
                                onClick={() => setIsToolsDropdownOpen(false)}
                                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-argus-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-argus-800 dark:text-slate-200 hover:text-brand"
                              >
                                <Icon className="w-3.5 h-3.5 text-brand shrink-0" />
                                <span className="truncate">{tool.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/downloads"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive('/downloads')
                    ? 'bg-brand-light dark:bg-brand/20 text-brand dark:text-blue-400 border border-brand-border dark:border-brand/40'
                    : 'text-argus-600 dark:text-slate-300 hover:text-argus-900 dark:hover:text-white hover:bg-argus-100 dark:hover:bg-slate-800'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                Script Hub
              </Link>

              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive('/dashboard')
                    ? 'bg-brand-light dark:bg-brand/20 text-brand dark:text-blue-400 border border-brand-border dark:border-brand/40'
                    : 'text-argus-600 dark:text-slate-300 hover:text-argus-900 dark:hover:text-white hover:bg-argus-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>

              <Link
                href="/methodology"
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive('/methodology') || isActive('/about')
                    ? 'bg-brand-light dark:bg-brand/20 text-brand dark:text-blue-400 border border-brand-border dark:border-brand/40'
                    : 'text-argus-600 dark:text-slate-300 hover:text-argus-900 dark:hover:text-white hover:bg-argus-100 dark:hover:bg-slate-800'
                }`}
              >
                Methodology
              </Link>

              <Link
                href="/support"
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive('/support') || isActive('/contact')
                    ? 'bg-brand-light dark:bg-brand/20 text-brand dark:text-blue-400 border border-brand-border dark:border-brand/40'
                    : 'text-argus-600 dark:text-slate-300 hover:text-argus-900 dark:hover:text-white hover:bg-argus-100 dark:hover:bg-slate-800'
                }`}
              >
                Support
              </Link>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-argus-500 dark:text-slate-400 bg-argus-100 dark:bg-slate-800 border border-argus-200 dark:border-slate-700 rounded-lg hover:border-brand transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search targets...</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded text-argus-600 dark:text-slate-300">
                  /
                </kbd>
              </button>

              <ThemeToggle />

              {mounted && isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-argus-800 dark:text-slate-200 bg-argus-100 dark:bg-slate-800 hover:bg-argus-200 dark:hover:bg-slate-700 border border-argus-200 dark:border-slate-700 rounded-lg transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden sm:inline">Session</span>
                  </Link>
                  <button
                    onClick={() => setIsLoggedIn(false)}
                    className="text-xs text-argus-500 dark:text-slate-400 hover:text-rose-600 px-1.5 py-1 transition-colors"
                  >
                    Exit
                  </button>
                </div>
              ) : mounted ? (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-card transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              ) : null}

              {/* Mobile Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-argus-600 dark:text-slate-300 rounded-lg hover:bg-argus-100 dark:hover:bg-slate-800"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-b border-argus-200 dark:border-slate-800 bg-white dark:bg-[#090d16] px-4 pt-2 pb-4 space-y-1">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-argus-600 dark:text-slate-300 bg-argus-100 dark:bg-slate-800 rounded-lg mb-2"
            >
              <Search className="w-4 h-4" /> Quick Target Search
            </button>
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-semibold text-argus-800 dark:text-slate-200">
              Overview
            </Link>
            <div className="px-3 py-1 text-xs font-bold text-amber-600 uppercase">MXToolbox Suite</div>
            {diagnosticGroup.map((t) => (
              <Link key={t.href} href={t.href} onClick={() => setIsMobileMenuOpen(false)} className="block pl-6 py-1 text-xs text-argus-600 dark:text-slate-300 hover:text-amber-600">
                • {t.label}
              </Link>
            ))}
            <div className="px-3 py-1 text-xs font-bold text-brand uppercase mt-2">OSINT Recon</div>
            {osintGroup.map((t) => (
              <Link key={t.href} href={t.href} onClick={() => setIsMobileMenuOpen(false)} className="block pl-6 py-1 text-xs text-argus-600 dark:text-slate-300 hover:text-brand">
                • {t.label}
              </Link>
            ))}
            <Link href="/downloads" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-semibold text-argus-800 dark:text-slate-200 mt-2">
              Script Hub
            </Link>
            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-semibold text-argus-800 dark:text-slate-200">
              Dashboard
            </Link>
            <Link href="/methodology" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-semibold text-argus-800 dark:text-slate-200">
              Methodology
            </Link>
            <Link href="/support" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-semibold text-argus-800 dark:text-slate-200">
              Support
            </Link>
          </div>
        )}
      </header>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
