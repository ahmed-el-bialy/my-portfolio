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
  const { dir } = useLanguage();
  const [copiedPath, setCopiedPath] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useAccessibleDialog(isOpen, onClose, dialogRef);

  if (typeof document === 'undefined') return null;

  const handleCopyPath = async () => {
    const ok = await copyToClipboard('screenshots/cover.png');
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
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
              aria-label="Close modal"
              className="absolute top-4 end-4 sm:top-5 sm:end-5 w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="mb-6 pe-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0284ff]/10 border border-[#0284ff]/20 text-[#0369a1] dark:text-[#38bdf8] text-xs font-semibold uppercase tracking-wider mb-2">
                <ImageIcon size={14} />
                <span>Project Cover Specification</span>
              </div>
              <h3 id="cover-guidelines-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                دليل أبعاد ومسار غلاف المشاريع
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 mt-1">
                كيف تضيف غلاف مخصص لأي ريبو على GitHub ليظهر أوتوماتيكياً في البورتفوليو.
              </p>
            </div>

            {/* Specs Table Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-center">
                <div className="text-[11px] text-slate-600 dark:text-gray-400">نسبة الأبعاد</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">16 : 9</div>
                <div className="text-[10px] text-[#0369a1] dark:text-[#38bdf8] mt-0.5 font-medium">Widescreen</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-center">
                <div className="text-[11px] text-slate-600 dark:text-gray-400">الأبعاد الموصى بها</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">1200×675</div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium">بكسل (HD)</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-center">
                <div className="text-[11px] text-slate-600 dark:text-gray-400">الصيغ المدعومة</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono">PNG / WebP</div>
                <div className="text-[10px] text-[#0369a1] dark:text-blue-400 mt-0.5 font-medium">أو JPEG</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-center">
                <div className="text-[11px] text-slate-600 dark:text-gray-400">أقصى حجم للملف</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">&lt; 1.5 MB</div>
                <div className="text-[10px] text-purple-700 dark:text-purple-400 mt-0.5 font-medium">لسرعة التحميل</div>
              </div>
            </div>

            {/* Folder Structure Visualizer */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0d0e15] border border-slate-200 dark:border-white/10 mb-6">
              <div className="flex items-center justify-between mb-3 text-xs text-slate-600 dark:text-gray-400">
                <span className="font-semibold text-slate-900 dark:text-gray-200">مسار الملف داخل المستودع (Repository Root):</span>
                <button
                  type="button"
                  onClick={handleCopyPath}
                  className="flex items-center gap-1 text-[#0369a1] dark:text-[#38bdf8] hover:underline transition-colors cursor-pointer font-medium min-h-[36px] sm:min-h-0"
                >
                  {copiedPath ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copiedPath ? 'تم النسخ!' : 'نسخ المسار'}</span>
                </button>
              </div>

              <div dir="ltr" className="font-mono text-xs text-slate-200 bg-slate-900 dark:bg-black/60 p-4 rounded-xl border border-black/10 dark:border-white/5 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <Folder size={14} /> My-Flutter-Project/
                </div>
                <div className="flex items-center gap-2 ps-4 text-emerald-400 font-bold">
                  <Folder size={14} /> screenshots/
                </div>
                <div className="flex items-center gap-2 ps-8 text-cyan-300 font-bold bg-cyan-950/60 p-1 rounded">
                  <FileImage size={14} /> cover.png <span className="text-[11px] text-gray-400">(أو cover.jpg) ← الغلاف التلقائي</span>
                </div>
                <div className="flex items-center gap-2 ps-4 text-gray-400">
                  <Folder size={14} /> lib/
                </div>
                <div className="flex items-center gap-2 ps-4 text-gray-400">
                  <Folder size={14} /> assets/
                </div>
                <div className="ps-4 text-gray-400">├── pubspec.yaml</div>
                <div className="ps-4 text-gray-400">└── README.md</div>
              </div>
            </div>

            {/* Fallback Info */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
              <ShieldCheck size={20} className="text-[#0369a1] dark:text-[#38bdf8] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white block mb-0.5">ماذا يحدث إذا لم تضع صورة غلاف في الريبو؟</strong>
                البورتفوليو مزود بمحرك غلاف تلقائي فوري ينشئ كارت إلكتروني أنيق باسم المشروع، ولغة البرمجة، والشبكة الرقمية حتى لا يظهر أي كارت فارغ على الإطلاق!
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
