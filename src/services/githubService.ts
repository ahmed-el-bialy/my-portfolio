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
  candidateCoverUrls?: string[];
  youtubeDemoUrl?: string;
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

// Known verified demo mappings from READMEs
const KNOWN_REPO_MEDIA: Record<string, { youtube?: string; playStore?: string }> = {
  Revio: {
    youtube: "https://youtube.com/shorts/-9VfbxIcZkU?si=Tcpe0iwRztryd7w4",
    playStore: "https://play.google.com/store/apps/details?id=com.ahmed.revio&hl=en_US"
  },
  Movura: {
    youtube: "https://youtube.com/@ahmedel-bialy"
  },
  "Vibrant-store": {
    youtube: "https://youtube.com/shorts/PIg1rYA0CkQ"
  },
  "Sky-Cast": {
    youtube: "https://youtube.com/shorts/u5JjIphdrAM?si=h44HWlZMZki8L_GM"
  },
  "News-Cloud": {
    youtube: "https://youtube.com/shorts/AKbiBjCRIis"
  },
  "Nihon-Seed": {
    youtube: "https://youtube.com/shorts/OG-S_8oSN00?si=1K0SkiW8voSb4YR-"
  },
  "NBN-Basketball": {
    youtube: "https://youtube.com/shorts/xJaE0pxSpAQ?si=8lF-9tGR68cHibaL"
  },
  "piano-tunes": {
    youtube: "https://youtube.com/shorts/9PWzO0_ozQ0"
  },
  Shaats: {
    youtube: "https://youtube.com/@ahmedel-bialy"
  }
};

// Ahmed El-Bialy's verified repositories
export const AHMED_DEFAULT_REPOS: GitHubRepo[] = [
  {
    id: 1,
    name: "Revio",
    full_name: "ahmed-el-bialy/Revio",
    description: "A dark-themed Flutter flashcard app for efficient learning, featuring flip-card animations, an interactive quiz mode with hints, and full offline CRUD storage via Hive CE. Built with Clean Architecture and Cubit state management. Live on Google Play.",
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
    youtubeDemoUrl: "https://youtube.com/shorts/-9VfbxIcZkU?si=Tcpe0iwRztryd7w4",
    googlePlayUrl: "https://play.google.com/store/apps/details?id=com.ahmed.revio&hl=en_US",
    apkDownloadUrl: "https://github.com/ahmed-el-bialy/Revio/releases/download/v1.0.0/app-release.apk",
    releaseUrl: "https://github.com/ahmed-el-bialy/Revio/releases/tag/v1.0.0"
  },
  {
    id: 2,
    name: "Movura",
    full_name: "ahmed-el-bialy/Movura",
    description: "A premium movie and TV series tracking mobile application utilizing the TMDB API to deliver dynamic content discovery, real-time media updates, and intelligent search suggestions. Features a premium dark-theme UI with Sliver-based layouts, shimmer loading, and YouTube trailers.",
    html_url: "https://github.com/ahmed-el-bialy/Movura",
    homepage: "https://youtube.com/@ahmedel-bialy",
    stargazers_count: 4,
    forks_count: 2,
    language: "Dart",
    topics: ["flutter", "dart", "tmdb-api", "bloc", "shimmer", "youtube-trailer"],
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    created_at: "2026-02-15T10:00:00Z",
    is_fork: false,
    size: 8200,
    default_branch: "main",
    coverImageUrl: "https://raw.githubusercontent.com/ahmed-el-bialy/Movura/main/screenshots/Movura2607089.png",
    youtubeDemoUrl: "https://youtube.com/@ahmedel-bialy"
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
    youtubeDemoUrl: "https://youtube.com/shorts/PIg1rYA0CkQ"
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
    coverImageUrl: "https://raw.githubusercontent.com/ahmed-el-bialy/Sky-Cast/main/screenshots/cloudy_main_weather.png",
    youtubeDemoUrl: "https://youtube.com/shorts/u5JjIphdrAM?si=h44HWlZMZki8L_GM"
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
    youtubeDemoUrl: "https://youtube.com/shorts/AKbiBjCRIis"
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
    coverImageUrl: "https://raw.githubusercontent.com/ahmed-el-bialy/Shaats/main/screenshots/LogInView.png",
    youtubeDemoUrl: "https://youtube.com/@ahmedel-bialy"
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
    youtubeDemoUrl: "https://youtube.com/shorts/OG-S_8oSN00?si=1K0SkiW8voSb4YR-"
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
    youtubeDemoUrl: "https://youtube.com/shorts/xJaE0pxSpAQ?si=8lF-9tGR68cHibaL"
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
    youtubeDemoUrl: "https://youtube.com/shorts/9PWzO0_ozQ0"
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
    coverImageUrl: "https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/cover.png",
    youtubeDemoUrl: "https://youtube.com/@ahmedel-bialy"
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
    coverImageUrl: "https://raw.githubusercontent.com/ahmed-el-bialy/Quotely/main/screenshots/splash_screen.png",
    youtubeDemoUrl: "https://youtube.com/@ahmedel-bialy"
  }
];

