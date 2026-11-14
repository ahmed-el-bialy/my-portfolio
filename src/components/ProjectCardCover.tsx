import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Layers,
  Sparkles,
  Film,
  ShoppingBag,
  CloudSun,
  Newspaper,
  MessageSquare,
  BookOpen,
  Trophy,
  Music,
  FileText,
  Quote,
  Terminal,
} from 'lucide-react';
import { getVerifiedProjectScreenshots } from '../services/githubService';

export interface ProjectCardCoverProps {
  repoName: string;
  language: string | null;
  coverUrl?: string;
  isHighlight?: boolean;
  description?: string | null;
  topics?: string[];
  isCardHovered?: boolean;
}

export interface ProjectBlueprintSpec {
  appTitle: string;
  genre: string;
  categoryBadge: string;
  badgeIcon: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }>;
  tagline: string;
  architecturePattern: string;
  coreHighlights: string[];
  performanceBadge: string;
  accentColor: string;
  secondaryAccent: string;
  glowRgb: string;
}

const KNOWN_BLUEPRINTS: Record<string, ProjectBlueprintSpec> = {
  revio: {
    appTitle: 'Revio',
    genre: 'Flashcards & Active Recall',
    categoryBadge: 'Published on Google Play',
    badgeIcon: Sparkles,
    tagline: 'Interactive 3D Flashcards & Smart Recall Engine',
    architecturePattern: 'Clean Architecture · Domain / Data / UI',
    coreHighlights: ['Hive CE Offline NoSQL', 'Cubit State Machine', '3D Card Flip Engine'],
    performanceBadge: 'Offline-First CRUD',
    accentColor: '#10B981',
    secondaryAccent: '#059669',
    glowRgb: '16, 185, 129',
  },
  movura: {
    appTitle: 'Movura',
    genre: 'Cinema & Series Tracker',
    categoryBadge: 'TMDB API Integration',
    badgeIcon: Film,
    tagline: 'Dynamic Entertainment Discovery & YouTube Trailers',
    architecturePattern: 'BLoC Pattern · Reactive Streams',
    coreHighlights: ['TMDB v3 REST Client', 'Sliver Parallax UI', 'In-App Trailer Hub'],
    performanceBadge: 'Debounced Search',
    accentColor: '#F59E0B',
    secondaryAccent: '#D97706',
    glowRgb: '245, 158, 11',
  },
  'vibrant-store': {
    appTitle: 'Vibrant Store',
    genre: 'Modern E-Commerce Solution',
    categoryBadge: 'Mobile Marketplace',
    badgeIcon: ShoppingBag,
    tagline: 'High-Performance Catalog with Instant Category Filters',
    architecturePattern: 'Service Layer · Decoupled HTTP',
    coreHighlights: ['DummyJSON REST Client', 'Persistent Cart & Wishlist', 'Responsive Grid UI'],
    performanceBadge: 'Instant Filtering',
    accentColor: '#EC4899',
    secondaryAccent: '#DB2777',
    glowRgb: '236, 72, 153',
  },
  'sky-cast': {
    appTitle: 'Sky-Cast',
    genre: 'Atmospheric Weather Radar',
    categoryBadge: 'Dynamic Climate UI',
    badgeIcon: CloudSun,
    tagline: 'Condition-Adaptive Themes & Autocomplete Search',
    architecturePattern: 'Clean Architecture · WeatherAPI',
    coreHighlights: ['Adaptive Palettes', 'Flutter SearchDelegate', 'Multi-Day Forecast'],
    performanceBadge: 'Adaptive UI',
    accentColor: '#06B6D4',
    secondaryAccent: '#0891B2',
    glowRgb: '6, 182, 212',
  },
  'news-cloud': {
    appTitle: 'News-Cloud',
    genre: 'Bilingual News Wire',
    categoryBadge: 'Arabic RTL Reader',
    badgeIcon: Newspaper,
    tagline: 'Curated Global Headlines with In-App WebView',
    architecturePattern: 'Repository Pattern · Retrofit',
    coreHighlights: ['Full Arabic RTL', 'In-App WebView', 'Category Refresh'],
    performanceBadge: 'Type-Safe Retrofit',
    accentColor: '#3B82F6',
    secondaryAccent: '#2563EB',
    glowRgb: '59, 130, 246',
  },
  shaats: {
    appTitle: 'Shaats',
    genre: 'Real-Time Cloud Messenger',
    categoryBadge: 'Firebase Cloud Firestore',
    badgeIcon: MessageSquare,
    tagline: 'Instant Messaging with Real-Time Reactive Streams',
    architecturePattern: 'Firebase Streams · Auth Lifecycle',
    coreHighlights: ['Firestore Snapshot Streams', 'Firebase Auth', 'Dynamic Chat UI'],
    performanceBadge: 'Real-Time Sync',
    accentColor: '#8B5CF6',
    secondaryAccent: '#7C3AED',
    glowRgb: '139, 92, 246',
  },
  'nihon-seed': {
    appTitle: 'Nihon-Seed',
    genre: 'Japanese Language Drills',
    categoryBadge: 'Gamified EdTech',
    badgeIcon: BookOpen,
    tagline: 'Interactive Kana Flashcards with Native Audio Drills',
    architecturePattern: 'Audio Engine · Modular Quizzes',
    coreHighlights: ['Hiragana & Katakana', 'Native Audio Playback', 'Spaced Recall'],
    performanceBadge: 'Native Audio Engine',
    accentColor: '#EF4444',
    secondaryAccent: '#DC2626',
    glowRgb: '239, 68, 68',
  },
  'nbn-basketball': {
    appTitle: 'NBN Basketball',
    genre: 'Courtside Match Scoreboard',
    categoryBadge: 'Live Sports Scoreboard',
    badgeIcon: Trophy,
    tagline: 'Dual-Team Match Tracker & Period Countdown Timer',
    architecturePattern: 'Clean State Machine · Dual Layout',
    coreHighlights: ['Dual-Team Score Modifiers', 'Period Timer', 'Fouls & Timeouts'],
    performanceBadge: '60 FPS Score Clock',
    accentColor: '#F97316',
    secondaryAccent: '#EA580C',
    glowRgb: '249, 115, 22',
  },
  'piano-tunes': {
    appTitle: 'Piano Tunes',
    genre: 'Interactive Musical Synthesizer',
    categoryBadge: 'Audio Engine UI',
    badgeIcon: Music,
    tagline: 'Touch-Responsive Musical Keys with Gradient Glows',
    architecturePattern: 'Native Audio Synthesizer',
    coreHighlights: ['Low-Latency Audio', 'Polyphonic Glow', 'Multi-Touch Keybed'],
    performanceBadge: 'Low-Latency DSP',
    accentColor: '#6366F1',
    secondaryAccent: '#4F46E5',
    glowRgb: '99, 102, 241',
  },
  'note-keep': {
    appTitle: 'Note-Keep',
    genre: 'Productivity & Task Notes',
    categoryBadge: 'Offline Task Storage',
    badgeIcon: FileText,
    tagline: 'Minimalist Note Taking & Daily Task Checklist',
    architecturePattern: 'Clean Architecture · Repository',
    coreHighlights: ['Local Persistence', 'Task Prioritization', 'Instant Search'],
    performanceBadge: 'Instant Local I/O',
    accentColor: '#14B8A6',
    secondaryAccent: '#0D9488',
    glowRgb: '20, 184, 166',
  },
  quotely: {
    appTitle: 'Quotely',
    genre: 'Inspirational Daily Quotes',
    categoryBadge: 'Public Quotes API',
    badgeIcon: Quote,
    tagline: 'Curated Daily Wisdom with Dynamic Typography Cards',
    architecturePattern: 'RESTful Client · Typography UI',
    coreHighlights: ['Dynamic Typography', 'One-Tap Share', 'Category Browse'],
    performanceBadge: 'Async Quote Stream',
    accentColor: '#EAB308',
    secondaryAccent: '#CA8A04',
    glowRgb: '234, 179, 8',
  },
};

