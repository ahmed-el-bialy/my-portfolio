import React from 'react';
import { Loader2 } from 'lucide-react';
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
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
    >
      <div className="inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white dark:bg-[#0d111c] border border-slate-200/90 dark:border-white/12 shadow-2xl text-slate-900 dark:text-white">
        <span className="w-8 h-8 rounded-xl bg-[#0284ff]/12 border border-[#0284ff]/25 flex items-center justify-center text-[#0284ff] dark:text-[#38bdf8] shrink-0">
          <Loader2 size={16} className="animate-spin" />
        </span>
        <span className="text-xs sm:text-sm font-semibold tracking-tight">
          {label || (lang === 'ar' ? 'جارٍ تحضير المعاينة...' : 'Preparing preview...')}
        </span>
      </div>
    </div>
  );
};
