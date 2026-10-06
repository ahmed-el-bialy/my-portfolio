import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FileText, Github, Linkedin, Mail, Check, ArrowRight, Sparkles, MapPin, Video, Youtube } from 'lucide-react';
import { DeveloperProfile } from '../data/portfolioData';
import { WhatsAppLogo, TikTokLogo } from './TechLogos';

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
  const rotateX = useTransform(smoothCardY, [-0.5, 0.5], [16, -16]);
  const rotateY = useTransform(smoothCardX, [-0.5, 0.5], [-16, 16]);

  // Dynamic light sheen coordinates
  const sheenX = useTransform(smoothCardX, [-0.5, 0.5], ['0%', '100%']);
  const sheenY = useTransform(smoothCardY, [-0.5, 0.5], ['0%', '100%']);

  const rotatingWords = [
    "Flutter & Dart Architecture",
    "Clean Architecture Standards",
    "BLoC & Cubit State Management",
    "Production Google Play Apps",
    "REST APIs & Offline Storage (Hive CE)",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  // Card-specific 3D mouse handler (reacts when hovering over the image card)
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

  const nameParts = profile.name.split(' ');
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
        
        {/* Left Column: Stable Typography & Clean CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start gap-3.5 sm:gap-5">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-xs text-slate-800 dark:text-gray-300 font-semibold shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold tracking-wide text-slate-900 dark:text-gray-200">{profile.statusText}</span>
            <span className="text-slate-400 dark:text-gray-500">•</span>
            <span className="flex items-center gap-1 text-slate-700 dark:text-gray-300">
              <MapPin size={12} className="text-cyan-600 dark:text-cyan-400" /> {profile.location}
            </span>
          </div>

          {/* Script Accent */}
          <div className="font-marker text-xl sm:text-2xl text-cyan-600 dark:text-cyan-400/90 -rotate-2 tracking-wider select-none">
            This is
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
            <span className="text-slate-500 dark:text-gray-400 font-normal">Specialized in</span>
            <span className="text-blue-700 dark:text-cyan-300 font-extrabold tracking-tight">
              {rotatingWords[rotatingWordIndex]}
            </span>
          </div>

          {/* Bio paragraph */}
          <p className="text-sm sm:text-base text-slate-700 dark:text-gray-300 max-w-2xl leading-relaxed body-contrast font-medium">
            {profile.bio}
          </p>

          {/* Action CTAs: High Intent, Organized & No Clutter */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2 w-full sm:w-auto">
            {/* Explore Apps */}
            <button
              onClick={onExploreProjects}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/30 hover:scale-[1.02] cursor-pointer min-h-[44px]"
            >
              <span>Explore My Apps</span>
              <ArrowRight size={15} />
            </button>

            {/* View Resume */}
            <button
              onClick={onOpenResume}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold text-xs sm:text-sm border border-slate-300 dark:border-white/20 shadow-xs transition-all cursor-pointer min-h-[44px]"
            >
              <FileText size={15} className="text-emerald-500" />
              <span>Resume / CV</span>
            </button>

            {/* Book a Meeting (In-App Modal) */}
            {onOpenBooking && (
              <button
                onClick={onOpenBooking}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/15 to-cyan-500/15 hover:from-blue-600 hover:to-cyan-500 hover:text-white text-blue-700 dark:text-cyan-300 font-bold text-xs sm:text-sm border border-blue-500/30 transition-all cursor-pointer shadow-xs min-h-[44px]"
                title="Book a 1-on-1 meeting directly with Ahmed"
              >
                <Video size={15} className="text-blue-600 dark:text-cyan-400 group-hover:text-white" />
                <span>Book Meeting</span>
              </button>
            )}

            {/* Contact Me (In-App Modal) */}
            <button
              onClick={onOpenContact}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 text-xs sm:text-sm font-bold border border-slate-300 dark:border-white/15 shadow-xs transition-all cursor-pointer min-h-[44px]"
            >
              <Mail size={15} className="text-cyan-600 dark:text-cyan-400" />
              <span>Get in Touch</span>
            </button>
          </div>

          {/* Social Channels Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs sm:text-sm text-slate-700 dark:text-gray-300">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-gray-400 font-bold">Channels:</span>
            
            <a
              href="https://wa.me/201022121573"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-400 font-bold text-xs border border-emerald-500/30 transition-all hover:scale-105"
              title="Chat directly on WhatsApp"
            >
              <WhatsAppLogo size={14} />
              <span>WhatsApp</span>
            </a>

            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white transition-colors font-semibold"
            >
              <Github size={14} />
              <span>GitHub</span>
            </a>

            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold"
            >
              <Linkedin size={14} />
              <span>LinkedIn</span>
            </a>

            <a
              href={profile.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 hover:text-red-600 dark:hover:text-red-400 transition-colors font-semibold"
            >
              <Youtube size={14} />
              <span>YouTube</span>
            </a>

            <a
              href={profile.tiktokUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-semibold"
            >
              <TikTokLogo size={13} />
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
                ? { y: -12, scale: 1.03 }
                : { y: [-6, 6, -6], scale: 1 }
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

            {/* Container Card with High-End Obsidian Backdrop */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-white/20 bg-[#090b14] shadow-2xl transition-shadow duration-300">
              
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
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-transparent opacity-85 pointer-events-none" />

              {/* Top Side Badge */}
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/25 text-[10px] font-mono text-cyan-300 font-bold shadow-md pointer-events-none">
                FLUTTER SPECIALIST
              </div>

              {/* Bottom Card Info Overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-[#0d101d]/95 backdrop-blur-md border border-white/15 shadow-xl text-white">
                <div className="text-sm font-bold text-white tracking-wide">{profile.name}</div>
                <div className="text-xs text-cyan-400 font-medium mt-0.5">Mobile App Developer</div>
              </div>

            </div>
          </motion.div>
        </div>

      </div>

      {/* Realistic Stats Bar at Bottom */}
      <div className="max-w-7xl mx-auto w-full mt-10 pt-6 border-t border-slate-300 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {profile.stats.map((stat, idx) => {
          const isRepoStat = stat.label.toLowerCase().includes('repo');
          const displayValue = isRepoStat && totalReposCount ? `${totalReposCount}` : stat.value;

          return (
            <div key={idx} className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight title-contrast text-slate-900 dark:text-white">
                {displayValue}
                {stat.suffix && (
                  <span className="text-xs sm:text-sm font-bold text-blue-700 dark:text-cyan-400 ml-1.5">
                    {stat.suffix}
                  </span>
                )}
              </span>
              <span className="text-xs text-slate-700 dark:text-gray-300 font-bold mt-1 body-contrast">
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>

    </section>
  );
};
