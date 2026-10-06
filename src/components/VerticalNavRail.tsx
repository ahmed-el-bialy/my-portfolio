import React, { useState } from 'react';
import { NavTab } from './Navbar';

interface VerticalNavRailProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
}

interface NavSection {
  id: NavTab;
  label: string;
  shortLabel: string;
}

export const VerticalNavRail: React.FC<VerticalNavRailProps> = ({ activeTab, onNavigate }) => {
  const [hoveredTab, setHoveredTab] = useState<NavTab | null>(null);

  const sections: NavSection[] = [
    { id: 'hero', label: 'Overview', shortLabel: 'Top' },
    { id: 'projects', label: 'Projects & Repos', shortLabel: 'Projects' },
    { id: 'stack', label: 'Tech Stack', shortLabel: 'Stack' },
    { id: 'experience', label: 'Experience & CV', shortLabel: 'Experience' },
    { id: 'contact', label: 'Contact', shortLabel: 'Contact' },
  ];

  return (
    <div
      id="vertical-nav-rail"
      className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3 p-2 rounded-full bg-white/80 dark:bg-[#0c0d14]/85 backdrop-blur-md border border-slate-300 dark:border-white/10 shadow-xl transition-all select-none"
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
            {/* Tooltip on the left */}
            <div
              className={`absolute right-7 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide whitespace-nowrap pointer-events-none transition-all duration-200 shadow-md ${
                isHovered
                  ? 'opacity-100 -translate-x-1'
                  : 'opacity-0 translate-x-2'
              } ${
                isActive
                  ? 'bg-blue-600 text-white shadow-blue-500/25'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              }`}
            >
              {section.label}
              <div
                className={`absolute right-[-4px] top-1/2 -translate-y-1/2 border-solid border-l-4 border-y-4 border-y-transparent border-r-0 ${
                  isActive
                    ? 'border-l-blue-600'
                    : 'border-l-slate-900 dark:border-l-white'
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
