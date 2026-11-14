import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ThemeRevealOverlayProps {
  targetIsDark: boolean;
  onThemeApply: () => void;
  onFinish: () => void;
  origin?: { x: number; y: number } | null;
}

/**
 * CSS/Framer-Motion fallback overlay for browsers that do not support document.startViewTransition.
 * Expands from exact button center coordinates, applies the target theme upon full coverage,
 * and smoothly fades out without flashing.
 */
export const ThemeRevealOverlay: React.FC<ThemeRevealOverlayProps> = ({
  targetIsDark,
  onThemeApply,
  onFinish,
  origin,
}) => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });
  const [phase, setPhase] = useState<'expanding' | 'fading'>('expanding');

  useEffect(() => {
    const handleResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const x = origin ? origin.x : dimensions.width - 60;
  const y = origin ? origin.y : 36;

  const maxRadius = Math.hypot(
    Math.max(x, dimensions.width - x),
    Math.max(y, dimensions.height - y)
  );

  return (
    <motion.div
      initial={{ clipPath: `circle(0px at ${x}px ${y}px)`, opacity: 1 }}
      animate={
        phase === 'expanding'
          ? { clipPath: `circle(${maxRadius}px at ${x}px ${y}px)`, opacity: 1 }
          : { clipPath: `circle(${maxRadius}px at ${x}px ${y}px)`, opacity: 0 }
      }
      transition={
        phase === 'expanding'
          ? { duration: 0.68, ease: [0.22, 1, 0.36, 1] }
          : { duration: 0.16, ease: 'easeOut' }
      }
      onAnimationComplete={() => {
        if (phase === 'expanding') {
          onThemeApply();
          setPhase('fading');
        } else {
          onFinish();
        }
      }}
      className={`fixed inset-0 z-[45] pointer-events-none ${
        targetIsDark ? 'bg-[#08090d]' : 'bg-[#f8fafc]'
      }`}
    />
  );
};
