import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LeafAnimation } from './LeafAnimation';
import { useLanguage } from '../context/LanguageContext';

interface OpeningBootOverlayProps {
  isDark: boolean;
  onComplete: () => void;
}

/**
 * Self-contained fixed full-viewport overlay displaying two crisp, uninterrupted
 * Leaf calligraphy strokes and a monotonic 0%->100% compositor counter on site arrival.
 * Dissolves smoothly once both cycles and fonts/hero assets are ready (no Skip button).
 */
export const OpeningBootOverlay: React.FC<OpeningBootOverlayProps> = ({
  isDark,
  onComplete,
}) => {
  const { lang } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const isReadyRef = useRef<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const markReady = () => {
      if (!cancelled) {
        isReadyRef.current = true;
      }
    };

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(markReady).catch(markReady);
    } else {
      markReady();
    }

    // Hard safety cap so throttled networks never hang beyond two calm 2.2s leaf passes
    const capTimer = window.setTimeout(markReady, 4200);

    return () => {
      cancelled = true;
      window.clearTimeout(capTimer);
    };
  }, []);

  return (
    <motion.div
      key="opening-boot-overlay"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : {
              opacity: 0,
              scale: 1.02,
              transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] },
            }
      }
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-[#08090d] px-4 select-none touch-none overscroll-contain"
      aria-busy="true"
      aria-live="polite"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-architectural-grid pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center justify-center">
        <LeafAnimation
          label={
            lang === 'ar'
              ? 'جاري تجهيز المعرض والواجهة...'
              : 'Preparing Portfolio & Interface...'
          }
          isDark={isDark}
          pacing="entry"
          cycles={2}
          loop={false}
          showProgress={true}
          isReadyRef={isReadyRef}
          onSequenceComplete={onComplete}
        />
      </div>
    </motion.div>
  );
};
