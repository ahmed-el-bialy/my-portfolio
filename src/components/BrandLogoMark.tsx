import React from 'react';

interface BrandLogoMarkProps {
  className?: string;
  sizeClassName?: string;
  alt?: string;
}

export const BrandLogoMark: React.FC<BrandLogoMarkProps> = ({
  className = '',
  sizeClassName = 'w-8 h-8',
  alt = 'Ahmed El-Bialy Brand Logo',
}) => {
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full p-[2px] bg-gradient-to-br from-[#027DFD] via-[#00C7FF] to-[#38BDF8] shadow-[0_0_12px_rgba(0,199,255,0.28)] dark:shadow-[0_0_14px_rgba(0,199,255,0.36)] shrink-0 ${sizeClassName} ${className}`}
    >
      <span className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center ring-1 ring-black/60">
        <img
          src="/brand-logo-mark.png"
          alt={alt}
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </span>
    </span>
  );
};
