export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
  pushed_at: string;
  created_at: string;
  is_fork: boolean;
  size: number;
  default_branch: string;
  coverImageUrl?: string;
  discoveredScreenshots?: string[];
  candidateCoverUrls?: string[];
  liveDemoUrl?: string;
  playlistUrl?: string;
  googlePlayUrl?: string;
  apkDownloadUrl?: string;
  releaseUrl?: string;
}

export interface GitHubStats {
  username: string;
  name: string;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
  languages: { name: string; count: number; percentage: number; color: string }[];
  isFromCache?: boolean;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export const COVER_IMAGE_SPECS = {
  aspectRatio: "16:9",
  recommendedWidth: 1200,
  recommendedHeight: 675,
  mobileWidth: 800,
  mobileHeight: 450,
  formats: ["PNG", "WebP", "JPEG"],
  maxFileSize: "1.5 MB",
  repoPath: "screenshots/cover.png",
  alternativePaths: [
    "screenshots/cover.jpg",
    "screenshots/cover.webp",
    "assets/screenshots/cover.png"
  ],
  instructionsAr: "ضع الصورة داخل مجلد باسم screenshots في جذر المستودع الرئيسي باسم cover.png وسيقوم البورتفوليو بعرضها تلقائياً كغلاف للمشروع بأبعاد 1200×675 بكسل!"
};

const LANGUAGE_COLORS: Record<string, string> = {
  Dart: '#00B4AB',
  Flutter: '#02569B',
  Python: '#3572A5',
  JavaScript: '#F7DF1E',
  TypeScript: '#3178C6',
  'C++': '#F34B7D',
  HTML: '#E34F26',
  CSS: '#563D7C',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Java: '#B07219',
};

export const getLanguageColor = (lang: string | null): string => {
  if (!lang) return '#38bdf8';
  return LANGUAGE_COLORS[lang] || '#6366f1';
};

// Known verified fallback mappings (supplemented dynamically by live README parsing)
const KNOWN_REPO_MEDIA: Record<string, { liveDemoUrl?: string; playlistUrl?: string; playStore?: string }> = {
  Revio: {
    liveDemoUrl: "https://youtube.com/shorts/FsG1XUAbmDY?si=lvngji7Uz-EKRROJ",
    playStore: "https://play.google.com/store/apps/details?id=com.ahmed.revio&hl=en_US"
  },
  Movura: {
    liveDemoUrl: "https://youtube.com/shorts/9LCJqMSuZno?si=b-7WUOXY8B0IUahe",
    playlistUrl: "https://youtube.com/playlist?list=PLGHDB4nGr8K0&si=Bro9Uai9p9glcGuQ"
  },
  "Vibrant-store": {
    liveDemoUrl: "https://youtube.com/shorts/PIg1rYA0CkQ"
  },
  "Sky-Cast": {
    liveDemoUrl: "https://youtube.com/shorts/u5JjIphdrAM?si=h44HWlZMZki8L_GM"
  },
  "News-Cloud": {
    liveDemoUrl: "https://youtube.com/shorts/AKbiBjCRIis"
  },
  Shaats: {},
  "Nihon-Seed": {
    liveDemoUrl: "https://youtube.com/shorts/OG-S_8oSN00?si=1K0SkiW8voSb4YR-"
  },
  "NBN-Basketball": {
    liveDemoUrl: "https://youtube.com/shorts/xJaE0pxSpAQ?si=8lF-9tGR68cHibaL"
  },
  "piano-tunes": {
    liveDemoUrl: "https://youtube.com/shorts/9PWzO0_ozQ0"
  },
  Quotely: {
    liveDemoUrl: "https://youtube.com/shorts/Ujw3TKIyTPU?si=YQkRMt36eOruCWhS"
  },
};

// Ahmed El-Bialy's verified repositories synchronized with CV
export const AHMED_DEFAULT_REPOS: GitHubRepo[] = [
  {
    id: 1,
    name: "Revio",
    full_name: "ahmed-el-bialy/Revio",
    description: "A dark-themed Flutter flashcard app for efficient learning, featuring flip-card animations, an interactive quiz mode with hints, and full offline CRUD storage via Hive. Built with Clean Architecture and Cubit state management. Live on Google Play.",
    html_url: "https://github.com/ahmed-el-bialy/Revio",
    homepage: "https://play.google.com/store/apps/details?id=com.ahmed.revio&hl=en_US",
    stargazers_count: 3,
    forks_count: 1,
    language: "Dart",
    topics: ["flutter", "dart", "cubit", "hive-ce", "clean-architecture", "google-play"],
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    created_at: "2026-01-10T12:00:00Z",
    is_fork: false,
    size: 5400,
    default_branch: "main",
    coverImageUrl: "https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/cover.png",
    liveDemoUrl: "https://youtube.com/shorts/FsG1XUAbmDY?si=lvngji7Uz-EKRROJ",
    googlePlayUrl: "https://play.google.com/store/apps/details?id=com.ahmed.revio&hl=en_US",
    apkDownloadUrl: "https://github.com/ahmed-el-bialy/Revio/releases/download/v1.0.0/app-release.apk",
    releaseUrl: "https://github.com/ahmed-el-bialy/Revio/releases/tag/v1.0.0"
  },
  {
    id: 2,
    name: "Movura",
    full_name: "ahmed-el-bialy/Movura",
    description: "A premium movie and TV series tracking mobile application consuming the TMDB API. Built with Clean Architecture, Cubit & BLoC state management, Sliver-based layouts, shimmer loading skeletons, and YouTube trailers.",
    html_url: "https://github.com/ahmed-el-bialy/Movura",
    homepage: "https://github.com/ahmed-el-bialy/Movura",
    stargazers_count: 4,
    forks_count: 2,
    language: "Dart",
    topics: ["flutter", "dart", "cubit", "bloc", "clean-architecture", "tmdb-api", "shimmer", "youtube-trailer"],
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    created_at: "2026-02-15T10:00:00Z",
    is_fork: false,
    size: 8200,
    default_branch: "main",
    coverImageUrl: "https://raw.githubusercontent.com/ahmed-el-bialy/Movura/main/screenshots/home_p1.png",
    liveDemoUrl: "https://youtube.com/shorts/9LCJqMSuZno?si=b-7WUOXY8B0IUahe",
    playlistUrl: "https://youtube.com/playlist?list=PLGHDB4nGr8K0&si=Bro9Uai9p9glcGuQ",
  },
  {
    id: 3,
    name: "Vibrant-store",
    full_name: "ahmed-el-bialy/Vibrant-store",
    description: "A modern, high-performance e-commerce mobile solution with real-time product data from DummyJSON API. Features smart category search with chip filtering, detailed product pages with customer reviews, in-memory favorites system, and Service Layer pattern.",
    html_url: "https://github.com/ahmed-el-bialy/Vibrant-store",
    homepage: null,
    stargazers_count: 2,
    forks_count: 1,
    language: "Dart",
    topics: ["flutter", "dart", "ecommerce", "dummyjson", "service-layer"],
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    created_at: "2026-02-01T14:30:00Z",
    is_fork: false,
    size: 4300,
    default_branch: "main",
    coverImageUrl: "https://raw.githubusercontent.com/ahmed-el-bialy/Vibrant-store/main/screenshots/HomeView.png",
    liveDemoUrl: "https://youtube.com/shorts/PIg1rYA0CkQ"
  },
  {
    id: 4,
    name: "Sky-Cast",
    full_name: "ahmed-el-bialy/Sky-Cast",
    description: "A sleek, minimal weather application built with Flutter, featuring real-time forecasts, dynamic weather-adaptive UI, autocomplete city search, and Clean Architecture. Consumes WeatherAPI.com with custom SearchDelegate.",
    html_url: "https://github.com/ahmed-el-bialy/Sky-Cast",
    homepage: null,
    stargazers_count: 1,
    forks_count: 0,
    language: "Dart",
    topics: ["flutter", "dart", "weatherapi", "searchdelegate", "clean-architecture"],
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    created_at: "2026-01-20T08:00:00Z",
    is_fork: false,
    size: 3100,
    default_branch: "main",
    coverImageUrl: "https://raw.githubusercontent.com/ahmed-el-bialy/Sky-Cast/main/screenshots/sunny_main_weather.png",
    liveDemoUrl: "https://youtube.com/shorts/u5JjIphdrAM?si=h44HWlZMZki8L_GM"
  },
  {
    id: 5,
    name: "News-Cloud",
    full_name: "ahmed-el-bialy/News-Cloud",
    description: "A modern, fast news aggregator app delivering real-time headlines across multiple categories with full Arabic RTL support, in-app WebView article reading, and Sliver-based responsive layouts. Built with Repository Pattern.",
    html_url: "https://github.com/ahmed-el-bialy/News-Cloud",
    homepage: null,
    stargazers_count: 2,
    forks_count: 0,
    language: "Dart",
    topics: ["flutter", "dart", "news-api", "arabic-rtl", "repository-pattern", "webview"],
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    created_at: "2026-01-05T16:20:00Z",
    is_fork: false,
    size: 4700,
    default_branch: "main",
    coverImageUrl: "https://raw.githubusercontent.com/ahmed-el-bialy/News-Cloud/main/screenshots/general_view.png",
    liveDemoUrl: "https://youtube.com/shorts/AKbiBjCRIis"
  },
  {
    id: 6,
    name: "Shaats",
    full_name: "ahmed-el-bialy/Shaats",
    description: "A real-time chat application built with Flutter and Firebase, providing seamless instant messaging with user authentication, live message synchronization via Firestore streams, and distinct sender/receiver message bubbles.",
    html_url: "https://github.com/ahmed-el-bialy/Shaats",
    homepage: null,
    stargazers_count: 3,
    forks_count: 1,
    language: "Dart",
    topics: ["flutter", "dart", "firebase", "firestore-streams", "chat-app"],
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 150).toISOString(),
    pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 150).toISOString(),
    created_at: "2025-12-15T11:00:00Z",
    is_fork: false,
    size: 3800,
    default_branch: "main",
    coverImageUrl: "https://raw.githubusercontent.com/ahmed-el-bialy/Shaats/main/screenshots/SenderView.png",
  },
  {
    id: 7,
    name: "Nihon-Seed",
    full_name: "ahmed-el-bialy/Nihon-Seed",
    description: "Nihon-Seed is a mobile application developed using Flutter designed to facilitate the learning of basic Japanese. Focuses on an interactive, gamified UI for beginners.",
    html_url: "https://github.com/ahmed-el-bialy/Nihon-Seed",
    homepage: null,
    stargazers_count: 1,
    forks_count: 0,
    language: "Dart",
    topics: ["flutter", "dart", "japanese-learning", "education"],
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 180).toISOString(),
    pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 180).toISOString(),
    created_at: "2025-11-28T09:00:00Z",
    is_fork: false,
    size: 2900,
    default_branch: "main",
    coverImageUrl: "https://raw.githubusercontent.com/ahmed-el-bialy/Nihon-Seed/main/screenshots/MainView.png",
    liveDemoUrl: "https://youtube.com/shorts/OG-S_8oSN00?si=1K0SkiW8voSb4YR-"
  },
  {
    id: 8,
    name: "NBN-Basketball",
    full_name: "ahmed-el-bialy/NBN-Basketball",
    description: "A sleek, production-ready basketball scoreboard application built with Flutter, designed to deliver a real-time fluid tracking experience for courtside officials and fans alike.",
    html_url: "https://github.com/ahmed-el-bialy/NBN-Basketball",
    homepage: null,
    stargazers_count: 1,
    forks_count: 0,
    language: "Dart",
    topics: ["flutter", "dart", "scoreboard", "basketball", "sports"],
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 210).toISOString(),
    pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 210).toISOString(),
    created_at: "2025-12-01T15:00:00Z",
    is_fork: false,
    size: 2600,
    default_branch: "main",
    coverImageUrl: "https://raw.githubusercontent.com/ahmed-el-bialy/NBN-Basketball/main/screenshots/StartView.png",
    liveDemoUrl: "https://youtube.com/shorts/xJaE0pxSpAQ?si=8lF-9tGR68cHibaL"
  },
  {
    id: 9,
    name: "piano-tunes",
    full_name: "ahmed-el-bialy/piano-tunes",
    description: "A vibrant, interactive musical application built with Flutter. Demonstrates advanced UI/UX design techniques, including custom gradients, neon glow effects, and optimized audio playback.",
    html_url: "https://github.com/ahmed-el-bialy/piano-tunes",
    homepage: null,
    stargazers_count: 0,
    forks_count: 0,
    language: "Dart",
    topics: ["flutter", "dart", "audio", "music", "piano"],
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
    pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
    created_at: "2025-11-20T10:00:00Z",
    is_fork: false,
    size: 3200,
    default_branch: "main",
    coverImageUrl: "https://raw.githubusercontent.com/ahmed-el-bialy/piano-tunes/main/screenshots/Screenshot_20260426_182814.png",
    liveDemoUrl: "https://youtube.com/shorts/9PWzO0_ozQ0"
  },
  {
    id: 10,
    name: "Note-Keep",
    full_name: "ahmed-el-bialy/Note-Keep",
    description: "A modern, lightweight mobile application designed for seamless note-taking and task organization built with Flutter.",
    html_url: "https://github.com/ahmed-el-bialy/Note-Keep",
    homepage: null,
    stargazers_count: 0,
    forks_count: 0,
    language: "Dart",
    topics: ["flutter", "dart", "notes", "tasks"],
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 260).toISOString(),
    pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 260).toISOString(),
    created_at: "2025-11-15T10:00:00Z",
    is_fork: false,
    size: 2400,
    default_branch: "main",
    coverImageUrl: undefined,
  },
  {
    id: 11,
    name: "Quotely",
    full_name: "ahmed-el-bialy/Quotely",
    description: "A Flutter app that displays random inspirational quotes using a public API with a clean, modern, and user-friendly interface.",
    html_url: "https://github.com/ahmed-el-bialy/Quotely",
    homepage: null,
    stargazers_count: 0,
    forks_count: 0,
    language: "Dart",
    topics: ["flutter", "dart", "quotes", "api"],
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 280).toISOString(),
    pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 280).toISOString(),
    created_at: "2025-11-10T10:00:00Z",
    is_fork: false,
    size: 2100,
    default_branch: "main",
    coverImageUrl: "https://raw.githubusercontent.com/ahmed-el-bialy/Quotely/main/screenshots/quote_loaded.png",
    liveDemoUrl: "https://youtube.com/shorts/Ujw3TKIyTPU?si=YQkRMt36eOruCWhS"
  }
];

