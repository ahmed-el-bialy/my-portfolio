import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(pointer: coarse)').matches;
    }
    return false;
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const [isClicking, setIsClicking] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [isOverIframe, setIsOverIframe] = useState(false);

  const isVisibleRef = useRef(false);
  const isOverIframeRef = useRef(false);
  const isHoveredRef = useRef(false);
  const cursorLabelRef = useRef<string | null>(null);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth, refined spring physics for trailing ring
  const springConfig = { damping: 24, stiffness: 320, mass: 0.4 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches || prefersReducedMotion) {
      setIsTouchDevice(true);
      return;
    }

    const checkTheme = () => {
      const isLight =
        document.documentElement.classList.contains('light') ||
        document.documentElement.getAttribute('data-theme') === 'light';
      setIsLightMode(isLight);
    };

    checkTheme();
    const themeObserver = new MutationObserver(checkTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
      if (isOverIframeRef.current) {
        isOverIframeRef.current = false;
        setIsOverIframe(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const overFrame = Boolean(
        target.tagName === 'IFRAME' ||
          target.closest('iframe, .iframe-container, [data-media-embed="true"]')
      );
      if (overFrame) {
        if (!isOverIframeRef.current) {
          isOverIframeRef.current = true;
          setIsOverIframe(true);
        }
        if (cursorLabelRef.current !== null) {
          cursorLabelRef.current = null;
          setCursorLabel(null);
        }
        return;
      }

      const nestedControl = target.closest('button, a, input, textarea, select');
      const cardContainer = target.closest('[data-cursor-label]');
      const nextLabel =
        !nestedControl && cardContainer ? cardContainer.getAttribute('data-cursor-label') : null;

      if (cursorLabelRef.current !== nextLabel) {
        cursorLabelRef.current = nextLabel;
        setCursorLabel(nextLabel);
      }

      const nextHover = Boolean(
        target.closest(
          'button, a, input, textarea, select, .card-techno, [role="button"], [data-cursor="pointer"], [data-cursor-label], .cursor-pointer'
        )
      );
      if (isHoveredRef.current !== nextHover) {
        isHoveredRef.current = nextHover;
        setIsHovered(nextHover);
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      cursorLabelRef.current = null;
      setIsVisible(false);
      setCursorLabel(null);
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    const handleWindowBlur = () => {
      if (document.activeElement?.tagName === 'IFRAME') {
        isOverIframeRef.current = true;
        cursorLabelRef.current = null;
        setIsOverIframe(true);
        setCursorLabel(null);
      }
    };

    const handleWindowFocus = () => {
      isOverIframeRef.current = false;
      setIsOverIframe(false);
    };

    window.addEventListener('mousemove', moveCursor, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      themeObserver.disconnect();
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, prefersReducedMotion]);

  if (isTouchDevice || prefersReducedMotion || !isVisible) return null;

  const hasLabel = Boolean(cursorLabel && !isOverIframe);

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none">
      {/* 1. Core Pinpoint Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicking ? 0.65 : hasLabel ? 0.55 : isHovered ? 0.85 : 1,
          opacity: isOverIframe ? 0.5 : hasLabel ? 0.35 : 1,
          backgroundColor: isLightMode
            ? isHovered
              ? '#0284ff'
              : '#0369a1'
            : isHovered
            ? '#00C7FF'
            : '#38bdf8',
        }}
        transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* 2. Compositor-scaled Trailing Ring */}
      <motion.div
        className="fixed top-0 left-0 w-7 h-7 rounded-full border-[1.5px] pointer-events-none"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: hasLabel ? 0.85 : isClicking ? 0.85 : isHovered ? 1.5 : isOverIframe ? 1.2 : 1,
          opacity: hasLabel ? 0 : isOverIframe ? 0.35 : 1,
          borderColor: isLightMode
            ? isHovered
              ? 'rgba(2, 132, 255, 0.72)'
              : 'rgba(3, 105, 161, 0.42)'
            : isHovered
            ? 'rgba(0, 199, 255, 0.8)'
            : 'rgba(56, 189, 248, 0.42)',
          backgroundColor: isLightMode
            ? isHovered
              ? 'rgba(2, 132, 255, 0.08)'
              : 'rgba(3, 105, 161, 0.03)'
            : isHovered
            ? 'rgba(0, 199, 255, 0.1)'
            : 'rgba(56, 189, 248, 0.03)',
        }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* 3. Detached Contextual Micro-Label Pill */}
      <AnimatePresence>
        {hasLabel && (
          <motion.div
            key={cursorLabel}
            className="fixed top-0 left-0 pointer-events-none flex items-center justify-center h-7 px-3 rounded-full border bg-white/95 dark:bg-[#0f1117]/95 border-[#0284ff]/50 dark:border-[#38bdf8]/55 shadow-sm"
            style={{
              x: smoothX,
              y: smoothY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[10px] font-mono font-bold tracking-wide whitespace-nowrap text-[#0369a1] dark:text-[#38bdf8]">
              {cursorLabel}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
