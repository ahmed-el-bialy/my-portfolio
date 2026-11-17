import React, { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { DEFAULT_PROFILE, openEmailClient, FEATURED_PROJECTS, Project } from './data/portfolioData';
import { AHMED_CONFIG, getEgyptLocalTime } from './data/config';
import {
  fetchConsolidatedGitHubPortfolio,
  clearAllGitHubLocalCache,
} from './services/githubService';
import { parseCvAndLinkedinProfile } from './services/cvParserService';
import { Navbar, NavTab } from './components/Navbar';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { CustomCursor } from './components/CustomCursor';
import { HeroSection } from './components/HeroSection';
import { OverviewProjectsPreview } from './components/OverviewProjectsPreview';
import { AboutSection } from './components/AboutSection';
import { HowIWorkSection } from './components/HowIWorkSection';
import { ContactModal } from './components/ContactModal';
import { ResumeModal } from './components/ResumeModal';
import { BookingMeetingModal, MeetingType } from './components/BookingMeetingModal';
import { ProjectDetailsModal } from './components/ProjectDetailsModal';
import { ThemeRevealOverlay } from './components/ThemeRevealOverlay';
import { BrandLogoMark } from './components/BrandLogoMark';
import { PageSkeletonLoader } from './components/PageSkeletonLoader';
import { LEAF_ENTRY_DURATION_MS } from './components/LeafAnimation';
import { preloadImageUrls } from './components/ImageWithSkeleton';
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

// Lazy-load secondary views & terminal modal for clean code splitting
const ProjectsSection = lazy(loadProjectsSection);
const ExperienceSection = lazy(loadExperienceSection);
const StackSection = lazy(loadStackSection);
const ContactSection = lazy(loadContactSection);
const FAQSection = lazy(loadFAQSection);
const TerminalEasterEggModal = lazy(loadTerminalModal);

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

export default function App() {
  const { lang, dir, t, isSwitchingLang, switchingTargetLang } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<NavTab>(resolveInitialTab);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [bookingInitialType, setBookingInitialType] = useState<MeetingType | null>(null);
  const [heroInspectedProject, setHeroInspectedProject] = useState<Project | null>(null);
  const [liveRepoCount, setLiveRepoCount] = useState<number>(13);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
const SESSION_INTRO_KEY = 'ahmed_portfolio_intro_seen_v1';

  const [egyptClock, setEgyptClock] = useState<string>(() => getEgyptLocalTime(lang));
  const [showInitialSplash, setShowInitialSplash] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    try {
      return window.sessionStorage.getItem(SESSION_INTRO_KEY) !== '1';
    } catch {
      return false;
    }
  });

  const profile = DEFAULT_PROFILE;

  const openBookingModal = (type: MeetingType | null = null) => {
    setBookingInitialType(type);
    setIsBookingOpen(true);
  };

  const handleInspectRevio = () => {
    const revio = FEATURED_PROJECTS.find((p) => p.repoName.toLowerCase() === 'revio');
    if (revio) {
      setHeroInspectedProject(revio);
    } else {
      handleNavigate('projects');
    }
  };

  const handleManualRefresh = async () => {
    setIsSyncing(true);
    try {
      clearAllGitHubLocalCache();
      const fresh = await fetchConsolidatedGitHubPortfolio(profile.githubUsername, true);
      queryClient.setQueryData(['github-consolidated', profile.githubUsername], fresh);
      setLiveRepoCount(fresh.repos.length || liveRepoCount);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      // ignore offline
    } finally {
      setTimeout(() => setIsSyncing(false), 400);
    }
  };

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
    try {
      window.sessionStorage.setItem(SESSION_INTRO_KEY, '1');
    } catch {
      // ignore storage failure in private browsing
    }
    setShowInitialSplash(false);
  }, []);

  // Smart Session Entry: plays once per session (~1.45s skippable); subsequent reloads open straight to Hero
  useEffect(() => {
    if (!showInitialSplash) return;
    const timer = window.setTimeout(() => {
      handleSkipIntro();
    }, LEAF_ENTRY_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [showInitialSplash, handleSkipIntro]);

  // Keep Egypt local time fresh
  useEffect(() => {
    setEgyptClock(getEgyptLocalTime(lang));
    const interval = setInterval(() => {
      setEgyptClock(getEgyptLocalTime(lang));
    }, 30000);
    return () => clearInterval(interval);
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

  // Single consolidated GitHub prefetch + CV metadata + first 3 project covers
  useEffect(() => {
    parseCvAndLinkedinProfile(profile.cvDriveUrl, profile.linkedinUrl).catch(() => {});

    queryClient
      .prefetchQuery({
        queryKey: ['github-consolidated', profile.githubUsername],
        queryFn: () => fetchConsolidatedGitHubPortfolio(profile.githubUsername),
        staleTime: 1000 * 60 * 30,
      })
      .then(() => {
        const cached = queryClient.getQueryData<any>([
          'github-consolidated',
          profile.githubUsername,
        ]);
        if (cached?.repos?.length) {
          setLiveRepoCount(cached.repos.length);
        }
      })
      .catch(() => {});

    preloadImageUrls(FEATURED_PROJECTS.slice(0, 4).map((proj) => proj.image).filter(Boolean));
  }, [profile.githubUsername, profile.cvDriveUrl, profile.linkedinUrl]);

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

  // Preload secondary route bundles silently during idle time so navigating to Experience/Projects/Contact is instant
  useEffect(() => {
    const timer = setTimeout(() => {
      loadExperienceSection().catch(() => {});
      loadStackSection().catch(() => {});
      loadProjectsSection().catch(() => {});
      loadContactSection().catch(() => {});
      loadFAQSection().catch(() => {});
    }, 450);
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

        {/* Focused Multi-View Main Stage with Unified Crossfade Transition */}
        <main id="main-content" className="relative z-10 flex-1 pb-28 md:pb-12">
          <AnimatePresence mode="wait">
            {showInitialSplash ? (
              <motion.div
                key="initial-leaf-stage"
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                <PageSkeletonLoader
                  view={activeTab}
                  isDark={isDark}
                  pacing="entry"
                  loop={false}
                  onSkip={handleSkipIntro}
                />
              </motion.div>
            ) : isSwitchingLang ? (
              <motion.div
                key="language-leaf-stage"
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                <PageSkeletonLoader
                  view="language"
                  targetLang={switchingTargetLang}
                  isDark={isDark}
                  pacing="artisan"
                  loop={false}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`stage-${lang}`}
                dir={dir}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
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
                      onOpenContact={() => setIsContactOpen(true)}
                      onOpenResume={() => setIsResumeOpen(true)}
                      onOpenBooking={() => openBookingModal(null)}
                      onExploreProjects={() => handleNavigate('projects')}
                      onInspectRevio={handleInspectRevio}
                      onInspectProject={(proj) => setHeroInspectedProject(proj)}
                      totalReposCount={liveRepoCount}
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
                    <Suspense fallback={<PageSkeletonLoader view="projects" isDark={isDark} />}>
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
                    <Suspense fallback={<PageSkeletonLoader view="experience" isDark={isDark} />}>
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
                    <Suspense fallback={<PageSkeletonLoader view="contact" isDark={isDark} />}>
                      <ContactSection
                        profile={profile}
                        onOpenBooking={openBookingModal}
                        onOpenResume={() => setIsResumeOpen(true)}
                      />
                      <FAQSection />
                    </Suspense>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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

        {/* Global Modals */}
        <ContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
          profile={profile}
          onOpenBooking={() => {
            setIsContactOpen(false);
            openBookingModal(null);
          }}
        />

        <ResumeModal
          isOpen={isResumeOpen}
          onClose={() => setIsResumeOpen(false)}
          profile={profile}
        />

        <BookingMeetingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          profile={profile}
          initialType={bookingInitialType}
        />

        <ProjectDetailsModal
          isOpen={Boolean(heroInspectedProject)}
          onClose={() => setHeroInspectedProject(null)}
          project={heroInspectedProject}
        />

        {isTerminalOpen && (
          <Suspense fallback={null}>
            <TerminalEasterEggModal
              isOpen={isTerminalOpen}
              onClose={() => setIsTerminalOpen(false)}
              onNavigateTab={handleNavigate}
            />
          </Suspense>
        )}

        {/* Back to Top */}
        {showBackToTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 lg:bottom-6 end-4 sm:end-6 z-40 p-2.5 sm:p-3 rounded-full bg-[#027DFD] hover:bg-[#026ae0] text-white shadow-lg transition-transform duration-200 hover:scale-105 cursor-pointer border border-white/20 flex items-center justify-center"
            aria-label={lang === 'ar' ? 'الرجوع للأعلى' : 'Back to top'}
            title={lang === 'ar' ? 'الرجوع للأعلى' : 'Back to top'}
          >
            <ArrowUp size={16} />
          </button>
        )}

        {/* Clean Responsive Obsidian / Light Studio Footer */}
        <footer className="relative z-10 w-full border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0d1017]/95 backdrop-blur-sm pt-8 pb-28 lg:pb-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-600 dark:text-[#94a3b8] transition-colors">
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
                    <span className="text-[#027DFD] dark:text-[#00C7FF] font-mono text-xs font-semibold">
                      {AHMED_CONFIG.title[lang]}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1 mt-1.5 font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
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
                  className="btn-kinetic flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#151a26] hover:bg-slate-100 dark:hover:bg-[#1c2333] text-slate-800 dark:text-[#f1f5f9] border border-slate-200 dark:border-white/10 text-xs font-mono font-semibold transition-all cursor-pointer disabled:opacity-50 min-h-[38px]"
                  title="Refresh GitHub repository & Play stats cache"
                >
                  <RefreshCw
                    size={13}
                    className={isSyncing ? 'animate-spin text-[#027DFD]' : 'text-slate-500 dark:text-slate-400'}
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
                  className="btn-kinetic flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#027DFD]/10 dark:bg-[#027DFD]/15 hover:bg-[#027DFD]/18 dark:hover:bg-[#027DFD]/25 text-[#027DFD] dark:text-[#7DD3FC] border border-[#027DFD]/35 dark:border-[#00C7FF]/35 hover:border-[#00C7FF]/70 text-xs font-mono font-bold transition-all cursor-pointer min-h-[38px] shadow-xs"
                  title="Open AI-Powered Developer CLI Inspector"
                  aria-label="Open Developer AI CLI"
                >
                  <Terminal size={13} className="text-[#027DFD] dark:text-[#00C7FF]" />
                  <span>{lang === 'ar' ? 'الطرفية AI CLI' : 'AI CLI'}</span>
                  <Sparkles size={11} className="text-[#027DFD] dark:text-[#00C7FF]" />
                </button>
              </div>

              {/* Social Links Row (Right / Bottom) */}
              <div className="lg:col-span-3 flex flex-wrap items-center justify-center lg:justify-end gap-2">
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-[#151a26] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:border-slate-400 dark:hover:border-white/25 hover:text-slate-900 dark:hover:text-white transition-all"
                  title="GitHub"
                  aria-label="GitHub"
                >
                  <Github size={15} />
                </a>
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-[#151a26] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:border-[#027DFD]/50 hover:text-[#027DFD] transition-all"
                  title="LinkedIn"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={15} />
                </a>
                <a
                  href={profile.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-[#151a26] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:border-red-500/40 hover:text-red-500 transition-all"
                  title="YouTube"
                  aria-label="YouTube"
                >
                  <Youtube size={15} />
                </a>
                <a
                  href={profile.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-[#151a26] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:border-pink-500/40 hover:text-pink-500 transition-all"
                  title="TikTok"
                  aria-label="TikTok"
                >
                  <TikTokLogo size={14} />
                </a>
                <a
                  href={AHMED_CONFIG.socials.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-[#151a26] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:border-emerald-500/40 hover:text-emerald-500 transition-all"
                  title="WhatsApp"
                  aria-label="WhatsApp"
                >
                  <WhatsAppLogo size={15} />
                </a>
                <button
                  type="button"
                  onClick={() => openEmailClient(profile.email, 'Mobile App Project Inquiry')}
                  className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-[#151a26] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:border-[#027DFD]/50 hover:text-[#027DFD] transition-all cursor-pointer"
                  title="Send Email"
                  aria-label="Send Email"
                >
                  <Mail size={14} />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/80 dark:border-white/8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-[#94a3b8] gap-2 text-center sm:text-start">
              <span>© {new Date().getFullYear()} {AHMED_CONFIG.name[lang]} · {t.footer.rights}</span>
              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                {AHMED_CONFIG.location[lang]} · {t.footer.builtWith}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
