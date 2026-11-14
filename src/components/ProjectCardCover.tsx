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
  Zap,
  CheckCircle2,
  Image as ImageIcon,
  Palette,
  Terminal,
  Cpu,
  Activity,
  Compass,
  Rocket,
  ShieldCheck,
  Code2,
  FolderGit2,
  Database,
  Radio,
  Globe,
  Sliders,
  Play,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { getLanguageColor } from '../services/githubService';

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

// Master-crafted blueprint specs with distinct visual identity, tailored icons, and comfortable color palettes
const KNOWN_BLUEPRINTS: Record<string, ProjectBlueprintSpec> = {
  revio: {
    appTitle: 'Revio',
    genre: 'Flashcards & Active Recall',
    categoryBadge: 'Published on Google Play',
    badgeIcon: Sparkles,
    tagline: 'Interactive 3D Flashcards & Smart Recall Engine',
    architecturePattern: 'Clean Architecture • Domain / Data / Presentation',
    coreHighlights: ['Hive CE Offline NoSQL', 'Cubit State Machine', '3D Card Flip Engine'],
    performanceBadge: 'Zero-Latency Offline CRUD',
    accentColor: '#10B981', // Emerald
    secondaryAccent: '#059669',
    glowRgb: '16, 185, 129',
  },
  movura: {
    appTitle: 'Movura',
    genre: 'Cinema & Series Tracker',
    categoryBadge: 'TMDB API Integration',
    badgeIcon: Film,
    tagline: 'Dynamic Entertainment Discovery & YouTube Trailers',
    architecturePattern: 'BLoC Pattern • Reactive Event Streams',
    coreHighlights: ['TMDB v3 REST Client', 'Sliver Parallax UI', 'In-App Trailer Hub'],
    performanceBadge: 'Debounced Real-Time Search',
    accentColor: '#F59E0B', // Amber
    secondaryAccent: '#D97706',
    glowRgb: '245, 158, 11',
  },
  'vibrant-store': {
    appTitle: 'Vibrant Store',
    genre: 'Modern E-Commerce Solution',
    categoryBadge: 'Production Mobile Shop',
    badgeIcon: ShoppingBag,
    tagline: 'High-Performance Catalog with Instant Category Filters',
    architecturePattern: 'Service Layer Pattern • Decoupled HTTP',
    coreHighlights: ['DummyJSON REST Client', 'Persistent Cart & Wishlist', 'Responsive Grid UI'],
    performanceBadge: 'Instant Chip Filtering',
    accentColor: '#EC4899', // Pink
    secondaryAccent: '#DB2777',
    glowRgb: '236, 72, 153',
  },
  'sky-cast': {
    appTitle: 'Sky-Cast',
    genre: 'Atmospheric Weather Radar',
    categoryBadge: 'Dynamic Climate UI',
    badgeIcon: CloudSun,
    tagline: 'Condition-Adaptive Themes & Autocomplete Search',
    architecturePattern: 'Clean Architecture • WeatherAPI Client',
    coreHighlights: ['Atmospheric Dynamic Palettes', 'Flutter SearchDelegate', 'Multi-Day Forecast'],
    performanceBadge: 'Condition-Adaptive Themes',
    accentColor: '#06B6D4', // Cyan
    secondaryAccent: '#0891B2',
    glowRgb: '6, 182, 212',
  },
  'news-cloud': {
    appTitle: 'News-Cloud',
    genre: 'Bilingual News Wire',
    categoryBadge: 'Full Arabic RTL Reader',
    badgeIcon: Newspaper,
    tagline: 'Curated Global Headlines with In-App WebView',
    architecturePattern: 'Repository Pattern • Retrofit Client',
    coreHighlights: ['Full Arabic RTL Support', 'Distraction-Free WebView', 'Category Pull-to-Refresh'],
    performanceBadge: 'Type-Safe Retrofit Client',
    accentColor: '#3B82F6', // Blue
    secondaryAccent: '#2563EB',
    glowRgb: '59, 130, 246',
  },
  shaats: {
    appTitle: 'Shaats',
    genre: 'Real-Time Cloud Messenger',
    categoryBadge: 'Firebase Cloud Firestore',
    badgeIcon: MessageSquare,
    tagline: 'Instant Messaging with Real-Time Reactive Streams',
    architecturePattern: 'Firebase Reactive Streams • Auth Lifecycle',
    coreHighlights: ['Firestore Snapshot Streams', 'Firebase Authentication', 'Dynamic Chat Bubbles'],
    performanceBadge: 'Sub-Second Cloud Sync',
    accentColor: '#8B5CF6', // Purple
    secondaryAccent: '#7C3AED',
    glowRgb: '139, 92, 246',
  },
  'nihon-seed': {
    appTitle: 'Nihon-Seed',
    genre: 'Japanese Language Drills',
    categoryBadge: 'Gamified EdTech',
    badgeIcon: BookOpen,
    tagline: 'Interactive Kana Flashcards with Native Audio Drills',
    architecturePattern: 'Audio Engine • Modular Quiz Architecture',
    coreHighlights: ['Hiragana & Katakana Cards', 'Native Audio Playback', 'Spaced Recall Drills'],
    performanceBadge: 'Low-Latency Audio Engine',
    accentColor: '#EF4444', // Red
    secondaryAccent: '#DC2626',
    glowRgb: '239, 68, 68',
  },
  'nbn-basketball': {
    appTitle: 'NBN Basketball',
    genre: 'Courtside Match Scoreboard',
    categoryBadge: 'Live Sports Scoreboard',
    badgeIcon: Trophy,
    tagline: 'Dual-Team Match Tracker & Period Countdown Timer',
    architecturePattern: 'Clean State Machine • Dual Orientation',
    coreHighlights: ['Dual-Team Points Modifiers', 'Quarter & Period Timer', 'Fouls & Timeouts Radar'],
    performanceBadge: 'Instant 1/2/3 Pt Modifiers',
    accentColor: '#F97316', // Orange
    secondaryAccent: '#EA580C',
    glowRgb: '249, 115, 22',
  },
  'piano-tunes': {
    appTitle: 'Piano Tunes',
    genre: 'Interactive Musical Synthesizer',
    categoryBadge: 'Audio Engine & Neon UI',
    badgeIcon: Music,
    tagline: 'Touch-Responsive Musical Keys with Gradient Glows',
    architecturePattern: 'Native Audio Synthesizer • Responsive Touches',
    coreHighlights: ['Low-Latency Sound Engine', 'Neon Polyphonic Glow', 'Multi-Touch Keybed'],
    performanceBadge: 'Low Latency Audio Stream',
    accentColor: '#6366F1', // Indigo
    secondaryAccent: '#4F46E5',
    glowRgb: '99, 102, 241',
  },
  'note-keep': {
    appTitle: 'Note-Keep',
    genre: 'Productivity & Task Notes',
    categoryBadge: 'Offline Task Storage',
    badgeIcon: FileText,
    tagline: 'Clean Minimalist Note Taking & Daily Task Checklist',
    architecturePattern: 'Clean Architecture • Repository Pattern',
    coreHighlights: ['Local Storage Persistence', 'Task Prioritization', 'Instant Title Search'],
    performanceBadge: 'Zero-Latency Local Storage',
    accentColor: '#14B8A6', // Teal
    secondaryAccent: '#0D9488',
    glowRgb: '20, 184, 166',
  },
  quotely: {
    appTitle: 'Quotely',
    genre: 'Inspirational Daily Quotes',
    categoryBadge: 'Public Quotes API',
    badgeIcon: Quote,
    tagline: 'Curated Daily Wisdom with Dynamic Typography Cards',
    architecturePattern: 'RESTful API Consumer • Responsive Typography',
    coreHighlights: ['Dynamic Card Typography', 'One-Tap Copy & Share', 'Category Browse Mode'],
    performanceBadge: 'Instant Random Quotes',
    accentColor: '#EAB308', // Amber-Yellow
    secondaryAccent: '#CA8A04',
    glowRgb: '234, 179, 8',
  },
};

