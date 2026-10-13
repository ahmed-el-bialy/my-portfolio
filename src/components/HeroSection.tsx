import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  FileText,
  Github,
  Linkedin,
  Mail,
  ArrowRight,
  MapPin,
  Video,
  Youtube,
  Smartphone,
  FolderGit2,
  Layers,
  Award,
  Briefcase,
  ExternalLink,
  Star
} from 'lucide-react';
import { DeveloperProfile, WORK_STATUS_INFO } from '../data/portfolioData';
import { WhatsAppLogo, TikTokLogo } from './TechLogos';
import { useLanguage } from '../context/LanguageContext';

interface HeroSectionProps {
  profile: DeveloperProfile;
  onOpenContact: () => void;
  onOpenResume: () => void;
  onExploreProjects: () => void;
  onOpenBooking?: () => void;
  totalReposCount?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  onOpenContact,
  onOpenResume,
  onExploreProjects,
  onOpenBooking,
  totalReposCount,
}) => {
  const { lang, dir, t } = useLanguage();
  const [rotatingWordIndex, setRotatingWordIndex] = useState(0);

  // 3D Tilt focused specifically on the Profile Image Card
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCardHovered, setIsCardHovered] = useState(false);

  // Card-specific motion values
  const cardMouseX = useMotionValue(0);
  const cardMouseY = useMotionValue(0);

  // Smooth responsive spring physics
  const springConfig = { damping: 18, stiffness: 260, mass: 0.5 };
  const smoothCardX = useSpring(cardMouseX, springConfig);
  const smoothCardY = useSpring(cardMouseY, springConfig);

  // 3D rotation angles mapped strictly to card hover
  const rotateX = useTransform(smoothCardY, [-0.5, 0.5], [14, -14]);
  const rotateY = useTransform(smoothCardX, [-0.5, 0.5], [-14, 14]);

  // Dynamic light sheen coordinates
  const sheenX = useTransform(smoothCardX, [-0.5, 0.5], ['0%', '100%']);
  const sheenY = useTransform(smoothCardY, [-0.5, 0.5], ['0%', '100%']);

  const rotatingWords = t.hero.rotatingWords;

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardMouseX.set(x);
    cardMouseY.set(y);
    if (!isCardHovered) setIsCardHovered(true);
  };

  const handleCardMouseLeave = () => {
    cardMouseX.set(0);
    cardMouseY.set(0);
    setIsCardHovered(false);
  };

  const displayName = lang === 'ar' ? 'أحمد البيلي' : profile.name;
  const nameParts = displayName.split(' ');
  const firstName = nameParts[0] || 'Ahmed';
  const lastName = nameParts.slice(1).join(' ') || 'El-Bialy';

  return (
    <section
      id="hero"
      className="relative min-h-[85vh] flex flex-col justify-center px-4 sm:px-8 lg:px-14 pt-20 pb-12 sm:pb-16 overflow-hidden select-none"
    >
      {/* Subtle Ambient Background Atmosphere */}
      <div className="ambient-glow-top absolute inset-0 pointer-events-none" />
      <div className="ambient-glow-cyan absolute inset-0 pointer-events-none" />

      {/* Main Grid: Clean Solid Text Left + Interactive 3D Tilt Card Right */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center z-10">
        
        {/* Left Column: Focused Typography & Streamlined CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start gap-3 sm:gap-4.5">
          
          {/* Status Badge with 'What I'm Looking For' indicator */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-xs text-slate-800 dark:text-gray-300 font-semibold shadow-xs flex-wrap">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold tracking-wide text-slate-900 dark:text-gray-200">
              {lang === 'ar' ? 'متاح للتوظيف: جونيور فلاتر (دوام كامل / عن بُعد)' : 'Open to Roles: Junior Flutter Developer (Remote / Hybrid)'}
            </span>
            <span className="text-slate-400 dark:text-gray-500 hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-700 dark:text-gray-300">
              <MapPin size={12} className="text-cyan-600 dark:text-cyan-400" /> {t.hero.location}
            </span>
          </div>

          {/* Script Accent */}
          <div className="font-marker text-lg sm:text-2xl text-cyan-600 dark:text-cyan-400/90 -rotate-2 tracking-wider select-none">
            {t.hero.thisIs}
          </div>

          {/* Big Name Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1] title-contrast">
            <span className="text-slate-900 dark:text-white title-contrast">
              {firstName}{' '}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-300">
              {lastName}
            </span>
          </h1>

          {/* Specialization Rotating Title */}
          <div className="flex flex-wrap items-center gap-2 text-base sm:text-xl font-bold text-slate-800 dark:text-gray-200 min-h-[28px]">
            <span className="text-slate-500 dark:text-gray-400 font-normal">{t.hero.specializedIn}</span>
            <span className="text-blue-700 dark:text-cyan-300 font-extrabold tracking-tight">
              {rotatingWords[rotatingWordIndex % rotatingWords.length]}
            </span>
          </div>

          {/* Short, high-impact Bio paragraph */}
          <p className="text-sm sm:text-base text-slate-700 dark:text-gray-300 max-w-2xl leading-relaxed body-contrast font-medium">
            {lang === 'ar'
              ? 'مطور تطبيقات جوال متخصص في Flutter & Clean Architecture ومكتبات Cubit و Hive CE. صاحب تطبيق "Revio" المنشور رسمياً على Google Play.'
              : 'Mobile Application Developer crafting high-performance Android & iOS apps with strict Clean Architecture, BLoC/Cubit, and offline-first storage. Creator of "Revio", published live on Google Play.'}
          </p>

          {/* Streamlined Action CTAs: 2 Main Prominent Buttons (Explore Apps + Book Meeting) + Resume link */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-1.5 w-full sm:w-auto">
            {/* Primary: Explore Apps */}
            <button
              onClick={onExploreProjects}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02] cursor-pointer min-h-[48px]"
            >
              <span>{t.hero.exploreApps}</span>
              <ArrowRight size={17} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>

            {/* Secondary: Book a Meeting */}
            {onOpenBooking && (
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white dark:bg-[#151828] hover:bg-slate-100 dark:hover:bg-[#1d2238] text-blue-700 dark:text-cyan-300 font-bold text-sm sm:text-base border border-blue-500/30 shadow-md transition-all cursor-pointer min-h-[48px]"
              >
                <Video size={17} className="text-blue-600 dark:text-cyan-400 shrink-0" />
                <span>{t.hero.bookMeeting}</span>
              </button>
            )}

            {/* Secondary Option: View Resume */}
            <button
              onClick={onOpenResume}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 font-semibold text-xs sm:text-sm border border-slate-300 dark:border-white/10 transition-all cursor-pointer"
            >
              <FileText size={15} className="text-emerald-500 shrink-0" />
              <span>{t.hero.resumeCv}</span>
            </button>
          </div>

          {/* Social Channels Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-xs sm:text-sm text-slate-700 dark:text-gray-300">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 dark:text-gray-400 font-bold me-1">
              {t.hero.channelsLabel}
            </span>
            
            <a
              href="https://wa.me/201022121573"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-400 font-bold text-xs border border-emerald-500/30 transition-all hover:scale-105"
              title="Chat directly on WhatsApp"
            >
              <WhatsAppLogo size={13} />
              <span>WhatsApp</span>
            </a>

            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100/70 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-white transition-colors font-medium border border-slate-200/80 dark:border-white/5 text-xs"
            >
              <Github size={13} />
              <span>GitHub</span>
            </a>

            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100/70 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium border border-slate-200/80 dark:border-white/5 text-xs"
            >
              <Linkedin size={13} />
              <span>LinkedIn</span>
            </a>

            <a
              href={profile.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100/70 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium border border-slate-200/80 dark:border-white/5 text-xs"
            >
              <Youtube size={13} />
              <span>YouTube</span>
            </a>

            <a
              href={profile.tiktokUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100/70 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium border border-slate-200/80 dark:border-white/5 text-xs"
            >
              <TikTokLogo size={12} />
              <span>TikTok</span>
            </a>
          </div>

        </div>

        {/* Right Column: 3D Interactive Tilt Card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end [perspective:1200px] mt-4 lg:mt-0">
          <motion.div
            ref={cardRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            animate={
              isCardHovered
                ? { y: -10, scale: 1.02 }
                : { y: [-5, 5, -5], scale: 1 }
            }
            transition={
              isCardHovered
                ? { type: 'spring', stiffness: 260, damping: 18 }
                : { y: { repeat: Infinity, duration: 4, ease: 'easeInOut' } }
            }
            className="relative group w-[260px] sm:w-[310px] aspect-[3/4] will-change-transform cursor-pointer select-none"
          >
            {/* Glowing 3D Aura behind the card */}
            <div
              className={`absolute -inset-3 bg-gradient-to-tr from-blue-600/35 via-cyan-500/30 to-indigo-600/35 rounded-3xl blur-2xl transition-all duration-300 pointer-events-none ${
                isCardHovered ? 'opacity-100 scale-105 blur-3xl' : 'opacity-60'
              }`}
            />

            {/* Container Card with High-End Backdrop */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-white/20 bg-white dark:bg-[#090b14] shadow-2xl transition-shadow duration-300">
              
              {/* Ahmed's Headshot Photo */}
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                loading="eager"
                className="w-full h-full object-cover object-center filter saturate-105 transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://avatars.githubusercontent.com/u/245139141?v=4';
                }}
              />

              {/* Dynamic 3D Glare */}
              <motion.div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.6) 0%, transparent 60%)`,
                }}
              />

              {/* Gradient Bottom Scrim */}
              <div className="absolute inset-0 dark:bg-gradient-to-t dark:from-slate-950/85 dark:via-transparent dark:to-transparent bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

              {/* Top Side Badge */}
              <div className="absolute top-3 end-3 px-2.5 py-1 rounded-md bg-white/95 dark:bg-black/80 backdrop-blur-md border border-slate-300 dark:border-white/25 text-[10px] font-mono text-blue-700 dark:text-cyan-300 font-bold shadow-md pointer-events-none">
                FLUTTER SPECIALIST
              </div>

              {/* Bottom Card Info Overlay */}
              <div className="hero-photo-name-card absolute bottom-4 inset-x-4 p-3.5 rounded-xl bg-white/95 dark:bg-[#0d101d]/95 backdrop-blur-md border border-slate-300 dark:border-white/15 shadow-xl transition-colors">
                <div className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">{displayName}</div>
                <div className="text-xs text-blue-600 dark:text-cyan-400 font-semibold mt-0.5">{t.nav.brandRole}</div>
              </div>

            </div>
          </motion.div>
        </div>

      </div>

      {/* Stats Bar at Bottom: 1 Live App on Google Play is visually Weighted and Featured */}
      <div className="max-w-7xl mx-auto w-full mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
        {profile.stats.map((stat, idx) => {
          const isPlayStore = stat.label.includes('Play');
          const isRepoStat = stat.label.toLowerCase().includes('repo');
          const displayValue = isRepoStat && totalReposCount ? `${totalReposCount}` : stat.value;

          let localizedLabel = stat.label;
          let localizedSuffix = stat.suffix;
          let IconComponent = Smartphone;
          let accentColor = 'text-blue-600 dark:text-cyan-400';
          let bgColor = 'bg-blue-500/10 dark:bg-cyan-500/10 border-blue-500/20';

          if (isPlayStore) {
            localizedLabel = t.hero.stats.playStore.label;
            localizedSuffix = t.hero.stats.playStore.suffix;
            IconComponent = Smartphone;
            accentColor = 'text-emerald-600 dark:text-emerald-400';
            bgColor = 'bg-emerald-500/15 border-emerald-500/30';
          } else if (stat.label.includes('Repo')) {
            localizedLabel = t.hero.stats.repos.label;
            localizedSuffix = t.hero.stats.repos.suffix;
            IconComponent = FolderGit2;
            accentColor = 'text-blue-600 dark:text-blue-400';
            bgColor = 'bg-blue-500/10 border-blue-500/20';
          } else if (stat.label.includes('Architecture')) {
            localizedLabel = t.hero.stats.cleanArch.label;
            localizedSuffix = t.hero.stats.cleanArch.suffix;
            IconComponent = Layers;
            accentColor = 'text-cyan-600 dark:text-cyan-300';
            bgColor = 'bg-cyan-500/10 border-cyan-500/20';
          } else if (stat.label.includes('Platform')) {
            localizedLabel = t.hero.stats.crossPlatform.label;
            localizedSuffix = t.hero.stats.crossPlatform.suffix;
            IconComponent = Award;
            accentColor = 'text-indigo-600 dark:text-indigo-400';
            bgColor = 'bg-indigo-500/10 border-indigo-500/20';
          }

          return (
            <div
              key={idx}
              className={`p-3.5 sm:p-4.5 rounded-2xl backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between group ${
                isPlayStore
                  ? 'bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-white/90 dark:to-[#111322]/90 border-2 border-emerald-500/50 shadow-emerald-500/10 shadow-lg'
                  : 'bg-white/80 dark:bg-[#111322]/80 border border-slate-200/90 dark:border-white/10 hover:border-blue-400/50 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${bgColor} ${accentColor} group-hover:scale-110 transition-transform`}>
                  <IconComponent size={17} />
                </div>
                {isPlayStore ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                    ★ FEATURED
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-gray-500 uppercase">
                    METRIC 0{idx + 1}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight title-contrast ${
                    isPlayStore ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                  }`}>
                    {displayValue}
                  </span>
                  {localizedSuffix && (
                    <span className={`text-xs sm:text-sm font-bold ${
                      isPlayStore ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-cyan-400'
                    }`}>
                      {localizedSuffix}
                    </span>
                  )}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-700 dark:text-gray-300 font-semibold mt-1 leading-snug body-contrast">
                  {localizedLabel}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
