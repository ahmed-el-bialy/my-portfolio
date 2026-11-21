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
  maxTilt = 4,
  glareOpacity = 0.08,
  cursorLabel,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 360, damping: 28, mass: 0.4 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [0, 1], [-maxTilt, maxTilt]);
  const glareX = useTransform(smoothX, [0, 1], ['0%', '100%']);
  const glareY = useTransform(smoothY, [0, 1], ['0%', '100%']);
  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(360px circle at ${gx} ${gy}, rgba(255,255,255,0.28), transparent 65%)`
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
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        transformPerspective: 1100,
        rotateX,
        rotateY,
      }}
      className={`relative ${className}`}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] z-20 transition-opacity duration-200"
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
 * Pointer-reactive portrait frame without distracting continuous idle loops.
 */
export const FloatingPortrait: React.FC<FloatingPortraitProps> = ({
  children,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 280, damping: 26 });
  const smoothY = useSpring(mouseY, { stiffness: 280, damping: 26 });

  const rotateX = useTransform(smoothY, [0, 1], [6, -6]);
  const rotateY = useTransform(smoothX, [0, 1], [-6, 6]);

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