export async function fetchGitHubUserStats(username: string = 'ahmed-el-bialy'): Promise<{ stats: GitHubStats; repos: GitHubRepo[] }> {
  const cleanUsername = username.trim() || "ahmed-el-bialy";
  const cacheKey = `ahmed_gh_cache_v3_${cleanUsername}`;

  const cached = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
  let parsedCache: { stats: GitHubStats; repos: GitHubRepo[] } | null = null;
  if (cached) {
    try {
      parsedCache = JSON.parse(cached);
    } catch (e) {}
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine && parsedCache) {
    return {
      ...parsedCache,
      stats: { ...parsedCache.stats, isFromCache: true }
    };
  }

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
        headers: { Accept: "application/vnd.github+json" }
      }),
      fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?per_page=100&sort=pushed`, {
        headers: { Accept: "application/vnd.github+json" }
      })
    ]);

    if (!userRes.ok || !reposRes.ok) {
      // Graceful fallback on GitHub API rate-limiting or network error
      if (parsedCache) {
        return {
          ...parsedCache,
          stats: { ...parsedCache.stats, isFromCache: true }
        };
      }
      throw new Error(`GitHub API returned status ${userRes.status}/${reposRes.status}`);
    }

    const userData = await userRes.json();
    const rawRepos = await reposRes.json();
    const reposList: any[] = Array.isArray(rawRepos) ? rawRepos : [];

    const validRepos: GitHubRepo[] = reposList
      .filter((r) => r.name.toLowerCase() !== cleanUsername.toLowerCase())
      .map((r) => {
        const branch = r.default_branch || "main";
        const verifiedShot =
          VERIFIED_REPO_SCREENSHOTS[r.name]?.[0] ||
          VERIFIED_REPO_SCREENSHOTS[r.name.toLowerCase()]?.[0];
        const primaryCover =
          r.name.toLowerCase() === "revio"
            ? `https://raw.githubusercontent.com/${cleanUsername}/${r.name}/${branch}/screenshots/cover.png`
            : verifiedShot || undefined;
        const known = KNOWN_REPO_MEDIA[r.name] || KNOWN_REPO_MEDIA[r.name.toLowerCase()] || {};

        return {
          id: r.id,
          name: r.name,
          full_name: r.full_name,
          description: r.description,
          html_url: r.html_url,
          homepage: r.homepage,
          stargazers_count: r.stargazers_count || 0,
          forks_count: r.forks_count || 0,
          language: r.language || 'Dart',
          topics: r.topics || [],
          updated_at: r.updated_at,
          pushed_at: r.pushed_at || r.updated_at,
          created_at: r.created_at,
          is_fork: Boolean(r.fork),
          size: r.size || 0,
          default_branch: branch,
          coverImageUrl: primaryCover,
          liveDemoUrl: known.liveDemoUrl,
          playlistUrl: known.playlistUrl,
          googlePlayUrl: known.playStore
        };
      });

    const totalStars = validRepos.reduce((acc, r) => acc + r.stargazers_count, 0);
    const totalForks = validRepos.reduce((acc, r) => acc + r.forks_count, 0);

    const langCounts: Record<string, number> = {};
    validRepos.forEach((r) => {
      if (r.language) {
        langCounts[r.language] = (langCounts[r.language] || 0) + 1;
      }
    });

    const totalLangRepos = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;
    const languages = Object.entries(langCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalLangRepos) * 100),
        color: getLanguageColor(name)
      }))
      .sort((a, b) => b.count - a.count);

    const stats: GitHubStats = {
      username: userData.login || cleanUsername,
      name: userData.name || "Ahmed El-Bialy",
      avatar_url: userData.avatar_url || "https://avatars.githubusercontent.com/u/245139141?v=4",
      bio: userData.bio || "🚀 Junior Flutter Developer | B.Sc. Student in AI | Mobile App Developer",
      public_repos: userData.public_repos ?? validRepos.length,
      followers: userData.followers || 2,
      following: userData.following || 2,
      totalStars,
      totalForks,
      languages,
      isFromCache: false
    };

    const result = { stats, repos: validRepos };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(result));
      } catch (e) {}
    }

    return result;
  } catch {
    if (parsedCache) {
      return {
        ...parsedCache,
        stats: { ...parsedCache.stats, isFromCache: true }
      };
    }

    return {
      stats: computeFallbackGitHubStats(cleanUsername, AHMED_DEFAULT_REPOS, true),
      repos: AHMED_DEFAULT_REPOS
    };
  }
}

