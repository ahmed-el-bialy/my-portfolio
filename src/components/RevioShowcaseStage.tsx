import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  Youtube,
  ChevronLeft,
  ChevronRight,
  Layers,
  Smartphone,
} from 'lucide-react';
import { AHMED_CONFIG } from '../data/config';
import { FEATURED_PROJECTS, Project } from '../data/portfolioData';
import { VERIFIED_REPO_SCREENSHOTS } from '../services/githubService';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import { TiltCard } from './MotionPrimitives';
import { usePlayStoreAppStats } from '../services/playStoreService';
import { useLanguage } from '../context/LanguageContext';

interface RevioShowcaseStageProps {
  isDark?: boolean;
  onInspectRevio?: () => void;
  onInspectProject?: (project: Project) => void;
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
  const { lang, t } = useLanguage();
  const [selectedRepoKey, setSelectedRepoKey] = useState<string>('Revio');
  const [screenIndex, setScreenIndex] = useState(0);
  const { data: revioPlayStats } = usePlayStoreAppStats('com.ahmed.revio');

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
    const list =
      VERIFIED_REPO_SCREENSHOTS[activeProject.repoName] ||
      VERIFIED_REPO_SCREENSHOTS[activeProject.repoName.toLowerCase()] ||
      [];
    return list.slice(0, 4).map((src, idx) => ({
      id: `${activeProject.repoName}-${idx}`,
      label: formatHeroScreenLabel(src, idx),
      src,
    }));
  }, [activeProject]);

  if (!activeProject) return null;

  const isRevio = activeProject.repoName.toLowerCase() === 'revio';
  const currentScreen = activeScreens[screenIndex % Math.max(1, activeScreens.length)] || activeScreens[0];
  const demoVideoUrl = activeProject.links.liveDemoUrl || activeProject.links.demoVideoUrl;
  const playUrl = activeProject.links.googlePlay;

  const handleSelectApp = (repoName: string) => {
    setSelectedRepoKey(repoName);
    setScreenIndex(0);
  };

  const handleInspect = () => {
    if (onInspectProject) {
      onInspectProject(activeProject);
    } else if (isRevio && onInspectRevio) {
      onInspectRevio();
    }
  };

  const handleNext = () => {
    if (activeScreens.length === 0) return;
    setScreenIndex((prev) => (prev + 1) % activeScreens.length);
  };

  const handlePrev = () => {
    if (activeScreens.length === 0) return;
    setScreenIndex((prev) => (prev - 1 + activeScreens.length) % activeScreens.length);
  };

  return (
    <TiltCard
      maxTilt={3}
      glareOpacity={0.09}
      className="w-full h-full flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] p-4 sm:p-5 shadow-xl"
    >
      {/* Interactive Multi-App Switcher Header */}
      <div className="space-y-3 pb-3.5 border-b border-slate-200/80 dark:border-white/8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone size={14} className="text-[#027DFD] dark:text-[#00C7FF] shrink-0" />
            <span className="font-mono text-xs font-bold text-[#027DFD] dark:text-[#00C7FF] truncate">
              {activeProject.name}
            </span>
            {isRevio && revioPlayStats?.downloads && (
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap tabular-nums">
                · {revioPlayStats.downloads} {lang === 'ar' ? 'تحميل' : 'Downloads'}
              </span>
            )}
            {isRevio && revioPlayStats?.rating && (
              <span className="text-[11px] font-mono font-bold text-amber-500 whitespace-nowrap tabular-nums">
                · ★ {revioPlayStats.rating}
              </span>
            )}
            {!isRevio && (
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                · Flutter App
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            0{(screenIndex % Math.max(1, activeScreens.length)) + 1} / 0{activeScreens.length}
          </span>
        </div>

        {/* Live Hero App Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {showcaseApps.map((appItem) => {
            const active = appItem.repoName.toLowerCase() === activeProject.repoName.toLowerCase();
            return (
              <button
                key={appItem.id}
                type="button"
                onClick={() => handleSelectApp(appItem.repoName)}
                className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap border ${
                  active
                    ? 'bg-[#027DFD] text-white border-[#027DFD] shadow-xs'
                    : 'bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-[#027DFD]/40'
                }`}
              >
                {appItem.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Phone Stage */}
      <div className="my-4 flex-1 flex items-center justify-center min-h-[340px]">
        <div className="w-full grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Portrait Phone Mockup */}
          <div className="sm:col-span-6 flex justify-center">
            <div className="relative w-[215px] sm:w-[225px] rounded-[34px] p-2.5 bg-[#08090d] border-[3px] border-slate-800 dark:border-slate-700 shadow-2xl">
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-20 w-14 h-3 rounded-full bg-slate-900 border border-slate-800" />
              <div className="relative aspect-[9/18.5] rounded-[24px] overflow-hidden bg-slate-950">
                <AnimatePresence mode="wait">
                  {currentScreen && (
                    <motion.div
                      key={currentScreen.id}
                      initial={{ opacity: 0, scale: 0.985 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.985 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full"
                    >
                      <ImageWithSkeleton
                        src={currentScreen.src}
                        alt={`${activeProject.name} ${currentScreen.label}`}
                        loading="eager"
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
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                {activeProject.name}
              </h3>
              <p className="text-xs font-semibold text-[#027DFD] dark:text-[#00C7FF] mt-0.5 line-clamp-1">
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
                    onClick={() => setScreenIndex(idx)}
                    className={`px-2.5 py-2 rounded-xl text-[11px] font-mono font-semibold text-start border transition-colors cursor-pointer truncate capitalize ${
                      screenIndex === idx
                        ? 'bg-[#027DFD]/10 border-[#027DFD]/50 text-[#027DFD] dark:text-[#00C7FF]'
                        : 'bg-slate-50 dark:bg-[#161b27] border-slate-200 dark:border-white/8 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
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
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#161b27] text-slate-700 dark:text-slate-200 flex items-center justify-center hover:border-[#027DFD] transition-colors cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next screen"
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#161b27] text-slate-700 dark:text-slate-200 flex items-center justify-center hover:border-[#027DFD] transition-colors cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleInspect}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#027DFD]/10 hover:bg-[#027DFD] text-xs font-bold text-[#027DFD] dark:text-[#00C7FF] hover:text-white border border-[#027DFD]/20 transition-colors cursor-pointer"
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
            className="btn-kinetic inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold whitespace-nowrap shadow-xs"
          >
            <ExternalLink size={13} />
            <span>{lang === 'ar' ? 'تطبيق Revio على Google Play' : 'Get Revio on Google Play'}</span>
          </a>
        ) : (
          <a
            href={activeProject.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-kinetic inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white/10 hover:bg-[#027DFD] text-white text-xs font-bold whitespace-nowrap shadow-xs"
          >
            <ExternalLink size={13} />
            <span>
              {lang === 'ar' ? `كود ${activeProject.name} على GitHub` : `${activeProject.name} on GitHub`}
            </span>
          </a>
        )}

        {demoVideoUrl && (
          <a
            href={demoVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-kinetic inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 border border-red-500/25 text-xs font-semibold whitespace-nowrap"
          >
            <Youtube size={13} />
            <span>{t.projects.actions.watchDemo}</span>
          </a>
        )}
      </div>
    </TiltCard>
  );
};
