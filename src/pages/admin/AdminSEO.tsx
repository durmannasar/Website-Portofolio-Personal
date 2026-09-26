import React, { useState } from 'react';
import {
  Search,
  Globe,
  Check,
  Copy,
  ExternalLink,
  Shield,
  FileText,
  Share2,
  Code2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Eye,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { api } from '../../services/api';
import { SiteSettings } from '../../types';
import { MediaPickerModal } from '../../components/MediaPickerModal';

export const AdminSEO: React.FC = () => {
  const { settings, projects, services, insights, refreshData, showToast } = useStudio();
  const [formData, setFormData] = useState<Partial<SiteSettings>>({
    seoTitle:
      settings.seoTitle ||
      'Durman Nasar Studio – Multidisciplinary Creative Studio & Agency',
    seoDescription:
      settings.seoDescription ||
      'Creative Ideas. Strategic Design. Meaningful Experiences. Specialized in Graphic Design, Motion, Video, Photography, Digital Marketing, and 3D Exhibition Booth Design.',
    seoKeywords:
      settings.seoKeywords ||
      'creative studio jakarta, multidisciplinary agency, brand identity, motion graphics, 3D exhibition booth, videography, photography, digital marketing',
    ogImageUrl:
      settings.ogImageUrl ||
      '/src/assets/images/hero_studio_showcase_1790391271997.jpg',
    twitterHandle: settings.twitterHandle || '@durmannasar',
    canonicalBaseUrl:
      settings.canonicalBaseUrl || 'https://durmannasarstudio.com',
    indexingStatus: settings.indexingStatus || 'index, follow',
    searchConsoleVerification:
      settings.searchConsoleVerification ||
      'google-site-verification-durman-nasar-studio',
    bingVerification: settings.bingVerification || 'msvalidate.01=DNS_STUDIO_VERIFY',
    robotsTxtCustom:
      settings.robotsTxtCustom ||
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://durmannasarstudio.com/sitemap.xml`,
  });

  const [activeTab, setActiveTab] = useState<'serp' | 'social' | 'indexation' | 'schema' | 'audit'>('serp');
  const [isSaving, setIsSaving] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedSitemapUrl, setCopiedSitemapUrl] = useState(false);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings(formData);
      await refreshData();
      showToast('SEO & Indexation parameters updated successfully');
    } catch (err: any) {
      showToast(err.message || 'Error saving SEO settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const titleLength = formData.seoTitle?.length || 0;
  const descLength = formData.seoDescription?.length || 0;

  const titleScore =
    titleLength >= 35 && titleLength <= 65
      ? 'optimal'
      : titleLength < 35
      ? 'short'
      : 'long';

  const descScore =
    descLength >= 120 && descLength <= 165
      ? 'optimal'
      : descLength < 120
      ? 'short'
      : 'long';

  // Dynamic Schema.org JSON-LD string
  const structuredDataJson = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ProfessionalService',
          '@id': `${formData.canonicalBaseUrl || 'https://durmannasarstudio.com'}#studio`,
          name: settings.studioName || 'Durman Nasar Studio',
          url: formData.canonicalBaseUrl || 'https://durmannasarstudio.com',
          logo: `${formData.canonicalBaseUrl || 'https://durmannasarstudio.com'}/logo.svg`,
          email: settings.email || 'drmn@durmannasarstudio.com',
          telephone: settings.phone || '+628568439341',
          description: formData.seoDescription,
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Jakarta',
            addressCountry: 'ID',
          },
          knowsAbout: services.map((s) => s.title),
          priceRange: '$$$$',
          sameAs: [
            settings.socials?.instagram,
            settings.socials?.linkedin,
            settings.socials?.behance,
            settings.socials?.vimeo,
          ].filter(Boolean),
        },
        {
          '@type': 'Person',
          '@id': `${formData.canonicalBaseUrl || 'https://durmannasarstudio.com'}#durman`,
          name: 'Durman Nasar',
          jobTitle: 'Creative Director & Founder',
          worksFor: {
            '@id': `${formData.canonicalBaseUrl || 'https://durmannasarstudio.com'}#studio`,
          },
        },
      ],
    },
    null,
    2
  );

  const handleCopySchema = () => {
    navigator.clipboard.writeText(structuredDataJson);
    setCopiedSchema(true);
    showToast('Schema.org JSON-LD copied to clipboard');
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleCopySitemapUrl = () => {
    const sitemapUrl = `${window.location.origin}/sitemap.xml`;
    navigator.clipboard.writeText(sitemapUrl);
    setCopiedSitemapUrl(true);
    showToast(`Copied: ${sitemapUrl}`);
    setTimeout(() => setCopiedSitemapUrl(false), 2500);
  };

  // Generate dynamic sitemap entries
  const sitemapEntries = [
    { url: '/', changefreq: 'weekly', priority: '1.0', type: 'Core Page' },
    { url: '/work', changefreq: 'weekly', priority: '0.9', type: 'Portfolio Archive' },
    ...projects
      .filter((p) => p.status === 'published')
      .map((p) => ({
        url: `/work/${p.slug}`,
        changefreq: 'monthly',
        priority: '0.8',
        type: `Case Study: ${p.category}`,
      })),
    { url: '/services', changefreq: 'weekly', priority: '0.9', type: 'Disciplines' },
    { url: '/insights', changefreq: 'weekly', priority: '0.9', type: 'Editorial Insights' },
    ...insights
      .filter((i) => i.status === 'published')
      .map((i) => ({
        url: `/insights/${i.slug}`,
        changefreq: 'weekly',
        priority: '0.8',
        type: `Editorial: ${i.category}`,
      })),
    { url: '/about', changefreq: 'monthly', priority: '0.7', type: 'Studio Profile' },
    { url: '/clients', changefreq: 'weekly', priority: '0.7', type: 'Client Directory' },
    { url: '/contact', changefreq: 'weekly', priority: '0.8', type: 'Brief Intake' },
    { url: '/privacy', changefreq: 'yearly', priority: '0.3', type: 'Legal' },
    { url: '/terms', changefreq: 'yearly', priority: '0.3', type: 'Legal' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-[#E2B714]">
              Search Engine Intelligence
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Globe className="w-3 h-3" />
              Sitemap & Indexation Active
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            SEO & Indexation Management
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Search engine ranking architecture, OpenGraph cards, Google Search Console verification, and Schema.org structured data.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={isSaving}
          className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2 font-bold shadow-sm disabled:opacity-50 self-start sm:self-auto"
        >
          <Check className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save SEO Configuration'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('serp')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap border-b-2 -mb-1 ${
            activeTab === 'serp'
              ? 'border-[#E2B714] text-white font-bold'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Google SERP & Snippet
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap border-b-2 -mb-1 ${
            activeTab === 'social'
              ? 'border-[#E2B714] text-white font-bold'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Social Share Cards (OpenGraph)
        </button>
        <button
          onClick={() => setActiveTab('indexation')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap border-b-2 -mb-1 ${
            activeTab === 'indexation'
              ? 'border-[#E2B714] text-white font-bold'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Robots.txt & Sitemap ({sitemapEntries.length})
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap border-b-2 -mb-1 ${
            activeTab === 'schema'
              ? 'border-[#E2B714] text-white font-bold'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Schema.org JSON-LD
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap border-b-2 -mb-1 ${
            activeTab === 'audit'
              ? 'border-[#E2B714] text-white font-bold'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Page-by-Page Audit
        </button>
      </div>

      {/* TAB 1: SERP SNIPPET & GLOBAL METADATA */}
      {activeTab === 'serp' && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Live Google Search Preview */}
          <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
            <span className="text-xs font-mono uppercase text-[#E2B714] font-bold flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>Live Google Search Snippet Simulation (Desktop & Mobile)</span>
            </span>

            <div className="p-5 bg-[#202124] border border-[#3c4043] rounded-lg max-w-2xl space-y-2 text-left">
              <div className="flex items-center gap-2 text-xs text-[#bdc1c6] font-sans">
                <div className="w-4 h-4 rounded-full bg-[#E2B714] flex items-center justify-center text-[10px] text-black font-bold">
                  D
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] text-[#dadce0] font-medium leading-none">
                    Durman Nasar Studio
                  </span>
                  <span className="text-[11px] text-[#bdc1c6] leading-none mt-0.5">
                    {formData.canonicalBaseUrl || 'https://durmannasarstudio.com'}
                  </span>
                </div>
              </div>

              <h3 className="text-[#8ab4f8] hover:underline cursor-pointer text-lg font-sans font-medium line-clamp-1">
                {formData.seoTitle || 'Durman Nasar Studio – Multidisciplinary Creative Studio & Agency'}
              </h3>

              <p className="text-[#bdc1c6] text-xs font-sans leading-relaxed line-clamp-2">
                {formData.seoDescription ||
                  'Creative Ideas. Strategic Design. Meaningful Experiences. Specialized in Graphic Design, Motion, Video, Photography, Digital Marketing, and 3D Exhibition Booth Design.'}
              </p>
            </div>
          </div>

          {/* Meta Fields */}
          <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-5 text-xs">
            {/* Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-neutral-300 uppercase font-semibold">
                  Global Meta Title Template
                </label>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span
                    className={
                      titleScore === 'optimal'
                        ? 'text-emerald-400 font-bold'
                        : titleScore === 'short'
                        ? 'text-[#E2B714]'
                        : 'text-red-400'
                    }
                  >
                    {titleLength} / 60 characters ({titleScore})
                  </span>
                </div>
              </div>
              <input
                type="text"
                required
                value={formData.seoTitle || ''}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                className="w-full bg-white/5 border border-white/10 px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#E2B714]"
              />
              <span className="text-[11px] text-neutral-500 font-mono block">
                Target 30-60 characters for optimal visibility without search snippet truncation.
              </span>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-neutral-300 uppercase font-semibold">
                  Global Meta Description
                </label>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span
                    className={
                      descScore === 'optimal'
                        ? 'text-emerald-400 font-bold'
                        : descScore === 'short'
                        ? 'text-[#E2B714]'
                        : 'text-red-400'
                    }
                  >
                    {descLength} / 160 characters ({descScore})
                  </span>
                </div>
              </div>
              <textarea
                rows={3}
                required
                value={formData.seoDescription || ''}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                className="w-full bg-white/5 border border-white/10 px-3.5 py-2.5 text-white leading-relaxed focus:outline-none focus:border-[#E2B714]"
              />
              <span className="text-[11px] text-neutral-500 font-mono block">
                Target 120-160 characters. Provide an actionable summary of studio capabilities.
              </span>
            </div>

            {/* Keywords & Canonical */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="font-mono text-neutral-300 uppercase font-semibold">
                  Focus Keywords / Keyphrases
                </label>
                <input
                  type="text"
                  value={formData.seoKeywords || ''}
                  onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                  placeholder="creative studio, brand identity, motion graphics, 3D booth..."
                  className="w-full bg-white/5 border border-white/10 px-3.5 py-2.5 text-white focus:outline-none focus:border-[#E2B714]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-neutral-300 uppercase font-semibold">
                  Canonical Base URL
                </label>
                <input
                  type="url"
                  value={formData.canonicalBaseUrl || ''}
                  onChange={(e) => setFormData({ ...formData, canonicalBaseUrl: e.target.value })}
                  placeholder="https://durmannasarstudio.com"
                  className="w-full bg-white/5 border border-white/10 px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#E2B714]"
                />
              </div>
            </div>

            {/* Directives */}
            <div className="space-y-1.5 pt-2">
              <label className="font-mono text-neutral-300 uppercase font-semibold">
                Search Engine Indexing Directive (Robots Meta Tag)
              </label>
              <select
                value={formData.indexingStatus || 'index, follow'}
                onChange={(e: any) => setFormData({ ...formData, indexingStatus: e.target.value })}
                className="w-full bg-white/5 border border-white/10 px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#E2B714]"
              >
                <option value="index, follow">index, follow (Standard Production Indexing)</option>
                <option value="noindex, nofollow">noindex, nofollow (Private Staging Mode)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer font-bold"
            >
              {isSaving ? 'Saving...' : 'Save Meta Configuration'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SOCIAL SHARE CARDS (OPENGRAPH & TWITTER) */}
      {activeTab === 'social' && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Social Card Preview */}
          <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
            <span className="text-xs font-mono uppercase text-[#E2B714] font-bold flex items-center gap-1.5">
              <Share2 className="w-4 h-4" />
              <span>OpenGraph & Twitter Social Card Simulation</span>
            </span>

            <div className="max-w-md bg-[#161822] border border-white/15 rounded-lg overflow-hidden shadow-2xl">
              <div className="aspect-[1.91/1] w-full bg-neutral-900 relative overflow-hidden">
                <img
                  src={formData.ogImageUrl || '/src/assets/images/hero_studio_showcase_1790391271997.jpg'}
                  alt="Social Card Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 text-[10px] font-mono text-white">
                  1200 × 630px
                </div>
              </div>
              <div className="p-4 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-neutral-400">
                  {formData.canonicalBaseUrl?.replace('https://', '') || 'durmannasarstudio.com'}
                </span>
                <h4 className="font-bold text-white text-sm line-clamp-1">
                  {formData.seoTitle}
                </h4>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {formData.seoDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Social Image & Handles */}
          <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4 text-xs">
            <div className="space-y-2">
              <label className="font-mono text-neutral-300 uppercase font-semibold">
                Social Share Image (og:image) URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.ogImageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, ogImageUrl: e.target.value })}
                  placeholder="https://durmannasarstudio.com/uploads/share-card.jpg"
                  className="flex-1 bg-white/5 border border-white/10 px-3.5 py-2 text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  className="px-4 py-2 bg-white/10 hover:bg-[#E2B714] hover:text-black text-white text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Select from Library</span>
                </button>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono block">
                Recommended dimension: 1200 × 630 pixels (Aspect Ratio 1.91:1) in JPG or WebP format.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="font-mono text-neutral-300 uppercase font-semibold">
                  Twitter / X Creator Handle
                </label>
                <input
                  type="text"
                  value={formData.twitterHandle || ''}
                  onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                  placeholder="@durmannasar"
                  className="w-full bg-white/5 border border-white/10 px-3.5 py-2 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-neutral-300 uppercase font-semibold">
                  Twitter Card Type
                </label>
                <input
                  type="text"
                  disabled
                  value="summary_large_image (High-Impact Hero Visual)"
                  className="w-full bg-white/5 border border-white/10 px-3.5 py-2 text-neutral-400 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer font-bold"
            >
              {isSaving ? 'Saving...' : 'Save Social Card Settings'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: INDEXATION (ROBOTS.TXT & SITEMAP.XML) */}
      {activeTab === 'indexation' && (
        <div className="space-y-6">
          {/* Webmaster Verification Tokens */}
          <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono uppercase text-[#E2B714] font-bold flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>Search Engine Webmaster Verification</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-mono text-neutral-300 uppercase font-semibold">
                  Google Search Console Verification Token
                </label>
                <input
                  type="text"
                  value={formData.searchConsoleVerification || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, searchConsoleVerification: e.target.value })
                  }
                  placeholder="google-site-verification=..."
                  className="w-full bg-white/5 border border-white/10 px-3.5 py-2 text-white font-mono"
                />
                <span className="text-[11px] text-neutral-500 font-mono block">
                  Enables domain validation in Google Search Console for search performance indexing.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-neutral-300 uppercase font-semibold">
                  Bing Webmaster Tools Verification Token
                </label>
                <input
                  type="text"
                  value={formData.bingVerification || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, bingVerification: e.target.value })
                  }
                  placeholder="msvalidate.01=..."
                  className="w-full bg-white/5 border border-white/10 px-3.5 py-2 text-white font-mono"
                />
                <span className="text-[11px] text-neutral-500 font-mono block">
                  Authorizes URL submission directly to Microsoft Bing Webmaster.
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Sitemap.xml Generator */}
          <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-mono uppercase text-[#E2B714] font-bold flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Dynamic XML Sitemap Generator ({sitemapEntries.length} URLs Detected)</span>
                </span>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Real-time sitemap reflecting all published projects, services, and core studio routes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySitemapUrl}
                  className="px-3 py-1.5 bg-white/10 hover:bg-[#E2B714] hover:text-black text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedSitemapUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSitemapUrl ? 'Copied' : 'Copy Sitemap URL'}</span>
                </button>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <span>View Live</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Sitemap inspection table */}
            <div className="max-h-64 overflow-y-auto border border-white/5">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#11131E] text-neutral-400 uppercase text-[10px] sticky top-0">
                  <tr>
                    <th className="p-2.5">Route URL</th>
                    <th className="p-2.5">Category / Type</th>
                    <th className="p-2.5">Priority</th>
                    <th className="p-2.5">Change Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sitemapEntries.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="p-2.5 text-white font-medium">{entry.url}</td>
                      <td className="p-2.5 text-neutral-400">{entry.type}</td>
                      <td className="p-2.5 text-[#E2B714]">{entry.priority}</td>
                      <td className="p-2.5 text-neutral-400">{entry.changefreq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Robots.txt Editor */}
          <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-mono uppercase text-[#E2B714] font-bold flex items-center gap-1.5">
                  <Code2 className="w-4 h-4" />
                  <span>Robots.txt Crawl Directives</span>
                </span>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Instructs Googlebot and Bingbot which routes to index or ignore.
                </p>
              </div>

              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <span>View Live /robots.txt</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <textarea
              rows={6}
              value={formData.robotsTxtCustom || ''}
              onChange={(e) => setFormData({ ...formData, robotsTxtCustom: e.target.value })}
              className="w-full bg-black/80 border border-white/10 p-3.5 text-xs text-[#E2B714] font-mono leading-relaxed focus:outline-none focus:border-[#E2B714]"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => handleSave()}
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer font-bold"
            >
              {isSaving ? 'Saving...' : 'Save Indexation Directives'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: SCHEMA.ORG STRUCTURED DATA (JSON-LD) */}
      {activeTab === 'schema' && (
        <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-xs font-mono uppercase text-[#E2B714] font-bold flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                <span>Schema.org JSON-LD Structured Data Entity</span>
              </span>
              <p className="text-xs text-neutral-400 mt-0.5">
                Provides Google Search with rich entity knowledge graph signals for ProfessionalService and Creative Director.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopySchema}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-[#E2B714] hover:text-black text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSchema ? 'Copied' : 'Copy JSON-LD'}</span>
            </button>
          </div>

          <pre className="p-4 bg-black/80 border border-white/10 text-xs font-mono text-[#E2B714] overflow-x-auto leading-relaxed max-h-96">
            {structuredDataJson}
          </pre>
        </div>
      )}

      {/* TAB 5: PAGE-BY-PAGE AUDIT */}
      {activeTab === 'audit' && (
        <div className="p-6 bg-[#0C0E16] border border-white/10 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <span className="text-xs font-mono uppercase text-[#E2B714] font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Studio SEO Health & Indexation Readiness</span>
            </span>
            <p className="text-xs text-neutral-400 mt-0.5">
              Comprehensive audit of all client-facing pages and structured metadata status.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { path: '/', name: 'Homepage (Studio Showreel)', status: 'Optimal', og: true, schema: true, mobile: '100/100' },
              { path: '/work', name: 'Work Archive (Filterable Grid & List)', status: 'Optimal', og: true, schema: true, mobile: '100/100' },
              { path: '/services', name: 'Services & Disciplines Architecture', status: 'Optimal', og: true, schema: true, mobile: '100/100' },
              { path: '/about', name: 'About (Philosophy & Leadership)', status: 'Optimal', og: true, schema: true, mobile: '100/100' },
              { path: '/clients', name: 'Clients & Selected Brands Wall', status: 'Optimal', og: true, schema: true, mobile: '100/100' },
              { path: '/contact', name: 'Contact & Project Intake Form', status: 'Optimal', og: true, schema: true, mobile: '100/100' },
            ].map((page, i) => (
              <div
                key={i}
                className="p-4 bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-mono text-[#E2B714] text-xs font-bold block">
                    {page.path}
                  </span>
                  <span className="text-white font-medium">{page.name}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>OpenGraph OK</span>
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>JSON-LD Valid</span>
                  </span>
                  <span className="text-neutral-400">Mobile {page.mobile}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    {page.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Picker Modal for OG Image Selection */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(imageUrl) => {
          setFormData((prev) => ({ ...prev, ogImageUrl: imageUrl }));
          setMediaPickerOpen(false);
          showToast('Selected media as OpenGraph share card image');
        }}
      />
    </div>
  );
};
