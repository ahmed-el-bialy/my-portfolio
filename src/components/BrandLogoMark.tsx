import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';

interface BrandLogoMarkProps {
  className?: string;
  sizeClassName?: string;
  alt?: string;
  floatEffect?: boolean;
  floatMode?: 'sway' | 'vertical';
  showBlueRing?: boolean;
  floatingInk?: boolean;
  fieldRef?: React.RefObject<HTMLElement | null>;
}

interface ExtractedInkSet {
  primarySrc: string;
  echoSrc: string;
}

interface ThemeInkAssets {
  dark: ExtractedInkSet;
  light: ExtractedInkSet;
}

const STAMP_RES = 320;
const IDLE_DELAY_MS = 3000;
const ECHO_SETTLE_MS = 165;
let cachedInkPromise: Promise<ThemeInkAssets> | null = null;

/**
 * Extracts crisp transparent brushstroke leaf bitmaps from source artwork:
 * 1. Strips circular container background completely.
 * 2. Applies a shadow-recovery power curve (pow 0.34) so darker shaded dry-brush edges
 *    and delicate bristle strokes remain razor-sharp over any background.
 * 3. Tight-crops around true leaf ink bounds and generates smoked slate-grey echo variants.
 */
function renderCroppedTintedBitmap(
  rawCanvas: HTMLCanvasElement,
  cropX: number,
  cropY: number,
  cropW: number,
  cropH: number,
  r: number,
  g: number,
  b: number
): string {
  const outCanvas = document.createElement('canvas');
  outCanvas.width = STAMP_RES;
  outCanvas.height = STAMP_RES;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return '';

  const padding = STAMP_RES * 0.08;
  const usable = STAMP_RES - padding * 2;
  const scale = Math.min(usable / cropW, usable / cropH);
  const drawW = cropW * scale;
  const drawH = cropH * scale;
  const dx = (STAMP_RES - drawW) / 2;
  const dy = (STAMP_RES - drawH) / 2;

  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';
  outCtx.drawImage(rawCanvas, cropX, cropY, cropW, cropH, dx, dy, drawW, drawH);

  const imgData = outCtx.getImageData(0, 0, STAMP_RES, STAMP_RES);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const srcA = data[i + 3];
    if (srcA === 0) {
      data[i + 3] = 0;
      continue;
    }

    const lum = 0.26 * data[i] + 0.68 * data[i + 1] + 0.12 * data[i + 2];
    if (lum <= 10) {
      data[i + 3] = 0;
      continue;
    }

    const norm = Math.min(1, (lum - 10) / 245);
    const boosted = Math.pow(norm, 0.34);
    const finalAlpha = Math.min(255, Math.round(boosted * srcA));

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = finalAlpha;
  }

  outCtx.putImageData(imgData, 0, 0);
  return outCanvas.toDataURL('image/png');
}

function loadThemeInkAssets(): Promise<ThemeInkAssets> {
  if (cachedInkPromise) return cachedInkPromise;

  cachedInkPromise = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth || 512;
        const h = img.naturalHeight || 512;
        const rawCanvas = document.createElement('canvas');
        rawCanvas.width = w;
        rawCanvas.height = h;
        const ctx = rawCanvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const raw = ctx.getImageData(0, 0, w, h).data;

        let minX = w;
        let minY = h;
        let maxX = 0;
        let maxY = 0;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            if (raw[idx + 3] < 20) continue;
            const lum = 0.26 * raw[idx] + 0.68 * raw[idx + 1] + 0.12 * raw[idx + 2];
            if (lum > 24) {
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }

        const cropX = maxX > minX ? Math.max(0, minX - 4) : 0;
        const cropY = maxY > minY ? Math.max(0, minY - 4) : 0;
        const cropW = maxX > minX ? Math.min(w - cropX, maxX - minX + 8) : w;
        const cropH = maxY > minY ? Math.min(h - cropY, maxY - minY + 8) : h;

        resolve({
          dark: {
            primarySrc: renderCroppedTintedBitmap(rawCanvas, cropX, cropY, cropW, cropH, 248, 250, 252), // #f8fafc Crisp Chalk
            echoSrc: renderCroppedTintedBitmap(rawCanvas, cropX, cropY, cropW, cropH, 148, 163, 184), // #94a3b8 Smoked Silver-Grey
          },
          light: {
            primarySrc: renderCroppedTintedBitmap(rawCanvas, cropX, cropY, cropW, cropH, 15, 23, 42), // #0f172a Deep Charcoal Slate
            echoSrc: renderCroppedTintedBitmap(rawCanvas, cropX, cropY, cropW, cropH, 71, 85, 105), // #475569 Smoked Slate-Grey
          },
        });
      } catch (err) {
        cachedInkPromise = null;
        reject(err);
      }
    };
    img.onerror = (err) => {
      cachedInkPromise = null;
      reject(err);
    };
    img.src = '/brand-logo-mark.png?v=7';
  });

  return cachedInkPromise;
}

