import React, { useState, useEffect } from 'react';
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
  ExternalLink,
} from 'lucide-react';
import { getLanguageColor } from '../services/githubService';

interface ProjectCardCoverProps {
  repoName: string;
  language: string | null;
  coverUrl?: string;
  isHighlight?: boolean;
}

interface ProjectBlueprintSpec {
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
const PROJECT_BLUEPRINTS: Record<string, ProjectBlueprintSpec> = {
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

  // Gentle auto-rotation between Standard Cover and Real Screenshot ONLY when real cover exists
  useEffect(() => {
    if (!hasRealCover) {
      setActiveView('standard');
      return;
    }

    const timer = setInterval(() => {
      setActiveView((prev) => (prev === 'standard' ? 'screenshot' : 'standard'));
    }, 4000);

    return () => clearInterval(timer);
  }, [hasRealCover]);

  // Resolve project blueprint
  const cleanKey = repoName.toLowerCase().replace(/[-_\s]/g, '');
  const matchedBlueprint = Object.entries(PROJECT_BLUEPRINTS).find(
    ([key]) => key.replace(/[-_\s]/g, '') === cleanKey
  )?.[1];

  const langColor = getLanguageColor(language);

  // Dynamic calm fallback for any repository
  const blueprint: ProjectBlueprintSpec = matchedBlueprint || {
    appTitle: repoName,
    genre: `${language || 'Dart'} Mobile Architecture`,
    categoryBadge: `${language || 'Dart'} Repository`,
    badgeIcon: Smartphone,
    tagline: 'Clean Architecture Mobile Application Codebase',
    architecturePattern: 'Clean Architecture • Modular State Management',
    coreHighlights: [`${language || 'Dart'} Ecosystem`, 'Repository Pattern', 'SOLID Principles'],
    performanceBadge: 'Scalable Component Hierarchy',
    accentColor: langColor || '#00B4AB',
    secondaryAccent: '#0284C7',
    glowRgb: '0, 180, 171',
  };

  const BadgeIcon = blueprint.badgeIcon;
  const isShowingScreenshot = activeView === 'screenshot' && hasRealCover;

  return (
    <div
      className="relative w-full aspect-[16/9.5] sm:aspect-[16/9] bg-[#090a14] overflow-hidden select-none cursor-pointer border-b-2 border-slate-900/40 dark:border-white/10 group/cover shadow-[inset_0_-10px_20px_rgba(0,0,0,0.35)]"
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
          LAYER 1: REDESIGNED STANDARD COVER (الغلاف الاستاندرد)
          Professional, Unique, Eye-Comfortable Studio Canvas
          ======================================================== */}
      <div
        className={`absolute inset-0 bg-[#090b14] flex flex-col justify-between transition-all duration-500 ease-in-out ${
          !isShowingScreenshot
            ? 'opacity-100 z-10 scale-100'
            : 'opacity-0 z-0 scale-95 pointer-events-none'
        }`}
      >
        {/* 1. Ambient Background Atmosphere (Comfortable & Distinct) */}
        {/* Geometric Micro-Dot Grid */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient Brand Color Radial Spotlights */}
        <div
          className="absolute -top-16 -right-16 w-60 h-60 rounded-full pointer-events-none blur-3xl opacity-25 transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${blueprint.accentColor} 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full pointer-events-none blur-3xl opacity-15 transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${blueprint.secondaryAccent} 0%, transparent 70%)`,
          }}
        />

        {/* 2. Top Header Bar: Clean Category Badge & Tech Micro-Tag */}
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
                borderColor: `rgba(${blueprint.glowRgb}, 0.28)`,
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
            <div className="w-full h-full rounded-[14px] bg-[#0c0e18] flex items-center justify-center relative overflow-hidden">
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
        {/* This creates a crisp, clear separation from the card body below */}
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
          className={`absolute inset-0 bg-[#090b14] transition-all duration-500 ease-in-out ${
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