function hashStringToColor(str: string): { accentColor: string; secondaryAccent: string; glowRgb: string } {
  const PALETTES = [
    { accentColor: '#0284C7', secondaryAccent: '#0369A1', glowRgb: '2, 132, 199' },
    { accentColor: '#10B981', secondaryAccent: '#059669', glowRgb: '16, 185, 129' },
    { accentColor: '#8B5CF6', secondaryAccent: '#6D28D9', glowRgb: '139, 92, 246' },
    { accentColor: '#F59E0B', secondaryAccent: '#D97706', glowRgb: '245, 158, 11' },
    { accentColor: '#EC4899', secondaryAccent: '#BE185D', glowRgb: '236, 72, 153' },
    { accentColor: '#6366F1', secondaryAccent: '#4338CA', glowRgb: '99, 102, 241' },
    { accentColor: '#14B8A6', secondaryAccent: '#0F766E', glowRgb: '20, 184, 166' },
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

export function synthesizeProjectBlueprint(
  repoName: string,
  language?: string | null,
  description?: string | null,
  topics: string[] = []
): ProjectBlueprintSpec {
  const cleanKey = (repoName || '').toLowerCase().replace(/[-_\s]/g, '');
  const matched = Object.entries(KNOWN_BLUEPRINTS).find(
    ([key]) => key.replace(/[-_\s]/g, '') === cleanKey
  );
  if (matched) {
    return matched[1];
  }

  const formattedTitle = (repoName || 'App Project')
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const allText = `${repoName} ${description || ''} ${topics.join(' ')}`.toLowerCase();

  let genre = `${language || 'Flutter'} Mobile Architecture`;
  let categoryBadge = `${language || 'Dart'} Application`;
  let badgeIcon: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = Smartphone;
  let architecturePattern = 'Clean Architecture · SOLID';
  let coreHighlights = ['State Management', 'Modular Components', 'Responsive UI'];
  let performanceBadge = 'Production Standard';

  if (allText.includes('movie') || allText.includes('film') || allText.includes('cinema')) {
    genre = 'Media & Streaming';
    categoryBadge = 'Media Engine';
    badgeIcon = Film;
  } else if (allText.includes('shop') || allText.includes('store') || allText.includes('ecommerce')) {
    genre = 'E-Commerce Mobile App';
    categoryBadge = 'Marketplace';
    badgeIcon = ShoppingBag;
  } else if (allText.includes('chat') || allText.includes('message')) {
    genre = 'Real-Time Messenger';
    categoryBadge = 'Cloud Streams';
    badgeIcon = MessageSquare;
  } else if (allText.includes('weather')) {
    genre = 'Weather Forecast';
    categoryBadge = 'Climate Radar';
    badgeIcon = CloudSun;
  } else if (allText.includes('news')) {
    genre = 'Editorial News Reader';
    categoryBadge = 'News Wire';
    badgeIcon = Newspaper;
  } else if (allText.includes('quiz') || allText.includes('learn') || allText.includes('card')) {
    genre = 'Gamified Learning';
    categoryBadge = 'EdTech';
    badgeIcon = BookOpen;
  } else if (allText.includes('tool') || allText.includes('cli')) {
    genre = 'Engineering Utilities';
    categoryBadge = 'Developer Tool';
    badgeIcon = Terminal;
  } else {
    badgeIcon = Layers;
  }

  const cleanDescription = (description || '').trim();
  const tagline =
    cleanDescription.length > 10 && cleanDescription.length < 85
      ? cleanDescription
      : `Production ${formattedTitle} mobile build with Clean Architecture.`;

  const { accentColor, secondaryAccent, glowRgb } = hashStringToColor(repoName || formattedTitle);

  return {
    appTitle: formattedTitle,
    genre,
    categoryBadge,
    badgeIcon,
    tagline,
    architecturePattern,
    coreHighlights,
    performanceBadge,
    accentColor,
    secondaryAccent,
    glowRgb,
  };
}

function isStrictScreenshotsCoverUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('/screenshots/cover.') ||
    lower.endsWith('/cover.png') ||
    lower.endsWith('/cover.jpg') ||
    lower.endsWith('/cover.webp') ||
    lower.endsWith('/cover.jpeg')
  );
}

