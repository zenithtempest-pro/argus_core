'use client';

import React, { useState } from 'react';
import { Mail, MessageSquare, Send, Activity, Clock, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

export default function SupportPage() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('technical');
  const [urgency, setUrgency] = useState('medium');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Missing Fields', 'Please complete all required fields', 'error');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast('Ticket Submitted', `Support ticket #ARG-${Math.floor(1000 + Math.random() * 9000)} generated. Analyst will reply to ${email}.`, 'success');
      setName('');
      setEmail('');
      setMessage('');
    }, 1200);
  };

  return (
    <div className="py-12 bg-argus-50 dark:bg-[#090d16] min-h-[90vh] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Header */}
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="info" size="md" className="mb-3">
            <Mail className="w-3.5 h-3.5 mr-1" /> 24/7 Security Operations
          </Badge>
          <h1 className="text-3xl font-extrabold text-argus-900 dark:text-white tracking-tight">Analyst Support & Inquiries</h1>
          <p className="mt-2 text-sm text-argus-600 dark:text-slate-400">
            Submit a security ticket, request custom API integration, or reach out directly to our core team at <strong className="text-brand dark:text-blue-400 font-mono">supportarguscore@gmail.com</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 sm:p-8 shadow-card">
            <h2 className="text-lg font-bold text-argus-900 dark:text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand" /> Submit Support Ticket
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-argus-800 dark:text-slate-200 mb-1">
                    Analyst Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-brand/30 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-argus-800 dark:text-slate-200 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="j.doe@agency.gov"
                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-brand/30 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-argus-800 dark:text-slate-200 mb-1">
                    Issue Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-brand/30 focus:outline-none"
                  >
                    <option value="technical">Technical Support & API</option>
                    <option value="osint">OSINT Tool Request</option>
                    <option value="billing">Enterprise License</option>
                    <option value="vulnerability">Responsible Vulnerability Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-argus-800 dark:text-slate-200 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-brand/30 focus:outline-none"
                  >
                    <option value="low">Low (General Query)</option>
                    <option value="medium">Medium (Standard Ticket)</option>
                    <option value="high">High (API Degradation)</option>
                    <option value="critical">Critical (Emergency Incident)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-argus-800 dark:text-slate-200 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your request, target domain issues, or tool feedback..."
                  className="w-full px-3.5 py-2.5 text-xs font-medium bg-argus-50 dark:bg-slate-900 border border-argus-200 dark:border-slate-700 rounded-xl text-argus-900 dark:text-white focus:ring-2 focus:ring-brand/30 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-xl shadow-card transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Ticket...' : 'Dispatch Ticket'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Info Cards & System Status */}
          <div className="space-y-6">
            
            {/* Live System Status Panel */}
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-card space-y-4">
              <h3 className="text-sm font-bold text-argus-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Infrastructure Status
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-argus-50 dark:bg-slate-900">
                  <span className="text-argus-600 dark:text-slate-300">SuperTool Engine</span>
                  <Badge variant="success">99.99% Operational</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-argus-50 dark:bg-slate-900">
                  <span className="text-argus-600 dark:text-slate-300">Phone & VIN Decoders</span>
                  <Badge variant="success">Operational</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-argus-50 dark:bg-slate-900">
                  <span className="text-argus-600 dark:text-slate-300">Social Hunter (25+)</span>
                  <Badge variant="success">Operational</Badge>
                </div>
              </div>
            </div>

            {/* Direct Contact Channels */}
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-argus-200 dark:border-slate-800 p-6 shadow-card space-y-4 text-xs">
              <h3 className="text-sm font-bold text-argus-900 dark:text-white">Direct Analyst Channels</h3>
              
              <div className="flex items-start gap-3 text-argus-600 dark:text-slate-300">
                <Mail className="w-4 h-4 text-brand dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-argus-800 dark:text-white block">Official Support Email</span>
                  <a href="mailto:supportarguscore@gmail.com" className="font-mono text-brand dark:text-blue-400 hover:underline">supportarguscore@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-argus-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-brand dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-argus-800 dark:text-white block">SLA Response Window</span>
                  <span>Sub-2 hours for High/Critical tickets</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-argus-600 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-brand dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-argus-800 dark:text-white block">Security PGP Key</span>
                  <span className="font-mono text-[10px]">4A91 88B2 FC90 1209 7781</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
