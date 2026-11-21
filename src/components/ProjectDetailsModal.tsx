import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
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
  AlertTriangle,
} from 'lucide-react';
import { Project, AHMED_PROFILE } from '../data/portfolioData';
import { resolveSmartProjectLinks } from '../utils/projectLinks';
import { copyToClipboard } from '../utils/clipboard';
import { SmartDemoButtons } from './SmartDemoButtons';
import { ProjectCardCover, synthesizeProjectBlueprint } from './ProjectCardCover';
import { ImageWithSkeleton, preloadImageUrls, resolveProxiedImageUrl } from './ImageWithSkeleton';
import { extractRepoTechTags } from '../utils/techTagExtractor';
import { TechIconBadge } from './TechLogos';
import { ReadmeDocumentView } from './ReadmeDocumentView';
import { YouTubeEmbedPlayer } from './YouTubeEmbedPlayer';
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
  fetchConsolidatedGitHubPortfolio,
  extractYouTubeVideoId,
  VERIFIED_REPO_SCREENSHOTS,
  RepoReleaseInfo,
  RepoLiveMetadata,
  RepoCaseStudyData,
  ConsolidatedGitHubPortfolio,
  formatFileSize,
} from '../services/githubService';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { usePlayStoreAppStats } from '../services/playStoreService';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  initialScreenIndex?: number;
}

type WorkspaceSectionId = 'overview' | 'specs' | 'gallery' | 'architecture' | 'casestudy';

function normalizeProjectInput(raw: Project | null | undefined): Project | null {
  if (!raw || typeof raw !== 'object') return null;
  try {
    const safeRepoName =
      typeof raw.repoName === 'string' && raw.repoName.trim()
        ? raw.repoName.trim()
        : typeof raw.name === 'string' && raw.name.trim()
        ? raw.name.trim()
        : 'Project';
    const safeName =
      typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : safeRepoName;
    const rawLinks = raw.links && typeof raw.links === 'object' ? raw.links : ({} as Project['links']);

    return {
      ...raw,
      id: raw.id ?? safeRepoName,
      name: safeName,
      repoName: safeRepoName,
      subtitle: typeof raw.subtitle === 'string' ? raw.subtitle : '',
      description: typeof raw.description === 'string' ? raw.description : '',
      image: typeof raw.image === 'string' ? raw.image : '',
      technologies: Array.isArray(raw.technologies)
        ? raw.technologies.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
        : [],
      features: Array.isArray(raw.features)
        ? raw.features.filter((f): f is string => typeof f === 'string' && f.trim().length > 0)
        : [],
      links: {
        github:
          typeof rawLinks.github === 'string' && rawLinks.github.trim()
            ? rawLinks.github
            : `https://github.com/ahmed-el-bialy/${encodeURIComponent(safeRepoName)}`,
        googlePlay: typeof rawLinks.googlePlay === 'string' ? rawLinks.googlePlay : undefined,
        demoVideoUrl: typeof rawLinks.demoVideoUrl === 'string' ? rawLinks.demoVideoUrl : undefined,
        liveDemoUrl: typeof rawLinks.liveDemoUrl === 'string' ? rawLinks.liveDemoUrl : undefined,
        playlistUrl: typeof rawLinks.playlistUrl === 'string' ? rawLinks.playlistUrl : undefined,
        releaseUrl: typeof rawLinks.releaseUrl === 'string' ? rawLinks.releaseUrl : undefined,
        apkDownloadUrl:
          typeof rawLinks.apkDownloadUrl === 'string' ? rawLinks.apkDownloadUrl : undefined,
      },
      architecture:
        raw.architecture && typeof raw.architecture === 'object' ? raw.architecture : undefined,
      metrics: raw.metrics && typeof raw.metrics === 'object' ? raw.metrics : undefined,
    };
  } catch {
    return null;
  }
}

const ModalRecoveryView: React.FC<{
  lang: 'en' | 'ar';
  dir: 'ltr' | 'rtl';
  projectName?: string;
  onRetry: () => void;
  onClose: () => void;
}> = ({ lang, dir, projectName, onRetry, onClose }) => (
  <div
    dir={dir}
    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/78 backdrop-blur-md p-4"
    onClick={onClose}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'ar' ? 'استرداد نافذة المشروع' : 'Project Workspace Recovery'}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0b0e16] border border-slate-200/90 dark:border-white/10 shadow-2xl p-6 sm:p-8 text-center space-y-5"
    >
      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/12 border border-amber-500/25 flex items-center justify-center text-amber-500">
        <AlertTriangle size={26} />
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
          {lang === 'ar'
            ? 'تعذر عرض تفاصيل أو شاشات المشروع مؤقتاً'
            : 'Unable to display project screens right now'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {lang === 'ar'
            ? `واجهنا نقصاً في بيانات ${projectName || 'هذا المشروع'} أو خطأ أثناء فتح المعاينة. يمكنك إعادة المحاولة بأمان دون التأثير على باقي الموقع.`
            : `Some screen metadata for ${projectName || 'this project'} was incomplete or interrupted. You can safely retry without affecting the rest of the portfolio.`}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={onRetry}
          className="btn-kinetic inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#0284ff] hover:bg-[#0070e0] text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer"
        >
          <RefreshCw size={15} />
          <span>{lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-semibold cursor-pointer"
        >
          <X size={15} />
          <span>{lang === 'ar' ? 'إغلاق' : 'Close'}</span>
        </button>
      </div>
    </div>
  </div>
);

interface ModalErrorBoundaryProps {
  lang: 'en' | 'ar';
  dir: 'ltr' | 'rtl';
  projectName?: string;
  resetKey: string | number;
  onRetry: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

interface ModalErrorBoundaryState {
  hasError: boolean;
}

class ModalErrorBoundary extends React.Component<
  ModalErrorBoundaryProps,
  ModalErrorBoundaryState
> {
  constructor(props: ModalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ModalErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: ModalErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ModalRecoveryView
          lang={this.props.lang}
          dir={this.props.dir}
          projectName={this.props.projectName}
          onRetry={() => {
            this.setState({ hasError: false });
            this.props.onRetry();
          }}
          onClose={this.props.onClose}
        />
      );
    }
    return this.props.children;
  }
}

