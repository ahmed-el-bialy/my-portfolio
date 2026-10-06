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
  title: "Mobile App Developer | Flutter Specialist",
  secondaryTitle: "Cross-Platform Android & iOS Engineer",
  greeting: "Crafting polished, high-performance mobile apps with Flutter & Clean Architecture",
  bio: "Mobile Application Developer specializing in Flutter & Dart. Dedicated to building robust, scalable cross-platform mobile apps for Android and iOS with strict Clean Architecture, BLoC/Cubit state management, offline-first storage (Hive CE & SQLite), and resilient RESTful API integrations. Creator of 'Revio', published live on Google Play.",
  email: "ah.elbialy.dev@gmail.com",
  phone: "+20 102 212 1573",
  location: "Egypt (Open to Remote & Relocation)",
  githubUsername: "ahmed-el-bialy",
  githubUrl: "https://github.com/ahmed-el-bialy",
  linkedinUrl: "https://www.linkedin.com/in/ahmedel-bialy/",
  youtubeUrl: "https://youtube.com/@ahmedel-bialy",
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
    proficiency: "Technical Working Proficiency (B1 - B2)",
    level: "Intermediate / Technical (B1 - B2)",
    percentage: 75,
    flag: "🇬🇧",
    description: "Proficient in reading engineering documentation, technical architectural writing, code commenting, and developer collaboration."
  }
];

export const DEFAULT_PROFILE = AHMED_PROFILE;

// Fully verified certificates & courses
export const CERTIFICATES: CertificateItem[] = [
  {
    id: "codealpha-flutter",
    title: "Mobile App Development Trainee (Flutter)",
    issuer: "CodeAlpha Tech Internship",
    date: "2026",
    credentialUrl: "https://drive.google.com/file/d/1lQMnmyIA100YyXLu4jqFdhWluSeig4Pn/view?usp=drive_link",
    badge: "Verified Internship",
    description: "Hands-on engineering program focused on production Flutter applications, state management with Cubit/BLoC, local storage mechanisms, and app deployment.",
    skills: ["Flutter", "Dart", "BLoC/Cubit", "Offline Storage", "Clean Architecture"]
  },
  {
    id: "flutter-complete-mastery",
    title: "Complete Flutter & Dart Architecture Mastery",
    issuer: "Specialized Mobile Development Program",
    date: "2025 - 2026",
    credentialUrl: "https://drive.google.com/file/d/1lQMnmyIA100YyXLu4jqFdhWluSeig4Pn/view?usp=drive_link",
    badge: "Advanced Architecture",
    description: "In-depth training on Clean Architecture (Domain, Data, Presentation layers), Dependency Injection, repository abstraction, and SOLID object-oriented principles.",
    skills: ["Clean Architecture", "SOLID", "Repository Pattern", "Hive CE", "Slivers"]
  },
  {
    id: "networking-apis-mastery",
    title: "REST APIs & Modern Networking (Dio, Retrofit & Firebase)",
    issuer: "Mobile Engineering Bootcamps",
    date: "2025",
    credentialUrl: "https://drive.google.com/file/d/1lQMnmyIA100YyXLu4jqFdhWluSeig4Pn/view?usp=drive_link",
    badge: "Full-Stack Mobile",
    description: "Consuming RESTful web services, handling interceptors, token refresh flows, error-handling pipelines, code-generated API clients, and real-time Firestore streams.",
    skills: ["Dio", "Retrofit", "RESTful APIs", "Cloud Firestore", "Authentication"]
  },
  {
    id: "ai-cs-foundations",
    title: "Artificial Intelligence & Computational Foundations",
    issuer: "Faculty of Artificial Intelligence (Undergraduate)",
    date: "In Progress",
    credentialUrl: "https://drive.google.com/file/d/1lQMnmyIA100YyXLu4jqFdhWluSeig4Pn/view?usp=drive_link",
    badge: "Academic Degree",
    description: "Formal academic coursework covering Data Structures & Algorithms, Object-Oriented Software Design, Machine Learning fundamentals, and Database Systems.",
    skills: ["Data Structures", "Algorithms", "OOP", "Machine Learning", "Python"]
  }
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    role: "Independent Flutter Developer",
    organization: "Google Play & Standalone Mobile Engineering",
    period: "2026 - Present",
    location: "Egypt",
    badge: "Published App Developer",
    description: "Engineered and published standalone mobile applications including 'Revio' on Google Play and 'Movura'. Managed the complete lifecycle from UI/UX and architectural planning to deployment.",
    achievements: [
      "Published 'Revio' on Google Play with 3D flip-card animations, quiz modes, and Hive CE local storage",
      "Engineered 'Movura' movie tracking app with TMDB API integration, shimmer skeletons, and YouTube trailers",
      "Enforced industry-standard security by safeguarding API secrets with environment variables and .gitignore",
      "Implemented strict Clean Architecture with BLoC and Cubit for scalable state management"
    ]
  },
  {
    role: "Mobile Development Trainee",
    organization: "CodeAlpha & Technical Bootcamps",
    period: "Feb 2026 - Apr 2026",
    location: "Egypt",
    badge: "Specialized Training",
    description: "Hands-on training focusing on enterprise Flutter architectures, REST API integration, and performance optimization.",
    achievements: [
      "Engineered 'Vibrant Store' e-commerce app with product catalogs, chip filtering, and service layer architecture",
      "Optimized 'Sky-Cast' weather application with dynamic themes and automated state transitions",
      "Practiced Clean Architecture, Dependency Injection, and state patterns like BLoC, Cubit, and Provider"
    ]
  }
];

