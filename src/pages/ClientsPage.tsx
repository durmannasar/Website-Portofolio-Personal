import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { ClientDetailModal } from '../components/ClientDetailModal';
import { BrandLogoBadge } from '../components/BrandLogoBadge';
import { ClientItem } from '../types';

interface ClientsPageProps {
  onNavigate: (path: string) => void;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({ onNavigate }) => {
  const { clients } = useStudio();
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null);

  const testimonials = [
    {
      quote:
        'Durman Nasar Studio completely redefined how our technological innovations are perceived physically. The 3D exhibition booth became the undisputed centerpiece of the biennial.',
      author: 'Adrian Wijaya',
      role: 'VP of Marketing & Global Communications',
      organization: 'Kinetix Global Technology',
    },
    {
      quote:
        'The level of typographic sensitivity and tactile restraint brought to our fragrance identity elevated our retail margins dramatically across Southeast Asia.',
      author: 'Elena Rostova',
      role: 'Creative Director',
      organization: 'Aura Maison de Parfumerie',
    },
    {
      quote:
        'Their cinematography and architectural documentation generated more high-net-worth direct bookings in three months than our previous two annual campaigns combined.',
      author: 'Marcus Sterling',
      role: 'Managing Partner',
      organization: 'The Sanctum Villas & Estates',
    },
  ];

  return (
    <div className="pt-28 pb-24 px-6 max-w-7xl mx-auto space-y-24">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl border-b border-white/10 pb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
          Partnerships & Collaborations
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          Selected Clients & Brands
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          We collaborate with forward-thinking enterprises, property developers, luxury hospitality operators, and boutique lifestyle houses worldwide.
        </p>
      </div>

      {/* Client Grid With Logos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {clients.map((client) => (
          <div
            key={client.id}
            onClick={() => setSelectedClient(client)}
            className="p-8 bg-[#0B0D13] border border-white/10 hover:border-[#E2B714] transition-all duration-300 flex flex-col justify-between space-y-6 group cursor-pointer relative"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <span className="text-[#E2B714]">COMMISSION · {client.year}</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:text-[#E2B714] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              {/* Brand Logo Display */}
              <div className="h-16 flex items-center justify-center py-2">
                <BrandLogoBadge name={client.name} logoUrl={client.logoUrl} size="md" />
              </div>

              <div className="pt-2 border-t border-white/5 space-y-1">
                <h3 className="font-display text-sm font-bold text-white group-hover:text-[#E2B714] transition-colors">
                  {client.name}
                </h3>
                <p className="text-xs text-neutral-400 font-mono truncate">
                  {client.industry}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-neutral-500">
              <span className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E2B714]" />
                <span>Verified Partner</span>
              </span>
              <span className="text-[10px] font-mono text-[#E2B714] opacity-0 group-hover:opacity-100 transition-opacity">
                View Scope →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Brand Detail Interactive Modal */}
      <ClientDetailModal
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onNavigateToProject={(slug) => onNavigate(`/work/${slug}`)}
      />

      {/* Concrete Attributable Testimonials */}
      <section className="space-y-10 border-t border-white/10 pt-16">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
            Client Endorsements
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Direct Feedback from Commission Directors
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-8 bg-[#0C0E14] border border-white/10 flex flex-col justify-between space-y-6"
            >
              <p className="text-sm text-neutral-300 leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="pt-4 border-t border-white/10">
                <span className="text-sm font-bold text-white block">
                  {t.author}
                </span>
                <span className="text-xs text-neutral-400 block font-mono">
                  {t.role}
                </span>
                <span className="text-xs text-[#E2B714] block font-mono mt-0.5">
                  {t.organization}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Direct Partnership Call to Action */}
      <div className="p-10 sm:p-14 bg-gradient-to-r from-neutral-900 to-[#10121A] border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Ready to partner on your next landmark project?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
            Whether for a flagship brand identity, immersive 3D booth, or global campaign film, we are ready to bring senior craft to your mission.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/contact')}
          className="px-8 py-4 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer shrink-0"
        >
          Initiate Collaboration
        </button>
      </div>
    </div>
  );
};
