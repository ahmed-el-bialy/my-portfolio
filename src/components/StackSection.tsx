import React, { useState, useMemo } from 'react';
import { Search, Layers, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
  categoryLabelAr: string;
  highlightInApp: string;
  description: string;
  descriptionAr: string;
  subSkills: string[];
  accentColor: string;
  glowRgb: string;
  LogoComponent: React.FC<{ size?: number; className?: string }>;
}

export const DEDICATED_TECHS: TechItem[] = [
  {
    id: 'flutter',
    name: 'Flutter',
    category: 'mobile',
    categoryLabel: 'Mobile Core',
    categoryLabelAr: 'نواة تطبيقات الموبايل',
    highlightInApp: 'Revio · Movura · Vibrant Store',
    description:
      'Cross-platform native mobile engineering, custom Slivers, LayoutBuilder, and physics-driven UI.',
    descriptionAr:
      'تطوير تطبيقات Android و iOS بأداء أصلي، وتصميم واجهات Slivers مخصصة وحركات تفاعلية سلسة.',
    subSkills: ['Slivers & CustomPaint', 'Custom Animations', 'Arabic RTL', 'Multi-Screen Responsive'],
    accentColor: '#0284ff',
    glowRgb: '2, 132, 255',
    LogoComponent: FlutterLogo,
  },
  {
    id: 'dart',
    name: 'Dart',
    category: 'mobile',
    categoryLabel: 'Mobile Core',
    categoryLabelAr: 'نواة اللغة البرمجية',
    highlightInApp: 'All Mobile Repositories',
    description:
      'Type-safe asynchronous programming with OOP, Mixins, Streams, Futures, and sound null-safety.',
    descriptionAr:
      'برمجة آمنة الأنواع مع دعم Null Safety، والبرمجة الكائنية OOP، وإدارة التدفقات Streams و Futures.',
    subSkills: ['OOP & SOLID', 'Async & Streams', 'Isolates', 'Generics & Mixins'],
    accentColor: '#00B4AB',
    glowRgb: '0, 180, 171',
    LogoComponent: DartLogo,
  },
  {
    id: 'clean-arch',
    name: 'Clean Architecture',
    category: 'mobile',
    categoryLabel: 'Software Architecture',
    categoryLabelAr: 'المعمارية البرمجية',
    highlightInApp: 'Revio · Movura · News-Cloud',
    description:
      'Domain-Driven Design (Entities, UseCases, Repositories, DataSources) enforcing clean layer boundaries.',
    descriptionAr:
      'فصل كامل بين طبقات Domain و Data و Presentation لضمان قابلية التوسع والاختبار والصيانة.',
    subSkills: ['Domain / Data / Presentation', 'Repository Pattern', 'Dependency Injection', 'SOLID Principles'],
    accentColor: '#6366F1',
    glowRgb: '99, 102, 241',
    LogoComponent: CleanArchLogo,
  },
  {
    id: 'bloc',
    name: 'BLoC Pattern',
    category: 'state-storage',
    categoryLabel: 'State Management',
    categoryLabelAr: 'إدارة الحالة (Events)',
    highlightInApp: 'Movura · Shaats · Sky-Cast',
    description:
      'Predictable event-driven state machine separating business logic from presentation trees.',
    descriptionAr:
      'إدارة حالة مبنية على الأحداث (Event-to-State Streams) تفصل منطق العمل بالكامل عن الواجهات.',
    subSkills: ['Event-to-State Streams', 'Unidirectional Flow', 'BLoC Observer'],
    accentColor: '#00D9FF',
    glowRgb: '0, 217, 255',
    LogoComponent: BlocLogo,
  },
  {
    id: 'cubit',
    name: 'Cubit',
    category: 'state-storage',
    categoryLabel: 'State Management',
    categoryLabelAr: 'إدارة الحالة السريعة',
    highlightInApp: 'Revio (Google Play) · Quotely',
    description:
      'Lightweight, function-driven state management for fast feature iteration and predictable UI rebuilds.',
    descriptionAr:
      'إدارة حالة خفيفة ومباشرة لبناء الميزات بسرعة مع تحديث انتقائي دقيق لعناصر الشاشة.',
    subSkills: ['Direct State Emit', 'Lightweight Logic', 'BlocBuilder / Consumer'],
    accentColor: '#22D3EE',
    glowRgb: '34, 211, 238',
    LogoComponent: CubitLogo,
  },
  {
    id: 'hive',
    name: 'Hive',
    category: 'state-storage',
    categoryLabel: 'Local Storage',
    categoryLabelAr: 'التخزين المحلي السريع',
    highlightInApp: 'Revio Offline Flashcard CRUD',
    description:
      'Zero-latency NoSQL key-value database written in pure Dart (used via hive_ce TypeAdapters).',
    descriptionAr:
      'قاعدة بيانات محلية NoSQL فائقة السرعة لعمل التطبيقات بدون إنترنت بكفاءة كاملة عبر hive_ce.',
    subSkills: ['Key-Value NoSQL', 'hive_ce Binary Adapters', 'Offline-First Caching'],
    accentColor: '#FDB813',
    glowRgb: '253, 184, 19',
    LogoComponent: HiveLogo,
  },
  {
    id: 'dio',
    name: 'Dio Client',
    category: 'network-backend',
    categoryLabel: 'Networking',
    categoryLabelAr: 'الشبكات و HTTP',
    highlightInApp: 'News-Cloud · Movura · Sky-Cast',
    description:
      'Resilient HTTP client configured with global interceptors, timeouts, and structured error mapping.',
    descriptionAr:
      'عميل اتصالات متقدم مزوّد بـ Interceptors ومعالجة ذكية للأخطاء وإعادة المحاولة التلقائية.',
    subSkills: ['Global Interceptors', 'Error Mapping', 'Request Cancellation'],
    accentColor: '#0284C7',
    glowRgb: '2, 132, 199',
    LogoComponent: DioLogo,
  },
  {
    id: 'retrofit',
    name: 'Retrofit',
    category: 'network-backend',
    categoryLabel: 'Networking',
    categoryLabelAr: 'توليد واجهات REST',
    highlightInApp: 'Quotely · Clean REST Clients',
    description:
      'Annotation-based REST client generation converting API contracts into type-safe Dart interfaces.',
    descriptionAr:
      'توليد تلقائي لعملاء REST API آمنين برمجياً عبر Annotations مع تحويل JSON تلقائياً.',
    subSkills: ['Code Generation', 'Type-Safe Contracts', 'JSON Serialization'],
    accentColor: '#10B981',
    glowRgb: '16, 185, 129',
    LogoComponent: RetrofitLogo,
  },
  {
    id: 'firebase',
    name: 'Firebase & Firestore',
    category: 'network-backend',
    categoryLabel: 'Cloud & Auth',
    categoryLabelAr: 'السحابة والمصادقة',
    highlightInApp: 'Shaats Real-Time Chat',
    description:
      'Reactive document snapshot streams, Cloud Storage uploads, and Firebase Authentication workflows.',
    descriptionAr:
      'تزامن لحظي فوري للبيانات عبر Cloud Firestore وتأمين جلسات المستخدمين بـ Firebase Auth.',
    subSkills: ['Cloud Firestore', 'Firebase Auth', 'Real-time Streams'],
    accentColor: '#FFCA28',
    glowRgb: '255, 202, 40',
    LogoComponent: FirebaseLogo,
  },
  {
    id: 'python',
    name: 'Python',
    category: 'ai-cs',
    categoryLabel: 'Computer Science',
    categoryLabelAr: 'علوم الحاسب والذكاء',
    highlightInApp: 'Algorithms & ML Coursework',
    description:
      'Algorithmic problem solving, structured scripting, and foundational Artificial Intelligence studies.',
    descriptionAr:
      'حل المشكلات الخوارزمية وهياكل البيانات وتطبيقات أسس الذكاء الاصطناعي وتعلم الآلة.',
    subSkills: ['Data Structures', 'Algorithms', 'ML Foundations'],
    accentColor: '#3776AB',
    glowRgb: '55, 118, 171',
    LogoComponent: PythonLogo,
  },
  {
    id: 'ai-ml',
    name: 'CS & Problem Solving',
    category: 'ai-cs',
    categoryLabel: 'Academic Degree',
    categoryLabelAr: 'الدراسة الأكاديمية',
    highlightInApp: 'Kafrelsheikh AI (2023–2027)',
    description:
      'Discrete math, search algorithms, database systems, and OOP modeling from Faculty of Artificial Intelligence.',
    descriptionAr:
      'دراسة أنظمة قواعد البيانات وهندسة البرمجيات والخوارزميات في كلية الذكاء الاصطناعي بكفر الشيخ.',
    subSkills: ['Discrete Math', 'Database Systems', 'Logic & Complexity'],
    accentColor: '#F43F5E',
    glowRgb: '244, 63, 94',
    LogoComponent: AiLogo,
  },
  {
    id: 'git',
    name: 'Git Version Control',
    category: 'tools',
    categoryLabel: 'DevOps & VCS',
    categoryLabelAr: 'إدارة الإصدارات',
    highlightInApp: '13+ Public Repositories',
    description:
      'Feature branching, pull requests, release tagging, and clean semantic commit conventions.',
    descriptionAr:
      'إدارة الفروع البرمجية والإصدارات (Tags/Releases) وتوثيق التعديلات باحترافية على GitHub.',
    subSkills: ['Git Flow', 'Releases & Tags', 'Semantic Commits'],
    accentColor: '#F05138',
    glowRgb: '240, 81, 56',
    LogoComponent: GitLogo,
  },
  {
    id: 'android-studio',
    name: 'Android Studio',
    category: 'tools',
    categoryLabel: 'Tooling',
    categoryLabelAr: 'بيئة البناء والنشر',
    highlightInApp: 'Google Play AAB Signing',
    description:
      'Native Android compilation, Gradle configuration, layout inspector, and signed release bundles.',
    descriptionAr:
      'تجهيز إعدادات Gradle وتوقيع حزم النشر الرسمية (AAB / APK) ورفعها على متجر Google Play.',
    subSkills: ['Gradle Build', 'Keystore Signing', 'Device Profiling'],
    accentColor: '#3DDC84',
    glowRgb: '61, 220, 132',
    LogoComponent: AndroidStudioLogo,
  },
  {
    id: 'vscode',
    name: 'VS Code',
    category: 'tools',
    categoryLabel: 'Tooling',
    categoryLabelAr: 'بيئة التطوير الأساسية',
    highlightInApp: 'Daily Flutter Toolchain',
    description:
      'Primary IDE setup with Dart static analysis rules, debugging launch configs, and rapid refactoring.',
    descriptionAr:
      'إعداد متكامل لفحص الكود الساكن وتنقيح الأخطاء السريع ورفع إنتاجية تطوير تطبيقات Flutter.',
    subSkills: ['Dart Toolchain', 'Hot Reload', 'Static Analysis'],
    accentColor: '#007ACC',
    glowRgb: '0, 122, 204',
    LogoComponent: VSCodeLogo,
  },
  {
    id: 'postman',
    name: 'Postman',
    category: 'tools',
    categoryLabel: 'Tooling',
    categoryLabelAr: 'اختبار الـ APIs',
    highlightInApp: 'TMDB · WeatherAPI · DummyJSON',
    description:
      'REST API contract inspection, payload verification, and test environments prior to integration.',
    descriptionAr:
      'فحص نقاط الاتصال واستجابات JSON وضبط متغيرات البيئة قبل ربطها بالتطبيقات.',
    subSkills: ['API Inspection', 'Environment Vars', 'Payload Validation'],
    accentColor: '#FF6C37',
    glowRgb: '255, 108, 55',
    LogoComponent: PostmanLogo,
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'tools',
    categoryLabel: 'Design to Code',
    categoryLabelAr: 'ترجمة التصميم لكود',
    highlightInApp: 'Responsive UI Translation',
    description:
      'Accurate design-to-Flutter widget translation with consistent spacing scales and vector exports.',
    descriptionAr:
      'تحويل تصميمات UI/UX بدقة عالية إلى Flutter Widgets متجاوبة مع جميع مقاسات الشاشات.',
    subSkills: ['Pixel Precision', 'Design Tokens', 'Asset Export'],
    accentColor: '#A259FF',
    glowRgb: '162, 89, 255',
    LogoComponent: FigmaLogo,
  },
];