export const EDUCATION_DATA = {
  degree: "Bachelor of Science (B.Sc.) in Artificial Intelligence",
  faculty: "Faculty of Artificial Intelligence (كلية الذكاء الاصطناعي)",
  university: "Kafrelsheikh University (جامعة كفر الشيخ)",
  period: "Undergraduate Student (In Progress)",
  gpa: "Strong Academic Standing",
  coursework: [
    "Artificial Intelligence Foundations",
    "Machine Learning & Pattern Recognition",
    "Data Structures & Algorithm Design",
    "Object-Oriented Programming (OOP)",
    "Database Management Systems & SQL",
    "Software Engineering Principles"
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
      youtubeDemo: "https://youtube.com/shorts/-9VfbxIcZkU?si=Tcpe0iwRztryd7w4",
      releaseUrl: "https://github.com/ahmed-el-bialy/Revio/releases/tag/v1.0.0",
      apkDownloadUrl: "https://github.com/ahmed-el-bialy/Revio/releases/download/v1.0.0/app-release.apk"
    },
    highlight: true
  },
  {
    id: 2,
    name: "Movura",
    repoName: "Movura",
    subtitle: "Premium movie & TV series tracker with TMDB API and YouTube trailers",
    description: "A premium entertainment tracking mobile app consuming the TMDB API. Delivers dynamic content discovery, real-time media updates, and intelligent search suggestions with a dark-theme UI, Sliver-based scrolling layouts, shimmer loading skeletons, YouTube trailer player, and offline-first image caching.",
    technologies: ["Flutter", "Dart", "TMDB API", "BLoC/Cubit", "YouTube Player", "Sliver UI"],
    features: [
      "Real-time media discovery from The Movie Database (TMDB) API",
      "Shimmer loading animations and seamless offline image caching",
      "Integrated in-app YouTube trailer streaming playback",
      "Sliver-based parallax hero scrolling and fluid gesture navigation",
      "Dynamic search suggestions with real-time debounced query handling",
      "Secure API key management via environment configurations"
    ],
    image: "https://raw.githubusercontent.com/ahmed-el-bialy/Movura/main/screenshots/Movura2607089.png",
    hasApk: false,
    links: {
      github: "https://github.com/ahmed-el-bialy/Movura",
      youtubeDemo: "https://youtube.com/@ahmedel-bialy"
    },
    highlight: true
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
    image: "https://raw.githubusercontent.com/ahmed-el-bialy/Vibrant-store/main/screenshots/HomeView.png",
    hasApk: false,
    links: {
      github: "https://github.com/ahmed-el-bialy/Vibrant-store",
      youtubeDemo: "https://youtube.com/shorts/PIg1rYA0CkQ"
    },
    highlight: true
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
    image: "https://raw.githubusercontent.com/ahmed-el-bialy/Sky-Cast/main/screenshots/cloudy_main_weather.png",
    hasApk: false,
    links: {
      github: "https://github.com/ahmed-el-bialy/Sky-Cast",
      youtubeDemo: "https://youtube.com/shorts/u5JjIphdrAM?si=h44HWlZMZki8L_GM"
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
    image: "https://raw.githubusercontent.com/ahmed-el-bialy/News-Cloud/main/screenshots/general_view.png",
    hasApk: false,
    links: {
      github: "https://github.com/ahmed-el-bialy/News-Cloud",
      youtubeDemo: "https://youtube.com/shorts/AKbiBjCRIis"
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
    image: "https://raw.githubusercontent.com/ahmed-el-bialy/Shaats/main/screenshots/LogInView.png",
    hasApk: false,
    links: {
      github: "https://github.com/ahmed-el-bialy/Shaats",
      youtubeDemo: "https://youtube.com/@ahmedel-bialy"
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
    image: "https://raw.githubusercontent.com/ahmed-el-bialy/Nihon-Seed/main/screenshots/MainView.png",
    hasApk: false,
    links: {
      github: "https://github.com/ahmed-el-bialy/Nihon-Seed",
      youtubeDemo: "https://youtube.com/shorts/OG-S_8oSN00?si=1K0SkiW8voSb4YR-"
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
      youtubeDemo: "https://youtube.com/shorts/xJaE0pxSpAQ?si=8lF-9tGR68cHibaL"
    }
  }
];
