import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { GraduationCap, Globe, Sparkles, ArrowRight, Compass, HeartHandshake, Lightbulb } from 'lucide-react';
import { AHMED_CONFIG } from '../data/config';
import { LANGUAGES_DATA, EDUCATION_DATA, AHMED_PROFILE } from '../data/portfolioData';
import { BrandLogoMark } from './BrandLogoMark';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import { RevealOnScroll } from './RevealOnScroll';
import { FloatingPortrait, TiltCard } from './MotionPrimitives';
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
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-slate-200/80 dark:border-white/8 w-full"
    >
      {/* Clear Section Title Header */}
      <RevealOnScroll className="mb-7 sm:mb-9">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#027DFD] dark:text-[#00C7FF] mb-1.5">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Floating 3D Portrait + Balanced Leaf Emblem + Languages */}
        <RevealOnScroll
          delay={0}
          className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] p-6 sm:p-7"
        >
          <div className="flex flex-col items-center text-center pt-1">
            <FloatingPortrait>
              <button
                type="button"
                onClick={handleAvatarEasterEgg}
                className="group relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden p-[3px] bg-gradient-to-br from-[#027DFD] via-[#00C7FF] to-emerald-400 shadow-xl shadow-[#027DFD]/25 ring-1 ring-[#00C7FF]/35 transition-transform duration-300 hover:scale-[1.03] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C7FF]"
                aria-label={
                  lang === 'ar'
                    ? 'صورة أحمد البيلي (انقر 5 مرات للمفاجأة)'
                    : 'Ahmed El-Bialy portrait (tap 5 times for a surprise)'
                }
              >
                <span className="block w-full h-full rounded-[13px] overflow-hidden bg-slate-950 ring-1 ring-black/40">
                  <ImageWithSkeleton
                    src={AHMED_PROFILE.avatarUrl}
                    alt={AHMED_CONFIG.name[lang]}
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                </span>
              </button>
            </FloatingPortrait>

            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-5 inline-flex items-center justify-center gap-3">
              <BrandLogoMark
                sizeClassName="w-10 h-10 sm:w-11 sm:h-11"
                alt="Ahmed El-Bialy Logo Emblem"
              />
              <span>{AHMED_CONFIG.name[lang]}</span>
            </h3>
            <p className="text-xs font-mono text-[#027DFD] dark:text-[#00C7FF] mt-1.5">
              {AHMED_CONFIG.location[lang]}
            </p>

            {eggTriggered ? (
              <p className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                <Sparkles size={13} />
                <span>
                  {lang === 'ar'
                    ? 'أهلاً بك! سعيد جداً بتواجدك هنا'
                    : 'Welcome in! Thanks for taking a closer look.'}
                </span>
              </p>
            ) : tapCount > 1 ? (
              <p className="mt-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {5 - tapCount} {lang === 'ar' ? 'نقرات متبقية...' : 'more taps...'}
              </p>
            ) : null}
          </div>

          {/* Spoken Languages */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/8 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <Globe size={14} className="text-[#027DFD] dark:text-[#00C7FF]" />
              <span>{lang === 'ar' ? 'اللغات' : 'Languages'}</span>
            </div>
            <div className="space-y-2">
              {LANGUAGES_DATA.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {item.flag} {item.nativeName}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {item.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>

        {/* Right: Human Story, Mindset, Why I Build Products + Academic Foundation */}
        <RevealOnScroll
          delay={0.08}
          className="lg:col-span-8 flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] p-6 sm:p-8"
        >
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight [text-wrap:balance]">
              {lang === 'ar'
                ? 'من شغف الفضول في المنصورة — إلى بناء تطبيقات تسهل حياة الناس بهدوء وإتقان.'
                : 'Growing up curious in El Mansoura — building calm products that solve real everyday problems.'}
            </h3>

            <div className="mt-4 space-y-3.5 text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              <p>
                {lang === 'ar'
                  ? 'منذ بداياتي في المنصورة، لم يكن اهتمامي بالبرمجة مجرد كتابة أوامر على شاشة؛ كان الفضول دائماً يدفعني لأفهم كيف تتحول فكرة بسيطة إلى أداة في جيب شخص ما تساعده في يومه. وخلال دراستي في كلية الذكاء الاصطناعي بجامعة كفر الشيخ، تعلّمت أن أي مشكلة معقدة يمكن تفكيكها بهدوء للوصول لحل عملي ومباشر.'
                  : 'Growing up in El Mansoura, my fascination with software never started with syntax—it started with wondering how everyday ideas become calm tools sitting in someone’s pocket. Studying Artificial Intelligence at Kafrelsheikh University sharpened how I break complex problems down into thoughtful, approachable solutions.'}
              </p>
              <p>
                {lang === 'ar'
                  ? 'أبني التطبيقات لأني أحب صناعة أشياء تُستخدم فعلاً: مثل مساعدة طالب على المذاكرة بدون تشتيت أو إنترنت، أو جعل تجربة يومية أكثر سلاسة ومتعة. وخارج أوقات التطوير، أستمتع بالقراءة، استكشاف تعلم اليابانية، الموسيقى، ولعب كرة السلة—وهي هوايات تُغذي أفكار المشاريع التي أطلقها.'
                  : 'I build products because I care about usefulness over noise: helping a student retain what they study without distractions, making daily check-ins clearer, or turning a small idea into something genuinely enjoyable to tap through. Outside coding, I recharge with reading, beginner Japanese study, music, and basketball—habits that quietly inspire what I create next.'}
              </p>
            </div>

            {/* 3 Concise Human Mindset Touchpoints with Subtle 3D Tilt */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {humanPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <TiltCard
                    key={pillar.title}
                    maxTilt={5}
                    glareOpacity={0.08}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161b27]/80 border border-slate-200/80 dark:border-white/8 hover:border-[#027DFD]/35 transition-colors"
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
          </div>

          {/* Academic Foundation Strip */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                className="btn-kinetic inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#161b27] hover:border-[#027DFD] text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer whitespace-nowrap self-start sm:self-center"
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
