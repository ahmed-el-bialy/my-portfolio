import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface SmartphoneFrameProps {
  children: React.ReactNode;
  aspectRatio?: '9:16' | '16:9';
  deviceName?: string;
  className?: string;
  isVertical?: boolean;
}

export const SmartphoneFrame: React.FC<SmartphoneFrameProps> = ({
  children,
  aspectRatio = '9:16',
  deviceName = 'Ahmed El-Bialy App',
  className = '',
  isVertical = true,
}) => {
  if (!isVertical) {
    return (
      <div className={`relative mx-auto rounded-xl overflow-hidden bg-zinc-900 border-2 border-zinc-700 shadow-2xl ${className}`}>
        <div className="bg-zinc-800 px-4 py-2 flex items-center justify-between border-b border-zinc-700/60">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs font-mono text-zinc-400 ml-2">{deviceName}</span>
          </div>
          <Monitor className="w-4 h-4 text-zinc-500" />
        </div>
        <div className="relative aspect-video bg-black">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative mx-auto w-full max-w-[300px] sm:max-w-[340px] ${className}`}>
      {/* Outer Phone Bezel */}
      <div className="relative rounded-[40px] p-3 bg-zinc-950 border-[4px] border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20">
        
        {/* Speaker & Camera Notch / Dynamic Island */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-3 bg-zinc-900 px-4 py-1.5 rounded-full border border-zinc-800/80 shadow-inner">
          <div className="w-12 h-1.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-700/50 relative flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-cyan-500/60 animate-pulse" />
          </div>
        </div>

        {/* Side Buttons (Simulated) */}
        <div className="absolute -left-[7px] top-24 w-1 h-10 bg-zinc-800 rounded-l-md" />
        <div className="absolute -left-[7px] top-38 w-1 h-10 bg-zinc-800 rounded-l-md" />
        <div className="absolute -right-[7px] top-28 w-1 h-14 bg-zinc-800 rounded-r-md" />

        {/* Screen Container */}
        <div className="relative rounded-[32px] overflow-hidden bg-black aspect-[9/19] border border-zinc-900 shadow-inner flex flex-col">
          {/* Status Bar */}
          <div className="absolute top-0 inset-x-0 h-9 z-20 px-6 flex items-center justify-between text-[11px] font-mono text-zinc-400 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
            <span className="font-semibold text-zinc-300">9:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-cyan-400 font-bold">5G</span>
              <div className="w-4 h-2 rounded-sm border border-zinc-400 p-0.5 flex items-center">
                <div className="h-full w-2.5 bg-zinc-300 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Video / Content View */}
          <div className="relative w-full h-full flex-1 pt-4">
            {children}
          </div>

          {/* Home Indicator Bar */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-600/70 rounded-full z-20 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
