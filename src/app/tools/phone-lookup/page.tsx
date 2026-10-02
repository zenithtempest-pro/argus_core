'use client';

import React, { useState } from 'react';

export default function PhoneLookupPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch('/api/osint/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: phoneNumber, tool: 'phone-lookup' }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || 'Lookup failed.');
      } else {
        setData(json);
      }
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Title Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📱</span> Indian (+91) & Global Telecom Recon
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time DoT circle resolution, operator attribution & cellular telemetry
          </p>
        </div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Live Service Ready
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter 10-digit mobile number (e.g. 9876543210)..."
          className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-sm transition disabled:opacity-50"
        >
          {loading ? 'Tracing...' : 'Run Recon Engine'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Results Dashboard */}
      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subscriber Identity Card */}
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Subscriber Identity
                </span>
                {data.isTruecallerVerified && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md flex items-center gap-1">
                    ✓ Truecaller Verified
                  </span>
                )}
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <div className="text-xs text-slate-500">Registered Caller Name</div>
                  <div className="text-lg font-bold text-white capitalize flex items-center gap-2">
                    {data.ownerName}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">Phone Number</div>
                  <div className="text-sm font-semibold text-slate-200 font-mono">
                    {data.formattedNumber}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <div className="text-xs text-slate-500">Line Type</div>
                    <div className="text-xs font-medium text-slate-300">{data.connection}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Language</div>
                    <div className="text-xs font-medium text-slate-300">{data.language}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carrier & Location */}
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Carrier & Circle</div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-slate-500">SIM / Carrier</div>
                  <div className="text-sm font-bold text-white">{data.simCard}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Mobile State / Circle</div>
                  <div className="text-sm font-semibold text-slate-200">{data.mobileState}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Hometown</div>
                  <div className="text-sm text-slate-300">{data.hometown}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Reference City</div>
                  <div className="text-sm text-slate-300">{data.referenceCity}</div>
                </div>
              </div>
            </div>

            {/* Hardware & Network */}
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Network Telemetry</div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-slate-500">Masked IMEI</div>
                  <code className="text-xs font-mono text-slate-300">{data.imei}</code>
                </div>
                <div>
                  <div className="text-xs text-slate-500">IP Address</div>
                  <code className="text-xs font-mono text-slate-300">{data.ipAddress}</code>
                </div>
                <div>
                  <div className="text-xs text-slate-500">MAC Address</div>
                  <code className="text-xs font-mono text-slate-300">{data.macAddress}</code>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Tracker ID</div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800">
                    {data.trackerId}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Towers & Zones (Only rendered if returned by upstream) */}
          {(data.towerLocations?.length > 0 || data.mobileLocations?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.towerLocations?.length > 0 && (
                <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
                    🗼 Registered Tower Locations
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.towerLocations.map((tower: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-slate-800 text-slate-200 text-xs rounded-lg border border-slate-700">
                        {tower.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.mobileLocations?.length > 0 && (
                <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                    📍 Mobile Geo Locations
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.mobileLocations.map((loc: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-slate-800 text-slate-200 text-xs rounded-lg border border-slate-700">
                        {loc.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Complaints Bar */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm">
            <div className="text-slate-300">
              Complaints: <strong className="text-white">{data.complaints}</strong>
            </div>
            <button
              type="button"
              onClick={() => alert('Redirecting to cyber crime reporting portal...')}
              className="px-3 py-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold rounded-lg border border-rose-500/30"
            >
              Report Complaint
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
