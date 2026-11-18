import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Code2 } from 'lucide-react';

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
  const { lang } = useLanguage();

  if (!languages || languages.length === 0) return null;

  const totalRepos = languages.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="mt-5 pt-4 border-t border-slate-200/75 dark:border-white/8 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-[#0284ff] dark:text-[#00C7FF] shrink-0" />
          <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
            {lang === 'ar' ? 'توزيع اللغات البرمجية عبر المستودعات' : 'Repository Language Breakdown'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          {hoveredLang
            ? `${hoveredLang.name}: ${hoveredLang.percentage}% (${hoveredLang.count} / ${totalRepos})`
            : lang === 'ar'
            ? 'تركيز أساسي على Dart & Flutter'
            : 'Dart & Flutter ecosystem primary'}
        </span>
      </div>

      {/* Segmented Clean Bar */}
      <div className="relative w-full h-2.5 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10 flex gap-[2px] p-[1px] border border-slate-200/80 dark:border-white/10">
        {languages.map((l) => (
          <div
            key={l.name}
            onMouseEnter={() => setHoveredLang(l)}
            onMouseLeave={() => setHoveredLang(null)}
            className="h-full rounded-full transition-all duration-200 cursor-pointer"
            style={{
              width: `${Math.max(l.percentage, 3)}%`,
              backgroundColor: l.color || '#00B4AB',
              opacity: hoveredLang && hoveredLang.name !== l.name ? 0.35 : 1,
            }}
            title={`${l.name}: ${l.percentage}% (${l.count} repos)`}
          />
        ))}
      </div>

      {/* Clean Unboxed Typographic Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
        {languages.map((l) => {
          const isHovered = hoveredLang?.name === l.name;
          return (
            <button
              key={l.name}
              type="button"
              onMouseEnter={() => setHoveredLang(l)}
              onMouseLeave={() => setHoveredLang(null)}
              className={`inline-flex items-center gap-1.5 text-xs font-mono transition-opacity cursor-pointer ${
                hoveredLang && !isHovered ? 'opacity-55' : 'opacity-100'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: l.color || '#00B4AB' }}
              />
              <span className="font-bold text-slate-900 dark:text-white">{l.name}</span>
              <span className="text-slate-600 dark:text-slate-300 tabular-nums">{l.percentage}%</span>
              <span className="text-[10.5px] text-slate-400 dark:text-slate-500">
                ({l.count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
