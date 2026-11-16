import React from 'react';
import { LeafAnimation } from './LeafAnimation';
import { useLanguage } from '../context/LanguageContext';

interface PageSkeletonLoaderProps {
  view: 'projects' | 'experience' | 'contact' | 'overview' | 'language';
  isDark?: boolean;
}

/**
 * Full-viewport height centered loader stage so transitioning between sections
 * keeps vertical page height steady (zero jump from small box -> tall section).
 */
export const PageSkeletonLoader: React.FC<PageSkeletonLoaderProps> = ({ view, isDark }) => {
  const { lang } = useLanguage();

  const loadingText =
    view === 'language'
      ? lang === 'ar'
        ? 'جاري تحويل اللغة...'
        : 'Switching Language...'
      : view === 'overview'
      ? lang === 'ar'
        ? 'أحمد البيلي...'
        : 'Ahmed El-Bialy...'
      : view === 'experience'
      ? lang === 'ar'
        ? 'جاري تجهيز الخبرات والمهارات...'
        : 'Loading Experience & Stack...'
      : view === 'projects'
      ? lang === 'ar'
        ? 'جاري تجهيز التطبيقات والمشاريع...'
        : 'Loading Production Apps...'
      : lang === 'ar'
      ? 'جاري تجهيز قنوات التواصل...'
      : 'Loading Contact & Schedule...';

  return (
    <div
      className="w-full min-h-[82dvh] flex items-center justify-center px-4 pt-20 pb-12"
      aria-busy="true"
      aria-live="polite"
    >
      <LeafAnimation label={loadingText} isDark={isDark} />
    </div>
  );
};
