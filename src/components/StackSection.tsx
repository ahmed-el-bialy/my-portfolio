import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Layers, Info } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import { useLanguage } from '../context/LanguageContext';
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
  highlightInApp: string;
  description: string;
  subSkills: string[];
  LogoComponent: React.FC<{ size?: number; className?: string }>;
}

export const DEDICATED_TECHS: TechItem[] = [
  {
    id: 'flutter',
    name: 'Flutter',
    category: 'mobile',
    categoryLabel: 'Mobile Core',
    highlightInApp: 'Revio · Movura · Vibrant Store',
    description:
      'Cross-platform native mobile engineering, custom Slivers, LayoutBuilder, and 60 FPS animations.',
    subSkills: ['Slivers & CustomPaint', '60 FPS Animations', 'Arabic RTL', 'Multi-Screen Responsive'],
    LogoComponent: FlutterLogo,
  },
  {
    id: 'dart',
    name: 'Dart',
    category: 'mobile',
    categoryLabel: 'Mobile Core',
    highlightInApp: 'All Mobile Repositories',
    description:
      'Type-safe asynchronous programming with OOP, Mixins, Streams, Futures, and sound null-safety.',
    subSkills: ['OOP & SOLID', 'Async & Streams', 'Isolates', 'Generics & Mixins'],
    LogoComponent: DartLogo,
  },
  {
    id: 'clean-arch',
    name: 'Clean Architecture',
    category: 'mobile',
    categoryLabel: 'Software Architecture',
    highlightInApp: 'Revio · Movura · News-Cloud',
    description:
      'Domain-Driven Design (Entities, UseCases, Repositories, DataSources) enforcing clean layer boundaries.',
    subSkills: ['Domain / Data / Presentation', 'Repository Pattern', 'Dependency Injection', 'SOLID Principles'],
    LogoComponent: CleanArchLogo,
  },
  {
    id: 'bloc',
    name: 'BLoC Pattern',
    category: 'state-storage',
    categoryLabel: 'State Management',
    highlightInApp: 'Movura · Shaats · Sky-Cast',
    description:
      'Predictable event-driven state machine separating business logic from presentation trees.',
    subSkills: ['Event-to-State Streams', 'Unidirectional Flow', 'BLoC Observer'],
    LogoComponent: BlocLogo,
  },
  {
    id: 'cubit',
    name: 'Cubit',
    category: 'state-storage',
    categoryLabel: 'State Management',
    highlightInApp: 'Revio (Google Play) · Quotely',
    description:
      'Lightweight, function-driven state management for fast feature iteration and predictable UI rebuilds.',
    subSkills: ['Direct State Emit', 'Lightweight Logic', 'BlocBuilder / Consumer'],
    LogoComponent: CubitLogo,
  },
  {
    id: 'hive-ce',
    name: 'Hive CE',
    category: 'state-storage',
    categoryLabel: 'Local Storage',
    highlightInApp: 'Revio Offline Flashcard CRUD',
    description:
      'Zero-latency NoSQL key-value database written in pure Dart with binary TypeAdapters.',
    subSkills: ['Key-Value NoSQL', 'Binary Adapters', 'Offline-First Caching'],
    LogoComponent: HiveLogo,
  },
  {
    id: 'dio',
    name: 'Dio Client',
    category: 'network-backend',
    categoryLabel: 'Networking',
    highlightInApp: 'News-Cloud · Movura · Sky-Cast',
    description:
      'Resilient HTTP client configured with global interceptors, timeouts, and structured error mapping.',
    subSkills: ['Global Interceptors', 'Error Mapping', 'Request Cancellation'],
    LogoComponent: DioLogo,
  },
  {
    id: 'retrofit',
    name: 'Retrofit',
    category: 'network-backend',
    categoryLabel: 'Networking',
    highlightInApp: 'Quotely · Clean REST Clients',
    description:
      'Annotation-based REST client generation converting API contracts into type-safe Dart interfaces.',
    subSkills: ['Code Generation', 'Type-Safe Contracts', 'JSON Serialization'],
    LogoComponent: RetrofitLogo,
  },
  {
    id: 'firebase',
    name: 'Firebase & Firestore',
    category: 'network-backend',
    categoryLabel: 'Cloud & Auth',
    highlightInApp: 'Shaats Real-Time Chat',
    description:
      'Reactive document snapshot streams, Cloud Storage uploads, and Firebase Authentication workflows.',
    subSkills: ['Cloud Firestore', 'Firebase Auth', 'Real-time Streams'],
    LogoComponent: FirebaseLogo,
  },
  {
    id: 'python',
    name: 'Python',
    category: 'ai-cs',
    categoryLabel: 'Computer Science',
    highlightInApp: 'Algorithms & ML Coursework',
    description:
      'Algorithmic problem solving, structured scripting, and foundational Artificial Intelligence studies.',
    subSkills: ['Data Structures', 'Algorithms', 'ML Foundations'],
    LogoComponent: PythonLogo,
  },
  {
    id: 'ai-ml',
    name: 'CS & Problem Solving',
    category: 'ai-cs',
    categoryLabel: 'Academic Degree',
    highlightInApp: 'Kafrelsheikh AI (2023–2027)',
    description:
      'Discrete math, search algorithms, database systems, and OOP modeling from Faculty of Artificial Intelligence.',
    subSkills: ['Discrete Math', 'Database Systems', 'Logic & Complexity'],
    LogoComponent: AiLogo,
  },
  {
    id: 'git',
    name: 'Git Version Control',
    category: 'tools',
    categoryLabel: 'DevOps & VCS',
    highlightInApp: '13+ Public Repositories',
    description:
      'Feature branching, pull requests, release tagging, and clean semantic commit conventions.',
    subSkills: ['Git Flow', 'Releases & Tags', 'Semantic Commits'],
    LogoComponent: GitLogo,
  },
  {
    id: 'android-studio',
    name: 'Android Studio',
    category: 'tools',
    categoryLabel: 'Tooling',
    highlightInApp: 'Google Play AAB Signing',
    description:
      'Native Android compilation, Gradle configuration, layout inspector, and signed release bundles.',
    subSkills: ['Gradle Build', 'Keystore Signing', 'Device Profiling'],
    LogoComponent: AndroidStudioLogo,
  },
  {
    id: 'vscode',
    name: 'VS Code',
    category: 'tools',
    categoryLabel: 'Tooling',
    highlightInApp: 'Daily Flutter Toolchain',
    description:
      'Primary IDE setup with Dart static analysis rules, debugging launch configs, and rapid refactoring.',
    subSkills: ['Dart Toolchain', 'Hot Reload', 'Static Analysis'],
    LogoComponent: VSCodeLogo,
  },
  {
    id: 'postman',
    name: 'Postman',
    category: 'tools',
    categoryLabel: 'Tooling',
    highlightInApp: 'TMDB · WeatherAPI · DummyJSON',
    description:
      'REST API contract inspection, payload verification, and test environments prior to integration.',
    subSkills: ['API Inspection', 'Environment Vars', 'Payload Validation'],
    LogoComponent: PostmanLogo,
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'tools',
    categoryLabel: 'Design to Code',
    highlightInApp: 'Responsive UI Translation',
    description:
      'Accurate design-to-Flutter widget translation with consistent spacing scales and vector exports.',
    subSkills: ['Pixel Precision', 'Design Tokens', 'Asset Export'],
    LogoComponent: FigmaLogo,
  },
];

