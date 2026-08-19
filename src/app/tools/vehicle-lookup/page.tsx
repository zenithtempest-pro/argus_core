'use client';

import React, { useState } from 'react';
import { Car, Search, Loader2, Info, CheckCircle2, Cpu, Wrench, Shield, Globe, Calendar } from 'lucide-react';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

export default function VehicleLookupPage() {
  const { showToast } = useToast();
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const handleVinLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanVin = vin.trim().toUpperCase();
    if (!cleanVin) {
      showToast('Input Required', 'Please enter a 17-character Vehicle Identification Number (VIN)', 'error');
      return;
    }
    if (cleanVin.length !== 17) {
      showToast('Invalid VIN Length', 'A standard VIN must be exactly 17 characters', 'error');
      return;
    }

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

      const data = await res.json();
      setResultData(data);
      showToast('VIN Decoded', `Parsed vehicle specs for ${data.vin}`, 'success');
    } catch (err: any) {
      showToast('Lookup Error', err.message || 'Failed to decode VIN', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Module Header Card */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shrink-0 shadow-card">
              <Car className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white">Vehicle & VIN Intelligence Decoder</h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Decode 17-character Vehicle Identification Numbers (VIN) into manufacturer make, model year, engine displacement, assembly plant, and country of origin
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            ISO 3779 / NHTSA Standard
          </Badge>
        </div>

        {/* Input Form */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated space-y-4">
          <form onSubmit={handleVinLookup} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-argus-400" />
              <input
                type="text"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="Enter 17-Character VIN (e.g. 1FA6P8CF0R5100001)..."
                maxLength={17}
                className="w-full pl-10 pr-4 py-3 text-xs font-mono font-medium tracking-wider uppercase bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-brand/30 focus:outline-none placeholder:text-argus-400 placeholder:normal-case placeholder:tracking-normal"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{loading ? 'Decoding VIN...' : 'Decode VIN'}</span>
            </button>
          </form>

          <div className="flex items-center gap-2 text-xs text-argus-500 dark:text-slate-400 flex-wrap">
            <span className="font-semibold text-argus-700 dark:text-slate-300">Sample VIN Presets:</span>
            <button
              type="button"
              onClick={() => { setVin('1FA6P8CF0R5100001'); handleVinLookup(); }}
              className="hover:text-brand underline font-mono text-[11px]"
            >
              1FA6P8CF0R5100001 (Ford Mustang)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setVin('5YJ3E1EA8KF830002'); handleVinLookup(); }}
              className="hover:text-brand underline font-mono text-[11px]"
            >
              5YJ3E1EA8KF830002 (Tesla Model 3)
            </button>
          </div>
        </div>

        {/* Results Panel */}
        {resultData && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-argus-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-brand" /> Decoded Vehicle Specs for VIN: <span className="font-mono text-brand dark:text-blue-400">{resultData.vin}</span>
                </h3>
                <Badge variant={resultData.validChecksum ? 'success' : 'warning'}>
                  {resultData.validChecksum ? 'Valid VIN Checksum' : 'Checksum Unverified'}
                </Badge>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">Vehicle Make & Model</span>
                  <strong className="text-argus-900 dark:text-white text-sm">{resultData.make} {resultData.model}</strong>
                </div>

                <div className="p-3.5 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">Model Year</span>
                  <strong className="text-argus-900 dark:text-white text-sm font-mono">{resultData.year}</strong>
                </div>

                <div className="p-3.5 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">Engine Specs</span>
                  <strong className="text-argus-900 dark:text-white text-sm">{resultData.engineDisplacement}</strong>
                </div>

                <div className="p-3.5 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">Assembly Plant</span>
                  <strong className="text-argus-900 dark:text-white text-sm">{resultData.assemblyPlant}</strong>
                </div>

                <div className="p-3.5 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">Country of Origin</span>
                  <strong className="text-argus-900 dark:text-white text-sm">{resultData.countryOfOrigin}</strong>
                </div>

                <div className="p-3.5 bg-argus-50 dark:bg-slate-900 rounded-xl border border-argus-200 dark:border-slate-800">
                  <span className="text-argus-500 dark:text-slate-400 block mb-1">Body / Vehicle Type</span>
                  <strong className="text-argus-900 dark:text-white text-sm">{resultData.vehicleType}</strong>
                </div>
              </div>
            </div>

            <JsonViewer data={resultData} title="Raw VIN Decoder Output (JSON)" />
          </div>
        )}

        {/* Documentation Card: ABOUT VEHICLE & VIN LOOKUP */}
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-subtle space-y-3 text-xs">
          <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-brand" /> ABOUT VEHICLE & VIN LOOKUP
          </h3>
          <p className="text-argus-600 dark:text-slate-300 leading-relaxed">
            The <strong>Vehicle Identification Number (VIN) Decoder</strong> validates 17-character unique serial identifiers established under ISO 3779 standards. The first three characters (World Manufacturer Identifier) indicate country of origin and brand, characters 4-8 describe vehicle attributes, character 9 provides a mathematical check digit, character 10 indicates model year, character 11 identifies the assembly plant, and characters 12-17 contain the unique production sequence.
          </p>
        </div>

      </div>
    </div>
  );
}
