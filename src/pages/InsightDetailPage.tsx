import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Check,
  Copy,
  ArrowRight,
  Bookmark,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';

interface InsightDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const InsightDetailPage: React.FC<InsightDetailPageProps> = ({ slug, onNavigate }) => {
  const { insights, showToast } = useStudio();
  const [copiedLink, setCopiedLink] = useState(false);

  const insight =
    insights.find((i) => i.slug === slug) ||
    insights.find((i) => i.id === slug);

  if (!insight) {
    return (
      <div className="pt-40 pb-24 max-w-3xl mx-auto px-6 text-center space-y-6">
        <h1 className="font-display text-3xl font-bold text-white">
          Editorial Essay Not Found
        </h1>
        <p className="text-neutral-400 text-sm">
          The requested perspective piece does not exist or may have been moved.
        </p>
        <button
          onClick={() => onNavigate('/insights')}
          className="px-6 py-3 bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#E2B714] transition-colors cursor-pointer"
        >
          Return to Editorial Insights
        </button>
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Essay link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Other related essays
  const relatedInsights = insights
    .filter((i) => i.id !== insight.id && i.status === 'published')
    .slice(0, 3);

  // Render article content with proper typography (paragraphs, headings, pull quotes)
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = (idx: number) => {
      if (currentParagraph.length > 0) {
        const text = currentParagraph.join(' ').trim();
        if (text) {
          elements.push(
            <p key={`p-${idx}`} className="text-neutral-300 text-base sm:text-lg leading-relaxed font-sans font-normal mb-6">
              {text}
            </p>
          );
        }
        currentParagraph = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('### ')) {
        flushParagraph(index);
        elements.push(
          <h3
            key={`h3-${index}`}
            className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight mt-10 mb-4"
          >
            {trimmed.replace('### ', '')}
          </h3>
        );
      } else if (trimmed.startsWith('## ')) {
        flushParagraph(index);
        elements.push(
          <h2
            key={`h2-${index}`}
            className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-12 mb-5"
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
      } else if (trimmed.startsWith('> ')) {
        flushParagraph(index);
        const quote = trimmed.replace(/^>\s*"?/, '').replace(/"?$/, '');
        elements.push(
          <blockquote
            key={`quote-${index}`}
            className="my-8 p-6 sm:p-8 bg-[#0C0E16] border-l-2 border-[#E2B714] text-white font-display text-lg sm:text-xl italic leading-relaxed"
          >
            "{quote}"
          </blockquote>
        );
      } else if (trimmed === '') {
        flushParagraph(index);
      } else {
        currentParagraph.push(trimmed);
      }
    });

    flushParagraph(lines.length);
    return elements;
  };

  return (
    <article className="pt-32 pb-24">
      {/* Article Header Container */}
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => onNavigate('/insights')}
          className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Editorial Insights</span>
        </button>

        {/* Category & Meta */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-400">
            <span className="text-[#E2B714] uppercase font-bold tracking-wider">
              {insight.category}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>{insight.readTime}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span>
                {new Date(insight.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            {insight.title}
          </h1>

          {/* Lead Excerpt */}
          <p className="text-neutral-300 text-lg sm:text-xl font-normal leading-relaxed pt-2 border-t border-white/10">
            {insight.excerpt}
          </p>

          {/* Author Byline & Social Share */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E2B714]/10 border border-[#E2B714]/30 flex items-center justify-center font-display font-bold text-white text-sm">
                DN
              </div>
              <div>
                <span className="font-medium text-white text-sm block">
                  {insight.author?.name || 'Durman Nasar'}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {insight.author?.role || 'Creative Director & Founder'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy essay link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Visual Asset */}
      <div className="max-w-6xl mx-auto px-6 my-12">
        <div className="aspect-[16/9] w-full bg-neutral-900 border border-white/10 overflow-hidden relative shadow-2xl">
          <img
            src={insight.coverImage}
            alt={insight.title}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-[11px] font-mono text-neutral-500 block mt-2 text-right">
          Visual Essay Archives // Durman Nasar Studio
        </span>
      </div>

      {/* Article Body */}
      <div className="max-w-3xl mx-auto px-6 space-y-6">
        <div className="article-prose">
          {renderFormattedContent(insight.content)}
        </div>

        {/* Tags */}
        {insight.tags && insight.tags.length > 0 && (
          <div className="pt-8 mt-12 border-t border-white/10">
            <span className="text-xs font-mono uppercase text-neutral-500 block mb-2">
              Filed under:
            </span>
            <div className="flex flex-wrap gap-2">
              {insight.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-white/5 border border-white/10 text-neutral-300 text-xs font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio Box */}
        <div className="mt-12 p-8 bg-[#0C0E16] border border-white/10 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E2B714]/20 border border-[#E2B714]/40 flex items-center justify-center font-display font-extrabold text-white text-base">
              DN
            </div>
            <div>
              <span className="font-display font-bold text-white text-base block">
                {insight.author?.name || 'Durman Nasar'}
              </span>
              <span className="text-xs font-mono text-[#E2B714]">
                {insight.author?.role || 'Creative Director & Founder'}
              </span>
            </div>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Durman Nasar is a multidisciplinary creative director and founder of Durman Nasar Studio based in Jakarta. Combining graphic design, kinetic motion, cinematography, and spatial 3D architecture, he creates brand ecosystems for enterprise leaders, luxury hospitality, and progressive cultural institutions.
          </p>
        </div>
      </div>

      {/* Related Essays */}
      {relatedInsights.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mt-24 pt-16 border-t border-white/10 space-y-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-[#E2B714]">
                Further Perspectives
              </span>
              <h3 className="font-display text-2xl font-bold text-white">
                More Editorial Insights
              </h3>
            </div>

            <button
              onClick={() => onNavigate('/insights')}
              className="text-xs font-mono uppercase text-white hover:text-[#E2B714] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All Insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedInsights.map((rel) => (
              <article
                key={rel.id}
                onClick={() => {
                  onNavigate(`/insights/${rel.slug}`);
                  window.scrollTo(0, 0);
                }}
                className="group bg-[#0C0E16] border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                <div className="aspect-[16/10] w-full bg-neutral-900 relative overflow-hidden">
                  <img
                    src={rel.coverImage}
                    alt={rel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-mono uppercase bg-black/80 text-[#E2B714] border border-[#E2B714]/30">
                    {rel.category}
                  </span>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-neutral-400 block">
                      {rel.readTime}
                    </span>
                    <h4 className="font-display text-base font-bold text-white group-hover:text-[#E2B714] transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-neutral-400 line-clamp-2">
                      {rel.excerpt}
                    </p>
                  </div>

                  <span className="text-[#E2B714] font-semibold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-2">
                    <span>Read Essay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
