import React, { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { DEFAULT_PROFILE, openEmailClient, FEATURED_PROJECTS, Project } from './data/portfolioData';
import { AHMED_CONFIG, getEgyptLocalTime } from './data/config';
import {
  fetchConsolidatedGitHubPortfolio,
  sanitizeDiscoveredScreenshots,
  clearAllGitHubLocalCache,
  type GitHubRepo,
} from './services/githubService';
import {
  parseCvAndLinkedinProfile,
  type ParsedProfileData,
} from './services/cvParserService';
import { Navbar, NavTab } from './components/Navbar';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { CustomCursor } from './components/CustomCursor';
import { HeroSection } from './components/HeroSection';
import { OverviewProjectsPreview } from './components/OverviewProjectsPreview';
import { AboutSection } from './components/AboutSection';
import { HowIWorkSection } from './components/HowIWorkSection';
import type { MeetingType } from './components/BookingMeetingModal';
import { ThemeRevealOverlay } from './components/ThemeRevealOverlay';
import { BrandLogoMark } from './components/BrandLogoMark';
import { PageSkeletonLoader } from './components/PageSkeletonLoader';
import { OpeningBootOverlay } from './components/OpeningBootOverlay';
import { LanguageTransitionOverlay } from './components/LanguageTransitionOverlay';
import { preloadImageUrls } from './components/ImageWithSkeleton';
import { VERIFIED_REPO_SCREENSHOTS } from './services/githubService';
import { Github, Linkedin, Youtube, Mail, RefreshCw, ArrowUp, Terminal, Sparkles } from 'lucide-react';
import { WhatsAppLogo, TikTokLogo } from './components/TechLogos';
import { useLanguage } from './context/LanguageContext';

// Shared module loaders so both React.lazy and idle/hover prefetch reuse exact promises
const loadProjectsSection = () =>
  import('./components/ProjectsSection').then((m) => ({ default: m.ProjectsSection }));
const loadExperienceSection = () =>
  import('./components/ExperienceSection').then((m) => ({ default: m.ExperienceSection }));
const loadStackSection = () =>
  import('./components/StackSection').then((m) => ({ default: m.StackSection }));
const loadContactSection = () =>
  import('./components/ContactSection').then((m) => ({ default: m.ContactSection }));
const loadFAQSection = () =>
  import('./components/FAQSection').then((m) => ({ default: m.FAQSection }));
const loadTerminalModal = () =>
  import('./components/TerminalEasterEggModal').then((m) => ({ default: m.TerminalEasterEggModal }));
const loadContactModal = () =>
  import('./components/ContactModal').then((m) => ({ default: m.ContactModal }));
const loadResumeModal = () =>
  import('./components/ResumeModal').then((m) => ({ default: m.ResumeModal }));
const loadBookingModal = () =>
  import('./components/BookingMeetingModal').then((m) => ({ default: m.BookingMeetingModal }));
const loadProjectDetailsModal = () =>
  import('./components/ProjectDetailsModal').then((m) => ({ default: m.ProjectDetailsModal }));

// Lazy-load secondary views & modals for faster first-paint loading
const ProjectsSection = lazy(loadProjectsSection);
const ExperienceSection = lazy(loadExperienceSection);
const StackSection = lazy(loadStackSection);
const ContactSection = lazy(loadContactSection);
const FAQSection = lazy(loadFAQSection);
const TerminalEasterEggModal = lazy(loadTerminalModal);
const ContactModal = lazy(loadContactModal);
const ResumeModal = lazy(loadResumeModal);
const BookingMeetingModal = lazy(loadBookingModal);
const ProjectDetailsModal = lazy(loadProjectDetailsModal);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: true,
      refetchInterval: 1000 * 60 * 30,
    },
  },
});

function resolveInitialTab(): NavTab {
  if (typeof window === 'undefined') return 'overview';
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash === 'projects') return 'projects';
  if (hash === 'experience' || hash === 'stack') return 'experience';
  if (hash === 'contact' || hash === 'faq') return 'contact';
  return 'overview';
}

interface MappedStorePortfolio {
  repos: GitHubRepo[];
  repoCount: number;
  hasFallback: boolean;
}

