export type AvailabilityStatus = 'open' | 'busy' | 'freelance-only';

export interface DartSnippetSpec {
  id: string;
  fileName: string;
  projectLabel: string;
  layerTag: string;
  code: string;
}

/**
 * Single Source of Truth for non-API personal profile & portfolio configuration.
 * All factual details derive strictly from verified CV records & live platforms.
 */
export const AHMED_CONFIG = {
  monogram: '<AEB />',
  name: {
    en: 'Ahmed El-Bialy',
    ar: 'أحمد البيلي',
  },
  title: {
    en: 'Flutter Mobile Developer',
    ar: 'مطور Flutter للجوال',
  },
  location: {
    en: 'El Mansoura, Egypt',
    ar: 'المنصورة، مصر',
  },
  availability: 'open' as AvailabilityStatus,
  availabilityLabel: {
    open: { en: 'Open to Work', ar: 'متاح لفرص العمل' },
    busy: { en: 'Currently Focused', ar: 'مشغول حالياً' },
    'freelance-only': { en: 'Freelance Inquiries', ar: 'متاح لمشاريع فريلانس' },
  },
  email: 'ah.elbialy.dev@gmail.com',
  phone: '+20 102 212 1573',
  whatsappNumber: '201022121573',
  education: {
    degree: {
      en: "Bachelor's in Artificial Intelligence",
      ar: 'بكالوريوس الذكاء الاصطناعي',
    },
    faculty: {
      en: 'Faculty of Artificial Intelligence',
      ar: 'كلية الذكاء الاصطناعي',
    },
    university: {
      en: 'Kafrelsheikh University',
      ar: 'جامعة كفر الشيخ',
    },
    period: 'Oct 2023 – Jun 2027',
  },
  socials: {
    github: 'https://github.com/ahmed-el-bialy',
    linkedin: 'https://www.linkedin.com/in/ahmedel-bialy/',
    youtube: 'https://www.youtube.com/@AhmedEl-Bialy',
    tiktok: 'https://www.tiktok.com/@ahmedelbialydev',
    instagram: 'https://www.instagram.com/ah.elbialy.dev/',
    whatsapp: 'https://wa.me/201022121573',
    playstore: 'https://play.google.com/store/apps/details?id=com.ahmed.revio&hl=en_US',
  },
  githubUsername: 'ahmed-el-bialy',
  featuredRepos: [
    'Revio',
    'Movura',
    'Vibrant-store',
    'Sky-Cast',
    'News-Cloud',
    'Shaats',
  ],
  cvUrl: 'https://drive.google.com/file/d/1lQMnmyIA100YyXLu4jqFdhWluSeig4Pn/view',
  cvDocUrl: 'https://docs.google.com/document/d/1K_pt4CgqDQ8sr0H3gcmOGP8vhqchWsP-/edit?usp=drive_link',
} as const;

export function getEgyptLocalTime(lang: 'en' | 'ar' = 'en'): string {
  try {
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', {
      timeZone: 'Africa/Cairo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
  } catch {
    return '';
  }
}

export const DART_ARCHITECTURE_SNIPPETS: DartSnippetSpec[] = [
  {
    id: 'cubit',
    fileName: 'quiz_cubit.dart',
    projectLabel: 'Revio · Google Play',
    layerTag: 'Presentation · Cubit',
    code: `class QuizCubit extends Cubit<QuizState> {
  final EvaluateAnswerUseCase evaluateAnswer;
  final SaveProgressUseCase saveProgress;

  QuizCubit({
    required this.evaluateAnswer,
    required this.saveProgress,
  }) : super(const QuizInitial());

  Future<void> submitAnswer(String input, Flashcard card) async {
    final result = evaluateAnswer(
      userInput: input.trim(),
      expected: card.answer,
    );
    await saveProgress(card.id, isCorrect: result.isMatch);
    emit(QuizEvaluated(card: card, result: result));
  }
}`,
  },
  {
    id: 'hive',
    fileName: 'flashcard_local_source.dart',
    projectLabel: 'Revio · Offline Storage',
    layerTag: 'Data · Hive',
    code: `abstract interface class FlashcardLocalSource {
  Future<List<FlashcardModel>> getDeckCards(String topicId);
  Future<void> upsertCard(FlashcardModel card);
}

class HiveFlashcardSource implements FlashcardLocalSource {
  final Box<FlashcardModel> _box;
  HiveFlashcardSource(this._box);

  @override
  Future<List<FlashcardModel>> getDeckCards(String topicId) async =>
      _box.values.where((c) => c.topicId == topicId).toList();

  @override
  Future<void> upsertCard(FlashcardModel card) =>
      _box.put(card.id, card);
}`,
  },
  {
    id: 'dio',
    fileName: 'tmdb_repository_impl.dart',
    projectLabel: 'Movura · REST API',
    layerTag: 'Domain · Repository',
    code: `class TmdbRepositoryImpl implements MediaRepository {
  final TmdbRemoteDataSource remote;
  TmdbRepositoryImpl(this.remote);

  @override
  Future<Either<Failure, List<MediaEntity>>> fetchTrending() async {
    try {
      final response = await remote.getTrendingMovies();
      return Right(response.results.map((m) => m.toEntity()).toList());
    } on DioException catch (err) {
      return Left(NetworkFailure.fromDio(err));
    }
  }
}`,
  },
];