export function computeFallbackGitHubStats(
  username: string = 'ahmed-el-bialy',
  repos: GitHubRepo[] = AHMED_DEFAULT_REPOS,
  isFromCache: boolean = true
): GitHubStats {
  const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);

  const langCounts: Record<string, number> = {};
  repos.forEach((r) => {
    if (r.language) {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    }
  });

  const totalLangRepos = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;
  const languages = Object.entries(langCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalLangRepos) * 100),
      color: getLanguageColor(name),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    username: username || 'ahmed-el-bialy',
    name: 'Ahmed El-Bialy',
    avatar_url: 'https://avatars.githubusercontent.com/u/245139141?v=4',
    bio: 'Junior Flutter Developer | B.Sc. Student in AI | Mobile App Developer',
    public_repos: repos.length,
    followers: 12,
    following: 5,
    totalStars,
    totalForks,
    languages,
    isFromCache,
  };
}

export async function fetchContributionCalendar(username: string = 'ahmed-el-bialy'): Promise<ContributionDay[]> {
  const cacheKey = `ahmed_contrib_cache_${username}`;
  if (typeof window !== 'undefined' && !navigator.onLine) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
  }

  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.contributions)) {
        const result = data.contributions.map((c: any) => ({
          date: c.date,
          count: c.count || 0,
          level: c.level ?? (c.count > 4 ? 4 : c.count > 2 ? 3 : c.count > 0 ? 1 : 0)
        }));
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(result));
          } catch (e) {}
        }
        return result;
      }
    }
  } catch (e) {
    // fallback
  }

  const days: ContributionDay[] = [];
  const today = new Date();
  for (let i = 84; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const pseudoRand = (d.getDate() * 17 + d.getMonth() * 11 + i * 3) % 10;
    const count = pseudoRand > 4 ? (pseudoRand % 5) + 1 : 0;
    days.push({
      date: dateStr,
      count,
      level: count > 3 ? 4 : count > 2 ? 3 : count > 0 ? 1 : 0
    });
  }
  return days;
}

const NON_SCREENSHOT_HOST_PATTERNS = [
  'img.shields.io',
  'camo.githubusercontent.com',
  'capsule-render',
  'readme-typing-svg',
  'komarev.com',
  'skillicons.dev',
  'cdn.dummyjson.com',
  'dummyjson.com',
  'via.placeholder.com',
  'placeholder.com',
  'example.com',
];

export function sanitizeDiscoveredScreenshots(urls?: string[] | null): string[] {
  if (!Array.isArray(urls)) return [];
  return urls.filter((url) => {
    if (typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    const lower = trimmed.toLowerCase();
    if (NON_SCREENSHOT_HOST_PATTERNS.some((pattern) => lower.includes(pattern))) {
      return false;
    }
    if (lower.includes('badge') || lower.endsWith('.gif') || lower.endsWith('.svg')) {
      return false;
    }
    return true;
  });
}

/**
 * Parses image URLs from repository description (supports markdown ![alt](url) and raw http(s) image URLs)
 * Ignores fenced and inline code blocks so sample JSON API payloads are never mistaken for screenshots.
 */
export function parseImagesFromDescription(description: string | null): string[] {
  if (!description) return [];
  const cleanedDescription = description
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, ' ');
  const urls: string[] = [];

  // Markdown images: ![alt](url)
  const markdownRegex = /!\[.*?\]\((https?:\/\/[^\s)]+\.(?:png|jpg|jpeg|webp|gif)(?:\?[^\s)]*)?)\)/gi;
  let match;
  while ((match = markdownRegex.exec(cleanedDescription)) !== null) {
    if (match[1]) urls.push(match[1]);
  }

  // Raw URLs ending in image extensions
  const rawUrlRegex = /(https?:\/\/[^\s<>"')]+?\.(?:png|jpg|jpeg|webp)(?:\?[^\s<>"')]*)?)/gi;
  while ((match = rawUrlRegex.exec(cleanedDescription)) !== null) {
    if (match[1] && !urls.includes(match[1])) {
      urls.push(match[1]);
    }
  }

  return urls;
}

/**
 * Extracts genuine app screenshots embedded inside a repository README (excluding shields.io, camo, badges, and API example URLs).
 */
export function extractEmbeddedReadmeScreenshots(readmeText?: string | null): string[] {
  if (!readmeText) return [];
  const raw = parseImagesFromDescription(readmeText);
  return sanitizeDiscoveredScreenshots(raw);
}

// Verified screenshot URLs across Ahmed El-Bialy's repositories
export const VERIFIED_REPO_SCREENSHOTS: Record<string, string[]> = {
  Revio: [
    "https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/home.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/quiz_mode.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/quiz_mcq.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/manage_library.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/manage_topics.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/quiz_results.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/quiz_typing.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/add_card.png",
  ],
  Movura: [
    "https://raw.githubusercontent.com/ahmed-el-bialy/Movura/main/screenshots/home_p1.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Movura/main/screenshots/movie_details_p1.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Movura/main/screenshots/trailer_player_v.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Movura/main/screenshots/tv_anime_p1.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Movura/main/screenshots/search_results.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Movura/main/screenshots/reviews.png",
  ],
  "Vibrant-store": [
    "https://raw.githubusercontent.com/ahmed-el-bialy/Vibrant-store/main/screenshots/HomeView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Vibrant-store/main/screenshots/CategoryProducts.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Vibrant-store/main/screenshots/ProductViewP1.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Vibrant-store/main/screenshots/ProductViewP2.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Vibrant-store/main/screenshots/cart_screen.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Vibrant-store/main/screenshots/SearchView.png",
  ],
  "Sky-Cast": [
    "https://raw.githubusercontent.com/ahmed-el-bialy/Sky-Cast/main/screenshots/sunny_main_weather.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Sky-Cast/main/screenshots/cloudy_main_weather.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Sky-Cast/main/screenshots/cloudy_results_search.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Sky-Cast/main/screenshots/rainy_main_weather.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Sky-Cast/main/screenshots/snowy_main_view.png",
  ],
  "News-Cloud": [
    "https://raw.githubusercontent.com/ahmed-el-bialy/News-Cloud/main/screenshots/general_view.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/News-Cloud/main/screenshots/main_view.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/News-Cloud/main/screenshots/business_view.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/News-Cloud/main/screenshots/sports_view.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/News-Cloud/main/screenshots/tech_view.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/News-Cloud/main/screenshots/WebView.png",
  ],
  Shaats: [
    "https://raw.githubusercontent.com/ahmed-el-bialy/Shaats/main/screenshots/LogInView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Shaats/main/screenshots/SenderView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Shaats/main/screenshots/OthersPonitView.jpg",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Shaats/main/screenshots/LoadingDataView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Shaats/main/screenshots/SecurePasswordView.png",
  ],
  "Nihon-Seed": [
    "https://raw.githubusercontent.com/ahmed-el-bialy/Nihon-Seed/main/screenshots/MainView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Nihon-Seed/main/screenshots/FamilyView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Nihon-Seed/main/screenshots/ColorsView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Nihon-Seed/main/screenshots/NumbersView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Nihon-Seed/main/screenshots/phrasesView.png",
  ],
  "NBN-Basketball": [
    "https://raw.githubusercontent.com/ahmed-el-bialy/NBN-Basketball/main/screenshots/StartView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/NBN-Basketball/main/screenshots/HomeTeamScore.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/NBN-Basketball/main/screenshots/AwayTeamScore.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/NBN-Basketball/main/screenshots/HomeTeamScore3.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/NBN-Basketball/main/screenshots/AwayTeamScore2.png",
  ],
  "piano-tunes": [
    "https://raw.githubusercontent.com/ahmed-el-bialy/piano-tunes/main/screenshots/Screenshot_20260426_182814.png"
  ],
  Quotely: [
    "https://raw.githubusercontent.com/ahmed-el-bialy/Quotely/main/screenshots/quote_loaded.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Quotely/main/screenshots/quote_loading.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Quotely/main/screenshots/splash_screen.png"
  ]
};

/**
 * Dynamically queries the GitHub Contents API for the repo's /screenshots folder.
 * Retrieves all valid image files regardless of arbitrary filenames (e.g. login.png, feed.jpg)!
 */
export async function fetchRepoScreenshots(repoName: string, username: string = 'ahmed-el-bialy'): Promise<string[]> {
  const cleanName = repoName.trim();
  const cacheKey = `repo-screens-${username}-${cleanName}`;

  if (typeof window !== 'undefined' && !navigator.onLine) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
  }

  const verifiedFallback =
    VERIFIED_REPO_SCREENSHOTS[cleanName] ||
    VERIFIED_REPO_SCREENSHOTS[cleanName.toLowerCase()] ||
    Object.entries(VERIFIED_REPO_SCREENSHOTS).find(
      ([k]) => k.toLowerCase() === cleanName.toLowerCase()
    )?.[1];

  try {
    const res = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(cleanName)}/contents/screenshots`,
      {
        headers: { Accept: "application/vnd.github+json" },
        cache: 'no-store'
      }
    );
    if (res.ok) {
      const files = await res.json();
      if (Array.isArray(files)) {
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
        const allImageFiles = files.filter(
          (file: any) =>
            file.type === 'file' &&
            imageExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
        );

        const nonCoverScreens = allImageFiles
          .filter((file: any) => !/^cover\.(png|jpe?g|webp)$/i.test(file.name))
          .map(
            (file: any) =>
              file.download_url ||
              `https://raw.githubusercontent.com/${username}/${cleanName}/main/screenshots/${encodeURIComponent(file.name)}`
          );

        const imageUrls =
          nonCoverScreens.length > 0
            ? nonCoverScreens
            : allImageFiles.map(
                (file: any) =>
                  file.download_url ||
                  `https://raw.githubusercontent.com/${username}/${cleanName}/main/screenshots/${encodeURIComponent(file.name)}`
              );

        if (imageUrls.length > 0) {
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(cacheKey, JSON.stringify(imageUrls));
            } catch (e) {}
          }
          return imageUrls;
        }
      }
    }
  } catch (err) {
    // API rate limits or network issues fallback
  }

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
  }

  if (verifiedFallback && verifiedFallback.length > 0) {
    return verifiedFallback;
  }

  return [];
}

