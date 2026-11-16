import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Layers, Info } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import { TiltCard } from './MotionPrimitives';
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
    accentColor: '#027DFD',
    glowRgb: '2, 125, 253',
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

export const StackSection: React.FC = () => {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<StackFilter>('all');
  const [expandedTechId, setExpandedTechId] = useState<string | null>(null);

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

      {/* Category Filter Bar with Counts */}
      <div className="flex flex-wrap items-center gap-1.5 mb-7 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 w-full">
        {filterTabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#027DFD] text-white shadow-xs'
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

      {/* Independent-Height Brand-Illuminated Skill Cards Grid (items-start prevents stretching siblings) */}
      {filteredTechs.length === 0 ? (
        <div className="text-center py-10 text-slate-500 dark:text-[#94a3b8] rounded-2xl p-6 bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10">
          <Layers size={28} className="mx-auto mb-2 opacity-50" />
          <p className="text-xs font-medium">{t.stack.noTechFound}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
          {filteredTechs.map((tech, idx) => {
            const Logo = tech.LogoComponent;
            const isExpanded = expandedTechId === tech.id;

            return (
              <RevealOnScroll
                key={tech.id}
                delay={Math.min(idx * 0.03, 0.24)}
              >
                <TiltCard
                  maxTilt={5}
                  glareOpacity={0.1}
                  onClick={() => setExpandedTechId(isExpanded ? null : tech.id)}
                  className={`w-full group p-5 rounded-2xl bg-white dark:bg-[#0f1117] border transition-colors duration-200 flex flex-col cursor-pointer shadow-2xs hover:shadow-lg ${
                    isExpanded
                      ? 'border-[#027DFD]/65 ring-1 ring-[#027DFD]/20'
                      : 'border-slate-200 dark:border-white/10 hover:border-[#027DFD]/50'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 shrink-0 transition-transform duration-300 group-hover:scale-110"
                          style={{
                            backgroundColor: `rgba(${tech.glowRgb}, 0.12)`,
                            boxShadow: `0 0 18px rgba(${tech.glowRgb}, 0.14)`,
                          }}
                        >
                          <Logo size={23} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-[#f1f5f9] truncate group-hover:text-[#027DFD] dark:group-hover:text-[#00C7FF] transition-colors">
                            {tech.name}
                          </h3>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-[#94a3b8]">
                            {lang === 'ar' ? tech.categoryLabelAr : tech.categoryLabel}
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

                    <p className="text-xs text-slate-600 dark:text-[#94a3b8] leading-relaxed min-h-[3.25rem]">
                      {lang === 'ar' ? tech.descriptionAr : tech.description}
                    </p>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <ul className="mt-3 pt-3 border-t border-slate-100 dark:border-white/8 space-y-1.5">
                            {tech.subSkills.map((sub) => (
                              <li
                                key={sub}
                                className="text-[11px] font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                              >
                                <span style={{ color: tech.accentColor }}>·</span>
                                <span dir="ltr">{sub}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/8 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-[#027DFD] dark:text-[#00C7FF] font-semibold truncate" dir="ltr">
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
                </TiltCard>
              </RevealOnScroll>
            );
          })}
        </div>
      )}
    </section>
  );
};
