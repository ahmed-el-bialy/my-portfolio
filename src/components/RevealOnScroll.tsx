import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

export interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
  distance?: number;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.44,
  direction = 'up',
  distance = 20,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const initialX = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
  const initialY = direction === 'up' ? distance : 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: initialX, y: initialY }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: initialX, y: initialY }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
