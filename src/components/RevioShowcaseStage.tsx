import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ExternalLink,
  Youtube,
  ChevronLeft,
  ChevronRight,
  Layers,
  Smartphone,
} from 'lucide-react';
import { FEATURED_PROJECTS, Project } from '../data/portfolioData';
import {
  VERIFIED_REPO_SCREENSHOTS,
  ConsolidatedGitHubPortfolio,
  fetchConsolidatedGitHubPortfolio,
} from '../services/githubService';
import { resolveSmartProjectLinks } from '../utils/projectLinks';
import { ImageWithSkeleton, preloadImageUrls } from './ImageWithSkeleton';
import { TiltCard } from './MotionPrimitives';
import { usePlayStoreAppStats } from '../services/playStoreService';
import { useLanguage } from '../context/LanguageContext';
import { VideoDemoModal } from './VideoDemoModal';

interface RevioShowcaseStageProps {
  isDark?: boolean;
  onInspectRevio?: () => void;
  onInspectProject?: (project: Project, screenIndex?: number) => void;
}

const SHOWCASE_REPO_ORDER = ['Revio', 'Movura', 'Sky-Cast', 'Vibrant-store'];

function formatHeroScreenLabel(url: string, idx: number): string {
  try {
    const base = (url.split('/').pop() || '')
      .split('?')[0]
      .replace(/\.(png|jpe?g|webp)$/i, '')
      .replace(/[_-]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();
    if (!base) return `Screen ${idx + 1}`;
    return base.length > 18 ? `${base.slice(0, 16)}…` : base;
  } catch {
    return `Screen ${idx + 1}`;
  }
}

export const RevioShowcaseStage: React.FC<RevioShowcaseStageProps> = ({
  onInspectRevio,
  onInspectProject,
}) => {
  const { lang, dir, t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [selectedRepoKey, setSelectedRepoKey] = useState<string>('Revio');
  const [[screenIndex, screenDirection], setScreenState] = useState<[number, number]>([0, 1]);
  const [videoModalState, setVideoModalState] = useState<{
    projectName: string;
    videoUrl: string;
  } | null>(null);
  const { data: revioPlayStats } = usePlayStoreAppStats('com.ahmed.revio');

  const { data: cachedConsolidated } = useQuery<ConsolidatedGitHubPortfolio>({
    queryKey: ['github-consolidated', 'ahmed-el-bialy'],
    queryFn: () => fetchConsolidatedGitHubPortfolio('ahmed-el-bialy'),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const showcaseApps = useMemo(() => {
    return SHOWCASE_REPO_ORDER.map((repoKey) =>
      FEATURED_PROJECTS.find((p) => p.repoName.toLowerCase() === repoKey.toLowerCase())
    ).filter((p): p is Project => Boolean(p));
  }, []);

  const activeProject = useMemo(() => {
    return (
      showcaseApps.find((p) => p.repoName.toLowerCase() === selectedRepoKey.toLowerCase()) ||
      showcaseApps[0]
    );
  }, [showcaseApps, selectedRepoKey]);

  const activeScreens = useMemo(() => {
    if (!activeProject) return [];
    const liveMedia =
      cachedConsolidated?.liveMediaMap?.[activeProject.repoName] ||
      cachedConsolidated?.liveMediaMap?.[activeProject.repoName.toLowerCase()];
    const rawList =
      (liveMedia?.discoveredScreenshots?.length ? liveMedia.discoveredScreenshots : null) ||
      VERIFIED_REPO_SCREENSHOTS[activeProject.repoName] ||
      VERIFIED_REPO_SCREENSHOTS[activeProject.repoName.toLowerCase()] ||
      [];
    const list = rawList.filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
    return list.slice(0, 4).map((src, idx) => ({
      id: `${activeProject.repoName}-${idx}`,
      label: formatHeroScreenLabel(src, idx),
      src,
    }));
  }, [activeProject, cachedConsolidated]);

  // Preload active app screens & primary screens of showcase apps on mount/switch
  useEffect(() => {
    const urls = [
      ...activeScreens.map((s) => s.src),
      ...SHOWCASE_REPO_ORDER.map((k) => VERIFIED_REPO_SCREENSHOTS[k]?.[0]).filter(Boolean) as string[],
    ];
    preloadImageUrls(urls);
  }, [activeScreens]);

  if (!activeProject) return null;

  const isRevio = activeProject.repoName.toLowerCase() === 'revio';
  const safeScreenCount = activeScreens.length;
  const normalizedIdx = safeScreenCount > 0 ? ((screenIndex % safeScreenCount) + safeScreenCount) % safeScreenCount : 0;
  const currentScreen = activeScreens[normalizedIdx] || activeScreens[0];

  const liveMedia =
    cachedConsolidated?.liveMediaMap?.[activeProject.repoName] ||
    cachedConsolidated?.liveMediaMap?.[activeProject.name] ||
    cachedConsolidated?.liveMediaMap?.[activeProject.repoName.toLowerCase()];
  const liveRelease =
    cachedConsolidated?.releasesMap?.[activeProject.repoName] ||
    cachedConsolidated?.releasesMap?.[activeProject.repoName.toLowerCase()];
  const resolvedLinks = resolveSmartProjectLinks(activeProject.links || {}, liveMedia);

  const demoVideoUrl = resolvedLinks.demoVideoUrl || activeProject.links?.liveDemoUrl || activeProject.links?.demoVideoUrl;
  const playUrl = resolvedLinks.googlePlayUrl || activeProject.links?.googlePlay;

  const handleSelectApp = (repoName: string) => {
    if (repoName.toLowerCase() === selectedRepoKey.toLowerCase()) return;
    setSelectedRepoKey(repoName);
    setScreenState([0, 1]);
  };

  const handleInspect = () => {
    try {
      const dynamicApkUrl = resolvedLinks.apkDownloadUrl || liveRelease?.apkDownloadUrl;
      const dynamicReleaseUrl = resolvedLinks.releaseUrl || liveRelease?.releaseUrl;
      const enrichedProject: Project = {
        ...activeProject,
        technologies: Array.isArray(activeProject.technologies) ? activeProject.technologies : [],
        features: Array.isArray(activeProject.features) ? activeProject.features : [],
        hasApk: Boolean(activeProject.hasApk || dynamicApkUrl || liveRelease?.hasRelease),
        links: {
          ...activeProject.links,
          github: activeProject.links?.github || `https://github.com/ahmed-el-bialy/${activeProject.repoName}`,
          demoVideoUrl: resolvedLinks.demoVideoUrl,
          liveDemoUrl:
            resolvedLinks.webLiveDemoUrl || liveMedia?.liveDemoUrl || activeProject.links?.liveDemoUrl,
          playlistUrl: resolvedLinks.playlistUrl,
          googlePlay: playUrl,
          apkDownloadUrl: dynamicApkUrl,
          releaseUrl: dynamicReleaseUrl,
        },
      };

      if (onInspectProject) {
        onInspectProject(enrichedProject, normalizedIdx);
      } else if (isRevio && onInspectRevio) {
        onInspectRevio();
      }
    } catch {
      if (onInspectProject) {
        onInspectProject(activeProject, 0);
      } else if (isRevio && onInspectRevio) {
        onInspectRevio();
      }
    }
  };

  const handleNext = () => {
    if (activeScreens.length === 0) return;
    setScreenState(([prev]) => [(prev + 1) % activeScreens.length, 1]);
  };

  const handlePrev = () => {
    if (activeScreens.length === 0) return;
    setScreenState(([prev]) => [(prev - 1 + activeScreens.length) % activeScreens.length, -1]);
  };

  const handleJumpScreen = (targetIdx: number) => {
    if (targetIdx === normalizedIdx) return;
    setScreenState([targetIdx, targetIdx > normalizedIdx ? 1 : -1]);
  };

  const slideSign = dir === 'rtl' ? -1 : 1;
  const screenSlideVariants = {
    enter: (direction: number) =>
      prefersReducedMotion
        ? { opacity: 0 }
        : { x: direction * 20 * slideSign, opacity: 0, scale: 0.98 },
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) =>
      prefersReducedMotion
        ? { opacity: 0 }
        : { x: -direction * 20 * slideSign, opacity: 0, scale: 0.98 },
  };

  return (
    <TiltCard
      maxTilt={2.5}
      glareOpacity={0.08}
      className="card-shimmer overflow-hidden w-full h-full flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] p-4 sm:p-5 shadow-xl"
    >
      {/* Interactive Multi-App Switcher Header */}
      <div className="space-y-3 pb-3.5 border-b border-slate-200/80 dark:border-white/8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Smartphone size={16} className="text-[#0284ff] dark:text-[#00C7FF] shrink-0" />
            <span className="font-display text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate tracking-tight">
              {activeProject.name}
            </span>
            {isRevio && revioPlayStats?.downloads && (
              <span className="font-display text-xs sm:text-[13px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap tabular-nums">
                · {revioPlayStats.downloads} {lang === 'ar' ? 'تحميل' : 'Downloads'}
              </span>
            )}
            {isRevio && revioPlayStats?.rating && (
              <span className="font-display text-xs sm:text-[13px] font-bold text-amber-500 whitespace-nowrap tabular-nums">
                · ★ {revioPlayStats.rating}
              </span>
            )}
            {!isRevio && (
              <span className="font-display text-xs font-semibold text-slate-500 dark:text-slate-400">
                · Flutter App
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            0{safeScreenCount > 0 ? normalizedIdx + 1 : 0} / 0{activeScreens.length}
          </span>
        </div>

        {/* Live Hero App Switcher Tabs with Shared layoutId Spring Pill */}
        <LayoutGroup id="hero-app-switcher">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {showcaseApps.map((appItem) => {
              const active = appItem.repoName.toLowerCase() === activeProject.repoName.toLowerCase();
              return (
                <button
                  key={appItem.id}
                  type="button"
                  onClick={() => handleSelectApp(appItem.repoName)}
                  className={`font-display relative px-3.5 py-2 sm:py-1.5 rounded-lg text-xs sm:text-[13px] font-bold tracking-tight transition-colors cursor-pointer whitespace-nowrap border min-h-[44px] sm:min-h-[36px] ${
                    active
                      ? 'text-white border-transparent'
                      : 'bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-[#0284ff]/45'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="hero-app-switcher-pill"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute inset-0 rounded-lg bg-[#0284ff] shadow-xs"
                    />
                  )}
                  <span className="relative z-10">{appItem.name}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      {/* Main Interactive Phone Stage */}
      <div className="my-3 sm:my-4 flex-1 flex items-center justify-center min-h-[280px] sm:min-h-[340px]">
        <div className="w-full grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Portrait Phone Mockup */}
          <div className="sm:col-span-6 flex justify-center">
            <div className="relative w-[178px] sm:w-[220px] rounded-[32px] sm:rounded-[34px] p-2 sm:p-2.5 bg-[#0c101b] border-[3px] border-slate-300 dark:border-slate-700 shadow-2xl">
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-20 w-14 h-3 rounded-full bg-slate-900 border border-slate-800 pointer-events-none" />
              <div
                onClick={handleInspect}
                role="button"
                tabIndex={0}
                data-cursor-label={lang === 'ar' ? 'معاينة' : 'Inspect'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleInspect();
                  }
                }}
                aria-label={`Inspect ${activeProject.name}`}
                className="relative w-full aspect-[9/18.5] rounded-[24px] overflow-hidden bg-[#161e31] cursor-pointer"
              >
                <AnimatePresence initial={false} mode="popLayout" custom={screenDirection}>
                  {currentScreen && (
                    <motion.div
                      key={currentScreen.id}
                      custom={screenDirection}
                      variants={screenSlideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full h-full"
                    >
                      <ImageWithSkeleton
                        src={currentScreen.src}
                        alt={`${activeProject.name} ${currentScreen.label}`}
                        loading="eager"
                        variant="phone"
                        className="w-full h-full object-cover object-top crisp-screenshot"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Interactive Details & Screen Controls */}
          <div className="sm:col-span-6 flex flex-col justify-between gap-3">
            <div>
              <h3 className="font-display text-xl sm:text-[22px] font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                {activeProject.name}
              </h3>
              <p className="text-xs sm:text-[13px] font-semibold text-[#0284ff] dark:text-[#00C7FF] mt-1 line-clamp-1">
                {activeProject.subtitle}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                {activeProject.description}
              </p>
            </div>

            {/* Screen Quick Switcher */}
            {activeScreens.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5">
                {activeScreens.map((scr, idx) => (
                  <button
                    key={scr.id}
                    type="button"
                    onClick={() => handleJumpScreen(idx)}
                    className={`px-2.5 py-2 rounded-xl text-[11px] font-mono font-semibold text-start border transition-all cursor-pointer truncate capitalize min-h-[44px] sm:min-h-[38px] ${
                      normalizedIdx === idx
                        ? 'bg-[#0284ff]/12 border-[#0284ff]/60 text-[#0284ff] dark:text-[#00C7FF] shadow-2xs'
                        : 'bg-slate-50 dark:bg-[#161b27] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/25'
                    }`}
                  >
                    {scr.label}
                  </button>
                ))}
              </div>
            )}

            {/* Prev / Next + Open Full App Workspace */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous screen"
                  className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#161b27] text-slate-700 dark:text-slate-200 flex items-center justify-center hover:border-[#0284ff] transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next screen"
                  className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#161b27] text-slate-700 dark:text-slate-200 flex items-center justify-center hover:border-[#0284ff] transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleInspect}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-[38px] rounded-xl bg-[#0284ff]/10 hover:bg-[#0284ff] text-xs font-bold text-[#0284ff] dark:text-[#00C7FF] hover:text-white border border-[#0284ff]/25 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Layers size={13} />
                <span>{lang === 'ar' ? 'فتح التفاصيل الكاملة' : 'Open Workspace'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Bottom Action Bar */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-white/8 flex flex-wrap items-center justify-between gap-2">
        {playUrl ? (
          <a
            href={playUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-kinetic flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[38px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold whitespace-nowrap shadow-xs"
          >
            <ExternalLink size={13} />
            <span>
              {lang === 'ar'
                ? `تطبيق ${activeProject.name} على Google Play`
                : `Get ${activeProject.name} on Google Play`}
            </span>
          </a>
        ) : (
          <a
            href={activeProject.links?.github || `https://github.com/ahmed-el-bialy/${activeProject.repoName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-kinetic flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[38px] rounded-xl bg-slate-900 dark:bg-white/10 hover:bg-[#0284ff] text-white text-xs font-bold whitespace-nowrap shadow-xs"
          >
            <ExternalLink size={13} />
            <span>
              {lang === 'ar' ? `كود ${activeProject.name} على GitHub` : `${activeProject.name} on GitHub`}
            </span>
          </a>
        )}

        {demoVideoUrl && (
          <button
            type="button"
            onClick={() =>
              setVideoModalState({
                projectName: activeProject.name,
                videoUrl: demoVideoUrl,
              })
            }
            className="btn-kinetic flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[38px] rounded-xl bg-red-500/10 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 border border-red-500/25 text-xs font-semibold whitespace-nowrap cursor-pointer"
          >
            <Youtube size={13} />
            <span>{t.projects.actions.watchDemo}</span>
          </button>
        )}
      </div>

      <VideoDemoModal
        isOpen={Boolean(videoModalState)}
        onClose={() => setVideoModalState(null)}
        projectName={videoModalState?.projectName || activeProject.name}
        videoUrl={videoModalState?.videoUrl}
      />
    </TiltCard>
  );
};
