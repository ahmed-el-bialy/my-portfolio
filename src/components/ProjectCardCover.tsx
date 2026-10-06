import React, { useState, useEffect } from 'react';
import { Smartphone, Layers, Cpu, Zap, Sparkles, Film, ShoppingBag, CloudSun, Newspaper, MessageSquare, BookOpen, Trophy } from 'lucide-react';
import { getLanguageColor } from '../services/githubService';

interface ProjectCardCoverProps {
  repoName: string;
  language: string | null;
  coverUrl?: string;
  isHighlight?: boolean;
}

interface ProjectBlueprintSpec {
  categoryBadge: string;
  badgeIcon: React.FC<{ size?: number; className?: string }>;
  tagline: string;
  architecturePattern: string;
  corePills: string[];
  performanceHighlight: string;
  accentColor: string;
}

// Clean, calm, professional project specifications
const PROJECT_BLUEPRINTS: Record<string, ProjectBlueprintSpec> = {
  'revio': {
    categoryBadge: 'Published on Google Play',
    badgeIcon: Sparkles,
    tagline: 'Interactive Flashcard & Active Recall App',
    architecturePattern: 'Clean Architecture (Domain • Data • Presentation)',
    corePills: ['Cubit State Management', 'Hive CE Offline NoSQL', '3D Flip Engine'],
    performanceHighlight: 'Zero-Latency Offline CRUD',
    accentColor: '#10B981', // Emerald
  },
  'movura': {
    categoryBadge: 'Media Discovery Engine',
    badgeIcon: Film,
    tagline: 'Movie & TV Series Tracking with TMDB API',
    architecturePattern: 'BLoC Pattern • Reactive Event Streams',
    corePills: ['TMDB v3 API Client', 'YouTube Player Hub', 'Sliver Parallax UI'],
    performanceHighlight: 'Real-Time Debounced Media Search',
    accentColor: '#F59E0B', // Amber
  },
  'vibrant-store': {
    categoryBadge: 'E-Commerce Platform',
    badgeIcon: ShoppingBag,
    tagline: 'Modern Mobile Shopping & Dynamic Catalog',
    architecturePattern: 'Service Layer Pattern • Decoupled Network',
    corePills: ['DummyJSON REST API', 'Category Chip Filters', 'Cart & Wishlist'],
    performanceHighlight: 'Persistent Cart & Product Ratings',
    accentColor: '#EC4899', // Pink
  },
  'sky-cast': {
    categoryBadge: 'Meteorological Radar',
    badgeIcon: CloudSun,
    tagline: 'Weather Forecast & Condition-Adaptive UI',
    architecturePattern: 'Clean Architecture • WeatherAPI.com',
    corePills: ['Dynamic Weather Palettes', 'City SearchDelegate', 'Multi-Day Forecast'],
    performanceHighlight: 'Adaptive Real-Time Themes',
    accentColor: '#06B6D4', // Cyan
  },
  'news-cloud': {
    categoryBadge: 'Bilingual News Reader',
    badgeIcon: Newspaper,
    tagline: 'Real-Time News Aggregator & In-App Browser',
    architecturePattern: 'Repository Pattern • Retrofit Client',
    corePills: ['Full Arabic RTL Support', 'In-App WebView Browser', 'Category Feeds'],
    performanceHighlight: 'Type-Safe HTTP Client',
    accentColor: '#3B82F6', // Blue
  },
  'shaats': {
    categoryBadge: 'Real-Time Messaging',
    badgeIcon: MessageSquare,
    tagline: 'Instant Chat Powered by Cloud Firestore',
    architecturePattern: 'Firebase Reactive Streams • Auth Lifecycle',
    corePills: ['Cloud Firestore Streams', 'Firebase Authentication', 'Dynamic Chat Bubbles'],
    performanceHighlight: 'Sub-Second Cloud Synchronization',
    accentColor: '#8B5CF6', // Purple
  },
  'nihon-seed': {
    categoryBadge: 'EdTech Language Learning',
    badgeIcon: BookOpen,
    tagline: 'Interactive Japanese Kana Learning Drills',
    architecturePattern: 'Audio Player Engine • Gamified Drills',
    corePills: ['Hiragana & Katakana Cards', 'Audio Pronunciation', 'Vocabulary Drills'],
    performanceHighlight: 'Native Audio Playback',
    accentColor: '#EF4444', // Red
  },
  'nbn-basketball': {
    categoryBadge: 'Sports Courtside Scoreboard',
    badgeIcon: Trophy,
    tagline: 'Real-Time Score & Match Tracking App',
    architecturePattern: 'Clean State Machine • Dual Orientation',
    corePills: ['Dual-Team Score Tracker', 'Countdown Period Timer', 'Foul & Timeout Radar'],
    performanceHighlight: 'Instant 1/2/3 Pt Modifiers',
    accentColor: '#F97316', // Orange
  },
};

