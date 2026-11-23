import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  Code2,
  FolderGit2,
  Copy,
  Check,
  ArrowUpRight,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { FEATURED_PROJECTS, Project } from '../data/portfolioData';
import { RevealOnScroll } from './RevealOnScroll';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { copyToClipboard } from '../utils/clipboard';
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

type TechCategory = 'mobile' | 'state-storage' | 'network-backend' | 'ai-cs' | 'tools';

interface TechCodePattern {
  fileName: string;
  layerTag: string;
  projectRef: string;
  lang?: 'dart' | 'python' | 'yaml' | 'bash';
  code: string;
}

interface TechItem {
  id: string;
  name: string;
  category: TechCategory;
  categoryLabel: string;
  categoryLabelAr: string;
  roleShort: string;
  roleShortAr: string;
  highlightInApp: string;
  projectRepos: string[];
  description: string;
  descriptionAr: string;
  subSkills: string[];
  accentColor: string;
  glowRgb: string;
  LogoComponent: React.FC<{ size?: number; className?: string }>;
  codePattern: TechCodePattern;
}

export const DEDICATED_TECHS: TechItem[] = [
  {
    id: 'flutter',
    name: 'Flutter',
    category: 'mobile',
    categoryLabel: 'Mobile Core',
    categoryLabelAr: 'نواة تطبيقات الموبايل',
    roleShort: 'UI & 60fps Engine',
    roleShortAr: 'واجهات وأداء 60fps',
    highlightInApp: 'Revio · Movura · Vibrant Store',
    projectRepos: ['Revio', 'Movura', 'Vibrant-store'],
    description:
      'Cross-platform native mobile engineering, custom Slivers, LayoutBuilder, and physics-driven UI.',
    descriptionAr:
      'تطوير تطبيقات Android و iOS بأداء أصلي، وتصميم واجهات Slivers مخصصة وحركات تفاعلية سلسة.',
    subSkills: ['Slivers & CustomPaint', '3D Flip Animations', 'Arabic RTL', 'Multi-Screen Responsive'],
    accentColor: '#0284ff',
    glowRgb: '2, 132, 255',
    LogoComponent: FlutterLogo,
    codePattern: {
      fileName: 'flip_flashcard.dart',
      layerTag: 'Presentation · GPU Matrix4',
      projectRef: 'Revio (Google Play)',
      lang: 'dart',
      code: `AnimatedBuilder(
  animation: _flipController,
  builder: (context, _) {
    final angle = _flipController.value * pi;
    final showBack = angle > pi / 2;
    return Transform(
      alignment: Alignment.center,
      transform: Matrix4.identity()
        ..setEntry(3, 2, 0.0012)
        ..rotateY(angle),
      child: showBack ? _BackFace() : _FrontFace(),
    );
  },
)`,
    },
  },
  {
    id: 'dart',
    name: 'Dart',
    category: 'mobile',
    categoryLabel: 'Mobile Core',
    categoryLabelAr: 'نواة اللغة البرمجية',
    roleShort: 'Type-Safe Async Core',
    roleShortAr: 'لغة آمنة وسريعة',
    highlightInApp: 'All 8+ Mobile Codebases',
    projectRepos: ['Revio', 'Movura', 'Sky-Cast'],
    description:
      'Type-safe asynchronous programming with OOP, Mixins, Streams, Futures, and sound null-safety.',
    descriptionAr:
      'برمجة آمنة الأنواع مع دعم Null Safety، والبرمجة الكائنية OOP، وإدارة التدفقات Streams و Futures.',
    subSkills: ['OOP & SOLID', 'Async & Streams', 'Compute Isolates', 'Generics & Mixins'],
    accentColor: '#00B4AB',
    glowRgb: '0, 180, 171',
    LogoComponent: DartLogo,
    codePattern: {
      fileName: 'result_either.dart',
      layerTag: 'Core · Sealed Failure Mapping',
      projectRef: 'Movura & Sky-Cast',
      lang: 'dart',
      code: `sealed class AppResult<T> {
  const AppResult();
}

final class Success<T> extends AppResult<T> {
  final T data;
  const Success(this.data);
}

final class Failure<T> extends AppResult<T> {
  final String message;
  const Failure(this.message);
}`,
    },
  },
  {
    id: 'clean-arch',
    name: 'Clean Architecture',
    category: 'mobile',
    categoryLabel: 'Software Architecture',
    categoryLabelAr: 'المعمارية البرمجية',
    roleShort: 'Domain · Data · UI',
    roleShortAr: 'فصل الطبقات النظيف',
    highlightInApp: 'Revio · Movura · News-Cloud',
    projectRepos: ['Revio', 'Movura', 'News-Cloud'],
    description:
      'Domain-Driven Design (Entities, UseCases, Repositories, DataSources) enforcing clean layer boundaries.',
    descriptionAr:
      'فصل كامل بين طبقات Domain و Data و Presentation لضمان قابلية التوسع والاختبار والصيانة.',
    subSkills: ['Domain / Data / UI', 'Repository Pattern', 'Dependency Injection', 'SOLID Principles'],
    accentColor: '#6366F1',
    glowRgb: '99, 102, 241',
    LogoComponent: CleanArchLogo,
    codePattern: {
      fileName: 'fetch_movies_usecase.dart',
      layerTag: 'Domain Layer · Contract',
      projectRef: 'Movura Flagship',
      lang: 'dart',
      code: `class FetchTrendingMoviesUseCase {
  final MediaRepository _repository;
  const FetchTrendingMoviesUseCase(this._repository);

  Future<AppResult<List<MovieEntity>>> call({
    required int page,
  }) {
    return _repository.getTrendingMovies(page: page);
  }
}`,
    },
  },
  {
    id: 'bloc',
    name: 'BLoC Pattern',
    category: 'state-storage',
    categoryLabel: 'State Management',
    categoryLabelAr: 'إدارة الحالة (Events)',
    roleShort: 'Event-Driven Streams',
    roleShortAr: 'إدارة حالة بالأحداث',
    highlightInApp: 'Movura · Shaats · Sky-Cast',
    projectRepos: ['Movura', 'Sky-Cast', 'Shaats'],
    description:
      'Predictable event-driven state machine separating business logic from presentation trees.',
    descriptionAr:
      'إدارة حالة مبنية على الأحداث (Event-to-State Streams) تفصل منطق العمل بالكامل عن الواجهات.',
    subSkills: ['Event-to-State Streams', 'Debounced Search', 'BLoC Observer'],
    accentColor: '#00D9FF',
    glowRgb: '0, 217, 255',
    LogoComponent: BlocLogo,
    codePattern: {
      fileName: 'media_search_bloc.dart',
      layerTag: 'State · Debounced Transformer',
      projectRef: 'Movura TMDB Search',
      lang: 'dart',
      code: `on<SearchQueryChanged>(
  (event, emit) async {
    emit(SearchLoading());
    final res = await _searchUseCase(event.query);
    switch (res) {
      case Success(:final data): emit(SearchLoaded(data));
      case Failure(:final message): emit(SearchError(message));
    }
  },
  transformer: debounce(const Duration(milliseconds: 350)),
);`,
    },
  },
  {
    id: 'cubit',
    name: 'Cubit',
    category: 'state-storage',
    categoryLabel: 'State Management',
    categoryLabelAr: 'إدارة الحالة السريعة',
    roleShort: 'Lean State Emitter',
    roleShortAr: 'تحديث حالة مباشر',
    highlightInApp: 'Revio (Google Play) · News-Cloud',
    projectRepos: ['Revio', 'News-Cloud', 'Vibrant-store'],
    description:
      'Lightweight, function-driven state management for fast feature iteration and predictable UI rebuilds.',
    descriptionAr:
      'إدارة حالة خفيفة ومباشرة لبناء الميزات بسرعة مع تحديث انتقائي دقيق لعناصر الشاشة.',
    subSkills: ['Direct State Emit', 'Selective BlocBuilder', 'Zero Boilerplate'],
    accentColor: '#22D3EE',
    glowRgb: '34, 211, 238',
    LogoComponent: CubitLogo,
    codePattern: {
      fileName: 'deck_quiz_cubit.dart',
      layerTag: 'Presentation · Cubit Engine',
      projectRef: 'Revio Flashcard App',
      lang: 'dart',
      code: `class DeckQuizCubit extends Cubit<QuizState> {
  final DeckRepository _repo;
  DeckQuizCubit(this._repo) : super(const QuizInitial());

  Future<void> markCardReviewed(String cardId, bool known) async {
    final updated = await _repo.recordAnswer(cardId, known);
    emit(QuizActive(cards: updated.cards, score: updated.score));
  }
}`,
    },
  },
  {
    id: 'hive',
    name: 'Hive',
    category: 'state-storage',
    categoryLabel: 'Local Storage',
    categoryLabelAr: 'التخزين المحلي السريع',
    roleShort: 'Offline NoSQL Store',
    roleShortAr: 'تخزين محلي أوفلاين',
    highlightInApp: 'Revio Offline Flashcard CRUD',
    projectRepos: ['Revio'],
    description:
      'Zero-latency NoSQL key-value database written in pure Dart (used via hive_ce TypeAdapters).',
    descriptionAr:
      'قاعدة بيانات محلية NoSQL فائقة السرعة لعمل التطبيقات بدون إنترنت بكفاءة كاملة عبر hive_ce.',
    subSkills: ['Key-Value NoSQL', 'hive_ce Binary Adapters', 'Offline-First CRUD'],
    accentColor: '#FDB813',
    glowRgb: '253, 184, 19',
    LogoComponent: HiveLogo,
    codePattern: {
      fileName: 'hive_deck_datasource.dart',
      layerTag: 'Data Layer · Binary Box',
      projectRef: 'Revio (<15ms Read)',
      lang: 'dart',
      code: `class HiveDeckLocalDataSource {
  final Box<DeckModel> _box;
  HiveDeckLocalDataSource(this._box);

  List<DeckModel> getAllDecks() => _box.values.toList();

  Future<void> saveDeck(DeckModel deck) async {
    await _box.put(deck.id, deck);
  }
}`,
    },
  },
  {
    id: 'dio',
    name: 'Dio Client',
    category: 'network-backend',
    categoryLabel: 'Networking',
    categoryLabelAr: 'الشبكات و HTTP',
    roleShort: 'Interceptors & Retry',
    roleShortAr: 'شبكات ومعالجة الأخطاء',
    highlightInApp: 'News-Cloud · Movura · Sky-Cast',
    projectRepos: ['Movura', 'Sky-Cast', 'News-Cloud'],
    description:
      'Resilient HTTP client configured with global interceptors, timeouts, and structured error mapping.',
    descriptionAr:
      'عميل اتصالات متقدم مزوّد بـ Interceptors ومعالجة ذكية للأخطاء وإعادة المحاولة التلقائية.',
    subSkills: ['Global Interceptors', 'Error Mapping', 'Request Cancellation'],
    accentColor: '#0284C7',
    glowRgb: '2, 132, 199',
    LogoComponent: DioLogo,
    codePattern: {
      fileName: 'api_client_dio.dart',
      layerTag: 'Network · Configured Dio',
      projectRef: 'Movura & Sky-Cast',
      lang: 'dart',
      code: `Dio createConfiguredDio(String baseUrl) {
  final dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 12),
  ));
  dio.interceptors.add(AuthHeaderInterceptor());
  return dio;
}`,
    },
  },
  {
    id: 'retrofit',
    name: 'Retrofit',
    category: 'network-backend',
    categoryLabel: 'Networking',
    categoryLabelAr: 'توليد واجهات REST',
    roleShort: 'Type-Safe REST Codegen',
    roleShortAr: 'توليد عملاء REST',
    highlightInApp: 'News-Cloud · Quotely REST Clients',
    projectRepos: ['News-Cloud', 'Vibrant-store'],
    description:
      'Annotation-based REST client generation converting API contracts into type-safe Dart interfaces.',
    descriptionAr:
      'توليد تلقائي لعملاء REST API آمنين برمجياً عبر Annotations مع تحويل JSON تلقائياً.',
    subSkills: ['Code Generation', 'Type-Safe Contracts', 'JSON Serialization'],
    accentColor: '#10B981',
    glowRgb: '16, 185, 129',
    LogoComponent: RetrofitLogo,
    codePattern: {
      fileName: 'news_api_service.dart',
      layerTag: 'Data · Retrofit Contract',
      projectRef: 'News-Cloud Arabic RTL',
      lang: 'dart',
      code: `@RestApi()
abstract class NewsApiService {
  factory NewsApiService(Dio dio) = _NewsApiService;

  @GET('/top-headlines')
  Future<HeadlinesDto> getHeadlines(
    @Query('country') String country,
    @Query('category') String category,
  );
}`,
    },
  },
  {
    id: 'firebase',
    name: 'Firebase & Firestore',
    category: 'network-backend',
    categoryLabel: 'Cloud & Auth',
    categoryLabelAr: 'السحابة والمصادقة',
    roleShort: 'Realtime Streams & Auth',
    roleShortAr: 'بث فوري ومصادقة',
    highlightInApp: 'Shaats Real-Time Chat',
    projectRepos: ['Shaats'],
    description:
      'Reactive document snapshot streams, Cloud Storage uploads, and Firebase Authentication workflows.',
    descriptionAr:
      'تزامن لحظي فوري للبيانات عبر Cloud Firestore وتأمين جلسات المستخدمين بـ Firebase Auth.',
    subSkills: ['Cloud Firestore', 'Firebase Auth', 'Real-time Snapshots'],
    accentColor: '#FFCA28',
    glowRgb: '255, 202, 40',
    LogoComponent: FirebaseLogo,
    codePattern: {
      fileName: 'chat_stream_repo.dart',
      layerTag: 'Cloud · Firestore Stream',
      projectRef: 'Shaats Real-Time Chat',
      lang: 'dart',
      code: `Stream<List<MessageEntity>> watchRoomMessages(String roomId) {
  return _firestore
      .collection('rooms/$roomId/messages')
      .orderBy('createdAt', descending: true)
      .snapshots()
      .map((snap) => snap.docs.map(MessageModel.fromDoc).toList());
}`,
    },
  },
  {
    id: 'python',
    name: 'Python',
    category: 'ai-cs',
    categoryLabel: 'Computer Science',
    categoryLabelAr: 'علوم الحاسب والذكاء',
    roleShort: 'Algorithms & AI Scripting',
    roleShortAr: 'خوارزميات وذكاء اصطناعي',
    highlightInApp: 'Algorithms & ML Coursework',
    projectRepos: ['Revio', 'Movura'],
    description:
      'Algorithmic problem solving, structured scripting, and foundational Artificial Intelligence studies.',
    descriptionAr:
      'حل المشكلات الخوارزمية وهياكل البيانات وتطبيقات أسس الذكاء الاصطناعي وتعلم الآلة.',
    subSkills: ['Data Structures', 'Algorithms', 'ML Foundations'],
    accentColor: '#3776AB',
    glowRgb: '55, 118, 171',
    LogoComponent: PythonLogo,
    codePattern: {
      fileName: 'spaced_retention.py',
      layerTag: 'CS Logic · Retention Scoring',
      projectRef: 'Faculty AI Study Model',
      lang: 'python',
      code: `def next_review_interval(streak: int, ease: float = 1.65) -> int:
    if streak <= 0:
        return 1
    return max(1, round((2 ** (streak - 1)) * ease))

# Used as recall intuition behind active study quizzes`,
    },
  },
  {
    id: 'ai-ml',
    name: 'CS & Problem Solving',
    category: 'ai-cs',
    categoryLabel: 'Academic Degree',
    categoryLabelAr: 'الدراسة الأكاديمية',
    roleShort: 'AI Faculty · Class of 2027',
    roleShortAr: 'كلية الذكاء الاصطناعي',
    highlightInApp: 'Kafrelsheikh AI (2023–2027)',
    projectRepos: ['Revio', 'Nihon-Seed'],
    description:
      'Discrete math, search algorithms, database systems, and OOP modeling from Faculty of Artificial Intelligence.',
    descriptionAr:
      'دراسة أنظمة قواعد البيانات وهندسة البرمجيات والخوارزميات في كلية الذكاء الاصطناعي بكفر الشيخ.',
    subSkills: ['Discrete Math', 'Database Systems', 'Logic & Complexity'],
    accentColor: '#F43F5E',
    glowRgb: '244, 63, 94',
    LogoComponent: AiLogo,
    codePattern: {
      fileName: 'binary_search_filter.dart',
      layerTag: 'CS · O(log n) Sorted Lookup',
      projectRef: 'Algorithmic Foundation',
      lang: 'dart',
      code: `int findFirstMatchingIndex<T>(
  List<T> sortedItems,
  int Function(T item) compare,
) {
  int low = 0, high = sortedItems.length - 1;
  while (low <= high) {
    final mid = low + ((high - low) >> 1);
    final cmp = compare(sortedItems[mid]);
    if (cmp == 0) return mid;
    cmp < 0 ? low = mid + 1 : high = mid - 1;
  }
  return -1;
}`,
    },
  },
  {
    id: 'git',
    name: 'Git Version Control',
    category: 'tools',
    categoryLabel: 'DevOps & VCS',
    categoryLabelAr: 'إدارة الإصدارات',
    roleShort: 'Branches & Releases',
    roleShortAr: 'إدارة الفروع والإصدارات',
    highlightInApp: '13+ Public Repositories',
    projectRepos: ['Revio', 'Movura', 'Sky-Cast', 'News-Cloud'],
    description:
      'Feature branching, pull requests, release tagging, and clean semantic commit conventions.',
    descriptionAr:
      'إدارة الفروع البرمجية والإصدارات (Tags/Releases) وتوثيق التعديلات باحترافية على GitHub.',
    subSkills: ['Git Flow', 'Release Tags', 'Semantic Commits'],
    accentColor: '#F05138',
    glowRgb: '240, 81, 56',
    LogoComponent: GitLogo,
    codePattern: {
      fileName: 'release_workflow.sh',
      layerTag: 'DevOps · Clean Release Tagging',
      projectRef: 'Revio v1.0.0 Release',
      lang: 'bash',
      code: `git checkout -b feat/quiz-3d-flip
git commit -m "feat(quiz): add 3D flip matrix & retention hints"
git tag -a v1.0.0 -m "Production Google Play release"
git push origin v1.0.0`,
    },
  },
  {
    id: 'android-studio',
    name: 'Android Studio',
    category: 'tools',
    categoryLabel: 'Tooling',
    categoryLabelAr: 'بيئة البناء والنشر',
    roleShort: 'Gradle & Play AAB',
    roleShortAr: 'بناء وتوقيع المتجر',
    highlightInApp: 'Google Play AAB Signing',
    projectRepos: ['Revio'],
    description:
      'Native Android compilation, Gradle configuration, layout inspector, and signed release bundles.',
    descriptionAr:
      'تجهيز إعدادات Gradle وتوقيع حزم النشر الرسمية (AAB / APK) ورفعها على متجر Google Play.',
    subSkills: ['Gradle Build', 'Keystore Signing', 'Device Profiling'],
    accentColor: '#3DDC84',
    glowRgb: '61, 220, 132',
    LogoComponent: AndroidStudioLogo,
    codePattern: {
      fileName: 'play_release_build.sh',
      layerTag: 'Release · Signed App Bundle',
      projectRef: 'Revio Google Play',
      lang: 'bash',
      code: `flutter build appbundle --release \\
  --obfuscate \\
  --split-debug-info=./build/symbols \\
  --target-platform android-arm,android-arm64`,
    },
  },
  {
    id: 'vscode',
    name: 'VS Code',
    category: 'tools',
    categoryLabel: 'Tooling',
    categoryLabelAr: 'بيئة التطوير الأساسية',
    roleShort: 'Daily Dart IDE',
    roleShortAr: 'بيئة البرمجة اليومية',
    highlightInApp: 'Daily Flutter Toolchain',
    projectRepos: ['Revio', 'Vibrant-store', 'NBN-Basketball'],
    description:
      'Primary IDE setup with Dart static analysis rules, debugging launch configs, and rapid refactoring.',
    descriptionAr:
      'إعداد متكامل لفحص الكود الساكن وتنقيح الأخطاء السريع ورفع إنتاجية تطوير تطبيقات Flutter.',
    subSkills: ['Dart Toolchain', 'Hot Reload', 'Strict Analysis Lint'],
    accentColor: '#007ACC',
    glowRgb: '0, 122, 204',
    LogoComponent: VSCodeLogo,
    codePattern: {
      fileName: 'analysis_options.yaml',
      layerTag: 'Tooling · Strict Lints',
      projectRef: 'All Flutter Workspaces',
      lang: 'yaml',
      code: `include: package:flutter_lints/flutter.yaml
linter:
  rules:
    prefer_const_constructors: true
    avoid_print: true
    use_build_context_synchronously: true`,
    },
  },
  {
    id: 'postman',
    name: 'Postman',
    category: 'tools',
    categoryLabel: 'Tooling',
    categoryLabelAr: 'اختبار الـ APIs',
    roleShort: 'REST Payload Testing',
    roleShortAr: 'اختبار واجهات الـ API',
    highlightInApp: 'TMDB · WeatherAPI · DummyJSON',
    projectRepos: ['Movura', 'Sky-Cast', 'Vibrant-store'],
    description:
      'REST API contract inspection, payload verification, and test environments prior to integration.',
    descriptionAr:
      'فحص نقاط الاتصال واستجابات JSON وضبط متغيرات البيئة قبل ربطها بالتطبيقات.',
    subSkills: ['API Inspection', 'Environment Vars', 'Payload Validation'],
    accentColor: '#FF6C37',
    glowRgb: '255, 108, 55',
    LogoComponent: PostmanLogo,
    codePattern: {
      fileName: 'weather_dto_contract.dart',
      layerTag: 'API · Verified DTO Mapping',
      projectRef: 'Sky-Cast WeatherAPI',
      lang: 'dart',
      code: `factory ForecastDto.fromJson(Map<String, dynamic> json) {
  final current = json['current'] as Map<String, dynamic>;
  return ForecastDto(
    tempC: (current['temp_c'] as num).toDouble(),
    conditionText: current['condition']['text'] as String,
    humidity: current['humidity'] as int,
  );
}`,
    },
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'tools',
    categoryLabel: 'Design to Code',
    categoryLabelAr: 'ترجمة التصميم لكود',
    roleShort: 'Design System to UI',
    roleShortAr: 'تحويل التصميم لواجهات',
    highlightInApp: 'Responsive UI Translation',
    projectRepos: ['Vibrant-store', 'Movura', 'Revio'],
    description:
      'Accurate design-to-Flutter widget translation with consistent spacing scales and vector exports.',
    descriptionAr:
      'تحويل تصميمات UI/UX بدقة عالية إلى Flutter Widgets متجاوبة مع جميع مقاسات الشاشات.',
    subSkills: ['Pixel Precision', 'Design Tokens', 'Vector Export'],
    accentColor: '#A259FF',
    glowRgb: '162, 89, 255',
    LogoComponent: FigmaLogo,
    codePattern: {
      fileName: 'app_spacing_tokens.dart',
      layerTag: 'Theme · Tokenized Scale',
      projectRef: 'Vibrant-Store & Revio',
      lang: 'dart',
      code: `abstract final class AppTokens {
  static const double radiusCard = 16.0;
  static const double padPage = 20.0;
  static const double gapSection = 24.0;
  static const Color accentPrimary = Color(0xFF0284FF);
}`,
    },
  },
];

