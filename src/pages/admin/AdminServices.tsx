import React, { useState } from 'react';
import {
  Edit2,
  Check,
  X,
  Plus,
  Trash2,
  Search,
  Sparkles,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { api } from '../../services/api';
import { ServiceItem } from '../../types';

interface DisciplineTemplate {
  name: string;
  tagline: string;
  description: string;
  deliverables: string[];
  tools: string[];
}

const DISCIPLINE_TEMPLATES: DisciplineTemplate[] = [
  {
    name: 'UI/UX & Digital Products',
    tagline: 'High-Fidelity Interfaces, Design Systems & Tactile Interaction Prototyping',
    description:
      'We design seamless, intuitive digital platforms and SaaS interfaces with obsessive attention to typographic rhythm, micro-interactions, responsive states, and systematic component libraries that scale effortlessly.',
    deliverables: [
      'Multi-Platform Design Systems & UI Kits',
      'Interactive Figma Micro-Prototypes',
      'Responsive Web & Mobile Application UX',
      'User Journey Mapping & Information Architecture',
      'Design Tokens & Developer Hand-off Specs',
      'Usability Audits & Heuristic Evaluations',
    ],
    tools: ['Figma', 'Storybook', 'Framer', 'Principle', 'Linear'],
  },
  {
    name: 'Brand Identity & Strategy',
    tagline: 'Defensible Visual Identity, Typographic Systems & Comprehensive Brand Architecture',
    description:
      'We craft enduring visual identities that anchor modern market leaders. From foundational strategy and responsive logo marks to expansive brand manuals and packaging suites, every visual touchpoint conveys purpose.',
    deliverables: [
      'Comprehensive Brand Identity Systems',
      'Custom Logomarks, Monograms & Glyphs',
      'Brand Architecture & Messaging Guidelines',
      'Luxury Packaging & Structural Unboxing',
      'Print Collateral & Specialty Finish Specs',
      'Comprehensive Digital Asset Kits',
    ],
    tools: ['Adobe Illustrator', 'Adobe InDesign', 'Figma', 'Glyphs', 'Photoshop'],
  },
  {
    name: '3D Spatial & Architecture',
    tagline: 'Immersive Exhibition Pavilions, Experiential Booths & Photoreal CGI Architecture',
    description:
      'We conceptualize and detail three-dimensional spatial environments that merge avant-garde architectural form with sensory brand presence. Designed with fabrication-ready specs for international expos, flagship boutiques, and pop-up activations.',
    deliverables: [
      '3D Architectural Exhibition Pavilions',
      'Bespoke Experiential Retail Interiors',
      'Ultra-Realistic Photoreal CGI Renderings',
      'CAD Fabrication & Structural Blueprints',
      'Illumination & Material Specifications',
      'Interactive 3D Virtual Walkthroughs',
    ],
    tools: ['Blender', 'Cinema 4D', 'Unreal Engine 5', 'Octane Render', 'AutoCAD'],
  },
  {
    name: 'AI Visual Synthesis & Art Direction',
    tagline: 'Computational Generative Art, Bespoke Visual Models & Hybrid Creative Pipelines',
    description:
      'We harness state-of-the-art computational generative workflows to produce boundary-pushing visual concepting, bespoke brand dataset fine-tuning, and high-resolution surreal art that accelerates creative production tenfold.',
    deliverables: [
      'Custom Generative Art Direction',
      'Brand-Aligned AI Visual Pipelines & LoRA Models',
      'Surreal Campaign Concept Prototyping',
      'High-Resolution Upscaled Matte Assets',
      'Prompt Architecture & Workflow Documentation',
    ],
    tools: ['Midjourney', 'ComfyUI', 'Stable Diffusion', 'Magnific AI', 'RunPod'],
  },
  {
    name: 'Content Strategy & Editorial Voice',
    tagline: 'Authoritative Brand Voice, Editorial Storytelling & Multi-Channel Narrative Design',
    description:
      'Words shaped with the same precision as visual marks. We establish distinctive tone-of-voice frameworks, long-form editorial essays, thought-leadership journals, and copy systems that communicate authority and cultural relevance.',
    deliverables: [
      'Brand Tone of Voice & Lexicon Guidelines',
      'Editorial Monograph & Publication Copy',
      'C-Suite Thought Leadership Articles',
      'Product Messaging Architecture & Taglines',
      'Multi-Touchpoint Copywriting Systems',
    ],
    tools: ['Notion', 'Figma', 'Grammarly Pro', 'Google Workspace'],
  },
  {
    name: 'Creative Direction & Advisory',
    tagline: 'High-Level Aesthetic Governance, Cultural Positioning & Creative Oversight',
    description:
      'Senior creative leadership embedded into executive workflows. We steward ambitious brands through identity pivots, global campaign launches, and multidisciplinary creative vendor alignment to ensure unwavering aesthetic integrity.',
    deliverables: [
      'Quarterly Creative Governance & Advisory',
      'Brand Positioning & Cultural Audits',
      'Campaign Theme & Mood Architecture',
      'Multidisciplinary Vendor Direction',
      'Keynote Presentation Strategy',
    ],
    tools: ['Keynote', 'Miro', 'Milanote', 'Figma'],
  },
];

interface AdminServicesProps {
  defaultOpenCreate?: boolean;
}

export const AdminServices: React.FC<AdminServicesProps> = ({ defaultOpenCreate = false }) => {
  const { services, refreshData, showToast } = useStudio();
  const [isModalOpen, setIsModalOpen] = useState(defaultOpenCreate);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Form State
  const [formData, setFormData] = useState<Partial<ServiceItem>>({
    code: '',
    title: '',
    tagline: '',
    description: '',
    deliverables: [],
    tools: [],
    order: 1,
    published: true,
  });

  const [newDeliverable, setNewDeliverable] = useState('');
  const [newTool, setNewTool] = useState('');

  // Auto-calculate next code formatted as 2 digits
  const getNextCode = () => {
    const nextNum = services.length + 1;
    return nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
  };

  const getNextOrder = () => {
    if (services.length === 0) return 1;
    return Math.max(...services.map((s) => s.order || 0)) + 1;
  };

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      code: getNextCode(),
      title: '',
      tagline: '',
      description: '',
      deliverables: [],
      tools: [],
      order: getNextOrder(),
      published: true,
    });
    setNewDeliverable('');
    setNewTool('');
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    if (defaultOpenCreate) {
      handleOpenCreate();
    }
  }, [defaultOpenCreate]);

  const handleOpenEdit = (service: ServiceItem) => {
    setEditingService(service);
    setFormData({
      code: service.code,
      title: service.title,
      tagline: service.tagline,
      description: service.description,
      deliverables: [...(service.deliverables || [])],
      tools: [...(service.tools || [])],
      order: service.order ?? 1,
      published: service.published ?? true,
    });
    setNewDeliverable('');
    setNewTool('');
    setIsModalOpen(true);
  };

  const handleApplyTemplate = (tmpl: DisciplineTemplate) => {
    setFormData((prev) => ({
      ...prev,
      title: tmpl.name,
      tagline: tmpl.tagline,
      description: tmpl.description,
      deliverables: [...tmpl.deliverables],
      tools: [...tmpl.tools],
    }));
    showToast(`Template applied: ${tmpl.name}`);
  };

  const handleAddDeliverable = () => {
    const val = newDeliverable.trim();
    if (!val) return;
    if (formData.deliverables?.includes(val)) {
      showToast('Item already exists in deliverables', 'info');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      deliverables: [...(prev.deliverables || []), val],
    }));
    setNewDeliverable('');
  };

  const handleRemoveDeliverable = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: (prev.deliverables || []).filter((_, i) => i !== idx),
    }));
  };

  const handleAddTool = () => {
    const val = newTool.trim();
    if (!val) return;
    if (formData.tools?.includes(val)) {
      showToast('Tool already added', 'info');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      tools: [...(prev.tools || []), val],
    }));
    setNewTool('');
  };

  const handleRemoveTool = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      tools: (prev.tools || []).filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      showToast('Please enter a service or discipline title', 'error');
      return;
    }

    if (!formData.tagline?.trim()) {
      showToast('Please provide a short tagline / subhead', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<ServiceItem> = {
        code: formData.code?.trim() || getNextCode(),
        title: formData.title.trim(),
        tagline: formData.tagline.trim(),
        description: formData.description?.trim() || '',
        deliverables: formData.deliverables || [],
        tools: formData.tools || [],
        order: Number(formData.order) || 1,
        published: formData.published ?? true,
      };

      if (editingService) {
        await api.updateService(editingService.id, payload);
        showToast(`Discipline "${payload.title}" updated successfully`);
      } else {
        await api.createService(payload);
        showToast(`Discipline "${payload.title}" created successfully`);
      }

      setIsModalOpen(false);
      setEditingService(null);
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error saving service discipline', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await api.deleteService(id);
      showToast(`Discipline "${title}" removed`);
      setDeleteConfirmId(null);
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error deleting service', 'error');
    }
  };

  // Filtered services
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.deliverables.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.tools.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'published'
        ? s.published !== false
        : s.published === false;

    return matchesSearch && matchesStatus;
  });

  const publishedCount = services.filter((s) => s.published !== false).length;
  const draftCount = services.filter((s) => s.published === false).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono uppercase text-[#E2B714]">
            Capabilities Architecture
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Manage Studio Disciplines & Services ({services.length})
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Create, edit, and curate studio disciplines, deliverable checklists, and software toolsets.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0C0E16] p-3 border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search disciplines, deliverables, or software tools..."
            className="w-full bg-white/5 border border-white/10 pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E2B714]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-[11px] font-mono uppercase transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-black font-semibold'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            All ({services.length})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 text-[11px] font-mono uppercase transition-colors cursor-pointer ${
              statusFilter === 'published'
                ? 'bg-[#E2B714] text-black font-semibold'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            Published ({publishedCount})
          </button>
          {draftCount > 0 && (
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 text-[11px] font-mono uppercase transition-colors cursor-pointer ${
                statusFilter === 'draft'
                  ? 'bg-neutral-300 text-black font-semibold'
                  : 'bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              Drafts ({draftCount})
            </button>
          )}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="p-12 text-center bg-[#0C0E16] border border-white/10 space-y-4">
          <Layers className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="font-display text-lg font-bold text-white">No services found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {searchQuery
              ? `No disciplines matched "${searchQuery}". Try modifying your search.`
              : 'No disciplines exist under this filter. Click "+ Add Service" to add a new discipline.'}
          </p>
          <button
            onClick={searchQuery ? () => setSearchQuery('') : handleOpenCreate}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
          >
            {searchQuery ? 'Clear Filter' : '+ Add Service'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((service) => {
            const isDeleting = deleteConfirmId === service.id;

            return (
              <div
                key={service.id}
                className="p-6 bg-[#0C0E16] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  {/* Top Meta Line */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[#E2B714] font-bold bg-[#E2B714]/10 px-2 py-0.5 border border-[#E2B714]/20">
                        {service.code}. DISCIPLINE
                      </span>
                      {service.published === false ? (
                        <span className="text-[10px] text-neutral-400 bg-white/5 px-2 py-0.5 flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          <span>Draft</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>Live</span>
                        </span>
                      )}
                    </div>
                    <span className="text-neutral-500">
                      Order #{service.order ?? 1}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="font-display text-xl font-bold text-white tracking-tight">
                      {service.title}
                    </h3>
                    <p className="text-xs text-[#E2B714]/90 font-medium mt-0.5">
                      {service.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Deliverables Preview */}
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                      <span>Deliverables ({service.deliverables?.length || 0})</span>
                    </div>
                    <ul className="space-y-1">
                      {service.deliverables?.slice(0, 3).map((d, i) => (
                        <li key={i} className="text-xs text-neutral-300 flex items-start gap-1.5">
                          <span className="text-[#E2B714] shrink-0 font-bold">•</span>
                          <span className="line-clamp-1">{d}</span>
                        </li>
                      ))}
                      {(service.deliverables?.length || 0) > 3 && (
                        <li className="text-[11px] font-mono text-neutral-500">
                          +{(service.deliverables?.length || 0) - 3} more deliverables
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Software Stack Tools */}
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-mono text-neutral-500 block mb-1">
                      Software / Tools ({service.tools?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {service.tools?.map((t, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-2 py-0.5 bg-white/5 border border-white/10 text-neutral-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  {isDeleting ? (
                    <div className="w-full flex items-center justify-between p-2 bg-red-950/40 border border-red-800 text-xs text-red-200">
                      <span>Delete {service.title}?</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(service.id, service.title)}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setDeleteConfirmId(service.id)}
                        className="p-2 text-neutral-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                        title="Delete discipline"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(service)}
                        className="px-4 py-2 bg-white/10 hover:bg-[#E2B714] hover:text-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Service Details</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0E1018] border border-white/10 w-full max-w-3xl max-h-[92vh] flex flex-col my-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#12141F]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#E2B714]/10 border border-[#E2B714]/30 flex items-center justify-center text-[#E2B714]">
                  {editingService ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="font-display font-bold text-white text-base">
                    {editingService
                      ? `Edit Discipline: ${editingService.title}`
                      : 'Add New Studio Discipline / Service'}
                  </h2>
                  <p className="text-[11px] font-mono text-neutral-400">
                    {editingService
                      ? 'Update public discipline copy, client deliverables, and software stack.'
                      : 'Create a new core capability for Durman Nasar Studio portfolio and brief inquiry form.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Inspiration Templates (Only shown when adding a new service) */}
            {!editingService && (
              <div className="px-6 py-3 bg-[#0A0C13] border-b border-white/10 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#E2B714]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="uppercase">Quick Inspiration Starter Templates:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DISCIPLINE_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="px-2.5 py-1 text-[11px] bg-white/5 hover:bg-[#E2B714]/20 hover:text-[#E2B714] border border-white/10 text-neutral-300 transition-colors cursor-pointer"
                    >
                      + {tmpl.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto">
              {/* Row 1: Code, Title, Order */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-mono text-neutral-400 uppercase">
                    Code <span className="text-[#E2B714]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. 09"
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white font-mono text-center focus:outline-none focus:border-[#E2B714]"
                  />
                </div>

                <div className="sm:col-span-8 space-y-1">
                  <label className="font-mono text-neutral-400 uppercase">
                    Service / Discipline Title <span className="text-[#E2B714]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. UI/UX & Digital Products, Brand Identity & Strategy..."
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white font-medium focus:outline-none focus:border-[#E2B714]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-mono text-neutral-400 uppercase">Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order ?? 1}
                    onChange={(e) =>
                      setFormData({ ...formData, order: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white font-mono text-center focus:outline-none focus:border-[#E2B714]"
                  />
                </div>
              </div>

              {/* Tagline / Subhead */}
              <div className="space-y-1">
                <label className="font-mono text-neutral-400 uppercase">
                  Tagline / Subhead <span className="text-[#E2B714]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Scalable identity systems, motion choreography & tactile packaging"
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-mono text-neutral-400 uppercase">
                  Discipline Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain the studio's methodology, craft philosophy, and client transformation for this discipline..."
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white leading-relaxed focus:outline-none focus:border-[#E2B714]"
                />
              </div>

              {/* Deliverables Manager */}
              <div className="space-y-2 p-4 bg-black/40 border border-white/5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-neutral-300 uppercase flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E2B714]" />
                    <span>Client Deliverables Checklist ({formData.deliverables?.length || 0})</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDeliverable();
                      }
                    }}
                    placeholder="Type deliverable item (e.g. Multi-Format 4K Video Deliveries) and press Add..."
                    className="flex-1 bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                  />
                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    className="px-4 py-2 bg-white/10 hover:bg-[#E2B714] hover:text-black text-white font-semibold transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {formData.deliverables && formData.deliverables.length > 0 ? (
                  <div className="space-y-1.5 pt-2 max-h-48 overflow-y-auto pr-1">
                    {formData.deliverables.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-white/[0.03] border border-white/5 text-neutral-200"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-[#E2B714] font-bold text-xs">•</span>
                          <span>{d}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDeliverable(i)}
                          className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-500 italic pt-1 font-mono">
                    No deliverables added yet. Add items above or pick a starter template.
                  </p>
                )}
              </div>

              {/* Software / Tools Stack */}
              <div className="space-y-2 p-4 bg-black/40 border border-white/5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-neutral-300 uppercase flex items-center gap-1.5 font-semibold">
                    <Wrench className="w-3.5 h-3.5 text-[#E2B714]" />
                    <span>Software & Production Tools ({formData.tools?.length || 0})</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTool();
                      }
                    }}
                    placeholder="Type tool name (e.g. Cinema 4D, DaVinci Resolve, Figma) and press Add..."
                    className="flex-1 bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTool}
                    className="px-4 py-2 bg-white/10 hover:bg-[#E2B714] hover:text-black text-white font-semibold transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {formData.tools && formData.tools.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {formData.tools.map((t, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 text-neutral-200 text-xs flex items-center gap-1.5"
                      >
                        <span className="font-mono">{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTool(i)}
                          className="text-neutral-500 hover:text-red-400 cursor-pointer ml-1"
                          title="Remove tool"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-500 italic pt-1 font-mono">
                    No tools added yet. Add software stack above.
                  </p>
                )}
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/10">
                <input
                  type="checkbox"
                  id="publishedToggle"
                  checked={formData.published ?? true}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 accent-[#E2B714] cursor-pointer"
                />
                <label
                  htmlFor="publishedToggle"
                  className="text-xs text-neutral-300 cursor-pointer flex flex-col"
                >
                  <span className="font-semibold text-white">Publish to Public Portfolio</span>
                  <span className="text-[11px] text-neutral-400">
                    When active, this discipline appears on the Services page, Homepage capabilities, and the Contact brief intake dropdown.
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : editingService ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Update Discipline</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Discipline</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
