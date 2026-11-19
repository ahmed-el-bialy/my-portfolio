import React from 'react';
import { AlertTriangle, Home, RefreshCw, RotateCcw } from 'lucide-react';

interface RootErrorBoundaryProps {
  children: React.ReactNode;
}

interface RootErrorBoundaryState {
  hasError: boolean;
  recoveryEpoch: number;
}

function detectPreferredLang(): 'ar' | 'en' {
  try {
    const htmlLang = document.documentElement?.lang;
    if (htmlLang === 'ar' || htmlLang === 'en') return htmlLang;
    const saved = window.localStorage.getItem('ahmed_portfolio_lang_v3');
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    // Storage unavailable
  }
  return 'en';
}

export class RootErrorBoundary extends React.Component<
  RootErrorBoundaryProps,
  RootErrorBoundaryState
> {
  constructor(props: RootErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      recoveryEpoch: 0,
    };
  }

  static getDerivedStateFromError(): Partial<RootErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (import.meta.env.DEV) {
      console.error('[RootErrorBoundary]', error);
    }
  }

  private handleBackToOverview = () => {
    try {
      if (typeof window !== 'undefined') {
        if (window.location.hash !== '#overview') {
          window.history.replaceState(null, '', '#overview');
        }
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    } catch {
      // Ignore history/scroll errors
    }

    this.setState((prev) => ({
      hasError: false,
      recoveryEpoch: prev.recoveryEpoch + 1,
    }));
  };

  private handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      recoveryEpoch: prev.recoveryEpoch + 1,
    }));
  };

  private handleReload = () => {
    try {
      window.location.reload();
    } catch {
      this.handleBackToOverview();
    }
  };

  render() {
    if (!this.state.hasError) {
      return (
        <React.Fragment key={this.state.recoveryEpoch}>
          {this.props.children}
        </React.Fragment>
      );
    }

    const lang = detectPreferredLang();
    const dir = lang === 'ar' ? 'rtl' : 'ltr';

    return (
      <div
        dir={dir}
        className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] dark:bg-[#08090d] text-slate-900 dark:text-slate-100 p-4 sm:p-6"
      >
        <div
          role="alert"
          aria-live="assertive"
          className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 text-center space-y-6"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/12 border border-amber-500/25 flex items-center justify-center text-amber-500">
            <AlertTriangle size={26} />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight [text-wrap:balance]">
              {lang === 'ar'
                ? 'حدث خطأ غير متوقع في عرض الصفحة'
                : 'Something unexpected interrupted this view'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              {lang === 'ar'
                ? 'لا تقلق — بيانات الموقع سليمة. يمكنك العودة إلى الشاشة الرئيسية فوراً، أو تحديث الصفحة، أو إعادة المحاولة.'
                : 'No need to worry — the portfolio is safe. You can return to the Overview screen right away, reload the page, or try again.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={this.handleBackToOverview}
              className="btn-kinetic inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#0284ff] hover:bg-[#0070e0] text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Home size={15} />
              <span>{lang === 'ar' ? 'العودة إلى الرئيسية' : 'Back to Overview'}</span>
            </button>

            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors"
            >
              <RotateCcw size={15} />
              <span>{lang === 'ar' ? 'تحديث الصفحة' : 'Reload Page'}</span>
            </button>

            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#0284ff] dark:hover:text-[#00C7FF] hover:bg-slate-100/70 dark:hover:bg-white/[0.04] text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors"
            >
              <RefreshCw size={14} />
              <span>{lang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
