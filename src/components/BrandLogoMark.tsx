import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface BrandLogoMarkProps {
  className?: string;
  sizeClassName?: string;
  alt?: string;
  floatEffect?: boolean;
  showBlueRing?: boolean;
}

/**
 * Latest bold white brushstroke Leaf emblem inside a persistent thin glowing
 * electric-blue ring frame so the logo edges read crisply next to typography,
 * with smooth framer-motion vertical float animation when enabled.
 */
export const BrandLogoMark: React.FC<BrandLogoMarkProps> = ({
  className = '',
  sizeClassName = 'w-9 h-9',
  alt = 'Ahmed El-Bialy Leaf Emblem',
  floatEffect = false,
  showBlueRing = true,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const shouldFloat = floatEffect && !prefersReducedMotion;

  const badge = (
    <span
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 transition-shadow duration-300 ${
        showBlueRing
          ? 'p-[2px] bg-gradient-to-br from-[#027DFD] via-[#00C7FF] to-[#38BDF8] ring-1 ring-[#00C7FF]/70 shadow-[0_0_18px_rgba(2,125,253,0.48)] dark:shadow-[0_0_22px_rgba(0,199,255,0.46)]'
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
  );

  if (!shouldFloat) {
    return badge;
  }

  return (
    <motion.span
      className="inline-flex shrink-0 will-change-transform"
      animate={{ y: [-4, 4, -4] }}
      transition={{
        duration: 3.4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {badge}
    </motion.span>
  );
};
