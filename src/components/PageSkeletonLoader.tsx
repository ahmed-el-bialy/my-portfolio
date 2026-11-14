import React from 'react';
import { Loader2 } from 'lucide-react';
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
        : 'Loading Experience, Certificates & Tech Stack...'
      : view === 'projects'
      ? lang === 'ar'
        ? 'جاري تجهيز المشاريع ومستودعات GitHub...'
        : 'Loading Production Apps & GitHub Repositories...'
      : lang === 'ar'
      ? 'جاري تجهيز قنوات التواصل وحجز المواعيد...'
      : 'Loading Contact Channels & Scheduling...';

  return (
    <div
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-28 w-full"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Clean Loading Status Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#027DFD] dark:text-[#00C7FF] mb-3">
          <Loader2 size={14} className="animate-spin" />
          <span>{loadingText}</span>
        </div>
        <div className="skeleton-shimmer h-9 sm:h-11 w-64 sm:w-80 rounded-xl" />
        <div
          className="skeleton-shimmer h-4 w-72 sm:w-96 rounded-lg mt-3"
          style={{ animationDelay: '0.12s' }}
        />
      </div>

      {view === 'experience' && (
        <div className="space-y-10">
          {/* Certificates 3-card skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((item, idx) => (
              <div
                key={item}
                className="h-52 rounded-2xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div
                      className="skeleton-shimmer h-3 w-24 rounded"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    />
                    <div
                      className="skeleton-shimmer h-3 w-14 rounded"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    />
                  </div>
                  <div
                    className="skeleton-shimmer h-5 w-4/5 rounded"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  />
                  <div
                    className="skeleton-shimmer h-3 w-1/2 rounded"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  />
                  <div
                    className="skeleton-shimmer h-12 w-full rounded"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  />
                </div>
                <div
                  className="skeleton-shimmer h-4 w-28 rounded"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                />
              </div>
            ))}
          </div>

          {/* Timeline + Education split skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            <div className="lg:col-span-7 space-y-5">
              {[1, 2].map((item, idx) => (
                <div
                  key={item}
                  className="h-44 rounded-2xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 p-5 space-y-3"
                >
                  <div
                    className="skeleton-shimmer h-5 w-52 rounded"
                    style={{ animationDelay: `${idx * 0.12}s` }}
                  />
                  <div
                    className="skeleton-shimmer h-3 w-40 rounded"
                    style={{ animationDelay: `${idx * 0.12}s` }}
                  />
                  <div
                    className="skeleton-shimmer h-16 w-full rounded"
                    style={{ animationDelay: `${idx * 0.12}s` }}
                  />
                </div>
              ))}
            </div>
            <div className="lg:col-span-5">
              <div className="h-80 rounded-2xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 p-6 space-y-4">
                <div className="skeleton-shimmer h-5 w-48 rounded" />
                <div
                  className="skeleton-shimmer h-10 w-full rounded-xl"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="skeleton-shimmer h-10 w-full rounded-xl"
                  style={{ animationDelay: '0.2s' }}
                />
                <div
                  className="skeleton-shimmer h-20 w-full rounded-xl"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'projects' && (
        <div className="space-y-8">
          <div className="skeleton-shimmer h-52 rounded-3xl border border-slate-200 dark:border-white/10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item, idx) => (
              <div
                key={item}
                className="skeleton-shimmer h-80 rounded-2xl border border-slate-200 dark:border-white/10"
                style={{ animationDelay: `${idx * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {view === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          <div className="lg:col-span-6 skeleton-shimmer h-96 rounded-2xl border border-slate-200 dark:border-white/10" />
          <div className="lg:col-span-6 space-y-6">
            <div
              className="skeleton-shimmer h-56 rounded-2xl border border-slate-200 dark:border-white/10"
              style={{ animationDelay: '0.1s' }}
            />
            <div
              className="skeleton-shimmer h-48 rounded-2xl border border-slate-200 dark:border-white/10"
              style={{ animationDelay: '0.2s' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
