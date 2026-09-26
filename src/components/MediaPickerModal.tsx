import React, { useState, useRef } from 'react';
import { X, Upload, Check, Search, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { api } from '../services/api';
import { MediaFile } from '../types';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string, altText?: string) => void;
  title?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Select or Upload Media Asset',
}) => {
  const { media, refreshData, showToast } = useStudio();
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altTextInput, setAltTextInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredMedia = media.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.filename.toLowerCase().includes(q) ||
      m.title.toLowerCase().includes(q) ||
      m.altText.toLowerCase().includes(q)
    );
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndStageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndStageFile(file);
    }
  };

  const validateAndStageFile = (file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      setUploadError('Unsupported format. Please upload JPG, PNG, WebP, AVIF, or SVG.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File size exceeds the 25MB limit.');
      return;
    }
    setUploadError(null);
    setSelectedFile(file);
    setTitleInput(file.name.replace(/\.[^/.]+$/, ''));
    setAltTextInput(file.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const uploaded = await api.uploadMedia(selectedFile, altTextInput, titleInput);
      await refreshData();
      showToast('Media uploaded to studio library successfully');
      onSelect(uploaded.url, uploaded.altText);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-[#10121A] border border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-[#E2B714]" />
            <h3 className="font-display font-bold text-white text-base sm:text-lg">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tab Controls */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#0C0E14]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-white text-black'
                  : 'text-neutral-400 hover:text-white bg-white/5'
              }`}
            >
              Media Library ({media.length})
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white text-black'
                  : 'text-neutral-400 hover:text-white bg-white/5'
              }`}
            >
              Direct Device Upload
            </button>
          </div>

          {activeTab === 'library' && (
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E2B714]"
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[350px]">
          {activeTab === 'library' ? (
            filteredMedia.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
                <ImageIcon className="w-10 h-10 text-neutral-600" />
                <p className="text-neutral-400 text-sm">No media files found.</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer"
                >
                  Upload Your First Image
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelect(item.url, item.altText);
                      onClose();
                    }}
                    className="group relative border border-white/10 hover:border-[#E2B714] bg-[#0A0B10] cursor-pointer transition-all flex flex-col overflow-hidden"
                  >
                    <div className="aspect-video w-full bg-neutral-900 relative overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.altText || item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-black bg-white">
                          Select
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-white truncate">
                        {item.title || item.filename}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1 font-mono">
                        <span>{(item.size / 1024).toFixed(0)} KB</span>
                        <span>{item.mimetype.split('/')[1]?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Upload Tab */
            <div className="max-w-xl mx-auto space-y-6">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-[#E2B714] bg-white/[0.02] hover:bg-white/[0.04] p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-neutral-400" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">
                    Click to select from your device or drag & drop
                  </p>
                  <p className="text-xs text-neutral-400">
                    Supports JPG, PNG, WebP, AVIF, SVG (up to 25MB)
                  </p>
                </div>
              </div>

              {uploadError && (
                <div className="p-3 bg-red-950/40 border border-red-800/60 text-xs text-red-200">
                  {uploadError}
                </div>
              )}

              {selectedFile && previewUrl && (
                <div className="p-4 border border-white/10 bg-[#090A0F] space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-20 h-20 object-cover border border-white/10"
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                      <p className="text-xs text-neutral-400 font-mono">
                        {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">
                        Asset Title
                      </label>
                      <input
                        type="text"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E2B714]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">
                        Alt Text (SEO & Accessibility)
                      </label>
                      <input
                        type="text"
                        value={altTextInput}
                        onChange={(e) => setAltTextInput(e.target.value)}
                        placeholder="Describe the image content..."
                        className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E2B714]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleUploadSubmit}
                      disabled={isUploading}
                      className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading & Processing...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Upload & Insert Asset</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#0C0E14] flex justify-between items-center text-xs text-neutral-400">
          <span>All uploaded files are permanently persisted to studio disk storage.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-neutral-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
