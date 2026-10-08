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
  const [isLightMode, setIsLightMode] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth, refined spring physics for high-end trailing feel
  const springConfig = { damping: 22, stiffness: 280, mass: 0.45 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    // Check light/dark mode
    const checkTheme = () => {
      const isLight = document.documentElement.classList.contains('light') || 
                      document.documentElement.getAttribute('data-theme') === 'light';
      setIsLightMode(isLight);
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

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

      const interactive = target.closest(
        'button, a, input, textarea, select, .card-techno, [role="button"], [data-cursor="pointer"], .cursor-pointer'
      );
      setIsHovered(!!interactive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none">
      {/* 1. Core Pinpoint Dot - Instant Response with Dynamic Theme Contrast */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none shadow-sm"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovered ? 6 : 7,
          height: isHovered ? 6 : 7,
          scale: isClicking ? 0.7 : isHovered ? 1.2 : 1,
          backgroundColor: isLightMode
            ? isHovered ? '#2563eb' : '#0284c7'
            : isHovered ? '#38bdf8' : '#22d3ee',
          boxShadow: isLightMode
            ? '0 0 8px rgba(37, 99, 235, 0.45)'
            : '0 0 10px rgba(56, 189, 248, 0.75)',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
      />

      {/* 2. Magnetic Fluid Trailing Ring with Ambient Aura */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovered ? 48 : 28,
          height: isHovered ? 48 : 28,
          borderWidth: isHovered ? '1.5px' : '1.5px',
          borderColor: isLightMode
            ? isHovered
              ? 'rgba(37, 99, 235, 0.75)'
              : 'rgba(2, 132, 199, 0.45)'
            : isHovered
              ? 'rgba(56, 189, 248, 0.85)'
              : 'rgba(34, 211, 238, 0.45)',
          backgroundColor: isLightMode
            ? isHovered
              ? 'rgba(37, 99, 235, 0.08)'
              : 'rgba(2, 132, 199, 0.03)'
            : isHovered
              ? 'rgba(56, 189, 248, 0.12)'
              : 'rgba(34, 211, 238, 0.03)',
          scale: isClicking ? 0.82 : 1,
          boxShadow: isHovered
            ? isLightMode
              ? '0 0 16px -2px rgba(37, 99, 235, 0.25)'
              : '0 0 20px -2px rgba(56, 189, 248, 0.4)'
            : 'none',
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 280,
          mass: 0.4,
        }}
      />
    </div>
  );
};
