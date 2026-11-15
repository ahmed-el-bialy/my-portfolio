import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  Youtube,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { AHMED_CONFIG } from '../data/config';
import { VERIFIED_REPO_SCREENSHOTS } from '../services/githubService';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import { TiltCard } from './MotionPrimitives';
import { usePlayStoreAppStats } from '../services/playStoreService';
import { useLanguage } from '../context/LanguageContext';

interface RevioShowcaseStageProps {
  isDark?: boolean;
  onInspectRevio?: () => void;
}

const REVIO_STAGE_SCREENS = [
  {
    id: 'home',
    labelEn: 'Home Dashboard',
    labelAr: 'الشاشة الرئيسية',
    captionEn: 'Live flashcard deck metrics & offline persistence',
    captionAr: 'إحصائيات البطاقات والعمل الكامل بدون إنترنت',
    src: VERIFIED_REPO_SCREENSHOTS.Revio[0],
  },
  {
    id: 'quiz',
    labelEn: 'Flip Mode',
    labelAr: 'بطاقات التذكر',
    captionEn: '3D active-recall flip transforms & tactile card states',
    captionAr: 'بطاقات تذكر ثلاثية الأبعاد وتفاعل فوري سريع',
    src: VERIFIED_REPO_SCREENSHOTS.Revio[1],
  },
  {
    id: 'mcq',
    labelEn: 'Smart Quiz',
    labelAr: 'اختبارات ذكية',
    captionEn: 'Cubit-driven MCQ & typo-tolerant answer verification',
    captionAr: 'اختبارات متعددة الخيارات مدارة عبر Cubit',
    src: VERIFIED_REPO_SCREENSHOTS.Revio[2],
  },
  {
    id: 'library',
    labelEn: 'Library CRUD',
    labelAr: 'إدارة المكتبة',
    captionEn: 'Instant Hive local NoSQL filtering & search',
    captionAr: 'تخزين وبحث محلي فوري عبر Hive',
    src: VERIFIED_REPO_SCREENSHOTS.Revio[3],
  },
];

export const RevioShowcaseStage: React.FC<RevioShowcaseStageProps> = ({
  onInspectRevio,
}) => {
  const { lang, t } = useLanguage();
  const [screenIndex, setScreenIndex] = useState(0);
  const { data: playStats } = usePlayStoreAppStats('com.ahmed.revio');

  const activeScreen = REVIO_STAGE_SCREENS[screenIndex];

  const handleNext = () => setScreenIndex((prev) => (prev + 1) % REVIO_STAGE_SCREENS.length);
  const handlePrev = () =>
    setScreenIndex((prev) => (prev - 1 + REVIO_STAGE_SCREENS.length) % REVIO_STAGE_SCREENS.length);

  return (
    <TiltCard
      maxTilt={3}
      glareOpacity={0.09}
      className="w-full h-full flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] p-4 sm:p-5 shadow-xl"
    >
      {/* Clean Uncluttered Stage Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-slate-200/80 dark:border-white/8">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="font-mono text-xs font-bold text-[#027DFD] dark:text-[#00C7FF] truncate">
            Revio · Google Play
          </span>
          {playStats?.downloads && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap tabular-nums">
                {playStats.downloads} {lang === 'ar' ? 'تحميل' : 'Downloads'}
              </span>
            </>
          )}
          {playStats?.rating && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <span className="text-[11px] font-mono font-bold text-amber-500 whitespace-nowrap tabular-nums">
                ★ {playStats.rating}
              </span>
            </>
          )}
          {!playStats?.downloads && !playStats?.rating && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                {lang === 'ar' ? 'منشور رسمياً' : 'Production App'}
              </span>
            </>
          )}
        </div>

        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
          0{screenIndex + 1} / 0{REVIO_STAGE_SCREENS.length}
        </span>
      </div>

      {/* Main Revio Phone Stage */}
      <div className="my-4 flex-1 flex items-center justify-center min-h-[360px]">
        <div className="w-full grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Crisp Larger Phone Frame */}
          <div className="sm:col-span-6 flex justify-center">
            <div className="relative w-[225px] sm:w-[235px] rounded-[34px] p-2.5 bg-[#08090d] border-[3px] border-slate-800 dark:border-slate-700 shadow-2xl">
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-20 w-14 h-3 rounded-full bg-slate-900 border border-slate-800" />
              <div className="relative aspect-[9/18.5] rounded-[24px] overflow-hidden bg-slate-950">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeScreen.id}
                    initial={{ opacity: 0, scale: 0.985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.985 }}
                    transition={{ duration: 0.22 }}
                    className="w-full h-full"
                  >
                    <ImageWithSkeleton
                      src={activeScreen.src}
                      alt={`Revio ${activeScreen.labelEn}`}
                      loading="eager"
                      className="w-full h-full object-cover object-top crisp-screenshot"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Interactive Screen Selector & Verified Product Proof */}
          <div className="sm:col-span-6 flex flex-col justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {lang === 'ar' ? activeScreen.labelAr : activeScreen.labelEn}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {lang === 'ar' ? activeScreen.captionAr : activeScreen.captionEn}
              </p>
            </div>

            {/* Screen Switcher Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {REVIO_STAGE_SCREENS.map((scr, idx) => (
                <button
                  key={scr.id}
                  type="button"
                  onClick={() => setScreenIndex(idx)}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold text-start border transition-colors cursor-pointer truncate ${
                    screenIndex === idx
                      ? 'bg-[#027DFD]/10 border-[#027DFD]/50 text-[#027DFD] dark:text-[#00C7FF]'
                      : 'bg-slate-50 dark:bg-[#161b27] border-slate-200 dark:border-white/8 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  {lang === 'ar' ? scr.labelAr : scr.labelEn}
                </button>
              ))}
            </div>

            {/* Prev / Next Controls + Verified Links */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous screen"
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#161b27] text-slate-700 dark:text-slate-200 flex items-center justify-center hover:border-[#027DFD] transition-colors cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next screen"
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#161b27] text-slate-700 dark:text-slate-200 flex items-center justify-center hover:border-[#027DFD] transition-colors cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              {onInspectRevio && (
                <button
                  type="button"
                  onClick={onInspectRevio}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#027DFD] dark:text-[#00C7FF] hover:underline cursor-pointer"
                >
                  <Layers size={13} />
                  <span>{lang === 'ar' ? 'دراسة الحالة' : 'Full Specs'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-white/8 flex flex-wrap items-center justify-between gap-2">
        <a
          href={AHMED_CONFIG.socials.playstore}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-kinetic inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold whitespace-nowrap shadow-xs"
        >
          <ExternalLink size={13} />
          <span>{lang === 'ar' ? 'تطبيق Revio على Google Play' : 'Get Revio on Google Play'}</span>
        </a>

        <a
          href="https://youtube.com/shorts/FsG1XUAbmDY?si=lvngji7Uz-EKRROJ"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-kinetic inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 border border-red-500/25 text-xs font-semibold whitespace-nowrap"
        >
          <Youtube size={13} />
          <span>{t.projects.actions.watchDemo}</span>
        </a>
      </div>
    </TiltCard>
  );
};
