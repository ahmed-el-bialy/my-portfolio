import React, { useState } from 'react';
import { ArrowRight, ExternalLink, Eye, Play, Youtube } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { FEATURED_PROJECTS, Project } from '../data/portfolioData';
import {
  ConsolidatedGitHubPortfolio,
  fetchConsolidatedGitHubPortfolio,
} from '../services/githubService';
import { ProjectCardCover } from './ProjectCardCover';
import { ProjectDetailsModal } from './ProjectDetailsModal';
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
  const topFlagshipProjects = FEATURED_PROJECTS.slice(0, 3);

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-slate-200/80 dark:border-white/8 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-cyan-400 mb-2">
            <span>{lang === 'ar' ? 'أبرز التطبيقات المختارة' : 'Selected Mobile Builds'}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 dark:text-slate-400">
              {lang === 'ar' ? 'منشورة ومفتوحة المصدر' : 'Play Store & Production Apps'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight [text-wrap:balance]">
            {lang === 'ar' ? 'أبرز 3 تطبيقات فلاتر' : 'Flagship Applications'}
          </h2>
        </div>

        <button
          type="button"
          onClick={onExploreAllProjects}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white/10 hover:bg-blue-600 dark:hover:bg-blue-600 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap self-start md:self-auto"
        >
          <span>{lang === 'ar' ? 'استعراض كافة المشاريع والمستودعات' : 'View All Projects & Repos'}</span>
          <ArrowRight size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topFlagshipProjects.map((project) => {
          const liveMedia =
            liveMediaMap[project.repoName] ||
            liveMediaMap[project.name] ||
            liveMediaMap[project.repoName.toLowerCase()];

          const dynamicLiveDemoUrl = liveMedia?.liveDemoUrl || project.links.liveDemoUrl;
          const dynamicPlaylistUrl = liveMedia?.playlistUrl || project.links.playlistUrl;
          const dynamicPlayUrl = liveMedia?.googlePlayUrl || project.links.googlePlay;

          const dynamicProject: Project = {
            ...project,
            links: {
              ...project.links,
              liveDemoUrl: dynamicLiveDemoUrl,
              playlistUrl: dynamicPlaylistUrl,
              googlePlay: dynamicPlayUrl,
              apkDownloadUrl: liveMedia?.apkDownloadUrl || project.links.apkDownloadUrl,
              releaseUrl: liveMedia?.releaseUrl || project.links.releaseUrl,
            },
          };

          const hasLiveDemo = Boolean(dynamicLiveDemoUrl);
          const hasPlaylist = Boolean(dynamicPlaylistUrl);

          return (
            <article
              key={project.id}
              onClick={() => setSelectedProject(dynamicProject)}
              onMouseEnter={() => setHoveredCardId(project.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              className="group rounded-2xl overflow-hidden bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-[#027DFD]/50 shadow-sm hover:shadow-lg"
            >
              <div>
                <ProjectCardCover
                  repoName={project.repoName}
                  language="Dart"
                  coverUrl={project.image}
                  description={project.description}
                  topics={project.technologies}
                  isCardHovered={hoveredCardId === project.id}
                />

                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                      {project.name}
                    </h3>
                    {dynamicPlayUrl && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                        Google Play
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-blue-600 dark:text-cyan-400 line-clamp-1 mb-2">
                    {project.subtitle}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="px-5 py-3.5 border-t border-slate-100 dark:border-white/8 flex items-center justify-between gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProject(dynamicProject);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  <Eye size={13} />
                  <span>{t.projects.actions.viewSpecs}</span>
                </button>

                <div className="flex items-center gap-2">
                  {hasLiveDemo && (
                    <a
                      href={dynamicLiveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white text-[11px] font-bold transition-colors"
                    >
                      <Play size={11} fill="currentColor" />
                      <span>{t.projects.actions.liveDemo}</span>
                    </a>
                  )}
                  {hasPlaylist && (
                    <a
                      href={dynamicPlaylistUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 text-[11px] font-bold transition-colors"
                    >
                      <Youtube size={12} className="text-red-500" />
                      <span>{t.projects.actions.fullReview}</span>
                    </a>
                  )}
                  {!hasLiveDemo && !hasPlaylist && project.links.github && (
                    <a
                      href={project.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>GitHub</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </article>
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
