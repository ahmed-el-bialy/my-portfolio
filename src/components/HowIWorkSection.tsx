import React from 'react';
import { ArrowRight, Compass, Layers, Cpu, Rocket } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import { TiltCard } from './MotionPrimitives';
import { useLanguage } from '../context/LanguageContext';

interface HowIWorkSectionProps {
  onOpenBooking?: () => void;
  onExploreProjects?: () => void;
}

export const HowIWorkSection: React.FC<HowIWorkSectionProps> = ({
  onOpenBooking,
  onExploreProjects,
}) => {
  const { lang, dir } = useLanguage();

  const steps = lang === 'ar'
    ? [
        {
          num: '01',
          icon: Compass,
          title: 'الاستكشاف وتحديد النطاق',
          desc: 'تحليل المتطلبات وتحديد الميزات الأساسية وتخطيط تجربة المستخدم ومسارات البيانات قبل كتابة أي سطر برمجي.',
          outcome: 'خريطة شاشات ونطاق عمل واضح',
        },
        {
          num: '02',
          icon: Layers,
          title: 'معمارية Clean Architecture',
          desc: 'تأسيس الطبقات (Presentation · Domain · Data) بمبادئ SOLID لضمان كود قابل للاختبار والتوسع بسلاسة.',
          outcome: 'هيكل برمجي معزول وسهل الصيانة',
        },
        {
          num: '03',
          icon: Cpu,
          title: 'إدارة الحالة والربط والتخزين',
          desc: 'تنفيذ BLoC / Cubit مع ربط الـ REST APIs عبر Dio أو Firebase والتخزين المحلي بدون إنترنت عبر Hive.',
          outcome: 'أداء سريع وتدفق بيانات مستقر',
        },
        {
          num: '04',
          icon: Rocket,
          title: 'الفحص والإطلاق الرسمي',
          desc: 'اختبار الاستجابة والتوافق على مختلف الشاشات وتجهيز حزم AAB وملفات APK والنشر الكامل على Google Play.',
          outcome: 'تطبيق جاهز للمستخدمين الفعليين',
        },
      ]
    : [
        {
          num: '01',
          icon: Compass,
          title: 'Discovery & Product Scope',
          desc: 'Aligning on core user flows, API contracts, and MVP boundaries before engineering begins.',
          outcome: 'Clear architecture blueprint',
        },
        {
          num: '02',
          icon: Layers,
          title: 'Clean Architecture Setup',
          desc: 'Separating Presentation, Domain, and Data layers under SOLID principles for long-term maintainability.',
          outcome: 'Modular, testable codebase',
        },
        {
          num: '03',
          icon: Cpu,
          title: 'State, APIs & Offline Sync',
          desc: 'Implementing predictable BLoC/Cubit state streams, resilient Dio networking, and fast Hive local persistence.',
          outcome: 'Smooth, responsive offline-first UX',
        },
        {
          num: '04',
          icon: Rocket,
          title: 'QA & Store Release',
          desc: 'Verifying device ergonomics, preparing signed APK/AAB builds, and shipping production releases to Google Play.',
          outcome: 'Production-ready delivery',
        },
      ];

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-slate-200/80 dark:border-white/8 w-full">
      <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-cyan-400 mb-2">
            <span>{lang === 'ar' ? 'منهجية العمل الهندسي' : 'Engineering Process'}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 dark:text-slate-400">
              {lang === 'ar' ? 'من الفكرة إلى المتجر' : 'Concept to Play Store'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight [text-wrap:balance]">
            {lang === 'ar' ? 'كيف أُنفّذ مشاريع تطبيقات الموبايل' : 'How I Build Production Flutter Apps'}
          </h2>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onExploreProjects && (
            <button
              type="button"
              onClick={onExploreProjects}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap btn-kinetic"
            >
              {lang === 'ar' ? 'استكشاف كل التطبيقات' : 'View All Projects'}
            </button>
          )}
          {onOpenBooking && (
            <button
              type="button"
              onClick={onOpenBooking}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm btn-kinetic"
            >
              <span>{lang === 'ar' ? 'احجز مكالمة استكشافية' : 'Book a Discovery Call'}</span>
              <ArrowRight size={13} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
          )}
        </div>
      </RevealOnScroll>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          return (
            <RevealOnScroll key={step.num} delay={idx * 0.06} className="h-full">
              <TiltCard
                maxTilt={6}
                className="h-full p-5 rounded-2xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 flex flex-col justify-between transition-colors duration-200 hover:border-[#027DFD]/40"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono tabular-nums text-xs font-bold text-blue-600 dark:text-cyan-400">
                      {step.num}.
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-cyan-300 flex items-center justify-center">
                      <StepIcon size={16} />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/8 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {step.outcome}
                </div>
              </TiltCard>
            </RevealOnScroll>
          );
        })}
      </div>
    </section>
  );
};
