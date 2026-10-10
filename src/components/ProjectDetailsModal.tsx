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
  Palette
} from 'lucide-react';
import { Project } from '../data/portfolioData';
import { ProjectCardCover } from './ProjectCardCover';
import {
  fetchRepoScreenshots,
  checkRepoRelease,
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
  onWatchDemo?: (title: string, url?: string) => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project,
  onWatchDemo,
}) => {
  useScrollLock(isOpen);
  const { lang, dir } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'screenshots' | 'specs'>('overview');
  const [mediaView, setMediaView] = useState<'video' | 'cover'>('video');
  const [activeScreenIndex, setActiveScreenIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [loadingScreens, setLoadingScreens] = useState<boolean>(false);
  const [releaseInfo, setReleaseInfo] = useState<RepoReleaseInfo>({
    hasRelease: false
  });
  const [copiedClone, setCopiedClone] = useState<boolean>(false);

  const handleCopyClone = () => {
    if (!project?.links.github) return;
    const cloneUrl = `${project.links.github}.git`;
    navigator.clipboard.writeText(`git clone ${cloneUrl}`);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  // Extract YouTube ID safely
  const extractYouTubeVideoId = (url?: string): string | null => {
    if (!url) return null;
    try {
      if (url.includes('/shorts/')) return url.split('/shorts/')[1]?.split('?')[0]?.split('&')[0] || null;
      if (url.includes('v=')) return url.split('v=')[1]?.split('&')[0]?.split('?')[0] || null;
      if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0] || null;
    } catch {}
    return null;
  };

  useEffect(() => {
    if (isOpen && project) {
      setActiveTab('overview');
      setActiveScreenIndex(0);
      setLightboxOpen(false);

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

      // 2. Fetch dynamic contents from GitHub API in parallel
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

  const parsedVideoId = extractYouTubeVideoId(project.links.youtubeDemo);
  const youtubeIframeSrc = parsedVideoId ? `https://www.youtube-nocookie.com/embed/${parsedVideoId}?rel=0&modestbranding=1` : null;

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
  const hasPlayStore = Boolean(project.links.googlePlay);

  const modalNode = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto"
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
        <div className="flex items-center px-4 sm:px-6 pt-3 bg-slate-50/50 dark:bg-[#161826]/50 border-b border-slate-200 dark:border-white/10 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400 bg-white dark:bg-[#121420]'
                : 'border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'ar' ? 'نظرة عامة وعرض' : 'Overview & Demo'}
          </button>
          <button
            onClick={() => setActiveTab('screenshots')}
            className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
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
            className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
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
              {/* Media Preview (YouTube Video Embed or Cover Image Artwork) */}
              <div className="space-y-2">
                {youtubeIframeSrc && (
                  <div className="flex items-center justify-end gap-1.5 pb-1">
                    <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
                      <button
                        type="button"
                        onClick={() => setMediaView('video')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          mediaView === 'video'
                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                            : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Play size={12} />
                        <span>فيديو العرض (Video Demo)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaView('cover')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          mediaView === 'cover'
                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                            : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Palette size={12} />
                        <span>غلاف المشروع التفاعلي (Interactive Cover)</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-lg">
                  {youtubeIframeSrc && mediaView === 'video' ? (
                    <iframe
                      src={youtubeIframeSrc}
                      title={`${project.name} Demonstration`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <ProjectCardCover
                      repoName={project.repoName}
                      language={project.technologies[0] || 'Dart'}
                      coverUrl={project.image}
                      description={project.description}
                      topics={project.technologies}
                    />
                  )}
                </div>
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
                        ? 'Published on Google Play Store'
                        : hasApk
                        ? 'Android APK Package Ready for Direct Download'
                        : 'Open Source Mobile Repository'}
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-gray-300 mt-0.5">
                      {hasPlayStore
                        ? 'Live production build verified and available on Google Play.'
                        : hasApk
                        ? 'Pre-built Android package (.apk) available for immediate testing & sideloading.'
                        : 'Source codebase ready to build via Flutter SDK (`flutter build apk --release`).'}
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
                  <span>Project Overview & Engineering Purpose</span>
                </h4>
                <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-xs sm:text-sm">
                  {project.description}
                </p>
              </div>

              {/* Core Feature Highlights */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span>Core Implementation Features</span>
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
                  <span>Technologies & Libraries</span>
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

          {/* TAB 2: SCREENSHOTS */}
          {activeTab === 'screenshots' && (
            <div className="space-y-4">
              {loadingScreens ? (
                <div className="py-12 text-center text-slate-500 dark:text-gray-400 font-mono text-xs">
                  Loading application screens from repository...
                </div>
              ) : screenshots.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-gray-400">
                  <ImageIcon size={32} className="mx-auto mb-2 opacity-40 text-blue-500" />
                  <p>No screenshot gallery found for this repository.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {screenshots.map((url, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setActiveScreenIndex(i);
                        setLightboxOpen(true);
                      }}
                      className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 cursor-pointer shadow-md hover:border-blue-500 transition-all"
                    >
                      <img
                        src={url}
                        alt={`${project.name} screen ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <ZoomIn size={24} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ARCHITECTURE & SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <ShieldCheck size={16} className="text-cyan-500" />
                  <span>Architectural Standard (Clean Architecture)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                  Engineered following the 3-Layer Clean Architecture paradigm:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 shadow-xs">
                    <span className="font-bold text-blue-600 dark:text-cyan-400 block mb-1">1. Presentation Layer</span>
                    <span className="text-slate-600 dark:text-gray-400 text-[11px]">Widgets, UI Pages, BLoC/Cubit state listeners, and animations.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 shadow-xs">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">2. Domain Layer</span>
                    <span className="text-slate-600 dark:text-gray-400 text-[11px]">Pure Dart Entities, Use Cases, and repository contract interfaces.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 shadow-xs">
                    <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">3. Data Layer</span>
                    <span className="text-slate-600 dark:text-gray-400 text-[11px]">Models, JSON serialization, Hive CE local caching, and REST/Firebase datasources.</span>
                  </div>
                </div>
              </div>

              {/* Build and Execution Guide */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2.5 border border-slate-800">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Terminal size={14} />
                  <span>Repository Commands & Execution</span>
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

            {project.links.youtubeDemo && onWatchDemo && (
              <button
                onClick={() => onWatchDemo(project.name, project.links.youtubeDemo)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/15 hover:bg-red-600 text-red-600 hover:text-white dark:text-red-400 font-semibold text-xs border border-red-500/25 transition-all cursor-pointer"
              >
                <Play size={13} fill="currentColor" />
                <span>Watch Video</span>
              </button>
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
            className="absolute top-4 end-4 text-white hover:text-red-400 p-2 cursor-pointer"
          >
            <X size={28} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevScreen();
            }}
            className="absolute start-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
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
            className="absolute end-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};
