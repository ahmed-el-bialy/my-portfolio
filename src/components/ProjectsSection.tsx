import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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
import { FEATURED_PROJECTS, Project, AHMED_PROFILE } from '../data/portfolioData';
import {
  GitHubRepo,
  GitHubStats,
  fetchGitHubUserStats,
  fetchAllRepoReleases,
  fetchAllReposLiveMetadata,
  RepoReleaseInfo,
  RepoLiveMetadata,
  getLanguageColor,
  AHMED_DEFAULT_REPOS,
  formatFileSize
} from '../services/githubService';
import { ProjectCardCover, synthesizeProjectBlueprint } from './ProjectCardCover';
import { extractRepoTechTags, getRepoReadmeSpecs } from '../utils/techTagExtractor';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { ApkDownloadModal } from './ApkDownloadModal';
import { ProjectSkeletonCard } from './ProjectSkeletonCard';
import { GitHubActivity } from './GitHubActivity';
import { TechDistributionChart } from './TechDistributionChart';
import { GitHubFallbackNotice } from './GitHubFallbackNotice';
import { useLanguage } from '../context/LanguageContext';

interface ProjectsSectionProps {
  currentGithubUser: string;
  onRepoCountChange?: (count: number) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ currentGithubUser, onRepoCountChange }) => {
  const { lang, dir, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'featured' | 'github'>('featured');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [apkModalProject, setApkModalProject] = useState<Project | null>(null);

  const [githubUser] = useState<string>(currentGithubUser || 'ahmed-el-bialy');
  const [repoSearch, setRepoSearch] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [frameworkFilter, setFrameworkFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'pushed' | 'stars' | 'name'>('pushed');
  const [hoveredCardId, setHoveredCardId] = useState<string | number | null>(null);

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

  // Real-time live README & dynamic media extraction query (bypasses stale cached videos)
  const { data: liveMediaMap } = useQuery<Record<string, RepoLiveMetadata>>({
    queryKey: ['github-live-media-map', githubUser, allTargetRepoNames.join(',')],
    queryFn: () => fetchAllReposLiveMetadata(allTargetRepoNames, githubUser),
    enabled: allTargetRepoNames.length > 0,
    staleTime: 1000 * 60 * 2, // Refresh every 2 minutes
    refetchInterval: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (githubRepos.length > 0 && onRepoCountChange) {
      onRepoCountChange(githubRepos.length);
    }
  }, [githubRepos.length, onRepoCountChange]);

  // Helper to resolve or enrich repo metadata to a complete Project object
  const getProjectFromRepo = (repo: GitHubRepo): Project => {
    const liveMedia = liveMediaMap?.[repo.name] || liveMediaMap?.[repo.name.toLowerCase()];
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
          googlePlay: liveMedia?.googlePlayUrl || repo.googlePlayUrl || matched.links.googlePlay,
          youtubeDemo: liveMedia?.youtubeDemoUrl || repo.youtubeDemoUrl || matched.links.youtubeDemo,
          apkDownloadUrl: liveMedia?.apkDownloadUrl || matched.links.apkDownloadUrl,
          releaseUrl: liveMedia?.releaseUrl || matched.links.releaseUrl,
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
        youtubeDemo: liveMedia?.youtubeDemoUrl || repo.youtubeDemoUrl,
        googlePlay: liveMedia?.googlePlayUrl || repo.googlePlayUrl,
        apkDownloadUrl: liveMedia?.apkDownloadUrl,
        releaseUrl: liveMedia?.releaseUrl,
      }
    };
  };

  const filteredFeaturedProjects = useMemo(() => {
    return FEATURED_PROJECTS.filter((proj) => {
      const tags = extractRepoTechTags({
        repoName: proj.repoName,
        language: 'Dart',
        description: proj.description,
        technologies: proj.technologies,
      });
      const tagIds = tags.map((t) => t.id.toLowerCase());
      const tagLabels = tags.map((t) => t.label.toLowerCase());
      const combinedText = `${proj.name} ${proj.repoName} ${proj.subtitle} ${proj.description} ${proj.technologies.join(' ')} ${tagLabels.join(' ')}`.toLowerCase();

      if (frameworkFilter !== 'all') {
        const readme = getRepoReadmeSpecs(proj.repoName);
        if (frameworkFilter === 'flutter' && !combinedText.includes('flutter')) return false;
        if (frameworkFilter === 'cubit') {
          const hasCubit = readme?.hasCubit || tagIds.includes('cubit') || tagIds.includes('bloc') || combinedText.includes('cubit') || combinedText.includes('bloc');
          if (!hasCubit) return false;
        }
        if (frameworkFilter === 'clean-arch') {
          const hasClean = readme?.architecture.some((a) => a.toLowerCase().includes('clean')) || tagIds.includes('cleanarchitecture') || tagIds.includes('clean-architecture') || combinedText.includes('clean');
          if (!hasClean) return false;
        }
        if (frameworkFilter === 'hive') {
          const hasStorage = readme?.storage.some((s) => s.toLowerCase().includes('hive') || s.toLowerCase().includes('sql') || s.toLowerCase().includes('firebase')) || tagIds.includes('hive-ce') || tagIds.includes('sqflite') || tagIds.includes('firebase') || combinedText.includes('hive') || combinedText.includes('sqlite') || combinedText.includes('firebase');
          if (!hasStorage) return false;
        }
        if (frameworkFilter === 'api') {
          const hasApi = (readme?.apis && readme.apis.length > 0) || tagIds.includes('tmdb-api') || tagIds.includes('rest-api') || tagIds.includes('weatherapi') || tagIds.includes('retrofit') || combinedText.includes('api') || combinedText.includes('rest') || combinedText.includes('tmdb') || combinedText.includes('weather');
          if (!hasApi) return false;
        }
        if (frameworkFilter === 'google-play' && !proj.links.googlePlay && !readme?.isGooglePlay && !combinedText.includes('google play')) return false;
      }

      if (!repoSearch.trim()) return true;
      const q = repoSearch.toLowerCase();
      return (
        proj.name.toLowerCase().includes(q) ||
        proj.subtitle.toLowerCase().includes(q) ||
        proj.description.toLowerCase().includes(q) ||
        proj.technologies.some((t) => t.toLowerCase().includes(q)) ||
        tagLabels.some((tl) => tl.includes(q))
      );
    });
  }, [frameworkFilter, repoSearch]);

  const filteredRepos = useMemo(() => {
    return githubRepos.filter((repo) => {
      const matched = FEATURED_PROJECTS.find(
        (p) =>
          p.repoName.toLowerCase() === repo.name.toLowerCase() ||
          p.name.toLowerCase() === repo.name.toLowerCase()
      );
      const tags = extractRepoTechTags({
        repoName: repo.name,
        language: repo.language,
        topics: repo.topics,
        description: repo.description,
        technologies: matched?.technologies,
      });
      const tagIds = tags.map((t) => t.id.toLowerCase());
      const tagLabels = tags.map((t) => t.label.toLowerCase());
      const text = `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')} ${matched?.technologies.join(' ') || ''} ${tagLabels.join(' ')}`.toLowerCase();

      if (selectedLanguage !== 'all' && repo.language !== selectedLanguage) {
        return false;
      }
      if (frameworkFilter !== 'all') {
        const readme = getRepoReadmeSpecs(repo.name);
        if (frameworkFilter === 'flutter' && !text.includes('flutter') && repo.language !== 'Dart') return false;
        if (frameworkFilter === 'cubit') {
          const hasCubit = readme?.hasCubit || tagIds.includes('cubit') || tagIds.includes('bloc') || text.includes('cubit') || text.includes('bloc');
          if (!hasCubit) return false;
        }
        if (frameworkFilter === 'clean-arch') {
          const hasClean = readme?.architecture.some((a) => a.toLowerCase().includes('clean')) || tagIds.includes('cleanarchitecture') || tagIds.includes('clean-architecture') || text.includes('clean');
          if (!hasClean) return false;
        }
        if (frameworkFilter === 'hive') {
          const hasStorage = readme?.storage.some((s) => s.toLowerCase().includes('hive') || s.toLowerCase().includes('sql') || s.toLowerCase().includes('firebase')) || tagIds.includes('hive-ce') || tagIds.includes('sqflite') || tagIds.includes('firebase') || text.includes('hive') || text.includes('sqlite') || text.includes('firebase');
          if (!hasStorage) return false;
        }
        if (frameworkFilter === 'api') {
          const hasApi = (readme?.apis && readme.apis.length > 0) || tagIds.includes('tmdb-api') || tagIds.includes('rest-api') || tagIds.includes('weatherapi') || tagIds.includes('retrofit') || text.includes('api') || text.includes('rest') || text.includes('tmdb') || text.includes('weather');
          if (!hasApi) return false;
        }
        if (frameworkFilter === 'google-play' && !matched?.links.googlePlay && !readme?.isGooglePlay && !text.includes('google play')) return false;
      }
      if (!repoSearch.trim()) return true;
      const q = repoSearch.toLowerCase();
      return (
        repo.name.toLowerCase().includes(q) ||
        (repo.description && repo.description.toLowerCase().includes(q)) ||
        repo.topics.some((t) => t.toLowerCase().includes(q)) ||
        tagLabels.some((tl) => tl.includes(q))
      );
    }).sort((a, b) => {
      if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    });
  }, [githubRepos, selectedLanguage, frameworkFilter, repoSearch, sortBy]);

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
    <section id="projects" className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 py-10 sm:py-16 md:py-20 border-t border-black/10 dark:border-white/5 transition-colors overflow-x-clip w-full">
      
      {/* Section Header & Tab Switcher (Side-by-side on laptop/desktop mode, gracefully stacked on mobile) */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 xs:gap-5 sm:gap-6 mb-6 xs:mb-8 sm:mb-10 w-full">
        {/* Left: Section Header */}
        <div className="flex flex-col items-start text-start max-w-2xl px-1 sm:px-0">
          <div className="inline-flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-700 dark:text-cyan-400 text-[10px] xs:text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">
            <FolderGit2 size={13} className="shrink-0" />
            <span>{t.projects.badge}</span>
          </div>
          <h2 className="fluid-section-title font-extrabold text-slate-900 dark:text-white tracking-tight title-contrast">
            {t.projects.title}
          </h2>
          <p className="fluid-section-sub text-slate-600 dark:text-gray-400 mt-1.5 sm:mt-2 max-w-xl body-contrast">
            {t.projects.subtitle}
          </p>
        </div>

        {/* Right: Tab Toggle Switch (Side-by-Side in Laptop mode, always horizontal flex-row) */}
        <div className="w-full lg:w-auto flex items-center justify-start lg:justify-end shrink-0 pt-2 lg:pt-0">
          <div className="w-full sm:w-auto p-1 xs:p-1.5 rounded-2xl lg:rounded-full bg-slate-100 dark:bg-[#14151f] border border-slate-200 dark:border-white/10 flex flex-row items-center justify-center shadow-md gap-1 sm:gap-1.5">
            <button
              onClick={() => setActiveTab('featured')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl lg:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[38px] sm:min-h-[42px] whitespace-nowrap flex-1 sm:flex-initial ${
                activeTab === 'featured'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
              }`}
            >
              <Sparkles size={15} className="shrink-0" />
              <span>{t.projects.tabs.featured} ({FEATURED_PROJECTS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl lg:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[38px] sm:min-h-[42px] whitespace-nowrap flex-1 sm:flex-initial ${
                activeTab === 'github'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
              }`}
            >
              <Github size={15} className="shrink-0" />
              <span>{t.projects.tabs.github} ({githubRepos.length})</span>
            </button>
          </div>
        </div>
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
      <div className="mb-6 xs:mb-8 sm:mb-12 p-3.5 xs:p-4 sm:p-5 md:p-6 rounded-2xl bg-white dark:bg-[#10121d] border border-slate-200 dark:border-white/10 shadow-lg transition-colors">
        {/* Terminal Header Chrome */}
        <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-slate-100 dark:border-white/5 text-[11px] font-mono text-slate-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
            </div>
            <span className="font-semibold text-slate-600 dark:text-gray-300 ms-1.5">
              ahmed-el-bialy ~ zsh (git:main)
            </span>
          </div>
          <span className="hidden sm:inline-block text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
            Realtime GitHub API v3
          </span>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
          
          {/* GitHub Profile & Sync Status */}
          <div className="flex items-center gap-2.5 xs:gap-3 sm:gap-3.5 w-full lg:w-auto">
            <div className="relative shrink-0">
              <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-xl p-[1.5px] bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-md">
                <img
                  src={githubStats?.avatar_url || "https://avatars.githubusercontent.com/u/245139141?v=4"}
                  alt="Ahmed El-Bialy"
                  className="w-full h-full rounded-[10px] object-cover bg-slate-100 dark:bg-[#0a0c14]"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#10121d]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
                <span className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white font-mono truncate">
                  github.com/{githubUser}
                </span>
                <span className="inline-flex items-center gap-1 xs:gap-1.5 px-2 py-0.5 rounded-full text-[9px] xs:text-[10px] font-mono font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Radio size={10} className="animate-pulse shrink-0" />
                  <span>{githubStats?.isFromCache ? t.projects.hud.syncedCached : t.projects.hud.liveConnected}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] xs:text-[11px] sm:text-xs text-slate-600 dark:text-gray-400 mt-0.5 font-mono truncate">
                <span className="truncate">{githubStats?.bio || t.projects.hud.bioFallback}</span>
              </div>
            </div>
          </div>

          {/* Accurate Metrics Badges - High Precision Responsive Grid (Mobile 2x2, Tablet/Desktop 4x1) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 xs:gap-2 sm:gap-2.5 w-full lg:w-auto mt-2 lg:mt-0">
            <div className="flex items-center gap-2 xs:gap-2.5 p-2 xs:p-2.5 sm:px-3 sm:py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs shadow-xs min-h-[42px] sm:min-h-[44px]">
              <FolderGit2 size={15} className="text-blue-500 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] xs:text-[10px] text-slate-500 dark:text-gray-400 font-medium leading-none">{t.projects.hud.publicRepos}</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono text-xs sm:text-sm mt-0.5 leading-none">
                  {githubStats?.public_repos || githubRepos.length}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 xs:gap-2.5 p-2 xs:p-2.5 sm:px-3 sm:py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs shadow-xs min-h-[42px] sm:min-h-[44px]">
              <Star size={15} className="text-amber-500 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] xs:text-[10px] text-slate-500 dark:text-gray-400 font-medium leading-none">{t.projects.hud.totalStars}</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono text-xs sm:text-sm mt-0.5 leading-none">
                  {githubStats?.totalStars || 16}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 xs:gap-2.5 p-2 xs:p-2.5 sm:px-3 sm:py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs shadow-xs min-h-[42px] sm:min-h-[44px]">
              <GitFork size={15} className="text-cyan-500 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] xs:text-[10px] text-slate-500 dark:text-gray-400 font-medium leading-none">{t.projects.hud.totalForks}</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono text-xs sm:text-sm mt-0.5 leading-none">
                  {githubStats?.totalForks || 5}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 xs:gap-2.5 p-2 xs:p-2.5 sm:px-3 sm:py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs shadow-xs min-h-[42px] sm:min-h-[44px]">
              <GitCommit size={15} className="text-emerald-500 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] xs:text-[10px] text-slate-500 dark:text-gray-400 font-medium leading-none">{t.projects.hud.latestCommit}</span>
                <span className="font-bold text-cyan-700 dark:text-cyan-400 font-mono text-xs sm:text-sm mt-0.5 truncate leading-none">
                  {mostRecentRepo?.name || 'Revio'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Interactive Recharts Tech Stack Distribution Bar */}
        {githubStats?.languages && githubStats.languages.length > 0 && (
          <TechDistributionChart languages={githubStats.languages} />
        )}

        {/* 30-Day Activity Heatmap Grid */}
        <GitHubActivity username={githubUser} />
      </div>

      {/* Universal Search & Architecture Filter Toolbar (Applies seamlessly across both tabs) */}
      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute top-1/2 -translate-y-1/2 text-slate-400 start-3.5" />
            <input
              type="text"
              placeholder={activeTab === 'featured' ? t.projects.searchPlaceholderFeatured : t.projects.searchPlaceholderGithub}
              value={repoSearch}
              onChange={(e) => setRepoSearch(e.target.value)}
              className="w-full py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-xs min-h-[42px] ps-9 pe-3.5"
            />
          </div>

          {activeTab === 'github' && (
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-[#131522] border border-slate-200 dark:border-white/10 text-[11px] sm:text-xs text-slate-700 dark:text-gray-300 focus:outline-none cursor-pointer shadow-xs min-h-[40px]"
              >
                <option value="all">{t.projects.filterAll}</option>
                {allLanguages.map((langItem) => (
                  <option key={langItem} value={langItem}>
                    {langItem}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-[#131522] border border-slate-200 dark:border-white/10 text-[11px] sm:text-xs text-slate-700 dark:text-gray-300 focus:outline-none cursor-pointer shadow-xs min-h-[40px]"
              >
                <option value="pushed">{t.projects.sortRecentlyPushed}</option>
                <option value="stars">{t.projects.sortMostStars}</option>
                <option value="name">{t.projects.sortAlphabetical}</option>
              </select>
            </div>
          )}
        </div>

        {/* Quick Filter Chips (Cubit & BLoC, Clean Architecture, Hive CE, APIs, Google Play) */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-0.5">
          <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-slate-500 dark:text-gray-400 me-0.5">
            {lang === 'ar' ? 'تصفية:' : 'Filter:'}
          </span>
          {[
            { id: 'all', label: lang === 'ar' ? 'كافة المشاريع' : 'All Projects' },
            { id: 'cubit', label: 'Cubit & BLoC' },
            { id: 'clean-arch', label: 'Clean Architecture' },
            { id: 'hive', label: lang === 'ar' ? 'تخزين Hive CE' : 'Hive CE & Offline' },
            { id: 'api', label: 'REST APIs & TMDB' },
            { id: 'google-play', label: lang === 'ar' ? 'Google Play وتطبيقات حية' : 'Google Play & Live' },
          ].map((chip) => {
            const isChipActive = frameworkFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setFrameworkFilter(chip.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-medium transition-all cursor-pointer min-h-[32px] ${
                  isChipActive
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:text-black dark:hover:text-white border border-slate-200 dark:border-white/10 hover:border-blue-400'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: FEATURED PRODUCTION APPS */}
      {activeTab === 'featured' && (
        <>
          {/* Social Proof & Play Store Verified Review Bar */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent border border-emerald-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex text-amber-400 shrink-0 text-sm tracking-tighter">
                ★★★★★
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{lang === 'ar' ? 'تقييم 5.0 نجوم على Google Play (تطبيق Revio)' : '5.0 Rating on Google Play Store (Revio App)'}</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                    VERIFIED
                  </span>
                </span>
                <p className="text-[11px] text-slate-600 dark:text-gray-300 mt-0.5">
                  {lang === 'ar'
                    ? '«حركة قلب الكروت ثلاثية الأبعاد ونظام التخزين المحلي بدون إنترنت يقدمان أداءً فائق السلاسة!» — مراجعة مستخدم حقيقية'
                    : '"The 3D flip card animations and offline-first storage deliver flawless 60 FPS performance!" — Verified User Feedback'}
                </p>
              </div>
            </div>
            <a
              href="https://play.google.com/store/apps/details?id=com.ahmed.revio&hl=en_US"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shrink-0 shadow-xs"
            >
              <span>{lang === 'ar' ? 'عرض على المتجر' : 'View on Play Store'}</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {filteredFeaturedProjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 my-6">
              <FolderGit2 size={36} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No applications match your filter</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                Try clearing your search query or selecting &quot;All Projects&quot;.
              </p>
              <button
                onClick={() => {
                  setFrameworkFilter('all');
                  setRepoSearch('');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
              {filteredFeaturedProjects.map((project) => {
            const liveMedia =
              liveMediaMap?.[project.repoName] ||
              liveMediaMap?.[project.name] ||
              liveMediaMap?.[project.repoName.toLowerCase()];
            const liveRelease =
              repoReleases?.[project.repoName] ||
              repoReleases?.[project.name] ||
              repoReleases?.[project.repoName.toLowerCase()];

            const dynamicVideoUrl = liveMedia?.youtubeDemoUrl || project.links.youtubeDemo;
            const dynamicPlayUrl = liveMedia?.googlePlayUrl || project.links.googlePlay;
            const dynamicApkUrl = liveMedia?.apkDownloadUrl || liveRelease?.apkDownloadUrl || project.links.apkDownloadUrl;
            const dynamicReleaseUrl = liveMedia?.releaseUrl || liveRelease?.releaseUrl || project.links.releaseUrl;

            const hasLiveRelease = Boolean(
              (liveRelease?.hasRelease || liveMedia?.hasRelease) && (dynamicApkUrl || dynamicReleaseUrl)
            );
            const hasApkFile = Boolean(dynamicApkUrl || hasLiveRelease);
            const hasVideo = Boolean(dynamicVideoUrl);

            // Dynamic project with live release info and real-time parsed README media
            const dynamicProject: Project = {
              ...project,
              hasApk: hasApkFile,
              links: {
                ...project.links,
                youtubeDemo: dynamicVideoUrl,
                googlePlay: dynamicPlayUrl,
                apkDownloadUrl: dynamicApkUrl,
                releaseUrl: dynamicReleaseUrl,
              }
            };

            const cardBlueprint = synthesizeProjectBlueprint(
              project.repoName,
              'Dart',
              project.description,
              project.technologies
            );
            const cardAccent = cardBlueprint.accentColor;
            const cardGlowRgb = cardBlueprint.glowRgb;

            // Automatically extract and harmonize tags for programming language and frameworks
            const techTags = extractRepoTechTags({
              repoName: project.repoName,
              language: 'Dart',
              description: project.description,
              technologies: project.technologies,
            });

            return (
              <motion.div
                key={project.id}
                onClick={() => setSelectedProject(dynamicProject)}
                onMouseEnter={() => setHoveredCardId(project.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                whileHover={{
                  y: -6,
                  scale: 1.018,
                  borderColor: cardAccent,
                  boxShadow: `0 20px 42px -10px rgba(${cardGlowRgb}, 0.35), 0 0 0 2px ${cardAccent}`,
                }}
                whileTap={{
                  scale: 0.98,
                  borderColor: cardAccent,
                  boxShadow: `0 10px 24px -4px rgba(${cardGlowRgb}, 0.55), 0 0 0 3px ${cardAccent}`,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 24,
                }}
                style={{
                  ['--card-accent' as string]: cardAccent,
                }}
                className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[#111322] border border-slate-200/90 dark:border-white/10 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-md active:border-[var(--card-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div>
                  {/* Dynamic Smart Cover with full automatic custom standard cover & framer-motion gradient shift */}
                  <ProjectCardCover
                    repoName={project.repoName}
                    language="Dart"
                    coverUrl={project.image}
                    isHighlight={project.highlight}
                    description={project.description}
                    topics={project.technologies}
                    isCardHovered={hoveredCardId === project.id}
                  />

                  {/* Body Content with Generous Margins & Vertical Rhythm */}
                  <div className="p-3.5 xs:p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                      <h3
                        className="fluid-card-title font-bold text-slate-900 dark:text-white transition-colors title-contrast truncate"
                        style={{
                          ['--card-accent' as string]: cardAccent,
                        }}
                      >
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Dynamic Real-Time GitHub Stars Counter */}
                        {(() => {
                          const matchingRepo = githubRepos.find(
                            r => r.name.toLowerCase() === project.repoName.toLowerCase() ||
                                 r.name.toLowerCase() === project.name.toLowerCase()
                          );
                          const starCount = matchingRepo ? matchingRepo.stargazers_count : (project.repoName === 'Revio' ? 3 : project.repoName === 'Movura' ? 4 : 2);
                          return (
                            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] text-yellow-600 dark:text-yellow-400 font-mono font-semibold shadow-2xs" title={`${starCount} GitHub Stars`}>
                              <Star size={12} fill="currentColor" />
                              <span>{starCount}</span>
                            </div>
                          );
                        })()}

                        {project.links.googlePlay && (
                          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold shrink-0">
                            Google Play
                          </span>
                        )}
                      </div>
                    </div>

                    <p
                      className="fluid-card-sub font-semibold line-clamp-1 mb-1.5 sm:mb-2.5"
                      style={{ color: cardAccent }}
                    >
                      {project.subtitle}
                    </p>

                    <p className="fluid-body text-slate-600 dark:text-gray-300 leading-relaxed line-clamp-2 sm:line-clamp-3 mb-2.5 sm:mb-4 body-contrast">
                      {project.description}
                    </p>

                    {/* Automatically Extracted Programming Languages & Frameworks Pill-Shaped Tag System */}
                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-0.5 sm:pt-1">
                      {techTags.slice(0, 5).map((tag, tagIdx) => (
                        <span
                          key={`${project.id}-${tag.id}-${tagIdx}`}
                          title={`${tag.label} (${tag.category})`}
                          className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 dark:bg-cyan-500/10 border border-blue-500/25 dark:border-cyan-500/30 text-[10px] sm:text-[11px] font-mono font-bold text-blue-700 dark:text-cyan-300 transition-colors shadow-2xs hover:border-blue-400"
                        >
                          <span>{tag.label}</span>
                        </span>
                      ))}
                      {techTags.length > 5 && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-[10px] text-slate-600 dark:text-gray-300 font-mono font-bold border border-slate-200 dark:border-white/10">
                          +{techTags.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3.5 xs:p-4 sm:p-6 pt-2.5 sm:pt-3 mt-auto border-t border-slate-100 dark:border-white/5 space-y-2 sm:space-y-2.5">
                  {/* Primary Action Buttons */}
                  <div className={`grid ${hasVideo ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 sm:gap-2.5`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(dynamicProject);
                      }}
                      className="w-full flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 sm:py-3 px-2 sm:px-3.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-cyan-400 font-bold text-[11px] sm:text-xs border border-blue-500/25 transition-all cursor-pointer shadow-xs min-h-[38px] sm:min-h-[44px]"
                      title="View App Details & Specs"
                    >
                      <Eye size={14} className="shrink-0" />
                      <span>{t.projects.actions.viewSpecs}</span>
                    </button>

                    {hasVideo && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = dynamicVideoUrl || AHMED_PROFILE.youtubeUrl;
                          window.open(url, '_blank');
                        }}
                        className="w-full flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 sm:py-3 px-2 sm:px-3.5 rounded-xl bg-red-600/10 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 font-bold text-[11px] sm:text-xs border border-red-500/25 transition-all cursor-pointer shadow-xs min-h-[40px] sm:min-h-[44px]"
                        title="Watch on YouTube"
                      >
                        <Play size={13} fill="currentColor" className="shrink-0" />
                        <span>{t.projects.actions.liveDemo}</span>
                      </button>
                    )}

                    {project.links.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 sm:py-3 px-2 sm:px-3.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-gray-200 hover:text-black dark:hover:text-white border border-slate-300 dark:border-white/10 transition-all text-[11px] sm:text-xs font-bold shadow-xs min-h-[40px] sm:min-h-[44px]"
                        title="View GitHub Code"
                      >
                        <Github size={14} className="shrink-0" />
                        <span>{t.projects.actions.sourceCode}</span>
                      </a>
                    )}
                  </div>

                  {/* Secondary Row: Google Play & Conditional APK Download */}
                  {(project.links.googlePlay || hasApkFile) && (
                    <div className="flex items-center gap-1.5 sm:gap-2.5 pt-0.5 sm:pt-1">
                      {project.links.googlePlay && (
                        <a
                          href={project.links.googlePlay}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-2.5 sm:px-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 transition-all text-[11px] sm:text-xs font-bold min-h-[38px] sm:min-h-[44px]"
                        >
                          <ArrowUpRight size={14} className="shrink-0" />
                          <span>{t.projects.actions.playStore}</span>
                        </a>
                      )}

                      {hasApkFile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setApkModalProject(dynamicProject);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-2.5 sm:px-3.5 rounded-xl bg-purple-500/10 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-300 border border-purple-500/25 transition-all text-[11px] sm:text-xs font-bold min-h-[38px] sm:min-h-[44px] cursor-pointer"
                        >
                          <Download size={13} className="shrink-0" />
                          <span>{t.projects.actions.downloadApk}</span>
                          {liveRelease?.apkSize ? (
                            <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-600/20 text-purple-700 dark:text-purple-200 font-bold ms-0.5">
                              {formatFileSize(liveRelease.apkSize)}
                            </span>
                          ) : null}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  )}

      {/* TAB 2: LIVE GITHUB REPOSITORIES */}
      {activeTab === 'github' && (
        <div className="space-y-6">
          {/* Repos Grid */}
          {isPending && filteredRepos.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
              {[1, 2, 3, 4, 5, 6].map((key) => (
                <ProjectSkeletonCard key={key} />
              ))}
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 my-6">
              <FolderGit2 size={36} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No repositories match your filter</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                Try clearing your search query or selecting &quot;All Projects&quot;.
              </p>
              <button
                onClick={() => {
                  setFrameworkFilter('all');
                  setSelectedLanguage('all');
                  setRepoSearch('');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
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

                const repoBlueprint = synthesizeProjectBlueprint(
                  repo.name,
                  repo.language,
                  repo.description,
                  repo.topics
                );
                const repoAccent = repoBlueprint.accentColor;
                const repoGlowRgb = repoBlueprint.glowRgb;

                // Automatically extract and harmonize tags for programming language and frameworks
                const repoTechTags = extractRepoTechTags({
                  repoName: repo.name,
                  language: repo.language,
                  description: repo.description,
                  topics: repo.topics,
                  technologies: projectObj.technologies,
                });

                return (
                  <motion.div
                    key={repo.id}
                    onClick={() => setSelectedProject(dynamicRepoProject)}
                    onMouseEnter={() => setHoveredCardId(repo.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    whileHover={{
                      y: -6,
                      scale: 1.018,
                      borderColor: repoAccent,
                      boxShadow: `0 20px 42px -10px rgba(${repoGlowRgb}, 0.35), 0 0 0 2px ${repoAccent}`,
                    }}
                    whileTap={{
                      scale: 0.98,
                      borderColor: repoAccent,
                      boxShadow: `0 10px 24px -4px rgba(${repoGlowRgb}, 0.55), 0 0 0 3px ${repoAccent}`,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 24,
                    }}
                    style={{
                      ['--card-accent' as string]: repoAccent,
                    }}
                    className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[#111322] border border-slate-200/90 dark:border-white/10 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-md active:border-[var(--card-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <div>
                      {/* Dynamic Smart Cover with full automatic custom standard cover & framer-motion gradient shift */}
                      <ProjectCardCover
                        repoName={repo.name}
                        language={repo.language}
                        coverUrl={repo.coverImageUrl}
                        isHighlight={Boolean(projectObj.links.googlePlay || hasDemo || hasReleaseOrApk)}
                        description={repo.description}
                        topics={repo.topics}
                        isCardHovered={hoveredCardId === repo.id}
                      />

                      {/* Content Area with High Vertical Rhythm */}
                      <div className="p-3.5 xs:p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-2.5 xs:gap-3 mb-1.5 sm:mb-2">
                          <span className="fluid-card-title font-bold text-slate-900 dark:text-white transition-colors flex items-center gap-2 title-contrast truncate">
                            <FolderGit2
                              size={18}
                              className="shrink-0"
                              style={{ color: repoAccent }}
                            />
                            <span className="truncate">{repo.name}</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {hasReleaseOrApk && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold shrink-0">
                                Release
                              </span>
                            )}
                            <div className="flex items-center gap-1.5 px-2 xs:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] sm:text-xs text-yellow-600 dark:text-yellow-400 shrink-0 font-mono font-semibold">
                              <Star size={12} fill="currentColor" />
                              <span>{repo.stargazers_count}</span>
                            </div>
                          </div>
                        </div>

                        <p className="fluid-body text-slate-600 dark:text-gray-300 leading-relaxed line-clamp-2 min-h-[2.5rem] mb-2.5 sm:mb-4 body-contrast">
                          {repo.description || 'Clean Architecture production-ready mobile codebase.'}
                        </p>

                        {/* Automatically Extracted Programming Languages & Frameworks Pill-Shaped Tag System */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-0.5 sm:pt-1">
                          {repoTechTags.slice(0, 5).map((tag, tagIdx) => (
                            <span
                              key={`${repo.id}-${tag.id}-${tagIdx}`}
                              title={`${tag.label} (${tag.category})`}
                              className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 dark:bg-cyan-500/10 border border-blue-500/25 dark:border-cyan-500/30 text-[10px] sm:text-[11px] font-mono font-bold text-blue-700 dark:text-cyan-300 transition-colors shadow-2xs hover:border-blue-400"
                            >
                              <span>{tag.label}</span>
                            </span>
                          ))}
                          {repoTechTags.length > 5 && (
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-[10px] text-slate-600 dark:text-gray-300 font-mono font-bold border border-slate-200 dark:border-white/10">
                              +{repoTechTags.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Toolbar & Well-Spaced Language Bar */}
                    <div className="p-3.5 xs:p-4 sm:p-6 pt-2.5 sm:pt-3 mt-auto border-t border-slate-100 dark:border-white/5 space-y-2 sm:space-y-3">
                      {/* Action Buttons Row */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                        {/* Details Action Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(dynamicRepoProject);
                          }}
                          className="w-full flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 sm:py-3 px-2 sm:px-3.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-cyan-400 font-bold text-[11px] sm:text-xs border border-blue-500/25 transition-all cursor-pointer shadow-xs min-h-[38px] sm:min-h-[44px]"
                          title="Open full architectural details, specs & demo"
                        >
                          <Eye size={14} />
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
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-purple-500/10 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-300 border border-purple-500/25 transition-all text-xs font-bold min-h-[40px] cursor-pointer"
                        >
                          <Download size={14} />
                          <span>Download APK</span>
                          {repoRelease?.apkSize ? (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-600/20 text-purple-700 dark:text-purple-200 font-bold ms-0.5">
                              {formatFileSize(repoRelease.apkSize)}
                            </span>
                          ) : null}
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
                              const url = projectObj.links.youtubeDemo || AHMED_PROFILE.youtubeUrl;
                              window.open(url, '_blank');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 font-bold text-xs border border-red-500/20 transition-all cursor-pointer shadow-xs min-h-[38px]"
                            title="Watch on YouTube"
                          >
                            <Play size={13} fill="currentColor" />
                            <span>Watch Demo</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
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
      />

      {/* Conditional APK Download Modal with Security Notice */}
      <ApkDownloadModal
        isOpen={Boolean(apkModalProject)}
        onClose={() => setApkModalProject(null)}
        project={apkModalProject}
      />
    </section>
  );
};
