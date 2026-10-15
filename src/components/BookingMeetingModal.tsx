import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ExternalLink, Sparkles, Loader2, MessageSquare, Clock, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useLanguage } from '../context/LanguageContext';

interface BookingMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MeetingType = 'quick-chat' | 'discovery-cal' | 'technical-discussion';

interface MeetingOption {
  id: MeetingType;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  duration: string;
  url: string;
  badge: string;
  color: string;
}

const MEETING_OPTIONS: MeetingOption[] = [
  {
    id: 'quick-chat',
    titleEn: 'Quick Chat',
    titleAr: 'محادثة سريعة',
    descEn: '15-min introductory chat to discuss project availability & fit.',
    descAr: 'محادثة تعريفية لمدة 15 دقيقة لمناقشة مدى توفر المشروع وإمكانية التعاون.',
    duration: '15 mins',
    url: 'https://cal.com/ahmed-elbaily/quick-chat?embed=true',
    badge: 'Intro & Fit',
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400'
  },
  {
    id: 'discovery-cal',
    titleEn: 'Discovery Call',
    titleAr: 'مكالمة استكشافية',
    descEn: '30-min deep dive into product scope, requirements & mobile architecture.',
    descAr: 'استكشاف شامل لمدة 30 دقيقة لنطاق المشروع، المتطلبات، ومعمارية الهواتف.',
    duration: '30 mins',
    url: 'https://cal.com/ahmed-elbaily/discovery-cal?embed=true',
    badge: 'Most Popular',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400'
  },
  {
    id: 'technical-discussion',
    titleEn: 'Technical Discussion',
    titleAr: 'نقاش تقني ومعماري',
    descEn: '45-min advanced Flutter, BLoC/Cubit state management & backend review.',
    descAr: 'نقاش متقدم لمدة 45 دقيقة حول Flutter، إدارة الحالة BLoC/Cubit، ومراجعة البنية.',
    duration: '45 mins',
    url: 'https://cal.com/ahmed-elbaily/technical-discussion?embed=true',
    badge: 'Deep Architecture',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400'
  }
];

export const BookingMeetingModal: React.FC<BookingMeetingModalProps> = ({
  isOpen,
  onClose,
}) => {
  useScrollLock(isOpen);
  const { isArabic } = useLanguage();
  const [selectedType, setSelectedType] = useState<MeetingType | null>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  if (!isOpen) return null;

  const activeOption = MEETING_OPTIONS.find((o) => o.id === selectedType);

  const handleSelectType = (type: MeetingType) => {
    setIsIframeLoading(true);
    setSelectedType(type);
  };

  const handleBackToSelection = () => {
    setSelectedType(null);
  };

  const modalNode = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-4xl bg-slate-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[850px]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            {selectedType && (
              <button
                type="button"
                onClick={handleBackToSelection}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer me-1"
                title="Back to options"
              >
                {isArabic ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>
                  {selectedType
                    ? (isArabic ? activeOption?.titleAr : activeOption?.titleEn)
                    : (isArabic ? 'حجز موعد ومقابلة استشارية' : 'Book a Meeting')}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                  Cal.com Live
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                {selectedType
                  ? (isArabic ? activeOption?.descAr : activeOption?.descEn)
                  : (isArabic ? 'اختر نوع الاجتماع المناسب لاحتياجاتك' : 'Select the preferred meeting type for your project')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedType && activeOption && (
              <a
                href={activeOption.url.replace('?embed=true', '')}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/10 transition-colors"
              >
                <span>{isArabic ? 'فتح في تاب جديد' : 'Open in new tab'}</span>
                <ExternalLink size={12} />
              </a>
            )}
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

        {/* Modal Body: Either 3 Selection Cards or Cal.com Iframe with Loading Spinner/Skeleton */}
        <div className="flex-1 w-full bg-slate-950 relative overflow-y-auto flex flex-col">
          {!selectedType ? (
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full space-y-4">
              <div className="text-center mb-6">
                <h4 className="text-lg sm:text-xl font-extrabold text-white mb-1">
                  {isArabic ? 'كيف تحب أن نتواصل؟' : 'Choose Your Meeting Type'}
                </h4>
                <p className="text-xs sm:text-sm text-gray-400">
                  {isArabic
                    ? 'اختر من الخيارات التالية لبدء جدولة الموعد مباشرة مع أحمد البيلي'
                    : 'Select a consultation option below to instantly schedule a live video session'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MEETING_OPTIONS.map((opt) => (
                  <motion.div
                    key={opt.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectType(opt.id)}
                    className="group relative p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 hover:border-blue-500/50 cursor-pointer shadow-xl flex flex-col justify-between transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border bg-white/5 ${opt.color}`}>
                          {opt.badge}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-mono text-gray-400">
                          <Clock size={12} className="text-blue-400" />
                          {opt.duration}
                        </span>
                      </div>
                      <h5 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                        {isArabic ? opt.titleAr : opt.titleEn}
                      </h5>
                      <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-4">
                        {isArabic ? opt.descAr : opt.descEn}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-cyan-300">
                      <span>{isArabic ? 'اختر هذا الموعد' : 'Select & Book'}</span>
                      <Calendar size={15} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-center gap-2 text-xs text-gray-500 text-center">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>{isArabic ? 'مزامنة فورية مع التقويم وجلسات آمنة' : 'Instant calendar synchronization & secure video integration'}</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full relative overflow-hidden flex items-center justify-center">
              {isIframeLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/92 backdrop-blur-md gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shadow-lg animate-pulse">
                    <Loader2 size={28} className="animate-spin text-blue-400" />
                  </div>
                  <div className="text-center space-y-1 px-4">
                    <p className="text-sm font-bold text-white">
                      {isArabic ? 'جاري تحميل جدول المواعيد المباشر...' : 'Loading Cal.com Live Calendar...'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {isArabic ? 'يرجى الانتظار ثوانٍ معدودة لتحميل المواعيد المتاحة' : 'Fetching available time slots and calendar schedule'}
                    </p>
                  </div>
                </div>
              )}
              <iframe
                src={activeOption?.url}
                title="Cal.com Booking Embed"
                className="w-full h-full border-0 bg-transparent"
                allow="camera; microphone; fullscreen; payment"
                onLoad={() => setIsIframeLoading(false)}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-slate-900/40 flex items-center justify-between text-xs text-gray-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-blue-400" />
            <span>{isArabic ? 'مدعوم بواسطة Cal.com الآمن والموثوق' : 'Powered by secure Cal.com scheduling'}</span>
          </span>
          <div className="flex items-center gap-2">
            {selectedType && (
              <button
                type="button"
                onClick={handleBackToSelection}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors cursor-pointer"
              >
                {isArabic ? 'تغيير نوع الموعد' : 'Change Meeting Type'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors cursor-pointer shadow-md"
            >
              {isArabic ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};
