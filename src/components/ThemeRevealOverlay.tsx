import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ThemeRevealOverlayProps {
  targetIsDark: boolean;
  onRevealComplete: () => void;
  origin?: { x: number; y: number } | null;
}

export const ThemeRevealOverlay: React.FC<ThemeRevealOverlayProps> = ({
  targetIsDark,
  onRevealComplete,
  origin,
}) => {
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const x = origin ? origin.x : window.innerWidth - 60;
  const y = origin ? origin.y : 40;

  // Calculate max radius to cover the entire screen from (x, y)
  const maxRadius = Math.hypot(
    Math.max(x, dimensions.width - x),
    Math.max(y, dimensions.height - y)
  );

  return (
    <motion.div
      initial={{ clipPath: `circle(0px at ${x}px ${y}px)` }}
      animate={{ clipPath: `circle(${maxRadius * 1.3}px at ${x}px ${y}px)` }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.68, ease: [0.4, 0, 0.2, 1] }}
      onAnimationComplete={onRevealComplete}
      className={`fixed inset-0 z-[99999] pointer-events-none ${
        targetIsDark ? 'bg-[#090b14]' : 'bg-[#f8fafc]'
      }`}
    />
  );
};