export const ProjectCardCover: React.FC<ProjectCardCoverProps> = ({
  repoName,
  language,
  coverUrl,
  description,
  topics,
  isCardHovered = false,
}) => {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [isSelfHovered, setIsSelfHovered] = useState<boolean>(false);
  const isHovered = Boolean(isCardHovered || isSelfHovered);

  const blueprint: ProjectBlueprintSpec = useMemo(
    () => synthesizeProjectBlueprint(repoName, language, description, topics),
    [repoName, language, description, topics]
  );

  // Curated verified mobile screenshots for Slide 2 (organized showcase) & Slide 3 (alternate mockup angle)
  const verifiedScreenshots = useMemo(() => {
    const curated = getVerifiedProjectScreenshots(repoName);
    if (curated.length > 0) return curated;
    if (coverUrl && !isStrictScreenshotsCoverUrl(coverUrl)) {
      return [coverUrl];
    }
    return [];
  }, [repoName, coverUrl]);

  // Verify real cover.png availability for Slide 0
  useEffect(() => {
    let isCancelled = false;
    const candidates = [
      coverUrl && isStrictScreenshotsCoverUrl(coverUrl) ? coverUrl : null,
      `https://raw.githubusercontent.com/ahmed-el-bialy/${repoName}/main/screenshots/cover.png`,
    ].filter(Boolean) as string[];

    if (candidates.length === 0) {
      setCoverImageUrl(null);
      return;
    }

    const probe = async () => {
      for (const candidate of candidates) {
        const ok = await new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = candidate;
        });
        if (ok && !isCancelled) {
          setCoverImageUrl(candidate);
          return;
        }
      }
      if (!isCancelled) setCoverImageUrl(null);
    };

    probe();
    return () => {
      isCancelled = true;
    };
  }, [repoName, coverUrl]);

  // Strictly max 3 slides:
  // Slide 0: Store Cover / Architectural Cover Mockup
  // Slide 1: Organized Screenshots Collage (if >= 1 verified screenshot)
  // Slide 2: Secondary Mockup Angle (if >= 2 verified screenshots)
  const totalSlides = useMemo(() => {
    if (verifiedScreenshots.length >= 2) return 3;
    if (verifiedScreenshots.length === 1) return 2;
    return 1;
  }, [verifiedScreenshots.length]);

  useEffect(() => {
    if (activeSlide >= totalSlides) {
      setActiveSlide(0);
    }
  }, [totalSlides, activeSlide]);

  // Auto-play with Hover Pause
  useEffect(() => {
    if (totalSlides <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    }, 3600);

    return () => clearInterval(timer);
  }, [totalSlides, isHovered]);

  const BadgeIcon = blueprint.badgeIcon;
  const collageScreens = verifiedScreenshots.slice(0, 3);
  const spotlightScreen = verifiedScreenshots[1] || verifiedScreenshots[0];

  return (
    <div
      className="relative w-full aspect-[16/9.5] sm:aspect-[16/9] bg-slate-100 dark:bg-[#080b14] overflow-hidden select-none border-b border-slate-200/90 dark:border-white/10 group/cover transition-colors duration-300"
      onMouseEnter={() => setIsSelfHovered(true)}
      onMouseLeave={() => setIsSelfHovered(false)}
      onClick={(e) => {
        if (totalSlides > 1) {
          e.stopPropagation();
          setActiveSlide((prev) => (prev + 1) % totalSlides);
        }
      }}
      title={`${blueprint.appTitle} (${activeSlide + 1}/${totalSlides})`}
    >
      <AnimatePresence mode="wait">
        {/* SLIDE 0: Store Cover Artwork or Clean Mockup */}
        {activeSlide === 0 && (
          <motion.div
            key="slide-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="absolute inset-0 flex flex-col justify-between"
          >
            {coverImageUrl ? (
              <div className="relative w-full h-full bg-slate-900">
                <img
                  src={coverImageUrl}
                  alt={`${blueprint.appTitle} Store Cover`}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover/cover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 start-4 end-4 flex items-center justify-between text-[11px] font-medium text-white/90 pointer-events-none">
                  <span>{blueprint.categoryBadge}</span>
                  <span className="font-mono text-[10px] opacity-80">{blueprint.performanceBadge}</span>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="absolute inset-0 pointer-events-none opacity-100 dark:opacity-0 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(ellipse 75% 60% at 50% 15%, rgba(${blueprint.glowRgb}, 0.08) 0%, transparent 65%), linear-gradient(135deg, rgba(${blueprint.glowRgb}, 0.05) 0%, #ffffff 48%, #f8fafc 100%)`,
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(ellipse 80% 65% at 50% 12%, rgba(${blueprint.glowRgb}, 0.14) 0%, transparent 65%), linear-gradient(135deg, rgba(${blueprint.glowRgb}, 0.08) 0%, #090d1a 45%, #05070e 100%)`,
                  }}
                />

                {/* Top Metadata Strip (Clean unboxed hairline text, zero pulsing dots) */}
                <div className="relative z-10 flex items-center justify-between gap-2 px-4 sm:px-5 pt-3.5 sm:pt-4 text-[11px] font-medium">
                  <span className="truncate font-semibold" style={{ color: blueprint.accentColor }}>
                    {blueprint.categoryBadge}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                    {blueprint.performanceBadge}
                  </span>
                </div>

                {/* Brand Emblem + Title */}
                <div className="relative z-10 px-4 sm:px-5 my-auto flex items-center gap-3.5 sm:gap-4">
                  <div
                    className="shrink-0 w-13 h-13 sm:w-15 sm:h-15 rounded-2xl p-[1.5px] shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${blueprint.accentColor}, ${blueprint.secondaryAccent})`,
                    }}
                  >
                    <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#0a0d18] flex items-center justify-center">
                      <BadgeIcon size={25} style={{ color: blueprint.accentColor }} />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                      {blueprint.appTitle}
                    </h3>
                    <p className="text-xs font-semibold truncate mt-0.5" style={{ color: blueprint.accentColor }}>
                      {blueprint.genre}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
                      {blueprint.tagline}
                    </p>
                  </div>
                </div>

                {/* Bottom Architecture Shelf */}
                <div className="relative z-10 px-4 sm:px-5 py-2.5 bg-slate-100/90 dark:bg-[#05070d]/90 border-t border-slate-200/80 dark:border-white/8 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300 truncate">
                    {blueprint.architecturePattern}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                    01 / 0{totalSlides}
                  </span>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* SLIDE 1: Organized Screenshots Collage */}
        {activeSlide === 1 && collageScreens.length > 0 && (
          <motion.div
            key="slide-collage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="absolute inset-0 flex flex-col justify-between p-3 sm:p-4 bg-slate-100 dark:bg-[#070a13]"
            style={{
              backgroundImage: `radial-gradient(ellipse 75% 65% at 50% 0%, rgba(${blueprint.glowRgb}, 0.12), transparent 70%)`,
            }}
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 px-1">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {blueprint.appTitle} · App Screens
              </span>
              <span>02 / 0{totalSlides}</span>
            </div>

            <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 pt-1 pb-3 overflow-hidden">
              {collageScreens.map((screenUrl, sIdx) => (
                <div
                  key={screenUrl}
                  className={`relative h-[88%] aspect-[9/17.5] rounded-xl overflow-hidden bg-slate-950 border border-slate-300/80 dark:border-white/15 shadow-lg transition-transform duration-300 ${
                    collageScreens.length >= 2 && sIdx === 1 ? '-translate-y-1 scale-[1.04] z-10' : 'opacity-95'
                  }`}
                >
                  <img
                    src={screenUrl}
                    alt={`${blueprint.appTitle} screen ${sIdx + 1}`}
                    className="w-full h-full object-cover object-top"
                    loading="eager"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SLIDE 2: Secondary Mockup Angle */}
        {activeSlide === 2 && spotlightScreen && (
          <motion.div
            key="slide-mockup-angle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="absolute inset-0 grid grid-cols-12 items-center gap-3 px-4 sm:px-5 py-3 bg-slate-100 dark:bg-[#070a13]"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(${blueprint.glowRgb}, 0.14) 0%, transparent 65%)`,
            }}
          >
            <div className="col-span-7 flex flex-col justify-center space-y-1.5 min-w-0">
              <span
                className="text-[10px] font-mono font-bold uppercase tracking-wider"
                style={{ color: blueprint.accentColor }}
              >
                UI Highlight · 03 / 03
              </span>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {blueprint.appTitle}
              </h4>
              <ul className="space-y-1 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300">
                {blueprint.coreHighlights.slice(0, 3).map((item) => (
                  <li key={item} className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-1 h-1 rounded-full shrink-0"
                      style={{ backgroundColor: blueprint.accentColor }}
                    />
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-5 h-full flex items-center justify-center">
              <div className="h-[90%] aspect-[9/17.5] rounded-xl overflow-hidden bg-slate-950 border-2 border-slate-300 dark:border-white/20 shadow-xl rotate-[3deg] group-hover/cover:rotate-0 transition-transform duration-500">
                <img
                  src={spotlightScreen}
                  alt={`${blueprint.appTitle} feature mockup`}
                  className="w-full h-full object-cover object-top"
                  loading="eager"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Interactive Slide Indicators (Clickable Dots) */}
      {totalSlides > 1 && (
        <div
          className="absolute bottom-2 inset-x-0 z-30 flex items-center justify-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide(idx);
              }}
              aria-label={`View slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeSlide === idx
                  ? 'w-5 bg-blue-500 dark:bg-cyan-400 shadow-xs'
                  : 'w-1.5 bg-slate-400/70 dark:bg-white/30 hover:bg-slate-600 dark:hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