function mapStorePortfolioPayload(raw: unknown): MappedStorePortfolio {
  try {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { repos: [], repoCount: FEATURED_PROJECTS.length, hasFallback: true };
    }
    const payload = raw as {
      repos?: unknown;
      stats?: { isFromCache?: boolean } | null;
      liveMediaMap?: unknown;
    };

    const rawRepos = Array.isArray(payload.repos) ? payload.repos : [];
    const safeRepos: GitHubRepo[] = rawRepos
      .filter(
        (repo): repo is GitHubRepo =>
          Boolean(repo) && typeof repo === 'object' && typeof (repo as GitHubRepo).name === 'string'
      )
      .map((repo) => ({
        ...repo,
        discoveredScreenshots: sanitizeDiscoveredScreenshots(repo.discoveredScreenshots),
      }));

    if (
      payload.liveMediaMap &&
      typeof payload.liveMediaMap === 'object' &&
      !Array.isArray(payload.liveMediaMap)
    ) {
      Object.values(payload.liveMediaMap as Record<string, any>).forEach((entry) => {
        if (entry && typeof entry === 'object' && Array.isArray(entry.discoveredScreenshots)) {
          entry.discoveredScreenshots = sanitizeDiscoveredScreenshots(entry.discoveredScreenshots);
        }
      });
    }

    if (safeRepos.length === 0) {
      return { repos: [], repoCount: FEATURED_PROJECTS.length, hasFallback: true };
    }

    return {
      repos: safeRepos,
      repoCount: safeRepos.length,
      hasFallback: Boolean(payload.stats?.isFromCache),
    };
  } catch {
    return { repos: [], repoCount: FEATURED_PROJECTS.length, hasFallback: true };
  }
}

