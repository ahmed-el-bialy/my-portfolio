import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  // Never mount or render on touch/coarse devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth spring physics for fluid trailing feel
  const springConfig = { damping: 24, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, input, textarea, select, .card-techno, [role="button"]');
      setIsHovered(!!interactive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* 1. Core Pinpoint Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-cyan-400 pointer-events-none z-30"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicking ? 0.6 : isHovered ? 0 : 1,
          opacity: isHovered ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* 2. Magnetic Trailing Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border pointer-events-none z-20"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovered ? 44 : 26,
          height: isHovered ? 44 : 26,
          borderColor: isHovered ? 'rgba(6, 182, 212, 0.8)' : 'rgba(59, 130, 246, 0.4)',
          backgroundColor: isHovered ? 'rgba(6, 182, 212, 0.12)' : 'rgba(59, 130, 246, 0.02)',
          scale: isClicking ? 0.85 : 1,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
      />
    </>
  );
};
