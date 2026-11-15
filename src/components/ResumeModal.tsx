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
  Mail,
  MapPin,
  Github,
  Linkedin,
  ArrowUpRight,
  FileText,
  Layout,
  ExternalLink,
  Maximize2,
  Minimize2,
  Loader2,
  Printer,
  Globe,
  Cpu,
  CheckCircle2,
  Star,
} from 'lucide-react';
import {
  DeveloperProfile,
  EDUCATION_DATA,
  EXPERIENCES,
  FEATURED_PROJECTS,
  CERTIFICATES,
  LANGUAGES_DATA,
  getGmailComposeUrl,
} from '../data/portfolioData';
import { AHMED_CONFIG } from '../data/config';
import { WhatsAppLogo } from './TechLogos';
import { BrandLogoMark } from './BrandLogoMark';
import { useScrollLock } from '../hooks/useScrollLock';
import { useLanguage } from '../context/LanguageContext';
import { usePlayStoreAppStats } from '../services/playStoreService';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DeveloperProfile;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose, profile }) => {
  useScrollLock(isOpen);
  const { lang, dir, t } = useLanguage();
  const { data: playStats } = usePlayStoreAppStats('com.ahmed.revio');

  const [copiedLink, setCopiedLink] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [viewMode, setViewMode] = useState<'web' | 'pdf'>('web');
  const [isPdfLoading, setIsPdfLoading] = useState(true);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pdfPreviewUrl = (profile.cvDriveUrl || '')
    .replace('/view?usp=drive_link', '/preview')
    .replace('/view', '/preview');

  const handleToggleViewMode = () => {
    setViewMode((prev) => {
      const next = prev === 'pdf' ? 'web' : 'pdf';
      if (next === 'pdf') {
        setIsPdfLoading(true);
      }
      return next;
    });
  };

  const handleCopyLink = () => {
    const url = profile.cvDriveUrl || window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrintResume = () => {
    if (viewMode === 'pdf') {
      setViewMode('web');
    }
    document.body.classList.add('printing-resume');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-resume');
      }, 400);
    }, 80);
  };

  const stackGroups = [
    {
      label: lang === 'ar' ? 'نواة تطوير الموبايل' : 'Mobile Core',
      items: ['Flutter', 'Dart', 'Clean Architecture', 'SOLID Principles', 'Responsive UI'],
    },
    {
      label: lang === 'ar' ? 'إدارة الحالة والتخزين' : 'State & Persistence',
      items: ['BLoC / Cubit', 'Hive', 'SQLite (sqflite)', 'SharedPreferences'],
    },
    {
      label: lang === 'ar' ? 'الشبكات والسحابة' : 'Networking & Cloud',
      items: ['Dio', 'Retrofit', 'RESTful APIs', 'Firebase Auth & Firestore'],
    },
  ];

  const modalContent = (
    <div
      className="resume-printable-overlay fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
    >
      <div
        className={`resume-printable-sheet relative w-full ${
          isMaximized
            ? 'max-w-[98vw] h-[96dvh]'
            : 'max-w-5xl lg:max-w-6xl h-[93dvh] sm:h-[92vh]'
        } bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-50 dark:bg-[#141722] border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between shrink-0 no-print gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogoMark sizeClassName="w-9 h-9" />
            <div className="min-w-0">
              <h3
                id="resume-modal-title"
                className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate"
              >
                {t.resume.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate">
                {AHMED_CONFIG.name[lang]} · {AHMED_CONFIG.title[lang]}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleViewMode}
              className={`btn-kinetic flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border min-h-[36px] ${
                viewMode === 'pdf'
                  ? 'bg-[#027DFD] text-white border-[#027DFD] shadow-sm'
                  : 'bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-[#027DFD] dark:text-[#00C7FF] border-slate-200 dark:border-white/10'
              }`}
            >
              {viewMode === 'pdf' ? (
                <>
                  <Layout size={13} />
                  <span>{lang === 'ar' ? 'عرض السيرة التفاعلية' : 'Executive Web View'}</span>
                </>
              ) : (
                <>
                  <FileText size={13} />
                  <span>{lang === 'ar' ? 'عرض PDF' : 'View PDF'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrintResume}
              className="btn-kinetic hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-white/10 font-semibold transition-colors cursor-pointer min-h-[36px]"
              title={t.resume.print}
            >
              <Printer size={13} className="text-[#027DFD] dark:text-[#00C7FF]" />
              <span>{lang === 'ar' ? 'طباعة' : 'Print'}</span>
            </button>

            {profile.cvDriveUrl && (
              <a
                href={profile.cvDriveUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-kinetic flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-bold shadow-sm transition-colors cursor-pointer min-h-[36px]"
                title={t.resume.downloadPdf}
              >
                <Download size={13} />
                <span className="hidden xs:inline">{lang === 'ar' ? 'تحميل' : 'Download'}</span>
                <span>PDF</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-9 h-9 sm:w-auto sm:px-3 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title={t.resume.copyLink}
            >
              {copiedLink ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
              <span className="hidden md:inline">
                {copiedLink
                  ? lang === 'ar'
                    ? 'تم النسخ'
                    : 'Copied'
                  : lang === 'ar'
                  ? 'مشاركة'
                  : 'Share'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsMaximized((prev) => !prev)}
              className="w-9 h-9 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 items-center justify-center transition-colors cursor-pointer hidden md:flex"
              title={isMaximized ? 'Restore size' : 'Maximize window'}
              aria-label="Toggle Fullscreen"
            >
              {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white border border-red-500/25 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close CV Dialog"
            >
              <X size={17} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {viewMode === 'pdf' ? (
          <div className="flex-1 min-h-0 flex flex-col w-full h-full bg-slate-100 dark:bg-[#0c0d14] relative">
            <div className="px-4 py-2.5 bg-slate-200/70 dark:bg-white/[0.04] border-b border-slate-300 dark:border-white/10 flex items-center justify-between text-xs text-slate-700 dark:text-gray-300 shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-[#027DFD] dark:text-[#00C7FF]" />
                <span className="font-semibold text-xs sm:text-sm">
                  {lang === 'ar' ? 'مستند السيرة الذاتية (PDF المعتمد)' : 'Official PDF Resume Document'}
                </span>
              </div>

              {profile.cvDriveUrl && (
                <a
                  href={profile.cvDriveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 text-[#027DFD] dark:text-[#00C7FF] font-semibold text-xs border border-slate-200 dark:border-white/10"
                >
                  <span>{lang === 'ar' ? 'فتح في نافذة جديدة' : 'Open External'}</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div className="flex-1 min-h-0 w-full h-full relative overflow-hidden">
              {isPdfLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-100/95 dark:bg-[#0c0d14]/95 backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-2xl bg-[#027DFD]/10 border border-[#027DFD]/25 flex items-center justify-center mb-4 text-[#027DFD] dark:text-[#00C7FF]">
                    <Loader2 size={24} className="animate-spin" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1.5 text-center">
                    {lang === 'ar'
                      ? 'جاري تحميل ملف السيرة الذاتية (PDF)...'
                      : 'Loading Official PDF Resume...'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm text-center mb-5">
                    {lang === 'ar'
                      ? 'يمكنك أيضاً تحميل النسخة الرسمية مباشرة أو الرجوع للعرض التفاعلي.'
                      : 'You can also download the PDF directly or return to the interactive executive view.'}
                  </p>
                  {profile.cvDriveUrl && (
                    <a
                      href={profile.cvDriveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-kinetic inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                    >
                      <Download size={14} />
                      <span>{lang === 'ar' ? 'تحميل مباشر للـ PDF' : 'Direct Download PDF'}</span>
                    </a>
                  )}
                </div>
              )}

              <iframe
                src={pdfPreviewUrl}
                onLoad={() => setIsPdfLoading(false)}
                className="w-full h-full border-0"
                title={`${profile.name} CV PDF Document`}
                allow="autoplay"
              />
            </div>
          </div>
        ) : (
          /* Executive 2-Column Interactive Sheet */
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-7 lg:p-8 print:p-0 text-slate-700 dark:text-gray-300">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Executive Masthead Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-[#141926] dark:via-[#111520] dark:to-[#0c1018] border border-slate-200/90 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-[2px] bg-gradient-to-br from-[#027DFD] via-[#00C7FF] to-emerald-400 shrink-0 shadow-md">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-full h-full rounded-[14px] object-cover bg-slate-950"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {AHMED_CONFIG.name[lang]}
                      </h1>
                      <span className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                        · {lang === 'ar' ? 'متاح للعمل والمشاريع' : 'Available for Hire'}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-[#027DFD] dark:text-[#00C7FF] mt-0.5">
                      {AHMED_CONFIG.title[lang]}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {AHMED_CONFIG.education.faculty[lang]} — {AHMED_CONFIG.education.university[lang]}
                    </p>
                  </div>
                </div>

                {/* Snapshot Key Credentials */}
                <div className="flex flex-wrap sm:grid sm:grid-cols-2 gap-2.5 shrink-0">
                  <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-center">
                    <div className="text-sm font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {playStats?.downloads || '10+'} {playStats?.rating ? `· ★${playStats.rating}` : ''}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Revio on Google Play
                    </div>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-center">
                    <div className="text-sm font-extrabold font-mono tabular-nums text-[#027DFD] dark:text-[#00C7FF]">
                      6+ Apps
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Clean Architecture
                    </div>
                  </div>
                </div>
              </div>

              {/* Main 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Sidebar (4 cols): Contact, Core Stack, Languages, Certs */}
                <aside className="lg:col-span-4 space-y-5">
                  {/* Direct Contact */}
                  <div className="p-5 rounded-2xl bg-slate-50/90 dark:bg-white/[0.025] border border-slate-200/85 dark:border-white/10 space-y-3">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <Mail size={14} className="text-[#027DFD] dark:text-[#00C7FF]" />
                      <span>{lang === 'ar' ? 'قنوات التواصل' : 'Contact & Profiles'}</span>
                    </h2>

                    <div className="space-y-2.5 text-xs">
                      <a
                        href={getGmailComposeUrl(profile.email)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:text-[#027DFD] dark:hover:text-[#00C7FF] font-medium break-all"
                      >
                        <Mail size={14} className="text-[#027DFD] dark:text-[#00C7FF] shrink-0" />
                        <span>{profile.email}</span>
                      </a>

                      <a
                        href={AHMED_CONFIG.socials.whatsapp}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                      >
                        <WhatsAppLogo size={14} className="shrink-0" />
                        <span dir="ltr">{profile.phone}</span>
                      </a>

                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:text-[#027DFD] dark:hover:text-[#00C7FF] font-medium"
                      >
                        <Github size={14} className="shrink-0" />
                        <span>github.com/{profile.githubUsername}</span>
                      </a>

                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:text-[#027DFD] dark:hover:text-[#00C7FF] font-medium"
                      >
                        <Linkedin size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>LinkedIn · ahmedel-bialy</span>
                      </a>

                      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 pt-1">
                        <MapPin size={14} className="text-violet-500 shrink-0" />
                        <span>{AHMED_CONFIG.location[lang]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Categorized Technical Stack */}
                  <div className="p-5 rounded-2xl bg-slate-50/90 dark:bg-white/[0.025] border border-slate-200/85 dark:border-white/10 space-y-4">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <Cpu size={14} className="text-[#027DFD] dark:text-[#00C7FF]" />
                      <span>{t.resume.skillsTitle}</span>
                    </h2>

                    <div className="space-y-3.5">
                      {stackGroups.map((group) => (
                        <div key={group.label}>
                          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                            {group.label}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {group.items.map((item) => (
                              <span
                                key={item}
                                className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#161b27] border border-slate-200/90 dark:border-white/10 text-[11px] font-mono font-semibold text-slate-800 dark:text-slate-200"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="p-5 rounded-2xl bg-slate-50/90 dark:bg-white/[0.025] border border-slate-200/85 dark:border-white/10 space-y-3">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <Globe size={14} className="text-[#027DFD] dark:text-[#00C7FF]" />
                      <span>{lang === 'ar' ? 'اللغات' : 'Languages'}</span>
                    </h2>
                    <div className="space-y-2 text-xs">
                      {LANGUAGES_DATA.map((l) => (
                        <div key={l.name} className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {l.flag} {l.nativeName}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {l.proficiency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certifications Compact List */}
                  <div className="p-5 rounded-2xl bg-slate-50/90 dark:bg-white/[0.025] border border-slate-200/85 dark:border-white/10 space-y-3">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <Award size={14} className="text-emerald-500" />
                      <span>{lang === 'ar' ? 'الشهادات المعتمدة' : 'Certifications'}</span>
                    </h2>
                    <div className="space-y-2.5">
                      {CERTIFICATES.map((c) => (
                        <div key={c.id} className="text-xs">
                          <div className="font-bold text-slate-900 dark:text-white leading-snug">
                            {c.title}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                            {c.issuer} · {c.date}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>

                {/* Right Main Content (8 cols): Summary, Experience, Projects, Education */}
                <main className="lg:col-span-8 space-y-6">
                  {/* Professional Summary */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/85 dark:border-white/10 space-y-2">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      {t.resume.summaryTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {t.hero.bio}
                    </p>
                  </div>

                  {/* Experience Timeline */}
                  <div className="space-y-3">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <Briefcase size={15} className="text-[#027DFD] dark:text-[#00C7FF]" />
                      <span>{t.resume.experienceTitle}</span>
                    </h2>

                    <div className="space-y-3.5">
                      {EXPERIENCES.map((exp, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/85 dark:border-white/10 space-y-2.5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div>
                              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                                {exp.role}
                              </h3>
                              <div className="text-xs font-semibold text-[#027DFD] dark:text-[#00C7FF]">
                                {exp.organization} · {exp.location}
                              </div>
                            </div>
                            <span className="self-start sm:self-center text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10">
                              {exp.period}
                            </span>
                          </div>
                          <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            {exp.description}
                          </p>
                          <ul className="space-y-1.5 pt-1">
                            {exp.achievements.map((ach, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-snug"
                              >
                                <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                                <span>{ach}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Production Projects */}
                  <div className="space-y-3">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <FolderGit2 size={15} className="text-[#027DFD] dark:text-[#00C7FF]" />
                      <span>{t.resume.projectsTitle}</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {FEATURED_PROJECTS.map((proj) => (
                        <div
                          key={proj.id}
                          className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/85 dark:border-white/10 flex flex-col justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                                {proj.name}
                              </h3>
                              {proj.links.googlePlay && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                  <Star size={10} fill="currentColor" />
                                  Google Play
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {proj.subtitle}
                            </p>
                            <div className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400 mt-2">
                              {proj.technologies.slice(0, 4).join(' · ')}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-white/8 text-xs">
                            {proj.links.googlePlay && (
                              <a
                                href={proj.links.googlePlay}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
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
                                className="text-[#027DFD] dark:text-[#00C7FF] font-bold hover:underline inline-flex items-center gap-1"
                              >
                                <span>Source</span>
                                <ArrowUpRight size={11} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Academic Degree */}
                  <div className="space-y-3">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <GraduationCap size={15} className="text-[#027DFD] dark:text-[#00C7FF]" />
                      <span>{t.resume.educationTitle}</span>
                    </h2>

                    <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/85 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                          {t.experience.degreeTitle}
                        </h3>
                        <div className="text-xs text-[#027DFD] dark:text-[#00C7FF] font-bold mt-0.5">
                          {t.experience.faculty} · {t.experience.university}
                        </div>
                        <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-2">
                          {EDUCATION_DATA.coursework.slice(0, 6).join(' · ')}
                        </div>
                      </div>
                      <div className="sm:text-end shrink-0">
                        <div className="text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold">
                          {EDUCATION_DATA.period}
                        </div>
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {t.experience.gpa}
                        </div>
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