export interface RepoReleaseInfo {
  hasRelease: boolean;
  releaseUrl?: string;
  tagName?: string;
  name?: string;
  publishedAt?: string;
  apkDownloadUrl?: string;
  apkFileName?: string;
  apkSize?: number;
  assetsCount?: number;
  prerelease?: boolean;
  body?: string;
}

export interface ParsedReadmeLinks {
  liveDemoUrl?: string;
  playlistUrl?: string;
  playStoreUrl?: string;
  apkUrl?: string;
}

/**
 * Robustly extracts the 11-character YouTube video ID from any format
 * (shorts, watch?v=, youtu.be, embed, timestamp parameters, query strings)
 */
export function extractYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  try {
    const clean = url.trim().replace(/[)\]"'>.,;]+$/, '');
    const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i);
    if (match && match[1]) {
      return match[1];
    }
  } catch (e) {}
  return null;
}

function cleanExtractedUrl(url: string): string {
  return url.replace(/[)\]"'>.,;]+$/, '').trim();
}

function isGenericYouTubeChannelUrl(url: string): boolean {
  return /^https?:\/\/(?:www\.)?youtube\.com\/(?:@|c\/|channel\/|user\/)[^/?#\s]+\/?(?:\?.*)?$/i.test(url);
}

function isYouTubePlaylistUrl(url: string): boolean {
  return /youtube\.com\/playlist\?list=/i.test(url) || (/(?:youtube\.com|youtu\.be)/i.test(url) && /[?&]list=PL/i.test(url));
}

function isHostedWebDemoUrl(url: string): boolean {
  return /https?:\/\/(?:[a-zA-Z0-9-]+\.)*(?:vercel\.app|netlify\.app|github\.io|web\.app|firebaseapp\.com)/i.test(url);
}

/**
 * Context-aware README link parser:
 * Inspects headings, line text, Markdown labels/badges, and HTML anchor tags to distinguish:
 * - liveDemoUrl (Latest Update, Live Demo, Shorts/video demo, hosted web preview)
 * - playlistUrl (Main Demo, Full Review, Playlist series)
 * - playStoreUrl & apkUrl
 */
export function parseLinksFromReadme(readmeText?: string | null): ParsedReadmeLinks {
  if (!readmeText) return {};
  const result: ParsedReadmeLinks = {};

  let currentHeading = '';
  let explicitLivePriority = 0; // 2 = explicit last-update/live-demo context, 1 = generic video/web demo
  let explicitPlaylistPriority = 0; // 2 = explicit playlist/full-review URL or label, 1 = secondary playlist context

  const lines = readmeText.split(/\r?\n/);

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Track active Markdown or HTML section heading
    const mdHeadingMatch = trimmed.match(/^#{1,6}\s+(.+)/);
    const htmlHeadingMatch = trimmed.match(/^<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
    const boldHeadingMatch = trimmed.match(/^\*\*([^*]{3,80})\*\*\s*:?\s*$/);
    if (mdHeadingMatch) {
      currentHeading = mdHeadingMatch[1].replace(/[*_`[\]()]/g, ' ').trim();
    } else if (htmlHeadingMatch) {
      currentHeading = htmlHeadingMatch[1].replace(/<[^>]+>/g, ' ').trim();
    } else if (boldHeadingMatch) {
      currentHeading = boldHeadingMatch[1].trim();
    }

    // Collect candidate (label, url) pairs from this line
    const candidates: Array<{ label: string; url: string }> = [];
    const seenOnLine = new Set<string>();

    // 1. Markdown links, including image badge links: [![alt](img)](url) and [text](url)
    const mdLinkRegex = /\[(!\[([^\]]*)\]\([^)]*\)|[^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi;
    let m: RegExpExecArray | null;
    while ((m = mdLinkRegex.exec(rawLine)) !== null) {
      const label = (m[2] || m[1] || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/[*_`]/g, '').trim();
      const url = cleanExtractedUrl(m[3]);
      if (url && !seenOnLine.has(url)) {
        seenOnLine.add(url);
        candidates.push({ label, url });
      }
    }

    // 2. HTML anchor tags: <a href="url">inner</a>
    const htmlLinkRegex = /<a\s+[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    while ((m = htmlLinkRegex.exec(rawLine)) !== null) {
      const url = cleanExtractedUrl(m[1]);
      const altMatch = m[2].match(/alt=["']([^"']+)["']/i);
      const innerText = m[2].replace(/<[^>]+>/g, ' ').trim();
      const label = `${innerText} ${altMatch ? altMatch[1] : ''}`.trim();
      if (url && !seenOnLine.has(url)) {
        seenOnLine.add(url);
        candidates.push({ label, url });
      }
    }

    // 3. Remaining bare URLs on the line (excluding markdown image assets)
    const cleanLineForBare = rawLine
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/<img[^>]*>/gi, ' ');
    const bareUrlRegex = /(https?:\/\/[^\s<>"')]+)/gi;
    while ((m = bareUrlRegex.exec(cleanLineForBare)) !== null) {
      const url = cleanExtractedUrl(m[1]);
      if (url && !seenOnLine.has(url)) {
        seenOnLine.add(url);
        candidates.push({ label: '', url });
      }
    }

    const linePlainText = trimmed
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/https?:\/\/\S+/gi, ' ')
      .trim();

    for (const { label, url } of candidates) {
      // Skip image/badge source URLs if any slipped through
      if (/\.(?:png|jpe?g|webp|gif|svg)(?:\?.*)?$/i.test(url) || /img\.shields\.io|camo\.githubusercontent\.com/i.test(url)) {
        continue;
      }

      // Google Play
      if (/play\.google\.com\/store\/apps\/details\?/i.test(url)) {
        if (!result.playStoreUrl) result.playStoreUrl = url;
        continue;
      }

      // Direct APK
      if (/\.apk(?:$|\?)/i.test(url)) {
        if (!result.apkUrl) result.apkUrl = url;
        continue;
      }

      const isYt = /(?:youtube\.com|youtu\.be)/i.test(url);
      const isWebDemo = isHostedWebDemoUrl(url);
      if (!isYt && !isWebDemo) continue;

      // Never treat a generic @channel URL as a project's live demo or playlist
      if (isYt && isGenericYouTubeChannelUrl(url)) continue;

      const context = `${currentHeading} ${linePlainText} ${label}`.toLowerCase();
      const isPlaylistUrl = isYouTubePlaylistUrl(url);
      const hasPlaylistContext = /(playlist|view\s*all\s*(?:the\s*)?playlist|full\s*review|full\s*reviews|full\s*demo|full\s*demos|main\s*demo|main\s*view|all\s*demos|walkthrough\s*series|episode|قائمة\s*تشغيل|المراجعة\s*الشاملة|الشرح\s*الكامل)/i.test(context);
      const hasLiveContext = /(last\s*update|last\s*updates|latest\s*update|latest\s*updates|latest\s*demo|live\s*demo|live\s*preview|new\s*update|shorts|demo\s*video|quick\s*demo|showcase|try\s*live|web\s*demo|عرض\s*حي|آخر\s*تحديث|أحدث\s*تحديث)/i.test(context);

      if (isPlaylistUrl || (hasPlaylistContext && !hasLiveContext)) {
        const priority = isPlaylistUrl ? 2 : 1;
        if (priority > explicitPlaylistPriority) {
          result.playlistUrl = url;
          explicitPlaylistPriority = priority;
        }
        continue;
      }

      const hasVideoId = Boolean(extractYouTubeVideoId(url));
      if (hasLiveContext || hasVideoId || isWebDemo) {
        const priority = hasLiveContext ? 2 : 1;
        if (priority > explicitLivePriority) {
          result.liveDemoUrl = url;
          explicitLivePriority = priority;
        }
      }
    }
  }

  return result;
}

/**
 * Intercepts raw GitHub image paths and Markdown/HTML image tags in README documentation
 * and automatically wraps them in a responsive container with lazy-loading placeholders
 * to prevent layout shifts (CLS) when high-resolution assets load.
 */
export function interceptAndWrapReadmeImages(readmeText?: string | null): string {
  if (!readmeText) return '';
  let processed = readmeText;

  // 1. Intercept Markdown images: ![alt](url)
  processed = processed.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^\s)]+\.(?:png|jpg|jpeg|webp|gif)(?:\?[^\s)]*)?)\)/gi,
    (_match, alt, url) => {
      return `<div class="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 my-4 shadow-md flex items-center justify-center">
  <img src="${url}" alt="${alt || 'Repository Asset'}" loading="lazy" class="w-full h-full object-cover transition-opacity duration-300" />
</div>`;
    }
  );

  // 2. Intercept HTML img tags: <img src="url" ...>
  processed = processed.replace(
    /<img\s+([^>]*src=["']([^"']+)["'][^>]*)>/gi,
    (_match, inner, _url) => {
      const hasLazy = inner.includes('loading="lazy"') ? inner : `loading="lazy" ${inner}`;
      return `<div class="relative w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 my-4 shadow-md"><img ${hasLazy} class="w-full h-full object-cover" /></div>`;
    }
  );

  return processed;
}

