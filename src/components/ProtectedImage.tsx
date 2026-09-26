import React from 'react';
import { useStudio } from '../context/StudioContext';
import { getWebOptimizedUrl } from '../utils/imageOptimizer';

export interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  masterSrc?: string; // Private master reference (not exposed to DOM)
  customWatermark?: {
    enabled?: boolean;
    text?: string;
    position?: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'diagonal-repeat';
    opacity?: number;
  };
  disableProtection?: boolean; // For admin preview if needed
  onClick?: (e: React.MouseEvent<HTMLDivElement | HTMLImageElement>) => void;
  aspectRatio?: string;
}

export const ProtectedImage: React.FC<ProtectedImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  customWatermark,
  disableProtection = false,
  onClick,
  aspectRatio,
  loading = 'lazy',
  ...imgProps
}) => {
  const { settings } = useStudio();
  const cp = settings.contentProtection;

  // Determine if protection is active
  const isProtectionActive = !disableProtection && cp?.enabled !== false;
  const isDragDisabled = isProtectionActive && cp?.disableImageDrag !== false;
  const isRightClickDisabled = isProtectionActive && cp?.disableRightClick !== false;
  const isWatermarkActive =
    isProtectionActive &&
    (customWatermark?.enabled ?? cp?.watermarkEnabled ?? false);

  const watermarkText =
    customWatermark?.text || cp?.watermarkText || 'Durman Nasar Studio';
  const watermarkPos =
    customWatermark?.position || cp?.watermarkPosition || 'bottom-right';
  const watermarkOpacity =
    customWatermark?.opacity ?? cp?.watermarkOpacity ?? 0.28;

  // Automatically serve the web-optimized derivative rather than a raw massive original
  const displaySrc = cp?.protectOriginalImages !== false ? getWebOptimizedUrl(src) : src;

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isRightClickDisabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isDragDisabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      className={`relative inline-block overflow-hidden select-none ${containerClassName}`}
      style={{
        aspectRatio,
        WebkitTouchCallout: isProtectionActive ? 'none' : 'default',
        userSelect: isProtectionActive ? 'none' : 'auto',
      }}
      onClick={onClick}
      onContextMenu={handleContextMenu}
    >
      {/* 
        Semantic HTML <img> for 100% Google SEO Crawlability & Accessibility.
        Contains descriptive alt text, lazy-loading, and responsive dimensions.
      */}
      <img
        src={displaySrc}
        alt={alt}
        loading={loading}
        decoding="async"
        draggable={!isDragDisabled}
        onDragStart={handleDragStart}
        onContextMenu={handleContextMenu}
        className={`pointer-events-auto select-none transition-all duration-300 ${className}`}
        style={{
          WebkitTouchCallout: isProtectionActive ? 'none' : 'default',
          userSelect: isProtectionActive ? 'none' : 'auto',
          WebkitUserSelect: isProtectionActive ? 'none' : 'auto',
        }}
        referrerPolicy="no-referrer"
        {...imgProps}
      />

      {/* Layered Anti-Save Shield Layer (Protects against casual desktop drag-out and right-click) */}
      {isProtectionActive && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 pointer-events-none select-none bg-transparent"
          style={{ WebkitTouchCallout: 'none' }}
        />
      )}

      {/* Optional Subtle Studio Watermark Layer */}
      {isWatermarkActive && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-20 pointer-events-none flex select-none overflow-hidden"
          style={{ opacity: watermarkOpacity }}
        >
          {watermarkPos === 'diagonal-repeat' ? (
            <div className="w-full h-full flex flex-wrap items-center justify-around rotate-[-25deg] scale-125 opacity-70">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className="font-mono text-[10px] sm:text-xs text-white uppercase tracking-widest px-4 py-2 drop-shadow-md whitespace-nowrap"
                >
                  {watermarkText}
                </span>
              ))}
            </div>
          ) : (
            <div
              className={`w-full h-full p-3 sm:p-4 flex ${
                watermarkPos === 'center'
                  ? 'items-center justify-center'
                  : watermarkPos === 'bottom-left'
                  ? 'items-end justify-start'
                  : watermarkPos === 'top-right'
                  ? 'items-start justify-end'
                  : 'items-end justify-end'
              }`}
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-[2px] border border-white/10 rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E2B714]" />
                <span className="font-display font-medium text-[10px] sm:text-[11px] text-white tracking-wider drop-shadow-sm">
                  {watermarkText}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
