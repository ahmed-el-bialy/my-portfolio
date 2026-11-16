import React from 'react';
import { LeafAnimation } from './LeafAnimation';
import { useLanguage, Language } from '../context/LanguageContext';

interface PageSkeletonLoaderProps {
  view: 'projects' | 'experience' | 'contact' | 'overview' | 'language';
  isDark?: boolean;
  targetLang?: Language | null;
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
}) => {
  const { lang } = useLanguage();

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
      className="w-full min-h-[82dvh] flex items-center justify-center px-4 pt-20 pb-12"
      aria-busy="true"
      aria-live="polite"
    >
      <LeafAnimation label={loadingText} isDark={isDark} />
    </div>
  );
};
