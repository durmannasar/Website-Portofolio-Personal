import React, { useState } from 'react';
import { ArrowUpRight, Menu, X, Shield } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { trackEvent } from '../utils/analytics';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { isAdmin } = useStudio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Work', path: '/work' },
    { label: 'Services', path: '/services' },
    { label: 'Insights', path: '/insights' },
    { label: 'About', path: '/about' },
    { label: 'Clients', path: '/clients' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const handleCtaClick = () => {
    trackEvent('cta_click', { cta_label: 'Start a Project', location: 'top_bar' });
    onNavigate('/contact');
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#090A0F]/90 backdrop-blur-md border-b border-white/10 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => handleLinkClick('/')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-[#E2B714] transition-colors whitespace-nowrap">
            Durman Nasar Studio
          </span>
        </button>

        {/* Zone 2: 4–6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
            return (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`relative py-1 cursor-pointer transition-colors focus:outline-none ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E2B714]" />
                )}
              </button>
            );
          })}
          {isAdmin && (
            <button
              onClick={() => handleLinkClick('/admin')}
              className="flex items-center gap-1.5 text-xs text-[#E2B714] hover:text-white transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Zone 3: 1–2 primary actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleCtaClick}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] rounded-none transition-all duration-200 cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#E2B714]"
          >
            <span>Start a Project</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-300 hover:text-white focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0C0E14] border-b border-white/10 px-6 py-8 space-y-6 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`text-left text-lg font-medium py-1 transition-colors cursor-pointer ${
                    isActive ? 'text-[#E2B714]' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            {isAdmin && (
              <button
                onClick={() => handleLinkClick('/admin')}
                className="text-left text-sm text-[#E2B714] py-1 cursor-pointer flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Admin CMS Dashboard</span>
              </button>
            )}
          </div>
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={handleCtaClick}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer"
            >
              <span>Start a Project</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
