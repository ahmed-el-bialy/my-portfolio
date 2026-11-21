import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FolderGit2,
  Github,
  Star,
  GitFork,
  Search,
  Eye,
  ArrowUpRight,
  Download,
  GitCommit,
  ExternalLink,
  ChevronDown,
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
import { resolveSmartProjectLinks } from '../utils/projectLinks';
import { SmartDemoButtons } from './SmartDemoButtons';
import { ProjectCardCover, synthesizeProjectBlueprint } from './ProjectCardCover';
import { extractRepoTechTags, getRepoReadmeSpecs } from '../utils/techTagExtractor';
import { TechIconBadge } from './TechLogos';
import { ProjectSkeletonCard } from './ProjectSkeletonCard';
import { LeafAnimation } from './LeafAnimation';
import { GitHubActivity } from './GitHubActivity';
import { TechDistributionChart } from './TechDistributionChart';
import { GitHubFallbackNotice } from './GitHubFallbackNotice';
import { ImageWithSkeleton, preloadImageUrls } from './ImageWithSkeleton';
import { usePlayStoreAppStats } from '../services/playStoreService';
import { useLanguage } from '../context/LanguageContext';

const LazyProjectDetailsModal = lazy(() =>
  import('./ProjectDetailsModal').then((m) => ({ default: m.ProjectDetailsModal }))
);
const LazyApkDownloadModal = lazy(() =>
  import('./ApkDownloadModal').then((m) => ({ default: m.ApkDownloadModal }))
);
const LazyVideoDemoModal = lazy(() =>
  import('./VideoDemoModal').then((m) => ({ default: m.VideoDemoModal }))
);

