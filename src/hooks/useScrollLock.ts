import { useEffect } from 'react';

/**
 * Global scroll-lock hook that safely freezes scrolling without
 * resetting body position to 'fixed' (which causes iframe white/black screen resets).
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // Safely disable scrolling without repositioning the body or breaking iFrames
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isLocked]);
}
