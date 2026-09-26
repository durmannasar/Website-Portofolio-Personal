import React from 'react';

interface TermsPageProps {
  onNavigate: (path: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  return (
    <div className="pt-28 pb-24 px-6 max-w-4xl mx-auto space-y-12">
      <div className="space-y-4 border-b border-white/10 pb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
          Studio Engagement
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Terms & Conditions of Service
        </h1>
        <p className="text-xs font-mono text-neutral-500">
          Durman Nasar Studio · Professional Standard Terms
        </p>
      </div>

      <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-white">1. Scope of Engagement</h2>
          <p>
            All professional commissions executed by Durman Nasar Studio across Graphic Design, Motion Graphics, Social Media, Digital Marketing, Video Editing, Photography, Videography, and 3D Exhibition Booth Design are governed by individualized Statements of Work (SOW) detailing milestone timelines, review cycles, and deliverable specifications.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-white">2. Intellectual Property Rights</h2>
          <p>
            Upon settlement of all invoice balances, the client obtains full agreed commercial usage rights to final approved deliverables. Preliminary concepts, unapproved sketches, working 3D source files, and proprietary studio workflow scripts remain the intellectual property of Durman Nasar Studio unless explicit buyout terms are executed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-white">3. Portfolio Representation</h2>
          <p>
            Unless explicitly bound by an unexpired Non-Disclosure Agreement (NDA), Durman Nasar Studio reserves the right to showcase completed works, case studies, and photography in our online archive and professional competition submissions.
          </p>
        </section>
      </div>
    </div>
  );
};
