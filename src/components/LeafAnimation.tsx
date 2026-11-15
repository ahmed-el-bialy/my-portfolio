import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface LeafAnimationProps {
  label?: string;
  sublabel?: string;
  compact?: boolean;
  className?: string;
}

/**
 * LeafAnimation renders a penless SVG calligraphy stroke simulation of the
 * Konoha Leaf emblem that smoothly draws itself, pauses with a subtle cyan/blue
 * glow, erases cleanly along the stroke, and loops during section transitions.
 */
export const LeafAnimation: React.FC<LeafAnimationProps> = ({
  label,
  sublabel,
  compact = false,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Continuous inner spiral unwinding outward into the lower-left triangular stem base
  const spiralAndStemPath =
    'M 54 55 C 58.5 54 60.5 48.5 57 44.5 C 52.5 39.5 44 41.5 41.5 48.5 C 38.5 57.5 45.5 67 56.5 66.5 C 68.5 66 76.5 55.5 75 43 C 73.5 30 61 22.5 47.5 24 C 34 25.5 25.5 36.5 21 50 L 13.5 73 L 52 73';

  // Signature upper-right leaf tip flick extending from the outer canopy arch
  const tipFlickPath = 'M 65.5 26.5 L 74.5 31.5 L 87.5 20';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center text-center select-none ${
        compact ? 'py-8 px-4' : 'py-12 px-6'
      } ${className}`}
    >
      {/* Thin Glowing Blue Ring Frame + Self-Drawing SVG Canvas */}
      <div
        className={`relative flex items-center justify-center rounded-full bg-black/95 p-[2px] bg-gradient-to-br from-[#027DFD] via-[#00C7FF] to-[#38BDF8] shadow-[0_0_26px_rgba(2,125,253,0.4)] dark:shadow-[0_0_34px_rgba(0,199,255,0.34)] ${
          compact ? 'w-20 h-20' : 'w-24 h-24 sm:w-28 sm:h-28'
        }`}
      >
        <div className="w-full h-full rounded-full bg-black p-2.5 flex items-center justify-center relative">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="leafAnimGrad" x1="12%" y1="80%" x2="88%" y2="20%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="65%" stopColor="#E0F2FE" />
                <stop offset="100%" stopColor="#00C7FF" />
              </linearGradient>
              <filter id="leafAnimGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.8" floodColor="#00C7FF" floodOpacity="0.65" />
              </filter>
            </defs>

            {/* Faint guide track to preserve subtle leaf silhouette while erasing */}
            <path
              d={spiralAndStemPath}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="5.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={tipFlickPath}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="5.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Penless draw -> hold -> erase spiral + stem */}
            <motion.path
              d={spiralAndStemPath}
              stroke="url(#leafAnimGrad)"
              strokeWidth="5.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#leafAnimGlow)"
              initial={
                prefersReducedMotion
                  ? { pathLength: 1, opacity: 1 }
                  : { pathLength: 0, pathOffset: 0, opacity: 0.95 }
              }
              animate={
                prefersReducedMotion
                  ? { pathLength: 1, opacity: 1 }
                  : {
                      pathLength: [0, 1, 1, 0, 0],
                      pathOffset: [0, 0, 0, 1, 0],
                      opacity: [0.85, 1, 1, 0.75, 0],
                    }
              }
              transition={
                prefersReducedMotion
                  ? undefined
                  : {
                      duration: 2.0,
                      times: [0, 0.44, 0.58, 0.92, 1],
                      ease: 'easeInOut',
                      repeat: Infinity,
                    }
              }
            />

            {/* Penless draw -> hold -> erase tip flick */}
            <motion.path
              d={tipFlickPath}
              stroke="url(#leafAnimGrad)"
              strokeWidth="5.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#leafAnimGlow)"
              initial={
                prefersReducedMotion
                  ? { pathLength: 1, opacity: 1 }
                  : { pathLength: 0, pathOffset: 0, opacity: 0 }
              }
              animate={
                prefersReducedMotion
                  ? { pathLength: 1, opacity: 1 }
                  : {
                      pathLength: [0, 0, 1, 1, 0, 0],
                      pathOffset: [0, 0, 0, 0, 1, 0],
                      opacity: [0, 0, 1, 1, 0.65, 0],
                    }
              }
              transition={
                prefersReducedMotion
                  ? undefined
                  : {
                      duration: 2.0,
                      times: [0, 0.28, 0.48, 0.58, 0.92, 1],
                      ease: 'easeInOut',
                      repeat: Infinity,
                    }
              }
            />
          </svg>
        </div>
      </div>

      {label && (
        <p className="mt-4 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
          {label}
        </p>
      )}
      {sublabel && (
        <p className="mt-1 text-[11px] font-mono text-[#027DFD] dark:text-[#00C7FF]">
          {sublabel}
        </p>
      )}
    </div>
  );
};
