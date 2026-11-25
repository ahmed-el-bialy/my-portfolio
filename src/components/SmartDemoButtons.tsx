import React from 'react';
import { Play, ListVideo, ExternalLink } from 'lucide-react';
import { SmartProjectLinksResolution } from '../utils/projectLinks';
import { useLanguage } from '../context/LanguageContext';

interface SmartDemoButtonsProps {
  resolved: SmartProjectLinksResolution;
  compact?: boolean;
  fullWidthOnRow?: boolean;
  stopPropagation?: boolean;
  onWatchDemo?: (videoUrl: string) => void;
}

export const SmartDemoButtons: React.FC<SmartDemoButtonsProps> = ({
  resolved,
  compact = false,
  fullWidthOnRow = false,
  stopPropagation = true,
  onWatchDemo,
}) => {
  const { t } = useLanguage();

  if (resolved.mode === 'none') {
    return null;
  }

  const youtubeWatchBtnClass = compact
    ? 'btn-kinetic group/demo inline-flex items-center justify-center gap-2 px-3.5 py-2 min-h-[42px] sm:min-h-[38px] rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white border border-rose-400/40 shadow-md shadow-rose-600/30 hover:shadow-lg hover:shadow-rose-500/40 font-bold text-xs whitespace-nowrap shrink-0 min-w-0 transition-all cursor-pointer active:scale-[0.97]'
    : `${
        fullWidthOnRow ? 'flex-1 min-w-[132px]' : 'shrink-0 min-w-0'
      } btn-kinetic group/demo inline-flex items-center justify-center gap-2 py-2.5 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white border border-rose-400/40 shadow-md shadow-rose-600/30 hover:shadow-lg hover:shadow-rose-500/40 font-bold text-xs min-h-[42px] sm:min-h-[40px] whitespace-nowrap transition-all cursor-pointer active:scale-[0.97]`;

  const youtubePlaylistBtnClass = compact
    ? 'btn-kinetic group/demo inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[42px] sm:min-h-[38px] rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white border border-amber-300/40 shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/35 font-bold text-xs whitespace-nowrap shrink-0 min-w-0 transition-all cursor-pointer active:scale-[0.97]'
    : `${
        fullWidthOnRow ? 'flex-1 min-w-[128px]' : 'shrink-0 min-w-0'
      } btn-kinetic group/demo inline-flex items-center justify-center gap-2 py-2.5 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white border border-amber-300/40 shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/35 font-bold text-xs min-h-[42px] sm:min-h-[40px] whitespace-nowrap transition-all cursor-pointer active:scale-[0.97]`;

  const webLiveBtnClass = compact
    ? 'btn-kinetic group/demo inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[42px] sm:min-h-[38px] rounded-xl bg-gradient-to-r from-[#0284ff] to-[#0099FF] hover:from-[#026ae0] hover:to-[#0284ff] text-white border border-sky-400/40 shadow-md shadow-[#0284ff]/30 hover:shadow-lg hover:shadow-[#0284ff]/40 font-bold text-xs whitespace-nowrap shrink-0 min-w-0 transition-all active:scale-[0.97]'
    : `${
        fullWidthOnRow ? 'flex-1 min-w-[132px]' : 'shrink-0 min-w-0'
      } btn-kinetic group/demo inline-flex items-center justify-center gap-2 py-2.5 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-[#0284ff] to-[#0099FF] hover:from-[#026ae0] hover:to-[#0284ff] text-white border border-sky-400/40 shadow-md shadow-[#0284ff]/30 hover:shadow-lg hover:shadow-[#0284ff]/40 font-bold text-xs min-h-[42px] sm:min-h-[40px] whitespace-nowrap transition-all active:scale-[0.97]`;

  const handleStop = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  const playBadge = (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 shrink-0 transition-transform duration-200 group-hover/demo:scale-110">
      <Play size={10} fill="currentColor" className="ms-0.5" />
    </span>
  );

  const renderWatchButton = (videoUrl: string) =>
    onWatchDemo ? (
      <button
        type="button"
        onClick={(e) => {
          handleStop(e);
          onWatchDemo(videoUrl);
        }}
        className={youtubeWatchBtnClass}
      >
        {playBadge}
        <span>{t.projects.actions.watchDemo}</span>
      </button>
    ) : (
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleStop}
        className={youtubeWatchBtnClass}
      >
        {playBadge}
        <span>{t.projects.actions.watchDemo}</span>
      </a>
    );

  return (
    <>
      {/* Case A: Both demoVideoUrl (latest update -> Watch Demo) AND playlistUrl (full playlist -> Full Demo) */}
      {resolved.mode === 'fullDemoAndPlaylist' && resolved.demoVideoUrl && (
        <>
          {renderWatchButton(resolved.demoVideoUrl)}
          <a
            href={resolved.playlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleStop}
            className={youtubePlaylistBtnClass}
          >
            <ListVideo
              size={14}
              className="shrink-0 transition-transform duration-200 group-hover/demo:scale-110"
            />
            <span>{t.projects.actions.fullDemo}</span>
          </a>
        </>
      )}

      {/* Case B: Only demoVideoUrl (latest update video) -> Watch Demo */}
      {resolved.mode === 'watchDemo' &&
        resolved.demoVideoUrl &&
        renderWatchButton(resolved.demoVideoUrl)}

      {/* Case C: Only playlistUrl (full playlist walkthrough) -> Full Demo */}
      {resolved.mode === 'playlistOnly' && resolved.playlistUrl && (
        <a
          href={resolved.playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleStop}
          className={youtubePlaylistBtnClass}
        >
          <ListVideo
            size={14}
            className="shrink-0 transition-transform duration-200 group-hover/demo:scale-110"
          />
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
          <ExternalLink
            size={13}
            className="shrink-0 transition-transform duration-200 group-hover/demo:scale-110"
          />
          <span>{t.projects.actions.liveDemo}</span>
        </a>
      )}
    </>
  );
};
