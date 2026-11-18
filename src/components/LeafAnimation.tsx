import React, { useEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type LeafAnimationPacing = 'artisan' | 'entry';

interface LeafAnimationProps {
  label?: string;
  sublabel?: string;
  compact?: boolean;
  isDark?: boolean;
  pacing?: LeafAnimationPacing;
  cycles?: number;
  loop?: boolean;
  showProgress?: boolean;
  progress?: number;
  isReadyRef?: React.MutableRefObject<boolean>;
  onSequenceComplete?: () => void;
  className?: string;
}

const CALLIGRAPHY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Precision Artisan Sequence: 2.4s continuous painterly ink stroke + 1.2s calm hold = 3.6s total
export const LEAF_DRAW_CYCLE_SEC = 3.6;
export const LEAF_DOUBLE_DRAW_MS = 3600;

// Session Start Entry Sequence: calm 2.2s artistic draw (~4.4s total across 2 clear cycles)
export const LEAF_ENTRY_CYCLE_SEC = 2.2;
export const LEAF_ENTRY_DURATION_MS = 2200;

const STAMP_SIZE = 320;

let cachedLogoPromise: Promise<HTMLImageElement> | null = null;
function loadBrandLeafImage(): Promise<HTMLImageElement> {
  if (cachedLogoPromise) return cachedLogoPromise;
  cachedLogoPromise = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => {
      cachedLogoPromise = null;
      reject(err);
    };
    img.src = '/brand-logo-mark.png?v=6';
  });
  return cachedLogoPromise;
}

// Kick off brand leaf preload immediately at module evaluation to avoid cold-load flash
if (typeof window !== 'undefined') {
  loadBrandLeafImage().catch(() => {});
}

/**
 * Extract pure transparent monochrome leaf ink stamp once per theme
 * (strips black background + alpha corners cleanly so zero per-frame SVG filters run).
 */
function buildLeafInkStamp(img: HTMLImageElement, isDark: boolean): HTMLCanvasElement {
  const offscreen = document.createElement('canvas');
  offscreen.width = STAMP_SIZE;
  offscreen.height = STAMP_SIZE;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return offscreen;

  ctx.drawImage(img, 0, 0, STAMP_SIZE, STAMP_SIZE);
  const imgData = ctx.getImageData(0, 0, STAMP_SIZE, STAMP_SIZE);
  const data = imgData.data;

  // Dark Obsidian -> luminous chalk white (#f8fafc); Light Studio -> deep slate (#0f172a)
  const inkR = isDark ? 248 : 15;
  const inkG = isDark ? 250 : 23;
  const inkB = isDark ? 252 : 42;

  for (let i = 0; i < data.length; i += 4) {
    const srcAlpha = data[i + 3];
    if (srcAlpha === 0) {
      data[i + 3] = 0;
      continue;
    }
    const lum = 0.25 * data[i] + 0.75 * data[i + 1] + 0.12 * data[i + 2] - 12;
    const clampedLum = Math.max(0, Math.min(255, lum));
    const finalAlpha = Math.round((clampedLum * srcAlpha) / 255);

    data[i] = inkR;
    data[i + 1] = inkG;
    data[i + 2] = inkB;
    data[i + 3] = finalAlpha;
  }

  ctx.putImageData(imgData, 0, 0);
  return offscreen;
}

interface SampledPoint {
  x: number;
  y: number;
}

interface MemoizedStroke {
  path2D: Path2D;
  strokeWidth: number;
  points: SampledPoint[];
  cumLengths: number[];
  totalLength: number;
}

type BezierCommand =
  | { type: 'M'; x: number; y: number }
  | { type: 'C'; cp1x: number; cp1y: number; cp2x: number; cp2y: number; x: number; y: number }
  | { type: 'L'; x: number; y: number };

