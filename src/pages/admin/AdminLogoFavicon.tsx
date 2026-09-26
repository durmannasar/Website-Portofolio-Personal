import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Download,
  Trash2,
  Globe,
  Sparkles,
  Smartphone,
  Eye,
  AlertCircle,
  FileCode,
  Sliders,
} from 'lucide-react';
import { useStudio, applyFaviconToDocument } from '../../context/StudioContext';
import { api } from '../../services/api';
import { MediaPickerModal } from '../../components/MediaPickerModal';

export const AdminLogoFavicon: React.FC = () => {
  const { settings, updateSettings, showToast } = useStudio();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(settings.faviconUrl || '/favicon.svg');
  const [dragActive, setDragActive] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewTabMode, setPreviewTabMode] = useState<'dark' | 'light'>('dark');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFaviconUrl = previewUrl || settings.faviconUrl || '/favicon.svg';

  const handleFileSelected = async (file: File) => {
    // Validate file type: PNG, JPG, JPEG, SVG, WEBP, ICO
    const validTypes = [
      'image/svg+xml',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/x-icon',
      'image/vnd.microsoft.icon',
    ];

    const ext = file.name.split('.').pop()?.toLowerCase();
    const isExtensionValid = ['svg', 'png', 'jpg', 'jpeg', 'webp', 'ico'].includes(ext || '');

    if (!validTypes.includes(file.type) && !isExtensionValid) {
      showToast('Format file tidak didukung. Harap unggah format PNG, JPG, JPEG, atau SVG.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('Ukuran file maksimal adalah 15MB.');
      return;
    }

    setIsUploading(true);
    try {
      // Create local object URL for instant preview
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Upload via API
      const result = await api.uploadFavicon(file);
      const finalUrl = result.fileUrl || localPreview;
      setPreviewUrl(finalUrl);

      // Instantly update StudioContext settings (updates Navbar, Footer, Admin, and localStorage)
      await updateSettings({
        faviconUrl: finalUrl,
        logoUrl: finalUrl,
        appleTouchIconUrl: finalUrl,
        faviconUpdatedAt: new Date().toISOString(),
      });

      showToast('Logo & Favicon berhasil diunggah dan terpasang aktif di website!');
    } catch (err: any) {
      console.error('Error uploading favicon:', err);
      showToast(err.message || 'Gagal mengunggah file favicon.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleRestoreDefault = async () => {
    setIsSaving(true);
    try {
      const defaultUrl = '/favicon.svg';
      setPreviewUrl(defaultUrl);
      await updateSettings({
        faviconUrl: defaultUrl,
        logoUrl: defaultUrl,
        appleTouchIconUrl: '/apple-touch-icon.png',
        faviconUpdatedAt: new Date().toISOString(),
      });
      showToast('Favicon dikembalikan ke logo bawaan (monogram dns’)!');
    } catch (err) {
      showToast('Gagal mereset favicon.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMediaSelect = async (url: string) => {
    setShowMediaPicker(false);
    setIsSaving(true);
    try {
      setPreviewUrl(url);
      await updateSettings({
        faviconUrl: url,
        logoUrl: url,
        appleTouchIconUrl: url,
        faviconUpdatedAt: new Date().toISOString(),
      });
      showToast('Favicon diperbarui dari Media Library!');
    } catch {
      showToast('Gagal menerapkan favicon dari Media Library.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    const fullUrl = activeFaviconUrl.startsWith('http')
      ? activeFaviconUrl
      : `${window.location.origin}${activeFaviconUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    showToast('Tautan favicon berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E2B714]/10 border border-[#E2B714]/30 rounded">
              <Globe className="w-5 h-5 text-[#E2B714]" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">
              Logo & Favicon Management
            </h1>
            <span className="text-[10px] font-mono uppercase bg-emerald-950/70 border border-emerald-800 text-emerald-400 px-2.5 py-0.5 font-semibold">
              Live Synced
            </span>
          </div>
          <p className="text-sm text-neutral-400 mt-1.5">
            Kelola logo identitas visual studio, favicon browser tab, dan ikon shortcut mobile web app (PNG, JPG, SVG).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRestoreDefault}
            disabled={isSaving || isUploading}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>Reset Default Monogram</span>
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#E2B714] text-black font-semibold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#E2B714]/90 transition-colors shadow-sm"
          >
            <span>Buka Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Grid: Upload Area & Live Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload Dropzone & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upload Dropzone Box */}
          <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  Unggah File Favicon / Logo
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Mendukung format gambar transparan atau berlatar belakang.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#E2B714] bg-[#E2B714]/10 px-2 py-0.5 border border-[#E2B714]/20">
                  PNG • JPG • SVG
                </span>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-[#E2B714] bg-[#E2B714]/10 scale-[1.01]'
                  : 'border-white/15 bg-white/[0.02] hover:border-[#E2B714]/60 hover:bg-white/[0.04]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,.png,.jpg,.jpeg,.webp,.ico,image/svg+xml,image/png,image/jpeg,image/webp,image/x-icon"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-10 h-10 border-2 border-[#E2B714] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-mono text-neutral-300">
                    Mengunggah & Memasang Favicon...
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7 text-[#E2B714]" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">
                    Tarik & Lepas File Favicon di Sini
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-sm mb-4">
                    Atau klik untuk menelusuri dari penyimpanan komputer Anda.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-1 bg-white/5 border border-white/10 text-neutral-300 rounded">
                      .SVG (Resolusi Vektor Tak Terbatas)
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-1 bg-white/5 border border-white/10 text-neutral-300 rounded">
                      .PNG (512x512 Transparan)
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-1 bg-white/5 border border-white/10 text-neutral-300 rounded">
                      .JPG / .JPEG
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-[#E2B714] hover:text-black text-white text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih File dari Komputer</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                disabled={isUploading}
                className="w-full sm:w-auto px-4 py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider border border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-[#E2B714]" />
                <span>Pilih dari Media Library</span>
              </button>
            </div>
          </div>

          {/* Active File Details & Technical Spec */}
          <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
            <h4 className="font-mono text-xs uppercase text-neutral-300 font-semibold tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#E2B714]" />
              <span>Detail Favicon Aktif</span>
            </h4>

            <div className="p-4 bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-mono">Lokasi URL:</span>
                <div className="flex items-center gap-2">
                  <code className="text-[#E2B714] font-mono bg-white/5 px-2 py-0.5 truncate max-w-xs">
                    {activeFaviconUrl}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-1 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                    title="Salin Tautan"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
                <span className="text-neutral-400 font-mono">Status Sistem:</span>
                <span className="text-emerald-400 font-mono flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aktif di Seluruh Halaman Website</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
                <span className="text-neutral-400 font-mono">Format Terdeteksi:</span>
                <span className="text-white font-mono uppercase">
                  {activeFaviconUrl.endsWith('.svg')
                    ? 'Scalable Vector Graphics (SVG)'
                    : activeFaviconUrl.endsWith('.png')
                    ? 'Portable Network Graphics (PNG)'
                    : activeFaviconUrl.endsWith('.ico')
                    ? 'Icon File (ICO)'
                    : 'Image File (JPG/WEBP)'}
                </span>
              </div>
            </div>

            {/* Recommendations */}
            <div className="flex items-start gap-2.5 p-3.5 bg-[#E2B714]/5 border border-[#E2B714]/20 text-[11px] text-neutral-300">
              <AlertCircle className="w-4 h-4 text-[#E2B714] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-white block">Tips Format Terbaik:</span>
                <p className="leading-relaxed text-neutral-400">
                  Untuk logo monogram <strong>dns’</strong>, format <strong>SVG</strong> memberikan hasil paling tajam tanpa blur pada resolusi layar Retina atau 4K. Format <strong>PNG</strong> 512x512 px dengan latar belakang transparan juga sangat direkomendasikan untuk ikon bookmark Apple & Android.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: High-Fidelity Previews (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#E2B714]" />
                <h3 className="font-display text-base font-bold text-white">
                  Simulasi Tampilan Nyata
                </h3>
              </div>
              <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded border border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewTabMode('dark')}
                  className={`px-2 py-0.5 text-[10px] font-mono uppercase transition-colors ${
                    previewTabMode === 'dark' ? 'bg-[#E2B714] text-black font-bold' : 'text-neutral-400'
                  }`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTabMode('light')}
                  className={`px-2 py-0.5 text-[10px] font-mono uppercase transition-colors ${
                    previewTabMode === 'light' ? 'bg-[#E2B714] text-black font-bold' : 'text-neutral-400'
                  }`}
                >
                  Light
                </button>
              </div>
            </div>

            {/* 1. Browser Tab Simulation */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">
                1. Tab Browser Web (Chrome / Safari):
              </span>
              <div
                className={`p-3 rounded-lg border transition-colors ${
                  previewTabMode === 'dark'
                    ? 'bg-[#1F2023] border-white/10'
                    : 'bg-[#DEE1E6] border-neutral-300'
                }`}
              >
                {/* Simulated Tab */}
                <div
                  className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-t-md border-t border-x text-xs max-w-xs shadow-sm ${
                    previewTabMode === 'dark'
                      ? 'bg-[#2E3035] border-white/10 text-neutral-200'
                      : 'bg-white border-neutral-300 text-neutral-800'
                  }`}
                >
                  <img
                    src={activeFaviconUrl}
                    alt="Favicon Tab Preview"
                    className="w-4 h-4 rounded-xs object-contain shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/favicon.svg';
                    }}
                  />
                  <span className="font-medium text-xs truncate">
                    Durman Nasar Studio
                  </span>
                  <span className="text-neutral-400 hover:text-white text-[11px] cursor-pointer ml-1">
                    ×
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Mobile Home Screen Bookmark Simulation (Matching Screenshot) */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#E2B714]" />
                <span>2. Ikon Home Screen Smartphone (iOS & Android):</span>
              </span>
              <div className="p-6 bg-black/60 border border-white/10 rounded-lg flex flex-col items-center justify-center text-center">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl bg-black border border-white/15 shadow-2xl p-2.5 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                    <img
                      src={activeFaviconUrl}
                      alt="App Icon Preview"
                      className="w-full h-full object-contain filter drop-shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/favicon.svg';
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#E2B714] rounded-full border-2 border-black flex items-center justify-center text-[10px] text-black font-bold">
                    ✓
                  </div>
                </div>
                <span className="text-xs font-semibold text-white mt-2.5 block tracking-tight">
                  DNS Studio
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  durmannasarstudio.com
                </span>
              </div>
            </div>

            {/* 3. Website Navbar Brand Mark Simulation */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">
                3. Header / Navbar Website:
              </span>
              <div className="p-3 bg-[#090A0F] border border-white/10 rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activeFaviconUrl}
                    alt="Brand Mark"
                    className="w-8 h-8 rounded-sm object-contain"
                  />
                  <span className="font-display text-sm font-bold text-white tracking-tight">
                    Durman Nasar Studio
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase">
                  Menu Bar
                </span>
              </div>
            </div>

            {/* 4. Google Search SERP Snippet Preview */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">
                4. Hasil Pencarian Google (Search Snippet):
              </span>
              <div className="p-4 bg-[#202124] border border-white/10 rounded text-left space-y-1 font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-black p-0.5 border border-white/20 flex items-center justify-center shrink-0">
                    <img
                      src={activeFaviconUrl}
                      alt="Google SERP Favicon"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="leading-tight">
                    <span className="text-xs text-[#dadce0] font-medium block">
                      Durman Nasar Studio
                    </span>
                    <span className="text-[11px] text-[#bdc1c6]">
                      https://www.durmannasarstudio.com
                    </span>
                  </div>
                </div>
                <div className="text-[#8ab4f8] text-sm font-medium pt-1 hover:underline cursor-pointer">
                  Durman Nasar Studio
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPickerModal
          isOpen={showMediaPicker}
          onSelect={handleMediaSelect}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
};
