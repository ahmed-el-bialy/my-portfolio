import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PageSkeletonLoader } from './PageSkeletonLoader';
import { Language, useLanguage } from '../context/LanguageContext';

interface LanguageTransitionOverlayProps {
  targetLang: Language | null;
  isDark: boolean;
  onComplete: () => void;
}

/**
 * Full-viewport fixed transition curtain for AR <-> EN language switches.
 * Covers Navbar, mobile bottom dock, main stage, and Footer atomically so
 * RTL/LTR and font changes finish behind an opaque canvas before revealing.
 */
export const LanguageTransitionOverlay: React.FC<LanguageTransitionOverlayProps> = ({
  targetLang,
  isDark,
  onComplete,
}) => {
  const { lang } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [lockedTargetLang] = useState<Language | null>(targetLang);
  const isReadyRef = useRef<boolean>(false);

  const effectiveTarget = lockedTargetLang || targetLang || (lang === 'ar' ? 'en' : 'ar');

  useEffect(() => {
    let cancelled = false;

    const markReady = () => {
      if (!cancelled) {
        isReadyRef.current = true;
      }
    };

    // Wait until LanguageContext has committed the target language to DOM & fonts settle
    if (lang === effectiveTarget) {
      const rafId = window.requestAnimationFrame(() => {
        if (typeof document !== 'undefined' && document.fonts?.ready) {
          document.fonts.ready.then(markReady).catch(markReady);
        } else {
          markReady();
        }
      });
      const shortCap = window.setTimeout(markReady, 750);
      return () => {
        cancelled = true;
        window.cancelAnimationFrame(rafId);
        window.clearTimeout(shortCap);
      };
    }

    const hardCap = window.setTimeout(markReady, 1800);
    return () => {
      cancelled = true;
      window.clearTimeout(hardCap);
    };
  }, [lang, effectiveTarget]);

  return (
    <motion.div
      key="language-transition-overlay"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
      }}
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : {
              opacity: 0,
              transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
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

      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        <PageSkeletonLoader
          view="language"
          targetLang={effectiveTarget}
          isDark={isDark}
          pacing="entry"
          cycles={1}
          loop={false}
          showProgress={true}
          fullScreen={true}
          isReadyRef={isReadyRef}
          onSequenceComplete={onComplete}
        />
      </div>
    </motion.div>
  );
};
