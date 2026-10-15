import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ExternalLink, Sparkles } from 'lucide-react';
import { DeveloperProfile } from '../data/portfolioData';
import { useScrollLock } from '../hooks/useScrollLock';
import { useLanguage } from '../context/LanguageContext';

interface BookingMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: DeveloperProfile;
}

export const BookingMeetingModal: React.FC<BookingMeetingModalProps> = ({
  isOpen,
  onClose,
}) => {
  useScrollLock(isOpen);
  const { isArabic } = useLanguage();

  if (!isOpen) return null;

  const calUrl = 'https://cal.com/ahmed-elbaily/discovery-cal?embed=true';

  const modalNode = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-4xl bg-slate-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[850px]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isArabic ? 'حجز موعد ومقابلة استشارية' : 'Book a Discovery Call'}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                  Cal.com Live
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                {isArabic
                  ? 'اختر الوقت المناسب وسیتم مزامنة الموعد فورياً مع التقويم'
                  : 'Pick a convenient time slot and sync instantly with calendar'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://cal.com/ahmed-elbaily/discovery-cal"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/10 transition-colors"
            >
              <span>{isArabic ? 'فتح في تاب جديد' : 'Open in new tab'}</span>
              <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Cal.com Inline Embed Iframe */}
        <div className="flex-1 w-full bg-slate-950 relative overflow-hidden">
          <iframe
            src={calUrl}
            title="Cal.com Booking"
            className="w-full h-full border-0 bg-transparent"
            allow="camera; microphone; fullscreen; payment"
          />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-slate-900/40 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-blue-400" />
            <span>{isArabic ? 'مدعوم بواسطة Cal.com الآمن والموثوق' : 'Powered by secure Cal.com scheduling'}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-colors cursor-pointer"
          >
            {isArabic ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};
