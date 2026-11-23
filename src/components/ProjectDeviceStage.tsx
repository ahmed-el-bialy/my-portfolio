import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Smartphone,
  Youtube,
  Play,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  ArrowUpRight,
  Film,
} from 'lucide-react';
import { AHMED_PROFILE } from '../data/portfolioData';
import { formatReadableScreenName } from '../utils/readmeTemplateExtractor';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import { ProjectCardCover } from './ProjectCardCover';
import { YouTubeEmbedPlayer } from './YouTubeEmbedPlayer';

export type DeviceStageMode = 'screens' | 'video';

interface ProjectDeviceStageProps {
  lang: 'en' | 'ar';
  dir: 'ltr' | 'rtl';
  repoName: string;
  displayName: string;
  realLanguage: string | null;
  coverImage?: string;
  isHighlight?: boolean;
  description: string;
  technologies: string[];
  screenshots: string[];
  activeScreenIndex: number;
  loadingScreens: boolean;
  stageMode: DeviceStageMode;
  isPlayingVideo: boolean;
  parsedVideoId: string | null;
  youtubeIframeSrc: string | null;
  youtubePosterUrl: string | null;
  playerCandidateUrl?: string;
  playlistUrl?: string;
  githubRepoUrl: string;
  onChangeStageMode: (mode: DeviceStageMode) => void;
  onPlayVideo: () => void;
  onSelectScreen: (index: number) => void;
  onPrevScreen: () => void;
  onNextScreen: () => void;
  onOpenLightbox: () => void;
  onJumpToGallery: () => void;
}

