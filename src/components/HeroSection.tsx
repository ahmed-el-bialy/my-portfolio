import React, { useState, useEffect } from 'react';
import {
  Github,
  Linkedin,
  Mail,
  ArrowRight,
  Video,
  Youtube,
  Download,
} from 'lucide-react';
import { DeveloperProfile } from '../data/portfolioData';
import { AHMED_CONFIG } from '../data/config';
import { WhatsAppLogo, TikTokLogo } from './TechLogos';
import { useLanguage } from '../context/LanguageContext';
import { MagneticButton } from './MagneticButton';
import { RevioShowcaseStage } from './RevioShowcaseStage';

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
  const [rotatingWordIndex, setRotatingWordIndex] = useState(0);

  const rotatingWords = t.hero.rotatingWords;

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  const displayName = AHMED_CONFIG.name[lang];

  const kpis = [
    {
      value: '1',
      suffix: lang === 'ar' ? 'تطبيق منشور' : 'Play Store App',
      label:
        lang === 'ar'
          ? 'تطبيق Revio منشور رسمياً على متجر Google Play'
          : 'Revio live on Google Play (com.ahmed.revio)',
      highlight: true,
    },
    {
      value: `${totalReposCount || 13}+`,
      suffix: lang === 'ar' ? 'مستودع' : 'Repositories',
      label:
        lang === 'ar'
          ? 'مشاريع وتطبيقات موبايل مفتوحة المصدر على GitHub'
          : 'Public Flutter & engineering codebases on GitHub',
      highlight: false,
    },
    {
      value: '100%',
      suffix: 'Clean',
      label:
        lang === 'ar'
          ? 'تطبيق كامل لمعمارية Clean Architecture و BLoC / Cubit'
          : 'Clean Architecture, SOLID & BLoC / Cubit layers',
      highlight: false,
    },
    {
      value: '60 FPS',
      suffix: 'Android · iOS',
      label:
        lang === 'ar'
          ? 'تجربة سلسة ودعم العربية RTL والتخزين المحلي Hive CE'
          : 'Cross-platform craft, RTL localization & Hive CE offline sync',
      highlight: false,
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

  return (
    <section
      id="overview"
      className="relative px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16 overflow-x-clip w-full"
    >
      <div className="ambient-glow-top absolute inset-0 pointer-events-none" />

      {/* Editorial Split Hero (Equal-stretch alignment) */}
      <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch relative z-10">
        {/* Left Column: Crisp Typography, Value Proposition & Clear CTAs */}
        <div className="lg:col-span-6 flex flex-col justify-center items-start gap-4 sm:gap-5">
          {/* Clean Unboxed Kicker Strip (Zero pulsing dots or pill capsules) */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-slate-600 dark:text-[#94a3b8]">
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
          </div>

          {/* Balanced Display Title */}
          <div className="space-y-2.5">
            <p className="text-sm sm:text-base font-semibold text-[#027DFD] dark:text-[#00C7FF] tracking-tight">
              {displayName} — {AHMED_CONFIG.title[lang]}
            </p>
            <h1 className="text-[clamp(2rem,3.6vw,3.45rem)] font-extrabold tracking-tight leading-[1.09] text-slate-900 dark:text-[#f1f5f9] [text-wrap:balance]">
              {lang === 'ar'
                ? 'هندسة تطبيقات Flutter بمعايير Clean Architecture.'
                : 'Production Flutter apps engineered with Clean Architecture.'}
            </h1>
          </div>

          {/* Focus Specialty Line */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-[#94a3b8]">
            <span>{t.hero.specializedIn}:</span>
            <span className="font-bold text-slate-900 dark:text-[#f1f5f9]">
              {rotatingWords[rotatingWordIndex % rotatingWords.length]}
            </span>
          </div>

          {/* Concise Verified Bio */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#94a3b8] max-w-xl leading-relaxed">
            {lang === 'ar'
              ? 'أُطوّر تطبيقات Android و iOS بأداء 60 FPS باستخدام Flutter، وإدارة الحالة BLoC / Cubit، والتخزين المحلي بدون إنترنت Hive CE. مطوّر تطبيق Revio المنشور رسمياً على Google Play وطالب بكلية الذكاء الاصطناعي — جامعة كفر الشيخ.'
              : 'Building responsive Android & iOS applications with Flutter, BLoC / Cubit state streams, REST APIs, and offline-first Hive CE storage. Creator of Revio on Google Play and B.Sc. Artificial Intelligence student at Kafrelsheikh University.'}
          </p>

          {/* Primary Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 w-full sm:w-auto">
            <MagneticButton
              onClick={onExploreProjects}
              strength={0.22}
              className="px-6 py-3 rounded-xl bg-[#027DFD] hover:bg-[#026ae0] text-white font-bold text-sm transition-colors shadow-md shadow-[#027DFD]/25 cursor-pointer min-h-[46px] flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
            >
              <span>{t.hero.exploreApps}</span>
              <ArrowRight size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </MagneticButton>

            {onOpenBooking && (
              <MagneticButton
                onClick={onOpenBooking}
                strength={0.2}
                className="px-5 py-3 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-slate-100 dark:hover:bg-[#161b27] text-slate-900 dark:text-[#f1f5f9] font-semibold text-sm border border-slate-300 dark:border-white/15 transition-colors cursor-pointer min-h-[46px] flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
              >
                <Video size={16} className="text-[#027DFD] dark:text-[#00C7FF] shrink-0" />
                <span>{t.hero.bookConsultation}</span>
              </MagneticButton>
            )}

            <button
              type="button"
              onClick={onOpenResume}
              className="px-4 py-3 rounded-xl bg-white dark:bg-[#0f1117] hover:bg-slate-100 dark:hover:bg-[#161b27] text-slate-800 dark:text-[#f1f5f9] font-semibold text-sm border border-slate-200 dark:border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-2 min-h-[46px] whitespace-nowrap"
            >
              <Download size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t.hero.downloadCv}</span>
            </button>
          </div>

          {/* Inline Channels Strip */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-slate-600 dark:text-[#94a3b8]">
            <a
              href={AHMED_CONFIG.socials.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              <WhatsAppLogo size={13} />
              <span>WhatsApp</span>
            </a>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium hover:text-[#027DFD] dark:hover:text-[#00C7FF] transition-colors"
            >
              <Github size={13} />
              <span>GitHub</span>
            </a>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium hover:text-[#027DFD] dark:hover:text-[#00C7FF] transition-colors"
            >
              <Linkedin size={13} />
              <span>LinkedIn</span>
            </a>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <a
              href={profile.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium hover:text-red-500 transition-colors"
            >
              <Youtube size={13} />
              <span>YouTube</span>
            </a>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <a
              href={profile.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium hover:text-pink-500 transition-colors"
            >
              <TikTokLogo size={12} />
              <span>TikTok</span>
            </a>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-1.5 font-medium hover:text-[#027DFD] dark:hover:text-[#00C7FF] transition-colors"
            >
              <Mail size={13} />
              <span>Email</span>
            </a>
          </div>
        </div>

        {/* Right Column: Interactive Revio Device Mockup + Shiki Dart Code Stage */}
        <div className="lg:col-span-6 flex">
          <RevioShowcaseStage isDark={isDark} onInspectRevio={onInspectRevio} />
        </div>
      </div>

      {/* Full-Width 4-KPI Tabular Strip Below Hero Split */}
      <div className="max-w-[1440px] mx-auto w-full mt-10 sm:mt-14 pt-8 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
              kpi.highlight
                ? 'bg-emerald-500/[0.06] dark:bg-emerald-500/[0.08] border-emerald-500/30'
                : 'bg-white dark:bg-[#0f1117] border-slate-200 dark:border-white/10'
            }`}
          >
            <div className="flex items-baseline gap-2 flex-wrap">
              <span
                className={`text-xl sm:text-2xl font-extrabold font-mono tabular-nums tracking-tight ${
                  kpi.highlight
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-900 dark:text-[#f1f5f9]'
                }`}
              >
                {kpi.value}
              </span>
              <span
                className={`text-xs font-semibold ${
                  kpi.highlight
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-[#027DFD] dark:text-[#00C7FF]'
                }`}
              >
                {kpi.suffix}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#94a3b8] mt-1.5 leading-snug">
              {kpi.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
