import React from 'react';

interface BrandLogoMarkProps {
  className?: string;
  sizeClassName?: string;
  alt?: string;
  floatEffect?: boolean;
  floatMode?: 'sway' | 'vertical';
  showBlueRing?: boolean;
}

/**
 * Latest bold white brushstroke Leaf emblem inside a persistent thin glowing
 * electric-blue ring frame so the logo edges read crisply next to typography,
 * with smooth GPU-composited CSS floating animation (up/down + gentle sway).
 */
export const BrandLogoMark: React.FC<BrandLogoMarkProps> = ({
  className = '',
  sizeClassName = 'w-9 h-9',
  alt = 'Ahmed El-Bialy Leaf Emblem',
  floatEffect = false,
  floatMode = 'sway',
  showBlueRing = true,
}) => {
  const floatClass = !floatEffect
    ? ''
    : floatMode === 'vertical'
    ? 'animate-float-gentle'
    : 'animate-float-sway';

  return (
    <span className={`inline-flex shrink-0 ${floatClass}`}>
      <span
        className={`relative inline-flex items-center justify-center rounded-full shrink-0 transition-shadow duration-300 ${
          showBlueRing
            ? 'p-[2px] bg-gradient-to-br from-[#0284ff] via-[#00C7FF] to-[#38BDF8] ring-1 ring-[#00C7FF]/70 shadow-[0_0_18px_rgba(2,132,255,0.48)] dark:shadow-[0_0_22px_rgba(0,199,255,0.46)]'
            : 'ring-1 ring-slate-300/80 dark:ring-white/20 shadow-sm'
        } ${sizeClassName} ${className}`}
      >
        <span className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
          <img
            src="/brand-logo-mark.png?v=6"
            alt={alt}
            draggable={false}
            className="w-full h-full object-contain rounded-full select-none pointer-events-none"
          />
        </span>
      </span>
    </span>
  );
};
