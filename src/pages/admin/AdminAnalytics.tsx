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
  ClipboardPaste,
  Code2,
  Sparkles,
  Info,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { api } from '../../services/api';
import { SiteSettings, ContactInquiry } from '../../types';
import {
  getTelemetryHistory,
  clearTelemetryHistory,
  fireTestTelemetryEvent,
  TelemetryLogEvent,
  initGA,
} from '../../utils/analytics';

export const AdminAnalytics: React.FC = () => {
  const { settings, refreshData, showToast } = useStudio();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [formData, setFormData] = useState<Partial<SiteSettings>>({
    gaMeasurementId: settings.gaMeasurementId || '',
    customTrackingCode: settings.customTrackingCode || '',
    gtmContainerId: settings.gtmContainerId || '',
    metaPixelId: settings.metaPixelId || '',
    linkedInPartnerId: settings.linkedInPartnerId || '',
    telemetryActive: settings.telemetryActive ?? true,
    anonymizeIp: settings.anonymizeIp ?? true,
    enhancedMeasurement: settings.enhancedMeasurement ?? true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [events, setEvents] = useState<TelemetryLogEvent[]>([]);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'events'>('overview');

  // Keep form in sync when settings change
  useEffect(() => {
    setFormData({
      gaMeasurementId: settings.gaMeasurementId || '',
      customTrackingCode: settings.customTrackingCode || '',
      gtmContainerId: settings.gtmContainerId || '',
      metaPixelId: settings.metaPixelId || '',
      linkedInPartnerId: settings.linkedInPartnerId || '',
      telemetryActive: settings.telemetryActive ?? true,
      anonymizeIp: settings.anonymizeIp ?? true,
      enhancedMeasurement: settings.enhancedMeasurement ?? true,
    });
  }, [settings]);

  // Load telemetry events and real client inquiries
  useEffect(() => {
    setEvents(getTelemetryHistory());
    api
      .getInquiries()
      .then((data) => setInquiries(data || []))
      .catch(() => {});

    const handleUpdate = () => {
      setEvents(getTelemetryHistory());
    };

    window.addEventListener('studio_telemetry_update', handleUpdate);
    return () => {
      window.removeEventListener('studio_telemetry_update', handleUpdate);
    };
  }, []);

  const handleScriptChange = (code: string) => {
    // Detect Measurement ID from pasted script (e.g. id=G-XXXXX or gtag('config', 'G-XXXXX'))
    const match =
      code.match(/id=([A-Za-z0-9_-]+)/) ||
      code.match(/gtag\(['"]config['"],\s*['"]([^'"]+)['"]/);
    const detectedId = match ? match[1] : '';

    setFormData((prev) => ({
      ...prev,
      customTrackingCode: code,
      gaMeasurementId: detectedId || prev.gaMeasurementId,
    }));
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleScriptChange(text);
        showToast('Script Google tag berhasil ditempel dari clipboard');
      }
    } catch {
      showToast('Gunakan tombol Ctrl+V atau Cmd+V di kolom teks untuk menempel script', 'info');
    }
  };

  const detectedIdInScript =
    formData.customTrackingCode?.match(/id=([A-Za-z0-9_-]+)/)?.[1] ||
    formData.customTrackingCode?.match(/gtag\(['"]config['"],\s*['"]([^'"]+)['"]/)?.[1];

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings(formData);
      if (formData.telemetryActive && (formData.customTrackingCode || formData.gaMeasurementId)) {
        initGA(formData.gaMeasurementId || '', {
          customScript: formData.customTrackingCode,
          anonymizeIp: formData.anonymizeIp,
          enhancedMeasurement: formData.enhancedMeasurement,
        });
      }
      await refreshData();
      showToast('Konfigurasi Google tag (gtag.js) berhasil disimpan dan aktif');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan konfigurasi tracking', 'error');
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
      {activeTab === 'overview' && (() => {
        const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isTablet = typeof navigator !== 'undefined' && /iPad|Tablet/i.test(navigator.userAgent);
        const currentDevice = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';

        const disciplineMap: Record<string, number> = {};
        inquiries.forEach((inq) => {
          const key = inq.service || 'General Inquiries';
          disciplineMap[key] = (disciplineMap[key] || 0) + 1;
        });
        const realDisciplines = Object.entries(disciplineMap).map(([name, count]) => ({
          name,
          inquiries: count,
        }));

        return (
          <div className="space-y-8">
            {/* Real-time KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-[#0C0E16] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-mono uppercase text-neutral-400">
                    Active Visitors Now
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-600"></span>
                  </span>
                </div>
                <div className="font-display text-3xl font-extrabold text-white tabular-nums">
                  0
                </div>
                <span className="text-[11px] font-mono text-neutral-500 block">
                  Belum terhubung ke GA4 Realtime
                </span>
              </div>

              <div className="p-5 bg-[#0C0E16] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-mono uppercase text-neutral-400">
                    Telemetry Hits
                  </span>
                  <BarChart3 className="w-4 h-4 text-[#E2B714]" />
                </div>
                <div className="font-display text-3xl font-extrabold text-white tabular-nums">
                  {events.length}
                </div>
                <span className="text-[11px] font-mono text-neutral-400 block">
                  {events.length > 0 ? 'Tercatat di sesi browser lokal' : '0 hit (Menunggu pengunjung)'}
                </span>
              </div>

              <div className="p-5 bg-[#0C0E16] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-mono uppercase text-neutral-400">
                    Avg. Portfolio Time
                  </span>
                  <Clock className="w-4 h-4 text-[#E2B714]" />
                </div>
                <div className="font-display text-3xl font-extrabold text-neutral-400 tabular-nums">
                  0s
                </div>
                <span className="text-[11px] font-mono text-neutral-500 block">
                  Memerlukan data aktif GA4
                </span>
              </div>

              <div className="p-5 bg-[#0C0E16] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-mono uppercase text-neutral-400">
                    Total Client Inquiries
                  </span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="font-display text-3xl font-extrabold text-emerald-400 tabular-nums">
                  {inquiries.length}
                </div>
                <span className="text-[11px] font-mono text-neutral-400 block">
                  {inquiries.length > 0 ? `${inquiries.length} pesan brief riil masuk` : 'Belum ada pesan masuk'}
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
                  <span className="text-[10px] font-mono text-neutral-500">Google Analytics 4</span>
                </div>

                <div className="py-8 px-4 text-center space-y-3 bg-white/[0.01] border border-white/5">
                  <Globe className="w-8 h-8 text-neutral-600 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white">Belum Ada Data Geografis</p>
                    <p className="text-[11px] text-neutral-400 leading-relaxed max-w-xs mx-auto">
                      Data jangkauan negara dan kota pengunjung akan terhimpun otomatis setelah Google Analytics 4 (GA4) terhubung dan menerima kunjungan riil.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('config')}
                    className="text-[11px] font-mono text-[#E2B714] hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Atur ID Pengukuran GA4</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Devices & Channels */}
              <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-mono uppercase text-neutral-300 font-bold flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-[#E2B714]" />
                    <span>Platform & Channels</span>
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">Perangkat Saat Ini</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase text-neutral-400 block">
                      Device Breakdown (Sesi Riil)
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className={`p-3 border space-y-1 ${currentDevice === 'Desktop' ? 'bg-[#E2B714]/10 border-[#E2B714]/40 text-[#E2B714]' : 'bg-white/5 border-white/10 text-neutral-400'}`}>
                        <Laptop className="w-4 h-4 mx-auto" />
                        <span className="font-bold text-white block">{currentDevice === 'Desktop' ? '1 Sesi' : '0'}</span>
                        <span className="text-[10px] font-mono">Desktop</span>
                      </div>
                      <div className={`p-3 border space-y-1 ${currentDevice === 'Mobile' ? 'bg-[#E2B714]/10 border-[#E2B714]/40 text-[#E2B714]' : 'bg-white/5 border-white/10 text-neutral-400'}`}>
                        <Smartphone className="w-4 h-4 mx-auto" />
                        <span className="font-bold text-white block">{currentDevice === 'Mobile' ? '1 Sesi' : '0'}</span>
                        <span className="text-[10px] font-mono">Mobile</span>
                      </div>
                      <div className={`p-3 border space-y-1 ${currentDevice === 'Tablet' ? 'bg-[#E2B714]/10 border-[#E2B714]/40 text-[#E2B714]' : 'bg-white/5 border-white/10 text-neutral-400'}`}>
                        <Layers className="w-4 h-4 mx-auto" />
                        <span className="font-bold text-white block">{currentDevice === 'Tablet' ? '1 Sesi' : '0'}</span>
                        <span className="text-[10px] font-mono">Tablet</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[11px] font-mono uppercase text-neutral-400 block">
                      Traffic Acquisition
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 bg-white/[0.02]">
                        <span className="text-neutral-300">Direct / Tautan Langsung</span>
                        <span className="font-mono text-[#E2B714]">1 Sesi Aktif</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/[0.02]">
                        <span className="text-neutral-400">Google Search Organic</span>
                        <span className="font-mono text-neutral-500">0 (Menunggu GA4)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/[0.02]">
                        <span className="text-neutral-400">Social Media & Referral</span>
                        <span className="font-mono text-neutral-500">0 (Menunggu GA4)</span>
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
                  <span className="text-[10px] font-mono text-neutral-500">Permintaan Brief Riil</span>
                </div>

                {realDisciplines.length > 0 ? (
                  <div className="space-y-2.5 text-xs">
                    <span className="text-[11px] font-mono uppercase text-neutral-400 block">
                      Disiplin yang Dipesan Klien
                    </span>
                    {realDisciplines.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/5">
                        <span className="text-white font-medium">{d.name}</span>
                        <span className="font-mono text-[#E2B714] text-xs font-bold">
                          {d.inquiries} brief
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 px-4 text-center space-y-2 bg-white/[0.01] border border-white/5">
                    <Flame className="w-8 h-8 text-neutral-600 mx-auto" />
                    <p className="text-xs font-semibold text-white">Belum Ada Permintaan Brief</p>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Statistik minat layanan akan otomatis terhitung saat klien mengirimkan form inquiry melalui website.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

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

          {/* Install Manual: Google tag (gtag.js) */}
          <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-[#E2B714]" />
                  <h3 className="font-display text-base font-bold text-white">
                    Install Manual: Script Google tag (gtag.js)
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Salin script resmi langsung dari konsol Google Analytics Anda dan tempelkan (paste) di bawah ini.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="px-3 py-1.5 bg-white/10 hover:bg-[#E2B714] hover:text-black text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Tempel dari Clipboard</span>
                </button>
                {formData.customTrackingCode && (
                  <button
                    type="button"
                    onClick={() => handleScriptChange('')}
                    className="px-3 py-1.5 bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-300 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>

            {/* Step-by-Step Guide from Google Analytics */}
            <div className="p-4 bg-white/[0.02] border border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#E2B714] font-semibold font-mono">
                <Info className="w-4 h-4" />
                <span>Petunjuk Cara Mengambil Script dari Google Analytics (Install Manually):</span>
              </div>
              <ol className="list-decimal pl-5 space-y-1.5 text-neutral-300 text-[11px] leading-relaxed">
                <li>
                  Buka akun <strong>Google Analytics</strong> Anda di{' '}
                  <a
                    href="https://analytics.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E2B714] hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>analytics.google.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>.
                </li>
                <li>
                  Masuk ke menu <strong>Admin</strong> (ikon roda gigi di pojok kiri bawah) → klik <strong>Aliran data (Data Streams)</strong>.
                </li>
                <li>
                  Pilih Aliran Web website Anda (misal: <code>durmannasarstudio.com</code>).
                </li>
                <li>
                  Gulir ke bagian paling bawah jendela detail aliran web, lalu klik <strong>Lihat petunjuk tag (View tag instructions)</strong>.
                </li>
                <li>
                  Pilih tab <strong>Pasang secara manual (Install manually)</strong>.
                </li>
                <li>
                  Klik tombol <strong>Salin (Copy)</strong> pada script <code>&lt;!-- Google tag (gtag.js) --&gt;</code>, lalu <strong>tempelkan (paste)</strong> ke dalam kotak di bawah ini.
                </li>
              </ol>
            </div>

            {/* Textarea for Pasting the Script */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-mono text-neutral-300 uppercase flex items-center gap-1.5">
                  <span>Script Google Tag (gtag.js) dari Google Analytics</span>
                  <span className="text-[#E2B714] font-bold">* Tempel di Sini</span>
                </label>
                {detectedIdInScript && (
                  <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Terdeteksi ID: {detectedIdInScript}</span>
                  </span>
                )}
              </div>

              <div className="relative">
                <textarea
                  rows={8}
                  value={formData.customTrackingCode || ''}
                  onChange={(e) => handleScriptChange(e.target.value)}
                  placeholder={`<!-- Tempelkan script Google tag (gtag.js) yang Anda salin dari Google Analytics di sini -->\n\n<!-- Contoh format resmi dari Google Analytics: -->\n<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n\n  gtag('config', 'G-XXXXXXXXXX');\n</script>`}
                  className="w-full bg-[#080A10] border border-white/15 p-4 text-xs font-mono text-[#E2B714] placeholder-neutral-600 focus:outline-none focus:border-[#E2B714] leading-relaxed resize-y"
                  spellCheck={false}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono text-neutral-500">
                <span>
                  {formData.customTrackingCode
                    ? `✓ ${formData.customTrackingCode.length} karakter script tersimpan`
                    : 'Menunggu script dari konsol Google Analytics'}
                </span>
                <span className="text-neutral-400">
                  Script ini akan diinjeksikan secara otomatis ke seluruh halaman website saat disimpan.
                </span>
              </div>
            </div>
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
