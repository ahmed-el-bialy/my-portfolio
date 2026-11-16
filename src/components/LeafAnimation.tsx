import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface LeafAnimationProps {
  label?: string;
  sublabel?: string;
  compact?: boolean;
  isDark?: boolean;
  className?: string;
}

const CALLIGRAPHY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
// 4.40s per serene loop:
// - 0.00 -> 0.50 (2.20s): slow deliberate calligraphy draw (spiral -> dome/base -> tip)
// - 0.50 -> 0.91 (1.80s): full 1.8s steady stationary emblem hold
// - 0.91 -> 0.99 (0.35s): synchronized smooth dissolve before silent reset
export const LEAF_DRAW_CYCLE_SEC = 4.4;
export const LEAF_DOUBLE_DRAW_MS = 3900;

/**
 * Large Frameless Flash-Free Calligraphy Leaf Loader:
 * Sequentially hand-draws Ahmed's brushstroke Leaf mark (/brand-logo-mark.png?v=6):
 * 1) Inner spiral coil -> 2) Outer canopy arch & triangle base -> 3) Leaf tip flick
 * Holds for a full 1.8s as the complete emblem before softly dissolving synchronously.
 */
export const LeafAnimation: React.FC<LeafAnimationProps> = ({
  label,
  sublabel,
  compact = false,
  isDark,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const maskId = `leaf-calligraphy-mask-${uid}`;
  const extractId = `leaf-luminance-extract-${uid}`;
  const nibGlowId = `leaf-nib-glow-${uid}`;

  const resolvedDark =
    typeof isDark === 'boolean'
      ? isDark
      : typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : true;

  const strokeInk = resolvedDark ? '#F8FAFC' : '#0F172A';
  const phantomOpacity = resolvedDark ? 0.065 : 0.045;

  const innerSpiralPath =
    'M 55.5 53.5 C 57 46 51.5 40.5 45 43.5 C 38.5 46.5 39 58 47.5 63 C 56.5 67.5 66 59 65.5 46';
  const outerArchAndBasePath =
    'M 65.5 46 C 63 32.5 49.5 26 37.5 34.5 C 29.5 40.5 24 56 19.5 72.5 L 56 72.5';
  const tipFlickPath = 'M 63.5 31.5 L 72.5 37.5 L 84 27';

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
          compact ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-40 h-40 sm:w-48 sm:h-48'
        }`}
      >
        <svg
          viewBox="0 0 100 100"
          className="relative w-full h-full overflow-visible"
          aria-label="Ahmed El-Bialy Leaf Loading"
        >
          <defs>
            <filter id={extractId} colorInterpolationFilters="sRGB">
              <feColorMatrix type="luminanceToAlpha" result="alphaMask" />
              <feFlood floodColor={strokeInk} floodOpacity="1" result="inkColor" />
              <feComposite in="inkColor" in2="alphaMask" operator="in" />
            </filter>

            <filter id={nibGlowId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.15" result="softGlow" />
              <feMerge>
                <feMergeNode in="softGlow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <mask id={maskId} maskUnits="userSpaceOnUse">
              <rect x="0" y="0" width="100" height="100" fill="black" />

              {/* Stroke 1: Center Spiral Coil (0.00 -> 0.22), holds 1.8s until 0.91, fades cleanly 0.91 -> 0.99 */}
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
                    : {
                        pathLength: [0, 1, 1, 1, 0],
                        opacity: [1, 1, 1, 0, 0],
                      }
                }
                transition={
                  prefersReducedMotion
                    ? undefined
                    : {
                        duration: LEAF_DRAW_CYCLE_SEC,
                        times: [0, 0.22, 0.91, 0.99, 1],
                        ease: CALLIGRAPHY_EASE,
                        repeat: Infinity,
                      }
                }
              />

              {/* Stroke 2: Outer Canopy & Triangle Base (0.16 -> 0.41), holds solid to 0.91, fades synchronously */}
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
                    : {
                        pathLength: [0, 0, 1, 1, 1, 0],
                        opacity: [0, 0, 1, 1, 0, 0],
                      }
                }
                transition={
                  prefersReducedMotion
                    ? undefined
                    : {
                        duration: LEAF_DRAW_CYCLE_SEC,
                        times: [0, 0.16, 0.41, 0.91, 0.99, 1],
                        ease: CALLIGRAPHY_EASE,
                        repeat: Infinity,
                      }
                }
              />

              {/* Stroke 3: Tip Flick (0.36 -> 0.50), holds full 1.80s until 0.91, fades smoothly 0.91 -> 0.99 */}
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
                    : {
                        pathLength: [0, 0, 1, 1, 1, 0],
                        opacity: [0, 0, 1, 1, 0, 0],
                      }
                }
                transition={
                  prefersReducedMotion
                    ? undefined
                    : {
                        duration: LEAF_DRAW_CYCLE_SEC,
                        times: [0, 0.36, 0.5, 0.91, 0.99, 1],
                        ease: CALLIGRAPHY_EASE,
                        repeat: Infinity,
                      }
                }
              />
            </mask>
          </defs>

          {/* Whisper-faint ghost imprint anchoring balance */}
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

          {/* Pure Brushstroke Leaf revealed smoothly along strokes with zero luminance snap */}
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

          {/* Calm Subtle Cyan Nib Glint following active pen trajectory */}
          {!prefersReducedMotion && (
            <>
              <motion.path
                d={innerSpiralPath}
                fill="none"
                stroke="#00C7FF"
                strokeWidth="1.35"
                strokeLinecap="round"
                filter={`url(#${nibGlowId})`}
                animate={{
                  pathLength: [0, 0.14, 0.1, 0, 0],
                  pathOffset: [0, 0.42, 0.88, 1, 0],
                  opacity: [0, 0.36, 0.28, 0, 0],
                }}
                transition={{
                  duration: LEAF_DRAW_CYCLE_SEC,
                  times: [0, 0.11, 0.22, 0.27, 1],
                  ease: CALLIGRAPHY_EASE,
                  repeat: Infinity,
                }}
              />
              <motion.path
                d={outerArchAndBasePath}
                fill="none"
                stroke="#00C7FF"
                strokeWidth="1.45"
                strokeLinecap="round"
                filter={`url(#${nibGlowId})`}
                animate={{
                  pathLength: [0, 0, 0.13, 0.09, 0, 0],
                  pathOffset: [0, 0, 0.44, 0.9, 1, 0],
                  opacity: [0, 0, 0.38, 0.28, 0, 0],
                }}
                transition={{
                  duration: LEAF_DRAW_CYCLE_SEC,
                  times: [0, 0.16, 0.29, 0.41, 0.46, 1],
                  ease: CALLIGRAPHY_EASE,
                  repeat: Infinity,
                }}
              />
              <motion.path
                d={tipFlickPath}
                fill="none"
                stroke="#00C7FF"
                strokeWidth="1.35"
                strokeLinecap="round"
                filter={`url(#${nibGlowId})`}
                animate={{
                  pathLength: [0, 0, 0.2, 0, 0],
                  pathOffset: [0, 0, 0.78, 1, 0],
                  opacity: [0, 0, 0.38, 0, 0],
                }}
                transition={{
                  duration: LEAF_DRAW_CYCLE_SEC,
                  times: [0, 0.36, 0.47, 0.54, 1],
                  ease: CALLIGRAPHY_EASE,
                  repeat: Infinity,
                }}
              />
            </>
          )}
        </svg>
      </div>

      {/* Hairline Progress Rule & Calm Bilingual Label */}
      {(label || sublabel) && (
        <div className="mt-5 flex flex-col items-center gap-2.5 max-w-xs">
          <div className="w-28 h-[2px] rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden relative">
            <motion.div
              className="absolute inset-y-0 w-12 rounded-full bg-gradient-to-r from-transparent via-[#027DFD] to-[#00C7FF]"
              animate={prefersReducedMotion ? undefined : { x: [-52, 116] }}
              transition={{ duration: LEAF_DRAW_CYCLE_SEC, repeat: Infinity, ease: CALLIGRAPHY_EASE }}
            />
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
