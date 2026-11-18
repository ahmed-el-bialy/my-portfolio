import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LeafAnimation } from './LeafAnimation';
import { useLanguage } from '../context/LanguageContext';

interface OpeningBootOverlayProps {
  isDark: boolean;
  onComplete: () => void;
}

/**
 * Self-contained fixed overlay loader displaying the uninterrupted Leaf calligraphy stroke
 * and 0%->100% compositor counter on every fresh visit or page reload.
 * Updates DOM refs directly inside LeafAnimation rAF (zero root React re-renders)
 * and dissolves smoothly once Hero assets & fonts are ready.
 */
export const OpeningBootOverlay: React.FC<OpeningBootOverlayProps> = ({
  isDark,
  onComplete,
}) => {
  const { lang, dir } = useLanguage();
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

    // Hard safety cap so throttled networks never hang
    const capTimer = window.setTimeout(markReady, 1550);

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
              transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
            }
      }
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-[#08090d] px-4 select-none"
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
              ? 'جاري تجهيز الواجهة الرئيسية...'
              : 'Preparing Portfolio & Interface...'
          }
          isDark={isDark}
          pacing="entry"
          loop={false}
          showProgress={true}
          isReadyRef={isReadyRef}
          onSequenceComplete={onComplete}
        />

        <button
          type="button"
          onClick={onComplete}
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 min-h-[38px] rounded-xl border border-slate-200 dark:border-white/12 bg-white/80 dark:bg-white/[0.04] hover:border-[#027DFD]/50 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 hover:text-[#027DFD] dark:hover:text-[#00C7FF] transition-colors cursor-pointer"
        >
          <span>{lang === 'ar' ? 'تخطي' : 'Skip'}</span>
          <ArrowRight size={12} className={dir === 'rtl' ? 'rotate-180' : ''} />
        </button>
      </div>
    </motion.div>
  );
};
