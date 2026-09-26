import React, { useState, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Layers,
  Shield,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { api } from '../../services/api';
import { Project, ProjectCategory } from '../../types';
import { MediaPickerModal } from '../../components/MediaPickerModal';

const CATEGORIES: ProjectCategory[] = [
  'Graphic Design',
  'Motion Graphics',
  'Social Media',
  'Digital Marketing',
  'Video Editing',
  'Photography',
  'Videography',
  '3D Exhibition Booth',
];

export const AdminProjects: React.FC = () => {
  const { projects, refreshData, showToast, openLightbox } = useStudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Quick Add Image to a specific project from table
  const [quickAddProject, setQuickAddProject] = useState<Project | null>(null);
  const [isQuickUploading, setIsQuickUploading] = useState(false);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

  // Modal Gallery Multi-upload
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Media picker target state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'cover' | 'thumbnail' | 'gallery' | 'quick'>('cover');

  // Form state
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    slug: '',
    client: '',
    year: '2026',
    category: 'Graphic Design',
    services: [],
    description: '',
    challenge: '',
    approach: '',
    strategy: '',
    coverImage: '',
    thumbnail: '',
    galleryImages: [],
    videoUrl: '',
    results: [
      { metric: '+120%', label: 'Qualified Engagement' },
      { metric: '4.8x', label: 'Commercial ROI' },
    ],
    isFeatured: true,
    order: 1,
    status: 'published',
    seoTitle: '',
    metaDescription: '',
  });

  const [serviceInput, setServiceInput] = useState('');

  const filtered = projects.filter((p) => {
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesQ =
      !searchQuery ||
      p.title.toLowerCase().includes(q) ||
      p.client.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q);
    return matchesCat && matchesQ;
  });

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      slug: '',
      client: '',
      year: new Date().getFullYear().toString(),
      category: 'Graphic Design',
      services: ['Brand Identity', 'Art Direction'],
      description: '',
      challenge: '',
      approach: '',
      strategy: '',
      coverImage: projects[0]?.coverImage || '/src/assets/images/hero_studio_showcase_1790391271997.jpg',
      thumbnail: projects[0]?.coverImage || '/src/assets/images/hero_studio_showcase_1790391271997.jpg',
      galleryImages: [],
      videoUrl: '',
      results: [
        { metric: '+150%', label: 'Key Performance Metric' },
      ],
      isFeatured: false,
      order: projects.length + 1,
      status: 'published',
      seoTitle: '',
      metaDescription: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({ ...project });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.client?.trim()) {
      showToast('Title and Client are required', 'error');
      return;
    }

    const slug =
      formData.slug?.trim() ||
      formData
        .title!.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const payload = {
      ...formData,
      slug,
      coverImage: formData.coverImage || projects[0]?.coverImage || '',
      thumbnail: formData.thumbnail || formData.coverImage || '',
    };

    try {
      if (editingProject) {
        await api.updateProject(editingProject.id, payload);
        showToast('Project updated successfully');
      } else {
        await api.createProject(payload);
        showToast('Project created successfully');
      }
      await refreshData();
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error saving project', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProject(id);
      showToast('Project permanently deleted');
      setDeleteConfirmId(null);
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error deleting project', 'error');
    }
  };

  const handleToggleStatus = async (project: Project) => {
    const nextStatus = project.status === 'published' ? 'draft' : 'published';
    try {
      await api.updateProject(project.id, { status: nextStatus });
      await refreshData();
      showToast(`Project moved to ${nextStatus}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Direct multi-image upload from device for gallery
  const handleDirectGalleryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingGallery(true);
    const uploadedUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await api.uploadMedia(file, file.name, file.name.replace(/\.[^/.]+$/, ''));
        uploadedUrls.push(res.url);
      }
      setFormData((prev) => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), ...uploadedUrls],
      }));
      showToast(`${uploadedUrls.length} image(s) added to project gallery`);
    } catch (err: any) {
      showToast(err.message || 'Failed to upload gallery images', 'error');
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  // Direct cover upload from device
  const handleDirectCoverUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const file = files[0];
      const res = await api.uploadMedia(file, file.name, file.name.replace(/\.[^/.]+$/, ''));
      setFormData((prev) => ({
        ...prev,
        coverImage: res.url,
        thumbnail: prev.thumbnail || res.url,
      }));
      showToast('Cover image updated');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload cover', 'error');
    } finally {
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  // Quick Add Image directly for a project from table
  const handleQuickAddFiles = async (files: FileList | null) => {
    if (!files || !quickAddProject || files.length === 0) return;
    setIsQuickUploading(true);
    const newUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await api.uploadMedia(file, file.name, file.name.replace(/\.[^/.]+$/, ''));
        newUrls.push(res.url);
      }
      const updatedGallery = [...(quickAddProject.galleryImages || []), ...newUrls];
      await api.updateProject(quickAddProject.id, { galleryImages: updatedGallery });
      await refreshData();
      showToast(`${newUrls.length} image(s) added to ${quickAddProject.title}`);
      setQuickAddProject(null);
    } catch (err: any) {
      showToast(err.message || 'Quick upload failed', 'error');
    } finally {
      setIsQuickUploading(false);
      if (quickFileInputRef.current) quickFileInputRef.current.value = '';
    }
  };

  const handleMediaSelect = async (url: string) => {
    if (mediaPickerTarget === 'cover') {
      setFormData((prev) => ({
        ...prev,
        coverImage: url,
        thumbnail: prev.thumbnail || url,
      }));
    } else if (mediaPickerTarget === 'thumbnail') {
      setFormData((prev) => ({ ...prev, thumbnail: url }));
    } else if (mediaPickerTarget === 'gallery') {
      setFormData((prev) => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), url],
      }));
      showToast('Image added to gallery');
    } else if (mediaPickerTarget === 'quick' && quickAddProject) {
      const updatedGallery = [...(quickAddProject.galleryImages || []), url];
      await api.updateProject(quickAddProject.id, { galleryImages: updatedGallery });
      await refreshData();
      showToast(`Image added to ${quickAddProject.title}`);
      setQuickAddProject(null);
    }
  };

  const handleMoveGalleryImage = (idx: number, direction: 'left' | 'right') => {
    const list = [...(formData.galleryImages || [])];
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    setFormData((prev) => ({ ...prev, galleryImages: list }));
  };

  const handleSetAsCover = (imgUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      coverImage: imgUrl,
      thumbnail: imgUrl,
    }));
    showToast('Image set as primary project cover');
  };

  const handleAddService = () => {
    if (!serviceInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      services: [...(prev.services || []), serviceInput.trim()],
    }));
    setServiceInput('');
  };

  const handleRemoveService = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      services: (prev.services || []).filter((_, i) => i !== idx),
    }));
  };

  const handleAddResult = () => {
    setFormData((prev) => ({
      ...prev,
      results: [...(prev.results || []), { metric: '+100%', label: 'Metric Description' }],
    }));
  };

  const handleRemoveResult = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      results: (prev.results || []).filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono uppercase text-[#E2B714]">
            Portfolio Management
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Case Studies & Projects ({projects.length})
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage multi-slide galleries, cover imagery, case study narratives, and measurable impact metrics.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search projects by title, client, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0C0E16] border border-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E2B714]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-3 py-1.5 text-xs font-medium cursor-pointer ${
              categoryFilter === 'All'
                ? 'bg-white text-black'
                : 'text-neutral-400 bg-white/5 hover:text-white'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-white text-black'
                  : 'text-neutral-400 bg-white/5 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div className="border border-white/10 bg-[#0C0E16] overflow-x-auto">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="bg-[#12141F] text-neutral-400 font-mono uppercase tracking-wider border-b border-white/10">
            <tr>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Gallery Slides</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-500">
                  No projects match your filter.
                </td>
              </tr>
            ) : (
              filtered.map((proj) => {
                const totalSlides = (proj.galleryImages?.length || 0) + 1;
                return (
                  <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={proj.coverImage}
                          alt={proj.title}
                          className="w-12 h-9 object-cover border border-white/10 shrink-0 cursor-pointer"
                          onClick={() => {
                            const all = Array.from(new Set([proj.coverImage, ...(proj.galleryImages || [])])).filter(Boolean);
                            openLightbox(all, proj.title, 0, proj.slug, proj.category, proj.client, proj.year);
                          }}
                          title="Click to preview slide gallery"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-sans font-bold text-white block text-sm">
                            {proj.title}
                          </span>
                          <span className="text-[11px] text-neutral-500 font-mono">
                            /work/{proj.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#E2B714]">{proj.category}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-neutral-300 tabular-nums">
                        {totalSlides} {totalSlides === 1 ? 'image' : 'images'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-200">{proj.client}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(proj)}
                        className={`px-2 py-0.5 text-[10px] uppercase font-bold cursor-pointer ${
                          proj.status === 'published'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                        }`}
                        title="Click to toggle status"
                      >
                        {proj.status}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Add Image Button */}
                        <button
                          onClick={() => setQuickAddProject(proj)}
                          className="px-2.5 py-1 text-[11px] font-mono text-[#E2B714] bg-[#E2B714]/10 hover:bg-[#E2B714] hover:text-black border border-[#E2B714]/30 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Add images directly to this project gallery"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Image</span>
                        </button>

                        <a
                          href={`/work/${proj.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5"
                          title="Preview Public Case Study"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleOpenEdit(proj)}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 cursor-pointer"
                          title="Edit Full Case Study"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(proj.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-950/30 cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Add Image Modal for a Project */}
      {quickAddProject && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="bg-[#0E1018] border border-white/15 p-6 max-w-lg w-full space-y-5 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#E2B714]">
                  Add Images to Gallery
                </span>
                <h3 className="font-display font-bold text-white text-base">
                  {quickAddProject.title}
                </h3>
              </div>
              <button
                onClick={() => setQuickAddProject(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-neutral-300 text-xs leading-relaxed">
              Upload new images from your device or select existing files from your Media Library to add to this project’s slide gallery.
            </p>

            <input
              type="file"
              ref={quickFileInputRef}
              multiple
              onChange={(e) => handleQuickAddFiles(e.target.files)}
              accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
              className="hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isQuickUploading}
                onClick={() => quickFileInputRef.current?.click()}
                className="p-4 bg-white/5 hover:bg-[#E2B714] hover:text-black border border-white/15 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer group"
              >
                {isQuickUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#E2B714]" />
                ) : (
                  <Upload className="w-6 h-6 text-[#E2B714] group-hover:text-black" />
                )}
                <span className="font-bold text-xs uppercase tracking-wider">
                  {isQuickUploading ? 'Uploading...' : 'Upload From Device'}
                </span>
                <span className="text-[10px] text-neutral-400 group-hover:text-black/80 font-mono">
                  Select 1 or more images
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMediaPickerTarget('quick');
                  setMediaPickerOpen(true);
                }}
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/15 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <ImageIcon className="w-6 h-6 text-neutral-300" />
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  Pick from Media Library
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Browse uploaded assets
                </span>
              </button>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[11px] font-mono text-neutral-500">
              <span>Current slides: {(quickAddProject.galleryImages?.length || 0) + 1}</span>
              <button
                onClick={() => setQuickAddProject(null)}
                className="text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-[#12141F] border border-red-500/40 p-6 max-w-md w-full space-y-4">
            <h3 className="font-display font-bold text-white text-lg">
              Confirm Permanent Deletion
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to permanently delete this project? This will remove the case study and its references from the live portfolio.
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
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Project Full Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0E1018] border border-white/10 w-full max-w-4xl max-h-[92vh] flex flex-col my-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#12141F]">
              <h2 className="font-display font-bold text-white text-lg">
                {editingProject ? 'Edit Project Case Study' : 'Create New Project'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs">
              {/* Row 1: Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-neutral-400 uppercase">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-neutral-400 uppercase">
                    Slug / URL Path
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    placeholder="e.g. aura-luxury-editorial-identity"
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                  />
                </div>
              </div>

              {/* Row 2: Client, Year, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-neutral-400 uppercase">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-neutral-400 uppercase">Year</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-neutral-400 uppercase">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ProjectCategory })
                    }
                    className="w-full bg-[#151722] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* COVER IMAGE SECTION */}
              <div className="p-5 bg-white/[0.02] border border-white/10 space-y-4">
                <input
                  type="file"
                  ref={coverFileInputRef}
                  onChange={(e) => handleDirectCoverUpload(e.target.files)}
                  accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-mono uppercase font-bold text-white text-xs block">
                      Primary Cover Image *
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Shown on portfolio cards and case study hero header.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-[#E2B714] text-black font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:bg-white transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload from Device</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPickerTarget('cover');
                        setMediaPickerOpen(true);
                      }}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Pick from Library</span>
                    </button>
                  </div>
                </div>

                {formData.coverImage && (
                  <div className="flex items-center gap-4 p-3 bg-black/40 border border-white/5">
                    <img
                      src={formData.coverImage}
                      alt="Cover Preview"
                      className="w-28 h-18 object-cover border border-white/15"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1 font-mono text-[11px] truncate flex-1">
                      <span className="text-white block truncate">{formData.coverImage}</span>
                      <span className="text-[#E2B714]">Primary Cover Asset</span>
                    </div>
                  </div>
                )}
              </div>

              {/* GALLERY IMAGES SECTION WITH ADD IMAGE FEATURE */}
              <div className="p-5 bg-white/[0.02] border border-white/10 space-y-4">
                <input
                  type="file"
                  ref={galleryFileInputRef}
                  multiple
                  onChange={(e) => handleDirectGalleryUpload(e.target.files)}
                  accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono uppercase font-bold text-white text-xs">
                        Slide Gallery Assets
                      </span>
                      <span className="px-2 py-0.5 bg-[#E2B714]/15 text-[#E2B714] font-mono text-[10px] font-bold">
                        {formData.galleryImages?.length || 0} Images
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-mono block mt-0.5">
                      Images will appear in the fullscreen slide viewer when users click the project.
                    </span>
                  </div>

                  {/* Add Image Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isUploadingGallery}
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-[#E2B714] text-black font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:bg-white transition-colors"
                    >
                      {isUploadingGallery ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Image from Device</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMediaPickerTarget('gallery');
                        setMediaPickerOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Select from Library</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const all = Array.from(new Set([formData.coverImage, ...(formData.galleryImages || [])])).filter(Boolean) as string[];
                        if (all.length > 0) {
                          openLightbox(all, formData.title || 'Project Preview', 0, formData.slug, formData.category, formData.client, formData.year);
                        } else {
                          showToast('Please add at least one image to preview', 'info');
                        }
                      }}
                      className="px-3.5 py-1.5 bg-[#E2B714]/15 hover:bg-[#E2B714]/25 text-[#E2B714] font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                      title="Test the fullscreen image slide pop-up for this project"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Slide Pop-Up</span>
                    </button>
                  </div>
                </div>

                {/* Drop Zone to Upload Images */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDirectGalleryUpload(e.dataTransfer.files);
                  }}
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="p-6 border-2 border-dashed border-white/15 hover:border-[#E2B714] bg-white/[0.01] hover:bg-white/[0.03] text-center cursor-pointer transition-colors space-y-1"
                >
                  <p className="text-xs font-semibold text-white">
                    Drag & drop images here or click &ldquo;+ Add Image from Device&rdquo; to add to gallery
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    Supports selecting multiple JPG, PNG, WebP files simultaneously
                  </p>
                </div>

                {/* Gallery Images Grid with Cover & Reorder Controls */}
                {formData.galleryImages && formData.galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                    {formData.galleryImages.map((img, idx) => {
                      const isCover = formData.coverImage === img;
                      return (
                        <div
                          key={idx}
                          className={`relative border p-2 bg-black/40 flex flex-col space-y-2 group ${
                            isCover ? 'border-[#E2B714]' : 'border-white/10'
                          }`}
                        >
                          <div className="aspect-video w-full bg-neutral-900 overflow-hidden relative">
                            <img
                              src={img}
                              alt={`Gallery slide ${idx + 1}`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {isCover && (
                              <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#E2B714] text-black text-[9px] font-mono font-bold flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-black" />
                                <span>Cover</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-white/5">
                            <span className="text-neutral-500">Slide {idx + 1}</span>

                            <div className="flex items-center gap-1">
                              {/* Reorder Left */}
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveGalleryImage(idx, 'left')}
                                  className="p-1 text-neutral-400 hover:text-white"
                                  title="Move Left"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                              )}
                              {/* Reorder Right */}
                              {idx < formData.galleryImages!.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveGalleryImage(idx, 'right')}
                                  className="p-1 text-neutral-400 hover:text-white"
                                  title="Move Right"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                              {/* Set as Cover */}
                              {!isCover && (
                                <button
                                  type="button"
                                  onClick={() => handleSetAsCover(img)}
                                  className="p-1 text-neutral-400 hover:text-[#E2B714]"
                                  title="Set as Cover Image"
                                >
                                  <Star className="w-3 h-3" />
                                </button>
                              )}
                              {/* Remove */}
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    galleryImages: formData.galleryImages?.filter((_, i) => i !== idx),
                                  })
                                }
                                className="p-1 text-neutral-500 hover:text-red-400"
                                title="Remove from Gallery"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Video URL */}
              <div className="space-y-1.5">
                <label className="font-mono text-neutral-400 uppercase">
                  Video Embed URL (YouTube embed or MP4, optional)
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/embed/..."
                  value={formData.videoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                />
              </div>

              {/* Services Tags */}
              <div className="space-y-2">
                <label className="font-mono text-neutral-400 uppercase">
                  Services Delivered
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 3D Architectural Modeling"
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 px-3 py-1.5 text-white focus:outline-none focus:border-[#E2B714]"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.services?.map((srv, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white/5 border border-white/10 text-neutral-200 flex items-center gap-1.5"
                    >
                      <span>{srv}</span>
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-400"
                        onClick={() => handleRemoveService(idx)}
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-mono text-neutral-400 uppercase">
                  Project Summary Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                />
              </div>

              {/* Case Study Details: Challenge, Approach, Strategy */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-neutral-400 uppercase">
                    The Challenge
                  </label>
                  <textarea
                    rows={4}
                    value={formData.challenge}
                    onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-neutral-400 uppercase">
                    Creative Approach
                  </label>
                  <textarea
                    rows={4}
                    value={formData.approach}
                    onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-neutral-400 uppercase">
                    Execution Strategy
                  </label>
                  <textarea
                    rows={4}
                    value={formData.strategy}
                    onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                  />
                </div>
              </div>

              {/* Measurable Results */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-neutral-400 uppercase">
                    Results & Impact Metrics
                  </label>
                  <button
                    type="button"
                    onClick={handleAddResult}
                    className="text-xs text-[#E2B714] hover:underline"
                  >
                    + Add Metric
                  </button>
                </div>
                {formData.results?.map((res, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="e.g. +185%"
                      value={res.metric}
                      onChange={(e) => {
                        const newRes = [...(formData.results || [])];
                        newRes[idx].metric = e.target.value;
                        setFormData({ ...formData, results: newRes });
                      }}
                      className="w-28 bg-white/5 border border-white/10 px-3 py-1.5 text-white focus:outline-none focus:border-[#E2B714]"
                    />
                    <input
                      type="text"
                      placeholder="Metric label e.g. Organic Impressions"
                      value={res.label}
                      onChange={(e) => {
                        const newRes = [...(formData.results || [])];
                        newRes[idx].label = e.target.value;
                        setFormData({ ...formData, results: newRes });
                      }}
                      className="flex-1 bg-white/5 border border-white/10 px-3 py-1.5 text-white focus:outline-none focus:border-[#E2B714]"
                    />
                    <X
                      className="w-4 h-4 text-neutral-500 hover:text-red-400 cursor-pointer"
                      onClick={() => handleRemoveResult(idx)}
                    />
                  </div>
                ))}
              </div>

              {/* Status and Featured toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
                <div className="space-y-1.5">
                  <label className="font-mono text-neutral-400 uppercase">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'published' | 'draft' })
                    }
                    className="w-full bg-[#151722] border border-white/10 px-3 py-2 text-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="h-4 w-4 bg-[#151722] border-white/20 text-[#E2B714]"
                  />
                  <label htmlFor="isFeatured" className="font-mono text-white cursor-pointer">
                    Feature on Homepage Showcase
                  </label>
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-neutral-400 uppercase">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.order || 1}
                    onChange={(e) =>
                      setFormData({ ...formData, order: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Per-Project Content & Asset Protection */}
              <div className="p-4 bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#E2B714]" />
                    <span className="font-mono uppercase font-bold text-neutral-300">
                      Content & Asset Protection
                    </span>
                  </div>
                  <select
                    value={formData.protectionMode || 'global'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        protectionMode: e.target.value as 'global' | 'custom',
                      })
                    }
                    className="bg-[#151722] border border-white/10 px-2.5 py-1 text-xs text-[#E2B714] font-mono cursor-pointer"
                  >
                    <option value="global">Use Global Studio Settings</option>
                    <option value="custom">Custom Project Protection</option>
                  </select>
                </div>

                {formData.protectionMode === 'custom' && (
                  <div className="p-3.5 bg-black/40 border border-white/5 space-y-3.5">
                    <span className="text-[11px] text-[#E2B714] font-mono block">
                      Custom Protection Overrides for "{formData.title || 'This Project'}":
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.customProtection?.protectImages ?? true}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customProtection: {
                                ...formData.customProtection,
                                protectImages: e.target.checked,
                              },
                            })
                          }
                          className="accent-[#E2B714]"
                        />
                        <span>Protect Images (Web Derivatives)</span>
                      </label>
                      <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.customProtection?.disableTextSelection ?? true}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customProtection: {
                                ...formData.customProtection,
                                disableTextSelection: e.target.checked,
                              },
                            })
                          }
                          className="accent-[#E2B714]"
                        />
                        <span>Disable Text Selection</span>
                      </label>
                      <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.customProtection?.enableWatermark ?? false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customProtection: {
                                ...formData.customProtection,
                                enableWatermark: e.target.checked,
                              },
                            })
                          }
                          className="accent-[#E2B714]"
                        />
                        <span>Enable Watermark</span>
                      </label>
                    </div>

                    {formData.customProtection?.enableWatermark && (
                      <div className="space-y-1 pt-1">
                        <label className="font-mono text-[10px] text-neutral-400 uppercase block">
                          Custom Project Watermark Stamp
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Durman Nasar Studio · Aura Confidential"
                          value={formData.customProtection?.watermarkText || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customProtection: {
                                ...formData.customProtection,
                                watermarkText: e.target.value,
                              },
                            })
                          }
                          className="w-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SEO Title and Meta Description */}
              <div className="p-4 bg-white/[0.02] border border-white/10 space-y-3">
                <span className="font-mono uppercase font-bold text-neutral-300 block">
                  SEO & Social Sharing Metadata
                </span>
                <div className="space-y-1.5">
                  <label className="font-mono text-neutral-400 uppercase">
                    Page Title Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aura Brand Identity – Durman Nasar Studio"
                    value={formData.seoTitle || ''}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-neutral-400 uppercase">
                    Meta Description
                  </label>
                  <input
                    type="text"
                    placeholder="Concise 140-160 character case study summary for search results"
                    value={formData.metaDescription || ''}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-[#0E1018] py-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProject ? 'Save Project Changes' : 'Publish Project'}</span>
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
        onSelect={handleMediaSelect}
      />
    </div>
  );
};
