import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
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
  Github,
  Linkedin,
  Youtube,
  ArrowRight,
} from 'lucide-react';
import { WhatsAppLogo, TikTokLogo, InstagramLogo } from './TechLogos';
import { BrandLogoMark } from './BrandLogoMark';
import { AHMED_CONFIG } from '../data/config';
import { DEFAULT_PROFILE } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';

export type NavTab = 'overview' | 'projects' | 'experience' | 'contact';

interface NavbarProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onPrefetchTab?: (tab: NavTab) => void;
  onOpenResume: () => void;
  onOpenBooking?: () => void;
  isDark: boolean;
  onToggleTheme: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isAnyModalOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  onPrefetchTab,
  onOpenResume,
  onOpenBooking,
  isDark,
  onToggleTheme,
  isAnyModalOpen = false,
}) => {
  const { lang, dir, toggleLang, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileDrawerRef = React.useRef<HTMLDivElement>(null);
  const profile = DEFAULT_PROFILE;

  useAccessibleDialog(isMobileMenuOpen, () => setIsMobileMenuOpen(false), mobileDrawerRef);

  const handleTabClick = (tab: NavTab) => {
    onNavigate(tab);
    setIsMobileMenuOpen(false);
  };

  const navItems: Array<{
    id: NavTab;
    label: string;
    mobileLabel: string;
    icon: React.FC<{ size?: number }>;
  }> = [
    { id: 'overview', label: t.nav.overview, mobileLabel: t.nav.mobileNav.overview, icon: Home },
    { id: 'projects', label: t.nav.projects, mobileLabel: t.nav.mobileNav.projects, icon: FolderGit2 },
    { id: 'experience', label: t.nav.experience, mobileLabel: t.nav.mobileNav.experience, icon: Briefcase },
    { id: 'contact', label: t.nav.contact, mobileLabel: t.nav.mobileNav.contact, icon: Mail },
  ];

  return (
    <>
      {/* 1. Strict 3-Zone Frosted Glass Top Bar */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-200/80 dark:border-white/[0.08] bg-[#f8fafc]/85 dark:bg-[#08090d]/85 backdrop-blur-xl shadow-2xs transition-colors duration-200">
        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 h-[52px] sm:h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
          {/* Zone 1: Logo Mark + Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleTabClick('overview')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] rounded-lg px-0.5 sm:px-1 min-h-[44px] sm:min-h-0"
          >
            <BrandLogoMark
              sizeClassName="w-7 h-7 sm:w-9 sm:h-9"
              className="group-hover:scale-105 transition-transform"
            />
            <span className="font-bold text-[13px] sm:text-base tracking-tight text-slate-900 dark:text-[#f1f5f9] group-hover:text-[#0369a1] dark:group-hover:text-[#38bdf8] transition-colors whitespace-nowrap truncate max-w-[140px] xs:max-w-[175px] sm:max-w-none">
              {AHMED_CONFIG.name[lang]}
            </span>
          </button>

          {/* Zone 2: 4 Clean Single-Line Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-6 lg:gap-8 shrink-0"
            aria-label="Primary Navigation"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  onMouseEnter={() => onPrefetchTab?.(item.id)}
                  onFocus={() => onPrefetchTab?.(item.id)}
                  className={`relative py-2 text-xs lg:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] rounded ${
                    isActive
                      ? 'text-[#0369a1] dark:text-[#38bdf8]'
                      : 'text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-[#f1f5f9]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="desktopNavUnderline"
                      className="absolute bottom-0 inset-x-0 h-[2px] rounded-full bg-gradient-to-r from-[#0284ff] to-[#38bdf8]"
                      transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Balanced Utilities & Calm Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleLang}
              className="h-11 sm:h-9 px-2.5 sm:px-3 rounded-xl flex items-center gap-1 sm:gap-1.5 bg-white dark:bg-[#0f1117] hover:bg-[#0284ff]/[0.06] dark:hover:bg-[#0284ff]/[0.1] border border-slate-200 dark:border-white/12 hover:border-[#0284ff]/45 text-xs font-semibold text-slate-800 dark:text-[#f1f5f9] hover:text-[#0369a1] dark:hover:text-[#38bdf8] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              aria-label={t.nav.switchLangTooltip}
              title={t.nav.switchLangTooltip}
            >
              <Languages size={14} className="text-[#0369a1] dark:text-[#38bdf8] shrink-0" />
              <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenResume}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-[#0284ff]/[0.06] dark:hover:bg-[#0284ff]/[0.1] border border-slate-200 dark:border-white/12 hover:border-[#0284ff]/45 text-xs font-semibold text-slate-800 dark:text-[#f1f5f9] hover:text-[#0369a1] dark:hover:text-[#38bdf8] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title={t.nav.resume}
            >
              <FileText size={14} className="text-[#0369a1] dark:text-[#38bdf8] shrink-0" />
              <span>{lang === 'ar' ? 'السيرة' : 'Resume'}</span>
            </button>

            {onOpenBooking && (
              <button
                type="button"
                onClick={onOpenBooking}
                className="btn-kinetic hidden lg:inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#0284ff] hover:bg-[#0070e0] border border-[#0284ff] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title={t.nav.bookMeeting}
              >
                <Video size={14} className="shrink-0" />
                <span>{t.nav.bookMeeting}</span>
              </button>
            )}

            {/* Theme Toggle Button: isolated view-transition-name so icon remains visible above circular reveal */}
            <motion.button
              type="button"
              onClick={isAnyModalOpen ? undefined : onToggleTheme}
              disabled={isAnyModalOpen}
              whileHover={isAnyModalOpen ? undefined : { scale: 1.04 }}
              whileTap={isAnyModalOpen ? undefined : { scale: 0.96 }}
              className={`theme-toggle-vt relative w-11 h-11 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-colors shrink-0 ${
                isAnyModalOpen
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-[#0f1117] border-slate-200 dark:border-white/5'
                  : 'bg-white dark:bg-[#0f1117] hover:bg-[#0284ff]/[0.06] dark:hover:bg-[#0284ff]/[0.1] border-slate-200 dark:border-white/12 hover:border-[#0284ff]/45 cursor-pointer'
              }`}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isDark ? 'dark-icon' : 'light-icon'}
                  initial={{ rotate: -35, scale: 0.9, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 35, scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-center"
                >
                  {isDark ? (
                    <Sun size={16} className="text-amber-400" />
                  ) : (
                    <Moon size={16} className="text-[#0369a1]" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden w-11 h-11 rounded-xl flex items-center justify-center bg-white dark:bg-[#0f1117] hover:bg-[#0284ff]/[0.06] dark:hover:bg-[#0284ff]/[0.1] border border-slate-200 dark:border-white/12 text-slate-800 dark:text-[#f1f5f9] transition-colors cursor-pointer shrink-0"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Sleek Compact Mobile Bottom Dock (< 768px) */}
      <nav
        className={`md:hidden fixed bottom-1.5 inset-x-3 max-w-sm mx-auto z-40 transition-transform duration-200 ${
          isAnyModalOpen ? 'opacity-0 pointer-events-none translate-y-6' : 'opacity-100 translate-y-0'
        }`}
        aria-label="Mobile Bottom Navigation"
      >
        <div className="bg-white/90 dark:bg-[#0f1117]/90 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-md px-1 py-1 pb-[max(0.2rem,env(safe-area-inset-bottom))] grid grid-cols-4 gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                onTouchStart={() => onPrefetchTab?.(item.id)}
                className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 px-1 rounded-xl transition-colors cursor-pointer select-none ${
                  isActive
                    ? 'text-[#0369a1] dark:text-[#38bdf8] bg-[#0284ff]/10 dark:bg-[#38bdf8]/12 font-bold'
                    : 'text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-[#f1f5f9] font-medium'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={16} />
                <span className="text-[10px] mt-0.5 leading-tight whitespace-nowrap truncate max-w-full">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3. Accessible Mobile Slide-Over Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              ref={mobileDrawerRef}
              role="dialog"
              aria-modal="true"
              aria-label={lang === 'ar' ? 'قائمة التنقل' : 'Navigation Menu'}
              initial={{ x: dir === 'rtl' ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: dir === 'rtl' ? '-100%' : '100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={`fixed inset-y-0 ${
                dir === 'rtl' ? 'left-0 border-r' : 'right-0 border-l'
              } w-[84%] max-w-xs bg-white dark:bg-[#0f1117] border-slate-200 dark:border-white/10 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <BrandLogoMark sizeClassName="w-9 h-9" />
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 dark:text-[#f1f5f9] truncate">
                        {AHMED_CONFIG.name[lang]}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-[#94a3b8] truncate">
                        {t.nav.brandRole}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-[#161b27] text-slate-700 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                    aria-label="Close menu"
                  >
                    <X size={17} />
                  </button>
                </div>

              <div className="mt-5 space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#0284ff] text-white shadow-sm shadow-[#0284ff]/25'
                          : 'text-slate-700 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#161b27]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </span>
                      <ArrowRight size={13} className={dir === 'rtl' ? 'rotate-180' : ''} />
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 space-y-2 pt-4 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenResume();
                  }}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-[#161b27] text-slate-900 dark:text-[#f1f5f9] text-xs font-bold border border-slate-200 dark:border-white/10 cursor-pointer"
                >
                  <FileText size={14} className="text-emerald-500" />
                  <span>{t.nav.resume}</span>
                </button>

                {onOpenBooking && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenBooking();
                    }}
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0284ff] hover:bg-[#0070e0] text-white text-xs font-bold cursor-pointer shadow-sm shadow-[#0284ff]/20"
                  >
                    <Video size={14} />
                    <span>{t.nav.bookMeeting}</span>
                  </button>
                )}

                <a
                  href={AHMED_CONFIG.socials.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-500/25"
                >
                  <WhatsAppLogo size={14} />
                  <span>{lang === 'ar' ? 'محادثة واتساب' : 'Direct WhatsApp'}</span>
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-around text-slate-600 dark:text-[#94a3b8]">
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-11 h-11 rounded-xl flex items-center justify-center hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Github size={17} />
              </a>
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-11 h-11 rounded-xl flex items-center justify-center hover:text-[#0284ff] transition-colors"
              >
                <Linkedin size={17} />
              </a>
              <a
                href={profile.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-11 h-11 rounded-xl flex items-center justify-center hover:text-red-500 transition-colors"
              >
                <Youtube size={17} />
              </a>
              <a
                href={profile.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-11 h-11 rounded-xl flex items-center justify-center hover:text-pink-500 transition-colors"
              >
                <TikTokLogo size={15} />
              </a>
              <a
                href={profile.instagramUrl || AHMED_CONFIG.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-11 h-11 rounded-xl flex items-center justify-center hover:text-pink-500 transition-colors"
              >
                <InstagramLogo size={17} />
              </a>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
