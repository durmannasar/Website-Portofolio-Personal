/**
 * Durman Nasar Studio — Image Optimization & Protection Engine
 * 
 * 1. Separates Master Files (Private high-resolution original asset) from
 *    Web Display Derivatives (Optimized for fast loading & HiDPI retina displays,
 *    never exposing raw 6000x4000 camera or print exports).
 * 2. Provides optional canvas-level watermark baking and DOM shield layers.
 */

export interface WatermarkOptions {
  enabled?: boolean;
  text?: string;
  imageUrl?: string;
  opacity?: number; // 0.05 to 0.9
  position?: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'diagonal-repeat';
  scale?: number;
}

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'image/webp' | 'image/jpeg';
  watermark?: WatermarkOptions;
}

/**
 * Returns an optimized web display URL from a given source URL.
 * Automatically appends responsive query parameters for CDN/Unsplash assets
 * to prevent leaking excessive 6000x4000 raw originals.
 */
export function getWebOptimizedUrl(
  originalUrl: string,
  maxWidth = 1600,
  quality = 82
): string {
  if (!originalUrl) return '';

  // Handle Unsplash images
  if (originalUrl.includes('images.unsplash.com')) {
    try {
      const url = new URL(originalUrl);
      url.searchParams.set('w', String(maxWidth));
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('q', String(quality));
      return url.toString();
    } catch {
      return originalUrl;
    }
  }

  return originalUrl;
}

/**
 * Processes a high-resolution Master File and generates an optimized Web Display derivative
 * using an HTML5 Canvas. Optionally bakes in the studio watermark into the pixels.
 */
export async function generateWebDerivative(
  file: File,
  options: OptimizationOptions = {}
): Promise<{
  webFile: File;
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
}> {
  const {
    maxWidth = 1920,
    maxHeight = 1440,
    quality = 0.85,
    format = 'image/webp',
    watermark,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        try {
          // Calculate proportional downscaling
          let targetWidth = img.width;
          let targetHeight = img.height;

          if (targetWidth > maxWidth || targetHeight > maxHeight) {
            const widthRatio = maxWidth / targetWidth;
            const heightRatio = maxHeight / targetHeight;
            const bestRatio = Math.min(widthRatio, heightRatio);

            targetWidth = Math.round(targetWidth * bestRatio);
            targetHeight = Math.round(targetHeight * bestRatio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Canvas 2D context not available');
          }

          // High-quality downsampling interpolation
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw scaled image
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Apply baked-in watermark if configured
          if (watermark?.enabled) {
            await applyCanvasWatermark(ctx, targetWidth, targetHeight, watermark);
          }

          // Export as WebP (with JPEG fallback)
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                // Fallback to JPEG if WebP blob creation fails
                canvas.toBlob(
                  (fallbackBlob) => {
                    if (!fallbackBlob) {
                      reject(new Error('Failed to generate image blob'));
                      return;
                    }
                    finalizeResult(fallbackBlob, 'image/jpeg');
                  },
                  'image/jpeg',
                  quality
                );
                return;
              }
              finalizeResult(blob, format);
            },
            format,
            quality
          );

          function finalizeResult(blob: Blob, actualFormat: string) {
            const ext = actualFormat === 'image/webp' ? '.webp' : '.jpg';
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const webFileName = `${baseName}_web_opt${ext}`;

            const webFile = new File([blob], webFileName, {
              type: actualFormat,
              lastModified: Date.now(),
            });

            const dataUrl = canvas.toDataURL(actualFormat, quality);

            resolve({
              webFile,
              dataUrl,
              width: targetWidth,
              height: targetHeight,
              originalSize: file.size,
              optimizedSize: webFile.size,
            });
          }
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Paints a watermark onto an HTML5 Canvas context
 */
async function applyCanvasWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: WatermarkOptions
): Promise<void> {
  const {
    text = 'Durman Nasar Studio',
    imageUrl,
    opacity = 0.28,
    position = 'bottom-right',
    scale = 1,
  } = options;

  ctx.save();
  ctx.globalAlpha = Math.max(0.05, Math.min(opacity, 0.9));

  // If a custom watermark image is provided, draw it
  if (imageUrl) {
    try {
      const watermarkImg = await loadImage(imageUrl);
      const wmAspect = watermarkImg.width / watermarkImg.height;
      const baseWidth = Math.min(width * 0.25, 260) * scale;
      const baseHeight = baseWidth / wmAspect;

      let x = width - baseWidth - 24;
      let y = height - baseHeight - 24;

      if (position === 'center') {
        x = (width - baseWidth) / 2;
        y = (height - baseHeight) / 2;
      } else if (position === 'bottom-left') {
        x = 24;
        y = height - baseHeight - 24;
      } else if (position === 'top-right') {
        x = width - baseWidth - 24;
        y = 24;
      }

      ctx.drawImage(watermarkImg, x, y, baseWidth, baseHeight);
      ctx.restore();
      return;
    } catch {
      // Fallback to text watermark
    }
  }

  // Text Watermark
  const fontSize = Math.max(12, Math.round((Math.min(width, height) / 38) * scale));
  ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  if (position === 'diagonal-repeat') {
    // Subtle repeating diagonal watermark pattern
    ctx.rotate((-25 * Math.PI) / 180);
    const stepX = 320;
    const stepY = 160;
    for (let x = -width; x < width * 2; x += stepX) {
      for (let y = -height; y < height * 2; y += stepY) {
        ctx.fillText(text, x, y);
      }
    }
  } else if (position === 'center') {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
  } else if (position === 'bottom-left') {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(text, 28, height - 24);
  } else if (position === 'top-right') {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(text, width - 28, 24);
  } else {
    // Default: bottom-right
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(text, width - 28, height - 24);
  }

  ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}
