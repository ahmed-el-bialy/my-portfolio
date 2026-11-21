import React, { useState, lazy, Suspense } from 'react';
import {
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle2,
  FileCheck2,
  ArrowUpRight,
  Layers,
  Terminal,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  EDUCATION_DATA,
  EXPERIENCES,
  CERTIFICATES,
  CertificateItem,
} from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { SpotlightCard } from './SpotlightCard';
import { RevealOnScroll } from './RevealOnScroll';

const LazyCertificateModal = lazy(() =>
  import('./CertificateModal').then((m) => ({ default: m.CertificateModal }))
);

interface ExperienceSectionProps {
  onOpenResume: () => void;
}

interface CertHighlightMeta {
  trackEn: string;
  trackAr: string;
  advantageEn: string;
  advantageAr: string;
  accentIcon: React.FC<{ size?: number; className?: string }>;
  iconTileClass: string;
}

const getCertificateMeta = (cert: CertificateItem): CertHighlightMeta => {
  const idLower = cert.id.toLowerCase();
  if (idLower.includes('udemy')) {
    return {
      trackEn: 'Architecture Bootcamp',
      trackAr: 'معسكر معمارية Flutter',
      advantageEn: 'End-to-end Clean Architecture & BLoC/Cubit mastery for production mobile apps.',
      advantageAr: 'إتقان Clean Architecture وإدارة الحالة BLoC/Cubit لبناء تطبيقات إنتاجية متكاملة.',
      accentIcon: Layers,
      iconTileClass:
        'bg-violet-500/12 text-violet-700 dark:text-violet-400 border-violet-500/25',
    };
  }
  if (idLower.includes('sprints') || idLower.includes('microsoft')) {
    return {
      trackEn: 'Microsoft Joint Camp',
      trackAr: 'معسكر مشترك مع Microsoft',
      advantageEn: '45+ hours intensive Flutter UI, Dart engineering & responsive layout delivery.',
      advantageAr: 'أكثر من 45 ساعة تدريبية مكثفة في بناء واجهات Flutter وهندسة Dart المتجاوبة.',
      accentIcon: Award,
      iconTileClass:
        'bg-[#0284ff]/12 text-[#0369a1] dark:text-[#38bdf8] border-[#0284ff]/25',
    };
  }
  return {
    trackEn: 'Hands-on Apprenticeship',
    trackAr: 'تدريب عملي تطبيقي',
    advantageEn: 'Independently shipped Revio & Quotely applying REST APIs, Retrofit & Hive storage.',
    advantageAr: 'تنفيذ ونشر تطبيقين فعليين (Revio و Quotely) باستخدام REST APIs و Retrofit و Hive.',
    accentIcon: Terminal,
    iconTileClass:
      'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
  };
};

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ onOpenResume }) => {
  const { lang, dir, t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'certs' | 'experience'>('all');
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [mountedCertModal, setMountedCertModal] = useState(false);

  const openCertModal = (cert: CertificateItem) => {
    setMountedCertModal(true);
    setSelectedCert(cert);
  };

  return (
    <section
      id="experience"
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-28 sm:pb-20 transition-colors overflow-x-clip w-full"
    >
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10 sm:mb-12 w-full">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8] mb-2">
          <span>{t.experience.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-[#f1f5f9] tracking-tight [text-wrap:balance]">
          {t.experience.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-[#94a3b8] mt-3 max-w-2xl leading-relaxed">
          {t.experience.subtitle}
        </p>

        {/* Clean Segmented Sub-Filter Tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 bg-slate-100 dark:bg-[#0f1117] p-1.5 rounded-xl border border-slate-200 dark:border-white/10 w-full sm:w-auto shadow-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('all')}
            className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[44px] sm:min-h-[38px] flex items-center justify-center whitespace-nowrap ${
              activeSubTab === 'all'
                ? 'bg-[#0284ff] text-white shadow-sm shadow-[#0284ff]/25 font-bold'
                : 'text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-[#f1f5f9]'
            }`}
          >
            {t.experience.subTabs.all}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('certs')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[44px] sm:min-h-[38px] whitespace-nowrap ${
              activeSubTab === 'certs'
                ? 'bg-[#0284ff] text-white shadow-sm shadow-[#0284ff]/25 font-bold'
                : 'text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-[#f1f5f9]'
            }`}
          >
            <FileCheck2 size={13} className="shrink-0" />
            <span className="tabular-nums">
              {t.experience.subTabs.certs} ({CERTIFICATES.length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('experience')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[44px] sm:min-h-[38px] whitespace-nowrap ${
              activeSubTab === 'experience'
                ? 'bg-[#0284ff] text-white shadow-sm shadow-[#0284ff]/25 font-bold'
                : 'text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-[#f1f5f9]'
            }`}
          >
            <Briefcase size={13} className="shrink-0" />
            <span>{t.experience.subTabs.experience}</span>
          </button>
        </div>
      </div>

      {/* 1. Verified Certificates & Training Grid */}
      {(activeSubTab === 'all' || activeSubTab === 'certs') && (
        <div className="mb-14 sm:mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-200/80 dark:border-white/8">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#0284ff]/10 text-[#0369a1] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
                <FileCheck2 size={17} />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-[#f1f5f9]">
                  {t.experience.certsSectionTitle}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {lang === 'ar'
                    ? 'تفاصيل كل شهادة، الجهة المانحة، والمهارات الهندسية المكتسبة'
                    : 'Issuer identity, engineering focus & verified credential inspection'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenResume}
              className="btn-kinetic px-3.5 py-2 min-h-[44px] sm:min-h-[38px] rounded-xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 text-xs text-[#0369a1] dark:text-[#38bdf8] font-semibold hover:border-[#0284ff]/50 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto whitespace-nowrap"
            >
              <span>{t.experience.viewOriginalCv}</span>
              <ArrowUpRight size={13} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CERTIFICATES.map((cert, idx) => {
              const meta = getCertificateMeta(cert);
              const TrackIcon = meta.accentIcon;

              return (
                <RevealOnScroll key={cert.id} delay={Math.min(idx * 0.04, 0.16)} className="flex">
                  <SpotlightCard
                    spotlightColor="rgba(2, 132, 255, 0.12)"
                    borderColor="rgba(2, 132, 255, 0.35)"
                    className="card-shimmer w-full p-6 flex flex-col justify-between gap-5 group transition-colors shadow-sm hover:border-[#0284ff]/45"
                  >
                    <div className="space-y-4">
                      {/* Tier 1: Issuer Icon Plate + Track Type + Date */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${meta.iconTileClass}`}
                          >
                            <TrackIcon size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                              {cert.issuer}
                            </div>
                            <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate">
                              {lang === 'ar' ? meta.trackAr : meta.trackEn}
                            </div>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.04] px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-white/8 tabular-nums shrink-0">
                          <Calendar size={11} className="text-[#0369a1] dark:text-[#38bdf8]" />
                          {cert.date}
                        </span>
                      </div>

                      {/* Tier 2: Semantic Title Trigger */}
                      <div>
                        <button
                          type="button"
                          onClick={() => openCertModal(cert)}
                          className="text-start w-full group/title cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff]"
                        >
                          <h3 className="text-base sm:text-[17px] font-extrabold text-slate-900 dark:text-[#f1f5f9] group-hover:text-[#0369a1] dark:group-hover:text-[#38bdf8] group-hover/title:text-[#0369a1] dark:group-hover/title:text-[#38bdf8] transition-colors leading-snug">
                            {cert.title}
                          </h3>
                        </button>
                      </div>

                      {/* Tier 3: Calm Border-Top Advantage (no nested inner box) */}
                      <div className="pt-3 border-t border-slate-100 dark:border-white/8 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0369a1] dark:text-[#38bdf8]">
                          <Sparkles size={12} />
                          <span>
                            {lang === 'ar' ? 'الميزة والقيمة العملية' : 'Core Engineering Advantage'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {lang === 'ar' ? meta.advantageAr : meta.advantageEn}
                        </p>
                      </div>

                      {/* Tier 4: Scannable Skills Strip (max 4 cohesive items) */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {cert.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-[#161b27] border border-slate-200/80 dark:border-white/8 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tier 5: Clear Verification & Inspect Footer */}
                    <div className="pt-4 border-t border-slate-200/80 dark:border-white/8 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="shrink-0" />
                        <span>{lang === 'ar' ? 'شهادة موثقة' : cert.badge}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => openCertModal(cert)}
                        className="btn-kinetic inline-flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-[34px] rounded-xl sm:rounded-lg bg-[#0284ff]/10 hover:bg-[#0284ff] text-[#0369a1] dark:text-[#38bdf8] hover:text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <span>{lang === 'ar' ? 'عرض الشهادة' : 'Inspect'}</span>
                        <ArrowUpRight size={13} className={dir === 'rtl' ? 'rotate-180' : ''} />
                      </button>
                    </div>
                  </SpotlightCard>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Experience Timeline & Academic Education */}
      {(activeSubTab === 'all' || activeSubTab === 'experience') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left: Engineering Experience Timeline */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/8">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#0284ff]/10 text-[#0369a1] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
                  <Briefcase size={17} />
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-[#f1f5f9]">
                  {t.experience.experienceSectionTitle}
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                {lang === 'ar' ? 'خبرة عملية موثقة' : 'Verified Track'}
              </span>
            </div>

            <div className="relative border-slate-200 dark:border-white/10 space-y-6 border-s-2 ms-3 ps-6">
              {EXPERIENCES.map((exp, idx) => (
                <RevealOnScroll key={idx} delay={Math.min(idx * 0.04, 0.16)} className="relative group">
                  <div className="absolute top-5 w-3.5 h-3.5 rounded-full bg-white dark:bg-[#08090d] border-2 border-[#0284ff] dark:border-[#38bdf8] -start-[31px] shadow-xs" />

                  <div className="card-shimmer overflow-hidden rounded-2xl p-6 bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 shadow-sm hover:border-[#0284ff]/45 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-mono text-[#0369a1] dark:text-[#38bdf8] font-semibold">
                          {exp.badge || 'Engineering'}
                        </span>
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-[#f1f5f9] mt-0.5">
                          {exp.role}
                        </h3>
                        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                          {exp.organization} · {exp.location}
                        </div>
                      </div>
                      <span className="self-start text-xs font-mono text-slate-700 dark:text-[#94a3b8] bg-slate-100 dark:bg-[#161b27] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 tabular-nums shrink-0">
                        {exp.period}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94a3b8] mt-3.5 leading-relaxed">
                      {exp.description}
                    </p>

                    <ul className="mt-4 space-y-2 border-t border-slate-100 dark:border-white/8 pt-4">
                      {exp.achievements.map((ach, i) => (
                        <li
                          key={i}
                          className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 flex items-start gap-2.5 leading-snug"
                        >
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>

          {/* Right: Academic Degree Card */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/8">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#0284ff]/10 text-[#0369a1] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
                  <GraduationCap size={17} />
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-[#f1f5f9]">
                  {t.experience.educationTitle}
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                {lang === 'ar' ? 'طالب جامعي' : 'Undergraduate'}
              </span>
            </div>

            <SpotlightCard
              spotlightColor="rgba(2, 132, 255, 0.12)"
              borderColor="rgba(2, 132, 255, 0.35)"
              className="card-shimmer overflow-hidden p-6 sm:p-7 space-y-5 shadow-sm"
            >
              <div>
                <span className="text-[11px] font-mono text-[#0369a1] dark:text-[#38bdf8] font-semibold">
                  {lang === 'ar' ? 'درجة البكالوريوس' : 'B.Sc. Degree Program'}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-[#f1f5f9] mt-1 leading-snug">
                  {EDUCATION_DATA.degree}
                </h3>
                <div className="text-xs sm:text-sm font-semibold text-[#0369a1] dark:text-[#38bdf8] mt-1.5">
                  {t.experience.faculty}
                </div>
                <div className="text-xs text-slate-600 dark:text-[#94a3b8] font-medium mt-0.5">
                  {t.experience.university}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                <div className="flex items-center justify-between text-xs py-3 px-3.5 rounded-xl bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/8">
                  <span className="text-slate-600 dark:text-[#94a3b8] font-medium">
                    {lang === 'ar' ? 'الفترة الأكاديمية' : 'Academic Period'}
                  </span>
                  <span className="font-mono text-slate-900 dark:text-[#f1f5f9] font-bold tabular-nums">
                    {t.experience.period}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-3 px-3.5 rounded-xl bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/8">
                  <span className="text-slate-600 dark:text-[#94a3b8] font-medium">
                    {lang === 'ar' ? 'الوضع الأكاديمي' : 'Academic Standing'}
                  </span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                    {t.experience.gpa}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-[#f1f5f9] mb-2.5">
                  {t.experience.courseworkTitle}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {EDUCATION_DATA.coursework.map((course) => (
                    <span
                      key={course}
                      className="px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/8 text-[11px] font-mono text-slate-700 dark:text-slate-300"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={onOpenResume}
                  className="btn-kinetic w-full py-3 rounded-xl bg-[#0284ff] hover:bg-[#0070e0] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0284ff]/25 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <span>{t.experience.viewOriginalCv}</span>
                  <Award size={15} />
                </button>
              </div>
            </SpotlightCard>
          </div>
        </div>
      )}

      {/* Lazy-mounted Interactive Certificate Inspection Modal */}
      {mountedCertModal && (
        <Suspense fallback={null}>
          <LazyCertificateModal
            isOpen={Boolean(selectedCert)}
            onClose={() => setSelectedCert(null)}
            certificate={selectedCert}
          />
        </Suspense>
      )}
    </section>
  );
};
