import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { GraduationCap, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { AHMED_CONFIG } from '../data/config';
import { LANGUAGES_DATA, EDUCATION_DATA, AHMED_PROFILE } from '../data/portfolioData';
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

  return (
    <section
      id="about"
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-slate-200/80 dark:border-white/8 w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Portrait + Subtle Interactive 5x Tap Easter Egg */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] p-6">
          <div className="flex flex-col items-center text-center">
            <button
              type="button"
              onClick={handleAvatarEasterEgg}
              className="group relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-2 border-[#027DFD]/40 p-1 bg-gradient-to-br from-[#027DFD]/30 to-[#00C7FF]/20 transition-transform duration-300 hover:rotate-2 hover:scale-[1.02] cursor-pointer focus-visible:outline-none"
              aria-label={
                lang === 'ar'
                  ? 'صورة أحمد البيلي (انقر 5 مرات للمفاجأة)'
                  : 'Ahmed El-Bialy portrait (tap 5 times for a surprise)'
              }
            >
              <img
                src={AHMED_PROFILE.avatarUrl}
                alt={AHMED_CONFIG.name[lang]}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[20px]"
              />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-4">
              {AHMED_CONFIG.name[lang]}
            </h3>
            <p className="text-xs font-mono text-[#027DFD] dark:text-[#00C7FF] mt-0.5">
              {AHMED_CONFIG.location[lang]}
            </p>

            {eggTriggered ? (
              <p className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                <Sparkles size={13} />
                <span>
                  {lang === 'ar' ? 'أهلاً بك! شكراً لاستكشاف البورتفوليو' : 'Thanks for exploring! Flutter 60 FPS craft unlocked.'}
                </span>
              </p>
            ) : tapCount > 1 ? (
              <p className="mt-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {5 - tapCount} {lang === 'ar' ? 'نقرات متبقية...' : 'more taps...'}
              </p>
            ) : null}
          </div>

          {/* Languages Spoken */}
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
        </div>

        {/* Right: Authentic Narrative & Kafrelsheikh AI Education Card */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] p-6 sm:p-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#027DFD] dark:text-[#00C7FF] mb-2">
              <span>{lang === 'ar' ? 'نبذة عني' : 'About Ahmed'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 dark:text-slate-400">
                {lang === 'ar' ? 'خلفية هندسية وأكاديمية موثقة' : 'Verified Engineering & Academic Path'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight [text-wrap:balance]">
              {lang === 'ar'
                ? 'شغف بهندسة الموبايل، مدعوم بدراسة الذكاء الاصطناعي.'
                : 'Craft-driven Flutter engineer pursuing Artificial Intelligence.'}
            </h2>

            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              <p>
                {lang === 'ar'
                  ? 'أدرس بكالوريوس الذكاء الاصطناعي في جامعة كفر الشيخ (2023 – 2027)، وأُطوّر بشكل مستقل تطبيقات موبايل كاملة بـ Flutter و Dart وفق معمارية Clean Architecture وإدارة الحالة عبر BLoC و Cubit.'
                  : AHMED_PROFILE.bio}
              </p>
              <p>
                {lang === 'ar'
                  ? 'أطلقتُ رسمياً تطبيق Revio للبطاقات التعليمية على متجر Google Play بتخزين محلي سريع بدون إنترنت عبر Hive CE، بالإضافة إلى تنفيذ تطبيقات متكاملة للطقس والأخبار والأفلام والمتاجر الإلكترونية.'
                  : 'Shipped Revio live on Google Play as a fast offline-first active recall app backed by Hive CE, alongside RESTful media discovery, e-commerce, news RTL, and real-time Firebase Firestore chat applications.'}
              </p>
            </div>
          </div>

          {/* Academic Foundation Card */}
          <div className="mt-6 pt-6 border-t border-slate-200/80 dark:border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#161b27] hover:border-[#027DFD] text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-center"
              >
                <span>{lang === 'ar' ? 'الخبرات والشهادات' : 'Full Timeline & Certs'}</span>
                <ArrowRight size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