/**
 * Regex-based pre-processor that strips outdated HTML or legacy formatting, normalizing the content structure before it's rendered.
 */
export function preprocessReadmeContent(readmeText?: string | null): string {
  if (!readmeText) return '';
  let processed = readmeText;

  // 1. Strip HTML comments
  processed = processed.replace(/<!--[\s\S]*?-->/g, '');

  // 2. Normalize legacy alignment / center tags
  processed = processed.replace(/<\/?center>/gi, '');
  processed = processed.replace(/<p align="[^"]+">/gi, '<p>');

  // 3. Normalize broken or legacy header formatting if structure changes
  processed = processed.replace(/<div[^>]*>/gi, '\n');
  processed = processed.replace(/<\/div>/gi, '\n');

  // 4. Intercept and wrap raw GitHub / Markdown image paths in responsive lazy-loading containers
  processed = interceptAndWrapReadmeImages(processed);

  return processed.trim();
}

export function clearAllGitHubLocalCache(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('gh_') ||
         key.startsWith('ahmed_gh_cache') ||
         key.startsWith('ahmed_consolidated_gh_') ||
         key.startsWith('releases_cache_') ||
         key.startsWith('live_media_') ||
         key.startsWith('repo-'))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

export interface GitHubWebhookPayload {
  ref?: string;
  repository?: {
    name?: string;
    full_name?: string;
    updated_at?: string;
  };
  commits?: Array<{
    added?: string[];
    modified?: string[];
    removed?: string[];
  }>;
  action?: string;
  release?: any;
}

/**
 * Service layer function that uses GitHub Webhooks (or simulated webhooks) to trigger
 * a manual cache invalidation via the QueryClient and localStorage when a repository README or metadata is updated.
 */
export async function handleGitHubWebhookInvalidation(
  payload: GitHubWebhookPayload,
  queryClient?: any
): Promise<{ success: boolean; invalidatedKeys: string[]; repoName?: string }> {
  const repoName = payload?.repository?.name || '';
  const invalidatedKeys: string[] = [];

  clearAllGitHubLocalCache();

  // Invalidate QueryClient cache if provided
  if (queryClient && typeof queryClient.invalidateQueries === 'function') {
    try {
      await queryClient.invalidateQueries();
      invalidatedKeys.push('all-queries');
    } catch {}
  }

  return {
    success: true,
    invalidatedKeys,
    repoName: repoName.trim(),
  };
}

/**
 * Fetches raw repository README with strict cache-busting and no-cache headers so link parsing always inspects original Markdown/HTML.
 */
export async function fetchRawRepoReadme(repoName: string, username: string = 'ahmed-el-bialy'): Promise<string | null> {
  if (!repoName) return null;
  const cleanRepo = repoName.trim();
  const cacheKey = `gh_readme_raw_${username}_${cleanRepo}`;
  const timestamp = Date.now();

  try {
    // 1. Try GitHub REST API first with timestamp cache-busting (no CORS-blocked Cache-Control headers)
    const apiRes = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(cleanRepo)}/readme?t=${timestamp}`,
      {
        headers: {
          Accept: "application/vnd.github.raw+json"
        },
        cache: 'no-store'
      }
    );
    if (apiRes.ok) {
      const text = await apiRes.text();
      if (text && text.length > 10) {
        if (typeof window !== 'undefined') {
          try { localStorage.setItem(cacheKey, text); } catch {}
        }
        return text;
      }
    }

    // 2. Fallback to raw branches with timestamp cache-busting (simple CORS-safe GET)
    const branches = ['main', 'master'];
    for (const branch of branches) {
      const url = `https://raw.githubusercontent.com/${encodeURIComponent(username)}/${encodeURIComponent(cleanRepo)}/${branch}/README.md?t=${timestamp}`;
      const res = await fetch(url, {
        cache: 'no-store'
      });
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 10) {
          if (typeof window !== 'undefined') {
            try { localStorage.setItem(cacheKey, text); } catch {}
          }
          return text;
        }
      }
    }
  } catch {}

  // 3. Fallback to localStorage if offline
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return cached;
    } catch {}
  }
  return null;
}

/**
 * Fetches repository README and applies rendering normalization.
 */
export async function fetchRepoReadme(repoName: string, username: string = 'ahmed-el-bialy'): Promise<string | null> {
  const raw = await fetchRawRepoReadme(repoName, username);
  return raw ? preprocessReadmeContent(raw) : null;
}

export interface RepoCaseStudyData {
  en: string | null;
  ar: string | null;
}

/**
 * Fetches live CASE_STUDY.md and CASE_STUDY_AR.md directly from the repository root.
 * Returns null per missing file so the UI never displays fabricated study case data.
 */
