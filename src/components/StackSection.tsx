import React, { useState } from 'react';
import { Search, Sparkles, Layers, Globe } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';
import { LANGUAGES_DATA } from '../data/portfolioData';
import {
  FlutterLogo,
  DartLogo,
  BlocLogo,
  CubitLogo,
  HiveLogo,
  DioLogo,
  RetrofitLogo,
  FirebaseLogo,
  CleanArchLogo,
  PythonLogo,
  AiLogo,
  GitLogo,
  AndroidStudioLogo,
  VSCodeLogo,
  PostmanLogo,
  FigmaLogo,
} from './TechLogos';

interface TechItem {
  id: string;
  name: string;
  category: 'mobile' | 'state-storage' | 'network-backend' | 'ai-cs' | 'tools';
  categoryLabel: string;
  proficiency: 'Advanced' | 'Proficient' | 'Exploring' | 'Advancing';
  highlightInApp: string;
  brandColor: string;
  description: string;
  subSkills?: string[];
  LogoComponent: React.FC<{ size?: number; className?: string }>;
}

export const DEDICATED_TECHS: TechItem[] = [
  {
    id: 'flutter',
    name: 'Flutter',
    category: 'mobile',
    categoryLabel: 'Mobile Core',
    proficiency: 'Advanced',
    highlightInApp: 'Core framework for Revio & Movura on Google Play',
    brandColor: '#02569B',
    description: 'Cross-platform native mobile engineering, custom Slivers, LayoutBuilder, and 60 FPS animations.',
    subSkills: ['Slivers & CustomPaint', '60 FPS Animations', 'Arabic RTL', 'Multi-Screen Responsive'],
    LogoComponent: FlutterLogo,
  },
  {
    id: 'dart',
    name: 'Dart',
    category: 'mobile',
    categoryLabel: 'Mobile Core',
    proficiency: 'Advanced',
    highlightInApp: 'Type-safe asynchronous programming & sound null-safety',
    brandColor: '#00B4AB',
    description: 'OOP, Mixins, Streams, Futures, Extension Methods, and Isolates for CPU-heavy tasks.',
    subSkills: ['OOP & SOLID', 'Async & Streams', 'Isolates', 'Generics & Mixins'],
    LogoComponent: DartLogo,
  },
  {
    id: 'bloc',
    name: 'BLoC Pattern',
    category: 'state-storage',
    categoryLabel: 'State Management',
    proficiency: 'Advanced',
    highlightInApp: 'Enterprise event-driven state streams in Movura & FluxStore',
    brandColor: '#00D9FF',
    description: 'Predictable state machine separating business logic from user interface presentation.',
    subSkills: ['Event-to-State Streams', 'Unidirectional Flow', 'BLoC Observer', 'Hydrated BLoC'],
    LogoComponent: BlocLogo,
  },
  {
    id: 'cubit',
    name: 'Cubit',
    category: 'state-storage',
    categoryLabel: 'State Management',
    proficiency: 'Advanced',
    highlightInApp: 'Powering Revio flashcard study modes & scoring on Google Play',
    brandColor: '#22D3EE',
    description: 'Lightweight, function-driven state management for clean and maintainable UI states.',
    subSkills: ['Direct State Emit', 'Lightweight Logic', 'Revio Quiz Engine', 'BlocBuilder/Consumer'],
    LogoComponent: CubitLogo,
  },
  {
    id: 'hive-ce',
    name: 'Hive CE',
    category: 'state-storage',
    categoryLabel: 'Local Storage',
    proficiency: 'Advanced',
    highlightInApp: 'Full offline local flashcard CRUD persistence in Revio',
    brandColor: '#FFCC00',
    description: 'Blazing-fast NoSQL key-value database written in pure Dart with binary serialization.',
    subSkills: ['Key-Value NoSQL', 'Binary Adapters', 'Offline-First Caching', 'Zero-Latency Reads'],
    LogoComponent: HiveLogo,
  },
  {
    id: 'clean-arch',
    name: 'Clean Architecture',
    category: 'mobile',
    categoryLabel: 'Software Architecture',
    proficiency: 'Advanced',
    highlightInApp: 'Strictly applied across all public GitHub repositories',
    brandColor: '#6C63FF',
    description: 'Domain-Driven Design (Entities, UseCases, Repositories, DataSources) & SOLID principles.',
    subSkills: ['Domain / Data / Presentation', 'Repository Pattern', 'Dependency Injection', 'SOLID Principles'],
    LogoComponent: CleanArchLogo,
  },
  {
    id: 'dio',
    name: 'Dio Client',
    category: 'network-backend',
    categoryLabel: 'Networking',
    proficiency: 'Advanced',
    highlightInApp: 'Interceptors and error recovery pipelines in News-Cloud',
    brandColor: '#0175C2',
    description: 'Powerful HTTP client with global interceptors, transformers, and automated request cancellation.',
    subSkills: ['Global Interceptors', 'Token Handling', 'Request Cancellation', 'FormData & Uploads'],
    LogoComponent: DioLogo,
  },
  {
    id: 'retrofit',
    name: 'Retrofit',
    category: 'network-backend',
    categoryLabel: 'Networking',
    proficiency: 'Proficient',
    highlightInApp: 'Type-safe REST API client code generator for clean network code',
    brandColor: '#E53935',
    description: 'Annotation-based REST client turning HTTP endpoints into clear Dart interfaces.',
    subSkills: ['Code Generation', 'Type-Safe Contracts', 'JSON Serialization', 'Clean API Facade'],
    LogoComponent: RetrofitLogo,
  },
  {
    id: 'firebase',
    name: 'Firebase & Firestore',
    category: 'network-backend',
    categoryLabel: 'Cloud & Auth',
    proficiency: 'Proficient',
    highlightInApp: 'Real-time message sync & user authentication in Shaats chat app',
    brandColor: '#FFA000',
    description: 'Reactive document streams, Cloud Storage, and secure Firebase Authentication.',
    subSkills: ['Cloud Firestore', 'Authentication Session', 'Real-time Streams', 'Rules & Security'],
    LogoComponent: FirebaseLogo,
  },
  {
    id: 'python',
    name: 'Python',
    category: 'ai-cs',
    categoryLabel: 'Computer Science',
    proficiency: 'Proficient',
    highlightInApp: 'Data structures problem solving & Machine Learning coursework',
    brandColor: '#3776AB',
    description: 'Academic algorithmic foundations, scripting, and computer science problem solving.',
    subSkills: ['Data Structures', 'Algorithm Analysis', 'ML Foundations', 'Scripting & Automation'],
    LogoComponent: PythonLogo,
  },
  {
    id: 'ai-ml',
    name: 'CS & Problem Solving',
    category: 'ai-cs',
    categoryLabel: 'Academic Degree',
    proficiency: 'Advancing',
    highlightInApp: 'Faculty of Artificial Intelligence, Kafrelsheikh University',
    brandColor: '#F43F5E',
    description: 'Search algorithms, machine learning models, database theory, and computational logic.',
    subSkills: ['Discrete Mathematics', 'Database Systems', 'Logic & Problem Solving', 'Academic Studies'],
    LogoComponent: AiLogo,
  },
  {
    id: 'git',
    name: 'Git Version Control',
    category: 'tools',
    categoryLabel: 'DevOps & VCS',
    proficiency: 'Advanced',
    highlightInApp: '13+ public repositories with active semantic commit history',
    brandColor: '#F05138',
    description: 'Feature branching, pull requests, merge conflict resolution, and versioning.',
    subSkills: ['Git Flow', 'Releases & Tags', 'Merge Strategies', 'Semantic Commits'],
    LogoComponent: GitLogo,
  },
  {
    id: 'android-studio',
    name: 'Android Studio',
    category: 'tools',
    categoryLabel: 'Tooling',
    proficiency: 'Advanced',
    highlightInApp: 'Native Android compilation, Gradle configurations, and APK signing',
    brandColor: '#3DDC84',
    description: 'Device profiling, layout inspector, native SDK management, and release bundling.',
    subSkills: ['Gradle Build', 'Keystore Signing', 'Logcat & Debugger', 'Device Profiling'],
    LogoComponent: AndroidStudioLogo,
  },
  {
    id: 'vscode',
    name: 'VS Code',
    category: 'tools',
    categoryLabel: 'Tooling',
    proficiency: 'Advanced',
    highlightInApp: 'Primary development environment with custom Dart & Flutter toolchains',
    brandColor: '#007ACC',
    description: 'Hot reload workflows, linting rule enforcement, and keyboard-centric refactoring.',
    subSkills: ['Dart Toolchain', 'Hot Reload/Restart', 'Custom Snippets', 'Static Analysis'],
    LogoComponent: VSCodeLogo,
  },
  {
    id: 'postman',
    name: 'Postman',
    category: 'tools',
    categoryLabel: 'Tooling',
    proficiency: 'Advanced',
    highlightInApp: 'Testing TMDB, WeatherAPI, and DummyJSON endpoints prior to integration',
    brandColor: '#FF6C37',
    description: 'REST API endpoint inspection, automated collections, and mock environment setups.',
    subSkills: ['API Mocking', 'Collection Runners', 'Environment Vars', 'Payload Validation'],
    LogoComponent: PostmanLogo,
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'tools',
    categoryLabel: 'Design to Code',
    proficiency: 'Proficient',
    highlightInApp: 'Pixel-accurate UI translation to responsive Flutter widgets',
    brandColor: '#A259FF',
    description: 'Design system interpretation, vector asset extraction, and responsive design specs.',
    subSkills: ['Pixel Precision', 'Design Tokens', 'Asset Export', 'Responsive Specs'],
    LogoComponent: FigmaLogo,
  }
];

