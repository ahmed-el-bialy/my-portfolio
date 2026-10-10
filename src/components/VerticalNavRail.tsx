import React, { useState } from 'react';
import { NavTab } from './Navbar';
import { useLanguage } from '../context/LanguageContext';

interface VerticalNavRailProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
}

interface NavSection {
  id: NavTab;
  label: string;
}

export const VerticalNavRail: React.FC<VerticalNavRailProps> = ({ activeTab, onNavigate }) => {
  const [hoveredTab, setHoveredTab] = useState<NavTab | null>(null);
  const { dir, t } = useLanguage();
  const isRtl = dir === 'rtl';

  const sections: NavSection[] = [
    { id: 'hero', label: t.nav.overview },
    { id: 'projects', label: t.nav.projects },
    { id: 'stack', label: t.nav.stack },
    { id: 'experience', label: t.nav.experience },
    { id: 'contact', label: t.nav.contact },
  ];

  return (
    <div
      id="vertical-nav-rail"
      className={`fixed top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3 p-2 rounded-full bg-white/80 dark:bg-[#0c0d14]/85 backdrop-blur-md border border-slate-300 dark:border-white/10 shadow-xl transition-all select-none ${
        isRtl ? 'start-3 sm:start-5' : 'end-3 sm:end-5'
      }`}
      aria-label="Section Navigation Indicator"
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
            {/* Tooltip */}
            <div
              className={`absolute px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide whitespace-nowrap pointer-events-none transition-all duration-200 shadow-md ${
                isRtl ? 'start-7' : 'end-7'
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
              {section.label}
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
              className="relative p-1.5 focus:outline-none cursor-pointer group"
              aria-label={`Jump to ${section.label}`}
            >
              <span
                className={`block transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-2 h-6 bg-gradient-to-b from-blue-500 via-cyan-400 to-indigo-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                    : 'w-2 h-2 bg-slate-400 dark:bg-gray-600 group-hover:bg-slate-700 dark:group-hover:bg-gray-300 group-hover:scale-125'
                }`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
};
