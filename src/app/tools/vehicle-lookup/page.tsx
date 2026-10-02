'use client';

import React, { useState } from 'react';
import { Car, Search, Loader2, Info, CheckCircle2, Cpu, Wrench, Shield, Globe, Calendar, Database } from 'lucide-react';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

export default function VehicleLookupPage() {
  const { showToast } = useToast();
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const handleVinLookup = async (targetVin?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanVin = (targetVin || vin).trim().toUpperCase();
    if (!cleanVin) {
      showToast('Input Required', 'Please enter a 17-character Vehicle Identification Number (VIN)', 'error');
      return;
    }
    if (cleanVin.length !== 17) {
      showToast('Invalid VIN Length', 'A standard VIN must be exactly 17 characters', 'error');
      return;
    }

    setVin(cleanVin);
    setLoading(true);
    setResultData(null);

    try {
      const res = await fetch('/api/osint/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: cleanVin,
          tool: 'vehicle-lookup',
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to decode VIN`);
      }

      const data = await res.json();
      setResultData(data);
      showToast('VIN Decoded', `Parsed specs for ${data.make} (${data.countryOfOrigin})`, 'success');
    } catch (err: any) {
      showToast('Lookup Error', err.message || 'Failed to decode VIN', 'error');
    } finally {
      setLoading(false);
    }
  };

  const samplePresets = [
    { label: '🇮🇳 Maruti Suzuki (MA3)', vin: 'MA3FCEB1S00100001' },
    { label: '🇮🇳 Tata Motors (MBH)', vin: 'MBHAAAAAA10000001' },
    { label: '🇮🇳 Mahindra (MDH)', vin: 'MDHAAAAAA10000001' },
    { label: '🇺🇸 Ford Mustang (1FA)', vin: '1FA6P8CF0R5100001' },
    { label: '🇺🇸 Tesla Model 3 (5YJ)', vin: '5YJ3E1EA8KF830002' },
    { label: '🇩🇪 Volkswagen (WVW)', vin: 'WVWZZZ3CZWE000001' },
    { label: '🇩🇪 BMW AG (WBA)', vin: 'WBA3A5C50DF000001' },
  ];

  return (
    <div className="py-10 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Module Header Card */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-card">
              <Car className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white">Vehicle & VIN Intelligence Decoder</h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Decode 17-character VINs for Indian (MA3, MBH, MDH, MAL, ME4) and International (US, European, Asian) manufacturers
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            ISO 3779 / NHTSA Engine
          </Badge>
        </div>

        {/* Input Form & Preset Chips */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated space-y-4">
          <form onSubmit={(e) => handleVinLookup(undefined, e)} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-argus-400 dark:text-slate-500" />
              <input
                type="text"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="Enter 17-Character VIN (e.g. MA3FCEB1S00100001 or 1FA6P8CF0R5100001)..."
                maxLength={17}
                className="w-full pl-10 pr-4 py-3 text-xs font-mono font-medium tracking-wider uppercase bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-argus-400 placeholder:normal-case placeholder:tracking-normal"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{loading ? 'Decoding VIN...' : 'Decode VIN'}</span>
            </button>
          </form>

          {/* Preset Chips */}
          <div className="space-y-2 pt-2 border-t border-argus-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-argus-700 dark:text-slate-300 block">Sample Regional VIN Presets:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {samplePresets.map((preset) => (
                <button
                  key={preset.vin}
                  type="button"
                  onClick={() => handleVinLookup(preset.vin)}
                  className="px-2.5 py-1 text-[11px] font-mono bg-argus-100 dark:bg-slate-900 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 border border-argus-200 dark:border-slate-800 text-argus-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-[#131b2e] p-12 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
            <p className="text-xs font-medium text-argus-600 dark:text-slate-400">
              Querying ISO 3779 WMI database and NHTSA VPIC engine...
            </p>
          </div>
        )}

        {/* Results Panel */}
        {resultData && !loading && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-argus-200 dark:border-slate-800 pb-4 gap-2">
                <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-500" /> Decoded Vehicle Specs: <span className="font-mono text-blue-600 dark:text-blue-400">{resultData.vin}</span>
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="info" size="md">
                    WMI: {resultData.wmi}
                  </Badge>
                  <Badge variant={resultData.validChecksum ? 'success' : 'warning'} size="md">
                    {resultData.validChecksum ? '17-Char Verified' : 'Checksum Warning'}
                  </Badge>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                
                <div className="p-3.5 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">Manufacturer & Make</span>
                  <strong className="text-argus-900 dark:text-white text-sm font-sans">{resultData.make}</strong>
                </div>

                <div className="p-3.5 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">Model / Variant</span>
                  <strong className="text-argus-900 dark:text-white text-sm font-sans">{resultData.model}</strong>
                </div>

                <div className="p-3.5 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">Model Year (10th Char)</span>
                  <strong className="text-argus-900 dark:text-white text-sm font-mono">{resultData.year}</strong>
                </div>

                <div className="p-3.5 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">Country of Origin</span>
                  <strong className="text-argus-900 dark:text-white text-sm">{resultData.countryOfOrigin}</strong>
                </div>

                <div className="p-3.5 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">Assembly Plant</span>
                  <strong className="text-argus-900 dark:text-white text-sm">{resultData.assemblyPlant}</strong>
                </div>

                <div className="p-3.5 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">Powertrain / Engine</span>
                  <strong className="text-argus-900 dark:text-white text-sm">{resultData.engineDisplacement}</strong>
                </div>

              </div>

              <div className="flex items-center gap-2 pt-2 text-[11px] text-argus-500 dark:text-slate-400">
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <span>Intelligence Provider: <strong className="text-argus-700 dark:text-slate-300 font-sans">{resultData.dataSource}</strong></span>
              </div>
            </div>

            <JsonViewer data={resultData} title="Raw VIN Intelligence Output (JSON)" />
          </div>
        )}

        {/* Info Box */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-subtle space-y-3 text-xs">
          <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" /> ABOUT VEHICLE & VIN LOOKUP
          </h3>
          <p className="text-argus-600 dark:text-slate-300 leading-relaxed">
            The <strong>Vehicle Identification Number (VIN) Intelligence Decoder</strong> processes 17-character unique vehicle serial numbers compliant with ISO 3779 and DoT standards. The first three characters (World Manufacturer Identifier) map manufacturer and country of origin (including Indian OEMs like Maruti Suzuki <code>MA3</code>, Tata <code>MBH/MAT</code>, Mahindra <code>MDH/MA1</code>, Hyundai <code>MAL</code>, Royal Enfield <code>ME4</code>). The 10th character decodes cyclic model production years.
          </p>
        </div>

      </div>
    </div>
  );
}