type StackFilter = 'all' | TechCategory;
type InspectorTab = 'overview' | 'code';

interface StackSectionProps {
  variant?: 'full' | 'overview';
  isDark?: boolean;
  onExploreFullStack?: () => void;
  onInspectProject?: (project: Project, screenIndex?: number) => void;
}

export const StackSection: React.FC<StackSectionProps> = ({
  variant = 'full',
  isDark = true,
  onExploreFullStack,
  onInspectProject,
}) => {
  const { lang, dir, t } = useLanguage();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<StackFilter>('all');
  const [selectedToolId, setSelectedToolId] = useState<string>(DEDICATED_TECHS[0].id);
  const [hoveredToolId, setHoveredToolId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('overview');
  const [highlightedMap, setHighlightedMap] = useState<Record<string, string>>({});
  const highlightedKeysRef = useRef<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        item.roleShort.toLowerCase().includes(q) ||
        item.roleShortAr.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.descriptionAr.toLowerCase().includes(q) ||
        item.highlightInApp.toLowerCase().includes(q) ||
        item.subSkills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [activeCategory, searchQuery]);

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

  const linkedProjects = useMemo(() => {
    if (!inspectedTech) return [];
    return inspectedTech.projectRepos
      .map((repoKey) =>
        FEATURED_PROJECTS.find(
          (p) =>
            p.repoName.toLowerCase() === repoKey.toLowerCase() ||
            p.name.toLowerCase() === repoKey.toLowerCase()
        )
      )
      .filter((p): p is Project => Boolean(p));
  }, [inspectedTech]);

  // Pre-highlight active tech snippet when user switches to Code Pattern tab
  const codeCacheKey = inspectedTech
    ? `${inspectedTech.id}-${isDark ? 'dark' : 'light'}`
    : '';
  const highlightedHtml = codeCacheKey ? highlightedMap[codeCacheKey] : undefined;

  useEffect(() => {
    if (!inspectedTech || inspectorTab !== 'code') return;
    const key = `${inspectedTech.id}-${isDark ? 'dark' : 'light'}`;
    if (highlightedKeysRef.current.has(key)) return;

    let cancelled = false;
    import('shiki')
      .then(async ({ codeToHtml }) => {
        const html = await codeToHtml(inspectedTech.codePattern.code, {
          lang: inspectedTech.codePattern.lang || 'dart',
          theme: isDark ? 'github-dark-default' : 'github-light-default',
        });
        if (!cancelled) {
          highlightedKeysRef.current.add(key);
          setHighlightedMap((prev) => ({ ...prev, [key]: html }));
        }
      })
      .catch(() => {
        // Fallback monospace pre/code renders cleanly
      });

    return () => {
      cancelled = true;
    };
  }, [inspectedTech, inspectorTab, isDark]);

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

  const handleCopyPattern = async (tech: TechItem) => {
    const ok = await copyToClipboard(tech.codePattern.code);
    if (!ok) return;
    setCopiedId(tech.id);
    showToast({
      message: lang === 'ar' ? `تم نسخ نمط ${tech.name}` : `${tech.name} pattern copied`,
      detail: tech.codePattern.fileName,
    });
    window.setTimeout(() => setCopiedId(null), 1800);
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
      {/* Unified Header Zone */}
      <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8] mb-1.5">
            <span>{t.stack.badge}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span className="text-slate-600 dark:text-[#94a3b8] font-sans font-medium">
              {lang === 'ar'
                ? 'تقنيات الإنتاج مرتبطة بالمشاريع والكود الفعلي'
                : 'Production Tools Linked to Live Apps & Code Patterns'}
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#f1f5f9] tracking-tight [text-wrap:balance]">
            {t.stack.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-[#94a3b8] mt-1.5 leading-relaxed">
            {t.stack.subtitle}
          </p>
        </div>

        {/* Search Input + Overview->Experience Shortcut */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
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
              className="w-full py-2 rounded-xl bg-white/95 dark:bg-[#0f1117]/85 dark:backdrop-blur-md border border-slate-200/90 dark:border-white/10 text-sm text-slate-900 dark:text-[#f1f5f9] placeholder-slate-400 focus:outline-none focus:border-[#0284ff] focus-visible:ring-2 focus-visible:ring-[#0284ff]/40 transition-colors ps-10 pe-9 min-h-[42px]"
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

          {!isFull && onExploreFullStack && (
            <button
              type="button"
              onClick={onExploreFullStack}
              className="btn-kinetic inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[42px] rounded-xl border border-slate-300/85 dark:border-white/12 bg-white/95 dark:bg-[#0f1117]/85 hover:border-[#0284ff]/50 hover:text-[#0369a1] dark:hover:text-[#38bdf8] text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff]"
            >
              <span>
                {lang === 'ar' ? 'الخبرات والشهادات' : 'Full Timeline & Certs'}
              </span>
              <span aria-hidden="true" className={isRtl ? 'inline-block rotate-180' : ''}>
                →
              </span>
            </button>
          )}
        </div>
      </RevealOnScroll>

      {/* Unified Segmented Category Filter Strip (Available in Both Overview & Experience Views) */}
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
                    isActive ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </RevealOnScroll>

      {/* Categorized Split Workbench: Left (Categorized Grid) + Right (Live Code & Project Inspector) */}
      <RevealOnScroll
        delay={0.04}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-start"
      >
        {/* Left / Start Track: Clean Unified 4x4 Tile Grid (Names Always Visible) */}
        <div
          className="lg:col-span-7 w-full"
          onMouseLeave={() => setHoveredToolId(null)}
        >
          {filteredTechs.length === 0 ? (
            <div className="rounded-2xl p-8 sm:p-10 text-center bg-white/95 dark:bg-[#0f1117]/85 border border-slate-200/90 dark:border-white/10">
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
                    aria-label={`${tech.name} — ${
                      lang === 'ar' ? tech.categoryLabelAr : tech.categoryLabel
                    }`}
                    onMouseEnter={() => setHoveredToolId(tech.id)}
                    onFocus={() => setHoveredToolId(tech.id)}
                    onBlur={() =>
                      setHoveredToolId((prev) => (prev === tech.id ? null : prev))
                    }
                    onClick={() => {
                      setHoveredToolId(null);
                      setSelectedToolId(tech.id);
                    }}
                    style={
                      isInspected
                        ? {
                            borderColor: `rgba(${tech.glowRgb}, 0.52)`,
                            boxShadow: `0 12px 26px -12px rgba(${tech.glowRgb}, 0.28)`,
                          }
                        : undefined
                    }
                    className={`stack-logo-tile group relative overflow-hidden flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border text-center cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] min-h-[116px] sm:min-h-[124px] ${
                      isInspected
                        ? 'bg-white dark:bg-[#131826]/95'
                        : 'bg-white/80 dark:bg-[#0f1117]/75 border-slate-200/85 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-[#131826]/90'
                    }`}
                  >
                    {/* Subtle Brand Wash on Hover / Selection */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 transition-opacity duration-200 ${
                        isInspected
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                      }`}
                      style={{
                        background: `radial-gradient(circle at 50% 40%, rgba(${tech.glowRgb}, 0.14) 0%, transparent 72%)`,
                      }}
                    />

                    {/* Muted-to-Luminous Animated Logo Well */}
                    <div className="stack-tile-well relative z-10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                      <span
                        aria-hidden="true"
                        className={`stack-logo-halo absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200 ${
                          isInspected
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                        }`}
                        style={{
                          background: `radial-gradient(circle, rgba(${tech.glowRgb}, 0.34) 0%, rgba(${tech.glowRgb}, 0.08) 65%, transparent 100%)`,
                          boxShadow: `0 0 24px rgba(${tech.glowRgb}, 0.3)`,
                        }}
                      />
                      <span className="stack-logo-glyph stack-muted-glyph relative z-10 flex items-center justify-center">
                        <Logo size={30} />
                      </span>
                    </div>

                    {/* Always-Visible Tech Name */}
                    <span
                      dir="ltr"
                      className={`stack-tile-name relative z-10 block w-full font-display text-[12px] font-bold tracking-tight truncate ${
                        isInspected
                          ? 'text-slate-950 dark:text-white'
                          : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white'
                      }`}
                    >
                      {tech.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right / End Track: Sticky Live Inspector (Overview + Projects + Live Code Pattern) */}
        <aside aria-live="polite" className="lg:col-span-5 lg:sticky lg:top-24 w-full">
          {inspectedTech && InspectedLogo ? (
            <div
              className="stack-inspector-card relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0f1117]/90 dark:backdrop-blur-xl p-5 sm:p-6 transition-colors duration-200"
              style={{
                boxShadow: `0 18px 42px -24px rgba(${inspectedTech.glowRgb}, 0.28)`,
              }}
            >
              {/* Subtle Ambient Radial Highlight */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -end-24 w-64 h-64 rounded-full opacity-50 dark:opacity-40 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle, rgba(${inspectedTech.glowRgb}, 0.18) 0%, transparent 70%)`,
                }}
              />

              {/* Inspector Top Bar: Index & Prev/Next Controls */}
              <div className="relative z-10 flex items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-white/8">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 min-w-0">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums shrink-0">
                    {formattedIndex} / {formattedTotal}
                  </span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700 shrink-0">
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

              {/* Inspector Identity & Interactive Mode Switcher */}
              <div key={inspectedTech.id} className="stack-inspector-swap relative z-10 pt-5 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="stack-inspector-emblem relative w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-200/90 dark:border-white/12 shrink-0"
                      style={{
                        backgroundColor: `rgba(${inspectedTech.glowRgb}, 0.12)`,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="stack-logo-halo absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          background: `radial-gradient(circle, rgba(${inspectedTech.glowRgb}, 0.32) 0%, transparent 72%)`,
                          boxShadow: `0 0 24px rgba(${inspectedTech.glowRgb}, 0.24)`,
                        }}
                      />
                      <span className="stack-logo-glyph relative z-10 flex items-center justify-center">
                        <InspectedLogo size={30} />
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3
                        dir="ltr"
                        className="font-display text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate"
                      >
                        {inspectedTech.name}
                      </h3>
                      <p className="text-xs font-mono text-[#0369a1] dark:text-[#38bdf8] mt-0.5 truncate">
                        {inspectedTech.highlightInApp}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Segmented Mode Control: Overview & Projects | Code Pattern */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/8">
                  <button
                    type="button"
                    onClick={() => setInspectorTab('overview')}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap min-h-[36px] ${
                      inspectorTab === 'overview'
                        ? 'bg-white dark:bg-[#182032] text-slate-900 dark:text-white shadow-2xs border border-slate-200/80 dark:border-white/10'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FolderGit2 size={13} className="text-[#0369a1] dark:text-[#38bdf8] shrink-0" />
                    <span>
                      {lang === 'ar' ? 'نظرة عامة والمشاريع' : 'Overview & Projects'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectorTab('code')}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap min-h-[36px] ${
                      inspectorTab === 'code'
                        ? 'bg-white dark:bg-[#182032] text-slate-900 dark:text-white shadow-2xs border border-slate-200/80 dark:border-white/10'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Code2 size={13} className="text-[#0369a1] dark:text-[#38bdf8] shrink-0" />
                    <span>{lang === 'ar' ? 'نمط الكود' : 'Code Pattern'}</span>
                  </button>
                </div>

                {inspectorTab === 'overview' ? (
                  <div className="space-y-4">
                    {/* Engineering Summary */}
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {lang === 'ar' ? inspectedTech.descriptionAr : inspectedTech.description}
                    </p>

                    {/* Core Capabilities Unboxed Grid */}
                    <div className="pt-3.5 border-t border-slate-200/80 dark:border-white/8">
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">
                        {lang === 'ar' ? 'القدرات الهندسية الأساسية' : 'Core Capabilities'}
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
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

                    {/* Linked Real Projects (Clickable to Open Project Details Modal or Repo) */}
                    {linkedProjects.length > 0 && (
                      <div className="pt-3.5 border-t border-slate-200/80 dark:border-white/8 space-y-2.5">
                        <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          <span>
                            {lang === 'ar'
                              ? 'مشاريع حقيقية تستخدم هذه التقنية'
                              : 'Shipped Projects Using This Stack'}
                          </span>
                          <span className="font-mono tabular-nums">
                            {String(linkedProjects.length).padStart(2, '0')}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {linkedProjects.map((proj) => (
                            <div
                              key={proj.id}
                              className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/8 bg-slate-50/75 dark:bg-white/[0.025] hover:border-[#0284ff]/45 transition-colors"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  if (onInspectProject) {
                                    onInspectProject(proj, 0);
                                  } else {
                                    window.open(proj.links.github, '_blank', 'noopener,noreferrer');
                                  }
                                }}
                                className="min-w-0 flex-1 text-start cursor-pointer group/proj focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] rounded"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    dir="ltr"
                                    className="font-display text-xs font-bold text-slate-900 dark:text-white group-hover/proj:text-[#0369a1] dark:group-hover/proj:text-[#38bdf8] truncate transition-colors"
                                  >
                                    {proj.name}
                                  </span>
                                  {proj.links.googlePlay && (
                                    <span className="text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                                      · Google Play
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                  {t.projects.localizedProjects?.[proj.repoName]?.subtitle ||
                                    proj.subtitle}
                                </div>
                              </button>

                              <div className="flex items-center gap-1 shrink-0">
                                {onInspectProject && (
                                  <button
                                    type="button"
                                    onClick={() => onInspectProject(proj, 0)}
                                    title={lang === 'ar' ? 'استعراض التفاصيل' : 'Inspect project'}
                                    aria-label={`${
                                      lang === 'ar' ? 'استعراض' : 'Inspect'
                                    } ${proj.name}`}
                                    className="w-8 h-8 rounded-lg bg-[#0284ff]/10 hover:bg-[#0284ff] text-[#0369a1] dark:text-[#38bdf8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                  >
                                    <Eye size={13} />
                                  </button>
                                )}
                                <a
                                  href={proj.links.googlePlay || proj.links.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={
                                    proj.links.googlePlay
                                      ? 'Google Play'
                                      : 'GitHub Repository'
                                  }
                                  aria-label={`Open ${proj.name}`}
                                  className="w-8 h-8 rounded-lg border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.04] hover:border-[#0284ff]/45 text-slate-600 dark:text-slate-300 hover:text-[#0369a1] dark:hover:text-[#38bdf8] flex items-center justify-center transition-colors"
                                >
                                  <ExternalLink size={13} />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Code Pattern Tab: Real Idiomatic Snippet + Copy Action + Project Ref */
                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#090c12] overflow-hidden">
                      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-200/80 dark:border-white/8 bg-white/80 dark:bg-[#131823]">
                        <div className="min-w-0">
                          <div
                            dir="ltr"
                            className="text-[11.5px] font-mono font-bold text-slate-800 dark:text-slate-100 truncate"
                          >
                            {inspectedTech.codePattern.fileName}
                          </div>
                          <div className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400 truncate">
                            {inspectedTech.codePattern.layerTag}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyPattern(inspectedTech)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.12] border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
                        >
                          {copiedId === inspectedTech.id ? (
                            <>
                              <Check size={12} className="text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">
                                {lang === 'ar' ? 'تم النسخ' : 'Copied'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>{lang === 'ar' ? 'نسخ' : 'Copy'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div
                        dir="ltr"
                        className="p-3.5 text-left font-mono text-[11px] sm:text-[11.5px] leading-relaxed overflow-x-auto max-h-[260px]"
                      >
                        {highlightedHtml ? (
                          <div
                            className="[&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0 [&_code]:!font-mono"
                            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                          />
                        ) : (
                          <pre className="text-slate-800 dark:text-slate-200 font-mono whitespace-pre">
                            <code>{inspectedTech.codePattern.code}</code>
                          </pre>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-mono truncate">
                        {lang === 'ar' ? 'المرجع العملي:' : 'Pattern Context:'}{' '}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {inspectedTech.codePattern.projectRef}
                        </strong>
                      </span>
                      {linkedProjects[0] && onInspectProject && (
                        <button
                          type="button"
                          onClick={() => onInspectProject(linkedProjects[0], 0)}
                          className="inline-flex items-center gap-1 font-semibold text-[#0369a1] dark:text-[#38bdf8] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <span>
                            {lang === 'ar'
                              ? `معاينة ${linkedProjects[0].name}`
                              : `Open ${linkedProjects[0].name}`}
                          </span>
                          <ArrowUpRight size={12} className={isRtl ? 'rotate-180' : ''} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Shortcut */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-white/8 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {lang === 'ar'
                      ? 'اضغط على أي تقنية للتبديل بين الكود والمشاريع'
                      : 'Select any tool to inspect linked apps & code'}
                  </span>
                  {!isFull && onExploreFullStack && (
                    <button
                      type="button"
                      onClick={onExploreFullStack}
                      className="font-semibold text-[#0369a1] dark:text-[#38bdf8] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {lang === 'ar' ? 'السجل والشهادات ←' : 'Timeline & Certs →'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0f1117]/85 p-6 sm:p-7 text-center">
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
