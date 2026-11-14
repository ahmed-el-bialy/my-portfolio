import React, { useState, useEffect, useRef } from 'react';
import { ImageOff } from 'lucide-react';

export interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: 'lazy' | 'eager';
  referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
  fallbackContent?: React.ReactNode;
  onLoadComplete?: () => void;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = 'relative w-full h-full overflow-hidden',
  loading = 'lazy',
  referrerPolicy = 'no-referrer',
  fallbackContent,
  onLoadComplete,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setError(false);
    const imgEl = imgRef.current;
    if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
      setLoaded(true);
      onLoadComplete?.();
    } else {
      setLoaded(false);
    }
  }, [src, onLoadComplete]);

  return (
    <div className={containerClassName}>
      {/* Smooth gradient shimmer while image downloads/decodes */}
      {!loaded && !error && (
        <div className="absolute inset-0 skeleton-shimmer" aria-hidden="true" />
      )}

      {/* Image fades in calmly once ready */}
      {!error && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          referrerPolicy={referrerPolicy}
          onLoad={() => {
            setLoaded(true);
            onLoadComplete?.();
          }}
          onError={() => setError(true)}
          className={`transition-opacity duration-400 ease-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
        />
      )}

      {/* Clean fallback when offline or asset unavailable */}
      {error &&
        (fallbackContent || (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-100 dark:bg-[#161b27] text-slate-400 dark:text-slate-500 p-3 text-center">
            <ImageOff size={22} className="opacity-50" />
            <span className="text-[10px] font-mono opacity-75 line-clamp-1">{alt}</span>
          </div>
        ))}
    </div>
  );
};
