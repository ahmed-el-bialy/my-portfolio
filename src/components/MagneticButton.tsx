import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useReducedMotion } from 'framer-motion';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  strength?: number; // Distance multiplier (default 0.3)
  textParallax?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  strength = 0.25,
  textParallax = true,
  onClick,
  ...props
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const isHoveredRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    }
  }, []);

  const springConfig = { damping: 18, stiffness: 260, mass: 0.12 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const textX = useSpring(0, { damping: 16, stiffness: 300, mass: 0.1 });
  const textY = useSpring(0, { damping: 16, stiffness: 300, mass: 0.1 });

  const handleMouseEnter = () => {
    if (isTouchDevice || prefersReducedMotion) return;
    isHoveredRef.current = true;
    y.set(-1.5);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isTouchDevice || prefersReducedMotion || !ref.current) return;
    isHoveredRef.current = true;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    x.set(middleX * strength);
    y.set(-1.5 + middleY * strength);

    if (textParallax) {
      textX.set(middleX * (strength * 0.38));
      textY.set(middleY * (strength * 0.38));
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    x.set(0);
    y.set(0);
    textX.set(0);
    textY.set(0);
  };

  if (isTouchDevice || prefersReducedMotion) {
    return (
      <button type={props.type || 'button'} ref={ref} onClick={onClick} className={className} {...props}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      type={props.type || 'button'}
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      style={{ x, y }}
      className={`relative inline-flex items-center justify-center will-change-transform ${className}`}
      {...(props as any)}
    >
      {textParallax ? (
        <motion.span
          style={{ x: textX, y: textY }}
          className="relative z-10 inline-flex items-center justify-center gap-2 will-change-transform"
        >
          {children}
        </motion.span>
      ) : (
        children
      )}
    </motion.button>
  );
};
