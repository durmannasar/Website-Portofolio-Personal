import React from 'react';
import { ArrowUpRight, MessageSquare, Mail, Shield, Instagram, Linkedin } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { trackWhatsAppClick, trackEmailClick } from '../utils/analytics';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings, isAdmin } = useStudio();

  const handleWhatsApp = () => {
    trackWhatsAppClick('footer');
    const msg = encodeURIComponent(
      'Hello Durman Nasar Studio, I would like to discuss a creative project collaboration.'
    );
    window.open(`https://wa.me/628568439341?text=${msg}`, '_blank');
  };

  const handleEmail = () => {
    trackEmailClick('footer');
    window.location.href = `mailto:${settings.email || 'drmn@durmannasarstudio.com'}?subject=Project%20Inquiry%20%E2%80%94%20Durman%20Nasar%20Studio`;
  };

  return (
    <footer className="bg-[#06070A] border-t border-white/10 text-neutral-400">
      {/* Top Banner CTA */}
      <div className="max-w-7xl mx-auto px-6 py-20 border-b border-white/5">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#E2B714] font-mono">
              Direct Collaboration
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Have an ambitious vision? Let’s create something meaningful together.
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              Available for corporate brands, property developments, luxury hospitality, and agency commissions worldwide.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <button
              onClick={() => onNavigate('/contact')}
              className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Inquire Project</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleWhatsApp}
              className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/15 transition-colors cursor-pointer flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Inquiry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Col 1 & 2: Brand Lockup & Disciplines */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={settings.logoUrl || settings.faviconUrl || '/favicon.svg'}
                  alt={settings.studioName || 'Durman Nasar Studio'}
                  className="w-8 h-8 rounded-sm object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/favicon.svg';
                  }}
                />
                <span className="font-display text-2xl font-bold text-white tracking-tight">
                  {settings.studioName || 'Durman Nasar Studio'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
                Multidisciplinary creative studio bridging strategic thinking with uncompromising craft across digital, motion, and spatial architecture.
              </p>
            </div>

            {/* Disciplines list unboxed without pills */}
            <div className="pt-2">
              <span className="text-xs uppercase tracking-wider text-neutral-500 font-mono block mb-2">
                Core Disciplines
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Graphic Design <span className="text-neutral-600">·</span> Motion Graphics <span className="text-neutral-600">·</span> Social Media <span className="text-neutral-600">·</span> Digital Marketing <span className="text-neutral-600">·</span> Video Editing <span className="text-neutral-600">·</span> Photography <span className="text-neutral-600">·</span> Videography <span className="text-neutral-600">·</span> 3D Exhibition Booth
              </p>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-200">
              Navigation
            </span>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/work')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Selected Work
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/services')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/insights')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Editorial Insights
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/clients')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Clients & Brands
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Information */}
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-200">
              Studio Direct
            </span>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-neutral-500 block">General & Project Inquiries</span>
                <button
                  onClick={handleEmail}
                  className="text-white hover:text-[#E2B714] transition-colors flex items-center gap-1.5 cursor-pointer mt-0.5"
                >
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="font-mono text-xs">{settings.email || 'drmn@durmannasarstudio.com'}</span>
                </button>
              </div>

              <div>
                <span className="text-xs text-neutral-500 block">Instant Chat / WhatsApp</span>
                <button
                  onClick={handleWhatsApp}
                  className="text-white hover:text-[#E2B714] transition-colors flex items-center gap-1.5 cursor-pointer mt-0.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                  <span className="font-mono text-xs">{settings.phone || '+62 856 8439 341'}</span>
                </button>
              </div>

              <div>
                <span className="text-xs text-neutral-500 block">Base of Operations</span>
                <span className="text-xs text-neutral-300 font-mono">
                  {settings.location || 'Jakarta, Indonesia (GMT+7)'}
                </span>
              </div>
            </div>
          </div>

          {/* Col 5: Social Channels & CMS access */}
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-200">
              Connect
            </span>
            <div className="space-y-2 text-sm">
              <a
                href={settings.socials?.instagram || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors text-xs"
              >
                <Instagram className="w-3.5 h-3.5 text-neutral-400" />
                <span>Instagram</span>
              </a>
              <a
                href={settings.socials?.linkedin || 'https://linkedin.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors text-xs"
              >
                <Linkedin className="w-3.5 h-3.5 text-neutral-400" />
                <span>LinkedIn</span>
              </a>
              <a
                href={settings.socials?.behance || 'https://behance.net'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors text-xs"
              >
                <span>Behance</span>
              </a>
              <a
                href={settings.socials?.vimeo || 'https://vimeo.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors text-xs"
              >
                <span>Vimeo Showreels</span>
              </a>
            </div>

            <div className="pt-4 border-t border-white/5">
              <button
                onClick={() => onNavigate(isAdmin ? '/admin' : '/admin/login')}
                className="text-xs text-neutral-500 hover:text-[#E2B714] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Studio CMS Management"
              >
                <Shield className="w-3 h-3" />
                <span>Studio Admin Portal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 mt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Durman Nasar Studio. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('/privacy')}
              className="hover:text-neutral-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('/terms')}
              className="hover:text-neutral-400 transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-400 transition-colors"
            >
              XML Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
