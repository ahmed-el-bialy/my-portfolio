import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  ExternalLink,
  Loader2,
  Clock,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Video,
  CheckCircle2,
  Mail,
  Zap,
  Compass,
  Code2,
} from 'lucide-react';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { useLanguage } from '../context/LanguageContext';
import { DeveloperProfile, AHMED_PROFILE, getGmailComposeUrl } from '../data/portfolioData';
import { AHMED_CONFIG } from '../data/config';
import { WhatsAppLogo } from './TechLogos';

export type MeetingType = 'quick-chat' | 'discovery-cal' | 'technical-discussion';

interface BookingMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: DeveloperProfile;
  initialType?: MeetingType | null;
}

interface MeetingOption {
  id: MeetingType;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  idealForEn: string[];
  idealForAr: string[];
  duration: string;
  url: string;
  badgeEn: string;
  badgeAr: string;
  icon: React.FC<{ size?: number; className?: string }>;
  accentClass: string;
  iconBgClass: string;
}

const MEETING_OPTIONS: MeetingOption[] = [
  {
    id: 'quick-chat',
    titleEn: 'Quick Intro Chat',
    titleAr: 'محادثة تعريفية سريعة',
    descEn: 'Focused conversation on role availability, team fit, or initial freelance check.',
    descAr: 'جلسة مركزة للتعارف ومناقشة فرص العمل أو التحقق المبدئي من فكرة مشروعك.',
    idealForEn: ['Recruiter screening', 'Project feasibility', 'Team fit check'],
    idealForAr: ['مقابلة مبدئية للتوظيف', 'تقييم سريع لفكرة تطبيق', 'تنسيق تعاون مباشر'],
    duration: '15 mins',
    url: 'https://cal.com/ahmed-elbaily/quick-chat?embed=true',
    badgeEn: 'Fast Intro',
    badgeAr: 'تعارف سريع',
    icon: Zap,
    accentClass: 'text-[#0369a1] dark:text-[#38bdf8]',
    iconBgClass: 'bg-[#0284ff]/12 border-[#0284ff]/25 text-[#0369a1] dark:text-[#38bdf8]',
  },
  {
    id: 'discovery-cal',
    titleEn: 'Product Discovery Call',
    titleAr: 'مكالمة استكشافية للمشروع',
    descEn: 'Deep dive into mobile MVP scope, timeline estimates, store publishing & milestones.',
    descAr: 'استكشاف متكامل لنطاق تطبيقك، مراحل التنفيذ، الجدول الزمني، وخطة النشر على المتاجر.',
    idealForEn: ['Startup MVP planning', 'Scope & timeline estimate', 'Play Store roadmap'],
    idealForAr: ['تخطيط إطلاق MVP', 'تقدير الوقت والميزانية', 'خطة النشر على المتجر'],
    duration: '30 mins',
    url: 'https://cal.com/ahmed-elbaily/discovery-cal?embed=true',
    badgeEn: 'Most Popular',
    badgeAr: 'الأكثر طلباً',
    icon: Compass,
    accentClass: 'text-emerald-700 dark:text-emerald-400',
    iconBgClass: 'bg-emerald-500/12 border-emerald-500/25 text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'technical-discussion',
    titleEn: 'Architecture & Code Review',
    titleAr: 'نقاش تقني ومعماري',
    descEn: 'Technical session covering Clean Architecture, BLoC/Cubit, Hive offline sync & APIs.',
    descAr: 'جلسة هندسية متقدمة حول معمارية Clean Architecture، وإدارة الحالة، وربط APIs.',
    idealForEn: ['Engineering interviews', 'App refactoring audit', 'State & API design'],
    idealForAr: ['مقابلات تقنية متقدمة', 'مراجعة وتحسين تطبيق قائم', 'تصميم الـ APIs والتخزين'],
    duration: '45 mins',
    url: 'https://cal.com/ahmed-elbaily/technical-discussion?embed=true',
    badgeEn: 'Engineering Deep Dive',
    badgeAr: 'تعمق هندسي',
    icon: Code2,
    accentClass: 'text-violet-700 dark:text-violet-400',
    iconBgClass: 'bg-violet-500/12 border-violet-500/25 text-violet-700 dark:text-violet-400',
  },
];

