'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Search, 
  Loader2, 
  MapPin, 
  AlertCircle, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2, 
  Copy, 
  Check, 
  Hash, 
  Binary, 
  Camera, 
  Layers, 
  Compass, 
  Calendar, 
  Cpu, 
  ShieldCheck 
} from 'lucide-react';
import ExifReader from 'exifreader';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { AuthBlurGate } from '@/components/auth/AuthBlurGate';

interface UniversalForensics {
  fileName: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  mimeType: string;
  lastModifiedUtc: string;
  lastModifiedLocal: string;
  width: number | null;
  height: number | null;
  megapixels: string | null;
  aspectRatio: string | null;
  previewUrl: string | null;
  magicBytesHex: string;
  fileSignature: string;
  sha256Hash: string;
}

interface DeepExif {
  hasCameraExif: boolean;
  make?: string;
  model?: string;
  lens?: string;
  dateTimeOriginal?: string;
  software?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: string;
  gpsLat?: number;
  gpsLon?: number;
  gpsFormatted?: string;
  osmUrl?: string;
  rawTagsCount: number;
}

function detectSignature(bytes: Uint8Array): string {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'JPEG / JFIF / EXIF Format (FF D8 FF)';
  }
  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'PNG Lossless Image Format (89 50 4E 47)';
  }
  if (bytes.length >= 4 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return 'GIF Graphics Interchange Format (GIF8)';
  }
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'PDF Portable Document Format (%PDF)';
  }
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return 'ZIP / Office OpenXML Container (PK..)';
  }
  if (bytes.length >= 4 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return 'RIFF Multimedia Container (WebP / WAV / AVI)';
  }
  if (bytes.length >= 4 && ((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[0x00]) || (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a))) {
    return 'TIFF Tagged Image File Format';
  }
  return 'Raw Binary Stream (Generic Signature)';
}

function calculateAspectRatio(w: number, h: number): string {
  if (!w || !h) return 'N/A';
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(w, h);
  const rw = w / divisor;
  const rh = h / divisor;
  if (rw <= 32 && rh <= 32) {
    return `${rw}:${rh}`;
  }
  return `${(w / h).toFixed(2)}:1`;
}

