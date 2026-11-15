import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Github,
  Linkedin,
  Mail,
  ArrowRight,
  Video,
  Youtube,
  Download,
  Star,
  FolderGit2,
  Smartphone,
} from 'lucide-react';
import { DeveloperProfile, FEATURED_PROJECTS } from '../data/portfolioData';
import { AHMED_CONFIG } from '../data/config';
import { WhatsAppLogo, TikTokLogo } from './TechLogos';
import { BrandLogoMark } from './BrandLogoMark';
import { useLanguage } from '../context/LanguageContext';
import { MagneticButton } from './MagneticButton';
import { TiltCard } from './MotionPrimitives';
import { RevioShowcaseStage } from './RevioShowcaseStage';
import { usePlayStoreAppStats } from '../services/playStoreService';

interface HeroSectionProps {
  profile: DeveloperProfile;
  isDark?: boolean;
  onOpenContact?: () => void;
  onOpenResume: () => void;
  onExploreProjects: () => void;
  onOpenBooking?: () => void;
  onInspectRevio?: () => void;
  totalReposCount?: number;
}

const EASE_EDITORIAL: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  isDark = true,
  onOpenResume,
  onExploreProjects,
  onOpenBooking,
  onInspectRevio,
  totalReposCount,
}) => {
  const { lang, dir, t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [rotatingWordIndex, setRotatingWordIndex] = useState(0);
  const { data: playStats } = usePlayStoreAppStats('com.ahmed.revio');

  const rotatingWords = t.hero.rotatingWords;

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  const displayName = AHMED_CONFIG.name[lang];

  const playRatingDisplay = playStats?.rating ? `★ ${playStats.rating}` : lang === 'ar' ? 'منشور' : 'Live';
  const playDownloadsDisplay = playStats?.downloads || '10+';
  const reposDisplay = `${totalReposCount || 13}+`;
  const productionAppsCount = `${FEATURED_PROJECTS.length}+`;

  const kpis = [
    {
      id: 'play-rating',
      icon: Star,
      badge: 'Google Play',
      value: playRatingDisplay,
      suffix: lang === 'ar' ? 'تقييم Revio' : 'Revio Rating',
      label: playStats?.reviewsCount
        ? lang === 'ar'
          ? `تطبيق Revio على Google Play (${playStats.reviewsCount} مراجعة)`
          : `Revio verified on Google Play (${playStats.reviewsCount} reviews)`
        : lang === 'ar'
        ? 'تطبيق Revio منشور رسمياً ومباشر على Google Play'
        : 'Revio published & verified live on Google Play',
      accentClass: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
      cardSurface:
        'bg-gradient-to-br from-emerald-500/[0.08] via-white to-white dark:from-emerald-500/[0.12] dark:via-[#0f1117] dark:to-[#0f1117] border-emerald-500/30 hover:border-emerald-400/60',
      href: AHMED_CONFIG.socials.playstore,
    },
    {
      id: 'play-downloads',
      icon: Download,
      badge: lang === 'ar' ? 'تحديث تلقائي' : 'Auto-Synced',
      value: playDownloadsDisplay,
      suffix: lang === 'ar' ? 'تحميل' : 'Downloads',
      label: lang === 'ar'
        ? 'إجمالي تحميلات Revio مباشرة من صفحة المتجر'
        : 'Revio installs synced from Google Play listing',
      accentClass: 'text-[#027DFD] dark:text-[#00C7FF]',
      iconBg: 'bg-[#027DFD]/15 text-[#027DFD] dark:text-[#00C7FF] border-[#027DFD]/25',
      cardSurface:
        'bg-gradient-to-br from-[#027DFD]/[0.08] via-white to-white dark:from-[#027DFD]/[0.12] dark:via-[#0f1117] dark:to-[#0f1117] border-[#027DFD]/30 hover:border-[#00C7FF]/55',
      href: AHMED_CONFIG.socials.playstore,
    },
    {
      id: 'github-repos',
      icon: FolderGit2,
      badge: 'GitHub',
      value: reposDisplay,
      suffix: lang === 'ar' ? 'مستودع' : 'Repositories',
      label: lang === 'ar'
        ? 'مشاريع وتطبيقات موبايل مفتوحة المصدر على GitHub'
        : 'Public Flutter & architecture codebases on GitHub',
      accentClass: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
      cardSurface:
        'bg-gradient-to-br from-amber-500/[0.07] via-white to-white dark:from-amber-500/[0.1] dark:via-[#0f1117] dark:to-[#0f1117] border-amber-500/25 hover:border-amber-400/55',
      onClick: onExploreProjects,
    },
    {
      id: 'featured-apps',
      icon: Smartphone,
      badge: 'Clean Arch',
      value: productionAppsCount,
      suffix: lang === 'ar' ? 'تطبيقات إنتاج' : 'Shipped Apps',
      label: lang === 'ar'
        ? 'تطبيقات Flutter متكاملة بـ BLoC/Cubit و REST APIs و Hive'
        : 'Production Flutter apps built with BLoC/Cubit & Hive',
      accentClass: 'text-violet-600 dark:text-violet-400',
      iconBg: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25',
      cardSurface:
        'bg-gradient-to-br from-violet-500/[0.08] via-white to-white dark:from-violet-500/[0.11] dark:via-[#0f1117] dark:to-[#0f1117] border-violet-500/25 hover:border-violet-400/55',
      onClick: onExploreProjects,
    },
  ];

  const availabilityText =
    AHMED_CONFIG.availability === 'open'
      ? lang === 'ar'
        ? 'متاح لفرص العمل والمشاريع'
        : 'Open to Work'
      : lang === 'ar'
      ? 'مشغول حالياً'
      : 'Booked';

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.44, ease: EASE_EDITORIAL },
    },
  };

  const currentRotatingWord = rotatingWords[rotatingWordIndex % rotatingWords.length];

  return (
    <section
      id="overview"
      className="relative px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16 overflow-x-clip w-full"
    >
      <div className="ambient-glow-top absolute inset-0 pointer-events-none" />

      {/* Editorial Split Hero (Equal-stretch alignment) */}
      <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch relative z-10">
        {/* Left Column: Staggered Editorial Typography, Specialty Strip & Clear CTAs */}
        <motion.div
          variants={containerVariants}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="visible"
          className="lg:col-span-6 flex flex-col justify-center items-start gap-4 sm:gap-5"
        >
          {/* Clean Unboxed Kicker Strip */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-slate-600 dark:text-[#94a3b8]"
          >
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {availabilityText}
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span>{AHMED_CONFIG.location[lang]}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span className="font-mono text-[#027DFD] dark:text-[#00C7FF]">
              Flutter &amp; AI
            </span>
          </motion.div>

          {/* Name-First Dominant Editorial Hierarchy */}
          <motion.div variants={itemVariants} className="space-y-3 w-full">
            <div className="flex items-center gap-3.5">
              <BrandLogoMark
                sizeClassName="w-11 h-11 sm:w-12 sm:h-12"
                alt="Ahmed El-Bialy Brand Emblem"
              />
              <h1 className="text-[clamp(2.2rem,4.2vw,3.75rem)] font-extrabold tracking-tight leading-[1.06] text-slate-900 dark:text-[#f1f5f9] [text-wrap:balance]">
                {displayName}
              </h1>
            </div>

            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-[#027DFD] dark:text-[#00C7FF] [text-wrap:balance]">
              {AHMED_CONFIG.title[lang]}
            </h2>

            <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 max-w-xl leading-snug">
              {lang === 'ar'
                ? 'هندسة تطبيقات Flutter للإنتاج بمعايير Clean Architecture.'
                : 'Production Flutter apps engineered with Clean Architecture.'}
            </p>
          </motion.div>

          {/* High-Contrast Animated Specialty Line */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200"
          >
            <span className="font-semibold text-slate-900 dark:text-[#f1f5f9]">
              {t.hero.specializedIn}:
            </span>
            <span className="relative inline-flex items-center overflow-hidden min-h-[26px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${lang}-${currentRotatingWord}`}
                  initial={prefersReducedMotion ? false : { y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={prefersReducedMotion ? undefined : { y: -12, opacity: 0 }}
                  transition={{ duration: 0.26, ease: EASE_EDITORIAL }}
                  className="font-bold text-[#027DFD] dark:text-[#00C7FF]"
                >
                  {currentRotatingWord}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.div>

          {/* Concise Verified Bio */}
          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base text-slate-600 dark:text-[#94a3b8] max-w-xl leading-relaxed"
          >
            {lang === 'ar'
              ? 'أُطوّر تطبيقات Android و iOS باستخدام Flutter وإدارة الحالة BLoC / Cubit مع التخزين المحلي بدون إنترنت عبر Hive. مطوّر تطبيق Revio المنشور رسمياً على Google Play وطالب بكلية الذكاء الاصطناعي — جامعة كفر الشيخ.'
              : 'Building responsive Android & iOS applications with Flutter, BLoC / Cubit state streams, REST APIs, and offline-first Hive persistence. Creator of Revio on Google Play and B.Sc. Artificial Intelligence student at Kafrelsheikh University.'}
          </motion.p>

          {/* Primary Kinetic Action Row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 w-full sm:w-auto"
          >
            <MagneticButton
              onClick={onExploreProjects}
              strength={0.22}
              className="btn-kinetic px-6 py-3 rounded-xl bg-[#027DFD] hover:bg-[#026ae0] text-white font-bold text-sm shadow-md shadow-[#027DFD]/25 cursor-pointer min-h-[46px] flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>{t.hero.exploreApps}</span>
              <ArrowRight size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </MagneticButton>

            {onOpenBooking && (
              <MagneticButton
                onClick={onOpenBooking}
                strength={0.2}
                className="btn-kinetic px-5 py-3 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-slate-100 dark:hover:bg-[#161b27] text-slate-900 dark:text-[#f1f5f9] font-semibold text-sm border border-slate-300 dark:border-white/15 cursor-pointer min-h-[46px] flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Video size={16} className="text-[#027DFD] dark:text-[#00C7FF] shrink-0" />
                <span>{t.hero.bookConsultation}</span>
              </MagneticButton>
            )}

            <button
              type="button"
              onClick={onOpenResume}
              className="btn-kinetic px-4 py-3 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-slate-100 dark:hover:bg-[#161b27] text-slate-800 dark:text-[#f1f5f9] font-semibold text-sm border border-slate-200 dark:border-white/10 cursor-pointer flex items-center justify-center gap-2 min-h-[46px] whitespace-nowrap"
            >
              <Download size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t.hero.downloadCv}</span>
            </button>
          </motion.div>

          {/* Cleanly Spaced Direct Channels Strip (Fixes wrapping overlap between WhatsApp & Email) */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-2.5 pt-2 text-xs text-slate-700 dark:text-slate-300"
          >
            <a
              href={AHMED_CONFIG.socials.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 font-semibold transition-all hover:-translate-y-0.5"
            >
              <WhatsAppLogo size={14} />
              <span>WhatsApp</span>
            </a>

            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl bg-white/85 dark:bg-[#0f1117] hover:border-[#027DFD]/45 hover:text-[#027DFD] dark:hover:text-[#00C7FF] border border-slate-200/90 dark:border-white/10 font-medium transition-all hover:-translate-y-0.5"
            >
              <Github size={14} />
              <span>GitHub</span>
            </a>

            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl bg-white/85 dark:bg-[#0f1117] hover:border-[#027DFD]/45 hover:text-[#027DFD] dark:hover:text-[#00C7FF] border border-slate-200/90 dark:border-white/10 font-medium transition-all hover:-translate-y-0.5"
            >
              <Linkedin size={14} />
              <span>LinkedIn</span>
            </a>

            <a
              href={profile.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl bg-white/85 dark:bg-[#0f1117] hover:border-red-500/40 hover:text-red-500 border border-slate-200/90 dark:border-white/10 font-medium transition-all hover:-translate-y-0.5"
            >
              <Youtube size={14} />
              <span>YouTube</span>
            </a>

            <a
              href={profile.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl bg-white/85 dark:bg-[#0f1117] hover:border-pink-500/40 hover:text-pink-500 border border-slate-200/90 dark:border-white/10 font-medium transition-all hover:-translate-y-0.5"
            >
              <TikTokLogo size={13} />
              <span>TikTok</span>
            </a>

            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl bg-white/85 dark:bg-[#0f1117] hover:border-[#027DFD]/45 hover:text-[#027DFD] dark:hover:text-[#00C7FF] border border-slate-200/90 dark:border-white/10 font-medium transition-all hover:-translate-y-0.5"
            >
              <Mail size={14} />
              <span>Email</span>
            </a>
          </motion.div>
        </motion.div>

        {/* Right Column: Interactive Revio Device Mockup + Shiki Dart Code Stage */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, delay: 0.14, ease: EASE_EDITORIAL }}
          className="lg:col-span-6 flex"
        >
          <RevioShowcaseStage isDark={isDark} onInspectRevio={onInspectRevio} />
        </motion.div>
      </div>

      {/* Full-Width 4-KPI Rich Bento Strip Below Hero Split */}
      <div className="max-w-[1440px] mx-auto w-full mt-10 sm:mt-14 pt-8 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10">
        {kpis.map((kpi, idx) => {
          const KpiIcon = kpi.icon;
          const cardBody = (
            <TiltCard
              maxTilt={5}
              glareOpacity={0.14}
              className={`w-full h-full p-4 sm:p-5 rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between gap-3 ${kpi.cardSurface}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${kpi.iconBg}`}
                >
                  <KpiIcon size={17} />
                </div>
                <span className="text-[10.5px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                  {kpi.badge}
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span
                    className={`text-2xl sm:text-[26px] font-extrabold font-mono tabular-nums tracking-tight ${kpi.accentClass}`}
                  >
                    {kpi.value}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                    {kpi.suffix}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-[#94a3b8] mt-1.5 leading-snug">
                  {kpi.label}
                </p>
              </div>
            </TiltCard>
          );

          return (
            <motion.div
              key={kpi.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.38,
                delay: prefersReducedMotion ? 0 : 0.24 + idx * 0.06,
                ease: EASE_EDITORIAL,
              }}
              className="flex"
            >
              {kpi.href ? (
                <a
                  href={kpi.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#027DFD] rounded-2xl"
                >
                  {cardBody}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={kpi.onClick}
                  className="flex w-full text-start cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#027DFD] rounded-2xl"
                >
                  {cardBody}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
