import React from 'react';
import { ArrowUpRight, CheckCircle2, Wrench, Sparkles } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { trackEvent } from '../utils/analytics';

interface ServicesPageProps {
  onNavigate: (path: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const { services } = useStudio();

  const handleInquireService = (serviceTitle: string) => {
    trackEvent('service_view', { service_name: serviceTitle });
    onNavigate(`/contact?service=${encodeURIComponent(serviceTitle)}`);
  };

  const processSteps = [
    {
      step: '01',
      title: 'Discovery & Strategic Interrogation',
      description:
        'We deconstruct your market positioning, commercial objectives, competitive white space, and target psychology before proposing creative directions.',
    },
    {
      step: '02',
      title: 'Concept & Aesthetic Architecture',
      description:
        'We explore tactile moodboards, kinetic animatics, spatial prototypes, and typographic structures, refining until a singular, defensible direction emerges.',
    },
    {
      step: '03',
      title: 'High-Fidelity Craft & Execution',
      description:
        'Senior-only hands-on execution. Whether mastering 4K anamorphic cinema footage, rendering parametric 3D pavilions, or building comprehensive identity guidelines.',
    },
    {
      step: '04',
      title: 'Deployment, Guidelines & Impact',
      description:
        'We deliver production-ready assets, fabrication specifications, launch assets, and documentation to guarantee flawless implementation.',
    },
  ];

  return (
    <div className="pt-28 pb-24 px-6 max-w-7xl mx-auto space-y-24">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl border-b border-white/10 pb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
          Studio Capabilities
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          Services & Creative Disciplines
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          Durman Nasar Studio offers {services.length} core disciplines, engineered to operate seamlessly as an integrated creative department or as precision standalone commissions.
        </p>
      </div>

      {/* Services List (01 through 08) */}
      <div className="space-y-16">
        {services.map((service) => (
          <div
            key={service.id}
            id={service.title.toLowerCase().replace(/\s+/g, '-')}
            className="p-8 sm:p-12 bg-[#0C0E14] border border-white/10 space-y-8 scroll-mt-28"
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 border-b border-white/10 pb-8">
              <div className="space-y-3 max-w-2xl">
                <span className="font-mono text-sm text-[#E2B714] font-semibold">
                  {service.code}. DISCIPLINE
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {service.title}
                </h2>
                <p className="text-base text-neutral-300 font-medium leading-relaxed">
                  {service.tagline}
                </p>
                <p className="text-sm text-neutral-400 leading-relaxed pt-2">
                  {service.description}
                </p>
              </div>

              <div className="shrink-0 flex flex-col gap-3">
                <button
                  onClick={() => handleInquireService(service.title)}
                  className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap"
                >
                  <span>Inquire About {service.title}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate(`/work?category=${encodeURIComponent(service.title)}`)}
                  className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer text-center"
                >
                  View Related Projects
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
              {/* Deliverables Column */}
              <div className="md:col-span-8 space-y-4">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block">
                  Key Deliverables & Scope
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-neutral-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#E2B714] shrink-0 mt-0.5" />
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools & Production Stack Column */}
              <div className="md:col-span-4 space-y-4 md:border-l md:border-white/10 md:pl-8">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block">
                  Software & Technical Stack
                </span>
                <div className="flex flex-wrap gap-2">
                  {service.tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono text-neutral-300 bg-white/5 px-2.5 py-1 border border-white/10"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Studio Working Methodology */}
      <section className="space-y-10 border-t border-white/10 pt-16">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
            Methodology
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How We Execute Commissions
          </h2>
          <p className="text-sm text-neutral-400">
            A battle-tested four-phase process designed to reduce revision friction and guarantee commercial impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processSteps.map((p) => (
            <div
              key={p.step}
              className="p-6 bg-[#0A0C12] border border-white/10 space-y-4"
            >
              <span className="font-mono text-2xl font-bold text-[#E2B714] block">
                {p.step}
              </span>
              <h3 className="font-display text-lg font-bold text-white">
                {p.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Direct Inquiry Banner */}
      <div className="p-10 sm:p-14 bg-gradient-to-r from-neutral-900 to-[#10121A] border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Need a tailored multi-discipline scope?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
            We frequently assemble customized teams for complex brand launches combining 3D booth architecture, launch films, identity, and digital performance.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/contact')}
          className="px-8 py-4 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer shrink-0"
        >
          Request Custom Proposal
        </button>
      </div>
    </div>
  );
};
