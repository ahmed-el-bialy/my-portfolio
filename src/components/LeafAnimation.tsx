import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface LeafAnimationProps {
  label?: string;
  sublabel?: string;
  compact?: boolean;
  isDark?: boolean;
  className?: string;
}

/**
 * Clean ringless self-drawing Leaf loader (1.8s loop):
 * Uses an SVG luminance-to-alpha extraction filter + animated stroke reveal mask
 * so Ahmed's exact bold brushstroke Leaf (/brand-logo-mark.png?v=6) paints cleanly
 * directly onto any dark or light backdrop with zero circular/box borders.
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
  const maskId = `leaf-brush-mask-${uid}`;
  const extractId = `leaf-extract-${uid}`;
  const glowId = `leaf-tip-glow-${uid}`;

  const resolvedDark =
    typeof isDark === 'boolean'
      ? isDark
      : typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : true;

  const strokeInk = resolvedDark ? '#F8FAFC' : '#0F172A';
  const phantomOpacity = resolvedDark ? 0.1 : 0.08;

  // Trajectory mapped directly onto /public/brand-logo-mark.png?v=6:
  // Center spiral -> outer arch -> lower-left triangular stem base -> bottom sweep.
  const mainBrushPath =
    'M 57.5 52 C 58 46.5 52.5 41.5 46.5 44.5 C 40 48 41 59.5 50 63.5 C 61 68 70.5 58 69 45 C 67.5 32 54.5 25.5 42 29 C 31.5 32 25.5 45 20.5 60 L 16.5 73 L 54.5 73';

  // Upper-right leaf tip flick sweeping outward from canopy arch
  const tipBrushPath = 'M 65.5 31.5 L 72.5 37 L 83 27.5';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center text-center select-none ${
        compact ? 'py-6 px-4' : 'py-8 px-6'
      } ${className}`}
    >
      {/* Pure Ringless Self-Drawing Leaf Emblem */}
      <div
        className={`relative flex items-center justify-center ${
          compact ? 'w-20 h-20' : 'w-28 h-28 sm:w-32 sm:h-32'
        }`}
      >
        {/* Subtle ambient cyan radial breathing behind Leaf without any hard outline */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full blur-2xl pointer-events-none opacity-45"
          style={{
            background:
              'radial-gradient(circle, rgba(2,125,253,0.34) 0%, rgba(0,199,255,0.12) 55%, transparent 75%)',
          }}
        />

        <svg
          viewBox="0 0 100 100"
          className="relative w-full h-full overflow-visible"
          aria-label="Ahmed El-Bialy Logo Loading"
        >
          <defs>
            {/* Extracts pure white brushstroke texture from brand-logo-mark.png with transparent alpha */}
            <filter id={extractId} colorInterpolationFilters="sRGB">
              <feColorMatrix type="luminanceToAlpha" result="alphaMask" />
              <feFlood floodColor={strokeInk} floodOpacity="1" result="inkColor" />
              <feComposite in="inkColor" in2="alphaMask" operator="in" />
            </filter>

            <mask id={maskId} maskUnits="userSpaceOnUse">
              <rect x="0" y="0" width="100" height="100" fill="black" />
              <motion.path
                d={mainBrushPath}
                fill="none"
                stroke="white"
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={
                  prefersReducedMotion
                    ? { pathLength: 1, opacity: 1 }
                    : { pathLength: 0, pathOffset: 0, opacity: 1 }
                }
                animate={
                  prefersReducedMotion
                    ? { pathLength: 1, opacity: 1 }
                    : {
                        pathLength: [0, 1, 1, 0, 0],
                        pathOffset: [0, 0, 0, 1, 0],
                        opacity: [1, 1, 1, 0.95, 0],
                      }
                }
                transition={
                  prefersReducedMotion
                    ? undefined
                    : {
                        duration: 1.8,
                        times: [0, 0.48, 0.65, 0.95, 1],
                        ease: 'easeInOut',
                        repeat: Infinity,
                      }
                }
              />
              <motion.path
                d={tipBrushPath}
                fill="none"
                stroke="white"
                strokeWidth="17"
                strokeLinecap="round"
                strokeLinejoin="round"
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
                        opacity: [0, 0, 1, 1, 0.92, 0],
                      }
                }
                transition={
                  prefersReducedMotion
                    ? undefined
                    : {
                        duration: 1.8,
                        times: [0, 0.3, 0.5, 0.65, 0.95, 1],
                        ease: 'easeInOut',
                        repeat: Infinity,
                      }
                }
              />
              {/* 100% brushstroke hold pulse so outer bristles are razor-crisp at hold peak */}
              {!prefersReducedMotion && (
                <motion.rect
                  x="0"
                  y="0"
                  width="100"
                  height="100"
                  fill="white"
                  animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
                  transition={{
                    duration: 1.8,
                    times: [0, 0.44, 0.51, 0.64, 0.72, 1],
                    ease: 'easeInOut',
                    repeat: Infinity,
                  }}
                />
              )}
            </mask>

            <filter id={glowId} x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="1.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ultra-faint ghost imprint keeping visual anchor during erase phase */}
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

          {/* Exact Leaf emblem revealed along the animated SVG brush mask */}
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

          {/* Subtle penless electric-cyan glint tracing drawing frontier */}
          {!prefersReducedMotion && (
            <motion.path
              d={mainBrushPath}
              fill="none"
              stroke="#00C7FF"
              strokeOpacity="0.4"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${glowId})`}
              animate={{
                pathLength: [0, 0.14, 0.14, 0, 0],
                pathOffset: [0, 0.86, 0.86, 1, 0],
                opacity: [0, 0.8, 0, 0.5, 0],
              }}
              transition={{
                duration: 1.8,
                times: [0, 0.48, 0.65, 0.95, 1],
                ease: 'easeInOut',
                repeat: Infinity,
              }}
            />
          )}
        </svg>
      </div>

      {/* Understated Fine Progress Line & Whisper Label */}
      {(label || sublabel) && (
        <div className="mt-4 flex flex-col items-center gap-2 max-w-xs">
          <div className="w-24 h-[2px] rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden relative">
            <motion.div
              className="absolute inset-y-0 w-10 rounded-full bg-gradient-to-r from-transparent via-[#027DFD] to-[#00C7FF]"
              animate={prefersReducedMotion ? undefined : { x: [-44, 100] }}
              transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          {label && (
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 tracking-tight">
              {label}
            </p>
          )}
          {sublabel && (
            <p className="text-[10.5px] font-mono text-slate-400 dark:text-slate-500">
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
