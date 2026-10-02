'use client';

import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  Loader2, 
  Info, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  AtSign, 
  Mail, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { useToast } from '@/components/ui/Toast';

export default function EmailReconPage() {
  const { showToast } = useToast();
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const handleEmailRecon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      showToast('Input Required', 'Please enter a valid target email address (e.g. target@gmail.com)', 'error');
      return;
    }

    setLoading(true);
    setResultData(null);

    try {
      const res = await fetch('/api/osint/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: emailInput.trim(),
          tool: 'email-recon',
        }),
      });

      const data = await res.json();
      setResultData(data);
      showToast('Email Recon Complete', `Discovered ${data.foundCount || 0} active platform identities`, 'success');
    } catch (err: any) {
      showToast('Recon Error', err.message || 'Failed to execute email social recon', 'error');
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
              <AtSign className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white">Email & Social Recon Searcher</h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                OSINT Identity Engine performing email prefix parsing, Gravatar hash resolution, GitHub, Google Profile, and Holehe-style account registration checks
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            Holehe & Gravatar OSINT
          </Badge>
        </div>

        {/* Input Form */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated space-y-4">
          <form onSubmit={handleEmailRecon} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-argus-400" />
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter target email address (e.g. analyst@gmail.com, target@domain.com)..."
                className="w-full pl-10 pr-4 py-3 text-xs font-mono font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-argus-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
              <span>{loading ? 'Searching Profiles...' : 'Social Recon Search'}</span>
            </button>
          </form>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 text-xs text-argus-500 dark:text-slate-400 flex-wrap pt-1">
            <span className="font-semibold text-argus-700 dark:text-slate-300">Sample Queries:</span>
            <button
              type="button"
              onClick={() => { setEmailInput('alex.security@gmail.com'); handleEmailRecon(); }}
              className="hover:text-amber-600 underline font-mono text-[11px]"
            >
              alex.security@gmail.com
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setEmailInput('satoshi@bitcoin.org'); handleEmailRecon(); }}
              className="hover:text-amber-600 underline font-mono text-[11px]"
            >
              satoshi@bitcoin.org
            </button>
          </div>
        </div>

        {/* Results Visual Grid */}
        {resultData && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Profile & Domain Metadata Summary */}
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-argus-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  {resultData.gravatarAvatar && (
                    <img 
                      src={resultData.gravatarAvatar} 
                      alt="Gravatar Profile" 
                      className="w-12 h-12 rounded-full border-2 border-amber-500 shadow-card"
                    />
                  )}
                  <div>
                    <h3 className="text-base font-bold text-argus-900 dark:text-white font-mono">
                      {resultData.targetEmail}
                    </h3>
                    <p className="text-xs text-argus-500 dark:text-slate-400 mt-0.5">
                      Username Handle: <strong className="font-mono text-amber-600 dark:text-amber-400">@{resultData.usernamePrefix}</strong> | Domain Provider: <strong>{resultData.domain}</strong>
                    </p>
                  </div>
                </div>
                <Badge variant={resultData.foundCount > 0 ? 'success' : 'neutral'}>
                  {resultData.foundCount} Profiles Discovered
                </Badge>
              </div>

              {/* Identity Details Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">Gravatar Status</span>
                  <strong className="text-argus-900 dark:text-white text-sm">
                    {resultData.gravatarFound ? 'Avatar Associated' : 'No Gravatar Avatar'}
                  </strong>
                </div>

                <div className="p-3 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">Domain Mail Exchange</span>
                  <strong className="text-argus-900 dark:text-white text-sm">
                    {resultData.isGmail ? 'Google Workspace / Gmail' : 'Custom Corporate Domain'}
                  </strong>
                </div>

                <div className="p-3 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">PGP Key Server</span>
                  <strong className="text-amber-600 dark:text-amber-400 text-sm font-mono">
                    {resultData.pgpFound ? 'Public Key Available' : 'No PGP Key Listed'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Social Accounts Grid (3-Column / 4-Column Card Grid) */}
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card overflow-hidden">
              <div className="p-4 bg-argus-50/70 dark:bg-slate-900/80 border-b border-argus-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-argus-800 dark:text-slate-200 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-500" /> Discovered Social & Registry Profiles ({resultData.platforms?.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 p-6">
                {resultData.platforms?.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      p.status === 'FOUND'
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-argus-900 dark:text-white shadow-subtle'
                        : 'bg-argus-50/30 dark:bg-slate-900/40 border-argus-200 dark:border-slate-800 text-argus-400 dark:text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {p.status === 'FOUND' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-argus-400 shrink-0" />
                        )}
                        <span className="font-bold text-xs text-argus-900 dark:text-white">{p.name}</span>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        p.status === 'FOUND'
                          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                          : 'bg-argus-100 dark:bg-slate-800 text-argus-500 border-argus-200 dark:border-slate-700'
                      }`}>
                        {p.status === 'FOUND' ? 'Registered' : 'Not Found'}
                      </span>
                    </div>

                    <p className="text-[11px] text-argus-500 dark:text-slate-400 line-clamp-2">
                      {p.details || (p.status === 'FOUND' ? 'Account exists with associated email identity' : 'No account registered with this email address')}
                    </p>

                    {p.status === 'FOUND' ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>View Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <div className="text-[11px] text-center text-argus-400 font-mono py-1">
                        Available
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <JsonViewer data={resultData} title="Raw Email Social Recon JSON" />
          </div>
        )}

        {/* Documentation Block */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-subtle space-y-3 text-xs">
          <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-brand" /> ABOUT EMAIL & GMAIL SOCIAL RECON SEARCHER
          </h3>
          <p className="text-argus-600 dark:text-slate-300 leading-relaxed">
            The <strong>Email & Social Recon Searcher</strong> performs passive OSINT identity mapping across top web platforms. By computing MD5 hashes for Gravatar, checking public developer profiles (GitHub, GitLab, Dev.to), inspecting PGP keyservers, and testing account registrations on platforms like Google, Twitter/X, Instagram, and Spotify, security researchers can identify target online personas associated with an email address.
          </p>
        </div>

      </div>
    </div>
  );
}
