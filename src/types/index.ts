export type ProjectCategory =
  | 'Graphic Design'
  | 'Motion Graphics'
  | 'Social Media'
  | 'Digital Marketing'
  | 'Video Editing'
  | 'Photography'
  | 'Videography'
  | '3D Exhibition Booth';

export interface ContentProtectionSettings {
  enabled: boolean;
  disableRightClick: boolean;
  disableTextSelection: boolean;
  disableCopyShortcut: boolean;
  disableSaveShortcut: boolean;
  disableImageDrag: boolean;
  mobileLongPressProtection: boolean;
  protectOriginalImages: boolean;
  generateWebVersion: boolean;
  watermarkEnabled: boolean;
  watermarkText: string;
  watermarkImage?: string;
  watermarkOpacity: number;
  watermarkPosition: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'diagonal-repeat';
  watermarkScale: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  client: string;
  year: string;
  category: ProjectCategory;
  services: string[];
  description: string;
  challenge: string;
  approach: string;
  strategy: string;
  coverImage: string;
  thumbnail: string;
  galleryImages: string[];
  // Protected Assets Architecture: Master high-res file vs Web-optimized version
  masterImage?: string;
  webOptimizedImage?: string;
  masterGalleryImages?: string[];
  webOptimizedGalleryImages?: string[];
  // Per-Project Protection
  protectionMode?: 'global' | 'custom';
  customProtection?: {
    disableTextSelection?: boolean;
    protectImages?: boolean;
    enableWatermark?: boolean;
    watermarkText?: string;
  };
  videoUrl?: string;
  results: {
    metric: string;
    label: string;
  }[];
  isFeatured: boolean;
  order: number;
  status: 'published' | 'draft';
  seoTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  code: string; // e.g. "01"
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
  tools: string[];
  order: number;
  published: boolean;
}

export interface EditorialInsight {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  coverImage: string;
  readTime: string;
  publishedAt: string;
  tags: string[];
  isFeatured: boolean;
  status: 'published' | 'draft';
  order: number;
}

export interface ClientItem {
  id: string;
  name: string;
  industry: string;
  year: string;
  logoUrl?: string;
  featured: boolean;
  order: number;
  scope?: string[];
  overview?: string;
  results?: string;
  projectSlug?: string;
  websiteUrl?: string;
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
}

export interface MediaFile {
  id: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  altText: string;
  title: string;
  uploadedAt: string;
}

export interface HeroSlide {
  id: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  desktopImage: string;
  mobileImage?: string;
  categoryTag: string;
  order: number;
  active: boolean;
}

export interface ContactInquiry {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  service: string;
  budget?: string;
  timeline?: string;
  description: string;
  status: 'new' | 'reviewed' | 'contacted' | 'archived';
  createdAt: string;
}

export interface SiteSettings {
  studioName: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  bio: string;
  experienceYears: number;
  completedProjects: number;
  gaMeasurementId: string;
  searchConsoleVerification: string;
  customTrackingCode?: string; // Pasted script from Google Analytics (Install manually)
  // Telemetry & Audience Analytics
  gtmContainerId?: string;
  metaPixelId?: string;
  linkedInPartnerId?: string;
  telemetryActive?: boolean;
  anonymizeIp?: boolean;
  enhancedMeasurement?: boolean;
  // Search Engine Intelligence & SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImageUrl?: string;
  twitterHandle?: string;
  bingVerification?: string;
  canonicalBaseUrl?: string;
  robotsTxtCustom?: string;
  indexingStatus?: 'index, follow' | 'noindex, nofollow';
  // Professional Content & Asset Protection System
  contentProtection?: ContentProtectionSettings;
  // Brand Identity, Favicon & Logos
  faviconUrl?: string;
  logoUrl?: string;
  appleTouchIconUrl?: string;
  faviconUpdatedAt?: string;
  socials: {
    instagram: string;
    linkedin: string;
    behance: string;
    vimeo: string;
    youtube: string;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}