/**
 * Procedural Color Harmonizer
 * Gives any arbitrary string a stable, gorgeous, high-contrast neon/studio palette
 */
function hashStringToColor(str: string): { accentColor: string; secondaryAccent: string; glowRgb: string } {
  const PALETTES = [
    { accentColor: '#00E5FF', secondaryAccent: '#0284C7', glowRgb: '0, 229, 255' }, // Electric Cyan
    { accentColor: '#10B981', secondaryAccent: '#059669', glowRgb: '16, 185, 129' }, // Emerald
    { accentColor: '#8B5CF6', secondaryAccent: '#6D28D9', glowRgb: '139, 92, 246' }, // Violet
    { accentColor: '#F59E0B', secondaryAccent: '#D97706', glowRgb: '245, 158, 11' }, // Warm Amber
    { accentColor: '#EC4899', secondaryAccent: '#BE185D', glowRgb: '236, 72, 153' }, // Rose Pink
    { accentColor: '#6366F1', secondaryAccent: '#4338CA', glowRgb: '99, 102, 241' }, // Indigo
    { accentColor: '#14B8A6', secondaryAccent: '#0F766E', glowRgb: '20, 184, 166' }, // Sea Teal
    { accentColor: '#F97316', secondaryAccent: '#C2410C', glowRgb: '249, 115, 22' }, // Neon Orange
    { accentColor: '#06B6D4', secondaryAccent: '#0E7490', glowRgb: '6, 182, 212' }, // Sky
    { accentColor: '#3B82F6', secondaryAccent: '#1D4ED8', glowRgb: '59, 130, 246' }, // Azure
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}

/**
 * Synthesizes a completely custom, professional standard cover specification
 * automatically for ANY repository or project based on its name, language,
 * topics, and description.
 */
export function synthesizeProjectBlueprint(
  repoName: string,
  language?: string | null,
  description?: string | null,
  topics: string[] = []
): ProjectBlueprintSpec {
  const cleanKey = (repoName || '').toLowerCase().replace(/[-_\s]/g, '');
  
  // 1. Check known explicit blueprints
  const matched = Object.entries(KNOWN_BLUEPRINTS).find(
    ([key]) => key.replace(/[-_\s]/g, '') === cleanKey
  );
  if (matched) {
    return matched[1];
  }

  // 2. Format a pristine display title (e.g. "my-awesome-app" -> "My Awesome App")
  const formattedTitle = (repoName || 'App Project')
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  // 3. Procedural Topic & Keyword Analyzer
  const allText = `${repoName} ${description || ''} ${topics.join(' ')}`.toLowerCase();

  let genre = 'Mobile Application Architecture';
  let categoryBadge = `${language || 'Dart'} Ecosystem`;
  let badgeIcon: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = Smartphone;
  let architecturePattern = 'Clean Architecture • State Management';
  let coreHighlights = [`${language || 'Dart'} Architecture`, 'Modular Components', 'SOLID Patterns'];
  let performanceBadge = 'Optimized Frame Latency';

  // Keyword-driven domain synthesis
  if (allText.includes('movie') || allText.includes('film') || allText.includes('cinema') || allText.includes('stream') || allText.includes('video')) {
    genre = 'Media & Entertainment Streaming';
    categoryBadge = 'Media Player Engine';
    badgeIcon = Film;
    architecturePattern = 'Reactive Streams • Sliver UI Hierarchy';
    coreHighlights = ['REST API Client', 'Custom Smooth Player', 'Dynamic Media Feed'];
    performanceBadge = 'Hardware Accelerated';
  } else if (allText.includes('shop') || allText.includes('store') || allText.includes('ecommerce') || allText.includes('market') || allText.includes('cart')) {
    genre = 'E-Commerce & Digital Commerce';
    categoryBadge = 'Mobile Marketplace';
    badgeIcon = ShoppingBag;
    architecturePattern = 'Clean Architecture • Repository Pattern';
    coreHighlights = ['Product Catalog Engine', 'Persistent Cart State', 'Real-Time Pricing'];
    performanceBadge = 'Instant Local Storage';
  } else if (allText.includes('chat') || allText.includes('message') || allText.includes('social') || allText.includes('talk')) {
    genre = 'Real-Time Social Messenger';
    categoryBadge = 'Cloud Socket Engine';
    badgeIcon = MessageSquare;
    architecturePattern = 'Event-Driven WebSocket Architecture';
    coreHighlights = ['Live Socket Streams', 'Encrypted State', 'Push Notification Pipeline'];
    performanceBadge = 'Sub-Second Real-Time Sync';
  } else if (allText.includes('weather') || allText.includes('forecast') || allText.includes('climate') || allText.includes('radar')) {
    genre = 'Atmospheric Weather Radar';
    categoryBadge = 'Geospatial Radar';
    badgeIcon = CloudSun;
    architecturePattern = 'GPS Location Streams • Clean Architecture';
    coreHighlights = ['Interactive Radars', 'Atmospheric Forecasts', 'Dynamic Climate UI'];
    performanceBadge = 'Smart Location Caching';
  } else if (allText.includes('news') || allText.includes('article') || allText.includes('blog') || allText.includes('feed')) {
    genre = 'Curated Digital Journal & News';
    categoryBadge = 'Editorial Reader';
    badgeIcon = Newspaper;
    architecturePattern = 'Offline-First Repository Pattern';
    coreHighlights = ['Bilingual RTL Support', 'In-App WebView Mode', 'Adaptive Feed Pagination'];
    performanceBadge = 'Offline Cached Articles';
  } else if (allText.includes('quiz') || allText.includes('learn') || allText.includes('card') || allText.includes('flashcard') || allText.includes('study') || allText.includes('edu')) {
    genre = 'Gamified Education & Learning';
    categoryBadge = 'Cognitive Engine';
    badgeIcon = BookOpen;
    architecturePattern = 'Spaced Repetition Algorithm • Local DB';
    coreHighlights = ['Interactive Deck Engine', 'Native Audio Drill Engine', 'Progress Analytics'];
    performanceBadge = 'Zero-Latency Offline CRUD';
  } else if (allText.includes('game') || allText.includes('sport') || allText.includes('score') || allText.includes('ball')) {
    genre = 'Interactive Sports & Game Tracking';
    categoryBadge = 'Match Engine';
    badgeIcon = Trophy;
    architecturePattern = 'High-Speed State Machine • Dual Views';
    coreHighlights = ['Real-Time Score Clock', 'Period State Machine', 'Haptic Touch Modifiers'];
    performanceBadge = '60 FPS Motion Controls';
  } else if (allText.includes('music') || allText.includes('audio') || allText.includes('sound') || allText.includes('tune') || allText.includes('piano')) {
    genre = 'Digital Audio Synthesizer & Music';
    categoryBadge = 'Low-Latency Sound Engine';
    badgeIcon = Music;
    architecturePattern = 'DSP Audio Engine • Reactive Keybed';
    coreHighlights = ['Polyphonic Sound Engine', 'Low-Latency Buffering', 'Reactive Neon UI'];
    performanceBadge = 'Under 10ms Latency';
  } else if (allText.includes('note') || allText.includes('task') || allText.includes('todo') || allText.includes('keep') || allText.includes('list')) {
    genre = 'Productivity & Offline Task Engine';
    categoryBadge = 'Local Persistence';
    badgeIcon = FileText;
    architecturePattern = 'Clean Architecture • Repository Pattern';
    coreHighlights = ['Encrypted Local Storage', 'Instant Search Indexing', 'Tag Grouping System'];
    performanceBadge = 'Instant Instant I/O';
  } else if (allText.includes('quote') || allText.includes('wisdom') || allText.includes('saying')) {
    genre = 'Typography & Curated Quotes';
    categoryBadge = 'Public REST API';
    badgeIcon = Quote;
    architecturePattern = 'RESTful Client • Responsive Typography';
    coreHighlights = ['Curated Quote Feeds', 'One-Tap Social Sharing', 'Dynamic Typography'];
    performanceBadge = 'Instant Asynchronous Fetch';
  } else if (allText.includes('tool') || allText.includes('util') || allText.includes('devkit') || allText.includes('cli')) {
    genre = 'Developer Toolkit & System Utilities';
    categoryBadge = 'Developer Tooling';
    badgeIcon = Terminal;
    architecturePattern = 'Modular Architecture • Clean Separation';
    coreHighlights = ['Automated Pipelines', 'Optimized I/O Streams', 'Strict Type Guarantees'];
    performanceBadge = 'Benchmarked Throughput';
  } else {
    // General mobile architectural fallback
    genre = `${language || 'Cross-Platform'} Mobile Architecture`;
    categoryBadge = `${language || 'Production'} System`;
    badgeIcon = Layers;
    architecturePattern = 'Clean Architecture • SOLID Principles';
    coreHighlights = ['State Machine Lifecycle', 'Decoupled HTTP Layer', 'Component Modularity'];
    performanceBadge = 'Production Ready';
  }

  // Synthesize clean concise tagline from description or title
  const cleanDescription = (description || '').trim();
  const tagline = cleanDescription.length > 10 && cleanDescription.length < 80
    ? cleanDescription
    : `Production-ready ${formattedTitle} application built with modern architecture standards.`;

  // Generate unique stable harmonious color palette
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

/**
 * Validates whether a candidate image is strictly a cover image in the screenshots directory:
 * e.g. "screenshots/cover.png", "screenshots/cover.jpg", "screenshots/cover.webp"
 */
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
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [isSelfHovered, setIsSelfHovered] = useState<boolean>(false);
  const isHovered = Boolean(isCardHovered || isSelfHovered);

  // Candidate images (max 3 images: Artwork Cover + up to 2 screenshots)
  const candidateUrls = useMemo(() => {
    const list = [
      coverUrl && isStrictScreenshotsCoverUrl(coverUrl) ? coverUrl : null,
      `https://raw.githubusercontent.com/ahmed-el-bialy/${repoName}/main/screenshots/cover.png`,
      `https://raw.githubusercontent.com/ahmed-el-bialy/${repoName}/main/screenshots/screen_1.png`,
    ].filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [repoName, coverUrl]);

  // Preload and verify available images (max 3)
  useEffect(() => {
    let isCancelled = false;
    Promise.all(
      candidateUrls.map(
        (url) =>
          new Promise<string | null>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => resolve(null);
            img.src = url;
          })
      )
    ).then((results) => {
      if (!isCancelled) {
        const valid = results.filter(Boolean) as string[];
        setAvailableImages(valid.slice(0, 2)); // up to 2 real screenshot images + 1 standard artwork = 3 max
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [candidateUrls]);

  // Total slides count: 1 (Standard Artwork) + availableImages.length (up to 2 screenshots) = max 3 slides
  const totalSlides = 1 + availableImages.length;

  // Auto-play rotation with Hover Pause & Smooth Fade
  useEffect(() => {
    if (totalSlides <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    }, 3200);

    return () => clearInterval(timer);
  }, [totalSlides, isHovered]);

  // Dynamically synthesize a custom, unique blueprint for each project automatically
  const blueprint: ProjectBlueprintSpec = useMemo(() => {
    return synthesizeProjectBlueprint(repoName, language, description, topics);
  }, [repoName, language, description, topics]);

  const BadgeIcon = blueprint.badgeIcon;

  return (
    <div
      className="relative w-full aspect-[16/9.5] sm:aspect-[16/9] bg-slate-50 dark:bg-[#070810] overflow-hidden select-none cursor-pointer border-b border-slate-200/90 dark:border-white/10 group/cover shadow-none dark:shadow-[inset_0_-12px_24px_rgba(0,0,0,0.4)] transition-all duration-300"
      onMouseEnter={() => setIsSelfHovered(true)}
      onMouseLeave={() => setIsSelfHovered(false)}
      onClick={(e) => {
        if (totalSlides > 1) {
          e.stopPropagation();
          setActiveSlide((prev) => (prev + 1) % totalSlides);
        }
      }}
      title={`${blueprint.appTitle} - Slide ${activeSlide + 1} of ${totalSlides} (Click to cycle)`}
    >
      <AnimatePresence mode="wait">
        {/* SLIDE 0: Standard Designer Artwork */}
        {activeSlide === 0 && (
          <motion.div
            key="slide-standard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="absolute inset-0 flex flex-col justify-between z-10"
          >
            {/* 1.1 Dynamic Generative Light Theme Background */}
            <div
              className="absolute inset-0 pointer-events-none opacity-100 dark:opacity-0 transition-opacity duration-300"
              style={{
                background: `radial-gradient(ellipse 75% 60% at 50% 15%, rgba(${blueprint.glowRgb}, 0.08) 0%, transparent 60%), linear-gradient(130deg, rgba(${blueprint.glowRgb}, 0.05) 0%, #ffffff 45%, #f8fafc 100%)`,
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(ellipse 80% 65% at 50% 12%, rgba(${blueprint.glowRgb}, 0.11) 0%, transparent 65%), linear-gradient(130deg, rgba(${blueprint.glowRgb}, 0.08) 0%, #090b16 40%, #04050a 100%)`,
              }}
            />

            {/* Precision Studio Dot Matrix Overlay */}
            <div
              className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08] text-slate-800 dark:text-cyan-400 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                backgroundSize: '18px 18px',
              }}
            />

            {/* Top Header Bar: Category Badge & Platform Tag */}
            <div className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-5 pt-3.5 sm:pt-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: blueprint.accentColor }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: blueprint.accentColor }}
                  />
                </span>

                <span
                  className="text-[11px] font-bold tracking-wide px-3 py-1 rounded-full border shadow-xs truncate backdrop-blur-md"
                  style={{
                    backgroundColor: `rgba(${blueprint.glowRgb}, 0.14)`,
                    borderColor: `rgba(${blueprint.glowRgb}, 0.4)`,
                    color: blueprint.accentColor,
                  }}
                >
                  {blueprint.categoryBadge}
                </span>
              </div>

              {/* Latest Updates / Live Badge */}
              <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-700 dark:text-cyan-300 backdrop-blur-md shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-mono font-bold tracking-wider">
                  Latest Update
                </span>
              </div>
            </div>

            {/* Centerpiece: App Brand Emblem + Typography */}
            <div className="relative z-10 px-4 sm:px-5 my-auto flex items-center gap-3.5 sm:gap-4.5">
              <div
                className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-[2px] shadow-lg dark:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${blueprint.accentColor}, ${blueprint.secondaryAccent}, rgba(255,255,255,0.4))`,
                }}
              >
                <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#0a0c16] flex items-center justify-center relative overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-inner">
                  <BadgeIcon size={28} className="relative z-10 drop-shadow-lg" style={{ color: blueprint.accentColor }} />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {blueprint.appTitle}
                </h3>
                <p className="text-xs font-bold truncate mt-0.5 tracking-tight" style={{ color: blueprint.accentColor }}>
                  {blueprint.genre}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300/95 line-clamp-1 mt-0.5 font-medium">
                  {blueprint.tagline}
                </p>
              </div>
            </div>

            {/* Bottom Shelf */}
            <div className="relative z-10 px-4 sm:px-5 py-3 bg-slate-100/90 dark:bg-[#04050a]/90 backdrop-blur-md border-t border-slate-200/90 dark:border-white/10 flex items-center justify-between text-[11px]">
              <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                {blueprint.architecturePattern}
              </span>
              <span className="font-bold text-[11px]" style={{ color: blueprint.accentColor }}>
                {blueprint.performanceBadge}
              </span>
            </div>
          </motion.div>
        )}

        {/* SLIDE 1 & 2: Real Screenshots Carousel */}
        {activeSlide >= 1 && availableImages[activeSlide - 1] && (
          <motion.div
            key={`slide-screenshot-${activeSlide}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="absolute inset-0 bg-slate-900 z-20"
          >
            <img
              src={availableImages[activeSlide - 1]}
              alt={`${repoName} screenshot ${activeSlide}`}
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            <div className="absolute top-3 start-3 z-30 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] font-bold">
              Screenshot #{activeSlide}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination Indicators (Dots) */}
      {totalSlides > 1 && (
        <div className="absolute bottom-2.5 inset-x-0 z-30 flex items-center justify-center gap-1.5 pointer-events-none">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeSlide === idx
                  ? 'w-4 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]'
                  : 'w-1.5 bg-white/50 dark:bg-white/25'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
