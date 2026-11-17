import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Terminal, Sparkles, Send, Trash2, Copy, Check } from 'lucide-react';
import { AHMED_CONFIG } from '../data/config';
import { FEATURED_PROJECTS, CERTIFICATES } from '../data/portfolioData';
import { useScrollLock } from '../hooks/useScrollLock';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface TerminalEasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: 'overview' | 'projects' | 'experience' | 'contact') => void;
}

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'ai' | 'system' | 'error';
  text: string;
  tag?: string;
}

const KNOWN_COMMANDS = [
  'help',
  'whoami',
  'stack',
  'revio',
  'projects',
  'experience',
  'contact',
  'ask',
  'clear',
  'exit',
];

// Localized UI dictionaries so Arabic RTL & English LTR both read effortlessly
const CLI_COPY = {
  en: {
    studioTitle: 'cli-studio',
    aiModeOn: 'AI Mode: ON',
    aiModeOff: 'AI Mode',
    copyEmail: 'Email',
    copiedEmail: 'Copied',
    clearTitle: 'Clear console',
    closeTitle: 'Close terminal',
    welcomeTag: 'READY',
    welcomeText: 'Ahmed El-Bialy Interactive CLI · Flutter & AI Workspace',
    welcomeSub: 'Tap any quick command below, type "help", or run "ask <question>" / enable AI Mode.',
    thinking: 'Thinking with portfolio context...',
    placeholderAi: 'Ask Gemini AI anything about Ahmed, Revio, or Flutter skills...',
    placeholderCmd: 'Type a command (help, revio, stack) or "ask <question>"',
    runLabel: 'Run',
    clearedTag: 'CLEARED',
    clearedText: 'Console cleared. Tap a shortcut or ask a question.',
    aiOnTag: 'AI MODE ON',
    aiOnText: 'AI Mode enabled. Ask anything about Ahmed, Revio, tech stack, or availability!',
    askUsage: 'Usage: ask <your question>  (Example: ask Tell me about Revio on Google Play)',
    unknownCmd: (cmd: string) =>
      `Unknown command "${cmd}". Try "help", enable AI Mode, or run "ask ${cmd}".`,
    chips: {
      help: 'help',
      whoami: 'whoami',
      revio: 'revio',
      stack: 'stack',
      projects: 'projects',
      experience: 'experience',
      contact: 'contact',
      askAi: 'Ask AI: Why hire Ahmed?',
      askAiCmd: 'ask Why should a team hire Ahmed as a Flutter developer?',
    },
  },
  ar: {
    studioTitle: 'استوديو الطرفية',
    aiModeOn: 'الذكاء الاصطناعي: مفعّل',
    aiModeOff: 'وضع AI',
    copyEmail: 'البريد',
    copiedEmail: 'تم النسخ',
    clearTitle: 'مسح السجل',
    closeTitle: 'إغلاق الطرفية',
    welcomeTag: 'جاهز',
    welcomeText: 'الطرفية التفاعلية الذكية — أحمد البيلي (Flutter & AI)',
    welcomeSub: 'اضغط على أي أمر سريع بالأسفل، أو اكتب سؤالاً مباشرة بعد تفعيل وضع AI.',
    thinking: 'جارٍ التفكير والرد من بيانات البورتفوليو...',
    placeholderAi: 'اسأل الذكاء الاصطناعي أي سؤال عن أحمد أو تطبيق Revio أو مهاراته...',
    placeholderCmd: 'اكتب أمراً (whoami, revio, stack) أو اسأل مباشرة...',
    runLabel: 'إرسال',
    clearedTag: 'تم المسح',
    clearedText: 'تم تنظيف الشاشة. اختر أمراً سريعاً أو اكتب سؤالك.',
    aiOnTag: 'وضع AI مفعّل',
    aiOnText: 'تم تفعيل وضع الذكاء الاصطناعي — اسأل أي سؤال عن المشاريع، الخبرات، أو التوظيف!',
    askUsage: 'طريقة الاستخدام: ask <سؤالك> (مثال: ask كلمني عن تطبيق Revio على Google Play)',
    unknownCmd: (cmd: string) =>
      `أمر غير معروف "${cmd}". جرّب الضغط على "مساعدة" أو تفعيل وضع AI للسؤال بحرية.`,
    chips: {
      help: 'مساعدة',
      whoami: 'من أنا',
      revio: 'ريفيو',
      stack: 'المهارات',
      projects: 'المشاريع',
      experience: 'الخبرات',
      contact: 'تواصل',
      askAi: 'اسأل AI عن أحمد',
      askAiCmd: 'ask كلمني عن خبرة أحمد وأهم تطبيقاته في Flutter',
    },
  },
} as const;

