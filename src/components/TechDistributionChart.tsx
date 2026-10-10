import React, { useState } from 'react';
import { Code2, Sparkles, FolderGit2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageStat {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface TechDistributionChartProps {
  languages: LanguageStat[];
}

export const TechDistributionChart: React.FC<TechDistributionChartProps> = ({ languages }) => {
  const [hoveredLang, setHoveredLang] = useState<LanguageStat | null>(null);
  const { lang, dir } = useLanguage();

  if (!languages || languages.length === 0) return null;

  const totalRepos = languages.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-white/5 transition-colors">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 xs:gap-2">
          <Code2 size={14} className="text-cyan-500 shrink-0" />
          <span className="text-[11px] xs:text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            {lang === 'ar' ? 'توزيع التقنيات البرمجية للمستودعات' : 'Repository Stack Distribution'}
          </span>
        </div>
        <span className="text-[10px] xs:text-[11px] font-mono text-slate-500 dark:text-gray-400">
          {lang === 'ar' ? 'تركيز رئيسي على بيئة Dart & Flutter' : 'Dart Ecosystem Focused'}
        </span>
      </div>

      {/* GitHub-style Segmented Progress Bar */}
      <div className="relative w-full h-3.5 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10 flex p-0.5 border border-slate-200/80 dark:border-white/10 shadow-inner">
        {languages.map((lang, idx) => (
          <div
            key={lang.name}
            onMouseEnter={() => setHoveredLang(lang)}
            onMouseLeave={() => setHoveredLang(null)}
            className={`h-full transition-all duration-300 relative cursor-pointer ${
              idx === 0 ? 'rounded-l-full' : ''
            } ${idx === languages.length - 1 ? 'rounded-r-full' : ''}`}
            style={{
              width: `${Math.max(lang.percentage, 2)}%`,
              backgroundColor: lang.color || '#00B4AB',
              opacity: hoveredLang && hoveredLang.name !== lang.name ? 0.45 : 1,
              transform: hoveredLang?.name === lang.name ? 'scaleY(1.15)' : 'none',
            }}
            title={`${lang.name}: ${lang.percentage}% (${lang.count} repos)`}
          />
        ))}
      </div>

      {/* Interactive Details / Hover Card / Legend Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5">
        <div className="flex flex-wrap items-center gap-2 xs:gap-3">
          {languages.map((lang) => {
            const isHovered = hoveredLang?.name === lang.name;
            return (
              <button
                key={lang.name}
                type="button"
                onMouseEnter={() => setHoveredLang(lang)}
                onMouseLeave={() => setHoveredLang(null)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] xs:text-[11px] font-mono transition-all cursor-pointer ${
                  isHovered
                    ? 'bg-slate-200/80 dark:bg-white/15 scale-105'
                    : 'bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/10'
                } border border-slate-200 dark:border-white/5`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: lang.color || '#00B4AB' }}
                />
                <span className="font-bold text-slate-900 dark:text-white">
                  {lang.name}
                </span>
                <span className="text-slate-600 dark:text-gray-400 font-semibold">
                  {lang.percentage}%
                </span>
                <span className="text-[9px] text-slate-500 dark:text-gray-400 font-mono">
                  ({lang.count} {lang === 'ar' ? 'مشروع' : (lang.count === 1 ? 'repo' : 'repos')})
                </span>
              </button>
            );
          })}
        </div>

        {hoveredLang && (
          <div className="text-[10px] xs:text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400 animate-in fade-in duration-150">
            {hoveredLang.name}: {hoveredLang.percentage}% ({hoveredLang.count} of {totalRepos} repos)
          </div>
        )}
      </div>
    </div>
  );
};
