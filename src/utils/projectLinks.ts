import { Project } from '../data/portfolioData';
import { RepoLiveMetadata, extractYouTubeVideoId } from '../services/githubService';

export interface SmartProjectLinksResolution {
  demoVideoUrl?: string;
  playlistUrl?: string;
  webLiveDemoUrl?: string;
  googlePlayUrl?: string;
  apkDownloadUrl?: string;
  releaseUrl?: string;
  mode: 'fullDemoAndPlaylist' | 'watchDemo' | 'playlistOnly' | 'webLiveDemo' | 'none';
}

export function isYouTubeUrl(url?: string | null): boolean {
  if (!url) return false;
  return /(?:youtube\.com|youtu\.be)/i.test(url.trim());
}

export function isYouTubePlaylistOnlyUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  const hasListParam = /youtube\.com\/playlist\?list=/i.test(trimmed);
  const hasVideoId = Boolean(extractYouTubeVideoId(trimmed));
  return hasListParam && !hasVideoId;
}

/**
 * Merges static Project links with live GitHub README media metadata and classifies:
 * - demoVideoUrl: explicit demoVideoUrl OR any YouTube single video/shorts URL from liveDemoUrl (Watch Demo)
 * - playlistUrl: explicit or parsed YouTube playlist URL (Full Demo)
 * - webLiveDemoUrl: non-YouTube web live demo URL (Live Demo)
 *
 * Strictly applies Cases A–E:
 * - Case A: playlistUrl AND demoVideoUrl -> 'fullDemoAndPlaylist' (Watch Demo + Full Demo)
 * - Case B: demoVideoUrl only -> 'watchDemo' (Watch Demo)
 * - Case C: playlistUrl only -> 'playlistOnly' (Full Demo)
 * - Case D: webLiveDemoUrl (non-YouTube) -> 'webLiveDemo' (Live Demo)
 * - Case E: none exist -> 'none' (render nothing)
 */
const safeTrimmedUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export function resolveSmartProjectLinks(
  projectLinks?: Partial<Project['links']> | null,
  liveMedia?: Partial<RepoLiveMetadata> | null
): SmartProjectLinksResolution {
  const rawDemoVideo = safeTrimmedUrl(projectLinks?.demoVideoUrl);
  const rawLiveCandidate =
    safeTrimmedUrl(liveMedia?.liveDemoUrl) || safeTrimmedUrl(projectLinks?.liveDemoUrl);
  const rawPlaylistCandidate =
    safeTrimmedUrl(liveMedia?.playlistUrl) || safeTrimmedUrl(projectLinks?.playlistUrl);

  let demoVideoUrl = rawDemoVideo;
  let playlistUrl = rawPlaylistCandidate;
  let webLiveDemoUrl: string | undefined;

  if (rawLiveCandidate) {
    if (isYouTubeUrl(rawLiveCandidate)) {
      if (isYouTubePlaylistOnlyUrl(rawLiveCandidate)) {
        if (!playlistUrl) playlistUrl = rawLiveCandidate;
      } else if (!demoVideoUrl) {
        demoVideoUrl = rawLiveCandidate;
      }
    } else {
      webLiveDemoUrl = rawLiveCandidate;
    }
  }

  let mode: SmartProjectLinksResolution['mode'] = 'none';
  if (playlistUrl && demoVideoUrl) {
    mode = 'fullDemoAndPlaylist';
  } else if (demoVideoUrl) {
    mode = 'watchDemo';
  } else if (playlistUrl) {
    mode = 'playlistOnly';
  } else if (webLiveDemoUrl) {
    mode = 'webLiveDemo';
  }

  return {
    demoVideoUrl,
    playlistUrl,
    webLiveDemoUrl,
    googlePlayUrl: liveMedia?.googlePlayUrl || projectLinks?.googlePlay,
    apkDownloadUrl: liveMedia?.apkDownloadUrl || projectLinks?.apkDownloadUrl,
    releaseUrl: liveMedia?.releaseUrl || projectLinks?.releaseUrl,
    mode,
  };
}
