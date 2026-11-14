import React, { useState } from 'react';
import {
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle2,
  FileCheck2,
  ArrowUpRight,
} from 'lucide-react';
import {
  EDUCATION_DATA,
  EXPERIENCES,
  CERTIFICATES,
  CertificateItem,
} from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { SpotlightCard } from './SpotlightCard';
import { CertificateModal } from './CertificateModal';

interface ExperienceSectionProps {
  onOpenResume: () => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ onOpenResume }) => {
  const { lang, dir, t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'certs' | 'experience'>('all');
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  return (
    <section
      id="experience"
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16 transition-colors overflow-x-clip w-full"
    >
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8 sm:mb-10 w-full">
        <div className="flex items-center gap-2 text-xs font-medium text-[#027DFD] dark:text-[#00C7FF] mb-2">
          <span>{t.experience.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-[#f1f5f9] tracking-tight [text-wrap:balance]">
          {t.experience.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-[#94a3b8] mt-2 max-w-2xl">
          {t.experience.subtitle}
        </p>

        {/* Sub-filter tabs */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 bg-slate-100 dark:bg-[#0f1117] p-1 rounded-xl border border-slate-200 dark:border-white/10 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('all')}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] flex items-center justify-center whitespace-nowrap ${
              activeSubTab === 'all'
                ? 'bg-[#027DFD] text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-[#f1f5f9]'
            }`}
          >
            {t.experience.subTabs.all}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('certs')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] whitespace-nowrap ${
              activeSubTab === 'certs'
                ? 'bg-[#027DFD] text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-[#f1f5f9]'
            }`}
          >
            <FileCheck2 size={13} className="shrink-0" />
            <span>
              {t.experience.subTabs.certs} ({CERTIFICATES.length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('experience')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] whitespace-nowrap ${
              activeSubTab === 'experience'
                ? 'bg-[#027DFD] text-white shadow-xs font-bold'
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
        <div className="mb-10 sm:mb-12">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 mb-4 sm:mb-5">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-[#f1f5f9] flex items-center gap-2">
              <FileCheck2 size={17} className="text-[#027DFD] dark:text-[#00C7FF] shrink-0" />
              <span>{t.experience.certsSectionTitle}</span>
            </h2>
            <button
              type="button"
              onClick={onOpenResume}
              className="text-xs text-[#027DFD] dark:text-[#00C7FF] font-semibold hover:underline flex items-center gap-1 cursor-pointer self-end xs:self-auto"
            >
              <span>{t.experience.viewOriginalCv}</span>
              <ArrowUpRight size={13} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CERTIFICATES.map((cert) => (
              <SpotlightCard
                key={cert.id}
                spotlightColor="rgba(2, 125, 253, 0.14)"
                borderColor="rgba(0, 199, 255, 0.4)"
                onClick={() => setSelectedCert(cert)}
                className="p-5 flex flex-col justify-between group transition-all shadow-sm cursor-pointer hover:border-[#027DFD]/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 text-[11px] font-mono">
                    <span className="text-[#027DFD] dark:text-[#00C7FF] font-semibold">
                      {cert.badge}
                    </span>
                    <span className="text-slate-500 dark:text-[#94a3b8] shrink-0 tabular-nums">
                      {cert.date}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#f1f5f9] group-hover:text-[#027DFD] dark:group-hover:text-[#00C7FF] transition-colors leading-snug">
                    {cert.title}
                  </h3>
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                    {cert.issuer}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-[#94a3b8] mt-2 leading-relaxed">
                    {cert.description}
                  </p>

                  <div className="mt-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {cert.skills.slice(0, 3).join(' · ')}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/8 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 size={13} className="shrink-0" />
                    <span>{lang === 'ar' ? 'برنامج موثق' : 'Verified'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCert(cert);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#027DFD] dark:text-[#00C7FF] hover:underline cursor-pointer"
                  >
                    <span>{lang === 'ar' ? 'معاينة الشهادة' : 'Inspect Credential'}</span>
                    <ArrowUpRight size={13} className={dir === 'rtl' ? 'rotate-180' : ''} />
                  </button>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      )}

      {/* 2. Experience Timeline & Academic Education */}
      {(activeSubTab === 'all' || activeSubTab === 'experience') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left: Engineering Experience Timeline */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-[#f1f5f9] flex items-center gap-2">
                <Briefcase size={17} className="text-[#027DFD] dark:text-[#00C7FF] shrink-0" />
                <span>{t.experience.experienceSectionTitle}</span>
              </h2>
              <span className="text-xs font-mono text-[#027DFD] dark:text-[#00C7FF] font-semibold">
                {lang === 'ar' ? 'نشط' : 'Active'}
              </span>
            </div>

            <div className="relative border-slate-200 dark:border-white/10 space-y-5 border-s-2 ms-2 ps-5">
              {EXPERIENCES.map((exp, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute top-3 w-3 h-3 rounded-full bg-white dark:bg-[#08090d] border-2 border-[#027DFD] dark:border-[#00C7FF] -start-[27px]" />

                  <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono text-[#027DFD] dark:text-[#00C7FF] font-semibold">
                          {exp.badge || 'Engineering'}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-[#f1f5f9] mt-0.5">
                          {exp.role}
                        </h3>
                        <div className="text-xs text-slate-600 dark:text-[#94a3b8] font-medium mt-0.5">
                          {exp.organization} · {exp.location}
                        </div>
                      </div>
                      <span className="self-start text-xs font-mono text-slate-600 dark:text-[#94a3b8] bg-slate-100 dark:bg-[#161b27] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 tabular-nums shrink-0">
                        {exp.period}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94a3b8] mt-3 leading-relaxed">
                      {exp.description}
                    </p>

                    <ul className="mt-3 space-y-1.5 border-t border-slate-100 dark:border-white/8 pt-3">
                      {exp.achievements.map((ach, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-600 dark:text-[#94a3b8] flex items-start gap-2 leading-snug"
                        >
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Academic Degree Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-[#f1f5f9] flex items-center gap-2">
                <GraduationCap size={17} className="text-[#027DFD] dark:text-[#00C7FF] shrink-0" />
                <span>{t.experience.educationTitle}</span>
              </h2>
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                {lang === 'ar' ? 'طالب جامعي' : 'Undergraduate'}
              </span>
            </div>

            <SpotlightCard
              spotlightColor="rgba(2, 125, 253, 0.14)"
              borderColor="rgba(0, 199, 255, 0.4)"
              className="p-5 sm:p-6 space-y-4 shadow-sm"
            >
              <div>
                <span className="text-[11px] font-mono text-[#027DFD] dark:text-[#00C7FF] font-semibold">
                  {lang === 'ar' ? 'درجة البكالوريوس' : 'Undergraduate Degree'}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#f1f5f9] mt-1 leading-snug">
                  {EDUCATION_DATA.degree}
                </h3>
                <div className="text-xs sm:text-sm font-semibold text-[#027DFD] dark:text-[#00C7FF] mt-1">
                  {t.experience.faculty}
                </div>
                <div className="text-xs text-slate-600 dark:text-[#94a3b8] font-medium mt-0.5">
                  {t.experience.university}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/8">
                <span className="text-slate-600 dark:text-[#94a3b8] font-medium">
                  {lang === 'ar' ? 'الفترة الأكاديمية' : 'Academic Period'}
                </span>
                <span className="font-mono text-slate-900 dark:text-[#f1f5f9] font-bold tabular-nums">
                  {t.experience.period}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-[#161b27] border border-slate-200 dark:border-white/8">
                <span className="text-slate-600 dark:text-[#94a3b8] font-medium">
                  {lang === 'ar' ? 'الوضع الأكاديمي' : 'Standing'}
                </span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                  {t.experience.gpa}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-[#f1f5f9] mb-2">
                  {t.experience.courseworkTitle}
                </h4>
                <p className="text-xs font-mono text-slate-600 dark:text-[#94a3b8] leading-relaxed">
                  {EDUCATION_DATA.coursework.join(' · ')}
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={onOpenResume}
                  className="w-full py-2.5 rounded-xl bg-[#027DFD]/10 hover:bg-[#027DFD] text-[#027DFD] dark:text-[#00C7FF] hover:text-white text-xs font-semibold border border-[#027DFD]/30 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[40px]"
                >
                  <span>{t.experience.viewOriginalCv}</span>
                  <Award size={14} />
                </button>
              </div>
            </SpotlightCard>
          </div>
        </div>
      )}

      {/* Interactive Certificate Inspection Modal */}
      <CertificateModal
        isOpen={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
        certificate={selectedCert}
      />
    </section>
  );
};
