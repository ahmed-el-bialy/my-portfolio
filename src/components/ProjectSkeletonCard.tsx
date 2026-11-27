import React from 'react';

export const ProjectSkeletonCard: React.FC = () => {
  return (
    <div
      className="rounded-2xl overflow-hidden bg-white/95 dark:bg-[#0f1117]/82 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.09] shadow-[0_8px_28px_rgba(15,23,42,0.06)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between"
      aria-label="Loading project..."
    >
      <div>
        {/* 1. Cover Skeleton (4:3 matching ProjectCardCover) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden skeleton-shimmer" />

        {/* 2. Content Skeleton matching unified 4-row order */}
        <div className="p-5 sm:p-6 space-y-2.5">
          {/* Title & Telemetry */}
          <div className="flex items-center justify-between gap-3">
            <div className="h-6 w-1/2 skeleton-shimmer rounded-md" />
            <div className="h-4 w-16 skeleton-shimmer rounded-full" />
          </div>

          {/* Subtitle / Metadata Line */}
          <div className="h-4 w-2/3 skeleton-shimmer rounded" />

          {/* Description Lines */}
          <div className="space-y-1.5 pt-0.5 min-h-[2.45rem]">
            <div className="h-3.5 w-full skeleton-shimmer rounded" />
            <div className="h-3.5 w-4/5 skeleton-shimmer rounded" />
          </div>

          {/* Tech Stack Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1 min-h-[28px]">
            <div className="h-5 w-14 skeleton-shimmer rounded-md" />
            <div className="h-5 w-16 skeleton-shimmer rounded-md" />
            <div className="h-5 w-14 skeleton-shimmer rounded-md" />
          </div>
        </div>
      </div>

      {/* 3. Unified Glass Action Bar Footer Skeleton */}
      <div className="px-5 sm:px-6 py-4 mt-auto border-t border-slate-200/75 dark:border-white/[0.07] bg-slate-50/75 dark:bg-white/[0.02]">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="h-[42px] rounded-xl skeleton-shimmer" />
          <div className="h-[42px] rounded-xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};
