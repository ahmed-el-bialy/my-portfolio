import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Target,
  Layers,
  TrendingUp,
  FileText,
  LayoutGrid,
  Check,
  ExternalLink,
  Github,
  Play,
  BookOpen,
  Globe,
  Link2,
  ZoomIn,
  Hash,
} from 'lucide-react';
import {
  extractStructuredCaseStudy,
  CaseStudyPillar,
  CaseStudyLink,
  CaseStudyLinkKind,
} from '../utils/caseStudyExtractor';
import { ReadmeDocumentView } from './ReadmeDocumentView';

interface CaseStudyStructuredViewProps {
  rawMarkdown: string;
  repoName: string;
  branch: string;
  docLang: 'en' | 'ar';
  uiLang: 'en' | 'ar';
  githubRepoUrl?: string;
  googlePlayUrl?: string;
  demoVideoUrl?: string;
  onImageClick?: (url: string) => void;
}

const PILLAR_META = {
  problem: {
    index: '01',
    enLabel: 'Challenge & Problem',
    arLabel: 'التحدي والمشكلة',
    icon: Target,
    iconClass: 'text-amber-600 dark:text-amber-400',
    iconBgClass: 'bg-amber-500/10 border-amber-500/25',
  },
  solution: {
    index: '02',
    enLabel: 'Solution & Architecture',
    arLabel: 'الحل والمعمارية',
    icon: Layers,
    iconClass: 'text-[#0369a1] dark:text-[#38bdf8]',
    iconBgClass: 'bg-[#0284ff]/12 border-[#0284ff]/28',
  },
  results: {
    index: '03',
    enLabel: 'Results & Impact',
    arLabel: 'النتائج والأثر',
    icon: TrendingUp,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    iconBgClass: 'bg-emerald-500/10 border-emerald-500/25',
  },
} as const;