export async function fetchRepoCaseStudies(
  repoName: string,
  defaultBranch: string = 'main',
  username: string = 'ahmed-el-bialy',
  forceRefresh: boolean = false
): Promise<RepoCaseStudyData> {
  if (!repoName) return { en: null, ar: null };
  const cleanRepo = repoName.trim();
  const cacheKey = `gh_casestudy_v1_${username}_${cleanRepo}`;

  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        const parsed = JSON.parse(cachedRaw);
        if (parsed && Date.now() - (parsed.timestamp || 0) < 1000 * 60 * 15) {
          return {
            en: parsed.en || null,
            ar: parsed.ar || null,
          };
        }
      }
    } catch {}
  }

  const branchCandidates = Array.from(new Set([defaultBranch || 'main', 'main', 'master']));
  const fetchMarkdownFile = async (filename: string): Promise<string | null> => {
    const bust = forceRefresh ? `?t=${Date.now()}` : '';
    for (const branch of branchCandidates) {
      try {
        const res = await fetch(
          `https://raw.githubusercontent.com/${encodeURIComponent(username)}/${encodeURIComponent(
            cleanRepo
          )}/${encodeURIComponent(branch)}/${filename}${bust}`,
          { cache: forceRefresh ? 'no-store' : 'default' }
        );
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim().length > 15) {
            return text;
          }
        }
        // If default branch responded explicitly with 404, only check alternate branch if main vs master differs
        if (res.status === 404 && branch !== defaultBranch) {
          break;
        }
      } catch {}
    }
    return null;
  };

  const [enRaw, arRaw] = await Promise.all([
    fetchMarkdownFile('CASE_STUDY.md'),
    fetchMarkdownFile('CASE_STUDY_AR.md'),
  ]);

  const result: RepoCaseStudyData = {
    en: enRaw ? preprocessReadmeContent(enRaw) : null,
    ar: arRaw ? preprocessReadmeContent(arRaw) : null,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ timestamp: Date.now(), en: result.en, ar: result.ar })
      );
    } catch {}
  }

  return result;
}

/**
 * Fetches latest repository release data from GitHub API with full asset and APK inspection with cache-busting
 */
export async function fetchRepositoryReleaseData(
  repoName: string,
  username: string = 'ahmed-el-bialy'
): Promise<RepoReleaseInfo> {
  if (!repoName) return { hasRelease: false };
  const cleanRepo = repoName.trim();
  const cacheKey = `gh_rel_${username}_${cleanRepo}`;
  const timestamp = Date.now();

  try {
    // 1. Query latest published release live from GitHub (CORS-safe simple GET + no-store)
    let res = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(cleanRepo)}/releases/latest?t=${timestamp}`,
      {
        headers: {
          Accept: "application/vnd.github+json"
        },
        cache: 'no-store'
      }
    );

    let releaseData: any = null;

    if (res.ok) {
      releaseData = await res.json();
    } else {
      // 2. Query release list for pre-releases or recent tags
      const listRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(cleanRepo)}/releases?per_page=1&t=${timestamp}`,
        {
          headers: {
            Accept: "application/vnd.github+json"
        },
        cache: 'no-store'
      });
      if (listRes.ok) {
        const listData = await listRes.json();
        if (Array.isArray(listData) && listData.length > 0) {
          releaseData = listData[0];
        }
      }
    }

    if (releaseData && releaseData.html_url) {
      const assets = Array.isArray(releaseData.assets) ? releaseData.assets : [];
      const apkAsset = assets.find((a: any) => typeof a.name === 'string' && a.name.toLowerCase().endsWith('.apk'));

      const result: RepoReleaseInfo = {
        hasRelease: true,
        releaseUrl: releaseData.html_url,
        tagName: releaseData.tag_name || releaseData.name || 'v1.0.0',
        name: releaseData.name,
        publishedAt: releaseData.published_at || releaseData.created_at,
        apkDownloadUrl: apkAsset ? apkAsset.browser_download_url : undefined,
        apkFileName: apkAsset ? apkAsset.name : undefined,
        apkSize: apkAsset ? apkAsset.size : undefined,
        assetsCount: assets.length,
        prerelease: Boolean(releaseData.prerelease),
        body: releaseData.body,
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch {}
      }

      return result;
    }

    return { hasRelease: false };
  } catch {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return { hasRelease: false };
  }
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Checks if a GitHub repository actually has a published release or APK asset (alias for backwards compatibility)
 */
export async function checkRepoRelease(repoName: string, username: string = 'ahmed-el-bialy'): Promise<RepoReleaseInfo> {
  return fetchRepositoryReleaseData(repoName, username);
}

/**
 * Automatically checks and fetches releases across all repositories and production apps
 */
/**
  * Automatically checks and fetches releases across all repositories and production apps
  */
export async function fetchAllRepoReleases(
  repoNames: string[],
  username: string = 'ahmed-el-bialy'
): Promise<Record<string, RepoReleaseInfo>> {
  const cacheKey = `releases_cache_${username}`;
  let cachedMap: Record<string, RepoReleaseInfo> = {};
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) cachedMap = JSON.parse(cached);
    } catch {}
  }

  const results: Record<string, RepoReleaseInfo> = { ...cachedMap };
  const uniqueNames = Array.from(new Set(repoNames.filter(Boolean))).slice(0, 25);

  await Promise.all(
    uniqueNames.map(async (name) => {
      try {
        const info = await fetchRepositoryReleaseData(name, username);
        results[name] = info;
        results[name.toLowerCase()] = info;
      } catch {
        results[name] = { hasRelease: false };
        results[name.toLowerCase()] = { hasRelease: false };
      }
    })
  );

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(results));
    } catch {}
  }

  return results;
}

export interface RepoLiveMetadata {
  repoName: string;
  liveDemoUrl?: string;
  playlistUrl?: string;
  googlePlayUrl?: string;
  apkDownloadUrl?: string;
  releaseUrl?: string;
  discoveredScreenshots?: string[];
  hasRelease: boolean;
  readmeText?: string;
  rawReadmeText?: string;
  defaultBranch?: string;
  starsCount?: number;
  forksCount?: number;
  pushedAt?: string;
  language?: string | null;
  topics?: string[];
  description?: string | null;
  lastChecked: number;
}

/**
 * Live repository media resolver:
 * Fetches latest raw README with timestamp cache-busting, extracts liveDemoUrl (Latest Update / Live Demo)
 * and playlistUrl (Main Demo / Full Review / Playlist), plus Google Play badges, screenshots, and APK assets.
 */
export async function fetchRepoLiveMetadata(
  repoName: string,
  username: string = 'ahmed-el-bialy',
  forceRefresh: boolean = false
): Promise<RepoLiveMetadata> {
  const cleanName = repoName.trim();
  const cacheKey = `live_media_v4_${username}_${cleanName}`;

  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - (parsed.lastChecked || 0) < 1000 * 60 * 2 && parsed.rawReadmeText) {
          return parsed;
        }
      }
    } catch {}
  }

  // 1. Fetch live fresh raw README with cache-busting timestamp & no-cache headers in parallel with releases & repo screenshots
  const [rawReadme, releaseInfo, folderScreens] = await Promise.all([
    fetchRawRepoReadme(cleanName, username).catch(() => null),
    fetchRepositoryReleaseData(cleanName, username).catch((): RepoReleaseInfo => ({ hasRelease: false })),
    fetchRepoScreenshots(cleanName, username).catch((): string[] => []),
  ]);

  // 2. Parse links & embedded screenshots dynamically from fresh raw README
  const parsedLinks = parseLinksFromReadme(rawReadme);
  const embeddedScreens = extractEmbeddedReadmeScreenshots(rawReadme);
  const combinedScreens = Array.from(new Set([...folderScreens, ...embeddedScreens]));

  // 3. Verified known fallback mappings ONLY if README didn't declare them
  const known = KNOWN_REPO_MEDIA[cleanName] || KNOWN_REPO_MEDIA[cleanName.toLowerCase()] || {};

  const metadata: RepoLiveMetadata = {
    repoName: cleanName,
    liveDemoUrl: parsedLinks.liveDemoUrl || known.liveDemoUrl,
    playlistUrl: parsedLinks.playlistUrl || known.playlistUrl,
    googlePlayUrl: parsedLinks.playStoreUrl || known.playStore,
    apkDownloadUrl: releaseInfo.apkDownloadUrl || parsedLinks.apkUrl,
    releaseUrl: releaseInfo.releaseUrl,
    discoveredScreenshots: combinedScreens.length > 0 ? combinedScreens : undefined,
    hasRelease: Boolean(releaseInfo.hasRelease),
    rawReadmeText: rawReadme || undefined,
    readmeText: rawReadme ? preprocessReadmeContent(rawReadme) : undefined,
    lastChecked: Date.now()
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(metadata));
    } catch {}
  }

  return metadata;
}

