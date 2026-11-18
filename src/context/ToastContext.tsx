import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Info, X } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { BrandLogoMark } from '../components/BrandLogoMark';

export interface ToastPayload {
  message: string;
  detail?: string;
  tone?: 'success' | 'info';
}

interface ActiveToast extends ToastPayload {
  id: number;
}

interface ToastContextType {
  showToast: (payload: string | ToastPayload) => void;
  dismissToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_AUTO_DISMISS_MS = 2400;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { dir, lang } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const timerRef = useRef<number | null>(null);
  const idCounterRef = useRef(0);

  const dismissToast = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback((payload: string | ToastPayload) => {
    const normalized: ToastPayload =
      typeof payload === 'string' ? { message: payload, tone: 'success' } : payload;

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    idCounterRef.current += 1;
    setToast({
      id: idCounterRef.current,
      message: normalized.message,
      detail: normalized.detail,
      tone: normalized.tone ?? 'success',
    });

    timerRef.current = window.setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, TOAST_AUTO_DISMISS_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Unified Non-Blocking Micro-Toast Stage */}
      <div
        dir={dir}
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-24 md:bottom-6 inset-x-0 z-[120] flex justify-center px-4 pointer-events-none select-none"
      >
        <AnimatePresence mode="wait">
          {toast && (
            <motion.div
              key={toast.id}
              role="status"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto inline-flex items-center gap-2.5 max-w-[92vw] sm:max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200/95 dark:border-white/14 bg-white/90 dark:bg-[#0f1117]/90 backdrop-blur-md shadow-[0_14px_34px_-10px_rgba(2,125,253,0.22)] dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.72)]"
            >
              {/* Branded Leaf Emblem paired with Check Confirmation */}
              <div className="relative flex items-center justify-center shrink-0">
                <BrandLogoMark sizeClassName="w-6 h-6" alt="Brand Emblem" />
                <span
                  className={`absolute -bottom-0.5 -end-0.5 w-3.5 h-3.5 rounded-full border border-white dark:border-[#0f1117] flex items-center justify-center ${
                    toast.tone === 'info'
                      ? 'bg-[#027DFD] text-white'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {toast.tone === 'info' ? (
                    <Info size={8} strokeWidth={3} />
                  ) : (
                    <Check size={8} strokeWidth={3.2} />
                  )}
                </span>
              </div>

              <div className="min-w-0 flex items-baseline gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                  {toast.message}
                </span>
                {toast.detail && (
                  <span
                    dir="ltr"
                    className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[155px] sm:max-w-[220px]"
                  >
                    {toast.detail}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={dismissToast}
                aria-label={lang === 'ar' ? 'إغلاق الإشعار' : 'Dismiss notification'}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
