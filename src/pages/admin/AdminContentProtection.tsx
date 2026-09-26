import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Save,
  Lock,
  Eye,
  Sliders,
  Sparkles,
  Smartphone,
  Copy,
  MousePointer,
  Download,
  AlertTriangle,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { api } from '../../services/api';
import { ContentProtectionSettings } from '../../types';
import { defaultContentProtection } from '../../data/initialData';

export const AdminContentProtection: React.FC = () => {
  const { settings, refreshData, showToast } = useStudio();
  const [cp, setCp] = useState<ContentProtectionSettings>({
    ...defaultContentProtection,
    ...(settings.contentProtection || {}),
  });

  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(
    '/src/assets/images/project_editorial_branding_1790391299935.jpg'
  );

  const handleToggle = (key: keyof ContentProtectionSettings) => {
    setCp((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        contentProtection: cp,
      };
      await api.updateSettings(updatedSettings);
      await refreshData(true);
      showToast('Content & Image Protection configuration saved and deployed to Firestore');
    } catch (err: any) {
      showToast(err.message || 'Error saving protection settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Header */}
      <div className="space-y-2 border-b border-white/10 pb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase text-[#E2B714] tracking-wider">
            Security & Intellectual Property
          </span>
          <span className="px-2 py-0.5 bg-[#E2B714]/10 text-[#E2B714] border border-[#E2B714]/20 text-[10px] font-mono">
            {cp.enabled ? 'ACTIVE & ENFORCED' : 'DISABLED'}
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Content & Asset Protection System
        </h1>
        <p className="text-xs text-neutral-400 max-w-3xl leading-relaxed">
          Defend Durman Nasar Studio visual assets, case study photography, motion graphics, and editorial copy
          against casual right-click saving, desktop dragging, and copying — while maintaining 100% Google SEO indexing,
          Google Analytics 4 tracking, and smooth responsive mobile browsing.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 text-xs">
        {/* Master Switch Banner */}
        <div
          className={`p-6 border transition-all ${
            cp.enabled
              ? 'bg-[#0E131F] border-[#E2B714]/40 shadow-lg shadow-[#E2B714]/5'
              : 'bg-[#12141C] border-white/10'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`p-3 border shrink-0 ${
                  cp.enabled
                    ? 'bg-[#E2B714]/10 border-[#E2B714]/30 text-[#E2B714]'
                    : 'bg-white/5 border-white/10 text-neutral-500'
                }`}
              >
                {cp.enabled ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <ShieldAlert className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <span className="font-display font-bold text-white text-base block">
                  Master Content Protection Engine
                </span>
                <p className="text-xs text-neutral-400">
                  When enabled, all interaction protections (right-click blocking, anti-drag shields, copy
                  interception, and derivative resolution caps) are enforced on the public website.
                  <span className="text-neutral-300 font-semibold block mt-0.5">
                    * Admin CMS Portal remains 100% exempt so administrators can edit, select, and manage assets freely.
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('enabled')}
              className={`px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer shrink-0 ${
                cp.enabled
                  ? 'bg-[#E2B714] text-black shadow-md'
                  : 'bg-white/10 text-neutral-400 hover:text-white border border-white/15'
              }`}
            >
              {cp.enabled ? 'SYSTEM ACTIVE' : 'SYSTEM OFF'}
            </button>
          </div>
        </div>

        {/* Section 1: Interaction & Browser Protection */}
        <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <MousePointer className="w-4 h-4 text-[#E2B714]" />
            <span className="font-mono uppercase font-bold text-neutral-200 text-sm">
              1. Interaction & Client-Side Protections
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Disable Right Click */}
            <div className="p-4 bg-white/[0.02] border border-white/5 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="font-semibold text-white block">Disable Right-Click Context Menu</span>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Prevents casual "Right Click → Save Image As..." or "Inspect Element" shortcuts across public
                  portfolio pages. (Form inputs remain interactive).
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('disableRightClick')}
                className={`w-12 h-6 flex items-center p-1 transition-colors cursor-pointer shrink-0 ${
                  cp.disableRightClick ? 'bg-[#E2B714]' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-black transition-transform ${
                    cp.disableRightClick ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Disable Text Selection */}
            <div className="p-4 bg-white/[0.02] border border-white/5 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="font-semibold text-white block">Disable Text Selection</span>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Applies CSS <code className="text-[#E2B714]">user-select: none</code> on public editorial text.
                  Semantic HTML is preserved for Google SEO crawlers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('disableTextSelection')}
                className={`w-12 h-6 flex items-center p-1 transition-colors cursor-pointer shrink-0 ${
                  cp.disableTextSelection ? 'bg-[#E2B714]' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-black transition-transform ${
                    cp.disableTextSelection ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Disable Image Dragging */}
            <div className="p-4 bg-white/[0.02] border border-white/5 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="font-semibold text-white block">Disable Image Dragging</span>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Enforces <code className="text-[#E2B714]">draggable="false"</code> and drag-shield layers so
                  visitors cannot drag portfolio images directly onto their computer desktop.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('disableImageDrag')}
                className={`w-12 h-6 flex items-center p-1 transition-colors cursor-pointer shrink-0 ${
                  cp.disableImageDrag ? 'bg-[#E2B714]' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-black transition-transform ${
                    cp.disableImageDrag ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Mobile Long-Press Protection */}
            <div className="p-4 bg-white/[0.02] border border-white/5 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="font-semibold text-white block">Mobile Long-Press Save Prevention</span>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Suppresses default Safari/Chrome iOS/Android image callout popups (<code className="text-[#E2B714]">-webkit-touch-callout: none</code>) while keeping swipe gestures smooth.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('mobileLongPressProtection')}
                className={`w-12 h-6 flex items-center p-1 transition-colors cursor-pointer shrink-0 ${
                  cp.mobileLongPressProtection ? 'bg-[#E2B714]' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-black transition-transform ${
                    cp.mobileLongPressProtection ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Intercept Copy Shortcut */}
            <div className="p-4 bg-white/[0.02] border border-white/5 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="font-semibold text-white block">Intercept Copy Shortcut (Ctrl/Cmd + C)</span>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Blocks casual keyboard copying of portfolio project copy and case studies. Allowed inside contact forms.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('disableCopyShortcut')}
                className={`w-12 h-6 flex items-center p-1 transition-colors cursor-pointer shrink-0 ${
                  cp.disableCopyShortcut ? 'bg-[#E2B714]' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-black transition-transform ${
                    cp.disableCopyShortcut ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Intercept Save Shortcut */}
            <div className="p-4 bg-white/[0.02] border border-white/5 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="font-semibold text-white block">Intercept Save Shortcut (Ctrl/Cmd + S)</span>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Intercepts browser save-webpage commands on public portfolio views, alerting visitors that assets are protected.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('disableSaveShortcut')}
                className={`w-12 h-6 flex items-center p-1 transition-colors cursor-pointer shrink-0 ${
                  cp.disableSaveShortcut ? 'bg-[#E2B714]' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-black transition-transform ${
                    cp.disableSaveShortcut ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Asset Architecture & Resolution Protection */}
        <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Layers className="w-4 h-4 text-[#E2B714]" />
            <span className="font-mono uppercase font-bold text-neutral-200 text-sm">
              2. Asset Architecture & High-Resolution Protection
            </span>
          </div>

          <div className="p-4 bg-white/[0.02] border border-white/5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="font-semibold text-white text-sm block">
                  Protect Original Master Files (Serve Web-Optimized Derivatives)
                </span>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
                  Enforces a two-tier media architecture: <strong>Master Original</strong> (private uncompressed asset stored for CMS archiving) and <strong>Web Display Derivative</strong> (automatically compressed, dimensionally constrained to max 1920px, and optimized for Retina/HiDPI displays). The raw 6000×4000 camera or print exports are never exposed publicly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('protectOriginalImages')}
                className={`w-12 h-6 flex items-center p-1 transition-colors cursor-pointer shrink-0 ${
                  cp.protectOriginalImages ? 'bg-[#E2B714]' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-black transition-transform ${
                    cp.protectOriginalImages ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/5 text-[11px] font-mono">
              <div className="p-2.5 bg-black/40 border border-white/5 space-y-1">
                <span className="text-[#E2B714] font-semibold block">● Private Master Asset</span>
                <p className="text-neutral-400">Stored privately in CMS repository. Never linked directly to public &lt;img&gt; or &lt;a&gt; tags.</p>
              </div>
              <div className="p-2.5 bg-black/40 border border-white/5 space-y-1">
                <span className="text-emerald-400 font-semibold block">● Public Web Derivative</span>
                <p className="text-neutral-400">Optimized WebP/JPEG format capped at responsive dimensions with full SEO alt attributes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Watermark System & Live Interactive Preview */}
        <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E2B714]" />
              <span className="font-mono uppercase font-bold text-neutral-200 text-sm">
                3. Portfolio Watermark Configuration & Live Studio Preview
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('watermarkEnabled')}
              className={`px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                cp.watermarkEnabled
                  ? 'bg-[#E2B714] text-black'
                  : 'bg-white/10 text-neutral-400 border border-white/10'
              }`}
            >
              {cp.watermarkEnabled ? 'WATERMARK ON' : 'WATERMARK OFF'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Watermark Controls */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-mono text-neutral-400 uppercase text-[11px] block">
                  Watermark Branding Text
                </label>
                <input
                  type="text"
                  value={cp.watermarkText}
                  onChange={(e) => setCp({ ...cp, watermarkText: e.target.value })}
                  placeholder="Durman Nasar Studio"
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-[#E2B714]"
                />
                <span className="text-[10px] text-neutral-500 font-mono">
                  Default: Durman Nasar Studio
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-neutral-400 uppercase text-[11px] block">
                  Watermark Position
                </label>
                <select
                  value={cp.watermarkPosition}
                  onChange={(e) =>
                    setCp({
                      ...cp,
                      watermarkPosition: e.target.value as any,
                    })
                  }
                  className="w-full bg-[#12141C] border border-white/10 px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#E2B714]"
                >
                  <option value="bottom-right">Bottom-Right (Standard Editorial)</option>
                  <option value="bottom-left">Bottom-Left</option>
                  <option value="top-right">Top-Right</option>
                  <option value="center">Centered Studio Stamp</option>
                  <option value="diagonal-repeat">Diagonal Subtle Repeat Pattern</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-neutral-400 uppercase text-[11px]">
                    Watermark Opacity
                  </label>
                  <span className="font-mono text-xs text-[#E2B714]">
                    {Math.round(cp.watermarkOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.85"
                  step="0.01"
                  value={cp.watermarkOpacity}
                  onChange={(e) =>
                    setCp({ ...cp, watermarkOpacity: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#E2B714] cursor-pointer"
                />
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 text-[11px] text-neutral-400 font-mono space-y-1">
                <span className="text-neutral-300 font-semibold block">Watermark Implementation Note:</span>
                <p>
                  Watermarks are layered with <code className="text-[#E2B714]">pointer-events-none</code> and can also be
                  baked directly into processed web derivatives during upload to prevent visual removal.
                </p>
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase text-neutral-400">
                  Live Watermark & Anti-Drag Preview
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Try right-clicking or dragging below
                </span>
              </div>

              <div className="relative border border-white/15 bg-black overflow-hidden group select-none aspect-video flex items-center justify-center">
                <img
                  src={previewImage}
                  alt="Protection system preview"
                  draggable={!cp.disableImageDrag}
                  onContextMenu={(e) => {
                    if (cp.disableRightClick) {
                      e.preventDefault();
                    }
                  }}
                  onDragStart={(e) => {
                    if (cp.disableImageDrag) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full h-full object-cover select-none pointer-events-auto"
                />

                {/* Anti-Save Shield */}
                {cp.enabled && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 z-10 pointer-events-none bg-transparent"
                  />
                )}

                {/* Watermark Overlay in Live Preview */}
                {cp.watermarkEnabled && (
                  <div
                    className="absolute inset-0 z-20 pointer-events-none flex select-none overflow-hidden"
                    style={{ opacity: cp.watermarkOpacity }}
                  >
                    {cp.watermarkPosition === 'diagonal-repeat' ? (
                      <div className="w-full h-full flex flex-wrap items-center justify-around rotate-[-25deg] scale-125 opacity-70">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <span
                            key={i}
                            className="font-mono text-[10px] text-white uppercase tracking-widest px-3 py-2 drop-shadow-md whitespace-nowrap"
                          >
                            {cp.watermarkText || 'Durman Nasar Studio'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div
                        className={`w-full h-full p-4 flex ${
                          cp.watermarkPosition === 'center'
                            ? 'items-center justify-center'
                            : cp.watermarkPosition === 'bottom-left'
                            ? 'items-end justify-start'
                            : cp.watermarkPosition === 'top-right'
                            ? 'items-start justify-end'
                            : 'items-end justify-end'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-[2px] border border-white/15 rounded-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E2B714]" />
                          <span className="font-display font-medium text-xs text-white tracking-wider drop-shadow-sm">
                            {cp.watermarkText || 'Durman Nasar Studio'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1">
                <span>Display: Web Derivative (1600px Retina)</span>
                <span>Original Master File: Protected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Save Button */}
        <div className="flex items-center gap-4 pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-2 shadow-lg"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Deploying Protection Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Deploy Protection Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
