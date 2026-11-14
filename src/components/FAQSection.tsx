import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChevronDown, HelpCircle, Briefcase, Code2, Rocket, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FAQSection: React.FC = () => {
  const { lang, dir } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: lang === 'ar' ? 'ما هي تكليفات وتخصصات أحمد البيلي التقنية؟' : 'What are Ahmed El-Bialy’s core technical specializations?',
      a: lang === 'ar'
        ? 'أحمد متخصص في تطوير تطبيقات الموبايل باستخدام فلاتر (Junior Flutter & Mobile App Developer) ودارت (Dart)، مع خبرة قوية في Clean Architecture، وإدارة الحالة عبر Cubit و BLoC، وقواعد البيانات المحلية (Hive CE)، بالإضافة إلى دراسة الذكاء الاصطناعي (B.Sc. in AI).'
        : 'Ahmed specializes in Flutter & Mobile App Development (Junior Flutter Developer) with Dart, focusing on Clean Architecture, state management via Cubit & BLoC, local NoSQL persistence (Hive CE), and Artificial Intelligence studies (B.Sc. in AI).'
    },
    {
      q: lang === 'ar' ? 'هل التطبيقات منشورة رسمياً على متجر Google Play؟' : 'Are the applications officially published on Google Play?',
      a: lang === 'ar'
        ? 'نعم! تطبيقات مثل "Revio" منشورة رسمياً على متجر Google Play بتقييم 5.0 نجوم ومبنية بمعايير احترافية تضمن أداء 60 إطاراً في الثانية وسلاسة تامة بدون إنترنت.'
        : 'Yes! Production apps like "Revio" are officially published on the Google Play Store with a 5.0-star rating, engineered for 60 FPS performance and robust offline-first functionality.'
    },
    {
      q: lang === 'ar' ? 'ما هي الخدمات التي يقدمها للعملاء وجهات التوظيف؟' : 'What services does Ahmed offer for clients and recruiters?',
      a: lang === 'ar'
        ? 'يقدم أحمد تطوير النماذج الأولية السريعة (MVP Development)، ربط REST APIs المتقدمة، دمج Firebase Backend (Auth & Firestore)، نشر التطبيقات على Google Play، وإصلاح الأخطاء والصيانة (Bug Fixing).'
        : 'Ahmed offers MVP Development, advanced REST API integration, Firebase backend setup (Auth & Firestore), Google Play publishing, and bug fixing / code maintenance.'
    },
    {
      q: lang === 'ar' ? 'كيف يتم ضمان جودة الكود ونظافته؟' : 'How is code quality and cleanliness guaranteed?',
      a: lang === 'ar'
        ? 'يعتمد أحمد على هندسة Clean Architecture وفصل الطبقات (Presentation, Domain, Data)، مع تطبيق مبادئ SOLID وتوفير اختبارات وحدة (Unit Tests) وكود نظيف وقابل للتوسع.'
        : 'Ahmed follows Clean Architecture with strict separation of concerns (Presentation, Domain, Data layers), applying SOLID principles and writing modular, scalable, maintainable code.'
    },
    {
      q: lang === 'ar' ? 'كيف يمكن للشركات أو العملاء التواصل أو توظيفه؟' : 'How can companies or clients hire or contact him?',
      a: lang === 'ar'
        ? 'يمكنكم تحميل السيرة الذاتية (Download CV) بنقرة واحدة، أو حجز استشارة أو موعد مباشر (Book a Consultation)، أو إرسال رسالة مباشرة عبر نموذج التواصل أو الواتساب.'
        : 'You can download the CV in one click, book a live consultation, or send a direct message via the contact form or WhatsApp for immediate collaboration.'
    }
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-cyan-400 text-xs font-mono font-bold mb-3">
          <HelpCircle size={14} />
          <span>{lang === 'ar' ? 'الأسئلة الشائعة وتوضيح العمل' : 'FAQ & Workflow'}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {lang === 'ar' ? 'كل ما تحتاج معرفته عن المهارات وخدمات العمل الحر' : 'Everything You Need to Know'}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 mt-2">
          {lang === 'ar'
            ? 'إجابات واضحة ومباشرة لمسؤولي التوظيف والعملاء المستقلين'
            : 'Clear, transparent answers for recruiters, hiring managers, and freelance clients.'}
        </p>
      </div>

      <div className="space-y-3.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-[#111322] border border-slate-200/90 dark:border-white/10 overflow-hidden shadow-sm transition-all duration-200 hover:border-blue-500/40"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-start font-bold text-slate-900 dark:text-white text-sm sm:text-base cursor-pointer focus-visible:outline-none"
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center text-xs font-mono shrink-0">
                    0{idx + 1}
                  </span>
                  <span>{faq.q}</span>
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-500 dark:text-gray-400 transition-transform duration-300 shrink-0 ${
                    isOpen ? 'rotate-180 text-blue-600 dark:text-cyan-400' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed border-t border-slate-100 dark:border-white/5">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};
