import React, { useMemo, useState } from 'react';
import {
  Layers,
  Smartphone,
  GitBranch,
  Database,
  ArrowRight,
  ArrowDown,
  FolderTree,
  Terminal,
  Copy,
  Check,
  Workflow,
  ChevronRight,
} from 'lucide-react';
import { Project } from '../data/portfolioData';
import { RepoReleaseInfo } from '../services/githubService';
import { copyToClipboard } from '../utils/clipboard';
import { useToast } from '../context/ToastContext';

type ArchLayerId = 'presentation' | 'domain' | 'data';

interface ProjectArchitectureInspectorProps {
  lang: 'en' | 'ar';
  dir: 'ltr' | 'rtl';
  project: Project;
  repoName: string;
  githubRepoUrl: string;
  techStack: string[];
  architectureNotes: string[];
  folderTree?: string;
  releaseInfo: RepoReleaseInfo;
  realApkSizeLabel: string | null;
}

const InlineCopyButton: React.FC<{
  value: string;
  label?: string;
  lang: 'en' | 'ar';
}> = ({ value, label, lang }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyToClipboard(value);
        if (!ok) return;
        setCopied(true);
        showToast({
          message: lang === 'ar' ? 'تم النسخ للحافظة' : 'Copied to clipboard',
          detail: value.split('\n')[0],
        });
        window.setTimeout(() => setCopied(false), 1800);
      }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer text-[11px] font-mono shrink-0"
    >
      {copied ? (
        <>
          <Check size={12} className="text-emerald-400" />
          <span className="text-emerald-400">Copied</span>
        </>
      ) : (
        <>
          <Copy size={12} />
          <span>{label || 'Copy'}</span>
        </>
      )}
    </button>
  );
};

function classifyStackByLayer(stack: string[]): Record<ArchLayerId, string[]> {
  const presentation: string[] = [];
  const domain: string[] = [];
  const data: string[] = [];

  for (const raw of stack) {
    const lower = raw.toLowerCase();
    if (
      lower.includes('hive') ||
      lower.includes('dio') ||
      lower.includes('http') ||
      lower.includes('retrofit') ||
      lower.includes('firebase') ||
      lower.includes('firestore') ||
      lower.includes('api') ||
      lower.includes('sqlite') ||
      lower.includes('shared') ||
      lower.includes('cache') ||
      lower.includes('json')
    ) {
      data.push(raw);
    } else if (
      lower.includes('clean') ||
      lower.includes('solid') ||
      lower.includes('dart') ||
      lower.includes('usecase') ||
      lower.includes('repository') ||
      lower.includes('entity') ||
      lower.includes('getit') ||
      lower.includes('di') ||
      lower.includes('either')
    ) {
      domain.push(raw);
    } else {
      presentation.push(raw);
    }
  }

  return {
    presentation:
      presentation.length > 0 ? presentation.slice(0, 6) : ['Flutter UI', 'Cubit / BLoC'],
    domain: domain.length > 0 ? domain.slice(0, 6) : ['Pure Dart', 'Clean Architecture'],
    data: data.length > 0 ? data.slice(0, 6) : ['Repository Impl', 'Datasources'],
  };
}

