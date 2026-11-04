import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Award,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Building2,
  Copy,
  Check,
  Sparkles,
  FileText,
  Eye,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { CertificateItem } from '../data/portfolioData';
import { useScrollLock } from '../hooks/useScrollLock';
import { useLanguage } from '../context/LanguageContext';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateItem | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificate,
}) => {
  useScrollLock(isOpen);
  const { lang, dir } = useLanguage();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeView, setActiveView] = useState<'details' | 'webview'>('details');

  useEffect(() => {
    if (isOpen) {
      setActiveView('details');
    }
  }, [isOpen, certificate]);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !certificate) return null;

  const handleCopyLink = () => {
    if (!certificate.credentialUrl) return;
    navigator.clipboard.writeText(certificate.credentialUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  // Convert Google Drive view URL to preview URL for embedding in webview mode if applicable
  const embedUrl = certificate.credentialUrl?.includes('drive.google.com')
    ? certificate.credentialUrl.replace('/view?usp=drive_link', '/preview').replace('/view', '/preview')
    : certificate.credentialUrl;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      dir={dir}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl shadow-blue-900/20 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 pb-4 sm:pb-5 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
              <Award size={22} className="sm:size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs font-semibold">
                  <ShieldCheck size={13} className="shrink-0" />
                  {lang === 'ar' ? 'اعتماد موثّق ورسمي' : 'Officially Verified Credential'}
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-slate-500 dark:text-gray-400 bg-slate-200/60 dark:bg-white/5 px-2 py-0.5 rounded-md">
                  {certificate.date}
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {certificate.title}
              </h3>
              <p className="text-xs sm:text-sm text-cyan-600 dark:text-cyan-400 font-semibold mt-0.5 flex items-center gap-1.5">
                <Building2 size={13} className="shrink-0" />
                {certificate.issuer}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200/70 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-gray-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* View Mode Switcher: Details vs Interactive Web View */}
        {certificate.credentialUrl && (
          <div className="px-5 sm:px-6 pt-3 pb-1 border-b border-slate-200/60 dark:border-white/5 flex items-center gap-2">
            <button
              onClick={() => setActiveView('details')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'details'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <FileText size={13} />
              <span>{lang === 'ar' ? 'تفاصيل الشهادة والمهارات' : 'Certificate Details'}</span>
            </button>
            <button
              onClick={() => setActiveView('webview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'webview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Eye size={13} />
              <span>{lang === 'ar' ? 'معاينة الويب المباشرة' : 'Interactive Web View'}</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5">
          {activeView === 'details' ? (
            <>
              {/* Comprehensive Description */}
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-cyan-500" />
                  {lang === 'ar' ? 'نبذة عن البرنامج والتدريب العملي' : 'Program Overview & Scope'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed bg-slate-50 dark:bg-white/[0.02] p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-white/5">
                  {certificate.description}
                </p>
              </div>

              {/* Skills Acquired */}
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  {lang === 'ar' ? 'التقنيات والمهارات المكتسبة' : 'Verified Skills & Tooling'}
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {certificate.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 sm:px-3 py-1 rounded-xl bg-blue-500/10 dark:bg-cyan-500/10 border border-blue-500/20 dark:border-cyan-500/20 text-blue-700 dark:text-cyan-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verification & Issuer Details Card */}
              <div className="bg-slate-100/80 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200/90 dark:border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-gray-400 font-medium">
                    {lang === 'ar' ? 'الجهة المانحة' : 'Issuing Organization'}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{certificate.issuer}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-gray-400 font-medium">
                    {lang === 'ar' ? 'تاريخ الإتمام والاعتماد' : 'Issue Date'}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{certificate.date}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-gray-400 font-medium">
                    {lang === 'ar' ? 'حالة التحقق' : 'Verification Status'}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={13} /> {lang === 'ar' ? 'معتمد رسمي' : 'Verified & Valid'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Interactive Web View Mode */
            <div className="w-full flex flex-col items-center gap-3">
              <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/40 relative shadow-inner">
                {embedUrl && (
                  <iframe
                    src={embedUrl}
                    title={certificate.title}
                    className="w-full h-full border-0"
                    allow="autoplay"
                    loading="lazy"
                  />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 text-center">
                {lang === 'ar'
                  ? 'معاينة حية للوثيقة. يمكنك أيضاً فتح المصدر الرسمي عبر الزر بالأسفل.'
                  : 'Live document preview. You can also view the official certificate directly via the button below.'}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
          {certificate.credentialUrl ? (
            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200/70 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-gray-200 text-xs font-semibold transition-all cursor-pointer"
            >
              {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>
                {copiedLink
                  ? lang === 'ar'
                    ? 'تم نسخ الرابط!'
                    : 'Link Copied!'
                  : lang === 'ar'
                  ? 'نسخ رابط الشهادة'
                  : 'Copy Credential Link'}
              </span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {certificate.credentialUrl && (
              <a
                href={certificate.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              >
                <span>{lang === 'ar' ? 'التحقق من الرابط الرسمي' : 'Verify Official Credential'}</span>
                <ExternalLink size={14} />
              </a>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-xs font-semibold transition-all cursor-pointer"
            >
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
