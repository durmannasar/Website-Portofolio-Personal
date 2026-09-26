import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { getWebOptimizedUrl } from '../utils/imageOptimizer';

interface LightboxProps {
  onNavigate?: (path: string) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ onNavigate }) => {
  const {
    lightboxData,
    closeLightbox,
    nextLightboxImage,
    prevLightboxImage,
    setLightboxIndex,
    settings,
  } = useStudio();
  const cp = settings?.contentProtection;

  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0);
  const [touchDeltaY, setTouchDeltaY] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

  // Auto-hide swipe hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [lightboxData?.currentIndex]);

  // Reset zoom on slide change
  useEffect(() => {
    setIsZoomed(false);
    setTouchDeltaX(0);
    setTouchDeltaY(0);
  }, [lightboxData?.currentIndex]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailContainerRef.current && lightboxData) {
      const activeThumb = thumbnailContainerRef.current.children[
        lightboxData.currentIndex
      ] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [lightboxData?.currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxData) return;
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        nextLightboxImage();
      } else if (e.key === 'ArrowLeft') {
        prevLightboxImage();
      } else if (e.key === 'z' || e.key === 'Z') {
        setIsZoomed((prev) => !prev);
      }
    };

    if (lightboxData) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxData, closeLightbox, nextLightboxImage, prevLightboxImage]);

  // Touch Handlers for Mobile Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && !isZoomed) {
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
      setIsSwiping(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || touchStartX === null || touchStartY === null || isZoomed) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX;
    const deltaY = currentY - touchStartY;

    // Dampen touch move for smooth spring effect
    setTouchDeltaX(deltaX);
    setTouchDeltaY(deltaY);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    const minHorizontalSwipe = 45;
    const minVerticalDismiss = 80;

    // Check vertical swipe down to dismiss
    if (touchDeltaY > minVerticalDismiss && Math.abs(touchDeltaX) < 80) {
      closeLightbox();
    } else if (touchDeltaX < -minHorizontalSwipe) {
      // Swiped Left -> Next Image
      nextLightboxImage();
    } else if (touchDeltaX > minHorizontalSwipe) {
      // Swiped Right -> Prev Image
      prevLightboxImage();
    }

    setTouchStartX(null);
    setTouchStartY(null);
    setTouchDeltaX(0);
    setTouchDeltaY(0);
  };

  // Double tap to zoom handler
  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      setIsZoomed((prev) => !prev);
    }
    lastTapRef.current = now;
  };

  if (!lightboxData || lightboxData.images.length === 0) return null;

  const { images, currentIndex, title, subtitle, projectSlug, client, year } =
    lightboxData;
  const currentImage = images[currentIndex] || images[0];
  const hasMultiple = images.length > 1;

  const handleCaseStudyClick = () => {
    if (projectSlug && onNavigate) {
      closeLightbox();
      onNavigate(`/work/${projectSlug}`);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex flex-col justify-between bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200 select-none touch-none h-[100dvh] max-h-[100dvh] overflow-hidden"
      onClick={closeLightbox}
    >
      {/* Top Header Bar - Optimized for Mobile Portrait */}
      <div
        className="w-full px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between border-b border-white/10 bg-black/70 backdrop-blur-md z-30 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-neutral-400 min-w-0 pr-2">
          {hasMultiple && (
            <span className="text-[#E2B714] font-bold tracking-wider px-2 py-0.5 bg-[#E2B714]/10 border border-[#E2B714]/20 text-[11px] sm:text-xs shrink-0">
              {String(currentIndex + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(images.length).padStart(2, '0')}
            </span>
          )}

          <div className="min-w-0">
            {title ? (
              <span className="text-white font-sans font-semibold text-xs sm:text-sm truncate block max-w-[140px] sm:max-w-xs md:max-w-md">
                {title}
              </span>
            ) : (
              <span className="text-neutral-300 font-sans font-medium text-xs sm:text-sm">
                Visual Showcase
              </span>
            )}
            {client && (
              <span className="text-[10px] text-neutral-400 font-mono hidden md:inline">
                {client}{year ? ` · ${year}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Zoom Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            className="p-1.5 sm:p-2 text-neutral-300 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 transition-colors cursor-pointer"
            title={isZoomed ? 'Zoom out (1x)' : 'Zoom in (2x)'}
            aria-label="Toggle zoom"
          >
            {isZoomed ? (
              <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E2B714]" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          {projectSlug && onNavigate && (
            <button
              onClick={handleCaseStudyClick}
              className="px-2.5 sm:px-3 py-1.5 bg-white/10 hover:bg-[#E2B714] hover:text-black text-white text-[11px] sm:text-xs font-semibold uppercase tracking-wider flex items-center gap-1 border border-white/15 transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">Case Study</span>
              <span className="sm:hidden">Case</span>
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          )}

          {/* Close Lightbox */}
          <button
            onClick={closeLightbox}
            className="p-1.5 sm:p-2 text-neutral-300 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 transition-colors cursor-pointer"
            aria-label="Close image popup"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Main Responsive Image Stage */}
      <div
        className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden touch-pan-y"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile Swipe Hint Badge (Fades out automatically) */}
        {hasMultiple && showSwipeHint && !isZoomed && (
          <div className="absolute top-3 z-40 bg-black/75 backdrop-blur-md border border-white/15 px-3 py-1 text-[10px] text-neutral-300 font-mono flex items-center gap-1.5 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2B714] animate-ping" />
            <span>Geser / Swipe layar untuk navigasi gambar</span>
          </div>
        )}

        {/* Previous Image Button (Desktop & Tablet) */}
        {hasMultiple && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevLightboxImage();
            }}
            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 p-3 lg:p-4 bg-black/70 hover:bg-[#E2B714] text-white hover:text-black border border-white/15 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-2xl group"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 transform group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Dynamic Image Container with Touch Feedback & Zoom Support */}
        <div
          className={`relative w-full h-full flex items-center justify-center transition-all ${
            isSwiping ? 'duration-75' : 'duration-300'
          }`}
          style={{
            transform: isZoomed
              ? 'scale(1.85)'
              : `translate3d(${touchDeltaX * 0.8}px, ${touchDeltaY * 0.4}px, 0)`,
            opacity: Math.max(0.4, 1 - Math.abs(touchDeltaY) / 300),
            cursor: isZoomed ? 'zoom-out' : 'zoom-in',
          }}
          onClick={handleDoubleTap}
        >
          <img
            key={currentImage}
            src={cp?.protectOriginalImages !== false ? getWebOptimizedUrl(currentImage) : currentImage}
            alt={title || `Gallery visual ${currentIndex + 1}`}
            className="max-h-[calc(100dvh-130px)] sm:max-h-[calc(100dvh-150px)] w-auto max-w-[96vw] sm:max-w-[88vw] object-contain border border-white/10 shadow-2xl transition-all select-none pointer-events-auto"
            referrerPolicy="no-referrer"
            draggable={false}
            onContextMenu={(e) => {
              if (cp?.disableRightClick !== false) {
                e.preventDefault();
              }
            }}
            onDragStart={(e) => {
              if (cp?.disableImageDrag !== false) {
                e.preventDefault();
              }
            }}
          />

          {/* Watermark in Lightbox */}
          {cp?.enabled !== false && cp?.watermarkEnabled && (
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none flex select-none overflow-hidden"
              style={{ opacity: cp.watermarkOpacity || 0.28 }}
            >
              {cp.watermarkPosition === 'diagonal-repeat' ? (
                <div className="w-full h-full flex flex-wrap items-center justify-around rotate-[-25deg] scale-125 opacity-70">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <span
                      key={i}
                      className="font-mono text-[11px] text-white uppercase tracking-widest px-4 py-2 drop-shadow-md whitespace-nowrap"
                    >
                      {cp.watermarkText || 'Durman Nasar Studio'}
                    </span>
                  ))}
                </div>
              ) : (
                <div
                  className={`w-full h-full p-4 sm:p-6 flex ${
                    cp.watermarkPosition === 'center'
                      ? 'items-center justify-center'
                      : cp.watermarkPosition === 'bottom-left'
                      ? 'items-end justify-start'
                      : cp.watermarkPosition === 'top-right'
                      ? 'items-start justify-end'
                      : 'items-end justify-end'
                  }`}
                >
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-black/50 backdrop-blur-[2px] border border-white/15 rounded-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E2B714]" />
                    <span className="font-display font-medium text-xs text-white tracking-wider drop-shadow-sm">
                      {cp.watermarkText || 'Durman Nasar Studio'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Next Image Button (Desktop & Tablet) */}
        {hasMultiple && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextLightboxImage();
            }}
            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 p-3 lg:p-4 bg-black/70 hover:bg-[#E2B714] text-white hover:text-black border border-white/15 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-2xl group"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Mobile On-Screen Minimalist Quick Nav Controls (Only shown if multiple) */}
        {hasMultiple && !isZoomed && (
          <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-black/75 border border-white/20 backdrop-blur-lg px-2 py-1 shadow-2xl">
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevLightboxImage();
              }}
              className="p-1.5 text-neutral-300 hover:text-white active:text-[#E2B714] cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-bold text-neutral-300 tracking-wider">
              {currentIndex + 1}&thinsp;/&thinsp;{images.length}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextLightboxImage();
              }}
              className="p-1.5 text-neutral-300 hover:text-white active:text-[#E2B714] cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Strip Bar - Mobile Portrait Optimized */}
      <div
        className="w-full px-3.5 sm:px-6 py-2 sm:py-2.5 border-t border-white/10 bg-black/80 backdrop-blur-md z-30 shrink-0 flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[10px] sm:text-[11px] font-mono text-neutral-400 truncate max-w-[120px] sm:max-w-xs">
          <span>{subtitle || 'Durman Nasar Studio'}</span>
        </div>

        {/* Horizontally Scrollable Thumbnails */}
        {hasMultiple ? (
          <div
            ref={thumbnailContainerRef}
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-[65vw] sm:max-w-md py-0.5 scrollbar-none touch-pan-x"
          >
            {images.map((img, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative w-9 h-7 sm:w-12 sm:h-9 shrink-0 border overflow-hidden transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#E2B714] ring-2 ring-[#E2B714]/50 scale-105'
                      : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
                  }`}
                  aria-label={`Jump to slide ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    draggable={false}
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-[#E2B714]/20" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-[10px] text-neutral-500 font-mono">
            Double tap to zoom
          </div>
        )}
      </div>
    </div>
  );
};
