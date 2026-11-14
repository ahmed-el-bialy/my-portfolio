import React, { useState, useEffect, useMemo } from 'react';
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

  const sections: NavSection[] = useMemo(
    () => [
      { id: 'overview', label: t.nav.overview, shortcut: '1' },
      { id: 'projects', label: t.nav.projects, shortcut: '2' },
      { id: 'experience', label: t.nav.experience, shortcut: '3' },
      { id: 'contact', label: t.nav.contact, shortcut: '4' },
    ],
    [t.nav.overview, t.nav.projects, t.nav.experience, t.nav.contact]
  );

  // Keyboard shortcuts 1–4 jump between views cleanly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      className="fixed top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center gap-3 p-2 rounded-full bg-white/90 dark:bg-[#0c101b]/90 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-md select-none end-4 2xl:end-7"
      aria-label="View Quick Switcher"
    >
      {sections.map((section) => {
        const isActive = activeTab === section.id;
        const isHovered = hoveredTab === section.id;

        return (
          <div
            key={section.id}
            className="relative flex items-center justify-center"
            onMouseEnter={() => setHoveredTab(section.id)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            <div
              className={`absolute px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap pointer-events-none transition-all duration-150 shadow-md flex items-center gap-1.5 ${
                isRtl ? 'start-8' : 'end-8'
              } ${
                isHovered
                  ? `opacity-100 ${isRtl ? 'translate-x-1' : '-translate-x-1'}`
                  : `opacity-0 ${isRtl ? '-translate-x-2' : 'translate-x-2'}`
              } ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              }`}
            >
              <span>{section.label}</span>
              <kbd className="px-1 rounded text-[9px] font-mono tabular-nums bg-white/20 dark:bg-black/15">
                {section.shortcut}
              </kbd>
            </div>

            <button
              type="button"
              onClick={() => onNavigate(section.id)}
              className="relative p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full cursor-pointer"
              aria-label={`Open ${section.label} view (Shortcut ${section.shortcut})`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`block transition-all duration-200 rounded-full ${
                  isActive
                    ? 'w-2 h-6 bg-blue-600 dark:bg-cyan-400'
                    : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-500 dark:hover:bg-slate-400'
                }`}
              />
            </button>
          </div>
        );
      })}
    </nav>
  );
};
