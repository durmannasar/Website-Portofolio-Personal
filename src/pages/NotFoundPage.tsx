import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 text-center">
      <div className="space-y-6 max-w-md">
        <span className="font-mono text-sm uppercase tracking-widest text-[#E2B714]">
          404 — Artifact Not Located
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white">
          Page Does Not Exist
        </h1>
        <p className="text-neutral-400 text-sm leading-relaxed">
          The requested route or project address has moved, been archived, or does not exist in the studio directory.
        </p>
        <div className="pt-4 flex items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('/')}
            className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-[#E2B714] transition-colors cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Studio Home</span>
          </button>
          <button
            onClick={() => onNavigate('/work')}
            className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          >
            <span>View Portfolio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
