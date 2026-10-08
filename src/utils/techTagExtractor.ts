export interface TechTag {
  id: string;
  label: string;
  category: 'language' | 'framework' | 'state' | 'storage' | 'architecture' | 'api' | 'platform';
  color?: string;
  bgLight?: string;
  textLight?: string;
  borderLight?: string;
  bgDark?: string;
  textDark?: string;
  borderDark?: string;
}

// Canonical dictionary of tech definitions for automatic detection
const KNOWN_TECH_MAP: Record<string, TechTag> = {
  // Languages
  dart: {
    id: 'dart',
    label: 'Dart',
    category: 'language',
    color: '#00B4AB',
    bgLight: 'bg-teal-50',
    textLight: 'text-teal-800',
    borderLight: 'border-teal-200',
    bgDark: 'bg-teal-500/10',
    textDark: 'text-teal-300',
    borderDark: 'border-teal-500/20'
  },
  python: {
    id: 'python',
    label: 'Python',
    category: 'language',
    color: '#3572A5',
    bgLight: 'bg-sky-50',
    textLight: 'text-sky-800',
    borderLight: 'border-sky-200',
    bgDark: 'bg-sky-500/10',
    textDark: 'text-sky-300',
    borderDark: 'border-sky-500/20'
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    category: 'language',
    color: '#3178C6',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-800',
    borderLight: 'border-blue-200',
    bgDark: 'bg-blue-500/10',
    textDark: 'text-blue-300',
    borderDark: 'border-blue-500/20'
  },
  javascript: {
    id: 'javascript',
    label: 'JavaScript',
    category: 'language',
    color: '#F7DF1E',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-900',
    borderLight: 'border-amber-200',
    bgDark: 'bg-amber-500/10',
    textDark: 'text-amber-300',
    borderDark: 'border-amber-500/20'
  },

  // Frameworks
  flutter: {
    id: 'flutter',
    label: 'Flutter',
    category: 'framework',
    color: '#02569B',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-800',
    borderLight: 'border-blue-200',
    bgDark: 'bg-blue-500/10',
    textDark: 'text-blue-300',
    borderDark: 'border-blue-500/20'
  },
  fastapi: {
    id: 'fastapi',
    label: 'FastAPI',
    category: 'framework',
    color: '#009688',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-800',
    borderLight: 'border-emerald-200',
    bgDark: 'bg-emerald-500/10',
    textDark: 'text-emerald-300',
    borderDark: 'border-emerald-500/20'
  },

  // State Management & Architecture
  cubit: {
    id: 'cubit',
    label: 'Cubit',
    category: 'state',
    color: '#8B5CF6',
    bgLight: 'bg-purple-50',
    textLight: 'text-purple-800',
    borderLight: 'border-purple-200',
    bgDark: 'bg-purple-500/10',
    textDark: 'text-purple-300',
    borderDark: 'border-purple-500/20'
  },
  bloc: {
    id: 'bloc',
    label: 'BLoC',
    category: 'state',
    color: '#7C3AED',
    bgLight: 'bg-violet-50',
    textLight: 'text-violet-800',
    borderLight: 'border-violet-200',
    bgDark: 'bg-violet-500/10',
    textDark: 'text-violet-300',
    borderDark: 'border-violet-500/20'
  },
  provider: {
    id: 'provider',
    label: 'Provider',
    category: 'state',
    color: '#6366F1',
    bgLight: 'bg-indigo-50',
    textLight: 'text-indigo-800',
    borderLight: 'border-indigo-200',
    bgDark: 'bg-indigo-500/10',
    textDark: 'text-indigo-300',
    borderDark: 'border-indigo-500/20'
  },
  cleanarchitecture: {
    id: 'cleanarchitecture',
    label: 'Clean Architecture',
    category: 'architecture',
    color: '#06B6D4',
    bgLight: 'bg-cyan-50',
    textLight: 'text-cyan-800',
    borderLight: 'border-cyan-200',
    bgDark: 'bg-cyan-500/10',
    textDark: 'text-cyan-300',
    borderDark: 'border-cyan-500/20'
  },
  'clean-architecture': {
    id: 'clean-architecture',
    label: 'Clean Architecture',
    category: 'architecture',
    color: '#06B6D4',
    bgLight: 'bg-cyan-50',
    textLight: 'text-cyan-800',
    borderLight: 'border-cyan-200',
    bgDark: 'bg-cyan-500/10',
    textDark: 'text-cyan-300',
    borderDark: 'border-cyan-500/20'
  },

  // Storage & Databases
  'hive-ce': {
    id: 'hive-ce',
    label: 'Hive CE',
    category: 'storage',
    color: '#F59E0B',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-800',
    borderLight: 'border-amber-200',
    bgDark: 'bg-amber-500/10',
    textDark: 'text-amber-300',
    borderDark: 'border-amber-500/20'
  },
  hive: {
    id: 'hive',
    label: 'Hive',
    category: 'storage',
    color: '#F59E0B',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-800',
    borderLight: 'border-amber-200',
    bgDark: 'bg-amber-500/10',
    textDark: 'text-amber-300',
    borderDark: 'border-amber-500/20'
  },
  sqflite: {
    id: 'sqflite',
    label: 'Sqflite / SQLite',
    category: 'storage',
    color: '#0284C7',
    bgLight: 'bg-sky-50',
    textLight: 'text-sky-800',
    borderLight: 'border-sky-200',
    bgDark: 'bg-sky-500/10',
    textDark: 'text-sky-300',
    borderDark: 'border-sky-500/20'
  },
  sqlite: {
    id: 'sqlite',
    label: 'SQLite',
    category: 'storage',
    color: '#0284C7',
    bgLight: 'bg-sky-50',
    textLight: 'text-sky-800',
    borderLight: 'border-sky-200',
    bgDark: 'bg-sky-500/10',
    textDark: 'text-sky-300',
    borderDark: 'border-sky-500/20'
  },
  firebase: {
    id: 'firebase',
    label: 'Firebase',
    category: 'storage',
    color: '#F97316',
    bgLight: 'bg-orange-50',
    textLight: 'text-orange-800',
    borderLight: 'border-orange-200',
    bgDark: 'bg-orange-500/10',
    textDark: 'text-orange-300',
    borderDark: 'border-orange-500/20'
  },

  // APIs & Networking
  'tmdb-api': {
    id: 'tmdb-api',
    label: 'TMDB API',
    category: 'api',
    color: '#01B4E4',
    bgLight: 'bg-cyan-50',
    textLight: 'text-cyan-800',
    borderLight: 'border-cyan-200',
    bgDark: 'bg-cyan-500/10',
    textDark: 'text-cyan-300',
    borderDark: 'border-cyan-500/20'
  },
  'sliver-ui': {
    id: 'sliver-ui',
    label: 'Sliver UI',
    category: 'framework',
    color: '#0284C7',
    bgLight: 'bg-sky-50',
    textLight: 'text-sky-800',
    borderLight: 'border-sky-200',
    bgDark: 'bg-sky-500/10',
    textDark: 'text-sky-300',
    borderDark: 'border-sky-500/20'
  },
  retrofit: {
    id: 'retrofit',
    label: 'Retrofit / Dio',
    category: 'api',
    color: '#10B981',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-800',
    borderLight: 'border-emerald-200',
    bgDark: 'bg-emerald-500/10',
    textDark: 'text-emerald-300',
    borderDark: 'border-emerald-500/20'
  },
  'rest-api': {
    id: 'rest-api',
    label: 'REST API',
    category: 'api',
    color: '#10B981',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-800',
    borderLight: 'border-emerald-200',
    bgDark: 'bg-emerald-500/10',
    textDark: 'text-emerald-300',
    borderDark: 'border-emerald-500/20'
  },
  api: {
    id: 'api',
    label: 'REST API',
    category: 'api',
    color: '#10B981',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-800',
    borderLight: 'border-emerald-200',
    bgDark: 'bg-emerald-500/10',
    textDark: 'text-emerald-300',
    borderDark: 'border-emerald-500/20'
  },
  tmdb: {
    id: 'tmdb',
    label: 'TMDB API',
    category: 'api',
    color: '#01B4E4',
    bgLight: 'bg-cyan-50',
    textLight: 'text-cyan-800',
    borderLight: 'border-cyan-200',
    bgDark: 'bg-cyan-500/10',
    textDark: 'text-cyan-300',
    borderDark: 'border-cyan-500/20'
  },
  weatherapi: {
    id: 'weatherapi',
    label: 'WeatherAPI',
    category: 'api',
    color: '#0EA5E9',
    bgLight: 'bg-sky-50',
    textLight: 'text-sky-800',
    borderLight: 'border-sky-200',
    bgDark: 'bg-sky-500/10',
    textDark: 'text-sky-300',
    borderDark: 'border-sky-500/20'
  },

  // Platforms
  'google-play': {
    id: 'google-play',
    label: 'Google Play',
    category: 'platform',
    color: '#00875A',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-800',
    borderLight: 'border-emerald-200',
    bgDark: 'bg-emerald-500/10',
    textDark: 'text-emerald-300',
    borderDark: 'border-emerald-500/20'
  },
  android: {
    id: 'android',
    label: 'Android',
    category: 'platform',
    color: '#3DDC84',
    bgLight: 'bg-green-50',
    textLight: 'text-green-800',
    borderLight: 'border-green-200',
    bgDark: 'bg-green-500/10',
    textDark: 'text-green-300',
    borderDark: 'border-green-500/20'
  }
};

