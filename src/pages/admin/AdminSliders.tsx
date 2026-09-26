import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Upload, Sliders, ArrowUp, ArrowDown } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { api } from '../../services/api';
import { HeroSlide } from '../../types';
import { MediaPickerModal } from '../../components/MediaPickerModal';

export const AdminSliders: React.FC = () => {
  const { sliders, refreshData, showToast } = useStudio();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<HeroSlide>>({
    headline: '',
    subheadline: '',
    ctaText: 'Explore Selected Work',
    ctaLink: '/work',
    desktopImage: '',
    categoryTag: 'Creative Discipline',
    order: sliders.length + 1,
    active: true,
  });

  const handleOpenCreate = () => {
    setEditingSlide(null);
    setFormData({
      headline: '',
      subheadline: '',
      ctaText: 'Explore Selected Work',
      ctaLink: '/work',
      desktopImage: sliders[0]?.desktopImage || '',
      categoryTag: 'Multidisciplinary Creative Studio',
      order: sliders.length + 1,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({ ...slide });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.headline || !formData.desktopImage) {
      showToast('Headline and Slide Image are required', 'error');
      return;
    }

    try {
      if (editingSlide) {
        await api.updateSlider(editingSlide.id, formData);
        showToast('Hero slide updated');
      } else {
        await api.createSlider(formData as Omit<HeroSlide, 'id'>);
        showToast('Hero slide created');
      }
      await refreshData();
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error saving slide', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSlider(id);
      showToast('Slide removed');
      setDeleteConfirmId(null);
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error deleting slide', 'error');
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await api.updateSlider(slide.id, { active: !slide.active });
      await refreshData();
      showToast(`Slide ${!slide.active ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update slide', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono uppercase text-[#E2B714]">
            Visual Showcase
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Homepage Hero Carousel ({sliders.length})
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Configure dynamic full-viewport slides, promotional headlines, and CTA links.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slide</span>
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sliders.map((slide, idx) => (
          <div
            key={slide.id}
            className="p-6 bg-[#0C0E16] border border-white/10 hover:border-white/20 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs text-neutral-400">
                <span className="text-[#E2B714] font-bold">SLIDE 0{idx + 1}</span>
                <button
                  onClick={() => handleToggleActive(slide)}
                  className={`px-2 py-0.5 text-[10px] uppercase font-bold cursor-pointer ${
                    slide.active
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  {slide.active ? 'ACTIVE' : 'DISABLED'}
                </button>
              </div>

              <div className="aspect-[16/9] w-full bg-neutral-900 border border-white/10 relative overflow-hidden">
                <img
                  src={slide.desktopImage}
                  alt={slide.headline}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 p-4 flex flex-col justify-end">
                  <span className="text-[10px] uppercase font-mono text-[#E2B714] drop-shadow">
                    {slide.categoryTag}
                  </span>
                  <p className="font-display font-bold text-white text-sm line-clamp-2 drop-shadow">
                    {slide.headline}
                  </p>
                </div>
              </div>

              <p className="text-xs text-neutral-400 line-clamp-2">
                {slide.subheadline}
              </p>

              <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-4">
                <span>CTA: {slide.ctaText}</span>
                <span>→ {slide.ctaLink}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(slide)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setDeleteConfirmId(slide.id)}
                className="px-3 py-1.5 bg-red-950/30 hover:bg-red-900/50 text-red-300 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-[#12141F] border border-red-500/40 p-6 max-w-md w-full space-y-4">
            <h3 className="font-display font-bold text-white text-lg">
              Delete Hero Slide?
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to delete this slide from the homepage carousel?
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
                Delete Slide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0E1018] border border-white/10 w-full max-w-2xl max-h-[92vh] flex flex-col my-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#12141F]">
              <h2 className="font-display font-bold text-white text-lg">
                {editingSlide ? 'Edit Hero Slide' : 'Add Hero Slide'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 text-xs overflow-y-auto">
              {/* Image Picker */}
              <div className="p-4 bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono uppercase font-bold text-neutral-300">
                    Slide Background Imagery *
                  </span>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="px-3 py-1.5 bg-white text-black hover:bg-[#E2B714] font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload or Pick Image</span>
                  </button>
                </div>
                {formData.desktopImage && (
                  <div className="aspect-[16/9] w-full bg-neutral-900 overflow-hidden border border-white/10">
                    <img
                      src={formData.desktopImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-neutral-400 uppercase">
                  Category Tag / Header kicker
                </label>
                <input
                  type="text"
                  value={formData.categoryTag || ''}
                  onChange={(e) => setFormData({ ...formData, categoryTag: e.target.value })}
                  placeholder="e.g. 3D Exhibition Architecture"
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-neutral-400 uppercase">
                  Hero Headline *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-neutral-400 uppercase">
                  Supporting Paragraph
                </label>
                <textarea
                  rows={3}
                  value={formData.subheadline}
                  onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#E2B714]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-neutral-400 uppercase">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-neutral-400 uppercase">
                    CTA Destination URL
                  </label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="slideActive"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 bg-[#151722] border-white/20 text-[#E2B714]"
                  />
                  <label htmlFor="slideActive" className="font-mono text-white cursor-pointer">
                    Enable in Hero Rotation
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Slide</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => setFormData((prev) => ({ ...prev, desktopImage: url }))}
        title="Select Slide Imagery"
      />
    </div>
  );
};
