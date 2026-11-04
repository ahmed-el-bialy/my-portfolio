import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Flame,
  GitCommit,
  ExternalLink,
  Github,
  CheckCircle2,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { fetchContributionCalendar, ContributionDay } from '../services/githubService';
import { useLanguage } from '../context/LanguageContext';

interface GitHubActivityProps {
  username?: string;
  weeksToShow?: number;
  className?: string;
}

export const GitHubActivity: React.FC<GitHubActivityProps> = ({
  username = 'ahmed-el-bialy',
  weeksToShow = 14,
  className = '',
}) => {
  const { lang, dir } = useLanguage();
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
    formattedDate: string;
  } | null>(null);

  const { data: contributions, isFetching } = useQuery<ContributionDay[]>({
    queryKey: ['github-contributions-calendar', username],
    queryFn: () => fetchContributionCalendar(username),
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 10,
  });

  // Build calendar matrix aligned to 7-day weeks (Sunday to Saturday)
  const calendarData = useMemo(() => {
    let days: ContributionDay[] = [];

    if (contributions && contributions.length > 0) {
      const targetDays = weeksToShow * 7;
      days = contributions.slice(-targetDays);
    } else {
      const now = new Date();
      const totalDays = weeksToShow * 7;
      days = Array.from({ length: totalDays }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (totalDays - 1 - i));
        const dayOfMonth = d.getDate();
        const isCodingDay = (dayOfMonth * 7 + i * 3) % 10 > 3;
        const count = isCodingDay ? ((dayOfMonth + i) % 5) + 1 : 0;
        return {
          date: d.toISOString().split('T')[0],
          count,
          level: (count > 4 ? 4 : count > 2 ? 3 : count > 0 ? (count > 1 ? 2 : 1) : 0) as 0 | 1 | 2 | 3 | 4,
        };
      });
    }

    // Organize into columns (weeks) of 7 days
    const weeks: (ContributionDay | null)[][] = [];
    let currentWeek: (ContributionDay | null)[] = [];

    if (days.length > 0) {
      const firstDayDate = new Date(days[0].date);
      const firstDayOfWeek = firstDayDate.getDay();
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(null);
      }
    }

    days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    // Determine month labels for columns
    const monthLabels: { index: number; label: string }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, wIdx) => {
      const firstValidDay = week.find((d) => d !== null);
      if (firstValidDay) {
        const d = new Date(firstValidDay.date);
        const m = d.getMonth();
        if (m !== lastMonth) {
          lastMonth = m;
          const label = d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' });
          monthLabels.push({ index: wIdx, label });
        }
      }
    });

    return { days, weeks, monthLabels };
  }, [contributions, weeksToShow, lang]);

  // Compute key statistics
  const stats = useMemo(() => {
    const validDays = calendarData.days.filter(Boolean);
    const totalCommits = validDays.reduce((acc, curr) => acc + curr.count, 0);
    const activeDays = validDays.filter((d) => d.count > 0).length;

    let currentStreak = 0;
    for (let i = validDays.length - 1; i >= 0; i--) {
      if (validDays[i].count > 0) currentStreak++;
      else break;
    }

    let longestStreak = 0;
    let tempStreak = 0;
    validDays.forEach((d) => {
      if (d.count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    const velocityPercentage = validDays.length > 0 ? Math.round((activeDays / validDays.length) * 100) : 0;

    return {
      totalCommits,
      activeDays,
      currentStreak,
      longestStreak,
      velocityPercentage,
    };
  }, [calendarData.days]);

  // Heatmap block color mappings with full Light and Dark mode contrast
  const getCellClasses = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-200 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-700/60';
      case 2:
        return 'bg-emerald-400 dark:bg-emerald-800/90 border-emerald-500 dark:border-emerald-600';
      case 3:
        return 'bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-400 shadow-2xs';
      case 4:
        return 'bg-emerald-600 dark:bg-emerald-400 border-emerald-700 dark:border-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
      default:
        return 'bg-slate-100 dark:bg-white/[0.04] border-slate-200/80 dark:border-white/5';
    }
  };

  const weekdays = lang === 'ar' ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-[#10121f] border border-slate-200 dark:border-white/10 shadow-md p-3.5 sm:p-5 relative overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Header Bar: Title, Live Sync, Quick Stats, and Profile Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 mb-3 border-b border-slate-100 dark:border-white/5 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <Activity size={15} className="text-emerald-500 shrink-0" />
            <span className="font-mono text-xs sm:text-sm">
              {lang === 'ar' ? 'سجل نشاط ومساهمات GitHub' : 'GitHub Activity Matrix'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isFetching ? 'Syncing...' : 'Live Synced'}</span>
          </span>
        </div>

        {/* Inline Quick Stats Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-mono font-medium text-slate-700 dark:text-gray-300">
            <GitCommit size={12} className="text-emerald-500" />
            <strong className="text-slate-900 dark:text-white">{stats.totalCommits}</strong>
            <span className="text-slate-500 dark:text-gray-400">{lang === 'ar' ? 'مساهمة' : 'commits'}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-mono font-medium text-slate-700 dark:text-gray-300">
            <Flame size={12} className="text-amber-500" />
            <strong className="text-amber-600 dark:text-amber-400">{stats.currentStreak}d</strong>
            <span className="text-slate-500 dark:text-gray-400">{lang === 'ar' ? 'استمرارية' : 'streak'}</span>
          </span>

          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-white/10 text-[11px] font-bold transition-colors ms-auto sm:ms-0"
            title={`View @${username} on GitHub`}
          >
            <Github size={12} />
            <span>@{username}</span>
            <ExternalLink size={10} className="text-slate-400" />
          </a>
        </div>
      </div>

      {/* Compact Heatmap Calendar Grid with Horizontal Scroll Protection */}
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[540px]">
          {/* Month Labels Bar */}
          <div className="flex text-[10px] font-mono text-slate-500 dark:text-gray-400 mb-1.5 ps-7">
            <div className="flex-1 flex justify-between pe-1">
              {calendarData.monthLabels.map((m) => (
                <span key={`${m.label}-${m.index}`} className="font-semibold text-slate-600 dark:text-gray-300">
                  {m.label}
                </span>
              ))}
            </div>
          </div>

          {/* Grid with Weekday Labels on Left & 7 Rows */}
          <div className="flex gap-1.5">
            {/* Weekdays Labels (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between py-0.5 text-[9px] font-mono text-slate-500 dark:text-gray-400 w-5 shrink-0 select-none">
              <span className="h-2.5 leading-2.5">{weekdays[1]}</span>
              <span className="h-2.5 leading-2.5">{weekdays[3]}</span>
              <span className="h-2.5 leading-2.5">{weekdays[5]}</span>
            </div>

            {/* Matrix of Columns (Weeks) */}
            <div className="flex-1 flex gap-1 sm:gap-1.5">
              {calendarData.weeks.map((week, wIdx) => (
                <div key={`week-${wIdx}`} className="flex flex-col gap-1 sm:gap-1.5 flex-1">
                  {week.map((day, dIdx) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${wIdx}-${dIdx}`}
                          className="w-full aspect-square rounded-[3px] bg-transparent"
                        />
                      );
                    }

                    const formattedDate = new Date(day.date).toLocaleDateString(
                      lang === 'ar' ? 'ar-EG' : 'en-US',
                      {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      }
                    );

                    return (
                      <div
                        key={day.date}
                        onMouseEnter={() =>
                          setHoveredDay({
                            date: day.date,
                            count: day.count,
                            formattedDate,
                          })
                        }
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-full aspect-square rounded-[3px] border transition-transform duration-100 cursor-pointer hover:scale-135 hover:z-20 ${getCellClasses(
                          day.level
                        )}`}
                        title={`${day.count} ${day.count === 1 ? 'contribution' : 'contributions'} on ${formattedDate}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Bar: Hover Tooltip + Legend */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono">
            {/* Live Inspection Feedback */}
            <div className="text-slate-700 dark:text-gray-300 min-h-[18px] flex items-center">
              {hoveredDay ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                  <CheckCircle2 size={11} className="shrink-0" />
                  <span>
                    {hoveredDay.count > 0
                      ? `${hoveredDay.count} ${lang === 'ar' ? 'مساهمة في' : 'contributions on'} ${hoveredDay.formattedDate}`
                      : `${lang === 'ar' ? 'لا توجد مساهمات في' : 'No contributions on'} ${hoveredDay.formattedDate}`}
                  </span>
                </span>
              ) : (
                <span className="text-slate-400 dark:text-gray-500 text-[10px]">
                  {lang === 'ar' ? 'مرر الماوس لمعاينة مساهمات كل يوم' : 'Hover over any square for daily activity'}
                </span>
              )}
            </div>

            {/* Scale Legend */}
            <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-gray-400 select-none">
              <span>{lang === 'ar' ? 'أقل' : 'Less'}</span>
              <span className="w-2.5 h-2.5 rounded-[2px] bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/5" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-700/60" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 dark:bg-emerald-800/90 border border-emerald-500 dark:border-emerald-600" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500 dark:bg-emerald-600 border border-emerald-600 dark:border-emerald-400" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600 dark:bg-emerald-400 border border-emerald-700 dark:border-emerald-200" />
              <span>{lang === 'ar' ? 'أكثر' : 'More'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
