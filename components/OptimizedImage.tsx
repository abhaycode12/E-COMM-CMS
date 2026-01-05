
import React, { useState } from 'react';

interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
  aspectRatio?: string; // e.g., "aspect-square", "aspect-video"
  isPriority?: boolean;
}

/**
 * OptimizedImage handles production-grade image delivery.
 * - Prevents Layout Shift (CLS) via aspect-ratio containers.
 * - Uses native lazy loading for off-screen assets.
 * - Decodes asynchronously to keep the main thread fluid.
 * - Graceful fade-in transition once loaded.
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className = "", 
  aspectRatio = "aspect-square",
  isPriority = false 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fallback for missing or broken images
  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=f3f4f6&color=9ca3af&size=128`;
  const displaySrc = (hasError || !src) ? fallbackSrc : src;

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${aspectRatio} ${className}`}>
      <img
        src={displaySrc}
        alt={alt}
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
      
      {/* Skeleton overlay while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <span className="text-gray-200">⌛</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
