import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getVerifiedProjectScreenshots, fetchRepoScreenshots } from '../services/githubService';
import { ImageWithSkeleton, preloadImageUrls } from './ImageWithSkeleton';
import { useLanguage } from '../context/LanguageContext';

export interface ProjectCardCoverProps {
  repoName: string;
  language: string | null;
  coverUrl?: string;
  discoveredScreenshots?: string[];
  isHighlight?: boolean;
  description?: string | null;
  topics?: string[];
  isCardHovered?: boolean;
  aspectClassName?: string;
  compactMode?: boolean;
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
    categoryBadge: 'Google Play App',
    badgeIcon: Sparkles,
    tagline: 'Interactive 3D Flashcards & Smart Recall Engine',
    architecturePattern: 'Clean Architecture · Domain / Data / UI',
    coreHighlights: ['Hive Offline NoSQL', 'Cubit State Machine', '3D Card Flip Engine'],
    performanceBadge: 'Offline-First CRUD',
    accentColor: '#10B981',
    secondaryAccent: '#059669',
    glowRgb: '16, 185, 129',
  },
  movura: {
    appTitle: 'Movura',
    genre: 'Cinema & Series Tracker',
    categoryBadge: 'TMDB API Client',
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
    performanceBadge: 'Precision Score Clock',
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
  const architecturePattern = 'Clean Architecture · SOLID';
  const coreHighlights = ['State Management', 'Modular Components', 'Responsive UI'];
  const performanceBadge = 'Production Standard';

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
  discoveredScreenshots,
  description,
  topics,
  isCardHovered = false,
  aspectClassName,
  compactMode = false,
}) => {
  const { dir, lang } = useLanguage();
  const [selectedScreenIdx, setSelectedScreenIdx] = useState<number>(0);
  const [showingCoverArt, setShowingCoverArt] = useState<boolean>(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [autoDiscoveredScreens, setAutoDiscoveredScreens] = useState<string[]>([]);
  const [isSelfHovered, setIsSelfHovered] = useState<boolean>(false);
  const [manualPausedUntil, setManualPausedUntil] = useState<number>(0);
  const isHovered = Boolean(isCardHovered || isSelfHovered);

  const blueprint: ProjectBlueprintSpec = useMemo(
    () => synthesizeProjectBlueprint(repoName, language, description, topics),
    [repoName, language, description, topics]
  );

  const curatedScreens = useMemo(() => getVerifiedProjectScreenshots(repoName), [repoName]);

  // Automatic client-side fallback discovery when a brand-new GitHub repo isn't in static VERIFIED_REPO_SCREENSHOTS yet
  useEffect(() => {
    let isCancelled = false;
    if (curatedScreens.length > 0 || (discoveredScreenshots && discoveredScreenshots.length > 0)) {
      setAutoDiscoveredScreens([]);
      return;
    }

    fetchRepoScreenshots(repoName)
      .then((urls) => {
        if (!isCancelled && Array.isArray(urls) && urls.length > 0) {
          setAutoDiscoveredScreens(urls);
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [repoName, curatedScreens.length, discoveredScreenshots]);

  const verifiedScreenshots = useMemo(() => {
    if (curatedScreens.length > 0) return curatedScreens.slice(0, 5);
    if (discoveredScreenshots && discoveredScreenshots.length > 0) {
      return discoveredScreenshots.slice(0, 5);
    }
    if (autoDiscoveredScreens.length > 0) {
      return autoDiscoveredScreens.slice(0, 5);
    }
    if (coverUrl && !isStrictScreenshotsCoverUrl(coverUrl)) {
      return [coverUrl];
    }
    return [];
  }, [curatedScreens, discoveredScreenshots, autoDiscoveredScreens, coverUrl]);

  // Preload up to 4 screens in background so screen swaps never flash black
  useEffect(() => {
    if (verifiedScreenshots.length > 0) {
      preloadImageUrls(verifiedScreenshots.slice(0, 4));
    }
  }, [verifiedScreenshots]);

  // Only expose cover toggle when verified for Revio or passed explicitly (eliminates 404 console probes)
  useEffect(() => {
    if (repoName.toLowerCase() === 'revio') {
      setCoverImageUrl(
        'https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/cover.png'
      );
    } else if (coverUrl && isStrictScreenshotsCoverUrl(coverUrl) && discoveredScreenshots?.includes(coverUrl)) {
      setCoverImageUrl(coverUrl);
    } else {
      setCoverImageUrl(null);
    }
  }, [repoName, coverUrl, discoveredScreenshots]);

  useEffect(() => {
    setSelectedScreenIdx(0);
    setShowingCoverArt(false);
  }, [repoName]);

  const totalScreens = verifiedScreenshots.length;

  // Gentle auto-cycle across screens ONLY when not hovered and not manually clicked recently
  useEffect(() => {
    if (totalScreens <= 1 || isHovered || showingCoverArt) return;
    if (Date.now() < manualPausedUntil) return;

    const timer = setInterval(() => {
      if (Date.now() < manualPausedUntil) return;
      setSelectedScreenIdx((prev) => (prev + 1) % totalScreens);
    }, 4600);

    return () => clearInterval(timer);
  }, [totalScreens, isHovered, showingCoverArt, manualPausedUntil]);

  const selectScreen = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowingCoverArt(false);
    setSelectedScreenIdx(idx);
    setManualPausedUntil(Date.now() + 9000);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalScreens <= 1) return;
    setShowingCoverArt(false);
    setSelectedScreenIdx((prev) => (prev + 1) % totalScreens);
    setManualPausedUntil(Date.now() + 9000);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalScreens <= 1) return;
    setShowingCoverArt(false);
    setSelectedScreenIdx((prev) => (prev - 1 + totalScreens) % totalScreens);
    setManualPausedUntil(Date.now() + 9000);
  };

  const BadgeIcon = blueprint.badgeIcon;
  const activeScreenUrl = verifiedScreenshots[selectedScreenIdx] || verifiedScreenshots[0];
  const containerHeightClass =
    aspectClassName ||
    (compactMode
      ? 'h-[260px] sm:h-[280px]'
      : 'h-[320px] sm:h-[365px] lg:h-[385px]');

  return (
    <div
      className={`relative w-full ${containerHeightClass} bg-slate-100 dark:bg-[#070a12] overflow-hidden select-none border-b border-slate-200/90 dark:border-white/10 group/cover transition-colors duration-300`}
      onMouseEnter={() => setIsSelfHovered(true)}
      onMouseLeave={() => setIsSelfHovered(false)}
      title={`${blueprint.appTitle} — ${blueprint.categoryBadge}`}
    >
      {/* Ambient Radial Illumination */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 70% at 38% 18%, rgba(${blueprint.glowRgb}, 0.2), transparent 72%)`,
        }}
      />

      {/* MODE 1: REPOSITORY BANNER COVER IMAGE (Optional toggle when available) */}
      {showingCoverArt && coverImageUrl ? (
        <div className="relative w-full h-full bg-slate-950">
          <ImageWithSkeleton
            src={coverImageUrl}
            alt={`${blueprint.appTitle} Cover`}
            loading="eager"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover/cover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none" />
          <div className="absolute bottom-3 start-4 end-4 flex items-center justify-between gap-2 z-20">
            <span className="text-xs font-semibold text-white/95 truncate">
              {blueprint.appTitle} · {blueprint.categoryBadge}
            </span>
            {totalScreens > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowingCoverArt(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold backdrop-blur-xs cursor-pointer border border-white/15"
              >
                {lang === 'ar' ? 'عرض الشاشات' : 'Show App Screens'}
              </button>
            )}
          </div>
        </div>
      ) : activeScreenUrl ? (
        /* MODE 2: HERO-FIRST LARGE PHONE SCREEN + INTERACTIVE THUMBNAILS */
        <div className="relative z-10 w-full h-full flex flex-col p-3 sm:p-4">
          {/* Clean Micro Header */}
          <div className="flex items-center justify-between gap-2 pb-2 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-md border border-slate-300/80 dark:border-white/15 bg-white dark:bg-[#0e1320] shrink-0"
              >
                <BadgeIcon size={12} style={{ color: blueprint.accentColor }} />
              </span>
              <span
                className="text-[11px] font-mono font-bold truncate"
                style={{ color: blueprint.accentColor }}
              >
                {blueprint.categoryBadge}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {coverImageUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowingCoverArt(true);
                  }}
                  className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 hover:text-[#0284ff] dark:hover:text-[#00C7FF] cursor-pointer px-1.5 py-0.5 rounded bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                >
                  {lang === 'ar' ? 'الغلاف' : 'Cover'}
                </button>
              )}
              {totalScreens > 1 && (
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  0{selectedScreenIdx + 1} / 0{totalScreens}
                </span>
              )}
            </div>
          </div>

          {/* Main Split: Fixed-Height Large Hero Phone + Interactive Thumbnails Rail */}
          <div className="flex-1 min-h-0 grid grid-cols-12 gap-2.5 sm:gap-4 items-center">
            {/* Large Primary Hero Phone Showcase with Explicit Concrete Phone Frame Height */}
            <div
              className={`${
                totalScreens > 1 || !compactMode ? 'col-span-6 sm:col-span-7' : 'col-span-6'
              } flex items-center justify-center relative`}
            >
              <div
                className={`relative ${
                  compactMode
                    ? 'h-[205px] sm:h-[225px]'
                    : 'h-[245px] sm:h-[290px] lg:h-[310px]'
                } aspect-[9/18.2] rounded-[22px] sm:rounded-[26px] p-1.5 bg-[#0e1320] border-2 border-slate-300/90 dark:border-white/20 shadow-[0_20px_45px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover/cover:scale-[1.02]`}
              >
                {/* Minimal Speaker Notch */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 w-10 h-1.5 rounded-full bg-slate-800/90 pointer-events-none" />

                <div className="relative w-full h-full rounded-[16px] sm:rounded-[20px] overflow-hidden bg-[#161e31]">
                  <ImageWithSkeleton
                    src={activeScreenUrl}
                    alt={`${blueprint.appTitle} hero screen ${selectedScreenIdx + 1}`}
                    loading="eager"
                    variant="phone"
                    className="w-full h-full object-cover object-top crisp-screenshot"
                  />
                </div>
              </div>

              {/* Prev / Next Quick Arrows for Multi-Screen Cards */}
              {totalScreens > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous app screen"
                    className="opacity-80 sm:opacity-0 group-hover/cover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 absolute start-0 sm:start-1 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-slate-900/80 hover:bg-[#0284ff] text-white border border-white/15 flex items-center justify-center cursor-pointer shadow-md"
                  >
                    {dir === 'rtl' ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next app screen"
                    className="opacity-80 sm:opacity-0 group-hover/cover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 absolute end-0 sm:end-1 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-slate-900/80 hover:bg-[#0284ff] text-white border border-white/15 flex items-center justify-center cursor-pointer shadow-md"
                  >
                    {dir === 'rtl' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                  </button>
                </>
              )}
            </div>

            {/* Right Interactive Rail: Architecture Snapshot + Selectable Sharp Thumbnails */}
            <div
              className={`${
                totalScreens > 1 || !compactMode ? 'col-span-6 sm:col-span-5' : 'col-span-6'
              } h-full flex flex-col justify-center gap-2 sm:gap-2.5 min-w-0`}
            >
              <div className="space-y-0.5 sm:space-y-1 min-w-0">
                <h4 className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                  {blueprint.appTitle}
                </h4>
                <p className="text-[10.5px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-300 line-clamp-2 leading-snug">
                  {blueprint.tagline}
                </p>
              </div>

              {/* Quick Feature Bullet (keeps visual context sharp) */}
              {!compactMode && (
                <ul className="hidden sm:block space-y-1 text-[10.5px] text-slate-600 dark:text-slate-400">
                  {blueprint.coreHighlights.slice(0, 2).map((feat) => (
                    <li key={feat} className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: blueprint.accentColor }}
                      />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Clickable Sharp Screen Thumbnails Grid */}
              {totalScreens > 1 ? (
                <div className="space-y-1.5 pt-0.5">
                  <div className="text-[9.5px] sm:text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                    {lang === 'ar' ? 'تبديل الشاشات:' : 'Tap screen to preview:'}
                  </div>
                  <div
                    className="grid grid-cols-2 gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {verifiedScreenshots.slice(0, 4).map((thumbUrl, tIdx) => {
                      const isActive = selectedScreenIdx === tIdx;
                      return (
                        <button
                          key={thumbUrl}
                          type="button"
                          onClick={(e) => selectScreen(tIdx, e)}
                          aria-label={`Select screen ${tIdx + 1}`}
                          className={`group/thumb relative h-14 sm:h-20 w-full rounded-xl overflow-hidden bg-[#161e31] border-2 transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'border-[#0284ff] dark:border-[#00C7FF] shadow-md scale-[1.03]'
                              : 'border-slate-300/80 dark:border-white/15 opacity-85 hover:opacity-100 hover:border-slate-400 dark:hover:border-white/35'
                          }`}
                        >
                          <ImageWithSkeleton
                            src={thumbUrl}
                            alt={`${blueprint.appTitle} thumbnail ${tIdx + 1}`}
                            loading="eager"
                            variant="phone"
                            className="w-full h-full object-cover object-top crisp-screenshot"
                          />
                          <span
                            className={`absolute bottom-1 end-1 px-1 py-0.2 rounded text-[9px] font-mono font-bold ${
                              isActive
                                ? 'bg-[#0284ff] text-white'
                                : 'bg-black/75 text-slate-100'
                            }`}
                          >
                            0{tIdx + 1}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                    <Sparkles size={11} style={{ color: blueprint.accentColor }} />
                    <span>{blueprint.performanceBadge}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : coverImageUrl ? (
        <div className="relative w-full h-full bg-slate-900">
          <ImageWithSkeleton
            src={coverImageUrl}
            alt={`${blueprint.appTitle} Store Cover`}
            loading="eager"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover/cover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
          <div className="absolute bottom-3 start-4 end-4 flex items-center justify-between text-[11px] font-medium text-white/90 pointer-events-none">
            <span>{blueprint.categoryBadge}</span>
            <span className="font-mono text-[10px] opacity-80">{blueprint.performanceBadge}</span>
          </div>
        </div>
      ) : (
        /* MODE 3: ARCHITECTURAL FALLBACK CARD (When no screenshots or cover exist) */
        <div className="relative w-full h-full flex flex-col justify-between">
          <div
            className="relative z-10 flex items-center justify-between gap-2 px-4 sm:px-5 pt-4 text-[11px] font-medium"
          >
            <span className="truncate font-semibold" style={{ color: blueprint.accentColor }}>
              {blueprint.categoryBadge}
            </span>
            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
              {blueprint.performanceBadge}
            </span>
          </div>

          <div className="relative z-10 px-4 sm:px-5 my-auto flex items-center gap-4">
            <div
              className="shrink-0 w-16 h-16 rounded-2xl p-[1.5px] shadow-md"
              style={{
                background: `linear-gradient(135deg, ${blueprint.accentColor}, ${blueprint.secondaryAccent})`,
              }}
            >
              <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#0a0d18] flex items-center justify-center">
                <BadgeIcon size={28} style={{ color: blueprint.accentColor }} />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                {blueprint.appTitle}
              </h3>
              <p className="text-xs font-semibold truncate mt-0.5" style={{ color: blueprint.accentColor }}>
                {blueprint.genre}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                {blueprint.tagline}
              </p>
            </div>
          </div>

          <div className="relative z-10 px-4 sm:px-5 py-2.5 bg-slate-100/90 dark:bg-[#05070d]/90 border-t border-slate-200/80 dark:border-white/8 flex items-center justify-between text-[11px]">
            <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300 truncate">
              {blueprint.architecturePattern}
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
              Clean Arch
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
