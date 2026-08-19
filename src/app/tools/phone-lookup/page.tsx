'use client';

import React, { useState } from 'react';
import { Phone, Search, Loader2, Info, CheckCircle2, Globe, Clock, Radio, Smartphone, MapPin, AlertCircle, Copy, Check } from 'lucide-react';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

export default function PhoneLookupPage() {
  const { showToast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handlePhoneLookup = async (inputNum?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryNum = inputNum || phoneNumber;
    if (!queryNum.trim()) {
      showToast('Input Required', 'Please enter a target phone number', 'error');
      return;
    }

    setLoading(true);
    setResultData(null);

    try {
      const res = await fetch('/api/osint/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: queryNum.trim(),
          tool: 'phone-lookup',
        }),
      });

      const data = await res.json();
      setResultData(data);
      showToast('Telecom Recon Complete', `Parsed ${data.isIndia ? 'Indian DoT Circle' : 'Global'} data for ${data.formattedE164}`, 'success');
    } catch (err: any) {
      showToast('Lookup Error', err.message || 'Failed to trace phone number', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast('Copied to Clipboard', `${label}: ${text}`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="py-10 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Module Header Card */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shrink-0 shadow-card">
              <Phone className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white flex items-center gap-2">
                Indian (+91) & Global Telecom Recon
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700">
                  TRAI DoT 22 Circles Supported
                </span>
              </h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Auto-normalize Indian 10-digit/11-digit numbers (`9820123456` or `09820123456`), map DoT telecom circles (Mumbai, Delhi, Karnataka, TN, etc.), detect allocated carrier (Jio, Airtel, Vi, BSNL), and parse global E.164 formats
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            ITU E.164 & TRAI Standard
          </Badge>
        </div>

        {/* Input Form */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated space-y-4">
          <form onSubmit={(e) => handlePhoneLookup(undefined, e)} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-argus-400" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter 10-digit Indian number (e.g. 9820123456) or E.164 (+91..., +1..., +44...)..."
                className="w-full pl-10 pr-4 py-3 text-xs font-mono font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-brand/30 focus:outline-none placeholder:text-argus-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{loading ? 'Tracing Carrier...' : 'Lookup Number'}</span>
            </button>
          </form>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 text-xs text-argus-500 dark:text-slate-400 flex-wrap pt-1">
            <span className="font-semibold text-argus-700 dark:text-slate-300">Quick Presets:</span>
            <button
              type="button"
              onClick={() => { setPhoneNumber('9820123456'); handlePhoneLookup('9820123456'); }}
              className="px-2 py-1 bg-argus-100 dark:bg-slate-800 hover:bg-brand hover:text-white dark:hover:bg-brand rounded text-[11px] font-mono transition-colors"
            >
              🇮🇳 9820123456 (Mumbai Airtel)
            </button>
            <button
              type="button"
              onClick={() => { setPhoneNumber('9900012345'); handlePhoneLookup('9900012345'); }}
              className="px-2 py-1 bg-argus-100 dark:bg-slate-800 hover:bg-brand hover:text-white dark:hover:bg-brand rounded text-[11px] font-mono transition-colors"
            >
              🇮🇳 9900012345 (Karnataka Jio)
            </button>
            <button
              type="button"
              onClick={() => { setPhoneNumber('9444012345'); handlePhoneLookup('9444012345'); }}
              className="px-2 py-1 bg-argus-100 dark:bg-slate-800 hover:bg-brand hover:text-white dark:hover:bg-brand rounded text-[11px] font-mono transition-colors"
            >
              🇮🇳 9444012345 (TN BSNL)
            </button>
            <button
              type="button"
              onClick={() => { setPhoneNumber('+14155552671'); handlePhoneLookup('+14155552671'); }}
              className="px-2 py-1 bg-argus-100 dark:bg-slate-800 hover:bg-brand hover:text-white dark:hover:bg-brand rounded text-[11px] font-mono transition-colors"
            >
              🇺🇸 +1 415 555 2671 (US)
            </button>
          </div>
        </div>

        {/* Results Panel */}
        {resultData && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-argus-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-argus-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-brand" /> 
                    Telecom Intelligence for: <span className="font-mono text-brand dark:text-blue-400">{resultData.formattedE164}</span>
                  </h3>
                  <p className="text-xs text-argus-500 dark:text-slate-400 mt-0.5">
                    Original Allocated Operator & Circle Resolution
                  </p>
                </div>
                <Badge variant={resultData.validFormat ? 'success' : 'error'}>
                  {resultData.validFormat ? 'Valid Format' : 'Invalid Format'}
                </Badge>
              </div>

              {/* Formats Copy Bar */}
              <div className="p-4 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border border-argus-200 dark:border-slate-700">
                  <div>
                    <span className="text-[10px] font-bold text-argus-500 dark:text-slate-400 uppercase block">E.164 Standard</span>
                    <span className="font-mono font-bold text-argus-900 dark:text-white">{resultData.formattedE164}</span>
                  </div>
                  <button onClick={() => copyToClipboard(resultData.formattedE164, 'E.164 Format')} className="text-brand dark:text-blue-400 p-1">
                    {copiedField === 'E.164 Format' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border border-argus-200 dark:border-slate-700">
                  <div>
                    <span className="text-[10px] font-bold text-argus-500 dark:text-slate-400 uppercase block">National Format</span>
                    <span className="font-mono font-bold text-argus-900 dark:text-white">{resultData.formattedNational}</span>
                  </div>
                  <button onClick={() => copyToClipboard(resultData.formattedNational, 'National Format')} className="text-brand dark:text-blue-400 p-1">
                    {copiedField === 'National Format' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border border-argus-200 dark:border-slate-700">
                  <div>
                    <span className="text-[10px] font-bold text-argus-500 dark:text-slate-400 uppercase block">International Format</span>
                    <span className="font-mono font-bold text-argus-900 dark:text-white">{resultData.formattedInternational}</span>
                  </div>
                  <button onClick={() => copyToClipboard(resultData.formattedInternational, 'International Format')} className="text-brand dark:text-blue-400 p-1">
                    {copiedField === 'International Format' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                
                <div className="p-3.5 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-brand" /> Allocated Operator
                  </span>
                  <strong className="text-argus-900 dark:text-white text-sm">{resultData.operator}</strong>
                </div>

                <div className="p-3.5 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand" /> Telecom Circle / State
                  </span>
                  <strong className="text-argus-900 dark:text-white text-sm">{resultData.circle}</strong>
                </div>

                <div className="p-3.5 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-brand" /> Country / MCC
                  </span>
                  <strong className="text-argus-900 dark:text-white text-sm">{resultData.country} ({resultData.mcc})</strong>
                </div>

                <div className="p-3.5 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand" /> Timezones
                  </span>
                  <strong className="text-argus-900 dark:text-white text-sm font-mono">{resultData.timezones?.join(', ')}</strong>
                </div>

              </div>

              {/* MNP Notice Box */}
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Mobile Number Portability (MNP) Notice:</strong> {resultData.mnpNotice}</span>
              </div>

            </div>

            <JsonViewer data={resultData} title="Raw Phone Lookup JSON Output" />
          </div>
        )}

        {/* Documentation Card: ABOUT INDIAN & GLOBAL PHONE LOOKUP */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-subtle space-y-3 text-xs">
          <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-brand" /> ABOUT INDIAN & GLOBAL PHONE LOOKUP
          </h3>
          <p className="text-argus-600 dark:text-slate-300 leading-relaxed">
            The <strong>Indian & Global Phone Lookup Engine</strong> processes numbers in accordance with TRAI (Telecom Regulatory Authority of India) National Numbering Plans and ITU E.164 standards. In India (+91), 10-digit mobile numbers are allocated based on 4-digit prefix series distributed across 22 Department of Telecommunications (DoT) circles (e.g. Mumbai, Delhi-NCR, Karnataka, Tamil Nadu). The engine extracts initial carrier allocation (Reliance Jio, Bharti Airtel, Vodafone Idea - Vi, BSNL), Mobile Country Code (MCC 404/405), Mobile Network Code (MNC), and maps Indian Standard Time (IST, UTC+5:30).
          </p>
        </div>

      </div>
    </div>
  );
}
