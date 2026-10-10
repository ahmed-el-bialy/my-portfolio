import React, { useState } from 'react';
import {
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle2,
  FileCheck2,
  ArrowUpRight
} from 'lucide-react';
import { EDUCATION_DATA, EXPERIENCES, CERTIFICATES } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';

interface ExperienceSectionProps {
  onOpenResume: () => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ onOpenResume }) => {
  const { lang, dir, t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'certs' | 'experience'>('all');

  return (
    <section id="experience" className="max-w-7xl mx-auto px-3.5 xs:px-4 sm:px-6 md:px-8 py-10 sm:py-16 md:py-20 border-t border-black/10 dark:border-white/5 transition-colors overflow-x-clip w-full">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-6 xs:mb-8 sm:mb-10 w-full px-1 sm:px-0">
        <div className="inline-flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] xs:text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">
          <Award size={13} className="shrink-0" />
          <span>{t.experience.badge}</span>
        </div>
        <h2 className="fluid-section-title font-extrabold text-slate-900 dark:text-white tracking-tight title-contrast">
          {t.experience.title}
        </h2>
        <p className="fluid-section-sub text-slate-600 dark:text-gray-400 mt-1.5 sm:mt-2 max-w-2xl px-1 sm:px-0 body-contrast">
          {t.experience.subtitle}
        </p>

        {/* Sub-filter tabs */}
        <div className="mt-4 xs:mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 bg-slate-200/70 dark:bg-white/5 p-1 rounded-2xl sm:rounded-full border border-black/10 dark:border-white/10 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`flex-1 sm:flex-initial px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-[10px] xs:text-[11px] sm:text-xs font-semibold transition-all cursor-pointer min-h-[34px] sm:min-h-[36px] flex items-center justify-center ${
              activeSubTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.experience.subTabs.all}
          </button>
          <button
            onClick={() => setActiveSubTab('certs')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 xs:gap-1.5 px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-[10px] xs:text-[11px] sm:text-xs font-semibold transition-all cursor-pointer min-h-[34px] sm:min-h-[36px] ${
              activeSubTab === 'certs'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck2 size={13} className="shrink-0" />
            <span>{t.experience.subTabs.certs} ({CERTIFICATES.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('experience')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 xs:gap-1.5 px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-[10px] xs:text-[11px] sm:text-xs font-semibold transition-all cursor-pointer min-h-[34px] sm:min-h-[36px] ${
              activeSubTab === 'experience'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase size={13} className="shrink-0" />
            <span>{t.experience.subTabs.experience}</span>
          </button>
        </div>
      </div>

      {/* 1. CERTIFICATES & COURSES GRID */}
      {(activeSubTab === 'all' || activeSubTab === 'certs') && (
        <div className="mb-8 xs:mb-10 sm:mb-12">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 xs:gap-2 mb-3.5 sm:mb-5">
            <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 title-contrast">
              <FileCheck2 size={16} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>{t.experience.certsSectionTitle}</span>
            </h3>
            <button
              onClick={onOpenResume}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer self-end xs:self-auto"
            >
              <span>{t.experience.viewOriginalCv}</span>
              <ArrowUpRight size={13} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xs:gap-3.5 sm:gap-5">
            {CERTIFICATES.map((cert) => (
              <div
                key={cert.id}
                className="card-techno rounded-2xl p-3.5 xs:p-4 sm:p-6 bg-white dark:bg-[#131522] border border-black/10 dark:border-white/10 flex flex-col justify-between group hover:border-blue-500/40 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                    <span className="inline-block px-2 xs:px-2.5 py-0.5 rounded-md bg-blue-500/10 text-cyan-700 dark:text-cyan-300 text-[9px] xs:text-[10px] font-mono font-semibold">
                      {cert.badge}
                    </span>
                    <span className="text-[10px] xs:text-[11px] sm:text-xs font-mono text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md shrink-0">
                      {cert.date}
                    </span>
                  </div>

                  <h4 className="fluid-card-title font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors title-contrast leading-snug">
                    {cert.title}
                  </h4>
                  <div className="fluid-card-sub font-semibold text-cyan-700 dark:text-cyan-400 mt-0.5">
                    {cert.issuer}
                  </div>

                  <p className="fluid-body text-slate-700 dark:text-gray-300 mt-1.5 sm:mt-2 leading-relaxed body-contrast">
                    {cert.description}
                  </p>

                  <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2.5 sm:mt-3">
                    {cert.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 fluid-tag text-blue-900 dark:text-cyan-300 font-mono font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3.5 sm:mt-4 pt-2.5 sm:pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[10px] xs:text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 size={13} className="shrink-0" /> {lang === 'ar' ? 'برنامج معتمد' : 'Verified Course'}
                  </span>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] xs:text-[11px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>{t.experience.credentialButton}</span>
                      <ArrowUpRight size={13} className={dir === 'rtl' ? 'rotate-180' : ''} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. EXPERIENCE & ACADEMIC GRID */}
      {(activeSubTab === 'all' || activeSubTab === 'experience') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          
          {/* Left: Engineering Experience Timeline */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-5">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 title-contrast">
                <Briefcase size={16} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>{t.experience.experienceSectionTitle}</span>
              </h3>
              <span className="text-[11px] sm:text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">{lang === 'ar' ? 'نشط' : 'Active'}</span>
            </div>

            <div className="relative border-slate-300 dark:border-white/10 space-y-3.5 sm:space-y-6 border-s-2 ms-1.5 xs:ms-2 sm:ms-3 ps-3 xs:ps-4 sm:ps-6">
              {EXPERIENCES.map((exp, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute top-2.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-white dark:bg-[#090a0f] border-2 border-cyan-500 group-hover:scale-125 transition-transform -start-[19px] xs:-start-[23px] sm:-start-[31px]" />

                  <div className="card-techno rounded-2xl p-3.5 xs:p-4 sm:p-6 bg-white dark:bg-[#131522] border border-black/10 dark:border-white/10 shadow-sm">
                    <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-1.5 xs:gap-2">
                      <div>
                        <span className="inline-block px-2 xs:px-2.5 py-0.5 rounded-md bg-blue-500/10 text-cyan-700 dark:text-cyan-300 text-[9px] xs:text-[10px] font-mono font-semibold mb-1">
                          {exp.badge || 'Engineering'}
                        </span>
                        <h4 className="fluid-card-title font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors title-contrast">
                          {exp.role}
                        </h4>
                        <div className="fluid-card-sub text-cyan-700 dark:text-cyan-400 font-medium mt-0.5">
                          {exp.organization} • {exp.location}
                        </div>
                      </div>
                      <span className="self-start xs:self-auto text-[9px] xs:text-[10px] sm:text-xs font-mono text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md">
                        {exp.period}
                      </span>
                    </div>

                    <p className="fluid-body text-slate-700 dark:text-gray-300 mt-1.5 sm:mt-2 leading-relaxed body-contrast">
                      {exp.description}
                    </p>

                    <ul className="mt-2.5 space-y-1.5 border-t border-black/5 dark:border-white/5 pt-2 sm:pt-2.5">
                      {exp.achievements.map((ach, i) => (
                        <li key={i} className="text-[10px] xs:text-[11px] sm:text-xs text-slate-600 dark:text-gray-400 flex items-start gap-1.5 leading-snug">
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

          {/* Right: Academic Degree */}
          <div className="lg:col-span-5 space-y-3.5 sm:space-y-5">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 title-contrast">
                <GraduationCap size={16} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>{t.experience.educationTitle}</span>
              </h3>
              <span className="text-[11px] sm:text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{lang === 'ar' ? 'طالب جامعي' : 'Undergraduate'}</span>
            </div>

            <div className="card-techno rounded-2xl p-3.5 xs:p-4 sm:p-6 bg-white dark:bg-[#131522] border border-black/10 dark:border-white/10 space-y-3 sm:space-y-4 shadow-sm">
              <div>
                <span className="text-[9px] xs:text-[10px] font-mono text-cyan-700 dark:text-cyan-300 px-2 xs:px-2.5 py-0.5 rounded-md bg-cyan-500/10 uppercase tracking-wider font-semibold">
                  {lang === 'ar' ? 'درجة جامعية' : 'Undergraduate Degree'}
                </span>
                <h4 className="fluid-card-title font-bold text-slate-900 dark:text-white mt-1.5 title-contrast leading-snug">
                  {EDUCATION_DATA.degree}
                </h4>
                <div className="text-xs sm:text-sm font-bold text-blue-700 dark:text-cyan-400 mt-1">
                  {t.experience.faculty}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-700 dark:text-gray-300 font-semibold mt-0.5">
                  {t.experience.university}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs py-2 px-2.5 sm:px-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <span className="text-slate-600 dark:text-gray-400 font-medium text-[10px] xs:text-[11px] sm:text-xs">{lang === 'ar' ? 'الفترة الأكاديمية' : 'Academic Period'}</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold text-xs">{t.experience.period}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-2 px-2.5 sm:px-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <span className="text-slate-600 dark:text-gray-400 font-medium text-[10px] xs:text-[11px] sm:text-xs">{lang === 'ar' ? 'المستوى الأكاديمي' : 'Standing'}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">{t.experience.gpa}</span>
              </div>

              <div>
                <h5 className="text-[10px] xs:text-[11px] sm:text-xs font-bold text-slate-900 dark:text-gray-200 uppercase tracking-wider mb-2">
                  {t.experience.courseworkTitle}
                </h5>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {EDUCATION_DATA.coursework.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 fluid-tag text-blue-900 dark:text-cyan-300 font-mono font-semibold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-1 sm:pt-2">
                <button
                  onClick={onOpenResume}
                  className="w-full py-2.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-700 dark:text-cyan-300 hover:text-white text-xs font-semibold border border-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[38px] sm:min-h-[40px]"
                >
                  <span>{t.experience.viewOriginalCv}</span>
                  <Award size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </section>
  );
};