export const BookingMeetingModal: React.FC<BookingMeetingModalProps> = ({
  isOpen,
  onClose,
  profile = AHMED_PROFILE,
  initialType = null,
}) => {
  const { isArabic, dir } = useLanguage();
  const [selectedType, setSelectedType] = useState<MeetingType | null>(initialType);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);

  useAccessibleDialog(isOpen, onClose, dialogRef, { disableEscape: true });

  React.useEffect(() => {
    if (isOpen) {
      setSelectedType(initialType || null);
      setIsIframeLoading(true);
    }
  }, [isOpen, initialType]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        e.stopPropagation();
        if (selectedType) {
          setSelectedType(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, selectedType, onClose]);

  if (typeof document === 'undefined') return null;

  const activeOption = MEETING_OPTIONS.find((o) => o.id === selectedType);

  const handleSelectType = (type: MeetingType) => {
    setIsIframeLoading(true);
    setSelectedType(type);
  };

  const currentStep = selectedType ? 2 : 1;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="booking-modal-backdrop"
          dir={dir}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/78 backdrop-blur-md overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[92dvh] sm:h-[86vh] max-h-[880px] focus:outline-none"
          >
            {/* Top Header + Step Progress Bar */}
            <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141722] shrink-0 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedType && (
                    <button
                      type="button"
                      onClick={() => setSelectedType(null)}
                      className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-gray-200 transition-colors cursor-pointer shrink-0"
                      title={isArabic ? 'العودة لاختيار نوع الجلسة' : 'Back to session options'}
                      aria-label={isArabic ? 'العودة لاختيار نوع الجلسة' : 'Back to session options'}
                    >
                      {isArabic ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                    </button>
                  )}

                  <div className="w-9 h-9 rounded-xl bg-[#0284ff]/12 border border-[#0284ff]/25 flex items-center justify-center text-[#0369a1] dark:text-[#38bdf8] shrink-0">
                    <Calendar size={18} />
                  </div>

                  <div className="min-w-0">
                    <h3
                      id="booking-modal-title"
                      className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate"
                    >
                      {selectedType
                        ? isArabic
                          ? activeOption?.titleAr
                          : activeOption?.titleEn
                        : isArabic
                        ? 'حجز استشارة أو مقابلة مباشرة'
                        : 'Schedule a 1-on-1 Consultation'}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                      {selectedType
                        ? `${activeOption?.duration} · Google Meet / Cal.com`
                        : isArabic
                        ? 'اختر نوع الجلسة لحجز الموعد المناسب فورياً'
                        : 'Select a session format to pick your live calendar slot'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {selectedType && activeOption && (
                    <a
                      href={activeOption.url.replace('?embed=true', '')}
                      target="_blank"
                      rel="noreferrer"
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-gray-200 text-xs font-semibold border border-slate-200 dark:border-white/10 transition-colors"
                    >
                      <span>{isArabic ? 'فتح خارجياً' : 'Open External'}</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-white/5 hover:bg-red-500 hover:text-white border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-gray-300 transition-colors cursor-pointer"
                    aria-label="Close booking dialog"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* Guided Step Progress Strip */}
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedType(null)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 min-h-[36px] sm:min-h-0 rounded-lg transition-colors cursor-pointer ${
                    currentStep === 1
                      ? 'bg-[#0284ff] text-white font-bold'
                      : 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 font-semibold'
                  }`}
                >
                  <span className="tabular-nums">01.</span>
                  <span>{isArabic ? 'نوع الجلسة' : 'Session Focus'}</span>
                </button>

                <span className="h-[1px] flex-1 max-w-[36px] bg-slate-300 dark:bg-white/15" />

                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                    currentStep === 2
                      ? 'bg-[#0284ff] text-white font-bold'
                      : 'bg-slate-200/70 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="tabular-nums">02.</span>
                  <span>{isArabic ? 'التوقيت والتأكيد' : 'Pick Time & Confirm'}</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 w-full bg-white dark:bg-[#0f1117] relative overflow-y-auto flex flex-col">
              {!selectedType ? (
                <div className="p-5 sm:p-7 lg:p-8 flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full gap-6">
                  <div className="space-y-5">
                    <div className="text-center max-w-xl mx-auto">
                      <h4 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {isArabic ? 'ما هدف مكالمتنا القادمة؟' : 'Choose the Right Session for Your Goal'}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5">
                        {isArabic
                          ? 'يتم تأكيد الموعد مباشرة وإرسال رابط Google Meet تلقائياً إلى بريدك الإلكتروني.'
                          : 'Instant calendar lock with automatic Google Meet video invite.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                      {MEETING_OPTIONS.map((opt) => {
                        const SessionIcon = opt.icon;
                        const idealList = isArabic ? opt.idealForAr : opt.idealForEn;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectType(opt.id)}
                            className="card-shimmer overflow-hidden group text-start p-5 rounded-2xl bg-slate-50/90 dark:bg-[#141824] border border-slate-200 dark:border-white/10 hover:border-[#0284ff]/50 cursor-pointer shadow-sm hover:shadow-xl flex flex-col justify-between gap-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff]"
                          >
                            <div className="space-y-3.5 w-full">
                              <div className="flex items-center justify-between gap-2">
                                <div
                                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${opt.iconBgClass}`}
                                >
                                  <SessionIcon size={18} />
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold tabular-nums text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-white/10">
                                  <Clock size={12} className="text-[#0369a1] dark:text-[#38bdf8]" />
                                  {opt.duration}
                                </span>
                              </div>

                              <div>
                                <span className={`text-[10.5px] font-mono font-bold block ${opt.accentClass}`}>
                                  {isArabic ? opt.badgeAr : opt.badgeEn}
                                </span>
                                <h5 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-[#0369a1] dark:group-hover:text-[#38bdf8] transition-colors mt-0.5">
                                  {isArabic ? opt.titleAr : opt.titleEn}
                                </h5>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5">
                                  {isArabic ? opt.descAr : opt.descEn}
                                </p>
                              </div>

                              <ul className="space-y-1.5 pt-2 border-t border-slate-200/70 dark:border-white/8">
                                {idealList.map((point) => (
                                  <li
                                    key={point}
                                    className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300"
                                  >
                                    <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="btn-kinetic min-h-[44px] sm:min-h-0 w-full py-2.5 px-3 rounded-xl bg-white dark:bg-white/5 group-hover:bg-[#0284ff] text-[#0369a1] dark:text-[#38bdf8] group-hover:text-white border border-slate-200 dark:border-white/10 group-hover:border-[#0284ff] flex items-center justify-between text-xs font-bold transition-colors">
                              <span>{isArabic ? 'اختيار الموعد' : 'Pick Time Slot'}</span>
                              <ArrowRight size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fast Direct Alternative Strip */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/85 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <Video size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        {isArabic
                          ? 'تفضل التنسيق السريع مباشرة قبل حجز مكالمة؟'
                          : 'Prefer a quick direct message before locking a call?'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={AHMED_CONFIG.socials.whatsapp}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-kinetic inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-[36px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
                      >
                        <WhatsAppLogo size={13} />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={getGmailComposeUrl(profile.email, 'Meeting Inquiry - Flutter Portfolio')}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-kinetic inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-[36px] rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-semibold"
                      >
                        <Mail size={13} />
                        <span>Email</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 w-full relative overflow-hidden flex flex-col">
                  {/* Mobile/Fallback strip inside Step 2 */}
                  <div className="px-4 py-2 bg-slate-100/90 dark:bg-[#141722] border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-2 text-xs shrink-0">
                    <span className="text-slate-600 dark:text-slate-300 truncate">
                      {isArabic ? 'التوقيت يُعرض تلقائياً حسب منطقتك الزمنية' : 'Times auto-detect to your local timezone'}
                    </span>
                    <div className="flex items-center gap-3 shrink-0">
                      <a
                        href={activeOption?.url.replace('?embed=true', '')}
                        target="_blank"
                        rel="noreferrer"
                        className="sm:hidden inline-flex items-center gap-1 text-[#0369a1] dark:text-[#38bdf8] font-bold py-1"
                      >
                        <span>{isArabic ? 'رابط مباشر' : 'Direct Link'}</span>
                        <ExternalLink size={11} />
                      </a>
                      <a
                        href={AHMED_CONFIG.socials.whatsapp}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold hover:underline py-1"
                      >
                        <WhatsAppLogo size={12} />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex-1 relative">
                    {isIframeLoading && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/92 dark:bg-[#0f1117]/92 backdrop-blur-md gap-3 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#0284ff]/10 border border-[#0284ff]/25 flex items-center justify-center text-[#0369a1] dark:text-[#38bdf8]">
                          <Loader2 size={24} className="animate-spin" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {isArabic ? 'جاري تحميل جدول المواعيد المباشر...' : 'Loading Cal.com Live Schedule...'}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-gray-400">
                            {isArabic ? 'لحظات وتظهر الأوقات المتاحة للحجز' : 'Fetching available time slots'}
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
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141722] flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-gray-400 shrink-0">
              <span className="flex items-center gap-1.5 min-w-0">
                <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">
                  {isArabic ? 'مزامنة مباشرة مع Cal.com و Google Meet' : 'Powered by Cal.com & Google Meet'}
                </span>
              </span>

              <div className="flex items-center gap-2 shrink-0">
                {selectedType && (
                  <button
                    type="button"
                    onClick={() => setSelectedType(null)}
                    className="px-3 py-1.5 min-h-[44px] sm:min-h-[34px] rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-white/10 font-semibold transition-colors cursor-pointer"
                  >
                    {isArabic ? 'تغيير الجلسة' : 'Change Session'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 min-h-[44px] sm:min-h-[34px] rounded-xl bg-[#0284ff] hover:bg-[#0070e0] text-white font-semibold transition-colors cursor-pointer"
                >
                  {isArabic ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
