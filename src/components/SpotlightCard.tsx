import React, { useRef, useState, useCallback, useEffect } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(56, 189, 248, 0.14)',
  borderColor = 'rgba(56, 189, 248, 0.38)',
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const coordsRef = useRef({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseMove?.(e);
      if (!cardRef.current) return;
      if (
        typeof window !== 'undefined' &&
        (window.matchMedia('(pointer: coarse)').matches ||
          window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      ) {
        return;
      }

      const rect = cardRef.current.getBoundingClientRect();
      coordsRef.current.x = e.clientX - rect.left;
      coordsRef.current.y = e.clientY - rect.top;

      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(() => {
          rafRef.current = null;
          if (!cardRef.current) return;
          cardRef.current.style.setProperty('--mx', `${coordsRef.current.x}px`);
          cardRef.current.style.setProperty('--my', `${coordsRef.current.y}px`);
        });
      }
    },
    [onMouseMove]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsActive(true);
      onMouseEnter?.(e);
    },
    [onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsActive(false);
      onMouseLeave?.(e);
    },
    [onMouseLeave]
  );

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] shadow-sm hover:shadow-xl dark:shadow-none transition-[border-color,box-shadow] duration-200 ${className}`}
      style={{
        ['--mx' as string]: '50%',
        ['--my' as string]: '50%',
      }}
      {...props}
    >
      {/* Dynamic Luminous Border Spotlight Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[1px] rounded-2xl sm:rounded-3xl transition-opacity duration-200 z-10"
        style={{
          opacity: isActive ? 1 : 0,
          background: `radial-gradient(340px circle at var(--mx) var(--my), ${borderColor}, transparent 70%)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1.5px',
        }}
      />

      {/* Soft Ambient Surface Spotlight Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px transition-opacity duration-200 z-0"
        style={{
          opacity: isActive ? 1 : 0,
          background: `radial-gradient(420px circle at var(--mx) var(--my), ${spotlightColor}, transparent 65%)`,
        }}
      />

      {/* Inner Surface Container */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};
