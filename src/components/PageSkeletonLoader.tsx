import React from 'react';
import { LeafAnimation } from './LeafAnimation';
import { useLanguage } from '../context/LanguageContext';

interface PageSkeletonLoaderProps {
  view: 'projects' | 'experience' | 'contact';
}

export const PageSkeletonLoader: React.FC<PageSkeletonLoaderProps> = ({ view }) => {
  const { lang } = useLanguage();

  const loadingText =
    view === 'experience'
      ? lang === 'ar'
        ? 'جاري تجهيز الخبرات والشهادات والمهارات...'
        : 'Preparing Experience, Certificates & Tech Stack...'
      : view === 'projects'
      ? lang === 'ar'
        ? 'جاري تجهيز التطبيقات ومستودعات GitHub...'
        : 'Preparing Production Apps & GitHub Repositories...'
      : lang === 'ar'
      ? 'جاري تجهيز قنوات التواصل وحجز المواعيد...'
      : 'Preparing Contact Channels & Scheduling...';

  const sectionTag =
    view === 'projects'
      ? 'Projects & GitHub Showcase'
      : view === 'experience'
      ? 'Experience & Engineering Stack'
      : 'Direct Channels & Consultation';

  return (
    <div
      className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-28 w-full min-h-[72vh] flex items-center justify-center overflow-hidden"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Subtle Softly Blurred Section Layout Backdrop */}
      <div
        aria-hidden="true"
        className="w-full space-y-6 opacity-35 blur-[6px] pointer-events-none select-none scale-[0.99]"
      >
        <div className="h-10 w-64 rounded-xl bg-slate-200 dark:bg-white/10" />
        <div className="h-44 rounded-3xl bg-slate-200/80 dark:bg-white/8 border border-slate-300/40 dark:border-white/10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-64 rounded-2xl bg-slate-200/70 dark:bg-white/8 border border-slate-300/40 dark:border-white/10"
            />
          ))}
        </div>
      </div>

      {/* Centered Frosted Glass Overlay with Penless LeafAnimation */}
      <div className="absolute inset-0 flex items-center justify-center px-4 bg-[#f8fafc]/55 dark:bg-[#08090d]/55 backdrop-blur-md">
        <div className="rounded-3xl border border-[#027DFD]/25 dark:border-[#00C7FF]/20 bg-white/85 dark:bg-[#0f1117]/85 backdrop-blur-xl px-8 py-6 shadow-2xl shadow-[#027DFD]/10">
          <LeafAnimation label={loadingText} sublabel={sectionTag} />
        </div>
      </div>
    </div>
  );
};
