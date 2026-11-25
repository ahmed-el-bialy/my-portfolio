import React, { useState, useEffect, useRef, Component } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Github,
  Linkedin,
  Mail,
  Phone,
  ArrowRight,
  Briefcase,
  Video,
  Youtube,
  Download,
  Star,
  FolderGit2,
  Smartphone,
  RotateCcw,
} from 'lucide-react';
import { DeveloperProfile, FEATURED_PROJECTS, Project } from '../data/portfolioData';
import { AHMED_CONFIG } from '../data/config';
import { WhatsAppLogo, TikTokLogo } from './TechLogos';
import { BrandLogoMark } from './BrandLogoMark';
import { useLanguage } from '../context/LanguageContext';
import { MagneticButton } from './MagneticButton';
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
  isStoreFallback?: boolean;
  onRetryStoreSync?: () => void;
}

interface HeroShowcaseBoundaryProps {
  children: React.ReactNode;
  lang: 'en' | 'ar';
  onExploreProjects: () => void;
  onRetry?: () => void;
}

interface HeroShowcaseBoundaryState {
  hasError: boolean;
}

class HeroShowcaseErrorBoundary extends Component<
  HeroShowcaseBoundaryProps,
  HeroShowcaseBoundaryState
> {
  state: HeroShowcaseBoundaryState = { hasError: false };

  static getDerivedStateFromError(): HeroShowcaseBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      const isAr = this.props.lang === 'ar';
      return (
        <div className="w-full h-full min-h-[360px] rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] p-6 shadow-lg flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0284ff]/10 border border-[#0284ff]/25 flex items-center justify-center text-[#0369a1] dark:text-[#38bdf8]">
            <Smartphone size={22} />
          </div>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {isAr ? 'معاينة تطبيقات Flutter (وضع احتياطي)' : 'Flutter Apps Showcase (Fallback)'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
            {isAr
              ? 'تعذر تحميل بيانات المتجر المباشرة حالياً. يمكنك إعادة المحاولة أو استعراض جميع التطبيقات.'
              : 'Live store showcase data could not be loaded right now. You can retry or browse all apps.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onRetry?.();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284ff] hover:bg-[#0070e0] text-white text-xs font-bold cursor-pointer transition-colors whitespace-nowrap"
            >
              <RotateCcw size={13} />
              <span>{isAr ? 'إعادة المحاولة' : 'Retry'}</span>
            </button>
            <button
              type="button"
              onClick={this.props.onExploreProjects}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/12 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer hover:border-[#0284ff]/45 transition-colors whitespace-nowrap"
            >
              <span>{isAr ? 'عرض التطبيقات' : 'View Projects'}</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const EASE_EDITORIAL: [number, number, number, number] = [0.16, 1, 0.3, 1];

const CountUpMetric: React.FC<{
  value: string;
  trigger: boolean;
  reducedMotion: boolean;
}> = ({ value, trigger, reducedMotion }) => {
  const safeValue = typeof value === 'string' ? value : String(value ?? '');
  const match = safeValue.match(/^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/);
  const [display, setDisplay] = useState(safeValue);

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
    const duration = 780;
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
  isStoreFallback = false,
  onRetryStoreSync,
}) => {
  const { lang, dir, t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [rotatingWordIndex, setRotatingWordIndex] = useState(0);
  const heroFieldRef = useRef<HTMLElement>(null);
  const { data: playStats, isError: isPlayStatsError } = usePlayStoreAppStats('com.ahmed.revio');

  const rotatingWords =
    Array.isArray(t?.hero?.rotatingWords) && t.hero.rotatingWords.length > 0
      ? t.hero.rotatingWords
      : ['Flutter Architecture'];

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  const displayName = AHMED_CONFIG.name[lang];

  const kpis = (() => {
    try {
      const safePlayStats = playStats && typeof playStats === 'object' ? playStats : undefined;
      const playRatingDisplay =
        typeof safePlayStats?.rating === 'string' && safePlayStats.rating.trim()
          ? `★ ${safePlayStats.rating}`
          : lang === 'ar'
          ? 'منشور'
          : 'Live';
      const playDownloadsDisplay =
        typeof safePlayStats?.downloads === 'string' && safePlayStats.downloads.trim()
          ? safePlayStats.downloads
          : '10+';
      const safeRepoTotal =
        typeof totalReposCount === 'number' && Number.isFinite(totalReposCount) && totalReposCount > 0
          ? totalReposCount
          : 13;
      const reposDisplay = `${safeRepoTotal}+`;

      return [
        {
          id: 'play-rating',
          icon: Star,
          sourceLabel: 'Google Play',
          value: playRatingDisplay,
          suffix: lang === 'ar' ? 'تقييم Revio' : 'Revio Rating',
          label: safePlayStats?.reviewsCount
            ? lang === 'ar'
              ? `تطبيق Revio على المتجر (${safePlayStats.reviewsCount} مراجعة)`
              : `Revio verified on Google Play (${safePlayStats.reviewsCount} reviews)`
            : lang === 'ar'
            ? 'تطبيق Revio منشور رسمياً على Google Play'
            : 'Revio published & live on Google Play',
          accentClass: 'text-emerald-700 dark:text-emerald-400',
          iconClass: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          href: AHMED_CONFIG.socials.playstore,
        },
        {
          id: 'play-downloads',
          icon: Download,
          sourceLabel: lang === 'ar' ? 'إحصائيات مباشرة' : 'Store Sync',
          value: playDownloadsDisplay,
          suffix: lang === 'ar' ? 'تحميل' : 'Downloads',
          label: lang === 'ar'
            ? 'إجمالي تثبيتات Revio من متجر Google Play'
            : 'Revio installs synced from Google Play listing',
          accentClass: 'text-[#0369a1] dark:text-[#38bdf8]',
          iconClass: 'text-[#0369a1] dark:text-[#38bdf8] bg-[#0284ff]/10 border-[#0284ff]/20',
          href: AHMED_CONFIG.socials.playstore,
        },
        {
          id: 'github-repos',
          icon: FolderGit2,
          sourceLabel: 'GitHub',
          value: reposDisplay,
          suffix: lang === 'ar' ? 'مستودع' : 'Repositories',
          label: lang === 'ar'
            ? 'مشاريع وتطبيقات موبايل مفتوحة المصدر'
            : 'Public Flutter & architecture codebases',
          accentClass: 'text-slate-900 dark:text-white',
          iconClass: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] border-slate-200 dark:border-white/10',
          onClick: onExploreProjects,
        },
      ];
    } catch {
      return [
        {
          id: 'play-rating',
          icon: Star,
          sourceLabel: 'Google Play',
          value: lang === 'ar' ? 'منشور' : 'Live',
          suffix: lang === 'ar' ? 'تقييم Revio' : 'Revio Rating',
          label: lang === 'ar'
            ? 'تطبيق Revio منشور رسمياً على Google Play'
            : 'Revio published & live on Google Play',
          accentClass: 'text-emerald-700 dark:text-emerald-400',
          iconClass: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          href: AHMED_CONFIG.socials.playstore,
        },
        {
          id: 'play-downloads',
          icon: Download,
          sourceLabel: lang === 'ar' ? 'إحصائيات مباشرة' : 'Store Sync',
          value: '10+',
          suffix: lang === 'ar' ? 'تحميل' : 'Downloads',
          label: lang === 'ar'
            ? 'إجمالي تثبيتات Revio من متجر Google Play'
            : 'Revio installs synced from Google Play listing',
          accentClass: 'text-[#0369a1] dark:text-[#38bdf8]',
          iconClass: 'text-[#0369a1] dark:text-[#38bdf8] bg-[#0284ff]/10 border-[#0284ff]/20',
          href: AHMED_CONFIG.socials.playstore,
        },
        {
          id: 'github-repos',
          icon: FolderGit2,
          sourceLabel: 'GitHub',
          value: `${FEATURED_PROJECTS.length}+`,
          suffix: lang === 'ar' ? 'مستودع' : 'Repositories',
          label: lang === 'ar'
            ? 'مشاريع وتطبيقات موبايل مفتوحة المصدر'
            : 'Public Flutter & architecture codebases',
          accentClass: 'text-slate-900 dark:text-white',
          iconClass: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] border-slate-200 dark:border-white/10',
          onClick: onExploreProjects,
        },
      ];
    }
  })();

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
        staggerChildren: 0.075,
        delayChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.44, ease: EASE_EDITORIAL },
    },
  };

  const currentRotatingWord = rotatingWords[rotatingWordIndex % rotatingWords.length];
  const emailHref = `mailto:${profile.email}?subject=${encodeURIComponent(
    'Flutter Mobile Developer Opportunity'
  )}`;

  const channelLinks = [
    { label: lang === 'ar' ? 'البريد' : 'Email', href: emailHref, icon: Mail, external: false },
    {
      label: lang === 'ar' ? 'اتصال' : 'Call',
      href: `tel:${profile.phone}`,
      icon: Phone,
      external: false,
    },
    { label: 'GitHub', href: profile.githubUrl, icon: Github, external: true },
    { label: 'LinkedIn', href: profile.linkedinUrl, icon: Linkedin, external: true },
    { label: 'YouTube', href: profile.youtubeUrl, icon: Youtube, external: true },
  ];

  return (
    <section
      ref={heroFieldRef}
      id="overview"
      className="relative px-4 sm:px-6 lg:px-8 pt-[76px] pb-8 sm:pt-28 sm:pb-14 overflow-x-clip w-full"
    >
      {/* Editorial Split Hero (Equal-stretch alignment) */}
      <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-12 items-stretch relative z-10">
        {/* Left Column: Calm Editorial Typography, Medium Emblem & Focused Action Hierarchy */}
        <motion.div
          variants={containerVariants}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate={entryReady ? 'visible' : 'hidden'}
          className="lg:col-span-6 flex flex-col justify-center items-start gap-4 sm:gap-5"
        >
          {/* 1. Unboxed Editorial Availability & Discipline Strip */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-[13px] font-medium text-slate-600 dark:text-[#94a3b8]"
          >
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              {availabilityText}
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span>{AHMED_CONFIG.location[lang]}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span className="font-mono text-[#0369a1] dark:text-[#38bdf8] font-semibold">
              {lang === 'ar' ? 'Flutter والذكاء الاصطناعي' : 'Flutter & AI'}
            </span>
          </motion.div>

          {/* 2. Cohesive Signature Lockup with Proportional Medium Leaf Emblem */}
          <div className="space-y-2 sm:space-y-3 w-full">
            <motion.div variants={itemVariants}>
              <span
                className={`inline-block font-meet-accent font-bold leading-snug tracking-tight gradient-text ${
                  lang === 'ar'
                    ? 'text-base sm:text-xl'
                    : 'text-lg sm:text-xl'
                }`}
              >
                {t.hero.thisIs}
              </span>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center flex-wrap gap-3 sm:gap-4 min-w-0 py-0.5"
            >
              <h1 className="font-display text-[clamp(2.05rem,4.5vw,3.95rem)] font-extrabold tracking-tight leading-[1.04] text-slate-900 dark:text-[#f1f5f9] [text-wrap:balance] min-w-0">
                {displayName}
              </h1>
              <span className="inline-flex shrink-0 overflow-visible items-center">
                <BrandLogoMark
                  floatingInk={true}
                  fieldRef={heroFieldRef}
                  sizeClassName="w-10 h-10 sm:w-12 sm:h-12"
                  alt="Ahmed El-Bialy Brand Emblem"
                />
              </span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="font-display text-lg sm:text-2xl font-bold tracking-[-0.015em] text-[#0369a1] dark:text-[#38bdf8] [text-wrap:balance]"
            >
              {t.hero.headlineRole}
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-[15px] sm:text-[17px] font-medium text-slate-800 dark:text-slate-200 max-w-xl leading-relaxed"
            >
              {t.hero.tagline}{' '}
              <span className="text-slate-600 dark:text-[#94a3b8]">
                · {t.hero.subAvailability}
              </span>
            </motion.p>
          </div>

          {/* 3. Specialty Rotating Focus + Concise Engineering Bio */}
          <motion.div variants={itemVariants} className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-[15px] text-slate-700 dark:text-slate-200">
              <span className="font-semibold text-slate-900 dark:text-[#f1f5f9]">
                {t.hero.specializedIn}:
              </span>
              <span className="relative inline-flex items-center overflow-hidden min-h-[24px]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`${lang}-${currentRotatingWord}`}
                    initial={prefersReducedMotion ? false : { y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={prefersReducedMotion ? undefined : { y: -8, opacity: 0 }}
                    transition={{ duration: 0.2, ease: EASE_EDITORIAL }}
                    className="font-bold text-[#0369a1] dark:text-[#38bdf8]"
                  >
                    {currentRotatingWord}
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>

            <p className="text-sm sm:text-[15px] text-slate-600 dark:text-[#94a3b8] leading-relaxed">
              {t.hero.bio}
            </p>
          </motion.div>

          {/* 4. Unified Calm Action Bar (1 Primary Anchor + 3 Cohesive Secondary Controls) */}
          <motion.div variants={itemVariants} className="w-full pt-1.5">
            <div className="w-full grid grid-cols-2 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
              <MagneticButton
                onClick={onExploreProjects}
                strength={0.07}
                className="btn-kinetic group px-4 sm:px-5 py-2.5 rounded-xl bg-[#0284ff] hover:bg-[#0070e0] text-white font-semibold text-[13px] sm:text-sm border border-[#0284ff] cursor-pointer min-h-[46px] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] dark:focus-visible:ring-offset-[#08090d]"
              >
                <span className="truncate">{t.hero.exploreApps}</span>
                <ArrowRight
                  size={15}
                  className={
                    dir === 'rtl'
                      ? 'rotate-180 shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5'
                      : 'shrink-0 transition-transform duration-150 group-hover:translate-x-0.5'
                  }
                />
              </MagneticButton>

              <MagneticButton
                onClick={() => (onOpenContact ? onOpenContact() : onOpenResume())}
                strength={0.07}
                className="btn-kinetic group px-3.5 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-[#0284ff]/[0.06] dark:hover:bg-[#0284ff]/[0.1] text-slate-900 dark:text-[#f1f5f9] hover:text-[#0369a1] dark:hover:text-[#38bdf8] border border-slate-200 dark:border-white/12 hover:border-[#0284ff]/45 font-semibold text-[13px] sm:text-sm cursor-pointer min-h-[46px] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] dark:focus-visible:ring-offset-[#08090d]"
              >
                <Briefcase
                  size={15}
                  className="text-[#0369a1] dark:text-[#38bdf8] shrink-0 transition-transform duration-150 group-hover:scale-105"
                />
                <span className="truncate">{t.hero.hireMe}</span>
              </MagneticButton>

              <MagneticButton
                onClick={() =>
                  onOpenBooking ? onOpenBooking() : onOpenContact ? onOpenContact() : undefined
                }
                strength={0.07}
                className="btn-kinetic group px-3.5 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-[#0284ff]/[0.06] dark:hover:bg-[#0284ff]/[0.1] text-slate-900 dark:text-[#f1f5f9] hover:text-[#0369a1] dark:hover:text-[#38bdf8] border border-slate-200 dark:border-white/12 hover:border-[#0284ff]/45 font-semibold text-[13px] sm:text-sm cursor-pointer min-h-[46px] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] dark:focus-visible:ring-offset-[#08090d]"
              >
                <Video
                  size={15}
                  className="text-[#0369a1] dark:text-[#38bdf8] shrink-0 transition-transform duration-150 group-hover:scale-105"
                />
                <span className="truncate">{t.hero.startProject}</span>
              </MagneticButton>

              <MagneticButton
                onClick={onOpenResume}
                title={t.hero.downloadCv}
                aria-label={t.hero.downloadCv}
                strength={0.07}
                className="btn-kinetic group px-3.5 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-[#0284ff]/[0.06] dark:hover:bg-[#0284ff]/[0.1] text-slate-900 dark:text-[#f1f5f9] hover:text-[#0369a1] dark:hover:text-[#38bdf8] border border-slate-200 dark:border-white/12 hover:border-[#0284ff]/45 font-semibold text-[13px] sm:text-sm cursor-pointer min-h-[46px] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] dark:focus-visible:ring-offset-[#08090d]"
              >
                <Download
                  size={15}
                  className="text-[#0369a1] dark:text-[#38bdf8] shrink-0 transition-transform duration-150 group-hover:translate-y-0.5"
                />
                <span className="truncate">
                  {lang === 'ar' ? 'السيرة الذاتية' : t.hero.resumeCv}
                </span>
              </MagneticButton>
            </div>
          </motion.div>

          {/* 5. Unified Direct Contact & Social Channel Buttons */}
          <motion.div
            variants={itemVariants}
            className="w-full pt-4 mt-1 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center gap-2"
          >
            <a
              href={AHMED_CONFIG.socials.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-[#0284ff]/[0.06] dark:hover:bg-[#0284ff]/[0.1] text-slate-800 dark:text-slate-200 hover:text-[#0369a1] dark:hover:text-[#38bdf8] border border-slate-200 dark:border-white/12 hover:border-[#0284ff]/45 text-xs font-semibold whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff]"
            >
              <WhatsAppLogo
                size={13}
                className="shrink-0 text-emerald-600 dark:text-emerald-400 transition-transform duration-150 group-hover:scale-105"
              />
              <span>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
            </a>

            {channelLinks.map((ch) => {
              const Icon = ch.icon;
              return (
                <a
                  key={ch.label}
                  href={ch.href}
                  target={ch.external ? '_blank' : undefined}
                  rel={ch.external ? 'noopener noreferrer' : undefined}
                  className="group inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-[#0284ff]/[0.06] dark:hover:bg-[#0284ff]/[0.1] text-slate-800 dark:text-slate-200 hover:text-[#0369a1] dark:hover:text-[#38bdf8] border border-slate-200 dark:border-white/12 hover:border-[#0284ff]/45 text-xs font-semibold whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff]"
                >
                  <Icon
                    size={13}
                    className="shrink-0 text-[#0369a1] dark:text-[#38bdf8] transition-transform duration-150 group-hover:scale-105"
                  />
                  <span>{ch.label}</span>
                </a>
              );
            })}

            <a
              href={profile.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-[#0284ff]/[0.06] dark:hover:bg-[#0284ff]/[0.1] text-slate-800 dark:text-slate-200 hover:text-[#0369a1] dark:hover:text-[#38bdf8] border border-slate-200 dark:border-white/12 hover:border-[#0284ff]/45 text-xs font-semibold whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff]"
            >
              <TikTokLogo
                size={12}
                className="shrink-0 text-[#0369a1] dark:text-[#38bdf8] transition-transform duration-150 group-hover:scale-105"
              />
              <span>TikTok</span>
            </a>
          </motion.div>
        </motion.div>

        {/* Right Column: Interactive Revio & Multi-App Device Mockup */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.965 }}
          animate={
            entryReady
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 20, scale: 0.965 }
          }
          transition={{ duration: 0.48, delay: 0.14, ease: EASE_EDITORIAL }}
          className="lg:col-span-6 flex"
        >
          <HeroShowcaseErrorBoundary
            lang={lang}
            onExploreProjects={onExploreProjects}
            onRetry={onRetryStoreSync}
          >
            <RevioShowcaseStage
              isDark={isDark}
              onInspectRevio={onInspectRevio}
              onInspectProject={onInspectProject}
              isStoreFallback={Boolean(isStoreFallback || isPlayStatsError)}
              onRetryStoreSync={onRetryStoreSync}
            />
          </HeroShowcaseErrorBoundary>
        </motion.div>
      </div>

      {/* Full-Width 3-KPI Architectural Proof Row Below Hero Split */}
      <div className="max-w-[1440px] mx-auto w-full mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5 relative z-10">
        {kpis.map((kpi, idx) => {
          const KpiIcon = kpi.icon;
          const cardBody = (
            <div className="surface-card card-shimmer group overflow-hidden w-full h-full p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-[0.985] flex flex-col justify-between gap-3 transition-all duration-200">
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${kpi.iconClass}`}
                >
                  <KpiIcon size={16} />
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {kpi.sourceLabel}
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                  <span
                    className={`font-display text-2xl sm:text-[32px] font-extrabold tabular-nums tracking-tight leading-none ${kpi.accentClass}`}
                  >
                    <CountUpMetric
                      value={kpi.value}
                      trigger={entryReady}
                      reducedMotion={Boolean(prefersReducedMotion)}
                    />
                  </span>
                  <span className="font-display text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    {kpi.suffix}
                  </span>
                </div>
                <p className="text-[11.5px] sm:text-xs text-slate-600 dark:text-[#94a3b8] mt-1.5 leading-snug">
                  {kpi.label}
                </p>
              </div>
            </div>
          );

          return (
            <motion.div
              key={kpi.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              animate={entryReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{
                duration: 0.42,
                delay: prefersReducedMotion ? 0 : 0.22 + idx * 0.06,
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
