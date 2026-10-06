import React from 'react';

export const ProjectSkeletonCard: React.FC = () => {
  return (
    <div
      className="card-techno rounded-2xl overflow-hidden bg-white dark:bg-[#131522] border border-slate-200 dark:border-white/10 flex flex-col justify-between animate-pulse"
      aria-label="Loading project..."
    >
      <div>
        {/* Cover Skeleton */}
        <div className="relative aspect-[16/9] w-full bg-slate-200 dark:bg-white/[0.04] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/[0.04] to-transparent animate-[shimmer_2s_infinite]" />
        </div>

        {/* Content Skeleton */}
        <div className="p-5 space-y-3">
          {/* Title & Star Pill */}
          <div className="flex items-center justify-between gap-3">
            <div className="h-5 w-3/5 bg-slate-200 dark:bg-white/10 rounded-md" />
            <div className="h-4 w-10 bg-slate-200 dark:bg-white/5 rounded-full" />
          </div>

          {/* Description Lines */}
          <div className="space-y-2 pt-1">
            <div className="h-3.5 w-full bg-slate-200 dark:bg-white/5 rounded" />
            <div className="h-3.5 w-4/5 bg-slate-200 dark:bg-white/5 rounded" />
          </div>

          {/* Topic Tags */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            <div className="h-4 w-12 bg-slate-200 dark:bg-white/5 rounded" />
            <div className="h-4 w-16 bg-slate-200 dark:bg-white/5 rounded" />
            <div className="h-4 w-14 bg-slate-200 dark:bg-white/5 rounded" />
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="p-5 pt-0 mt-2">
        <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="h-3 w-14 bg-slate-200 dark:bg-white/10 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-10 bg-slate-200 dark:bg-white/5 rounded" />
            <div className="h-4 w-12 bg-slate-200 dark:bg-white/5 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
