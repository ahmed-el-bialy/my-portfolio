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

interface ExperienceSectionProps {
  onOpenResume: () => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ onOpenResume }) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'certs' | 'experience'>('all');

  return (
    <section id="experience" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-black/10 dark:border-white/5">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Award size={14} />
          <span>Certifications, Courses & Track Record</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight title-contrast">
          Experience, Courses & Certifications
        </h2>
        <p className="text-slate-600 dark:text-gray-400 mt-2 text-sm sm:text-base body-contrast">
          Verified technical certifications, engineering apprenticeships, and academic computer science background.
        </p>

        {/* Sub-filter tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 bg-slate-200/70 dark:bg-white/5 p-1 rounded-full border border-black/10 dark:border-white/10">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Background
          </button>
          <button
            onClick={() => setActiveSubTab('certs')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'certs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck2 size={13} />
            <span>Certificates & Courses ({CERTIFICATES.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('experience')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'experience'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase size={13} />
            <span>Experience & Degree</span>
          </button>
        </div>
      </div>

      {/* 1. CERTIFICATES & COURSES GRID */}
      {(activeSubTab === 'all' || activeSubTab === 'certs') && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 title-contrast">
              <FileCheck2 size={18} className="text-cyan-600 dark:text-cyan-400" />
              <span>Verified Certifications & Specialized Programs</span>
            </h3>
            <button
              onClick={onOpenResume}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Original CV</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CERTIFICATES.map((cert) => (
              <div
                key={cert.id}
                className="card-techno rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#131522] border border-black/10 dark:border-white/10 flex flex-col justify-between group hover:border-blue-500/40 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-500/10 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono font-semibold">
                      {cert.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-md">
                      {cert.date}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors title-contrast">
                    {cert.title}
                  </h4>
                  <div className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 mt-1">
                    {cert.issuer}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 mt-2.5 leading-relaxed body-contrast">
                    {cert.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {cert.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 text-[11px] text-blue-900 dark:text-cyan-300 font-mono font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 size={13} /> Verified Course
                  </span>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>Open Document</span>
                      <ArrowUpRight size={13} />
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Engineering Experience Timeline */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 title-contrast">
                <Briefcase size={18} className="text-cyan-600 dark:text-cyan-400" />
                <span>Mobile Development & Track Record</span>
              </h3>
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">Active</span>
            </div>

            <div className="relative border-l-2 border-slate-300 dark:border-white/10 ml-3 space-y-6 pl-5 sm:pl-6">
              {EXPERIENCES.map((exp, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[27px] sm:-left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-[#090a0f] border-2 border-cyan-500 group-hover:scale-125 transition-transform" />

                  <div className="card-techno rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#131522] border border-black/10 dark:border-white/10">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-500/10 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono font-semibold mb-1.5">
                          {exp.badge || 'Engineering'}
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors title-contrast">
                          {exp.role}
                        </h4>
                        <div className="text-xs text-cyan-700 dark:text-cyan-400 font-medium mt-0.5">
                          {exp.organization} • {exp.location}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                        {exp.period}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 mt-2.5 leading-relaxed body-contrast">
                      {exp.description}
                    </p>

                    <ul className="mt-3 space-y-1.5 border-t border-black/5 dark:border-white/5 pt-3">
                      {exp.achievements.map((ach, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-gray-400 flex items-start gap-2">
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
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 title-contrast">
                <GraduationCap size={18} className="text-cyan-600 dark:text-cyan-400" />
                <span>Academic Foundations</span>
              </h3>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Undergraduate</span>
            </div>

            <div className="card-techno rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#131522] border border-black/10 dark:border-white/10 space-y-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-300 px-2.5 py-0.5 rounded-md bg-cyan-500/10 uppercase tracking-wider font-semibold">
                  Undergraduate Degree
                </span>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-2 title-contrast">
                  {EDUCATION_DATA.degree}
                </h4>
                <div className="text-xs sm:text-sm font-bold text-blue-700 dark:text-cyan-400 mt-1">
                  Faculty of Artificial Intelligence (كلية الذكاء الاصطناعي)
                </div>
                <div className="text-xs text-slate-700 dark:text-gray-300 font-semibold mt-0.5">
                  Kafrelsheikh University (جامعة كفر الشيخ)
                </div>
              </div>

              <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <span className="text-slate-600 dark:text-gray-400 font-medium">Academic Period</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{EDUCATION_DATA.period}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <span className="text-slate-600 dark:text-gray-400 font-medium">Standing</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{EDUCATION_DATA.gpa}</span>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-gray-200 uppercase tracking-wider mb-2">
                  Core Academic Coursework:
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {EDUCATION_DATA.coursework.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 text-[11px] text-blue-900 dark:text-cyan-300 font-mono font-semibold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenResume}
                  className="w-full py-2.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-700 dark:text-cyan-300 hover:text-white text-xs font-semibold border border-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[40px]"
                >
                  <span>Open Full CV Document</span>
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
