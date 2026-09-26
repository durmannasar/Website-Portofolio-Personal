import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  Eye,
  EyeOff,
  Star,
  Clock,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  Tag,
  Share2,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { api } from '../../services/api';
import { EditorialInsight } from '../../types';
import { MediaPickerModal } from '../../components/MediaPickerModal';

interface InsightTemplate {
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  tags: string[];
  content: string;
}

const INSIGHT_TEMPLATES: InsightTemplate[] = [
  {
    title: 'The Architecture of Sensation: Why Spatial 3D Pavilions Outlive Ephemeral Feeds',
    category: 'Spatial 3D & Architecture',
    excerpt: 'In an attention economy dominated by fleeting micro-content, physical and sensory spatial architecture remains the definitive brand anchor for visionary market leaders.',
    readTime: '6 min read',
    tags: ['Spatial Design', '3D Architecture', 'Brand Experience', 'Exhibition Design'],
    content: `In the contemporary creative landscape, visual impressions are consumed and discarded at sub-second intervals. Brands wage ferocious bidding wars for three-second impressions on glass smartphone screens, only to be forgotten with the flick of a thumb.

Yet, when a human being walks into a bespoke three-dimensional spatial pavilion—where lighting conditions are precisely choreographed, materials carry tangible acoustic density, and sculptural volumes command physical presence—the neurological response changes entirely.

### 1. The Principle of Volumetric Presence
A screen displays an image; a spatial pavilion envelopes an observer. Volumetric brand presence operates on somatic memory. When designing pavilions such as the Synapse 3D Exhibition Pavilion, our studio does not approach the structure merely as a display booth. We treat it as an autonomous architectural micro-world.

The compression and expansion of space, the interplay between matte brutalist concrete finishes and warm indirect lighting, and the controlled acoustic dampening immediately recalibrate the visitor’s pulse.

> "A screen displays an image; a spatial pavilion envelopes an observer. Volumetric presence operates on somatic memory, transforming casual observers into invested inhabitants."

### 2. Physicality as the Ultimate Scarcity
Digital assets can be reproduced infinitely at zero marginal cost. Physical craftsmanship, by contrast, possesses unassailable scarcity. When a corporate client invests in custom fabricated double-curved timber fins, micro-textured acoustic membranes, and millimeter-precise structural joints, the subconscious signal to enterprise partners is unambiguous: this organization builds for permanence.`,
  },
  {
    title: 'Kinetic Restraint: Choreographing Motion Graphics Without Visual Noise',
    category: 'Motion & Animation',
    excerpt: 'Motion design is frequently mistaken for ceaseless movement. The most authoritative visual identities command prestige through strategic pauses, calculated mass, and typographic physics.',
    readTime: '5 min read',
    tags: ['Motion Graphics', 'Kinetic Typography', 'Creative Direction'],
    content: `The modern digital landscape is overrun with frenetic animation. Logos flip, rotate, explode, and reconstruct themselves in endless gymnastics. Yet, when every element on a screen screams for attention at maximum velocity, the collective result is not dynamism—it is visual white noise.

At Durman Nasar Studio, our kinetic philosophy centers on a deceptively simple discipline: kinetic restraint.

### 1. Establishing Gravitational Mass in Type
Static typography communicates through proportion, kerning, and baseline rhythm. Kinetic typography introduces physics: mass, friction, inertia, and momentum.

When an authoritative editorial headline enters a frame, its deceleration curve determines its prestige. The subtle cubic-bezier easing curve communicates more about brand prestige than the literal words themselves.

> "If every element on the screen screams for attention at maximum velocity, the result is not dynamism—it is visual white noise. Prestige lives in the deliberate pause."`,
  },
  {
    title: 'Directing the Machine: Generative AI as an Optical Co-Pilot in Creative Direction',
    category: 'AI & Computational Synthesis',
    excerpt: 'Artificial intelligence cannot substitute discernment. How our studio treats computational synthesis as a high-speed lens for rapid world-building and avant-garde concepting.',
    readTime: '7 min read',
    tags: ['Generative AI', 'Creative Direction', 'Concept Prototyping'],
    content: `A machine can generate ten thousand surreal variations of a glass building suspended above a volcanic plateau in under two minutes. What the machine cannot do—and will never do—is determine which of those ten thousand iterations possesses genuine emotional resonance, cultural relevance, and strategic defensibility for a client.

Taste is not algorithmic. Taste is an accumulation of historical memory, visceral intuition, philosophical stance, and human empathy. Generative models produce raw optical material; the creative director curates, refines, discards, and synthesizes that material into a coherent vision.

> "A machine can generate ten thousand images in minutes. What it cannot do is determine which single frame possesses emotional resonance and strategic defensibility."`,
  },
];

