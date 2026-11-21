import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChevronDown } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import { usePlayStoreAppStats } from '../services/playStoreService';

export const FAQSection: React.FC = () => {
  const { lang } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { data: playStats } = usePlayStoreAppStats('com.ahmed.revio');

  const liveRevioSummaryEn = playStats?.downloads
    ? `Yes. Revio is officially published on Google Play (${playStats.downloads} downloads${
        playStats.rating ? `, rated ★ ${playStats.rating}` : ''
      }) and works 100% offline with Hive persistence and 3D active-recall flashcards.`
    : 'Yes. Revio (com.ahmed.revio) is officially live on the Google Play Store, built offline-first with Hive persistence, Cubit state management, and 3D active-recall flashcards.';

  const liveRevioSummaryAr = playStats?.downloads
    ? `نعم، تطبيق Revio منشور رسمياً على متجر Google Play (${playStats.downloads} تحميل${
        playStats.rating ? ` بتقييم ★ ${playStats.rating}` : ''
      })، ويعمل بالكامل بدون إنترنت اعتماداً على قاعدة بيانات Hive وبطاقات تذكر ثلاثية الأبعاد.`
    : 'نعم، تطبيق Revio منشور رسمياً على متجر Google Play (com.ahmed.revio)، ومصمم ليعمل بالكامل بدون إنترنت باستخدام قاعدة بيانات Hive وإدارة الحالة بـ Cubit.';

  const faqs = [
    {
      q:
        lang === 'ar'
          ? 'كيف يبني أحمد البيلي تطبيقات Flutter القابلة للتوسع؟'
          : 'How does Ahmed architect scalable Flutter applications?',
      a:
        lang === 'ar'
          ? 'أعتمد على فصل الطبقات وفق Clean Architecture (Presentation · Domain · Data) ومبادئ SOLID، مع إدارة الحالة عبر BLoC و Cubit، والربط بالـ REST APIs عبر Dio و Retrofit، والتخزين المحلي بدون إنترنت باستخدام Hive و SQLite.'
          : 'Every production build enforces strict Clean Architecture boundaries (Presentation, Domain, Data) with SOLID principles—combining BLoC/Cubit reactive streams, Dio/Retrofit REST contracts, and local persistence via Hive and SQLite.',
    },
    {
      q:
        lang === 'ar'
          ? 'ما هي المشاريع المنشورة فعلياً على Google Play؟'
          : 'Do you have production apps live on Google Play?',
      a: lang === 'ar' ? liveRevioSummaryAr : liveRevioSummaryEn,
    },
    {
      q:
        lang === 'ar'
          ? 'كيف تضيف دراستك للذكاء الاصطناعي قيمة لتطوير تطبيقات الموبايل؟'
          : 'How does your Artificial Intelligence degree complement mobile engineering?',
      a:
        lang === 'ar'
          ? 'دراستي في كلية الذكاء الاصطناعي بجامعة كفر الشيخ تعزز تفكيري في هياكل البيانات والخوارزميات وهندسة الأنظمة، وتمنحني جاهزية عملية لدمج ميزات ذكية وتحليلات في تطبيقات الموبايل مستقبلاً.'
          : 'Studying Artificial Intelligence at Kafrelsheikh University strengthens my command of algorithms, data modeling, and problem decomposition—making state machines cleaner and preparing apps smoothly for AI-assisted workflows.',
    },
    {
      q:
        lang === 'ar'
          ? 'هل أنت متاح لوظائف بدوام كامل أو عن بُعد أو لمشاريع مستقلة؟'
          : 'Are you open to full-time Flutter roles, remote teams, or freelance MVPs?',
      a:
        lang === 'ar'
          ? 'نعم، متاح لفرص العمل كـ Junior Flutter Developer (دوام كامل أو هجين أو عن بُعد مع قابلية للانتقال داخل مصر أو خارجها)، بالإضافة إلى تطوير تطبيقات MVP كاملة للشركات الناشئة حتى النشر على Google Play.'
          : 'Yes—I am actively open to Junior Flutter Developer roles (full-time, remote, or relocation) as well as end-to-end freelance MVP development, Firebase/API integration, and Google Play release publishing.',
    },
    {
      q:
        lang === 'ar'
          ? 'كيف يمكنني مشاهدة عروض التطبيقات أو حجز مكالمة تقنية؟'
          : 'How can I review demos or schedule a technical call?',
      a:
        lang === 'ar'
          ? 'داخل كل مشروع يمكنك الضغط على «شاهد الديمو» لمشاهدة أحدث تحديث فيديو أو «الديمو الكامل» لاستعراض قائمة التشغيل الكاملة، أو حجز جلسة 15–45 دقيقة مباشرة من قسم التواصل.'
          : 'Each project card lets you inspect live screens right away and open "Watch Demo" for update previews or "Full Demo" for complete playlists. Ready to talk? Book a 15–45 minute call via the consultation scheduler.',
    },
  ];

  return (
    <section
      id="faq"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-slate-200/80 dark:border-white/8 w-full"
    >
      <RevealOnScroll className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="text-xs font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8] mb-2">
          {lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {lang === 'ar' ? 'إجابات سريعة قبل التواصل' : 'Clear Answers Before We Connect'}
        </h2>
      </RevealOnScroll>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const panelId = `faq-panel-${idx}`;
          const btnId = `faq-btn-${idx}`;
          return (
            <RevealOnScroll key={idx} delay={idx * 0.03}>
              <div
                className={`card-shimmer rounded-2xl bg-white dark:bg-[#0f1117] border overflow-hidden transition-[border-color,box-shadow] duration-200 hover:shadow-sm ${
                  isOpen
                    ? 'border-[#0284ff]/45'
                    : 'border-slate-200 dark:border-white/10 hover:border-[#0284ff]/40'
                }`}
              >
                <button
                  id={btnId}
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full min-h-[52px] flex items-center justify-between gap-3 p-4 sm:p-5 text-start font-bold text-slate-900 dark:text-white text-sm sm:text-base cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff]/40 rounded-2xl"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="font-mono tabular-nums text-xs font-bold text-[#0369a1] dark:text-[#38bdf8] shrink-0">
                      0{idx + 1}.
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    size={17}
                    className={`text-slate-600 dark:text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#0369a1] dark:text-[#38bdf8]' : ''
                    }`}
                  />
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  data-open={isOpen ? 'true' : 'false'}
                  className="grid-accordion"
                >
                  <div className="grid-accordion-inner">
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/8">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          );
        })}
      </div>
    </section>
  );
};
