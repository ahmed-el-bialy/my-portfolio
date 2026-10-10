import React from 'react';
import { Home, Layers, FolderGit2, Briefcase, Mail, FileText, Sun, Moon, Video, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type NavTab = 'hero' | 'projects' | 'stack' | 'experience' | 'contact';

interface NavbarProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onOpenResume: () => void;
  onOpenBooking?: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  onOpenResume,
  onOpenBooking,
  isDark,
  onToggleTheme,
}) => {
  const { lang, toggleLang, t } = useLanguage();

  const navItems = [
    { id: 'hero' as NavTab, label: t.nav.overview, icon: Home },
    { id: 'projects' as NavTab, label: t.nav.projects, icon: FolderGit2 },
    { id: 'stack' as NavTab, label: t.nav.stack, icon: Layers },
    { id: 'experience' as NavTab, label: t.nav.experience, icon: Briefcase },
    { id: 'contact' as NavTab, label: t.nav.contact, icon: Mail },
  ];

  return (
    <>
      {/* 1. TOP HEADER NAVBAR (Desktop, Tablet & Mobile Viewport Optimization) */}
      <header className="fixed top-0 inset-x-0 z-50 transition-all duration-200 border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#090a0f]/95 backdrop-blur-xl shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-6">
          
          {/* Zone 1: Brand Wordmark & Avatar Emblem */}
          <div
            onClick={() => onNavigate('hero')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0 shrink"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onNavigate('hero');
            }}
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-[1.5px] bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-600 shadow-md shadow-blue-500/15 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="https://avatars.githubusercontent.com/u/245139141?v=4"
                  alt="Ahmed El-Bialy"
                  className="w-full h-full rounded-[10px] object-cover bg-slate-100 dark:bg-[#0f111a]"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#090a0f] ring-1 ring-emerald-400/50" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-base tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors truncate max-w-[120px] sm:max-w-none">
                  {lang === 'ar' ? 'أحمد البيلي' : 'Ahmed El-Bialy'}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 font-bold shrink-0">
                  Flutter
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-cyan-700 dark:text-cyan-400 font-mono -mt-0.5 font-medium truncate">
                {t.nav.brandRole}
              </span>
            </div>
          </div>

          {/* Zone 2: Desktop Navigation Links (Desktop & Laptop lg+) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 dark:bg-white/[0.04] p-1 rounded-full border border-slate-200 dark:border-white/10 shrink-0">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions (Guaranteed Theme Toggle + Bilingual Toggle) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Bilingual Language Switcher Button (Desktop & Tablet & Mobile) */}
            <button
              onClick={toggleLang}
              className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-300 dark:border-white/20 text-xs font-bold text-slate-800 dark:text-gray-100 transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
              aria-label={t.nav.switchLangTooltip}
              title={t.nav.switchLangTooltip}
            >
              <Languages size={15} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span className="font-bold text-[11px] sm:text-xs tracking-tight">
                {lang === 'en' ? 'العربية' : 'English'}
              </span>
            </button>

            {/* Book Meeting Button (Desktop & Tablet) */}
            {onOpenBooking && (
              <button
                onClick={onOpenBooking}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600/15 to-cyan-500/15 hover:from-blue-600 hover:to-cyan-500 hover:text-white text-blue-700 dark:text-cyan-300 border border-blue-500/30 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs"
                title={t.nav.bookMeeting}
              >
                <Video size={13} className="text-blue-600 dark:text-cyan-400 group-hover:text-white" />
                <span>{t.nav.bookMeeting}</span>
              </button>
            )}

            {/* Resume / CV Button */}
            <button
              onClick={onOpenResume}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-gray-200 hover:text-black dark:hover:text-white border border-slate-300 dark:border-white/10 transition-all cursor-pointer whitespace-nowrap"
              title={t.nav.resume}
            >
              <FileText size={13} className="text-emerald-500" />
              <span className="hidden sm:inline">{t.nav.resume}</span>
              <span className="sm:hidden text-[11px] font-bold">{t.nav.cvShort}</span>
            </button>

            {/* Direct Contact Button (Desktop) */}
            <button
              onClick={() => onNavigate('contact')}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <Mail size={13} />
              <span>{t.nav.contact}</span>
            </button>

            {/* High-Visibility Light / Dark Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-300 dark:border-white/20 transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun size={18} className="text-amber-400 hover:rotate-45 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              ) : (
                <Moon size={18} className="text-indigo-600 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>
          </div>

        </div>
      </header>

      {/* 2. ERGONOMIC MOBILE BOTTOM DOCK (Screens < 1024px) */}
      <nav 
        className="lg:hidden fixed bottom-3 start-3 end-3 sm:start-6 sm:end-6 max-w-md mx-auto z-50 bg-white/95 dark:bg-[#121420]/95 backdrop-blur-xl border border-slate-300/90 dark:border-white/15 rounded-2xl shadow-2xl p-1.5 flex items-center justify-around"
        aria-label="Mobile Bottom Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'text-blue-600 dark:text-cyan-400 font-bold scale-105 bg-blue-50/80 dark:bg-white/10 shadow-xs' 
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={17} />
              <span className="text-[9px] mt-0.5 leading-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Mobile Language Switcher Button in Dock */}
        <button
          onClick={toggleLang}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 px-1.5 rounded-xl transition-all cursor-pointer text-slate-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
          aria-label={t.nav.switchLangTooltip}
          title={t.nav.switchLangTooltip}
        >
          <Languages size={17} className="text-cyan-600 dark:text-cyan-400" />
          <span className="text-[9px] mt-0.5 leading-tight font-bold text-cyan-700 dark:text-cyan-300">
            {lang === 'en' ? 'عربي' : 'EN'}
          </span>
        </button>

        {/* Mobile Theme Toggle Button in the Dock */}
        <button
          onClick={onToggleTheme}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 px-1.5 rounded-xl transition-all cursor-pointer text-slate-700 dark:text-amber-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun size={17} className="text-amber-400" />
          ) : (
            <Moon size={17} className="text-indigo-600" />
          )}
          <span className="text-[9px] mt-0.5 leading-tight font-medium">
            {isDark ? 'Light' : 'Dark'}
          </span>
        </button>
      </nav>
    </>
  );
};
