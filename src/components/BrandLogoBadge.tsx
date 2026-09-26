import React, { useState } from 'react';

interface BrandLogoBadgeProps {
  name: string;
  logoUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogoBadge: React.FC<BrandLogoBadgeProps> = ({
  name,
  logoUrl,
  className = '',
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);

  // Generate clean initials for logo monogram
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  // Sizing definitions
  const sizeClasses = {
    sm: 'h-8 max-w-[120px]',
    md: 'h-12 sm:h-14 max-w-[170px]',
    lg: 'h-16 sm:h-20 max-w-[240px]',
  };

  const containerHeight = {
    sm: 'h-8',
    md: 'h-12 sm:h-14',
    lg: 'h-16 sm:h-20',
  };

  if (logoUrl && !imgError) {
    return (
      <div className={`flex items-center justify-center ${containerHeight[size]} ${className}`}>
        <img
          src={logoUrl}
          alt={`${name} logo`}
          onError={() => setImgError(true)}
          className={`${sizeClasses[size]} w-auto object-contain filter brightness-95 group-hover:brightness-110 group-hover:scale-105 transition-all duration-300 drop-shadow-sm`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Fallback: Modern Minimalist Geometric Vector Logo Badge (Ensures it is ALWAYS a logo, never raw text)
  return (
    <div
      className={`flex items-center justify-center gap-2.5 px-4 py-2 border border-white/10 bg-white/[0.03] group-hover:border-[#E2B714]/60 group-hover:bg-[#E2B714]/[0.04] transition-all duration-300 select-none ${containerHeight[size]} ${className}`}
      title={`${name} Brand Identity`}
    >
      {/* Geometric Emblem Icon */}
      <svg
        className="w-5 h-5 text-[#E2B714] shrink-0 transform group-hover:scale-110 transition-transform"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
        <path d="M7 17L12 7L17 17M9 13H15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Styled Modern Geometric Logotype */}
      <div className="flex flex-col items-start leading-none">
        <span className="font-display font-extrabold text-xs sm:text-sm tracking-[0.2em] uppercase text-white group-hover:text-[#E2B714] transition-colors">
          {initials || name.slice(0, 3).toUpperCase()}
        </span>
        <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-neutral-400 font-semibold">
          {name.length > 14 ? `${name.slice(0, 12)}…` : name}
        </span>
      </div>
    </div>
  );
};
