import React, { useState } from 'react';
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
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { RevealOnScroll } from './RevealOnScroll';
import { TiltCard } from './MotionPrimitives';
import { useLanguage } from '../context/LanguageContext';

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
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

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
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-cyan-400 mb-2">
            <span>{lang === 'ar' ? 'أبرز التطبيقات المختارة' : 'Selected Mobile Builds'}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 dark:text-slate-400">
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
          className="btn-kinetic inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-xl bg-slate-900 dark:bg-white/10 hover:bg-[#027DFD] dark:hover:bg-[#027DFD] text-white text-xs font-semibold cursor-pointer whitespace-nowrap self-start md:self-auto shadow-xs"
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

          return (
            <RevealOnScroll key={project.id} delay={idx * 0.07} className="flex">
              <TiltCard
                maxTilt={4.5}
                glareOpacity={0.12}
                cursorLabel={lang === 'ar' ? 'استعراض' : 'Inspect'}
                onClick={() => setSelectedProject(dynamicProject)}
                onMouseEnter={() => setHoveredCardId(project.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                className="w-full group rounded-2xl overflow-hidden bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-[#027DFD]/50 shadow-sm hover:shadow-xl"
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
                  />

                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                        {project.name}
                      </h3>
                      {dynamicPlayUrl && (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                          Google Play
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-[#027DFD] dark:text-[#00C7FF] line-clamp-1 mb-2">
                      {project.subtitle}
                    </p>
                    <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="px-4 sm:px-6 py-4 border-t border-slate-100 dark:border-white/8 flex flex-wrap items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(dynamicProject);
                    }}
                    className="btn-kinetic inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl bg-[#027DFD]/10 hover:bg-[#027DFD] hover:text-white text-xs font-semibold text-[#027DFD] dark:text-[#00C7FF] border border-[#027DFD]/25 cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>{t.projects.actions.viewSpecs}</span>
                  </button>

                  <div className="flex items-center gap-2 flex-wrap">
                    <SmartDemoButtons resolved={resolvedLinks} compact />
                    {resolvedLinks.mode === 'none' && project.links.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="btn-kinetic inline-flex items-center gap-1 px-3 py-2 min-h-[36px] rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      >
                        <span>GitHub</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </TiltCard>
            </RevealOnScroll>
          );
        })}
      </div>

      <ProjectDetailsModal
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
      />
    </section>
  );
};