type StackFilter = 'all' | TechItem['category'];

export const StackSection: React.FC = () => {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<StackFilter>('all');
  const [expandedTechId, setExpandedTechId] = useState<string | null>(null);

  const filterTabs: Array<{ id: StackFilter; label: string }> = [
    { id: 'all', label: lang === 'ar' ? 'الكل' : 'All' },
    { id: 'mobile', label: t.stack.categories.mobile },
    { id: 'state-storage', label: t.stack.categories.stateStorage },
    { id: 'network-backend', label: t.stack.categories.networkBackend },
    { id: 'ai-cs', label: t.stack.categories.aiCs },
    { id: 'tools', label: t.stack.categories.tools },
  ];

  const filteredTechs = useMemo(() => {
    return DEDICATED_TECHS.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.highlightInApp.toLowerCase().includes(q) ||
        item.subSkills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [activeCategory, searchQuery]);

  return (
    <section
      id="stack"
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-slate-200/80 dark:border-white/8 w-full"
    >
      {/* Header & Search */}
      <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium text-[#027DFD] dark:text-[#00C7FF] mb-2">
            <span>{t.stack.badge}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 dark:text-[#94a3b8]">
              {lang === 'ar' ? 'مهارات وأدوات هندسية موثقة' : 'Verified Production Stack'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#f1f5f9] tracking-tight">
            {t.stack.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-[#94a3b8] mt-1.5">
            {t.stack.subtitle}
          </p>
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 text-slate-400 start-3.5" />
          <input
            type="text"
            placeholder={t.stack.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 rounded-xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-[#f1f5f9] placeholder-slate-400 focus:outline-none focus:border-[#027DFD] transition-colors ps-9 pe-3.5 min-h-[40px]"
          />
        </div>
      </RevealOnScroll>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mb-7 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 w-full">
        {filterTabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#027DFD] text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-[#f1f5f9]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Interactive Skill Cards Grid */}
      {filteredTechs.length === 0 ? (
        <div className="text-center py-10 text-slate-500 dark:text-[#94a3b8] rounded-2xl p-6 bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10">
          <Layers size={28} className="mx-auto mb-2 opacity-50" />
          <p className="text-xs font-medium">{t.stack.noTechFound}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTechs.map((tech, idx) => {
            const Logo = tech.LogoComponent;
            const isExpanded = expandedTechId === tech.id;

            return (
              <RevealOnScroll
                key={tech.id}
                delay={Math.min(idx * 0.03, 0.24)}
                className="flex"
              >
                <div
                  onClick={() => setExpandedTechId(isExpanded ? null : tech.id)}
                  className="w-full group p-5 rounded-2xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 hover:border-[#027DFD]/50 transition-all duration-200 flex flex-col justify-between cursor-pointer"
                >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/10 shrink-0">
                        <Logo size={21} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-[#f1f5f9] truncate group-hover:text-[#027DFD] dark:group-hover:text-[#00C7FF] transition-colors">
                          {tech.name}
                        </h3>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-[#94a3b8]">
                          {tech.categoryLabel}
                        </span>
                      </div>
                    </div>

                    <Info
                      size={14}
                      className={`shrink-0 transition-colors ${
                        isExpanded
                          ? 'text-[#027DFD] dark:text-[#00C7FF]'
                          : 'text-slate-400 group-hover:text-[#027DFD] dark:group-hover:text-[#00C7FF]'
                      }`}
                    />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-[#94a3b8] leading-relaxed">
                    {tech.description}
                  </p>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <ul className="mt-3 pt-3 border-t border-slate-100 dark:border-white/8 space-y-1">
                          {tech.subSkills.map((sub) => (
                            <li
                              key={sub}
                              className="text-[11px] font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                            >
                              <span className="text-[#027DFD] dark:text-[#00C7FF]">·</span>
                              <span>{sub}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/8 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-[#027DFD] dark:text-[#00C7FF] font-semibold truncate">
                    {tech.highlightInApp}
                  </span>
                  <span className="text-slate-400 font-mono shrink-0">
                    {isExpanded
                      ? lang === 'ar'
                        ? 'إخفاء'
                        : 'Less'
                      : lang === 'ar'
                      ? 'التفاصيل'
                      : 'Capabilities'}
                  </span>
                </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      )}
    </section>
  );
};
