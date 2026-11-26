import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Target,
  Layers,
  TrendingUp,
  ChevronDown,
  FileText,
  Check,
} from 'lucide-react';
import { extractStructuredCaseStudy, CaseStudyPillar } from '../utils/caseStudyExtractor';
import { ReadmeDocumentView } from './ReadmeDocumentView';

interface CaseStudyStructuredViewProps {
  rawMarkdown: string;
  repoName: string;
  branch: string;
  docLang: 'en' | 'ar';
  uiLang: 'en' | 'ar';
  onImageClick?: (url: string) => void;
}

const PILLAR_META = {
  problem: {
    index: '01',
    enLabel: 'Challenge & Problem',
    arLabel: 'التحدي والمشكلة',
    icon: Target,
    iconClass: 'text-amber-600 dark:text-amber-400',
    iconBgClass: 'bg-amber-500/10 border-amber-500/20',
  },
  solution: {
    index: '02',
    enLabel: 'Solution & Architecture',
    arLabel: 'الحل والمعمارية',
    icon: Layers,
    iconClass: 'text-[#0369a1] dark:text-[#38bdf8]',
    iconBgClass: 'bg-[#0284ff]/10 border-[#0284ff]/25',
  },
  results: {
    index: '03',
    enLabel: 'Results & Impact',
    arLabel: 'النتائج والأثر',
    icon: TrendingUp,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    iconBgClass: 'bg-emerald-500/10 border-emerald-500/20',
  },
} as const;

export const CaseStudyStructuredView: React.FC<CaseStudyStructuredViewProps> = ({
  rawMarkdown,
  repoName,
  branch,
  docLang,
  uiLang,
  onImageClick,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [showFullDocument, setShowFullDocument] = useState(false);

  const parsed = useMemo(() => extractStructuredCaseStudy(rawMarkdown), [rawMarkdown]);

  const orderedPillars: CaseStudyPillar[] = useMemo(() => {
    const list: CaseStudyPillar[] = [];
    if (parsed.pillars.problem) list.push(parsed.pillars.problem);
    if (parsed.pillars.solution) list.push(parsed.pillars.solution);
    if (parsed.pillars.results) list.push(parsed.pillars.results);
    return list;
  }, [parsed]);

  const hasStructuredPillars = orderedPillars.length >= 2;
  const isDocAr = docLang === 'ar';

  if (!hasStructuredPillars) {
    return (
      <div dir={isDocAr ? 'rtl' : 'ltr'} className="pt-1">
        <ReadmeDocumentView
          rawMarkdown={rawMarkdown}
          repoName={repoName}
          branch={branch}
          onImageClick={onImageClick}
        />
      </div>
    );
  }

  return (
    <div dir={isDocAr ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Executive Summary & Unboxed Metrics Strip */}
      {(parsed.title || parsed.executiveSummary || parsed.metrics.length > 0) && (
        <div className="rounded-2xl bg-slate-50/90 dark:bg-white/[0.025] border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-[#0369a1] dark:text-[#38bdf8]">
                {isDocAr ? 'ملخص تنفيذي' : 'Executive Breakdown'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {parsed.readingMinutes}{' '}
                {isDocAr ? 'دقائق قراءة' : 'min read'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {orderedPillars.length}{' '}
                {isDocAr ? 'محاور رئيسية' : 'core pillars'}
              </span>
            </div>

            {parsed.metrics.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-700 dark:text-slate-300 font-semibold tabular-nums">
                {parsed.metrics.map((metric, idx) => (
                  <React.Fragment key={metric}>
                    {idx > 0 && (
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                        ·
                      </span>
                    )}
                    <span>{metric}</span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {parsed.title && (
            <h5 className="font-display text-base sm:text-lg font-extrabold text-slate-950 dark:text-white tracking-tight">
              {parsed.title}
            </h5>
          )}

          {parsed.executiveSummary && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
              {parsed.executiveSummary}
            </p>
          )}
        </div>
      )}

      {/* Structured 3-Pillar Cards: Problem · Solution · Results */}
      <div
        className={`grid grid-cols-1 gap-4 ${
          orderedPillars.length === 2
            ? 'md:grid-cols-2'
            : 'md:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {orderedPillars.map((pillar) => {
          const meta = PILLAR_META[pillar.id];
          const Icon = meta.icon;
          const displayLabel = isDocAr ? meta.arLabel : meta.enLabel;

          return (
            <article
              key={pillar.id}
              className="rounded-2xl bg-slate-50/85 dark:bg-white/[0.025] border border-slate-200/80 dark:border-white/10 p-5 flex flex-col justify-between gap-4 transition-colors hover:border-[#0284ff]/35 dark:hover:border-[#38bdf8]/35"
            >
              <div className="space-y-3">
                {/* Clean Pillar Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${meta.iconBgClass}`}
                    >
                      <Icon size={15} className={meta.iconClass} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {meta.index}. {displayLabel}
                      </div>
                      <h6 className="font-display text-sm sm:text-[15px] font-extrabold text-slate-900 dark:text-white truncate">
                        {pillar.title}
                      </h6>
                    </div>
                  </div>
                </div>

                {/* Concise Summary */}
                {pillar.summary && (
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {pillar.summary}
                  </p>
                )}

                {/* Key Takeaways / Bullets */}
                {pillar.bullets.length > 0 && (
                  <ul className="space-y-2 pt-2 border-t border-slate-200/70 dark:border-white/8">
                    {pillar.bullets.map((item, bIdx) => (
                      <li
                        key={bIdx}
                        className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                      >
                        <Check
                          size={13}
                          className={`${meta.iconClass} shrink-0 mt-0.5`}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Optional Additional Extracted Sections */}
      {parsed.remainingSections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parsed.remainingSections.map((extra, eIdx) => (
            <div
              key={`${extra.title}-${eIdx}`}
              className="rounded-2xl bg-slate-50/70 dark:bg-white/[0.015] border border-slate-200/75 dark:border-white/8 p-4 sm:p-5 space-y-2.5"
            >
              <h6 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                {extra.title}
              </h6>
              {extra.summary && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {extra.summary}
                </p>
              )}
              {extra.bullets.length > 0 && (
                <ul className="space-y-1.5 pt-1">
                  {extra.bullets.map((b, bi) => (
                    <li
                      key={bi}
                      className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0284ff] shrink-0 mt-1.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Expandable Full Technical Monograph View */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowFullDocument((prev) => !prev)}
          aria-expanded={showFullDocument}
          className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-xl bg-slate-100/90 dark:bg-white/[0.04] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] border border-slate-200/90 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <FileText size={14} className="text-[#0369a1] dark:text-[#38bdf8] shrink-0" />
          <span>
            {showFullDocument
              ? uiLang === 'ar'
                ? 'إخفاء مستند دراسة الحالة الكامل'
                : 'Hide Full Study Case Document'
              : uiLang === 'ar'
              ? 'عرض مستند دراسة الحالة الكامل'
              : 'Read Full Study Case Document'}
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${showFullDocument ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence initial={false}>
          {showFullDocument && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 pt-5 border-t border-slate-200/80 dark:border-white/10"
            >
              <ReadmeDocumentView
                rawMarkdown={rawMarkdown}
                repoName={repoName}
                branch={branch}
                onImageClick={onImageClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
