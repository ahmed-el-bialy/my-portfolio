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
import { Github, Linkedin, Youtube, Mail, RefreshCw, ArrowUp, Terminal } from 'lucide-react';
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
  const { lang, dir, t } = useLanguage();
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
  const [egyptClock, setEgyptClock] = useState<string>(() => getEgyptLocalTime(lang));

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

    FEATURED_PROJECTS.slice(0, 3).forEach((proj) => {
      if (proj.image) {
        const img = new Image();
        img.src = proj.image;
      }
    });
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

        {/* Focused Multi-View Main Stage with Smooth Bilingual Crossfade */}
        <main id="main-content" className="flex-1 pb-24 md:pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={lang}
              dir={dir}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
                  <Suspense fallback={<PageSkeletonLoader view="projects" />}>
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
                  <Suspense fallback={<PageSkeletonLoader view="experience" />}>
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
                  <Suspense fallback={<PageSkeletonLoader view="contact" />}>
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
            className="fixed bottom-20 lg:bottom-6 end-4 sm:end-6 z-40 p-2.5 sm:p-3 rounded-full bg-[#027DFD] hover:bg-[#026ae0] text-white shadow-lg transition-transform duration-200 hover:scale-105 cursor-pointer border border-white/20 flex items-center justify-center"
            aria-label={lang === 'ar' ? 'الرجوع للأعلى' : 'Back to top'}
            title={lang === 'ar' ? 'الرجوع للأعلى' : 'Back to top'}
          >
            <ArrowUp size={16} />
          </button>
        )}

        {/* Clean Obsidian / Light Studio Footer */}
        <footer className="w-full border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] pt-8 pb-24 md:pb-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-600 dark:text-[#94a3b8] transition-colors">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-start">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  <BrandLogoMark sizeClassName="w-8 h-8" />
                  <span className="font-bold text-slate-900 dark:text-[#f1f5f9] text-sm">
                    {AHMED_CONFIG.name[lang]}
                  </span>
                  <span className="text-slate-500 dark:text-[#94a3b8] font-mono text-xs">
                    · {AHMED_CONFIG.title[lang]}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5 font-mono text-[11px] tabular-nums">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    {isOnline
                      ? lang === 'ar'
                        ? 'متصل'
                        : 'Online'
                      : lang === 'ar'
                      ? 'وضع الأوفلاين'
                      : 'Cached Offline'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {t.footer.lastSynced}: {lastSyncTime}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {lang === 'ar' ? `توقيت القاهرة: ${egyptClock}` : `Cairo: ${egyptClock}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isSyncing}
                  className="btn-kinetic flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#161b27] hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-[#f1f5f9] border border-slate-200 dark:border-white/10 text-xs font-mono font-medium transition-colors cursor-pointer disabled:opacity-50"
                  title="Refresh GitHub repository cache"
                >
                  <RefreshCw
                    size={12}
                    className={isSyncing ? 'animate-spin text-[#027DFD]' : 'text-slate-500'}
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
                  className="btn-kinetic flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#161b27] hover:border-[#027DFD] text-slate-700 dark:text-[#94a3b8] border border-slate-200 dark:border-white/10 text-xs font-mono transition-colors cursor-pointer"
                  title="Open Terminal Inspector (or type ahmed)"
                  aria-label="Open CLI Inspector"
                >
                  <Terminal size={12} className="text-[#027DFD] dark:text-[#00C7FF]" />
                  <span>CLI</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:text-slate-900 dark:hover:text-white transition-colors"
                title="GitHub"
              >
                <Github size={15} />
              </a>
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:text-[#027DFD] transition-colors"
                title="LinkedIn"
              >
                <Linkedin size={15} />
              </a>
              <a
                href={profile.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:text-red-500 transition-colors"
                title="YouTube"
              >
                <Youtube size={15} />
              </a>
              <a
                href={profile.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:text-pink-500 transition-colors"
                title="TikTok"
              >
                <TikTokLogo size={14} />
              </a>
              <a
                href={AHMED_CONFIG.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:text-emerald-500 transition-colors"
                title="WhatsApp"
              >
                <WhatsAppLogo size={15} />
              </a>
              <button
                type="button"
                onClick={() => openEmailClient(profile.email, 'Mobile App Project Inquiry')}
                className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:text-[#027DFD] transition-colors cursor-pointer"
                title="Send Email"
              >
                <Mail size={14} />
              </button>
            </div>
          </div>

          <div className="max-w-[1440px] mx-auto mt-6 pt-4 border-t border-slate-200 dark:border-white/8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-[#94a3b8] gap-2">
            <span>{t.footer.rights}</span>
            <span>{t.footer.builtWith}</span>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