export const StackSection: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterTabs = [
    { id: 'all', label: 'All Technologies' },
    { id: 'mobile', label: 'Mobile Core' },
    { id: 'state-storage', label: 'State & Storage' },
    { id: 'network-backend', label: 'APIs & Cloud' },
    { id: 'ai-cs', label: 'AI & Engineering' },
    { id: 'tools', label: 'Developer Tools' },
  ];

  const filteredTechs = DEDICATED_TECHS.filter((item) => {
    if (selectedFilter !== 'all' && item.category !== selectedFilter) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.highlightInApp.toLowerCase().includes(q)
    );
  });

  return (
    <section id="stack" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-black/10 dark:border-white/5">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles size={13} />
          <span>Core Engineering Toolkit</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight title-contrast">
          Tech Stack & Architecture Arsenal
        </h2>
        <p className="text-slate-600 dark:text-gray-400 mt-2 text-sm sm:text-base body-contrast">
          Frameworks, state architectures, and tools used to build robust, scalable mobile applications.
        </p>

        {/* Filter Tabs & Live Search */}
        <div className="w-full mt-7 flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-full bg-slate-200/70 dark:bg-white/5 border border-black/10 dark:border-white/10">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search stack (e.g. Flutter, BLoC...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Interactive Spotlight Tech Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTechs.map((tech) => {
          const Logo = tech.LogoComponent;
          return (
            <SpotlightCard
              key={tech.id}
              spotlightColor={`${tech.brandColor}20`}
              className="p-5 flex flex-col justify-between group border border-black/10 dark:border-white/10 bg-white dark:bg-[#131522] hover:border-blue-500/40 transition-all duration-300 rounded-2xl"
            >
              <div>
                {/* Card Top: Brand Logo */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="relative w-12 h-12 rounded-xl flex items-center justify-center border border-black/5 dark:border-white/10 bg-slate-50 dark:bg-[#1a1d2e] shadow-xs group-hover:scale-105 transition-transform">
                    <Logo size={26} />
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-cyan-300 font-bold">
                      {tech.categoryLabel}
                    </span>
                    <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{tech.proficiency}</span>
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors title-contrast">
                  {tech.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed body-contrast">
                  {tech.description}
                </p>

                {/* Sub-skills Tags */}
                {tech.subSkills && tech.subSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-black/5 dark:border-white/5">
                    {tech.subSkills.map((sub) => (
                      <span
                        key={sub}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[10px] font-mono text-slate-700 dark:text-gray-300"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Application Note */}
              <div className="mt-4 pt-2.5 border-t border-black/5 dark:border-white/5">
                <div className="text-[11px] text-cyan-700 dark:text-cyan-400 font-mono flex items-start gap-1.5">
                  <span className="text-blue-500 shrink-0 font-bold">›</span>
                  <span className="line-clamp-2 font-medium">{tech.highlightInApp}</span>
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>

      {filteredTechs.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-gray-400 card-techno rounded-2xl p-6 bg-white dark:bg-[#131522]">
          <Layers size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-xs font-medium">No technologies matched your search filter.</p>
        </div>
      )}

      {/* ELEVATED LANGUAGES & COMMUNICATION SECTION */}
      <div className="mt-14 card-techno rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#131522] border border-black/10 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white title-contrast">
                Language Proficiency & Technical Communication
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                Professional communication across Arabic (Native) and English (Technical & Documentation)
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 self-start sm:self-auto">
            Bilingual Capability
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {LANGUAGES_DATA.map((lang) => (
            <div
              key={lang.name}
              className="p-5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{lang.name}</span>
                        <span className="text-xs font-normal text-slate-500 dark:text-gray-400 font-mono">({lang.nativeName})</span>
                      </div>
                      <div className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                        {lang.proficiency}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-cyan-300 font-bold border border-blue-500/20">
                    {lang.level}
                  </span>
                </div>

                {/* Clean Proficiency Bar */}
                <div className="space-y-1 mt-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-gray-400">
                    <span>Proficiency Level</span>
                    <span>{lang.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                      style={{ width: `${lang.percentage}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-gray-400 mt-3 leading-relaxed">
                  {lang.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