export default function MediaDocsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'exif' | 'dorking'>('exif');

  // Forensics State
  const [parsing, setParsing] = useState(false);
  const [layer1, setLayer1] = useState<UniversalForensics | null>(null);
  const [layer2, setLayer2] = useState<DeepExif | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Document Dorking State
  const [dorkDomain, setDorkDomain] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setLayer1(null);
    setLayer2(null);
    setCopiedHash(false);

    try {
      const fileBuffer = await file.arrayBuffer();

      // --- LAYER 1: UNIVERSAL FILE & IMAGE FORENSICS (ALWAYS EXTRACTED) ---
      // 1. Dimensions via HTMLImageElement
      let width: number | null = null;
      let height: number | null = null;
      let previewUrl: string | null = null;

      if (file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|tiff?)$/i.test(file.name)) {
        previewUrl = URL.createObjectURL(file);
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            width = img.naturalWidth;
            height = img.naturalHeight;
            resolve();
          };
          img.onerror = () => {
            resolve();
          };
          img.src = previewUrl!;
        });
      }

      // 2. Megapixels & Aspect Ratio
      let megapixels: string | null = null;
      let aspectRatio: string | null = null;
      if (width && height) {
        megapixels = `${((width * height) / 1_000_000).toFixed(2)} MP`;
        aspectRatio = calculateAspectRatio(width, height);
      }

      // 3. Binary Magic Bytes (first 8 bytes)
      const uint8 = new Uint8Array(fileBuffer);
      const first8 = uint8.slice(0, 8);
      const magicBytesHex = Array.from(first8)
        .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
        .join(' ');
      const fileSignature = detectSignature(first8);

      // 4. SHA-256 Checksum via Web Crypto
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
      const sha256Hash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // 5. Timestamps
      const modDate = new Date(file.lastModified);
      const lastModifiedUtc = modDate.toUTCString();
      const lastModifiedLocal = modDate.toLocaleString();

      const byteSize = file.size;
      const formattedSize = byteSize > 1048576 
        ? `${(byteSize / 1048576).toFixed(2)} MB (${byteSize.toLocaleString()} bytes)`
        : `${(byteSize / 1024).toFixed(1)} KB (${byteSize.toLocaleString()} bytes)`;

      const l1Result: UniversalForensics = {
        fileName: file.name,
        fileSizeBytes: byteSize,
        fileSizeFormatted: formattedSize,
        mimeType: file.type || 'application/octet-stream',
        lastModifiedUtc,
        lastModifiedLocal,
        width,
        height,
        megapixels,
        aspectRatio,
        previewUrl,
        magicBytesHex,
        fileSignature,
        sha256Hash,
      };

      setLayer1(l1Result);

      // --- LAYER 2: DEEP EXIF / TIFF / GPS TAGS ---
      let deepResult: DeepExif = {
        hasCameraExif: false,
        rawTagsCount: 0,
      };

      try {
        const tags = ExifReader.load(fileBuffer, { expanded: true });
        const exifTags = tags.exif || {};
        const gpsTags = tags.gps || {};
        const fileTags = (tags.file as any) || {};

        const make = exifTags.Make?.description || fileTags.Make?.description;
        const model = exifTags.Model?.description || fileTags.Model?.description;
        const lensRaw = (tags as any)?.Lens?.description || (tags as any)?.LensModel?.description || (exifTags as any)?.LensModel?.description || (exifTags as any)?.Lens?.description || ((tags as any).Lens || (tags as any).LensModel || "Not Available");
        const lens = typeof lensRaw === 'string' && lensRaw !== 'Not Available'
          ? lensRaw
          : (typeof lensRaw === 'object' && lensRaw?.description ? lensRaw.description : undefined);
        const dateTimeOriginal = exifTags.DateTimeOriginal?.description || fileTags.DateTimeOriginal?.description;
        const software = exifTags.Software?.description || fileTags.Software?.description;
        const exposureTime = exifTags.ExposureTime?.description || fileTags.ExposureTime?.description;
        const fNumber = exifTags.FNumber?.description || fileTags.FNumber?.description;
        const iso = exifTags.ISOSpeedRatings?.description || fileTags.ISOSpeedRatings?.description;

        let gpsLat: number | undefined = undefined;
        let gpsLon: number | undefined = undefined;

        if (gpsTags.Latitude && gpsTags.Longitude) {
          gpsLat = typeof gpsTags.Latitude === 'number' ? gpsTags.Latitude : parseFloat(String(gpsTags.Latitude));
          gpsLon = typeof gpsTags.Longitude === 'number' ? gpsTags.Longitude : parseFloat(String(gpsTags.Longitude));
        }

        const hasCamera = Boolean(make || model || lens || dateTimeOriginal || exposureTime || (gpsLat !== undefined && !isNaN(gpsLat)));

        let osmUrl: string | undefined = undefined;
        let gpsFormatted: string | undefined = undefined;

        if (gpsLat !== undefined && gpsLon !== undefined && !isNaN(gpsLat) && !isNaN(gpsLon)) {
          gpsFormatted = `${gpsLat.toFixed(5)}°, ${gpsLon.toFixed(5)}°`;
          osmUrl = `https://www.openstreetmap.org/?mlat=${gpsLat}&mlon=${gpsLon}#map=15/${gpsLat}/${gpsLon}`;
        }

        deepResult = {
          hasCameraExif: hasCamera,
          make,
          model,
          lens,
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
      } catch (exifErr) {
        // Tag parsing issue; layer 2 remains hasCameraExif: false
        deepResult = {
          hasCameraExif: false,
          rawTagsCount: 0,
        };
      }

      setLayer2(deepResult);

      if (deepResult.hasCameraExif) {
        showToast('Forensics Complete', `Extracted Camera EXIF & Telemetry for ${file.name}`, 'success');
      } else {
        showToast('Forensics Extracted', `Universal image telemetry & SHA-256 computed for ${file.name}`, 'info');
      }
    } catch (err: any) {
      showToast('Forensic Error', err.message || 'Failed to inspect file', 'error');
    } finally {
      setParsing(false);
    }
  };

  const handleCopyHash = () => {
    if (!layer1?.sha256Hash) return;
    navigator.clipboard.writeText(layer1.sha256Hash);
    setCopiedHash(true);
    showToast('Checksum Copied', 'SHA-256 hash copied to clipboard', 'success');
    setTimeout(() => setCopiedHash(false), 2000);
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
              <h1 className="text-2xl font-extrabold text-argus-900 dark:text-white">
                EXIF Forensics & Document Dorking Hub
              </h1>
              <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                Client-side cryptographic hash generation, binary magic bytes detection, camera EXIF analysis, and Google OSINT dorking
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            OSINT Forensics Engine
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
            <span>Client-Side File & EXIF Forensics</span>
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

        {/* TAB 1: EXIF & File Forensics */}
        {activeTab === 'exif' && (
          <div className="space-y-6">
            
            {/* Upload Zone */}
            <div className="bg-white dark:bg-[#131b2e] p-8 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-elevated text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-argus-900 dark:text-white">Upload File for Forensic Inspection</h3>
                  <p className="text-xs text-argus-600 dark:text-slate-400 mt-1">
                    Upload JPEG, PNG, WebP, TIFF, or document files. Analyzed 100% locally in your browser with zero server uploads.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl cursor-pointer transition-all shadow-card">
                  {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                  <span>{parsing ? 'Extracting Forensics...' : 'Select Local File'}</span>
                  <input type="file" onChange={handleFileUpload} accept="*/*" className="hidden" disabled={parsing} />
                </label>
              </div>
            </div>

            {/* Parsing State */}
            {parsing && (
              <div className="bg-white dark:bg-[#131b2e] p-8 rounded-2xl border border-argus-200 dark:border-slate-800 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                <p className="text-xs font-semibold text-argus-700 dark:text-slate-300">
                  Computing SHA-256 digest, inspecting magic bytes, and parsing metadata headers...
                </p>
              </div>
            )}

            {/* Forensics Output Display */}
            {layer1 && !parsing && (
              <div className="space-y-6 animate-in fade-in">
                
                {/* ======================================================== */}
                {/* LAYER 1 TEASER: UNIVERSAL FILE & IMAGE FORENSICS (CLEAR) */}
                {/* ======================================================== */}
                <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-6">
                  
                  {/* File Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-argus-200 dark:border-slate-800 pb-4 gap-2">
                    <div className="flex items-center gap-3">
                      {layer1.previewUrl && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-argus-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
                          <img 
                            src={layer1.previewUrl} 
                            alt={layer1.fileName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="font-mono text-blue-600 dark:text-blue-400">{layer1.fileName}</span>
                        </h3>
                        <p className="text-xs text-argus-500 dark:text-slate-400 mt-0.5">
                          {layer1.fileSizeFormatted} • {layer1.mimeType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="info">Layer 1 Forensics Verified</Badge>
                      <Badge variant={layer2?.hasCameraExif ? 'success' : 'warning'}>
                        {layer2?.hasCameraExif ? 'Camera EXIF Present' : 'Standard Web File'}
                      </Badge>
                    </div>
                  </div>

                  {/* Universal File & Dimension Cards (Always Visible) */}
                  <div>
                    <h4 className="text-xs font-bold text-argus-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      Universal File & Image Geometry (Teaser Preview)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      
                      <div className="p-3.5 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800">
                        <span className="text-argus-500 dark:text-slate-400 block mb-1">Image Dimensions</span>
                        <strong className="text-argus-900 dark:text-white text-sm font-mono">
                          {layer1.width && layer1.height ? `${layer1.width} × ${layer1.height} px` : 'Non-image file'}
                        </strong>
                      </div>

                      <div className="p-3.5 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800">
                        <span className="text-argus-500 dark:text-slate-400 block mb-1">Megapixels & Aspect Ratio</span>
                        <strong className="text-argus-900 dark:text-white text-sm font-mono">
                          {layer1.megapixels ? `${layer1.megapixels} • ${layer1.aspectRatio}` : 'N/A'}
                        </strong>
                      </div>

                      <div className="p-3.5 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800">
                        <span className="text-argus-500 dark:text-slate-400 block mb-1">MIME Content Type</span>
                        <strong className="text-argus-900 dark:text-white text-sm font-mono truncate block" title={layer1.mimeType}>
                          {layer1.mimeType}
                        </strong>
                      </div>

                      <div className="p-3.5 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800">
                        <span className="text-argus-500 dark:text-slate-400 block mb-1">Last Modified (Local)</span>
                        <strong className="text-argus-900 dark:text-white text-xs font-mono block truncate" title={layer1.lastModifiedLocal}>
                          {layer1.lastModifiedLocal}
                        </strong>
                      </div>

                    </div>
                  </div>

                </div>

                {/* ======================================================== */}
                {/* GATED SECTION: CRYPTOGRAPHIC HASH, MAGIC BYTES & EXIF     */}
                {/* ======================================================== */}
                <AuthBlurGate redirectPath="/tools/media-docs">
                  <div className="space-y-6">
                    
                    {/* Cryptographic & Binary Forensics Cards */}
                    <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-4">
                      <h4 className="text-xs font-bold text-argus-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Cryptographic Digest & Binary Header Inspection
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        
                        {/* SHA-256 Card */}
                        <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-argus-600 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                              <Hash className="w-4 h-4 text-blue-500" />
                              SHA-256 Cryptographic Checksum
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyHash}
                              className="px-2 py-1 text-[11px] font-bold rounded-lg bg-argus-200 dark:bg-slate-800 hover:bg-blue-500 hover:text-white text-argus-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                            >
                              {copiedHash ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <div className="p-2.5 bg-white dark:bg-black/40 rounded-lg border border-argus-200 dark:border-slate-800 font-mono text-[11px] text-argus-900 dark:text-blue-300 break-all select-all">
                            {layer1.sha256Hash}
                          </div>
                          <p className="text-[10px] text-argus-500 dark:text-slate-500">
                            Computed in-browser via Web Cryptography API (crypto.subtle.digest)
                          </p>
                        </div>

                        {/* Magic Bytes Card */}
                        <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800 space-y-2">
                          <span className="text-argus-600 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                            <Binary className="w-4 h-4 text-amber-500" />
                            File Signature & Header Magic Bytes (First 8 Bytes)
                          </span>
                          <div className="p-2.5 bg-white dark:bg-black/40 rounded-lg border border-argus-200 dark:border-slate-800 font-mono text-xs font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                            {layer1.magicBytesHex}
                          </div>
                          <div className="text-[11px] font-medium text-argus-700 dark:text-slate-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>Signature: <strong>{layer1.fileSignature}</strong></span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Layer 2: Deep EXIF / TIFF / GPS Tags */}
                    <div className="bg-white dark:bg-[#131b2e] p-6 rounded-2xl border border-argus-200 dark:border-slate-800 shadow-card space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-argus-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-blue-500" />
                          Layer 2 — Deep Camera EXIF, Optics & Geospatial GPS
                        </h4>
                        <Badge variant={layer2?.hasCameraExif ? 'success' : 'neutral'}>
                          {layer2?.hasCameraExif ? 'EXIF Metadata Verified' : 'Stripped / Web Compressed'}
                        </Badge>
                      </div>

                      {/* If camera tags stripped (e.g. WhatsApp, Signal, Web PNG) */}
                      {!layer2?.hasCameraExif ? (
                        <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                          <div className="text-xs space-y-1.5">
                            <p className="font-extrabold text-sm">
                              Social Media / Messaging Compression Detected: Camera & GPS headers were stripped by sender platform, displaying file binary & cryptographic forensics above.
                            </p>
                            <p className="text-argus-600 dark:text-slate-400">
                              Messaging applications (such as WhatsApp, Telegram, Discord, or Instagram) strip EXIF metadata before transmission to protect sender geolocation. All physical binary properties, image geometry ({layer1.width}×{layer1.height} px), magic bytes, and cryptographic SHA-256 digests remain fully preserved above.
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Deep EXIF Grid Details */
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                          
                          <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800">
                            <span className="text-argus-500 dark:text-slate-400 block mb-1">Camera Manufacturer</span>
                            <strong className="text-argus-900 dark:text-white text-sm">{layer2.make || 'Omitted / Unknown'}</strong>
                          </div>

                          <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800">
                            <span className="text-argus-500 dark:text-slate-400 block mb-1">Camera Model</span>
                            <strong className="text-argus-900 dark:text-white text-sm">{layer2.model || 'Omitted / Unknown'}</strong>
                          </div>

                          <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800">
                            <span className="text-argus-500 dark:text-slate-400 block mb-1">Lens Model</span>
                            <strong className="text-argus-900 dark:text-white text-sm">{layer2.lens || 'N/A'}</strong>
                          </div>

                          <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800">
                            <span className="text-argus-500 dark:text-slate-400 block mb-1">Original Capture Timestamp</span>
                            <strong className="text-argus-900 dark:text-white text-sm font-mono">{layer2.dateTimeOriginal || 'N/A'}</strong>
                          </div>

                          <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800">
                            <span className="text-argus-500 dark:text-slate-400 block mb-1">Exposure & Optics</span>
                            <strong className="text-argus-900 dark:text-white text-sm font-mono">
                              {layer2.exposureTime ? `${layer2.exposureTime}s` : ''} {layer2.fNumber ? `• ${layer2.fNumber}` : ''} {layer2.iso ? `• ISO ${layer2.iso}` : 'N/A'}
                            </strong>
                          </div>

                          <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800">
                            <span className="text-argus-500 dark:text-slate-400 block mb-1">Software / Firmware</span>
                            <strong className="text-argus-900 dark:text-white text-sm font-mono">{layer2.software || 'N/A'}</strong>
                          </div>

                          {/* GPS Details & OpenStreetMap Link */}
                          <div className="p-4 rounded-xl bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-800 sm:col-span-2 md:col-span-3">
                            <span className="text-argus-500 dark:text-slate-400 block mb-1">Geospatial GPS Coordinates</span>
                            {layer2.gpsFormatted && layer2.osmUrl ? (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                                <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                                  {layer2.gpsFormatted}
                                </strong>
                                <a
                                  href={layer2.osmUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-card w-fit"
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>View on OpenStreetMap ↗</span>
                                </a>
                              </div>
                            ) : (
                              <strong className="text-argus-500 dark:text-slate-500 text-xs font-mono">
                                GPS Tag Not Embedded in File Header
                              </strong>
                            )}
                          </div>

                        </div>
                      )}

                    </div>

                  </div>
                </AuthBlurGate>

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