function buildLocalAdvisorReply(question: string, preferArabic: boolean): string {
  const q = question.toLowerCase();

  if (q.includes('revio') || q.includes('play') || q.includes('ريفيو') || q.includes('جوجل')) {
    return preferArabic
      ? `تطبيق Revio هو التطبيق الرئيسي لأحمد البيلي والمنشور رسمياً على Google Play (com.ahmed.revio).\nمبني بـ Flutter و Clean Architecture و Cubit مع تخزين محلي بدون إنترنت عبر Hive وحركات تقليب بطاقات ثلاثية الأبعاد.\nGoogle Play: ${AHMED_CONFIG.socials.playstore}`
      : `Revio is Ahmed's flagship offline-first flashcard study app live on Google Play (com.ahmed.revio).\nEngineered with Flutter, Clean Architecture, Cubit, Hive binary storage, and 3D flip-card transitions.\nStore Link: ${AHMED_CONFIG.socials.playstore}`;
  }

  if (q.includes('movura') || q.includes('vibrant') || q.includes('sky') || q.includes('news') || q.includes('shaat') || q.includes('مشروع') || q.includes('تطبيق')) {
    return preferArabic
      ? `أبرز التطبيقات: Revio (منشور على Google Play)، Movura (تطبيق أفلام ومسلسلات بـ TMDB و BLoC)، Vibrant-Store (متجر إلكتروني)، Sky-Cast (طقس تفاعلي)، News-Cloud (أخبار عربية RTL مع Retrofit)، و Shaats (شات لحظي بـ Firebase Firestore).`
      : `Notable builds: Revio (live on Google Play), Movura (TMDB cinema tracker with BLoC & Slivers), Vibrant-Store (DummyJSON e-commerce), Sky-Cast (adaptive weather), News-Cloud (bilingual RTL news with Retrofit), and Shaats (Firebase real-time chat).`;
  }

  if (
    q.includes('hire') ||
    q.includes('why') ||
    q.includes('available') ||
    q.includes('contact') ||
    q.includes('email') ||
    q.includes('لماذا') ||
    q.includes('ليش') ||
    q.includes('متاح') ||
    q.includes('توظيف') ||
    q.includes('تواصل')
  ) {
    return preferArabic
      ? `أحمد البيلي مطور Flutter يجمع بين إتقان Clean Architecture و BLoC/Cubit ونشر تطبيق فعلي على Google Play (Revio)، إلى جانب دراسته بكلية الذكاء الاصطناعي — وهو متاح الآن للعمل (دوام كامل / عن بُعد / مشاريع).\nالبريد: ${AHMED_CONFIG.email} · واتساب: ${AHMED_CONFIG.phone}`
      : `Ahmed combines Clean Architecture + BLoC/Cubit engineering discipline with real Google Play shipping experience (Revio), backed by a B.Sc. in AI track—and is Open to Work (Full-time, Remote, or Freelance MVPs).\nEmail: ${AHMED_CONFIG.email} | WhatsApp: ${AHMED_CONFIG.phone}`;
  }

  if (q.includes('stack') || q.includes('skill') || q.includes('tech') || q.includes('arch') || q.includes('bloc') || q.includes('مهار') || q.includes('تقن') || q.includes('معمار')) {
    return preferArabic
      ? `التقنيات الأساسية: Flutter SDK · Dart · Clean Architecture · BLoC / Cubit · Hive · Dio & Retrofit · Firebase Auth & Firestore · REST APIs · Python · C++.`
      : `Core Engineering Stack: Flutter SDK, Dart, Clean Architecture, BLoC / Cubit, Hive offline storage, Dio & Retrofit, Firebase Auth & Cloud Firestore, REST APIs, Python, and C++.`;
  }

  if (
    q.includes('exp') ||
    q.includes('cert') ||
    q.includes('educat') ||
    q.includes('uni') ||
    q.includes('خبر') ||
    q.includes('جامع') ||
    q.includes('شهاد')
  ) {
    return preferArabic
      ? `التعليم: بكالوريوس الذكاء الاصطناعي — جامعة كفر الشيخ (2023 – 2027).\nالخبرات: متدرب Flutter في CodeAlpha (يونيو–يوليو 2026) ومعسكر Sprints x Microsoft (يونيو–يوليو 2025) + شهادة Udemy Flutter (أبريل 2026).`
      : `Education: B.Sc. in Artificial Intelligence, Kafrelsheikh University (Oct 2023 – Jun 2027).\nExperience: Flutter Trainee at CodeAlpha (Jun–Jul 2026: built Revio & Quotely) and Sprints x Microsoft Camp (Jun–Jul 2025), plus Udemy Flutter Certificate.`;
  }

  return preferArabic
    ? `أحمد البيلي مطور Flutter وطالب بكلية الذكاء الاصطناعي — جامعة كفر الشيخ.\nطوّر أكثر من ${FEATURED_PROJECTS.length} تطبيقات متكاملة أبرزها Revio (على Google Play) و Movura و Vibrant-Store و Sky-Cast و News-Cloud و Shaats.\nللتواصل المباشر: ${AHMED_CONFIG.email}`
    : `Ahmed El-Bialy is a Flutter Mobile Developer & AI student at Kafrelsheikh University.\nHe has shipped ${FEATURED_PROJECTS.length}+ apps including Revio (live on Google Play), Movura (TMDB), Vibrant-Store, Sky-Cast, News-Cloud, and Shaats.\nReach out: ${AHMED_CONFIG.email}`;
}

