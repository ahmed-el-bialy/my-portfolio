import React, { useState, lazy, Suspense, useEffect } from 'react';
import { ArrowRight, ExternalLink, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { FEATURED_PROJECTS, Project } from '../data/portfolioData';
import {
  ConsolidatedGitHubPortfolio,
  fetchConsolidatedGitHubPortfolio,
} from '../services/githubService';
import { resolveSmartProjectLinks } from '../utils/projectLinks';
import { SmartDemoButtons } from './SmartDemoButtons';
import { ProjectCardCover } from './ProjectCardCover';
import { RevealOnScroll } from './RevealOnScroll';
import { useLanguage } from '../context/LanguageContext';

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
          className="btn-kinetic inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-900 dark:bg-white/10 hover:bg-[#0284ff] dark:hover:bg-[#0284ff] text-white text-xs font-semibold cursor-pointer whitespace-nowrap self-start md:self-auto shadow-xs"
        >
          <span>{lang === 'ar' ? 'استعراض كافة المشاريع والمستودعات' : 'View All Projects & Repos'}</span>
          <ArrowRight size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
        </button>
      </RevealOnScroll>

      {/* Spacious 2-Column Hero-First Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7">
        {topFlagshipProjects.map((project, idx) => {
          const liveMedia =
            liveMediaMap[project.repoName] ||
            liveMediaMap[project.name] ||
            liveMediaMap[project.repoName.toLowerCase()];

          const resolvedLinks = resolveSmartProjectLinks(project.links, liveMedia);
          const dynamicPlayUrl = resolvedLinks.googlePlayUrl;

          const dynamicProject: Project = {
            ...project,
            links: {
              ...project.links,
              demoVideoUrl: resolvedLinks.demoVideoUrl,
              liveDemoUrl: resolvedLinks.webLiveDemoUrl || liveMedia?.liveDemoUrl || project.links.liveDemoUrl,
              playlistUrl: resolvedLinks.playlistUrl,
              googlePlay: dynamicPlayUrl,
              apkDownloadUrl: resolvedLinks.apkDownloadUrl,
              releaseUrl: resolvedLinks.releaseUrl,
            },
          };

          const openProjectDetails = () => {
            setSelectedScreenIndex(cardScreenMap[project.repoName] || 0);
            setSelectedProject(dynamicProject);
          };

          return (
            <RevealOnScroll key={project.id} delay={idx * 0.04} className="flex">
              <article
                onMouseEnter={() => setHoveredCardId(project.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                className="surface-card card-shimmer w-full group rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl"
              >
                <div>
                  <ProjectCardCover
                    repoName={project.repoName}
                    language="Dart"
                    coverUrl={project.image}
                    discoveredScreenshots={liveMedia?.discoveredScreenshots}
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

                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <button
                        type="button"
                        onClick={openProjectDetails}
                        className="text-start min-w-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff] rounded"
                      >
                        <h3 className="font-display text-lg sm:text-[22px] font-extrabold text-slate-900 dark:text-white truncate tracking-tight group-hover:text-[#0369a1] dark:group-hover:text-[#38bdf8] transition-colors">
                          {project.name}
                        </h3>
                      </button>
                      {dynamicPlayUrl && (
                        <span className="font-display text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                          Google Play
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-[#0369a1] dark:text-[#38bdf8] line-clamp-1 mb-1.5">
                      {project.subtitle}
                    </p>
                    <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 dark:border-white/8 flex flex-wrap items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={openProjectDetails}
                    className="btn-kinetic flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-[38px] rounded-xl bg-[#0284ff]/10 hover:bg-[#0284ff] hover:text-white text-xs font-semibold text-[#0369a1] dark:text-[#38bdf8] border border-[#0284ff]/25 cursor-pointer whitespace-nowrap"
                  >
                    <Eye size={13} />
                    <span>{t.projects.actions.viewSpecs}</span>
                  </button>

                  <div className="flex items-center gap-2 flex-wrap flex-1 sm:flex-initial justify-end">
                    <SmartDemoButtons
                      resolved={resolvedLinks}
                      compact
                      onWatchDemo={(videoUrl) =>
                        setVideoModalState({ projectName: project.name, videoUrl })
                      }
                    />
                    {resolvedLinks.mode === 'none' && project.links.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-kinetic flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-2 min-h-[44px] sm:min-h-[38px] rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
                      >
                        <span>GitHub</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            </RevealOnScroll>
          );
        })}
      </div>

      <Suspense fallback={null}>
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
