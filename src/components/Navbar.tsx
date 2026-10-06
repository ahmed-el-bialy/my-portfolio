import React from 'react';
import { Home, Layers, FolderGit2, Briefcase, Mail, FileText, Sun, Moon, Video, Calendar } from 'lucide-react';

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
  const navItems = [
    { id: 'hero' as NavTab, label: 'Overview', icon: Home },
    { id: 'projects' as NavTab, label: 'Projects & Repos', icon: FolderGit2 },
    { id: 'stack' as NavTab, label: 'Tech Stack', icon: Layers },
    { id: 'experience' as NavTab, label: 'Experience & CV', icon: Briefcase },
    { id: 'contact' as NavTab, label: 'Contact', icon: Mail },
  ];

  return (
    <>
      {/* 1. TOP HEADER NAVBAR (Desktop & Laptop Viewport Optimization) */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#090a0f]/90 backdrop-blur-xl shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Zone 1: Brand Wordmark & Avatar Emblem */}
          <div
            onClick={() => onNavigate('hero')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onNavigate('hero');
            }}
          >
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-[1.5px] bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-600 shadow-md shadow-blue-500/15 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="https://avatars.githubusercontent.com/u/245139141?v=4"
                  alt="Ahmed El-Bialy"
                  className="w-full h-full rounded-[10px] object-cover bg-[#0f111a]"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#090a0f] ring-1 ring-emerald-400/50" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                  Ahmed El-Bialy
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 font-bold">
                  Flutter
                </span>
              </div>
              <span className="text-[11px] text-cyan-700 dark:text-cyan-400 font-mono -mt-0.5 font-medium">
                Mobile App Developer
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Desktop & Laptop) */}
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

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Book Meeting Button */}
            {onOpenBooking && (
              <button
                onClick={onOpenBooking}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600/15 to-cyan-500/15 hover:from-blue-600 hover:to-cyan-500 hover:text-white text-blue-700 dark:text-cyan-300 border border-blue-500/30 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs"
                title="Book a 1-on-1 meeting directly with Ahmed"
              >
                <Video size={13} className="text-blue-600 dark:text-cyan-400 group-hover:text-white" />
                <span className="hidden sm:inline">Book Meeting</span>
                <span className="sm:hidden text-[11px]">Book</span>
              </button>
            )}

            {/* Resume / CV Button */}
            <button
              onClick={onOpenResume}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-gray-200 hover:text-black dark:hover:text-white border border-slate-300 dark:border-white/10 transition-all cursor-pointer whitespace-nowrap"
            >
              <FileText size={13} className="text-emerald-500" />
              <span className="hidden sm:inline">Resume</span>
              <span className="sm:hidden text-[11px]">CV</span>
            </button>

            {/* Direct Contact Button */}
            <button
              onClick={() => onNavigate('contact')}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <Mail size={13} />
              <span>Contact</span>
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={onToggleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-slate-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-white/10"
              aria-label="Toggle Theme"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-slate-700" />}
            </button>
          </div>

        </div>
      </header>

      {/* 2. ERGONOMIC MOBILE BOTTOM DOCK (Mobile screens < 1024px) */}
      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-50 bg-white/95 dark:bg-[#121420]/95 backdrop-blur-xl border border-slate-300/80 dark:border-white/15 rounded-2xl shadow-2xl p-1 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1.5 px-2 rounded-xl transition-all ${
                isActive ? 'text-blue-600 dark:text-cyan-400 font-bold scale-105 bg-blue-50 dark:bg-white/5' : 'text-slate-600 dark:text-gray-400'
              }`}
            >
              <Icon size={18} />
              <span className="text-[9px] mt-0.5">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}

        {onOpenBooking && (
          <button
            onClick={onOpenBooking}
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1.5 px-2 rounded-xl text-blue-600 dark:text-cyan-400 font-bold transition-transform active:scale-95"
            title="Book Meeting"
          >
            <Calendar size={18} />
            <span className="text-[9px] mt-0.5">Book</span>
          </button>
        )}
      </nav>
    </>
  );
};
