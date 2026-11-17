import React, { useRef, useState, useEffect } from 'react';
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
 * Expressive 3D perspective TiltCard with subtle cursor-tracking specular sheen.
 * Strictly GPU-composited and automatically falls back on coarse touch or reduced motion.
 */
export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 6,
  glareOpacity = 0.14,
  cursorLabel,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouch(window.matchMedia('(pointer: coarse)').matches);
    }
  }, []);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 260, damping: 22, mass: 0.45 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [0, 1], [-maxTilt, maxTilt]);
  const glareX = useTransform(smoothX, [0, 1], ['0%', '100%']);
  const glareY = useTransform(smoothY, [0, 1], ['0%', '100%']);
  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(420px circle at ${gx} ${gy}, rgba(255,255,255,0.42), transparent 65%)`
  );

  const [isHovered, setIsHovered] = useState(false);

  const disabled = Boolean(prefersReducedMotion || isTouch);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;
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

  if (disabled) {
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
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      style={{
        transformPerspective: 1100,
        rotateX,
        rotateY,
      }}
      className={`relative ${className}`}
    >
      {/* Dynamic 3D Specular Light Glare */}
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
 * Signature levitating + pointer-tilting portrait wrapper for Ahmed's personal section.
 */
export const FloatingPortrait: React.FC<FloatingPortraitProps> = ({
  children,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouch(window.matchMedia('(pointer: coarse)').matches);
    }
  }, []);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 180, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 180, damping: 20 });

  const rotateX = useTransform(smoothY, [0, 1], [10, -10]);
  const rotateY = useTransform(smoothX, [0, 1], [-10, 10]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || isTouch || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
    mouseY.set(Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)));
  };

  const handleLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative flex items-center justify-center ${className}`}
      style={{ perspective: 900 }}
    >
      {/* Subtle Ambient Aura Behind Levitating Portrait */}
      <motion.div
        aria-hidden="true"
        animate={{
          scale: [0.95, 1.06, 0.95],
          opacity: [0.35, 0.6, 0.35],
        }}
        transition={{
          duration: 4.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-br from-[#027DFD]/25 via-[#00C7FF]/20 to-emerald-400/20 blur-xl"
      />

      {/* Continuous Levitation + Interactive 3D Tilt */}
      <motion.div
        animate={{
          y: [-5, 5, -5],
        }}
        transition={{
          duration: 4.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={
          isTouch
            ? undefined
            : {
                transformPerspective: 900,
                rotateX,
                rotateY,
              }
        }
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  );
};