export const AdminInsights: React.FC = () => {
  const { insights, refreshData, showToast } = useStudio();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsight, setEditingInsight] = useState<EditorialInsight | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form State
  const [formData, setFormData] = useState<Partial<EditorialInsight>>({
    title: '',
    slug: '',
    category: 'Spatial 3D & Architecture',
    excerpt: '',
    content: '',
    author: {
      name: 'Durman Nasar',
      role: 'Creative Director & Founder',
    },
    coverImage: '/src/assets/images/hero_studio_showcase_1790391271997.jpg',
    readTime: '5 min read',
    publishedAt: new Date().toISOString().split('T')[0],
    tags: [],
    isFeatured: false,
    status: 'published',
    order: 1,
  });

  const [tagInput, setTagInput] = useState('');

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleOpenCreate = () => {
    setEditingInsight(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Spatial 3D & Architecture',
      excerpt: '',
      content: '',
      author: {
        name: 'Durman Nasar',
        role: 'Creative Director & Founder',
      },
      coverImage: '/src/assets/images/hero_studio_showcase_1790391271997.jpg',
      readTime: '5 min read',
      publishedAt: new Date().toISOString().split('T')[0],
      tags: ['Creative Direction', 'Design Theory'],
      isFeatured: false,
      status: 'published',
      order: (insights.length || 0) + 1,
    });
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EditorialInsight) => {
    setEditingInsight(item);
    setFormData({
      ...item,
      publishedAt: item.publishedAt ? item.publishedAt.split('T')[0] : new Date().toISOString().split('T')[0],
      tags: [...(item.tags || [])],
    });
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleApplyTemplate = (tmpl: InsightTemplate) => {
    setFormData((prev) => ({
      ...prev,
      title: tmpl.title,
      slug: generateSlug(tmpl.title),
      category: tmpl.category,
      excerpt: tmpl.excerpt,
      readTime: tmpl.readTime,
      tags: [...tmpl.tags],
      content: tmpl.content,
    }));
    showToast(`Template applied: ${tmpl.title.substring(0, 30)}...`);
  };

  const handleAddTag = () => {
    const val = tagInput.trim();
    if (!val) return;
    if (formData.tags?.includes(val)) {
      showToast('Tag already added', 'info');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), val],
    }));
    setTagInput('');
  };

  const handleRemoveTag = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      showToast('Please enter an editorial title', 'error');
      return;
    }

    if (!formData.excerpt?.trim()) {
      showToast('Please provide an excerpt summary', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<EditorialInsight> = {
        title: formData.title.trim(),
        slug: formData.slug?.trim() || generateSlug(formData.title),
        category: formData.category?.trim() || 'Creative Theory',
        excerpt: formData.excerpt.trim(),
        content: formData.content?.trim() || '',
        author: {
          name: formData.author?.name?.trim() || 'Durman Nasar',
          role: formData.author?.role?.trim() || 'Creative Director & Founder',
        },
        coverImage: formData.coverImage || '/src/assets/images/hero_studio_showcase_1790391271997.jpg',
        readTime: formData.readTime?.trim() || '5 min read',
        publishedAt: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : new Date().toISOString(),
        tags: formData.tags || [],
        isFeatured: formData.isFeatured ?? false,
        status: formData.status || 'published',
        order: Number(formData.order) || 1,
      };

      if (editingInsight) {
        await api.updateInsight(editingInsight.id, payload);
        showToast(`Editorial essay "${payload.title}" updated`);
      } else {
        await api.createInsight(payload);
        showToast(`Editorial essay "${payload.title}" published`);
      }

      setIsModalOpen(false);
      setEditingInsight(null);
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error saving editorial insight', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await api.deleteInsight(id);
      showToast(`Editorial essay "${title}" deleted`);
      setDeleteConfirmId(null);
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error deleting essay', 'error');
    }
  };

  // Distinct categories for filter
  const categories = Array.from(new Set(insights.map((i) => i.category))).filter(Boolean);

  // Filtered insights
  const filteredInsights = insights.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : item.status === statusFilter;

    const matchesCategory =
      categoryFilter === 'all' ? true : item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const publishedCount = insights.filter((i) => i.status === 'published').length;
  const draftCount = insights.filter((i) => i.status === 'draft').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono uppercase text-[#E2B714]">
            Studio Thought Leadership & Journal
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Editorial Insights ({insights.length})
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Publish essays, creative theory, spatial architecture discourse, and industry perspectives.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Editorial Insight</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#0C0E16] p-3 border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search essays, topics, categories, or keywords..."
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white/5 border border-white/10 text-white text-xs px-3 py-1.5 font-mono focus:outline-none focus:border-[#E2B714]"
          >
            <option value="all">All Disciplines ({insights.length})</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-[11px] font-mono uppercase transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              All ({insights.length})
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
      </div>

      {/* Insights Grid */}
      {filteredInsights.length === 0 ? (
        <div className="p-12 text-center bg-[#0C0E16] border border-white/10 space-y-4">
          <BookOpen className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="font-display text-lg font-bold text-white">No editorial essays found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {searchQuery
              ? `No articles matched "${searchQuery}". Try modifying your filter or search terms.`
              : 'No editorial essays in this category. Click "+ Add Editorial Insight" to publish a new essay.'}
          </p>
          <button
            onClick={searchQuery ? () => setSearchQuery('') : handleOpenCreate}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
          >
            {searchQuery ? 'Clear Filter' : '+ Add Editorial Insight'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInsights.map((item) => {
            const isDeleting = deleteConfirmId === item.id;

            return (
              <div
                key={item.id}
                className="bg-[#0C0E16] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Cover Image & Badges */}
                <div className="aspect-[16/9] w-full bg-neutral-900 relative overflow-hidden">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-black/80 text-[#E2B714] border border-[#E2B714]/30 backdrop-blur-sm">
                      {item.category}
                    </span>
                    {item.isFeatured && (
                      <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#E2B714] text-black font-bold flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    {item.status === 'published' ? (
                      <span className="px-2 py-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 flex items-center gap-1 backdrop-blur-sm">
                        <Eye className="w-3 h-3" />
                        <span>Live</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-mono text-neutral-400 bg-black/80 border border-white/20 flex items-center gap-1 backdrop-blur-sm">
                        <EyeOff className="w-3 h-3" />
                        <span>Draft</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-neutral-300">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#E2B714]" />
                      <span>{item.readTime}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>
                        {item.publishedAt
                          ? new Date(item.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Draft'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-display text-lg font-bold text-white tracking-tight line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                      {item.excerpt}
                    </p>

                    {/* Author & Tags */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono border-t border-white/5">
                      <span className="text-neutral-300">
                        By {item.author?.name || 'Durman Nasar'}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.tags?.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-white/5 text-neutral-400 text-[10px]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                    {isDeleting ? (
                      <div className="w-full flex items-center justify-between p-2 bg-red-950/40 border border-red-800 text-xs text-red-200">
                        <span>Delete essay?</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
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
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-2 text-neutral-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                          title="Delete essay"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-4 py-2 bg-white/10 hover:bg-[#E2B714] hover:text-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Essay</span>
                        </button>
                      </>
                    )}
                  </div>
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
                  {editingInsight ? <Edit2 className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="font-display font-bold text-white text-base">
                    {editingInsight
                      ? `Edit Editorial: ${editingInsight.title.substring(0, 40)}...`
                      : 'Publish New Editorial Insight'}
                  </h2>
                  <p className="text-[11px] font-mono text-neutral-400">
                    Authoritative essays, methodology deep-dives, and design theory for Durman Nasar Studio.
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

            {/* Quick Inspiration Starter Templates */}
            {!editingInsight && (
              <div className="px-6 py-3 bg-[#0A0C13] border-b border-white/10 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#E2B714]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="uppercase">Quick Thought Leadership Starters:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {INSIGHT_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="px-2.5 py-1 text-[11px] bg-white/5 hover:bg-[#E2B714]/20 hover:text-[#E2B714] border border-white/10 text-neutral-300 transition-colors cursor-pointer"
                    >
                      + {tmpl.category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto">
              {/* Row 1: Title */}
              <div className="space-y-1">
                <label className="font-mono text-neutral-400 uppercase">
                  Essay Title <span className="text-[#E2B714]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setFormData({
                      ...formData,
                      title: newTitle,
                      slug: formData.slug || generateSlug(newTitle),
                    });
                  }}
                  placeholder="e.g. The Architecture of Sensation: Why Spatial 3D Pavilions Outlive Ephemeral Feeds"
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white font-medium focus:outline-none focus:border-[#E2B714]"
                />
              </div>

              {/* Row 2: Category, Slug, Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-neutral-400 uppercase">
                    Discipline / Category <span className="text-[#E2B714]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Spatial 3D & Architecture"
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-neutral-400 uppercase">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-slug"
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white font-mono focus:outline-none focus:border-[#E2B714]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-neutral-400 uppercase">Reading Time</label>
                  <input
                    type="text"
                    value={formData.readTime || ''}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="e.g. 5 min read"
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white font-mono focus:outline-none focus:border-[#E2B714]"
                  />
                </div>
              </div>

              {/* Row 3: Author Name & Role, Published Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-neutral-400 uppercase">Author Name</label>
                  <input
                    type="text"
                    value={formData.author?.name || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        author: {
                          name: e.target.value,
                          role: formData.author?.role || 'Creative Director & Founder',
                        },
                      })
                    }
                    placeholder="Durman Nasar"
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-neutral-400 uppercase">Author Role</label>
                  <input
                    type="text"
                    value={formData.author?.role || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        author: {
                          name: formData.author?.name || 'Durman Nasar',
                          role: e.target.value,
                        },
                      })
                    }
                    placeholder="Creative Director & Founder"
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-neutral-400 uppercase">Publication Date</label>
                  <input
                    type="date"
                    value={formData.publishedAt ? formData.publishedAt.split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white font-mono focus:outline-none focus:border-[#E2B714]"
                  />
                </div>
              </div>

              {/* Cover Image Selector */}
              <div className="space-y-1">
                <label className="font-mono text-neutral-400 uppercase">
                  Cover Image Asset <span className="text-[#E2B714]">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={formData.coverImage || ''}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="/src/assets/images/... or https://..."
                    className="flex-1 bg-white/5 border border-white/10 px-3 py-2 text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="px-4 py-2 bg-white/10 hover:bg-[#E2B714] hover:text-black text-white font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Select Media</span>
                  </button>
                </div>
                {formData.coverImage && (
                  <div className="mt-2 h-24 w-40 bg-neutral-900 border border-white/10 overflow-hidden relative">
                    <img
                      src={formData.coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div className="space-y-1">
                <label className="font-mono text-neutral-400 uppercase">
                  Excerpt / Subtitle Summary <span className="text-[#E2B714]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="A concise 2-sentence distillation of the essay's core thesis and creative conclusion..."
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white leading-relaxed focus:outline-none focus:border-[#E2B714]"
                />
              </div>

              {/* Full Article Content */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-neutral-400 uppercase font-semibold">
                    Full Editorial Article Content (Markdown Supported)
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    Use ### for Subheadings, &gt; for Pull Quotes
                  </span>
                </div>
                <textarea
                  rows={10}
                  required
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the full essay body. Supports markdown headers, paragraphs, and blockquotes..."
                  className="w-full bg-black/50 border border-white/10 p-3.5 text-white font-sans text-xs leading-relaxed focus:outline-none focus:border-[#E2B714]"
                />
              </div>

              {/* Tags Manager */}
              <div className="space-y-2 p-3 bg-black/40 border border-white/5">
                <label className="font-mono text-neutral-300 uppercase flex items-center gap-1.5 font-semibold">
                  <Tag className="w-3.5 h-3.5 text-[#E2B714]" />
                  <span>Topic Tags ({formData.tags?.length || 0})</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Type tag (e.g. Spatial Design, Typography) and press Add..."
                    className="flex-1 bg-white/5 border border-white/10 px-3 py-1.5 text-white focus:outline-none focus:border-[#E2B714]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-white/10 hover:bg-[#E2B714] hover:text-black text-white font-semibold transition-colors cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.tags?.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white/5 border border-white/10 text-neutral-300 text-xs flex items-center gap-1"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(i)}
                        className="text-neutral-500 hover:text-red-400 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Toggles: Featured & Published */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured ?? false}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-[#E2B714] mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-white block">Pin to Featured Showcase</span>
                    <span className="text-[11px] text-neutral-400">
                      Displays prominently in the Homepage Editorial Insights section.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status === 'published'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.checked ? 'published' : 'draft',
                      })
                    }
                    className="w-4 h-4 accent-[#E2B714] mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-white block">Publish Live to Journal</span>
                    <span className="text-[11px] text-neutral-400">
                      When disabled, this essay remains a private draft visible only in CMS.
                    </span>
                  </div>
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
                  className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 font-bold"
                >
                  {isSubmitting ? (
                    <span>Publishing...</span>
                  ) : editingInsight ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Update Essay</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Publish Editorial Insight</span>
                    </>
                  )}
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
        onSelect={(imageUrl) => {
          setFormData((prev) => ({ ...prev, coverImage: imageUrl }));
          setMediaPickerOpen(false);
          showToast('Selected image as essay cover');
        }}
      />
    </div>
  );
};
