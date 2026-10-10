import React from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ShieldAlert, ArrowUpRight, Smartphone, CheckCircle, ExternalLink } from 'lucide-react';
import { Project } from '../data/portfolioData';
import { useScrollLock } from '../hooks/useScrollLock';
import { useLanguage } from '../context/LanguageContext';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  useScrollLock(isOpen);
  const { lang, dir } = useLanguage();

  if (!isOpen || !project) return null;

  const downloadUrl = project.links.apkDownloadUrl || (project.repoName ? `https://github.com/ahmed-el-bialy/${project.repoName}/releases/latest` : project.links.github);

  const node = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg my-auto bg-white dark:bg-[#121422] border border-slate-200 dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#17192a] border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-xs shrink-0">
              <Download size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{lang === 'ar' ? `تحميل ملف APK لتطبيق ${project.name}` : `Download ${project.name} APK`}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">
                {lang === 'ar' ? 'حزمة أندرويد • نسخة إصدار رسمية' : 'Android Package • Release Build'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-gray-300">
          {/* App Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Smartphone size={18} />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-900 dark:text-white block truncate">{project.name}</span>
              <span className="text-xs text-slate-500 dark:text-gray-400 truncate block">{project.subtitle}</span>
            </div>
          </div>

          {/* Security & Risk Warning Box */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-700 dark:text-amber-400">
              <ShieldAlert size={18} className="shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{lang === 'ar' ? 'تنبيه الأمان والتثبيت الخارجي' : 'Installation & Security Notice'}</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-950/80 dark:text-amber-200/90 font-sans">
              <strong>{lang === 'ar' ? 'ملاحظة:' : 'Notice:'}</strong> {lang === 'ar' 
                ? 'ملفات الـ APK هي حزم أندرويد مستقلة يتم تنزيلها مباشرة. لتثبيتها على هاتفك، قد تحتاج إلى تفعيل إذن "تثبيت التطبيقات من مصادر غير معروفة" في إعدادات حماية جهازك الأندرويد.'
                : 'APK files are standalone Android packages distributed outside the Google Play Store. To test or sideload this build on your device, you may need to grant permission to "Install unknown apps" in your Android security settings.'}
            </p>
            <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
              {lang === 'ar' ? '⚠️ يتم تنزيل وتثبيت ملفات APK على مسؤولية واختيار المستخدم لأغراض الاختبار والتجربة.' : '⚠️ APK files are downloaded and installed at the user\'s own risk and discretion.'}
            </p>
          </div>

          {/* Sideloading Quick Steps */}
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-400">
            <span className="font-bold text-slate-900 dark:text-white block">{lang === 'ar' ? 'خطوات التثبيت على الهاتف:' : 'Installation Steps:'}</span>
            <div className="flex items-center gap-2 text-[11px]">
              <CheckCircle size={12} className="text-emerald-500 shrink-0" />
              <span>{lang === 'ar' ? '1. اضغط على زر التحميل لحفظ ملف .apk على جهازك الأندرويد.' : '1. Download the `.apk` file to your Android smartphone or tablet.'}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <CheckCircle size={12} className="text-emerald-500 shrink-0" />
              <span>{lang === 'ar' ? '2. افتح الملف واضغط موافقة على التثبيت من المصادر غير المعروفة.' : '2. Tap the file in your downloads and allow installation from unknown sources.'}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <CheckCircle size={12} className="text-emerald-500 shrink-0" />
              <span>{lang === 'ar' ? '3. افتح التطبيق واستمتع بتجربة كافة الميزات مباشرة.' : '3. Launch the app and test live features.'}</span>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#17192a] border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {project.links.googlePlay && (
              <a
                href={project.links.googlePlay}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <ArrowUpRight size={13} />
                <span>Google Play</span>
              </a>
            )}

            {project.links.apkDownloadUrl ? (
              <a
                href={project.links.apkDownloadUrl}
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md hover:shadow-purple-600/30"
              >
                <Download size={14} />
                <span>{lang === 'ar' ? 'تحميل APK مباشر' : 'Direct APK Download'}</span>
                <ExternalLink size={12} />
              </a>
            ) : (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md hover:shadow-purple-600/30"
              >
                <Download size={14} />
                <span>{lang === 'ar' ? 'عرض الإصدار على GitHub' : 'View Release on GitHub'}</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(node, document.body) : null;
};
