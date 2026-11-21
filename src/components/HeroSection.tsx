import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Github,
  Linkedin,
  Mail,
  Phone,
  ArrowRight,
  Briefcase,
  Rocket,
  Youtube,
  Download,
  Star,
  FolderGit2,
  Smartphone,
} from 'lucide-react';
import { DeveloperProfile, FEATURED_PROJECTS, Project } from '../data/portfolioData';
import { AHMED_CONFIG } from '../data/config';
import { WhatsAppLogo, TikTokLogo } from './TechLogos';
import { BrandLogoMark } from './BrandLogoMark';
import { useLanguage } from '../context/LanguageContext';
import { RevioShowcaseStage } from './RevioShowcaseStage';
import { usePlayStoreAppStats } from '../services/playStoreService';

interface HeroSectionProps {
  profile: DeveloperProfile;
  isDark?: boolean;
  entryReady?: boolean;
  onOpenContact?: () => void;
  onOpenResume: () => void;
  onExploreProjects: () => void;
  onOpenBooking?: () => void;
  onInspectRevio?: () => void;
  onInspectProject?: (project: Project, screenIndex?: number) => void;
  totalReposCount?: number;
}

const EASE_EDITORIAL: [number, number, number, number] = [0.16, 1, 0.3, 1];

const CountUpMetric: React.FC<{
  value: string;
  trigger: boolean;
  reducedMotion: boolean;
}> = ({ value, trigger, reducedMotion }) => {
  const match = value.match(/^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!match || !trigger || reducedMotion) {
      setDisplay(value);
      return;
    }

    const [, prefix, numStr, suffix] = match;
    const target = parseFloat(numStr);
    const isFloat = numStr.includes('.');
    const decimals = isFloat ? numStr.split('.')[1]?.length || 1 : 0;

    if (!Number.isFinite(target) || target === 0) {
      setDisplay(value);
      return;
    }

    let rafId = 0;
    const duration = 260;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      const formatted = isFloat ? current.toFixed(decimals) : Math.round(current).toString();
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, trigger, reducedMotion]);

  return <>{display}</>;
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  isDark = true,
  entryReady = true,
  onOpenContact,
  onOpenResume,
  onExploreProjects,
  onOpenBooking,
  onInspectRevio,
  onInspectProject,
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
      accentClass: 'text-emerald-700 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
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
      accentClass: 'text-[#0369a1] dark:text-[#38bdf8]',
      iconBg: 'bg-[#0284ff]/10 text-[#0369a1] dark:text-[#38bdf8] border-[#0284ff]/20',
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
      accentClass: 'text-slate-900 dark:text-white',
      iconBg: 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10',
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
      accentClass: 'text-[#0369a1] dark:text-[#38bdf8]',
      iconBg: 'bg-[#0284ff]/10 text-[#0369a1] dark:text-[#38bdf8] border-[#0284ff]/20',
      onClick: onExploreProjects,
    },
  ];

  const availabilityText =
    AHMED_CONFIG.availability === 'open'
      ? t.hero.statusBadge
      : lang === 'ar'
      ? 'مشغول حالياً'
      : 'Booked';

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.045,
        delayChildren: 0.02,
      },
    },
  };

  const itemVariants = {
    hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.24, ease: EASE_EDITORIAL },
    },
  };

  const currentRotatingWord = rotatingWords[rotatingWordIndex % rotatingWords.length];
  const emailHref = `mailto:${profile.email}?subject=${encodeURIComponent(
    'Flutter Mobile Developer Opportunity'
  )}`;

  return (
    <section
      id="overview"
      className="relative px-4 sm:px-6 lg:px-8 pt-[68px] pb-6 sm:pt-24 sm:pb-12 overflow-x-clip w-full"
    >
      <div className="ambient-glow-top absolute inset-0 pointer-events-none" />

      {/* Editorial Split Hero (Equal-stretch alignment) */}
      <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 items-stretch relative z-10">
        {/* Left Column: Staggered Editorial Typography, Specialty Strip & Dual HR/Freelance CTAs */}
        <motion.div
          variants={containerVariants}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate={entryReady ? 'visible' : 'hidden'}
          className="lg:col-span-6 flex flex-col justify-center items-start gap-3 sm:gap-4"
        >
          {/* 1. Availability & Discipline Strip */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] sm:text-[13px] font-medium text-slate-600 dark:text-[#94a3b8]"
          >
            <span className="inline-flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-2.5 py-1">
              <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500 shrink-0" aria-hidden="true" />
              <span>{availabilityText}</span>
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span>{AHMED_CONFIG.location[lang]}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700 hidden sm:inline">
              ·
            </span>
            <span className="font-mono text-[#0369a1] dark:text-[#38bdf8] font-semibold hidden sm:inline">
              {lang === 'ar' ? 'Flutter والذكاء الاصطناعي' : 'Flutter & AI'}
            </span>
          </motion.div>

          {/* 2–5. Cohesive Hero Signature Lockup: Compact Geometric Outfit "Meet" Eyebrow + Emblem & Display Name */}
          <div className="space-y-1.5 sm:space-y-2.5 w-full pt-0.5">
            <motion.div variants={itemVariants}>
              <span
                className={`inline-block font-meet-accent font-bold leading-snug tracking-tight gradient-text ${
                  lang === 'ar'
                    ? 'text-base sm:text-xl lg:text-[22px]'
                    : 'text-lg sm:text-xl lg:text-[24px]'
                }`}
              >
                {t.hero.thisIs}
              </span>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-3.5 sm:gap-5 min-w-0 ps-1">
              <span className="inline-flex shrink-0">
                <BrandLogoMark
                  floatEffect={true}
                  sizeClassName="w-10 h-10 sm:w-14 sm:h-14"
                  alt="Ahmed El-Bialy Brand Emblem"
                />
              </span>
              <h1 className="font-display text-[clamp(1.95rem,7.8vw,4.35rem)] font-extrabold tracking-tight leading-[1.04] text-slate-900 dark:text-[#f1f5f9] [text-wrap:balance] min-w-0">
                {displayName}
              </h1>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="font-display text-[17px] sm:text-2xl lg:text-[26px] font-bold tracking-[-0.015em] text-[#0369a1] dark:text-[#38bdf8] [text-wrap:balance] pt-0.5"
            >
              {t.hero.headlineRole}
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-[15px] sm:text-[17px] font-semibold text-slate-800 dark:text-slate-100 max-w-xl leading-relaxed"
            >
              {t.hero.tagline}{' '}
              <span className="font-normal text-slate-600 dark:text-[#94a3b8]">
                · {t.hero.subAvailability}
              </span>
            </motion.p>
          </div>

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
                  initial={prefersReducedMotion ? false : { y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={prefersReducedMotion ? undefined : { y: -10, opacity: 0 }}
                  transition={{ duration: 0.22, ease: EASE_EDITORIAL }}
                  className="font-bold text-[#0369a1] dark:text-[#38bdf8]"
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
            {t.hero.bio}
          </motion.p>

          {/* Balanced 2-Tier Action Hierarchy: Single Solid Primary Anchor + Quiet Secondary Actions */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-2.5 pt-1.5 w-full max-w-[540px]"
          >
            {/* Tier 1: Primary Conversion Pair (Sole Focal Primary CTA + Quiet Secondary Hire Me) */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2.5">
              <button
                type="button"
                onClick={onExploreProjects}
                className="cta-primary group px-4 sm:px-5 py-3 rounded-xl bg-[#0284ff] hover:bg-[#0070e0] text-white font-bold text-xs sm:text-sm border border-[#60a5fa]/35 hover:border-[#93c5fd]/55 cursor-pointer min-h-[46px] inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] dark:focus-visible:ring-offset-[#08090d]"
              >
                <span>{t.hero.exploreApps}</span>
                <ArrowRight
                  size={15}
                  className={
                    dir === 'rtl'
                      ? 'rotate-180 shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5'
                      : 'shrink-0 transition-transform duration-150 group-hover:translate-x-0.5'
                  }
                />
              </button>

              <button
                type="button"
                onClick={() => (onOpenContact ? onOpenContact() : onOpenResume())}
                className="cta-secondary group px-4 sm:px-5 py-3 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-[#0284ff]/[0.06] dark:hover:bg-[#0284ff]/[0.12] text-slate-900 dark:text-slate-100 hover:text-[#0369a1] dark:hover:text-[#38bdf8] border border-slate-200/90 dark:border-white/12 hover:border-[#0284ff]/45 font-bold text-xs sm:text-sm cursor-pointer min-h-[46px] inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] dark:focus-visible:ring-offset-[#08090d]"
              >
                <Briefcase
                  size={15}
                  className="text-[#0369a1] dark:text-[#38bdf8] shrink-0 transition-transform duration-150 group-hover:scale-105"
                />
                <span>{t.hero.hireMe}</span>
              </button>
            </div>

            {/* Tier 2: Quiet Supporting Utilities (Start a Project + Resume / CV) */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  onOpenBooking ? onOpenBooking() : onOpenContact ? onOpenContact() : undefined
                }
                className="cta-secondary group px-4 py-2.5 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-[#0284ff]/[0.06] dark:hover:bg-[#0284ff]/[0.12] text-slate-800 dark:text-slate-100 hover:text-[#0369a1] dark:hover:text-[#38bdf8] border border-slate-200/90 dark:border-white/12 hover:border-[#0284ff]/45 font-semibold text-xs sm:text-[13px] cursor-pointer min-h-[44px] sm:min-h-[42px] inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] dark:focus-visible:ring-offset-[#08090d]"
              >
                <Rocket
                  size={14}
                  className="text-[#0369a1] dark:text-[#38bdf8] shrink-0 transition-transform duration-150 group-hover:scale-105"
                />
                <span>{t.hero.startProject}</span>
              </button>

              <button
                type="button"
                onClick={onOpenResume}
                title={t.hero.downloadCv}
                aria-label={t.hero.downloadCv}
                className="cta-secondary group px-4 py-2.5 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-emerald-500/[0.07] dark:hover:bg-emerald-500/[0.12] text-slate-800 dark:text-slate-100 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/90 dark:border-white/12 hover:border-emerald-500/45 font-semibold text-xs sm:text-[13px] cursor-pointer min-h-[44px] sm:min-h-[42px] inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] dark:focus-visible:ring-offset-[#08090d]"
              >
                <Download
                  size={14}
                  className="text-emerald-700 dark:text-emerald-400 shrink-0 transition-transform duration-150 group-hover:scale-105"
                />
                <span>{lang === 'ar' ? 'السيرة (CV)' : t.hero.resumeCv}</span>
              </button>
            </div>
          </motion.div>

          {/* Uniform Direct Contact & Social Channels Bar */}
          <motion.div
            variants={itemVariants}
            className="w-full pt-3.5 mt-1 border-t border-slate-200/75 dark:border-white/10 space-y-2.5"
          >
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.hero.channelsLabel}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs w-full">
              <a
                href={AHMED_CONFIG.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-secondary inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[38px] px-3.5 rounded-xl bg-emerald-500/[0.08] hover:bg-emerald-600 text-emerald-800 dark:text-emerald-300 hover:text-white border border-emerald-600/30 hover:border-emerald-600 font-semibold whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] dark:focus-visible:ring-offset-[#08090d]"
              >
                <WhatsAppLogo size={14} />
                <span>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
              </a>

              <a
                href={emailHref}
                className="cta-secondary inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[38px] px-3 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-[#0284ff]/[0.07] dark:hover:bg-[#0284ff]/[0.13] text-slate-700 dark:text-slate-200 hover:text-[#0369a1] dark:hover:text-[#38bdf8] border border-slate-200/90 dark:border-white/12 hover:border-[#0284ff]/40 font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] dark:focus-visible:ring-offset-[#08090d]"
              >
                <Mail size={14} className="text-[#0369a1] dark:text-[#38bdf8] shrink-0" />
                <span>{lang === 'ar' ? 'البريد' : 'Email'}</span>
              </a>

              <a
                href={`tel:${profile.phone}`}
                className="cta-secondary inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[38px] px-3 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-[#0284ff]/[0.07] dark:hover:bg-[#0284ff]/[0.13] text-slate-700 dark:text-slate-200 hover:text-[#0369a1] dark:hover:text-[#38bdf8] border border-slate-200/90 dark:border-white/12 hover:border-[#0284ff]/40 font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] dark:focus-visible:ring-offset-[#08090d]"
                aria-label={lang === 'ar' ? 'اتصال هاتفي' : 'Call Phone'}
              >
                <Phone size={14} className="text-slate-500 dark:text-slate-400 shrink-0" />
                <span dir="ltr" className="tabular-nums">
                  {lang === 'ar' ? 'اتصال' : 'Call'}
                </span>
              </a>

              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-secondary inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[38px] px-3 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white border border-slate-200/90 dark:border-white/12 hover:border-slate-400 dark:hover:border-white/25 font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] dark:focus-visible:ring-offset-[#08090d]"
              >
                <Github size={14} className="shrink-0" />
                <span>GitHub</span>
              </a>

              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-secondary inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[38px] px-3 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-[#0a66c2]/[0.08] dark:hover:bg-[#38bdf8]/[0.12] text-slate-700 dark:text-slate-200 hover:text-[#0a66c2] dark:hover:text-[#38bdf8] border border-slate-200/90 dark:border-white/12 hover:border-[#0a66c2]/40 dark:hover:border-[#38bdf8]/40 font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] dark:focus-visible:ring-offset-[#08090d]"
              >
                <Linkedin size={14} className="text-[#0a66c2] dark:text-[#38bdf8] shrink-0" />
                <span>LinkedIn</span>
              </a>

              <a
                href={profile.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-secondary inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[38px] px-3 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-red-500/[0.08] text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 border border-slate-200/90 dark:border-white/12 hover:border-red-500/40 font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] dark:focus-visible:ring-offset-[#08090d]"
              >
                <Youtube size={14} className="text-red-600 dark:text-red-400 shrink-0" />
                <span>YouTube</span>
              </a>

              <a
                href={profile.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-secondary inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[38px] px-3 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-pink-500/[0.08] text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 border border-slate-200/90 dark:border-white/12 hover:border-pink-500/40 font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] dark:focus-visible:ring-offset-[#08090d]"
              >
                <TikTokLogo size={13} />
                <span>TikTok</span>
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Interactive Revio Device Mockup */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={entryReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.24, delay: 0.06, ease: EASE_EDITORIAL }}
          className="lg:col-span-6 flex"
        >
          <RevioShowcaseStage
            isDark={isDark}
            onInspectRevio={onInspectRevio}
            onInspectProject={onInspectProject}
          />
        </motion.div>
      </div>

      {/* Full-Width 4-KPI Architectural Strip Below Hero Split */}
      <div className="max-w-[1440px] mx-auto w-full mt-6 sm:mt-12 pt-5 sm:pt-8 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5 relative z-10">
        {kpis.map((kpi, idx) => {
          const KpiIcon = kpi.icon;
          const cardBody = (
            <div className="surface-card card-shimmer overflow-hidden w-full h-full p-3.5 sm:p-5 rounded-2xl shadow-sm hover:shadow-lg flex flex-col justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${kpi.iconBg}`}
                >
                  <KpiIcon size={17} />
                </div>
                <span className="font-display text-[11px] font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
                  {kpi.badge}
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                  <span
                    className={`font-display text-2xl sm:text-[34px] font-extrabold tabular-nums tracking-tight leading-none ${kpi.accentClass}`}
                  >
                    <CountUpMetric
                      value={kpi.value}
                      trigger={entryReady}
                      reducedMotion={Boolean(prefersReducedMotion)}
                    />
                  </span>
                  <span className="font-display text-xs sm:text-[15px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    {kpi.suffix}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-[#94a3b8] mt-1.5 sm:mt-2 leading-snug">
                  {kpi.label}
                </p>
              </div>
            </div>
          );

          return (
            <motion.div
              key={kpi.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={entryReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{
                duration: 0.24,
                delay: prefersReducedMotion ? 0 : 0.1 + idx * 0.04,
                ease: EASE_EDITORIAL,
              }}
              className="flex"
            >
              {kpi.href ? (
                <a
                  href={kpi.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] rounded-2xl"
                >
                  {cardBody}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={kpi.onClick}
                  className="flex w-full text-start cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] rounded-2xl"
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
