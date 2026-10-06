import React from 'react';
import { WifiOff, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface GitHubFallbackNoticeProps {
  isRateLimited?: boolean;
  isOffline?: boolean;
  onRetry?: () => void;
  isRefreshing?: boolean;
}

export const GitHubFallbackNotice: React.FC<GitHubFallbackNoticeProps> = ({
  isRateLimited = false,
  isOffline = false,
  onRetry,
  isRefreshing = false,
}) => {
  return (
    <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            {isOffline ? <WifiOff size={16} /> : <AlertCircle size={16} />}
          </div>
          <div className="space-y-0.5">
            <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isOffline ? 'Offline Mode Active' : 'Cached GitHub Repository Snapshot Active'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">
                Protected
              </span>
            </h5>
            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed font-sans">
              {isOffline
                ? 'Network is currently offline. Viewing high-fidelity cached repositories snapshot. Hint: Check your internet connection.'
                : 'GitHub API rate limit protected. Displaying verified real repository snapshot and architecture metrics without disruption.'}
            </p>
          </div>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 hover:bg-amber-100 dark:hover:bg-white/20 text-slate-900 dark:text-white border border-amber-400/30 text-xs font-semibold transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Check Connection</span>
          </button>
        )}
      </div>
    </div>
  );
};
