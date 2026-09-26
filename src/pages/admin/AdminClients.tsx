import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Check, X, Users, Upload, Eye, ExternalLink, Wand2 } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { api } from '../../services/api';
import { ClientItem } from '../../types';
import { MediaPickerModal } from '../../components/MediaPickerModal';
import { ClientDetailModal } from '../../components/ClientDetailModal';
import { BrandLogoBadge } from '../../components/BrandLogoBadge';

export const AdminClients: React.FC = () => {
  const { clients, projects, refreshData, showToast } = useStudio();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [previewClient, setPreviewClient] = useState<ClientItem | null>(null);

  const [formData, setFormData] = useState<Partial<ClientItem>>({
    name: '',
    industry: '',
    year: new Date().getFullYear().toString(),
    logoUrl: '',
    featured: true,
    order: clients.length + 1,
    scope: [],
    overview: '',
    results: '',
    projectSlug: '',
    websiteUrl: '',
    testimonial: {
      quote: '',
      author: '',
      role: '',
    },
  });

  const [scopeInput, setScopeInput] = useState('');
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleDirectLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const res = await api.uploadMedia(file, file.name, file.name.replace(/\.[^/.]+$/, ''));
      setFormData((prev) => ({ ...prev, logoUrl: res.url }));
      showToast('Brand logo uploaded successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload logo', 'error');
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    }
  };

  const handleGenerateVectorLogo = () => {
    const brandName = formData.name?.trim() || 'STUDIO BRAND';
    const initials = brandName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');

    // Generate clean modern geometric vector SVG logo
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" fill="none"><rect x="14" y="14" width="32" height="32" rx="4" stroke="%23FFFFFF" stroke-width="2"/><circle cx="30" cy="30" r="7" fill="%23E2B714"/><text x="56" y="34" font-family="sans-serif" font-size="14" font-weight="800" fill="%23FFFFFF" letter-spacing="4">${encodeURIComponent(brandName.toUpperCase().slice(0, 16))}</text><text x="58" y="45" font-family="sans-serif" font-size="7" font-weight="600" fill="%23E2B714" letter-spacing="3">OFFICIAL PARTNER</text></svg>`;
    const dataUri = `data:image/svg+xml;utf8,${svgString}`;
    setFormData((prev) => ({ ...prev, logoUrl: dataUri }));
    showToast(`Vector logo generated for ${brandName}`);
  };

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      industry: '',
      year: new Date().getFullYear().toString(),
      logoUrl: '',
      featured: true,
      order: clients.length + 1,
      scope: ['Brand Identity', 'Creative Direction'],
      overview: '',
      results: '',
      projectSlug: '',
      websiteUrl: '',
      testimonial: {
        quote: '',
        author: '',
        role: '',
      },
    });
    setScopeInput('Brand Identity, Creative Direction');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: ClientItem) => {
    setEditingClient(client);
    setFormData({ ...client });
    setScopeInput(client.scope ? client.scope.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast('Client name is required', 'error');
      return;
    }

    const parsedScope = scopeInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Partial<ClientItem> = {
      ...formData,
      scope: parsedScope.length > 0 ? parsedScope : formData.scope,
    };

    try {
      if (editingClient) {
        await api.updateClient(editingClient.id, payload);
        showToast('Client brand details updated');
      } else {
        await api.createClient(payload as Omit<ClientItem, 'id'>);
        showToast('Client brand added to studio directory');
      }
      await refreshData();
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error saving client', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteClient(id);
      showToast('Client removed');
      setDeleteConfirmId(null);
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error deleting client', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono uppercase text-[#E2B714]">
            Trust & Credibility Directory
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Selected Brands & Client Logos ({clients.length})
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage vector logos, commission scopes, case study links, and client testimonials.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Brand Logo</span>
        </button>
      </div>

      {/* Grid of Client Brands */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {clients.map((c) => (
          <div
            key={c.id}
            className="p-6 bg-[#0C0E16] border border-white/10 hover:border-[#E2B714] transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <span className="text-[#E2B714]">{c.year}</span>
                {c.projectSlug && (
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Case Study Linked
                  </span>
                )}
              </div>

              {/* Logo Box - Always rendered as crisp brand logo */}
              <div className="h-16 bg-[#07080E] border border-white/5 flex items-center justify-center p-2">
                <BrandLogoBadge name={c.name} logoUrl={c.logoUrl} size="sm" />
              </div>

              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-white text-sm">
                  {c.name}
                </h3>
                <p className="text-xs text-neutral-400 font-mono truncate">
                  {c.industry}
                </p>
              </div>

              {c.overview && (
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {c.overview}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={() => setPreviewClient(c)}
                className="text-[11px] font-mono text-neutral-400 hover:text-[#E2B714] flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Modal</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 text-neutral-400 hover:text-white"
                  title="Edit Brand"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(c.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-400"
                  title="Delete Brand"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-[#12141F] border border-red-500/40 p-6 max-w-md w-full space-y-4">
            <h3 className="font-display font-bold text-white text-base">
              Delete Client Entry?
            </h3>
            <p className="text-xs text-neutral-300">
              Are you sure you want to remove this client from the studio brand directory?
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Detail Preview Modal inside Admin */}
      <ClientDetailModal
        client={previewClient}
        onClose={() => setPreviewClient(null)}
      />

      {/* Create / Edit Full Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0E1018] border border-white/10 w-full max-w-2xl max-h-[92vh] flex flex-col my-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#12141F]">
              <h2 className="font-display font-bold text-white text-base">
                {editingClient ? 'Edit Brand & Logo' : 'Add New Client Brand'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 text-xs overflow-y-auto">
              {/* Brand Logo Upload / Pick / Generate */}
              <div className="p-4 bg-white/[0.02] border border-white/10 space-y-3">
                <input
                  type="file"
                  ref={logoFileInputRef}
                  onChange={handleDirectLogoUpload}
                  accept="image/svg+xml,image/png,image/jpeg,image/webp"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono uppercase font-bold text-neutral-300">
                    Brand Logo (Vector SVG / PNG / WebP) *
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isUploadingLogo}
                      onClick={() => logoFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-black hover:bg-[#E2B714] font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingLogo ? 'Uploading...' : 'Upload File'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaPickerOpen(true)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Media Library</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateVectorLogo}
                      className="px-3 py-1.5 bg-[#E2B714]/20 hover:bg-[#E2B714]/30 text-[#E2B714] font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                      title="Auto-generate a geometric SVG vector logo based on the brand name"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Generate Vector</span>
                    </button>
                  </div>
                </div>

                {/* Live Logo Preview Box */}
                <div className="p-4 bg-[#07080D] border border-white/5 flex flex-col items-center justify-center space-y-2">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                    Logo Preview
                  </span>
                  <BrandLogoBadge
                    name={formData.name || 'Sample Brand'}
                    logoUrl={formData.logoUrl}
                    size="md"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-neutral-400 uppercase text-[10px]">
                    Or Paste Direct SVG / Image Path:
                  </label>
                  <input
                    type="text"
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="/uploads/logo.svg or data:image/svg+xml..."
                    className="w-full bg-white/5 border border-white/10 px-3 py-1.5 text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-neutral-400 uppercase">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kinetix Global Technology"
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-neutral-400 uppercase">Industry Sector</label>
                  <input
                    type="text"
                    value={formData.industry || ''}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g. Enterprise Technology & AI"
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-neutral-400 uppercase">Commission Year</label>
                  <input
                    type="text"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-neutral-400 uppercase">Linked Portfolio Project</label>
                  <select
                    value={formData.projectSlug || ''}
                    onChange={(e) => setFormData({ ...formData, projectSlug: e.target.value })}
                    className="w-full bg-[#151722] border border-white/10 px-3 py-2 text-white font-mono"
                  >
                    <option value="">No linked project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.slug}>
                        {p.title} ({p.client})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scope of Work */}
              <div className="space-y-1">
                <label className="font-mono text-neutral-400 uppercase">
                  Scope of Work (Comma separated)
                </label>
                <input
                  type="text"
                  value={scopeInput}
                  onChange={(e) => setScopeInput(e.target.value)}
                  placeholder="3D Spatial Design, Interactive Booth Architecture, LED Visuals"
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
                />
              </div>

              {/* Overview */}
              <div className="space-y-1">
                <label className="font-mono text-neutral-400 uppercase">
                  Collaboration Overview & Narrative
                </label>
                <textarea
                  rows={3}
                  value={formData.overview || ''}
                  onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                  placeholder="Summary of objectives, creative execution, and strategic impact..."
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
                />
              </div>

              {/* Commercial Results */}
              <div className="space-y-1">
                <label className="font-mono text-neutral-400 uppercase">
                  Commercial Impact / Results Metric
                </label>
                <input
                  type="text"
                  value={formData.results || ''}
                  onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                  placeholder="e.g. 18,500+ visitors hosted & 3.4x average dwell time"
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
                />
              </div>

              {/* Testimonial */}
              <div className="p-3 bg-white/[0.02] border border-white/10 space-y-3">
                <span className="font-mono uppercase font-bold text-neutral-300 block text-[11px]">
                  Client Testimonial (Optional)
                </span>
                <div className="space-y-1">
                  <label className="font-mono text-neutral-400 uppercase text-[10px]">Quote</label>
                  <textarea
                    rows={2}
                    value={formData.testimonial?.quote || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        testimonial: {
                          author: formData.testimonial?.author || '',
                          role: formData.testimonial?.role || '',
                          quote: e.target.value,
                        },
                      })
                    }
                    placeholder="Direct quote from the client..."
                    className="w-full bg-white/5 border border-white/10 px-3 py-1.5 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Author name"
                    value={formData.testimonial?.author || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        testimonial: {
                          quote: formData.testimonial?.quote || '',
                          role: formData.testimonial?.role || '',
                          author: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 px-3 py-1.5 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Role / Title"
                    value={formData.testimonial?.role || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        testimonial: {
                          quote: formData.testimonial?.quote || '',
                          author: formData.testimonial?.author || '',
                          role: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] cursor-pointer"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => setFormData((prev) => ({ ...prev, logoUrl: url }))}
        title="Select or Upload Client Brand Logo"
      />
    </div>
  );
};
