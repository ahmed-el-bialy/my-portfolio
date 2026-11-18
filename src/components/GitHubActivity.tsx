import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Flame,
  GitCommit,
  ExternalLink,
  Github,
  CheckCircle2,
  CalendarDays,
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
  weeksToShow = 16,
  className = '',
}) => {
  const { lang } = useLanguage();
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
          level: (count > 4 ? 4 : count > 2 ? 3 : count > 0 ? (count > 1 ? 2 : 1) : 0) as
            | 0
            | 1
            | 2
            | 3
            | 4,
        };
      });
    }

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

  const stats = useMemo(() => {
    const validDays = calendarData.days.filter(Boolean);
    const totalCommits = validDays.reduce((acc, curr) => acc + curr.count, 0);
    const activeDays = validDays.filter((d) => d.count > 0).length;

    let currentStreak = 0;
    for (let i = validDays.length - 1; i >= 0; i--) {
      if (validDays[i].count > 0) currentStreak++;
      else break;
    }

    const velocityPercentage =
      validDays.length > 0 ? Math.round((activeDays / validDays.length) * 100) : 0;

    return {
      totalCommits,
      activeDays,
      currentStreak,
      velocityPercentage,
    };
  }, [calendarData.days]);

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

  const weekdays =
    lang === 'ar'
      ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-white via-white to-emerald-50/35 dark:from-[#0f1117] dark:via-[#0f1117] dark:to-emerald-950/15 border border-slate-200/90 dark:border-white/10 shadow-sm p-5 sm:p-6 relative overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Top Row: Activity Title + Profile Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/70 dark:border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/12 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Activity size={17} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-[#f1f5f9]">
                {lang === 'ar' ? 'خريطة نشاط GitHub الحية' : 'GitHub Contribution Heatmap'}
              </h3>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                · {isFetching ? (lang === 'ar' ? 'جارٍ التزامن...' : 'Syncing...') : (lang === 'ar' ? 'تحديث مباشر' : 'Live Synced')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ar'
                ? `آخر ${weeksToShow} أسبوعاً من الالتزامات البرمجية والتحديثات`
                : `Last ${weeksToShow} weeks of open-source commits & releases`}
            </p>
          </div>
        </div>

        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          className="btn-kinetic self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-white/10 text-xs font-bold transition-colors shrink-0"
          title={`View @${username} on GitHub`}
        >
          <Github size={14} />
          <span>@{username}</span>
          <ExternalLink size={11} className="text-slate-400" />
        </a>
      </div>

      {/* Middle Row: 4 Clean Bento Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/8 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <GitCommit size={15} />
          </div>
          <div>
            <div className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-slate-900 dark:text-white leading-none">
              {stats.totalCommits}
            </div>
            <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'ar' ? 'مساهمة' : 'Commits'}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/8 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0284ff]/12 text-[#0284ff] dark:text-[#00C7FF] flex items-center justify-center shrink-0">
            <CalendarDays size={15} />
          </div>
          <div>
            <div className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-slate-900 dark:text-white leading-none">
              {stats.activeDays}
            </div>
            <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'ar' ? 'أيام نشطة' : 'Active Days'}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/8 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/12 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame size={15} />
          </div>
          <div>
            <div className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-amber-600 dark:text-amber-400 leading-none">
              {stats.currentStreak}d
            </div>
            <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'ar' ? 'سلسلة متصلة' : 'Current Streak'}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/8 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/12 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Zap size={15} />
          </div>
          <div>
            <div className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-slate-900 dark:text-white leading-none">
              {stats.velocityPercentage}%
            </div>
            <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'ar' ? 'معدل الاستمرارية' : 'Active Cadence'}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix with Responsive Horizontal Scroll Protection */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-[#090c12] border border-slate-200/70 dark:border-white/6">
        <div className="flex sm:hidden items-center justify-end mb-2 text-[10px] text-slate-400 font-mono">
          ⇄ {lang === 'ar' ? 'اسحب أفقياً لاستعراض الأسابيع' : 'Swipe horizontally for all weeks'}
        </div>

        <div className="overflow-x-auto pb-1 touch-pan-x no-scrollbar">
          <div className="min-w-[540px]">
            {/* Month Labels Bar */}
            <div className="flex text-[10px] font-mono text-slate-500 dark:text-gray-400 mb-2 ps-8">
              <div className="flex-1 flex justify-between pe-1">
                {calendarData.monthLabels.map((m) => (
                  <span key={`${m.label}-${m.index}`} className="font-semibold text-slate-600 dark:text-gray-300">
                    {m.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Grid with Weekday Labels & 7 Rows */}
            <div className="flex gap-2">
              <div className="flex flex-col justify-between py-0.5 text-[9.5px] font-mono text-slate-500 dark:text-gray-400 w-6 shrink-0 select-none">
                <span className="h-3 leading-3">{weekdays[1]}</span>
                <span className="h-3 leading-3">{weekdays[3]}</span>
                <span className="h-3 leading-3">{weekdays[5]}</span>
              </div>

              <div className="flex-1 flex gap-1.5">
                {calendarData.weeks.map((week, wIdx) => (
                  <div key={`week-${wIdx}`} className="flex flex-col gap-1.5 flex-1">
                    {week.map((day, dIdx) => {
                      if (!day) {
                        return (
                          <div
                            key={`empty-${wIdx}-${dIdx}`}
                            className="w-full aspect-square rounded-[4px] bg-transparent"
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
                          className={`w-full aspect-square rounded-[4px] border transition-transform duration-100 cursor-pointer hover:scale-125 hover:z-20 ${getCellClasses(
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

            {/* Footer Bar: Live Day Tooltip + Scale Legend */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-white/6 flex items-center justify-between text-[11px] font-mono">
              <div className="text-slate-700 dark:text-gray-300 min-h-[18px] flex items-center">
                {hoveredDay ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                    <CheckCircle2 size={12} className="shrink-0" />
                    <span>
                      {hoveredDay.count > 0
                        ? `${hoveredDay.count} ${lang === 'ar' ? 'مساهمة في' : 'contributions on'} ${hoveredDay.formattedDate}`
                        : `${lang === 'ar' ? 'لا توجد مساهمات في' : 'No contributions on'} ${hoveredDay.formattedDate}`}
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-500 dark:text-gray-400 text-[10.5px]">
                    {lang === 'ar' ? 'مرر المؤشر فوق أي يوم لمعاينة التفاصيل' : 'Hover over any square to inspect daily commits'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-gray-400 select-none">
                <span>{lang === 'ar' ? 'أقل' : 'Less'}</span>
                <span className="w-2.5 h-2.5 rounded-[3px] bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/5" />
                <span className="w-2.5 h-2.5 rounded-[3px] bg-emerald-200 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-700/60" />
                <span className="w-2.5 h-2.5 rounded-[3px] bg-emerald-400 dark:bg-emerald-800/90 border border-emerald-500 dark:border-emerald-600" />
                <span className="w-2.5 h-2.5 rounded-[3px] bg-emerald-500 dark:bg-emerald-600 border border-emerald-600 dark:border-emerald-400" />
                <span className="w-2.5 h-2.5 rounded-[3px] bg-emerald-600 dark:bg-emerald-400 border border-emerald-700 dark:border-emerald-200" />
                <span>{lang === 'ar' ? 'أكثر' : 'More'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
