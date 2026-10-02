'use client';

import React, { useState } from 'react';
import { FileText, Image as ImageIcon, Search, Loader2, MapPin, AlertCircle, ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react';
import ExifReader from 'exifreader';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

interface ParsedExif {
  hasExif: boolean;
  fileName: string;
  fileSize: string;
  fileType: string;
  make?: string;
  model?: string;
  dateTimeOriginal?: string;
  software?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: string;
  gpsLat?: number;
  gpsLon?: number;
  gpsFormatted?: string;
  osmUrl?: string;
  rawTagsCount?: number;
}

export default function MediaDocsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'exif' | 'dorking'>('exif');

  // EXIF Inspector State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [exifResult, setExifResult] = useState<ParsedExif | null>(null);

  // Document Dorking State
  const [dorkDomain, setDorkDomain] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParsing(true);
    setExifResult(null);

    try {
      const fileBuffer = await file.arrayBuffer();
      const tags = ExifReader.load(fileBuffer, { expanded: true });

      const exifTags = tags.exif || {};
      const gpsTags = tags.gps || {};

      const make = exifTags.Make?.description || (tags.file as any)?.Make?.description;
      const model = exifTags.Model?.description || (tags.file as any)?.Model?.description;
      const dateTimeOriginal = exifTags.DateTimeOriginal?.description || (tags.file as any)?.DateTimeOriginal?.description;
      const software = exifTags.Software?.description || (tags.file as any)?.Software?.description;
      const exposureTime = exifTags.ExposureTime?.description || (tags.file as any)?.ExposureTime?.description;
      const fNumber = exifTags.FNumber?.description || (tags.file as any)?.FNumber?.description;
      const iso = exifTags.ISOSpeedRatings?.description || (tags.file as any)?.ISOSpeedRatings?.description;

      let gpsLat: number | undefined = undefined;
      let gpsLon: number | undefined = undefined;

      if (gpsTags.Latitude && gpsTags.Longitude) {
        gpsLat = typeof gpsTags.Latitude === 'number' ? gpsTags.Latitude : parseFloat(String(gpsTags.Latitude));
        gpsLon = typeof gpsTags.Longitude === 'number' ? gpsTags.Longitude : parseFloat(String(gpsTags.Longitude));
      }

      const hasMetadata = Boolean(make || model || dateTimeOriginal || software || gpsLat !== undefined);

      let osmUrl: string | undefined = undefined;
      let gpsFormatted: string | undefined = undefined;

      if (gpsLat !== undefined && gpsLon !== undefined && !isNaN(gpsLat) && !isNaN(gpsLon)) {
        gpsFormatted = `${gpsLat.toFixed(5)}°, ${gpsLon.toFixed(5)}°`;
        osmUrl = `https://www.openstreetmap.org/?mlat=${gpsLat}&mlon=${gpsLon}#map=15/${gpsLat}/${gpsLon}`;
      }

      const result: ParsedExif = {
        hasExif: hasMetadata,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        fileType: file.type || 'Unknown Format',
        make,
        model,
        dateTimeOriginal,
        software,
        exposureTime,
        fNumber,
        iso,
        gpsLat,
        gpsLon,
        gpsFormatted,
        osmUrl,
        rawTagsCount: Object.keys(tags).length,
      };

      setExifResult(result);
      if (hasMetadata) {
        showToast('EXIF Extracted', `Successfully parsed metadata for ${file.name}`, 'success');
      } else {
        showToast('No EXIF Data', 'No camera metadata or GPS coordinates found in file', 'info');
      }
    } catch (err: any) {
      setExifResult({
        hasExif: false,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        fileType: file.type || 'Unknown Format',
      });
      showToast('Metadata Reading Warning', 'File contains no readable EXIF header tags', 'info');
    } finally {
      setParsing(false);
    }
  };

  const handleRunDork = (dorkTemplate: string) => {
    const cleanTarget = dorkDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '') || 'example.com';
    const query = dorkTemplate.replace('{target}', cleanTarget);
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="py-10 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-card">
              <FileText className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white">EXIF Forensics & Document Dorking Hub</h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Client-side EXIF/GPS metadata inspection and targeted Google Dork queries for indexed documents
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            OSINT Forensics
          </Badge>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex items-center gap-3 border-b border-argus-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('exif')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'exif'
                ? 'bg-blue-600 text-white shadow-card'
                : 'bg-white dark:bg-[#131b2e] text-argus-700 dark:text-slate-300 border border-argus-200 dark:border-slate-800 hover:border-blue-500'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Client-Side EXIF Forensic Extractor</span>
          </button>

          <button
            onClick={() => setActiveTab('dorking')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'dorking'
                ? 'bg-blue-600 text-white shadow-card'
                : 'bg-white dark:bg-[#131b2e] text-argus-700 dark:text-slate-300 border border-argus-200 dark:border-slate-800 hover:border-blue-500'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Dedicated Document Dorking Hub</span>
          </button>
        </div>

        {/* TAB 1: EXIF Forensic Extractor */}
        {activeTab === 'exif' && (
          <div className="space-y-6">
            
            {/* Upload Zone */}
            <div className="bg-white dark:bg-[#131b2e] p-8 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-argus-900 dark:text-white">Upload File for Metadata Inspection</h3>
                  <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                    Upload JPEG, PNG, or TIFF files. Metadata is parsed 100% locally inside your browser.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl cursor-pointer transition-all shadow-card">
                  {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                  <span>{parsing ? 'Parsing EXIF Header...' : 'Select Local File'}</span>
                  <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" disabled={parsing} />
                </label>
              </div>
            </div>

            {/* Parsing State */}
            {parsing && (
              <div className="bg-white dark:bg-[#131b2e] p-8 rounded-2xl border border-argus-200 dark:border-slate-800 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                <p className="text-xs font-semibold text-argus-700 dark:text-slate-300">
                  Executing client-side ExifReader binary decoder...
                </p>
              </div>
            )}

            {/* EXIF Output Display */}
            {exifResult && !parsing && (
              <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-6">
                
                {/* Header Metadata Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-argus-200 dark:border-slate-800 pb-4 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" /> File: <span className="font-mono text-blue-600 dark:text-blue-400">{exifResult.fileName}</span>
                    </h3>
                    <p className="text-xs text-argus-500 dark:text-slate-400 mt-0.5">
                      Size: {exifResult.fileSize} • Type: {exifResult.fileType}
                    </p>
                  </div>
                  <Badge variant={exifResult.hasExif ? 'success' : 'warning'}>
                    {exifResult.hasExif ? 'EXIF Header Found' : 'No EXIF Data'}
                  </Badge>
                </div>

                {/* If No EXIF found */}
                {!exifResult.hasExif ? (
                  <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold">No EXIF metadata found in this file (Metadata was stripped or unsupported file format).</p>
                      <p className="text-argus-600 dark:text-slate-400">
                        Many messaging platforms (such as WhatsApp, Signal, or Telegram) and social web applications automatically strip camera and GPS headers prior to uploading to protect user privacy.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* EXIF Grid Details */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    
                    <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800">
                      <span className="text-argus-500 dark:text-slate-400 block mb-1">Camera Manufacturer</span>
                      <strong className="text-argus-900 dark:text-white text-sm">{exifResult.make || 'Omitted / Unknown'}</strong>
                    </div>

                    <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800">
                      <span className="text-argus-500 dark:text-slate-400 block mb-1">Camera Model</span>
                      <strong className="text-argus-900 dark:text-white text-sm">{exifResult.model || 'Omitted / Unknown'}</strong>
                    </div>

                    <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800">
                      <span className="text-argus-500 dark:text-slate-400 block mb-1">Timestamp Original</span>
                      <strong className="text-argus-900 dark:text-white text-sm font-mono">{exifResult.dateTimeOriginal || 'N/A'}</strong>
                    </div>

                    <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800">
                      <span className="text-argus-500 dark:text-slate-400 block mb-1">Software / Firmware</span>
                      <strong className="text-argus-900 dark:text-white text-sm font-mono">{exifResult.software || 'N/A'}</strong>
                    </div>

                    <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800">
                      <span className="text-argus-500 dark:text-slate-400 block mb-1">Exposure & Optics</span>
                      <strong className="text-argus-900 dark:text-white text-sm font-mono">
                        {exifResult.exposureTime ? `${exifResult.exposureTime}s` : ''} {exifResult.fNumber ? `• ${exifResult.fNumber}` : ''} {exifResult.iso ? `• ISO ${exifResult.iso}` : 'N/A'}
                      </strong>
                    </div>

                    {/* GPS Details & OpenStreetMap Link */}
                    <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800">
                      <span className="text-argus-500 dark:text-slate-400 block mb-1">Geospatial GPS Coordinates</span>
                      {exifResult.gpsFormatted && exifResult.osmUrl ? (
                        <div className="space-y-1.5">
                          <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-mono block">
                            {exifResult.gpsFormatted}
                          </strong>
                          <a
                            href={exifResult.osmUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            View on OpenStreetMap ↗
                          </a>
                        </div>
                      ) : (
                        <strong className="text-argus-500 dark:text-slate-500 text-xs font-mono">
                          GPS Tag Not Present
                        </strong>
                      )}
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* TAB 2: Dedicated Document Dorking Hub */}
        {activeTab === 'dorking' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated space-y-4">
              <label className="block text-xs font-bold text-argus-800 dark:text-slate-200">
                Target Domain for Search Engine Index Forensics
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={dorkDomain}
                  onChange={(e) => setDorkDomain(e.target.value)}
                  placeholder="Enter target domain (e.g. company.com)..."
                  className="w-full px-4 py-3 text-sm bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Dork Card 1: Confidential PDFs */}
              <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-argus-900 dark:text-white">Confidential PDF Documents</h3>
                  <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                    Searches for indexed PDF files containing "confidential" or "internal use only" notices.
                  </p>
                  <div className="mt-3 p-2.5 bg-argus-50 dark:bg-slate-900 rounded-lg border border-argus-200 dark:border-slate-800 font-mono text-[11px] text-argus-700 dark:text-slate-300 break-all">
                    site:{dorkDomain.trim() || 'target.com'} filetype:pdf "confidential" | "internal use only"
                  </div>
                </div>
                <button
                  onClick={() => handleRunDork('site:{target} filetype:pdf "confidential" | "internal use only"')}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-card"
                >
                  <span>Launch Google Dork</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dork Card 2: Spreadsheets with Passwords */}
              <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-argus-900 dark:text-white">Spreadsheets & Credentials</h3>
                  <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                    Searches for indexed XLSX and CSV files containing password or credential strings.
                  </p>
                  <div className="mt-3 p-2.5 bg-argus-50 dark:bg-slate-900 rounded-lg border border-argus-200 dark:border-slate-800 font-mono text-[11px] text-argus-700 dark:text-slate-300 break-all">
                    site:{dorkDomain.trim() || 'target.com'} filetype:xlsx | filetype:csv "password" | "credentials"
                  </div>
                </div>
                <button
                  onClick={() => handleRunDork('site:{target} filetype:xlsx | filetype:csv "password" | "credentials"')}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-card"
                >
                  <span>Launch Google Dork</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dork Card 3: Presentations & Memos */}
              <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-argus-900 dark:text-white">Presentations & Board Memos</h3>
                  <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                    Searches for indexed PPTX and DOCX files marked with board meeting or restricted tags.
                  </p>
                  <div className="mt-3 p-2.5 bg-argus-50 dark:bg-slate-900 rounded-lg border border-argus-200 dark:border-slate-800 font-mono text-[11px] text-argus-700 dark:text-slate-300 break-all">
                    site:{dorkDomain.trim() || 'target.com'} filetype:pptx | filetype:docx "board meeting" | "restricted"
                  </div>
                </div>
                <button
                  onClick={() => handleRunDork('site:{target} filetype:pptx | filetype:docx "board meeting" | "restricted"')}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-card"
                >
                  <span>Launch Google Dork</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