/**
 * Resolves live real-time media across all repositories and production apps
 */
export async function fetchAllReposLiveMetadata(
  repoNames: string[],
  username: string = 'ahmed-el-bialy',
  forceRefresh: boolean = false
): Promise<Record<string, RepoLiveMetadata>> {
  const unique = Array.from(new Set(repoNames.filter(Boolean))).slice(0, 25);
  const results: Record<string, RepoLiveMetadata> = {};

  await Promise.all(
    unique.map(async (name) => {
      try {
        const meta = await fetchRepoLiveMetadata(name, username, forceRefresh);
        results[name] = meta;
        results[name.toLowerCase()] = meta;
      } catch {}
    })
  );

  return results;
}

export interface ConsolidatedGitHubPortfolio {
  stats: GitHubStats;
  repos: GitHubRepo[];
  releasesMap: Record<string, RepoReleaseInfo>;
  liveMediaMap: Record<string, RepoLiveMetadata>;
  isServerCached?: boolean;
  isFallback?: boolean;
}

export function getCachedConsolidatedPortfolio(
  username: string = 'ahmed-el-bialy'
): ConsolidatedGitHubPortfolio | undefined {
  if (typeof window === 'undefined') return undefined;
  const cleanUsername = username.trim() || 'ahmed-el-bialy';
  try {
    const raw = localStorage.getItem(`ahmed_consolidated_gh_v3_${cleanUsername}`);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (parsed?.data?.repos) return parsed.data;
  } catch {}
  return undefined;
}

/**
 * Returns verified screenshots for a repo (used by 3-slide card cover & gallery preloading).
 */
export function getVerifiedProjectScreenshots(repoName: string): string[] {
  const clean = repoName.trim();
  const matched =
    VERIFIED_REPO_SCREENSHOTS[clean] ||
    VERIFIED_REPO_SCREENSHOTS[clean.toLowerCase()] ||
    Object.entries(VERIFIED_REPO_SCREENSHOTS).find(
      ([k]) => k.toLowerCase() === clean.toLowerCase()
    )?.[1];
  return matched || [];
}

function mapRawReposAndStats(
  cleanUsername: string,
  userData: any,
  reposList: any[],
  isFromCache: boolean
): { stats: GitHubStats; repos: GitHubRepo[] } {
  const validRepos: GitHubRepo[] = reposList
    .filter((r) => r?.name && r.name.toLowerCase() !== cleanUsername.toLowerCase())
    .map((r) => {
      const branch = r.default_branch || 'main';
      const verifiedShot =
        VERIFIED_REPO_SCREENSHOTS[r.name]?.[0] ||
        VERIFIED_REPO_SCREENSHOTS[r.name.toLowerCase()]?.[0];
      const primaryCover =
        r.name.toLowerCase() === 'revio'
          ? `https://raw.githubusercontent.com/${encodeURIComponent(cleanUsername)}/${encodeURIComponent(r.name)}/${encodeURIComponent(branch)}/screenshots/cover.png`
          : verifiedShot || undefined;
      const known = KNOWN_REPO_MEDIA[r.name] || KNOWN_REPO_MEDIA[r.name.toLowerCase()] || {};

      return {
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        description: r.description,
        html_url: r.html_url,
        homepage: r.homepage,
        stargazers_count: r.stargazers_count || 0,
        forks_count: r.forks_count || 0,
        language: r.language || 'Dart',
        topics: r.topics || [],
        updated_at: r.updated_at,
        pushed_at: r.pushed_at || r.updated_at,
        created_at: r.created_at,
        is_fork: Boolean(r.fork),
        size: r.size || 0,
        default_branch: branch,
        coverImageUrl: primaryCover,
        liveDemoUrl: known.liveDemoUrl,
        playlistUrl: known.playlistUrl,
        googlePlayUrl: known.playStore,
      };
    });

  const totalStars = validRepos.reduce((acc, r) => acc + r.stargazers_count, 0);
  const totalForks = validRepos.reduce((acc, r) => acc + r.forks_count, 0);

  const langCounts: Record<string, number> = {};
  validRepos.forEach((r) => {
    if (r.language) {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    }
  });
  const totalLangRepos = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;
  const languages = Object.entries(langCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalLangRepos) * 100),
      color: getLanguageColor(name),
    }))
    .sort((a, b) => b.count - a.count);

  const stats: GitHubStats = {
    username: userData?.login || cleanUsername,
    name: userData?.name || 'Ahmed El-Bialy',
    avatar_url: userData?.avatar_url || 'https://avatars.githubusercontent.com/u/245139141?v=4',
    bio: userData?.bio || 'Junior Flutter Developer | B.Sc. Student in AI | Mobile App Developer',
    public_repos: userData?.public_repos ?? validRepos.length,
    followers: userData?.followers || 2,
    following: userData?.following || 2,
    totalStars,
    totalForks,
    languages,
    isFromCache,
  };

  return { stats, repos: validRepos };
}

/**
 * Single batched fetch against the Express cached GitHub aggregation endpoint (/api/github/portfolio).
 * Falls back transparently to local cached/verified data when backend proxy is unavailable.
 */
