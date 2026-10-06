import React, { useState } from 'react';
import { X, Image as ImageIcon, Check, Copy, Folder, FileImage, ShieldCheck } from 'lucide-react';
import { COVER_IMAGE_SPECS } from '../services/githubService';

interface CoverGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoverGuidelinesModal: React.FC<CoverGuidelinesModalProps> = ({ isOpen, onClose }) => {
  const [copiedPath, setCopiedPath] = useState(false);

  if (!isOpen) return null;

  const handleCopyPath = () => {
    navigator.clipboard.writeText("screenshots/cover.png");
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#14151f] border border-black/10 dark:border-white/15 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ImageIcon size={14} />
            <span>Project Cover Specification</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            دليل أبعاد ومسار غلاف المشاريع
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 mt-1">
            كيف تضيف غلاف مخصص لأي ريبو على GitHub ليظهر أوتوماتيكياً في البورتفوليو.
          </p>
        </div>

        {/* Specs Table Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-center">
            <div className="text-[11px] text-slate-500 dark:text-gray-400">نسبة الأبعاد</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono">16 : 9</div>
            <div className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-0.5">Widescreen</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-center">
            <div className="text-[11px] text-slate-500 dark:text-gray-400">الأبعاد الموصى بها</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono">1200×675</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">بكسل (HD)</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-center">
            <div className="text-[11px] text-slate-500 dark:text-gray-400">الصيغ المدعومة</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono">PNG / WebP</div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">أو JPEG</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-center">
            <div className="text-[11px] text-slate-500 dark:text-gray-400">أقصى حجم للملف</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono">&lt; 1.5 MB</div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">لسرعة التحميل</div>
          </div>
        </div>

        {/* Folder Structure Visualizer */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0d0e15] border border-slate-200 dark:border-white/10 mb-6">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-600 dark:text-gray-400">
            <span className="font-semibold text-slate-900 dark:text-gray-200">مسار الملف داخل المستودع (Repository Root):</span>
            <button
              onClick={handleCopyPath}
              className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline transition-colors cursor-pointer font-medium"
            >
              {copiedPath ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{copiedPath ? 'تم النسخ!' : 'نسخ المسار'}</span>
            </button>
          </div>

          <div className="font-mono text-xs text-slate-200 bg-slate-900 dark:bg-black/60 p-4 rounded-xl border border-black/10 dark:border-white/5 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Folder size={14} /> My-Flutter-Project/
            </div>
            <div className="flex items-center gap-2 pl-4 text-emerald-400 font-bold">
              <Folder size={14} /> screenshots/
            </div>
            <div className="flex items-center gap-2 pl-8 text-cyan-300 font-bold bg-cyan-950/60 p-1 rounded">
              <FileImage size={14} /> cover.png <span className="text-[11px] text-gray-400">(أو cover.jpg) ← الغلاف التلقائي</span>
            </div>
            <div className="flex items-center gap-2 pl-4 text-gray-500">
              <Folder size={14} /> lib/
            </div>
            <div className="flex items-center gap-2 pl-4 text-gray-500">
              <Folder size={14} /> assets/
            </div>
            <div className="pl-4 text-gray-500">├── pubspec.yaml</div>
            <div className="pl-4 text-gray-500">└── README.md</div>
          </div>
        </div>

        {/* What happens if you don't upload a cover? */}
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
          <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
            <strong className="text-slate-900 dark:text-white block mb-0.5">ماذا يحدث إذا لم تضع صورة غلاف في الريبو؟</strong>
            البورتفوليو مزود بمحرك غلاف تلقائي فوري ينشئ كارت إلكتروني أنيق باسم المشروع، ولغة البرمجة، والشبكة الرقمية حتى لا يظهر أي كارت فارغ على الإطلاق!
          </div>
        </div>

      </div>
    </div>
  );
};
