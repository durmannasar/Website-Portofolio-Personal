import React, { useState, useEffect } from 'react';
import {
  Activity,
  Radio,
  Check,
  Copy,
  ExternalLink,
  Shield,
  Layers,
  Globe,
  Smartphone,
  Laptop,
  Flame,
  Clock,
  Filter,
  Trash2,
  Send,
  Eye,
  BarChart3,
  TrendingUp,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { api } from '../../services/api';
import { SiteSettings } from '../../types';
import {
  getTelemetryHistory,
  clearTelemetryHistory,
  fireTestTelemetryEvent,
  TelemetryLogEvent,
  initGA,
} from '../../utils/analytics';

export const AdminAnalytics: React.FC = () => {
  const { settings, refreshData, showToast } = useStudio();
  const [formData, setFormData] = useState<Partial<SiteSettings>>({
    gaMeasurementId: settings.gaMeasurementId || 'G-DURMANNASAR',
    gtmContainerId: settings.gtmContainerId || '',
    metaPixelId: settings.metaPixelId || '',
    linkedInPartnerId: settings.linkedInPartnerId || '',
    telemetryActive: settings.telemetryActive ?? true,
    anonymizeIp: settings.anonymizeIp ?? true,
    enhancedMeasurement: settings.enhancedMeasurement ?? true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [events, setEvents] = useState<TelemetryLogEvent[]>([]);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'events'>('overview');

  // Load telemetry events
  useEffect(() => {
    setEvents(getTelemetryHistory());

    const handleUpdate = () => {
      setEvents(getTelemetryHistory());
    };

    window.addEventListener('studio_telemetry_update', handleUpdate);
    return () => {
      window.removeEventListener('studio_telemetry_update', handleUpdate);
    };
  }, []);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings(formData);
      if (formData.gaMeasurementId && formData.telemetryActive) {
        initGA(formData.gaMeasurementId, {
          anonymizeIp: formData.anonymizeIp,
          enhancedMeasurement: formData.enhancedMeasurement,
        });
      }
      await refreshData();
      showToast('Telemetry & gtag.js tracking settings updated successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to update tracking settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFireTestPing = (type = 'studio_telemetry_manual_ping') => {
    fireTestTelemetryEvent(type, {
      screen_resolution: `${window.innerWidth}x${window.innerHeight}`,
      session_time: new Date().toLocaleTimeString(),
    });
    setEvents(getTelemetryHistory());
    showToast(`Dispatched test event: ${type}`);
  };

  const handleClearEvents = () => {
    clearTelemetryHistory();
    setEvents([]);
    showToast('Telemetry event log cleared', 'info');
  };

  const generatedScriptSnippet = `<!-- Global Site Tag (gtag.js) - Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${
    formData.gaMeasurementId || 'G-XXXXXXXXXX'
  }"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${formData.gaMeasurementId || 'G-XXXXXXXXXX'}', {
    'anonymize_ip': ${formData.anonymizeIp ? 'true' : 'false'},
    'send_page_view': true
  });
</script>`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(generatedScriptSnippet);
    setCopiedSnippet(true);
    showToast('gtag.js code snippet copied to clipboard');
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  // Filtered events
  const filteredEvents = events.filter((evt) => {
    if (selectedEventFilter === 'all') return true;
    return evt.name === selectedEventFilter;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-[#E2B714]">
              Telemetry & Audience Analytics
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry Stream
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Website Tracking (Global Site Tag gtag.js)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Google Analytics 4 telemetry, event dispatcher stream, visitor acquisition tracking, and conversion attribution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleFireTestPing('test_telemetry_ping')}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-[#E2B714]" />
            <span>Send Test Ping</span>
          </button>

          <button
            onClick={() => handleSaveSettings()}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-1.5 font-bold shadow-sm disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Tracking'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-1 ${
            activeTab === 'overview'
              ? 'border-[#E2B714] text-white font-bold'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Audience Metrics & KPIs
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-1 ${
            activeTab === 'config'
              ? 'border-[#E2B714] text-white font-bold'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          gtag.js & Tracking Config
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-1 flex items-center gap-2 ${
            activeTab === 'events'
              ? 'border-[#E2B714] text-white font-bold'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <span>Live Event Inspector</span>
          <span className="px-1.5 py-0.2 bg-[#E2B714]/20 text-[#E2B714] text-[10px] font-mono">
            {events.length}
          </span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & AUDIENCE METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Real-time KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-[#0C0E16] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-mono uppercase text-neutral-400">
                  Active Visitors Now
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="font-display text-3xl font-extrabold text-white tabular-nums">
                14
              </div>
              <span className="text-[11px] font-mono text-emerald-400 block">
                +4 from last hour (Jakarta, SG, Paris)
              </span>
            </div>

            <div className="p-5 bg-[#0C0E16] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-mono uppercase text-neutral-400">
                  24h Telemetry Hits
                </span>
                <BarChart3 className="w-4 h-4 text-[#E2B714]" />
              </div>
              <div className="font-display text-3xl font-extrabold text-white tabular-nums">
                1,842
              </div>
              <span className="text-[11px] font-mono text-neutral-400 block">
                Tracked via gtag.js Dispatcher
              </span>
            </div>

            <div className="p-5 bg-[#0C0E16] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-mono uppercase text-neutral-400">
                  Avg. Portfolio Time
                </span>
                <Clock className="w-4 h-4 text-[#E2B714]" />
              </div>
              <div className="font-display text-3xl font-extrabold text-white tabular-nums">
                3m 48s
              </div>
              <span className="text-[11px] font-mono text-neutral-400 block">
                High visual dwell on 3D & Motion
              </span>
            </div>

            <div className="p-5 bg-[#0C0E16] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-mono uppercase text-neutral-400">
                  Brief Inquiry Rate
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-display text-3xl font-extrabold text-emerald-400 tabular-nums">
                4.6%
              </div>
              <span className="text-[11px] font-mono text-neutral-400 block">
                Leads converted to direct briefs
              </span>
            </div>
          </div>

          {/* Traffic Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Geo Presence */}
            <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-mono uppercase text-neutral-300 font-bold flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#E2B714]" />
                  <span>Audience Geographic Reach</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-500">Last 30 Days</span>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { country: 'Indonesia', share: '46%', city: 'Jakarta, Surabaya, Bali', count: '848' },
                  { country: 'Singapore', share: '22%', city: 'Downtown Core, Marina Bay', count: '405' },
                  { country: 'France', share: '12%', city: 'Paris, Lyon', count: '221' },
                  { country: 'United States', share: '10%', city: 'New York, San Francisco', count: '184' },
                  { country: 'United Arab Emirates', share: '6%', city: 'Dubai, Abu Dhabi', count: '110' },
                  { country: 'Other International', share: '4%', city: 'Tokyo, London, Sydney', count: '74' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{item.country}</span>
                      <span className="font-mono text-[#E2B714]">{item.share} ({item.count})</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5">
                      <div
                        className="bg-[#E2B714] h-1.5"
                        style={{ width: item.share }}
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 block">{item.city}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Devices & Channels */}
            <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-mono uppercase text-neutral-300 font-bold flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-[#E2B714]" />
                  <span>Platform & Channels</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-500">Hardware & Sources</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase text-neutral-400 block">
                    Device Breakdown
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-3 bg-white/5 border border-white/10 space-y-1">
                      <Laptop className="w-4 h-4 mx-auto text-neutral-300" />
                      <span className="font-bold text-white block">64%</span>
                      <span className="text-[10px] text-neutral-400 font-mono">Desktop</span>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 space-y-1">
                      <Smartphone className="w-4 h-4 mx-auto text-neutral-300" />
                      <span className="font-bold text-white block">32%</span>
                      <span className="text-[10px] text-neutral-400 font-mono">Mobile</span>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 space-y-1">
                      <Layers className="w-4 h-4 mx-auto text-neutral-300" />
                      <span className="font-bold text-white block">4%</span>
                      <span className="text-[10px] text-neutral-400 font-mono">Tablet</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[11px] font-mono uppercase text-neutral-400 block">
                    Top Traffic Channels
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-white/[0.02]">
                      <span className="text-neutral-300">Direct / Portfolio Deck Links</span>
                      <span className="font-mono text-[#E2B714]">42%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/[0.02]">
                      <span className="text-neutral-300">Google Organic Search</span>
                      <span className="font-mono text-[#E2B714]">28%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/[0.02]">
                      <span className="text-neutral-300">LinkedIn Creative Leadership</span>
                      <span className="font-mono text-[#E2B714]">18%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/[0.02]">
                      <span className="text-neutral-300">Behance & Instagram</span>
                      <span className="font-mono text-[#E2B714]">12%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Most Visited Disciplines & Works */}
            <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-mono uppercase text-neutral-300 font-bold flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#E2B714]" />
                  <span>High-Interest Content</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-500">Engagements</span>
              </div>

              <div className="space-y-3 text-xs">
                <span className="text-[11px] font-mono uppercase text-neutral-400 block">
                  Top Requested Disciplines
                </span>
                {[
                  { name: '3D Exhibition Booth', inquiries: 28, tag: '08. Spatial' },
                  { name: 'Graphic Design & Identity', inquiries: 24, tag: '01. Branding' },
                  { name: 'Motion Graphics', inquiries: 19, tag: '02. Kinetic' },
                  { name: 'Video Editing & Film', inquiries: 16, tag: '05. Cinema' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5">
                    <div>
                      <span className="text-white font-medium block">{s.name}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">{s.tag}</span>
                    </div>
                    <span className="font-mono text-[#E2B714] text-xs font-bold">
                      {s.inquiries} briefs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONFIGURATION & SCRIPT GENERATOR */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Main Global Site Tag Settings */}
          <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  Global Site Tag (gtag.js) Parameters
                </h3>
                <p className="text-xs text-neutral-400">
                  Primary tracking telemetry dispatched directly to Google Analytics 4.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-400">Telemetry Active:</span>
                <input
                  type="checkbox"
                  checked={formData.telemetryActive ?? true}
                  onChange={(e) => setFormData({ ...formData, telemetryActive: e.target.checked })}
                  className="w-4 h-4 accent-[#E2B714] cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-mono text-neutral-300 uppercase flex items-center justify-between">
                  <span>Google Analytics 4 Measurement ID</span>
                  <span className="text-[#E2B714] font-bold">* Required</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="G-XXXXXXXXXX"
                  value={formData.gaMeasurementId || ''}
                  onChange={(e) => setFormData({ ...formData, gaMeasurementId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#E2B714]"
                />
                <span className="text-[11px] text-neutral-500 font-mono block">
                  Find your Measurement ID in Google Analytics → Admin → Data Streams.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-neutral-300 uppercase">
                  Google Tag Manager (GTM) Container ID
                </label>
                <input
                  type="text"
                  placeholder="GTM-XXXXXXX"
                  value={formData.gtmContainerId || ''}
                  onChange={(e) => setFormData({ ...formData, gtmContainerId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#E2B714]"
                />
                <span className="text-[11px] text-neutral-500 font-mono block">
                  Optional. For advanced tag management and client custom event triggers.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-neutral-300 uppercase">
                  Meta Pixel ID (Facebook / Instagram)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456789012345"
                  value={formData.metaPixelId || ''}
                  onChange={(e) => setFormData({ ...formData, metaPixelId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#E2B714]"
                />
                <span className="text-[11px] text-neutral-500 font-mono block">
                  Optional. For tracking brand campaign conversions across Meta platforms.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-neutral-300 uppercase">
                  LinkedIn Insight Tag Partner ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6543210"
                  value={formData.linkedInPartnerId || ''}
                  onChange={(e) => setFormData({ ...formData, linkedInPartnerId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#E2B714]"
                />
                <span className="text-[11px] text-neutral-500 font-mono block">
                  Optional. For B2B executive conversion and retargeting analytics.
                </span>
              </div>
            </div>

            {/* Privacy & Enhanced Telemetry Options */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.anonymizeIp ?? true}
                  onChange={(e) => setFormData({ ...formData, anonymizeIp: e.target.checked })}
                  className="w-4 h-4 accent-[#E2B714] mt-0.5"
                />
                <div>
                  <span className="font-semibold text-white block">IP Anonymization (GDPR Mask)</span>
                  <span className="text-[11px] text-neutral-400">
                    Masks last octet of client IPv4/IPv6 addresses before storage in Google servers.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enhancedMeasurement ?? true}
                  onChange={(e) =>
                    setFormData({ ...formData, enhancedMeasurement: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#E2B714] mt-0.5"
                />
                <div>
                  <span className="font-semibold text-white block">Enhanced Measurement Events</span>
                  <span className="text-[11px] text-neutral-400">
                    Automatically records scroll depth, outbound portfolio clicks, and deck downloads.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Code Snippet Box */}
          <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  HTML Tracking Code Snippet
                </h3>
                <p className="text-xs text-neutral-400">
                  Global Site Tag (gtag.js) script configured with your active studio settings.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySnippet}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-[#E2B714] hover:text-black text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet ? 'Copied' : 'Copy Snippet'}</span>
              </button>
            </div>

            <pre className="p-4 bg-black/80 border border-white/10 text-[11px] font-mono text-[#E2B714] overflow-x-auto leading-relaxed">
              {generatedScriptSnippet}
            </pre>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2 font-bold"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Tracking Configuration'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: LIVE EVENT INSPECTOR */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#0C0E16] border border-white/10">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-mono text-neutral-300">Filter Event:</span>
              <select
                value={selectedEventFilter}
                onChange={(e) => setSelectedEventFilter(e.target.value)}
                className="bg-white/5 border border-white/10 text-white text-xs px-2.5 py-1 font-mono focus:outline-none"
              >
                <option value="all">All Events ({events.length})</option>
                <option value="page_view">page_view</option>
                <option value="project_view">project_view</option>
                <option value="service_view">service_view</option>
                <option value="contact_form_submit">contact_form_submit</option>
                <option value="whatsapp_click">whatsapp_click</option>
                <option value="email_click">email_click</option>
                <option value="lightbox_open">lightbox_open</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => handleFireTestPing('manual_service_inquire')}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-neutral-300 cursor-pointer"
              >
                + Simulate Inquire Event
              </button>
              <button
                type="button"
                onClick={handleClearEvents}
                className="px-3 py-1 bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-white/10 text-xs font-mono text-neutral-400 cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Stream</span>
              </button>
            </div>
          </div>

          {/* Event Stream List */}
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center bg-[#0C0E16] border border-white/10 space-y-3">
              <Activity className="w-8 h-8 text-neutral-600 mx-auto" />
              <span className="text-xs text-neutral-400 block font-mono">
                No telemetry events captured yet under this filter.
              </span>
              <button
                onClick={() => handleFireTestPing('test_telemetry_ping')}
                className="px-4 py-2 bg-white/10 hover:bg-[#E2B714] hover:text-black text-xs font-semibold cursor-pointer text-white"
              >
                Send Test Telemetry Event
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 bg-[#0C0E16] border border-white/10 hover:border-white/20 transition-all space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#E2B714]/10 text-[#E2B714] border border-[#E2B714]/30 font-mono font-bold text-[11px]">
                        {evt.name}
                      </span>
                      <span className="text-neutral-400 font-mono text-[10px]">
                        {evt.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400">
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{evt.status === 'dispatched' ? 'GA4 Dispatched' : 'Simulated'}</span>
                      </span>
                      <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <pre className="p-2.5 bg-black/60 border border-white/5 text-[11px] font-mono text-neutral-300 overflow-x-auto leading-relaxed">
                    {JSON.stringify(evt.params, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
