import React from 'react';

interface SectionDividerProps {
  className?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full max-w-6xl mx-auto px-4 sm:px-8 my-6 sm:my-8 ${className}`} aria-hidden="true">
      <div className="relative flex items-center justify-center">
        {/* Subtle Horizontal Gradient Line */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-[#0284ff]/25 to-transparent" />
        
        {/* Glowing Center Accent Pip */}
        <div className="absolute flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#0284ff]/25 dark:bg-[#00C7FF]/25 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#0284ff] dark:bg-[#00C7FF] shadow-[0_0_8px_rgba(2,132,255,0.65)]" />
          </div>
        </div>
      </div>
    </div>
  );
};
