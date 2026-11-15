import React from 'react';

interface BrandLogoMarkProps {
  className?: string;
  sizeClassName?: string;
  alt?: string;
}

/**
 * Original white brush-painted Leaf emblem cropped edge-to-edge inside a clean
 * high-contrast black circle so every brushstroke reads sharply at every size.
 */
export const BrandLogoMark: React.FC<BrandLogoMarkProps> = ({
  className = '',
  sizeClassName = 'w-9 h-9',
  alt = 'Ahmed El-Bialy Leaf Emblem',
}) => {
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full bg-black overflow-hidden ring-1 ring-slate-300/80 dark:ring-white/20 shadow-sm shrink-0 ${sizeClassName} ${className}`}
    >
      <img
        src="/brand-logo-mark.png?v=4"
        alt={alt}
        draggable={false}
        className="w-full h-full object-cover rounded-full scale-[1.06] select-none pointer-events-none"
      />
    </span>
  );
};
