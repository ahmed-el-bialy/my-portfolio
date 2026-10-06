import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FolderGit2,
  Github,
  Star,
  GitFork,
  Search,
  Sparkles,
  Eye,
  ArrowUpRight,
  Play,
  Download,
  Code2,
  GitCommit,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { FEATURED_PROJECTS, Project } from '../data/portfolioData';
import {
  GitHubRepo,
  GitHubStats,
  fetchGitHubUserStats,
  fetchAllRepoReleases,
  RepoReleaseInfo,
  getLanguageColor,
  AHMED_DEFAULT_REPOS
} from '../services/githubService';
import { ProjectCardCover } from './ProjectCardCover';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { VideoDemoModal } from './VideoDemoModal';
import { ApkDownloadModal } from './ApkDownloadModal';
import { ProjectSkeletonCard } from './ProjectSkeletonCard';
import { GitHubActivity } from './GitHubActivity';
import { TechDistributionChart } from './TechDistributionChart';
import { GitHubFallbackNotice } from './GitHubFallbackNotice';

interface ProjectsSectionProps {
  currentGithubUser: string;
  onRepoCountChange?: (count: number) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ currentGithubUser, onRepoCountChange }) => {
  const [activeTab, setActiveTab] = useState<'featured' | 'github'>('featured');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [apkModalProject, setApkModalProject] = useState<Project | null>(null);
  const [videoModalData, setVideoModalData] = useState<{ open: boolean; title: string; url?: string }>({
    open: false,
    title: '',
    url: ''
  });

  const [githubUser] = useState<string>(currentGithubUser || 'ahmed-el-bialy');
  const [repoSearch, setRepoSearch] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'pushed' | 'stars' | 'name'>('pushed');

  // Automatic Instant GitHub Live Data Fetch on Mount
  const {
    data: githubData,
    isPending,
    isFetching,
    refetch
  } = useQuery<{ stats: GitHubStats; repos: GitHubRepo[] }>({
    queryKey: ['github-data', githubUser],
    queryFn: () => fetchGitHubUserStats(githubUser),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
    refetchOnMount: true,
    initialData: () => {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`ahmed_gh_cache_${githubUser}`);
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch (e) {}
        }
      }
      return {
        stats: {
          username: githubUser,
          name: "Ahmed El-Bialy",
          avatar_url: "https://avatars.githubusercontent.com/u/245139141?v=4",
          bio: "🚀 Junior Flutter Developer | B.Sc. Student in AI | Mobile App Developer",
          public_repos: AHMED_DEFAULT_REPOS.length,
          followers: 12,
          following: 5,
          totalStars: 16,
          totalForks: 5,
          languages: [
            { name: "Dart", count: 9, percentage: 90, color: "#00B4AB" },
            { name: "Python", count: 1, percentage: 10, color: "#3572A5" }
          ],
          isFromCache: true
        },
        repos: AHMED_DEFAULT_REPOS
      };
    },
  });

  const githubRepos: GitHubRepo[] = githubData?.repos || [];
  const githubStats: GitHubStats | undefined = githubData?.stats;

  // Gather all repo names from both Featured Production Projects & GitHub Repositories
  const allTargetRepoNames = useMemo(() => {
    const featured = FEATURED_PROJECTS.map((p) => p.repoName);
    const repos = githubRepos.map((r) => r.name);
    return Array.from(new Set([...featured, ...repos]));
  }, [githubRepos]);

  // Real-time automatic GitHub release & APK check across all production apps and repos
  const { data: repoReleases } = useQuery<Record<string, RepoReleaseInfo>>({
    queryKey: ['github-releases-map', githubUser, allTargetRepoNames.join(',')],
    queryFn: () => fetchAllRepoReleases(allTargetRepoNames, githubUser),
    enabled: allTargetRepoNames.length > 0,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (githubRepos.length > 0 && onRepoCountChange) {
      onRepoCountChange(githubRepos.length);
    }
  }, [githubRepos.length, onRepoCountChange]);

  // Helper to resolve or enrich repo metadata to a complete Project object
  const getProjectFromRepo = (repo: GitHubRepo): Project => {
    const matched = FEATURED_PROJECTS.find(
      (p) =>
        p.repoName.toLowerCase() === repo.name.toLowerCase() ||
        p.name.toLowerCase() === repo.name.toLowerCase() ||
        p.name.toLowerCase().replace(/[-_\s]/g, '') === repo.name.toLowerCase().replace(/[-_\s]/g, '')
    );

    if (matched) {
      return {
        ...matched,
        links: {
          ...matched.links,
          github: repo.html_url || matched.links.github,
          googlePlay: repo.googlePlayUrl || matched.links.googlePlay,
          youtubeDemo: repo.youtubeDemoUrl || matched.links.youtubeDemo,
        }
      };
    }

    const isDart = (repo.language || '').toLowerCase().includes('dart') || (repo.topics || []).some(t => ['flutter', 'dart', 'mobile'].includes(t.toLowerCase()));
    
    return {
      id: repo.id,
      name: repo.name,
      repoName: repo.name,
      subtitle: repo.description || `${isDart ? 'Flutter Mobile Application' : 'Software Engineering Project'} & Clean Architecture`,
      description: repo.description || `Production-ready mobile codebase implementing Clean Architecture, state management, and robust repository pattern in ${repo.language || 'Dart'}.`,
      technologies: [
        repo.language || 'Dart',
        ...(repo.topics || []),
        isDart ? 'Clean Architecture' : 'OOP',
        isDart ? 'BLoC/Cubit' : 'Design Patterns'
      ].filter((v, i, a) => a.indexOf(v) === i),
      features: [
        'Robust architectural separation (Data, Domain, Presentation)',
        'State management and unidirectional data flow pattern',
        'Offline caching and resilient local data persistence',
        'Unit, widget and integration test coverage'
      ],
      image: repo.coverImageUrl || '',
      hasApk: false,
      links: {
        github: repo.html_url,
        youtubeDemo: repo.youtubeDemoUrl,
        googlePlay: repo.googlePlayUrl,
      }
    };
  };

  const filteredRepos = useMemo(() => {
    return githubRepos.filter((repo) => {
      if (selectedLanguage !== 'all' && repo.language !== selectedLanguage) {
        return false;
      }
      if (!repoSearch.trim()) return true;
      const q = repoSearch.toLowerCase();
      return (
        repo.name.toLowerCase().includes(q) ||
        (repo.description && repo.description.toLowerCase().includes(q)) ||
        repo.topics.some((t) => t.toLowerCase().includes(q))
      );
    }).sort((a, b) => {
      if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    });
  }, [githubRepos, selectedLanguage, repoSearch, sortBy]);

  const allLanguages = useMemo(() => {
    return Array.from(
      new Set(githubRepos.map((r) => r.language).filter(Boolean))
    ) as string[];
  }, [githubRepos]);

  const mostRecentRepo = useMemo(() => {
    return githubRepos.length > 0
      ? [...githubRepos].sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())[0]
      : null;
  }, [githubRepos]);

  return (
    <section id="projects" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-black/10 dark:border-white/5 transition-colors">
      
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <FolderGit2 size={13} />
          <span>Production Mobile Engineering</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight title-contrast">
          Mobile Applications & GitHub Repos
        </h2>
        <p className="text-slate-600 dark:text-gray-400 mt-2 text-sm sm:text-base body-contrast">
          Showcase of published Flutter apps, clean architecture implementations, and live GitHub repositories.
        </p>
      </div>

      {/* Fallback Notice if Offline or API Rate Protected */}
      {githubStats?.isFromCache && (
        <GitHubFallbackNotice
          isOffline={typeof navigator !== 'undefined' && !navigator.onLine}
          isRateLimited={true}
          onRetry={() => refetch()}
          isRefreshing={isFetching}
        />
      )}

      {/* Real-time GitHub Live Sync HUD Bar with Automatic Instant Loading */}
      <div className="mb-12 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#10121d] border border-slate-200 dark:border-white/10 shadow-lg transition-colors">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* GitHub Profile & Sync Status */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl p-[1.5px] bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-md">
                <img
                  src={githubStats?.avatar_url || "https://avatars.githubusercontent.com/u/245139141?v=4"}
                  alt="Ahmed El-Bialy"
                  className="w-full h-full rounded-[10px] object-cover bg-slate-100 dark:bg-[#0a0c14]"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#10121d]" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono">
                  github.com/{githubUser}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Radio size={10} className="animate-pulse" />
                  <span>{githubStats?.isFromCache ? 'Auto Synced (Cached)' : 'Live Connected'}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-gray-400 mt-0.5 font-mono">
                <span>{githubStats?.bio || 'Flutter Specialist & AI Student'}</span>
              </div>
            </div>
          </div>

          {/* Accurate Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs shadow-xs">
              <FolderGit2 size={14} className="text-blue-500" />
              <span className="text-slate-600 dark:text-gray-400 font-medium">Public Repos:</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">{githubStats?.public_repos || githubRepos.length}</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs shadow-xs">
              <Star size={14} className="text-amber-500" />
              <span className="text-slate-600 dark:text-gray-400 font-medium">Stars:</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">{githubStats?.totalStars || 16}</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs shadow-xs">
              <GitFork size={14} className="text-cyan-500" />
              <span className="text-slate-600 dark:text-gray-400 font-medium">Forks:</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">{githubStats?.totalForks || 5}</span>
            </div>

            {mostRecentRepo && (
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs shadow-xs">
                <GitCommit size={14} className="text-emerald-500" />
                <span className="text-slate-600 dark:text-gray-400 font-medium">Latest:</span>
                <span className="font-bold text-cyan-700 dark:text-cyan-400 font-mono">{mostRecentRepo.name}</span>
              </div>
            )}
          </div>

        </div>

        {/* Interactive Recharts Tech Stack Distribution Bar */}
        {githubStats?.languages && githubStats.languages.length > 0 && (
          <TechDistributionChart languages={githubStats.languages} />
        )}

        {/* 30-Day Activity Heatmap Grid */}
        <GitHubActivity username={githubUser} />
      </div>

      {/* Tab Toggle Switch */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        <div className="p-1 rounded-2xl sm:rounded-full bg-slate-200/80 dark:bg-[#14151f] border border-black/10 dark:border-white/10 flex flex-wrap sm:flex-nowrap items-center justify-center shadow-md gap-1">
          <button
            onClick={() => setActiveTab('featured')}
            className={`flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'featured'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles size={16} />
            <span>Production Apps ({FEATURED_PROJECTS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'github'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Github size={16} />
            <span>GitHub Repositories ({githubRepos.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FEATURED PRODUCTION APPS */}
      {activeTab === 'featured' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
          {FEATURED_PROJECTS.map((project) => {
            const liveRelease =
              repoReleases?.[project.repoName] ||
              repoReleases?.[project.name] ||
              repoReleases?.[project.repoName.toLowerCase()];
            const hasLiveRelease = Boolean(
              liveRelease?.hasRelease && (liveRelease.apkDownloadUrl || liveRelease.releaseUrl)
            );
            const hasApkFile = Boolean(project.links.apkDownloadUrl || hasLiveRelease);
            const hasVideo = Boolean(project.links.youtubeDemo);

            // Dynamic project with live release info
            const dynamicProject: Project = {
              ...project,
              hasApk: hasApkFile,
              links: {
                ...project.links,
                apkDownloadUrl: liveRelease?.apkDownloadUrl || project.links.apkDownloadUrl,
                releaseUrl: liveRelease?.releaseUrl || project.links.releaseUrl,
              }
            };

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProject(dynamicProject)}
                className="group rounded-2xl overflow-hidden bg-white dark:bg-[#121422] border border-slate-200 dark:border-white/10 flex flex-col justify-between hover:border-blue-500/50 cursor-pointer transition-all duration-300 shadow-md hover:shadow-2xl"
              >
                <div>
                  {/* Dynamic Smart Cover */}
                  <ProjectCardCover
                    repoName={project.repoName}
                    language="Dart"
                    coverUrl={project.image}
                    isHighlight={project.highlight}
                  />

                  {/* Body Content with Generous Margins & Vertical Rhythm */}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors title-contrast truncate">
                        {project.name}
                      </h3>
                      {project.links.googlePlay && (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold shrink-0">
                          Google Play
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 line-clamp-1 mb-2.5">
                      {project.subtitle}
                    </p>

                    <p className="text-slate-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4 body-contrast">
                      {project.description}
                    </p>

                    {/* Distinct Technology Badges with Clean Rectangles & Proper Spacing */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-cyan-300 font-mono font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="px-2 py-1 rounded-lg bg-slate-100/80 dark:bg-white/5 text-[11px] text-slate-700 dark:text-cyan-400 font-mono font-bold border border-slate-200 dark:border-white/10">
                          +{project.technologies.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-6 pt-3 mt-auto border-t border-slate-100 dark:border-white/5 space-y-2.5">
                  {/* Primary Action Buttons */}
                  <div className={`grid ${hasVideo ? 'grid-cols-3' : 'grid-cols-2'} gap-2.5`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(dynamicProject);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-3 px-3.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-cyan-400 font-bold text-xs border border-blue-500/25 transition-all cursor-pointer shadow-xs min-h-[44px]"
                      title="View App Details & Specs"
                    >
                      <Eye size={15} />
                      <span>Details</span>
                    </button>

                    {hasVideo && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoModalData({
                            open: true,
                            title: project.name,
                            url: project.links.youtubeDemo
                          });
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-3 px-3.5 rounded-xl bg-red-600/10 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 font-bold text-xs border border-red-500/25 transition-all cursor-pointer shadow-xs min-h-[44px]"
                        title="Watch YouTube Demo Video"
                      >
                        <Play size={14} fill="currentColor" />
                        <span>Demo</span>
                      </button>
                    )}

                    {project.links.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full flex items-center justify-center gap-1.5 py-3 px-3.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-gray-200 hover:text-black dark:hover:text-white border border-slate-300 dark:border-white/10 transition-all text-xs font-bold shadow-xs min-h-[44px]"
                        title="View GitHub Code"
                      >
                        <Github size={15} />
                        <span>Code</span>
                      </a>
                    )}
                  </div>

                  {/* Secondary Row: Google Play & Conditional APK Download */}
                  {(project.links.googlePlay || hasApkFile) && (
                    <div className="flex items-center gap-2.5 pt-1">
                      {project.links.googlePlay && (
                        <a
                          href={project.links.googlePlay}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 transition-all text-xs font-bold min-h-[44px]"
                        >
                          <ArrowUpRight size={15} />
                          <span>Google Play</span>
                        </a>
                      )}

                      {hasApkFile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setApkModalProject(dynamicProject);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-600 hover:text-white text-cyan-700 dark:text-cyan-400 border border-cyan-500/25 transition-all text-xs font-bold min-h-[44px] cursor-pointer"
                        >
                          <Download size={15} />
                          <span>Download APK</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: LIVE GITHUB REPOSITORIES */}
      {activeTab === 'github' && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search repos (e.g. Revio, Movura...)"
                value={repoSearch}
                onChange={(e) => setRepoSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131522] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-gray-300 focus:outline-none cursor-pointer shadow-xs"
              >
                <option value="all">All Languages</option>
                {allLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131522] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-gray-300 focus:outline-none cursor-pointer shadow-xs"
              >
                <option value="pushed">Recently Pushed</option>
                <option value="stars">Most Stars</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Repos Grid */}
          {isPending && filteredRepos.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {[1, 2, 3, 4, 5, 6].map((key) => (
                <ProjectSkeletonCard key={key} />
              ))}
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="py-16 text-center text-slate-700 dark:text-gray-300 card-techno rounded-2xl p-8 bg-white dark:bg-[#131522] border border-slate-200 dark:border-white/10 shadow-md">
              <FolderGit2 size={36} className="mx-auto mb-2 opacity-50 text-blue-500" />
              <p className="text-sm font-semibold">No repositories matched your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
              {filteredRepos.map((repo) => {
                const projectObj = getProjectFromRepo(repo);
                const repoRelease = repoReleases?.[repo.name] || repoReleases?.[repo.name.toLowerCase()];
                const hasReleaseOrApk = Boolean(
                  projectObj.links.apkDownloadUrl ||
                  repoRelease?.apkDownloadUrl ||
                  (repoRelease?.hasRelease && repoRelease?.releaseUrl)
                );

                const dynamicRepoProject: Project = {
                  ...projectObj,
                  hasApk: hasReleaseOrApk,
                  links: {
                    ...projectObj.links,
                    apkDownloadUrl: repoRelease?.apkDownloadUrl || projectObj.links.apkDownloadUrl,
                    releaseUrl: repoRelease?.releaseUrl || projectObj.links.releaseUrl,
                  }
                };

                const hasDemo = Boolean(projectObj.links.youtubeDemo);

                return (
                  <div
                    key={repo.id}
                    onClick={() => setSelectedProject(dynamicRepoProject)}
                    className="group rounded-2xl overflow-hidden bg-white dark:bg-[#121422] border border-slate-200 dark:border-white/10 flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl"
                  >
                    <div>
                      {/* Dynamic Smart Cover */}
                      <ProjectCardCover
                        repoName={repo.name}
                        language={repo.language}
                        coverUrl={repo.coverImageUrl}
                        isHighlight={Boolean(projectObj.links.googlePlay || hasDemo || hasReleaseOrApk)}
                      />

                      {/* Content Area with High Vertical Rhythm */}
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-2 title-contrast truncate">
                            <FolderGit2 size={18} className="text-blue-500 shrink-0" />
                            <span className="truncate">{repo.name}</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {hasReleaseOrApk && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold shrink-0">
                                Release
                              </span>
                            )}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-yellow-600 dark:text-yellow-400 shrink-0 font-mono font-semibold">
                              <Star size={12} fill="currentColor" />
                              <span>{repo.stargazers_count}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-slate-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-2 min-h-[2.5rem] mb-4 body-contrast">
                          {repo.description || 'Clean Architecture production-ready mobile codebase.'}
                        </p>

                        {/* Topics Badges with Proper Padding */}
                        {repo.topics && repo.topics.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {repo.topics.slice(0, 3).map((topic) => (
                              <span
                                key={topic}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-900 dark:text-cyan-400 border border-blue-200 dark:border-blue-500/20 text-xs font-mono font-medium"
                              >
                                #{topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Toolbar & Well-Spaced Language Bar */}
                    <div className="p-6 pt-3 mt-auto border-t border-slate-100 dark:border-white/5 space-y-3">
                      {/* Action Buttons Row */}
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Details Action Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(dynamicRepoProject);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-3 px-3.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-cyan-400 font-bold text-xs border border-blue-500/25 transition-all cursor-pointer shadow-xs min-h-[44px]"
                          title="Open full architectural details, specs & demo"
                        >
                          <Eye size={15} />
                          <span>Details</span>
                        </button>

                        {/* GitHub Source Code Button */}
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full flex items-center justify-center gap-1.5 py-3 px-3.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-gray-200 hover:text-black dark:hover:text-white border border-slate-300 dark:border-white/10 transition-all text-xs font-bold shadow-xs min-h-[44px]"
                          title="View Repository on GitHub"
                        >
                          <Github size={15} />
                          <span>GitHub</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>

                      {/* Dynamic APK Download Button if Release exists */}
                      {hasReleaseOrApk && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setApkModalProject(dynamicRepoProject);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-600 hover:text-white text-cyan-700 dark:text-cyan-400 border border-cyan-500/25 transition-all text-xs font-bold min-h-[40px] cursor-pointer"
                        >
                          <Download size={14} />
                          <span>Download APK / Release</span>
                        </button>
                      )}

                      {/* Language, Forks & Watch Demo Bar with Clear Spacing */}
                      <div className="pt-2.5 pb-0.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
                        <div className="flex items-center gap-3">
                          {repo.language && (
                            <div className="flex items-center gap-2 font-mono text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xs">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: getLanguageColor(repo.language) }}
                              />
                              <span className="font-bold text-slate-800 dark:text-gray-200">{repo.language}</span>
                            </div>
                          )}
                          {repo.forks_count > 0 && (
                            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-gray-400 font-mono">
                              <GitFork size={13} className="text-cyan-500" />
                              <span className="font-semibold">{repo.forks_count}</span>
                            </div>
                          )}
                        </div>

                        {hasDemo && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setVideoModalData({
                                open: true,
                                title: repo.name,
                                url: projectObj.links.youtubeDemo
                              });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 font-bold text-xs border border-red-500/20 transition-all cursor-pointer shadow-xs min-h-[38px]"
                            title="Watch YouTube Demo Video"
                          >
                            <Play size={13} fill="currentColor" />
                            <span>Watch Demo</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Global Project Details Modal */}
      <ProjectDetailsModal
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
        onWatchDemo={(title, url) => {
          setSelectedProject(null);
          setVideoModalData({ open: true, title, url });
        }}
      />

      {/* Conditional APK Download Modal with Security Notice */}
      <ApkDownloadModal
        isOpen={Boolean(apkModalProject)}
        onClose={() => setApkModalProject(null)}
        project={apkModalProject}
      />

      {/* Video Demo Modal */}
      <VideoDemoModal
        isOpen={videoModalData.open}
        onClose={() => setVideoModalData({ open: false, title: '', url: '' })}
        projectName={videoModalData.title}
        videoUrl={videoModalData.url}
      />
    </section>
  );
};
