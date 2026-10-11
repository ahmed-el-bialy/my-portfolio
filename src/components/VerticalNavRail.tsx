import React, { useState, useEffect } from 'react';
import { NavTab } from './Navbar';
import { useLanguage } from '../context/LanguageContext';

interface VerticalNavRailProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
}

interface NavSection {
  id: NavTab;
  label: string;
  shortcut: string;
}

export const VerticalNavRail: React.FC<VerticalNavRailProps> = ({ activeTab, onNavigate }) => {
  const [hoveredTab, setHoveredTab] = useState<NavTab | null>(null);
  const { dir, t } = useLanguage();
  const isRtl = dir === 'rtl';

  const sections: NavSection[] = [
    { id: 'hero', label: t.nav.overview, shortcut: '1' },
    { id: 'projects', label: t.nav.projects, shortcut: '2' },
    { id: 'stack', label: t.nav.stack, shortcut: '3' },
    { id: 'experience', label: t.nav.experience, shortcut: '4' },
    { id: 'contact', label: t.nav.contact, shortcut: '5' },
  ];

  // Keyboard navigation shortcuts: 1-5 jump to sections
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const matchedSection = sections.find((s) => s.shortcut === e.key);
      if (matchedSection) {
        onNavigate(matchedSection.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, sections]);

  return (
    <nav
      id="vertical-nav-rail"
      className="fixed top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center gap-3.5 p-2 rounded-full bg-white/85 dark:bg-[#0c0d14]/85 backdrop-blur-md border border-slate-300 dark:border-white/10 shadow-xl transition-all select-none end-4 2xl:end-8"
      aria-label="Section Navigation Quick Rail"
    >
      {sections.map((section) => {
        const isActive = activeTab === section.id;
        const isHovered = hoveredTab === section.id;

        return (
          <div
            key={section.id}
            className="relative flex items-center justify-center group"
            onMouseEnter={() => setHoveredTab(section.id)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            {/* Tooltip with Keyboard Shortcut badge */}
            <div
              className={`absolute px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide whitespace-nowrap pointer-events-none transition-all duration-200 shadow-md flex items-center gap-1.5 ${
                isRtl ? 'start-8' : 'end-8'
              } ${
                isHovered
                  ? `opacity-100 ${isRtl ? 'translate-x-1' : '-translate-x-1'}`
                  : `opacity-0 ${isRtl ? '-translate-x-2' : 'translate-x-2'}`
              } ${
                isActive
                  ? 'bg-blue-600 text-white shadow-blue-500/25'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              }`}
            >
              <span>{section.label}</span>
              <kbd className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-white/20 dark:bg-black/15 text-white dark:text-slate-900 border border-white/20 dark:border-black/10">
                {section.shortcut}
              </kbd>
              <div
                className={`absolute top-1/2 -translate-y-1/2 border-solid border-y-4 border-y-transparent ${
                  isRtl
                    ? `left-[-4px] border-r-4 border-l-0 ${
                        isActive
                          ? 'border-r-blue-600'
                          : 'border-r-slate-900 dark:border-r-white'
                      }`
                    : `right-[-4px] border-l-4 border-r-0 ${
                        isActive
                          ? 'border-l-blue-600'
                          : 'border-l-slate-900 dark:border-l-white'
                      }`
                }`}
              />
            </div>

            {/* Indicator Dot / Pill */}
            <button
              onClick={() => onNavigate(section.id)}
              className="relative p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full cursor-pointer group"
              aria-label={`Jump to ${section.label} (Press ${section.shortcut})`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span
                className={`block transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-2.5 h-7 bg-gradient-to-b from-blue-500 via-cyan-400 to-indigo-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                    : 'w-2 h-2 bg-slate-400 dark:bg-gray-600 group-hover:bg-slate-700 dark:group-hover:bg-gray-300 group-hover:scale-125'
                }`}
              />
            </button>
          </div>
        );
      })}
    </nav>
  );
};
