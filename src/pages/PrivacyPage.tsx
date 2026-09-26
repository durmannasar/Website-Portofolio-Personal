import React from 'react';

interface PrivacyPageProps {
  onNavigate: (path: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  return (
    <div className="pt-28 pb-24 px-6 max-w-4xl mx-auto space-y-12">
      <div className="space-y-4 border-b border-white/10 pb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-[#E2B714]">
          Legal & Governance
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-neutral-500">
          Last updated: January 2026 · Durman Nasar Studio
        </p>
      </div>

      <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-white">1. Commitment to Confidentiality</h2>
          <p>
            At Durman Nasar Studio (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;the Studio&rdquo;), we take client confidentiality and data integrity with the highest degree of professional seriousness. This Privacy Policy details how we collect, store, and utilize data provided through our website and project inquiries.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-white">2. Information Collection</h2>
          <p>
            We collect personal identification information submitted voluntarily via our contact inquiry forms, including your full name, company name, corporate email address, telephone/WhatsApp contact details, and project scoping parameters.
          </p>
          <p>
            Additionally, our web servers collect standard anonymized telemetry (page views, browser type, geographic region) to ensure optimal delivery and performance via Google Analytics 4.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-white">3. Non-Disclosure & Intellectual Property</h2>
          <p>
            Any proprietary brand materials, architectural floorplans, or commercial strategies shared with Durman Nasar Studio in pre-commission stages are treated as strictly confidential and will never be shared, licensed, or exposed to third parties without prior written consent.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-white">4. Data Retention & Contact</h2>
          <p>
            You may request deletion or auditing of your inquiry data at any time by contacting the studio director at{' '}
            <a href="mailto:drmn@durmannasarstudio.com" className="text-[#E2B714] underline">
              drmn@durmannasarstudio.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
};
