import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Github,
  Play,
  ArrowUpRight,
  Smartphone,
  Layers,
  Code2,
  CheckCircle2,
  Image as ImageIcon,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Download,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Cpu,
  PackageCheck,
  FileCode,
  Copy,
  Check,
  Palette,
  BookOpen,
  Star,
  Sparkles,
  RefreshCw,
  Eye,
  Loader2,
  Database,
  GitBranch,
  Youtube
} from 'lucide-react';
import { Project, AHMED_PROFILE } from '../data/portfolioData';
import { ProjectCardCover } from './ProjectCardCover';
import {
  fetchRepoScreenshots,
  checkRepoRelease,
  fetchRepoLiveMetadata,
  extractYouTubeVideoId,
  getLanguageColor,
  VERIFIED_REPO_SCREENSHOTS,
  RepoReleaseInfo,
  formatFileSize
} from '../services/githubService';
import { useScrollLock } from '../hooks/useScrollLock';
import { useLanguage } from '../context/LanguageContext';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

// Subcomponent: Individual Screenshot with shimmer skeleton and graceful error fallback
const ScreenshotCard: React.FC<{
  url: string;
  index: number;
  projectName: string;
  onClick: () => void;
}> = ({ url, index, projectName, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 cursor-pointer shadow-md hover:border-blue-500 hover:shadow-lg transition-all"
    >
      {/* Loading Shimmer Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700/60 dark:to-slate-800 animate-pulse flex flex-col items-center justify-center p-3 text-slate-400">
          <Loader2 size={20} className="animate-spin mb-1 text-blue-500" />
          <span className="text-[10px] font-mono">Loading screen...</span>
        </div>
      )}

      {/* Fallback Card if image fails to load */}
      {hasError ? (
        <div className="absolute inset-0 bg-slate-900 text-slate-300 p-4 flex flex-col items-center justify-center text-center">
          <Smartphone size={24} className="text-cyan-400 mb-2 opacity-80" />
          <p className="text-xs font-bold text-white mb-0.5">{projectName}</p>
          <p className="text-[10px] text-slate-400 font-mono">Screen #{index + 1}</p>
          <span className="mt-2 text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300">
            Preview Screen
          </span>
        </div>
      ) : (
        <img
          src={url}
          alt={`${projectName} screen ${index + 1}`}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2">
        <ZoomIn size={26} className="text-white drop-shadow-md" />
        <span className="text-[10px] font-mono mt-1 font-bold">Screen {index + 1}</span>
      </div>
    </div>
  );
};

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  useScrollLock(isOpen);
  const { lang, dir } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'screenshots' | 'specs'>('overview');
  const [isPlayingInline, setIsPlayingInline] = useState(false);
  const [activeScreenIndex, setActiveScreenIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [loadingScreens, setLoadingScreens] = useState<boolean>(false);
  const [releaseInfo, setReleaseInfo] = useState<RepoReleaseInfo>({
    hasRelease: false
  });
  const [copiedClone, setCopiedClone] = useState<boolean>(false);
  const [liveYoutubeUrl, setLiveYoutubeUrl] = useState<string | undefined>(project?.links.youtubeDemo);
  const [livePlayUrl, setLivePlayUrl] = useState<string | undefined>(project?.links.googlePlay);

  const isRevio = project?.name.toLowerCase() === 'revio' || project?.repoName.toLowerCase() === 'revio';

  const handleCopyClone = () => {
    if (!project?.links.github) return;
    const cloneUrl = `${project.links.github}.git`;
    navigator.clipboard.writeText(`git clone ${cloneUrl}`);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && project) {
      setActiveTab('overview');
      setActiveScreenIndex(0);
      setLightboxOpen(false);
      setIsPlayingInline(false);
      setLiveYoutubeUrl(project.links.youtubeDemo);
      setLivePlayUrl(project.links.googlePlay);

      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }

      // 1. Immediately populate from verified list if known to avoid any blank state
      const verified =
        VERIFIED_REPO_SCREENSHOTS[project.repoName] ||
        VERIFIED_REPO_SCREENSHOTS[project.name] ||
        VERIFIED_REPO_SCREENSHOTS[project.repoName.toLowerCase()];

      if (verified && verified.length > 0) {
        setScreenshots(verified);
        setLoadingScreens(false);
      } else {
        setLoadingScreens(true);
      }

      // 2. Fetch fresh live README and media from GitHub
      fetchRepoLiveMetadata(project.repoName)
        .then((liveMeta) => {
          if (liveMeta.youtubeDemoUrl) {
            setLiveYoutubeUrl(liveMeta.youtubeDemoUrl);
          }
          if (liveMeta.googlePlayUrl) {
            setLivePlayUrl(liveMeta.googlePlayUrl);
          }
          if (liveMeta.apkDownloadUrl) {
            setReleaseInfo((prev) => ({
              ...prev,
              hasRelease: true,
              apkDownloadUrl: liveMeta.apkDownloadUrl,
              releaseUrl: liveMeta.releaseUrl || prev.releaseUrl,
            }));
          }
        })
        .catch(() => {});

      // 3. Fetch dynamic contents from GitHub API in parallel
      fetchRepoScreenshots(project.repoName)
        .then((urls) => {
          if (urls.length > 0) {
            setScreenshots(urls);
          } else if (verified && verified.length > 0) {
            setScreenshots(verified);
          } else if (project.image) {
            setScreenshots([project.image]);
          }
        })
        .catch(() => {
          if (verified && verified.length > 0) {
            setScreenshots(verified);
          } else if (project.image) {
            setScreenshots([project.image]);
          }
        })
        .finally(() => setLoadingScreens(false));

      checkRepoRelease(project.repoName).then((rel) => {
        setReleaseInfo(rel);
      });
    }
  }, [isOpen, project]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (lightboxOpen) setLightboxOpen(false);
        else onClose();
      } else if (lightboxOpen) {
        if (e.key === 'ArrowRight') nextScreen();
        if (e.key === 'ArrowLeft') prevScreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, lightboxOpen, screenshots.length]);

  if (!isOpen || !project) return null;

  const currentVideoUrl = liveYoutubeUrl || project.links.youtubeDemo;
  const currentPlayUrl = livePlayUrl || project.links.googlePlay;
  const parsedVideoId = extractYouTubeVideoId(currentVideoUrl);
  const isShorts = Boolean(currentVideoUrl && currentVideoUrl.includes('/shorts/'));
  const youtubeIframeSrc = parsedVideoId
    ? `https://www.youtube-nocookie.com/embed/${parsedVideoId}?autoplay=1&rel=0&modestbranding=1`
    : null;
  const youtubePosterUrl = parsedVideoId
    ? `https://img.youtube.com/vi/${parsedVideoId}/hqdefault.jpg`
    : null;

  const nextScreen = () => {
    if (screenshots.length === 0) return;
    setActiveScreenIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevScreen = () => {
    if (screenshots.length === 0) return;
    setActiveScreenIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const hasApk = Boolean(
    project.links.apkDownloadUrl ||
    releaseInfo.apkDownloadUrl ||
    (releaseInfo.hasRelease && releaseInfo.releaseUrl) ||
    project.hasApk
  );
  const hasPlayStore = Boolean(currentPlayUrl);

  const modalNode = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl my-auto bg-white dark:bg-[#121420] border border-slate-200 dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#161826] border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm shrink-0"
              style={{ backgroundColor: `${getLanguageColor(project.technologies[0])}20`, color: getLanguageColor(project.technologies[0]) }}
            >
              <Smartphone size={20} />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate title-contrast">
                  {project.name}
                </h3>
                {hasPlayStore && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-semibold shrink-0">
                    Google Play
                  </span>
                )}
                {hasApk && (
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-mono font-semibold shrink-0 flex items-center gap-1">
                    <Download size={10} />
                    <span>APK Ready</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
                {project.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ms-2">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-200/70 dark:bg-white/10 hover:bg-red-500 hover:text-white text-slate-700 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 sm:px-6 pt-3 bg-slate-50/50 dark:bg-[#161826]/50 border-b border-slate-200 dark:border-white/10 gap-1.5 sm:gap-2 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400 bg-white dark:bg-[#121420]'
                : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'نظرة عامة وعرض' : 'Overview & Demo'}
          </button>
          <button
            onClick={() => setActiveTab('screenshots')}
            className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'screenshots'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400 bg-white dark:bg-[#121420]'
                : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon size={13} />
            <span>{lang === 'ar' ? `لقطات الشاشة (${screenshots.length})` : `Screenshots (${screenshots.length})`}</span>
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400 bg-white dark:bg-[#121420]'
                : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>{lang === 'ar' ? 'المعمارية والمواصفات' : 'Architecture & Specs'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div ref={scrollRef} className="overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm text-slate-700 dark:text-gray-300">
          
          {/* TAB 1: OVERVIEW & VIDEO */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Media Preview (Video Play In-Place or Project Cover) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-1.5 pb-0.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                    {lang === 'ar' ? 'معاينة الوسائط والتطبيق' : 'Media & Application Preview'}
                  </span>
                </div>

                {currentVideoUrl && parsedVideoId ? (
                  <div className="space-y-2.5">
                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-white/10 shadow-lg">
                      {isPlayingInline && youtubeIframeSrc ? (
                        <div className="w-full h-full relative bg-black">
                          <iframe
                            src={youtubeIframeSrc}
                            title={`${project.name} Demonstration`}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                          <button
                            onClick={() => setIsPlayingInline(false)}
                            className="absolute top-2 end-2 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-white text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors shadow-md"
                            title="Close Player"
                          >
                            <RefreshCw size={11} />
                            <span>Reset</span>
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => setIsPlayingInline(true)}
                          className="relative w-full h-full bg-slate-950 flex items-center justify-center group overflow-hidden cursor-pointer"
                        >
                          {youtubePosterUrl ? (
                            <img
                              src={youtubePosterUrl}
                              alt={`${project.name} Video Preview`}
                              className="w-full h-full object-cover filter brightness-75 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = project.image;
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-950" />
                          )}

                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                          {/* Big Center Play Button: 1-Click Play In-Place */}
                          <div className="relative z-10 flex flex-col items-center text-center p-4">
                            <div
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 group-hover:scale-110 active:scale-95 transition-all mb-3"
                              aria-label="Play In-Place"
                            >
                              <Play size={28} className="translate-x-0.5 fill-white text-white" />
                            </div>

                            <h4 className="text-sm sm:text-base font-bold text-white drop-shadow-md">
                              {lang === 'ar' ? `تشغيل استعراض فيديو ${project.name}` : `Play ${project.name} Video Demonstration`}
                            </h4>
                            <span className="text-[11px] text-gray-200 mt-1 font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-xs">
                              {lang === 'ar' ? 'اضغط للتشغيل هنا مباشرة' : 'Click to Play In-Place'}
                            </span>
                          </div>

                          {/* Top corner badge */}
                          <div className="absolute top-3 start-3 px-2.5 py-1 rounded-md bg-red-600 text-white font-mono text-[10px] font-bold flex items-center gap-1 shadow-md">
                            <Play size={10} fill="white" />
                            <span>YouTube Demo</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Bar: Direct Video Link + Channel Subscribe CTA */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
                      <a
                        href={currentVideoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 font-semibold transition-colors"
                      >
                        <ExternalLink size={13} />
                        <span>{lang === 'ar' ? 'مشاهدة مباشرة على YouTube' : 'Open in YouTube'}</span>
                      </a>

                      <a
                        href={AHMED_PROFILE.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors shadow-xs"
                      >
                        <Youtube size={14} />
                        <span>{lang === 'ar' ? 'زيارة قناة YouTube للاشتراك' : 'Visit YouTube Channel to Subscribe'}</span>
                        <ArrowUpRight size={12} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg">
                      <ProjectCardCover
                        repoName={project.repoName}
                        language={project.technologies[0] || 'Dart'}
                        coverUrl={project.image}
                        description={project.description}
                        topics={project.technologies}
                      />
                    </div>

                    {/* Friendly Channel Banner when video demo is not available */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-600/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-500/20">
                          <Youtube size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {lang === 'ar' ? 'عروض وتطبيقات فلاتر على YouTube' : 'Watch Flutter App Demos on YouTube'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-gray-400">
                            {lang === 'ar' ? 'تابع قناة أحمد لمشاهدة استعراضات المشاريع والاشتراك' : 'Visit Ahmed\'s channel to watch mobile project walkthroughs & subscribe'}
                          </p>
                        </div>
                      </div>
                      <a
                        href={AHMED_PROFILE.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors shadow-xs"
                      >
                        <Youtube size={14} />
                        <span>{lang === 'ar' ? 'زيارة القناة على YouTube' : 'Visit YouTube Channel'}</span>
                        <ArrowUpRight size={12} />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* APK & Distribution Status Banner */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <PackageCheck size={18} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {hasPlayStore
                        ? (lang === 'ar' ? 'منشور رسميًا على Google Play Store' : 'Published on Google Play Store')
                        : hasApk
                        ? (lang === 'ar' ? 'حزمة APK جاهزة للتحميل الفوري' : 'Android APK Package Ready for Direct Download')
                        : (lang === 'ar' ? 'مستودع كود مفتوح المصدر على GitHub' : 'Open Source Mobile Repository')}
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-gray-300 mt-0.5">
                      {hasPlayStore
                        ? (lang === 'ar' ? 'نسخة الإنتاج مفحوصة ومتاحة الآن للمستخدمين حول العالم.' : 'Live production build verified and available on Google Play.')
                        : hasApk
                        ? (lang === 'ar' ? 'ملف التثبيت (.apk) متاح للاختبار المباشر على أي هاتف أندرويد.' : 'Pre-built Android package (.apk) available for immediate testing & sideloading.')
                        : (lang === 'ar' ? 'الكود المصدري جاهز للبناء عبر Flutter SDK.' : 'Source codebase ready to build via Flutter SDK (`flutter build apk --release`).')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  {hasPlayStore && (
                    <a
                      href={project.links.googlePlay}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-xs"
                    >
                      <ArrowUpRight size={13} />
                      <span>Google Play</span>
                    </a>
                  )}
                  {hasApk && (
                    <a
                      href={project.links.apkDownloadUrl || releaseInfo.apkDownloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-xs"
                    >
                      <Download size={13} />
                      <span>Download APK</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Code2 size={15} className="text-blue-500" />
                  <span>{lang === 'ar' ? 'نظرة عامة والهدف الهندسي' : 'Project Overview & Engineering Purpose'}</span>
                </h4>
                <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-xs sm:text-sm">
                  {project.description}
                </p>
              </div>

              {/* Core Feature Highlights */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>{lang === 'ar' ? 'الميزات الأساسية المنفذة' : 'Core Implementation Features'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {project.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-start gap-2.5 shadow-xs"
                    >
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700 dark:text-gray-300 leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technologies Applied */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Cpu size={15} className="text-purple-500" />
                  <span>{lang === 'ar' ? 'التقنيات والمكتبات المستخدمة' : 'Technologies & Libraries'}</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 text-xs font-mono font-semibold text-blue-900 dark:text-cyan-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCREENSHOTS WITH SKELETON LOADERS */}
          {activeTab === 'screenshots' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-slate-500 dark:text-gray-400">
                  {lang === 'ar'
                    ? `معرض لقطات الشاشة الحية (${screenshots.length} شاشة تم التحقق منها)`
                    : `Verified Live Screenshots Gallery (${screenshots.length} screens)`}
                </span>
                <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                  {lang === 'ar' ? 'اضغط للتكبير والشاشة الكاملة' : 'Click to zoom fullscreen'}
                </span>
              </div>

              {loadingScreens ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {[1, 2, 3, 4, 5, 6].map((sk) => (
                    <div
                      key={sk}
                      className="aspect-[9/16] rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700/60 dark:to-slate-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : screenshots.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-gray-400">
                  <ImageIcon size={32} className="mx-auto mb-2 opacity-40 text-blue-500" />
                  <p>{lang === 'ar' ? 'لم يتم العثور على لقطات شاشة لهذا المستودع.' : 'No screenshot gallery found for this repository.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {screenshots.map((url, i) => (
                    <ScreenshotCard
                      key={i}
                      url={url}
                      index={i}
                      projectName={project.name}
                      onClick={() => {
                        setActiveScreenIndex(i);
                        setLightboxOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ARCHITECTURE & SPECS (CLEAR, NON-CONFUSING) */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              {/* Architecture Diagram Breakdown */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <ShieldCheck size={16} className="text-cyan-500" />
                  <span>{lang === 'ar' ? 'معمارية Clean Architecture المطبقة في فلاتر' : 'Flutter Clean Architecture Standards'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                  {lang === 'ar'
                    ? 'فصل صارم بين الطبقات لضمان قابلية التوسع والصيانة وسهولة الاختبار (Unit & Widget Testing):'
                    : 'Strict separation of concerns to guarantee high maintainability, testability, and decoupling:'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-black/30 border border-blue-500/20 shadow-xs">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Smartphone size={14} className="text-blue-500" />
                      <span className="font-bold text-blue-600 dark:text-cyan-400">1. Presentation</span>
                    </div>
                    <p className="text-slate-600 dark:text-gray-400 text-[11px] leading-relaxed">
                      {lang === 'ar'
                        ? 'واجهات فلاتر (Widgets)، الشاشات (Views)، ومستمعي الحالات (BlocConsumer/BlocBuilder)، وحركات الانتقال 3D.'
                        : 'Flutter UI widgets, responsive views, Cubit/Bloc state listeners, and smooth 3D animations.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-black/30 border border-emerald-500/20 shadow-xs">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <GitBranch size={14} className="text-emerald-500" />
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">2. Domain</span>
                    </div>
                    <p className="text-slate-600 dark:text-gray-400 text-[11px] leading-relaxed">
                      {lang === 'ar'
                        ? 'دارت نقي (Pure Dart) بدون أي حزم خارجية: الكيانات (Entities)، حالات الاستخدام (UseCases)، وعقود المستودعات (Contracts).'
                        : 'Pure Dart entities, business use cases, and repository interfaces with zero framework coupling.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-black/30 border border-purple-500/20 shadow-xs">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Database size={14} className="text-purple-500" />
                      <span className="font-bold text-purple-600 dark:text-purple-400">3. Data</span>
                    </div>
                    <p className="text-slate-600 dark:text-gray-400 text-[11px] leading-relaxed">
                      {lang === 'ar'
                        ? 'نماذج البيانات (Models & Mappers)، التخزين المحلي السريع (Hive CE Box)، وتكاملات الشبكة (REST API / Firebase).'
                        : 'Data models, JSON serializers, Hive CE local caching boxes, and remote REST/Firebase datasources.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* State Management Flow */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                  <RefreshCw size={14} className="text-cyan-500" />
                  <span>{lang === 'ar' ? 'دورة تدفق الحالة (Predictable State Flow)' : 'Predictable Reactive State Flow'}</span>
                </h5>
                <div className="p-3 rounded-xl bg-slate-900 text-slate-300 font-mono text-[11px] space-y-1 leading-relaxed">
                  <div className="text-cyan-400">UI Interaction (User Tap)</div>
                  <div className="text-slate-500 ps-3">↓ Calls Cubit method</div>
                  <div className="text-emerald-400 ps-3">Cubit executes Domain UseCase</div>
                  <div className="text-slate-500 ps-6">↓ Queries Repository Implementation</div>
                  <div className="text-purple-400 ps-6">Data Source (Hive CE / REST) returns Result</div>
                  <div className="text-slate-500 ps-3">↓ Cubit emits new immutable state</div>
                  <div className="text-blue-400">BlocBuilder selectively repaints affected widget only (0 overhead)</div>
                </div>
              </div>

              {/* Build and Execution Guide */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2.5 border border-slate-800">
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} />
                    <span>{lang === 'ar' ? 'أوامر الاستنساخ والتشغيل' : 'Repository Commands & Build Steps'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Flutter SDK 3.x+</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Clone:</span>
                    <code className="bg-black/40 px-2 py-0.5 rounded text-emerald-400">git clone https://github.com/ahmed-el-bialy/{project.repoName}.git</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Run App:</span>
                    <code className="bg-black/40 px-2 py-0.5 rounded text-cyan-300">flutter pub get && flutter run</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Build APK:</span>
                    <code className="bg-black/40 px-2 py-0.5 rounded text-purple-300">flutter build apk --release</code>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="p-3.5 sm:p-5 bg-slate-50 dark:bg-[#161826] border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {hasPlayStore && (
              <a
                href={project.links.googlePlay}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <ArrowUpRight size={14} />
                <span>Google Play Store</span>
              </a>
            )}

            {hasApk && (
              <a
                href={
                  project.links.apkDownloadUrl ||
                  releaseInfo.apkDownloadUrl ||
                  releaseInfo.releaseUrl ||
                  `https://github.com/ahmed-el-bialy/${project.repoName}/releases`
                }
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <Download size={14} />
                <span>{project.links.apkDownloadUrl || releaseInfo.apkDownloadUrl ? 'Download APK' : 'View Release'}</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-800/80 text-[10px] font-mono font-bold text-purple-100">
                  {formatFileSize(releaseInfo.apkSize)}
                </span>
              </a>
            )}

            {currentVideoUrl && (
              <a
                href={currentVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/15 hover:bg-red-600 text-red-600 hover:text-white dark:text-red-400 font-semibold text-xs border border-red-500/25 transition-all cursor-pointer"
              >
                <Play size={13} fill="currentColor" />
                <span>{lang === 'ar' ? 'مشاهدة الفيديو' : 'Watch Video'}</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 ms-auto flex-wrap">
            {project.links.github && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-xs">
                <span className="text-slate-400 select-none hidden sm:inline">$</span>
                <span className="text-slate-700 dark:text-cyan-300 font-medium text-[11px] truncate max-w-[130px] sm:max-w-[200px]">
                  git clone {project.repoName}.git
                </span>
                <button
                  type="button"
                  onClick={handleCopyClone}
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 transition-colors cursor-pointer"
                  title="Copy git clone command"
                >
                  {copiedClone ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
            )}

            {project.links.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-300 dark:border-white/10 font-semibold text-xs transition-colors shadow-xs"
              >
                <Github size={14} />
                <span>Source Code</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

      </div>

      {/* Lightbox Overlay */}
      {lightboxOpen && screenshots.length > 0 && (
        <div
          className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 end-4 text-white hover:text-red-400 p-2 cursor-pointer z-20"
          >
            <X size={28} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevScreen();
            }}
            className="absolute start-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer z-20"
          >
            <ChevronLeft size={24} />
          </button>

          <img
            src={screenshots[activeScreenIndex]}
            alt={`Screenshot ${activeScreenIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextScreen();
            }}
            className="absolute end-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer z-20"
          >
            <ChevronRight size={24} />
          </button>

          {/* Indicator Counter */}
          <div className="absolute bottom-5 inset-x-0 flex justify-center pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-xs">
              {activeScreenIndex + 1} / {screenshots.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};
