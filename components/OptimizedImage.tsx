import React, { useState, useMemo } from 'react';

interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
  aspectRatio?: string; // e.g., "aspect-square", "aspect-video"
  isPriority?: boolean;
  width?: number; // Logical width hint
  height?: number; // Logical height hint
  sizes?: string; // Standard HTML sizes attribute
}

/**
 * OptimizedImage handles production-grade image delivery.
 * - Prevents Layout Shift (CLS) via aspect-ratio and explicit dimensions.
 * - Uses native lazy loading for off-screen assets.
 * - Generates responsive srcSet for mock providers (Picsum).
 * - Decodes asynchronously to keep the main thread fluid.
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className = "", 
  aspectRatio = "aspect-square",
  isPriority = false,
  width,
  height,
  sizes = "100vw"
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Helper to generate responsive srcSet for mock data
  const responsiveProps = useMemo(() => {
    if (!src || hasError) return {};
    
    // Check if it's a Picsum URL to simulate a real CDN's resizing capabilities
    if (src.includes('picsum.photos')) {
      try {
        const urlObj = new URL(src);
        const pathParts = urlObj.pathname.split('/');
        // Extract basic info from URL format: /400/300 or /id/237/400/300
        // We replace dimensions with variable widths
        const base = urlObj.origin + urlObj.pathname.split('/').slice(0, -2).join('/');
        const query = urlObj.search;

        return {
          srcSet: `
            ${base}/200/200${query} 200w,
            ${base}/400/400${query} 400w,
            ${base}/800/800${query} 800w,
            ${base}/1200/1200${query} 1200w
          `,
          sizes: sizes
        };
      } catch (e) {
        return {};
      }
    }
    return {};
  }, [src, hasError, sizes]);

  // Fallback for missing or broken images
  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=f3f4f6&color=9ca3af&size=256`;
  const displaySrc = (hasError || !src) ? fallbackSrc : src;

  return (
    <div className={`relative overflow-hidden bg-gray-50 ${aspectRatio} ${className}`}>
      <img
        src={displaySrc}
        {...responsiveProps}
        alt={alt}
        width={width}
        height={height}
        loading={isPriority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        style={{ fetchPriority: isPriority ? "high" : "auto" } as any}
        className={`
          w-full h-full object-cover transition-all duration-700 ease-in-out
          ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'}
        `}
      />
      
      {/* Visual Skeleton while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100/50 animate-pulse flex items-center justify-center">
          <div className="w-1/3 h-1/3 bg-gray-200/50 rounded-full blur-xl"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;