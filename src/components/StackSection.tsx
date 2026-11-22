import React, { useState, useMemo } from 'react';
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
  const [expandedTechId, setExpandedTechId] = useState<string | null>(null);
  const [selectedToolId, setSelectedToolId] = useState<string>(DEDICATED_TECHS[0].id);

  const filterTabs: Array<{ id: StackFilter; label: string; count: number }> = [
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
        item.categoryLabelAr.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.descriptionAr.toLowerCase().includes(q) ||
        item.highlightInApp.toLowerCase().includes(q) ||
        item.subSkills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [activeCategory, searchQuery]);

  const activeShowcaseTech = useMemo(
    () => DEDICATED_TECHS.find((item) => item.id === selectedToolId) || DEDICATED_TECHS[0],
    [selectedToolId]
  );

  const handleSelectLogoTile = (tech: TechItem) => {
    setSelectedToolId(tech.id);
    if (variant === 'full') {
      setActiveCategory('all');
      setSearchQuery('');
      setExpandedTechId(tech.id);
    }
  };

  if (variant === 'overview') {
    const ActiveLogo = activeShowcaseTech.LogoComponent;

    return (
      <section
        id="stack"
        className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 border-t border-slate-200/80 dark:border-white/8 w-full"
      >
        <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8] mb-1.5">
              <span>{t.stack.badge}</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <span className="text-slate-600 dark:text-[#94a3b8] font-sans">
                {lang === 'ar' ? 'أدوات وتقنيات الإنتاج' : 'Animated Engineering Toolkit'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#f1f5f9] tracking-tight [text-wrap:balance]">
              {t.stack.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-[#94a3b8] mt-1.5">
              {t.stack.subtitle}
            </p>
          </div>

          {onExploreFullStack && (
            <button
              type="button"
              onClick={onExploreFullStack}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-xl border border-slate-300/85 dark:border-white/15 bg-white/85 dark:bg-white/[0.035] hover:border-[#0284ff]/50 hover:text-[#0369a1] dark:hover:text-[#38bdf8] text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-slate-200 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <span>{lang === 'ar' ? 'استكشاف تفاصيل المهارات والخبرة' : 'Explore Full Stack & Timeline'}</span>
              <span aria-hidden="true" className={dir === 'rtl' ? 'inline-block rotate-180' : ''}>
                →
              </span>
            </button>
          )}
        </RevealOnScroll>

        {/* Animated Tech Logos Interactive Showcase Grid */}
        <RevealOnScroll delay={0.04} className="space-y-4">
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {DEDICATED_TECHS.map((tech) => {
              const Logo = tech.LogoComponent;
              const isSelected = activeShowcaseTech.id === tech.id;

              return (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => handleSelectLogoTile(tech)}
                  onMouseEnter={() => setSelectedToolId(tech.id)}
                  aria-pressed={isSelected}
                  className={`stack-logo-tile group relative flex flex-col items-center justify-center gap-2.5 p-3.5 sm:p-4 rounded-2xl border text-center cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] ${
                    isSelected
                      ? 'bg-white dark:bg-[#131824] border-[#0284ff]/55 shadow-md'
                      : 'bg-white/85 dark:bg-[#0f1117] border-slate-200/90 dark:border-white/10 hover:border-[#0284ff]/40 hover:bg-white dark:hover:bg-[#131722] shadow-2xs hover:shadow-md'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-xl flex items-center justify-center">
                    <span
                      aria-hidden="true"
                      className="stack-logo-halo absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        background: `radial-gradient(circle, rgba(${tech.glowRgb}, 0.28) 0%, rgba(${tech.glowRgb}, 0.06) 65%, transparent 100%)`,
                        boxShadow: `0 0 22px rgba(${tech.glowRgb}, ${isSelected ? 0.34 : 0.16})`,
                      }}
                    />
                    <span className="stack-logo-glyph relative z-10 flex items-center justify-center">
                      <Logo size={26} />
                    </span>
                  </div>

                  <div className="min-w-0 w-full">
                    <span
                      dir="ltr"
                      className={`block text-xs font-bold truncate transition-colors ${
                        isSelected
                          ? 'text-[#0369a1] dark:text-[#38bdf8]'
                          : 'text-slate-800 dark:text-slate-100 group-hover:text-[#0369a1] dark:group-hover:text-[#38bdf8]'
                      }`}
                    >
                      {tech.name}
                    </span>
                    <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {lang === 'ar' ? tech.categoryLabelAr : tech.categoryLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Tool Live Readout Strip */}
          <div className="card-shimmer overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 shrink-0"
                style={{
                  backgroundColor: `rgba(${activeShowcaseTech.glowRgb}, 0.12)`,
                  boxShadow: `0 0 22px rgba(${activeShowcaseTech.glowRgb}, 0.2)`,
                }}
              >
                <ActiveLogo size={26} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span
                    dir="ltr"
                    className="font-display text-sm sm:text-base font-extrabold text-slate-900 dark:text-white"
                  >
                    {activeShowcaseTech.name}
                  </span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                    ·
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8]">
                    {lang === 'ar'
                      ? activeShowcaseTech.categoryLabelAr
                      : activeShowcaseTech.categoryLabel}
                  </span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700 hidden sm:inline">
                    ·
                  </span>
                  <span dir="ltr" className="text-xs font-mono text-slate-600 dark:text-slate-400 hidden sm:inline">
                    {activeShowcaseTech.highlightInApp}
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {lang === 'ar'
                    ? activeShowcaseTech.descriptionAr
                    : activeShowcaseTech.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-mono text-slate-600 dark:text-slate-400 shrink-0">
              {activeShowcaseTech.subSkills.slice(0, 3).map((sub, i) => (
                <React.Fragment key={sub}>
                  {i > 0 && (
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                      ·
                    </span>
                  )}
                  <span dir="ltr">{sub}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </section>
    );
  }

  return (
    <section
      id="stack"
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-slate-200/80 dark:border-white/8 w-full"
    >
      {/* Header & Search */}
      <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8] mb-2">
            <span>{t.stack.badge}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-600 dark:text-[#94a3b8] font-sans">
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
            className="w-full py-2.5 rounded-xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 text-base sm:text-sm text-slate-900 dark:text-[#f1f5f9] placeholder-slate-400 focus:outline-none focus:border-[#0284ff] transition-colors ps-9 pe-3.5 min-h-[44px]"
          />
        </div>
      </RevealOnScroll>

      {/* Interactive Pulsating Development Tools Logo Strip */}
      <RevealOnScroll delay={0.03} className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1.5">
          {DEDICATED_TECHS.map((tech) => {
            const Logo = tech.LogoComponent;
            const isSelected = expandedTechId === tech.id;
            return (
              <button
                key={`quick-${tech.id}`}
                type="button"
                onClick={() => handleSelectLogoTile(tech)}
                title={tech.name}
                aria-label={tech.name}
                className={`stack-logo-tile group inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] ${
                  isSelected
                    ? 'bg-[#0284ff]/10 border-[#0284ff]/55 text-[#0369a1] dark:text-[#38bdf8]'
                    : 'bg-white dark:bg-[#0f1117] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-[#0284ff]/45'
                }`}
              >
                <span className="relative w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                  <span
                    aria-hidden="true"
                    className="stack-logo-halo absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, rgba(${tech.glowRgb}, 0.25) 0%, transparent 72%)`,
                    }}
                  />
                  <span className="stack-logo-glyph relative z-10 flex items-center justify-center">
                    <Logo size={17} />
                  </span>
                </span>
                <span dir="ltr">{tech.name}</span>
              </button>
            );
          })}
        </div>
      </RevealOnScroll>

      {/* Category Filter Bar with Counts */}
      <div className="flex flex-wrap items-center gap-1.5 mb-7 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 w-full">
        {filterTabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-[38px] rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#0284ff] text-white shadow-xs shadow-[#0284ff]/25'
                  : 'text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-[#f1f5f9]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-md ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/80 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Independent-Height Accessible Skill Cards Grid */}
      {filteredTechs.length === 0 ? (
        <div className="text-center py-10 text-slate-600 dark:text-[#94a3b8] rounded-2xl p-6 bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10">
          <Layers size={28} className="mx-auto mb-2 opacity-50" />
          <p className="text-xs font-medium">{t.stack.noTechFound}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
          {filteredTechs.map((tech, idx) => {
            const Logo = tech.LogoComponent;
            const isExpanded = expandedTechId === tech.id;
            const panelId = `stack-panel-${tech.id}`;

            return (
              <RevealOnScroll
                key={tech.id}
                delay={Math.min(idx * 0.025, 0.16)}
              >
                <article
                  className={`card-shimmer skill-shimmer-card w-full group rounded-2xl bg-white dark:bg-[#0f1117] border transition-colors duration-200 shadow-2xs hover:shadow-md ${
                    isExpanded
                      ? 'border-[#0284ff]/65 ring-1 ring-[#0284ff]/20'
                      : 'border-slate-200 dark:border-white/10 hover:border-[#0284ff]/45'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedTechId(isExpanded ? null : tech.id)}
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    className="w-full text-start p-5 flex flex-col cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3 w-full">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="relative w-11 h-11 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 shrink-0"
                          style={{
                            backgroundColor: `rgba(${tech.glowRgb}, 0.12)`,
                            boxShadow: `0 0 18px rgba(${tech.glowRgb}, 0.12)`,
                          }}
                        >
                          <span
                            aria-hidden="true"
                            className="stack-logo-halo absolute inset-0 rounded-xl pointer-events-none"
                            style={{
                              background: `radial-gradient(circle, rgba(${tech.glowRgb}, 0.28) 0%, transparent 72%)`,
                            }}
                          />
                          <span className="stack-logo-glyph relative z-10 flex items-center justify-center">
                            <Logo size={23} />
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="block text-sm font-bold text-slate-900 dark:text-[#f1f5f9] truncate group-hover:text-[#0369a1] dark:group-hover:text-[#38bdf8] transition-colors">
                            {tech.name}
                          </span>
                          <span className="block text-[11px] font-medium text-slate-600 dark:text-[#94a3b8]">
                            {lang === 'ar' ? tech.categoryLabelAr : tech.categoryLabel}
                          </span>
                        </div>
                      </div>

                      <Info
                        size={14}
                        aria-hidden="true"
                        className={`shrink-0 transition-colors mt-0.5 ${
                          isExpanded
                            ? 'text-[#0369a1] dark:text-[#38bdf8]'
                            : 'text-slate-400 group-hover:text-[#0369a1] dark:group-hover:text-[#38bdf8]'
                        }`}
                      />
                    </div>

                    <p className="text-xs text-slate-600 dark:text-[#94a3b8] leading-relaxed min-h-[3.25rem]">
                      {lang === 'ar' ? tech.descriptionAr : tech.description}
                    </p>

                    <div id={panelId} className={`grid-accordion w-full ${isExpanded ? 'is-open' : ''}`}>
                      <div className="grid-accordion-inner">
                        <ul className="mt-3 pt-3 border-t border-slate-100 dark:border-white/8 space-y-1.5">
                          {tech.subSkills.map((sub) => (
                            <li
                              key={sub}
                              className="text-[11px] font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                            >
                              <span style={{ color: tech.accentColor }} aria-hidden="true">·</span>
                              <span dir="ltr">{sub}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/8 flex items-center justify-between gap-2 text-[11px] w-full">
                      <span className="text-[#0369a1] dark:text-[#38bdf8] font-semibold truncate" dir="ltr">
                        {tech.highlightInApp}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400 font-mono shrink-0">
                        {isExpanded
                          ? lang === 'ar'
                            ? 'إخفاء'
                            : 'Less'
                          : lang === 'ar'
                          ? 'التفاصيل'
                          : 'Capabilities'}
                      </span>
                    </div>
                  </button>
                </article>
              </RevealOnScroll>
            );
          })}
        </div>
      )}
    </section>
  );
};