export default function App() {
  const { lang, dir, t, isSwitchingLang, switchingTargetLang, completeLanguageSwitch } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<NavTab>(resolveInitialTab);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [bookingInitialType, setBookingInitialType] = useState<MeetingType | null>(null);
  const [heroInspectedProject, setHeroInspectedProject] = useState<Project | null>(null);
  const [heroInspectedScreenIndex, setHeroInspectedScreenIndex] = useState<number>(0);
  const [mountedModals, setMountedModals] = useState({
    contact: false,
    resume: false,
    booking: false,
    project: false,
    terminal: false,
  });

  useEffect(() => {
    if (isContactOpen && !mountedModals.contact) setMountedModals((m) => ({ ...m, contact: true }));
  }, [isContactOpen, mountedModals.contact]);
  useEffect(() => {
    if (isResumeOpen && !mountedModals.resume) setMountedModals((m) => ({ ...m, resume: true }));
  }, [isResumeOpen, mountedModals.resume]);
  useEffect(() => {
    if (isBookingOpen && !mountedModals.booking) setMountedModals((m) => ({ ...m, booking: true }));
  }, [isBookingOpen, mountedModals.booking]);
  useEffect(() => {
    if (heroInspectedProject && !mountedModals.project)
      setMountedModals((m) => ({ ...m, project: true }));
  }, [heroInspectedProject, mountedModals.project]);
  useEffect(() => {
    if (isTerminalOpen && !mountedModals.terminal)
      setMountedModals((m) => ({ ...m, terminal: true }));
  }, [isTerminalOpen, mountedModals.terminal]);
  const [liveRepoCount, setLiveRepoCount] = useState<number>(13);
  const [liveRepos, setLiveRepos] = useState<GitHubRepo[]>([]);
  const [storeDataFallback, setStoreDataFallback] = useState<boolean>(false);
  const [liveCvData, setLiveCvData] = useState<ParsedProfileData | null>(null);
  const [isRefreshingCv, setIsRefreshingCv] = useState<boolean>(false);
  const lastWebhookPushRef = useRef<string | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [egyptClock, setEgyptClock] = useState<string>(() => getEgyptLocalTime(lang));
  const [showInitialSplash, setShowInitialSplash] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const profile = DEFAULT_PROFILE;

  const openBookingModal = (type: MeetingType | null = null) => {
    setBookingInitialType(type);
    setIsBookingOpen(true);
  };

  const inspectHeroProjectSafely = useCallback(
    (rawProject: Project | null | undefined, screenIdx: number = 0) => {
      if (!rawProject) return;
      try {
        const cached = queryClient.getQueryData<any>([
          'github-consolidated',
          profile.githubUsername,
        ]);
        const safeRepo = (rawProject.repoName || rawProject.name || 'Revio').trim();
        const mediaMap =
          cached?.liveMediaMap &&
          typeof cached.liveMediaMap === 'object' &&
          !Array.isArray(cached.liveMediaMap)
            ? cached.liveMediaMap
            : undefined;
        const releaseMap =
          cached?.releasesMap &&
          typeof cached.releasesMap === 'object' &&
          !Array.isArray(cached.releasesMap)
            ? cached.releasesMap
            : undefined;
        const liveMedia =
          mediaMap?.[safeRepo] ||
          mediaMap?.[rawProject.name || ''] ||
          mediaMap?.[safeRepo.toLowerCase()];
        const liveRelease =
          releaseMap?.[safeRepo] ||
          releaseMap?.[safeRepo.toLowerCase()];

        const normalizedProject: Project = {
          ...rawProject,
          id: rawProject.id ?? safeRepo,
          name: rawProject.name || safeRepo,
          repoName: safeRepo,
          subtitle: rawProject.subtitle || '',
          description: rawProject.description || '',
          image: rawProject.image || '',
          technologies: Array.isArray(rawProject.technologies) ? rawProject.technologies : [],
          features: Array.isArray(rawProject.features) ? rawProject.features : [],
          hasApk: Boolean(
            rawProject.hasApk ||
              rawProject.links?.apkDownloadUrl ||
              liveRelease?.apkDownloadUrl ||
              liveMedia?.apkDownloadUrl
          ),
          links: {
            ...rawProject.links,
            github:
              rawProject.links?.github ||
              `https://github.com/${profile.githubUsername}/${safeRepo}`,
            googlePlay: liveMedia?.googlePlayUrl || rawProject.links?.googlePlay,
            liveDemoUrl: liveMedia?.liveDemoUrl || rawProject.links?.liveDemoUrl,
            playlistUrl: liveMedia?.playlistUrl || rawProject.links?.playlistUrl,
            apkDownloadUrl:
              liveRelease?.apkDownloadUrl ||
              liveMedia?.apkDownloadUrl ||
              rawProject.links?.apkDownloadUrl,
            releaseUrl:
              liveRelease?.releaseUrl ||
              liveMedia?.releaseUrl ||
              rawProject.links?.releaseUrl,
          },
        };

        setHeroInspectedScreenIndex(
          typeof screenIdx === 'number' && Number.isFinite(screenIdx) && screenIdx >= 0
            ? Math.trunc(screenIdx)
            : 0
        );
        setHeroInspectedProject(normalizedProject);
      } catch {
        setHeroInspectedScreenIndex(0);
        setHeroInspectedProject(rawProject);
      }
    },
    [profile.githubUsername]
  );

  const handleInspectRevio = () => {
    const revio = FEATURED_PROJECTS.find((p) => p.repoName.toLowerCase() === 'revio');
    if (revio) {
      inspectHeroProjectSafely(revio, 0);
    } else {
      handleNavigate('projects');
    }
  };

  const handleRefreshCvOnly = useCallback(async () => {
    setIsRefreshingCv(true);
    try {
      const parsedCv = await parseCvAndLinkedinProfile(
        profile.cvDriveUrl,
        profile.linkedinUrl,
        true
      );
      setLiveCvData(parsedCv);
    } catch {
      // ignore offline
    } finally {
      setIsRefreshingCv(false);
    }
  }, [profile.cvDriveUrl, profile.linkedinUrl]);

  const handleManualRefresh = useCallback(async () => {
    setIsSyncing(true);
    try {
      clearAllGitHubLocalCache();
      const [fresh, parsedCv] = await Promise.all([
        fetchConsolidatedGitHubPortfolio(profile.githubUsername, true),
        parseCvAndLinkedinProfile(profile.cvDriveUrl, profile.linkedinUrl, true).catch(() => null),
      ]);
      queryClient.setQueryData(['github-consolidated', profile.githubUsername], fresh);
      const mapped = mapStorePortfolioPayload(fresh);
      if (mapped.repos.length > 0) {
        setLiveRepos(mapped.repos);
        setLiveRepoCount(mapped.repoCount);
      }
      setStoreDataFallback(mapped.hasFallback);
      if (parsedCv) {
        setLiveCvData(parsedCv);
      }
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setStoreDataFallback(true);
    } finally {
      setTimeout(() => setIsSyncing(false), 400);
    }
  }, [profile.githubUsername, profile.cvDriveUrl, profile.linkedinUrl]);

  // Theme state with localStorage persistence (Obsidian Dark default)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ahmed_portfolio_theme');
      if (saved) return saved === 'dark';
    }
    return true;
  });

  const applyThemeToDom = (dark: boolean) => {
    localStorage.setItem('ahmed_portfolio_theme', dark ? 'dark' : 'light');
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  useEffect(() => {
    applyThemeToDom(isDark);
  }, [isDark]);

  const handleSkipIntro = useCallback(() => {
    setShowInitialSplash(false);
  }, []);

  // Pre-warm primary Hero portrait & showcase cover during initial load
  useEffect(() => {
    const revioFirst = VERIFIED_REPO_SCREENSHOTS.Revio?.[0];
    preloadImageUrls([DEFAULT_PROFILE.avatarUrl, ...(revioFirst ? [revioFirst] : [])]);
  }, []);

  // Keep Egypt local time fresh
  useEffect(() => {
    setEgyptClock(getEgyptLocalTime(lang));
    const interval = setInterval(() => {
      setEgyptClock(getEgyptLocalTime(lang));
    }, 30000);
    return () => clearInterval(interval);
  }, [lang]);

  // Read automated sync timestamp from /last-updated.json
  useEffect(() => {
    let active = true;
    fetch('/last-updated.json', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { lastUpdated?: string } | null) => {
        if (!active || !data?.lastUpdated) return;
        const parsed = new Date(data.lastUpdated);
        if (Number.isNaN(parsed.getTime())) return;
        const formatted = parsed.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
          month: 'short',
          day: 'numeric',
        });
        setLastSyncTime(formatted);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [lang]);

  // Global CLI Easter Egg listener: typing "ahmed" outside input/textarea
  useEffect(() => {
    let buffer = '';
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;

      buffer = (buffer + e.key.toLowerCase()).slice(-5);
      if (buffer === 'ahmed') {
        buffer = '';
        setIsTerminalOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);


  type ViewTransitionLike = {
    ready: Promise<void>;
    finished: Promise<void>;
    skipTransition: () => void;
  };

  const activeTransitionRef = useRef<ViewTransitionLike | null>(null);
  const [revealOrigin, setRevealOrigin] = useState<{ x: number; y: number } | null>(null);
  const [isTransitioningTheme, setIsTransitioningTheme] = useState(false);
  const [targetIsDark, setTargetIsDark] = useState(isDark);
  const [fallbackKey, setFallbackKey] = useState(0);

  const handleToggleTheme = (e?: React.MouseEvent<HTMLButtonElement>) => {
    // 1. Exact button center coordinates (desktop & mobile)
    let x = typeof window !== 'undefined' ? window.innerWidth - 60 : 0;
    let y = 32;
    if (e?.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else if (e) {
      x = e.clientX;
      y = e.clientY;
    }

    // 2. Target theme (safe on rapid consecutive clicks)
    const nextDark = isTransitioningTheme ? !targetIsDark : !isDark;

    // 3. Cancel any in-flight View Transition or fallback overlay immediately
    if (activeTransitionRef.current) {
      try {
        activeTransitionRef.current.skipTransition();
      } catch {}
      activeTransitionRef.current = null;
    }
    if (isTransitioningTheme) {
      setIsTransitioningTheme(false);
    }

    // 4. Accessibility prefers-reduced-motion check
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      applyThemeToDom(nextDark);
      setIsDark(nextDark);
      return;
    }

    // 5. Primary path: Browser View Transitions API
    const doc = document as unknown as {
      startViewTransition?: (updateCallback: () => void) => ViewTransitionLike;
    };

    if (typeof doc.startViewTransition === 'function') {
      document.documentElement.classList.add('theme-switching');

      const transition = doc.startViewTransition(() => {
        flushSync(() => {
          applyThemeToDom(nextDark);
          setIsDark(nextDark);
        });
      });

      activeTransitionRef.current = transition;

      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      transition.ready
        .then(() => {
          if (activeTransitionRef.current !== transition) return;
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${maxRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 680,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              fill: 'both',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        })
        .catch(() => {});

      transition.finished
        .catch(() => {})
        .finally(() => {
          if (activeTransitionRef.current === transition) {
            activeTransitionRef.current = null;
            document.documentElement.classList.remove('theme-switching');
          }
        });
      return;
    }

    // 6. CSS Fallback for unsupported browsers
    setRevealOrigin({ x, y });
    setTargetIsDark(nextDark);
    setFallbackKey((prev) => prev + 1);
    setIsTransitioningTheme(true);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 360);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Single consolidated GitHub prefetch + CV Drive live sync + first 4 project covers
  useEffect(() => {
    parseCvAndLinkedinProfile(profile.cvDriveUrl, profile.linkedinUrl)
      .then((parsed) => setLiveCvData(parsed))
      .catch(() => {});

    queryClient
      .prefetchQuery({
        queryKey: ['github-consolidated', profile.githubUsername],
        queryFn: async () => {
          try {
            return await fetchConsolidatedGitHubPortfolio(profile.githubUsername);
          } catch {
            return null;
          }
        },
        staleTime: 1000 * 60 * 5,
      })
      .then(() => {
        try {
          const cached = queryClient.getQueryData<any>([
            'github-consolidated',
            profile.githubUsername,
          ]);
          const mapped = mapStorePortfolioPayload(cached);
          if (mapped.repos.length > 0) {
            setLiveRepos(mapped.repos);
            setLiveRepoCount(mapped.repoCount);
          }
          setStoreDataFallback(mapped.hasFallback);
        } catch {
          setStoreDataFallback(true);
        }
      })
      .catch(() => {
        setStoreDataFallback(true);
      });

    preloadImageUrls(FEATURED_PROJECTS.slice(0, 4).map((proj) => proj.image).filter(Boolean));
  }, [profile.githubUsername, profile.cvDriveUrl, profile.linkedinUrl]);

  // Automatic webhook push detection: refetch automatically when GitHub pushes update /api/github/status
  useEffect(() => {
    let active = true;
    const checkWebhookUpdates = async () => {
      if (!active || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
      try {
        const res = await fetch('/api/github/status', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const pushTs = data?.lastPushTimestamp;
        if (!pushTs) return;
        if (lastWebhookPushRef.current === null) {
          lastWebhookPushRef.current = pushTs;
          return;
        }
        if (lastWebhookPushRef.current !== pushTs) {
          lastWebhookPushRef.current = pushTs;
          await handleManualRefresh();
        }
      } catch {
        // Silent no-op on static deployments without Express server
      }
    };

    checkWebhookUpdates();
    const interval = setInterval(checkWebhookUpdates, 1000 * 60 * 5);
    const onFocus = () => {
      checkWebhookUpdates();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [handleManualRefresh]);

  // Sync URL hash changes
  useEffect(() => {
    const onHashChange = () => {
      setActiveTab(resolveInitialTab());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const prefetchTab = useCallback((tab: NavTab) => {
    if (tab === 'projects') {
      loadProjectsSection().catch(() => {});
    } else if (tab === 'experience') {
      loadExperienceSection().catch(() => {});
      loadStackSection().catch(() => {});
    } else if (tab === 'contact') {
      loadContactSection().catch(() => {});
      loadFAQSection().catch(() => {});
    }
  }, []);

  // Preload secondary views & global modals silently during idle time
  useEffect(() => {
    const timer = setTimeout(() => {
      loadExperienceSection().catch(() => {});
      loadStackSection().catch(() => {});
      loadProjectsSection().catch(() => {});
      loadContactSection().catch(() => {});
      loadFAQSection().catch(() => {});
      loadContactModal().catch(() => {});
      loadResumeModal().catch(() => {});
      loadBookingModal().catch(() => {});
      loadProjectDetailsModal().catch(() => {});
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (tab: NavTab) => {
    prefetchTab(tab);
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const targetHash = `#${tab}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', targetHash);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const anyModalOpen =
    isResumeOpen ||
    isContactOpen ||
    isBookingOpen ||
    isTerminalOpen ||
    Boolean(heroInspectedProject);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen relative flex flex-col justify-between selection:bg-[#00C7FF] selection:text-[#08090d] bg-[#f8fafc] dark:bg-[#08090d] text-slate-900 dark:text-[#f1f5f9] transition-colors duration-200">
        {/* Subtle Architectural Grid/Dot Canvas Layer (~4% opacity, soft vignette edges) */}
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-architectural-grid pointer-events-none z-0"
        />

        {/* Keyboard Accessibility Skip Link */}
        <a href="#main-content" className="skip-to-main">
          {lang === 'ar' ? 'انتقل إلى المحتوى الرئيسي' : 'Skip to main content'}
        </a>

        {/* Top Reading Progress Bar */}
        <ScrollProgressBar activeTab={activeTab} />

        {/* Interactive Cursor */}
        <CustomCursor />

        {/* Opening Boot Overlay (Fixed above pre-mounted page; two crisp leaf cycles, no skip) */}
        <AnimatePresence>
          {showInitialSplash && (
            <OpeningBootOverlay isDark={isDark} onComplete={handleSkipIntro} />
          )}
        </AnimatePresence>

        {/* Full-Viewport Language Switch Curtain (Covers Header, Bottom Dock, Main & Footer atomically) */}
        <AnimatePresence>
          {isSwitchingLang && (
            <LanguageTransitionOverlay
              targetLang={switchingTargetLang}
              isDark={isDark}
              onComplete={completeLanguageSwitch}
            />
          )}
        </AnimatePresence>

        {/* 3-Zone Header Navigation + Mobile Bottom Dock */}
        <Navbar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onPrefetchTab={prefetchTab}
          onOpenResume={() => setIsResumeOpen(true)}
          onOpenBooking={() => openBookingModal(null)}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          isAnyModalOpen={anyModalOpen}
        />

        {/* Focused Multi-View Main Stage with Atomic Language/Dir Sync & Full-Height Suspense */}
        <main id="main-content" className="relative z-10 flex-1 min-h-dvh pb-24 md:pb-12">
          <div key={`stage-${lang}`} dir={dir} className="w-full">
            {activeTab === 'overview' && (
              <motion.div
                key="view-overview"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <HeroSection
                  profile={profile}
                  isDark={isDark}
                  entryReady={!showInitialSplash}
                  onOpenContact={() => setIsContactOpen(true)}
                  onOpenResume={() => setIsResumeOpen(true)}
                  onOpenBooking={() => openBookingModal(null)}
                  onExploreProjects={() => handleNavigate('projects')}
                  onInspectRevio={handleInspectRevio}
                  onInspectProject={inspectHeroProjectSafely}
                  totalReposCount={liveRepoCount}
                  isStoreFallback={storeDataFallback}
                  onRetryStoreSync={handleManualRefresh}
                />
                <AboutSection onExploreExperience={() => handleNavigate('experience')} />
                <OverviewProjectsPreview
                  githubUsername={profile.githubUsername}
                  onExploreAllProjects={() => handleNavigate('projects')}
                />
                <HowIWorkSection
                  onOpenBooking={() => openBookingModal('discovery-cal')}
                  onExploreProjects={() => handleNavigate('projects')}
                />
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div
                key="view-projects"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Suspense
                  fallback={
                    <PageSkeletonLoader
                      view="projects"
                      isDark={isDark}
                      fullScreen={true}
                      showProgress={true}
                    />
                  }
                >
                  <ProjectsSection
                    currentGithubUser={profile.githubUsername}
                    onRepoCountChange={setLiveRepoCount}
                    isDark={isDark}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'experience' && (
              <motion.div
                key="view-experience"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Suspense
                  fallback={
                    <PageSkeletonLoader
                      view="experience"
                      isDark={isDark}
                      fullScreen={true}
                      showProgress={true}
                    />
                  }
                >
                  <ExperienceSection onOpenResume={() => setIsResumeOpen(true)} />
                  <StackSection />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'contact' && (
              <motion.div
                key="view-contact"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Suspense
                  fallback={
                    <PageSkeletonLoader
                      view="contact"
                      isDark={isDark}
                      fullScreen={true}
                      showProgress={true}
                    />
                  }
                >
                  <ContactSection
                    profile={profile}
                    onOpenBooking={openBookingModal}
                    onOpenResume={() => setIsResumeOpen(true)}
                  />
                  <FAQSection />
                </Suspense>
              </motion.div>
            )}
          </div>
        </main>

        {/* Circular Reveal Theme Switcher CSS Fallback */}
        {isTransitioningTheme && (
          <ThemeRevealOverlay
            key={fallbackKey}
            targetIsDark={targetIsDark}
            origin={revealOrigin}
            onThemeApply={() => {
              document.documentElement.classList.add('theme-switching');
              applyThemeToDom(targetIsDark);
              setIsDark(targetIsDark);
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  document.documentElement.classList.remove('theme-switching');
                });
              });
            }}
            onFinish={() => setIsTransitioningTheme(false)}
          />
        )}

        {/* Global Lazy-Loaded Modals (mounted once opened so exit AnimatePresence stays intact) */}
        <Suspense fallback={null}>
          {mountedModals.contact && (
            <ContactModal
              isOpen={isContactOpen}
              onClose={() => setIsContactOpen(false)}
              profile={profile}
              onOpenBooking={() => {
                setIsContactOpen(false);
                openBookingModal(null);
              }}
            />
          )}

          {mountedModals.resume && (
            <ResumeModal
              isOpen={isResumeOpen}
              onClose={() => setIsResumeOpen(false)}
              profile={profile}
              liveCvData={liveCvData}
              liveRepos={liveRepos}
              onRefreshCv={handleRefreshCvOnly}
              isRefreshingCv={isRefreshingCv}
            />
          )}

          {mountedModals.booking && (
            <BookingMeetingModal
              isOpen={isBookingOpen}
              onClose={() => setIsBookingOpen(false)}
              profile={profile}
              initialType={bookingInitialType}
            />
          )}

          {mountedModals.project && (
            <ProjectDetailsModal
              isOpen={Boolean(heroInspectedProject)}
              onClose={() => {
                setHeroInspectedProject(null);
                setHeroInspectedScreenIndex(0);
              }}
              project={heroInspectedProject}
              initialScreenIndex={heroInspectedScreenIndex}
            />
          )}

          {mountedModals.terminal && (
            <TerminalEasterEggModal
              isOpen={isTerminalOpen}
              onClose={() => setIsTerminalOpen(false)}
              onNavigateTab={handleNavigate}
            />
          )}
        </Suspense>

        {/* Back to Top */}
        {showBackToTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 lg:bottom-6 end-4 sm:end-6 z-40 w-11 h-11 rounded-full bg-[#0284ff] hover:bg-[#0070e0] text-white shadow-lg shadow-[#0284ff]/30 transition-transform duration-200 hover:scale-105 cursor-pointer border border-white/20 flex items-center justify-center"
            aria-label={lang === 'ar' ? 'الرجوع للأعلى' : 'Back to top'}
            title={lang === 'ar' ? 'الرجوع للأعلى' : 'Back to top'}
          >
            <ArrowUp size={16} />
          </button>
        )}

        {/* Clean Responsive Obsidian / Light Studio Glass Footer */}
        <footer className="relative z-10 w-full border-t border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0d1017]/90 backdrop-blur-md pt-8 pb-28 lg:pb-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-600 dark:text-[#94a3b8] transition-colors">
          <div className="max-w-[1440px] mx-auto flex flex-col gap-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-5">
              {/* Brand Identity + Live Sync Status (Left / Top) */}
              <div className="lg:col-span-5 flex flex-col sm:flex-row items-center lg:items-start gap-3.5 text-center sm:text-start">
                <BrandLogoMark sizeClassName="w-10 h-10 shrink-0" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-0.5">
                    <span className="font-extrabold text-slate-900 dark:text-[#f1f5f9] text-sm tracking-tight">
                      {AHMED_CONFIG.name[lang]}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                    <span className="text-[#0369a1] dark:text-[#38bdf8] font-mono text-xs font-semibold">
                      {AHMED_CONFIG.title[lang]}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1 mt-1.5 font-mono text-[11px] tabular-nums text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {isOnline
                        ? lang === 'ar'
                          ? 'متصل ومحدّث'
                          : 'Online'
                        : lang === 'ar'
                        ? 'أوفلاين'
                        : 'Cached Offline'}
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                    <span>
                      {t.footer.lastSynced}: {lastSyncTime}
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                    <span>
                      {lang === 'ar' ? `القاهرة ${egyptClock}` : `Cairo ${egyptClock}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Controls: Refresh Cache + Interactive AI CLI (Center) */}
              <div className="lg:col-span-4 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isSyncing}
                  className="btn-kinetic flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#151a26] hover:bg-slate-100 dark:hover:bg-[#1c2333] text-slate-800 dark:text-[#f1f5f9] border border-slate-200 dark:border-white/10 text-xs font-mono font-semibold transition-all cursor-pointer disabled:opacity-50 min-h-[44px] sm:min-h-[38px]"
                  title="Refresh GitHub repository & Play stats cache"
                >
                  <RefreshCw
                    size={13}
                    className={isSyncing ? 'animate-spin text-[#0284ff]' : 'text-slate-500 dark:text-slate-400'}
                  />
                  <span>
                    {isSyncing
                      ? lang === 'ar'
                        ? 'جارٍ التحديث...'
                        : 'Syncing...'
                      : t.footer.refreshData}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTerminalOpen(true)}
                  className="btn-kinetic flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0284ff]/10 dark:bg-[#0284ff]/15 hover:bg-[#0284ff]/18 dark:hover:bg-[#0284ff]/25 text-[#0369a1] dark:text-[#7DD3FC] border border-[#0284ff]/35 dark:border-[#38bdf8]/35 hover:border-[#0284ff]/70 text-xs font-mono font-bold transition-all cursor-pointer min-h-[44px] sm:min-h-[38px] shadow-xs"
                  title="Open AI-Powered Developer CLI Inspector"
                  aria-label="Open Developer AI CLI"
                >
                  <Terminal size={13} className="text-[#0369a1] dark:text-[#38bdf8]" />
                  <span>{lang === 'ar' ? 'الطرفية AI CLI' : 'AI CLI'}</span>
                  <Sparkles size={11} className="text-[#0369a1] dark:text-[#38bdf8]" />
                </button>
              </div>

              {/* Social Links Row (Right / Bottom) */}
              <div className="lg:col-span-3 flex flex-wrap items-center justify-center lg:justify-end gap-2">
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl bg-slate-50 dark:bg-[#151a26] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:border-slate-400 dark:hover:border-white/25 hover:text-slate-900 dark:hover:text-white transition-all"
                  title="GitHub"
                  aria-label="GitHub"
                >
                  <Github size={15} />
                </a>
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl bg-slate-50 dark:bg-[#151a26] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:border-[#0284ff]/50 hover:text-[#0284ff] transition-all"
                  title="LinkedIn"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={15} />
                </a>
                <a
                  href={profile.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl bg-slate-50 dark:bg-[#151a26] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:border-red-500/40 hover:text-red-500 transition-all"
                  title="YouTube"
                  aria-label="YouTube"
                >
                  <Youtube size={15} />
                </a>
                <a
                  href={profile.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl bg-slate-50 dark:bg-[#151a26] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:border-pink-500/40 hover:text-pink-500 transition-all"
                  title="TikTok"
                  aria-label="TikTok"
                >
                  <TikTokLogo size={14} />
                </a>
                <a
                  href={AHMED_CONFIG.socials.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl bg-slate-50 dark:bg-[#151a26] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:border-emerald-500/40 hover:text-emerald-500 transition-all"
                  title="WhatsApp"
                  aria-label="WhatsApp"
                >
                  <WhatsAppLogo size={15} />
                </a>
                <button
                  type="button"
                  onClick={() => openEmailClient(profile.email, 'Mobile App Project Inquiry')}
                  className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl bg-slate-50 dark:bg-[#151a26] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:border-[#0284ff]/50 hover:text-[#0284ff] transition-all cursor-pointer"
                  title="Send Email"
                  aria-label="Send Email"
                >
                  <Mail size={14} />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/80 dark:border-white/8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 dark:text-[#94a3b8] gap-2 text-center sm:text-start">
              <span>© {new Date().getFullYear()} {AHMED_CONFIG.name[lang]} · {t.footer.rights}</span>
              <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                {AHMED_CONFIG.location[lang]} · {t.footer.builtWith}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
