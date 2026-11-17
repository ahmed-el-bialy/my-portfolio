import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type LeafAnimationPacing = 'artisan' | 'entry';

interface LeafAnimationProps {
  label?: string;
  sublabel?: string;
  compact?: boolean;
  isDark?: boolean;
  pacing?: LeafAnimationPacing;
  loop?: boolean;
  className?: string;
}

const CALLIGRAPHY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Full Artisan Sequence: 2.4s continuous painterly ink stroke + 1.2s calm hold = 3.6s total
export const LEAF_DRAW_CYCLE_SEC = 3.6;
export const LEAF_DOUBLE_DRAW_MS = 3600;

// Snappy Smart Session Entry: 1.05s continuous stroke + 0.4s calm hold = 1.45s total
export const LEAF_ENTRY_CYCLE_SEC = 1.45;
export const LEAF_ENTRY_DURATION_MS = 1450;

/**
 * Frameless Flash-Free Calligraphy Leaf Loader:
 * Performs a continuous center-outward painterly ink stroke:
 * 1) Inner spiral coil -> 2) Outer canopy arch & architectural base -> 3) Leaf tip flick
 * followed by a calm completed hold before fading out cleanly, traced with a soft cobalt-to-cyan gradient tip.
 */
export const LeafAnimation: React.FC<LeafAnimationProps> = ({
  label,
  sublabel,
  compact = false,
  isDark,
  pacing = 'artisan',
  loop = true,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const maskId = `leaf-calligraphy-mask-${uid}`;
  const extractId = `leaf-luminance-extract-${uid}`;
  const tipGradId = `leaf-painter-grad-${uid}`;
  const tipMaskId = `leaf-tip-softmask-${uid}`;

  const resolvedDark =
    typeof isDark === 'boolean'
      ? isDark
      : typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : true;

  const strokeInk = resolvedDark ? '#F8FAFC' : '#0F172A';
  const phantomOpacity = resolvedDark ? 0.065 : 0.045;

  // Cycle timing calibrated strictly to draw + calm hold ratio (2.4s draw + 1.2s hold = 66.7% draw, 33.3% hold)
  const totalSec = pacing === 'entry' ? LEAF_ENTRY_CYCLE_SEC : LEAF_DRAW_CYCLE_SEC;
  const repeatCount = loop ? Infinity : 0;

  // True center-outward vector choreography aligned seamlessly over /brand-logo-mark.png
  const innerSpiralPath =
    'M 54.5 53.5 C 57 46 51.5 40.5 45 43.5 C 38.5 46.5 39 58 47.5 63 C 56.5 67.5 65.5 59.5 65.5 46';
  const outerArchAndBasePath =
    'M 65.5 46 C 63 32.5 49.5 26 37.5 34.5 C 29.5 40.5 23.5 56 19.5 72.5 L 56.5 72.5';
  const tipFlickPath = 'M 62.5 32 L 72.5 37.5 L 84.5 26.5';

  // Hold cleanly to the end on one-shot runs so the container exit handles fade-out; loop gently dissolves at cycle end
  const fadePoint = loop ? 0.96 : 0.99;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center text-center select-none ${
        compact ? 'py-6 px-4' : 'py-10 px-6'
      } ${className}`}
    >
      {/* Enlarged Frameless Calligraphy Stage */}
      <div
        className={`relative flex items-center justify-center ${
          compact ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-44 h-44 sm:w-56 sm:h-56'
        }`}
      >
        <svg
          viewBox="0 0 100 100"
          className="relative w-full h-full overflow-visible"
          aria-label="Ahmed El-Bialy Leaf Loading"
        >
          <defs>
            {/* Extract pure monochrome silhouette ink from the brand bitmap */}
            <filter id={extractId} colorInterpolationFilters="sRGB">
              <feColorMatrix type="luminanceToAlpha" result="alphaMask" />
              <feFlood floodColor={strokeInk} floodOpacity="1" result="inkColor" />
              <feComposite in="inkColor" in2="alphaMask" operator="in" />
            </filter>

            {/* Soft Cobalt -> Cyan gradient ink tint for the trailing painterly pen tip */}
            <linearGradient id={tipGradId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#027DFD" />
              <stop offset="100%" stopColor="#00C7FF" />
            </linearGradient>

            {/* Soft-edge nib halo without harsh luminance clipping */}
            <filter id={tipMaskId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="0.9" result="softNib" />
              <feMerge>
                <feMergeNode in="softNib" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Unified seamless calligraphy mask: 0 -> 0.667 continuous draw, 0.667 -> 0.96+ calm completed hold */}
            <mask id={maskId} maskUnits="userSpaceOnUse">
              <rect x="0" y="0" width="100" height="100" fill="black" />

              {/* Phase 1 (0.00 -> 0.275): Center Spiral Coil */}
              <motion.path
                d={innerSpiralPath}
                fill="none"
                stroke="white"
                strokeWidth="21"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={
                  prefersReducedMotion
                    ? { pathLength: 1, opacity: 1 }
                    : { pathLength: 0, opacity: 1 }
                }
                animate={
                  prefersReducedMotion
                    ? { pathLength: 1, opacity: 1 }
                    : loop
                    ? {
                        pathLength: [0, 1, 1, 1, 0],
                        opacity: [1, 1, 1, 0, 0],
                      }
                    : {
                        pathLength: [0, 1, 1],
                        opacity: [1, 1, 1],
                      }
                }
                transition={
                  prefersReducedMotion
                    ? undefined
                    : loop
                    ? {
                        duration: totalSec,
                        times: [0, 0.275, fadePoint, 0.995, 1],
                        ease: CALLIGRAPHY_EASE,
                        repeat: repeatCount,
                      }
                    : {
                        duration: totalSec,
                        times: [0, 0.275, 1],
                        ease: CALLIGRAPHY_EASE,
                      }
                }
              />

              {/* Phase 2 (0.26 -> 0.555): Outer Canopy & Architectural Base */}
              <motion.path
                d={outerArchAndBasePath}
                fill="none"
                stroke="white"
                strokeWidth="24"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={
                  prefersReducedMotion
                    ? { pathLength: 1, opacity: 1 }
                    : { pathLength: 0, opacity: 0 }
                }
                animate={
                  prefersReducedMotion
                    ? { pathLength: 1, opacity: 1 }
                    : loop
                    ? {
                        pathLength: [0, 0, 0.02, 1, 1, 1, 0],
                        opacity: [0, 0, 1, 1, 1, 0, 0],
                      }
                    : {
                        pathLength: [0, 0, 0.02, 1, 1],
                        opacity: [0, 0, 1, 1, 1],
                      }
                }
                transition={
                  prefersReducedMotion
                    ? undefined
                    : loop
                    ? {
                        duration: totalSec,
                        times: [0, 0.255, 0.265, 0.555, fadePoint, 0.995, 1],
                        ease: CALLIGRAPHY_EASE,
                        repeat: repeatCount,
                      }
                    : {
                        duration: totalSec,
                        times: [0, 0.255, 0.265, 0.555, 1],
                        ease: CALLIGRAPHY_EASE,
                      }
                }
              />

              {/* Phase 3 (0.54 -> 0.667 = 2.4s): Leaf Tip Flick -> 1.2s calm hold */}
              <motion.path
                d={tipFlickPath}
                fill="none"
                stroke="white"
                strokeWidth="21"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={
                  prefersReducedMotion
                    ? { pathLength: 1, opacity: 1 }
                    : { pathLength: 0, opacity: 0 }
                }
                animate={
                  prefersReducedMotion
                    ? { pathLength: 1, opacity: 1 }
                    : loop
                    ? {
                        pathLength: [0, 0, 0.03, 1, 1, 1, 0],
                        opacity: [0, 0, 1, 1, 1, 0, 0],
                      }
                    : {
                        pathLength: [0, 0, 0.03, 1, 1],
                        opacity: [0, 0, 1, 1, 1],
                      }
                }
                transition={
                  prefersReducedMotion
                    ? undefined
                    : loop
                    ? {
                        duration: totalSec,
                        times: [0, 0.535, 0.545, 0.667, fadePoint, 0.995, 1],
                        ease: CALLIGRAPHY_EASE,
                        repeat: repeatCount,
                      }
                    : {
                        duration: totalSec,
                        times: [0, 0.535, 0.545, 0.667, 1],
                        ease: CALLIGRAPHY_EASE,
                      }
                }
              />
            </mask>
          </defs>

          {/* Whisper-faint balanced ghost imprint */}
          <image
            href="/brand-logo-mark.png?v=6"
            x="0"
            y="0"
            width="100"
            height="100"
            preserveAspectRatio="xMidYMid meet"
            filter={`url(#${extractId})`}
            opacity={phantomOpacity}
          />

          {/* Pure Brushstroke Leaf revealed cleanly along calligraphy order */}
          <image
            href="/brand-logo-mark.png?v=6"
            x="0"
            y="0"
            width="100"
            height="100"
            preserveAspectRatio="xMidYMid meet"
            filter={`url(#${extractId})`}
            mask={`url(#${maskId})`}
          />

          {/* Painterly Cobalt-to-Cyan Soft Gradient Ink Tip tracing active stroke */}
          {!prefersReducedMotion && (
            <>
              <motion.path
                d={innerSpiralPath}
                fill="none"
                stroke={`url(#${tipGradId})`}
                strokeWidth="1.75"
                strokeLinecap="round"
                filter={`url(#${tipMaskId})`}
                animate={{
                  pathLength: [0, 0.16, 0.11, 0, 0],
                  pathOffset: [0, 0.42, 0.89, 1, 0],
                  opacity: [0, 0.58, 0.36, 0, 0],
                }}
                transition={{
                  duration: totalSec,
                  times: [0, 0.135, 0.27, 0.31, 1],
                  ease: CALLIGRAPHY_EASE,
                  repeat: repeatCount,
                }}
              />
              <motion.path
                d={outerArchAndBasePath}
                fill="none"
                stroke={`url(#${tipGradId})`}
                strokeWidth="1.85"
                strokeLinecap="round"
                filter={`url(#${tipMaskId})`}
                animate={{
                  pathLength: [0, 0, 0.15, 0.1, 0, 0],
                  pathOffset: [0, 0, 0.44, 0.9, 1, 0],
                  opacity: [0, 0, 0.58, 0.36, 0, 0],
                }}
                transition={{
                  duration: totalSec,
                  times: [0, 0.26, 0.41, 0.55, 0.59, 1],
                  ease: CALLIGRAPHY_EASE,
                  repeat: repeatCount,
                }}
              />
              <motion.path
                d={tipFlickPath}
                fill="none"
                stroke={`url(#${tipGradId})`}
                strokeWidth="1.75"
                strokeLinecap="round"
                filter={`url(#${tipMaskId})`}
                animate={{
                  pathLength: [0, 0, 0.24, 0, 0],
                  pathOffset: [0, 0, 0.76, 1, 0],
                  opacity: [0, 0, 0.58, 0, 0],
                }}
                transition={{
                  duration: totalSec,
                  times: [0, 0.54, 0.61, 0.69, 1],
                  ease: CALLIGRAPHY_EASE,
                  repeat: repeatCount,
                }}
              />
            </>
          )}
        </svg>
      </div>

      {/* Minimal Architectural Hairline Progress Indicator & Label */}
      {(label || sublabel) && (
        <div className="mt-5 flex flex-col items-center gap-2.5 max-w-xs">
          <div className="w-28 h-[1.5px] rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden relative">
            {loop ? (
              <motion.div
                className="absolute inset-y-0 w-10 rounded-full bg-gradient-to-r from-transparent via-[#027DFD] to-[#00C7FF]"
                animate={prefersReducedMotion ? undefined : { x: [-44, 116] }}
                transition={{ duration: totalSec, repeat: Infinity, ease: CALLIGRAPHY_EASE }}
              />
            ) : (
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#027DFD] to-[#00C7FF] origin-left"
                initial={prefersReducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: totalSec * 0.67, ease: CALLIGRAPHY_EASE }}
              />
            )}
          </div>
          {label && (
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 tracking-tight">
              {label}
            </p>
          )}
          {sublabel && (
            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
