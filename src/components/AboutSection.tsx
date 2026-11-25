import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Globe, Sparkles, ArrowRight, Compass, HeartHandshake, Lightbulb } from 'lucide-react';
import { AHMED_CONFIG } from '../data/config';
import { LANGUAGES_DATA, EDUCATION_DATA, AHMED_PROFILE } from '../data/portfolioData';
import { BrandLogoMark } from './BrandLogoMark';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import { RevealOnScroll, StaggerGroup, StaggerItem } from './RevealOnScroll';
import { useLanguage } from '../context/LanguageContext';

interface AboutSectionProps {
  onExploreExperience?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onExploreExperience }) => {
  const { lang, dir } = useLanguage();
  const aboutFieldRef = useRef<HTMLElement>(null);
  const [tapCount, setTapCount] = useState(0);
  const [eggTriggered, setEggTriggered] = useState(false);
  const eggTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (eggTimerRef.current) {
        window.clearTimeout(eggTimerRef.current);
      }
    };
  }, []);

  const handleAvatarEasterEgg = async () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) {
      setTapCount(0);
      setEggTriggered(true);
      try {
        const { default: confetti } = await import('canvas-confetti');
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#0284ff', '#38bdf8', '#10B981'],
        });
      } catch {
        // Ignore if confetti fails to load
      }
      if (eggTimerRef.current) {
        window.clearTimeout(eggTimerRef.current);
      }
      eggTimerRef.current = window.setTimeout(() => setEggTriggered(false), 3500);
    }
  };

  const humanPillars =
    lang === 'ar'
      ? [
          {
            icon: Compass,
            title: 'الفضول أولاً',
            desc: 'أسأل دائماً: كيف سيشعر الشخص وهو يستخدم هذا التطبيق لأول مرة؟ قبل كتابة أي سطر كود.',
          },
          {
            icon: HeartHandshake,
            title: 'المنتج للإنسان',
            desc: 'التقنية وسيلة؛ هدفي أن يشعر المستخدم بالراحة والبساطة دون أي تعقيد أو تشتيت.',
          },
          {
            icon: Lightbulb,
            title: 'تعلّم مستمر',
            desc: 'أجمع بين دراسة الذكاء الاصطناعي وتجربة أفكار جديدة في اللغات والموسيقى والرياضة.',
          },
        ]
      : [
          {
            icon: Compass,
            title: 'Curiosity First',
            desc: 'Asking “how will this actually feel in someone’s hands?” before opening the editor.',
          },
          {
            icon: HeartHandshake,
            title: 'Built for People',
            desc: 'Technology is just the medium—the real craft is removing friction from daily life.',
          },
          {
            icon: Lightbulb,
            title: 'Always Learning',
            desc: 'Blending AI university studies with reading, language drills, music, and teamwork.',
          },
        ];

  return (
    <section
      ref={aboutFieldRef}
      id="about"
      className="scroll-mt-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 w-full"
    >
      {/* Clear Editorial Header */}
      <RevealOnScroll className="mb-7 sm:mb-10">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8] mb-1.5">
          <span>{lang === 'ar' ? 'نبذة عني' : 'About Me'}</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-slate-600 dark:text-slate-400">
            {lang === 'ar' ? 'الإنسان خلف التطبيقات' : 'The Person Behind the Products'}
          </span>
        </div>
        <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight [text-wrap:balance]">
          {lang === 'ar' ? 'من أنا وكيف أفكر' : 'Who I Am & How I Build'}
        </h2>
      </RevealOnScroll>

      {/* Open Architectural Identity & Spoken Languages Band (Unboxed editorial contrast) */}
      <RevealOnScroll
        delay={0}
        className="mb-8 sm:mb-10 pb-7 sm:pb-9 border-b border-slate-200/80 dark:border-white/10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
          {/* 1. Headshot + Side-by-Side Brand Logo & Display Name */}
          <div className="lg:col-span-5 flex items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="shrink-0">
              <button
                type="button"
                onClick={handleAvatarEasterEgg}
                className="group relative w-[74px] h-[74px] sm:w-24 sm:h-24 rounded-2xl overflow-hidden p-[2.5px] bg-gradient-to-br from-[#0284ff] via-[#38bdf8] to-emerald-400 shadow-lg shadow-[#0284ff]/20 ring-1 ring-[#38bdf8]/30 transition-transform duration-200 hover:scale-[1.03] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff]"
                aria-label={
                  lang === 'ar'
                    ? 'صورة أحمد البيلي (انقر 5 مرات للمفاجأة)'
                    : 'Ahmed El-Bialy portrait (tap 5 times for a surprise)'
                }
              >
                <span className="block w-full h-full rounded-[13px] overflow-hidden bg-[#161e31]">
                  <ImageWithSkeleton
                    src={AHMED_PROFILE.avatarUrl}
                    alt={AHMED_CONFIG.name[lang]}
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                </span>
              </button>
            </div>

            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 py-1">
                <h3 className="font-display text-[18px] sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                  {AHMED_CONFIG.name[lang]}
                </h3>
                <BrandLogoMark
                  floatingInk={true}
                  fieldRef={aboutFieldRef}
                  sizeClassName="w-9 h-9 sm:w-11 sm:h-11"
                  alt="Ahmed El-Bialy Personal Brand Logo"
                />
              </div>
              <p className="font-display text-[13px] sm:text-[15px] font-bold text-[#0369a1] dark:text-[#38bdf8] leading-snug">
                {AHMED_CONFIG.title[lang]}
              </p>
              <p className="text-[11.5px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium">
                {AHMED_CONFIG.location[lang]}
              </p>
            </div>
          </div>

          {/* 2. Personal Mission / Interactive Surprise Readout */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-s border-slate-200/80 dark:border-white/8 pt-4 lg:pt-0 lg:ps-6">
            {eggTriggered ? (
              <p className="text-xs sm:text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <Sparkles size={14} />
                <span>
                  {lang === 'ar'
                    ? 'أهلاً بك! سعيد جداً بتواجدك هنا'
                    : 'Welcome in! Thanks for taking a closer look.'}
                </span>
              </p>
            ) : tapCount > 1 ? (
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                {5 - tapCount} {lang === 'ar' ? 'نقرات متبقية للمفاجأة...' : 'more taps for surprise...'}
              </p>
            ) : (
              <p className="text-xs sm:text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === 'ar'
                  ? 'تطوير تطبيقات Flutter عالية الأداء وفق معمارية Clean Architecture، مع حلول تخزين محلي موثوقة ودمج أسس الذكاء الاصطناعي في سير العمل الهندسي.'
                  : 'Architecting high-performance Flutter apps with Clean Architecture, offline-first persistence, and AI-informed development workflows.'}
              </p>
            )}
          </div>

          {/* 3. Compact Spoken Languages Matrix */}
          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-s border-slate-200/80 dark:border-white/8 pt-4 lg:pt-0 lg:ps-6 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <Globe size={13} className="text-[#0369a1] dark:text-[#38bdf8]" />
              <span>{lang === 'ar' ? 'اللغات' : 'Languages'}</span>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-3 lg:grid-cols-1 gap-2 lg:gap-1.5">
              {LANGUAGES_DATA.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-0.5 lg:gap-2 text-xs text-slate-600 dark:text-slate-300"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate text-[11.5px] sm:text-xs">
                    {item.flag} {item.nativeName}
                  </span>
                  <span className="font-mono text-[10.5px] sm:text-[11px] text-slate-600 dark:text-slate-400 shrink-0">
                    {item.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealOnScroll>

      {/* Asymmetric Editorial Split: Open Engineering Narrative (Left) + Elevated Skill Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-stretch">
        {/* Left: Airy Unboxed Story & 3 Human Mindset Pillars */}
        <RevealOnScroll
          delay={0.05}
          className="lg:col-span-7 flex flex-col justify-between py-1"
        >
          <div>
            <h3
              className={`font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight [text-wrap:balance] ${
                lang === 'ar' ? 'leading-[1.35]' : 'leading-tight'
              }`}
            >
              {lang === 'ar'
                ? 'هندسة تطبيقات Flutter عالية الأداء — مبنية على Clean Architecture ومنهجية الذكاء الاصطناعي.'
                : 'Production Flutter engineering built on Clean Architecture, offline reliability, and AI-driven workflows.'}
            </h3>

            <div className="mt-4 space-y-4 text-sm sm:text-[15.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                {lang === 'ar'
                  ? 'أصمم تطبيقات الموبايل بمنهجية هندسية تركز على سرعة الأداء واستقرار الحالة وسهولة الصيانة، عبر تطبيق معمارية Clean Architecture وفصل طبقات العرض والمنطق والبيانات باستخدام BLoC/Cubit. وتتكامل دراستي في كلية الذكاء الاصطناعي بجامعة كفر الشيخ مباشرة مع سير العمل البرمجي من خلال نمذجة تدفقات البيانات بوضوح، وتحسين كفاءة الخوارزميات، ومعالجة الحالات الحدية بدقة.'
                  : 'I engineer mobile applications for speed, maintainability, and predictable state—applying Clean Architecture and BLoC/Cubit to decouple presentation, domain logic, and data layers. My Artificial Intelligence studies at Kafrelsheikh University integrate directly into my development workflow through structured data modeling, algorithmic optimization, and systematic edge-case testing.'}
              </p>
              <p>
                {lang === 'ar'
                  ? 'ويمثل تطبيق Revio المنشور على متجر Google Play أبرز دراسة حالة تطبيقية لهذا النهج؛ حيث جرى بناؤه بمعمارية تعمل بالكامل بدون إنترنت عبر قاعدة بيانات Hive NoSQL، مع حركات تفاعلية ثلاثية الأبعاد بمعدل 60 إطاراً في الثانية وأنظمة اختبار ذكية، ليبرهن كيف تتحول البنية البرمجية الدقيقة إلى تجربة سريعة وموثوقة للمستخدم.'
                  : 'My flagship case study is Revio, a production active-recall study app live on Google Play. Engineered on an offline-first Hive NoSQL storage layer with 60fps 3D card interactions and adaptive quiz modes, Revio proves how disciplined architecture delivers instant, zero-latency reliability in real learners’ hands.'}
              </p>
            </div>
          </div>

          {/* 3. Concise Human Mindset Touchpoints (Clean top hairline hierarchy) */}
          <StaggerGroup
            staggerDelay={0.07}
            className="mt-8 pt-6 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-5"
          >
            {humanPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <StaggerItem key={pillar.title} className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <span className="w-7 h-7 rounded-lg bg-[#0284ff]/10 text-[#0369a1] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
                      <Icon size={14} />
                    </span>
                    <span>{pillar.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {pillar.desc}
                  </p>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </RevealOnScroll>

        {/* Right: Core Engineering Skill Matrix & Academic Foundation */}
        <RevealOnScroll
          delay={0.08}
          className="card-shimmer overflow-hidden lg:col-span-5 flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] p-4 sm:p-7 shadow-sm hover:border-[#0284ff]/35 transition-colors"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3.5">
              <span className="text-xs font-mono font-bold text-[#0369a1] dark:text-[#38bdf8]">
                {lang === 'ar' ? 'مصفوفة المهارات الهندسية' : 'Core Engineering Skill Matrix'}
              </span>
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                Flutter · Clean Arch
              </span>
            </div>

            <StaggerGroup staggerDelay={0.055} className="grid grid-cols-2 gap-3">
              {[
                {
                  domain: lang === 'ar' ? 'نواة الموبايل' : 'Mobile Core',
                  items: ['Flutter', 'Dart (OOP)', 'Slivers & RTL'],
                  accent: 'text-[#0369a1] dark:text-[#38bdf8]',
                  dot: 'bg-[#0284ff] dark:bg-[#38bdf8]',
                },
                {
                  domain: lang === 'ar' ? 'الحالة والتخزين' : 'State & Offline',
                  items: ['BLoC / Cubit', 'Hive NoSQL', 'SharedPrefs'],
                  accent: 'text-emerald-600 dark:text-emerald-400',
                  dot: 'bg-emerald-500',
                },
                {
                  domain: lang === 'ar' ? 'الشبكات والبيانات' : 'APIs & Cloud',
                  items: ['Dio & Retrofit', 'REST / TMDB', 'Firebase Auth'],
                  accent: 'text-amber-600 dark:text-amber-400',
                  dot: 'bg-amber-500',
                },
                {
                  domain: lang === 'ar' ? 'الأسس والـ AI' : 'AI & CS Base',
                  items: ['Clean Arch', 'Python & C++', 'Design Patterns'],
                  accent: 'text-violet-600 dark:text-violet-400',
                  dot: 'bg-violet-500',
                },
              ].map((group) => (
                <StaggerItem key={group.domain} className="flex">
                  <div className="skill-shimmer-card w-full p-3.5 rounded-xl bg-slate-50/90 dark:bg-[#161b27]/75 border border-slate-200/80 dark:border-white/10 hover:border-[#0284ff]/35 transition-colors">
                    <div className={`flex items-center gap-1.5 text-[11px] font-mono font-bold mb-1.5 ${group.accent}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${group.dot}`} aria-hidden="true" />
                      <span className="truncate">{group.domain}</span>
                    </div>
                    <ul className="space-y-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                      {group.items.map((item) => (
                        <li key={item} className="truncate">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>

          {/* Academic Foundation Strip */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0284ff]/10 text-[#0369a1] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
                <GraduationCap size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {AHMED_CONFIG.education.degree[lang]}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {AHMED_CONFIG.education.faculty[lang]} — {AHMED_CONFIG.education.university[lang]}
                </div>
                <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1 tabular-nums">
                  {EDUCATION_DATA.period}
                </div>
              </div>
            </div>

            {onExploreExperience && (
              <button
                type="button"
                onClick={onExploreExperience}
                className="btn-kinetic w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#161b27] hover:border-[#0284ff] hover:text-[#0369a1] dark:hover:text-[#38bdf8] text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer whitespace-nowrap transition-colors"
              >
                <span>{lang === 'ar' ? 'المسار الأكاديمي والشهادات' : 'Full Timeline & Certs'}</span>
                <ArrowRight size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
              </button>
            )}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};