export const TerminalEasterEggModal: React.FC<TerminalEasterEggModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  useScrollLock(isOpen);
  const { lang, dir, t } = useLanguage();
  const { showToast } = useToast();
  const copy = CLI_COPY[lang];

  const [input, setInput] = useState('');
  const [aiMode, setAiMode] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'system',
      tag: CLI_COPY[lang].welcomeTag,
      text: CLI_COPY[lang].welcomeText,
    },
    {
      id: 'init-2',
      type: 'output',
      text: CLI_COPY[lang].welcomeSub,
    },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync welcome lines cleanly if language changes while unopened/fresh
  useEffect(() => {
    setLines((prev) => {
      if (prev.length === 2 && prev[0].id === 'init-1' && prev[1].id === 'init-2') {
        return [
          { id: 'init-1', type: 'system', tag: CLI_COPY[lang].welcomeTag, text: CLI_COPY[lang].welcomeText },
          { id: 'init-2', type: 'output', text: CLI_COPY[lang].welcomeSub },
        ];
      }
      return prev;
    });
  }, [lang]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 70);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [lines, isAiLoading]);

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const appendLines = (...newItems: Omit<TerminalLine, 'id'>[]) => {
    setLines((prev) => [
      ...prev,
      ...newItems.map((item, idx) => ({
        ...item,
        id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      })),
    ]);
  };

  const askPortfolioAi = async (question: string) => {
    const cleanQ = question.trim();
    if (!cleanQ) {
      appendLines({
        type: 'error',
        text: copy.askUsage,
      });
      return;
    }

    setIsAiLoading(true);
    const preferArabic = lang === 'ar' || /[\u0600-\u06FF]/.test(cleanQ);

    try {
      const res = await fetch('/api/ai/cli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: cleanQ, lang }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && data?.answer) {
        appendLines({
          type: 'ai',
          tag: preferArabic ? 'مساعد AI · Gemini' : 'AI · GEMINI',
          text: data.answer,
        });
      } else {
        appendLines({
          type: 'ai',
          tag: preferArabic ? 'المساعد الذكي' : 'ADVISOR',
          text: buildLocalAdvisorReply(cleanQ, preferArabic),
        });
      }
    } catch {
      appendLines({
        type: 'ai',
        tag: preferArabic ? 'المساعد الذكي' : 'ADVISOR',
        text: buildLocalAdvisorReply(cleanQ, preferArabic),
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const runCommand = async (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed || isAiLoading) return;

    setCmdHistory((prev) => [trimmed, ...prev.filter((c) => c !== trimmed)].slice(0, 25));
    setHistoryPointer(-1);
    setInput('');

    const lower = trimmed.toLowerCase();

    if (lower === 'clear' || lower === 'cls' || trimmed === 'مسح') {
      setLines([
        {
          id: `${Date.now()}-clr`,
          type: 'system',
          tag: copy.clearedTag,
          text: copy.clearedText,
        },
      ]);
      return;
    }

    if (lower === 'exit' || lower === 'quit' || trimmed === 'خروج') {
      onClose();
      return;
    }

    appendLines({ type: 'input', text: trimmed });

    if (lower.startsWith('ask ')) {
      await askPortfolioAi(trimmed.slice(4));
      return;
    }

    if (lower === 'ask') {
      setAiMode(true);
      appendLines({
        type: 'system',
        tag: copy.aiOnTag,
        text: copy.aiOnText,
      });
      return;
    }

    switch (lower) {
      case 'help':
      case 'ahmed --help':
      case 'مساعدة':
        appendLines({
          type: 'output',
          tag: lang === 'ar' ? 'الأوامر المتاحة' : 'COMMANDS',
          text:
            lang === 'ar'
              ? [
                  'whoami      · الملف الشخصي والموقع والدراسة',
                  'stack       · مهارات Flutter والمعمارية والتخزين',
                  'revio       · التطبيق الرئيسي على Google Play',
                  'projects    · قائمة التطبيقات الجاهزة للإنتاج',
                  'experience  · الخبرات العملية والشهادات المعتمدة',
                  'contact     · البريد والواتساب وحسابات التواصل',
                  'ask <سؤال>  · سؤال الذكاء الاصطناعي مباشرة',
                ].join('\n')
              : [
                  'whoami      · Profile, location & AI degree info',
                  'stack       · Core Flutter, state, storage & backend stack',
                  'revio       · Flagship app live on Google Play (com.ahmed.revio)',
                  'projects    · List production apps (or add "--go" to jump)',
                  'experience  · Internships & verified certifications',
                  'contact     · Direct channels (Email, WhatsApp, GitHub, LinkedIn)',
                  'ask <query> · Ask Gemini AI about Ahmed & his apps',
                  'clear / exit',
                ].join('\n'),
        });
        return;

      case 'whoami':
      case 'من أنا':
        appendLines({
          type: 'output',
          tag: lang === 'ar' ? 'الهوية المهنية' : 'IDENTITY',
          text:
            lang === 'ar'
              ? `${AHMED_CONFIG.name.ar} (${AHMED_CONFIG.name.en})\nالدور: ${AHMED_CONFIG.title.ar}\nالموقع: ${AHMED_CONFIG.location.ar}\nالتعليم: ${AHMED_CONFIG.education.degree.ar} — ${AHMED_CONFIG.education.university.ar} (${AHMED_CONFIG.education.period})\nالحالة: متاح لفرص العمل والمشاريع`
              : `${AHMED_CONFIG.name.en} (${AHMED_CONFIG.name.ar})\nRole: ${AHMED_CONFIG.title.en}\nLocation: ${AHMED_CONFIG.location.en}\nEducation: ${AHMED_CONFIG.education.degree.en} — ${AHMED_CONFIG.education.university.en} (${AHMED_CONFIG.education.period})\nStatus: Open to Work`,
        });
        return;

      case 'stack':
      case 'ahmed skills --list':
      case 'المهارات':
        appendLines({
          type: 'output',
          tag: lang === 'ar' ? 'المنظومة التقنية' : 'STACK',
          text:
            lang === 'ar'
              ? 'تطوير الموبايل: Flutter SDK · Dart · Clean Architecture · دعم العربية RTL\nإدارة الحالة والتخزين: BLoC · Cubit · Hive CE · SharedPreferences · SQLite\nالشبكات والسحابة: Dio · Retrofit · REST APIs · Firebase Auth · Cloud Firestore\nالبرمجة والأدوات: Git/GitHub · Google Play Console · Python · C++'
              : 'Mobile: Flutter SDK · Dart · Clean Architecture · Responsive RTL/LTR UI\nState & Storage: BLoC · Cubit · Hive CE · SharedPreferences · SQLite\nNetworking & Cloud: Dio · Retrofit · REST APIs · Firebase Auth · Cloud Firestore\nTooling & CS: Git/GitHub · Google Play Console · Python · C++',
        });
        return;

      case 'revio':
      case 'ريفيو':
        appendLines({
          type: 'output',
          tag: lang === 'ar' ? 'متجر Google Play' : 'GOOGLE PLAY',
          text:
            lang === 'ar'
              ? `Revio — تطبيق البطاقات التعليمية والاسترجاع النشط\nالحالة: منشور رسمياً على Google Play (com.ahmed.revio)\nالتقنيات: Clean Architecture · Cubit · Hive CE · تقليب ثلاثي الأبعاد\nرابط المتجر: ${AHMED_CONFIG.socials.playstore}\nمستودع GitHub: https://github.com/ahmed-el-bialy/Revio`
              : `Revio — Active-Recall Flashcard App\nStatus: Live on Google Play Store (com.ahmed.revio)\nStack: Clean Architecture · Cubit · Hive CE · 3D Flip Cards\nStore URL: ${AHMED_CONFIG.socials.playstore}\nGitHub: https://github.com/ahmed-el-bialy/Revio`,
        });
        return;

      case 'projects':
      case 'المشاريع':
        appendLines({
          type: 'output',
          tag: lang === 'ar' ? 'التطبيقات' : 'APPS',
          text: FEATURED_PROJECTS.slice(0, 6)
            .map((p) => {
              const arSub = lang === 'ar' && t.projects.localizedProjects[p.repoName]?.subtitle;
              return `• ${p.name} — ${arSub || p.subtitle}`;
            })
            .join('\n'),
        });
        return;

      case 'projects --go':
        onClose();
        onNavigateTab?.('projects');
        return;

      case 'experience':
      case 'الخبرات':
        appendLines({
          type: 'output',
          tag: lang === 'ar' ? 'الخبرات والشهادات' : 'TIMELINE',
          text:
            lang === 'ar'
              ? [
                  '• CodeAlpha — متدرب تطوير تطبيقات Flutter (يونيو 2026 – يوليو 2026)',
                  '• معسكر Sprints x Microsoft الصيفي — تطوير الموبايل (يونيو 2025 – يوليو 2025)',
                  ...CERTIFICATES.map((c) => `✓ شهادة: ${c.title} (${c.issuer}, ${c.date})`),
                ].join('\n')
              : [
                  '• CodeAlpha — Flutter Development Trainee (June 2026 – July 2026)',
                  '• Sprints x Microsoft Summer Camp — Mobile Development (June 2025 – July 2025)',
                  ...CERTIFICATES.map((c) => `✓ Cert: ${c.title} (${c.issuer}, ${c.date})`),
                ].join('\n'),
        });
        return;

      case 'contact':
      case 'ahmed contact --email':
      case 'تواصل':
        appendLines({
          type: 'output',
          tag: lang === 'ar' ? 'قنوات التواصل' : 'CHANNELS',
          text:
            lang === 'ar'
              ? `البريد الإلكتروني: ${AHMED_CONFIG.email}\nالواتساب والهاتف: ${AHMED_CONFIG.phone}\nGitHub: ${AHMED_CONFIG.socials.github}\nLinkedIn: ${AHMED_CONFIG.socials.linkedin}`
              : `Email: ${AHMED_CONFIG.email}\nWhatsApp / Phone: ${AHMED_CONFIG.phone}\nGitHub: ${AHMED_CONFIG.socials.github}\nLinkedIn: ${AHMED_CONFIG.socials.linkedin}`,
        });
        return;

      default:
        if (aiMode || trimmed.includes(' ') || trimmed.endsWith('?') || trimmed.endsWith('؟') || /[\u0600-\u06FF]/.test(trimmed)) {
          await askPortfolioAi(trimmed);
          return;
        }
        appendLines({
          type: 'error',
          text: copy.unknownCmd(trimmed),
        });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIndex = Math.min(historyPointer + 1, cmdHistory.length - 1);
      setHistoryPointer(nextIndex);
      setInput(cmdHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer <= 0) {
        setHistoryPointer(-1);
        setInput('');
      } else {
        const nextIndex = historyPointer - 1;
        setHistoryPointer(nextIndex);
        setInput(cmdHistory[nextIndex]);
      }
    } else if (e.key === 'Tab') {
      const val = input.trim().toLowerCase();
      if (!val) return;
      const match = KNOWN_COMMANDS.find((c) => c.startsWith(val));
      if (match) {
        e.preventDefault();
        setInput(match === 'ask' ? 'ask ' : match);
      }
    }
  };

  const copyEmailQuick = async () => {
    try {
      await navigator.clipboard.writeText(AHMED_CONFIG.email);
      setCopiedEmail(true);
      showToast({
        message: lang === 'ar' ? 'تم نسخ البريد الإلكتروني' : 'Email copied to clipboard',
        detail: AHMED_CONFIG.email,
      });
      setTimeout(() => setCopiedEmail(false), 1800);
    } catch {}
  };

  const quickChips = [
    { label: copy.chips.help, cmd: 'help', isAi: false },
    { label: copy.chips.whoami, cmd: 'whoami', isAi: false },
    { label: copy.chips.revio, cmd: 'revio', isAi: false },
    { label: copy.chips.stack, cmd: 'stack', isAi: false },
    { label: copy.chips.projects, cmd: 'projects', isAi: false },
    { label: copy.chips.experience, cmd: 'experience', isAi: false },
    { label: copy.chips.contact, cmd: 'contact', isAi: false },
    { label: copy.chips.askAi, cmd: copy.chips.askAiCmd, isAi: true },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Developer CLI Inspector"
    >
      <div
        dir={dir}
        className={`w-full max-w-2xl h-[85dvh] sm:h-auto sm:max-h-[82vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-[#07090e] border border-white/15 shadow-2xl shadow-[#027DFD]/15 overflow-hidden ${
          lang === 'ar' ? 'text-right font-sans' : 'text-left font-mono'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Terminal Bar */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-[#0f131d] border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <Terminal size={14} className="text-[#00C7FF] shrink-0" />
            <span className="text-xs font-semibold text-slate-100 truncate">
              <span dir="ltr" className="font-mono text-[#7DD3FC] me-1.5">{AHMED_CONFIG.monogram}</span>
              <span>{copy.studioTitle}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setAiMode((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                aiMode
                  ? 'bg-[#027DFD]/20 text-[#7DD3FC] border-[#00C7FF]/50'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
              title={lang === 'ar' ? 'تفعيل أو إيقاف وضع الذكاء الاصطناعي' : 'Toggle direct AI Q&A mode'}
            >
              <Sparkles size={12} className={aiMode ? 'text-[#00C7FF]' : 'text-slate-400'} />
              <span>{aiMode ? copy.aiModeOn : copy.aiModeOff}</span>
            </button>

            <button
              type="button"
              onClick={copyEmailQuick}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] cursor-pointer"
              title="ah.elbialy.dev@gmail.com"
            >
              {copiedEmail ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedEmail ? copy.copiedEmail : copy.copyEmail}</span>
            </button>

            <button
              type="button"
              onClick={() => runCommand('clear')}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              aria-label={copy.clearTitle}
              title={copy.clearTitle}
            >
              <Trash2 size={13} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 flex items-center justify-center cursor-pointer"
              aria-label={copy.closeTitle}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable Output Feed */}
        <div
          ref={scrollContainerRef}
          className="flex-1 min-h-[240px] max-h-[420px] overflow-y-auto p-4 space-y-2.5 text-xs bg-[#07090e]"
        >
          {lines.map((line) => {
            if (line.type === 'input') {
              return (
                <div key={line.id} className="flex items-start gap-2 text-[#00C7FF] font-semibold">
                  <span className="text-[#027DFD] select-none shrink-0 font-mono">$</span>
                  <span className="break-words">{line.text}</span>
                </div>
              );
            }

            const isAi = line.type === 'ai';
            const isErr = line.type === 'error';
            const isSys = line.type === 'system';

            return (
              <div
                key={line.id}
                className={`rounded-xl px-3.5 py-2.5 border leading-relaxed whitespace-pre-wrap break-words ${
                  isAi
                    ? 'bg-[#027DFD]/[0.09] border-[#00C7FF]/30 text-slate-100'
                    : isErr
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                    : isSys
                    ? 'bg-emerald-500/[0.08] border-emerald-500/25 text-emerald-200'
                    : 'bg-white/[0.03] border-white/8 text-slate-200'
                }`}
              >
                {line.tag && (
                  <div
                    className={`text-[10px] font-bold tracking-wider uppercase mb-1 ${
                      isAi
                        ? 'text-[#00C7FF]'
                        : isSys
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {line.tag}
                  </div>
                )}
                <div className="leading-relaxed">{line.text}</div>
              </div>
            );
          })}

          {isAiLoading && (
            <div className="rounded-xl px-3.5 py-2.5 border border-[#00C7FF]/30 bg-[#027DFD]/[0.08] text-[#7DD3FC] flex items-center gap-2">
              <Sparkles size={13} className="animate-pulse shrink-0" />
              <span>{copy.thinking}</span>
            </div>
          )}
        </div>

        {/* One-Tap Quick Command Chips (Localized AR & EN) */}
        <div className="px-3.5 py-2.5 bg-[#0b0f18] border-t border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {quickChips.map((chip) => (
            <button
              key={chip.cmd}
              type="button"
              onClick={() => runCommand(chip.cmd)}
              className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                chip.isAi
                  ? 'bg-[#027DFD]/15 hover:bg-[#027DFD]/25 text-[#7DD3FC] border-[#00C7FF]/40 inline-flex items-center gap-1'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              {chip.isAi && <Sparkles size={11} className="text-[#00C7FF]" />}
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Command / AI Input Prompt */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runCommand(input);
          }}
          className="flex items-center gap-2 px-4 py-3 bg-[#0f131d] border-t border-white/10 shrink-0"
        >
          <span dir="ltr" className="text-[#00C7FF] text-xs font-bold font-mono shrink-0">
            {aiMode ? 'AI>' : '$'}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAiLoading}
            placeholder={aiMode ? copy.placeholderAi : copy.placeholderCmd}
            className="flex-1 bg-transparent text-xs sm:text-[13px] text-white placeholder-slate-500 focus:outline-none min-w-0"
          />
          <button
            type="submit"
            disabled={!input.trim() || isAiLoading}
            className="px-3 py-1.5 rounded-lg bg-[#027DFD] hover:bg-[#026ae0] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
            aria-label={copy.runLabel}
          >
            <Send size={12} className={dir === 'rtl' ? 'rotate-180' : ''} />
            <span className="hidden sm:inline">{copy.runLabel}</span>
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};
