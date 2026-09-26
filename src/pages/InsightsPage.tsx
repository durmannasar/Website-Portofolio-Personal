import React, { useState } from 'react';
import { ArrowUpRight, Clock, Calendar, BookOpen, Search, ArrowRight } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { EditorialInsight } from '../types';

interface InsightsPageProps {
  onNavigate: (path: string) => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ onNavigate }) => {
  const { insights } = useStudio();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const publishedInsights = insights.filter((i) => i.status === 'published');

  const categories = ['All', ...Array.from(new Set(publishedInsights.map((i) => i.category)))];

  const filteredInsights = publishedInsights.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' ? true : item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredInsight = publishedInsights.find((i) => i.isFeatured) || publishedInsights[0];
  const gridInsights = filteredInsights.filter((i) => i.id !== featuredInsight?.id);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 space-y-16">
      {/* Editorial Header */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs uppercase tracking-widest text-[#E2B714] font-mono block">
          Studio Perspectives & Theory
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          Editorial Insights
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          Essays on volumetric spatial architecture, kinetic choreography, computational synthesis, and typographic permanence authored by Durman Nasar Studio.
        </p>
      </div>

      {/* Hero Lead Editorial (If available and on "All" filter) */}
      {featuredInsight && selectedCategory === 'All' && !searchQuery && (
        <div
          onClick={() => onNavigate(`/insights/${featuredInsight.slug}`)}
          className="group relative bg-[#0C0E16] border border-white/10 hover:border-white/25 transition-all cursor-pointer overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0"
        >
          <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto relative overflow-hidden bg-neutral-900 min-h-[340px]">
            <img
              src={featuredInsight.coverImage}
              alt={featuredInsight.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
          </div>

          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Unboxed Metadata with Typographic Separator */}
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <span className="text-[#E2B714] uppercase font-bold tracking-wider">
                  {featuredInsight.category}
                </span>
                <span aria-hidden="true">·</span>
                <span>{featuredInsight.readTime}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {new Date(featuredInsight.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white group-hover:text-[#E2B714] transition-colors leading-snug">
                {featuredInsight.title}
              </h2>

              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed line-clamp-4">
                {featuredInsight.excerpt}
              </p>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">
                By {featuredInsight.author?.name || 'Durman Nasar'}
              </span>

              <span className="text-xs font-semibold uppercase tracking-wider text-white group-hover:text-[#E2B714] flex items-center gap-1.5 transition-colors">
                <span>Read Full Essay</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-white/10 py-4">
        {/* Category Pills/Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white text-black font-semibold'
                  : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search insights..."
            className="w-full bg-white/5 border border-white/10 pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E2B714]"
          />
        </div>
      </div>

      {/* Grid of Editorial Essays */}
      {filteredInsights.length === 0 ? (
        <div className="p-16 text-center bg-[#0C0E16] border border-white/10 space-y-4">
          <BookOpen className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="font-display text-xl font-bold text-white">No articles found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {searchQuery
              ? `No editorial insights match "${searchQuery}". Try a different keyword.`
              : 'No articles in this category currently.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(selectedCategory === 'All' && !searchQuery ? gridInsights : filteredInsights).map(
            (item) => (
              <article
                key={item.id}
                onClick={() => onNavigate(`/insights/${item.slug}`)}
                className="group bg-[#0C0E16] border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Visual Cover */}
                <div className="aspect-[16/10] w-full bg-neutral-900 relative overflow-hidden">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-mono uppercase bg-black/80 text-[#E2B714] border border-[#E2B714]/30 backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Unboxed Metadata */}
                    <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                      <span>{item.readTime}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {new Date(item.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-white group-hover:text-[#E2B714] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
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
            )
          )}
        </div>
      )}
    </div>
  );
};
