import React from 'react';
import { ArrowRight } from 'lucide-react';
import { LeafAnimation, LeafAnimationPacing } from './LeafAnimation';
import { useLanguage, Language } from '../context/LanguageContext';

interface PageSkeletonLoaderProps {
  view: 'projects' | 'experience' | 'contact' | 'overview' | 'language';
  isDark?: boolean;
  targetLang?: Language | null;
  pacing?: LeafAnimationPacing;
  loop?: boolean;
  showProgress?: boolean;
  progress?: number;
  fullScreen?: boolean;
  onSkip?: () => void;
}

/**
 * Centered calligraphy loader integrated either as the initial full-viewport opening gate
 * with synchronized percentage readiness, or inline inside lazy section/language transitions.
 */
export const PageSkeletonLoader: React.FC<PageSkeletonLoaderProps> = ({
  view,
  isDark,
  targetLang,
  pacing = 'artisan',
  loop = true,
  showProgress = false,
  progress,
  fullScreen = false,
  onSkip,
}) => {
  const { lang, dir } = useLanguage();

  const loadingText =
    view === 'language'
      ? targetLang === 'ar'
        ? 'جاري التبديل إلى العربية...'
        : 'Switching to English...'
      : view === 'overview'
      ? lang === 'ar'
        ? 'جاري تجهيز الصفحة الرئيسية...'
        : 'Preparing Portfolio & Experience...'
      : view === 'experience'
      ? lang === 'ar'
        ? 'جاري تجهيز الخبرات والمهارات...'
        : 'Preparing Experience & Stack...'
      : view === 'projects'
      ? lang === 'ar'
        ? 'جاري تجهيز التطبيقات والمشاريع...'
        : 'Preparing Apps & Repositories...'
      : lang === 'ar'
      ? 'جاري تجهيز قنوات التواصل...'
      : 'Preparing Contact & Schedule...';

  return (
    <div
      className={`w-full flex flex-col items-center justify-center px-4 ${
        fullScreen ? 'min-h-dvh py-10' : 'min-h-[82dvh] pt-20 pb-12'
      }`}
      aria-busy="true"
      aria-live="polite"
    >
      <LeafAnimation
        label={loadingText}
        isDark={isDark}
        pacing={pacing}
        loop={loop}
        showProgress={showProgress}
        progress={progress}
      />

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/12 bg-white/75 dark:bg-white/[0.04] hover:border-[#027DFD]/50 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 hover:text-[#027DFD] dark:hover:text-[#00C7FF] transition-colors cursor-pointer"
        >
          <span>{lang === 'ar' ? 'تخطي' : 'Skip'}</span>
          <ArrowRight size={12} className={dir === 'rtl' ? 'rotate-180' : ''} />
        </button>
      )}
    </div>
  );
};