function sampleCommands(commands: BezierCommand[], strokeWidth: number): MemoizedStroke {
  const path2D = new Path2D();
  const points: SampledPoint[] = [];
  let curX = 0;
  let curY = 0;

  for (const cmd of commands) {
    if (cmd.type === 'M') {
      path2D.moveTo(cmd.x, cmd.y);
      curX = cmd.x;
      curY = cmd.y;
      points.push({ x: curX, y: curY });
    } else if (cmd.type === 'C') {
      path2D.bezierCurveTo(cmd.cp1x, cmd.cp1y, cmd.cp2x, cmd.cp2y, cmd.x, cmd.y);
      const steps = 28;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const mt = 1 - t;
        const x =
          mt * mt * mt * curX +
          3 * mt * mt * t * cmd.cp1x +
          3 * mt * t * t * cmd.cp2x +
          t * t * t * cmd.x;
        const y =
          mt * mt * mt * curY +
          3 * mt * mt * t * cmd.cp1y +
          3 * mt * t * t * cmd.cp2y +
          t * t * t * cmd.y;
        points.push({ x, y });
      }
      curX = cmd.x;
      curY = cmd.y;
    } else if (cmd.type === 'L') {
      path2D.lineTo(cmd.x, cmd.y);
      const steps = 16;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        points.push({
          x: curX + (cmd.x - curX) * t,
          y: curY + (cmd.y - curY) * t,
        });
      }
      curX = cmd.x;
      curY = cmd.y;
    }
  }

  const cumLengths: number[] = [0];
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    totalLength += Math.hypot(dx, dy);
    cumLengths.push(totalLength);
  }

  return { path2D, strokeWidth, points, cumLengths, totalLength };
}

function getPointAtFraction(stroke: MemoizedStroke, frac: number): SampledPoint {
  const clamped = Math.max(0, Math.min(1, frac));
  const targetLen = clamped * stroke.totalLength;
  const { cumLengths, points } = stroke;
  for (let i = 1; i < cumLengths.length; i++) {
    if (cumLengths[i] >= targetLen) {
      const prevLen = cumLengths[i - 1];
      const segLen = cumLengths[i] - prevLen || 1;
      const ratio = (targetLen - prevLen) / segLen;
      return {
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * ratio,
        y: points[i - 1].y + (points[i].y - points[i - 1].y) * ratio,
      };
    }
  }
  return points[points.length - 1] || { x: 50, y: 50 };
}

function easeOutCubic(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return 1 - Math.pow(1 - c, 3);
}

/**
 * Hardware-Accelerated Canvas + requestAnimationFrame Calligraphy Leaf Loader:
 * Uses memoized Path2D curves, pre-extracted luminance-to-alpha ink stamps, and a reusable
 * offscreen mask buffer inside rAF to achieve butter-smooth 60fps painterly drawing with zero
 * scroll-related SVG filter stalls or CPU spikes.
 */
