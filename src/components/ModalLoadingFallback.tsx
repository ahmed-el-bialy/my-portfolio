import React from 'react';
import { LeafAnimation } from './LeafAnimation';
import { useLanguage } from '../context/LanguageContext';

interface ModalLoadingFallbackProps {
  show?: boolean;
  label?: string;
}

export const ModalLoadingFallback: React.FC<ModalLoadingFallbackProps> = ({
  show = true,
  label,
}) => {
  const { lang, dir } = useLanguage();
  if (!show) return null;

  return (
    <div
      dir={dir}
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/65 backdrop-blur-md p-4"
    >
      <div className="rounded-3xl bg-white/95 dark:bg-[#0d111c]/95 border border-slate-200/90 dark:border-white/12 shadow-2xl px-6 py-4 min-w-[230px] max-w-xs">
        <LeafAnimation
          compact
          loop
          pacing="entry"
          label={label || (lang === 'ar' ? 'جارٍ تحضير معاينة المشروع...' : 'Preparing project preview...')}
          className="py-2 px-2"
        />
      </div>
    </div>
  );
};