const GALLERY_PAGE_SIZE = 12;

const CopyChip: React.FC<{ value: string; label?: string }> = ({ value, label }) => {
  const [copied, setCopied] = useState(false);
  const { lang } = useLanguage();
  const { showToast } = useToast();
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyToClipboard(value);
        if (!ok) return;
        setCopied(true);
        showToast({
          message: lang === 'ar' ? 'تم نسخ الأمر' : 'Command copied to clipboard',
          detail: value,
        });
        window.setTimeout(() => setCopied(false), 1800);
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
    <button
      type="button"
      onClick={() => {
        onSelect();
        onInspect();
      }}
      className={`card-shimmer group relative rounded-2xl overflow-hidden bg-[#161e31] border transition-colors duration-200 cursor-pointer flex flex-col text-start w-full ${
        isActive
          ? 'border-[#0284ff] ring-2 ring-[#0284ff]/25 shadow-lg'
          : 'border-slate-200/80 dark:border-white/10 hover:border-[#0284ff]/60 shadow-sm hover:shadow-xl'
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
          <span className="p-1.5 rounded-lg bg-[#0284ff] text-white shadow-md">
            <ZoomIn size={14} />
          </span>
        </div>
      </div>

      <div className="w-full px-3 py-2 bg-white dark:bg-[#111624] border-t border-slate-100 dark:border-white/8 flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-200 truncate capitalize">
          {label}
        </span>
        <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 shrink-0 tabular-nums">
          {index + 1}
        </span>
      </div>
    </button>
  );
};

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project,
  initialScreenIndex = 0,
}) => {
  const { lang, dir } = useLanguage();
  const { showToast } = useToast();

  const safeProject = useMemo(() => normalizeProjectInput(project), [project]);

  const [isFullPage, setIsFullPage] = useState(false);
  const [activeSection, setActiveSection] = useState<WorkspaceSectionId>('overview');
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [activeScreenIndex, setActiveScreenIndex] = useState<number>(0);
  const [galleryCategory, setGalleryCategory] = useState<string>('all');
  const [visibleGalleryCount, setVisibleGalleryCount] = useState<number>(GALLERY_PAGE_SIZE);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [adHocLightboxUrl, setAdHocLightboxUrl] = useState<string | null>(null);
  const [lightboxImgState, setLightboxImgState] = useState<{
    triedDirect: boolean;
    failed: boolean;
  }>({ triedDirect: false, failed: false });
  const [recoveryEpoch, setRecoveryEpoch] = useState<number>(0);

  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [loadingScreens, setLoadingScreens] = useState<boolean>(false);
  const [liveMeta, setLiveMeta] = useState<RepoLiveMetadata | null>(null);
  const [isSyncingLive, setIsSyncingLive] = useState<boolean>(false);
  const [releaseInfo, setReleaseInfo] = useState<RepoReleaseInfo>({ hasRelease: false });
  const [copiedClone, setCopiedClone] = useState<boolean>(false);

  const [caseStudyData, setCaseStudyData] = useState<RepoCaseStudyData>({ en: null, ar: null });
  const [studyCaseLoading, setStudyCaseLoading] = useState<boolean>(false);
  const [studyCaseLang, setStudyCaseLang] = useState<'en' | 'ar'>('en');

  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLElement>(null);
  const specsRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const architectureRef = useRef<HTMLElement>(null);
  const casestudyRef = useRef<HTMLElement>(null);

  useAccessibleDialog(isOpen, onClose, dialogRef, { disableEscape: true });

  const safeRepoName = safeProject?.repoName || '';
  const safeDisplayName = safeProject?.name || safeRepoName;
  const isRevio = safeRepoName.toLowerCase() === 'revio';
  const { data: playStats } = usePlayStoreAppStats(isRevio ? 'com.ahmed.revio' : '');

  const { data: cachedConsolidated } = useQuery<ConsolidatedGitHubPortfolio>({
    queryKey: ['github-consolidated', 'ahmed-el-bialy'],
    queryFn: () => fetchConsolidatedGitHubPortfolio('ahmed-el-bialy'),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const matchedCachedRepo = useMemo(() => {
    if (!safeProject || !Array.isArray(cachedConsolidated?.repos)) return undefined;
    return cachedConsolidated.repos.find(
      (r) =>
        r?.name?.toLowerCase() === safeRepoName.toLowerCase() ||
        r?.name?.toLowerCase() === safeDisplayName.toLowerCase()
    );
  }, [safeProject, safeRepoName, safeDisplayName, cachedConsolidated]);

  const cachedLiveMedia = useMemo(() => {
    if (!safeProject || !cachedConsolidated?.liveMediaMap) return undefined;
    return (
      cachedConsolidated.liveMediaMap[safeRepoName] ||
      cachedConsolidated.liveMediaMap[safeDisplayName] ||
      cachedConsolidated.liveMediaMap[safeRepoName.toLowerCase()]
    );
  }, [safeProject, safeRepoName, safeDisplayName, cachedConsolidated]);

  const syncLiveProjectData = useCallback(
    async (targetProject: Project, forceRefresh: boolean, preferredBranch?: string) => {
      if (!targetProject?.repoName) {
        setLoadingScreens(false);
        setStudyCaseLoading(false);
        setIsSyncingLive(false);
        return;
      }
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

        setCaseStudyData(csData || { en: null, ar: null });

        if (rel?.hasRelease || meta?.hasRelease || meta?.apkDownloadUrl) {
          setReleaseInfo({
            ...rel,
            hasRelease: Boolean(rel?.hasRelease || meta?.hasRelease),
            apkDownloadUrl: rel?.apkDownloadUrl || meta?.apkDownloadUrl,
            releaseUrl: rel?.releaseUrl || meta?.releaseUrl,
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
            ...(Array.isArray(folderUrls) ? folderUrls : []),
            ...(Array.isArray(meta?.discoveredScreenshots) ? meta.discoveredScreenshots : []),
            ...((!Array.isArray(folderUrls) || folderUrls.length === 0) && Array.isArray(verified)
              ? verified
              : []),
          ])
        ).filter((u): u is string => typeof u === 'string' && u.trim().length > 0);

        if (mergedScreens.length > 0) {
          setScreenshots(mergedScreens);
        } else if (typeof targetProject.image === 'string' && targetProject.image.trim()) {
          setScreenshots([targetProject.image.trim()]);
        }
      } catch {
        // Silent recovery — retain verified local assets when network sync fails
      } finally {
        setLoadingScreens(false);
        setStudyCaseLoading(false);
        setIsSyncingLive(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!isOpen) {
      setLightboxOpen(false);
      setAdHocLightboxUrl(null);
      setLightboxImgState({ triedDirect: false, failed: false });
      return;
    }

    if (isOpen && safeProject) {
      try {
        setIsFullPage(false);
        setActiveSection('overview');
        setIsPlayingVideo(false);
        setActiveScreenIndex(
          typeof initialScreenIndex === 'number' && Number.isFinite(initialScreenIndex) && initialScreenIndex >= 0
            ? Math.trunc(initialScreenIndex)
            : 0
        );
        setGalleryCategory('all');
        setVisibleGalleryCount(GALLERY_PAGE_SIZE);
        setLightboxOpen(false);
        setAdHocLightboxUrl(null);
        setLightboxImgState({ triedDirect: false, failed: false });
        setCaseStudyData({ en: null, ar: null });
        setStudyCaseLang(lang === 'ar' ? 'ar' : 'en');
        setLiveMeta(cachedLiveMedia || null);
        setReleaseInfo({ hasRelease: false });

        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }

        const verified =
          VERIFIED_REPO_SCREENSHOTS[safeRepoName] ||
          VERIFIED_REPO_SCREENSHOTS[safeDisplayName] ||
          VERIFIED_REPO_SCREENSHOTS[safeRepoName.toLowerCase()] ||
          [];

        const initialScreens = Array.from(
          new Set([
            ...(Array.isArray(matchedCachedRepo?.discoveredScreenshots)
              ? matchedCachedRepo.discoveredScreenshots
              : []),
            ...(Array.isArray(cachedLiveMedia?.discoveredScreenshots)
              ? cachedLiveMedia.discoveredScreenshots
              : []),
            ...(Array.isArray(verified) ? verified : []),
          ])
        ).filter((u): u is string => typeof u === 'string' && u.trim().length > 0);

        if (initialScreens.length > 0) {
          setScreenshots(initialScreens);
          preloadImageUrls(initialScreens.slice(0, 6));
          setLoadingScreens(false);
        } else if (safeProject.image) {
          setScreenshots([safeProject.image]);
          setLoadingScreens(false);
        } else {
          setScreenshots([]);
          setLoadingScreens(true);
        }

        const branchHint =
          cachedLiveMedia?.defaultBranch || matchedCachedRepo?.default_branch || 'main';
        syncLiveProjectData(safeProject, false, branchHint);
      } catch {
        setScreenshots([]);
        setLoadingScreens(false);
      }
    }
  }, [isOpen, safeProject, initialScreenIndex, recoveryEpoch]);

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

  const safeScreenshots = useMemo(
    () =>
      Array.isArray(screenshots)
        ? screenshots.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
        : [],
    [screenshots]
  );

  const safeScreenCount = safeScreenshots.length;
  const safeScreenIndex =
    safeScreenCount > 0 && Number.isFinite(activeScreenIndex)
      ? ((Math.trunc(activeScreenIndex) % safeScreenCount) + safeScreenCount) % safeScreenCount
      : 0;

  // Reset image fallback state whenever active lightbox screen changes
  useEffect(() => {
    setLightboxImgState({ triedDirect: false, failed: false });
  }, [safeScreenIndex, adHocLightboxUrl, lightboxOpen]);

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
    if (safeScreenCount === 0) return;
    setAdHocLightboxUrl(null);
    setActiveScreenIndex((prev) =>
      Number.isFinite(prev) ? (Math.trunc(prev) + 1) % safeScreenCount : 0
    );
  }, [safeScreenCount]);

  const prevScreen = useCallback(() => {
    if (safeScreenCount === 0) return;
    setAdHocLightboxUrl(null);
    setActiveScreenIndex((prev) => {
      const normalized = Number.isFinite(prev)
        ? ((Math.trunc(prev) % safeScreenCount) + safeScreenCount) % safeScreenCount
        : 0;
      return normalized === 0 ? safeScreenCount - 1 : normalized - 1;
    });
  }, [safeScreenCount]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (lightboxOpen) {
          setLightboxOpen(false);
          setAdHocLightboxUrl(null);
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

  const parsedReadmeData = useMemo(() => {
    try {
      return extractStructuredReadmeTemplate(
        rawReadme,
        safeRepoName,
        defaultBranch,
        'ahmed-el-bialy'
      );
    } catch {
      return {
        features: [],
        techPackages: [],
        architectureNotes: [],
        badges: [],
        screenshots: [],
      };
    }
  }, [rawReadme, safeRepoName, defaultBranch]);

  const galleryGroups = useMemo(() => {
    try {
      return groupScreenshotsByCategory(safeScreenshots, lang);
    } catch {
      return [
        {
          id: 'all',
          label: lang === 'ar' ? `الكل (${safeScreenshots.length})` : `All (${safeScreenshots.length})`,
          items: [],
        },
      ];
    }
  }, [safeScreenshots, lang]);

  const activeGalleryGroup = useMemo(
    () => galleryGroups.find((g) => g.id === galleryCategory) || galleryGroups[0] || { id: 'all', label: '', items: [] },
    [galleryGroups, galleryCategory]
  );

  const handleRetryModal = useCallback(() => {
    setLightboxOpen(false);
    setAdHocLightboxUrl(null);
    setLightboxImgState({ triedDirect: false, failed: false });
    setActiveScreenIndex(0);
    setGalleryCategory('all');
    setRecoveryEpoch((prev) => prev + 1);
    if (safeProject) {
      syncLiveProjectData(safeProject, true, defaultBranch);
    }
  }, [safeProject, defaultBranch, syncLiveProjectData]);

  if (isOpen && !safeProject) {
    return typeof document !== 'undefined'
      ? createPortal(
          <ModalRecoveryView
            lang={lang}
            dir={dir}
            onRetry={handleRetryModal}
            onClose={onClose}
          />,
          document.body
        )
      : null;
  }

  let preparedData: {
    currentLiveDemoUrl?: string;
    currentPlaylistUrl?: string;
    currentPlayUrl?: string;
    resolvedModalLinks: ReturnType<typeof resolveSmartProjectLinks>;
    playerCandidateUrl?: string;
    parsedVideoId: string | null;
    youtubeIframeSrc: string | null;
    youtubePosterUrl: string | null;
    hasPlayStore: boolean;
    hasApk: boolean;
    realApkSizeLabel: string | null;
    realStarsCount: number | null;
    realForksCount: number | null;
    realLanguage: string | null;
    realPushedLabel: string | null;
    appBlueprint: ReturnType<typeof synthesizeProjectBlueprint>;
    BlueprintIcon: ReturnType<typeof synthesizeProjectBlueprint>['badgeIcon'];
    techTagObjects: ReturnType<typeof extractRepoTechTags>;
    displayDescription: string;
    displayFeatures: string[];
    displayTechStack: string[];
    apkHref: string;
    githubRepoUrl: string;
    hasEnglishStudyCase: boolean;
    hasArabicStudyCase: boolean;
    hasAnyStudyCase: boolean;
    activeStudyCaseMarkdown: string;
    distributionLabel: string;
    navSections: Array<{ id: WorkspaceSectionId; label: string; count?: number }>;
  } | null = null;

  let prepFailed = false;

  if (isOpen && safeProject) {
    try {
      const projectLinks = safeProject.links || { github: `https://github.com/ahmed-el-bialy/${safeRepoName}` };
    const currentLiveDemoUrl = liveMeta?.liveDemoUrl || projectLinks.liveDemoUrl;
    const currentPlaylistUrl = liveMeta?.playlistUrl || projectLinks.playlistUrl;
    const currentPlayUrl = liveMeta?.googlePlayUrl || projectLinks.googlePlay;
    const resolvedModalLinks = resolveSmartProjectLinks(
      {
        ...projectLinks,
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
      safeProject.hasApk ||
        projectLinks.apkDownloadUrl ||
        releaseInfo.apkDownloadUrl ||
        liveMeta?.apkDownloadUrl ||
        (releaseInfo.hasRelease && releaseInfo.releaseUrl)
    );
    const realApkSizeLabel = formatFileSize(releaseInfo.apkSize);

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
    let realPushedLabel: string | null = null;
    if (realPushedAt) {
      const parsedDate = new Date(realPushedAt);
      if (!Number.isNaN(parsedDate.getTime())) {
        realPushedLabel = parsedDate.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    }

    const appBlueprint = synthesizeProjectBlueprint(
      safeRepoName,
      realLanguage || 'Dart',
      safeProject.description,
      safeProject.technologies
    );
    const BlueprintIcon = appBlueprint.badgeIcon;

    const techTagObjects = extractRepoTechTags({
      repoName: safeRepoName,
      language: realLanguage || 'Dart',
      topics: matchedCachedRepo?.topics || liveMeta?.topics,
      description: safeProject.description || liveMeta?.description,
      technologies: safeProject.technologies,
    });

    const isGenericDescription =
      !safeProject.description ||
      safeProject.description.startsWith('Production-ready codebase implementing');
    const displayDescription =
      (isGenericDescription && (liveMeta?.description || parsedReadmeData.overviewText)) ||
      safeProject.description ||
      liveMeta?.description ||
      parsedReadmeData.overviewText ||
      '';

    const safeFeatures = Array.isArray(safeProject.features) ? safeProject.features : [];
    const isGenericFeatures =
      safeFeatures.length > 0 &&
      safeFeatures[0]?.startsWith('Clean architectural separation');
    const displayFeatures =
      parsedReadmeData.features.length > 0 && isGenericFeatures
        ? parsedReadmeData.features
        : Array.from(
            new Set([
              ...safeFeatures,
              ...(parsedReadmeData.features.length > 0 ? parsedReadmeData.features : []),
            ])
          ).slice(0, 10);

    const displayTechStack = Array.from(
      new Set([
        ...(Array.isArray(safeProject.technologies) ? safeProject.technologies : []),
        ...(Array.isArray(matchedCachedRepo?.topics)
          ? matchedCachedRepo.topics
          : Array.isArray(liveMeta?.topics)
          ? liveMeta.topics
          : []),
        ...(Array.isArray(parsedReadmeData.techPackages) ? parsedReadmeData.techPackages : []),
      ])
    ).slice(0, 16);

    const apkHref =
      projectLinks.apkDownloadUrl ||
      releaseInfo.apkDownloadUrl ||
      liveMeta?.apkDownloadUrl ||
      releaseInfo.releaseUrl ||
      `https://github.com/ahmed-el-bialy/${encodeURIComponent(safeRepoName)}/releases`;

    const githubRepoUrl =
      projectLinks.github || `https://github.com/ahmed-el-bialy/${encodeURIComponent(safeRepoName)}`;

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
        count: safeScreenCount,
      },
      { id: 'architecture', label: lang === 'ar' ? 'المعمارية والأوامر' : 'Architecture & CLI' },
      { id: 'casestudy', label: lang === 'ar' ? 'دراسة الحالة' : 'Study Case' },
    ];

    preparedData = {
      currentLiveDemoUrl,
      currentPlaylistUrl,
      currentPlayUrl,
      resolvedModalLinks,
      playerCandidateUrl,
      parsedVideoId,
      youtubeIframeSrc,
      youtubePosterUrl,
      hasPlayStore,
      hasApk,
      realApkSizeLabel,
      realStarsCount,
      realForksCount,
      realLanguage,
      realPushedLabel,
      appBlueprint,
      BlueprintIcon,
      techTagObjects,
      displayDescription,
      displayFeatures,
      displayTechStack,
      apkHref,
      githubRepoUrl,
      hasEnglishStudyCase,
      hasArabicStudyCase,
      hasAnyStudyCase,
      activeStudyCaseMarkdown,
      distributionLabel,
      navSections,
    };
    } catch {
      prepFailed = true;
    }
  }

  if (isOpen && (prepFailed || !preparedData)) {
    return typeof document !== 'undefined'
      ? createPortal(
          <ModalRecoveryView
            lang={lang}
            dir={dir}
            projectName={safeDisplayName}
            onRetry={handleRetryModal}
            onClose={onClose}
          />,
          document.body
        )
      : null;
  }

  let workspaceNode: React.ReactNode = null;

  if (isOpen && safeProject && preparedData) {
    const {
      currentPlaylistUrl,
      currentPlayUrl,
      resolvedModalLinks,
      playerCandidateUrl,
      parsedVideoId,
      youtubeIframeSrc,
      youtubePosterUrl,
      hasPlayStore,
      hasApk,
      realApkSizeLabel,
      realStarsCount,
      realForksCount,
      realLanguage,
      realPushedLabel,
      appBlueprint,
      BlueprintIcon,
      techTagObjects,
      displayDescription,
      displayFeatures,
      displayTechStack,
      apkHref,
      githubRepoUrl,
      hasEnglishStudyCase,
      hasArabicStudyCase,
      hasAnyStudyCase,
      activeStudyCaseMarkdown,
      distributionLabel,
      navSections,
    } = preparedData;

    const handleCopyClone = async () => {
      const cmd = `git clone ${githubRepoUrl}.git`;
      const ok = await copyToClipboard(cmd);
      if (!ok) return;
      setCopiedClone(true);
      showToast({
        message: lang === 'ar' ? 'تم نسخ أمر الاستنساخ' : 'Git clone command copied',
        detail: cmd,
      });
      window.setTimeout(() => setCopiedClone(false), 1800);
    };

    const activeStageScreenUrl = safeScreenCount > 0 ? safeScreenshots[safeScreenIndex] : '';
    const activeLightboxRawUrl =
      adHocLightboxUrl || (safeScreenCount > 0 ? safeScreenshots[safeScreenIndex] : '');
    const activeLightboxSrc = activeLightboxRawUrl
      ? lightboxImgState.triedDirect
        ? activeLightboxRawUrl
        : resolveProxiedImageUrl(activeLightboxRawUrl)
      : '';

    workspaceNode = (
    <motion.div
      key="project-workspace-backdrop"
      dir={dir}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/78 backdrop-blur-md ${
        isFullPage ? 'p-0' : 'p-2 sm:p-5'
      }`}
      onClick={() => {
        if (!isFullPage) onClose();
      }}
    >
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={safeDisplayName}
        initial={{ opacity: 0, y: 12, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.985 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={`relative flex flex-col overflow-hidden bg-white dark:bg-[#0b0e16] border-slate-200/90 dark:border-white/10 shadow-2xl outline-none ${
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
                {safeDisplayName}
              </h2>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                ahmed-el-bialy/{safeRepoName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => syncLiveProjectData(safeProject, true, defaultBranch)}
              disabled={isSyncingLive}
              className="btn-kinetic inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[40px] sm:min-h-0 rounded-lg bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
              title={lang === 'ar' ? 'تحديث البيانات من GitHub' : 'Sync latest from GitHub'}
            >
              <RefreshCw size={12.5} className={isSyncingLive ? 'animate-spin text-[#0284ff]' : ''} />
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
              className={`btn-kinetic inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[40px] sm:min-h-0 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isFullPage
                  ? 'bg-[#0284ff] text-white border-[#0284ff]'
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
              className="w-11 h-11 sm:w-8 sm:h-8 rounded-lg bg-slate-100/80 dark:bg-white/[0.04] hover:bg-rose-500/12 text-slate-600 dark:text-slate-400 hover:text-rose-500 border border-slate-200/80 dark:border-white/10 flex items-center justify-center transition-colors cursor-pointer"
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
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                  }`}
                >
                  <span>{section.label}</span>
                  {typeof section.count === 'number' && section.count > 0 && (
                    <span
                      className={`font-mono text-[11px] tabular-nums transition-colors ${
                        active
                          ? 'text-[#0369a1] dark:text-[#38bdf8]'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {section.count}
                    </span>
                  )}
                  {active && (
                    <motion.span
                      layoutId="modalSectionUnderline"
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute bottom-0 inset-x-0 h-[2px] rounded-full bg-gradient-to-r from-[#0284ff] to-[#38bdf8]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {releaseInfo.tagName && (
            <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 shrink-0 tabular-nums">
              <PackageCheck size={12} className="text-[#0369a1] dark:text-[#38bdf8]" />
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
                      {safeDisplayName}
                    </h3>
                    <p className="font-display text-sm sm:text-[15px] font-semibold text-[#0369a1] dark:text-[#7DD3FC]">
                      {safeProject.subtitle}
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
                        key={`${safeProject.id}-modal-tag-${tag.id}-${idx}`}
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
                    <div className="text-[10.5px] font-mono text-slate-600 dark:text-slate-400">
                      {lang === 'ar' ? 'النمط الهندسي' : 'Engineering Pattern'}
                    </div>
                    <div className="text-xs font-bold text-[#0369a1] dark:text-[#38bdf8] mt-0.5 truncate">
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

                  <SmartDemoButtons
                    resolved={resolvedModalLinks}
                    stopPropagation={false}
                    onWatchDemo={
                      parsedVideoId
                        ? () => {
                            setIsPlayingVideo(true);
                            scrollToSection('overview');
                          }
                        : undefined
                    }
                  />

                  {hasApk && (
                    <a
                      href={apkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-kinetic inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs"
                    >
                      <Download size={14} />
                      <span>
                        {safeProject.links?.apkDownloadUrl || releaseInfo.apkDownloadUrl || liveMeta?.apkDownloadUrl
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
                    className="btn-kinetic inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 rounded-xl bg-[#0284ff]/10 hover:bg-[#0284ff] text-[#0369a1] dark:text-[#38bdf8] hover:text-white border border-[#0284ff]/20 font-bold text-xs transition-colors cursor-pointer ms-auto"
                  >
                    <ImageIcon size={14} />
                    <span>
                      {lang === 'ar'
                        ? `معرض الشاشات (${safeScreenCount})`
                        : `Jump to Gallery (${safeScreenCount})`}
                    </span>
                  </button>
                </div>
              </div>

              {/* Side-by-Side Dual Media Stage: Single-Elevation Studio Framing */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Start Panel: Live Video Demo Showcase */}
                <div className="card-shimmer overflow-hidden lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-slate-50/75 dark:bg-white/[0.025] border border-slate-200/75 dark:border-white/8 flex flex-col justify-between gap-3.5">
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
                        className="text-[11px] font-mono font-bold text-[#0369a1] dark:text-[#38bdf8] hover:underline inline-flex items-center gap-1"
                      >
                        <span>{lang === 'ar' ? 'قائمة الشرح الكامل' : 'Full Playlist'}</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>

                  {youtubeIframeSrc && parsedVideoId ? (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#08090d] border border-slate-200 dark:border-white/10 shadow-md flex-1">
                      {isPlayingVideo ? (
                        <YouTubeEmbedPlayer
                          videoId={parsedVideoId}
                          title={`${safeDisplayName} Live Video Demo`}
                          youtubeUrl={playerCandidateUrl}
                          autoplay={true}
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
                              alt={`${safeDisplayName} demo poster`}
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
                          repoName={safeRepoName}
                          language={realLanguage || 'Dart'}
                          coverUrl={safeProject.image}
                          discoveredScreenshots={safeScreenshots}
                          isHighlight={safeProject.highlight}
                          description={displayDescription}
                          topics={safeProject.technologies}
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
                <div className="card-shimmer overflow-hidden lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-slate-50/75 dark:bg-white/[0.025] border border-slate-200/75 dark:border-white/8 flex flex-col justify-between gap-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 truncate">
                      <Smartphone size={15} className="text-[#0369a1] dark:text-[#38bdf8] shrink-0" />
                      <span className="truncate capitalize">
                        {safeScreenCount > 0 && activeStageScreenUrl
                          ? formatReadableScreenName(activeStageScreenUrl, safeScreenIndex)
                          : lang === 'ar'
                          ? 'معاينة الشاشات'
                          : 'App Screens'}
                      </span>
                    </span>
                    {safeScreenCount > 0 && (
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                        {safeScreenIndex + 1} / {safeScreenCount}
                      </span>
                    )}
                  </div>

                  {loadingScreens && safeScreenCount === 0 ? (
                    <div className="flex-1 min-h-[260px] rounded-2xl bg-[#161e31] skeleton-shimmer flex items-center justify-center">
                      <Loader2 size={22} className="animate-spin text-[#00C7FF]" />
                    </div>
                  ) : safeScreenCount > 0 && activeStageScreenUrl ? (
                    <>
                      <div className="relative flex justify-center items-center py-1 flex-1">
                        <div className="relative w-[180px] sm:w-[195px] aspect-[9/17.8] rounded-[26px] p-1.5 bg-[#0f1628] border-2 border-slate-300/90 dark:border-white/25 shadow-2xl overflow-hidden group">
                          <button
                            type="button"
                            onClick={() => {
                              setAdHocLightboxUrl(null);
                              setLightboxOpen(true);
                            }}
                            className="w-full h-full rounded-[20px] overflow-hidden bg-[#161e31] block cursor-pointer"
                            aria-label="Open screen in fullscreen lightbox"
                          >
                            <ImageWithSkeleton
                              key={activeStageScreenUrl}
                              src={activeStageScreenUrl}
                              alt={`${safeDisplayName} preview`}
                              loading="eager"
                              variant="phone"
                              className="w-full h-full object-cover object-top crisp-screenshot group-hover:scale-[1.02] transition-transform duration-300"
                            />
                          </button>

                          {safeScreenCount > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  prevScreen();
                                }}
                                className="absolute start-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-7 sm:h-7 rounded-full bg-black/70 hover:bg-black text-white opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                                aria-label="Previous screen"
                              >
                                <ChevronLeft size={15} className={dir === 'rtl' ? 'rotate-180' : ''} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  nextScreen();
                                }}
                                className="absolute end-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-7 sm:h-7 rounded-full bg-black/70 hover:bg-black text-white opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                                aria-label="Next screen"
                              >
                                <ChevronRight size={15} className={dir === 'rtl' ? 'rotate-180' : ''} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Thumbnail Filmstrip + Smooth Scroll Jump to Gallery */}
                      <div className="pt-2 border-t border-slate-200/80 dark:border-white/8 flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {safeScreenshots.slice(0, 5).map((thumb, idx) => {
                          const active = safeScreenIndex === idx;
                          return (
                            <button
                              key={`${thumb}-${idx}`}
                              type="button"
                              onClick={() => {
                                setAdHocLightboxUrl(null);
                                setActiveScreenIndex(idx);
                              }}
                              className={`w-11 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-[#161e31] ${
                                active
                                  ? 'border-[#0284ff] scale-[1.03]'
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
                          className="h-16 px-3 rounded-lg border border-dashed border-slate-300 dark:border-white/20 hover:border-[#0284ff] bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 hover:text-[#0369a1] dark:hover:text-[#38bdf8] text-[11px] font-mono font-bold shrink-0 flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ms-auto"
                        >
                          <ImageIcon size={13} />
                          <span>
                            {lang === 'ar'
                              ? `الكل (${safeScreenCount})`
                              : `All (${safeScreenCount})`}
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
                <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 tabular-nums">
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
                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-semibold text-slate-700 dark:text-[#7DD3FC] hover:border-[#0284ff]/50 transition-colors"
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
                  <Cpu size={16} className="text-[#0369a1] dark:text-[#38bdf8]" />
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
                    <ImageIcon size={18} className="text-[#0369a1] dark:text-[#38bdf8]" />
                    <span>
                      {lang === 'ar'
                        ? `معرض شاشات التطبيق (${safeScreenCount})`
                        : `Mobile Screenshots Gallery (${safeScreenCount})`}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {lang === 'ar'
                      ? 'اضغط على أي شاشة للتكبير والتنقل بالأسهم'
                      : 'Click any screen to inspect fullscreen with keyboard navigation'}
                  </p>
                </div>

                {safeScreenCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setAdHocLightboxUrl(null);
                      setLightboxOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-[#0284ff] hover:text-white text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
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
                            ? 'text-[#0369a1] dark:text-[#38bdf8] font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                        }`}
                      >
                        {group.label}
                        {active && (
                          <span className="absolute bottom-0 inset-x-0 h-[2px] rounded-full bg-[#0284ff] dark:bg-[#38bdf8]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {loadingScreens && safeScreenCount === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {[1, 2, 3, 4].map((sk) => (
                    <div
                      key={sk}
                      className="aspect-[9/16] rounded-2xl bg-slate-200 dark:bg-slate-800 skeleton-shimmer"
                    />
                  ))}
                </div>
              ) : safeScreenCount === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                  <ImageIcon size={32} className="mx-auto mb-2 opacity-50 text-[#0284ff]" />
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
                    {(activeGalleryGroup?.items || [])
                      .slice(0, visibleGalleryCount)
                      .map((item) => {
                        const targetIndex =
                          typeof item.globalIndex === 'number' && Number.isFinite(item.globalIndex)
                            ? item.globalIndex
                            : 0;
                        return (
                          <GalleryCard
                            key={`${item.url}-${targetIndex}`}
                            url={item.url}
                            label={item.label}
                            index={targetIndex}
                            projectName={safeDisplayName}
                            isActive={safeScreenIndex === targetIndex}
                            onSelect={() => {
                              setAdHocLightboxUrl(null);
                              setActiveScreenIndex(targetIndex);
                            }}
                            onInspect={() => {
                              setAdHocLightboxUrl(null);
                              setActiveScreenIndex(targetIndex);
                              setLightboxOpen(true);
                            }}
                          />
                        );
                      })}
                  </div>

                  {(activeGalleryGroup?.items?.length || 0) > visibleGalleryCount && (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => setVisibleGalleryCount((prev) => prev + GALLERY_PAGE_SIZE)}
                        className="btn-kinetic inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0284ff] hover:bg-[#026ae0] text-white text-xs font-bold shadow-sm cursor-pointer"
                      >
                        <ChevronDown size={15} />
                        <span>
                          {lang === 'ar'
                            ? `عرض المزيد (${
                                (activeGalleryGroup?.items?.length || 0) - visibleGalleryCount
                              } متبقية)`
                            : `Show More (${
                                (activeGalleryGroup?.items?.length || 0) - visibleGalleryCount
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
                  <Layers size={18} className="text-[#0369a1] dark:text-[#38bdf8]" />
                  <span>
                    {lang === 'ar'
                      ? 'المعمارية الهندسية وهيكل المشروع'
                      : 'Clean Architecture & Repository Structure'}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#0369a1] dark:text-[#7DD3FC] font-semibold">
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
                      {safeProject.architecture?.presentationLayer ||
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
                      {safeProject.architecture?.domainLayer ||
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
                      {safeProject.architecture?.dataLayer ||
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
                        <span className="text-[#0284ff] font-mono shrink-0">·</span>
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
              {(safeProject.metrics?.offlineSupport ||
                safeProject.metrics?.liveStatus ||
                realApkSizeLabel ||
                releaseInfo?.tagName) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3.5 border-y border-slate-200/75 dark:border-white/8">
                  {safeProject.metrics?.offlineSupport && (
                    <div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Offline Mode
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                        {safeProject.metrics.offlineSupport}
                      </div>
                    </div>
                  )}
                  {safeProject.metrics?.liveStatus && (
                    <div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Distribution
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {safeProject.metrics.liveStatus}
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
                    value={`git clone ${githubRepoUrl}.git\ncd ${safeRepoName}\nflutter pub get\nflutter run`}
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
                  <BookOpen size={18} className="text-[#0369a1] dark:text-[#38bdf8]" />
                  <span>{lang === 'ar' ? 'دراسة الحالة الهندسية' : 'Engineering Study Case'}</span>
                </div>

                {hasEnglishStudyCase && hasArabicStudyCase && (
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/10 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setStudyCaseLang('en')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                        studyCaseLang === 'en'
                          ? 'bg-[#0284ff] text-white'
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
                          ? 'bg-[#0284ff] text-white'
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
                  <Loader2 size={22} className="animate-spin text-[#0284ff]" />
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
                    repoName={safeRepoName}
                    branch={defaultBranch}
                    onImageClick={(clickedUrl) => {
                      if (!clickedUrl || typeof clickedUrl !== 'string') return;
                      const matchedIdx = safeScreenshots.indexOf(clickedUrl);
                      if (matchedIdx >= 0) {
                        setAdHocLightboxUrl(null);
                        setActiveScreenIndex(matchedIdx);
                      } else {
                        setAdHocLightboxUrl(clickedUrl);
                      }
                      setLightboxOpen(true);
                    }}
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
      </motion.div>

      {/* Fullscreen Keyboard-Navigable Gallery Lightbox */}
      {lightboxOpen && activeLightboxRawUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'ar' ? 'معاينة الصورة بالحجم الكامل' : 'Screenshot Lightbox'}
          className="fixed inset-0 z-[120] bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(false);
            setAdHocLightboxUrl(null);
          }}
        >
          <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-20">
            <span className="px-3.5 py-1.5 rounded-full bg-white/12 text-white font-mono text-xs border border-white/15 capitalize">
              {safeDisplayName} ·{' '}
              {formatReadableScreenName(activeLightboxRawUrl, safeScreenIndex)}
              {!adHocLightboxUrl && safeScreenCount > 0
                ? ` (${safeScreenIndex + 1} / ${safeScreenCount})`
                : ''}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(false);
                setAdHocLightboxUrl(null);
              }}
              className="pointer-events-auto text-white hover:text-rose-400 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer transition-colors"
              aria-label="Close Lightbox"
            >
              <X size={22} />
            </button>
          </div>

          {!adHocLightboxUrl && safeScreenCount > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevScreen();
              }}
              className="absolute start-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white cursor-pointer z-20 transition-all hover:scale-110 flex items-center justify-center"
              aria-label="Previous Screenshot"
            >
              <ChevronLeft size={24} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
          )}

          {lightboxImgState.failed || !activeLightboxSrc ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-sm w-full rounded-2xl bg-[#0e1424] border border-white/15 p-6 text-center space-y-4 text-slate-200 shadow-2xl"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle size={22} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  {lang === 'ar'
                    ? 'تعذر تحميل هذه الشاشة حالياً'
                    : 'Could not load this screenshot right now'}
                </p>
                <p className="text-xs text-slate-400">
                  {lang === 'ar'
                    ? 'يمكنك إعادة المحاولة أو التنقل لبقية الشاشات.'
                    : 'You can retry loading or switch to another screen.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setLightboxImgState({ triedDirect: false, failed: false })}
                  className="btn-kinetic inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284ff] hover:bg-[#0070e0] text-white text-xs font-bold cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>{lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLightboxOpen(false);
                    setAdHocLightboxUrl(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                >
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          ) : (
            <img
              key={activeLightboxSrc}
              src={activeLightboxSrc}
              alt={`Screenshot ${safeScreenIndex + 1}`}
              referrerPolicy="no-referrer"
              onError={() => {
                if (!lightboxImgState.triedDirect && activeLightboxSrc !== activeLightboxRawUrl) {
                  setLightboxImgState({ triedDirect: true, failed: false });
                } else {
                  setLightboxImgState({ triedDirect: true, failed: true });
                }
              }}
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {!adHocLightboxUrl && safeScreenCount > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextScreen();
              }}
              className="absolute end-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white cursor-pointer z-20 transition-all hover:scale-110 flex items-center justify-center"
              aria-label="Next Screenshot"
            >
              <ChevronRight size={24} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
          )}

          {!adHocLightboxUrl && safeScreenCount > 1 && (
            <div
              className="mt-5 flex items-center gap-2 max-w-[90vw] overflow-x-auto px-3 py-2 rounded-2xl bg-black/70 border border-white/10 backdrop-blur-md no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {safeScreenshots.map((imgUrl, idx) => (
                <button
                  key={`${imgUrl}-lb-${idx}`}
                  type="button"
                  onClick={() => setActiveScreenIndex(idx)}
                  aria-label={`View screenshot ${idx + 1}`}
                  className={`w-10 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    safeScreenIndex === idx
                      ? 'border-[#38bdf8] scale-110 opacity-100'
                      : 'border-white/15 opacity-70 hover:opacity-100'
                  }`}
                >
                  <ImageWithSkeleton
                    src={imgUrl}
                    alt={`Thumb ${idx + 1}`}
                    loading="eager"
                    variant="phone"
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
    );
  }

  return typeof document !== 'undefined'
    ? createPortal(
        <ModalErrorBoundary
          lang={lang}
          dir={dir}
          projectName={safeDisplayName}
          resetKey={`${safeProject?.id ?? 'none'}-${recoveryEpoch}-${safeScreenCount}`}
          onRetry={handleRetryModal}
          onClose={onClose}
        >
          <AnimatePresence>
            {workspaceNode}
          </AnimatePresence>
        </ModalErrorBoundary>,
        document.body
      )
    : null;
};
