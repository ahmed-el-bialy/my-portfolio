import React, { useState } from 'react';
import {
  ArrowRight,
  Compass,
  Layers,
  Cpu,
  Rocket,
  Database,
  Sparkles,
  Languages,
  ShieldCheck,
} from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
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
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);

  const steps =
    lang === 'ar'
      ? [
          {
            num: '01',
            icon: Compass,
            title: 'الاستكشاف وتحديد النطاق',
            desc: 'تحليل مسارات المستخدم، عقود الـ API، وأولويات الـ MVP قبل كتابة أي سطر برمجي.',
            deliverable: 'خريطة شاشات ومخطط تدفق البيانات',
            proofApp: 'Movura & Revio',
          },
          {
            num: '02',
            icon: Layers,
            title: 'معمارية Clean Architecture',
            desc: 'عزل طبقات Presentation و Domain و Data بمبادئ SOLID لبناء كود مرن وقابل للاختبار.',
            deliverable: 'هيكل معماري معياري سهل التوسع',
            proofApp: 'SkyCast & NewsCloud',
          },
          {
            num: '03',
            icon: Cpu,
            title: 'إدارة الحالة والعمل أوفلاين',
            desc: 'تنفيذ BLoC / Cubit مع ربط شبكي موثوق عبر Dio وتخزين محلي فوري عبر Hive.',
            deliverable: 'استجابة 60 إطار/ثانية بدون اعتماد على الإنترنت',
            proofApp: 'Revio & FluxStore',
          },
          {
            num: '04',
            icon: Rocket,
            title: 'الفحص والإطلاق على المتجر',
            desc: 'اختبار التوافق على أحجام الشاشات، توقيع حزم AAB/APK، والنشر الرسمي على Google Play.',
            deliverable: 'تطبيق إنتاجي جاهز للمستخدمين',
            proofApp: 'Revio على Google Play',
          },
        ]
      : [
          {
            num: '01',
            icon: Compass,
            title: 'Discovery & Product Scope',
            desc: 'Aligning on core user flows, API contracts, and MVP boundaries before writing code.',
            deliverable: 'Screen flows & clear architecture blueprint',
            proofApp: 'Movura & Revio',
          },
          {
            num: '02',
            icon: Layers,
            title: 'Clean Architecture Layers',
            desc: 'Isolating Presentation, Domain, and Data layers under SOLID principles for long-term scale.',
            deliverable: 'Modular, testable Dart codebase',
            proofApp: 'SkyCast & NewsCloud',
          },
          {
            num: '03',
            icon: Cpu,
            title: 'BLoC State & Offline Sync',
            desc: 'Building predictable BLoC/Cubit streams paired with Dio networking and zero-latency Hive storage.',
            deliverable: 'Smooth 60fps offline-first UX',
            proofApp: 'Revio & FluxStore',
          },
          {
            num: '04',
            icon: Rocket,
            title: 'QA & Google Play Release',
            desc: 'Verifying device responsiveness, preparing signed APK/AAB builds, and shipping to production.',
            deliverable: 'Store-verified production release',
            proofApp: 'Revio on Google Play',
          },
        ];

  const coreFeatures =
    lang === 'ar'
      ? [
          {
            id: 'offline-hive',
            icon: Database,
            title: 'عمل كامل بدون إنترنت (Offline-First)',
            meta: 'Hive NoSQL · استجابة فورية',
            desc: 'حفظ مجموعات الدراسة والبيانات محلياً بسرعة عالية مع مزامنة ذكية دون انتظار الشبكة.',
            proof: 'مطبّق في Revio',
          },
          {
            id: 'reactive-bloc',
            icon: ShieldCheck,
            title: 'حالة مستقرة ومعمارية نظيفة',
            meta: 'BLoC / Cubit · Clean Arch',
            desc: 'فصل واضح بين الواجهة ومنطق الأعمال يقلل الأخطاء ويسرّع إضافة الميزات الجديدة.',
            proof: 'مطبّق في SkyCast و Movura',
          },
          {
            id: 'fluid-motion',
            icon: Sparkles,
            title: 'حركة سلسة بسرعة 60 إطار/ثانية',
            meta: 'تفاعلات GPU · أنيميشن 3D',
            desc: 'بطاقات تفاعلية ثلاثية الأبعاد وانتقالات طبيعية خالية من التقطيع على أندرويد وiOS.',
            proof: 'مطبّق في Revio و FluxStore',
          },
          {
            id: 'rtl-bilingual',
            icon: Languages,
            title: 'دعم أصيل للعربية RTL والثنائية',
            meta: 'RTL · ثيم داكن وفاتح',
            desc: 'تصميم يراعي اتجاه القراءة العربي والإنجليزي مع تباين مريح وتوافق كامل مع الشاشات.',
            proof: 'مطبّق في NewsCloud',
          },
        ]
      : [
          {
            id: 'offline-hive',
            icon: Database,
            title: 'Offline-First Speed & Persistence',
            meta: 'Hive NoSQL · Zero Latency',
            desc: 'Instant local reads/writes so decks, quizzes, and saved items work smoothly anywhere.',
            proof: 'Shipped in Revio',
          },
          {
            id: 'reactive-bloc',
            icon: ShieldCheck,
            title: 'Clean Architecture & BLoC Purity',
            meta: 'Presentation · Domain · Data',
            desc: 'Decoupled reactive state streams that keep UI fast, predictable, and effortless to extend.',
            proof: 'Shipped in SkyCast & Movura',
          },
          {
            id: 'fluid-motion',
            icon: Sparkles,
            title: 'Native 60fps UI & 3D Interactions',
            meta: 'GPU Composited · Responsive',
            desc: 'Tactile 3D flip cards, custom slivers, and adaptive views tuned for Android and iOS.',
            proof: 'Shipped in Revio & FluxStore',
          },
          {
            id: 'rtl-bilingual',
            icon: Languages,
            title: 'Bilingual Arabic RTL & Theme Polish',
            meta: 'AR RTL / EN LTR · Dark & Light',
            desc: 'True directional mirroring, crisp typography pairing, and accessible high-contrast palettes.',
            proof: 'Shipped in NewsCloud',
          },
        ];

  const activeStep = steps[activeStepIdx] || steps[0];

  return (
    <section
      id="features"
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-slate-200/80 dark:border-white/8 w-full"
    >
      {/* Unified Header */}
      <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8] mb-2">
            <span>
              {lang === 'ar'
                ? 'منهجية الهندسة ومميزات التطبيقات'
                : 'Engineering Process & App Features'}
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span className="text-slate-600 dark:text-slate-400 font-sans font-medium">
              {lang === 'ar' ? 'من الفكرة إلى Google Play' : 'Architecture to Play Store'}
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight [text-wrap:balance]">
            {lang === 'ar'
              ? 'كيف أبني تطبيقات فلاتر — وما يميز كل إصدار'
              : 'How I Build Production Apps & What Ships in Every Build'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onExploreProjects && (
            <button
              type="button"
              onClick={onExploreProjects}
              className="btn-kinetic px-4 py-2.5 min-h-[44px] sm:min-h-[40px] rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0f1117] hover:border-[#0284ff]/50 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              {lang === 'ar' ? 'استعراض التطبيقات' : 'Explore Applications'}
            </button>
          )}
          {onOpenBooking && (
            <button
              type="button"
              onClick={onOpenBooking}
              className="btn-kinetic px-4 py-2.5 min-h-[44px] sm:min-h-[40px] rounded-xl bg-[#0284ff] hover:bg-[#0070e0] text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm shadow-[#0284ff]/25"
            >
              <span>{lang === 'ar' ? 'احجز مكالمة مشروع' : 'Book a Discovery Call'}</span>
              <ArrowRight size={13} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
          )}
        </div>
      </RevealOnScroll>

      {/* Part 1: Interactive 4-Stage Engineering Process Rail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isSelected = activeStepIdx === idx;
          return (
            <RevealOnScroll key={step.num} delay={idx * 0.04} className="h-full">
              <button
                type="button"
                onClick={() => setActiveStepIdx(idx)}
                onMouseEnter={() => setActiveStepIdx(idx)}
                className={`surface-card card-shimmer w-full h-full p-5 rounded-2xl flex flex-col justify-between text-start cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] ${
                  isSelected
                    ? 'border-[#0284ff]/55 dark:border-[#38bdf8]/45 shadow-md ring-1 ring-[#0284ff]/15'
                    : 'shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`font-mono tabular-nums text-xs font-bold ${
                        isSelected
                          ? 'text-[#0284ff] dark:text-[#38bdf8]'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {step.num}.
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#0284ff] text-white border-[#0284ff]'
                          : 'bg-[#0284ff]/10 border-[#0284ff]/20 text-[#0369a1] dark:text-[#38bdf8]'
                      }`}
                    >
                      <StepIcon size={16} />
                    </div>
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/8 flex items-center justify-between gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  <span className="truncate">{step.deliverable}</span>
                </div>
              </button>
            </RevealOnScroll>
          );
        })}
      </div>

      {/* Contextual Active Step Proof Bar */}
      <div className="mt-4 px-4 sm:px-5 py-3 rounded-xl border border-slate-200/90 dark:border-white/8 bg-white/70 dark:bg-[#0f1117]/75 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-700 dark:text-slate-300">
          <span className="font-mono font-bold text-[#0369a1] dark:text-[#38bdf8] tabular-nums">
            {activeStep.num}.
          </span>
          <span className="font-bold text-slate-900 dark:text-white">{activeStep.title}</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
            ·
          </span>
          <span>{activeStep.deliverable}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
          <span>{lang === 'ar' ? 'إثبات تطبيقي:' : 'Proven in:'}</span>
          <span className="font-bold text-slate-900 dark:text-white">{activeStep.proofApp}</span>
        </div>
      </div>

      {/* Part 2: Unified Core Application Features Grid */}
      <div className="mt-8 sm:mt-10 pt-8 sm:pt-10 border-t border-slate-200/80 dark:border-white/8">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5 sm:mb-6">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8]">
            <span>{lang === 'ar' ? 'مميزات ومعايير جودة التطبيقات' : 'Core App Capabilities'}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span className="text-slate-600 dark:text-slate-400 font-sans font-medium">
              {lang === 'ar' ? 'مبنية في كل مشروع حقيقي' : 'Built into every release'}
            </span>
          </div>
          {onExploreProjects && (
            <button
              type="button"
              onClick={onExploreProjects}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0369a1] dark:text-[#38bdf8] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
            >
              <span>{lang === 'ar' ? 'شاهدها في المشاريع' : 'See in live projects'}</span>
              <ArrowRight size={12} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {coreFeatures.map((feat, idx) => {
            const FeatIcon = feat.icon;
            return (
              <RevealOnScroll key={feat.id} delay={idx * 0.04} className="h-full">
                <article className="surface-card card-shimmer h-full p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-[#0369a1] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
                        <FeatIcon size={16} />
                      </div>
                      <span className="font-mono text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                        {feat.proof}
                      </span>
                    </div>

                    <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-white leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/8 text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {feat.meta}
                  </div>
                </article>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
};
