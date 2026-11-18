import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  X,
  Github,
  Play,
  ArrowUpRight,
  Smartphone,
  Layers,
  CheckCircle2,
  Image as ImageIcon,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Download,
  Terminal,
  ExternalLink,
  PackageCheck,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Database,
  GitBranch,
  Youtube,
  FileCode,
  Maximize2,
  Minimize2,
  Star,
  GitFork,
  Cpu,
  ListChecks,
  FolderTree,
  ChevronDown,
  Briefcase,
  BookOpen,
} from 'lucide-react';
import { Project, AHMED_PROFILE } from '../data/portfolioData';
import { resolveSmartProjectLinks } from '../utils/projectLinks';
import { SmartDemoButtons } from './SmartDemoButtons';
import { ProjectCardCover, synthesizeProjectBlueprint } from './ProjectCardCover';
import { ImageWithSkeleton, preloadImageUrls, resolveProxiedImageUrl } from './ImageWithSkeleton';
import { extractRepoTechTags } from '../utils/techTagExtractor';
import { TechIconBadge } from './TechLogos';
import { ReadmeDocumentView } from './ReadmeDocumentView';
import {
  extractStructuredReadmeTemplate,
  formatReadableScreenName,
  groupScreenshotsByCategory,
} from '../utils/readmeTemplateExtractor';
import {
  fetchRepoScreenshots,
  checkRepoRelease,
  fetchRepoLiveMetadata,
  fetchRepoCaseStudies,
  extractYouTubeVideoId,
  VERIFIED_REPO_SCREENSHOTS,
  RepoReleaseInfo,
  RepoLiveMetadata,
  RepoCaseStudyData,
  ConsolidatedGitHubPortfolio,
  formatFileSize,
} from '../services/githubService';
import { useScrollLock } from '../hooks/useScrollLock';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { usePlayStoreAppStats } from '../services/playStoreService';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

type WorkspaceSectionId = 'overview' | 'specs' | 'gallery' | 'architecture' | 'casestudy';

const GALLERY_PAGE_SIZE = 12;

const CopyChip: React.FC<{ value: string; label?: string }> = ({ value, label }) => {
  const [copied, setCopied] = useState(false);
  const { lang } = useLanguage();
  const { showToast } = useToast();
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        showToast({
          message: lang === 'ar' ? 'تم نسخ الأمر' : 'Command copied to clipboard',
          detail: value,
        });
        setTimeout(() => setCopied(false), 1800);
      }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer text-[11px] font-mono shrink-0"
      title={`Copy ${label || 'command'}`}
    >
      {copied ? (
        <>
          <Check size={12} className="text-emerald-400" />
          <span className="text-emerald-400">Copied</span>
        </>
      ) : (
        <>
          <Copy size={12} />
          <span>{label || 'Copy'}</span>
        </>
      )}
    </button>
  );
};