export const LeafAnimation: React.FC<LeafAnimationProps> = ({
  label,
  sublabel,
  compact = false,
  isDark,
  pacing = 'artisan',
  cycles = 1,
  loop = true,
  showProgress = false,
  progress,
  isReadyRef,
  onSequenceComplete,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const inkStampRef = useRef<HTMLCanvasElement | null>(null);
  const redrawLastFrameRef = useRef<(() => void) | null>(null);
  const percentTextRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const showProgressRef = useRef<boolean>(showProgress);
  const hasExternalProgressRef = useRef<boolean>(typeof progress === 'number');
  const onSequenceCompleteRef = useRef<(() => void) | undefined>(onSequenceComplete);
  const lastPctRef = useRef<number>(prefersReducedMotion ? 100 : 0);
  const completedEmittedRef = useRef<boolean>(false);

  showProgressRef.current = showProgress;
  hasExternalProgressRef.current = typeof progress === 'number';
  onSequenceCompleteRef.current = onSequenceComplete;

  const resolvedDark =
    typeof isDark === 'boolean'
      ? isDark
      : typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : true;

  const safeCycles = Math.max(1, Math.round(cycles));
  const totalSec = pacing === 'entry' ? LEAF_ENTRY_CYCLE_SEC : LEAF_DRAW_CYCLE_SEC;
  const totalMs = totalSec * 1000;
  const sequenceMs = totalMs * safeCycles;

  // Memoize geometric Path2D calligraphy curves + length LUT once
  const memoizedStrokes = useMemo(() => {
    const innerSpiral = sampleCommands(
      [
        { type: 'M', x: 56, y: 54 },
        { type: 'C', cp1x: 58, cp1y: 46, cp2x: 50, cp2y: 41, x: 44, y: 45 },
        { type: 'C', cp1x: 38, cp1y: 50, cp2x: 40, cp2y: 62, x: 51, y: 64 },
        { type: 'C', cp1x: 62, cp1y: 66, cp2x: 69, cp2y: 57, x: 67, y: 45 },
      ],
      26
    );
    const outerArchAndBase = sampleCommands(
      [
        { type: 'M', x: 67, y: 45 },
        { type: 'C', cp1x: 63, cp1y: 32, cp2x: 45, cp2y: 27, x: 34, y: 39 },
        { type: 'C', cp1x: 28, cp1y: 46, cp2x: 23, cp2y: 60, x: 19, y: 73 },
        { type: 'L', x: 57, y: 73 },
      ],
      28
    );
    const tipFlick = sampleCommands(
      [
        { type: 'M', x: 64, y: 33 },
        { type: 'L', x: 73, y: 39 },
        { type: 'L', x: 83, y: 28 },
      ],
      26
    );
    return { innerSpiral, outerArchAndBase, tipFlick };
  }, []);

  // Build clean monochrome transparent ink stamp without interrupting the active rAF timeline
  useEffect(() => {
    let active = true;
    loadBrandLeafImage()
      .then((img) => {
        if (!active) return;
        inkStampRef.current = buildLeafInkStamp(img, resolvedDark);
        redrawLastFrameRef.current?.();
      })
      .catch(() => {
        // Fallback path rendering handles missing image gracefully
      });
    return () => {
      active = false;
    };
  }, [resolvedDark]);

  // Dedicated requestAnimationFrame painterly stroke loop with clean cancellation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!maskCanvasRef.current) {
      maskCanvasRef.current = document.createElement('canvas');
    }
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const cssSize = compact ? 112 : 224;
    const backingSize = Math.round(cssSize * dpr);

    if (canvas.width !== backingSize || canvas.height !== backingSize) {
      canvas.width = backingSize;
      canvas.height = backingSize;
    }
    if (maskCanvas.width !== backingSize || maskCanvas.height !== backingSize) {
      maskCanvas.width = backingSize;
      maskCanvas.height = backingSize;
    }

    const scale = backingSize / 100;
    const startTime = performance.now();
    let rafId = 0;

    const drawFrame = (now: number) => {
      const elapsed = now - startTime;
      const clampedElapsed = Math.min(elapsed, sequenceMs);
      const currentCycleIndex = loop
        ? 0
        : Math.min(safeCycles - 1, Math.floor(clampedElapsed / totalMs));
      const cycleElapsed = clampedElapsed - currentCycleIndex * totalMs;
      const isSequenceFinished = !loop && clampedElapsed >= sequenceMs;

      const u = prefersReducedMotion
        ? 0.85
        : loop
        ? (elapsed % totalMs) / totalMs
        : isSequenceFinished
        ? 1
        : cycleElapsed / totalMs;

      const s1 = u <= 0 ? 0 : u >= 0.30 ? 1 : easeOutCubic(u / 0.30);
      const s2 = u <= 0.28 ? 0 : u >= 0.60 ? 1 : easeOutCubic((u - 0.28) / 0.32);
      const s3 = u <= 0.58 ? 0 : u >= 0.74 ? 1 : easeOutCubic((u - 0.58) / 0.16);

      const isFinalPass = currentCycleIndex >= safeCycles - 1;
      const fadeAlpha = loop
        ? u > 0.96
          ? Math.max(0, 1 - (u - 0.96) / 0.04)
          : 1
        : !isFinalPass && u > 0.86
        ? Math.max(0.06, 1 - (u - 0.86) / 0.14)
        : 1;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, backingSize, backingSize);

      const stamp = inkStampRef.current;
      const phantomOpacity = resolvedDark ? 0.085 : 0.06;

      // 1. Subtle ghost silhouette guide
      if (stamp) {
        ctx.save();
        ctx.globalAlpha = phantomOpacity;
        ctx.drawImage(stamp, 0, 0, backingSize, backingSize);
        ctx.restore();
      }

      // 2. Progressive brushstroke reveal onto reusable offscreen mask buffer
      maskCtx.setTransform(1, 0, 0, 1, 0, 0);
      maskCtx.clearRect(0, 0, backingSize, backingSize);
      maskCtx.save();
      maskCtx.scale(scale, scale);
      maskCtx.lineCap = 'round';
      maskCtx.lineJoin = 'round';
      maskCtx.strokeStyle = stamp
        ? '#ffffff'
        : resolvedDark
        ? '#f8fafc'
        : '#0f172a';

      const drawMaskedSegment = (stroke: MemoizedStroke, fraction: number, fallbackWidth: number) => {
        if (fraction <= 0.002) return;
        const visibleLen = stroke.totalLength * fraction;
        maskCtx.lineWidth = stamp ? stroke.strokeWidth : fallbackWidth;
        maskCtx.setLineDash([visibleLen, stroke.totalLength * 2 + 40]);
        maskCtx.lineDashOffset = 0;
        maskCtx.stroke(stroke.path2D);
      };

      drawMaskedSegment(memoizedStrokes.innerSpiral, s1, 4.6);
      drawMaskedSegment(memoizedStrokes.outerArchAndBase, s2, 5.2);
      drawMaskedSegment(memoizedStrokes.tipFlick, s3, 4.8);
      maskCtx.restore();

      // Composite crisp monochrome ink stamp strictly inside the painted mask strokes
      if (stamp) {
        maskCtx.save();
        maskCtx.globalCompositeOperation = 'source-in';
        maskCtx.drawImage(stamp, 0, 0, backingSize, backingSize);
        maskCtx.restore();
      }

      ctx.save();
      ctx.globalAlpha = fadeAlpha;
      ctx.drawImage(maskCanvas, 0, 0);
      ctx.restore();

      // 3. Trailing Cobalt-to-Cyan Painterly Gradient Ink Tip (active during stroke phases)
      if (!prefersReducedMotion && u < 0.745) {
        let activeNib: SampledPoint | null = null;
        let nibAlpha = 1;

        if (u < 0.30 && s1 > 0.02) {
          activeNib = getPointAtFraction(memoizedStrokes.innerSpiral, s1);
          nibAlpha = u > 0.265 ? (0.30 - u) / 0.035 : 1;
        } else if (u >= 0.28 && u < 0.60 && s2 > 0.02) {
          activeNib = getPointAtFraction(memoizedStrokes.outerArchAndBase, s2);
          nibAlpha = u > 0.565 ? (0.60 - u) / 0.035 : 1;
        } else if (u >= 0.58 && u < 0.745 && s3 > 0.02) {
          activeNib = getPointAtFraction(memoizedStrokes.tipFlick, s3);
          nibAlpha = u > 0.71 ? Math.max(0, (0.745 - u) / 0.035) : 1;
        }

        if (activeNib && nibAlpha > 0.02) {
          const nx = activeNib.x * scale;
          const ny = activeNib.y * scale;
          const haloRadius = 6.2 * scale;

          ctx.save();
          ctx.globalAlpha = nibAlpha * fadeAlpha;
          const grad = ctx.createRadialGradient(nx, ny, 0.5 * scale, nx, ny, haloRadius);
          grad.addColorStop(0, 'rgba(0, 199, 255, 0.95)');
          grad.addColorStop(0.42, 'rgba(2, 132, 255, 0.55)');
          grad.addColorStop(1, 'rgba(2, 132, 255, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(nx, ny, haloRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#00C7FF';
          ctx.beginPath();
          ctx.arc(nx, ny, 1.85 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      const gateReady = isReadyRef ? isReadyRef.current || elapsed >= sequenceMs + 400 : true;

      if (showProgressRef.current && !hasExternalProgressRef.current) {
        const rawRatio = prefersReducedMotion
          ? 1
          : loop
          ? (elapsed % totalMs) / (totalMs * 0.85)
          : elapsed / (sequenceMs * 0.9);
        const easedPct = Math.round(easeOutCubic(Math.min(1, rawRatio)) * 100);
        const cappedPct = gateReady ? easedPct : Math.min(96, easedPct);

        if (cappedPct !== lastPctRef.current) {
          lastPctRef.current = cappedPct;
          if (percentTextRef.current) {
            percentTextRef.current.textContent = `${cappedPct}%`;
          }
          if (progressBarRef.current) {
            progressBarRef.current.style.transform = `scaleX(${cappedPct / 100})`;
          }
        }
      }

      if (!loop && !completedEmittedRef.current && (prefersReducedMotion || (elapsed >= sequenceMs && gateReady))) {
        completedEmittedRef.current = true;
        if (percentTextRef.current) {
          percentTextRef.current.textContent = '100%';
        }
        if (progressBarRef.current) {
          progressBarRef.current.style.transform = 'scaleX(1)';
        }
        window.setTimeout(() => {
          onSequenceCompleteRef.current?.();
        }, 90);
      }

      if (!prefersReducedMotion && (loop || !completedEmittedRef.current)) {
        rafId = window.requestAnimationFrame(drawFrame);
      }
    };

    redrawLastFrameRef.current = () => {
      drawFrame(performance.now());
    };

    rafId = window.requestAnimationFrame(drawFrame);
    return () => {
      redrawLastFrameRef.current = null;
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [compact, isReadyRef, loop, memoizedStrokes, prefersReducedMotion, resolvedDark, safeCycles, sequenceMs, totalMs]);

  const initialStaticPercent =
    typeof progress === 'number'
      ? Math.max(0, Math.min(100, Math.round(progress)))
      : prefersReducedMotion
      ? 100
      : 0;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center text-center select-none ${
        compact ? 'py-6 px-4' : 'py-10 px-6'
      } ${className}`}
    >
      {/* Enlarged Frameless GPU Canvas Calligraphy Stage */}
      <div
        className={`relative flex items-center justify-center ${
          compact ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-44 h-44 sm:w-56 sm:h-56'
        }`}
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-4 rounded-full bg-gradient-to-tr from-[#0284ff]/15 via-[#00C7FF]/10 to-transparent"
          animate={
            prefersReducedMotion
              ? undefined
              : { scale: [0.94, 1.06, 0.94], opacity: [0.45, 0.85, 0.45] }
          }
          transition={{ duration: totalSec, repeat: Infinity, ease: 'easeInOut' }}
        />

        <canvas
          ref={canvasRef}
          aria-label="Ahmed El-Bialy Leaf Loading"
          className="relative w-full h-full block"
        />
      </div>

      {/* Minimal Architectural Hairline Progress Indicator, Percentage & Label */}
      {(label || sublabel || showProgress) && (
        <div className="mt-5 flex flex-col items-center gap-2.5 max-w-xs w-full">
          {showProgress && (
            <div
              ref={percentTextRef}
              className="font-display text-2xl sm:text-[26px] font-extrabold tabular-nums tracking-tight bg-gradient-to-r from-[#0284ff] via-[#00C7FF] to-sky-400 bg-clip-text text-transparent"
            >
              {initialStaticPercent}%
            </div>
          )}

          <div className="w-36 sm:w-44 h-[2.5px] rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden relative">
            {showProgress ? (
              <div
                ref={progressBarRef}
                className="progress-bar h-full w-full origin-left rounded-full bg-gradient-to-r from-[#0284ff] via-[#00C7FF] to-sky-400 will-change-transform"
                style={{
                  transform: `scaleX(${initialStaticPercent / 100})`,
                }}
              />
            ) : loop ? (
              <motion.div
                className="absolute inset-y-0 w-10 rounded-full bg-gradient-to-r from-transparent via-[#0284ff] to-[#00C7FF]"
                animate={prefersReducedMotion ? undefined : { x: [-44, 152] }}
                transition={{ duration: totalSec, repeat: Infinity, ease: CALLIGRAPHY_EASE }}
              />
            ) : (
              <motion.div
                className="progress-bar h-full rounded-full bg-gradient-to-r from-[#0284ff] to-[#00C7FF] origin-left"
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
