import React, { useState, useEffect } from 'react';
import { Check, Copy, FileCode2 } from 'lucide-react';
import { DART_ARCHITECTURE_SNIPPETS, DartSnippetSpec } from '../data/config';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface DartCodeShowcaseProps {
  isDark?: boolean;
  compact?: boolean;
}

export const DartCodeShowcase: React.FC<DartCodeShowcaseProps> = ({
  isDark = true,
  compact = false,
}) => {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [activeId, setActiveId] = useState<string>(DART_ARCHITECTURE_SNIPPETS[0].id);
  const [highlightedMap, setHighlightedMap] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeSnippet: DartSnippetSpec =
    DART_ARCHITECTURE_SNIPPETS.find((s) => s.id === activeId) || DART_ARCHITECTURE_SNIPPETS[0];

  const cacheKey = `${activeSnippet.id}-${isDark ? 'dark' : 'light'}`;
  const highlightedHtml = highlightedMap[cacheKey];

  useEffect(() => {
    let cancelled = false;
    if (highlightedMap[cacheKey]) return;

    import('shiki')
      .then(async ({ codeToHtml }) => {
        const html = await codeToHtml(activeSnippet.code, {
          lang: 'dart',
          theme: isDark ? 'github-dark-default' : 'github-light-default',
        });
        if (!cancelled) {
          setHighlightedMap((prev) => ({ ...prev, [cacheKey]: html }));
        }
      })
      .catch(() => {
        // Fallback pre/code renders automatically
      });

    return () => {
      cancelled = true;
    };
  }, [activeSnippet.code, cacheKey, isDark, highlightedMap]);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopiedId(activeSnippet.id);
    showToast({
      message: lang === 'ar' ? 'تم نسخ كود Dart' : 'Dart snippet copied',
      detail: activeSnippet.fileName,
    });
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] overflow-hidden shadow-lg">
      {/* File Tabs Bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-50 dark:bg-[#161b27] border-b border-slate-200 dark:border-white/8 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-0">
          {DART_ARCHITECTURE_SNIPPETS.map((snippet) => {
            const isActive = snippet.id === activeSnippet.id;
            return (
              <button
                key={snippet.id}
                type="button"
                onClick={() => setActiveId(snippet.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#027DFD] text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileCode2 size={12} className="shrink-0" />
                <span>{snippet.fileName}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
          aria-label={lang === 'ar' ? 'نسخ الكود' : 'Copy Dart code'}
        >
          {copiedId === activeSnippet.id ? (
            <>
              <Check size={12} className="text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">
                {lang === 'ar' ? 'تم' : 'Copied'}
              </span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span className="hidden sm:inline">{lang === 'ar' ? 'نسخ' : 'Copy'}</span>
            </>
          )}
        </button>
      </div>

      {/* Metadata Header */}
      <div className="flex items-center justify-between px-4 py-2 text-[11px] font-mono border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#0f1117]">
        <span className="text-[#027DFD] dark:text-[#00C7FF] font-semibold">
          {activeSnippet.projectLabel}
        </span>
        <span className="text-slate-500 dark:text-slate-400">{activeSnippet.layerTag}</span>
      </div>

      {/* Shiki Output / Instant Monospace Fallback */}
      <div
        dir="ltr"
        className={`flex-1 overflow-auto text-left font-mono text-[11.5px] sm:text-xs leading-relaxed p-4 bg-white dark:bg-[#0d1117] ${
          compact ? 'max-h-[300px]' : 'max-h-[360px]'
        }`}
      >
        {highlightedHtml ? (
          <div
            className="[&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0 [&_code]:!font-mono"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre className="text-slate-800 dark:text-slate-200 font-mono whitespace-pre overflow-x-auto">
            <code>{activeSnippet.code}</code>
          </pre>
        )}
      </div>
    </div>
  );
};
