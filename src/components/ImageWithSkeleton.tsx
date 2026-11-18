import React, { useState, useEffect, useRef } from 'react';
import { Smartphone } from 'lucide-react';

export interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: 'lazy' | 'eager';
  referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'];
  fallbackContent?: React.ReactNode;
  onLoadComplete?: () => void;
  variant?: 'default' | 'phone';
  disableProxy?: boolean;
}

const MEMORY_LOADED_URLS = new Set<string>();
const INFLIGHT_PRELOADS = new Map<string, Promise<void>>();

/**
 * Resolves GitHub raw media via Express /api/media/screen cache when in browser runtime,
 * falling back cleanly to original raw URL if proxy isn't active (e.g. static deploy).
 */
export function resolveProxiedImageUrl(rawUrl: string): string {
  if (!rawUrl || typeof window === 'undefined') return rawUrl;
  try {
    const parsed = new URL(rawUrl, window.location.origin);
    const isGithubRaw =
      parsed.hostname === 'raw.githubusercontent.com' &&
      parsed.pathname.toLowerCase().startsWith('/ahmed-el-bialy/');
    if (isGithubRaw) {
      return `/api/media/screen?url=${encodeURIComponent(rawUrl)}`;
    }
  } catch {
    // keep rawUrl
  }
  return rawUrl;
}

/**
 * Preloads image URLs safely into browser memory so screen switches happen without black flashes.
 */
export function preloadImageUrls(urls: string[]): void {
  if (typeof window === 'undefined') return;
  for (const raw of urls) {
    if (!raw) continue;
    const proxied = resolveProxiedImageUrl(raw);
    if (MEMORY_LOADED_URLS.has(raw) || MEMORY_LOADED_URLS.has(proxied)) continue;
    if (INFLIGHT_PRELOADS.has(proxied)) continue;

    const task = new Promise<void>((resolve) => {
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.onload = () => {
        MEMORY_LOADED_URLS.add(proxied);
        MEMORY_LOADED_URLS.add(raw);
        resolve();
      };
      img.onerror = () => {
        if (proxied !== raw) {
          const fallbackImg = new Image();
          fallbackImg.referrerPolicy = 'no-referrer';
          fallbackImg.onload = () => {
            MEMORY_LOADED_URLS.add(raw);
            resolve();
          };
          fallbackImg.onerror = () => resolve();
          fallbackImg.src = raw;
        } else {
          resolve();
        }
      };
      img.src = proxied;
    });
    INFLIGHT_PRELOADS.set(proxied, task);
  }
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = 'relative w-full h-full overflow-hidden',
  loading = 'eager',
  referrerPolicy = 'no-referrer',
  fallbackContent,
  onLoadComplete,
  variant = 'default',
  disableProxy = false,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const onLoadCompleteRef = useRef(onLoadComplete);
  onLoadCompleteRef.current = onLoadComplete;

  const primarySrc = disableProxy ? src : resolveProxiedImageUrl(src);
  const [activeSrc, setActiveSrc] = useState<string>(primarySrc);
  const [loaded, setLoaded] = useState<boolean>(() =>
    MEMORY_LOADED_URLS.has(primarySrc) || MEMORY_LOADED_URLS.has(src)
  );
  const [error, setError] = useState<boolean>(false);
  const [triedDirectFallback, setTriedDirectFallback] = useState<boolean>(false);

  useEffect(() => {
    const nextPrimary = disableProxy ? src : resolveProxiedImageUrl(src);
    setActiveSrc(nextPrimary);
    setTriedDirectFallback(false);
    setError(false);

    if (MEMORY_LOADED_URLS.has(nextPrimary) || MEMORY_LOADED_URLS.has(src)) {
      setLoaded(true);
      onLoadCompleteRef.current?.();
      return;
    }

    const imgEl = imgRef.current;
    if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
      MEMORY_LOADED_URLS.add(nextPrimary);
      MEMORY_LOADED_URLS.add(src);
      setLoaded(true);
      onLoadCompleteRef.current?.();
    } else {
      setLoaded(false);
    }
  }, [src, disableProxy]);

  const handleLoad = () => {
    MEMORY_LOADED_URLS.add(activeSrc);
    MEMORY_LOADED_URLS.add(src);
    setLoaded(true);
    setError(false);
    onLoadCompleteRef.current?.();
  };

  const handleError = () => {
    if (!triedDirectFallback && activeSrc !== src && src) {
      setTriedDirectFallback(true);
      setActiveSrc(src);
      return;
    }
    setError(true);
  };

  return (
    <div className={containerClassName}>
      {/* High-visibility skeleton while image downloads */}
      {!loaded && !error && (
        <div
          className="absolute inset-0 skeleton-shimmer flex flex-col justify-between p-2.5 select-none pointer-events-none"
          aria-hidden="true"
        >
          {variant === 'phone' && (
            <>
              <div className="flex items-center justify-between gap-1 pt-2 px-0.5 opacity-60">
                <span className="h-1.5 w-6 rounded-full bg-white/30 dark:bg-white/25" />
                <span className="h-1.5 w-4 rounded-full bg-white/30 dark:bg-white/25" />
              </div>
              <div className="space-y-1.5 my-auto opacity-55">
                <div className="h-12 w-full rounded-xl bg-white/15 border border-white/10" />
                <div className="h-2.5 w-3/4 rounded-full bg-white/20" />
                <div className="h-2 w-1/2 rounded-full bg-white/15" />
              </div>
              <div className="flex items-center justify-around py-1.5 px-2 rounded-lg bg-white/10 opacity-50">
                <span className="h-2 w-2 rounded-full bg-white/30" />
                <span className="h-2 w-2 rounded-full bg-white/30" />
                <span className="h-2 w-2 rounded-full bg-white/30" />
              </div>
            </>
          )}
        </div>
      )}

      {/* Smooth fade-in once image is ready */}
      {!error && activeSrc && (
        <img
          ref={imgRef}
          src={activeSrc}
          alt={alt}
          loading={loading}
          decoding="async"
          referrerPolicy={referrerPolicy}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ease-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
        />
      )}

      {/* Architectural Device Fallback when offline or asset unavailable */}
      {error &&
        (fallbackContent || (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#141b2d] to-[#0d1322] text-slate-300 p-3 text-center">
            <div className="w-9 h-9 rounded-xl bg-[#0284ff]/20 border border-[#00C7FF]/30 flex items-center justify-center text-[#00C7FF]">
              <Smartphone size={18} />
            </div>
            <span className="text-[10px] font-mono text-slate-300/90 line-clamp-2 leading-tight">
              {alt}
            </span>
          </div>
        ))}
    </div>
  );
};
