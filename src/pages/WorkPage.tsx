import React, { useState, useMemo } from 'react';
import { Search, ArrowUpRight, Grid, List, Sliders, Maximize2, Layers } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { Project, ProjectCategory } from '../types';
import { trackEvent, trackProjectView } from '../utils/analytics';
import { ProtectedImage } from '../components/ProtectedImage';

interface WorkPageProps {
  onNavigate: (path: string) => void;
  initialCategory?: string;
}

const CATEGORIES: ('All' | ProjectCategory)[] = [
  'All',
  'Graphic Design',
  'Motion Graphics',
  'Social Media',
  'Digital Marketing',
  'Video Editing',
  'Photography',
  'Videography',
  '3D Exhibition Booth',
];

export const WorkPage: React.FC<WorkPageProps> = ({ onNavigate, initialCategory }) => {
  const { projects, activeCategory, setActiveCategory, openLightbox } = useStudio();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || activeCategory || 'All'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setActiveCategory(cat);
    trackEvent('portfolio_view', { category: cat });
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (project.status === 'draft') return false;
      const matchesCategory =
        selectedCategory === 'All' || project.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        project.title.toLowerCase().includes(q) ||
        project.client.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.services.some((s) => s.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [projects, selectedCategory, searchQuery]);

  const handleProjectClick = (slug: string, category: string, client: string) => {
    trackProjectView(slug, category, client);
    onNavigate(`/work/${slug}`);
  };

  const handleImageSlideClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    const images = Array.from(
      new Set([project.coverImage, ...(project.galleryImages || [])])
    ).filter(Boolean);

    openLightbox(
      images,
      project.title,
      0,
      project.slug,
      `${project.category} · ${images.length} Image Slide Gallery`,
      project.client,
      project.year
    );
  };

  return (
    <div className="pt-28 pb-24 px-6 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl border-b border-white/10 pb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
          Studio Archive
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          Selected Works & Commissions
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          An editorial archive of commercial brand identities, kinetic broadcast motion, spatial exhibition architecture, and high-performance digital campaigns. Click any project image to open the fullscreen slide viewer.
        </p>
      </div>

      {/* Filter Bar & Controls */}
      <div className="space-y-6">
        {/* Category Buttons / Segmented Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search & View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by project, client, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0C0E14] border border-white/10 pl-9 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E2B714]"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-neutral-400">
            <span className="font-mono">
              Showing {filteredProjects.length} of {projects.length} Works
            </span>
            <div className="flex items-center gap-1 border border-white/10 p-0.5 bg-[#0C0E14]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-neutral-500 hover:text-white'
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white/15 text-white' : 'text-neutral-500 hover:text-white'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <div className="py-24 text-center space-y-4 border border-white/10 bg-[#0C0E14]">
          <p className="text-neutral-400 text-sm">
            No projects found matching &ldquo;{searchQuery || selectedCategory}&rdquo;
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => {
            const imageCount = (project.galleryImages?.length || 0) + 1;
            return (
              <div
                key={project.id}
                className="group flex flex-col bg-[#0B0C12] border border-white/10 hover:border-[#E2B714] transition-all duration-300"
              >
                {/* Visual Image Container with Pop-up Slider Trigger */}
                <div
                  className="aspect-[4/3] relative overflow-hidden bg-neutral-900 cursor-pointer"
                  onClick={(e) => handleImageSlideClick(e, project)}
                  title="Click to open slideable image viewer"
                >
                  <ProtectedImage
                    src={project.webOptimizedImage || project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    containerClassName="w-full h-full"
                    customWatermark={
                      project.protectionMode === 'custom' && project.customProtection
                        ? {
                            enabled: project.customProtection.enableWatermark,
                            text: project.customProtection.watermarkText,
                          }
                        : undefined
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-70 group-hover:opacity-40 transition-opacity pointer-events-none" />

                  {/* Category & Year Tag */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#E2B714] bg-black/75 px-2 py-0.5 backdrop-blur-sm">
                      {project.category}
                    </span>
                    {imageCount > 1 && (
                      <span className="font-mono text-[10px] text-white/90 bg-white/20 px-2 py-0.5 backdrop-blur-sm flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#E2B714]" />
                        <span>{imageCount} Slides</span>
                      </span>
                    )}
                  </div>

                  {/* Centered Hover Slide Prompt */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <span className="px-4 py-2 bg-black/85 text-white border border-[#E2B714] text-xs font-mono tracking-wider uppercase flex items-center gap-2 shadow-2xl backdrop-blur-md">
                      <Maximize2 className="w-3.5 h-3.5 text-[#E2B714]" />
                      <span>Slide Images</span>
                    </span>
                  </div>

                  {/* Corner indicator */}
                  <div className="absolute bottom-3 right-3 p-2 bg-black/80 text-[#E2B714] border border-white/10 group-hover:bg-[#E2B714] group-hover:text-black transition-colors">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                      <span>{project.client}</span>
                      <span>{project.year}</span>
                    </div>
                    <button
                      onClick={() => handleProjectClick(project.slug, project.category, project.client)}
                      className="text-left font-display text-xl font-bold text-white hover:text-[#E2B714] transition-colors leading-snug cursor-pointer block"
                    >
                      {project.title}
                    </button>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={(e) => handleImageSlideClick(e, project)}
                      className="text-xs font-mono text-[#E2B714] hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Slide Images ({imageCount})</span>
                    </button>

                    <button
                      onClick={() => handleProjectClick(project.slug, project.category, project.client)}
                      className="text-xs font-semibold uppercase tracking-wider text-white hover:text-[#E2B714] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Case Study</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List / Editorial Index Layout */
        <div className="divide-y divide-white/10 border-y border-white/10 bg-[#0A0B10]">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="py-5 px-6 hover:bg-white/[0.03] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4">
                {/* Thumbnail image clickable for slide pop-up */}
                <div
                  onClick={(e) => handleImageSlideClick(e, project)}
                  className="w-16 h-12 bg-neutral-900 border border-white/10 overflow-hidden shrink-0 cursor-pointer relative group/thumb"
                  title="Click to view slide gallery"
                >
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                    <Maximize2 className="w-3 h-3 text-[#E2B714]" />
                  </div>
                </div>

                <div className="space-y-1 max-w-xl">
                  <span className="text-[11px] uppercase tracking-wider text-[#E2B714] font-mono block">
                    {project.category}
                  </span>
                  <button
                    onClick={() => handleProjectClick(project.slug, project.category, project.client)}
                    className="text-left font-display text-lg sm:text-xl font-bold text-white hover:text-[#E2B714] transition-colors cursor-pointer"
                  >
                    {project.title}
                  </button>
                  <span className="text-xs text-neutral-400 block font-mono">
                    Client: {project.client} · {project.year}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-xs font-mono text-neutral-400">
                <button
                  onClick={(e) => handleImageSlideClick(e, project)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white border border-white/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3 text-[#E2B714]" />
                  <span>Slide Images</span>
                </button>

                <button
                  onClick={() => handleProjectClick(project.slug, project.category, project.client)}
                  className="p-2 border border-white/10 group-hover:border-[#E2B714] group-hover:bg-[#E2B714] group-hover:text-black transition-all cursor-pointer"
                  title="View Case Study"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