interface ProjectsSectionProps {
  currentGithubUser: string;
  onRepoCountChange?: (count: number) => void;
  isDark?: boolean;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  currentGithubUser,
  onRepoCountChange,
  isDark,
}) => {
  const { lang, t } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'featured' | 'github'>('featured');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedScreenIndex, setSelectedScreenIndex] = useState<number>(0);
  const [cardScreenMap, setCardScreenMap] = useState<Record<string, number>>({});
  const [apkModalProject, setApkModalProject] = useState<Project | null>(null);
  const [videoModalState, setVideoModalState] = useState<{
    projectName: string;
    videoUrl: string;
  } | null>(null);
  const [mountedModals, setMountedModals] = useState({
    details: false,
    apk: false,
    video: false,
  });

  const openProjectDetails = (proj: Project, screenIdx: number) => {
    setMountedModals((prev) => (prev.details ? prev : { ...prev, details: true }));
    setSelectedScreenIndex(screenIdx);
    setSelectedProject(proj);
  };

  const openApkModal = (proj: Project) => {
    setMountedModals((prev) => (prev.apk ? prev : { ...prev, apk: true }));
    setApkModalProject(proj);
  };

  const openVideoModal = (projectName: string, videoUrl: string) => {
    setMountedModals((prev) => (prev.video ? prev : { ...prev, video: true }));
    setVideoModalState({ projectName, videoUrl });
  };

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
          const cached = localStorage.getItem(`ahmed_consolidated_gh_v2_${githubUser}`);
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
          demoVideoUrl: matched.links.demoVideoUrl,
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

  const mergedFeaturedProjects = useMemo(() => {
    const normalizedFeaturedNames = new Set(
      FEATURED_PROJECTS.flatMap((p) => [
        p.repoName.toLowerCase(),
        p.name.toLowerCase(),
        p.name.toLowerCase().replace(/[-_\s]/g, ''),
      ])
    );

    const enrichedBase = FEATURED_PROJECTS.map((proj) => {
      const matched = githubRepos.find(
        (r) =>
          r.name.toLowerCase() === proj.repoName.toLowerCase() ||
          r.name.toLowerCase() === proj.name.toLowerCase()
      );
      if (!matched) return proj;
      const liveMedia =
        liveMediaMap[proj.repoName] ||
        liveMediaMap[matched.name] ||
        liveMediaMap[proj.repoName.toLowerCase()];
      return {
        ...proj,
        links: {
          ...proj.links,
          github: matched.html_url || proj.links.github,
          googlePlay: liveMedia?.googlePlayUrl || matched.googlePlayUrl || proj.links.googlePlay,
          liveDemoUrl: liveMedia?.liveDemoUrl || matched.liveDemoUrl || proj.links.liveDemoUrl,
          playlistUrl: liveMedia?.playlistUrl || matched.playlistUrl || proj.links.playlistUrl,
          apkDownloadUrl: liveMedia?.apkDownloadUrl || proj.links.apkDownloadUrl,
          releaseUrl: liveMedia?.releaseUrl || proj.links.releaseUrl,
        },
      };
    });

    const extraLiveRepos = githubRepos
      .filter((repo) => {
        if (!repo?.name || repo.is_fork) return false;
        const clean = repo.name.toLowerCase();
        const compact = clean.replace(/[-_\s]/g, '');
        if (clean === githubUser.toLowerCase()) return false;
        return !normalizedFeaturedNames.has(clean) && !normalizedFeaturedNames.has(compact);
      })
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      .map((repo) => getProjectFromRepo(repo));

    return [...enrichedBase, ...extraLiveRepos];
  }, [githubRepos, githubUser, liveMediaMap]);

  const filteredFeaturedProjects = useMemo(() => {
    return mergedFeaturedProjects.filter((proj) => {
      const matchingRepo = githubRepos.find(
        (r) =>
          r.name.toLowerCase() === proj.repoName.toLowerCase() ||
          r.name.toLowerCase() === proj.name.toLowerCase()
      );
      const tags = extractRepoTechTags({
        repoName: proj.repoName,
        language: matchingRepo?.language || 'Dart',
        topics: matchingRepo?.topics,
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
  }, [mergedFeaturedProjects, githubRepos, frameworkFilter, repoSearch]);

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
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#0369a1] dark:text-[#38bdf8] mb-2">
            <span>{t.projects.badge}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-600 dark:text-slate-400">
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
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] sm:min-h-[40px] whitespace-nowrap flex-1 sm:flex-initial ${
                activeTab === 'featured'
                  ? 'bg-[#0284ff] text-white shadow-sm shadow-[#0284ff]/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="tabular-nums">
                {t.projects.tabs.featured} ({mergedFeaturedProjects.length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('github')}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] sm:min-h-[40px] whitespace-nowrap flex-1 sm:flex-initial ${
                activeTab === 'github'
                  ? 'bg-[#0284ff] text-white shadow-sm shadow-[#0284ff]/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Github size={15} className="shrink-0" />
              <span className="tabular-nums">
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

      {/* Upgraded GitHub Developer Sync Card */}
      <div className="card-shimmer overflow-hidden mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white via-white to-blue-50/35 dark:from-[#0f1117] dark:via-[#0f1117] dark:to-[#0c1220] border border-slate-200/90 dark:border-white/10 shadow-sm hover:border-[#0284ff]/35 transition-colors">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          {/* Left Profile Identity + Live Status + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-2xl p-[2px] bg-gradient-to-br from-[#0284ff] via-[#38bdf8] to-emerald-400 shrink-0 shadow-sm">
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-950">
                  <ImageWithSkeleton
                    src={githubStats.avatar_url || 'https://avatars.githubusercontent.com/u/245139141?v=4'}
                    alt="Ahmed El-Bialy"
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`https://github.com/${githubUser}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white hover:text-[#0369a1] dark:hover:text-[#38bdf8] transition-colors truncate inline-flex items-center gap-1.5"
                  >
                    <Github size={15} className="shrink-0 text-slate-700 dark:text-slate-300" />
                    <span>{githubStats.name || 'Ahmed El-Bialy'}</span>
                  </a>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    @{githubUser}
                  </span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                    {githubStats.isFromCache ? t.projects.hud.syncedCached : t.projects.hud.liveConnected}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                  {githubStats.bio || t.projects.hud.bioFallback}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={handleForceRefresh}
                disabled={isFetching || isManualRefreshing}
                className="btn-kinetic inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-[38px] rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh GitHub metadata"
              >
                <RefreshCw
                  size={13}
                  className={isFetching || isManualRefreshing ? 'animate-spin text-[#0284ff]' : ''}
                />
                <span>
                  {isFetching || isManualRefreshing
                    ? lang === 'ar'
                      ? 'جارٍ التزامن...'
                      : 'Syncing...'
                    : lang === 'ar'
                    ? 'مزامنة'
                    : 'Sync'}
                </span>
              </button>

              <a
                href={`https://github.com/${githubUser}`}
                target="_blank"
                rel="noreferrer"
                className="btn-kinetic inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-[38px] rounded-xl bg-[#0284ff]/10 hover:bg-[#0284ff] text-[#0369a1] dark:text-[#38bdf8] hover:text-white border border-[#0284ff]/25 text-xs font-bold transition-colors"
              >
                <span>GitHub</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>

          {/* Right 4 Tabular Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full xl:w-auto shrink-0">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/8">
              <div className="w-8 h-8 rounded-lg bg-[#0284ff]/12 text-[#0369a1] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
                <FolderGit2 size={15} />
              </div>
              <div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">
                  {t.projects.hud.publicRepos}
                </div>
                <div className="font-extrabold font-mono tabular-nums text-xs sm:text-sm text-slate-900 dark:text-white">
                  {githubStats.public_repos ?? githubRepos.length}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/8">
              <div className="w-8 h-8 rounded-lg bg-amber-500/12 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Star size={15} />
              </div>
              <div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">
                  {t.projects.hud.totalStars}
                </div>
                <div className="font-extrabold font-mono tabular-nums text-xs sm:text-sm text-slate-900 dark:text-white">
                  {githubStats.totalStars ?? 0}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/8">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/12 text-[#0369a1] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
                <GitFork size={15} />
              </div>
              <div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">
                  {t.projects.hud.totalForks}
                </div>
                <div className="font-extrabold font-mono tabular-nums text-xs sm:text-sm text-slate-900 dark:text-white">
                  {githubStats.totalForks ?? 0}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/8">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <GitCommit size={15} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-600 dark:text-slate-400">
                  {t.projects.hud.latestCommit}
                </div>
                <div className="font-extrabold font-mono text-xs sm:text-sm text-[#0369a1] dark:text-[#38bdf8] truncate">
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
              className="w-full py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0284ff] transition-colors min-h-[44px] ps-9 pe-3.5"
            />
          </div>

          {activeTab === 'github' && (
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0284ff] cursor-pointer min-h-[44px] sm:min-h-[40px]"
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
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0284ff] cursor-pointer min-h-[44px] sm:min-h-[40px]"
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
            { id: 'hive', label: lang === 'ar' ? 'Hive وتخزين محلي' : 'Hive & Offline' },
            { id: 'api', label: 'REST APIs & TMDB' },
            { id: 'google-play', label: 'Google Play' },
          ].map((chip) => {
            const isChipActive = frameworkFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFrameworkFilter(chip.id)}
                className={`px-3 py-2 sm:py-1.5 min-h-[44px] sm:min-h-[36px] rounded-xl sm:rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isChipActive
                    ? 'bg-[#0284ff] text-white font-semibold shadow-xs shadow-[#0284ff]/25'
                    : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-[#0284ff]/50'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Penless Self-Drawing Leaf Loader over blurred skeleton while fetching GitHub data without cache */}
      {isPending && !portfolioData && (
        <div className="relative rounded-3xl overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 blur-[4px] opacity-40 pointer-events-none">
            {[1, 2].map((sk) => (
              <ProjectSkeletonCard key={sk} />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-[#f8fafc]/75 dark:bg-[#08090d]/75 backdrop-blur-sm">
            <LeafAnimation
              compact
              isDark={isDark}
              label={
                lang === 'ar'
                  ? 'جاري مزامنة التطبيقات ومستودعات GitHub...'
                  : 'Syncing Production Apps & GitHub Data...'
              }
            />
          </div>
        </div>
      )}

      {/* TAB 1: FEATURED PRODUCTION APPS */}
      {activeTab === 'featured' && (
        <>
          {/* Flagship Google Play Spotlight: Revio */}
          <RevioSpotlightCard
            lang={lang}
            t={t}
            liveMedia={liveMediaMap['Revio'] || liveMediaMap['revio']}
            onInspectRevio={() => {
              const revioProj = FEATURED_PROJECTS.find((p) => p.repoName === 'Revio');
              if (revioProj) openProjectDetails(revioProj, 0);
            }}
            onWatchDemo={(videoUrl) => openVideoModal('Revio', videoUrl)}
          />

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
                className="mt-4 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#0284ff] text-white text-xs font-semibold hover:bg-[#0070e0] transition-colors cursor-pointer"
              >
                {t.projects.resetFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 w-full">
              {filteredFeaturedProjects.map((project) => {
                const liveMedia =
                  liveMediaMap[project.repoName] ||
                  liveMediaMap[project.name] ||
                  liveMediaMap[project.repoName.toLowerCase()];
                const liveRelease =
                  repoReleases[project.repoName] ||
                  repoReleases[project.name] ||
                  repoReleases[project.repoName.toLowerCase()];

                const resolvedLinks = resolveSmartProjectLinks(project.links, liveMedia);
                const dynamicPlayUrl = resolvedLinks.googlePlayUrl;
                const dynamicApkUrl =
                  resolvedLinks.apkDownloadUrl || liveRelease?.apkDownloadUrl;
                const dynamicReleaseUrl =
                  resolvedLinks.releaseUrl || liveRelease?.releaseUrl;

                const hasLiveRelease = Boolean(
                  (liveRelease?.hasRelease || liveMedia?.hasRelease) &&
                    (dynamicApkUrl || dynamicReleaseUrl)
                );
                const hasApkFile = Boolean(dynamicApkUrl || hasLiveRelease);

                const dynamicProject: Project = {
                  ...project,
                  hasApk: hasApkFile,
                  links: {
                    ...project.links,
                    demoVideoUrl: resolvedLinks.demoVideoUrl,
                    liveDemoUrl: resolvedLinks.webLiveDemoUrl || liveMedia?.liveDemoUrl || project.links.liveDemoUrl,
                    playlistUrl: resolvedLinks.playlistUrl,
                    googlePlay: dynamicPlayUrl,
                    apkDownloadUrl: dynamicApkUrl,
                    releaseUrl: dynamicReleaseUrl,
                  },
                };

                const matchingRepo = githubRepos.find(
                  (r) =>
                    r.name.toLowerCase() === project.repoName.toLowerCase() ||
                    r.name.toLowerCase() === project.name.toLowerCase()
                );
                const repoLanguage = matchingRepo?.language || 'Dart';
                const starCount = matchingRepo ? matchingRepo.stargazers_count : null;

                const cardBlueprint = synthesizeProjectBlueprint(
                  project.repoName,
                  repoLanguage,
                  project.description,
                  project.technologies
                );
                const cardAccent = cardBlueprint.accentColor;

                const techTags = extractRepoTechTags({
                  repoName: project.repoName,
                  language: repoLanguage,
                  topics: matchingRepo?.topics,
                  description: project.description,
                  technologies: project.technologies,
                });

                const openThisProject = () =>
                  openProjectDetails(dynamicProject, cardScreenMap[project.repoName] || 0);

                return (
                  <article
                    key={project.id}
                    onMouseEnter={() => setHoveredCardId(project.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    className="card-shimmer group relative rounded-2xl overflow-hidden bg-white dark:bg-[#0f1117] border border-slate-200/90 dark:border-white/10 flex flex-col justify-between transition-colors duration-200 hover:border-[#0284ff]/50 shadow-sm hover:shadow-lg"
                  >
                    <div>
                      <ProjectCardCover
                        repoName={project.repoName}
                        language={repoLanguage}
                        coverUrl={project.image}
                        discoveredScreenshots={
                          liveMedia?.discoveredScreenshots || matchingRepo?.discoveredScreenshots
                        }
                        isHighlight={project.highlight}
                        description={project.description}
                        topics={project.technologies}
                        isCardHovered={hoveredCardId === project.id}
                        onInspect={openThisProject}
                        inspectAriaLabel={lang === 'ar' ? `معاينة ${project.name}` : `Preview ${project.name}`}
                        onActiveScreenChange={(screenIdx) => {
                          setCardScreenMap((prev) =>
                            prev[project.repoName] === screenIdx
                              ? prev
                              : { ...prev, [project.repoName]: screenIdx }
                          );
                        }}
                      />

                      <div className="p-4 sm:p-5">
                        {/* Unboxed Single-Line Title & Metrics Row */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <button
                            type="button"
                            onClick={openThisProject}
                            className="text-start min-w-0 cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff]"
                          >
                            <h3 className="font-display text-xl sm:text-[22px] font-extrabold text-slate-900 dark:text-white group-hover:text-[#0369a1] dark:group-hover:text-[#38bdf8] transition-colors truncate tracking-tight">
                              {project.name}
                            </h3>
                          </button>
                          <div className="flex items-center gap-2 text-xs font-mono shrink-0 text-slate-600 dark:text-slate-400">
                            {starCount !== null && starCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold tabular-nums">
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

                        <p
                          className="text-xs font-semibold line-clamp-1 mb-2"
                          style={{ color: isDark ? cardAccent : '#0369a1' }}
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
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] text-slate-600 dark:text-slate-300 font-mono font-semibold border border-slate-200 dark:border-white/10 tabular-nums">
                              +{techTags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-4 sm:px-5 py-4 mt-auto border-t border-slate-100 dark:border-white/8 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={openThisProject}
                          className="btn-kinetic w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0284ff]/10 hover:bg-[#0284ff] hover:text-white text-[#0369a1] dark:text-[#38bdf8] font-semibold text-xs border border-[#0284ff]/25 transition-colors cursor-pointer min-h-[44px] sm:min-h-[40px]"
                        >
                          <Eye size={14} className="shrink-0" />
                          <span>{t.projects.actions.viewSpecs}</span>
                        </button>

                        {project.links.github && (
                          <a
                            href={project.links.github}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors text-xs font-semibold min-h-[44px] sm:min-h-[40px]"
                          >
                            <Github size={14} className="shrink-0" />
                            <span>{t.projects.actions.sourceCode}</span>
                          </a>
                        )}
                      </div>

                      {(resolvedLinks.mode !== 'none' || dynamicPlayUrl || hasApkFile) && (
                        <div className="flex flex-wrap items-center gap-2">
                          <SmartDemoButtons
                            resolved={resolvedLinks}
                            fullWidthOnRow
                            onWatchDemo={(videoUrl) => openVideoModal(project.name, videoUrl)}
                          />

                          {dynamicPlayUrl && (
                            <a
                              href={dynamicPlayUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 min-w-[115px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 transition-colors text-xs font-bold min-h-[44px] sm:min-h-[38px]"
                            >
                              <ArrowUpRight size={14} className="shrink-0" />
                              <span>{t.projects.actions.playStore}</span>
                            </a>
                          )}

                          {hasApkFile && (
                            <button
                              type="button"
                              onClick={() => openApkModal(dynamicProject)}
                              className="btn-kinetic flex-1 min-w-[115px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-300 border border-purple-500/20 text-xs font-bold min-h-[44px] sm:min-h-[38px] cursor-pointer"
                            >
                              <Download size={13} className="shrink-0" />
                              <span>{t.projects.actions.downloadApk}</span>
                              {liveRelease?.apkSize ? (
                                <span className="text-[10px] font-mono opacity-80 tabular-nums">
                                  ({formatFileSize(liveRelease.apkSize)})
                                </span>
                              ) : null}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
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
                className="mt-4 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#0284ff] text-white text-xs font-semibold hover:bg-[#0070e0] transition-colors cursor-pointer"
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

                const repoLiveMedia = liveMediaMap[repo.name] || liveMediaMap[repo.name.toLowerCase()];
                const resolvedRepoLinks = resolveSmartProjectLinks(projectObj.links, repoLiveMedia);
                const hasSmartMedia = resolvedRepoLinks.mode !== 'none';

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

                const pushedLabel = repo.pushed_at
                  ? new Date(repo.pushed_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : null;

                const openThisRepo = () =>
                  openProjectDetails(dynamicRepoProject, cardScreenMap[repo.name] || 0);

                return (
                  <article
                    key={repo.id}
                    onMouseEnter={() => setHoveredCardId(repo.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    className="card-shimmer group relative rounded-2xl overflow-hidden bg-white dark:bg-[#0f1117] border border-slate-200/90 dark:border-white/10 flex flex-col justify-between transition-colors duration-200 shadow-sm hover:border-[#0284ff]/50 hover:shadow-lg"
                  >
                    <div>
                      <ProjectCardCover
                        repoName={repo.name}
                        language={repo.language}
                        coverUrl={repo.coverImageUrl}
                        discoveredScreenshots={
                          repo.discoveredScreenshots || repoLiveMedia?.discoveredScreenshots
                        }
                        isHighlight={Boolean(
                          projectObj.links.googlePlay || hasSmartMedia || hasReleaseOrApk
                        )}
                        description={repo.description}
                        topics={repo.topics}
                        isCardHovered={hoveredCardId === repo.id}
                        compactMode
                        onInspect={openThisRepo}
                        inspectAriaLabel={lang === 'ar' ? `معاينة ${repo.name}` : `Preview ${repo.name}`}
                        onActiveScreenChange={(screenIdx) => {
                          setCardScreenMap((prev) =>
                            prev[repo.name] === screenIdx
                              ? prev
                              : { ...prev, [repo.name]: screenIdx }
                          );
                        }}
                      />

                      <div className="p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                              style={{
                                backgroundColor: `${repoBlueprint.accentColor}15`,
                                borderColor: `${repoBlueprint.accentColor}30`,
                                color: repoBlueprint.accentColor,
                              }}
                            >
                              <FolderGit2 size={15} />
                            </span>
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={openThisRepo}
                                className="text-start w-full cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284ff]"
                              >
                                <h3 className="font-display text-lg sm:text-[19px] font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-[#0369a1] dark:group-hover:text-[#38bdf8] transition-colors truncate">
                                  {repo.name}
                                </h3>
                              </button>
                              {pushedLabel && (
                                <div className="text-[10.5px] font-mono text-slate-600 dark:text-slate-400">
                                  {lang === 'ar' ? `آخر تحديث: ${pushedLabel}` : `Updated ${pushedLabel}`}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-mono shrink-0 text-slate-600 dark:text-slate-400 pt-0.5">
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold tabular-nums">
                              <Star size={12} fill="currentColor" />
                              {repo.stargazers_count}
                            </span>
                            {hasReleaseOrApk && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                  APK
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 min-h-[2.5rem] mb-4">
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
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] text-slate-600 dark:text-slate-300 font-mono font-semibold border border-slate-200 dark:border-white/10 tabular-nums">
                              +{repoTechTags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-5 sm:px-6 py-4 mt-auto border-t border-slate-100 dark:border-white/8 space-y-2.5 bg-slate-50/50 dark:bg-white/[0.01]">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={openThisRepo}
                          className="btn-kinetic w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0284ff]/10 hover:bg-[#0284ff] hover:text-white text-[#0369a1] dark:text-[#38bdf8] font-semibold text-xs border border-[#0284ff]/25 transition-colors cursor-pointer min-h-[44px] sm:min-h-[40px]"
                        >
                          <Eye size={14} />
                          <span>{lang === 'ar' ? 'التفاصيل' : 'Details'}</span>
                        </button>

                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-kinetic w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors text-xs font-semibold min-h-[44px] sm:min-h-[40px]"
                        >
                          <Github size={14} />
                          <span>GitHub</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>

                      {hasReleaseOrApk && (
                        <button
                          type="button"
                          onClick={() => openApkModal(dynamicRepoProject)}
                          className="btn-kinetic w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-300 border border-purple-500/20 transition-colors text-xs font-bold min-h-[44px] sm:min-h-[38px] cursor-pointer"
                        >
                          <Download size={13} />
                          <span>{t.projects.actions.downloadApk}</span>
                          {repoRelease?.apkSize ? (
                            <span className="text-[10px] font-mono opacity-80 tabular-nums">
                              ({formatFileSize(repoRelease.apkSize)})
                            </span>
                          ) : null}
                        </button>
                      )}

                      <div className="pt-2 border-t border-slate-200/70 dark:border-white/8 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-3">
                          {repo.language && (
                            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: getLanguageColor(repo.language) }}
                              />
                              <span>{repo.language}</span>
                            </span>
                          )}
                          {repo.forks_count > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-mono tabular-nums">
                              <GitFork size={12} className="text-[#0369a1] dark:text-[#38bdf8]" />
                              <span>{repo.forks_count}</span>
                            </span>
                          )}
                        </div>

                        {hasSmartMedia && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <SmartDemoButtons
                              resolved={resolvedRepoLinks}
                              compact
                              onWatchDemo={(videoUrl) => openVideoModal(repo.name, videoUrl)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {filteredRepos.length > visibleRepoCount && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => setVisibleRepoCount((prev) => prev + 6)}
                className="btn-kinetic inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-[#0284ff] hover:bg-[#0070e0] text-white font-semibold text-xs sm:text-sm shadow-sm shadow-[#0284ff]/25 transition-colors cursor-pointer"
              >
                <ChevronDown size={15} />
                <span className="tabular-nums">
                  {lang === 'ar'
                    ? `عرض المزيد (${filteredRepos.length - visibleRepoCount} متبقية)`
                    : `Show More Repositories (${filteredRepos.length - visibleRepoCount} remaining)`}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {mountedModals.details && (
        <Suspense fallback={null}>
          <LazyProjectDetailsModal
            isOpen={Boolean(selectedProject)}
            onClose={() => {
              setSelectedProject(null);
              setSelectedScreenIndex(0);
            }}
            project={selectedProject}
            initialScreenIndex={selectedScreenIndex}
          />
        </Suspense>
      )}

      {mountedModals.apk && (
        <Suspense fallback={null}>
          <LazyApkDownloadModal
            isOpen={Boolean(apkModalProject)}
            onClose={() => setApkModalProject(null)}
            project={apkModalProject}
          />
        </Suspense>
      )}

      {mountedModals.video && (
        <Suspense fallback={null}>
          <LazyVideoDemoModal
            isOpen={Boolean(videoModalState)}
            onClose={() => setVideoModalState(null)}
            projectName={videoModalState?.projectName || 'App Demo'}
            videoUrl={videoModalState?.videoUrl}
          />
        </Suspense>
      )}
    </section>
  );
};

interface RevioSpotlightCardProps {
  lang: 'en' | 'ar';
  t: any;
  liveMedia?: any;
  onInspectRevio: () => void;
  onWatchDemo?: (videoUrl: string) => void;
}

const RevioSpotlightCard: React.FC<RevioSpotlightCardProps> = ({
  lang,
  t,
  liveMedia,
  onInspectRevio,
  onWatchDemo,
}) => {
  const { data: playStats } = usePlayStoreAppStats('com.ahmed.revio');
  const [activeShot, setActiveShot] = useState(0);
  const screens = VERIFIED_REPO_SCREENSHOTS.Revio.slice(0, 4);

  useEffect(() => {
    preloadImageUrls(screens);
  }, [screens]);

  return (
    <article
      className="card-shimmer overflow-hidden mb-8 p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0f1117] border border-emerald-500/35 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
    >
      <div className="lg:col-span-7 space-y-3.5">
        <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-[13px]">
          <span className="font-display font-bold text-emerald-700 dark:text-emerald-400">
            {lang === 'ar' ? 'تطبيق منشور على Google Play' : 'Published on Google Play'}
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-mono text-xs text-slate-500 dark:text-[#94a3b8]">com.ahmed.revio</span>
          {playStats?.downloads && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-display text-sm font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">
                {playStats.downloads} {lang === 'ar' ? 'تحميل' : 'Downloads'}
              </span>
            </>
          )}
          {playStats?.rating && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-display text-sm font-extrabold text-amber-500 tabular-nums">
                ★ {playStats.rating}
              </span>
            </>
          )}
        </div>

        <h2 className="font-display text-2xl sm:text-[28px] font-extrabold text-slate-900 dark:text-[#f1f5f9] tracking-tight leading-tight">
          {lang === 'ar'
            ? 'Revio — تطبيق البطاقات التعليمية الذكية بدون إنترنت'
            : 'Revio — Active Recall & Smart Flashcards'}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94a3b8] leading-relaxed">
          {lang === 'ar'
            ? 'مبني بمعمارية Clean Architecture وإدارة الحالة عبر Cubit مع تخزين محلي سريع بواسطة Hive، وتقليب بطاقات ثلاثي الأبعاد بدون إنترنت مع اختبارات MCQ ذكية.'
            : 'Engineered with Clean Architecture, Cubit state streams, and zero-latency Hive local NoSQL persistence—delivering 3D interactive flip cards, MCQ quizzes, and offline study analytics.'}
        </p>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <a
            href={AHMED_CONFIG.socials.playstore}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-kinetic inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] sm:min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
          >
            <span>{lang === 'ar' ? 'تثبيت من Google Play' : 'Get on Google Play'}</span>
            <ExternalLink size={12} />
          </a>

          <SmartDemoButtons
            resolved={resolveSmartProjectLinks(
              FEATURED_PROJECTS.find((p) => p.repoName === 'Revio')?.links,
              liveMedia
            )}
            stopPropagation={false}
            onWatchDemo={onWatchDemo}
          />

          <button
            type="button"
            onClick={onInspectRevio}
            className="btn-kinetic inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] sm:min-h-[40px] rounded-xl bg-slate-100 dark:bg-[#161b27] hover:border-[#0284ff] text-slate-800 dark:text-[#f1f5f9] border border-slate-200 dark:border-white/10 font-semibold text-xs cursor-pointer"
          >
            <Eye size={13} />
            <span>{t.projects.actions.viewSpecs}</span>
          </button>
        </div>
      </div>

      {/* Hero-First Large Phone Showcase + Interactive Side Thumbnails */}
      <div className="lg:col-span-5 grid grid-cols-12 gap-3 items-center">
        <div className="col-span-8 flex justify-center">
          <button
            type="button"
            onClick={onInspectRevio}
            className="relative w-full max-w-[185px] sm:max-w-[195px] aspect-[9/18] rounded-[24px] p-1.5 bg-[#0f1628] border-2 border-slate-300/90 dark:border-white/25 shadow-2xl overflow-hidden group cursor-pointer"
            aria-label="Inspect Revio featured UI"
          >
            <div className="w-full h-full rounded-[18px] overflow-hidden bg-[#161e31]">
              <ImageWithSkeleton
                key={screens[activeShot] || screens[0]}
                src={screens[activeShot] || screens[0]}
                alt={`Revio spotlight screen ${activeShot + 1}`}
                loading="eager"
                variant="phone"
                className="w-full h-full object-cover object-top crisp-screenshot group-hover:scale-[1.03] transition-transform duration-300"
              />
            </div>
          </button>
        </div>

        <div className="col-span-4 flex flex-col gap-2">
          {screens.map((shot, idx) => (
            <button
              key={shot}
              type="button"
              onClick={() => setActiveShot(idx)}
              className={`h-16 sm:h-[72px] rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-[#161e31] ${
                activeShot === idx
                  ? 'border-emerald-500 scale-[1.04] shadow-md'
                  : 'border-slate-200 dark:border-white/15 opacity-85 hover:opacity-100'
              }`}
              aria-label={`Preview Revio screen ${idx + 1}`}
            >
              <ImageWithSkeleton
                src={shot}
                alt={`Revio thumb ${idx + 1}`}
                loading="eager"
                variant="phone"
                className="w-full h-full object-cover object-top crisp-screenshot"
              />
            </button>
          ))}
        </div>
      </div>
    </article>
  );
};

