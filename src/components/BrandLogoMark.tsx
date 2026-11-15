import React from 'react';

interface BrandLogoMarkProps {
  className?: string;
  sizeClassName?: string;
  alt?: string;
}

/**
 * Razor-sharp vector Leaf emblem inside a luminous high-contrast dual ring.
 * Eliminates dark outer margins from padded raster assets so every spiral curve
 * reads clearly at 36px (Navbar) through 48px+ (About & Hero lockups).
 */
export const BrandLogoMark: React.FC<BrandLogoMarkProps> = ({
  className = '',
  sizeClassName = 'w-9 h-9',
  alt = 'Ahmed El-Bialy Leaf Emblem',
}) => {
  return (
    <span
      role="img"
      aria-label={alt}
      className={`relative inline-flex items-center justify-center rounded-full p-[2px] bg-gradient-to-br from-[#027DFD] via-[#00C7FF] to-[#38BDF8] shadow-[0_0_16px_rgba(2,125,253,0.32)] dark:shadow-[0_0_20px_rgba(0,199,255,0.45)] ring-1 ring-white/40 dark:ring-[#00C7FF]/40 shrink-0 ${sizeClassName} ${className}`}
    >
      <span className="relative w-full h-full rounded-full bg-gradient-to-b from-[#0b1324] to-[#050811] overflow-hidden flex items-center justify-center ring-1 ring-white/15">
        {/* Crisp radial sheen behind the Leaf mark for instant figure-ground separation */}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(0,199,255,0.22),transparent_68%)] pointer-events-none"
        />
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-[78%] h-[78%] drop-shadow-[0_1px_4px_rgba(0,199,255,0.4)] select-none pointer-events-none"
        >
          {/* Left pointed triangular stem */}
          <path
            d="M27.5 47.5 L15.5 76.5 L41 76.5"
            stroke="#FFFFFF"
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Continuous Leaf spiral flowing outward to the upper-right tip */}
          <path
            d="M52 54
               C55 54 57.5 51.5 57.5 48
               C57.5 42.5 52 38.5 46 39
               C38.5 39.5 34 46.5 34.5 54.5
               C35.2 65.5 44.5 73.5 56 73
               C69.5 72.5 79.5 61.5 79 47.5
               C78.5 32.5 66 22 50.5 22.5
               C36 23 27 33 24 44.5
               L15.5 76.5"
            stroke="#FFFFFF"
            strokeWidth="7.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Signature upper-right leaf tip flick */}
          <path
            d="M65.5 26.5 C73 28 79 27.5 85.5 21"
            stroke="#FFFFFF"
            strokeWidth="7.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
};