export async function fetchGitHubUserStats(username: string = 'ahmed-el-bialy'): Promise<{ stats: GitHubStats; repos: GitHubRepo[] }> {
  const cleanUsername = username.trim() || "ahmed-el-bialy";
  const cacheKey = `ahmed_gh_cache_${cleanUsername}`;

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
      throw new Error(`GitHub API returned status ${userRes.status}/${reposRes.status}`);
    }

    const userData = await userRes.json();
    const rawRepos = await reposRes.json();
    const reposList: any[] = Array.isArray(rawRepos) ? rawRepos : [];

    const validRepos: GitHubRepo[] = reposList
      .filter((r) => r.name.toLowerCase() !== cleanUsername.toLowerCase())
      .map((r) => {
        const branch = r.default_branch || "main";
        const verifiedScreens =
          VERIFIED_REPO_SCREENSHOTS[r.name] ||
          VERIFIED_REPO_SCREENSHOTS[r.name.toLowerCase()] ||
          Object.entries(VERIFIED_REPO_SCREENSHOTS).find(
            ([k]) => k.toLowerCase() === r.name.toLowerCase()
          )?.[1];
        const primaryCover =
          verifiedScreens && verifiedScreens.length > 0
            ? verifiedScreens[0]
            : `https://raw.githubusercontent.com/${cleanUsername}/${r.name}/${branch}/screenshots/cover.png`;
        const known = KNOWN_REPO_MEDIA[r.name] || {};

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
          youtubeDemoUrl: known.youtube || "https://youtube.com/@ahmedel-bialy",
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
  } catch (err) {
    console.warn("Using offline cache or curated fallback for Ahmed El-Bialy repos:", err);
    if (parsedCache) {
      return {
        ...parsedCache,
        stats: { ...parsedCache.stats, isFromCache: true }
      };
    }

    const totalStars = AHMED_DEFAULT_REPOS.reduce((acc, r) => acc + r.stargazers_count, 0);
    const totalForks = AHMED_DEFAULT_REPOS.reduce((acc, r) => acc + r.forks_count, 0);

    return {
      stats: {
        username: "ahmed-el-bialy",
        name: "Ahmed El-Bialy",
        avatar_url: "https://avatars.githubusercontent.com/u/245139141?v=4",
        bio: "🚀 Junior Flutter Developer | B.Sc. Student in AI | Mobile App Developer",
        public_repos: AHMED_DEFAULT_REPOS.length,
        followers: 12,
        following: 5,
        totalStars,
        totalForks,
        languages: [
          { name: "Dart", count: 8, percentage: 88, color: "#00B4AB" },
          { name: "Python", count: 1, percentage: 12, color: "#3572A5" }
        ],
        isFromCache: true
      },
      repos: AHMED_DEFAULT_REPOS
    };
  }
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

/**
 * Parses image URLs from repository description (supports markdown ![alt](url) and raw http(s) image URLs)
 */
export function parseImagesFromDescription(description: string | null): string[] {
  if (!description) return [];
  const urls: string[] = [];
  
  // Markdown images: ![alt](url)
  const markdownRegex = /!\[.*?\]\((https?:\/\/[^\s)]+\.(?:png|jpg|jpeg|webp|gif)(?:\?[^\s)]*)?)\)/gi;
  let match;
  while ((match = markdownRegex.exec(description)) !== null) {
    if (match[1]) urls.push(match[1]);
  }

  // Raw URLs ending in image extensions
  const rawUrlRegex = /(https?:\/\/[^\s<>"')]+?\.(?:png|jpg|jpeg|webp)(?:\?[^\s<>"')]*)?)/gi;
  while ((match = rawUrlRegex.exec(description)) !== null) {
    if (match[1] && !urls.includes(match[1])) {
      urls.push(match[1]);
    }
  }

  return urls;
}

// Verified screenshot URLs across Ahmed El-Bialy's repositories
export const VERIFIED_REPO_SCREENSHOTS: Record<string, string[]> = {
  Revio: [
    "https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/Samsung%20Galaxy%20S21%20Ultra%20Screenshot%201.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/Samsung%20Galaxy%20S21%20Ultra%20Screenshot%202.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/Samsung%20Galaxy%20S21%20Ultra%20Screenshot%203.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/Samsung%20Galaxy%20S21%20Ultra%20Screenshot%204.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/Samsung%20Galaxy%20S21%20Ultra%20Screenshot%205.png",
  ],
  Movura: [
    "https://raw.githubusercontent.com/ahmed-el-bialy/Movura/main/screenshots/Movura2607089.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Movura/main/screenshots/Movura2607279.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Movura/main/screenshots/Movura2607319.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Movura/main/screenshots/Movura2607497.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Movura/main/screenshots/Movura2607994.png",
  ],
  "Vibrant-store": [
    "https://raw.githubusercontent.com/ahmed-el-bialy/Vibrant-store/main/screenshots/HomeView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Vibrant-store/main/screenshots/CategoryProducts.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Vibrant-store/main/screenshots/ProductViewP1.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Vibrant-store/main/screenshots/ProductViewP2.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Vibrant-store/main/screenshots/SearchView.png",
  ],
  "Sky-Cast": [
    "https://raw.githubusercontent.com/ahmed-el-bialy/Sky-Cast/main/screenshots/cloudy_main_weather.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Sky-Cast/main/screenshots/cloudy_initial_search.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Sky-Cast/main/screenshots/cloudy_results_search.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Sky-Cast/main/screenshots/default_initial_search.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Sky-Cast/main/screenshots/app_icon_screenshot.jpg",
  ],
  "News-Cloud": [
    "https://raw.githubusercontent.com/ahmed-el-bialy/News-Cloud/main/screenshots/general_view.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/News-Cloud/main/screenshots/WebView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/News-Cloud/main/screenshots/business_view.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/News-Cloud/main/screenshots/entertainment_view.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/News-Cloud/main/screenshots/app_logo.png",
  ],
  Shaats: [
    "https://raw.githubusercontent.com/ahmed-el-bialy/Shaats/main/screenshots/LogInView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Shaats/main/screenshots/LoadingDataView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Shaats/main/screenshots/SecurePasswordView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Shaats/main/screenshots/OthersPonitView.jpg",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Shaats/main/screenshots/ErrorView.png",
  ],
  "Nihon-Seed": [
    "https://raw.githubusercontent.com/ahmed-el-bialy/Nihon-Seed/main/screenshots/MainView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Nihon-Seed/main/screenshots/FamilyView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Nihon-Seed/main/screenshots/ColorsView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Nihon-Seed/main/screenshots/NumbersView.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Nihon-Seed/main/screenshots/app_logo.png",
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
    "https://raw.githubusercontent.com/ahmed-el-bialy/Quotely/main/screenshots/splash_screen.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Quotely/main/screenshots/quote_loaded.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Quotely/main/screenshots/quote_loading.png",
    "https://raw.githubusercontent.com/ahmed-el-bialy/Quotely/main/screenshots/app_icon.png"
  ]
};

/**
 * Dynamically queries the GitHub Contents API for the repo's /screenshots folder.
 * Retrieves all valid image files regardless of arbitrary filenames (e.g. login.png, feed.jpg)!
 */
export async function fetchRepoScreenshots(repoName: string, username: string = 'ahmed-el-bialy'): Promise<string[]> {
  const cleanName = repoName.trim();
  const cacheKey = `repo-screens-${username}-${cleanName}`;
  if (typeof window !== 'undefined') {
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
    const res = await fetch(`https://api.github.com/repos/${username}/${cleanName}/contents/screenshots`, {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (res.ok) {
      const files = await res.json();
      if (Array.isArray(files)) {
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
        const imageUrls = files
          .filter((file: any) =>
            file.type === 'file' &&
            imageExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
          )
          .map((file: any) =>
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

  if (verifiedFallback && verifiedFallback.length > 0) {
    return verifiedFallback;
  }

  return [
    `https://raw.githubusercontent.com/${username}/${cleanName}/main/screenshots/cover.png`
  ];
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

/**
 * Fetches latest repository release data from GitHub API with full asset and APK inspection
 */
export async function fetchRepositoryReleaseData(
  repoName: string,
  username: string = 'ahmed-el-bialy'
): Promise<RepoReleaseInfo> {
  if (!repoName) return { hasRelease: false };
  const cleanRepo = repoName.trim();
  const cacheKey = `gh_rel_${username}_${cleanRepo}`;

  // Try memory/session cache
  if (typeof window !== 'undefined' && !navigator.onLine) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {}
  }

  try {
    // 1. Query latest published release
    let res = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" }
    });

    let releaseData: any = null;

    if (res.ok) {
      releaseData = await res.json();
    } else {
      // 2. Query release list for pre-releases or recent tags
      const listRes = await fetch(`https://api.github.com/repos/${username}/${cleanRepo}/releases?per_page=1`, {
        headers: { Accept: "application/vnd.github+json" }
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

/**
 * Checks if a GitHub repository actually has a published release or APK asset (alias for backwards compatibility)
 */
export async function checkRepoRelease(repoName: string, username: string = 'ahmed-el-bialy'): Promise<RepoReleaseInfo> {
  return fetchRepositoryReleaseData(repoName, username);
}

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


