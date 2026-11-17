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
  onSkip?: () => void;
}

/**
 * Full-viewport stage centered loader integrated seamlessly inside the active page container
 * so initial open, section navigation, and language switch feel part of the page content loading
 * rather than blocking sheets over the navigation shell.
 */
export const PageSkeletonLoader: React.FC<PageSkeletonLoaderProps> = ({
  view,
  isDark,
  targetLang,
  pacing = 'artisan',
  loop = true,
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
        ? 'أحمد البيلي · مطور تطبيقات Flutter'
        : 'Ahmed El-Bialy · Flutter Developer'
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
      className="w-full min-h-[82dvh] flex flex-col items-center justify-center px-4 pt-20 pb-12"
      aria-busy="true"
      aria-live="polite"
    >
      <LeafAnimation
        label={loadingText}
        isDark={isDark}
        pacing={pacing}
        loop={loop}
      />

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/12 bg-white/70 dark:bg-white/[0.04] hover:border-[#027DFD]/50 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 hover:text-[#027DFD] dark:hover:text-[#00C7FF] transition-colors cursor-pointer"
        >
          <span>{lang === 'ar' ? 'تخطي الدخول' : 'Skip intro'}</span>
          <ArrowRight size={12} className={dir === 'rtl' ? 'rotate-180' : ''} />
        </button>
      )}
    </div>
  );
};
