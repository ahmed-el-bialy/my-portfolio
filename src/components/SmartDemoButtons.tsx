import React from 'react';
import { Youtube, ListVideo, ExternalLink } from 'lucide-react';
import { SmartProjectLinksResolution } from '../utils/projectLinks';
import { useLanguage } from '../context/LanguageContext';

interface SmartDemoButtonsProps {
  resolved: SmartProjectLinksResolution;
  compact?: boolean;
  fullWidthOnRow?: boolean;
  stopPropagation?: boolean;
}

export const SmartDemoButtons: React.FC<SmartDemoButtonsProps> = ({
  resolved,
  compact = false,
  fullWidthOnRow = false,
  stopPropagation = true,
}) => {
  const { t } = useLanguage();

  if (resolved.mode === 'none') {
    return null;
  }

  const youtubeWatchBtnClass = compact
    ? 'btn-kinetic inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-sm shadow-rose-600/25 font-bold text-[11px] whitespace-nowrap transition-all'
    : `${
        fullWidthOnRow ? 'flex-1 min-w-[128px]' : ''
      } btn-kinetic inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-md shadow-rose-600/25 font-bold text-xs min-h-[40px] whitespace-nowrap transition-all`;

  const youtubePlaylistBtnClass = compact
    ? 'btn-kinetic inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 min-h-[34px] rounded-xl bg-amber-500/15 hover:bg-amber-600 hover:text-white text-amber-700 dark:text-amber-300 border border-amber-500/35 font-bold text-[11px] whitespace-nowrap transition-all'
    : `${
        fullWidthOnRow ? 'flex-1 min-w-[120px]' : ''
      } btn-kinetic inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-600 hover:text-white text-amber-700 dark:text-amber-300 border border-amber-500/35 font-bold text-xs min-h-[40px] whitespace-nowrap transition-all`;

  const webLiveBtnClass = compact
    ? 'btn-kinetic inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-xl bg-gradient-to-r from-[#027DFD] to-[#0099FF] hover:from-[#026ae0] hover:to-[#027DFD] text-white shadow-sm shadow-[#027DFD]/30 font-bold text-[11px] whitespace-nowrap transition-all'
    : `${
        fullWidthOnRow ? 'flex-1 min-w-[128px]' : ''
      } btn-kinetic inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#027DFD] to-[#0099FF] hover:from-[#026ae0] hover:to-[#027DFD] text-white shadow-md shadow-[#027DFD]/30 font-bold text-xs min-h-[40px] whitespace-nowrap transition-all`;

  const handleStop = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  return (
    <>
      {/* Case A: Both demoVideoUrl (latest update -> Watch Demo) AND playlistUrl (full playlist -> Full Demo) */}
      {resolved.mode === 'fullDemoAndPlaylist' && (
        <>
          <a
            href={resolved.demoVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleStop}
            className={youtubeWatchBtnClass}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
            <Youtube size={compact ? 12 : 14} className="shrink-0" />
            <span>{t.projects.actions.watchDemo}</span>
          </a>
          <a
            href={resolved.playlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleStop}
            className={youtubePlaylistBtnClass}
          >
            <ListVideo size={compact ? 12 : 14} className="shrink-0" />
            <span>{t.projects.actions.fullDemo}</span>
          </a>
        </>
      )}

      {/* Case B: Only demoVideoUrl (latest update video) -> Watch Demo */}
      {resolved.mode === 'watchDemo' && resolved.demoVideoUrl && (
        <a
          href={resolved.demoVideoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleStop}
          className={youtubeWatchBtnClass}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
          <Youtube size={compact ? 12 : 14} className="shrink-0" />
          <span>{t.projects.actions.watchDemo}</span>
        </a>
      )}

      {/* Case C: Only playlistUrl (full playlist walkthrough) -> Full Demo */}
      {resolved.mode === 'playlistOnly' && resolved.playlistUrl && (
        <a
          href={resolved.playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleStop}
          className={youtubePlaylistBtnClass}
        >
          <ListVideo size={compact ? 12 : 14} className="shrink-0" />
          <span>{t.projects.actions.fullDemo}</span>
        </a>
      )}

      {/* Case D: Hosted web live demo (non-YouTube) -> Live Demo */}
      {resolved.mode === 'webLiveDemo' && resolved.webLiveDemoUrl && (
        <a
          href={resolved.webLiveDemoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleStop}
          className={webLiveBtnClass}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse shrink-0" />
          <ExternalLink size={compact ? 12 : 14} className="shrink-0" />
          <span>{t.projects.actions.liveDemo}</span>
        </a>
      )}
    </>
  );
};
