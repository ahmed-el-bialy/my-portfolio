import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Layers,
  FolderGit2,
  Briefcase,
  Mail,
  FileText,
  Sun,
  Moon,
  Video,
  Languages,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Github,
  Linkedin,
  Youtube,
  Radio,
  ArrowRight
} from 'lucide-react';
import { WhatsAppLogo, TikTokLogo } from './TechLogos';
import websiteLogo from '../assets/images/website_logo_circular.png';
import { useLanguage } from '../context/LanguageContext';
import { DEFAULT_PROFILE } from '../data/portfolioData';

export type NavTab = 'hero' | 'projects' | 'stack' | 'experience' | 'contact';

interface NavbarProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onOpenResume: () => void;
  onOpenBooking?: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isAnyModalOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  onOpenResume,
  onOpenBooking,
  isDark,
  onToggleTheme,
  isAnyModalOpen = false,
}) => {
  const { lang, dir, toggleLang, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profile = DEFAULT_PROFILE;

  // Close mobile drawer on ESC or navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTabClick = (tab: NavTab) => {
    onNavigate(tab);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'hero' as NavTab, label: t.nav.overview, icon: Home },
    { id: 'projects' as NavTab, label: t.nav.projects, icon: FolderGit2 },
    { id: 'stack' as NavTab, label: t.nav.stack, icon: Layers },
    { id: 'experience' as NavTab, label: t.nav.experience, icon: Briefcase },
    { id: 'contact' as NavTab, label: t.nav.contact, icon: Mail },
  ];

  const currentSection = navItems.find((item) => item.id === activeTab) || navItems[0];

  return (
    <>
      {/* 1. TOP HEADER NAVBAR (Responsive & Ergonomic across Mobile, Tablet, & Desktop) */}
      <header className="fixed top-0 inset-x-0 z-50 transition-all duration-200 border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#090a0f]/95 backdrop-blur-xl shadow-xs">
        <div className="max-w-[1400px] mx-auto px-3.5 sm:px-5 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3 md:gap-4 lg:gap-6 w-full">
          
          {/* Zone 1: Brand Wordmark & Circular Logo Emblem */}
          <div
            onClick={() => handleTabClick('hero')}
            className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 cursor-pointer group min-w-0 shrink-0"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleTabClick('hero');
            }}
          >
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-600 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden flex items-center justify-center">
                <img
                  src={websiteLogo}
                  alt="Ahmed El-Bialy Logo"
                  className="w-full h-full rounded-full object-cover object-center aspect-square"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#090a0f] ring-1 ring-emerald-400/50 z-10" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm lg:text-base tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors truncate max-w-[100px] xs:max-w-[130px] sm:max-w-[150px] md:max-w-[160px] lg:max-w-[180px] xl:max-w-none">
                  {lang === 'ar' ? 'أحمد البيلي' : 'Ahmed El-Bialy'}
                </span>
                <span className="hidden xl:inline-block text-[10px] font-mono text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 font-bold shrink-0">
                  Flutter & AI
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-cyan-700 dark:text-cyan-400 font-mono -mt-0.5 font-medium truncate max-w-[110px] xs:max-w-[140px] sm:max-w-[160px] md:max-w-[165px] lg:max-w-[200px] xl:max-w-none">
                {t.nav.brandRole}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links for Tablet & Desktop (md:flex, screens >= 768px) with Framer-Motion Sliding Pill */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 xl:gap-1.5 bg-slate-100/90 dark:bg-white/[0.04] p-1 rounded-full border border-slate-200/90 dark:border-white/10 shrink-0 shadow-2xs">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-1 lg:gap-1.5 px-2 md:px-2.5 lg:px-3 xl:px-4 py-1.5 rounded-full text-[11px] md:text-xs font-semibold transition-colors duration-200 cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Fluid Framer-Motion Active Pill for Tablet & Desktop */}
                  {isActive && (
                    <motion.div
                      layoutId="desktopNavActivePill"
                      className="absolute inset-0 rounded-full bg-blue-600 shadow-sm shadow-blue-600/35"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1 lg:gap-1.5">
                    <Icon size={13} className={isActive ? 'text-white' : 'opacity-70'} />
                    <span>{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Header Actions (Adaptive to Mobile, Tablet, & Desktop) */}
          <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
            
            {/* Bilingual Switcher (Compact, clean pill on mobile, full label on desktop) */}
            <button
              onClick={toggleLang}
              className="h-8 sm:h-9 px-2 sm:px-2.5 lg:px-3 rounded-xl flex items-center gap-1 sm:gap-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-300/80 dark:border-white/15 text-xs font-bold text-slate-800 dark:text-gray-100 transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
              aria-label={t.nav.switchLangTooltip}
              title={t.nav.switchLangTooltip}
            >
              <Languages size={14} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span className="font-bold text-[11px] sm:text-xs tracking-tight">
                {lang === 'en' ? 'عربي' : 'EN'}
              </span>
            </button>

            {/* Book Meeting Button (Desktop lg+) */}
            {onOpenBooking && (
              <button
                onClick={onOpenBooking}
                className="hidden lg:flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600/15 to-cyan-500/15 hover:from-blue-600 hover:to-cyan-500 hover:text-white text-blue-700 dark:text-cyan-300 border border-blue-500/30 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs"
                title={t.nav.bookMeeting}
              >
                <Video size={13} className="text-blue-600 dark:text-cyan-400 group-hover:text-white shrink-0" />
                <span className="hidden xl:inline">{t.nav.bookMeeting}</span>
                <span className="xl:hidden">{lang === 'ar' ? 'احجز موعداً' : 'Book Call'}</span>
              </button>
            )}

            {/* Resume / CV Button (Quick access across devices: CV short on mobile, compact on tablet, full label on lg+) */}
            <button
              onClick={onOpenResume}
              className="flex items-center gap-1.5 h-8 sm:h-9 px-2 sm:px-2.5 lg:px-3.5 rounded-xl sm:rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-gray-200 hover:text-black dark:hover:text-white border border-slate-300/80 dark:border-white/10 transition-all cursor-pointer whitespace-nowrap shrink-0"
              title={t.nav.resume}
            >
              <FileText size={13} className="text-emerald-500 shrink-0" />
              <span className="hidden xl:inline">{t.nav.resume}</span>
              <span className="hidden md:inline xl:hidden">{lang === 'ar' ? 'السيرة' : 'Resume'}</span>
              <span className="md:hidden text-[11px] font-bold">{t.nav.cvShort}</span>
            </button>

            {/* Direct Contact Button (Desktop xl+) */}
            <button
              onClick={() => handleTabClick('contact')}
              className="hidden xl:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <Mail size={13} />
              <span>{t.nav.contact}</span>
            </button>

            {/* Light / Dark Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-300/80 dark:border-white/15 transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun size={16} className="text-amber-400 hover:rotate-45 transition-transform duration-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
              ) : (
                <Moon size={16} className="text-indigo-600 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Mobile Slide-Over Drawer Toggle (Hamburger on screens < 768px) */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-300/80 dark:border-white/15 text-slate-800 dark:text-gray-200 transition-all cursor-pointer shrink-0 active:scale-95"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open navigation menu"}
              title="Menu"
            >
              {isMobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>

          </div>

        </div>
      </header>

      {/* 2. REFINED ERGONOMIC MOBILE BOTTOM APP NAVIGATION BAR (Screens < 768px) */}
      <nav
        className={`md:hidden fixed bottom-3 inset-x-3 max-w-sm xs:max-w-md mx-auto z-40 transition-all duration-300 ${
          isAnyModalOpen ? 'opacity-0 pointer-events-none translate-y-8' : 'opacity-100 translate-y-0'
        }`}
        aria-label="App Navigation Bar"
      >
        <div className="relative bg-white/95 dark:bg-[#0c0d16]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/12 rounded-2xl shadow-2xl shadow-black/15 dark:shadow-black/60 p-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-colors cursor-pointer select-none active:scale-95 ${
                  isActive
                    ? 'text-blue-600 dark:text-cyan-400 font-bold'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* 2.1 Fluid Framer-Motion Active Pill Transition */}
                {isActive && (
                  <motion.div
                    layoutId="mobileNavActivePill"
                    className="absolute inset-0 rounded-xl bg-blue-500/15 dark:bg-cyan-400/15 border border-blue-500/25 dark:border-cyan-400/30 shadow-xs"
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 30,
                    }}
                  />
                )}

                {/* 2.2 Fluid Framer-Motion Centered Bottom Indicator Bar */}
                {isActive && (
                  <motion.span
                    layoutId="mobileNavActiveIndicator"
                    className="absolute bottom-1 w-4 h-[2px] rounded-full bg-blue-600 dark:bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 30,
                    }}
                  />
                )}

                <div className={`relative z-10 flex flex-col items-center justify-center ${isActive ? 'pb-1' : ''}`}>
                  <Icon size={19} className="transition-transform duration-200" />
                  <span className="text-[10px] mt-0.5 leading-none tracking-tight truncate max-w-full px-0.5">
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3. MOBILE SLIDE-OVER NAVIGATION DRAWER (Screens < 768px) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className={`fixed inset-y-0 ${
              dir === 'rtl' ? 'left-0' : 'right-0'
            } w-[85%] max-w-xs bg-white dark:bg-[#0d0f1a] border-slate-200 dark:border-white/10 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto transition-transform`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl p-[1.5px] bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-600">
                    <img
                      src="https://avatars.githubusercontent.com/u/245139141?v=4"
                      alt={profile.name}
                      className="w-full h-full rounded-[9px] object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {lang === 'ar' ? 'أحمد البيلي' : profile.name}
                    </h4>
                    <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
                      {t.nav.brandRole}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-300 flex items-center justify-center cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mt-3.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px]">{profile.statusText}</span>
              </div>

              {/* Primary Section Links */}
              <div className="mt-5 space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-2 px-1">
                  {lang === 'ar' ? 'أقسام الموقع' : 'Navigation'}
                </p>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} />
                        <span>{item.label}</span>
                        {isActive && (
                          <span className="relative flex h-2 w-2 shrink-0 ms-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                          </span>
                        )}
                      </div>
                      <ArrowRight size={13} className={dir === 'rtl' ? 'rotate-180' : ''} />
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="mt-5 space-y-2 pt-4 border-t border-slate-200 dark:border-white/10">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-2 px-1">
                  {lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
                </p>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenResume();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/25 transition-all cursor-pointer"
                >
                  <FileText size={14} />
                  <span>{t.nav.resume}</span>
                </button>

                {onOpenBooking && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenBooking();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600/15 to-cyan-500/15 text-blue-700 dark:text-cyan-300 text-xs font-bold border border-blue-500/30 transition-all cursor-pointer"
                  >
                    <Video size={14} />
                    <span>{t.nav.bookMeeting}</span>
                  </button>
                )}

                <a
                  href="https://wa.me/201022121573"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-400 font-bold text-xs border border-emerald-500/30 transition-all"
                >
                  <WhatsAppLogo size={14} />
                  <span>{lang === 'ar' ? 'محادثة واتساب مباشرة' : 'Direct WhatsApp'}</span>
                </a>
              </div>
            </div>

            {/* Drawer Footer: Social Channels & Language */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-around gap-2 text-slate-600 dark:text-gray-400">
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:text-black dark:hover:text-white transition-colors"
                >
                  <Github size={15} />
                </a>
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:text-blue-500 transition-colors"
                >
                  <Linkedin size={15} />
                </a>
                <a
                  href={profile.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:text-red-500 transition-colors"
                >
                  <Youtube size={15} />
                </a>
                <a
                  href={profile.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:text-pink-500 transition-colors"
                >
                  <TikTokLogo size={14} />
                </a>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400 font-mono">
                <span>{lang === 'ar' ? 'اللغة الحالية:' : 'Language:'}</span>
                <button
                  onClick={toggleLang}
                  className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold cursor-pointer"
                >
                  {lang === 'en' ? 'العربية' : 'English'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
