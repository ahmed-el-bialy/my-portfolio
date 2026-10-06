import React from 'react';

interface SectionDividerProps {
  className?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full max-w-6xl mx-auto px-4 sm:px-8 my-6 sm:my-8 ${className}`} aria-hidden="true">
      <div className="relative flex items-center justify-center">
        {/* Subtle Horizontal Gradient Line */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-cyan-500/20 to-transparent" />
        
        {/* Glowing Center Accent Pip */}
        <div className="absolute flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-blue-600/30 dark:bg-cyan-400/30 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-600 dark:bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          </div>
        </div>
      </div>
    </div>
  );
};
