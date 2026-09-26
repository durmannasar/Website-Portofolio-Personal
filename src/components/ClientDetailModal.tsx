import React, { useEffect } from 'react';
import { X, ArrowUpRight, ShieldCheck, CheckCircle2, Globe, Award } from 'lucide-react';
import { ClientItem } from '../types';
import { BrandLogoBadge } from './BrandLogoBadge';

interface ClientDetailModalProps {
  client: ClientItem | null;
  onClose: () => void;
  onNavigateToProject?: (slug: string) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  onClose,
  onNavigateToProject,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (client) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [client, onClose]);

  if (!client) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[115] flex items-center justify-center bg-black/90 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#0C0E16] border border-white/15 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#10131F]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#E2B714]">
            <ShieldCheck className="w-4 h-4 text-[#E2B714]" />
            <span>PARTNERSHIP PROFILE · {client.year}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1.5 bg-white/5 hover:bg-red-600 text-neutral-300 hover:text-white border border-white/10 hover:border-red-500 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            aria-label="Tutup dialog (ESC)"
            title="Tutup (ESC)"
          >
            <X className="w-4 h-4" />
            <span className="font-bold">KELUAR</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Logo Showcase Banner */}
          <div className="p-8 bg-[#07080D] border border-white/10 flex flex-col items-center justify-center text-center space-y-3">
            <BrandLogoBadge name={client.name} logoUrl={client.logoUrl} size="lg" />
            <div className="pt-2">
              <span className="text-xs text-neutral-400 font-mono">
                {client.industry}
              </span>
            </div>
          </div>

          {/* Scope of Work Deliverables */}
          {client.scope && client.scope.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714] block">
                Delivered Scope of Work
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {client.scope.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-neutral-300 p-2.5 bg-white/[0.02] border border-white/5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E2B714] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overview Narrative */}
          {client.overview && (
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block">
                Collaboration Overview
              </span>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed bg-white/[0.02] p-4 border border-white/5">
                {client.overview}
              </p>
            </div>
          )}

          {/* Measurable Results */}
          {client.results && (
            <div className="p-4 bg-[#E2B714]/10 border border-[#E2B714]/20 space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#E2B714] flex items-center gap-1.5 font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>Commercial Impact</span>
              </span>
              <p className="text-xs text-neutral-200 font-medium">
                {client.results}
              </p>
            </div>
          )}

          {/* Testimonial Quote */}
          {client.testimonial && (
            <div className="p-5 bg-white/[0.02] border-l-2 border-[#E2B714] border-y border-r border-white/5 space-y-3">
              <p className="text-xs sm:text-sm italic text-neutral-300 leading-relaxed">
                &ldquo;{client.testimonial.quote}&rdquo;
              </p>
              <div className="text-xs font-mono text-neutral-400">
                <span className="text-white font-bold block">
                  {client.testimonial.author}
                </span>
                <span>{client.testimonial.role} · {client.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-[#10131F] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {client.websiteUrl && (
              <a
                href={client.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-neutral-400" />
                <span>Client Website</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-3">
            {client.projectSlug && onNavigateToProject && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToProject(client.projectSlug!);
                }}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>View Full Case Study</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-neutral-400 hover:text-white cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