type StackFilter = 'all' | TechItem['category'];

interface StackSectionProps {
  variant?: 'full' | 'overview';
  onExploreFullStack?: () => void;
}

export const StackSection: React.FC<StackSectionProps> = ({
  variant = 'full',
  onExploreFullStack,
}) => {
  const { lang, dir, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<StackFilter>('all');
  const [selectedToolId, setSelectedToolId] = useState<string>(DEDICATED_TECHS[0].id);
  const [hoveredToolId, setHoveredToolId] = useState<string | null>(null);

  const isFull = variant === 'full';
  const isRtl = dir === 'rtl';

  const filterTabs: Array<{ id: StackFilter; label: string; count: number }> = useMemo(
    () => [
      { id: 'all', label: lang === 'ar' ? 'الكل' : 'All', count: DEDICATED_TECHS.length },
      {
        id: 'mobile',
        label: t.stack.categories.mobile,
        count: DEDICATED_TECHS.filter((i) => i.category === 'mobile').length,
      },
      {
        id: 'state-storage',
        label: t.stack.categories.stateStorage,
        count: DEDICATED_TECHS.filter((i) => i.category === 'state-storage').length,
      },
      {
        id: 'network-backend',
        label: t.stack.categories.networkBackend,
        count: DEDICATED_TECHS.filter((i) => i.category === 'network-backend').length,
      },
      {
        id: 'ai-cs',
        label: t.stack.categories.aiCs,
        count: DEDICATED_TECHS.filter((i) => i.category === 'ai-cs').length,
      },
      {
        id: 'tools',
        label: t.stack.categories.tools,
        count: DEDICATED_TECHS.filter((i) => i.category === 'tools').length,
      },
    ],
    [lang, t]
  );

  const filteredTechs = useMemo(() => {
    if (!isFull) return DEDICATED_TECHS;

    return DEDICATED_TECHS.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.categoryLabelAr.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.descriptionAr.toLowerCase().includes(q) ||
        item.highlightInApp.toLowerCase().includes(q) ||
        item.subSkills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [isFull, activeCategory, searchQuery]);

  const activeLockedTech = useMemo(() => {
    if (filteredTechs.length === 0) return null;
    return filteredTechs.find((item) => item.id === selectedToolId) ?? filteredTechs[0];
  }, [filteredTechs, selectedToolId]);

  const inspectedTech = useMemo(() => {
    if (filteredTechs.length === 0) return null;
    if (hoveredToolId) {
      const hoveredMatch = filteredTechs.find((item) => item.id === hoveredToolId);
      if (hoveredMatch) return hoveredMatch;
    }
    return activeLockedTech;
  }, [filteredTechs, hoveredToolId, activeLockedTech]);

  const inspectedIndex = useMemo(() => {
    if (!inspectedTech) return -1;
    return filteredTechs.findIndex((item) => item.id === inspectedTech.id);
  }, [filteredTechs, inspectedTech]);

  const handleCycleTech = (direction: -1 | 1) => {
    if (filteredTechs.length <= 1) return;
    const baseIndex = inspectedIndex >= 0 ? inspectedIndex : 0;
    const nextIndex = (baseIndex + direction + filteredTechs.length) % filteredTechs.length;
    setHoveredToolId(null);
    setSelectedToolId(filteredTechs[nextIndex].id);
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setHoveredToolId(null);
  };

  const InspectedLogo = inspectedTech?.LogoComponent;
  const formattedIndex =
    inspectedIndex >= 0 ? String(inspectedIndex + 1).padStart(2, '0') : '00';
  const formattedTotal = String(filteredTechs.length).padStart(2, '0');

  return (
    <section
      id="stack"
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-slate-200/80 dark:border-white/8 w-full"
    >
      {/* Header Zone */}
      <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8] mb-1.5">
            <span>{t.stack.badge}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span className="text-slate-600 dark:text-[#94a3b8] font-sans font-medium">
              {isFull
                ? lang === 'ar'
                  ? 'بيئة هندسية متكاملة وموثقة'
                  : 'Interactive Skill Inspector'
                : lang === 'ar'
                ? 'معاينة حية لأدوات وتقنيات الإنتاج'
                : 'Interactive Stack Inspector'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#f1f5f9] tracking-tight [text-wrap:balance]">
            {t.stack.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-[#94a3b8] mt-1.5 leading-relaxed">
            {t.stack.subtitle}
          </p>
        </div>

        {/* Contextual Action: Explore CTA (overview) or Search Input (full) */}
        {isFull ? (
          <div className="relative w-full md:w-80 shrink-0">
            <Search
              size={15}
              aria-hidden="true"
              className="absolute top-1/2 -translate-y-1/2 text-slate-400 start-3.5 pointer-events-none"
            />
            <input
              type="text"
              placeholder={t.stack.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t.stack.searchPlaceholder}
              className="w-full py-2.5 rounded-xl bg-white/95 dark:bg-[#0f1117]/85 dark:backdrop-blur-md border border-slate-200/90 dark:border-white/10 text-base sm:text-sm text-slate-900 dark:text-[#f1f5f9] placeholder-slate-400 focus:outline-none focus:border-[#0284ff] focus-visible:ring-2 focus-visible:ring-[#0284ff]/40 transition-colors ps-10 pe-9 min-h-[44px]"
            />
            {searchQuery.trim().length > 0 && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label={lang === 'ar' ? 'مسح البحث' : 'Clear search'}
                className="absolute top-1/2 -translate-y-1/2 end-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ) : (
          onExploreFullStack && (
            <button
              type="button"
              onClick={onExploreFullStack}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl border border-slate-300/85 dark:border-white/12 bg-white/95 dark:bg-[#0f1117]/85 dark:backdrop-blur-md hover:border-[#0284ff]/50 hover:text-[#0369a1] dark:hover:text-[#38bdf8] text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-slate-200 cursor-pointer whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff]"
            >
              <span>
                {lang === 'ar' ? 'استكشاف تفاصيل المهارات والخبرة' : 'Explore Full Stack & Timeline'}
              </span>
              <span aria-hidden="true" className={isRtl ? 'inline-block rotate-180' : ''}>
                →
              </span>
            </button>
          )
        )}
      </RevealOnScroll>

      {/* Segmented Category Filter Strip (Full View Only) */}
      {isFull && (
        <RevealOnScroll delay={0.02} className="mb-6">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 rounded-2xl bg-slate-100/90 dark:bg-[#0f1117]/85 dark:backdrop-blur-md border border-slate-200/90 dark:border-white/10 w-full">
            {filterTabs.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(tab.id);
                    setHoveredToolId(null);
                  }}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] ${
                    isActive
                      ? 'bg-[#0284ff] text-white shadow-xs shadow-[#0284ff]/25'
                      : 'text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-[#f1f5f9] hover:bg-white/60 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[11px] font-mono tabular-nums ${
                      isActive
                        ? 'text-white/90'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </RevealOnScroll>
      )}

      {/* Split Inspector Workstation */}
      <RevealOnScroll
        delay={0.04}
        className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start"
      >
        {/* Left / Start Track: Interactive Animated 4x4 Logo Grid */}
        <div
          className="lg:col-span-7 w-full"
          onMouseLeave={() => setHoveredToolId(null)}
        >
          {filteredTechs.length === 0 ? (
            <div className="rounded-2xl p-8 sm:p-10 text-center bg-white/95 dark:bg-[#0f1117]/85 dark:backdrop-blur-md border border-slate-200/90 dark:border-white/10">
              <Layers size={28} aria-hidden="true" className="mx-auto mb-3 text-slate-400" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                {t.stack.noTechFound}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                {lang === 'ar'
                  ? 'جرّب مسح نص البحث أو العودة إلى كافة التقنيات.'
                  : 'Try clearing the search query or returning to all engineering layers.'}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center justify-center px-4 py-2 min-h-[40px] rounded-xl bg-[#0284ff] hover:bg-[#0070e0] text-white text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff]"
              >
                {lang === 'ar' ? 'إعادة ضبط الفلتر' : 'Clear Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
              {filteredTechs.map((tech) => {
                const Logo = tech.LogoComponent;
                const isLocked = activeLockedTech?.id === tech.id;
                const isInspected = inspectedTech?.id === tech.id;

                return (
                  <button
                    key={tech.id}
                    type="button"
                    data-selected={isInspected ? 'true' : 'false'}
                    aria-pressed={isLocked}
                    aria-label={`${tech.name} — ${lang === 'ar' ? tech.categoryLabelAr : tech.categoryLabel}`}
                    onMouseEnter={() => setHoveredToolId(tech.id)}
                    onFocus={() => setHoveredToolId(tech.id)}
                    onBlur={() => setHoveredToolId((prev) => (prev === tech.id ? null : prev))}
                    onClick={() => {
                      setHoveredToolId(null);
                      setSelectedToolId(tech.id);
                    }}
                    style={
                      isInspected
                        ? {
                            borderColor: `rgba(${tech.glowRgb}, 0.52)`,
                            boxShadow: `0 12px 30px -10px rgba(${tech.glowRgb}, 0.28), inset 0 1px 0 rgba(255,255,255,0.08)`,
                          }
                        : undefined
                    }
                    className={`stack-logo-tile group relative overflow-hidden flex flex-col items-center justify-center p-4 rounded-2xl border text-center cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] min-h-[116px] sm:min-h-[124px] ${
                      isInspected
                        ? 'bg-white dark:bg-[#131826]/95 dark:backdrop-blur-md'
                        : 'bg-white/75 dark:bg-[#0f1117]/70 dark:backdrop-blur-md border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-[#131826]/90'
                    }`}
                  >
                    {/* Subtle Illuminated Top Radial Wash */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 transition-opacity duration-200 ${
                        isInspected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                      }`}
                      style={{
                        background: `radial-gradient(circle at 50% 42%, rgba(${tech.glowRgb}, 0.14) 0%, transparent 72%)`,
                      }}
                    />

                    {/* Muted-to-Luminous Animated Logo Well */}
                    <div className="stack-tile-well relative z-10 w-13 h-13 rounded-xl flex items-center justify-center shrink-0">
                      <span
                        aria-hidden="true"
                        className={`stack-logo-halo absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200 ${
                          isInspected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                        }`}
                        style={{
                          background: `radial-gradient(circle, rgba(${tech.glowRgb}, 0.36) 0%, rgba(${tech.glowRgb}, 0.08) 65%, transparent 100%)`,
                          boxShadow: `0 0 26px rgba(${tech.glowRgb}, 0.34)`,
                        }}
                      />
                      <span className="stack-logo-glyph stack-muted-glyph relative z-10 flex items-center justify-center">
                        <Logo size={32} />
                      </span>
                    </div>

                    {/* Dynamic Tool Name Reveal (Hidden at rest, glides up on hover/focus/selection) */}
                    <span
                      dir="ltr"
                      className="stack-tile-name pointer-events-none absolute inset-x-2 bottom-3 z-10 block text-[11.5px] font-bold tracking-tight text-slate-900 dark:text-white truncate"
                    >
                      {tech.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right / End Track: Sticky Live Detail Inspector */}
        <aside
          aria-live="polite"
          className="lg:col-span-5 lg:sticky lg:top-24 w-full"
        >
          {inspectedTech && InspectedLogo ? (
            <div
              className="stack-inspector-card relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0f1117]/88 dark:backdrop-blur-xl p-6 sm:p-7 transition-colors duration-200"
              style={{
                boxShadow: `0 18px 44px -22px rgba(${inspectedTech.glowRgb}, 0.28)`,
              }}
            >
              {/* Subtle Ambient Radial Highlight */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -end-24 w-64 h-64 rounded-full opacity-55 dark:opacity-45 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle, rgba(${inspectedTech.glowRgb}, 0.18) 0%, transparent 70%)`,
                }}
              />

              {/* Inspector Top Bar: Index & Prev/Next Controls */}
              <div className="relative z-10 flex items-center justify-between gap-3 pb-5 border-b border-slate-200/80 dark:border-white/8">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {formattedIndex} / {formattedTotal}
                  </span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                    ·
                  </span>
                  <span className="truncate">
                    {lang === 'ar' ? inspectedTech.categoryLabelAr : inspectedTech.categoryLabel}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCycleTech(-1)}
                    disabled={filteredTechs.length <= 1}
                    aria-label={lang === 'ar' ? 'التقنية السابقة' : 'Previous technology'}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 hover:border-[#0284ff]/45 hover:text-[#0369a1] dark:hover:text-[#38bdf8] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff]"
                  >
                    {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCycleTech(1)}
                    disabled={filteredTechs.length <= 1}
                    aria-label={lang === 'ar' ? 'التقنية التالية' : 'Next technology'}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 hover:border-[#0284ff]/45 hover:text-[#0369a1] dark:hover:text-[#38bdf8] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff]"
                  >
                    {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
              </div>

              {/* Animated Active Tool Body */}
              <div key={inspectedTech.id} className="stack-inspector-swap relative z-10 pt-5 space-y-5">
                {/* Emblem + Identity */}
                <div className="flex items-center gap-4">
                  <div
                    className="stack-inspector-emblem relative w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-200/90 dark:border-white/12 shrink-0"
                    style={{
                      backgroundColor: `rgba(${inspectedTech.glowRgb}, 0.12)`,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="stack-logo-halo absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        background: `radial-gradient(circle, rgba(${inspectedTech.glowRgb}, 0.34) 0%, transparent 72%)`,
                        boxShadow: `0 0 28px rgba(${inspectedTech.glowRgb}, 0.25)`,
                      }}
                    />
                    <span className="stack-logo-glyph relative z-10 flex items-center justify-center">
                      <InspectedLogo size={34} />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3
                      dir="ltr"
                      className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate"
                    >
                      {inspectedTech.name}
                    </h3>
                    <p className="text-xs font-mono text-[#0369a1] dark:text-[#38bdf8] mt-1 truncate">
                      {lang === 'ar' ? inspectedTech.categoryLabelAr : inspectedTech.categoryLabel}
                    </p>
                  </div>
                </div>

                {/* Engineering Summary */}
                <p className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {lang === 'ar' ? inspectedTech.descriptionAr : inspectedTech.description}
                </p>

                {/* Shipped App Proof */}
                <div className="pt-4 border-t border-slate-200/80 dark:border-white/8">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {lang === 'ar' ? 'التطبيق الفعلي في المشاريع' : 'Applied in Production'}
                  </div>
                  <div
                    dir="ltr"
                    className="text-[13px] font-mono font-semibold text-slate-900 dark:text-slate-100"
                  >
                    {inspectedTech.highlightInApp}
                  </div>
                </div>

                {/* Core Capabilities Unboxed Typographic Grid */}
                <div className="pt-4 border-t border-slate-200/80 dark:border-white/8">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2.5">
                    {lang === 'ar' ? 'القدرات الهندسية الأساسية' : 'Core Capabilities'}
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {inspectedTech.subSkills.map((skill) => (
                      <li
                        key={skill}
                        className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300 min-w-0"
                      >
                        <span
                          aria-hidden="true"
                          className="shrink-0 font-bold"
                          style={{ color: inspectedTech.accentColor }}
                        >
                          ·
                        </span>
                        <span dir="ltr" className="truncate">
                          {skill}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Guidance / Quick Jump */}
                <div className="pt-4 border-t border-slate-200/80 dark:border-white/8 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {lang === 'ar'
                      ? 'مرر أو اضغط على أي شعار لاستعراض التفاصيل'
                      : 'Hover or select any logo to inspect'}
                  </span>
                  {!isFull && onExploreFullStack && (
                    <button
                      type="button"
                      onClick={onExploreFullStack}
                      className="font-semibold text-[#0369a1] dark:text-[#38bdf8] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {lang === 'ar' ? 'بحث وتصفية ←' : 'Filter & Search →'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0f1117]/85 dark:backdrop-blur-xl p-6 sm:p-7 text-center">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {lang === 'ar' ? 'لا توجد أداة محددة حالياً' : 'No technology selected'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'ar'
                  ? 'أعد ضبط الفلتر لعرض تفاصيل المهارات.'
                  : 'Reset active filters to inspect stack capabilities.'}
              </p>
            </div>
          )}
        </aside>
      </RevealOnScroll>
    </section>
  );
};
