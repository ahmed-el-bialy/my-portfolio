import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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
  Image as ImageIcon,
} from 'lucide-react';
import {
  getVerifiedProjectScreenshots,
  fetchRepoScreenshots,
  fetchRepoCoverImages,
  sanitizeDiscoveredScreenshots,
} from '../services/githubService';
import { ImageWithSkeleton, preloadImageUrls } from './ImageWithSkeleton';
import { useLanguage } from '../context/LanguageContext';

export interface ProjectCardCoverProps {
  repoName: string;
  language: string | null;
  coverUrl?: string;
  coverImages?: string[];
  discoveredScreenshots?: string[];
  isHighlight?: boolean;
  description?: string | null;
  topics?: string[];
  isCardHovered?: boolean;
  aspectClassName?: string;
  compactMode?: boolean;
  onActiveScreenChange?: (index: number) => void;
  onInspect?: () => void;
  inspectAriaLabel?: string;
  cursorLabel?: string;
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

function isStrictCoverAssetUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('/covers/') ||
    lower.includes('/screenshots/cover') ||
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
  coverImages,
  discoveredScreenshots,
  description,
  topics,
  isCardHovered = false,
  aspectClassName,
  compactMode = false,
  onActiveScreenChange,
  onInspect,
  inspectAriaLabel,
  cursorLabel,
}) => {
  const { dir, lang } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [selectedScreenIdx, setSelectedScreenIdx] = useState<number>(0);
  const [activeCoverIdx, setActiveCoverIdx] = useState<number>(0);
  const [autoDiscoveredCovers, setAutoDiscoveredCovers] = useState<string[]>([]);
  const [autoDiscoveredScreens, setAutoDiscoveredScreens] = useState<string[]>([]);
  const [isSelfHovered, setIsSelfHovered] = useState<boolean>(false);
  const [manualPausedUntil, setManualPausedUntil] = useState<number>(0);
  const [showingCoverArt, setShowingCoverArt] = useState<boolean>(() =>
    Boolean(
      (coverImages && coverImages.length > 0) ||
        isStrictCoverAssetUrl(coverUrl)
    )
  );
  const isHovered = Boolean(isCardHovered || isSelfHovered);

  const blueprint: ProjectBlueprintSpec = useMemo(
    () => synthesizeProjectBlueprint(repoName, language, description, topics),
    [repoName, language, description, topics]
  );

  const curatedScreens = useMemo(() => getVerifiedProjectScreenshots(repoName), [repoName]);
  const sanitizedDiscovered = useMemo(
    () => sanitizeDiscoveredScreenshots(discoveredScreenshots),
    [discoveredScreenshots]
  );

  // Automatic client-side fallback discovery for covers/ when not supplied by consolidated portfolio payload
  useEffect(() => {
    let isCancelled = false;
    if (coverImages && coverImages.length > 0) {
      setAutoDiscoveredCovers([]);
      return;
    }

    fetchRepoCoverImages(repoName)
      .then((urls) => {
        if (!isCancelled && Array.isArray(urls) && urls.length > 0) {
          setAutoDiscoveredCovers(urls);
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [repoName, coverImages]);

  // Automatic client-side fallback discovery for app screens
  useEffect(() => {
    let isCancelled = false;
    if (curatedScreens.length > 0 || sanitizedDiscovered.length > 0) {
      setAutoDiscoveredScreens([]);
      return;
    }

    fetchRepoScreenshots(repoName)
      .then((urls) => {
        const cleanUrls = sanitizeDiscoveredScreenshots(urls);
        if (!isCancelled && cleanUrls.length > 0) {
          setAutoDiscoveredScreens(cleanUrls);
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [repoName, curatedScreens.length, sanitizedDiscovered.length]);

  const resolvedCoverImages = useMemo(() => {
    const rawList: string[] = [];
    if (Array.isArray(coverImages)) {
      rawList.push(...coverImages);
    }
    if (autoDiscoveredCovers.length > 0) {
      rawList.push(...autoDiscoveredCovers);
    }
    if (coverUrl && isStrictCoverAssetUrl(coverUrl)) {
      rawList.push(coverUrl);
    } else if (repoName.toLowerCase() === 'revio' && rawList.length === 0) {
      rawList.push('https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/cover.png');
    }
    return Array.from(
      new Set(rawList.filter((u): u is string => typeof u === 'string' && u.trim().length > 0))
    );
  }, [coverImages, autoDiscoveredCovers, coverUrl, repoName]);

  const verifiedScreenshots = useMemo(() => {
    const coverSet = new Set(resolvedCoverImages);
    const filterNonCover = (list: string[]) =>
      list.filter((u) => !coverSet.has(u) && !isStrictCoverAssetUrl(u));

    if (curatedScreens.length > 0) return filterNonCover(curatedScreens).slice(0, 5);
    if (sanitizedDiscovered.length > 0) return filterNonCover(sanitizedDiscovered).slice(0, 5);
    if (autoDiscoveredScreens.length > 0) return filterNonCover(autoDiscoveredScreens).slice(0, 5);
    if (coverUrl && !isStrictCoverAssetUrl(coverUrl)) return [coverUrl];
    return [];
  }, [curatedScreens, sanitizedDiscovered, autoDiscoveredScreens, coverUrl, resolvedCoverImages]);

  const totalCovers = resolvedCoverImages.length;
  const totalScreens = verifiedScreenshots.length;

  // Preload both covers and primary screens so alternating transitions never flash blank
  useEffect(() => {
    const toPreload = [...resolvedCoverImages.slice(0, 4), ...verifiedScreenshots.slice(0, 4)];
    if (toPreload.length > 0) {
      preloadImageUrls(toPreload);
    }
  }, [resolvedCoverImages, verifiedScreenshots]);

  // Reset state cleanly on repo change
  useEffect(() => {
    setSelectedScreenIdx(0);
    setActiveCoverIdx(0);
    setManualPausedUntil(0);
    setShowingCoverArt(totalCovers > 0);
    onActiveScreenChange?.(0);
  }, [repoName]);

  // If async covers finish loading before any manual interaction, showcase natural cover first
  useEffect(() => {
    if (totalCovers > 0 && manualPausedUntil === 0 && !isHovered) {
      setShowingCoverArt(true);
    } else if (totalCovers === 0 && showingCoverArt) {
      setShowingCoverArt(false);
    }
  }, [totalCovers]);

  const [isManualPaused, setIsManualPaused] = useState(false);
  const manualPauseTimerRef = React.useRef<number | null>(null);

  const pauseAutoCycleTemporarily = () => {
    setManualPausedUntil(Date.now() + 10000);
    setIsManualPaused(true);
    if (manualPauseTimerRef.current !== null) {
      window.clearTimeout(manualPauseTimerRef.current);
    }
    manualPauseTimerRef.current = window.setTimeout(() => {
      setIsManualPaused(false);
      manualPauseTimerRef.current = null;
    }, 10000);
  };

  useEffect(() => {
    return () => {
      if (manualPauseTimerRef.current !== null) {
        window.clearTimeout(manualPauseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    onActiveScreenChange?.(selectedScreenIdx);
  }, [selectedScreenIdx, onActiveScreenChange]);

  const canAutoCycle =
    (totalCovers > 0 && totalScreens > 0) || totalCovers > 1 || totalScreens > 1;

  // Smooth automatic alternation (6s balanced pace) between Covers and App Screens
  useEffect(() => {
    if (isHovered || shouldReduceMotion || isManualPaused) return;
    if (!canAutoCycle) return;

    const timer = window.setInterval(() => {
      if (totalCovers > 0 && totalScreens > 0) {
        if (showingCoverArt) {
          if (activeCoverIdx + 1 < totalCovers) {
            setActiveCoverIdx((prev) => prev + 1);
          } else {
            setShowingCoverArt(false);
            setSelectedScreenIdx(0);
          }
        } else {
          // Show up to 2 app screens per turn, then smoothly glide back to Cover
          const maxScreensPerCycle = Math.min(totalScreens, 2);
          if (selectedScreenIdx + 1 < maxScreensPerCycle) {
            setSelectedScreenIdx((prev) => prev + 1);
          } else {
            setShowingCoverArt(true);
            setActiveCoverIdx(0);
          }
        }
      } else if (showingCoverArt && totalCovers > 1) {
        setActiveCoverIdx((prev) => (prev + 1) % totalCovers);
      } else if (!showingCoverArt && totalScreens > 1) {
        setSelectedScreenIdx((prev) => (prev + 1) % totalScreens);
      }
    }, 6000);

    return () => window.clearInterval(timer);
  }, [
    isHovered,
    shouldReduceMotion,
    isManualPaused,
    canAutoCycle,
    totalCovers,
    totalScreens,
    showingCoverArt,
    activeCoverIdx,
    selectedScreenIdx,
  ]);

  const selectScreen = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowingCoverArt(false);
    setSelectedScreenIdx(idx);
    onActiveScreenChange?.(idx);
    pauseAutoCycleTemporarily();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalScreens <= 1) return;
    setShowingCoverArt(false);
    const nextIdx = (selectedScreenIdx + 1) % totalScreens;
    setSelectedScreenIdx(nextIdx);
    onActiveScreenChange?.(nextIdx);
    pauseAutoCycleTemporarily();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalScreens <= 1) return;
    setShowingCoverArt(false);
    const prevIdx = (selectedScreenIdx - 1 + totalScreens) % totalScreens;
    setSelectedScreenIdx(prevIdx);
    onActiveScreenChange?.(prevIdx);
    pauseAutoCycleTemporarily();
  };

  const handleNextCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalCovers <= 1) return;
    setShowingCoverArt(true);
    setActiveCoverIdx((prev) => (prev + 1) % totalCovers);
    pauseAutoCycleTemporarily();
  };

  const handlePrevCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalCovers <= 1) return;
    setShowingCoverArt(true);
    setActiveCoverIdx((prev) => (prev - 1 + totalCovers) % totalCovers);
    pauseAutoCycleTemporarily();
  };

  const handleToggleMode = (toCover: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowingCoverArt(toCover);
    pauseAutoCycleTemporarily();
  };

  const BadgeIcon = blueprint.badgeIcon;
  const activeCoverUrl =
    totalCovers > 0 ? resolvedCoverImages[activeCoverIdx % totalCovers] : undefined;
  const activeScreenUrl = verifiedScreenshots[selectedScreenIdx] || verifiedScreenshots[0];
  const containerHeightClass = aspectClassName || 'aspect-[4/3]';
  const hasBothModes = totalCovers > 0 && totalScreens > 0;
  const isShowingCoverMode = Boolean(showingCoverArt && activeCoverUrl);
  const showProgressBar =
    canAutoCycle && !isHovered && !shouldReduceMotion && !isManualPaused;

  const stageTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.58, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

  const activeStageKey = isShowingCoverMode
    ? `cover-${activeCoverUrl}`
    : activeScreenUrl
    ? `screens-${selectedScreenIdx}`
    : 'fallback';

  return (
    <div
      className={`relative w-full ${containerHeightClass} flex flex-col bg-slate-100 dark:bg-[#070a12] overflow-hidden select-none border-b border-slate-200/90 dark:border-white/10 group/cover transition-colors duration-300`}
      onMouseEnter={() => setIsSelfHovered(true)}
      onMouseLeave={() => setIsSelfHovered(false)}
      title={`${blueprint.appTitle} — ${blueprint.categoryBadge}`}
    >
      {/* Ambient Radial Illumination */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 70% at 38% 18%, rgba(${blueprint.glowRgb}, 0.16), transparent 72%)`,
        }}
      />

      {/* Full-card Stretched Semantic Button Trigger (sibling to internal controls — zero nested buttons) */}
      {onInspect && (
        <button
          type="button"
          onClick={onInspect}
          aria-label={inspectAriaLabel || `Inspect ${blueprint.appTitle}`}
          data-cursor-label={cursorLabel}
          className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0284ff]"
        />
      )}

      {/* Persistent Dual-Category Header Strip + 6s GPU Progress Hairline */}
      <div className="relative z-30 shrink-0 px-2.5 sm:px-3.5 py-2 bg-white/95 dark:bg-[#0b101c]/95 backdrop-blur-md border-b border-slate-200/85 dark:border-white/10 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md border border-slate-200 dark:border-white/12 bg-slate-50 dark:bg-[#111827] shrink-0">
            <BadgeIcon size={11} style={{ color: blueprint.accentColor }} />
          </span>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">
            {blueprint.appTitle}
          </span>
          <span className="hidden sm:inline text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">
            · {blueprint.categoryBadge}
          </span>
        </div>

        {/* Clear Dual Segmented Control: Cover | App Screens */}
        {hasBothModes ? (
          <div
            role="group"
            aria-label={lang === 'ar' ? 'تبديل نوع العرض' : 'Switch preview mode'}
            className="pointer-events-auto inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/90 dark:border-white/10 shrink-0"
          >
            <button
              type="button"
              onClick={(e) => handleToggleMode(true, e)}
              aria-pressed={isShowingCoverMode}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-semibold transition-all duration-200 cursor-pointer ${
                isShowingCoverMode
                  ? 'bg-[#0284ff] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ImageIcon size={10} />
              <span>{lang === 'ar' ? 'الغلاف' : 'Cover'}</span>
              {totalCovers > 1 && (
                <span className="opacity-80 font-mono text-[9.5px] tabular-nums">
                  {totalCovers}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => handleToggleMode(false, e)}
              aria-pressed={!isShowingCoverMode}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-semibold transition-all duration-200 cursor-pointer ${
                !isShowingCoverMode
                  ? 'bg-[#0284ff] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone size={10} />
              <span>{lang === 'ar' ? 'الشاشات' : 'Screens'}</span>
              {totalScreens > 1 && (
                <span className="opacity-80 font-mono text-[9.5px] tabular-nums">
                  {totalScreens}
                </span>
              )}
            </button>
          </div>
        ) : totalCovers > 0 ? (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 shrink-0">
            <ImageIcon size={10} className="text-[#0284ff] dark:text-[#38bdf8]" />
            <span>{lang === 'ar' ? 'الغلاف' : 'Cover'}</span>
            {totalCovers > 1 && (
              <span className="tabular-nums opacity-75">
                {String((activeCoverIdx % totalCovers) + 1).padStart(2, '0')}/
                {String(totalCovers).padStart(2, '0')}
              </span>
            )}
          </div>
        ) : totalScreens > 0 ? (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 shrink-0">
            <Smartphone size={10} className="text-[#0284ff] dark:text-[#38bdf8]" />
            <span>{lang === 'ar' ? 'الشاشات' : 'Screens'}</span>
            {totalScreens > 1 && (
              <span className="tabular-nums opacity-75">
                {String(selectedScreenIdx + 1).padStart(2, '0')}/
                {String(totalScreens).padStart(2, '0')}
              </span>
            )}
          </div>
        ) : null}

        {/* Calm 6-Second GPU Hairline Progress Bar */}
        {showProgressBar && (
          <motion.div
            key={`progress-${activeStageKey}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 6, ease: 'linear' }}
            style={{ transformOrigin: dir === 'rtl' ? 'right center' : 'left center' }}
            aria-hidden="true"
            className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#0284ff] via-[#38bdf8] to-[#0284ff] pointer-events-none"
          />
        )}
      </div>

      {/* Main Preview Viewport */}
      <div className="relative z-20 flex-1 min-h-0 w-full pointer-events-none">
        <AnimatePresence mode="wait" initial={false}>
          {isShowingCoverMode && activeCoverUrl ? (
            /* MODE 1: FULL-CONTAINED 4:3 COVER ARTWORK (Zero cropping across all screen sizes) */
            <motion.div
              key={activeStageKey}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
              transition={stageTransition}
              className="relative w-full h-full p-2.5 sm:p-3.5 bg-slate-100/90 dark:bg-[#090d16] flex items-center justify-center pointer-events-none"
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-white/80 dark:bg-[#0c111d] border border-slate-200/80 dark:border-white/8 shadow-xs flex items-center justify-center">
                <ImageWithSkeleton
                  src={activeCoverUrl}
                  alt={`${blueprint.appTitle} Cover`}
                  loading="eager"
                  className="w-full h-full object-contain object-center transition-transform duration-500 group-hover/cover:scale-[1.015]"
                />
              </div>

              {/* Multi-cover Prev / Next Arrows */}
              {totalCovers > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevCover}
                    aria-label={lang === 'ar' ? 'الغلاف السابق' : 'Previous cover'}
                    className="pointer-events-auto opacity-85 sm:opacity-0 group-hover/cover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 absolute start-3.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-slate-900/75 hover:bg-[#0284ff] text-white border border-white/15 flex items-center justify-center cursor-pointer shadow-md"
                  >
                    {dir === 'rtl' ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleNextCover}
                    aria-label={lang === 'ar' ? 'الغلاف التالي' : 'Next cover'}
                    className="pointer-events-auto opacity-85 sm:opacity-0 group-hover/cover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 absolute end-3.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-slate-900/75 hover:bg-[#0284ff] text-white border border-white/15 flex items-center justify-center cursor-pointer shadow-md"
                  >
                    {dir === 'rtl' ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                  </button>

                  {/* Discrete Bottom Counter Pill */}
                  <div className="pointer-events-auto absolute bottom-3.5 end-4 z-30 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-sm border border-white/15">
                    {resolvedCoverImages.slice(0, 5).map((_, cIdx) => {
                      const isActive = (activeCoverIdx % totalCovers) === cIdx;
                      return (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowingCoverArt(true);
                            setActiveCoverIdx(cIdx);
                            pauseAutoCycleTemporarily();
                          }}
                          aria-label={`Cover ${cIdx + 1}`}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            isActive ? 'w-4 bg-[#38bdf8]' : 'w-1.5 bg-white/45 hover:bg-white/75'
                          }`}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          ) : activeScreenUrl ? (
            /* MODE 2: ENLARGED HERO PHONE SCREEN + INTERACTIVE THUMBNAILS */
            <motion.div
              key="stage-app-screens"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
              transition={stageTransition}
              className="relative w-full h-full flex items-center p-2 sm:p-3 pointer-events-none"
            >
              <div className="w-full h-full min-h-0 grid grid-cols-12 gap-2 sm:gap-3 items-center">
                {/* Enlarged Hero Phone Chassis filling available height */}
                <div className="col-span-7 h-full min-h-0 flex items-center justify-center relative">
                  <div className="relative h-full max-h-[97%] aspect-[9/18.2] rounded-[20px] sm:rounded-[24px] p-1 sm:p-1.5 bg-[#0e1320] border-2 border-slate-300/90 dark:border-white/20 shadow-[0_18px_40px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover/cover:scale-[1.02]">
                    {/* Minimal Speaker Notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 w-9 h-1 rounded-full bg-slate-800/90 pointer-events-none" />

                    <div className="relative w-full h-full rounded-[15px] sm:rounded-[18px] overflow-hidden bg-[#0e1320] flex items-center justify-center">
                      <ImageWithSkeleton
                        src={activeScreenUrl}
                        alt={`${blueprint.appTitle} hero screen ${selectedScreenIdx + 1}`}
                        loading="eager"
                        variant="phone"
                        className="w-full h-full object-contain crisp-screenshot"
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
                        className="pointer-events-auto opacity-80 sm:opacity-0 group-hover/cover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 absolute start-0 sm:start-1 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-slate-900/80 hover:bg-[#0284ff] text-white border border-white/15 flex items-center justify-center cursor-pointer shadow-md"
                      >
                        {dir === 'rtl' ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Next app screen"
                        className="pointer-events-auto opacity-80 sm:opacity-0 group-hover/cover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 absolute end-0 sm:end-1 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-slate-900/80 hover:bg-[#0284ff] text-white border border-white/15 flex items-center justify-center cursor-pointer shadow-md"
                      >
                        {dir === 'rtl' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </>
                  )}
                </div>

                {/* Right Interactive Rail: Title + Architecture Snapshot + Selectable Screen Thumbnails */}
                <div className="col-span-5 h-full flex flex-col justify-center gap-1.5 sm:gap-2 min-w-0">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-[10.5px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 leading-snug">
                      {blueprint.tagline}
                    </p>
                  </div>

                  {!compactMode && (
                    <ul className="hidden sm:block space-y-1 text-[10px] text-slate-600 dark:text-slate-400">
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

                  {totalScreens > 1 ? (
                    <div className="space-y-1 pt-0.5">
                      <div className="text-[9.5px] font-mono font-semibold text-slate-500 dark:text-slate-400 truncate">
                        {lang === 'ar'
                          ? `شاشة ${String(selectedScreenIdx + 1).padStart(2, '0')}/${String(totalScreens).padStart(2, '0')}`
                          : `Screen ${String(selectedScreenIdx + 1).padStart(2, '0')}/${String(totalScreens).padStart(2, '0')}`}
                      </div>
                      <div
                        className="grid grid-cols-2 gap-1.5 pointer-events-auto"
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
                              className={`group/thumb relative h-14 sm:h-18 w-full rounded-xl overflow-hidden bg-[#0e1320] border-2 transition-all duration-200 cursor-pointer ${
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
                                className="w-full h-full object-contain crisp-screenshot"
                              />
                              <span
                                className={`absolute bottom-0.5 end-0.5 px-1 rounded text-[8.5px] font-mono font-bold ${
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
            </motion.div>
          ) : (
            /* MODE 3: ARCHITECTURAL FALLBACK CARD (When no screenshots or cover exist) */
            <motion.div
              key="stage-fallback"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={stageTransition}
              className="relative w-full h-full flex flex-col justify-between pointer-events-none"
            >
              <div className="relative z-10 flex items-center justify-between gap-2 px-4 sm:px-5 pt-3 text-[11px] font-medium">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
