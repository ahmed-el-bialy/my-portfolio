import React from 'react';
import { createPortal } from 'react-dom';
import { X, Youtube, ExternalLink, Play, Sparkles } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useLanguage } from '../context/LanguageContext';

interface VideoDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  videoUrl?: string;
  youtubeChannelUrl?: string;
}

export const VideoDemoModal: React.FC<VideoDemoModalProps> = ({
  isOpen,
  onClose,
  projectName,
  videoUrl,
  youtubeChannelUrl = 'https://youtube.com/@ahmedel-bialy',
}) => {
  useScrollLock(isOpen);
  const { lang } = useLanguage();

  if (!isOpen) return null;

  // Extract YouTube ID from shorts, standard watch URLs, or short links
  const extractVideoId = (url?: string): string | null => {
    if (!url) return null;
    try {
      if (url.includes('/shorts/')) {
        const id = url.split('/shorts/')[1]?.split('?')[0]?.split('&')[0];
        if (id && id.length >= 5) return id;
      }
      if (url.includes('watch?v=') || url.includes('&v=')) {
        const id = url.split('v=')[1]?.split('&')[0]?.split('?')[0];
        if (id && id.length >= 5) return id;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
        if (id && id.length >= 5) return id;
      }
    } catch (e) {}
    return null;
  };

  const videoId = extractVideoId(videoUrl);
  const targetRedirectUrl = videoUrl && videoId ? videoUrl : youtubeChannelUrl;

  const node = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-3xl my-auto bg-white dark:bg-[#121420] border border-slate-200 dark:border-white/15 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-slate-100 dark:bg-[#171928] border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-red-600/10 dark:bg-red-600/20 text-red-600 dark:text-red-500 flex items-center justify-center shrink-0">
              <Youtube size={18} />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                <span className="truncate">{projectName}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-semibold shrink-0">
                  {lang === 'ar' ? 'فيديو تجريبي' : 'Demo'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate">
                {lang === 'ar' ? 'فيديو استعراض ومحاكاة ميزات التطبيق' : 'Mobile App Demonstration Video'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ms-2"
            aria-label="Close video"
          >
            <X size={16} />
          </button>
        </div>

        {/* Video Player or YouTube Channel Showcase */}
        {videoId ? (
          <div className="relative aspect-[16/9] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={`${projectName} Video Demo`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-slate-900 via-[#101222] to-slate-950 p-6 flex flex-col items-center justify-center text-center text-white">
            <div className="w-16 h-16 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center mb-3 shadow-lg animate-pulse">
              <Youtube size={32} />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-1">
              {lang === 'ar' ? 'مشاهدة الفيديو على قناة YouTube الرسمية' : 'Watch Demo on Official YouTube Channel'}
            </h4>
            <p className="text-xs text-gray-300 max-w-md mb-4 leading-relaxed font-sans">
              {lang === 'ar' 
                ? 'شاهد جولات تفاعلية ومحاكاة لميزات التطبيق وواجهات المستخدم على القناة الرسمية للمهندس أحمد البيلي على يوتيوب.'
                : 'Watch interactive app walkthroughs, feature showcases, and UI demonstrations on Ahmed El-Bialy\'s YouTube channel.'}
            </p>
            <a
              href={youtubeChannelUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-lg shadow-red-600/30"
            >
              <Play size={14} fill="currentColor" />
              <span>{lang === 'ar' ? 'فتح قناة اليوتيوب (@ahmedel-bialy)' : 'Open YouTube Channel (@ahmedel-bialy)'}</span>
              <ExternalLink size={13} />
            </a>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-[#141624] border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-gray-400 font-mono text-[11px] flex items-center gap-1.5">
            <Sparkles size={12} className="text-cyan-500" />
            <span>YouTube: @ahmedel-bialy</span>
          </span>
          <a
            href={targetRedirectUrl}
            target="_blank"
            rel="noreferrer"
            className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 font-semibold transition-colors"
          >
            <span>{lang === 'ar' ? 'فتح على YouTube' : 'Open in YouTube'}</span>
            <ExternalLink size={12} />
          </a>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(node, document.body) : null;
};
