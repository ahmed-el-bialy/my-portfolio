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
    ? 'btn-kinetic inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 border border-red-500/25 font-semibold text-[11px] whitespace-nowrap'
    : `${
        fullWidthOnRow ? 'flex-1 min-w-[120px]' : ''
      } btn-kinetic inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-red-500/10 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 border border-red-500/25 font-semibold text-xs min-h-[38px] whitespace-nowrap`;

  const youtubePlaylistBtnClass = compact
    ? 'btn-kinetic inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-600 hover:text-white text-amber-700 dark:text-amber-300 border border-amber-500/25 font-semibold text-[11px] whitespace-nowrap'
    : `${
        fullWidthOnRow ? 'flex-1 min-w-[120px]' : ''
      } btn-kinetic inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-600 hover:text-white text-amber-700 dark:text-amber-300 border border-amber-500/25 font-semibold text-xs min-h-[38px] whitespace-nowrap`;

  const webLiveBtnClass = compact
    ? 'btn-kinetic inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#027DFD]/10 hover:bg-[#027DFD] hover:text-white text-[#027DFD] dark:text-[#00C7FF] border border-[#027DFD]/25 font-semibold text-[11px] whitespace-nowrap'
    : `${
        fullWidthOnRow ? 'flex-1 min-w-[120px]' : ''
      } btn-kinetic inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#027DFD]/10 hover:bg-[#027DFD] hover:text-white text-[#027DFD] dark:text-[#00C7FF] border border-[#027DFD]/25 font-semibold text-xs min-h-[38px] whitespace-nowrap`;

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
          <ExternalLink size={compact ? 12 : 14} className="shrink-0" />
          <span>{t.projects.actions.liveDemo}</span>
        </a>
      )}
    </>
  );
};
