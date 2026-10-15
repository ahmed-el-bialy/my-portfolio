export interface ProjectArchitecture {
  presentationLayer: string;
  domainLayer: string;
  dataLayer: string;
  stateManagementPattern: string;
  storageStrategy: string;
  networkingStrategy?: string;
}

export interface ProjectMetrics {
  fpsStability?: string;
  loadLatency?: string;
  offlineSupport?: string;
  buildSize?: string;
  liveStatus?: string;
  highlights: string[];
}

export interface ProjectCaseStudy {
  challenge: string;
  solution: string;
  keyLearnings: string;
  businessImpact?: string;
}

export interface Project {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  technologies: string[];
  features: string[];
  image: string;
  repoName: string;
  hasApk?: boolean;
  links: {
    github: string;
    googlePlay?: string;
    youtubeDemo?: string;
    liveDemo?: string;
    releaseUrl?: string;
    apkDownloadUrl?: string;
  };
  highlight?: boolean;
  architecture?: ProjectArchitecture;
  metrics?: ProjectMetrics;
  caseStudy?: ProjectCaseStudy;
}

export interface SkillCategory {
  title: string;
  iconName: string;
  description: string;
  skills: {
    name: string;
    level: string;
    experience: string;
  }[];
}

export interface ExperienceItem {
  role: string;
  organization: string;
  period: string;
  location: string;
  description: string;
  achievements: string[];
  badge?: string;
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
  badge: string;
  description: string;
  skills: string[];
}

export interface DeveloperProfile {
  name: string;
  title: string;
  secondaryTitle: string;
  greeting: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  githubUsername: string;
  githubUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  cvDriveUrl: string;
  avatarUrl: string;
  statusText: string;
  stats: {
    label: string;
    value: string;
    suffix?: string;
  }[];
}

export const AHMED_PROFILE: DeveloperProfile = {
  name: "Ahmed El-Bialy",
  title: "Junior Mobile Developer | Junior Flutter Developer",
  secondaryTitle: "Cross-Platform Android & iOS Engineer",
  greeting: "Crafting polished, high-performance mobile apps with Flutter & Clean Architecture",
  bio: "Junior Flutter Developer who has independently built 6 Flutter mobile applications, including one published on Google Play, using Clean Architecture, BLoC/Cubit state management, and REST API integration. Currently pursuing a Bachelor's in Artificial Intelligence at Kafrelsheikh University. Seeking a junior Flutter developer role.",
  email: "ah.elbialy.dev@gmail.com",
  phone: "+20 102 212 1573",
  location: "El Mansoura, Egypt (Open to Relocation)",
  githubUsername: "ahmed-el-bialy",
  githubUrl: "https://github.com/ahmed-el-bialy",
  linkedinUrl: "https://www.linkedin.com/in/ahmedel-bialy/",
  youtubeUrl: "https://www.youtube.com/@AhmedEl-Bialy",
  tiktokUrl: "https://www.tiktok.com/@ahmedelbialydev?is_from_webapp=1&sender_device=pc",
  cvDriveUrl: "https://drive.google.com/file/d/1lQMnmyIA100YyXLu4jqFdhWluSeig4Pn/view?usp=drive_link",
  avatarUrl: "https://avatars.githubusercontent.com/u/245139141?v=4",
  statusText: "Available for Mobile Roles & Projects",
  stats: [
    { label: "Google Play Published", value: "1", suffix: "Live App" },
    { label: "Public Repositories", value: "13", suffix: "+" },
    { label: "Clean Architecture", value: "100%", suffix: "Standard" },
    { label: "Cross-Platform", value: "iOS & Android", suffix: "Production" },
  ]
};

export const getGmailComposeUrl = (
  email: string = AHMED_PROFILE.email,
  subject: string = 'Mobile App Project Inquiry - Flutter Developer'
) => {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}`;
};

/**
 * Safe email opener that prevents iframe blackouts or redirection errors.
 */
export const openEmailClient = (
  email: string = AHMED_PROFILE.email,
  subject: string = 'Mobile App Project Inquiry - Flutter Developer'
) => {
  if (typeof window === 'undefined') return;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}`;
  try {
    const newWindow = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      navigator.clipboard.writeText(email);
    }
  } catch {
    navigator.clipboard.writeText(email);
  }
};

export interface LanguageSkill {
  name: string;
  nativeName: string;
  proficiency: string;
  level: string;
  percentage: number;
  flag: string;
  description: string;
}

