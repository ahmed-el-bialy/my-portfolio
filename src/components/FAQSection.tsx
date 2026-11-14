import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RevealOnScroll } from './RevealOnScroll';

export const FAQSection: React.FC = () => {
  const { lang } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q:
        lang === 'ar'
          ? 'ما هي التخصصات التقنية الأساسية لأحمد البيلي؟'
          : 'What are Ahmed El-Bialy’s core technical specializations?',
      a:
        lang === 'ar'
          ? 'متخصص في تطوير تطبيقات الموبايل باستخدام Flutter و Dart، مع خبرة عملية في Clean Architecture، وإدارة الحالة عبر Cubit و BLoC، والتخزين المحلي بدون إنترنت (Hive CE)، إلى جانب الدراسة الأكاديمية في الذكاء الاصطناعي.'
          : 'Specializing in Flutter & Dart mobile engineering with Clean Architecture, BLoC & Cubit state management, offline-first NoSQL persistence (Hive CE), and Artificial Intelligence studies.',
    },
    {
      q:
        lang === 'ar'
          ? 'هل التطبيقات منشورة رسمياً على متجر Google Play؟'
          : 'Are any applications officially published on Google Play?',
      a:
        lang === 'ar'
          ? 'نعم، تطبيق Revio منشور رسمياً على متجر Google Play بتقييم 5.0 نجوم ويعمل بالكامل بدون إنترنت بأداء 60 FPS.'
          : 'Yes. Revio is live on the Google Play Store with a 5.0 rating, engineered for smooth 60 FPS interactions and complete offline-first functionality.',
    },
    {
      q:
        lang === 'ar'
          ? 'ما هي الخدمات المتاحة للشركات وأصحاب المشاريع؟'
          : 'What mobile development services do you offer?',
      a:
        lang === 'ar'
          ? 'بناء تطبيقات MVP من الصفر، ربط الـ REST APIs عبر Dio/Retrofit، تكامل Firebase (Auth & Firestore)، تجهيز والنشر الكامل على Google Play، وتحسين الأداء وصيانة الأكواد.'
          : 'End-to-end Flutter MVP builds, REST API integrations via Dio/Retrofit, Firebase backend integration, Google Play AAB release publishing, and codebase refactoring.',
    },
    {
      q:
        lang === 'ar'
          ? 'كيف يتم ضمان جودة الكود وقابليته للتوسع؟'
          : 'How do you structure apps for maintainability and scale?',
      a:
        lang === 'ar'
          ? 'تطبيق صارم لفصل الطبقات (Presentation, Domain, Data) وفق Clean Architecture ومبادئ SOLID مع فصل منطق الأعمال عن الواجهات.'
          : 'Every production codebase separates Presentation, Domain, and Data layers under Clean Architecture and SOLID principles so features scale cleanly without regressions.',
    },
    {
      q:
        lang === 'ar'
          ? 'كيف يمكنني البدء أو حجز مكالمة تقنية؟'
          : 'How can we get started or schedule a call?',
      a:
        lang === 'ar'
          ? 'يمكنك حجز جلسة فورية لمدة 15 أو 30 أو 45 دقيقة من بطاقة المواعيد أعلاه، أو إرسال رسالة مختصرة وسأرد خلال 24 ساعة.'
          : 'Pick a 15, 30, or 45-minute slot via the consultation card above, send a quick message in the inquiry form, or reach out directly on WhatsApp.',
    },
  ];

  return (
    <section
      id="faq"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-slate-200/80 dark:border-white/8 w-full"
    >
      <RevealOnScroll className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="text-xs font-medium text-blue-600 dark:text-cyan-400 mb-2">
          {lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {lang === 'ar' ? 'إجابات سريعة قبل التواصل' : 'Clear Answers Before We Connect'}
        </h2>
      </RevealOnScroll>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <RevealOnScroll key={idx} delay={idx * 0.04}>
              <div className="rounded-2xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 overflow-hidden transition-colors hover:border-[#027DFD]/40">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-start font-bold text-slate-900 dark:text-white text-sm sm:text-base cursor-pointer focus-visible:outline-none"
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="font-mono tabular-nums text-xs font-bold text-blue-600 dark:text-cyan-400 shrink-0">
                    0{idx + 1}.
                  </span>
                  <span>{faq.q}</span>
                </span>
                <ChevronDown
                  size={17}
                  className={`text-slate-500 dark:text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-blue-600 dark:text-cyan-400' : ''
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                  >
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/8">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </RevealOnScroll>
          );
        })}
      </div>
    </section>
  );
};
