import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Play, Maximize2 } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { Project } from '../types';
import { trackProjectView } from '../utils/analytics';
import { ProtectedImage } from '../components/ProtectedImage';

interface ProjectDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ slug, onNavigate }) => {
  const { projects, openLightbox } = useStudio();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const found = projects.find((p) => p.slug === slug || p.id === slug);
    if (found) {
      setProject(found);
      trackProjectView(found.slug, found.category, found.client);
      window.scrollTo(0, 0);
    }
  }, [slug, projects]);

  if (!project) {
    return (
      <div className="pt-36 pb-24 px-6 max-w-4xl mx-auto text-center space-y-6">
        <h1 className="font-display text-3xl font-bold text-white">Project Not Found</h1>
        <p className="text-neutral-400 text-sm">
          The requested project could not be located in the studio archive.
        </p>
        <button
          onClick={() => onNavigate('/work')}
          className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer"
        >
          Return to Portfolio
        </button>
      </div>
    );
  }

  // Find next project
  const currentIndex = projects.findIndex((p) => p.id === project.id);
  const nextProject =
    projects[(currentIndex + 1) % projects.length] || projects[0];

  // Related projects in same or complementary category
  const relatedProjects = projects
    .filter((p) => p.id !== project.id && (p.category === project.category || p.isFeatured))
    .slice(0, 2);

  return (
    <article className="pt-28 pb-24 px-6 max-w-7xl mx-auto space-y-16">
      {/* Back to Work Link */}
      <button
        onClick={() => onNavigate('/work')}
        className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Works</span>
      </button>

      {/* Hero Headline & Metadata Block */}
      <div className="space-y-8 border-b border-white/10 pb-12">
        <div className="space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
            {project.category}
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08] text-balance">
            {project.title}
          </h1>
          <p className="text-base sm:text-xl text-neutral-300 font-normal leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Project Metadata Columns (Unboxed metadata with tabular numbers) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-white/10 text-xs font-mono">
          <div>
            <span className="text-neutral-500 uppercase tracking-wider block mb-1">
              Client
            </span>
            <span className="text-white font-medium text-sm">{project.client}</span>
          </div>
          <div>
            <span className="text-neutral-500 uppercase tracking-wider block mb-1">
              Year
            </span>
            <span className="text-white font-medium text-sm tabular-nums">
              {project.year}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 uppercase tracking-wider block mb-1">
              Core Discipline
            </span>
            <span className="text-white font-medium text-sm">{project.category}</span>
          </div>
          <div>
            <span className="text-neutral-500 uppercase tracking-wider block mb-1">
              Commission Scope
            </span>
            <span className="text-white font-medium text-sm">
              {project.services.length} Specialized Deliverables
            </span>
          </div>
        </div>
      </div>

      {/* Hero Cover Image */}
      <div className="relative aspect-[16/9] w-full bg-neutral-900 border border-white/10 overflow-hidden group">
        <ProtectedImage
          src={project.webOptimizedImage || project.coverImage}
          alt={project.title}
          className="w-full h-full object-cover cursor-pointer"
          containerClassName="w-full h-full"
          customWatermark={
            project.protectionMode === 'custom' && project.customProtection
              ? {
                  enabled: project.customProtection.enableWatermark,
                  text: project.customProtection.watermarkText,
                }
              : undefined
          }
          onClick={() => {
            const allImages = Array.from(
              new Set([project.coverImage, ...(project.galleryImages || [])])
            ).filter(Boolean);
            openLightbox(
              allImages,
              project.title,
              0,
              project.slug,
              `${project.category} · Cover Image`,
              project.client,
              project.year
            );
          }}
        />
        <button
          onClick={() => {
            const allImages = Array.from(
              new Set([project.coverImage, ...(project.galleryImages || [])])
            ).filter(Boolean);
            openLightbox(
              allImages,
              project.title,
              0,
              project.slug,
              `${project.category} · Cover Image`,
              project.client,
              project.year
            );
          }}
          className="absolute bottom-6 right-6 p-3 bg-black/70 hover:bg-black text-white backdrop-blur-sm border border-white/20 transition-all cursor-pointer flex items-center gap-2 text-xs"
        >
          <Maximize2 className="w-4 h-4" />
          <span>Slide Gallery ({(project.galleryImages?.length || 0) + 1})</span>
        </button>
      </div>

      {/* Services List Tag unboxed */}
      <div className="py-4 border-y border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-neutral-400">
        <span className="text-neutral-500 uppercase">Services Delivered:</span>
        {project.services.map((service, idx) => (
          <span key={service} className="text-neutral-200">
            {service}
            {idx < project.services.length - 1 && (
              <span className="text-neutral-600 ml-6">·</span>
            )}
          </span>
        ))}
      </div>

      {/* Case Study Narrative: Challenge, Approach & Strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
        <div className="lg:col-span-4 space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
            Case Study Analysis
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Strategic Intent & Creative Rigor
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
            Every project undertaken by Durman Nasar Studio begins with strategic interrogation: clarifying positioning before rendering a single pixel or building a physical frame.
          </p>
        </div>

        <div className="lg:col-span-8 space-y-10">
          {/* The Challenge */}
          <div className="space-y-3 p-6 sm:p-8 bg-[#0C0E14] border border-white/10">
            <span className="text-xs font-mono uppercase text-[#E2B714]">
              01. The Strategic Challenge
            </span>
            <h3 className="font-display text-xl font-bold text-white">
              The Problem & Market Friction
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {project.challenge}
            </p>
          </div>

          {/* Creative Approach */}
          <div className="space-y-3 p-6 sm:p-8 bg-[#0C0E14] border border-white/10">
            <span className="text-xs font-mono uppercase text-[#E2B714]">
              02. The Creative Direction
            </span>
            <h3 className="font-display text-xl font-bold text-white">
              Concept Development & Aesthetic Discipline
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {project.approach}
            </p>
          </div>

          {/* Execution Strategy */}
          <div className="space-y-3 p-6 sm:p-8 bg-[#0C0E14] border border-white/10">
            <span className="text-xs font-mono uppercase text-[#E2B714]">
              03. Execution & Deployment
            </span>
            <h3 className="font-display text-xl font-bold text-white">
              Tactical Rollout & Implementation
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {project.strategy}
            </p>
          </div>
        </div>
      </div>

      {/* Video / Motion Showcase Section (if video available) */}
      {project.videoUrl && (
        <div className="space-y-6 pt-6">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
              Motion & Cinematography
            </span>
            <h2 className="font-display text-2xl font-bold text-white">
              Featured Film & Reel
            </h2>
          </div>
          <div className="aspect-video w-full bg-neutral-900 border border-white/15 overflow-hidden">
            <iframe
              src={project.videoUrl}
              title={`${project.title} Video Showcase`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Visual Gallery Showcase */}
      {project.galleryImages && project.galleryImages.length > 0 && (
        <div className="space-y-8 pt-6">
          <div className="space-y-2 border-b border-white/10 pb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
              Visual Documentation
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Project Gallery & Artifacts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {project.galleryImages.map((img, i) => (
              <div
                key={i}
                onClick={() => {
                  const allImages = Array.from(
                    new Set([project.coverImage, ...(project.galleryImages || [])])
                  ).filter(Boolean);
                  const startIndex = allImages.indexOf(img) !== -1 ? allImages.indexOf(img) : i + 1;
                  openLightbox(
                    allImages,
                    `${project.title} · Slide 0${startIndex + 1}`,
                    startIndex,
                    project.slug,
                    `${project.category} · Gallery Documentation`,
                    project.client,
                    project.year
                  );
                }}
                className="group relative aspect-[4/3] bg-neutral-900 border border-white/10 overflow-hidden cursor-pointer"
              >
                <ProtectedImage
                  src={img}
                  alt={`${project.title} documentation ${i + 1}`}
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
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-white flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>View Fullscreen</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Measurable Results & Impact (Quantitative Rigor) */}
      {project.results && project.results.length > 0 && (
        <div className="p-8 sm:p-12 bg-gradient-to-br from-[#0B0D13] to-[#121520] border border-white/15 space-y-8">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
              Measurable Outcomes
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Commercial Impact & Reception
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-4 border-t border-white/10">
            {project.results.map((res, i) => (
              <div key={i} className="space-y-2">
                <span className="font-display text-4xl sm:text-5xl font-extrabold text-[#E2B714] block tabular-nums">
                  {res.metric}
                </span>
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono block">
                  {res.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Project & Related Projects */}
      <div className="pt-12 border-t border-white/10 space-y-12">
        {/* Next Project Banner */}
        {nextProject && (
          <div
            onClick={() => onNavigate(`/work/${nextProject.slug}`)}
            className="p-8 sm:p-12 bg-[#0C0E14] border border-white/10 hover:border-[#E2B714] transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 group-hover:text-[#E2B714] transition-colors">
                Next Case Study →
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white group-hover:text-[#E2B714] transition-colors">
                {nextProject.title}
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                {nextProject.category} · {nextProject.client}
              </p>
            </div>
            <div className="p-3 border border-white/15 group-hover:bg-[#E2B714] group-hover:text-black group-hover:border-[#E2B714] transition-all shrink-0">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <div className="space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              More from the Studio
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedProjects.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onNavigate(`/work/${rel.slug}`)}
                  className="group cursor-pointer border border-white/10 hover:border-white/30 bg-[#0A0B10] p-6 space-y-4"
                >
                  <div className="aspect-video bg-neutral-900 overflow-hidden">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#E2B714] font-mono uppercase">
                      {rel.category}
                    </span>
                    <h4 className="font-display text-lg font-bold text-white group-hover:text-[#E2B714] transition-colors">
                      {rel.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