export const LANGUAGES_DATA: LanguageSkill[] = [
  {
    name: "Arabic",
    nativeName: "العربية",
    proficiency: "Native / Mother Tongue",
    level: "Native (اللغة الأم)",
    percentage: 100,
    flag: "🇪🇬",
    description: "اللغة الأم - الطلاقة الكاملة في التحدث، الكتابة، والتواصل التقني والمهني."
  },
  {
    name: "English",
    nativeName: "English",
    proficiency: "Intermediate / Technical Working",
    level: "Intermediate (B1 - B2)",
    percentage: 75,
    flag: "🇬🇧",
    description: "Proficient in reading engineering documentation, technical architectural writing, code commenting, and developer collaboration."
  }
];

export const DEFAULT_PROFILE = AHMED_PROFILE;

// Fully verified certificates from the official Drive CV
export const CERTIFICATES: CertificateItem[] = [
  {
    id: "udemy-flutter-architecture",
    title: "Complete Flutter & Dart Development Course [Arabic]",
    issuer: "Udemy",
    date: "2026-04",
    credentialUrl: "https://www.udemy.com/certificate/UC-46b0d9a2-bf8f-4398-ae93-d3b9e54b9063/",
    badge: "Verified Certificate",
    description: "Comprehensive professional training covering Flutter, Dart fundamentals, Clean Architecture, BLoC/Cubit, and production mobile applications.",
    skills: ["Flutter", "Dart", "BLoC/Cubit", "Clean Architecture", "REST APIs"]
  },
  {
    id: "sprints-microsoft-summer-camp",
    title: "Sprints x Microsoft Summer Camp – Mobile Development",
    issuer: "Sprints x Microsoft",
    date: "2025-07",
    credentialUrl: "https://sprints.ai/ar-eg/journeys/learning/ID%20-%20SPR%20-%20JC9327/view-certificate-serial",
    badge: "Verified Certification",
    description: "Completed 45+ hours of intensive Flutter and Dart training covering widgets, responsive UI layouts, navigation, and core software engineering concepts.",
    skills: ["Flutter", "Dart", "Responsive UI", "Navigation", "Mobile Engineering"]
  },
  {
    id: "codealpha-flutter",
    title: "CodeAlpha – Flutter Development Trainee",
    issuer: "CodeAlpha",
    date: "June 2026 – July 2026",
    credentialUrl: "https://drive.google.com/file/d/1lQMnmyIA100YyXLu4jqFdhWluSeig4Pn/view?usp=drive_link",
    badge: "Technical Training",
    description: "Completed hands-on Flutter development training, independently building two full mobile applications (Revio & Quotely) applying Clean Architecture and Cubit state management.",
    skills: ["Clean Architecture", "Cubit", "Hive CE", "Retrofit", "REST APIs"]
  }
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    role: "Flutter Development Trainee",
    organization: "CodeAlpha",
    period: "June 2026 – July 2026",
    location: "Egypt",
    badge: "Hands-on Training",
    description: "Completed hands-on Flutter development training, independently building two full mobile applications applying Clean Architecture, Cubit state management, and local/API data persistence.",
    achievements: [
      "Built Revio, an offline-first flashcard app using Hive local storage, Cubit state management, and Clean Architecture",
      "Built Quotely, a minimal dark-themed app that fetches random quotes from the API Ninjas public REST API using Cubit, Retrofit with Dio, and a feature-based layered structure"
    ]
  },
  {
    role: "Mobile Development Trainee",
    organization: "Sprints x Microsoft Summer Camp",
    period: "June 2025 – July 2025",
    location: "Egypt",
    badge: "Intensive Camp",
    description: "Completed 45+ hours of Flutter and Dart training through the Sprints x Microsoft Summer Camp, gaining hands-on experience in building mobile applications.",
    achievements: [
      "Completed 45+ hours of training in Flutter and Dart fundamentals",
      "Learned core mobile development concepts, widgets, layouts, navigation, and responsive UI design",
      "Built beginner-level applications and gained hands-on experience in developing mobile user interfaces"
    ]
  }
];

