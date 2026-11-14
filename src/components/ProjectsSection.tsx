import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FolderGit2,
  Github,
  Star,
  GitFork,
  Search,
  Eye,
  ArrowUpRight,
  Play,
  Download,
  GitCommit,
  ExternalLink,
  ChevronDown,
  Youtube,
  RefreshCw,
} from 'lucide-react';
import { AHMED_CONFIG } from '../data/config';
import { FEATURED_PROJECTS, Project } from '../data/portfolioData';
import {
  GitHubRepo,
  GitHubStats,
  fetchConsolidatedGitHubPortfolio,
  ConsolidatedGitHubPortfolio,
  getLanguageColor,
  AHMED_DEFAULT_REPOS,
  VERIFIED_REPO_SCREENSHOTS,
  formatFileSize,
} from '../services/githubService';
import { ProjectCardCover, synthesizeProjectBlueprint } from './ProjectCardCover';
import { extractRepoTechTags, getRepoReadmeSpecs } from '../utils/techTagExtractor';
import { TechIconBadge } from './TechLogos';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { ApkDownloadModal } from './ApkDownloadModal';
import { ProjectSkeletonCard } from './ProjectSkeletonCard';
import { GitHubActivity } from './GitHubActivity';
import { TechDistributionChart } from './TechDistributionChart';
import { GitHubFallbackNotice } from './GitHubFallbackNotice';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import { useLanguage } from '../context/LanguageContext';

