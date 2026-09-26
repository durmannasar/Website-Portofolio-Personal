import React, { useState, useRef } from 'react';
import {
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  Image as ImageIcon,
  Edit2,
  ExternalLink,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { api } from '../../services/api';
import { MediaFile } from '../../types';

export const AdminMedia: React.FC = () => {
  const { media, refreshData, showToast, openLightbox } = useStudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaFile | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editAltItem, setEditAltItem] = useState<MediaFile | null>(null);
  const [altTextInput, setAltTextInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = media.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.filename.toLowerCase().includes(q) ||
      m.title.toLowerCase().includes(q) ||
      m.altText.toLowerCase().includes(q)
    );
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    let successCount = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await api.uploadMedia(file, file.name, file.name.replace(/\.[^/.]+$/, ''));
        successCount++;
      }
      await refreshData();
      showToast(`${successCount} file(s) uploaded successfully`);
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('File path copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMedia(id);
      showToast('Media permanently removed');
      setDeleteConfirmId(null);
      if (selectedItem?.id === id) setSelectedItem(null);
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error deleting media', 'error');
    }
  };

  const handleSaveMetadata = async () => {
    if (!editAltItem) return;
    try {
      await api.updateMedia(editAltItem.id, {
        title: titleInput,
        altText: altTextInput,
      });
      showToast('Asset metadata saved');
      setEditAltItem(null);
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error updating metadata', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono uppercase text-[#E2B714]">
            Asset Management
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Media Library ({media.length})
          </h1>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Upload...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload From Device</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Drag & Drop Quick Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-white/15 hover:border-[#E2B714] bg-white/[0.01] hover:bg-white/[0.03] p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center space-y-2"
      >
        <Upload className="w-8 h-8 text-neutral-500" />
        <p className="text-xs font-semibold text-white">
          Drop imagery directly here or click to select from your device
        </p>
        <p className="text-[11px] text-neutral-500 font-mono">
          JPG, PNG, WebP, AVIF, SVG (Up to 25MB each)
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          placeholder="Search media by filename or alt text..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0C0E16] border border-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E2B714]"
        />
      </div>

      {/* Media Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-xs text-neutral-500 bg-[#0C0E16] border border-white/10">
          No media files match your query.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#0C0E16] border border-white/10 hover:border-[#E2B714] transition-all flex flex-col group relative"
            >
              <div
                className="aspect-square bg-neutral-900 overflow-hidden relative cursor-pointer"
                onClick={() => openLightbox(item.url, item.title || item.filename)}
              >
                <img
                  src={item.url}
                  alt={item.altText || item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-black bg-white px-2 py-1">
                    Expand
                  </span>
                </div>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <p className="text-xs font-bold text-white truncate" title={item.title}>
                    {item.title || item.filename}
                  </p>
                  <p className="text-[10px] text-neutral-500 truncate" title={item.altText}>
                    Alt: {item.altText || '—'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-2 border-t border-white/5">
                  <span>{(item.size / 1024).toFixed(0)} KB</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(item.url, item.id)}
                      className="p-1 text-neutral-400 hover:text-white"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditAltItem(item);
                        setTitleInput(item.title);
                        setAltTextInput(item.altText);
                      }}
                      className="p-1 text-neutral-400 hover:text-white"
                      title="Edit Metadata"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1 text-neutral-400 hover:text-red-400"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-[#12141F] border border-red-500/40 p-6 max-w-md w-full space-y-4">
            <h3 className="font-display font-bold text-white text-lg">
              Delete Media Asset?
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to permanently delete this media file from disk storage? Any projects currently using this asset might show missing visuals.
            </p>
            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Alt Text & Metadata Modal */}
      {editAltItem && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-[#12141F] border border-white/10 p-6 max-w-lg w-full space-y-4">
            <h3 className="font-display font-bold text-white text-base">
              Edit Asset Metadata
            </h3>
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10">
              <img
                src={editAltItem.url}
                alt="Thumbnail"
                className="w-16 h-12 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-0.5 text-xs font-mono truncate">
                <p className="text-white truncate">{editAltItem.filename}</p>
                <p className="text-neutral-500">{(editAltItem.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-400 uppercase font-mono">Title</label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full bg-[#181B28] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-neutral-400 uppercase font-mono">
                  Alt Text (SEO & Accessibility)
                </label>
                <input
                  type="text"
                  value={altTextInput}
                  onChange={(e) => setAltTextInput(e.target.value)}
                  className="w-full bg-[#181B28] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setEditAltItem(null)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMetadata}
                className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] cursor-pointer"
              >
                Save Metadata
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