export const ProjectCardCover: React.FC<ProjectCardCoverProps> = ({
  repoName,
  language,
  coverUrl,
}) => {
  const [imgFailed, setImgFailed] = useState<boolean>(false);
  // viewMode: 'cover' (screenshot) | 'tech' (calm technical architecture blueprint)
  const [viewMode, setViewMode] = useState<'cover' | 'tech'>('cover');

  const targetUrl = coverUrl || `https://raw.githubusercontent.com/ahmed-el-bialy/${repoName}/main/screenshots/cover.png`;
  const langColor = getLanguageColor(language);

  // Normalize key for lookup
  const cleanKey = repoName.toLowerCase().replace(/[-_\s]/g, '');
  const matchedBlueprint = Object.entries(PROJECT_BLUEPRINTS).find(
    ([key]) => key.replace(/[-_\s]/g, '') === cleanKey
  )?.[1];

  // Dynamic calm fallback for any repository
  const blueprint: ProjectBlueprintSpec = matchedBlueprint || {
    categoryBadge: `${language || 'Dart'} Application`,
    badgeIcon: Smartphone,
    tagline: 'Production-Ready Cross-Platform Mobile Codebase',
    architecturePattern: 'Clean Architecture • Modular State Management',
    corePills: [`${language || 'Dart'} Ecosystem`, 'Repository Pattern', 'SOLID Standards'],
    performanceHighlight: 'Scalable Component Hierarchy',
    accentColor: langColor || '#00B4AB',
  };

  const BadgeIcon = blueprint.badgeIcon;

  // Calm, relaxed transition speed: 3000ms (3s)
  useEffect(() => {
    if (imgFailed) {
      setViewMode('tech');
      return;
    }

    const interval = setInterval(() => {
      setViewMode((prev) => (prev === 'cover' ? 'tech' : 'cover'));
    }, 3000);

    return () => clearInterval(interval);
  }, [imgFailed]);

  const isCoverActive = viewMode === 'cover' && !imgFailed;

  return (
    <div
      className="relative w-full aspect-[16/9] bg-[#0c0e18] overflow-hidden select-none cursor-pointer border-b border-slate-200 dark:border-white/10 group/cover"
      onClick={(e) => {
        if (!imgFailed) {
          e.stopPropagation();
          setViewMode((prev) => (prev === 'cover' ? 'tech' : 'cover'));
        }
      }}
      title="Switches automatically between App Preview and Architecture Specs. Click to flip."
    >
      {/* ========================================================
          LAYER 1: CALM, SLEEK & PROFESSIONAL BLUEPRINT VIEW
          ======================================================== */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-[#0c0e1a] via-[#101322] to-[#0a0c16] flex flex-col justify-between p-4 sm:p-5 text-white transition-all duration-300 ease-in-out ${
          !isCoverActive
            ? 'opacity-100 z-10 scale-100'
            : 'opacity-0 z-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Soft, calm ambient radial sheen */}
        <div
          className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-20 pointer-events-none blur-3xl transition-colors duration-500"
          style={{
            background: `radial-gradient(circle, ${blueprint.accentColor} 0%, transparent 70%)`,
          }}
        />

        {/* 1. Header: Calm Badge & Category */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: blueprint.accentColor }}
            />
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full border truncate"
              style={{
                backgroundColor: `${blueprint.accentColor}12`,
                borderColor: `${blueprint.accentColor}30`,
                color: blueprint.accentColor,
              }}
            >
              {blueprint.categoryBadge}
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-400 shrink-0">
            Flutter & Dart
          </span>
        </div>

        {/* 2. Middle: Project Name, Tagline & 3 Clean Core Pills */}
        <div className="relative z-10 my-auto py-1 space-y-2">
          <div>
            <h4 className="text-base sm:text-lg font-bold tracking-tight text-white group-hover/cover:text-cyan-300 transition-colors truncate">
              {repoName}
            </h4>
            <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
              {blueprint.tagline}
            </p>
          </div>

          {/* Clean, calm architectural pills */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {blueprint.corePills.map((pill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-200 font-medium tracking-tight"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Footer: Architectural Standard & Key Highlight */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
          <span className="truncate mr-2 font-medium text-slate-300">
            {blueprint.architecturePattern}
          </span>
          <span className="shrink-0 font-medium text-emerald-400 flex items-center gap-1">
            <Zap size={12} />
            <span>{blueprint.performanceHighlight}</span>
          </span>
        </div>
      </div>

      {/* ========================================================
          LAYER 2: PRISTINE APP COVER PREVIEW
          ======================================================== */}
      {!imgFailed && (
        <div
          className={`absolute inset-0 bg-[#0c0e18] transition-all duration-300 ease-in-out ${
            isCoverActive
              ? 'opacity-100 z-20 scale-100 pointer-events-auto'
              : 'opacity-0 z-0 scale-105 pointer-events-none'
          }`}
        >
          <img
            src={targetUrl}
            alt={`${repoName} Cover Preview`}
            loading="eager"
            decoding="async"
            onError={() => {
              setImgFailed(true);
              setViewMode('tech');
            }}
            className="w-full h-full object-cover object-center group-hover/cover:scale-[1.02] transition-transform duration-500 ease-out"
          />
        </div>
      )}

      {/* 2-dot mode indicator at bottom right */}
      {!imgFailed && (
        <div className="absolute bottom-2.5 right-3 z-30 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 pointer-events-none shadow-md">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
              isCoverActive ? 'bg-cyan-400 scale-125 ring-2 ring-cyan-400/40' : 'bg-white/40'
            }`}
            title="App Preview"
          />
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
              !isCoverActive ? 'bg-blue-400 scale-125 ring-2 ring-blue-400/40' : 'bg-white/40'
            }`}
            title="Architecture Specs"
          />
        </div>
      )}
    </div>
  );
};