export const ProjectArchitectureInspector: React.FC<ProjectArchitectureInspectorProps> = ({
  lang,
  dir,
  project,
  repoName,
  githubRepoUrl,
  techStack,
  architectureNotes,
  folderTree,
  releaseInfo,
  realApkSizeLabel,
}) => {
  const [activeLayer, setActiveLayer] = useState<ArchLayerId>('presentation');
  const isRtl = dir === 'rtl';

  const layerTechMap = useMemo(() => classifyStackByLayer(techStack), [techStack]);

  const layers = useMemo(
    () => [
      {
        id: 'presentation' as ArchLayerId,
        step: '01',
        title: lang === 'ar' ? 'طبقة العرض والحالة' : 'Presentation Layer',
        shortTitle: '1. Presentation',
        subtitle: lang === 'ar' ? 'الواجهات وإدارة الحالة' : 'UI Views & State Cubits',
        colorClass: 'text-[#0369a1] dark:text-[#38bdf8]',
        borderActive: 'border-[#0284ff]',
        bgActive: 'bg-[#0284ff]/10 dark:bg-[#0284ff]/15',
        icon: Smartphone,
        description:
          project.architecture?.presentationLayer ||
          (lang === 'ar'
            ? 'واجهات فلاتر المتجاوبة، الشاشات، ومستمعو الحالة (Cubit / BlocBuilder) دون أي منطق بيانات مباشر.'
            : 'Responsive Flutter screens, reusable widgets, and BLoC/Cubit state consumers decoupled from data sources.'),
        inputSignal:
          lang === 'ar'
            ? 'تفاعل المستخدم ← إرسال حدث إلى Cubit / BLoC'
            : 'User Gesture -> Dispatch Cubit / BLoC Event',
        outputSignal:
          lang === 'ar'
            ? 'إعادة بناء ذكية للواجهة حسب الحالة الجديدة'
            : 'Targeted BlocBuilder Rebuild from Emitted State',
        packages: layerTechMap.presentation,
      },
      {
        id: 'domain' as ArchLayerId,
        step: '02',
        title: lang === 'ar' ? 'طبقة المنطق والكيانات' : 'Domain Layer',
        shortTitle: '2. Domain',
        subtitle: lang === 'ar' ? 'منطق الأعمال النقي' : 'Use Cases & Contracts',
        colorClass: 'text-emerald-600 dark:text-emerald-400',
        borderActive: 'border-emerald-500',
        bgActive: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        icon: GitBranch,
        description:
          project.architecture?.domainLayer ||
          (lang === 'ar'
            ? 'منطق الأعمال النقي (Pure Dart)، الكيانات المستقلة، وحالات الاستخدام وعقود المستودعات.'
            : 'Pure Dart business rules, immutable entities, use cases, and abstract repository contracts.'),
        inputSignal:
          lang === 'ar'
            ? 'استدعاء UseCase لتنفيذ قاعدة العمل المحددة'
            : 'Invoke Typed UseCase with Validated Params',
        outputSignal:
          lang === 'ar'
            ? 'إرجاع نتيجة موثقة (Success Entity / Typed Failure)'
            : 'Return Deterministic Entity or Typed Failure',
        packages: layerTechMap.domain,
      },
      {
        id: 'data' as ArchLayerId,
        step: '03',
        title: lang === 'ar' ? 'طبقة البيانات والمصادر' : 'Data Layer',
        shortTitle: '3. Data',
        subtitle: lang === 'ar' ? 'التخزين المحلي والـ APIs' : 'Cache, DTOs & Remote APIs',
        colorClass: 'text-violet-600 dark:text-violet-400',
        borderActive: 'border-violet-500',
        bgActive: 'bg-violet-500/10 dark:bg-violet-500/15',
        icon: Database,
        description:
          project.architecture?.dataLayer ||
          (lang === 'ar'
            ? 'تنفيذ المستودعات، نماذج DTO، والتكامل بين التخزين المحلي (Hive) أو الشبكة (REST / Firebase).'
            : 'Repository implementations, JSON/DTO mapping, local Hive caching, and REST/Firebase data sources.'),
        inputSignal:
          lang === 'ar'
            ? 'جلب البيانات من الكاش المحلي أو مصدر الشبكة'
            : 'Query Local Cache First or Remote Endpoint',
        outputSignal:
          lang === 'ar'
            ? 'تحويل DTO إلى Domain Entity وتحديث التخزين'
            : 'Map Raw DTO to Clean Entity & Persist Cache',
        packages: layerTechMap.data,
      },
    ],
    [lang, project.architecture, layerTechMap]
  );

  const activeLayerObj = layers.find((l) => l.id === activeLayer) || layers[0];

  const handleStepNext = () => {
    const order: ArchLayerId[] = ['presentation', 'domain', 'data'];
    const idx = order.indexOf(activeLayer);
    setActiveLayer(order[(idx + 1) % order.length]);
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers size={18} className="text-[#0369a1] dark:text-[#38bdf8]" />
            <span>
              {lang === 'ar'
                ? 'المخطط المعماري وتدفق البيانات'
                : 'Interactive Clean Architecture & Data Flow'}
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {lang === 'ar'
              ? 'اضغط على أي طبقة لتتبع مسار الطلبات والحزم المستخدمة داخل هذا التطبيق'
              : 'Select any layer node to inspect request flow, state emission, and bound packages'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleStepNext}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-[#0284ff] text-slate-700 dark:text-slate-200 hover:text-white border border-slate-200/80 dark:border-white/10 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Workflow size={13.5} />
          <span>{lang === 'ar' ? 'تتبع الخطوة التالية' : 'Step Data Flow'}</span>
          <ChevronRight size={13} className={isRtl ? 'rotate-180' : ''} />
        </button>
      </div>

      {/* Interactive 3-Node Pipeline Diagram */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/75 dark:bg-white/[0.02] p-4 sm:p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-2.5 items-center">
          {layers.map((layer, index) => {
            const Icon = layer.icon;
            const isSelected = activeLayer === layer.id;

            return (
              <React.Fragment key={layer.id}>
                <button
                  type="button"
                  onClick={() => setActiveLayer(layer.id)}
                  aria-pressed={isSelected}
                  className={`md:col-span-3 text-start p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 min-h-[104px] ${
                    isSelected
                      ? `${layer.borderActive} ${layer.bgActive} shadow-sm`
                      : 'border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0f131f]/80 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold ${layer.colorClass}`}>
                      <Icon size={15} />
                      <span>{layer.shortTitle}</span>
                    </span>
                    <span className="font-mono text-[10.5px] font-bold text-slate-400 dark:text-slate-500 tabular-nums">
                      {layer.step}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                    {layer.subtitle}
                  </p>

                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {layer.packages.slice(0, 2).join(' · ')}
                  </div>
                </button>

                {index < layers.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="md:col-span-1 flex md:flex-col items-center justify-center gap-1 py-1 text-slate-400 dark:text-slate-500"
                  >
                    <span className="hidden md:inline-flex items-center justify-center">
                      <ArrowRight
                        size={16}
                        className={`${
                          isRtl ? 'rotate-180' : ''
                        } ${
                          activeLayer === layer.id || activeLayer === layers[index + 1].id
                            ? 'text-[#0284ff] dark:text-[#38bdf8]'
                            : ''
                        }`}
                      />
                    </span>
                    <span className="md:hidden inline-flex items-center justify-center">
                      <ArrowDown
                        size={16}
                        className={
                          activeLayer === layer.id || activeLayer === layers[index + 1].id
                            ? 'text-[#0284ff] dark:text-[#38bdf8]'
                            : ''
                        }
                      />
                    </span>
                    <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {index === 0 ? 'UseCase' : 'Repo'}
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Synchronized Active Layer Inspector Panel */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-sm font-extrabold ${activeLayerObj.colorClass}`}>
                {activeLayerObj.title}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {repoName}
              </span>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeLayerObj.description}
            </p>

            {/* Bound Packages */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {activeLayerObj.packages.map((pkg) => (
                <span
                  key={pkg}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 text-[11px] font-mono font-semibold text-slate-700 dark:text-[#7DD3FC]"
                >
                  {pkg}
                </span>
              ))}
            </div>
          </div>

          {/* Bidirectional Data Flow Trace */}
          <div className="lg:col-span-5 rounded-xl bg-white/90 dark:bg-[#090d16] border border-slate-200/80 dark:border-white/10 p-3.5 space-y-2.5">
            <div className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
              {lang === 'ar' ? 'مسار تدفق البيانات' : 'Data-Flow Trace'}
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="font-mono font-bold text-[#0284ff] dark:text-[#38bdf8] shrink-0">
                  IN →
                </span>
                <span className="text-slate-700 dark:text-slate-200">
                  {activeLayerObj.inputSignal}
                </span>
              </div>
              <div className="flex items-start gap-2 pt-1.5 border-t border-slate-100 dark:border-white/6">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  OUT ←
                </span>
                <span className="text-slate-700 dark:text-slate-200">
                  {activeLayerObj.outputSignal}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Repository Architecture Notes (if present in README) */}
      {architectureNotes.length > 0 && (
        <div className="py-3 border-y border-slate-200/75 dark:border-white/8 space-y-2">
          <h5 className="text-xs font-bold text-slate-900 dark:text-white">
            {lang === 'ar' ? 'ملاحظات معمارية من المستودع' : 'Repository Architecture Notes'}
          </h5>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            {architectureNotes.map((note, ni) => (
              <li key={ni} className="flex items-start gap-2">
                <span className="text-[#0284ff] font-mono shrink-0">·</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Repository Folder Structure */}
      {folderTree && (
        <div
          dir="ltr"
          className="p-4 sm:p-5 rounded-2xl bg-[#0a0d16] text-slate-200 font-mono text-xs space-y-2.5 border border-slate-800 shadow-lg"
        >
          <div className="flex items-center justify-between text-[#00C7FF] font-bold">
            <span className="flex items-center gap-2">
              <FolderTree size={14} />
              <span>Folder Structure</span>
            </span>
            <InlineCopyButton label="Copy Tree" value={folderTree} lang={lang} />
          </div>
          <pre className="p-3 rounded-xl bg-black/40 border border-white/5 overflow-x-auto text-[11px] leading-relaxed text-slate-300">
            {folderTree}
          </pre>
        </div>
      )}

      {/* Strictly Verified Telemetry Summary Row */}
      {(project.metrics?.offlineSupport ||
        project.metrics?.liveStatus ||
        realApkSizeLabel ||
        releaseInfo?.tagName) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3.5 border-y border-slate-200/75 dark:border-white/8">
          {project.metrics?.offlineSupport && (
            <div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Offline Mode
              </div>
              <div className="text-sm sm:text-base font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                {project.metrics.offlineSupport}
              </div>
            </div>
          )}
          {project.metrics?.liveStatus && (
            <div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Distribution
              </div>
              <div className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {project.metrics.liveStatus}
              </div>
            </div>
          )}
          {releaseInfo?.tagName && (
            <div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                GitHub Release
              </div>
              <div className="text-sm sm:text-base font-extrabold text-blue-600 dark:text-cyan-400 mt-0.5 font-mono tabular-nums">
                {releaseInfo.tagName}
              </div>
            </div>
          )}
          {realApkSizeLabel && (
            <div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Verified APK Size
              </div>
              <div className="text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 tabular-nums">
                {realApkSizeLabel}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Build Commands */}
      <div
        dir="ltr"
        className="p-4 sm:p-5 rounded-2xl bg-[#0a0d16] text-slate-200 font-mono text-xs space-y-3 border border-slate-800 shadow-lg"
      >
        <div className="flex items-center justify-between text-[#00C7FF] font-bold">
          <div className="flex items-center gap-2">
            <Terminal size={14} />
            <span>Developer Build Commands</span>
          </div>
          <InlineCopyButton
            label="Copy All"
            lang={lang}
            value={`git clone ${githubRepoUrl}.git\ncd ${repoName}\nflutter pub get\nflutter run`}
          />
        </div>
        <div className="space-y-1.5 text-[11px] sm:text-xs text-gray-300 bg-black/40 p-3.5 rounded-xl border border-white/5 overflow-x-auto">
          <div>
            <span className="text-slate-500 me-2">$</span>
            <span className="text-emerald-400">git clone {githubRepoUrl}.git</span>
          </div>
          <div>
            <span className="text-slate-500 me-2">$</span>
            <span className="text-cyan-300">flutter pub get &amp;&amp; flutter run</span>
          </div>
          <div>
            <span className="text-slate-500 me-2">$</span>
            <span className="text-purple-300">flutter build apk --release</span>
          </div>
        </div>
      </div>
    </div>
  );
};
