import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowLeft, ArrowRight, Play, Sparkles, Layers, Eye, ShieldCheck } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { trackEvent, trackProjectView } from '../utils/analytics';
import { ClientDetailModal } from '../components/ClientDetailModal';
import { BrandLogoBadge } from '../components/BrandLogoBadge';
import { ProtectedImage } from '../components/ProtectedImage';
import { ClientItem } from '../types';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { sliders, projects, services, clients, settings, insights, openLightbox } = useStudio();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState<ClientItem | null>(null);

  // Active sliders
  const activeSlides = sliders.filter((s) => s.active);

  // Auto-advance hero carousel every 7s
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const currentSlide = activeSlides[currentSlideIndex] || activeSlides[0];

  const handleProjectClick = (slug: string, category: string, client: string) => {
    trackProjectView(slug, category, client);
    onNavigate(`/work/${slug}`);
  };

  const featuredProjects = projects.filter((p) => p.status === 'published' && p.isFeatured).slice(0, 6);
  if (featuredProjects.length === 0) {
    featuredProjects.push(...projects.slice(0, 4));
  }

  return (
    <div className="space-y-28 lg:space-y-36 pb-20">
      {/* 1. HERO SECTION (Dynamic Slider & Editorial Showcase) */}
      <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 px-6 overflow-hidden border-b border-white/10">
        {/* Background visual asset with gradient scrim */}
        <div className="absolute inset-0 z-0">
          {currentSlide?.desktopImage && (
            <img
              src={currentSlide.desktopImage}
              alt={currentSlide.headline}
              className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-[1.08] transition-all duration-1000 transform scale-100"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-[#090A0F]/60 to-transparent" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#090A0F]/40 to-[#090A0F]/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="max-w-4xl space-y-8">
            {/* Discipline Tag unboxed */}
            <div className="flex items-center gap-3 text-xs tracking-widest uppercase font-mono text-[#E2B714]">
              <span className="w-2 h-2 rounded-full bg-[#E2B714] animate-pulse" />
              <span>{currentSlide?.categoryTag || 'Multidisciplinary Creative Studio'}</span>
              <span className="text-neutral-500">·</span>
              <span className="text-neutral-300">Jakarta, ID</span>
            </div>

            {/* Massive Display Headline */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.06] text-balance">
              {currentSlide?.headline || 'Creative Ideas. Strategic Design. Meaningful Experiences.'}
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-xl text-neutral-300 max-w-2xl font-normal leading-relaxed">
              {currentSlide?.subheadline ||
                'Durman Nasar Studio is a multidisciplinary creative studio combining design, motion, digital marketing, photography, videography, and spatial experiences to help brands communicate with clarity and impact.'}
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => {
                  trackEvent('cta_click', { cta_label: 'Explore Selected Work', location: 'hero' });
                  onNavigate('/work');
                }}
                className="px-7 py-4 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-all duration-200 cursor-pointer flex items-center gap-2.5 shadow-lg whitespace-nowrap focus:outline-none"
              >
                <span>Explore Selected Work</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  trackEvent('cta_click', { cta_label: 'Start a Project', location: 'hero' });
                  onNavigate('/contact');
                }}
                className="px-7 py-4 text-xs font-semibold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-200 cursor-pointer flex items-center gap-2 whitespace-nowrap"
              >
                <span>Start a Project</span>
              </button>
            </div>
          </div>

          {/* Slider Pagination Controls & Editorial Indicators */}
          {activeSlides.length > 1 && (
            <div className="mt-16 pt-8 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-xs text-neutral-400">
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm text-white">
                  0{currentSlideIndex + 1}
                </span>
                <div className="flex gap-2">
                  {activeSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`h-1.5 transition-all cursor-pointer ${
                        idx === currentSlideIndex
                          ? 'w-10 bg-[#E2B714]'
                          : 'w-4 bg-white/30 hover:bg-white/60'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
                <span className="font-mono text-sm text-neutral-500">
                  0{activeSlides.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentSlideIndex((prev) =>
                      prev === 0 ? activeSlides.length - 1 : prev - 1
                    )
                  }
                  className="p-3 border border-white/20 hover:border-white/50 text-white transition-colors cursor-pointer"
                  aria-label="Previous slide"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length)
                  }
                  className="p-3 border border-white/20 hover:border-white/50 text-white transition-colors cursor-pointer"
                  aria-label="Next slide"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. STATS & STUDIO REPUTATION (Claim-to-Proof Adjacency) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-white/10">
          <div>
            <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white block tabular-nums">
              09+
            </span>
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono mt-1 block">
              Years Creative Practice
            </span>
          </div>
          <div>
            <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white block tabular-nums">
              140+
            </span>
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono mt-1 block">
              Delivered Commissions
            </span>
          </div>
          <div>
            <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#E2B714] block tabular-nums">
              {services.length < 10 ? `0${services.length}` : services.length}
            </span>
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono mt-1 block">
              Integrated Disciplines
            </span>
          </div>
          <div>
            <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white block tabular-nums">
              100%
            </span>
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono mt-1 block">
              Direct Senior Execution
            </span>
          </div>
        </div>
      </section>

      {/* 3. SELECTED WORK (Editorial Bento Grid) */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
              Portfolio Showcase
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Selected Works & Case Studies
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/work')}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-[#E2B714] transition-colors cursor-pointer"
          >
            <span>View All Projects ({projects.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project, index) => {
            const isLarge = index === 0 || index === 3;
            return (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project.slug, project.category, project.client)}
                className={`group cursor-pointer flex flex-col bg-[#0C0E14] border border-white/10 hover:border-[#E2B714]/80 transition-all duration-300 ${
                  isLarge ? 'md:col-span-2' : 'col-span-1'
                }`}
              >
                {/* Visual Asset Container */}
                <div
                  className={`relative overflow-hidden bg-neutral-900 ${
                    isLarge ? 'aspect-[16/9]' : 'aspect-[4/3]'
                  }`}
                >
                  <ProtectedImage
                    src={project.webOptimizedImage || project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />

                  {/* Top Category Badge unboxed */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 text-xs text-white/90 drop-shadow">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#E2B714] bg-black/60 px-2 py-0.5 backdrop-blur-sm">
                      {project.category}
                    </span>
                    <span className="font-mono text-neutral-400 text-xs">
                      {project.year}
                    </span>
                  </div>

                  {/* Hover icon */}
                  <div className="absolute bottom-4 right-4 p-3 bg-white text-black opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs text-neutral-400 font-mono">
                      {project.client}
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white group-hover:text-[#E2B714] transition-colors leading-tight">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Results highlight unboxed */}
                  {project.results && project.results[0] && (
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-400">{project.results[0].label}</span>
                      <span className="text-[#E2B714] font-bold tabular-nums">
                        {project.results[0].metric}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. EXPERTISE & DISCIPLINES (8 Core Capabilities) */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="space-y-3 border-b border-white/10 pb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
            Studio Capabilities
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Integrated Multidisciplinary Practice
          </h2>
          <p className="text-neutral-400 text-sm max-w-2xl">
            We eliminate the friction between separate creative agencies by uniting brand strategy, motion, film, digital growth, and architectural spatial design under one roof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => onNavigate(`/services`)}
              className="p-6 bg-[#0B0D13] border border-white/10 hover:border-[#E2B714] transition-all duration-300 group cursor-pointer flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-neutral-500 font-mono text-xs">
                  <span>{service.code}.</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:text-[#E2B714] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h3 className="font-display text-lg font-bold text-white group-hover:text-[#E2B714] transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {service.tagline}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <span className="text-[11px] font-mono text-neutral-500 block mb-1">
                  Primary Output
                </span>
                <span className="text-xs text-neutral-300">
                  {service.deliverables[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ABOUT PREVIEW (Philosophy & Leadership) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-[#0C0E14] border border-white/10 p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
                The Studio Ethos
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                Design that commands respect. Strategy that converts curiosity into conviction.
              </h2>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                Durman Nasar Studio operates at the intersection of high-concept visual identity, kinetic motion, and spatial craftsmanship. We partner directly with founders, marketing directors, and property developers who reject cookie-cutter solutions in pursuit of enduring prestige.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/about')}
                  className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>More About the Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] bg-neutral-900 border border-white/15 overflow-hidden">
                <img
                  src="/src/assets/images/hero_studio_showcase_1790391271997.jpg"
                  alt="Durman Nasar Studio creative space"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-[#090A0F] border border-white/15 p-4 text-xs font-mono">
                <span className="text-[#E2B714] block font-bold">Durman Nasar</span>
                <span className="text-neutral-400">Creative Director & Founder</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CLIENTS MARQUEE / WALL WITH BRAND LOGOS */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
            Trusted By Industry Leaders
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Selected Brands & Collaborators
          </h2>
          <p className="text-xs text-neutral-400 font-mono">
            Click any client logo to view partnership scope and outcomes.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              onClick={() => setSelectedBrand(client)}
              className="p-6 sm:p-8 bg-[#0B0D13] border border-white/10 hover:border-[#E2B714] transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer group relative min-h-[130px]"
              title={`Click to view ${client.name} partnership details and case study`}
            >
              <BrandLogoBadge name={client.name} logoUrl={client.logoUrl} size="md" />

              {/* Hover inspect badge */}
              <div className="absolute bottom-2.5 right-2.5 text-[10px] font-mono text-neutral-500 group-hover:text-[#E2B714] transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <span>View Details</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Detail Interactive Modal */}
      <ClientDetailModal
        client={selectedBrand}
        onClose={() => setSelectedBrand(null)}
        onNavigateToProject={(slug) => onNavigate(`/work/${slug}`)}
      />

      {/* 7. EDITORIAL INSIGHTS & PERSPECTIVES */}
      {insights && insights.filter((i) => i.status === 'published').length > 0 && (
        <section className="max-w-7xl mx-auto px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
                Thought Leadership & Journal
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Editorial Insights
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
                Essays on volumetric spatial architecture, kinetic choreography, and typographic permanence.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/insights')}
              className="text-xs font-mono uppercase text-[#E2B714] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <span>Explore All Perspectives</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {insights
              .filter((i) => i.status === 'published')
              .slice(0, 3)
              .map((item) => (
                <article
                  key={item.id}
                  onClick={() => onNavigate(`/insights/${item.slug}`)}
                  className="group bg-[#0B0D13] border border-white/10 hover:border-[#E2B714] transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  <div className="aspect-[16/10] w-full bg-neutral-900 relative overflow-hidden">
                    <ProtectedImage
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      containerClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                    <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-mono uppercase bg-black/80 text-[#E2B714] border border-[#E2B714]/30">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                        <span>{item.readTime}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {new Date(item.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-white group-hover:text-[#E2B714] transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-neutral-400 font-mono text-[11px]">
                        By {item.author?.name || 'Durman Nasar'}
                      </span>
                      <span className="text-[#E2B714] font-semibold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        </section>
      )}

      {/* 8. BOTTOM ENGAGEMENT BANNER */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-neutral-900 to-[#12141C] border border-white/10 p-10 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <span className="text-xs font-mono text-[#E2B714] uppercase tracking-wider">
              Start a Conversation
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Ready to elevate your brand presence?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
              We take on a curated number of client commissions per quarter to maintain exceptional craft standards and senior attention.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/contact')}
            className="px-8 py-4 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer shrink-0"
          >
            Start a Project Inquiry
          </button>
        </div>
      </section>
    </div>
  );
};
