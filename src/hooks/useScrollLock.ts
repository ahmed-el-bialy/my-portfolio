import { useEffect } from 'react';

let activeLockCount = 0;
let savedBodyOverflow = '';
let savedHtmlOverflow = '';

/**
 * Global scroll-lock hook that safely freezes scrolling without
 * resetting body position to 'fixed' (which causes iframe white/black screen resets).
 * Uses reference counting so nested modals never prematurely release the lock.
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    if (activeLockCount === 0) {
      savedBodyOverflow = document.body.style.overflow;
      savedHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    activeLockCount += 1;

    return () => {
      activeLockCount = Math.max(0, activeLockCount - 1);
      if (activeLockCount === 0) {
        document.body.style.overflow = savedBodyOverflow;
        document.documentElement.style.overflow = savedHtmlOverflow;
      }
    };
  }, [isLocked]);
}
