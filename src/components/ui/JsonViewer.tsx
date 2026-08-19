'use client';

import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { useToast } from './Toast';

interface JsonViewerProps {
  data: any;
  title?: string;
  initialExpanded?: boolean;
}

export function JsonViewer({ data, title = 'Raw Output (JSON)', initialExpanded = true }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(initialExpanded);
  const { showToast } = useToast();

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    showToast('Copied to Clipboard', 'Raw JSON output copied successfully', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `argus_osint_result_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Download Started', 'JSON file exported to downloads folder', 'info');
  };

  return (
    <div className="rounded-xl border border-argus-200 bg-white overflow-hidden shadow-card">
      <div className="flex items-center justify-between px-4 py-3 bg-argus-50 border-b border-argus-200">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold text-argus-800 hover:text-brand transition-colors"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span>{title}</span>
          <span className="text-xs font-normal text-argus-500 bg-argus-200 px-2 py-0.5 rounded-full">
            {Object.keys(data || {}).length} keys
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-argus-700 bg-white border border-argus-200 rounded-lg hover:bg-argus-100 hover:text-brand transition-colors"
            title="Copy JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-argus-700 bg-white border border-argus-200 rounded-lg hover:bg-argus-100 hover:text-brand transition-colors"
            title="Download JSON"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-slate-900 text-slate-100 overflow-x-auto text-xs font-mono leading-relaxed max-h-96">
          <pre>{jsonString}</pre>
        </div>
      )}
    </div>
  );
}
