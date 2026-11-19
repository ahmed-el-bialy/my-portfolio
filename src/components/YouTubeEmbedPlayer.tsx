import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Loader2, Youtube } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface YouTubeEmbedPlayerProps {
  videoId: string;
  title: string;
  youtubeUrl?: string;
  autoplay?: boolean;
  className?: string;
}

export const YouTubeEmbedPlayer: React.FC<YouTubeEmbedPlayerProps> = ({
  videoId,
  title,
  youtubeUrl,
  autoplay = true,
  className = '',
}) => {
  const { lang, dir } = useLanguage();
  const [ready, setReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const settleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setReady(false);
    setTimedOut(false);
    setPosterError(false);

    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }

    const slowTimer = window.setTimeout(() => {
      setTimedOut(true);
    }, 4500);

    return () => {
      window.clearTimeout(slowTimer);
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    };
  }, [videoId]);

  const handleIframeLoad = () => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
    }
    // Brief compositor settle after iframe HTML loads so the YouTube player frame paints cleanly
    settleTimerRef.current = window.setTimeout(() => {
      setReady(true);
    }, 180);
  };

  const posterUrl = `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
  const embedSrc = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
    videoId
  )}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`;
  const directWatchUrl =
    youtubeUrl && youtubeUrl.trim().length > 0
      ? youtubeUrl
      : `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;

  return (
    <div
      dir={dir}
      className={`relative w-full h-full bg-[#08090d] overflow-hidden select-none ${className}`}
    >
      {/* YouTube Embed Iframe — fades in smoothly only after ready */}
      <iframe
        key={embedSrc}
        src={embedSrc}
        title={title}
        onLoad={handleIframeLoad}
        className={`relative z-10 w-full h-full border-0 transition-opacity duration-300 motion-reduce:transition-none ${
          ready ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      {/* Blurred Poster + Loading Scrim Overlay — prevents black screen flash */}
      <div
        aria-hidden={ready}
        aria-busy={!ready}
        className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 transition-opacity duration-300 motion-reduce:transition-none ${
          ready ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Blurred Video Poster Backdrop or Gradient Fallback */}
        {!posterError ? (
          <img
            src={posterUrl}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setPosterError(true)}
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-md opacity-55"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#0d1424] via-[#08090d] to-[#111827]"
          />
        )}

        {/* Measured Contrast Scrim (>= 4.5:1 text contrast over any frame) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/65 to-black/75"
        />

        {/* Centered Loading Status */}
        <div className="relative z-10 flex flex-col items-center text-center gap-3 max-w-xs">
          <div className="relative w-14 h-14 rounded-2xl bg-[#0b101b]/90 border border-white/15 shadow-xl flex items-center justify-center">
            <Loader2
              size={24}
              className="text-[#0284ff] animate-spin motion-reduce:animate-none"
            />
            <span className="absolute -bottom-1 -end-1 w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center shadow-sm">
              <Youtube size={11} />
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold text-white tracking-tight">
              {lang === 'ar'
                ? 'جاري تجهيز وتشغيل الفيديو...'
                : 'Preparing & Loading Video...'}
            </p>
            <p className="text-[11px] font-mono text-slate-300 tabular-nums">
              {timedOut
                ? lang === 'ar'
                  ? 'يستغرق مشغل يوتيوب وقتاً أطول من المعتاد'
                  : 'YouTube player is taking a little longer'
                : lang === 'ar'
                ? 'يتم الاتصال بمشغل يوتيوب'
                : 'Connecting to YouTube player'}
            </p>
          </div>

          {timedOut && (
            <a
              href={directWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-kinetic inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] sm:min-h-[38px] rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-colors whitespace-nowrap"
            >
              <Youtube size={14} className="shrink-0" />
              <span>
                {lang === 'ar' ? 'فتح مباشرة على يوتيوب' : 'Open directly on YouTube'}
              </span>
              <ExternalLink size={12} className="shrink-0" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
