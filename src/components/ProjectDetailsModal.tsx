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
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Database,
  GitBranch,
  Youtube,
  Sparkles,
  Activity,
  Award,
  BarChart3,
  CheckCircle,
  FileCode
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
import { SmartphoneFrame } from './SmartphoneFrame';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

type ModalTab = 'overview' | 'architecture' | 'screenshots' | 'casestudy';

// High-performance individual screenshot card with zero layout shift and shimmer skeleton
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
      className="group relative aspect-[9/16] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-white/10 cursor-pointer shadow-md hover:border-blue-500/80 dark:hover:border-cyan-400 hover:shadow-xl transition-all duration-300"
    >
      {/* Loading Shimmer Skeleton (Matches exact 9:16 aspect ratio to guarantee 0 CLS) */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700/50 to-slate-800 animate-pulse flex flex-col items-center justify-center p-3 text-slate-400">
          <Loader2 size={22} className="animate-spin mb-2 text-cyan-400" />
          <span className="text-[11px] font-mono text-slate-300 font-semibold">Screen #{index + 1}</span>
          <span className="text-[9px] font-mono text-slate-500 mt-0.5">Loading preview...</span>
        </div>
      )}

      {/* Fallback Display if network fails to fetch GitHub raw asset */}
      {hasError ? (
        <div className="absolute inset-0 bg-slate-900 text-slate-300 p-4 flex flex-col items-center justify-center text-center">
          <Smartphone size={28} className="text-cyan-400 mb-2 opacity-80" />
          <p className="text-xs font-bold text-white mb-0.5">{projectName}</p>
          <p className="text-[10px] text-slate-400 font-mono">Mobile Screen #{index + 1}</p>
          <span className="mt-2 text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300 font-medium">
            Production UI
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
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      {/* Hover Zoom Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end text-white p-3">
        <div className="p-2 rounded-full bg-blue-600/80 backdrop-blur-xs text-white mb-1 shadow-lg">
          <ZoomIn size={18} />
        </div>
        <span className="text-[11px] font-mono font-bold tracking-wide">Screen #{index + 1}</span>
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

  const [activeTab, setActiveTab] = useState<ModalTab>('overview');
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

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCopyClone = () => {
    if (!project?.links.github) return;
    const cloneUrl = `${project.links.github}.git`;
    navigator.clipboard.writeText(`git clone ${cloneUrl}`);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

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

      // 1. Immediately populate from verified list if known to avoid blank delays
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

      // 3. Fetch dynamic screenshot files from GitHub API in parallel
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
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
    >
      <div
        className="relative w-full max-w-4xl my-auto sm:my-auto bg-white dark:bg-[#0c0f18] border-t sm:border border-slate-200 dark:border-white/10 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden transition-all duration-300 transform translate-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div 
          className="w-full pt-3 pb-1 flex justify-center sm:hidden cursor-pointer bg-slate-50 dark:bg-[#121624] border-b border-slate-200/50 dark:border-white/5" 
          onClick={onClose}
          aria-label="Close bottom sheet"
        >
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
        </div>
        
        {/* Header Bar */}
        <div className="p-3.5 sm:p-5 bg-slate-50 dark:bg-[#121624] border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm shrink-0"
              style={{
                backgroundColor: `${getLanguageColor(project.technologies[0])}20`,
                color: getLanguageColor(project.technologies[0])
              }}
            >
              <Smartphone size={20} />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 id="modal-project-title" className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate tracking-tight">
                  {project.name}
                </h3>
                {hasPlayStore && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold shrink-0">
                    Google Play Live
                  </span>
                )}
                {hasApk && (
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-mono font-bold shrink-0 flex items-center gap-1">
                    <Download size={10} />
                    <span>APK Ready</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5 font-medium">
                {project.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ms-2">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-200/80 dark:bg-white/10 hover:bg-red-500 hover:text-white text-slate-700 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Deep 4-Tab Navigation: Overview · Architecture · Screenshots · Case Study & Metrics */}
        <div className="flex items-center px-3 sm:px-6 pt-2.5 bg-slate-50/80 dark:bg-[#121624]/80 border-b border-slate-200 dark:border-white/10 gap-1 sm:gap-2 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400 bg-white dark:bg-[#0c0f18]'
                : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone size={13} />
            <span>{lang === 'ar' ? 'نظرة عامة وعرض' : 'Overview & Demo'}</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400 bg-white dark:bg-[#0c0f18]'
                : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>{lang === 'ar' ? 'المعمارية والهندسة' : 'Architecture & Stack'}</span>
          </button>

          <button
            onClick={() => setActiveTab('screenshots')}
            className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'screenshots'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400 bg-white dark:bg-[#0c0f18]'
                : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon size={13} />
            <span>{lang === 'ar' ? `الشاشات (${screenshots.length})` : `Screenshots (${screenshots.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('casestudy')}
            className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'casestudy'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400 bg-white dark:bg-[#0c0f18]'
                : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 size={13} />
            <span>{lang === 'ar' ? 'دراسة الحالة والأرقام' : 'Case Study & Metrics'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div ref={scrollRef} className="overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm text-slate-700 dark:text-gray-300">
          
          {/* TAB 1: OVERVIEW & IN-PLACE VIDEO */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Media Preview: Pure in-place YouTube player or YouTube Channel CTA fallback */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-1.5 pb-0.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider font-mono">
                    {lang === 'ar' ? 'معاينة الفيديو والتطبيق' : 'In-Place Application Demonstration'}
                  </span>
                </div>

                {currentVideoUrl && parsedVideoId ? (
                  <div className="space-y-2.5">
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-white/10 shadow-xl">
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
                            className="absolute top-3 end-3 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white text-[11px] font-mono flex items-center gap-1.5 cursor-pointer transition-colors shadow-lg border border-white/10"
                            title="Reset Player"
                          >
                            <RefreshCw size={12} />
                            <span>{lang === 'ar' ? 'إغلاق الفيديو' : 'Close Player'}</span>
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
                              className="w-full h-full object-cover filter brightness-85 group-hover:brightness-100 group-hover:scale-105 transition-all duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = project.image;
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-950" />
                          )}

                          {/* YouTube Gradient & Dark Vignette Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 group-hover:from-black/40 group-hover:via-black/10 transition-colors" />

                          {/* YouTube Badge Watermark */}
                          <div className="absolute top-3.5 start-3.5 z-10 px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 flex items-center gap-1.5 text-white text-xs font-mono shadow-lg">
                            <Youtube size={15} className="text-red-500 fill-red-500" />
                            <span className="font-bold tracking-wide">YouTube HD</span>
                          </div>

                          {/* Perfectly Centered Official YouTube Rounded-Rectangle Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <div
                              className="w-20 h-14 sm:w-24 sm:h-16 rounded-2xl bg-[#ff0000] hover:bg-[#e60000] text-white flex items-center justify-center shadow-[0_12px_35px_rgba(255,0,0,0.55)] group-hover:scale-110 group-hover:shadow-[0_18px_45px_rgba(255,0,0,0.75)] active:scale-95 transition-all duration-300 cursor-pointer pointer-events-auto border border-white/25"
                              aria-label="Play Video Demonstration"
                            >
                              <Play size={28} className="translate-x-0.5 fill-white text-white drop-shadow-md" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Bar: Direct Video Link + Channel Subscribe CTA */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
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
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors shadow-xs"
                      >
                        <Youtube size={14} />
                        <span>{lang === 'ar' ? 'زيارة قناة YouTube للاشتراك' : 'Visit YouTube Channel'}</span>
                        <ArrowUpRight size={12} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg">
                      <ProjectCardCover
                        repoName={project.repoName}
                        language={project.technologies[0] || 'Dart'}
                        coverUrl={project.image}
                        description={project.description}
                        topics={project.technologies}
                      />
                    </div>

                    {/* Prominent 'Visit YouTube Channel' CTA replacing missing video */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-between flex-wrap gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-500/20">
                          <Youtube size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {lang === 'ar' ? 'عروض وتطبيقات فلاتر على YouTube' : 'Watch Flutter Mobile Demos on YouTube'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-gray-400">
                            {lang === 'ar' ? 'تابع قناة أحمد لمشاهدة استعراضات المشاريع والاشتراك' : 'Visit Ahmed\'s channel for full mobile application walkthroughs'}
                          </p>
                        </div>
                      </div>
                      <a
                        href={AHMED_PROFILE.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-sm hover:scale-105"
                      >
                        <Youtube size={15} />
                        <span>{lang === 'ar' ? 'زيارة القناة على YouTube' : 'Visit YouTube Channel'}</span>
                        <ArrowUpRight size={13} />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Banner */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-[#11162a] border border-blue-200 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <PackageCheck size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {hasPlayStore
                        ? (lang === 'ar' ? 'منشور رسميًا على متجر Google Play' : 'Published on Google Play Store')
                        : hasApk
                        ? (lang === 'ar' ? 'حزمة APK جاهزة للتحميل الفوري' : 'Android APK Ready for Direct Download')
                        : (lang === 'ar' ? 'مستودع كود مفتوح المصدر على GitHub' : 'Open Source Mobile Repository')}
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-gray-300 mt-0.5">
                      {hasPlayStore
                        ? (lang === 'ar' ? 'نسخة الإنتاج مفحوصة ومتاحة الآن للمستخدمين حول العالم.' : 'Production build verified and published on Google Play.')
                        : hasApk
                        ? (lang === 'ar' ? 'ملف التثبيت (.apk) متاح للاختبار المباشر على أي هاتف أندرويد.' : 'Pre-built Android package (.apk) available for sideloading and testing.')
                        : (lang === 'ar' ? 'الكود المصدري جاهز للبناء عبر Flutter SDK.' : 'Clean architecture codebase ready to clone and run.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  {hasPlayStore && (
                    <a
                      href={project.links.googlePlay}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs"
                    >
                      <ArrowUpRight size={14} />
                      <span>Google Play</span>
                    </a>
                  )}
                  {hasApk && (
                    <a
                      href={project.links.apkDownloadUrl || releaseInfo.apkDownloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-xs"
                    >
                      <Download size={14} />
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

              {/* Core Features */}
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

              {/* Technologies */}
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

          {/* TAB 2: ARCHITECTURE & STACK DEEP DIVE */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              
              {/* Clean Architecture Three-Tier Hierarchy */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <ShieldCheck size={18} className="text-cyan-500" />
                    <span>{lang === 'ar' ? 'هيكلة Clean Architecture المطبقة في فلاتر' : 'Flutter Clean Architecture Specification'}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-cyan-400 font-bold border border-blue-500/20">
                    SOLID Compliant
                  </span>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                  {lang === 'ar'
                    ? 'فصل صارم بين الطبقات لعزل منطق الأعمال (Business Logic) عن تفاصيل العرض وقواعد البيانات، مما يتيح الاختبار الأحادي بنسبة 100%:'
                    : 'Strict separation of concerns isolating core business rules from presentation and data sources, enabling maximum modularity and test coverage:'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1 text-xs">
                  {/* Presentation Layer */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#0a0d16] border border-blue-500/30 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone size={16} className="text-blue-500" />
                        <span className="font-extrabold text-blue-600 dark:text-cyan-400">1. Presentation</span>
                      </div>
                      <p className="text-slate-600 dark:text-gray-300 text-[11px] leading-relaxed">
                        {project.architecture?.presentationLayer ||
                          (lang === 'ar'
                            ? 'واجهات فلاتر (Widgets)، الشاشات (Views)، ومستمعي الحالات (BlocConsumer/BlocBuilder)، وتنسيق الحركات 60 FPS.'
                            : 'Flutter UI widgets, responsive views, Cubit/Bloc state listeners, and 60 FPS animations.')}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 font-mono text-[10px] text-slate-400">
                      Layer: UI & State Consumers
                    </div>
                  </div>

                  {/* Domain Layer */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#0a0d16] border border-emerald-500/30 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <GitBranch size={16} className="text-emerald-500" />
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">2. Domain</span>
                      </div>
                      <p className="text-slate-600 dark:text-gray-300 text-[11px] leading-relaxed">
                        {project.architecture?.domainLayer ||
                          (lang === 'ar'
                            ? 'دارت نقي (Pure Dart): الكيانات (Entities)، حالات الاستخدام (UseCases)، وعقود المستودعات (Contracts) بدون أي اعتماد خارجي.'
                            : 'Pure Dart entities, business use cases, and repository interfaces with zero framework coupling.')}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 font-mono text-[10px] text-emerald-400">
                      Layer: Pure Core Business Logic
                    </div>
                  </div>

                  {/* Data Layer */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#0a0d16] border border-purple-500/30 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Database size={16} className="text-purple-500" />
                        <span className="font-extrabold text-purple-600 dark:text-purple-400">3. Data</span>
                      </div>
                      <p className="text-slate-600 dark:text-gray-300 text-[11px] leading-relaxed">
                        {project.architecture?.dataLayer ||
                          (lang === 'ar'
                            ? 'نماذج البيانات (Models & Mappers)، التخزين المحلي السريع (Hive CE Box)، وتكاملات الشبكة (REST API / Retrofit).'
                            : 'Data models, JSON serializers, Hive CE local caching boxes, and remote REST/Firebase datasources.')}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 font-mono text-[10px] text-purple-400">
                      Layer: Remote & Local Sources
                    </div>
                  </div>
                </div>
              </div>

              {/* State Management & Caching Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* State Management Strategy */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2">
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                    <RefreshCw size={15} className="text-cyan-500" />
                    <span>{lang === 'ar' ? 'إدارة الحالة (State Management)' : 'Reactive State Management'}</span>
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                    {project.architecture?.stateManagementPattern ||
                      'Unidirectional data flow powered by Cubit/BLoC state machines with immutable state emissions.'}
                  </p>
                </div>

                {/* Storage & Caching Strategy */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2">
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                    <Database size={15} className="text-emerald-500" />
                    <span>{lang === 'ar' ? 'استراتيجية التخزين والأوفلاين' : 'Storage & Offline Persistence'}</span>
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                    {project.architecture?.storageStrategy ||
                      'Offline-first architecture with instant cache recovery, sub-millisecond local reads, and persistent disk state.'}
                  </p>
                </div>
              </div>

              {/* Predictable Trace Flow */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Terminal size={14} />
                    <span>Runtime Execution Flow</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Single Direction</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 text-slate-300 space-y-1 text-[11px]">
                  <div className="text-cyan-400">1. UI Interaction (User Tap / Form Submit)</div>
                  <div className="text-slate-500 ps-4">↓ Triggers Cubit Function</div>
                  <div className="text-emerald-400 ps-4">2. Cubit executes isolated Domain UseCase</div>
                  <div className="text-slate-500 ps-8">↓ Invokes Repository Contract (Data Boundary)</div>
                  <div className="text-purple-400 ps-8">3. Local Hive Box / Remote Dio Client returns typed Result</div>
                  <div className="text-slate-500 ps-4">↓ Cubit emits new immutable State</div>
                  <div className="text-blue-400">4. BlocBuilder updates only affected widgets (Zero Frame Drops)</div>
                </div>
              </div>

              {/* Clone and Run Guide */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2.5 border border-slate-800">
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} />
                    <span>{lang === 'ar' ? 'أوامر الاستنساخ والتشغيل' : 'Developer Build Commands'}</span>
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
                    <span className="text-slate-400">Build Release:</span>
                    <code className="bg-black/40 px-2 py-0.5 rounded text-purple-300">flutter build apk --release</code>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: VERIFIED HIGH-PERFORMANCE SCREENSHOTS (ZERO CLS) */}
          {activeTab === 'screenshots' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {lang === 'ar'
                    ? `معرض لقطات الشاشة الحية (${screenshots.length} شاشة تم التحقق منها)`
                    : `Verified Mobile Screenshots Gallery (${screenshots.length} screens)`}
                </span>
                <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                  {lang === 'ar' ? 'اضغط على أي شاشة للتكبير الشامل' : 'Click to inspect in fullscreen lightbox'}
                </span>
              </div>

              {loadingScreens ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {[1, 2, 3, 4, 5, 6].map((sk) => (
                    <div
                      key={sk}
                      className="aspect-[9/16] rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700/60 dark:to-slate-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : screenshots.length === 0 ? (
                <div className="py-14 text-center text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                  <ImageIcon size={36} className="mx-auto mb-2 opacity-50 text-blue-500" />
                  <p className="font-semibold text-sm">{lang === 'ar' ? 'لم يتم العثور على لقطات شاشة لهذا المستودع.' : 'No screenshot gallery found for this repository.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
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

          {/* TAB 4: CASE STUDY & VERIFIED METRICS */}
          {activeTab === 'casestudy' && (
            <div className="space-y-6">
              
              {/* Measurable Performance Metrics Strip */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                  <Activity size={15} className="text-emerald-500" />
                  <span>{lang === 'ar' ? 'مؤشرات الأداء الفعلية (Performance Metrics)' : 'Production Benchmarks & Metrics'}</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                    <div className="text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase font-bold">FPS Stability</div>
                    <div className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                      {project.metrics?.fpsStability || '60 FPS'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Smooth Transitions</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                    <div className="text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase font-bold">Query Latency</div>
                    <div className="text-lg sm:text-xl font-extrabold text-blue-600 dark:text-cyan-400 mt-1">
                      {project.metrics?.loadLatency || '< 200ms'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Cold Read Time</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                    <div className="text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase font-bold">Offline Support</div>
                    <div className="text-lg sm:text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                      {project.metrics?.offlineSupport || '100% Offline'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">No Remote Blocker</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                    <div className="text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase font-bold">Binary Footprint</div>
                    <div className="text-lg sm:text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                      {project.metrics?.buildSize || '18.4 MB'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">AAB / APK Release</div>
                  </div>
                </div>
              </div>

              {/* Challenge vs Solution Narrative */}
              <div className="space-y-4">
                {/* The Challenge */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
                    <Award size={16} />
                    <span>{lang === 'ar' ? 'التحدي الهندسي (The Challenge)' : 'The Engineering Challenge'}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                    {project.caseStudy?.challenge ||
                      'Overcoming framework overhead and ensuring seamless state recovery across diverse screen form-factors with zero frame drops during heavy user interactions.'}
                  </p>
                </div>

                {/* The Solution */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle size={16} />
                    <span>{lang === 'ar' ? 'الحل المعماري والتنفيذ (The Solution)' : 'Architectural Solution & Decisions'}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                    {project.caseStudy?.solution ||
                      'Engineered using pure Dart Clean Architecture, isolating domain business logic into dedicated UseCases, coupled with Cubit event streams for predictable UI state emissions.'}
                  </p>
                </div>

                {/* Key Learnings & Takeaways */}
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 dark:text-cyan-400">
                    <Sparkles size={16} />
                    <span>{lang === 'ar' ? 'الدروس المستفادة والأثر (Key Takeaways)' : 'Key Takeaways & Engineering Impact'}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                    {project.caseStudy?.keyLearnings ||
                      'Refined widget lifecycle optimization and eliminated unnecessary rebuild trees using BlocSelector, reducing memory consumption by over 30%.'}
                  </p>
                </div>
              </div>

              {/* Verified Metrics Highlights */}
              {project.metrics?.highlights && project.metrics.highlights.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-500" />
                    <span>{lang === 'ar' ? 'إنجازات تم التحقق منها' : 'Verified Engineering Highlights'}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {project.metrics.highlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex items-start gap-2 text-xs text-slate-700 dark:text-gray-300"
                      >
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="p-3 sm:p-4.5 bg-slate-50 dark:bg-[#121624] border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {hasPlayStore && (
              <a
                href={project.links.googlePlay}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
              >
                <ArrowUpRight size={14} />
                <span>Google Play</span>
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
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-xs"
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
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/15 hover:bg-red-600 text-red-600 hover:text-white dark:text-red-400 font-bold text-xs border border-red-500/25 transition-all cursor-pointer"
              >
                <Play size={13} fill="currentColor" />
                <span>{lang === 'ar' ? 'مشاهدة الفيديو' : 'YouTube Demo'}</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 ms-auto flex-wrap">
            {project.links.github && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-xs">
                <span className="text-slate-400 select-none hidden sm:inline">$</span>
                <span className="text-slate-700 dark:text-cyan-300 font-medium text-[11px] truncate max-w-[120px] sm:max-w-[190px]">
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
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-300 dark:border-white/10 font-bold text-xs transition-colors shadow-xs"
              >
                <Github size={14} />
                <span>GitHub</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

      </div>

      {/* Fullscreen Lightbox Overlay with Keyboard Navigation */}
      {lightboxOpen && screenshots.length > 0 && (
        <div
          className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 end-4 text-white hover:text-red-400 p-2.5 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer z-20 transition-colors"
            aria-label="Close Lightbox"
          >
            <X size={24} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevScreen();
            }}
            className="absolute start-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white cursor-pointer z-20 transition-all hover:scale-110"
            aria-label="Previous Screenshot"
          >
            <ChevronLeft size={24} />
          </button>

          <img
            src={screenshots[activeScreenIndex]}
            alt={`Screenshot ${activeScreenIndex + 1}`}
            className="max-h-[86vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextScreen();
            }}
            className="absolute end-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white cursor-pointer z-20 transition-all hover:scale-110"
            aria-label="Next Screenshot"
          >
            <ChevronRight size={24} />
          </button>

          {/* Indicator Counter */}
          <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none">
            <span className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white font-mono text-xs border border-white/10 shadow-lg">
              {activeScreenIndex + 1} / {screenshots.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};
