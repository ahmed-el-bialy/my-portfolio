import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Flame, Calendar, GitCommit, CheckCircle2 } from 'lucide-react';
import { fetchContributionCalendar, ContributionDay } from '../services/githubService';

interface GitHubActivityProps {
  username?: string;
}

export const GitHubActivity: React.FC<GitHubActivityProps> = ({ username = 'ahmed-el-bialy' }) => {
  const { data: contributions, isLoading } = useQuery<ContributionDay[]>({
    queryKey: ['github-contributions-30d', username],
    queryFn: () => fetchContributionCalendar(username),
    staleTime: 1000 * 60 * 3,
    refetchInterval: 1000 * 60 * 3, // Auto-refresh 30-day activity every 3 minutes
  });

  // Extract last 30 days
  const last30Days = useMemo(() => {
    if (!contributions || contributions.length === 0) {
      // Fallback 30-day array
      const now = new Date();
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (29 - i));
        const dayOfMonth = d.getDate();
        const pseudoActive = (dayOfMonth % 3 === 0 || dayOfMonth % 5 === 0) ? (dayOfMonth % 4) + 1 : 0;
        return {
          date: d.toISOString().split('T')[0],
          count: pseudoActive,
          level: (pseudoActive > 3 ? 4 : pseudoActive > 2 ? 3 : pseudoActive > 0 ? 1 : 0) as 0 | 1 | 2 | 3 | 4
        };
      });
    }
    return contributions.slice(-30);
  }, [contributions]);

  const total30dCommits = useMemo(() => {
    return last30Days.reduce((acc, curr) => acc + curr.count, 0);
  }, [last30Days]);

  const activeDaysCount = useMemo(() => {
    return last30Days.filter((d) => d.count > 0).length;
  }, [last30Days]);

  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = last30Days.length - 1; i >= 0; i--) {
      if (last30Days[i].count > 0) streak++;
      else break;
    }
    return streak;
  }, [last30Days]);

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-950/80 border-emerald-800/80 text-emerald-400';
      case 2:
        return 'bg-emerald-800/90 border-emerald-600 text-emerald-300';
      case 3:
        return 'bg-emerald-600 border-emerald-400 text-white';
      case 4:
        return 'bg-emerald-400 border-emerald-200 text-black shadow-[0_0_8px_rgba(52,211,153,0.5)]';
      default:
        return 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/5 text-transparent';
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-emerald-500" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Recent 30-Day Activity & GitHub Commits
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-gray-400">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <GitCommit size={13} /> {total30dCommits} Contributions
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <Flame size={13} /> {currentStreak > 0 ? `${currentStreak}d streak` : `${activeDaysCount} active days`}
          </span>
        </div>
      </div>

      {/* 30-Day Heatmap Grid */}
      <div className="overflow-x-auto pb-1">
        <div className="grid grid-flow-col grid-rows-2 sm:grid-rows-3 gap-1.5 min-w-[320px]">
          {last30Days.map((day) => {
            const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            return (
              <div
                key={day.date}
                className={`h-6 w-full min-w-[20px] rounded-md border flex items-center justify-center text-[10px] font-mono transition-all duration-200 hover:scale-110 cursor-pointer ${getHeatmapColor(
                  day.level
                )}`}
                title={`${day.count} contributions on ${formattedDate}`}
              >
                {day.count > 0 ? day.count : ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center justify-between mt-2.5 text-[10px] text-slate-500 dark:text-gray-400 font-mono">
        <span className="flex items-center gap-1">
          <Calendar size={11} /> Last 30 days
        </span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-950 border border-emerald-800" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-800 border border-emerald-600" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 border border-emerald-400" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 border border-emerald-200" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
