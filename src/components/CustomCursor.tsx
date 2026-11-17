import React, { useEffect, useState } from 'react';
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

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth, refined spring physics for high-end trailing feel
  const springConfig = { damping: 24, stiffness: 310, mass: 0.42 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
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
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
      if (isOverIframe) setIsOverIframe(false);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (
        target.tagName === 'IFRAME' ||
        target.closest('iframe, .iframe-container, [data-media-embed="true"]')
      ) {
        setIsOverIframe(true);
        setCursorLabel(null);
        return;
      }

      // Show contextual label only on designated card surfaces when NOT hovering nested buttons/links/inputs
      const nestedControl = target.closest('button, a, input, textarea, select');
      const cardContainer = target.closest('[data-cursor-label]');
      const labelAttr = !nestedControl && cardContainer ? cardContainer.getAttribute('data-cursor-label') : null;
      setCursorLabel(labelAttr || null);

      const interactive = target.closest(
        'button, a, input, textarea, select, .card-techno, [role="button"], [data-cursor="pointer"], [data-cursor-label], .cursor-pointer'
      );
      setIsHovered(Boolean(interactive));
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setCursorLabel(null);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleWindowBlur = () => {
      if (document.activeElement?.tagName === 'IFRAME') {
        setIsOverIframe(true);
        setCursorLabel(null);
      }
    };

    const handleWindowFocus = () => {
      setIsOverIframe(false);
    };

    const attachIframeListeners = () => {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        iframe.addEventListener('mouseenter', () => {
          setIsOverIframe(true);
          setCursorLabel(null);
        });
        iframe.addEventListener('mouseleave', () => setIsOverIframe(false));
      });
    };

    attachIframeListeners();
    const iframeObserver = new MutationObserver(attachIframeListeners);
    iframeObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      observer.disconnect();
      iframeObserver.disconnect();
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible, isOverIframe]);

  if (isTouchDevice || prefersReducedMotion || !isVisible) return null;

  const hasLabel = Boolean(cursorLabel && !isOverIframe);

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none">
      {/* 1. Core Pinpoint Dot */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none shadow-sm"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: hasLabel ? 4 : isHovered ? 6 : 7,
          height: hasLabel ? 4 : isHovered ? 6 : 7,
          scale: isClicking ? 0.7 : isHovered ? 1.15 : 1,
          opacity: isOverIframe ? 0.5 : hasLabel ? 0.35 : 1,
          backgroundColor: isLightMode
            ? isHovered
              ? '#027DFD'
              : '#0284c7'
            : isHovered
            ? '#00C7FF'
            : '#38bdf8',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
      />

      {/* 2. Trailing Ring / Contextual Card Micro-Label */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none flex items-center justify-center"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: hasLabel ? 'auto' : isHovered ? 44 : 28,
          height: hasLabel ? 28 : isHovered ? 44 : 28,
          paddingLeft: hasLabel ? 11 : 0,
          paddingRight: hasLabel ? 11 : 0,
          borderRadius: 9999,
          borderWidth: '1.5px',
          opacity: isOverIframe ? 0.4 : 1,
          borderColor: hasLabel
            ? isLightMode
              ? 'rgba(2, 125, 253, 0.55)'
              : 'rgba(0, 199, 255, 0.6)'
            : isLightMode
            ? isHovered
              ? 'rgba(2, 125, 253, 0.72)'
              : 'rgba(2, 132, 199, 0.42)'
            : isHovered
            ? 'rgba(0, 199, 255, 0.8)'
            : 'rgba(56, 189, 248, 0.42)',
          backgroundColor: hasLabel
            ? isLightMode
              ? 'rgba(255, 255, 255, 0.92)'
              : 'rgba(15, 17, 23, 0.9)'
            : isLightMode
            ? isHovered
              ? 'rgba(2, 125, 253, 0.08)'
              : 'rgba(2, 132, 199, 0.03)'
            : isHovered
            ? 'rgba(0, 199, 255, 0.1)'
            : 'rgba(56, 189, 248, 0.03)',
          scale: isClicking ? 0.85 : isOverIframe ? 1.25 : 1,
          boxShadow: hasLabel
            ? '0 8px 24px -6px rgba(2, 125, 253, 0.3)'
            : isHovered
            ? isLightMode
              ? '0 0 14px -2px rgba(2, 125, 253, 0.22)'
              : '0 0 18px -2px rgba(0, 199, 255, 0.32)'
            : 'none',
        }}
        transition={{
          type: 'spring',
          damping: 22,
          stiffness: 300,
          mass: 0.4,
        }}
      >
        <AnimatePresence mode="wait">
          {hasLabel && (
            <motion.span
              key={cursorLabel}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.12 }}
              className="text-[10px] font-mono font-bold tracking-wide whitespace-nowrap text-[#027DFD] dark:text-[#00C7FF]"
            >
              {cursorLabel}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
