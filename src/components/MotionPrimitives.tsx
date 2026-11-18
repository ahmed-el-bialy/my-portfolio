import React, { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glareOpacity?: number;
  cursorLabel?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * Lively GPU-composited TiltCard with responsive spring elevation and pointer glare.
 */
export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 6,
  glareOpacity = 0.12,
  cursorLabel,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 280, damping: 24, mass: 0.4 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [0, 1], [-maxTilt, maxTilt]);
  const glareX = useTransform(smoothX, [0, 1], ['0%', '100%']);
  const glareY = useTransform(smoothY, [0, 1], ['0%', '100%']);
  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(360px circle at ${gx} ${gy}, rgba(255,255,255,0.34), transparent 65%)`
  );

  const [isHovered, setIsHovered] = React.useState(false);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const yPct = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleEnter = () => {
    setIsHovered(true);
    onMouseEnter?.();
  };

  const handleLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
    onMouseLeave?.();
  };

  if (prefersReducedMotion) {
    return (
      <div
        ref={ref}
        data-cursor-label={cursorLabel}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={className}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      data-cursor-label={cursorLabel}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.008 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      style={{
        transformPerspective: 1100,
        rotateX,
        rotateY,
      }}
      className={`relative ${className}`}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] z-20 transition-opacity duration-300"
        style={{
          opacity: isHovered ? glareOpacity : 0,
          background: glareBackground,
        }}
      />
      {children}
    </motion.div>
  );
};

interface FloatingPortraitProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Lively pointer-reactive portrait frame with gentle ambient float and radial halo pulse.
 */
export const FloatingPortrait: React.FC<FloatingPortraitProps> = ({
  children,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 180, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 180, damping: 20 });

  const rotateX = useTransform(smoothY, [0, 1], [8, -8]);
  const rotateY = useTransform(smoothX, [0, 1], [-8, 8]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
    mouseY.set(Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)));
  };

  const handleLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  if (prefersReducedMotion) {
    return <div className={`relative flex items-center justify-center ${className}`}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative flex items-center justify-center ${className}`}
      style={{ perspective: 900 }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-br from-[#027DFD]/22 via-[#00C7FF]/14 to-emerald-400/20"
        animate={{ scale: [0.97, 1.04, 0.97], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          transformPerspective: 900,
          rotateX,
          rotateY,
        }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  );
};
