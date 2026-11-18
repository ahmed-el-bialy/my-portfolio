import React, { useState, useEffect } from 'react';
import { NavTab } from './Navbar';

interface ScrollProgressBarProps {
  activeTab?: NavTab;
}

export const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({ activeTab }) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 10) {
        const progress = (window.scrollY / scrollHeight) * 100;
        setScrollProgress(Math.min(Math.max(progress, 0), 100));
      } else {
        setScrollProgress(0);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [activeTab]);

  return (
    <div
      className="fixed top-0 inset-x-0 z-[60] h-[3px] bg-slate-200/40 dark:bg-white/5 pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#0284ff] via-[#00C7FF] to-[#38bdf8] transition-[width] duration-100 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};