const GalleryCard: React.FC<{
  url: string;
  label: string;
  index: number;
  projectName: string;
  isActive: boolean;
  onSelect: () => void;
  onInspect: () => void;
}> = ({ url, label, index, projectName, isActive, onSelect, onInspect }) => {
  return (
    <div
      onClick={() => {
        onSelect();
        onInspect();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
          onInspect();
        }
      }}
      className={`group relative rounded-2xl overflow-hidden bg-[#161e31] border transition-all duration-300 cursor-pointer flex flex-col ${
        isActive
          ? 'border-[#027DFD] ring-2 ring-[#027DFD]/25 shadow-lg'
          : 'border-slate-200/80 dark:border-white/10 hover:border-[#027DFD]/60 shadow-sm hover:shadow-xl'
      }`}
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-[#161e31]">
        <ImageWithSkeleton
          src={url}
          alt={`${projectName} — ${label}`}
          loading="lazy"
          variant="phone"
          className="w-full h-full object-cover object-top group-hover:scale-[1.04] transition-transform duration-300 crisp-screenshot"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 pointer-events-none">
          <span className="text-[11px] font-mono font-bold text-white tabular-nums">
            #{index + 1}
          </span>
          <span className="p-1.5 rounded-lg bg-[#027DFD] text-white shadow-md">
            <ZoomIn size={14} />
          </span>
        </div>
      </div>

      <div className="px-3 py-2 bg-white dark:bg-[#111624] border-t border-slate-100 dark:border-white/8 flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-200 truncate capitalize">
          {label}
        </span>
        <span className="text-[10px] font-mono text-slate-400 shrink-0 tabular-nums">
          {index + 1}
        </span>
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
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [isFullPage, setIsFullPage] = useState(false);
  const [activeSection, setActiveSection] = useState<WorkspaceSectionId>('overview');
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [activeScreenIndex, setActiveScreenIndex] = useState<number>(0);
  const [galleryCategory, setGalleryCategory] = useState<string>('all');
  const [visibleGalleryCount, setVisibleGalleryCount] = useState<number>(GALLERY_PAGE_SIZE);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [loadingScreens, setLoadingScreens] = useState<boolean>(false);
  const [liveMeta, setLiveMeta] = useState<RepoLiveMetadata | null>(null);
  const [isSyncingLive, setIsSyncingLive] = useState<boolean>(false);
  const [releaseInfo, setReleaseInfo] = useState<RepoReleaseInfo>({ hasRelease: false });
  const [copiedClone, setCopiedClone] = useState<boolean>(false);

  const [caseStudyData, setCaseStudyData] = useState<RepoCaseStudyData>({ en: null, ar: null });
  const [studyCaseLoading, setStudyCaseLoading] = useState<boolean>(false);
  const [studyCaseLang, setStudyCaseLang] = useState<'en' | 'ar'>('en');

  const scrollRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLElement>(null);
  const specsRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const architectureRef = useRef<HTMLElement>(null);
  const casestudyRef = useRef<HTMLElement>(null);

  const isRevio = project?.repoName.toLowerCase() === 'revio';
  const { data: playStats } = usePlayStoreAppStats(isRevio ? 'com.ahmed.revio' : '');

  const cachedConsolidated = queryClient.getQueryData<ConsolidatedGitHubPortfolio>([
    'github-consolidated',
    'ahmed-el-bialy',
  ]);

  const matchedCachedRepo = useMemo(() => {
    if (!project || !cachedConsolidated?.repos) return undefined;
    return cachedConsolidated.repos.find(
      (r) =>
        r.name.toLowerCase() === project.repoName.toLowerCase() ||
        r.name.toLowerCase() === project.name.toLowerCase()
    );
  }, [project, cachedConsolidated]);

  const cachedLiveMedia = useMemo(() => {
    if (!project || !cachedConsolidated?.liveMediaMap) return undefined;
    return (
      cachedConsolidated.liveMediaMap[project.repoName] ||
      cachedConsolidated.liveMediaMap[project.repoName.toLowerCase()]
    );
  }, [project, cachedConsolidated]);

  const syncLiveProjectData = useCallback(
    async (targetProject: Project, forceRefresh: boolean, preferredBranch?: string) => {
      if (forceRefresh) setIsSyncingLive(true);
      setStudyCaseLoading(true);

      try {
        const [meta, folderUrls, rel, csData] = await Promise.all([
          fetchRepoLiveMetadata(targetProject.repoName, 'ahmed-el-bialy', forceRefresh).catch(
            () => null
          ),
          fetchRepoScreenshots(targetProject.repoName, 'ahmed-el-bialy').catch((): string[] => []),
          checkRepoRelease(targetProject.repoName, 'ahmed-el-bialy').catch(
            (): RepoReleaseInfo => ({ hasRelease: false })
          ),
          fetchRepoCaseStudies(
            targetProject.repoName,
            preferredBranch || 'main',
            'ahmed-el-bialy',
            forceRefresh
          ).catch((): RepoCaseStudyData => ({ en: null, ar: null })),
        ]);

        if (meta) {
          setLiveMeta(meta);
        }

        setCaseStudyData(csData);

        if (rel.hasRelease || meta?.hasRelease || meta?.apkDownloadUrl) {
          setReleaseInfo({
            ...rel,
            hasRelease: Boolean(rel.hasRelease || meta?.hasRelease),
            apkDownloadUrl: rel.apkDownloadUrl || meta?.apkDownloadUrl,
            releaseUrl: rel.releaseUrl || meta?.releaseUrl,
          });
        } else {
          setReleaseInfo({ hasRelease: false });
        }

        const verified =
          VERIFIED_REPO_SCREENSHOTS[targetProject.repoName] ||
          VERIFIED_REPO_SCREENSHOTS[targetProject.name] ||
          VERIFIED_REPO_SCREENSHOTS[targetProject.repoName.toLowerCase()] ||
          [];

        const mergedScreens = Array.from(
          new Set([
            ...folderUrls,
            ...(meta?.discoveredScreenshots || []),
            ...(folderUrls.length === 0 ? verified : []),
          ])
        ).filter(Boolean);

        if (mergedScreens.length > 0) {
          setScreenshots(mergedScreens);
        } else if (targetProject.image) {
          setScreenshots([targetProject.image]);
        }
      } finally {
        setLoadingScreens(false);
        setStudyCaseLoading(false);
        setIsSyncingLive(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isOpen && project) {
      setIsFullPage(false);
      setActiveSection('overview');
      setIsPlayingVideo(false);
      setActiveScreenIndex(0);
      setGalleryCategory('all');
      setVisibleGalleryCount(GALLERY_PAGE_SIZE);
      setLightboxOpen(false);
      setCaseStudyData({ en: null, ar: null });
      setStudyCaseLang(lang === 'ar' ? 'ar' : 'en');
      setLiveMeta(cachedLiveMedia || null);
      setReleaseInfo({ hasRelease: false });

      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }

      const verified =
        VERIFIED_REPO_SCREENSHOTS[project.repoName] ||
        VERIFIED_REPO_SCREENSHOTS[project.name] ||
        VERIFIED_REPO_SCREENSHOTS[project.repoName.toLowerCase()] ||
        [];

      const initialScreens = Array.from(
        new Set([
          ...(matchedCachedRepo?.discoveredScreenshots || []),
          ...(cachedLiveMedia?.discoveredScreenshots || []),
          ...verified,
        ])
      ).filter(Boolean);

      if (initialScreens.length > 0) {
        setScreenshots(initialScreens);
        preloadImageUrls(initialScreens.slice(0, 6));
        setLoadingScreens(false);
      } else {
        setScreenshots([]);
        setLoadingScreens(true);
      }

      const branchHint =
        cachedLiveMedia?.defaultBranch || matchedCachedRepo?.default_branch || 'main';
      syncLiveProjectData(project, false, branchHint);
    }
  }, [isOpen, project]);

  // Keep preferred Case Study language aligned with available files
  useEffect(() => {
    if (lang === 'ar' && caseStudyData.ar) {
      setStudyCaseLang('ar');
    } else if (caseStudyData.en) {
      setStudyCaseLang('en');
    } else if (caseStudyData.ar) {
      setStudyCaseLang('ar');
    }
  }, [lang, caseStudyData.en, caseStudyData.ar]);

  const scrollToSection = useCallback((sectionId: WorkspaceSectionId) => {
    setActiveSection(sectionId);
    const refMap: Record<WorkspaceSectionId, React.RefObject<HTMLElement | null>> = {
      overview: overviewRef,
      specs: specsRef,
      gallery: galleryRef,
      architecture: architectureRef,
      casestudy: casestudyRef,
    };
    const target = refMap[sectionId]?.current;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleWorkspaceScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const containerRect = container.getBoundingClientRect();

    // Snap immediately to overview near top
    if (scrollTop < 40) {
      setActiveSection('overview');
      return;
    }

    // If scrolled nearly to bottom, activate final section
    if (scrollTop + container.clientHeight >= container.scrollHeight - 28) {
      setActiveSection('casestudy');
      return;
    }

    const candidates: Array<{ id: WorkspaceSectionId; el: HTMLElement | null }> = [
      { id: 'overview', el: overviewRef.current },
      { id: 'specs', el: specsRef.current },
      { id: 'gallery', el: galleryRef.current },
      { id: 'architecture', el: architectureRef.current },
      { id: 'casestudy', el: casestudyRef.current },
    ];

    let current: WorkspaceSectionId = 'overview';
    const activationLine = containerRect.top + 110;
    for (const item of candidates) {
      if (!item.el) continue;
      const top = item.el.getBoundingClientRect().top;
      if (top <= activationLine) {
        current = item.id;
      }
    }
    setActiveSection(current);
  }, []);

  const nextScreen = useCallback(() => {
    if (screenshots.length === 0) return;
    setActiveScreenIndex((prev) => (prev + 1) % screenshots.length);
  }, [screenshots.length]);

  const prevScreen = useCallback(() => {
    if (screenshots.length === 0) return;
    setActiveScreenIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  }, [screenshots.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (lightboxOpen) {
          setLightboxOpen(false);
        } else if (isFullPage) {
          setIsFullPage(false);
        } else {
          onClose();
        }
      } else if (lightboxOpen) {
        if (e.key === 'ArrowRight') nextScreen();
        if (e.key === 'ArrowLeft') prevScreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, lightboxOpen, isFullPage, nextScreen, prevScreen, onClose]);

  const rawReadme = liveMeta?.rawReadmeText || cachedLiveMedia?.rawReadmeText || '';
  const defaultBranch =
    liveMeta?.defaultBranch || matchedCachedRepo?.default_branch || 'main';

  const parsedReadmeData = useMemo(
    () =>
      extractStructuredReadmeTemplate(
        rawReadme,
        project?.repoName || '',
        defaultBranch,
        'ahmed-el-bialy'
      ),
    [rawReadme, project?.repoName, defaultBranch]
  );

  const galleryGroups = useMemo(
    () => groupScreenshotsByCategory(screenshots, lang),
    [screenshots, lang]
  );

  const activeGalleryGroup = useMemo(
    () => galleryGroups.find((g) => g.id === galleryCategory) || galleryGroups[0],
    [galleryGroups, galleryCategory]
  );

  if (!isOpen || !project) return null;

  const currentLiveDemoUrl = liveMeta?.liveDemoUrl || project.links.liveDemoUrl;
  const currentPlaylistUrl = liveMeta?.playlistUrl || project.links.playlistUrl;
  const currentPlayUrl = liveMeta?.googlePlayUrl || project.links.googlePlay;
  const resolvedModalLinks = resolveSmartProjectLinks(
    {
      ...project.links,
      liveDemoUrl: currentLiveDemoUrl,
      playlistUrl: currentPlaylistUrl,
      googlePlay: currentPlayUrl,
    },
    null
  );

  const playerCandidateUrl =
    resolvedModalLinks.demoVideoUrl || resolvedModalLinks.playlistUrl || currentLiveDemoUrl;
  const parsedVideoId = extractYouTubeVideoId(playerCandidateUrl);
  const youtubeIframeSrc = parsedVideoId
    ? `https://www.youtube-nocookie.com/embed/${parsedVideoId}?autoplay=1&rel=0&modestbranding=1`
    : null;
  const youtubePosterUrl = parsedVideoId
    ? `https://i.ytimg.com/vi/${parsedVideoId}/hqdefault.jpg`
    : null;

  const hasPlayStore = Boolean(currentPlayUrl);
  const hasApk = Boolean(
    project.hasApk ||
      project.links.apkDownloadUrl ||
      releaseInfo.apkDownloadUrl ||
      liveMeta?.apkDownloadUrl ||
      (releaseInfo.hasRelease && releaseInfo.releaseUrl)
  );
  const realApkSizeLabel = formatFileSize(releaseInfo.apkSize);

  // Strictly real GitHub telemetry only (zero fallback guesses)
  const realStarsCount =
    typeof matchedCachedRepo?.stargazers_count === 'number'
      ? matchedCachedRepo.stargazers_count
      : typeof liveMeta?.starsCount === 'number'
      ? liveMeta.starsCount
      : null;
  const realForksCount =
    typeof matchedCachedRepo?.forks_count === 'number'
      ? matchedCachedRepo.forks_count
      : typeof liveMeta?.forksCount === 'number'
      ? liveMeta.forksCount
      : null;
  const realLanguage = matchedCachedRepo?.language || liveMeta?.language || null;
  const realPushedAt = matchedCachedRepo?.pushed_at || liveMeta?.pushedAt;
  const realPushedLabel = realPushedAt
    ? new Date(realPushedAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  // Cohesive domain category & architecture parity with external project cards
  const appBlueprint = synthesizeProjectBlueprint(
    project.repoName,
    realLanguage || 'Dart',
    project.description,
    project.technologies
  );
  const BlueprintIcon = appBlueprint.badgeIcon;

  const techTagObjects = extractRepoTechTags({
    repoName: project.repoName,
    language: realLanguage || 'Dart',
    topics: matchedCachedRepo?.topics || liveMeta?.topics,
    description: project.description || liveMeta?.description,
    technologies: project.technologies,
  });

  // Smart structured merging of curated data + live README template extraction
  const isGenericDescription =
    !project.description ||
    project.description.startsWith('Production-ready codebase implementing');
  const displayDescription =
    (isGenericDescription && (liveMeta?.description || parsedReadmeData.overviewText)) ||
    project.description ||
    liveMeta?.description ||
    parsedReadmeData.overviewText ||
    '';

  const isGenericFeatures =
    project.features.length > 0 &&
    project.features[0]?.startsWith('Clean architectural separation');
  const displayFeatures =
    parsedReadmeData.features.length > 0 && isGenericFeatures
      ? parsedReadmeData.features
      : Array.from(
          new Set([
            ...project.features,
            ...(parsedReadmeData.features.length > 0 ? parsedReadmeData.features : []),
          ])
        ).slice(0, 10);

  const displayTechStack = Array.from(
    new Set([
      ...project.technologies,
      ...(matchedCachedRepo?.topics || liveMeta?.topics || []),
      ...parsedReadmeData.techPackages,
    ])
  ).slice(0, 16);

  const apkHref =
    project.links.apkDownloadUrl ||
    releaseInfo.apkDownloadUrl ||
    liveMeta?.apkDownloadUrl ||
    releaseInfo.releaseUrl ||
    `https://github.com/ahmed-el-bialy/${project.repoName}/releases`;

  const githubRepoUrl =
    project.links.github || `https://github.com/ahmed-el-bialy/${project.repoName}`;

  const handleCopyClone = () => {
    const cmd = `git clone ${githubRepoUrl}.git`;
    navigator.clipboard.writeText(cmd);
    setCopiedClone(true);
    showToast({
      message: lang === 'ar' ? 'تم نسخ أمر الاستنساخ' : 'Git clone command copied',
      detail: cmd,
    });
    setTimeout(() => setCopiedClone(false), 1800);
  };

  const hasEnglishStudyCase = Boolean(caseStudyData.en);
  const hasArabicStudyCase = Boolean(caseStudyData.ar);
  const hasAnyStudyCase = hasEnglishStudyCase || hasArabicStudyCase;
  const activeStudyCaseMarkdown =
    studyCaseLang === 'ar'
      ? caseStudyData.ar || caseStudyData.en || ''
      : caseStudyData.en || caseStudyData.ar || '';

  const distributionLabel = hasPlayStore
    ? lang === 'ar'
      ? 'منشور على Google Play'
      : 'Google Play Production'
    : hasApk
    ? lang === 'ar'
      ? 'إصدار APK موثق'
      : 'Signed APK Release'
    : lang === 'ar'
    ? 'مستودع مفتوح المصدر'
    : 'Open-Source Codebase';

  const navSections: Array<{ id: WorkspaceSectionId; label: string; count?: number }> = [
    { id: 'overview', label: lang === 'ar' ? 'نظرة عامة والوسائط' : 'Overview & Media' },
    {
      id: 'specs',
      label: lang === 'ar' ? 'المميزات والتقنيات' : 'Features & Stack',
      count: displayFeatures.length,
    },
    {
      id: 'gallery',
      label: lang === 'ar' ? 'معرض الشاشات' : 'Gallery',
      count: screenshots.length,
    },
    { id: 'architecture', label: lang === 'ar' ? 'المعمارية والأوامر' : 'Architecture & CLI' },
    { id: 'casestudy', label: lang === 'ar' ? 'دراسة الحالة' : 'Study Case' },
  ];

  const workspaceNode = (
    <div
      dir={dir}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/78 backdrop-blur-md transition-opacity duration-200 ${
        isFullPage ? 'p-0' : 'p-2 sm:p-5'
      }`}
      onClick={() => {
        if (!isFullPage) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={project.name}
        className={`relative flex flex-col overflow-hidden bg-white dark:bg-[#0b0e16] border-slate-200/90 dark:border-white/10 shadow-2xl transition-all duration-200 ${
          isFullPage
            ? 'w-screen h-screen max-w-none max-h-none rounded-none border-0'
            : 'w-full max-w-5xl h-[94dvh] sm:h-[90vh] rounded-2xl sm:rounded-3xl border'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Slim Editorial Top Workspace Bar */}
        <div className="px-4 sm:px-7 py-2.5 sm:py-3 bg-white dark:bg-[#0d111c] border-b border-slate-200/75 dark:border-white/8 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{
                background: `linear-gradient(135deg, ${appBlueprint.accentColor}, ${appBlueprint.secondaryAccent})`,
              }}
            >
              <BlueprintIcon size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-lg font-extrabold text-slate-950 dark:text-white truncate tracking-tight">
                {project.name}
              </h2>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                ahmed-el-bialy/{project.repoName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => syncLiveProjectData(project, true, defaultBranch)}
              disabled={isSyncingLive}
              className="btn-kinetic inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
              title={lang === 'ar' ? 'تحديث البيانات من GitHub' : 'Sync latest from GitHub'}
            >
              <RefreshCw size={12.5} className={isSyncingLive ? 'animate-spin text-[#027DFD]' : ''} />
              <span className="hidden sm:inline">
                {isSyncingLive
                  ? lang === 'ar'
                    ? 'جارٍ المزامنة...'
                    : 'Syncing...'
                  : lang === 'ar'
                  ? 'مزامنة'
                  : 'Sync'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullPage((prev) => !prev)}
              className={`btn-kinetic inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isFullPage
                  ? 'bg-[#027DFD] text-white border-[#027DFD]'
                  : 'bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-white/10'
              }`}
              aria-label={isFullPage ? 'Restore modal window' : 'Expand to full page'}
            >
              {isFullPage ? <Minimize2 size={12.5} /> : <Maximize2 size={12.5} />}
              <span className="hidden sm:inline">
                {isFullPage
                  ? lang === 'ar'
                    ? 'تصغير'
                    : 'Modal'
                  : lang === 'ar'
                  ? 'ملء الشاشة'
                  : 'Full Page'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100/80 dark:bg-white/[0.04] hover:bg-rose-500/12 text-slate-500 hover:text-rose-500 border border-slate-200/80 dark:border-white/10 transition-colors cursor-pointer"
              aria-label="Close workspace"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Compact Underline Section Jump Bar (Zero Pills) */}
        <div className="px-4 sm:px-7 bg-slate-50/60 dark:bg-[#0b0e16] border-b border-slate-200/75 dark:border-white/8 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar shrink-0">
          <nav aria-label="Project sections" className="flex items-center gap-5 sm:gap-7">
            {navSections.map((section) => {
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  aria-current={active ? 'location' : undefined}
                  className={`relative py-2.5 text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    active
                      ? 'text-slate-950 dark:text-white font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                  }`}
                >
                  <span>{section.label}</span>
                  {typeof section.count === 'number' && section.count > 0 && (
                    <span
                      className={`font-mono text-[11px] tabular-nums transition-colors ${
                        active
                          ? 'text-[#027DFD] dark:text-[#00C7FF]'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {section.count}
                    </span>
                  )}
                  {active && (
                    <motion.span
                      layoutId="modalSectionUnderline"
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute bottom-0 inset-x-0 h-[2px] rounded-full bg-gradient-to-r from-[#027DFD] to-[#00C7FF]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {releaseInfo.tagName && (
            <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">
              <PackageCheck size={12} className="text-[#027DFD] dark:text-[#00C7FF]" />
              <span>{releaseInfo.tagName}</span>
              {realApkSizeLabel ? <span>· {realApkSizeLabel}</span> : null}
            </span>
          )}
        </div>

        {/* Unified Continuous Scrollable Body */}
        <div
          ref={scrollRef}
          onScroll={handleWorkspaceScroll}
          className="flex-1 overflow-y-auto scroll-smooth"
        >
          <div
            className={`mx-auto px-4 sm:px-7 py-5 sm:py-8 space-y-8 sm:space-y-10 ${
              isFullPage ? 'max-w-6xl' : 'max-w-5xl'
            }`}
          >
            {/* SECTION 1: AIRY MINIMALIST EXECUTIVE BRIEF & MEDIA STAGE */}
            <section ref={overviewRef} id="workspace-overview" className="scroll-mt-4 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono">
                      <span
                        className="inline-flex items-center gap-1.5 font-semibold"
                        style={{ color: appBlueprint.accentColor }}
                      >
                        <Briefcase size={13} />
                        <span>{appBlueprint.genre}</span>
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                        ·
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {distributionLabel}
                      </span>
                      {realPushedLabel && (
                        <>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700 hidden sm:inline">
                            ·
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
                            {realPushedLabel}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="font-display text-2xl sm:text-[32px] font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
                      {project.name}
                    </h3>
                    <p className="font-display text-sm sm:text-[15px] font-semibold text-[#027DFD] dark:text-[#7DD3FC]">
                      {project.subtitle}
                    </p>
                  </div>

                  {/* Verified Metrics Summary */}
                  <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 font-display text-sm sm:text-[15px] text-slate-600 dark:text-slate-300">
                    {isRevio && playStats?.downloads && (
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {playStats.downloads} {lang === 'ar' ? 'تحميل' : 'Downloads'}
                      </span>
                    )}
                    {isRevio && playStats?.rating && (
                      <span className="font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                        ★ {playStats.rating}
                      </span>
                    )}
                    {realStarsCount !== null && realStarsCount > 0 && (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                        <Star size={14} fill="currentColor" />
                        {realStarsCount}
                      </span>
                    )}
                    {realForksCount !== null && realForksCount > 0 && (
                      <span className="inline-flex items-center gap-1 font-semibold tabular-nums">
                        <GitFork size={14} />
                        {realForksCount}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                  {displayDescription}
                </p>

                {/* Complete Project Stack Badges */}
                {techTagObjects.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {techTagObjects.map((tag, idx) => (
                      <TechIconBadge
                        key={`${project.id}-modal-tag-${tag.id}-${idx}`}
                        label={tag.label}
                        id={tag.id}
                        category={tag.category}
                      />
                    ))}
                  </div>
                )}

                {/* 3-Column Overview Highlight Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10">
                    <div className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400">
                      {lang === 'ar' ? 'تصنيف التطبيق' : 'App Category'}
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                      {appBlueprint.genre}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10">
                    <div className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400">
                      {lang === 'ar' ? 'النمط الهندسي' : 'Engineering Pattern'}
                    </div>
                    <div className="text-xs font-bold text-[#027DFD] dark:text-[#00C7FF] mt-0.5 truncate">
                      Clean Arch · BLoC / Cubit
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10">
                    <div className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400">
                      {lang === 'ar' ? 'حالة النشر' : 'Distribution'}
                    </div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                      {distributionLabel}
                    </div>
                  </div>
                </div>

                {/* Action Buttons Cluster */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {hasPlayStore && (
                    <a
                      href={currentPlayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-kinetic inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                    >
                      <PackageCheck size={14} />
                      <span>Google Play</span>
                      <ArrowUpRight size={13} />
                    </a>
                  )}

                  <SmartDemoButtons resolved={resolvedModalLinks} stopPropagation={false} />

                  {hasApk && (
                    <a
                      href={apkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-kinetic inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs"
                    >
                      <Download size={14} />
                      <span>
                        {project.links.apkDownloadUrl || releaseInfo.apkDownloadUrl || liveMeta?.apkDownloadUrl
                          ? lang === 'ar'
                            ? 'تحميل APK'
                            : 'Download APK'
                          : lang === 'ar'
                          ? 'عرض الإصدار'
                          : 'View Release'}
                      </span>
                      {realApkSizeLabel ? (
                        <span className="px-1.5 py-0.5 rounded bg-black/25 text-[10px] font-mono tabular-nums">
                          {realApkSizeLabel}
                        </span>
                      ) : null}
                    </a>
                  )}

                  <a
                    href={githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-kinetic inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.06] hover:bg-slate-200/80 dark:hover:bg-white/[0.12] text-slate-800 dark:text-white border border-slate-200/80 dark:border-white/10 font-semibold text-xs"
                  >
                    <Github size={14} />
                    <span>GitHub</span>
                    <ExternalLink size={12} />
                  </a>

                  <button
                    type="button"
                    onClick={() => scrollToSection('gallery')}
                    className="btn-kinetic inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#027DFD]/10 hover:bg-[#027DFD] text-[#027DFD] dark:text-[#00C7FF] hover:text-white border border-[#027DFD]/20 font-bold text-xs transition-colors cursor-pointer ms-auto"
                  >
                    <ImageIcon size={14} />
                    <span>
                      {lang === 'ar'
                        ? `معرض الشاشات (${screenshots.length})`
                        : `Jump to Gallery (${screenshots.length})`}
                    </span>
                  </button>
                </div>
              </div>

              {/* Side-by-Side Dual Media Stage: Single-Elevation Studio Framing */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Start Panel: Live Video Demo Showcase */}
                <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-slate-50/75 dark:bg-white/[0.025] border border-slate-200/75 dark:border-white/8 flex flex-col justify-between gap-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-100">
                      <Youtube size={16} className="text-red-500 shrink-0" />
                      <span>
                        {youtubeIframeSrc
                          ? lang === 'ar'
                            ? 'فيديو استعراض التطبيق'
                            : 'App Video Walkthrough'
                          : lang === 'ar'
                          ? 'الهوية المرئية للتطبيق'
                          : 'Application Visual Card'}
                      </span>
                    </div>
                    {currentPlaylistUrl && (
                      <a
                        href={currentPlaylistUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono font-bold text-[#027DFD] dark:text-[#00C7FF] hover:underline inline-flex items-center gap-1"
                      >
                        <span>{lang === 'ar' ? 'قائمة الشرح الكامل' : 'Full Playlist'}</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>

                  {youtubeIframeSrc ? (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-white/10 shadow-md flex-1">
                      {isPlayingVideo ? (
                        <iframe
                          src={youtubeIframeSrc}
                          title={`${project.name} Live Video Demo`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsPlayingVideo(true)}
                          className="group relative w-full h-full flex flex-col items-center justify-center overflow-hidden cursor-pointer bg-slate-950"
                        >
                          {youtubePosterUrl && (
                            <img
                              src={youtubePosterUrl}
                              alt={`${project.name} demo poster`}
                              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-85 transition-all duration-300"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                          <span className="relative z-10 w-14 h-14 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <Play size={22} fill="currentColor" className="ms-0.5" />
                          </span>
                          <span className="relative z-10 mt-2.5 text-xs font-bold text-white drop-shadow">
                            {lang === 'ar' ? 'تشغيل العرض المباشر هنا' : 'Play Video Demo Inline'}
                          </span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-between gap-3">
                      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
                        <ProjectCardCover
                          repoName={project.repoName}
                          language={realLanguage || 'Dart'}
                          coverUrl={project.image}
                          discoveredScreenshots={screenshots}
                          isHighlight={project.highlight}
                          description={displayDescription}
                          topics={project.technologies}
                        />
                      </div>
                      <a
                        href={AHMED_PROFILE.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-red-500/8 hover:bg-red-500/15 border border-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors"
                      >
                        <span>
                          {lang === 'ar'
                            ? 'استعراض شروحات القناة على YouTube'
                            : 'Browse App Demos on YouTube Channel'}
                        </span>
                        <ArrowUpRight size={14} />
                      </a>
                    </div>
                  )}

                  {/* Quick Clone Bar */}
                  <div
                    dir="ltr"
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#0a0d16] text-slate-200 border border-slate-800 font-mono text-[11px]"
                  >
                    <span className="truncate text-cyan-300">
                      <span className="text-slate-500 select-none me-1.5">$</span>
                      git clone {githubRepoUrl}.git
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyClone}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                    >
                      {copiedClone ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedClone ? 'Copied' : 'Clone'}</span>
                    </button>
                  </div>
                </div>

                {/* End Panel: Interactive Live Screens Preview Side-by-Side */}
                <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-slate-50/75 dark:bg-white/[0.025] border border-slate-200/75 dark:border-white/8 flex flex-col justify-between gap-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 truncate">
                      <Smartphone size={15} className="text-[#027DFD] dark:text-[#00C7FF] shrink-0" />
                      <span className="truncate capitalize">
                        {screenshots.length > 0
                          ? formatReadableScreenName(
                              screenshots[activeScreenIndex % screenshots.length],
                              activeScreenIndex
                            )
                          : lang === 'ar'
                          ? 'معاينة الشاشات'
                          : 'App Screens'}
                      </span>
                    </span>
                    {screenshots.length > 0 && (
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                        {(activeScreenIndex % screenshots.length) + 1} / {screenshots.length}
                      </span>
                    )}
                  </div>

                  {loadingScreens && screenshots.length === 0 ? (
                    <div className="flex-1 min-h-[260px] rounded-2xl bg-[#161e31] skeleton-shimmer flex items-center justify-center">
                      <Loader2 size={22} className="animate-spin text-[#00C7FF]" />
                    </div>
                  ) : screenshots.length > 0 ? (
                    <>
                      <div className="relative flex justify-center items-center py-1 flex-1">
                        <div className="relative w-[180px] sm:w-[195px] aspect-[9/17.8] rounded-[26px] p-1.5 bg-[#0f1628] border-2 border-slate-300/90 dark:border-white/25 shadow-2xl overflow-hidden group">
                          <button
                            type="button"
                            onClick={() => setLightboxOpen(true)}
                            className="w-full h-full rounded-[20px] overflow-hidden bg-[#161e31] block cursor-pointer"
                            aria-label="Open screen in fullscreen lightbox"
                          >
                            <ImageWithSkeleton
                              key={screenshots[activeScreenIndex % screenshots.length]}
                              src={screenshots[activeScreenIndex % screenshots.length]}
                              alt={`${project.name} preview`}
                              loading="eager"
                              variant="phone"
                              className="w-full h-full object-cover object-top crisp-screenshot group-hover:scale-[1.02] transition-transform duration-300"
                            />
                          </button>

                          {screenshots.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  prevScreen();
                                }}
                                className="absolute start-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white opacity-85 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                aria-label="Previous screen"
                              >
                                <ChevronLeft size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  nextScreen();
                                }}
                                className="absolute end-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white opacity-85 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                aria-label="Next screen"
                              >
                                <ChevronRight size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Thumbnail Filmstrip + Smooth Scroll Jump to Gallery */}
                      <div className="pt-2 border-t border-slate-200/80 dark:border-white/8 flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {screenshots.slice(0, 5).map((thumb, idx) => {
                          const active = activeScreenIndex % screenshots.length === idx;
                          return (
                            <button
                              key={`${thumb}-${idx}`}
                              type="button"
                              onClick={() => setActiveScreenIndex(idx)}
                              className={`w-11 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-[#161e31] ${
                                active
                                  ? 'border-[#027DFD] scale-[1.03]'
                                  : 'border-slate-200 dark:border-white/15 opacity-85 hover:opacity-100'
                              }`}
                              aria-label={`Select screen ${idx + 1}`}
                            >
                              <ImageWithSkeleton
                                src={thumb}
                                alt={`Thumb ${idx + 1}`}
                                loading="eager"
                                variant="phone"
                                className="w-full h-full object-cover object-top crisp-screenshot"
                              />
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => scrollToSection('gallery')}
                          className="h-16 px-3 rounded-lg border border-dashed border-slate-300 dark:border-white/20 hover:border-[#027DFD] bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 hover:text-[#027DFD] dark:hover:text-[#00C7FF] text-[11px] font-mono font-bold shrink-0 flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ms-auto"
                        >
                          <ImageIcon size={13} />
                          <span>
                            {lang === 'ar'
                              ? `الكل (${screenshots.length})`
                              : `All (${screenshots.length})`}
                          </span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-center text-slate-400">
                      <ImageIcon size={28} className="mb-2 opacity-50" />
                      <span className="text-xs">
                        {lang === 'ar' ? 'لا توجد شاشات مرفوعة بعد' : 'No screenshots uploaded yet'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 2: FEATURES & VERIFIED STACK */}
            <section
              ref={specsRef}
              id="workspace-specs"
              className="scroll-mt-4 pt-8 border-t border-slate-200 dark:border-white/10 space-y-6"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ListChecks size={18} className="text-emerald-500" />
                  <span>
                    {lang === 'ar'
                      ? 'المميزات المنفذة والتقنيات المستخدمة'
                      : 'Implemented Features & Verified Stack'}
                  </span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {displayFeatures.length} items
                </span>
              </div>

              {parsedReadmeData.badges.length > 0 && (
                <div className="flex flex-wrap items-center gap-2" dir="ltr">
                  {parsedReadmeData.badges.map((badge, bi) =>
                    badge.href ? (
                      <a
                        key={bi}
                        href={badge.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-semibold text-slate-700 dark:text-[#7DD3FC] hover:border-[#027DFD]/50 transition-colors"
                      >
                        {badge.label}
                      </a>
                    ) : (
                      <span
                        key={bi}
                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-600 dark:text-slate-300"
                      >
                        {badge.label}
                      </span>
                    )
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-7 gap-y-0.5">
                {displayFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="py-2.5 border-b border-slate-100 dark:border-white/6 flex items-start gap-2.5"
                  >
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <h5 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu size={16} className="text-[#027DFD] dark:text-[#00C7FF]" />
                  <span>
                    {lang === 'ar'
                      ? 'المكتبات والحزم والواجهات البرمجية'
                      : 'Packages, Architecture & APIs'}
                  </span>
                </h5>

                <div className="flex flex-wrap gap-2">
                  {displayTechStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/8 text-xs font-mono font-medium text-slate-700 dark:text-[#7DD3FC]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 3: SCALABLE 40+ SCREEN GALLERY */}
            <section
              ref={galleryRef}
              id="workspace-gallery"
              className="scroll-mt-4 pt-8 border-t border-slate-200 dark:border-white/10 space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <ImageIcon size={18} className="text-[#027DFD] dark:text-[#00C7FF]" />
                    <span>
                      {lang === 'ar'
                        ? `معرض شاشات التطبيق (${screenshots.length})`
                        : `Mobile Screenshots Gallery (${screenshots.length})`}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {lang === 'ar'
                      ? 'اضغط على أي شاشة للتكبير والتنقل بالأسهم'
                      : 'Click any screen to inspect fullscreen with keyboard navigation'}
                  </p>
                </div>

                {screenshots.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-[#027DFD] hover:text-white text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                  >
                    <ZoomIn size={13} />
                    <span>{lang === 'ar' ? 'فتح العارض الشامل' : 'Open Lightbox'}</span>
                  </button>
                )}
              </div>

              {galleryGroups.length > 1 && (
                <div className="flex flex-wrap items-center gap-4 border-b border-slate-200/75 dark:border-white/8">
                  {galleryGroups.map((group) => {
                    const active = (activeGalleryGroup?.id || 'all') === group.id;
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => {
                          setGalleryCategory(group.id);
                          setVisibleGalleryCount(GALLERY_PAGE_SIZE);
                        }}
                        className={`relative pb-2 text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                          active
                            ? 'text-[#027DFD] dark:text-[#00C7FF] font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                        }`}
                      >
                        {group.label}
                        {active && (
                          <span className="absolute bottom-0 inset-x-0 h-[2px] rounded-full bg-[#027DFD] dark:bg-[#00C7FF]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {loadingScreens && screenshots.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {[1, 2, 3, 4].map((sk) => (
                    <div
                      key={sk}
                      className="aspect-[9/16] rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : screenshots.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                  <ImageIcon size={32} className="mx-auto mb-2 opacity-50 text-[#027DFD]" />
                  <p className="font-semibold text-xs sm:text-sm">
                    {lang === 'ar'
                      ? 'لم يتم العثور على شاشات لهذا المستودع بعد.'
                      : 'No screenshot assets found in this repository yet.'}
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className={`grid gap-3.5 sm:gap-4 ${
                      isFullPage
                        ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                        : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                    }`}
                  >
                    {activeGalleryGroup.items
                      .slice(0, visibleGalleryCount)
                      .map((item) => (
                        <GalleryCard
                          key={`${item.url}-${item.globalIndex}`}
                          url={item.url}
                          label={item.label}
                          index={item.globalIndex}
                          projectName={project.name}
                          isActive={activeScreenIndex === item.globalIndex}
                          onSelect={() => setActiveScreenIndex(item.globalIndex)}
                          onInspect={() => {
                            setActiveScreenIndex(item.globalIndex);
                            setLightboxOpen(true);
                          }}
                        />
                      ))}
                  </div>

                  {activeGalleryGroup.items.length > visibleGalleryCount && (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => setVisibleGalleryCount((prev) => prev + GALLERY_PAGE_SIZE)}
                        className="btn-kinetic inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#027DFD] hover:bg-[#026ae0] text-white text-xs font-bold shadow-sm cursor-pointer"
                      >
                        <ChevronDown size={15} />
                        <span>
                          {lang === 'ar'
                            ? `عرض المزيد (${
                                activeGalleryGroup.items.length - visibleGalleryCount
                              } متبقية)`
                            : `Show More (${
                                activeGalleryGroup.items.length - visibleGalleryCount
                              } remaining)`}
                        </span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* SECTION 4: ARCHITECTURE, FOLDER TREE & DEVELOPER CLI */}
            <section
              ref={architectureRef}
              id="workspace-architecture"
              className="scroll-mt-4 pt-8 border-t border-slate-200 dark:border-white/10 space-y-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  <Layers size={18} className="text-[#027DFD] dark:text-[#00C7FF]" />
                  <span>
                    {lang === 'ar'
                      ? 'المعمارية الهندسية وهيكل المشروع'
                      : 'Clean Architecture & Repository Structure'}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#027DFD] dark:text-[#7DD3FC] font-semibold">
                  SOLID Compliant
                </span>
              </div>

              {/* Clean 3-Column Hairline Architecture Band */}
              <div className="grid grid-cols-1 sm:grid-cols-3 rounded-2xl border border-slate-200/75 dark:border-white/8 bg-slate-50/50 dark:bg-white/[0.02] divide-y sm:divide-y-0 sm:divide-x divide-slate-200/75 dark:divide-white/8 text-xs">
                <div className="p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone size={15} className="text-blue-500" />
                      <span className="font-extrabold text-blue-600 dark:text-cyan-400">
                        1. Presentation
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-gray-300 text-xs leading-relaxed">
                      {project.architecture?.presentationLayer ||
                        (lang === 'ar'
                          ? 'واجهات فلاتر المتجاوبة، الشاشات، ومستمعو الحالة (Cubit / BlocBuilder).'
                          : 'Responsive Flutter UI views, reusable widgets, and Cubit/BLoC state listeners.')}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch size={15} className="text-emerald-500" />
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        2. Domain
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-gray-300 text-xs leading-relaxed">
                      {project.architecture?.domainLayer ||
                        (lang === 'ar'
                          ? 'منطق الأعمال النقي (Pure Dart)، الكيانات، وعقود المستودعات.'
                          : 'Pure Dart business logic, entities, use cases, and repository contracts.')}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Database size={15} className="text-purple-500" />
                      <span className="font-extrabold text-purple-600 dark:text-purple-400">
                        3. Data
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-gray-300 text-xs leading-relaxed">
                      {project.architecture?.dataLayer ||
                        (lang === 'ar'
                          ? 'موفرو البيانات المحليين والشبكيين (Hive / REST APIs / Firebase).'
                          : 'DTO models, local caching storage (Hive), and REST API / Firebase datasources.')}
                    </p>
                  </div>
                </div>
              </div>

              {parsedReadmeData.architectureNotes.length > 0 && (
                <div className="py-3 border-y border-slate-200/75 dark:border-white/8 space-y-2">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    {lang === 'ar' ? 'ملاحظات معمارية من المستودع' : 'Repository Architecture Notes'}
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {parsedReadmeData.architectureNotes.map((note, ni) => (
                      <li key={ni} className="flex items-start gap-2">
                        <span className="text-[#027DFD] font-mono shrink-0">·</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {parsedReadmeData.folderTree && (
                <div
                  dir="ltr"
                  className="p-4 sm:p-5 rounded-2xl bg-[#0a0d16] text-slate-200 font-mono text-xs space-y-2.5 border border-slate-800 shadow-lg"
                >
                  <div className="flex items-center justify-between text-[#00C7FF] font-bold">
                    <span className="flex items-center gap-2">
                      <FolderTree size={14} />
                      <span>Folder Structure</span>
                    </span>
                    <CopyChip label="Copy Tree" value={parsedReadmeData.folderTree} />
                  </div>
                  <pre className="p-3 rounded-xl bg-black/40 border border-white/5 overflow-x-auto text-[11px] leading-relaxed text-slate-300">
                    {parsedReadmeData.folderTree}
                  </pre>
                </div>
              )}

              {/* Strictly Verified Telemetry Only (Hairline Editorial Summary Row) */}
              {(project.metrics?.offlineSupport ||
                project.metrics?.liveStatus ||
                realApkSizeLabel ||
                releaseInfo?.tagName) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3.5 border-y border-slate-200/75 dark:border-white/8">
                  {project.metrics?.offlineSupport && (
                    <div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Offline Mode
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                        {project.metrics.offlineSupport}
                      </div>
                    </div>
                  )}
                  {project.metrics?.liveStatus && (
                    <div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Distribution
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {project.metrics.liveStatus}
                      </div>
                    </div>
                  )}
                  {releaseInfo?.tagName && (
                    <div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        GitHub Release
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-blue-600 dark:text-cyan-400 mt-0.5 font-mono tabular-nums">
                        {releaseInfo.tagName}
                      </div>
                    </div>
                  )}
                  {realApkSizeLabel && (
                    <div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Verified APK Size
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 tabular-nums">
                        {realApkSizeLabel}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Build Commands */}
              <div
                dir="ltr"
                className="p-4 sm:p-5 rounded-2xl bg-[#0a0d16] text-slate-200 font-mono text-xs space-y-3 border border-slate-800 shadow-lg"
              >
                <div className="flex items-center justify-between text-[#00C7FF] font-bold">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} />
                    <span>Developer Build Commands</span>
                  </div>
                  <CopyChip
                    label="Copy All"
                    value={`git clone ${githubRepoUrl}.git\ncd ${project.repoName}\nflutter pub get\nflutter run`}
                  />
                </div>
                <div className="space-y-1.5 text-[11px] sm:text-xs text-gray-300 bg-black/40 p-3.5 rounded-xl border border-white/5 overflow-x-auto">
                  <div>
                    <span className="text-slate-500 me-2">$</span>
                    <span className="text-emerald-400">git clone {githubRepoUrl}.git</span>
                  </div>
                  <div>
                    <span className="text-slate-500 me-2">$</span>
                    <span className="text-cyan-300">flutter pub get &amp;&amp; flutter run</span>
                  </div>
                  <div>
                    <span className="text-slate-500 me-2">$</span>
                    <span className="text-purple-300">flutter build apk --release</span>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 5: LIVE GITHUB STUDY CASE (ALWAYS SHOWN, NEVER FABRICATED) */}
            <section
              ref={casestudyRef}
              id="workspace-casestudy"
              className="scroll-mt-4 pt-8 border-t border-slate-200 dark:border-white/10 space-y-5 pb-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  <BookOpen size={18} className="text-[#027DFD] dark:text-[#00C7FF]" />
                  <span>{lang === 'ar' ? 'دراسة الحالة الهندسية' : 'Engineering Study Case'}</span>
                </div>

                {hasEnglishStudyCase && hasArabicStudyCase && (
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/10 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setStudyCaseLang('en')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                        studyCaseLang === 'en'
                          ? 'bg-[#027DFD] text-white'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudyCaseLang('ar')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                        studyCaseLang === 'ar'
                          ? 'bg-[#027DFD] text-white'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      العربية
                    </button>
                  </div>
                )}
              </div>

              {studyCaseLoading ? (
                <div className="py-12 rounded-2xl border border-slate-200/75 dark:border-white/8 flex flex-col items-center justify-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <Loader2 size={22} className="animate-spin text-[#027DFD]" />
                  <span className="text-xs font-mono">
                    {lang === 'ar'
                      ? 'جارٍ التحقق من ملف CASE_STUDY.md على GitHub...'
                      : 'Checking GitHub repo for CASE_STUDY.md / CASE_STUDY_AR.md...'}
                  </span>
                </div>
              ) : hasAnyStudyCase && activeStudyCaseMarkdown ? (
                <div
                  dir={studyCaseLang === 'ar' ? 'rtl' : 'ltr'}
                  className="pt-2"
                >
                  <ReadmeDocumentView
                    rawMarkdown={activeStudyCaseMarkdown}
                    repoName={project.repoName}
                    branch={defaultBranch}
                  />
                </div>
              ) : (
                <div className="py-10 px-6 rounded-2xl border border-dashed border-slate-300/80 dark:border-white/12 text-center space-y-2.5">
                  <FileCode size={28} className="mx-auto text-slate-400 dark:text-slate-500" />
                  <h5 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                    {lang === 'ar'
                      ? 'لا توجد دراسة حالة لهذا المشروع حالياً'
                      : 'There is no study case for now'}
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    {lang === 'ar'
                      ? 'بمجرد إضافة ملف CASE_STUDY.md أو CASE_STUDY_AR.md في جذر المستودع على GitHub سيتم عرضه هنا تلقائياً.'
                      : 'When CASE_STUDY.md or CASE_STUDY_AR.md is added to this repository root on GitHub, it will load here automatically.'}
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Fullscreen Keyboard-Navigable Gallery Lightbox */}
      {lightboxOpen && screenshots.length > 0 && (
        <div
          className="fixed inset-0 z-[120] bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(false);
          }}
        >
          <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-20">
            <span className="px-3.5 py-1.5 rounded-full bg-white/12 text-white font-mono text-xs border border-white/15 capitalize">
              {project.name} ·{' '}
              {formatReadableScreenName(
                screenshots[activeScreenIndex % screenshots.length],
                activeScreenIndex
              )}{' '}
              ({(activeScreenIndex % screenshots.length) + 1} / {screenshots.length})
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(false);
              }}
              className="pointer-events-auto text-white hover:text-rose-400 p-2.5 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer transition-colors"
              aria-label="Close Lightbox"
            >
              <X size={22} />
            </button>
          </div>

          <button
            type="button"
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
            src={resolveProxiedImageUrl(screenshots[activeScreenIndex % screenshots.length])}
            alt={`Screenshot ${(activeScreenIndex % screenshots.length) + 1}`}
            className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextScreen();
            }}
            className="absolute end-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white cursor-pointer z-20 transition-all hover:scale-110"
            aria-label="Next Screenshot"
          >
            <ChevronRight size={24} />
          </button>

          {screenshots.length > 1 && (
            <div
              className="mt-5 flex items-center gap-2 max-w-[90vw] overflow-x-auto px-3 py-2 rounded-2xl bg-black/70 border border-white/10 backdrop-blur-md no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {screenshots.map((imgUrl, idx) => (
                <button
                  key={`${imgUrl}-lb-${idx}`}
                  type="button"
                  onClick={() => setActiveScreenIndex(idx)}
                  className={`w-10 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeScreenIndex % screenshots.length === idx
                      ? 'border-[#00C7FF] scale-110 opacity-100'
                      : 'border-white/15 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={resolveProxiedImageUrl(imgUrl)}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(workspaceNode, document.body) : null;
};