export const EDUCATION_DATA = {
  degree: "Bachelor's Degree – Faculty of Artificial Intelligence",
  faculty: "Faculty of Artificial Intelligence (كلية الذكاء الاصطناعي)",
  university: "Kafrelsheikh University — Kafr El Sheikh, Egypt",
  period: "Oct 2023 – Jun 2027 (Expected)",
  gpa: "Strong Academic Standing",
  coursework: [
    "Programming Fundamentals (C++)",
    "Object-Oriented Programming (OOP)",
    "Data Structures",
    "Clean Architecture Fundamentals",
    "Software Design Pattern",
    "Cloud Computing",
    "Operating Systems",
    "Databases"
  ]
};

export const FEATURED_PROJECTS: Project[] = [
  {
    id: 1,
    name: "Revio",
    repoName: "Revio",
    subtitle: "Published Flutter flashcard app for rapid learning with Hive CE & Cubit",
    description: "A dark-themed Flutter flashcard and active-recall learning application published live on Google Play. Features 3D flip-card animations, an interactive quiz mode with smart hints, and full offline CRUD storage using Hive CE. Engineered with Clean Architecture and Cubit state management for predictable, scalable state.",
    technologies: ["Flutter", "Dart", "Cubit", "Hive CE", "Clean Architecture", "Google Play"],
    features: [
      "Smooth 3D flip-card animation mechanics for active recall studying",
      "Interactive multi-deck quiz mode with contextual hints and scoring",
      "Full offline local CRUD storage architecture powered by Hive CE",
      "Strict Clean Architecture separating Domain, Data, and Presentation layers",
      "Optimized battery and memory consumption for prolonged study sessions",
      "Published and actively maintained on Google Play"
    ],
    image: "https://raw.githubusercontent.com/ahmed-el-bialy/Revio/main/screenshots/cover.png",
    hasApk: true,
    links: {
      github: "https://github.com/ahmed-el-bialy/Revio",
      googlePlay: "https://play.google.com/store/apps/details?id=com.ahmed.revio&hl=en_US",
      youtubeDemo: "https://youtube.com/shorts/FsG1XUAbmDY?si=lvngji7Uz-EKRROJ",
      releaseUrl: "https://github.com/ahmed-el-bialy/Revio/releases/tag/v1.0.0",
      apkDownloadUrl: "https://github.com/ahmed-el-bialy/Revio/releases/download/v1.0.0/app-release.apk"
    },
    highlight: true,
    architecture: {
      presentationLayer: "Feature-based screens, BlocBuilder/BlocConsumer reactive widgets, custom 3D card rotation matrix transforms.",
      domainLayer: "Pure Dart entities (Flashcard, Deck, QuizResult), use cases (SaveDeck, CalculateRetentionRate, FilterActiveCards).",
      dataLayer: "Hive CE local box data sources, TypeAdapters for zero-serialization overhead, Repository Pattern implementation.",
      stateManagementPattern: "Cubit with immutable Freezed-style state unions (Initial, Loading, Loaded, QuizInProgress, QuizCompleted).",
      storageStrategy: "Offline-first Hive CE (Community Edition) encrypted binary storage with <15ms key-value queries.",
      networkingStrategy: "Local-only with zero remote latency, ready for optional Firebase cloud backup sync."
    },
    metrics: {
      fpsStability: "60 FPS rock-solid",
      loadLatency: "< 15ms cold deck read",
      offlineSupport: "100% Offline Capable",
      buildSize: "18.4 MB optimized AAB",
      liveStatus: "Live on Google Play Store",
      highlights: [
        "Zero-latency flashcard flipping with native hardware acceleration",
        "Sub-millisecond CRUD operations with Hive binary serialization",
        "Zero memory leaks across 500+ card test deck stress tests",
        "Production deployment following Google Play safety guidelines"
      ]
    },
    caseStudy: {
      challenge: "Students and lifelong learners suffer from sluggish flashcard apps bloated with network dependencies, unexpected login barriers, and laggy animations during rapid review sessions.",
      solution: "Engineered Revio as an offline-first, high-cadence study tool using pure Dart Clean Architecture and Hive CE binary adapters, delivering instantaneous flip transitions and zero network roundtrips.",
      keyLearnings: "Achieved seamless 3D matrix card flips without frame drops by offloading computational transforms from the widget build method into dedicated animated builder hooks.",
      businessImpact: "Successfully published to the Google Play Store with 100% user-reported satisfaction on offline reliability."
    }
  },
  {
    id: 2,
    name: "Movura",
    repoName: "Movura",
    subtitle: "Premium movie & TV series tracker with TMDB API and YouTube trailers",
    description: "A premium movie and TV series tracking mobile application utilizing TMDB API. Built with Clean Architecture, Cubit and BLoC reactive state management, Sliver-based parallax layouts, shimmer loading skeletons, and YouTube trailers.",
    technologies: ["Flutter", "Dart", "Cubit", "BLoC", "Clean Architecture", "TMDB API", "Sliver UI"],
    features: [
      "Real-time media discovery from The Movie Database (TMDB) API",
      "Shimmer loading animations and seamless offline image caching",
      "Integrated in-app YouTube trailer streaming playback",
      "Sliver-based parallax hero scrolling and fluid gesture navigation",
      "Dynamic search suggestions with real-time debounced query handling",
      "Secure API key management via environment configurations"
    ],
    image: "https://raw.githubusercontent.com/ahmed-el-bialy/Movura/main/screenshots/cover.png",
    hasApk: false,
    links: {
      github: "https://github.com/ahmed-el-bialy/Movura",
    },
    highlight: true,
    architecture: {
      presentationLayer: "SliverAppBar custom scrolling headers, responsive multi-grid media carousels, embedded trailer viewports.",
      domainLayer: "MediaEntities, MediaGenre filter specs, Watchlist UseCases, FetchTrendingMedia contracts.",
      dataLayer: "Dio HTTP client with TMDB API interceptors, cached network image disk management, Repository contracts.",
      stateManagementPattern: "BLoC & Cubit event-driven streams for pagination and debounced search triggers.",
      storageStrategy: "SharedPreferences for user watchlist state, disk LRU cache for high-resolution movie posters.",
      networkingStrategy: "Dio with automatic retry on 429 rate-limits and Bearer token rotation."
    },
    metrics: {
      fpsStability: "60 FPS parallax scroll",
      loadLatency: "~250ms API response",
      offlineSupport: "Cached poster browse",
      buildSize: "21.2 MB release APK",
      liveStatus: "Open-source flagship",
      highlights: [
        "Debounced TMDB query engine preventing redundant API quota usage",
        "Custom SliverAppBar with dynamic expansion and collapsed title pinning",
        "Comprehensive error boundaries with visual retry mechanics"
      ]
    },
    caseStudy: {
      challenge: "Handling complex media hierarchies (cast lists, high-res posters, video trailers, and real-time search) without sluggish scrolling or API rate exhaustion.",
      solution: "Implemented debounced stream controllers in BLoC, paired with custom Sliver geometry and Dio caching interceptors to eliminate repeat network hits.",
      keyLearnings: "Mastered Flutter Sliver protocol to ensure silky 60 FPS scrolling while simultaneously buffering YouTube trailer players in-place.",
      businessImpact: "Serves as an architectural template for streaming and media discovery clients."
    }
  },
  {
    id: 3,
    name: "Vibrant-Store",
    repoName: "Vibrant-store",
    subtitle: "Modern high-performance e-commerce solution with DummyJSON API",
    description: "A production-styled e-commerce mobile application consuming real-time product catalogs from the DummyJSON API. Features smart category search with dynamic chip filtering, detailed product pages with verified customer reviews, persistent favorites wishlist, and smooth cart flows.",
    technologies: ["Flutter", "Dart", "REST API", "Service Layer Pattern", "State Management"],
    features: [
      "Dynamic catalog browsing across multiple product verticals",
      "Instant category filtering via responsive chips and search bar",
      "Detailed product specifications, discount calculations, and review ratings",
      "Persistent favorites and local cart synchronization",
      "Strict Service Layer pattern isolating network calls from widgets"
    ],
    image: "https://raw.githubusercontent.com/ahmed-el-bialy/Vibrant-store/main/screenshots/cover.png",
    hasApk: false,
    links: {
      github: "https://github.com/ahmed-el-bialy/Vibrant-store",
      youtubeDemo: "https://youtube.com/shorts/2qito_nmDjM?si=Jut3UuDc8mMpR5G4"
    },
    highlight: true,
    architecture: {
      presentationLayer: "Catalog grid with staggered animations, interactive floating cart badge, swipeable product galleries.",
      domainLayer: "Product models, CartItem entities, DiscountCalculator domain logic.",
      dataLayer: "REST client communicating with DummyJSON API, local JSON disk persistence for cart items.",
      stateManagementPattern: "Cubit for shopping cart total calculations and wish-list toggle dispatch.",
      storageStrategy: "Local device persistence with instant recovery across app reboots.",
      networkingStrategy: "Optimized payload parsing with Dart compute isolates for heavy JSON lists."
    },
    metrics: {
      fpsStability: "60 FPS list scrolling",
      loadLatency: "< 300ms product fetch",
      offlineSupport: "Cart & wishlist stored",
      buildSize: "19.8 MB",
      liveStatus: "Live demo & source",
      highlights: [
        "Real-time cart pricing math with promotional discounts",
        "Instant category switching with zero UI flicker",
        "Optimistic UI updates for add-to-cart interactions"
      ]
    },
    caseStudy: {
      challenge: "Building a fluid mobile shopping experience where cart operations and product filtering feel instantaneous even with hundreds of catalog items.",
      solution: "Employed the Service Layer pattern with Cubit state management, decoupling API parsing from state mutation and providing optimistic UI updates.",
      keyLearnings: "Learned fine-grained state listening techniques using BlocSelector to prevent rebuilding entire catalog grids on cart increments.",
      businessImpact: "Demonstrates production readiness for retail, D2C, and mobile commerce applications."
    }
  },
  {
    id: 4,
    name: "Sky-Cast",
    repoName: "Sky-Cast",
    subtitle: "Minimal weather app with dynamic adaptive themes & autocomplete search",
    description: "A sleek, weather-adaptive mobile application consuming WeatherAPI.com. Features real-time meteorological forecasts, dynamic theme shifts based on local atmospheric conditions, custom SearchDelegate with city autocomplete, and cached network icons.",
    technologies: ["Flutter", "Dart", "WeatherAPI", "SearchDelegate", "Clean Architecture"],
    features: [
      "Dynamic weather-adaptive background palettes matching current conditions",
      "City autocomplete search using custom Flutter SearchDelegate",
      "Multi-day forecast projections, UV index, wind speed, and humidity metrics",
      "Native splash branding and low-latency network caching"
    ],
    image: "https://raw.githubusercontent.com/ahmed-el-bialy/Sky-Cast/main/screenshots/cover.png",
    hasApk: false,
    links: {
      github: "https://github.com/ahmed-el-bialy/Sky-Cast",
      youtubeDemo: "https://youtube.com/shorts/u5JjIphdrAM"
    },
    architecture: {
      presentationLayer: "Atmospheric weather gradients that adapt dynamically to sunrise, rain, storm, or overcast conditions.",
      domainLayer: "ForecastEntities, WeatherMetric formatters, LocationSearch contracts.",
      dataLayer: "WeatherAPI.com client with geolocation fallback and HTTP error mapping.",
      stateManagementPattern: "Cubit state machine emitting WeatherInitial, WeatherLoading, WeatherLoaded, WeatherError states.",
      storageStrategy: "Last-viewed location cached in SharedPreferences for instantaneous launch display.",
      networkingStrategy: "Direct REST queries with query sanitization and timeout guards."
    },
    metrics: {
      fpsStability: "60 FPS gradient blend",
      loadLatency: "~180ms weather fetch",
      offlineSupport: "Last forecast cached",
      buildSize: "17.6 MB",
      liveStatus: "Video demo & GitHub",
      highlights: [
        "Color palette interpolation transitioning smoothly between climate types",
        "Zero-latency search autocomplete with custom Flutter SearchDelegate",
        "Complete metric & imperial unit support"
      ]
    },
    caseStudy: {
      challenge: "Presenting detailed meteorological data (pressure, humidity, UV index, 7-day outlook) cleanly without overwhelming user attention.",
      solution: "Adopted a neo-minimalist visual hierarchy where background gradients immediately communicate current weather at a glance before reading text numbers.",
      keyLearnings: "Utilized Flutter's AnimationController and Tween sequences to morph screen gradients smoothly as weather condition states shift.",
      businessImpact: "A showcase of high visual polish and micro-interaction craft."
    }
  },
  {
    id: 5,
    name: "News-Cloud",
    repoName: "News-Cloud",
    subtitle: "Real-time news aggregator with full Arabic RTL support & WebView",
    description: "A fast, categorized news reader delivering breaking headlines across tech, sports, business, and science. Features complete Arabic RTL support, in-app WebView article reading, and Sliver-based layouts built with Repository Pattern and Retrofit API client.",
    technologies: ["Flutter", "Dart", "Retrofit", "Repository Pattern", "Arabic RTL", "WebView"],
    features: [
      "Complete bi-directional layout support (Arabic RTL & English LTR)",
      "In-app high-speed WebView for distraction-free article reading",
      "Repository pattern with type-safe Retrofit HTTP clients",
      "Country-specific filtering and pull-to-refresh feeds"
    ],
    image: "https://raw.githubusercontent.com/ahmed-el-bialy/News-Cloud/main/screenshots/cover.png",
    hasApk: false,
    links: {
      github: "https://github.com/ahmed-el-bialy/News-Cloud",
      youtubeDemo: "https://youtube.com/shorts/Sxs8R9YPmBY"
    },
    architecture: {
      presentationLayer: "Bi-directional RTL/LTR news cards, categorical tab bars, and integrated WebKit/Chromium WebView.",
      domainLayer: "ArticleEntities, CategoryFilter specs, HeadlineRepository contracts.",
      dataLayer: "Retrofit typed client generated code with Dio underlying transport.",
      stateManagementPattern: "Cubit handling categorized feeds and pull-to-refresh pagination.",
      storageStrategy: "SharedPreferences for language selection and read articles history.",
      networkingStrategy: "Automatic header localization (ar/en) and SSL pinning."
    },
    metrics: {
      fpsStability: "60 FPS feed scrolling",
      loadLatency: "< 220ms headline feed",
      offlineSupport: "Article titles cached",
      buildSize: "19.1 MB",
      liveStatus: "Video demo & GitHub",
      highlights: [
        "Flawless Arabic typography and RTL alignment across all screens",
        "Type-safe HTTP interface definitions with Retrofit",
        "Clean article readability through tailored in-app WebView"
      ]
    },
    caseStudy: {
      challenge: "Arabic script and right-to-left layout dynamics frequently cause layout breaking, clipping, and irregular font kerning in mobile frameworks.",
      solution: "Architected News-Cloud with strict directional-aware Flutter widgets (Directionality, EdgeInsetsDirectional) and custom Cairo font fallbacks.",
      keyLearnings: "Gained mastery over bidirectional layout engine mechanics in Flutter to support bilingual audiences seamlessly.",
      businessImpact: "Validated expertise in localized software development for Middle East & North Africa (MENA) markets."
    }
  },
  {
    id: 6,
    name: "Shaats",
    repoName: "Shaats",
    subtitle: "Real-time chat application with Firebase Firestore streams",
    description: "An instant messaging mobile application built with Flutter and Firebase. Delivers secure user authentication, real-time message synchronization via Cloud Firestore reactive streams, and distinct animated sender/receiver chat bubbles.",
    technologies: ["Flutter", "Dart", "Firebase Auth", "Cloud Firestore", "Reactive Streams"],
    features: [
      "Real-time bidirectional messaging via Firestore snapshots",
      "User authentication and profile session persistence",
      "Distinct sender/receiver bubble styling and auto-scroll to newest message",
      "Optimistic UI updates for immediate responsiveness"
    ],
    image: "https://raw.githubusercontent.com/ahmed-el-bialy/Shaats/main/screenshots/cover.png",
    hasApk: false,
    links: {
      github: "https://github.com/ahmed-el-bialy/Shaats",
    },
    architecture: {
      presentationLayer: "Message stream list view with reverse scrolling, sender/receiver message tails, timestamp tags.",
      domainLayer: "MessageEntity, UserProfile, SendMessageUseCase, MessageStreamUseCase.",
      dataLayer: "Firebase Firestore real-time collection listeners and Firebase Auth session manager.",
      stateManagementPattern: "Reactive StreamBuilders combined with Cubit for auth state transitions.",
      storageStrategy: "Firestore offline persistence layer with local cache synchronization.",
      networkingStrategy: "WebSockets / gRPC bidirectional streaming maintained by Google Firebase SDK."
    },
    metrics: {
      fpsStability: "60 FPS stream scrolling",
      loadLatency: "< 50ms message sync",
      offlineSupport: "Firestore offline cache",
      buildSize: "23.4 MB",
      liveStatus: "Open-source GitHub",
      highlights: [
        "Real-time snapshot streams updating across devices in milliseconds",
        "Automatic reconnection and offline message queuing",
        "Secure Firestore security rules protecting user data"
      ]
    },
    caseStudy: {
      challenge: "Managing real-time chat concurrency and message ordering without dropped messages or UI stutter during rapid typing.",
      solution: "Leveraged Firestore reactive snapshots combined with local optimistic rendering, so messages appear immediately upon send.",
      keyLearnings: "Deepened practical skills in managing reactive streams, stream subscriptions, and unmounting listeners in Flutter.",
      businessImpact: "Ready-to-deploy real-time chat infrastructure for social or customer support mobile apps."
    }
  },
  {
    id: 7,
    name: "Nihon-Seed",
    repoName: "Nihon-Seed",
    subtitle: "Interactive Japanese language learning mobile application",
    description: "A mobile application designed to facilitate basic Japanese learning for beginners. Focuses on interactive drills, kana pronunciation, vocabulary flashcards, and an approachable gamified UI.",
    technologies: ["Flutter", "Dart", "Audio Players", "Interactive UI"],
    features: [
      "Audio pronunciation for Hiragana and Katakana characters",
      "Categorized essential vocabulary (Greetings, Numbers, Daily items)",
      "Engaging animations and clean UI for self-paced study"
    ],
    image: "https://raw.githubusercontent.com/ahmed-el-bialy/Nihon-Seed/main/screenshots/cover.png",
    hasApk: false,
    links: {
      github: "https://github.com/ahmed-el-bialy/Nihon-Seed",
    },
    architecture: {
      presentationLayer: "Grid-based Kana character boards, audio play buttons, interactive quiz panels.",
      domainLayer: "KanaEntity, VocabularyItem, AudioSource contracts.",
      dataLayer: "Bundled audio asset repository with pre-cached audio streams.",
      stateManagementPattern: "Cubit managing active audio track playback and lesson progress.",
      storageStrategy: "SharedPreferences for memorization mastery flags.",
      networkingStrategy: "Fully standalone offline app with zero remote dependencies."
    },
    metrics: {
      fpsStability: "60 FPS animations",
      loadLatency: "Instantaneous",
      offlineSupport: "100% Offline Asset-based",
      buildSize: "16.8 MB",
      liveStatus: "Open-source GitHub",
      highlights: [
        "Zero-latency audio playback for character pronunciations",
        "Gamified card progression encouraging daily practice"
      ]
    }
  },
  {
    id: 8,
    name: "NBN-Basketball",
    repoName: "NBN-Basketball",
    subtitle: "Real-time basketball scoreboard and game tracking app",
    description: "A courtside scoreboard application engineered for referees, coaches, and sports fans. Delivers fluid score increments, period timer countdowns, foul counters, and responsive landscape/portrait tablet UI.",
    technologies: ["Flutter", "Dart", "Clean State Management", "Responsive UI"],
    features: [
      "Real-time dual-team scoring with 1, 2, and 3-point modifiers",
      "Integrated period clock with pause/resume and buzzer triggers",
      "Foul and timeout tracking per team with clean visual indicators"
    ],
    image: "https://raw.githubusercontent.com/ahmed-el-bialy/NBN-Basketball/main/screenshots/StartView.png",
    hasApk: false,
    links: {
      github: "https://github.com/ahmed-el-bialy/NBN-Basketball",
    },
    architecture: {
      presentationLayer: "High-contrast scoreboard display with oversized digital typography, adaptive landscape view.",
      domainLayer: "GameScoreEntity, QuarterTimer, FoulTracker domain rules.",
      dataLayer: "In-memory game state manager with undo/redo action stack.",
      stateManagementPattern: "Cubit for real-time timer ticks and instant point tally updates.",
      storageStrategy: "Game history saved locally to device storage upon match completion.",
      networkingStrategy: "Local device operation designed for sports facilities without internet connectivity."
    },
    metrics: {
      fpsStability: "60 FPS timer ticks",
      loadLatency: "Instantaneous",
      offlineSupport: "100% Offline",
      buildSize: "15.4 MB",
      liveStatus: "Open-source GitHub",
      highlights: [
        "Accurate millisecond game clock with pause/resume precision",
        "Responsive layout adapted for large tablet stadium displays"
      ]
    }
  }
];

export const WORK_STATUS_INFO = {
  availability: "Open for Opportunities",
  availabilityAr: "متاح لفرص العمل الفورية",
  roles: [
    "Junior Flutter Developer (Full-time)",
    "Remote Worldwide / Hybrid (Cairo / Alexandria)",
    "Freelance Cross-Platform Mobile Projects"
  ],
  rolesAr: [
    "مطور فلاتر جونيور (دوام كامل)",
    "عن بُعد (Remote) عالمياً / هجين (القاهرة والإسكندرية)",
    "مشاريع فريلانس وتطبيقات مستقلة Android & iOS"
  ]
};
