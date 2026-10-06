import React, { useState, useEffect } from 'react';
import { Smartphone, Code2, Layers, Cpu } from 'lucide-react';
import { getLanguageColor } from '../services/githubService';

interface ProjectCardCoverProps {
  repoName: string;
  language: string | null;
  coverUrl?: string;
  isHighlight?: boolean;
}

export const ProjectCardCover: React.FC<ProjectCardCoverProps> = ({
  repoName,
  language,
  coverUrl,
}) => {
  const [imgFailed, setImgFailed] = useState<boolean>(false);
  // viewMode: 'cover' (pristine screenshot) | 'tech' (technical architecture blueprint)
  const [viewMode, setViewMode] = useState<'cover' | 'tech'>('cover');

  const targetUrl = coverUrl || `https://raw.githubusercontent.com/ahmed-el-bialy/${repoName}/main/screenshots/cover.png`;
  const langColor = getLanguageColor(language);

  // Automatic smooth periodic switching between Cover and Tech Blueprint every 4.5s
  useEffect(() => {
    if (imgFailed) {
      setViewMode('tech');
      return;
    }

    const interval = setInterval(() => {
      setViewMode((prev) => (prev === 'cover' ? 'tech' : 'cover'));
    }, 4500);

    return () => clearInterval(interval);
  }, [imgFailed]);

  const isCoverActive = viewMode === 'cover' && !imgFailed;

  return (
    <div
      className="relative w-full aspect-[16/9] bg-[#090b14] overflow-hidden select-none cursor-pointer border-b border-black/10 dark:border-white/10"
      onClick={(e) => {
        if (!imgFailed) {
          e.stopPropagation();
          setViewMode((prev) => (prev === 'cover' ? 'tech' : 'cover'));
        }
      }}
      title="Switches automatically between Cover and Architecture Specs. Click to flip."
    >
      {/* ========================================================
          LAYER 1: TECHNICAL BLUEPRINT HUD
          ======================================================== */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-[#0c0e1a] via-[#111425] to-[#0a0c16] flex flex-col justify-between p-4 sm:p-5 text-white transition-all duration-500 ease-in-out ${
          !isCoverActive
            ? 'opacity-100 z-10 scale-100'
            : 'opacity-0 z-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Ambient radial glow */}
        <div
          className="absolute top-0 right-0 w-44 h-44 rounded-full opacity-30 pointer-events-none blur-2xl"
          style={{
            background: `radial-gradient(circle, ${langColor} 0%, transparent 70%)`,
          }}
        />

        {/* HUD Header */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 shadow-xs shrink-0"
              style={{ backgroundColor: `${langColor}25`, color: langColor }}
            >
              <Smartphone size={14} />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold truncate">
                Flutter Application
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2.5 py-1 rounded-md bg-white/10 text-[10px] font-mono text-gray-200 border border-white/10 font-medium">
              Production Spec
            </span>
          </div>
        </div>

        {/* Center Title & Architectural Standard */}
        <div className="relative z-10 text-center my-auto px-2">
          <div className="font-mono text-sm sm:text-base font-extrabold tracking-tight text-white group-hover:text-cyan-300 transition-colors drop-shadow-xs truncate">
            {repoName}
          </div>
          <div className="text-xs text-gray-300 mt-1 font-mono flex items-center justify-center gap-1.5">
            <Layers size={12} className="text-cyan-400 shrink-0" />
            <span className="font-medium">Clean Architecture • BLoC/Cubit</span>
          </div>
        </div>

        {/* HUD Footer */}
        <div className="relative z-10 flex items-center justify-between text-[10px] text-gray-400 font-mono pt-2 border-t border-white/10">
          <span className="flex items-center gap-1 text-cyan-400 font-medium">
            <Code2 size={12} /> Standard Build
          </span>
          <span className="text-gray-200 font-mono font-semibold flex items-center gap-1">
            <Cpu size={11} className="text-blue-400" />
            <span>Mobile App</span>
          </span>
        </div>
      </div>

      {/* ========================================================
          LAYER 2: PRISTINE APP COVER PREVIEW
          ======================================================== */}
      {!imgFailed && (
        <div
          className={`absolute inset-0 bg-[#090b14] transition-all duration-500 ease-in-out ${
            isCoverActive
              ? 'opacity-100 z-20 scale-100 pointer-events-auto'
              : 'opacity-0 z-0 scale-105 pointer-events-none'
          }`}
        >
          <img
            src={targetUrl}
            alt={`${repoName} Cover Preview`}
            loading="eager"
            decoding="async"
            onError={() => {
              setImgFailed(true);
              setViewMode('tech');
            }}
            className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500 ease-out"
          />
        </div>
      )}

      {/* 2-dot mode indicator at bottom right */}
      {!imgFailed && (
        <div className="absolute bottom-2.5 right-3 z-30 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 pointer-events-none shadow-md">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              isCoverActive ? 'bg-cyan-400 scale-125 ring-2 ring-cyan-400/40' : 'bg-white/40'
            }`}
            title="Cover View"
          />
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              !isCoverActive ? 'bg-blue-400 scale-125 ring-2 ring-blue-400/40' : 'bg-white/40'
            }`}
            title="Architecture Specs View"
          />
        </div>
      )}
    </div>
  );
};