const RichInlineText: React.FC<{ text: string }> = ({ text }) => {
  const tokens = useMemo(() => {
    const out: React.ReactNode[] = [];
    const tokenRegex =
      /(\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|(https?:\/\/[^\s<>"')\]]+))/gi;

    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let keyCounter = 0;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        out.push(text.slice(lastIndex, match.index));
      }

      if (match[2] && match[3]) {
        const label = match[2].replace(/\*\*/g, '').trim();
        const href = match[3].trim();
        out.push(
          <a
            key={`lnk-${keyCounter++}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-baseline gap-1 font-semibold text-[#0369a1] dark:text-[#38bdf8] hover:text-[#0284ff] dark:hover:text-white underline decoration-[#0284ff]/45 underline-offset-2 hover:decoration-[#0284ff] transition-colors break-words"
          >
            <span>{label}</span>
            <ExternalLink size={10} className="inline shrink-0 self-center opacity-80" />
          </a>
        );
      } else if (match[4]) {
        out.push(
          <strong key={`b-${keyCounter++}`} className="font-semibold text-slate-900 dark:text-white">
            {match[4]}
          </strong>
        );
      } else if (match[5]) {
        out.push(
          <code
            key={`c-${keyCounter++}`}
            dir="ltr"
            className="px-1.5 py-0.5 rounded bg-slate-200/75 dark:bg-white/[0.08] font-mono text-[11px] text-[#0369a1] dark:text-[#38bdf8]"
          >
            {match[5]}
          </code>
        );
      } else if (match[6]) {
        const rawUrl = match[6];
        const cleanHref = rawUrl.replace(/[.,;:!?]+$/, '');
        const trailingPunct = rawUrl.slice(cleanHref.length);
        let displayLabel = cleanHref;
        try {
          const parsedUrl = new URL(cleanHref);
          const host = parsedUrl.hostname.replace(/^www\./, '');
          const shortPath = parsedUrl.pathname !== '/' ? parsedUrl.pathname.slice(0, 28) : '';
          displayLabel = `${host}${shortPath}${parsedUrl.pathname.length > 28 ? '…' : ''}`;
        } catch {}
        out.push(
          <React.Fragment key={`raw-${keyCounter++}`}>
            <a
              href={cleanHref}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="inline-flex items-baseline gap-1 font-mono text-[11px] font-semibold text-[#0369a1] dark:text-[#38bdf8] hover:text-[#0284ff] dark:hover:text-white underline decoration-[#0284ff]/45 underline-offset-2 hover:decoration-[#0284ff] transition-colors"
            >
              <span>{displayLabel}</span>
              <ExternalLink size={10} className="inline shrink-0 self-center opacity-80" />
            </a>
            {trailingPunct}
          </React.Fragment>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      out.push(text.slice(lastIndex));
    }

    return out;
  }, [text]);

  return <>{tokens}</>;
};

function getLinkBadgeMeta(kind: CaseStudyLinkKind) {
  switch (kind) {
    case 'play':
      return {
        icon: Play,
        classes:
          'bg-emerald-500/12 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white border-emerald-500/30',
      };
    case 'github':
      return {
        icon: Github,
        classes:
          'bg-slate-100 dark:bg-white/[0.06] hover:bg-[#0284ff] text-slate-800 dark:text-slate-100 hover:text-white border-slate-200 dark:border-white/12',
      };
    case 'video':
      return {
        icon: Play,
        classes:
          'bg-rose-500/10 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white border-rose-500/25',
      };
    case 'demo':
      return {
        icon: Globe,
        classes:
          'bg-[#0284ff]/12 hover:bg-[#0284ff] text-[#0369a1] dark:text-[#38bdf8] hover:text-white border-[#0284ff]/30',
      };
    case 'doc':
      return {
        icon: BookOpen,
        classes:
          'bg-amber-500/10 hover:bg-amber-600 text-amber-700 dark:text-amber-300 hover:text-white border-amber-500/25',
      };
    default:
      return {
        icon: ExternalLink,
        classes:
          'bg-[#0284ff]/10 hover:bg-[#0284ff] text-[#0369a1] dark:text-[#38bdf8] hover:text-white border-[#0284ff]/25',
      };
  }
}

const SectionMediaStrip: React.FC<{
  images: string[];
  onImageClick?: (url: string) => void;
}> = ({ images, onImageClick }) => {
  if (!images || images.length === 0) return null;
  return (
    <div className="pt-2 border-t border-slate-200/70 dark:border-white/8 grid grid-cols-2 sm:grid-cols-3 gap-2">
      {images.slice(0, 3).map((src, idx) => (
        <button
          key={`${src}-${idx}`}
          type="button"
          onClick={() => onImageClick?.(src)}
          className="group relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-[#080b12] border border-slate-200/80 dark:border-white/10 hover:border-[#0284ff]/50 transition-colors cursor-pointer"
        >
          <img
            src={src}
            alt={`Section diagram ${idx + 1}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain p-1 group-hover:scale-[1.03] transition-transform duration-200"
          />
          {onImageClick && (
            <span className="absolute bottom-1.5 end-1.5 p-1 rounded-md bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={11} />
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export const CaseStudyStructuredView: React.FC<CaseStudyStructuredViewProps> = ({
  rawMarkdown,
  repoName,
  branch,
  docLang,
  uiLang,
  githubRepoUrl,
  googlePlayUrl,
  demoVideoUrl,
  onImageClick,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<'cards' | 'document'>('cards');
  const [activeSectionJump, setActiveSectionJump] = useState<string>('');

  const parsed = useMemo(
    () => extractStructuredCaseStudy(rawMarkdown, { repoName, branch }),
    [rawMarkdown, repoName, branch]
  );

  const orderedPillars: CaseStudyPillar[] = useMemo(() => {
    const list: CaseStudyPillar[] = [];
    if (parsed.pillars.problem) list.push(parsed.pillars.problem);
    if (parsed.pillars.solution) list.push(parsed.pillars.solution);
    if (parsed.pillars.results) list.push(parsed.pillars.results);
    return list;
  }, [parsed]);

  const bottomActionLinks: CaseStudyLink[] = useMemo(() => {
    const merged: CaseStudyLink[] = [...parsed.links];
    const seen = new Set(merged.map((l) => l.url.replace(/\/+$/, '').toLowerCase()));

    const pushFallback = (url: string | undefined, label: string, kind: CaseStudyLinkKind) => {
      if (!url) return;
      const norm = url.replace(/\/+$/, '').toLowerCase();
      if (!seen.has(norm)) {
        seen.add(norm);
        merged.push({ label, url, kind });
      }
    };

    pushFallback(
      googlePlayUrl,
      uiLang === 'ar' ? 'تطبيق Google Play' : 'Google Play',
      'play'
    );
    pushFallback(
      demoVideoUrl,
      uiLang === 'ar' ? 'فيديو العرض' : 'Video Demo',
      'video'
    );
    pushFallback(
      githubRepoUrl,
      uiLang === 'ar' ? 'مستودع GitHub' : 'GitHub Repository',
      'github'
    );

    return merged.slice(0, 10);
  }, [parsed.links, githubRepoUrl, googlePlayUrl, demoVideoUrl, uiLang]);

  const hasCardsContent =
    orderedPillars.length > 0 ||
    parsed.remainingSections.length > 0 ||
    parsed.executiveParagraphs.length > 0;
  const isDocAr = docLang === 'ar';

  const handleJumpSection = (anchorId: string) => {
    setActiveSectionJump(anchorId);
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!hasCardsContent) {
    return (
      <div dir={isDocAr ? 'rtl' : 'ltr'} className="pt-1 space-y-4">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-[#0369a1] dark:text-[#38bdf8]">
            {isDocAr ? 'مستند دراسة الحالة الكامل' : 'Full Engineering Study Case'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {parsed.readingMinutes} {isDocAr ? 'دقائق قراءة' : 'min read'}
          </span>
        </div>
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
    <div className="space-y-4">
      {/* Top Display Mode Segmented Switcher + Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label={uiLang === 'ar' ? 'طريقة عرض دراسة الحالة' : 'Study case view mode'}
          className="inline-flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-[#0f1117] border border-slate-200/90 dark:border-white/10 shadow-xs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'cards'}
            onClick={() => setActiveTab('cards')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'cards'
                ? 'bg-[#0284ff] text-white shadow-xs shadow-[#0284ff]/30'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid size={13} />
            <span>{uiLang === 'ar' ? 'بطاقات مرنة' : 'Structured Cards'}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'document'}
            onClick={() => setActiveTab('document')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'document'
                ? 'bg-[#0284ff] text-white shadow-xs shadow-[#0284ff]/30'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText size={13} />
            <span>{uiLang === 'ar' ? 'المستند الكامل' : 'Full Document'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
          <span>
            {parsed.readingMinutes} {uiLang === 'ar' ? 'دقائق قراءة' : 'min read'}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {Math.max(1, parsed.totalSections)} {uiLang === 'ar' ? 'أقسام' : 'sections'}
          </span>
        </div>
      </div>

      {/* Interactive Section Rail when viewing Structured Cards */}
      {activeTab === 'cards' && parsed.sectionNav.length >= 2 && (
        <div
          dir={isDocAr ? 'rtl' : 'ltr'}
          className="rounded-2xl bg-slate-50/90 dark:bg-[#0f1117]/90 backdrop-blur-md border border-slate-200/85 dark:border-white/10 p-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar"
        >
          {parsed.sectionNav.map((nav) => {
            const isSelected = activeSectionJump === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => handleJumpSection(nav.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#0284ff] text-white border-[#0284ff] shadow-xs shadow-[#0284ff]/25'
                    : 'bg-white dark:bg-white/[0.04] hover:bg-[#0284ff]/10 text-slate-700 dark:text-slate-300 hover:text-[#0369a1] dark:hover:text-[#38bdf8] border-slate-200/85 dark:border-white/10 hover:border-[#0284ff]/35'
                }`}
              >
                <Hash size={11} className={isSelected ? 'text-white/80' : 'text-[#0284ff]'} />
                <span className="max-w-[180px] truncate">{nav.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {activeTab === 'cards' ? (
          <motion.div
            key={`cards-${docLang}`}
            dir={isDocAr ? 'rtl' : 'ltr'}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            {/* Executive Summary & Extracted Metrics Strip */}
            {(parsed.title || parsed.executiveParagraphs.length > 0 || parsed.metrics.length > 0) && (
              <div
                id="cs-executive-anchor"
                className="scroll-mt-4 rounded-2xl bg-white/95 dark:bg-[#0f1117]/90 backdrop-blur-md border border-slate-200/85 dark:border-white/10 p-5 sm:p-6 space-y-3 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-[#0369a1] dark:text-[#38bdf8]">
                      {isDocAr ? 'الملخص التنفيذي' : 'Executive Overview'}
                    </span>
                    {orderedPillars.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {orderedPillars.length}{' '}
                          {isDocAr ? 'محاور أساسية' : 'core pillars'}
                        </span>
                      </>
                    )}
                    {parsed.remainingSections.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          +{parsed.remainingSections.length}{' '}
                          {isDocAr ? 'أقسام إضافية' : 'flexible sections'}
                        </span>
                      </>
                    )}
                  </div>

                  {parsed.metrics.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-700 dark:text-slate-200 font-semibold tabular-nums">
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

                {parsed.executiveParagraphs.length > 0 && (
                  <div className="space-y-2 max-w-4xl">
                    {parsed.executiveParagraphs.map((para, pIdx) => (
                      <p
                        key={pIdx}
                        className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
                      >
                        <RichInlineText text={para} />
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Flexible Pillar Cards: Problem · Solution · Results */}
            {orderedPillars.length > 0 && (
              <div
                className={`grid grid-cols-1 gap-4 ${
                  orderedPillars.length === 1
                    ? 'md:grid-cols-1'
                    : orderedPillars.length === 2
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
                      id={pillar.slug}
                      className="card-shimmer scroll-mt-4 rounded-2xl bg-white/95 dark:bg-[#0f1117]/90 backdrop-blur-md border border-slate-200/85 dark:border-white/10 p-5 flex flex-col justify-between gap-4 transition-colors hover:border-[#0284ff]/45 shadow-xs"
                    >
                      <div className="space-y-3">
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

                        {pillar.paragraphs.length > 0 ? (
                          <div className="space-y-2">
                            {pillar.paragraphs.map((paragraph, pIdx) => (
                              <p
                                key={pIdx}
                                className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed"
                              >
                                <RichInlineText text={paragraph} />
                              </p>
                            ))}
                          </div>
                        ) : pillar.summary ? (
                          <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <RichInlineText text={pillar.summary} />
                          </p>
                        ) : null}

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
                                <span className="min-w-0 break-words">
                                  <RichInlineText text={item} />
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <SectionMediaStrip images={pillar.images} onImageClick={onImageClick} />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Dynamic Flexible Extra Sections (automatically adapts if sections are added/removed) */}
            {parsed.remainingSections.length > 0 && (
              <div
                className={`grid grid-cols-1 gap-4 ${
                  parsed.remainingSections.length === 1 ? 'md:grid-cols-1' : 'md:grid-cols-2'
                }`}
              >
                {parsed.remainingSections.map((extra, eIdx) => (
                  <article
                    key={`${extra.id}-${eIdx}`}
                    id={extra.slug}
                    className="card-shimmer scroll-mt-4 rounded-2xl bg-white/95 dark:bg-[#0f1117]/90 backdrop-blur-md border border-slate-200/85 dark:border-white/10 hover:border-[#0284ff]/40 p-5 space-y-2.5 transition-colors shadow-xs"
                  >
                    <h6 className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span aria-hidden="true" className="w-1.5 h-4 rounded-full bg-[#0284ff] shrink-0" />
                      <span>{extra.title}</span>
                    </h6>
                    {extra.paragraphs.length > 0 ? (
                      <div className="space-y-2">
                        {extra.paragraphs.map((p, pi) => (
                          <p
                            key={pi}
                            className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
                          >
                            <RichInlineText text={p} />
                          </p>
                        ))}
                      </div>
                    ) : extra.summary ? (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        <RichInlineText text={extra.summary} />
                      </p>
                    ) : null}
                    {extra.bullets.length > 0 && (
                      <ul className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-white/8">
                        {extra.bullets.map((b, bi) => (
                          <li
                            key={bi}
                            className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0284ff] shrink-0 mt-1.5" />
                            <span className="min-w-0 break-words">
                              <RichInlineText text={b} />
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <SectionMediaStrip images={extra.images} onImageClick={onImageClick} />
                  </article>
                ))}
              </div>
            )}

            {/* Bottom Clickable Study Case Links & Quick Resource Bar */}
            {bottomActionLinks.length > 0 && (
              <div className="rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-[#0f1117] dark:via-[#0f1117] dark:to-[#0284ff]/[0.08] border border-slate-200/90 dark:border-[#0284ff]/25 p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Link2 size={14} className="text-[#0284ff] dark:text-[#38bdf8]" />
                    <span>
                      {uiLang === 'ar'
                        ? 'الروابط والمصادر السريعة لدراسة الحالة'
                        : 'Study Case Links & Resources'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    {bottomActionLinks.length} {uiLang === 'ar' ? 'روابط نشطة' : 'active links'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {bottomActionLinks.map((item) => {
                    const meta = getLinkBadgeMeta(item.kind);
                    const LinkIcon = meta.icon;
                    return (
                      <a
                        key={item.url}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn-kinetic inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap ${meta.classes}`}
                      >
                        <LinkIcon size={13} className="shrink-0" />
                        <span className="max-w-[220px] truncate">{item.label}</span>
                        <ExternalLink size={11} className="shrink-0 opacity-75" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`document-${docLang}`}
            dir={isDocAr ? 'rtl' : 'ltr'}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="pt-1"
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
  );
};