/**
 * Automatically analyzes repo attributes (language, topics, description, repo name)
 * and extracts a rich, deduplicated and beautifully categorised list of technology badges.
 */
export function extractRepoTechTags(params: {
  repoName: string;
  language?: string | null;
  topics?: string[];
  description?: string | null;
  technologies?: string[];
}): TechTag[] {
  const { repoName, language, topics = [], description = '', technologies = [] } = params;
  const extractedMap = new Map<string, TechTag>();

  // 1. Primary Language Extraction
  const primaryLang = (language || 'Dart').trim();
  const langKey = primaryLang.toLowerCase();
  if (KNOWN_TECH_MAP[langKey]) {
    extractedMap.set(KNOWN_TECH_MAP[langKey].label.toLowerCase(), KNOWN_TECH_MAP[langKey]);
  } else if (primaryLang) {
    extractedMap.set(primaryLang.toLowerCase(), {
      id: langKey,
      label: primaryLang,
      category: 'language',
      color: '#3B82F6',
      bgLight: 'bg-blue-50',
      textLight: 'text-blue-800',
      borderLight: 'border-blue-200',
      bgDark: 'bg-blue-500/10',
      textDark: 'text-blue-300',
      borderDark: 'border-blue-500/20'
    });
  }

  // 2. Framework Detection
  // If it uses Dart, default Framework is Flutter
  if (primaryLang.toLowerCase() === 'dart' || (description && /flutter/i.test(description)) || topics.includes('flutter')) {
    extractedMap.set('flutter', KNOWN_TECH_MAP['flutter']);
  }

  // 3. Process explicit technologies array (if coming from portfolio data)
  for (const tech of technologies) {
    const key = tech.toLowerCase().replace(/[\s_]/g, '-');
    const directKey = tech.toLowerCase().replace(/[\s_-]/g, '');
    const matched = KNOWN_TECH_MAP[key] || KNOWN_TECH_MAP[directKey];
    if (matched) {
      extractedMap.set(matched.label.toLowerCase(), matched);
    } else {
      extractedMap.set(tech.toLowerCase(), {
        id: key,
        label: tech,
        category: 'architecture',
        color: '#64748B',
        bgLight: 'bg-slate-100',
        textLight: 'text-slate-800',
        borderLight: 'border-slate-200',
        bgDark: 'bg-white/5',
        textDark: 'text-slate-300',
        borderDark: 'border-white/10'
      });
    }
  }

  // 4. Process GitHub Topics
  for (const topic of topics) {
    const cleanTopic = topic.trim().toLowerCase();
    if (cleanTopic === 'dart' && extractedMap.has('dart')) continue;
    if (cleanTopic === 'flutter' && extractedMap.has('flutter')) continue;

    const matched = KNOWN_TECH_MAP[cleanTopic] || KNOWN_TECH_MAP[cleanTopic.replace(/-/g, '')];
    if (matched) {
      extractedMap.set(matched.label.toLowerCase(), matched);
    } else {
      // Format topic title case
      const formattedLabel = cleanTopic
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      extractedMap.set(cleanTopic, {
        id: cleanTopic,
        label: formattedLabel,
        category: 'state',
        color: '#3B82F6',
        bgLight: 'bg-slate-100',
        textLight: 'text-slate-800',
        borderLight: 'border-slate-200',
        bgDark: 'bg-white/5',
        textDark: 'text-slate-300',
        borderDark: 'border-white/10'
      });
    }
  }

  // 5. Intelligent NLP extraction from repository description & name
  const textCorpus = `${repoName} ${description || ''}`.toLowerCase();

  // Explicit check for Cubit
  if ((textCorpus.includes('cubit') || repoName.toLowerCase().includes('movura') || repoName.toLowerCase().includes('revio')) && !extractedMap.has('cubit')) {
    extractedMap.set('cubit', KNOWN_TECH_MAP['cubit']);
  }
  // Explicit check for BLoC (both can coexist as reactive state management)
  if ((textCorpus.includes('bloc') || textCorpus.includes('b-loc') || repoName.toLowerCase().includes('movura')) && !extractedMap.has('bloc')) {
    extractedMap.set('bloc', KNOWN_TECH_MAP['bloc']);
  }
  if ((textCorpus.includes('hive ce') || textCorpus.includes('hive')) && !extractedMap.has('hive-ce') && !extractedMap.has('hive')) {
    extractedMap.set('hive-ce', KNOWN_TECH_MAP['hive-ce']);
  }
  if ((textCorpus.includes('clean architecture') || textCorpus.includes('clean-architecture') || textCorpus.includes('clean arch')) && !extractedMap.has('clean architecture')) {
    extractedMap.set('clean architecture', KNOWN_TECH_MAP['clean-architecture']);
  }
  if ((textCorpus.includes('tmdb') || textCorpus.includes('themoviedb')) && !extractedMap.has('tmdb-api') && !extractedMap.has('tmdb')) {
    extractedMap.set('tmdb-api', KNOWN_TECH_MAP['tmdb-api']);
  }
  if ((textCorpus.includes('weatherapi') || textCorpus.includes('weather api')) && !extractedMap.has('weatherapi')) {
    extractedMap.set('weatherapi', KNOWN_TECH_MAP['weatherapi']);
  }
  if ((textCorpus.includes('sqlite') || textCorpus.includes('sqflite')) && !extractedMap.has('sqlite') && !extractedMap.has('sqflite')) {
    extractedMap.set('sqflite', KNOWN_TECH_MAP['sqflite']);
  }
  if (textCorpus.includes('google play') && !extractedMap.has('google play')) {
    extractedMap.set('google play', KNOWN_TECH_MAP['google-play']);
  }
  if (textCorpus.includes('rest api') && !extractedMap.has('rest api')) {
    extractedMap.set('rest api', KNOWN_TECH_MAP['rest-api']);
  }

  // State Management (Cubit/BLoC) & Core Architecture rank TOP priority so they are never truncated
  const categoryOrder: Record<TechTag['category'], number> = {
    state: 1,         // Cubit & BLoC always prominently visible first!
    framework: 2,     // Flutter
    architecture: 3,  // Clean Architecture
    storage: 4,       // Hive CE, SQLite
    platform: 5,      // Google Play
    api: 6,           // TMDB API, REST API
    language: 7       // Dart
  };

  return Array.from(extractedMap.values()).sort((a, b) => {
    const orderA = categoryOrder[a.category] ?? 10;
    const orderB = categoryOrder[b.category] ?? 10;
    return orderA - orderB;
  });
}