interface ProjectsSectionProps {
  currentGithubUser: string;
  onRepoCountChange?: (count: number) => void;
  isDark?: boolean;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  currentGithubUser,
  onRepoCountChange,
}) => {
  const { lang, t } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'featured' | 'github'>('featured');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [apkModalProject, setApkModalProject] = useState<Project | null>(null);

  const [githubUser] = useState<string>(currentGithubUser || 'ahmed-el-bialy');
  const [repoSearch, setRepoSearch] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [frameworkFilter, setFrameworkFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'pushed' | 'stars' | 'name'>('pushed');
  const [hoveredCardId, setHoveredCardId] = useState<string | number | null>(null);
  const [visibleRepoCount, setVisibleRepoCount] = useState<number>(6);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Single consolidated cached GitHub aggregation query (replaces 60-100+ client fan-out requests)
  const {
    data: portfolioData,
    isPending,
    isFetching,
  } = useQuery<ConsolidatedGitHubPortfolio>({
    queryKey: ['github-consolidated', githubUser],
    queryFn: () => fetchConsolidatedGitHubPortfolio(githubUser),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
    placeholderData: () => {
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(`ahmed_consolidated_gh_v1_${githubUser}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed?.data) return parsed.data;
          }
        } catch {}
      }
      return undefined;
    },
  });

  const handleForceRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      const fresh = await fetchConsolidatedGitHubPortfolio(githubUser, true);
      queryClient.setQueryData(['github-consolidated', githubUser], fresh);
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const githubRepos: GitHubRepo[] = portfolioData?.repos || AHMED_DEFAULT_REPOS;
  const githubStats: GitHubStats = portfolioData?.stats || {
    username: githubUser,
    name: 'Ahmed El-Bialy',
    avatar_url: 'https://avatars.githubusercontent.com/u/245139141?v=4',
    bio: 'Junior Flutter Developer | B.Sc. Student in AI | Mobile App Developer',
    public_repos: AHMED_DEFAULT_REPOS.length,
    followers: 12,
    following: 5,
    totalStars: 16,
    totalForks: 5,
    languages: [
      { name: 'Dart', count: 9, percentage: 90, color: '#00B4AB' },
      { name: 'Python', count: 1, percentage: 10, color: '#3572A5' },
    ],
    isFromCache: true,
  };
  const repoReleases = portfolioData?.releasesMap || {};
  const liveMediaMap = portfolioData?.liveMediaMap || {};

  useEffect(() => {
    if (githubRepos.length > 0 && onRepoCountChange) {
      onRepoCountChange(githubRepos.length);
    }
  }, [githubRepos.length, onRepoCountChange]);

  const getProjectFromRepo = (repo: GitHubRepo): Project => {
    const liveMedia = liveMediaMap[repo.name] || liveMediaMap[repo.name.toLowerCase()];
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
          liveDemoUrl: liveMedia?.liveDemoUrl || repo.liveDemoUrl || matched.links.liveDemoUrl,
          playlistUrl: liveMedia?.playlistUrl || repo.playlistUrl || matched.links.playlistUrl,
          apkDownloadUrl: liveMedia?.apkDownloadUrl || matched.links.apkDownloadUrl,
          releaseUrl: liveMedia?.releaseUrl || matched.links.releaseUrl,
        },
      };
    }

    const isDart =
      (repo.language || '').toLowerCase().includes('dart') ||
      (repo.topics || []).some((topic) => ['flutter', 'dart', 'mobile'].includes(topic.toLowerCase()));

    return {
      id: repo.id,
      name: repo.name,
      repoName: repo.name,
      subtitle:
        repo.description ||
        `${isDart ? 'Flutter Mobile Application' : 'Software Engineering Project'} & Clean Architecture`,
      description:
        repo.description ||
        `Production-ready codebase implementing Clean Architecture and repository pattern in ${
          repo.language || 'Dart'
        }.`,
      technologies: [
        repo.language || 'Dart',
        ...(repo.topics || []),
        isDart ? 'Clean Architecture' : 'OOP',
        isDart ? 'BLoC/Cubit' : 'Design Patterns',
      ].filter((v, i, a) => a.indexOf(v) === i),
      features: [
        'Clean architectural separation (Data, Domain, Presentation)',
        'Predictable state management and unidirectional data flow',
        'Offline caching and resilient local data persistence',
        'Modular, testable Flutter UI components',
      ],
      image: repo.coverImageUrl || '',
      hasApk: false,
      links: {
        github: repo.html_url,
        liveDemoUrl: liveMedia?.liveDemoUrl || repo.liveDemoUrl,
        playlistUrl: liveMedia?.playlistUrl || repo.playlistUrl,
        googlePlay: liveMedia?.googlePlayUrl || repo.googlePlayUrl,
        apkDownloadUrl: liveMedia?.apkDownloadUrl,
        releaseUrl: liveMedia?.releaseUrl,
      },
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
      const tagIds = tags.map((tag) => tag.id.toLowerCase());
      const tagLabels = tags.map((tag) => tag.label.toLowerCase());
      const combinedText = `${proj.name} ${proj.repoName} ${proj.subtitle} ${proj.description} ${proj.technologies.join(
        ' '
      )} ${tagLabels.join(' ')}`.toLowerCase();

      if (frameworkFilter !== 'all') {
        const readme = getRepoReadmeSpecs(proj.repoName);
        if (frameworkFilter === 'cubit') {
          const hasCubit =
            readme?.hasCubit ||
            tagIds.includes('cubit') ||
            tagIds.includes('bloc') ||
            combinedText.includes('cubit') ||
            combinedText.includes('bloc');
          if (!hasCubit) return false;
        }
        if (frameworkFilter === 'clean-arch') {
          const hasClean =
            readme?.architecture.some((a) => a.toLowerCase().includes('clean')) ||
            tagIds.includes('cleanarchitecture') ||
            tagIds.includes('clean-architecture') ||
            combinedText.includes('clean');
          if (!hasClean) return false;
        }
        if (frameworkFilter === 'hive') {
          const hasStorage =
            readme?.storage.some(
              (s) =>
                s.toLowerCase().includes('hive') ||
                s.toLowerCase().includes('sql') ||
                s.toLowerCase().includes('firebase')
            ) ||
            tagIds.includes('hive-ce') ||
            tagIds.includes('sqflite') ||
            tagIds.includes('firebase') ||
            combinedText.includes('hive') ||
            combinedText.includes('sqlite') ||
            combinedText.includes('firebase');
          if (!hasStorage) return false;
        }
        if (frameworkFilter === 'api') {
          const hasApi =
            (readme?.apis && readme.apis.length > 0) ||
            tagIds.includes('tmdb-api') ||
            tagIds.includes('rest-api') ||
            tagIds.includes('weatherapi') ||
            tagIds.includes('retrofit') ||
            combinedText.includes('api') ||
            combinedText.includes('rest') ||
            combinedText.includes('tmdb') ||
            combinedText.includes('weather');
          if (!hasApi) return false;
        }
        if (
          frameworkFilter === 'google-play' &&
          !proj.links.googlePlay &&
          !readme?.isGooglePlay &&
          !combinedText.includes('google play')
        ) {
          return false;
        }
      }

      if (!repoSearch.trim()) return true;
      const q = repoSearch.toLowerCase();
      return (
        proj.name.toLowerCase().includes(q) ||
        proj.subtitle.toLowerCase().includes(q) ||
        proj.description.toLowerCase().includes(q) ||
        proj.technologies.some((tech) => tech.toLowerCase().includes(q)) ||
        tagLabels.some((tl) => tl.includes(q))
      );
    });
  }, [frameworkFilter, repoSearch]);

  const filteredRepos = useMemo(() => {
    return githubRepos
      .filter((repo) => {
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
        const tagIds = tags.map((tag) => tag.id.toLowerCase());
        const tagLabels = tags.map((tag) => tag.label.toLowerCase());
        const text = `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')} ${
          matched?.technologies.join(' ') || ''
        } ${tagLabels.join(' ')}`.toLowerCase();

        if (selectedLanguage !== 'all' && repo.language !== selectedLanguage) {
          return false;
        }
        if (frameworkFilter !== 'all') {
          const readme = getRepoReadmeSpecs(repo.name);
          if (frameworkFilter === 'cubit') {
            const hasCubit =
              readme?.hasCubit ||
              tagIds.includes('cubit') ||
              tagIds.includes('bloc') ||
              text.includes('cubit') ||
              text.includes('bloc');
            if (!hasCubit) return false;
          }
          if (frameworkFilter === 'clean-arch') {
            const hasClean =
              readme?.architecture.some((a) => a.toLowerCase().includes('clean')) ||
              tagIds.includes('cleanarchitecture') ||
              tagIds.includes('clean-architecture') ||
              text.includes('clean');
            if (!hasClean) return false;
          }
          if (frameworkFilter === 'hive') {
            const hasStorage =
              readme?.storage.some(
                (s) =>
                  s.toLowerCase().includes('hive') ||
                  s.toLowerCase().includes('sql') ||
                  s.toLowerCase().includes('firebase')
              ) ||
              tagIds.includes('hive-ce') ||
              tagIds.includes('sqflite') ||
              tagIds.includes('firebase') ||
              text.includes('hive') ||
              text.includes('sqlite') ||
              text.includes('firebase');
            if (!hasStorage) return false;
          }
          if (frameworkFilter === 'api') {
            const hasApi =
              (readme?.apis && readme.apis.length > 0) ||
              tagIds.includes('tmdb-api') ||
              tagIds.includes('rest-api') ||
              tagIds.includes('weatherapi') ||
              tagIds.includes('retrofit') ||
              text.includes('api') ||
              text.includes('rest') ||
              text.includes('tmdb') ||
              text.includes('weather');
            if (!hasApi) return false;
          }
          if (
            frameworkFilter === 'google-play' &&
            !matched?.links.googlePlay &&
            !readme?.isGooglePlay &&
            !text.includes('google play')
          ) {
            return false;
          }
        }
        if (!repoSearch.trim()) return true;
        const q = repoSearch.toLowerCase();
        return (
          repo.name.toLowerCase().includes(q) ||
          (repo.description && repo.description.toLowerCase().includes(q)) ||
          repo.topics.some((topic) => topic.toLowerCase().includes(q)) ||
          tagLabels.some((tl) => tl.includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
      });
  }, [githubRepos, selectedLanguage, frameworkFilter, repoSearch, sortBy]);

  const allLanguages = useMemo(() => {
    return Array.from(new Set(githubRepos.map((r) => r.language).filter(Boolean))) as string[];
  }, [githubRepos]);

  const mostRecentRepo = useMemo(() => {
    return githubRepos.length > 0
      ? [...githubRepos].sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())[0]
      : null;
  }, [githubRepos]);

  return (
    <section
      id="projects"
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-28 sm:pb-20 transition-colors overflow-x-clip w-full"
    >
      {/* Clean Page Header & Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8 w-full">
        <div className="flex flex-col items-start text-start max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-cyan-400 mb-2">
            <span>{t.projects.badge}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 dark:text-slate-400 font-mono">
              github.com/{githubUser}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight [text-wrap:balance]">
            {t.projects.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-xl">
            {t.projects.subtitle}
          </p>
        </div>

        {/* Clean 2-Tab Toggle Switch */}
        <div className="w-full lg:w-auto flex items-center justify-start lg:justify-end shrink-0">
          <div className="w-full sm:w-auto p-1 rounded-xl bg-slate-100 dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 flex flex-row items-center gap-1 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('featured')}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[40px] whitespace-nowrap flex-1 sm:flex-initial ${
                activeTab === 'featured'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>
                {t.projects.tabs.featured} ({FEATURED_PROJECTS.length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('github')}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[40px] whitespace-nowrap flex-1 sm:flex-initial ${
                activeTab === 'github'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Github size={15} className="shrink-0" />
              <span>
                {t.projects.tabs.github} ({githubRepos.length})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Offline / Cached State Notice */}
      {githubStats?.isFromCache && (
        <GitHubFallbackNotice
          isOffline={typeof navigator !== 'undefined' && !navigator.onLine}
          isRateLimited={!portfolioData}
          onRetry={handleForceRefresh}
          isRefreshing={isFetching || isManualRefreshing}
        />
      )}

      {/* Clean GitHub Portfolio Metrics & Language Breakdown Bar (Zero fake terminal chrome) */}
      <div className="mb-8 p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#0f1117] border border-slate-200/90 dark:border-white/10 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full lg:w-auto">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 dark:border-white/15 shrink-0">
              <ImageWithSkeleton
                src={githubStats.avatar_url || 'https://avatars.githubusercontent.com/u/245139141?v=4'}
                alt="Ahmed El-Bialy"
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`https://github.com/${githubUser}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-slate-900 dark:text-white font-mono hover:text-blue-600 dark:hover:text-cyan-400 transition-colors truncate"
                >
                  github.com/{githubUser}
                </a>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  · {githubStats.isFromCache ? t.projects.hud.syncedCached : t.projects.hud.liveConnected}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                {githubStats.bio || t.projects.hud.bioFallback}
              </p>
            </div>

            <button
              type="button"
              onClick={handleForceRefresh}
              disabled={isFetching || isManualRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              title="Refresh GitHub metadata"
            >
              <RefreshCw
                size={13}
                className={isFetching || isManualRefreshing ? 'animate-spin text-blue-500' : ''}
              />
              <span className="hidden sm:inline">
                {isFetching || isManualRefreshing
                  ? lang === 'ar'
                    ? 'جارٍ التزامن...'
                    : 'Syncing...'
                  : lang === 'ar'
                  ? 'تحديث'
                  : 'Sync'}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/8">
              <FolderGit2 size={15} className="text-blue-500 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {t.projects.hud.publicRepos}
                </div>
                <div className="font-bold font-mono tabular-nums text-xs sm:text-sm text-slate-900 dark:text-white">
                  {githubStats.public_repos || githubRepos.length}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/8">
              <Star size={15} className="text-amber-500 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {t.projects.hud.totalStars}
                </div>
                <div className="font-bold font-mono tabular-nums text-xs sm:text-sm text-slate-900 dark:text-white">
                  {githubStats.totalStars || 16}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/8">
              <GitFork size={15} className="text-cyan-500 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {t.projects.hud.totalForks}
                </div>
                <div className="font-bold font-mono tabular-nums text-xs sm:text-sm text-slate-900 dark:text-white">
                  {githubStats.totalForks || 5}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/8">
              <GitCommit size={15} className="text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {t.projects.hud.latestCommit}
                </div>
                <div className="font-bold font-mono text-xs sm:text-sm text-blue-600 dark:text-cyan-400 truncate">
                  {mostRecentRepo?.name || 'Revio'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {githubStats.languages && githubStats.languages.length > 0 && (
          <TechDistributionChart languages={githubStats.languages} />
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-3 mb-7">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute top-1/2 -translate-y-1/2 text-slate-400 start-3.5" />
            <input
              type="text"
              placeholder={
                activeTab === 'featured'
                  ? t.projects.searchPlaceholderFeatured
                  : t.projects.searchPlaceholderGithub
              }
              value={repoSearch}
              onChange={(e) => setRepoSearch(e.target.value)}
              className="w-full py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors min-h-[42px] ps-9 pe-3.5"
            />
          </div>

          {activeTab === 'github' && (
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer min-h-[40px]"
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
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer min-h-[40px]"
              >
                <option value="pushed">{t.projects.sortRecentlyPushed}</option>
                <option value="stars">{t.projects.sortMostStars}</option>
                <option value="name">{t.projects.sortAlphabetical}</option>
              </select>
            </div>
          )}
        </div>

        {/* Clean Quick Architecture Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 me-1">
            {lang === 'ar' ? 'تصفية:' : 'Filter:'}
          </span>
          {[
            { id: 'all', label: lang === 'ar' ? 'الكل' : 'All' },
            { id: 'cubit', label: 'Cubit & BLoC' },
            { id: 'clean-arch', label: 'Clean Architecture' },
            { id: 'hive', label: lang === 'ar' ? 'Hive CE & تخزين' : 'Hive CE & Offline' },
            { id: 'api', label: 'REST APIs & TMDB' },
            { id: 'google-play', label: 'Google Play' },
          ].map((chip) => {
            const isChipActive = frameworkFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFrameworkFilter(chip.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isChipActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-blue-400'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explicit Loading Skeleton Grid while fetching fresh GitHub data on first load without cache */}
      {isPending && !portfolioData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((sk) => (
            <ProjectSkeletonCard key={sk} />
          ))}
        </div>
      )}

      {/* TAB 1: FEATURED PRODUCTION APPS */}
      {activeTab === 'featured' && (
        <>
          {/* Flagship Google Play Spotlight: Revio */}
          <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f1117] border border-emerald-500/35 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {lang === 'ar' ? 'تطبيق منشور على Google Play' : 'Published on Google Play'}
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-slate-500 dark:text-[#94a3b8]">com.ahmed.revio</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#f1f5f9] tracking-tight">
                {lang === 'ar'
                  ? 'Revio — تطبيق البطاقات التعليمية الذكية بدون إنترنت'
                  : 'Revio — Active Recall & Smart Flashcards'}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94a3b8] leading-relaxed">
                {lang === 'ar'
                  ? 'مبني بمعمارية Clean Architecture وإدارة الحالة عبر Cubit مع تخزين محلي فائق السرعة Hive CE وتقليب بطاقات 60 FPS ودعم اختبارات MCQ والكتابة.'
                  : 'Engineered with Clean Architecture, Cubit state streams, and zero-latency Hive CE local NoSQL persistence with 60 FPS interactive flip cards, MCQ quizzes, and offline analytics.'}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a
                  href={AHMED_CONFIG.socials.playstore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  <span>{lang === 'ar' ? 'تثبيت من Google Play' : 'Get on Google Play'}</span>
                  <ExternalLink size={12} />
                </a>

                <a
                  href="https://youtube.com/shorts/FsG1XUAbmDY?si=lvngji7Uz-EKRROJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white border border-red-500/25 font-bold text-xs transition-colors"
                >
                  <Play size={12} fill="currentColor" />
                  <span>{t.projects.actions.liveDemo}</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const revioProj = FEATURED_PROJECTS.find((p) => p.repoName === 'Revio');
                    if (revioProj) setSelectedProject(revioProj);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#161b27] hover:border-[#027DFD] text-slate-800 dark:text-[#f1f5f9] border border-slate-200 dark:border-white/10 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Eye size={13} />
                  <span>{t.projects.actions.viewSpecs}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-3 gap-2.5">
              {VERIFIED_REPO_SCREENSHOTS.Revio.slice(0, 3).map((shot, idx) => (
                <button
                  key={shot}
                  type="button"
                  onClick={() => {
                    const revioProj = FEATURED_PROJECTS.find((p) => p.repoName === 'Revio');
                    if (revioProj) setSelectedProject(revioProj);
                  }}
                  className="aspect-[9/16] rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-[#08090d] group cursor-pointer"
                  aria-label={`Inspect Revio screen ${idx + 1}`}
                >
                  <ImageWithSkeleton
                    src={shot}
                    alt={`Revio screenshot ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                </button>
              ))}
            </div>
          </div>

          {filteredFeaturedProjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 my-6">
              <FolderGit2 size={34} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.projects.noProjectsFound}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setFrameworkFilter('all');
                  setRepoSearch('');
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors cursor-pointer"
              >
                {t.projects.resetFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {filteredFeaturedProjects.map((project) => {
                const liveMedia =
                  liveMediaMap[project.repoName] ||
                  liveMediaMap[project.name] ||
                  liveMediaMap[project.repoName.toLowerCase()];
                const liveRelease =
                  repoReleases[project.repoName] ||
                  repoReleases[project.name] ||
                  repoReleases[project.repoName.toLowerCase()];

                const dynamicLiveDemoUrl = liveMedia?.liveDemoUrl || project.links.liveDemoUrl;
                const dynamicPlaylistUrl = liveMedia?.playlistUrl || project.links.playlistUrl;
                const dynamicPlayUrl = liveMedia?.googlePlayUrl || project.links.googlePlay;
                const dynamicApkUrl =
                  liveMedia?.apkDownloadUrl || liveRelease?.apkDownloadUrl || project.links.apkDownloadUrl;
                const dynamicReleaseUrl =
                  liveMedia?.releaseUrl || liveRelease?.releaseUrl || project.links.releaseUrl;

                const hasLiveRelease = Boolean(
                  (liveRelease?.hasRelease || liveMedia?.hasRelease) &&
                    (dynamicApkUrl || dynamicReleaseUrl)
                );
                const hasApkFile = Boolean(dynamicApkUrl || hasLiveRelease);
                const hasLiveDemo = Boolean(dynamicLiveDemoUrl);
                const hasPlaylist = Boolean(dynamicPlaylistUrl);

                const dynamicProject: Project = {
                  ...project,
                  hasApk: hasApkFile,
                  links: {
                    ...project.links,
                    liveDemoUrl: dynamicLiveDemoUrl,
                    playlistUrl: dynamicPlaylistUrl,
                    googlePlay: dynamicPlayUrl,
                    apkDownloadUrl: dynamicApkUrl,
                    releaseUrl: dynamicReleaseUrl,
                  },
                };

                const cardBlueprint = synthesizeProjectBlueprint(
                  project.repoName,
                  'Dart',
                  project.description,
                  project.technologies
                );
                const cardAccent = cardBlueprint.accentColor;

                const matchingRepo = githubRepos.find(
                  (r) =>
                    r.name.toLowerCase() === project.repoName.toLowerCase() ||
                    r.name.toLowerCase() === project.name.toLowerCase()
                );
                const starCount = matchingRepo
                  ? matchingRepo.stargazers_count
                  : project.repoName === 'Revio'
                  ? 3
                  : project.repoName === 'Movura'
                  ? 4
                  : 2;

                const techTags = extractRepoTechTags({
                  repoName: project.repoName,
                  language: 'Dart',
                  description: project.description,
                  technologies: project.technologies,
                });

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedProject(dynamicProject)}
                    onMouseEnter={() => setHoveredCardId(project.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[#0f1117] border border-slate-200/90 dark:border-white/10 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/45 shadow-sm hover:shadow-xl"
                  >
                    <div>
                      <ProjectCardCover
                        repoName={project.repoName}
                        language="Dart"
                        coverUrl={project.image}
                        isHighlight={project.highlight}
                        description={project.description}
                        topics={project.technologies}
                        isCardHovered={hoveredCardId === project.id}
                      />

                      <div className="p-5">
                        {/* Unboxed Single-Line Title & Metrics Row */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs font-mono shrink-0 text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1 text-amber-500 font-semibold tabular-nums">
                              <Star size={12} fill="currentColor" />
                              {starCount}
                            </span>
                            {dynamicPlayUrl && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  Play Store
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <p
                          className="text-xs font-semibold line-clamp-1 mb-2"
                          style={{ color: cardAccent }}
                        >
                          {project.subtitle}
                        </p>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 mb-3.5">
                          {project.description}
                        </p>

                        {/* Max 3 Tech Badges + Counter to avoid pill-soup clutter */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {techTags.slice(0, 3).map((tag, tagIdx) => (
                            <TechIconBadge
                              key={`${project.id}-${tag.id}-${tagIdx}`}
                              label={tag.label}
                              id={tag.id}
                              category={tag.category}
                            />
                          ))}
                          {techTags.length > 3 && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] text-slate-600 dark:text-slate-300 font-mono font-semibold border border-slate-200 dark:border-white/10">
                              +{techTags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-5 py-4 mt-auto border-t border-slate-100 dark:border-white/8 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(dynamicProject);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-cyan-400 font-semibold text-xs border border-blue-500/20 transition-colors cursor-pointer min-h-[40px]"
                        >
                          <Eye size={14} className="shrink-0" />
                          <span>{t.projects.actions.viewSpecs}</span>
                        </button>

                        {project.links.github && (
                          <a
                            href={project.links.github}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors text-xs font-semibold min-h-[40px]"
                          >
                            <Github size={14} className="shrink-0" />
                            <span>{t.projects.actions.sourceCode}</span>
                          </a>
                        )}
                      </div>

                      {(hasLiveDemo || hasPlaylist || dynamicPlayUrl || hasApkFile) && (
                        <div className="flex flex-wrap items-center gap-2">
                          {hasLiveDemo && (
                            <a
                              href={dynamicLiveDemoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title={hasPlaylist ? (lang === 'ar' ? 'آخر تحديث / العرض الحي' : 'Latest Update / Live Demo') : (lang === 'ar' ? 'العرض الحي' : 'Live Demo')}
                              className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-600/10 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 font-bold text-xs border border-red-500/20 transition-colors cursor-pointer min-h-[38px] whitespace-nowrap"
                            >
                              <Play size={12} fill="currentColor" className="shrink-0" />
                              <span>{t.projects.actions.liveDemo}</span>
                            </a>
                          )}

                          {hasPlaylist && (
                            <a
                              href={dynamicPlaylistUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-white/10 transition-colors min-h-[38px] whitespace-nowrap"
                            >
                              <Youtube size={13} className="text-red-500 shrink-0" />
                              <span>{t.projects.actions.fullReview}</span>
                            </a>
                          )}

                          {dynamicPlayUrl && (
                            <a
                              href={dynamicPlayUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 min-w-[115px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 transition-colors text-xs font-bold min-h-[38px]"
                            >
                              <ArrowUpRight size={14} className="shrink-0" />
                              <span>{t.projects.actions.playStore}</span>
                            </a>
                          )}

                          {hasApkFile && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setApkModalProject(dynamicProject);
                              }}
                              className="flex-1 min-w-[115px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-300 border border-purple-500/20 transition-colors text-xs font-bold min-h-[38px] cursor-pointer"
                            >
                              <Download size={13} className="shrink-0" />
                              <span>{t.projects.actions.downloadApk}</span>
                              {liveRelease?.apkSize ? (
                                <span className="text-[10px] font-mono opacity-80">
                                  ({formatFileSize(liveRelease.apkSize)})
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
          <div className="mb-2">
            <GitHubActivity username={githubUser} weeksToShow={14} />
          </div>

          {isPending && filteredRepos.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {[1, 2, 3, 4, 5, 6].map((key) => (
                <ProjectSkeletonCard key={key} />
              ))}
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 my-6">
              <FolderGit2 size={34} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No repositories match your filter
              </h3>
              <button
                type="button"
                onClick={() => {
                  setFrameworkFilter('all');
                  setSelectedLanguage('all');
                  setRepoSearch('');
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors cursor-pointer"
              >
                {t.projects.resetFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {filteredRepos.slice(0, visibleRepoCount).map((repo) => {
                const projectObj = getProjectFromRepo(repo);
                const repoRelease = repoReleases[repo.name] || repoReleases[repo.name.toLowerCase()];
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
                  },
                };

                const dynamicLiveDemoUrl = projectObj.links.liveDemoUrl;
                const dynamicPlaylistUrl = projectObj.links.playlistUrl;
                const hasLiveDemo = Boolean(dynamicLiveDemoUrl);
                const hasPlaylist = Boolean(dynamicPlaylistUrl);

                const repoBlueprint = synthesizeProjectBlueprint(
                  repo.name,
                  repo.language,
                  repo.description,
                  repo.topics
                );

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
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedProject(dynamicRepoProject)}
                    onMouseEnter={() => setHoveredCardId(repo.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[#0f1117] border border-slate-200/90 dark:border-white/10 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-sm hover:-translate-y-1 hover:border-blue-500/45 hover:shadow-xl"
                  >
                    <div>
                      <ProjectCardCover
                        repoName={repo.name}
                        language={repo.language}
                        coverUrl={repo.coverImageUrl}
                        isHighlight={Boolean(
                          projectObj.links.googlePlay || hasLiveDemo || hasPlaylist || hasReleaseOrApk
                        )}
                        description={repo.description}
                        topics={repo.topics}
                        isCardHovered={hoveredCardId === repo.id}
                      />

                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                            <FolderGit2
                              size={16}
                              className="shrink-0"
                              style={{ color: repoBlueprint.accentColor }}
                            />
                            <span className="truncate">{repo.name}</span>
                          </span>
                          <div className="flex items-center gap-2 text-xs font-mono shrink-0 text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1 text-amber-500 font-semibold tabular-nums">
                              <Star size={12} fill="currentColor" />
                              {repo.stargazers_count}
                            </span>
                            {hasReleaseOrApk && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  Release
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 min-h-[2.4rem] mb-3.5">
                          {repo.description || 'Clean Architecture production-ready mobile codebase.'}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {repoTechTags.slice(0, 3).map((tag, tagIdx) => (
                            <TechIconBadge
                              key={`${repo.id}-${tag.id}-${tagIdx}`}
                              label={tag.label}
                              id={tag.id}
                              category={tag.category}
                            />
                          ))}
                          {repoTechTags.length > 3 && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] text-slate-600 dark:text-slate-300 font-mono font-semibold border border-slate-200 dark:border-white/10">
                              +{repoTechTags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-4 mt-auto border-t border-slate-100 dark:border-white/8 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(dynamicRepoProject);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-cyan-400 font-semibold text-xs border border-blue-500/20 transition-colors cursor-pointer min-h-[40px]"
                        >
                          <Eye size={14} />
                          <span>{lang === 'ar' ? 'التفاصيل' : 'Details'}</span>
                        </button>

                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors text-xs font-semibold min-h-[40px]"
                        >
                          <Github size={14} />
                          <span>GitHub</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>

                      {hasReleaseOrApk && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setApkModalProject(dynamicRepoProject);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-300 border border-purple-500/20 transition-colors text-xs font-bold min-h-[38px] cursor-pointer"
                        >
                          <Download size={13} />
                          <span>{t.projects.actions.downloadApk}</span>
                          {repoRelease?.apkSize ? (
                            <span className="text-[10px] font-mono opacity-80">
                              ({formatFileSize(repoRelease.apkSize)})
                            </span>
                          ) : null}
                        </button>
                      )}

                      <div className="pt-2 border-t border-slate-100 dark:border-white/8 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-3">
                          {repo.language && (
                            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: getLanguageColor(repo.language) }}
                              />
                              <span>{repo.language}</span>
                            </span>
                          )}
                          {repo.forks_count > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-mono">
                              <GitFork size={12} className="text-cyan-500" />
                              <span>{repo.forks_count}</span>
                            </span>
                          )}
                        </div>

                        {(hasLiveDemo || hasPlaylist) && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {hasLiveDemo && (
                              <a
                                href={dynamicLiveDemoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title={hasPlaylist ? (lang === 'ar' ? 'آخر تحديث / العرض الحي' : 'Latest Update / Live Demo') : (lang === 'ar' ? 'العرض الحي' : 'Live Demo')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 font-bold text-[11px] border border-red-500/20 transition-colors cursor-pointer whitespace-nowrap"
                              >
                                <Play size={11} fill="currentColor" className="shrink-0" />
                                <span>{t.projects.actions.liveDemo}</span>
                              </a>
                            )}

                            {hasPlaylist && (
                              <a
                                href={dynamicPlaylistUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 font-bold text-[11px] border border-slate-200 dark:border-white/10 transition-colors whitespace-nowrap"
                              >
                                <Youtube size={12} className="text-red-500 shrink-0" />
                                <span>{t.projects.actions.fullReview}</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {filteredRepos.length > visibleRepoCount && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => setVisibleRepoCount((prev) => prev + 6)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
              >
                <ChevronDown size={15} />
                <span>
                  {lang === 'ar'
                    ? `عرض المزيد (${filteredRepos.length - visibleRepoCount} متبقية)`
                    : `Show More Repositories (${filteredRepos.length - visibleRepoCount} remaining)`}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      <ProjectDetailsModal
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
      />

      <ApkDownloadModal
        isOpen={Boolean(apkModalProject)}
        onClose={() => setApkModalProject(null)}
        project={apkModalProject}
      />
    </section>
  );
};
