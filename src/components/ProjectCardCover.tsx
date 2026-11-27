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
    lower.includes('/cover/') ||
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
  const [failedAssetUrls, setFailedAssetUrls] = useState<Record<string, true>>({});
  const [isSelfHovered, setIsSelfHovered] = useState<boolean>(false);
  const [manualPausedUntil, setManualPausedUntil] = useState<number>(0);
  const [showingCoverArt, setShowingCoverArt] = useState<boolean>(() =>
    Boolean(
      (coverImages && coverImages.length > 0) ||
        isStrictCoverAssetUrl(coverUrl)
    )
  );
  const isHovered = Boolean(isCardHovered || isSelfHovered);

  const markAssetFailed = (url?: string) => {
    if (!url) return;
    setFailedAssetUrls((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
  };

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

  // Automatic client-side live discovery for app screens whenever parent didn't pass live discoveredScreenshots
  useEffect(() => {
    let isCancelled = false;
    if (sanitizedDiscovered.length > 0) {
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
  }, [repoName, sanitizedDiscovered.length]);

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
      rawList.push('https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/covers/cover.png');
    }
    return Array.from(
      new Set(
        rawList.filter(
          (u): u is string => typeof u === 'string' && u.trim().length > 0 && !failedAssetUrls[u]
        )
      )
    );
  }, [coverImages, autoDiscoveredCovers, coverUrl, repoName, failedAssetUrls]);

  const verifiedScreenshots = useMemo(() => {
    const coverSet = new Set(resolvedCoverImages);
    const filterValidScreens = (list: string[]) =>
      list.filter((u) => !coverSet.has(u) && !isStrictCoverAssetUrl(u) && !failedAssetUrls[u]);

    if (sanitizedDiscovered.length > 0) {
      const live = filterValidScreens(sanitizedDiscovered);
      if (live.length > 0) return live;
    }
    if (autoDiscoveredScreens.length > 0) {
      const autoLive = filterValidScreens(autoDiscoveredScreens);
      if (autoLive.length > 0) return autoLive;
    }
    if (curatedScreens.length > 0) {
      const fallbackCurated = filterValidScreens(curatedScreens);
      if (fallbackCurated.length > 0) return fallbackCurated;
    }
    if (coverUrl && !isStrictCoverAssetUrl(coverUrl) && !failedAssetUrls[coverUrl]) return [coverUrl];
    return [];
  }, [curatedScreens, sanitizedDiscovered, autoDiscoveredScreens, coverUrl, resolvedCoverImages, failedAssetUrls]);

  const totalCovers = resolvedCoverImages.length;
  const totalScreens = verifiedScreenshots.length;

  const SCREEN_BATCH_SIZE = 4;
  const totalScreenBatches =
    totalScreens > 0 ? Math.ceil(totalScreens / SCREEN_BATCH_SIZE) : 0;
  const normalizedScreenIdxEarly =
    totalScreens > 0 ? selectedScreenIdx % totalScreens : 0;
  const activeBatchIdx =
    totalScreens > 0 ? Math.floor(normalizedScreenIdxEarly / SCREEN_BATCH_SIZE) : 0;
  const batchStartIdx = activeBatchIdx * SCREEN_BATCH_SIZE;
  const visibleThumbBatch = verifiedScreenshots.slice(
    batchStartIdx,
    batchStartIdx + SCREEN_BATCH_SIZE
  );

  // Preload active covers, active 4-screen batch, and next 4-screen batch so batch transitions never flash blank
  useEffect(() => {
    const nextBatchStart =
      totalScreens > 0
        ? ((activeBatchIdx + 1) % Math.max(1, totalScreenBatches)) * SCREEN_BATCH_SIZE
        : 0;
    const toPreload = [
      ...resolvedCoverImages.slice(0, 4),
      ...verifiedScreenshots.slice(batchStartIdx, batchStartIdx + SCREEN_BATCH_SIZE),
      ...verifiedScreenshots.slice(nextBatchStart, nextBatchStart + SCREEN_BATCH_SIZE),
    ];
    if (toPreload.length > 0) {
      preloadImageUrls(toPreload);
    }
  }, [
    resolvedCoverImages,
    verifiedScreenshots,
    batchStartIdx,
    activeBatchIdx,
    totalScreenBatches,
    totalScreens,
  ]);

  // Reset state cleanly on repo change
  useEffect(() => {
    setSelectedScreenIdx(0);
    setActiveCoverIdx(0);
    setFailedAssetUrls({});
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

  const COVER_TURN_MS = 5000;
  const SCREEN_TURN_MS = 5000;
  const SINGLE_MODE_SLIDE_MS = 3500;
  const [modeCycleEpoch, setModeCycleEpoch] = useState(0);
  const [resumeFraction, setResumeFraction] = useState(0);
  const [screenTurnStep, setScreenTurnStep] = useState(0);
  const [isManualPaused, setIsManualPaused] = useState(false);
  const manualPauseTimerRef = React.useRef<number | null>(null);
  const prevHoveredRef = React.useRef(isHovered);

  const pauseAutoCycleTemporarily = () => {
    setManualPausedUntil(Date.now() + 10000);
    setIsManualPaused(true);
    if (manualPauseTimerRef.current !== null) {
      window.clearTimeout(manualPauseTimerRef.current);
    }
    manualPauseTimerRef.current = window.setTimeout(() => {
      setIsManualPaused(false);
      setModeCycleEpoch((prev) => prev + 1);
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
    setScreenTurnStep(0);
  }, [repoName]);

  useEffect(() => {
    onActiveScreenChange?.(selectedScreenIdx);
  }, [selectedScreenIdx, onActiveScreenChange]);

  const hasBothModes = totalCovers > 0 && totalScreens > 0;
  const isShowingCoverMode = Boolean(showingCoverArt && totalCovers > 0);
  const normalizedCoverIdx = totalCovers > 0 ? activeCoverIdx % totalCovers : 0;
  const normalizedScreenIdx = totalScreens > 0 ? selectedScreenIdx % totalScreens : 0;

  // In combined Cover <-> Screens mode:
  // - Cover turn displays ONE cover comfortably for 5s (advancing to the next cover on the following return cycle)
  // - Screens turn calmly shows up to 2 featured screens (~2.5s each = 5s total), then advances to next cover
  const screensInTurnCount = hasBothModes
    ? Math.min(totalScreens, 2)
    : Math.max(1, totalScreens);
  const currentStepDurationMs = hasBothModes
    ? isShowingCoverMode
      ? COVER_TURN_MS
      : Math.round(SCREEN_TURN_MS / screensInTurnCount)
    : SINGLE_MODE_SLIDE_MS;

  const canAutoCycle = hasBothModes || totalCovers > 1 || totalScreens > 1;
  const showProgressBar =
    canAutoCycle && !isHovered && !shouldReduceMotion && !isManualPaused;

  useEffect(() => {
    if (prevHoveredRef.current && !isHovered && !isManualPaused) {
      if (!hasBothModes) {
        setResumeFraction(0);
      } else if (isShowingCoverMode) {
        setResumeFraction(0);
      } else {
        setResumeFraction(screenTurnStep / Math.max(1, screensInTurnCount));
      }
      setModeCycleEpoch((prev) => prev + 1);
    }
    prevHoveredRef.current = isHovered;
  }, [
    isHovered,
    isManualPaused,
    hasBothModes,
    isShowingCoverMode,
    screenTurnStep,
    screensInTurnCount,
  ]);

  useEffect(() => {
    if (isManualPaused) {
      setResumeFraction(
        !hasBothModes || isShowingCoverMode
          ? 0
          : screenTurnStep / Math.max(1, screensInTurnCount)
      );
    }
  }, [isManualPaused, hasBothModes, isShowingCoverMode, screenTurnStep, screensInTurnCount]);

  // Calm alternating cycle: Cover (5s) -> Featured App Screens (5s across 1-2 screens) -> Next Cover (5s)
  useEffect(() => {
    if (isHovered || shouldReduceMotion || isManualPaused) return;
    if (!canAutoCycle) return;

    const timer = window.setTimeout(() => {
      if (hasBothModes) {
        if (showingCoverArt) {
          setShowingCoverArt(false);
          setScreenTurnStep(0);
          setResumeFraction(0);
          setModeCycleEpoch((prev) => prev + 1);
        } else {
          const nextStep = screenTurnStep + 1;
          if (nextStep < screensInTurnCount) {
            setScreenTurnStep(nextStep);
            setSelectedScreenIdx((prev) => (prev + 1) % totalScreens);
          } else {
            // Advance both Cover cursor (for next Cover turn) & Screen cursor seamlessly across cycles
            setShowingCoverArt(true);
            setScreenTurnStep(0);
            setSelectedScreenIdx((prev) => (prev + 1) % totalScreens);
            if (totalCovers > 1) {
              setActiveCoverIdx((prev) => (prev + 1) % totalCovers);
            }
            setResumeFraction(0);
            setModeCycleEpoch((prev) => prev + 1);
          }
        }
      } else if (showingCoverArt && totalCovers > 1) {
        setActiveCoverIdx((prev) => (prev + 1) % totalCovers);
        setResumeFraction(0);
        setModeCycleEpoch((prev) => prev + 1);
      } else if (!showingCoverArt && totalScreens > 1) {
        setSelectedScreenIdx((prev) => (prev + 1) % totalScreens);
        setResumeFraction(0);
        setModeCycleEpoch((prev) => prev + 1);
      }
    }, currentStepDurationMs);

    return () => window.clearTimeout(timer);
  }, [
    isHovered,
    shouldReduceMotion,
    isManualPaused,
    canAutoCycle,
    hasBothModes,
    showingCoverArt,
    totalCovers,
    totalScreens,
    screenTurnStep,
    screensInTurnCount,
    currentStepDurationMs,
  ]);

  const selectScreen = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowingCoverArt(false);
    setSelectedScreenIdx(idx);
    setScreenTurnStep(0);
    setResumeFraction(0);
    onActiveScreenChange?.(idx);
    pauseAutoCycleTemporarily();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalScreens <= 1) return;
    setShowingCoverArt(false);
    const nextIdx = (normalizedScreenIdx + 1) % totalScreens;
    setSelectedScreenIdx(nextIdx);
    setScreenTurnStep(0);
    setResumeFraction(0);
    onActiveScreenChange?.(nextIdx);
    pauseAutoCycleTemporarily();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalScreens <= 1) return;
    setShowingCoverArt(false);
    const prevIdx = (normalizedScreenIdx - 1 + totalScreens) % totalScreens;
    setSelectedScreenIdx(prevIdx);
    setScreenTurnStep(0);
    setResumeFraction(0);
    onActiveScreenChange?.(prevIdx);
    pauseAutoCycleTemporarily();
  };

  const handleNextCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalCovers <= 1) return;
    setShowingCoverArt(true);
    const nextIdx = (normalizedCoverIdx + 1) % totalCovers;
    setActiveCoverIdx(nextIdx);
    setResumeFraction(0);
    setModeCycleEpoch((prev) => prev + 1);
    pauseAutoCycleTemporarily();
  };

  const handlePrevCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalCovers <= 1) return;
    setShowingCoverArt(true);
    const prevIdx = (normalizedCoverIdx - 1 + totalCovers) % totalCovers;
    setActiveCoverIdx(prevIdx);
    setResumeFraction(0);
    setModeCycleEpoch((prev) => prev + 1);
    pauseAutoCycleTemporarily();
  };

  const handleNextBatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (totalScreenBatches <= 1) return;
    setShowingCoverArt(false);
    const nextBatchStart = ((activeBatchIdx + 1) % totalScreenBatches) * SCREEN_BATCH_SIZE;
    setSelectedScreenIdx(nextBatchStart);
    setScreenTurnStep(0);
    setResumeFraction(0);
    onActiveScreenChange?.(nextBatchStart);
    pauseAutoCycleTemporarily();
  };

  const handleToggleMode = (toCover: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowingCoverArt(toCover);
    setScreenTurnStep(0);
    setResumeFraction(0);
    setModeCycleEpoch((prev) => prev + 1);
    pauseAutoCycleTemporarily();
  };

  const BadgeIcon = blueprint.badgeIcon;
  const activeCoverUrl =
    totalCovers > 0 ? resolvedCoverImages[normalizedCoverIdx] : undefined;
  const activeScreenUrl = verifiedScreenshots[normalizedScreenIdx] || verifiedScreenshots[0];
  const containerHeightClass = aspectClassName || 'aspect-[4/3]';

  const fullTurnMs = hasBothModes
    ? isShowingCoverMode
      ? COVER_TURN_MS
      : SCREEN_TURN_MS
    : SINGLE_MODE_SLIDE_MS;
  const modeRemainingDurationSec = Math.max(
    0.5,
    (fullTurnMs * Math.max(0.05, 1 - resumeFraction)) / 1000
  );

  const stageTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.46, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

  const itemCrossfadeTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

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

      {/* Persistent Dual-Category Header Strip + Calm 5s Mode Hairline Progress Bar */}
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
                <span className="opacity-85 font-mono text-[9.5px] tabular-nums">
                  {isShowingCoverMode ? `${normalizedCoverIdx + 1}/${totalCovers}` : totalCovers}
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
                <span className="opacity-85 font-mono text-[9.5px] tabular-nums">
                  {!isShowingCoverMode ? `${normalizedScreenIdx + 1}/${totalScreens}` : totalScreens}
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
                {String(normalizedCoverIdx + 1).padStart(2, '0')}/
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
                {String(normalizedScreenIdx + 1).padStart(2, '0')}/
                {String(totalScreens).padStart(2, '0')}
              </span>
            )}
          </div>
        ) : null}

        {/* Unified Calm Mode Hairline Progress Bar */}
        {showProgressBar && (
          <motion.div
            key={`mode-progress-${isShowingCoverMode ? 'cover' : 'screens'}-${modeCycleEpoch}`}
            initial={{ scaleX: resumeFraction }}
            animate={{ scaleX: 1 }}
            transition={{ duration: modeRemainingDurationSec, ease: 'linear' }}
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
            /* MODE 1: FULL-CONTAINED 4:3 COVER ARTWORK (Calm 5s per turn, advancing to next cover next cycle) */
            <motion.div
              key="stage-cover-mode"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
              transition={stageTransition}
              className="relative w-full h-full p-2.5 sm:p-3.5 bg-slate-100/90 dark:bg-[#090d16] flex items-center justify-center pointer-events-none"
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-white/80 dark:bg-[#0c111d] border border-slate-200/80 dark:border-white/8 shadow-xs flex items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeCoverUrl}
                    initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                    transition={itemCrossfadeTransition}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <ImageWithSkeleton
                      src={activeCoverUrl}
                      alt={`${blueprint.appTitle} Cover ${normalizedCoverIdx + 1}`}
                      loading="eager"
                      onLoadError={() => markAssetFailed(activeCoverUrl)}
                      className="w-full h-full object-contain object-center transition-transform duration-500 group-hover/cover:scale-[1.015]"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Multi-cover Prev / Next Arrows + Cover Micro Indicators */}
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

                  <div className="pointer-events-auto absolute bottom-3.5 end-4 z-30 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm border border-white/15 shadow-sm">
                    <span className="text-[9.5px] font-mono font-bold text-white/85 tabular-nums me-0.5">
                      {String(normalizedCoverIdx + 1).padStart(2, '0')}/
                      {String(totalCovers).padStart(2, '0')}
                    </span>
                    <div className="flex items-center gap-1">
                      {resolvedCoverImages.map((_, cIdx) => {
                        const isActive = cIdx === normalizedCoverIdx;
                        return (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowingCoverArt(true);
                              setActiveCoverIdx(cIdx);
                              setResumeFraction(0);
                              setModeCycleEpoch((prev) => prev + 1);
                              pauseAutoCycleTemporarily();
                            }}
                            aria-label={`Cover ${cIdx + 1}`}
                            className={`relative h-1.5 rounded-full overflow-hidden cursor-pointer transition-all ${
                              isActive
                                ? 'w-6 bg-white/30'
                                : 'w-2 bg-white/35 hover:bg-white/60'
                            }`}
                          >
                            {isActive &&
                              (showProgressBar ? (
                                <motion.span
                                  key={`cover-slice-${normalizedCoverIdx}-${modeCycleEpoch}`}
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{
                                    duration: currentStepDurationMs / 1000,
                                    ease: 'linear',
                                  }}
                                  style={{
                                    transformOrigin:
                                      dir === 'rtl' ? 'right center' : 'left center',
                                  }}
                                  className="absolute inset-0 bg-[#38bdf8] rounded-full"
                                />
                              ) : (
                                <span className="absolute inset-0 bg-[#38bdf8] rounded-full" />
                              ))}
                          </button>
                        );
                      })}
                    </div>
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
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 w-9 h-1 rounded-full bg-slate-800/90 pointer-events-none" />

                    <div className="relative w-full h-full rounded-[15px] sm:rounded-[18px] overflow-hidden bg-[#0e1320] flex items-center justify-center">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={activeScreenUrl}
                          initial={shouldReduceMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                          transition={itemCrossfadeTransition}
                          className="w-full h-full flex items-center justify-center"
                        >
                          <ImageWithSkeleton
                            src={activeScreenUrl}
                            alt={`${blueprint.appTitle} screen ${normalizedScreenIdx + 1}`}
                            loading="eager"
                            variant="phone"
                            onLoadError={() => markAssetFailed(activeScreenUrl)}
                            className="w-full h-full object-contain crisp-screenshot"
                          />
                        </motion.div>
                      </AnimatePresence>
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

                {/* Right Interactive Rail: Title + Micro Progress Segments + Screen Thumbnails */}
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
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[9.5px] font-mono font-semibold text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                          {String(normalizedScreenIdx + 1).padStart(2, '0')}/
                          {String(totalScreens).padStart(2, '0')}
                        </span>
                        <div className="flex items-center gap-1 flex-1 max-w-[90px]">
                          {visibleThumbBatch.map((_, sIdx) => {
                            const globalIdx = batchStartIdx + sIdx;
                            const isActive = globalIdx === normalizedScreenIdx;
                            return (
                              <div
                                key={`${activeBatchIdx}-${sIdx}`}
                                className={`relative h-1 rounded-full overflow-hidden transition-all ${
                                  isActive
                                    ? 'flex-[1.8] bg-slate-300/80 dark:bg-white/20'
                                    : 'flex-1 bg-slate-300/60 dark:bg-white/12'
                                }`}
                              >
                                {isActive &&
                                  (showProgressBar ? (
                                    <motion.span
                                      key={`screen-slice-${normalizedScreenIdx}-${modeCycleEpoch}`}
                                      initial={{ scaleX: 0 }}
                                      animate={{ scaleX: 1 }}
                                      transition={{
                                        duration: currentStepDurationMs / 1000,
                                        ease: 'linear',
                                      }}
                                      style={{
                                        transformOrigin:
                                          dir === 'rtl' ? 'right center' : 'left center',
                                      }}
                                      className="absolute inset-0 bg-[#0284ff] dark:bg-[#38bdf8] rounded-full"
                                    />
                                  ) : (
                                    <span className="absolute inset-0 bg-[#0284ff] dark:bg-[#38bdf8] rounded-full" />
                                  ))}
                              </div>
                            );
                          })}
                        </div>
                        {totalScreenBatches > 1 && (
                          <button
                            type="button"
                            onClick={handleNextBatch}
                            aria-label={
                              lang === 'ar'
                                ? 'عرض المجموعة التالية من 4 شاشات'
                                : 'Show next 4 screens'
                            }
                            title={
                              lang === 'ar'
                                ? 'المجموعة التالية (4 شاشات)'
                                : 'Next 4 screens'
                            }
                            className="pointer-events-auto inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-200/75 dark:bg-white/[0.08] hover:bg-[#0284ff] text-slate-600 dark:text-slate-300 hover:text-white text-[9px] font-mono font-bold tabular-nums transition-colors cursor-pointer shrink-0"
                          >
                            <span>
                              {activeBatchIdx + 1}/{totalScreenBatches}
                            </span>
                            {dir === 'rtl' ? (
                              <ChevronLeft size={9} />
                            ) : (
                              <ChevronRight size={9} />
                            )}
                          </button>
                        )}
                      </div>

                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={`thumb-batch-${activeBatchIdx}`}
                          initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                          transition={itemCrossfadeTransition}
                          className="grid grid-cols-2 gap-1.5 pointer-events-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {visibleThumbBatch.map((thumbUrl, tIdx) => {
                            const globalIdx = batchStartIdx + tIdx;
                            const isActive = normalizedScreenIdx === globalIdx;
                            return (
                              <button
                                key={thumbUrl}
                                type="button"
                                onClick={(e) => selectScreen(globalIdx, e)}
                                aria-label={`Select screen ${globalIdx + 1}`}
                                className={`group/thumb relative h-14 sm:h-18 w-full rounded-xl overflow-hidden bg-[#0e1320] border-2 transition-all duration-200 cursor-pointer ${
                                  isActive
                                    ? 'border-[#0284ff] dark:border-[#00C7FF] shadow-md scale-[1.03]'
                                    : 'border-slate-300/80 dark:border-white/15 opacity-85 hover:opacity-100 hover:border-slate-400 dark:hover:border-white/35'
                                }`}
                              >
                                <ImageWithSkeleton
                                  src={thumbUrl}
                                  alt={`${blueprint.appTitle} thumbnail ${globalIdx + 1}`}
                                  loading="eager"
                                  variant="phone"
                                  onLoadError={() => markAssetFailed(thumbUrl)}
                                  className="w-full h-full object-contain crisp-screenshot"
                                />
                                <span
                                  className={`absolute bottom-0.5 end-0.5 px-1 rounded text-[8.5px] font-mono font-bold tabular-nums ${
                                    isActive
                                      ? 'bg-[#0284ff] text-white'
                                      : 'bg-black/75 text-slate-100'
                                  }`}
                                >
                                  {String(globalIdx + 1).padStart(2, '0')}
                                </span>
                              </button>
                            );
                          })}
                        </motion.div>
                      </AnimatePresence>
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