if (typeof window !== 'undefined') {
  loadThemeInkAssets().catch(() => {});
}

function useDocumentDarkMode(): boolean {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document === 'undefined') return true;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains('dark'));
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

/**
 * Containerless Monochrome Leaf Brand Emblem:
 * - Soft radial frosted-glass contrast layer (feathered mask-image, zero square/card box)
 *   keeping the leaf edges distinct across complex grid/gradient backgrounds.
 * - Sharper smoked-grey `drop-shadow` detaching the leaf cleanly from the canvas.
 * - Interactive Signature Mode (`floatingInk=true`): real-time cursor following via `framer-motion`
 *   `useMotionValue` + `useSpring` with distinct smoked-grey motion echoes whose opacity rises
 *   during active cursor travel and fades smoothly to exact zero once settled/idle.
 */
export const BrandLogoMark: React.FC<BrandLogoMarkProps> = ({
  className = '',
  sizeClassName = 'w-9 h-9',
  alt = 'Ahmed El-Bialy Leaf Logo',
  floatEffect = false,
  floatMode = 'sway',
  floatingInk = false,
  fieldRef,
}) => {
  const isDark = useDocumentDarkMode();
  const prefersReducedMotion = useReducedMotion();
  const [inkAssets, setInkAssets] = useState<ThemeInkAssets | null>(null);
  const [isDirectlyHovered, setIsDirectlyHovered] = useState(false);
  const [isIdle, setIsIdle] = useState(true);
  const [burstWaves, setBurstWaves] = useState<number[]>([]);

  const anchorRef = useRef<HTMLSpanElement>(null);
  const idleTimerRef = useRef<number | null>(null);
  const echoSettleTimerRef = useRef<number | null>(null);
  const clickKickTimerRef = useRef<number | null>(null);
  const isIdleRef = useRef(true);
  const directHoverRef = useRef(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rawRz = useMotionValue(0);
  const rawRx = useMotionValue(0);
  const rawRy = useMotionValue(0);
  const rawScale = useMotionValue(1);
  const rawMotionWake = useMotionValue(0);

  // Responsive snappy primary leaf spring
  const primarySpring = { stiffness: 320, damping: 24, mass: 0.52 };
  const pX = useSpring(rawX, primarySpring);
  const pY = useSpring(rawY, primarySpring);
  const pRz = useSpring(rawRz, primarySpring);
  const pRx = useSpring(rawRx, primarySpring);
  const pRy = useSpring(rawRy, primarySpring);
  const pScale = useSpring(rawScale, { stiffness: 290, damping: 19, mass: 0.55 });

  // Intentional trailing echo springs for unmistakable fluid trails while moving
  const e1Spring = { stiffness: 170, damping: 19, mass: 0.72 };
  const e1X = useSpring(pX, e1Spring);
  const e1Y = useSpring(pY, e1Spring);
  const e1Rz = useSpring(pRz, e1Spring);
  const e1Scale = useSpring(pScale, e1Spring);

  const e2Spring = { stiffness: 118, damping: 17, mass: 0.88 };
  const e2X = useSpring(pX, e2Spring);
  const e2Y = useSpring(pY, e2Spring);
  const e2Rz = useSpring(pRz, e2Spring);
  const e2Scale = useSpring(pScale, e2Spring);

  // Smooth motion-gated echo opacity: clearly visible in flight, 0 when settled/idle
  const wakeSpring = useSpring(rawMotionWake, { stiffness: 210, damping: 24, mass: 0.5 });
  const e1Opacity = useTransform(wakeSpring, [0, 1], [0, isDirectlyHovered ? 0.56 : 0.44]);
  const e2Opacity = useTransform(wakeSpring, [0, 1], [0, isDirectlyHovered ? 0.30 : 0.22]);

  useEffect(() => {
    let active = true;
    loadThemeInkAssets()
      .then((assets) => {
        if (active) setInkAssets(assets);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const triggerWakePulse = useCallback(
    (holdMs: number = ECHO_SETTLE_MS) => {
      rawMotionWake.set(1);
      if (echoSettleTimerRef.current !== null) {
        window.clearTimeout(echoSettleTimerRef.current);
      }
      echoSettleTimerRef.current = window.setTimeout(() => {
        rawMotionWake.set(0);
        echoSettleTimerRef.current = null;
      }, holdMs);
    },
    [rawMotionWake]
  );

  const scheduleIdleFallback = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      rawX.set(0);
      rawY.set(0);
      rawRz.set(0);
      rawRx.set(0);
      rawRy.set(0);
      rawMotionWake.set(0);
      if (!directHoverRef.current) {
        rawScale.set(1);
      }
      isIdleRef.current = true;
      setIsIdle(true);
    }, IDLE_DELAY_MS);
  }, [rawX, rawY, rawRz, rawRx, rawRy, rawScale, rawMotionWake]);

  useEffect(() => {
    if (!floatingInk || typeof window === 'undefined' || prefersReducedMotion) return;

    const anchorEl = anchorRef.current;
    if (!anchorEl) return;
    const fieldEl = fieldRef?.current || anchorEl.parentElement || anchorEl;

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const rect = anchorEl.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      if (isIdleRef.current) {
        isIdleRef.current = false;
        setIsIdle(false);
      }

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      const normX = Math.tanh(dx / 210);
      const normY = Math.tanh(dy / 165);

      rawX.set(normX * 28);
      rawY.set(normY * 18);
      rawRz.set(normX * 10);
      rawRx.set(-normY * 12);
      rawRy.set(normX * 16);

      triggerWakePulse(ECHO_SETTLE_MS);
      scheduleIdleFallback();
    };

    const handlePointerLeave = () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      if (echoSettleTimerRef.current !== null) {
        window.clearTimeout(echoSettleTimerRef.current);
        echoSettleTimerRef.current = null;
      }
      rawX.set(0);
      rawY.set(0);
      rawRz.set(0);
      rawRx.set(0);
      rawRy.set(0);
      rawScale.set(1);
      rawMotionWake.set(0);
      isIdleRef.current = true;
      setIsIdle(true);
    };

    fieldEl.addEventListener('pointermove', handlePointerMove, { passive: true });
    fieldEl.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      fieldEl.removeEventListener('pointermove', handlePointerMove);
      fieldEl.removeEventListener('pointerleave', handlePointerLeave);
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
      if (echoSettleTimerRef.current !== null) {
        window.clearTimeout(echoSettleTimerRef.current);
      }
      if (clickKickTimerRef.current !== null) {
        window.clearTimeout(clickKickTimerRef.current);
      }
    };
  }, [
    floatingInk,
    fieldRef,
    prefersReducedMotion,
    rawX,
    rawY,
    rawRz,
    rawRx,
    rawRy,
    rawScale,
    rawMotionWake,
    triggerWakePulse,
    scheduleIdleFallback,
  ]);

  const handleClickBurst = () => {
    if (prefersReducedMotion) return;

    const id = Date.now() + Math.random();
    setBurstWaves((prev) => [...prev.slice(-2), id]);

    if (clickKickTimerRef.current !== null) {
      window.clearTimeout(clickKickTimerRef.current);
    }

    triggerWakePulse(320);
    rawScale.set(1.26);
    rawRz.set((rawRz.get() >= 0 ? 1 : -1) * 14);
    rawY.set(rawY.get() - 7);

    clickKickTimerRef.current = window.setTimeout(() => {
      rawScale.set(directHoverRef.current ? 1.1 : 1);
      if (isIdleRef.current) {
        rawRz.set(0);
        rawY.set(0);
      }
    }, 160);

    window.setTimeout(() => {
      setBurstWaves((prev) => prev.filter((item) => item !== id));
    }, 900);
  };

  const activeSet = inkAssets ? (isDark ? inkAssets.dark : inkAssets.light) : null;

  // Sharper, higher-contrast smoked-grey drop-shadow that cleanly detaches the leaf without heavy black
  const liftedPrimaryShadow = isDark
    ? 'drop-shadow(0 5px 6px rgba(71, 85, 105, 0.58)) drop-shadow(0 2px 3px rgba(100, 116, 139, 0.42)) drop-shadow(0 0 1px rgba(248, 250, 252, 0.34))'
    : 'drop-shadow(0 5px 7px rgba(71, 85, 105, 0.44)) drop-shadow(0 1.5px 2.5px rgba(51, 65, 85, 0.48)) drop-shadow(0 0 0.75px rgba(15, 23, 42, 0.25))';

  // Soft, non-intrusive radial frosted contrast layer (feathered mask, zero box/card contour)
  const frostedMaskStyle: React.CSSProperties = {
    backdropFilter: isDark ? 'blur(9px) brightness(1.08)' : 'blur(9px) brightness(0.98)',
    WebkitBackdropFilter: isDark ? 'blur(9px) brightness(1.08)' : 'blur(9px) brightness(0.98)',
    maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 26%, rgba(0,0,0,0.42) 54%, transparent 74%)',
    WebkitMaskImage:
      'radial-gradient(circle, rgba(0,0,0,1) 26%, rgba(0,0,0,0.42) 54%, transparent 74%)',
    background: isDark
      ? 'radial-gradient(circle at 50% 50%, rgba(148, 163, 184, 0.13) 0%, rgba(100, 116, 139, 0.05) 48%, transparent 74%)'
      : 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.62) 0%, rgba(226, 232, 240, 0.24) 48%, transparent 74%)',
  };

  // 1. Compact Containerless Leaf (Top Navbar, Mobile Drawer, Resume Modal, Footer)
  if (!floatingInk) {
    const floatClass = !floatEffect
      ? ''
      : floatMode === 'vertical'
      ? 'animate-float-gentle'
      : 'animate-float-sway';

    return (
      <span
        className={`relative inline-flex items-center justify-center shrink-0 ${floatClass} ${sizeClassName} ${className}`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 rounded-full"
          style={frostedMaskStyle}
        />
        {activeSet ? (
          <img
            src={activeSet.primarySrc}
            alt={alt}
            draggable={false}
            style={{ filter: liftedPrimaryShadow }}
            className="relative z-10 w-full h-full object-contain select-none pointer-events-none"
          />
        ) : (
          <span className="w-full h-full opacity-0" aria-hidden="true" />
        )}
      </span>
    );
  }

  // 2. Frameless Interactive Signature Leaf (Frosted radial contrast + sharper smoked shadow + gated echoes)
  return (
    <span
      ref={anchorRef}
      role="button"
      tabIndex={0}
      aria-label={alt}
      onPointerEnter={() => {
        directHoverRef.current = true;
        setIsDirectlyHovered(true);
        if (!prefersReducedMotion) rawScale.set(1.1);
      }}
      onPointerLeave={() => {
        directHoverRef.current = false;
        setIsDirectlyHovered(false);
        if (!prefersReducedMotion) rawScale.set(1);
      }}
      onClick={handleClickBurst}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClickBurst();
        }
      }}
      className={`relative inline-flex items-center justify-center shrink-0 cursor-pointer select-none overflow-visible focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-white/40 rounded-full ${sizeClassName} ${className}`}
    >
      {/* Radial-Feathered Frosted Contrast Layer (No Card Box / Zero Square Edges) */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-4 rounded-full transition-all duration-300 ${
          isDirectlyHovered ? 'opacity-100 scale-108' : 'opacity-88 scale-100'
        }`}
        style={frostedMaskStyle}
      />

      {/* Harmonized Monochrome Pearl / Slate Click Ripples */}
      {burstWaves.map((id) => (
        <React.Fragment key={id}>
          <motion.span
            aria-hidden="true"
            initial={{ scale: 0.65, opacity: 0.72 }}
            animate={{ scale: 2.35, opacity: 0 }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute inset-0 rounded-full border-[1.5px] border-slate-600/45 dark:border-slate-300/55 shadow-[0_0_16px_rgba(148,163,184,0.24)]"
          />
          <motion.span
            aria-hidden="true"
            initial={{ scale: 0.55, opacity: 0.45 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(203,213,225,0.22) 0%, rgba(148,163,184,0.06) 55%, transparent 75%)'
                : 'radial-gradient(circle, rgba(71,85,105,0.16) 0%, rgba(100,116,139,0.05) 55%, transparent 75%)',
            }}
          />
        </React.Fragment>
      ))}

      {/* Stationary >3s Organic Breathing Sway Envelope + Velocity-Gated Smoked Echoes */}
      <motion.span
        animate={
          isIdle && !prefersReducedMotion
            ? {
                x: [0, 6, 0, -6, 0],
                y: [0, -5, 1.5, -4, 0],
                rotate: [0, 3.2, 0, -3.2, 0],
                scale: [1, 1.045, 0.99, 1.035, 1],
              }
            : { x: 0, y: 0, rotate: 0, scale: 1 }
        }
        transition={
          isIdle && !prefersReducedMotion
            ? { duration: 6, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.38, ease: [0.16, 1, 0.3, 1] }
        }
        className="relative z-10 w-full h-full flex items-center justify-center overflow-visible"
      >
        {activeSet ? (
          <>
            {/* Echo 2 (Outer Smoked Slate Trail — crisp in motion, fades to 0 when settled) */}
            <motion.span
              aria-hidden="true"
              style={{
                x: e2X,
                y: e2Y,
                rotateZ: e2Rz,
                scale: e2Scale,
                opacity: e2Opacity,
              }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <img
                src={activeSet.echoSrc}
                alt=""
                draggable={false}
                className="w-full h-full object-contain select-none scale-[1.03]"
              />
            </motion.span>

            {/* Echo 1 (Near Smoked Slate Trail — distinct during pointer travel, 0 at rest) */}
            <motion.span
              aria-hidden="true"
              style={{
                x: e1X,
                y: e1Y,
                rotateZ: e1Rz,
                scale: e1Scale,
                opacity: e1Opacity,
              }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <img
                src={activeSet.echoSrc}
                alt=""
                draggable={false}
                className="w-full h-full object-contain select-none"
              />
            </motion.span>

            {/* Primary Sharp Lifted Leaf Silhouette with Smoked-Grey Drop Shadow */}
            <motion.span
              style={{
                x: pX,
                y: pY,
                rotateZ: pRz,
                rotateX: pRx,
                rotateY: pRy,
                scale: pScale,
                transformPerspective: 560,
                filter: liftedPrimaryShadow,
              }}
              className="relative z-10 w-full h-full flex items-center justify-center"
            >
              <img
                src={activeSet.primarySrc}
                alt={alt}
                draggable={false}
                className="w-full h-full object-contain select-none pointer-events-none"
              />
            </motion.span>
          </>
        ) : (
          <span className="w-full h-full opacity-0" aria-hidden="true" />
        )}
      </motion.span>
    </span>
  );
};
