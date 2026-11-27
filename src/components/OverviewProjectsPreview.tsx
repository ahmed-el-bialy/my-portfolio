import React, { useState, lazy, Suspense, useEffect } from 'react';
import { ArrowRight, Download, ExternalLink, Eye, Github, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { FEATURED_PROJECTS, Project } from '../data/portfolioData';
import {
  ConsolidatedGitHubPortfolio,
  fetchConsolidatedGitHubPortfolio,
  getCachedConsolidatedPortfolio,
} from '../services/githubService';
import { resolveSmartProjectLinks } from '../utils/projectLinks';
import { extractRepoTechTags } from '../utils/techTagExtractor';
import { TechIconBadge } from './TechLogos';
import { SmartDemoButtons } from './SmartDemoButtons';
import { ProjectCardCover } from './ProjectCardCover';
import { RevealOnScroll } from './RevealOnScroll';
import { useLanguage } from '../context/LanguageContext';
import { ModalLoadingFallback } from './ModalLoadingFallback';

const ProjectDetailsModal = lazy(() =>
  import('./ProjectDetailsModal').then((m) => ({ default: m.ProjectDetailsModal }))
);
const VideoDemoModal = lazy(() =>
  import('./VideoDemoModal').then((m) => ({ default: m.VideoDemoModal }))
);

interface OverviewProjectsPreviewProps {
  githubUsername: string;
  onExploreAllProjects: () => void;
}

export const OverviewProjectsPreview: React.FC<OverviewProjectsPreviewProps> = ({
  githubUsername,
  onExploreAllProjects,
}) => {
  const { lang, dir, t } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedScreenIndex, setSelectedScreenIndex] = useState<number>(0);
  const [cardScreenMap, setCardScreenMap] = useState<Record<string, number>>({});
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
  const [videoModalState, setVideoModalState] = useState<{
    projectName: string;
    videoUrl: string;
  } | null>(null);
  const [mountedModals, setMountedModals] = useState({ details: false, video: false });

  useEffect(() => {
    if (selectedProject && !mountedModals.details) {
      setMountedModals((m) => ({ ...m, details: true }));
    }
  }, [selectedProject, mountedModals.details]);

  useEffect(() => {
    if (videoModalState && !mountedModals.video) {
      setMountedModals((m) => ({ ...m, video: true }));
    }
  }, [videoModalState, mountedModals.video]);

  const { data: portfolioData } = useQuery<ConsolidatedGitHubPortfolio>({
    queryKey: ['github-consolidated', githubUsername],
    queryFn: () => fetchConsolidatedGitHubPortfolio(githubUsername),
    staleTime: 1000 * 60 * 5,
    placeholderData: () => getCachedConsolidatedPortfolio(githubUsername),
  });

  const liveMediaMap = portfolioData?.liveMediaMap || {};

  // Symmetric 2x2 showcase matching the spacious 2-column Hero-first layout
  const topFlagshipProjects = FEATURED_PROJECTS.slice(0, 4);

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-slate-200/80 dark:border-white/8 w-full">
      <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8] mb-2">
            <span>{lang === 'ar' ? 'أبرز التطبيقات المختارة' : 'Selected Mobile Builds'}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-600 dark:text-slate-400 font-sans">
              {lang === 'ar' ? 'منشورة ومفتوحة المصدر' : 'Play Store & Production Apps'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight [text-wrap:balance]">
            {lang === 'ar' ? 'أبرز تطبيقات فلاتر' : 'Flagship Applications'}
          </h2>
        </div>

        <button
          type="button"
          onClick={onExploreAllProjects}
          className="btn-kinetic inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-white/95 dark:bg-[#0f1117]/85 backdrop-blur-md hover:bg-[#0284ff]/[0.06] dark:hover:bg-[#0284ff]/[0.12] text-slate-900 dark:text-[#f1f5f9] hover:text-[#0369a1] dark:hover:text-[#38bdf8] border border-slate-200 dark:border-white/12 hover:border-[#0284ff]/45 text-xs font-semibold cursor-pointer whitespace-nowrap self-start md:self-auto transition-colors"
        >
          <span>{lang === 'ar' ? 'استعراض كافة المشاريع والمستودعات' : 'View All Projects & Repos'}</span>
          <ArrowRight size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
        </button>
      </RevealOnScroll>

      {/* Unified Dark Glassmorphic 2-Column Flagship Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">
        {topFlagshipProjects.map((project, idx) => {
          const liveMedia =
            liveMediaMap[project.repoName] ||
            liveMediaMap[project.name] ||
            liveMediaMap[project.repoName.toLowerCase()];

          const matchingRepo = portfolioData?.repos?.find(
            (r) =>
              r.name.toLowerCase() === project.repoName.toLowerCase() ||
              r.name.toLowerCase() === project.name.toLowerCase()
          );

          const resolvedLinks = resolveSmartProjectLinks(project.links, liveMedia);
          const dynamicPlayUrl = resolvedLinks.googlePlayUrl;
          const dynamicApkUrl = resolvedLinks.apkDownloadUrl;
          const dynamicReleaseUrl = resolvedLinks.releaseUrl;

          const dynamicProject: Project = {
            ...project,
            hasApk: Boolean(dynamicApkUrl || dynamicReleaseUrl || project.hasApk),
            links: {
              ...project.links,
              demoVideoUrl: resolvedLinks.demoVideoUrl,
              liveDemoUrl:
                resolvedLinks.webLiveDemoUrl || liveMedia?.liveDemoUrl || project.links.liveDemoUrl,
              playlistUrl: resolvedLinks.playlistUrl,
              googlePlay: dynamicPlayUrl,
              apkDownloadUrl: dynamicApkUrl,
              releaseUrl: dynamicReleaseUrl,
            },
          };

          const starCount = matchingRepo ? matchingRepo.stargazers_count : null;
          const techTags = extractRepoTechTags({
            repoName: project.repoName,
            language: matchingRepo?.language || 'Dart',
            topics: matchingRepo?.topics,
            description: project.description,
            technologies: project.technologies,
          });

          const openProjectDetails = () => {
            setSelectedScreenIndex(cardScreenMap[project.repoName] || 0);
            setSelectedProject(dynamicProject);
          };

          return (
            <RevealOnScroll key={project.id} delay={idx * 0.06} className="flex">
              <article
                onMouseEnter={() => setHoveredCardId(project.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                className="card-shimmer w-full group relative rounded-2xl overflow-hidden flex flex-col justify-between bg-white/95 dark:bg-[#0f1117]/82 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.09] hover:border-[#0284ff]/55 dark:hover:border-[#0284ff]/65 shadow-[0_8px_28px_rgba(15,23,42,0.06)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_14px_34px_rgba(2,132,255,0.12)] dark:hover:shadow-[0_20px_48px_rgba(0,0,0,0.58),0_0_0_1px_rgba(2,132,255,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] hover:-translate-y-1 transition-all duration-200"
              >
                <div>
                  {/* 1. Unified 4:3 Media / Device Cover Stage */}
                  <ProjectCardCover
                    repoName={project.repoName}
                    language={matchingRepo?.language || 'Dart'}
                    coverUrl={matchingRepo?.coverImageUrl || project.image}
                    coverImages={liveMedia?.coverImages || matchingRepo?.coverImages}
                    discoveredScreenshots={
                      liveMedia?.discoveredScreenshots || matchingRepo?.discoveredScreenshots
                    }
                    isHighlight={project.highlight}
                    description={project.description}
                    topics={project.technologies}
                    isCardHovered={hoveredCardId === project.id}
                    onInspect={openProjectDetails}
                    inspectAriaLabel={`${t.projects.actions.viewSpecs} — ${project.name}`}
                    cursorLabel={lang === 'ar' ? 'استعراض' : 'Inspect'}
                    onActiveScreenChange={(screenIdx) => {
                      setCardScreenMap((prev) =>
                        prev[project.repoName] === screenIdx
                          ? prev
                          : { ...prev, [project.repoName]: screenIdx }
                      );
                    }}
                  />

                  {/* 2. Standardized Content Zone: Title & Telemetry -> Subtitle -> Summary -> Tech Stack */}
                  <div className="p-5 sm:p-6 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={openProjectDetails}
                        className="text-start min-w-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] rounded-md"
                      >
                        <h3 className="font-display text-xl sm:text-[22px] font-extrabold text-slate-900 dark:text-white truncate tracking-tight group-hover:text-[#0369a1] dark:group-hover:text-[#38bdf8] transition-colors">
                          {project.name}
                        </h3>
                      </button>

                      <div className="flex items-center gap-2 text-xs font-mono shrink-0 text-slate-500 dark:text-slate-400 pt-1">
                        {starCount !== null && starCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold tabular-nums">
                            <Star size={12} fill="currentColor" />
                            {starCount}
                          </span>
                        )}
                        {dynamicPlayUrl && (
                          <>
                            {starCount !== null && starCount > 0 && <span aria-hidden="true">·</span>}
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                              Play Store
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-[13px] font-semibold text-[#0369a1] dark:text-[#38bdf8] line-clamp-1 min-h-[1.25rem]">
                      {project.subtitle}
                    </p>

                    <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed min-h-[2.45rem]">
                      {project.description}
                    </p>

                    <div className="pt-1 flex flex-wrap items-center gap-1.5 min-h-[28px]">
                      {techTags.slice(0, 3).map((tag, techIdx) => (
                        <TechIconBadge
                          key={`${project.id}-${tag.id}-${techIdx}`}
                          label={tag.label}
                          id={tag.id}
                          category={tag.category}
                        />
                      ))}
                      {techTags.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-[10px] text-slate-600 dark:text-slate-300 font-mono font-semibold border border-slate-200 dark:border-white/10 tabular-nums">
                          +{techTags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Unified Glass Action Bar Footer */}
                <div className="px-5 sm:px-6 py-4 mt-auto border-t border-slate-200/75 dark:border-white/[0.07] bg-slate-50/75 dark:bg-white/[0.02] space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={openProjectDetails}
                      className="btn-kinetic w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0284ff]/12 hover:bg-[#0284ff] text-[#0369a1] dark:text-[#38bdf8] hover:text-white font-semibold text-xs border border-[#0284ff]/30 transition-colors cursor-pointer min-h-[42px] whitespace-nowrap min-w-0"
                    >
                      <Eye size={14} className="shrink-0" />
                      <span className="truncate">{t.projects.actions.viewSpecs}</span>
                    </button>

                    {project.links.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-kinetic w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.1] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors text-xs font-semibold min-h-[42px] whitespace-nowrap min-w-0"
                      >
                        <Github size={14} className="shrink-0" />
                        <span className="truncate">{t.projects.actions.sourceCode}</span>
                      </a>
                    )}
                  </div>

                  {(resolvedLinks.mode !== 'none' || dynamicPlayUrl) && (
                    <div className="flex flex-wrap items-center gap-2">
                      <SmartDemoButtons
                        resolved={resolvedLinks}
                        fullWidthOnRow
                        onWatchDemo={(videoUrl) =>
                          setVideoModalState({ projectName: project.name, videoUrl })
                        }
                      />
                      {dynamicPlayUrl && (
                        <a
                          href={dynamicPlayUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-kinetic flex-1 min-w-[115px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 transition-colors text-xs font-bold min-h-[38px] whitespace-nowrap"
                        >
                          <ExternalLink size={13} className="shrink-0" />
                          <span>{t.projects.actions.playStore}</span>
                        </a>
                      )}
                      {dynamicApkUrl && !dynamicPlayUrl && (
                        <button
                          type="button"
                          onClick={openProjectDetails}
                          className="btn-kinetic flex-1 min-w-[115px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0284ff]/10 hover:bg-[#0284ff] hover:text-white text-[#0369a1] dark:text-[#38bdf8] border border-[#0284ff]/25 transition-colors text-xs font-bold min-h-[38px] cursor-pointer whitespace-nowrap"
                        >
                          <Download size={13} className="shrink-0" />
                          <span>{t.projects.actions.downloadApk}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            </RevealOnScroll>
          );
        })}
      </div>

      <Suspense
        fallback={
          <ModalLoadingFallback show={Boolean(selectedProject || videoModalState)} />
        }
      >
        {mountedModals.details && (
          <ProjectDetailsModal
            isOpen={Boolean(selectedProject)}
            onClose={() => {
              setSelectedProject(null);
              setSelectedScreenIndex(0);
            }}
            project={selectedProject}
            initialScreenIndex={selectedScreenIndex}
          />
        )}

        {mountedModals.video && (
          <VideoDemoModal
            isOpen={Boolean(videoModalState)}
            onClose={() => setVideoModalState(null)}
            projectName={videoModalState?.projectName || 'App Demo'}
            videoUrl={videoModalState?.videoUrl}
          />
        )}
      </Suspense>
    </section>
  );
};
