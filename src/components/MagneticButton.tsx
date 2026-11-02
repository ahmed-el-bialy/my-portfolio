import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  strength?: number; // Distance multiplier (default 0.3)
  textParallax?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  strength = 0.35,
  textParallax = true,
  onClick,
  ...props
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    }
  }, []);

  // Spring physics for buttery-smooth magnetic motion (Transitions.dev & GSAP standard)
  const springConfig = { damping: 16, stiffness: 220, mass: 0.1 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const textX = useSpring(0, { damping: 14, stiffness: 260, mass: 0.1 });
  const textY = useSpring(0, { damping: 14, stiffness: 260, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isTouchDevice || !ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    x.set(middleX * strength);
    y.set(middleY * strength);

    if (textParallax) {
      textX.set(middleX * (strength * 0.4));
      textY.set(middleY * (strength * 0.4));
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    textX.set(0);
    textY.set(0);
  };

  if (isTouchDevice) {
    return (
      <button ref={ref} onClick={onClick} className={className} {...props}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x, y }}
      className={`relative inline-flex items-center justify-center will-change-transform ${className}`}
      {...(props as any)}
    >
      {textParallax ? (
        <motion.span
          style={{ x: textX, y: textY }}
          className="relative z-10 flex items-center justify-center gap-2 will-change-transform w-full h-full"
        >
          {children}
        </motion.span>
      ) : (
        children
      )}
    </motion.button>
  );
};
