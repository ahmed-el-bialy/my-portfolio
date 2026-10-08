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
}) => {
  // Candidate screenshot cover url: strictly screenshots/cover.*
  const targetCoverUrl =
    isStrictScreenshotsCoverUrl(coverUrl)
      ? coverUrl!
      : `https://raw.githubusercontent.com/ahmed-el-bialy/${repoName}/main/screenshots/cover.png`;

  // Image availability state: only true if candidate loads successfully
  const [hasRealCover, setHasRealCover] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'standard' | 'screenshot'>('standard');

  // Verify whether the candidate screenshots/cover exists by pre-loading it
  useEffect(() => {
    let isCancelled = false;
    const testImg = new Image();

    testImg.onload = () => {
      if (!isCancelled) {
        setHasRealCover(true);
      }
    };

    testImg.onerror = () => {
      if (!isCancelled) {
        setHasRealCover(false);
        setActiveView('standard');
      }
    };

    testImg.src = targetCoverUrl;

    return () => {
      isCancelled = true;
    };
  }, [targetCoverUrl]);

  // Snappy auto-rotation between Standard Cover and Real Screenshot ONLY when real cover exists
  useEffect(() => {
    if (!hasRealCover) {
      setActiveView('standard');
      return;
    }

    const timer = setInterval(() => {
      setActiveView((prev) => (prev === 'standard' ? 'screenshot' : 'standard'));
    }, 2800);

    return () => clearInterval(timer);
  }, [hasRealCover]);

  // Dynamically synthesize a custom, unique blueprint for each and every project automatically
  const blueprint: ProjectBlueprintSpec = useMemo(() => {
    return synthesizeProjectBlueprint(repoName, language, description, topics);
  }, [repoName, language, description, topics]);

  const BadgeIcon = blueprint.badgeIcon;
  const isShowingScreenshot = activeView === 'screenshot' && hasRealCover;

  return (
    <div
      className="relative w-full aspect-[16/9.5] sm:aspect-[16/9] bg-[#080911] overflow-hidden select-none cursor-pointer border-b border-slate-900/40 dark:border-white/10 group/cover shadow-[inset_0_-10px_20px_rgba(0,0,0,0.35)]"
      onClick={(e) => {
        if (hasRealCover) {
          e.stopPropagation();
          setActiveView((prev) => (prev === 'standard' ? 'screenshot' : 'standard'));
        }
      }}
      title={
        hasRealCover
          ? 'Switches between Designed Standard Cover and Real Screenshot. Click to toggle.'
          : `${blueprint.appTitle} Production App Artwork`
      }
    >
      {/* ========================================================
          LAYER 1: AUTOMATIC CUSTOM STANDARD COVER (الغلاف الاستاندرد المخصص أوتوماتيكياً)
          Professional, Unique, Eye-Comfortable Studio Canvas
          ======================================================== */}
      <div
        className={`absolute inset-0 bg-[#080911] flex flex-col justify-between transition-all duration-200 ease-out ${
          !isShowingScreenshot
            ? 'opacity-100 z-10 scale-100'
            : 'opacity-0 z-0 scale-95 pointer-events-none'
        }`}
      >
        {/* 1. Ambient Background Atmosphere (Eye-Comfortable & Distinct) */}
        {/* Geometric Micro-Dot Grid */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: '22px 22px',
          }}
        />

        {/* Ambient Brand Color Radial Spotlights */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-20 transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${blueprint.accentColor} 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none blur-3xl opacity-15 transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${blueprint.secondaryAccent} 0%, transparent 70%)`,
          }}
        />

        {/* 2. Top Header Bar: Clean Category Badge & Platform Micro-Tag */}
        <div className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-5 pt-3.5 sm:pt-4">
          {/* Left Category Indicator */}
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
              className="text-[11px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full border shadow-xs truncate backdrop-blur-md"
              style={{
                backgroundColor: `rgba(${blueprint.glowRgb}, 0.12)`,
                borderColor: `rgba(${blueprint.glowRgb}, 0.3)`,
                color: blueprint.accentColor,
              }}
            >
              {blueprint.categoryBadge}
            </span>
          </div>

          {/* Right Platform Micro-Tag */}
          <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 backdrop-blur-md">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: blueprint.accentColor }}
            />
            <span className="text-[10px] font-mono font-medium text-slate-300 tracking-wider">
              {language || 'Flutter • Dart'}
            </span>
          </div>
        </div>

        {/* 3. Centerpiece: Brand Icon Emblem + App Identity Hero */}
        <div className="relative z-10 px-4 sm:px-5 my-auto flex items-center gap-3.5 sm:gap-4.5">
          {/* App Brand Icon Box */}
          <div
            className="relative shrink-0 w-13 h-13 sm:w-15 sm:h-15 rounded-2xl p-[1.5px] transition-transform duration-300 group-hover/cover:scale-105 shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${blueprint.accentColor}, rgba(255,255,255,0.15))`,
              boxShadow: `0 8px 24px -4px rgba(${blueprint.glowRgb}, 0.35)`,
            }}
          >
            <div className="w-full h-full rounded-[14px] bg-[#0b0d17] flex items-center justify-center relative overflow-hidden">
              {/* Inner ambient glow */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${blueprint.accentColor}, transparent 70%)`,
                }}
              />
              <BadgeIcon
                size={26}
                className="relative z-10 transition-transform duration-300 group-hover/cover:scale-110 drop-shadow-md"
                style={{ color: blueprint.accentColor }}
              />
            </div>
          </div>

          {/* App Title & Identity Description */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight truncate group-hover/cover:text-cyan-300 transition-colors">
                {blueprint.appTitle}
              </h3>
            </div>

            <p
              className="text-xs font-semibold truncate mt-0.5 tracking-tight"
              style={{ color: blueprint.accentColor }}
            >
              {blueprint.genre}
            </p>

            <p className="text-[11px] text-slate-300/90 line-clamp-1 mt-0.5 leading-tight font-medium">
              {blueprint.tagline}
            </p>

            {/* Micro Feature Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {blueprint.coreHighlights.slice(0, 3).map((feat, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] text-slate-200 font-medium font-mono tracking-tight"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Bottom Shelf: Architectural Bar & Highlight Metric */}
        {/* Crisp separation from the card body below */}
        <div className="relative z-10 px-4 sm:px-5 py-2.5 bg-black/60 backdrop-blur-md border-t border-white/10 flex items-center justify-between text-[11px] gap-2">
          <div className="flex items-center gap-1.5 min-w-0 text-slate-300">
            <Layers size={12} className="shrink-0 text-slate-400" />
            <span className="font-mono text-[10px] sm:text-[11px] truncate text-slate-300">
              {blueprint.architecturePattern}
            </span>
          </div>

          <div
            className="flex items-center gap-1 shrink-0 font-medium text-[11px]"
            style={{ color: blueprint.accentColor }}
          >
            <Zap size={11} className="shrink-0" />
            <span className="truncate">{blueprint.performanceBadge}</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          LAYER 2: REAL SCREENSHOT COVER (If available in screenshots/cover.*)
          ======================================================== */}
      {hasRealCover && (
        <div
          className={`absolute inset-0 bg-[#080911] transition-all duration-200 ease-out ${
            isShowingScreenshot
              ? 'opacity-100 z-20 scale-100 pointer-events-auto'
              : 'opacity-0 z-0 scale-105 pointer-events-none'
          }`}
        >
          <img
            src={targetCoverUrl}
            alt={`${repoName} Screenshots Cover`}
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-center group-hover/cover:scale-[1.02] transition-transform duration-500 ease-out"
          />

          {/* Subtle bottom gradient overlay to cleanly ground the image */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </div>
      )}

      {/* ========================================================
          COVER SWITCHER PILL (Shown ONLY when both covers exist)
          ======================================================== */}
      {hasRealCover && (
        <div
          className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 p-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 shadow-xl transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setActiveView((prev) => (prev === 'standard' ? 'screenshot' : 'standard'));
          }}
          title="Click to toggle between Standard Design and Real Screenshot Cover"
        >
          <button
            type="button"
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
              activeView === 'standard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette size={10} />
            <span>Design</span>
          </button>
          <button
            type="button"
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
              activeView === 'screenshot'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon size={10} />
            <span>Cover</span>
          </button>
        </div>
      )}
    </div>
  );
};
