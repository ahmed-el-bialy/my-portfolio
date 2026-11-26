import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Check, Copy, Folder, FileImage, ShieldCheck } from 'lucide-react';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';
import { useLanguage } from '../context/LanguageContext';
import { copyToClipboard } from '../utils/clipboard';

interface CoverGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoverGuidelinesModal: React.FC<CoverGuidelinesModalProps> = ({ isOpen, onClose }) => {
  const { dir, lang } = useLanguage();
  const [copiedPath, setCopiedPath] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useAccessibleDialog(isOpen, onClose, dialogRef);

  if (typeof document === 'undefined') return null;

  const isAr = lang === 'ar';

  const handleCopyPath = async () => {
    const ok = await copyToClipboard('Screenshots/Covers/');
    if (!ok) return;
    setCopiedPath(true);
    window.setTimeout(() => setCopiedPath(false), 2000);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="cover-guidelines-backdrop"
          dir={dir}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-[115] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cover-guidelines-title"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl my-auto bg-white dark:bg-[#14151f] border border-black/10 dark:border-white/15 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-8 max-h-[92vh] overflow-y-auto focus:outline-none"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label={isAr ? 'إغلاق الدليل' : 'Close guide'}
              className="absolute top-4 end-4 sm:top-5 sm:end-5 w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="mb-6 pe-12">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8] mb-1.5">
                <ImageIcon size={14} />
                <span>{isAr ? 'دليل مواصفات الأغلفة' : 'Project Cover Specification'}</span>
              </div>
              <h3 id="cover-guidelines-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isAr ? 'دليل أبعاد ومسار أغلفة المشاريع' : 'Cover Dimensions & Repo Path Guide'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 mt-1 leading-relaxed">
                {isAr
                  ? 'ضع صورة أو عدة صور غلاف داخل مجلد Screenshots/Covers في مستودع GitHub لتظهر تلقائياً في الكروت وقسم Covers.'
                  : 'Place one or more 4:3 cover images inside Screenshots/Covers in your GitHub repo to display automatically on cards and in the Covers section.'}
              </p>
            </div>

            {/* Specs Table Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 text-center">
                <div className="text-[11px] text-slate-600 dark:text-gray-400">
                  {isAr ? 'نسبة الأبعاد' : 'Aspect Ratio'}
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">4 : 3</div>
                <div className="text-[10px] text-[#0369a1] dark:text-[#38bdf8] mt-0.5 font-medium">
                  {isAr ? 'مطابقة للكارت' : 'Card Matched'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 text-center">
                <div className="text-[11px] text-slate-600 dark:text-gray-400">
                  {isAr ? 'الأبعاد الموصى بها' : 'Recommended Size'}
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">1200×900</div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium">
                  {isAr ? 'بكسل (أو 1600×1200)' : 'px (or 1600×1200)'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 text-center">
                <div className="text-[11px] text-slate-600 dark:text-gray-400">
                  {isAr ? 'الصيغ المدعومة' : 'Formats'}
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono">PNG / WebP</div>
                <div className="text-[10px] text-[#0369a1] dark:text-blue-400 mt-0.5 font-medium">
                  {isAr ? 'أو JPEG' : 'or JPEG'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 text-center">
                <div className="text-[11px] text-slate-600 dark:text-gray-400">
                  {isAr ? 'أقصى حجم للملف' : 'Max File Size'}
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">&lt; 1.5 MB</div>
                <div className="text-[10px] text-purple-700 dark:text-purple-400 mt-0.5 font-medium">
                  {isAr ? 'لسرعة التحميل' : 'Fast Delivery'}
                </div>
              </div>
            </div>

            {/* Folder Structure Visualizer */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0d0e15] border border-slate-200 dark:border-white/10 mb-6">
              <div className="flex items-center justify-between mb-3 text-xs text-slate-600 dark:text-gray-400">
                <span className="font-semibold text-slate-900 dark:text-gray-200">
                  {isAr ? 'مسار المجلد داخل المستودع (Repository Root):' : 'Repository Folder Structure:'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPath}
                  className="flex items-center gap-1 text-[#0369a1] dark:text-[#38bdf8] hover:underline transition-colors cursor-pointer font-medium min-h-[36px] sm:min-h-0"
                >
                  {copiedPath ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>
                    {copiedPath
                      ? isAr
                        ? 'تم النسخ!'
                        : 'Copied!'
                      : isAr
                      ? 'نسخ المسار'
                      : 'Copy Path'}
                  </span>
                </button>
              </div>

              <div dir="ltr" className="font-mono text-xs text-slate-200 bg-slate-900 dark:bg-black/60 p-4 rounded-xl border border-black/10 dark:border-white/5 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <Folder size={14} /> My-Flutter-Project/
                </div>
                <div className="flex items-center gap-2 ps-4 text-emerald-400 font-bold">
                  <Folder size={14} /> Screenshots/
                </div>
                <div className="flex items-center gap-2 ps-8 text-cyan-300 font-bold bg-cyan-950/60 p-1.5 rounded">
                  <Folder size={14} /> Covers/ <span className="text-[11px] text-gray-300 font-normal">← {isAr ? 'ضع صور الغلاف 4:3 هنا (cover-1.png، cover-2.jpg...)' : 'Place 4:3 covers here (cover-1.png, cover-2.jpg...)'}</span>
                </div>
                <div className="flex items-center gap-2 ps-8 text-slate-300">
                  <FileImage size={14} /> home_screen.png <span className="text-[11px] text-gray-400">← {isAr ? 'شاشات الموبايل 9:16 تبقى هنا' : '9:16 mobile app screens stay here'}</span>
                </div>
                <div className="flex items-center gap-2 ps-4 text-gray-400">
                  <Folder size={14} /> covers/ <span className="text-[11px] text-gray-500">({isAr ? 'مدعوم أيضاً في الجذر' : 'also supported at root'})</span>
                </div>
                <div className="ps-4 text-gray-400">├── pubspec.yaml</div>
                <div className="ps-4 text-gray-400">└── README.md</div>
              </div>
            </div>

            {/* Fallback Info */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
              <ShieldCheck size={20} className="text-[#0369a1] dark:text-[#38bdf8] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white block mb-0.5">
                  {isAr ? 'مزامنة تلقائية مع شاشات التطبيق:' : 'Automatic Cover & Screen Alternation:'}
                </strong>
                {isAr
                  ? 'أي صور تُضاف في Screenshots/Covers أو covers/ تُعرض كغلاف 4:3 كامل وتتبادل تلقائياً وبانسيابية مع شاشات التطبيق، وتظهر جميعها في قسم Covers قبل الجاليري. استخدم زر "مزامنة" إذا رفعت صوراً جديدة للتو.'
                  : 'Images inside Screenshots/Covers or covers/ render as full 4:3 covers, smoothly alternate with app screens on project cards, and appear in the dedicated Covers section before the gallery. Click Sync after pushing new files.'}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