export async function fetchConsolidatedGitHubPortfolio(
  username: string = 'ahmed-el-bialy',
  forceRefresh: boolean = false
): Promise<ConsolidatedGitHubPortfolio> {
  const cleanUsername = username.trim() || 'ahmed-el-bialy';
  const cacheKey = `ahmed_consolidated_gh_v3_${cleanUsername}`;

  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        const parsed = JSON.parse(cachedRaw);
        if (parsed?.timestamp && Date.now() - parsed.timestamp < 1000 * 60 * 5 && parsed.data) {
          return parsed.data;
        }
      }
    } catch {}
  }

  try {
    const res = await fetch(
      `/api/github/portfolio?username=${encodeURIComponent(cleanUsername)}${forceRefresh ? '&refresh=1' : ''}`
    );
    if (res.ok) {
      const json = await res.json();
      if (json?.success && Array.isArray(json.repos)) {
        const { stats, repos } = mapRawReposAndStats(
          cleanUsername,
          json.user,
          json.repos,
          Boolean(json.stale)
        );
        const releasesMap: Record<string, RepoReleaseInfo> = {};
        const rawReleases = json.releasesMap || {};
        Object.entries(rawReleases).forEach(([k, v]: [string, any]) => {
          releasesMap[k] = v;
          releasesMap[k.toLowerCase()] = v;
        });

        const liveMediaMap: Record<string, RepoLiveMetadata> = {};
        const rawReadmes: Record<string, string> = json.rawReadmes || {};
        const screenshotsMap: Record<string, { coverUrl?: string; screens?: string[] }> =
          json.screenshotsMap || {};
        const allNames = Array.from(
          new Set([
            ...repos.map((r) => r.name),
            ...Object.keys(KNOWN_REPO_MEDIA),
          ])
        );

        allNames.forEach((name) => {
          const rawReadme =
            rawReadmes[name] ||
            Object.entries(rawReadmes).find(([rk]) => rk.toLowerCase() === name.toLowerCase())?.[1] ||
            null;
          const screensEntry =
            screenshotsMap[name] ||
            Object.entries(screenshotsMap).find(([sk]) => sk.toLowerCase() === name.toLowerCase())?.[1];
          const discoveredScreens =
            screensEntry?.screens && screensEntry.screens.length > 0
              ? screensEntry.screens
              : extractEmbeddedReadmeScreenshots(rawReadme);

          const repoMatch = repos.find((r) => r.name.toLowerCase() === name.toLowerCase());
          if (repoMatch) {
            if (screensEntry?.coverUrl) {
              repoMatch.coverImageUrl = screensEntry.coverUrl;
            }
            if (discoveredScreens.length > 0) {
              repoMatch.discoveredScreenshots = discoveredScreens;
            }
          }

          const parsedLinks = parseLinksFromReadme(rawReadme);
          const known = KNOWN_REPO_MEDIA[name] || KNOWN_REPO_MEDIA[name.toLowerCase()] || {};
          const releaseInfo = releasesMap[name] || releasesMap[name.toLowerCase()] || { hasRelease: false };

          const meta: RepoLiveMetadata = {
            repoName: name,
            liveDemoUrl: parsedLinks.liveDemoUrl || known.liveDemoUrl,
            playlistUrl: parsedLinks.playlistUrl || known.playlistUrl,
            googlePlayUrl: parsedLinks.playStoreUrl || known.playStore,
            apkDownloadUrl: releaseInfo.apkDownloadUrl || parsedLinks.apkUrl,
            releaseUrl: releaseInfo.releaseUrl,
            discoveredScreenshots: discoveredScreens.length > 0 ? discoveredScreens : undefined,
            hasRelease: Boolean(releaseInfo.hasRelease),
            rawReadmeText: rawReadme || undefined,
            readmeText: rawReadme ? preprocessReadmeContent(rawReadme) : undefined,
            defaultBranch: repoMatch?.default_branch || 'main',
            starsCount: repoMatch?.stargazers_count,
            forksCount: repoMatch?.forks_count,
            pushedAt: repoMatch?.pushed_at,
            language: repoMatch?.language,
            topics: repoMatch?.topics,
            description: repoMatch?.description,
            lastChecked: Date.now(),
          };
          liveMediaMap[name] = meta;
          liveMediaMap[name.toLowerCase()] = meta;
        });

        const consolidated: ConsolidatedGitHubPortfolio = {
          stats,
          repos,
          releasesMap,
          liveMediaMap,
          isServerCached: Boolean(json.cached),
        };

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: consolidated }));
          } catch {}
        }

        return consolidated;
      }
    }
  } catch {
    // Fallback below (e.g. static deployments without Express backend)
  }

  // Respect offline mode immediately if localStorage has cached data
  if (!forceRefresh && typeof window !== 'undefined' && navigator.onLine === false) {
    try {
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        const parsed = JSON.parse(cachedRaw);
        if (parsed?.data) {
          return {
            ...parsed.data,
            stats: { ...parsed.data.stats, isFromCache: true },
          };
        }
      }
    } catch {}
  }

  // Helper to resolve static snapshot generated by GitHub Actions (.github/workflows/sync-data.yml)
  const tryStaticSnapshot = async (): Promise<ConsolidatedGitHubPortfolio | null> => {
    if (typeof window === 'undefined') return null;
    try {
      const snapRes = await fetch('/github-data.json', { cache: forceRefresh ? 'no-store' : 'default' });
      if (!snapRes.ok) return null;
      const snap = await snapRes.json();
      if (snap?.user && Array.isArray(snap.repositories) && snap.repositories.length > 0) {
        const { stats, repos } = mapRawReposAndStats(
          cleanUsername,
          snap.user,
          snap.repositories,
          false
        );
        const releasesMap: Record<string, RepoReleaseInfo> = {};
        const liveMediaMap: Record<string, RepoLiveMetadata> = {};
        repos.forEach((r) => {
          const known = KNOWN_REPO_MEDIA[r.name] || KNOWN_REPO_MEDIA[r.name.toLowerCase()] || {};
          const meta: RepoLiveMetadata = {
            repoName: r.name,
            liveDemoUrl: r.liveDemoUrl || known.liveDemoUrl,
            playlistUrl: r.playlistUrl || known.playlistUrl,
            googlePlayUrl: r.googlePlayUrl || known.playStore,
            apkDownloadUrl: r.apkDownloadUrl,
            releaseUrl: r.releaseUrl,
            hasRelease: Boolean(r.releaseUrl || r.apkDownloadUrl),
            defaultBranch: r.default_branch || 'main',
            starsCount: r.stargazers_count,
            forksCount: r.forks_count,
            pushedAt: r.pushed_at,
            language: r.language,
            topics: r.topics,
            description: r.description,
            lastChecked: Date.now(),
          };
          liveMediaMap[r.name] = meta;
          liveMediaMap[r.name.toLowerCase()] = meta;
        });
        return {
          stats: { ...stats, isFromCache: true },
          repos,
          releasesMap,
          liveMediaMap,
          isServerCached: true,
          isFallback: true,
        };
      }
    } catch {}
    return null;
  };

  // Client-direct live GitHub API + raw README sync for static hosting (Vercel/Netlify/GitHub Pages without server.ts)
  // Runs BEFORE static /github-data.json whenever online so brand-new repos/README edits appear immediately!
  const isBrowserOnline = typeof navigator === 'undefined' || navigator.onLine !== false;
  if (isBrowserOnline) {
    const liveStatsAndRepos = await fetchGitHubUserStats(cleanUsername);
    if (!liveStatsAndRepos.stats.isFromCache && liveStatsAndRepos.repos.length > 0) {
      const releasesMap: Record<string, RepoReleaseInfo> = {};
      const liveMediaMap: Record<string, RepoLiveMetadata> = {};
      const targetRepos = liveStatsAndRepos.repos.slice(0, 15);
      const directReadmes: Record<string, string | null> = {};

      await Promise.all(
        targetRepos.map(async (r) => {
          const branches = Array.from(new Set([r.default_branch || 'main', 'main', 'master']));
          for (const branch of branches) {
            try {
              const rawRes = await fetch(
                `https://raw.githubusercontent.com/${encodeURIComponent(cleanUsername)}/${encodeURIComponent(r.name)}/${encodeURIComponent(branch)}/README.md`,
                { cache: forceRefresh ? 'no-store' : 'default' }
              );
              if (rawRes.ok) {
                const text = await rawRes.text();
                if (text && text.length > 10) {
                  directReadmes[r.name] = text;
                  return;
                }
              }
            } catch {}
          }
          directReadmes[r.name] = null;
        })
      );

      liveStatsAndRepos.repos.forEach((r) => {
        const rawReadme = directReadmes[r.name] || null;
        const parsedLinks = parseLinksFromReadme(rawReadme);
        const known = KNOWN_REPO_MEDIA[r.name] || KNOWN_REPO_MEDIA[r.name.toLowerCase()] || {};
        const readmeScreens = extractEmbeddedReadmeScreenshots(rawReadme);
        if (readmeScreens.length > 0) {
          r.discoveredScreenshots = readmeScreens;
        }

        const meta: RepoLiveMetadata = {
          repoName: r.name,
          liveDemoUrl: parsedLinks.liveDemoUrl || r.liveDemoUrl || known.liveDemoUrl,
          playlistUrl: parsedLinks.playlistUrl || r.playlistUrl || known.playlistUrl,
          googlePlayUrl: parsedLinks.playStoreUrl || r.googlePlayUrl || known.playStore,
          apkDownloadUrl: parsedLinks.apkUrl || r.apkDownloadUrl,
          releaseUrl: r.releaseUrl,
          discoveredScreenshots: readmeScreens.length > 0 ? readmeScreens : undefined,
          hasRelease: Boolean(r.releaseUrl || r.apkDownloadUrl || parsedLinks.apkUrl),
          rawReadmeText: rawReadme || undefined,
          readmeText: rawReadme ? preprocessReadmeContent(rawReadme) : undefined,
          defaultBranch: r.default_branch || 'main',
          starsCount: r.stargazers_count,
          forksCount: r.forks_count,
          pushedAt: r.pushed_at,
          language: r.language,
          topics: r.topics,
          description: r.description,
          lastChecked: Date.now(),
        };

        liveMediaMap[r.name] = meta;
        liveMediaMap[r.name.toLowerCase()] = meta;

        if (r.releaseUrl || r.apkDownloadUrl || parsedLinks.apkUrl) {
          const rel: RepoReleaseInfo = {
            hasRelease: true,
            releaseUrl: r.releaseUrl,
            apkDownloadUrl: parsedLinks.apkUrl || r.apkDownloadUrl,
          };
          releasesMap[r.name] = rel;
          releasesMap[r.name.toLowerCase()] = rel;
        }
      });

      const liveConsolidated: ConsolidatedGitHubPortfolio = {
        stats: liveStatsAndRepos.stats,
        repos: liveStatsAndRepos.repos,
        releasesMap,
        liveMediaMap,
        isServerCached: false,
        isFallback: false,
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: liveConsolidated }));
        } catch {}
      }

      return liveConsolidated;
    }
  }

  // Fallback to GitHub Actions snapshot if GitHub REST API is rate-limited
  if (!forceRefresh) {
    const snap = await tryStaticSnapshot();
    if (snap) return snap;
  }

  // Fallback to previous client-side cache
  if (typeof window !== 'undefined') {
    try {
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        const parsed = JSON.parse(cachedRaw);
        if (parsed?.data) {
          return {
            ...parsed.data,
            stats: { ...parsed.data.stats, isFromCache: true },
            isFallback: true,
          };
        }
      }
    } catch {}
  }

  // Final verified snapshot / default fallback
  const finalSnap = await tryStaticSnapshot();
  if (finalSnap) return finalSnap;

  const fallbackStatsAndRepos = await fetchGitHubUserStats(cleanUsername);
  return {
    stats: { ...fallbackStatsAndRepos.stats, isFromCache: true },
    repos: fallbackStatsAndRepos.repos,
    releasesMap: {},
    liveMediaMap: {},
    isServerCached: false,
    isFallback: true,
  };
}

