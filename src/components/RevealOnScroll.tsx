import React from 'react';
import { motion } from 'framer-motion';

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  yOffset?: number;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  className = '',
  delay = 0,
  yOffset = 32,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.65,
        delay: delay / 1000,
        ease: [0.22, 1, 0.36, 1], // Smooth cubic bezier easing
      }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};
