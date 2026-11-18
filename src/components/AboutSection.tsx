import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { GraduationCap, Globe, Sparkles, ArrowRight, Compass, HeartHandshake, Lightbulb } from 'lucide-react';
import { AHMED_CONFIG } from '../data/config';
import { LANGUAGES_DATA, EDUCATION_DATA, AHMED_PROFILE } from '../data/portfolioData';
import { BrandLogoMark } from './BrandLogoMark';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import { RevealOnScroll } from './RevealOnScroll';
import { TiltCard } from './MotionPrimitives';
import { useLanguage } from '../context/LanguageContext';

interface AboutSectionProps {
  onExploreExperience?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onExploreExperience }) => {
  const { lang, dir } = useLanguage();
  const [tapCount, setTapCount] = useState(0);
  const [eggTriggered, setEggTriggered] = useState(false);

  const handleAvatarEasterEgg = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) {
      setTapCount(0);
      setEggTriggered(true);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#027DFD', '#00C7FF', '#10B981'],
      });
      setTimeout(() => setEggTriggered(false), 3500);
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
      id="about"
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 border-t border-slate-200/80 dark:border-white/8 w-full"
    >
      {/* Clear Section Title Header */}
      <RevealOnScroll className="mb-5 sm:mb-8">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#027DFD] dark:text-[#00C7FF] mb-1">
          <span>{lang === 'ar' ? 'نبذة عني' : 'About Me'}</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-slate-500 dark:text-slate-400">
            {lang === 'ar' ? 'الإنسان خلف التطبيقات' : 'The Person Behind the Products'}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {lang === 'ar' ? 'من أنا وكيف أفكر' : 'Who I Am & How I Build'}
        </h2>
      </RevealOnScroll>

      {/* Redesigned Compact Full-Width Profile Strip — Zero Dead Vertical Whitespace */}
      <RevealOnScroll
        delay={0}
        className="mb-4 sm:mb-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] p-4 sm:p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 lg:gap-7 items-center">
          {/* 1. CSS-Floating Headshot + Side-by-Side Brand Logo & Display Name */}
          <div className="lg:col-span-5 flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="animate-float-gentle shrink-0">
              <button
                type="button"
                onClick={handleAvatarEasterEgg}
                className="group relative w-[72px] h-[72px] sm:w-24 sm:h-24 rounded-2xl overflow-hidden p-[2.5px] bg-gradient-to-br from-[#027DFD] via-[#00C7FF] to-emerald-400 shadow-lg shadow-[#027DFD]/20 ring-1 ring-[#00C7FF]/30 transition-transform duration-300 hover:scale-[1.04] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C7FF]"
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
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <BrandLogoMark
                  floatEffect={true}
                  floatMode="sway"
                  sizeClassName="w-7 h-7 sm:w-9 sm:h-9"
                  alt="Ahmed El-Bialy Personal Brand Logo"
                />
                <h3 className="font-display text-[17.5px] sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {AHMED_CONFIG.name[lang]}
                </h3>
              </div>
              <p className="font-display text-[13px] sm:text-[15px] font-bold text-[#027DFD] dark:text-[#00C7FF] leading-snug">
                {AHMED_CONFIG.title[lang]}
              </p>
              <p className="text-[11.5px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                {AHMED_CONFIG.location[lang]}
              </p>
            </div>
          </div>

          {/* 2. Personal Mission / Interactive Surprise Readout */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-s border-slate-200/80 dark:border-white/8 pt-3 lg:pt-0 lg:ps-6">
            {eggTriggered ? (
              <p className="text-xs sm:text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <Sparkles size={14} />
                <span>
                  {lang === 'ar'
                    ? 'أهلاً بك! سعيد جداً بتواجدك هنا'
                    : 'Welcome in! Thanks for taking a closer look.'}
                </span>
              </p>
            ) : tapCount > 1 ? (
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {5 - tapCount} {lang === 'ar' ? 'نقرات متبقية للمفاجأة...' : 'more taps for surprise...'}
              </p>
            ) : (
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === 'ar'
                  ? 'أجمع بين هندسة تطبيقات الموبايل عالية الاعتمادية وتجارب الذكاء الاصطناعي التفاعلية لتقديم منتجات هادئة وعملية.'
                  : 'Blending reliable mobile engineering with thoughtful AI-powered user experiences designed for everyday clarity.'}
              </p>
            )}
          </div>

          {/* 3. Compact Spoken Languages Matrix (3-col tight row on mobile, clean stack on desktop) */}
          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-s border-slate-200/80 dark:border-white/8 pt-3 lg:pt-0 lg:ps-6 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <Globe size={13} className="text-[#027DFD] dark:text-[#00C7FF]" />
              <span>{lang === 'ar' ? 'اللغات' : 'Languages'}</span>
            </div>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 lg:gap-1.5">
              {LANGUAGES_DATA.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-0.5 lg:gap-2 text-xs text-slate-600 dark:text-slate-300"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate text-[11.5px] sm:text-xs">
                    {item.flag} {item.nativeName}
                  </span>
                  <span className="font-mono text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                    {item.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealOnScroll>

      {/* Balanced 2-Column Narrative & Skill Matrix Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        {/* Left: Airy Story & 3 Human Mindset Pillars */}
        <RevealOnScroll
          delay={0.05}
          className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] p-4 sm:p-7"
        >
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight [text-wrap:balance]">
              {lang === 'ar'
                ? 'من شغف الفضول في المنصورة — إلى بناء تطبيقات تسهل حياة الناس بهدوء وإتقان.'
                : 'Growing up curious in El Mansoura — building calm products that solve real everyday problems.'}
            </h3>

            <div className="mt-4 space-y-3.5 text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                {lang === 'ar'
                  ? 'منذ بداياتي في المنصورة، لم يكن اهتمامي بالبرمجة مجرد كتابة أوامر على شاشة؛ كان الفضول دائماً يدفعني لأفهم كيف تتحول فكرة بسيطة إلى أداة في جيب شخص ما تساعده في يومه. وخلال دراستي في كلية الذكاء الاصطناعي بجامعة كفر الشيخ، تعلّمت أن أي مشكلة معقدة يمكن تفكيكها بهدوء للوصول لحل عملي ومباشر.'
                  : 'Growing up in El Mansoura, my fascination with software never started with syntax—it started with wondering how everyday ideas become calm tools sitting in someone’s pocket. Studying Artificial Intelligence at Kafrelsheikh University sharpened how I break complex problems down into thoughtful, approachable solutions.'}
              </p>
              <p>
                {lang === 'ar'
                  ? 'أبني التطبيقات لأني أحب صناعة أشياء تُستخدم فعلاً: مثل مساعدة طالب على المذاكرة بدون تشتيت أو إنترنت، أو جعل تجربة يومية أكثر سلاسة ومتعة. وخارج أوقات التطوير، أستمتع بالقراءة، استكشاف تعلم اليابانية، الموسيقى، ولعب كرة السلة—وهي هوايات تُغذي أفكار المشاريع التي أطلقها.'
                  : 'I build products because I care about usefulness over noise: helping a student retain what they study without distractions, making daily check-ins clearer, or turning a small idea into something genuinely enjoyable to tap through. Outside coding, I recharge with reading, beginner Japanese study, music, and basketball.'}
              </p>
            </div>
          </div>

          {/* 3 Concise Human Mindset Touchpoints */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {humanPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <TiltCard
                  key={pillar.title}
                  maxTilt={5}
                  glareOpacity={0.1}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161b27]/85 border border-slate-200/80 dark:border-white/10 hover:border-[#027DFD]/40 transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
                    <Icon size={14} className="text-[#027DFD] dark:text-[#00C7FF] shrink-0" />
                    <span>{pillar.title}</span>
                  </div>
                  <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {pillar.desc}
                  </p>
                </TiltCard>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* Right: Core Engineering Skill Matrix & Academic Foundation */}
        <RevealOnScroll
          delay={0.1}
          className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] p-4 sm:p-7"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3.5">
              <span className="text-xs font-mono font-bold text-[#027DFD] dark:text-[#00C7FF] uppercase tracking-wider">
                {lang === 'ar' ? 'مصفوفة المهارات الهندسية' : 'Core Engineering Skill Matrix'}
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Flutter · Clean Arch
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  domain: lang === 'ar' ? 'نواة الموبايل' : 'Mobile Core',
                  items: ['Flutter', 'Dart (OOP)', 'Slivers & RTL'],
                  accent: 'text-[#027DFD] dark:text-[#00C7FF]',
                },
                {
                  domain: lang === 'ar' ? 'الحالة والتخزين' : 'State & Offline',
                  items: ['BLoC / Cubit', 'Hive NoSQL', 'SharedPrefs'],
                  accent: 'text-emerald-600 dark:text-emerald-400',
                },
                {
                  domain: lang === 'ar' ? 'الشبكات والبيانات' : 'APIs & Cloud',
                  items: ['Dio & Retrofit', 'REST / TMDB', 'Firebase Auth'],
                  accent: 'text-amber-600 dark:text-amber-400',
                },
                {
                  domain: lang === 'ar' ? 'الأسس والـ AI' : 'AI & CS Base',
                  items: ['Clean Arch', 'Python & C++', 'Design Patterns'],
                  accent: 'text-violet-600 dark:text-violet-400',
                },
              ].map((group) => (
                <div
                  key={group.domain}
                  className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-[#161b27]/75 border border-slate-200/80 dark:border-white/10 hover:border-[#027DFD]/30 transition-colors"
                >
                  <div className={`text-[11px] font-mono font-bold mb-1.5 ${group.accent}`}>
                    {group.domain}
                  </div>
                  <ul className="space-y-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                    {group.items.map((item) => (
                      <li key={item} className="truncate">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Foundation Strip */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#027DFD]/10 text-[#027DFD] dark:text-[#00C7FF] flex items-center justify-center shrink-0">
                <GraduationCap size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {AHMED_CONFIG.education.degree[lang]}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {AHMED_CONFIG.education.faculty[lang]} — {AHMED_CONFIG.education.university[lang]}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                  {EDUCATION_DATA.period}
                </div>
              </div>
            </div>

            {onExploreExperience && (
              <button
                type="button"
                onClick={onExploreExperience}
                className="btn-kinetic w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#161b27] hover:border-[#027DFD] text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer whitespace-nowrap"
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
