import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DEFAULT_PROFILE, openEmailClient, FEATURED_PROJECTS } from './data/portfolioData';
import { fetchGitHubUserStats, clearAllGitHubLocalCache } from './services/githubService';
import { Navbar, NavTab } from './components/Navbar';
import { VerticalNavRail } from './components/VerticalNavRail';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { CustomCursor } from './components/CustomCursor';
import { SectionDivider } from './components/SectionDivider';
import { HeroSection } from './components/HeroSection';
import { StackSection } from './components/StackSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ContactSection } from './components/ContactSection';
import { ContactModal } from './components/ContactModal';
import { ResumeModal } from './components/ResumeModal';
import { BookingMeetingModal } from './components/BookingMeetingModal';
import { RevealOnScroll } from './components/RevealOnScroll';
import { ShieldCheck, Github, Linkedin, Youtube, Mail, RefreshCw, Radio } from 'lucide-react';
import { WhatsAppLogo, TikTokLogo } from './components/TechLogos';
import { useLanguage } from './context/LanguageContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes stale time
      gcTime: 1000 * 60 * 30, // 30 minutes cache retention
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const { lang, dir, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<NavTab>('hero');
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [liveRepoCount, setLiveRepoCount] = useState<number>(13);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleManualRefresh = async () => {
    setIsSyncing(true);
    try {
      clearAllGitHubLocalCache();
      await queryClient.invalidateQueries();
      await queryClient.refetchQueries();
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // Theme state with localStorage persistence
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ahmed_portfolio_theme');
      if (saved) return saved === 'dark';
    }
    return true;
  });

  const profile = DEFAULT_PROFILE;

  // Dark / light theme switcher
  useEffect(() => {
    localStorage.setItem('ahmed_portfolio_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDark]);

  // Online / Offline listener
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

  // Automatic Initial Mount Data & Asset Prefetching
  useEffect(() => {
    // 1. Prefetch GitHub User Stats & Repositories immediately
    queryClient.prefetchQuery({
      queryKey: ['github-data', profile.githubUsername],
      queryFn: () => fetchGitHubUserStats(profile.githubUsername),
      staleTime: 1000 * 60 * 5,
    });

    // 2. Preload high-priority cover images in background
    FEATURED_PROJECTS.slice(0, 3).forEach((proj) => {
      if (proj.image) {
        const img = new Image();
        img.src = proj.image;
      }
    });
  }, [profile.githubUsername]);

  // Initial loading indicator
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // Automatic ScrollSpy
  useEffect(() => {
    const sections: NavTab[] = ['hero', 'projects', 'stack', 'experience', 'contact'];
    
    const handleScroll = () => {
      const scrollThreshold = window.innerHeight * 0.4;
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= scrollThreshold) {
            setActiveTab(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll handler
  const handleNavigate = (tab: NavTab) => {
    setActiveTab(tab);
    const targetEl = document.getElementById(tab);
    if (targetEl) {
      const navOffset = 64; // header height
      const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen relative flex flex-col justify-between selection:bg-cyan-500 selection:text-black bg-slate-50 dark:bg-[#08090d] text-slate-900 dark:text-gray-100 transition-colors duration-200">
        
        {/* Top Scroll Position Progress Bar */}
        <ScrollProgressBar />

        {/* Framer-Motion Powered Custom Interactive Cursor */}
        <CustomCursor />

        {/* Top Preloader Bar */}
        {isInitialLoading && (
          <div className="fixed top-0 inset-x-0 z-[60] h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 animate-pulse" />
        )}

        {/* Top Header Navbar & Mobile Dock with Auto-ScrollSpy */}
        <Navbar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onOpenResume={() => setIsResumeOpen(true)}
          onOpenBooking={() => setIsBookingOpen(true)}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
        />

        {/* Vertical Progress Navigation Rail (Desktop & Tablet) */}
        <VerticalNavRail
          activeTab={activeTab}
          onNavigate={handleNavigate}
        />

        {/* All Sections Sequentially Rendered with Section Dividers and Reveal */}
        <main className="flex-1 pb-28 lg:pb-12">
          <RevealOnScroll threshold={0.05}>
            <HeroSection
              profile={profile}
              onOpenContact={() => setIsContactOpen(true)}
              onOpenResume={() => setIsResumeOpen(true)}
              onOpenBooking={() => setIsBookingOpen(true)}
              onExploreProjects={() => handleNavigate('projects')}
              totalReposCount={liveRepoCount}
            />
          </RevealOnScroll>

          <SectionDivider />

          <RevealOnScroll threshold={0.08}>
            <ProjectsSection
              currentGithubUser={profile.githubUsername}
              onRepoCountChange={setLiveRepoCount}
            />
          </RevealOnScroll>

          <SectionDivider />

          <RevealOnScroll threshold={0.08}>
            <StackSection />
          </RevealOnScroll>

          <SectionDivider />

          <RevealOnScroll threshold={0.08}>
            <ExperienceSection onOpenResume={() => setIsResumeOpen(true)} />
          </RevealOnScroll>

          <SectionDivider />

          <RevealOnScroll threshold={0.08}>
            <ContactSection
              profile={profile}
              onOpenBooking={() => setIsBookingOpen(true)}
            />
          </RevealOnScroll>
        </main>

        {/* Global Modals */}
        <ContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
          profile={profile}
          onOpenBooking={() => {
            setIsContactOpen(false);
            setIsBookingOpen(true);
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
        />

        {/* Footer */}
        <footer className="w-full border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#090a0f] py-10 px-4 sm:px-8 text-xs text-slate-600 dark:text-gray-400 transition-colors shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
            
            {/* Column 1: Identity & Live Sync Status Indicator */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-3 text-center sm:text-left">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{profile.name}</span>
                  <span className="text-blue-600 dark:text-cyan-400 font-mono text-xs font-semibold">• {lang === 'ar' ? 'مهندس تطبيقات فلاتر وذكاء اصطناعي' : 'Flutter & AI Mobile Specialist'}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 font-mono text-[11px]">
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{t.footer.syncStatus}: {isOnline ? (lang === 'ar' ? 'متصل (تزامن لحظي)' : 'Online (Real-Time)') : (lang === 'ar' ? 'تخزين مؤقت محلي' : 'Offline Cache')}</span>
                  </span>
                  <span className="text-slate-500 dark:text-gray-400 font-medium">{t.footer.lastSynced}: {lastSyncTime}</span>
                </div>
              </div>

              {/* Manual Refresh Data Button */}
              <button
                onClick={handleManualRefresh}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-gray-200 border border-slate-300 dark:border-white/10 text-xs font-mono font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                title="Force refresh GitHub repository data and live activity"
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin text-blue-500' : 'text-slate-600 dark:text-slate-400'} />
                <span>{isSyncing ? (lang === 'ar' ? 'جارٍ التحديث...' : 'Syncing...') : t.footer.refreshData}</span>
              </button>
            </div>

            {/* Column 2: Social & Contact Channels */}
            <div className="flex items-center gap-2">
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 hover:text-black dark:hover:text-white border border-slate-300 dark:border-white/10 flex items-center justify-center transition-all hover:scale-105 shadow-2xs"
                title="GitHub Profile"
              >
                <Github size={15} />
              </a>
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-blue-600/15 text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-300 dark:border-white/10 flex items-center justify-center transition-all hover:scale-105 shadow-2xs"
                title="LinkedIn Profile"
              >
                <Linkedin size={15} />
              </a>
              <a
                href={profile.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-red-600/15 text-slate-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-300 dark:border-white/10 flex items-center justify-center transition-all hover:scale-105 shadow-2xs"
                title="YouTube Demos Channel"
              >
                <Youtube size={15} />
              </a>
              <a
                href={profile.tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-pink-600/15 text-slate-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 border border-slate-300 dark:border-white/10 flex items-center justify-center transition-all hover:scale-105 shadow-2xs"
                title="TikTok Profile"
              >
                <TikTokLogo size={14} />
              </a>
              <a
                href="https://wa.me/201022121573"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-emerald-600/15 text-slate-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-300 dark:border-white/10 flex items-center justify-center transition-all hover:scale-105 shadow-2xs"
                title="WhatsApp Direct Chat"
              >
                <WhatsAppLogo size={16} />
              </a>
              <button
                type="button"
                onClick={() => openEmailClient(profile.email, 'Mobile App Project Inquiry - Flutter Specialist')}
                className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-cyan-600/15 text-slate-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 border border-slate-300 dark:border-white/10 flex items-center justify-center transition-all hover:scale-105 shadow-2xs cursor-pointer"
                title="Send Email via Gmail / Email app"
              >
                <Mail size={14} />
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-gray-400 gap-2 font-medium">
            <span>{t.footer.rights}</span>
            <span>{t.footer.builtWith}</span>
          </div>
        </footer>

      </div>
    </QueryClientProvider>
  );
}
