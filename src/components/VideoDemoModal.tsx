import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Youtube, ExternalLink, Play, Sparkles, Smartphone } from 'lucide-react';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { useLanguage } from '../context/LanguageContext';
import { extractYouTubeVideoId } from '../services/githubService';
import { YouTubeEmbedPlayer } from './YouTubeEmbedPlayer';

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
  const { lang, dir } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);

  useAccessibleDialog(isOpen, onClose, dialogRef);

  if (typeof document === 'undefined') return null;

  const videoId = extractYouTubeVideoId(videoUrl);
  const isShorts = Boolean(videoUrl && videoUrl.includes('/shorts/'));
  const targetRedirectUrl = videoUrl && videoId ? videoUrl : youtubeChannelUrl;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="video-demo-backdrop"
          dir={dir}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-modal-title"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl my-auto bg-white dark:bg-[#121420] border border-slate-200 dark:border-white/15 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 bg-slate-100 dark:bg-[#171928] border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-red-600/10 dark:bg-red-600/20 text-red-600 dark:text-red-500 flex items-center justify-center shrink-0">
                  <Youtube size={18} />
                </div>
                <div className="min-w-0">
                  <h3 id="video-modal-title" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                    <span className="truncate">{projectName}</span>
                    {isShorts ? (
                      <span className="text-[11px] font-mono text-red-700 dark:text-red-400 font-bold shrink-0 inline-flex items-center gap-1">
                        <Smartphone size={11} />
                        <span>Shorts Demo</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-red-700 dark:text-red-400 font-semibold shrink-0">
                        {lang === 'ar' ? 'عرض فيديو' : 'Demo'}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-gray-400 truncate">
                    {lang === 'ar' ? 'فيديو استعراض ومحاكاة ميزات التطبيق' : 'Mobile App Demonstration Video'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ms-2"
                aria-label="Close video"
              >
                <X size={16} />
              </button>
            </div>

            {/* Resilient Video Player or YouTube Channel Showcase */}
            {videoId ? (
              <div className="relative aspect-[16/9] w-full bg-[#08090d] flex items-center justify-center overflow-hidden">
                <YouTubeEmbedPlayer
                  videoId={videoId}
                  title={`${projectName} Video Demo`}
                  youtubeUrl={targetRedirectUrl}
                  autoplay={true}
                />
              </div>
            ) : (
              <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-slate-900 via-[#101222] to-slate-950 p-6 flex flex-col items-center justify-center text-center text-white">
                <div className="w-16 h-16 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center mb-3 shadow-lg">
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
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-lg shadow-red-600/30 whitespace-nowrap"
                >
                  <Play size={14} fill="currentColor" />
                  <span>{lang === 'ar' ? 'فتح قناة اليوتيوب (@ahmedel-bialy)' : 'Open YouTube Channel (@ahmedel-bialy)'}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            )}

            {/* Footer Actions */}
            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-[#141624] border-t border-slate-200 dark:border-white/5 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 dark:text-gray-400 font-mono text-[11px] flex items-center gap-1.5 truncate">
                <Sparkles size={12} className="text-[#0369a1] dark:text-[#38bdf8] shrink-0" />
                <span>YouTube: @ahmedel-bialy</span>
              </span>
              <a
                href={targetRedirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-700 dark:text-red-400 hover:underline flex items-center gap-1 font-semibold transition-colors whitespace-nowrap shrink-0 py-1"
              >
                <span>{lang === 'ar' ? 'فتح على YouTube' : 'Open in YouTube'}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