export const ProjectDeviceStage: React.FC<ProjectDeviceStageProps> = ({
  lang,
  dir,
  repoName,
  displayName,
  realLanguage,
  coverImage,
  isHighlight,
  description,
  technologies,
  screenshots,
  activeScreenIndex,
  loadingScreens,
  stageMode,
  isPlayingVideo,
  parsedVideoId,
  youtubeIframeSrc,
  youtubePosterUrl,
  playerCandidateUrl,
  playlistUrl,
  onChangeStageMode,
  onPlayVideo,
  onSelectScreen,
  onPrevScreen,
  onNextScreen,
  onOpenLightbox,
  onJumpToGallery,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [userToggledStage, setUserToggledStage] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const hasVideo = Boolean(youtubeIframeSrc && parsedVideoId);
  const isShorts = Boolean(
    playerCandidateUrl && playerCandidateUrl.toLowerCase().includes('/shorts/')
  );
  const screenCount = screenshots.length;
  const safeIndex =
    screenCount > 0 && Number.isFinite(activeScreenIndex)
      ? ((Math.trunc(activeScreenIndex) % screenCount) + screenCount) % screenCount
      : 0;
  const activeScreenUrl = screenCount > 0 ? screenshots[safeIndex] : '';

  useEffect(() => {
    setUserToggledStage(false);
    setPosterError(false);
  }, [repoName, youtubePosterUrl]);

  // Default to Video Demo whenever the project has a video; otherwise show screens immediately
  // unless the user explicitly clicked the Video Demo tab to view the channel fallback.
  const effectiveMode: DeviceStageMode =
    stageMode === 'video'
      ? hasVideo || userToggledStage || screenCount === 0
        ? 'video'
        : 'screens'
      : 'screens';

  const handleSelectMode = (mode: DeviceStageMode) => {
    setUserToggledStage(true);
    onChangeStageMode(mode);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || screenCount <= 1) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = endX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) < 40) return;
    const isSwipingForward = dir === 'rtl' ? deltaX > 0 : deltaX < 0;
    if (isSwipingForward) {
      onNextScreen();
    } else {
      onPrevScreen();
    }
  };

  const stageTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <div className="rounded-2xl bg-slate-50/85 dark:bg-white/[0.025] border border-slate-200/85 dark:border-white/10 p-3.5 sm:p-5 flex flex-col gap-3.5">
      {/* Segmented Tab Switcher + Contextual Utility Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div
          role="tablist"
          aria-label={lang === 'ar' ? 'وضع معاينة المشروع' : 'Project media stage mode'}
          className="relative grid grid-cols-2 sm:inline-flex items-center gap-1 p-1 rounded-xl bg-slate-200/75 dark:bg-[#080b12] border border-slate-200/80 dark:border-white/10"
        >
          <button
            type="button"
            role="tab"
            id="stage-tab-video"
            aria-selected={effectiveMode === 'video'}
            aria-controls="stage-panel-viewport"
            onClick={() => handleSelectMode('video')}
            className={`relative z-10 inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-[36px] rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              effectiveMode === 'video'
                ? 'text-slate-950 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {effectiveMode === 'video' && (
              <motion.span
                layoutId="deviceStageActiveTab"
                transition={stageTransition}
                className="absolute inset-0 -z-10 rounded-lg bg-white dark:bg-[#161e2e] shadow-xs border border-slate-200/60 dark:border-white/10"
              />
            )}
            <Youtube
              size={14}
              className={
                effectiveMode === 'video'
                  ? 'text-red-600 dark:text-red-400 shrink-0'
                  : 'shrink-0'
              }
            />
            <span>{lang === 'ar' ? 'فيديو العرض' : 'Video Demo'}</span>
          </button>

          <button
            type="button"
            role="tab"
            id="stage-tab-screens"
            aria-selected={effectiveMode === 'screens'}
            aria-controls="stage-panel-viewport"
            onClick={() => handleSelectMode('screens')}
            className={`relative z-10 inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-[36px] rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              effectiveMode === 'screens'
                ? 'text-slate-950 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {effectiveMode === 'screens' && (
              <motion.span
                layoutId="deviceStageActiveTab"
                transition={stageTransition}
                className="absolute inset-0 -z-10 rounded-lg bg-white dark:bg-[#161e2e] shadow-xs border border-slate-200/60 dark:border-white/10"
              />
            )}
            <Smartphone
              size={14}
              className={
                effectiveMode === 'screens'
                  ? 'text-[#0284ff] dark:text-[#38bdf8] shrink-0'
                  : 'shrink-0'
              }
            />
            <span>{lang === 'ar' ? 'شاشات التطبيق' : 'App Screens'}</span>
            {screenCount > 0 && (
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  effectiveMode === 'screens'
                    ? 'text-[#0369a1] dark:text-[#38bdf8]'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {screenCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Contextual Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 px-0.5 shrink-0">
          {effectiveMode === 'video' ? (
            <>
              {isShorts && hasVideo && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  <Film size={12} className="text-red-500 shrink-0" />
                  <span>{lang === 'ar' ? 'عرض رأسي 9:16' : 'App Reel · 9:16'}</span>
                </span>
              )}
              {playlistUrl && (
                <a
                  href={playlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#0369a1] dark:text-[#38bdf8] hover:underline whitespace-nowrap py-1"
                >
                  <span>{lang === 'ar' ? 'قائمة التشغيل' : 'Full Playlist'}</span>
                  <ExternalLink size={11} />
                </a>
              )}
            </>
          ) : (
            screenCount > 0 && (
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
                <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                  {String(safeIndex + 1).padStart(2, '0')} /{' '}
                  {String(screenCount).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={onOpenLightbox}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[38px] sm:min-h-[34px] rounded-lg bg-white dark:bg-white/[0.05] hover:bg-[#0284ff] text-slate-700 dark:text-slate-200 hover:text-white border border-slate-200/80 dark:border-white/10 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  aria-label={lang === 'ar' ? 'تكبير الشاشة' : 'Zoom active screen'}
                >
                  <ZoomIn size={13} />
                  <span>{lang === 'ar' ? 'تكبير' : 'Zoom'}</span>
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Main Interactive Media Stage Viewport */}
      <div
        id="stage-panel-viewport"
        role="tabpanel"
        aria-labelledby={
          effectiveMode === 'video' ? 'stage-tab-video' : 'stage-tab-screens'
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {effectiveMode === 'video' ? (
            <motion.div
              key="stage-view-video"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={stageTransition}
              className="space-y-3"
            >
              {hasVideo && parsedVideoId ? (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#06080f] border border-slate-200/90 dark:border-white/12 shadow-lg">
                  {isPlayingVideo ? (
                    <YouTubeEmbedPlayer
                      videoId={parsedVideoId}
                      title={`${displayName} Live Video Demo`}
                      youtubeUrl={playerCandidateUrl}
                      autoplay={true}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={onPlayVideo}
                      className="group relative w-full h-full flex flex-col items-center justify-center overflow-hidden cursor-pointer bg-[#070a12] px-4 text-center"
                    >
                      {youtubePosterUrl && !posterError ? (
                        <img
                          src={youtubePosterUrl}
                          alt={`${displayName} demo preview`}
                          referrerPolicy="no-referrer"
                          onError={() => setPosterError(true)}
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-[1.03] group-hover:opacity-90 transition-all duration-300"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#08090d] to-[#111827]"
                        />
                      )}

                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20"
                      />

                      <span className="relative z-10 w-16 h-16 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-2xl shadow-red-600/40 group-hover:scale-105 active:scale-95 transition-transform duration-200">
                        <Play size={24} fill="currentColor" className="ms-0.5" />
                      </span>

                      <span className="relative z-10 mt-3 text-sm sm:text-base font-bold text-white drop-shadow">
                        {lang === 'ar'
                          ? `تشغيل العرض التوضيحي لتطبيق ${displayName}`
                          : `Play ${displayName} Video Walkthrough`}
                      </span>
                      <span className="relative z-10 mt-1 text-[11px] font-mono text-slate-200/90">
                        {lang === 'ar'
                          ? 'اضغط للتشغيل المباشر داخل النافذة'
                          : 'Tap to stream demo inline'}
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-[#0d1220] to-slate-950 border border-white/10 p-5 sm:p-6 flex flex-col items-center justify-center text-center text-white">
                  <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center mb-3">
                    <Youtube size={24} />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {lang === 'ar'
                      ? 'استعراض شروحات التطبيقات على YouTube'
                      : 'App Walkthroughs on YouTube'}
                  </h4>
                  <p className="text-xs text-slate-300 max-w-sm mt-1 mb-4 leading-relaxed">
                    {lang === 'ar'
                      ? 'لا يوجد فيديو مضمن مباشر لهذا المستودع حالياً؛ يمكنك معاينة شاشات التطبيق أو مشاهدة بقية العروض على القناة الرسمية.'
                      : 'No direct demo clip is embedded for this repository yet. Inspect the mobile screens or browse walkthroughs on YouTube.'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {screenCount > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSelectMode('screens')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-[#0284ff] hover:bg-[#0070e0] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Smartphone size={14} />
                        <span>
                          {lang === 'ar' ? 'معاينة شاشات التطبيق' : 'View App Screens'}
                        </span>
                      </button>
                    )}
                    <a
                      href={AHMED_PROFILE.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
                    >
                      <Youtube size={14} />
                      <span>
                        {lang === 'ar' ? 'قناة يوتيوب' : 'YouTube Channel'}
                      </span>
                      <ArrowUpRight size={13} />
                    </a>
                  </div>
                </div>
              )}

              {screenCount > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400 px-0.5">
                  <span>
                    {lang === 'ar'
                      ? 'أو اضغط على أي شاشة أدناه لمعاينتها داخل إطار الهاتف'
                      : 'Or tap any screen thumbnail below to inspect inside the phone frame'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectMode('screens')}
                    className="inline-flex items-center gap-1 font-mono font-bold text-[#0369a1] dark:text-[#38bdf8] hover:underline cursor-pointer shrink-0 py-1"
                  >
                    <span>
                      {lang === 'ar' ? 'عرض شاشة الهاتف' : 'Switch to Phone View'}
                    </span>
                    <ChevronRight size={13} className={dir === 'rtl' ? 'rotate-180' : ''} />
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="stage-view-screens"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={stageTransition}
            >
              {loadingScreens && screenCount === 0 ? (
                <div className="min-h-[320px] rounded-2xl bg-[#161e31] skeleton-shimmer flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-[#00C7FF]" />
                </div>
              ) : screenCount > 0 && activeScreenUrl ? (
                <div className="flex flex-col items-center gap-3 py-1">
                  <div
                    className="relative flex items-center justify-center w-full"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    {screenCount > 1 && (
                      <button
                        type="button"
                        onClick={onPrevScreen}
                        className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#141a29] hover:bg-[#0284ff] text-slate-700 dark:text-slate-200 hover:text-white border border-slate-200/90 dark:border-white/15 shadow-sm transition-colors cursor-pointer me-4 shrink-0"
                        aria-label={lang === 'ar' ? 'الشاشة السابقة' : 'Previous screen'}
                      >
                        <ChevronLeft
                          size={17}
                          className={dir === 'rtl' ? 'rotate-180' : ''}
                        />
                      </button>
                    )}

                    {/* Interactive Phone Chassis */}
                    <div className="relative w-[198px] sm:w-[216px] aspect-[9/17.8] rounded-[30px] p-2 bg-[#0c101b] border-2 border-slate-300/90 dark:border-white/20 shadow-2xl overflow-hidden group">
                      <div
                        aria-hidden="true"
                        className="absolute top-2.5 left-1/2 -translate-x-1/2 w-14 h-1.5 rounded-full bg-slate-800 z-20 pointer-events-none"
                      />

                      <button
                        type="button"
                        onClick={onOpenLightbox}
                        className="w-full h-full rounded-[22px] overflow-hidden bg-[#161e31] block cursor-pointer relative"
                        aria-label={
                          lang === 'ar'
                            ? 'فتح الشاشة بملء العرض'
                            : 'Open screen in fullscreen lightbox'
                        }
                      >
                        <ImageWithSkeleton
                          key={activeScreenUrl}
                          src={activeScreenUrl}
                          alt={`${displayName} — ${formatReadableScreenName(
                            activeScreenUrl,
                            safeIndex
                          )}`}
                          loading="eager"
                          variant="phone"
                          className="w-full h-full object-cover object-top crisp-screenshot group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      </button>

                      {/* Mobile On-Frame Arrows (44px touch targets) */}
                      {screenCount > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPrevScreen();
                            }}
                            className="sm:hidden absolute start-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 text-white flex items-center justify-center z-20 cursor-pointer active:scale-95 transition-transform"
                            aria-label={lang === 'ar' ? 'الشاشة السابقة' : 'Previous screen'}
                          >
                            <ChevronLeft
                              size={18}
                              className={dir === 'rtl' ? 'rotate-180' : ''}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNextScreen();
                            }}
                            className="sm:hidden absolute end-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 text-white flex items-center justify-center z-20 cursor-pointer active:scale-95 transition-transform"
                            aria-label={lang === 'ar' ? 'الشاشة التالية' : 'Next screen'}
                          >
                            <ChevronRight
                              size={18}
                              className={dir === 'rtl' ? 'rotate-180' : ''}
                            />
                          </button>
                        </>
                      )}

                      <div
                        aria-hidden="true"
                        className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-white/30 z-20 pointer-events-none"
                      />
                    </div>

                    {screenCount > 1 && (
                      <button
                        type="button"
                        onClick={onNextScreen}
                        className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#141a29] hover:bg-[#0284ff] text-slate-700 dark:text-slate-200 hover:text-white border border-slate-200/90 dark:border-white/15 shadow-sm transition-colors cursor-pointer ms-4 shrink-0"
                        aria-label={lang === 'ar' ? 'الشاشة التالية' : 'Next screen'}
                      >
                        <ChevronRight
                          size={17}
                          className={dir === 'rtl' ? 'rotate-180' : ''}
                        />
                      </button>
                    )}
                  </div>

                  {/* Active Screen Caption & Quick Action */}
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-mono font-semibold capitalize truncate max-w-[200px]">
                      {formatReadableScreenName(activeScreenUrl, safeIndex)}
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                      ·
                    </span>
                    <button
                      type="button"
                      onClick={onOpenLightbox}
                      className="text-[#0369a1] dark:text-[#38bdf8] hover:underline font-semibold cursor-pointer py-1"
                    >
                      {lang === 'ar' ? 'تكبير الشاشة' : 'Inspect Fullscreen'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
                  <ProjectCardCover
                    repoName={repoName}
                    language={realLanguage || 'Dart'}
                    coverUrl={coverImage}
                    discoveredScreenshots={screenshots}
                    isHighlight={isHighlight}
                    description={description}
                    topics={technologies}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Synchronized Interactive Filmstrip (Bridges Video Demo <-> Phone Screens) */}
      {screenCount > 0 && (
        <div className="pt-3 border-t border-slate-200/80 dark:border-white/8 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {screenshots.slice(0, 6).map((thumb, idx) => {
            const active = safeIndex === idx && effectiveMode === 'screens';
            return (
              <button
                key={`${thumb}-${idx}`}
                type="button"
                onClick={() => {
                  handleSelectMode('screens');
                  onSelectScreen(idx);
                }}
                className={`w-11 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-[#161e31] ${
                  active
                    ? 'border-[#0284ff] scale-[1.04] shadow-sm'
                    : 'border-slate-200 dark:border-white/15 opacity-80 hover:opacity-100'
                }`}
                aria-label={`${lang === 'ar' ? 'معاينة الشاشة' : 'Inspect screen'} ${
                  idx + 1
                }`}
              >
                <ImageWithSkeleton
                  src={thumb}
                  alt={`${displayName} screen ${idx + 1}`}
                  loading="eager"
                  variant="phone"
                  className="w-full h-full object-cover object-top crisp-screenshot"
                />
              </button>
            );
          })}

          <button
            type="button"
            onClick={onJumpToGallery}
            className="h-16 px-3 min-w-[54px] rounded-lg border border-dashed border-slate-300 dark:border-white/20 hover:border-[#0284ff] bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 hover:text-[#0369a1] dark:hover:text-[#38bdf8] text-[11px] font-mono font-bold shrink-0 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ms-auto whitespace-nowrap"
          >
            <ImageIcon size={14} />
            <span className="tabular-nums">
              {lang === 'ar' ? `الكل (${screenCount})` : `All (${screenCount})`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
