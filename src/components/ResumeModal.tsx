import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Share2,
  Check,
  Award,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Printer,
  Mail,
  MapPin,
  Github,
  Linkedin,
  ArrowUpRight
} from 'lucide-react';
import { DeveloperProfile, EDUCATION_DATA, EXPERIENCES, FEATURED_PROJECTS } from '../data/portfolioData';
import { WhatsAppLogo } from './TechLogos';
import { useScrollLock } from '../hooks/useScrollLock';
import { useLanguage } from '../context/LanguageContext';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DeveloperProfile;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose, profile }) => {
  useScrollLock(isOpen);
  const { lang, dir, t } = useLanguage();

  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = profile.cvDriveUrl || window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl my-auto bg-white dark:bg-[#12131b] border border-slate-200 dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar */}
        <div className="p-3.5 sm:p-5 bg-slate-50 dark:bg-[#171823] border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 no-print gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-2 rounded-lg bg-blue-600/10 text-blue-600 dark:text-cyan-400 shrink-0">
              <Award size={18} />
            </span>
            <div className="truncate">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white title-contrast truncate">
                {t.resume.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate">
                {profile.name} • {lang === 'ar' ? 'مطور تطبيقات هواتف فلاتر' : 'Flutter Mobile Developer'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {profile.cvDriveUrl && (
              <a
                href={profile.cvDriveUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-medium shadow-sm transition-colors cursor-pointer"
                title={t.resume.downloadPdf}
              >
                <Download size={13} />
                <span className="hidden xs:inline">{lang === 'ar' ? 'تحميل' : 'Download'}</span>
                <span>PDF</span>
                <ArrowUpRight size={12} className={dir === 'rtl' ? 'rotate-180' : ''} />
              </a>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs text-slate-700 dark:text-gray-300 hover:text-black dark:hover:text-white border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
              title={t.resume.print}
            >
              <Printer size={13} />
              <span className="hidden md:inline">{lang === 'ar' ? 'طباعة' : 'Print'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs text-slate-700 dark:text-gray-300 hover:text-black dark:hover:text-white border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
              title={t.resume.copyLink}
            >
              {copiedLink ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
              <span className="hidden md:inline">{copiedLink ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'مشاركة' : 'Share')}</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-red-500/15 hover:bg-red-500 text-red-600 hover:text-white border border-red-500/30 flex items-center justify-center transition-all cursor-pointer shadow-xs ml-1"
              aria-label="Close CV Dialog"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Scrollable CV Body */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-7 text-slate-700 dark:text-gray-300 text-xs sm:text-sm print:bg-white print:text-black body-contrast">
          
          {/* Header Info */}
          <div className="border-b border-black/10 dark:border-white/10 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight title-contrast">
                  {profile.name}
                </h1>
                <p className="text-blue-700 dark:text-cyan-400 font-bold text-sm mt-0.5">
                  {profile.title}
                </p>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">
                  Faculty of Artificial Intelligence, Kafrelsheikh University
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-white">{profile.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <WhatsAppLogo size={13} className="shrink-0" />
                  <a
                    href="https://wa.me/201022121573"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    WhatsApp: {profile.phone}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Github size={13} className="text-slate-800 dark:text-gray-300 shrink-0" />
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 dark:text-cyan-300 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>github.com/{profile.githubUsername}</span>
                    <ArrowUpRight size={11} />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Linkedin size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 dark:text-cyan-300 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>LinkedIn Profile</span>
                    <ArrowUpRight size={11} />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="text-slate-900 dark:text-white font-medium">{profile.location}</span>
                </div>
              </div>
            </div>

            <p className="text-slate-700 dark:text-gray-300 text-xs sm:text-sm mt-4 leading-relaxed body-contrast">
              {t.hero.bio}
            </p>
          </div>

          {/* Education Section */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2 title-contrast">
              <GraduationCap size={16} className="text-blue-600 dark:text-blue-400" />
              <span>{t.resume.educationTitle}</span>
            </h2>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm title-contrast">{t.experience.degreeTitle}</h3>
                <div className="text-xs text-blue-700 dark:text-cyan-400 font-bold mt-0.5">{t.experience.faculty} • {t.experience.university}</div>
                <div className="text-[11px] text-slate-700 dark:text-gray-300 mt-2 font-medium">
                  {t.experience.courseworkTitle} {EDUCATION_DATA.coursework.slice(0, 5).join(' • ')}
                </div>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <div className="text-xs font-mono text-slate-600 dark:text-gray-400">{t.experience.period}</div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{t.experience.gpa}</div>
              </div>
            </div>
          </div>

          {/* Experience Section */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2 title-contrast">
              <Briefcase size={16} className="text-blue-600 dark:text-blue-400" />
              <span>{t.resume.experienceTitle}</span>
            </h2>
            <div className="space-y-3.5">
              {EXPERIENCES.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm title-contrast">{exp.role}</h3>
                      <div className="text-xs text-blue-700 dark:text-cyan-400 font-medium">{exp.organization} • {exp.location}</div>
                    </div>
                    <span className="text-xs font-mono text-slate-600 dark:text-gray-400">{exp.period}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed body-contrast">{exp.description}</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-gray-400 pt-1">
                    {exp.achievements.map((ach, i) => (
                      <li key={i}>{ach}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Apps */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2 title-contrast">
              <FolderGit2 size={16} className="text-blue-600 dark:text-blue-400" />
              <span>{t.resume.projectsTitle}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {FEATURED_PROJECTS.map((proj) => (
                <div key={proj.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm title-contrast">{proj.name}</h3>
                      {proj.links.googlePlay && (
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Google Play
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-2">{proj.description}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-black/5 dark:border-white/5 text-xs">
                    {proj.links.googlePlay && (
                      <a
                        href={proj.links.googlePlay}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Play Store</span>
                        <ArrowUpRight size={11} />
                      </a>
                    )}
                    {proj.links.github && (
                      <a
                        href={proj.links.github}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>GitHub Code</span>
                        <ArrowUpRight size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
