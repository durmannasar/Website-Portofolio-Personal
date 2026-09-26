import React from 'react';
import { ArrowUpRight, Award, Compass, Cpu, Target } from 'lucide-react';
import { useStudio } from '../context/StudioContext';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { settings } = useStudio();

  const corePrinciples = [
    {
      icon: Target,
      title: 'Strategy Precedes Styling',
      description:
        'Aesthetics without strategic clarity are merely decoration. We interrogate business models, user sentiment, and market whitespace to ensure every visual decision accelerates commercial objectives.',
    },
    {
      icon: Cpu,
      title: 'Multidisciplinary Synthesis',
      description:
        'Great brands do not exist in departmental silos. By uniting graphic design, 3D spatial environments, cinematic film, and algorithmic performance, we create seamless brand worlds.',
    },
    {
      icon: Compass,
      title: 'Direct Senior Execution',
      description:
        'When you engage Durman Nasar Studio, your project is led and crafted by experienced senior specialists, never passed down to junior agency tiers.',
    },
    {
      icon: Award,
      title: 'Obsessive Craftsmanship',
      description:
        'From micro-kerning in custom typography and color grading on DaVinci reference monitors to millimeter precision on 3D expo fabrication drawings, details define greatness.',
    },
  ];

  const toolsList = [
    { category: 'Brand & Graphic Systems', tools: 'Adobe Illustrator, Adobe InDesign, Figma, Glyphs, Photoshop' },
    { category: '3D Spatial & Architecture', tools: 'Cinema 4D, 3ds Max, Blender, V-Ray, AutoCAD, Corona' },
    { category: 'Film, Motion & Post', tools: 'DaVinci Resolve Studio, Adobe After Effects, Premiere Pro, Octane' },
    { category: 'Growth & Analytics', tools: 'Google Analytics 4, Meta Ads Manager, Google Ads, Mixpanel' },
  ];

  return (
    <div className="pt-28 pb-24 px-6 max-w-7xl mx-auto space-y-24">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl border-b border-white/10 pb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
          Studio Profile
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          About Durman Nasar Studio
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          A bespoke creative practice founded on the conviction that brand power is generated at the intersection of rigorous design thinking and multidisciplinary technology.
        </p>
      </div>

      {/* Hero Editorial Profile Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 relative">
          <div className="aspect-[4/5] bg-neutral-900 border border-white/10 overflow-hidden">
            <img
              src="/src/assets/images/hero_studio_showcase_1790391271997.jpg"
              alt="Durman Nasar Studio workspace"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="p-4 bg-[#0A0C12] border-x border-b border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-[#E2B714]">Durman Nasar Studio</span>
            <span className="text-neutral-500">Jakarta · Worldwide Commissions</span>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
            Creative Direction & Philosophy
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            Bridging imagination, strategy, and execution.
          </h2>
          <div className="space-y-4 text-neutral-300 text-sm sm:text-base leading-relaxed">
            <p>
              Founded by <strong>Durman Nasar</strong>, our studio operates as both an agile creative laboratory and a high-caliber execution partner for discerning brands across Southeast Asia and internationally.
            </p>
            <p>
              Over nearly a decade of dedicated practice, we have recognized that contemporary marketing challenges cannot be resolved through single-medium solutions. A luxury property launch requires spatial 3D visualization, cinematic documentary film, exquisite printed investor books, and precision programmatic performance campaigns.
            </p>
            <p>
              By mastering eight interconnected creative disciplines, Durman Nasar Studio offers our clients total creative cohesion, faster decision cycles, and uncompromised aesthetic integrity.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('/contact')}
              className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Schedule Studio Consultation</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/work')}
              className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            >
              Explore Portfolio
            </button>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="space-y-10 border-t border-white/10 pt-16">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
            Studio Foundations
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Our Guiding Principles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {corePrinciples.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-8 bg-[#0C0E14] border border-white/10 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/5 border border-white/10 text-[#E2B714]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">
                    {p.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tools & Production Infrastructure */}
      <section className="space-y-10 border-t border-white/10 pt-16">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
            Technical Arsenal
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Software & Equipment Standards
          </h2>
          <p className="text-sm text-neutral-400">
            We invest in industry-standard hardware, color-calibrated monitoring, medium-format sensors, and high-performance render clusters to ensure uncompromising delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {toolsList.map((item, idx) => (
            <div
              key={idx}
              className="p-6 bg-[#0A0C12] border border-white/10 space-y-2"
            >
              <span className="text-xs font-mono uppercase text-[#E2B714]">
                {item.category}
              </span>
              <p className="text-xs sm:text-sm text-white font-mono leading-relaxed">
                {item.tools}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Target Industries */}
      <section className="p-8 sm:p-12 bg-neutral-900/40 border border-white/10 space-y-6">
        <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
          Domain Expertise
        </span>
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Sectors & Client Ecosystems
        </h3>
        <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
          We bring specialized strategic experience to luxury hospitality resorts, premium property developments, high-growth technology enterprises, corporate institutions, and lifestyle lifestyle brands.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('/clients')}
            className="text-xs font-semibold uppercase tracking-wider text-white hover:text-[#E2B714] flex items-center gap-2 cursor-pointer"
          >
            <span>View Client Directory</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
