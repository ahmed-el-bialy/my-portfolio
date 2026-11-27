import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getAiClient = () => {
  const rawKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  const apiKey = rawKey.replace(/^["']|["']$/g, '').trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const isGeminiAuthError = (error: any): boolean => {
  const status = Number(error?.status ?? error?.code);
  const message = String(error?.message || error || '');
  return (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    /API key not valid|API_KEY_INVALID|ACCESS_TOKEN_TYPE_UNSUPPORTED|UNAUTHENTICATED|PERMISSION_DENIED/i.test(
      message
    )
  );
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // In-memory store for recent webhook pushes / cache invalidations
  let lastPushTimestamp = new Date().toISOString();
  let lastPushRepo = '';
  let pushEventsCount = 0;

  interface CachedPortfolioEntry {
    timestamp: number;
    data: any;
  }
  const GITHUB_CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes
  const portfolioServerCache = new Map<string, CachedPortfolioEntry>();

  const githubHeaders = (): Record<string, string> => {
    const h: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'ahmed-el-bialy-portfolio-server',
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      h.Authorization = `Bearer ${token}`;
    }
    return h;
  };

  async function fetchWithTimeout(
    url: string,
    init: RequestInit = {},
    timeoutMs: number = 10000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, {
        ...init,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function fetchRawReadmeTextServer(username: string, repoName: string, defaultBranch: string): Promise<string | null> {
    const branches = Array.from(new Set([defaultBranch || 'main', 'main', 'master']));
    for (const branch of branches) {
      try {
        const res = await fetchWithTimeout(
          `https://raw.githubusercontent.com/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/${encodeURIComponent(branch)}/README.md`,
          {},
          8000
        );
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim().length > 10) {
            return text;
          }
        }
      } catch {}
    }
    return null;
  }

  async function fetchSingleRepoReleaseServer(username: string, repoName: string): Promise<any> {
    try {
      const listRes = await fetchWithTimeout(
        `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/releases?per_page=1`,
        { headers: githubHeaders() },
        8000
      );
      if (!listRes.ok) return { hasRelease: false };
      const listData = await listRes.json();
      if (!Array.isArray(listData) || listData.length === 0) {
        return { hasRelease: false };
      }
      const releaseData = listData[0];
      if (!releaseData?.html_url) return { hasRelease: false };
      const assets = Array.isArray(releaseData.assets) ? releaseData.assets : [];
      const apkAsset = assets.find((a: any) => typeof a?.name === 'string' && a.name.toLowerCase().endsWith('.apk'));
      return {
        hasRelease: true,
        releaseUrl: releaseData.html_url,
        tagName: releaseData.tag_name || releaseData.name || 'v1.0.0',
        name: releaseData.name,
        publishedAt: releaseData.published_at || releaseData.created_at,
        apkDownloadUrl: apkAsset ? apkAsset.browser_download_url : undefined,
        apkFileName: apkAsset ? apkAsset.name : undefined,
        apkSize: apkAsset ? apkAsset.size : undefined,
        assetsCount: assets.length,
        prerelease: Boolean(releaseData.prerelease),
        body: releaseData.body,
      };
    } catch {
      return { hasRelease: false };
    }
  }

  async function collectLocalPublicCovers(repoName: string): Promise<string[]> {
    const coversRoot = path.join(__dirname, 'public', 'covers');
    if (!existsSync(coversRoot)) return [];

    const normalizeKey = (s: string) => s.toLowerCase().replace(/[-_\s.]+/g, '');
    const targetKey = normalizeKey(repoName);
    const imageRegex = /\.(png|jpe?g|webp)$/i;
    const found: string[] = [];

    try {
      const entries = await fs.readdir(coversRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && normalizeKey(entry.name) === targetKey) {
          const subFiles = await fs.readdir(path.join(coversRoot, entry.name), { withFileTypes: true });
          subFiles
            .filter((f) => f.isFile() && imageRegex.test(f.name))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
            .forEach((f) => {
              found.push(`/covers/${encodeURIComponent(entry.name)}/${encodeURIComponent(f.name)}`);
            });
        } else if (entry.isFile() && imageRegex.test(entry.name)) {
          const baseName = entry.name.replace(imageRegex, '');
          if (normalizeKey(baseName) === targetKey || normalizeKey(baseName).startsWith(targetKey)) {
            found.push(`/covers/${encodeURIComponent(entry.name)}`);
          }
        }
      }
    } catch {
      // Ignore optional local covers directory read errors
    }

    return found;
  }

  async function fetchGitHubFolderImagesServer(
    username: string,
    repoName: string,
    folderPath: string
  ): Promise<{ ok: boolean; entries: any[] }> {
    try {
      const res = await fetchWithTimeout(
        `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/contents${folderPath ? `/${folderPath}` : ''}`,
        { headers: githubHeaders() },
        8000
      );
      if (!res.ok) return { ok: false, entries: [] };
      const data = await res.json();
      return { ok: true, entries: Array.isArray(data) ? data : [] };
    } catch {
      return { ok: false, entries: [] };
    }
  }

  async function fetchGitHubWebDirEntries(
    username: string,
    repoName: string,
    branch: string,
    dirPath: string = ''
  ): Promise<{ ok: boolean; resolvedBranch: string; entries: Array<{ name: string; path: string; type: 'dir' | 'file' }> }> {
    const encodeSegs = (p: string) =>
      p
        .split('/')
        .filter(Boolean)
        .map((seg) => encodeURIComponent(seg))
        .join('/');

    const branches = Array.from(new Set([branch || 'main', 'main', 'master']));
    for (const candidateBranch of branches) {
      const targetUrl = dirPath
        ? `https://github.com/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/tree/${encodeURIComponent(candidateBranch)}/${encodeSegs(dirPath)}`
        : `https://github.com/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/tree/${encodeURIComponent(candidateBranch)}`;

      try {
        const res = await fetchWithTimeout(
          targetUrl,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; PortfolioAssetSync/1.0)',
              Accept: 'text/html,application/xhtml+xml',
            },
          },
          9000
        );
        if (!res.ok) continue;
        const html = await res.text();
        const seen = new Map<string, { name: string; path: string; type: 'dir' | 'file' }>();
        const itemRegex = /"name":"([^"]+)","path":"([^"]+)","contentType":"(file|directory)"/g;
        let match: RegExpExecArray | null;
        while ((match = itemRegex.exec(html)) !== null) {
          const itemName = match[1];
          const itemPath = match[2];
          const itemType = match[3] === 'directory' ? 'dir' : 'file';
          // Keep items belonging directly to requested dirPath (or all items if root)
          if (dirPath) {
            const normDir = dirPath.replace(/^\/+|\/+$/g, '').toLowerCase();
            const normPath = itemPath.toLowerCase();
            if (!normPath.startsWith(`${normDir}/`)) continue;
          } else if (itemPath.includes('/')) {
            continue;
          }
          if (!seen.has(itemPath)) {
            seen.set(itemPath, { name: itemName, path: itemPath, type: itemType });
          }
        }
        return {
          ok: true,
          resolvedBranch: candidateBranch,
          entries: Array.from(seen.values()),
        };
      } catch {
        // try next branch
      }
    }
    return { ok: false, resolvedBranch: branch || 'main', entries: [] };
  }

  const repoAssetsServerCache = new Map<string, { timestamp: number; data: any }>();

  async function fetchRepoScreenshotsServer(
    username: string,
    repoName: string,
    defaultBranch: string
  ): Promise<{ coverUrl?: string; coverImages: string[]; screens: string[] }> {
    const imageRegex = /\.(png|jpe?g|webp)$/i;
    const isIconOrLogo = (relPath: string) =>
      /(?:^|\/)(?:app_icon(?:_\d+)?|app_logo)\.(?:png|jpe?g|webp)$/i.test(relPath);
    const localCovers = await collectLocalPublicCovers(repoName);
    const coverImages: string[] = [...localCovers];
    const screens: string[] = [];

    const encodeGitPath = (relPath: string) =>
      relPath
        .split('/')
        .filter(Boolean)
        .map((seg) => encodeURIComponent(seg))
        .join('/');

    const makeToRawUrl = (branchName: string) => (relPath: string, downloadUrl?: string) =>
      downloadUrl ||
      `https://raw.githubusercontent.com/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/${encodeURIComponent(
        branchName || 'main'
      )}/${encodeGitPath(relPath)}`;

    const isCoverPath = (relPath: string) => {
      const lower = relPath.toLowerCase();
      return (
        /(?:^|\/)covers?\/[^/]+\.(png|jpe?g|webp)$/i.test(lower) ||
        /^(?:screenshots\/)?cover[^/]*\.(png|jpe?g|webp)$/i.test(lower)
      );
    };

    const isDirectScreenshotPath = (relPath: string) => {
      const lower = relPath.toLowerCase();
      return (
        /^screenshots\/.+\.(png|jpe?g|webp)$/i.test(lower) &&
        !isCoverPath(lower) &&
        !isIconOrLogo(lower)
      );
    };

    try {
      // Primary: single recursive Git tree lookup preserves exact case (e.g. Screenshots/Cover, Screenshots/Covers)
      const treeRes = await fetchWithTimeout(
        `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(
          repoName
        )}/git/trees/${encodeURIComponent(defaultBranch || 'main')}?recursive=1`,
        { headers: githubHeaders() },
        8000
      );

      if (treeRes.ok) {
        const treeJson: any = await treeRes.json();
        if (Array.isArray(treeJson?.tree) && !treeJson?.truncated) {
          const toRawUrl = makeToRawUrl(defaultBranch);
          const blobs = treeJson.tree
            .filter(
              (item: any) =>
                item?.type === 'blob' &&
                typeof item?.path === 'string' &&
                imageRegex.test(item.path)
            )
            .sort((a: any, b: any) =>
              a.path.localeCompare(b.path, undefined, { numeric: true })
            );

          for (const item of blobs) {
            if (isCoverPath(item.path)) {
              coverImages.push(toRawUrl(item.path));
            } else if (isDirectScreenshotPath(item.path)) {
              screens.push(toRawUrl(item.path));
            }
          }

          const uniqueCovers = Array.from(new Set(coverImages));
          return {
            coverUrl: uniqueCovers[0],
            coverImages: uniqueCovers,
            screens: Array.from(new Set(screens)),
          };
        }
      }

      // Secondary: Contents API using exact entry.path casing from parent directory listings
      const rootApiRes = await fetchGitHubFolderImagesServer(username, repoName, '');
      if (rootApiRes.ok) {
        const toRawUrl = makeToRawUrl(defaultBranch);
        const rootEntries = rootApiRes.entries;
        const coverDirEntries = rootEntries.filter(
          (e: any) => e?.type === 'dir' && /^covers?$/i.test(String(e?.name || ''))
        );
        const screenshotsDirEntry = rootEntries.find(
          (e: any) => e?.type === 'dir' && String(e?.name || '').toLowerCase() === 'screenshots'
        );

        const [coverDirsFiles, screenshotsDirRes] = await Promise.all([
          Promise.all(
            coverDirEntries.map(async (dirEntry: any) => ({
              dirPath: dirEntry.path,
              res: dirEntry?.path
                ? await fetchGitHubFolderImagesServer(username, repoName, encodeGitPath(dirEntry.path))
                : { ok: false, entries: [] },
            }))
          ),
          screenshotsDirEntry?.path
            ? fetchGitHubFolderImagesServer(username, repoName, encodeGitPath(screenshotsDirEntry.path))
            : Promise.resolve({ ok: true, entries: [] }),
        ]);

        for (const { dirPath, res } of coverDirsFiles) {
          res.entries
            .filter((f: any) => f?.type === 'file' && typeof f?.name === 'string' && imageRegex.test(f.name))
            .sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { numeric: true }))
            .forEach((f: any) => {
              coverImages.push(toRawUrl(f.path || `${dirPath}/${f.name}`, f.download_url));
            });
        }

        const screenshotFiles = screenshotsDirRes.entries;
        const nestedDirs = screenshotFiles.filter((f: any) => f?.type === 'dir' && f?.path);
        if (nestedDirs.length > 0) {
          await Promise.all(
            nestedDirs.map(async (nestedDir: any) => {
              const isCoverSubdir = /^covers?$/i.test(String(nestedDir?.name || ''));
              const nestedRes = await fetchGitHubFolderImagesServer(
                username,
                repoName,
                encodeGitPath(nestedDir.path)
              );
              nestedRes.entries
                .filter((f: any) => f?.type === 'file' && typeof f?.name === 'string' && imageRegex.test(f.name))
                .sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { numeric: true }))
                .forEach((f: any) => {
                  const rawUrl = toRawUrl(f.path || `${nestedDir.path}/${f.name}`, f.download_url);
                  if (isCoverSubdir || /^cover.*\.(png|jpe?g|webp)$/i.test(f.name)) {
                    coverImages.push(rawUrl);
                  } else if (!isIconOrLogo(f.name)) {
                    screens.push(rawUrl);
                  }
                });
            })
          );
        }

        for (const file of screenshotFiles) {
          if (file?.type !== 'file' || typeof file?.name !== 'string') continue;
          if (!imageRegex.test(file.name)) continue;

          const rawUrl = toRawUrl(
            file.path || `${screenshotsDirEntry?.path || 'screenshots'}/${file.name}`,
            file.download_url
          );
          if (/^cover.*\.(png|jpe?g|webp)$/i.test(file.name)) {
            coverImages.push(rawUrl);
          } else if (!isIconOrLogo(file.name)) {
            screens.push(rawUrl);
          }
        }

        const uniqueCovers = Array.from(new Set(coverImages));
        return {
          coverUrl: uniqueCovers[0],
          coverImages: uniqueCovers,
          screens: Array.from(new Set(screens)),
        };
      }

      // Tertiary (Rate-Limit-Proof): GitHub Web Tree HTML lookup (works cleanly even when api.github.com returns 403)
      const rootWeb = await fetchGitHubWebDirEntries(username, repoName, defaultBranch, '');
      if (rootWeb.ok) {
        const resolvedBranch = rootWeb.resolvedBranch;
        const toRawUrl = makeToRawUrl(resolvedBranch);
        const coverDirs = rootWeb.entries.filter(
          (e) => e.type === 'dir' && /^covers?$/i.test(e.name)
        );
        const screenshotsDir = rootWeb.entries.find(
          (e) => e.type === 'dir' && e.name.toLowerCase() === 'screenshots'
        );

        const [coverWebDirs, ssWeb] = await Promise.all([
          Promise.all(
            coverDirs.map((d) => fetchGitHubWebDirEntries(username, repoName, resolvedBranch, d.path))
          ),
          screenshotsDir
            ? fetchGitHubWebDirEntries(username, repoName, resolvedBranch, screenshotsDir.path)
            : Promise.resolve({ ok: true, resolvedBranch, entries: [] }),
        ]);

        for (const cw of coverWebDirs) {
          cw.entries
            .filter((f) => f.type === 'file' && imageRegex.test(f.name))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
            .forEach((f) => coverImages.push(toRawUrl(f.path)));
        }

        const nestedSsDirs = ssWeb.entries.filter((e) => e.type === 'dir');
        if (nestedSsDirs.length > 0) {
          await Promise.all(
            nestedSsDirs.map(async (subDir) => {
              const isCoverSubdir = /^covers?$/i.test(subDir.name);
              const subWeb = await fetchGitHubWebDirEntries(
                username,
                repoName,
                resolvedBranch,
                subDir.path
              );
              subWeb.entries
                .filter((f) => f.type === 'file' && imageRegex.test(f.name))
                .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
                .forEach((f) => {
                  const rawUrl = toRawUrl(f.path);
                  if (isCoverSubdir || /^cover.*\.(png|jpe?g|webp)$/i.test(f.name)) {
                    coverImages.push(rawUrl);
                  } else if (!isIconOrLogo(f.name)) {
                    screens.push(rawUrl);
                  }
                });
            })
          );
        }

        ssWeb.entries
          .filter((f) => f.type === 'file' && imageRegex.test(f.name))
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
          .forEach((f) => {
            const rawUrl = toRawUrl(f.path);
            if (/^cover.*\.(png|jpe?g|webp)$/i.test(f.name)) {
              coverImages.push(rawUrl);
            } else if (!isIconOrLogo(f.name)) {
              screens.push(rawUrl);
            }
          });
      }

      const uniqueCovers = Array.from(new Set(coverImages));
      return {
        coverUrl: uniqueCovers[0],
        coverImages: uniqueCovers,
        screens: Array.from(new Set(screens)),
      };
    } catch {
      const uniqueCovers = Array.from(new Set(coverImages));
      return { coverUrl: uniqueCovers[0], coverImages: uniqueCovers, screens: [] };
    }
  }

  app.get('/api/github/repo-assets', async (req, res) => {
    try {
      const rawUsername = typeof req.query.username === 'string' ? req.query.username.trim() : 'ahmed-el-bialy';
      const rawRepo = typeof req.query.repo === 'string' ? req.query.repo.trim() : '';
      const rawBranch = typeof req.query.branch === 'string' ? req.query.branch.trim() : 'main';
      const forceRefresh = req.query.refresh === '1';

      if (!rawRepo || !/^[a-zA-Z0-9._-]+$/.test(rawRepo) || !/^[a-zA-Z0-9-]+$/.test(rawUsername)) {
        return res.status(400).json({ success: false, error: 'Valid repository and username required' });
      }

      const cacheKey = `${rawUsername.toLowerCase()}/${rawRepo.toLowerCase()}/${rawBranch.toLowerCase()}`;
      if (!forceRefresh) {
        const cached = repoAssetsServerCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < GITHUB_CACHE_TTL_MS) {
          return res.json({ success: true, cached: true, ...cached.data });
        }
      } else {
        repoAssetsServerCache.delete(cacheKey);
      }

      const result = await fetchRepoScreenshotsServer(rawUsername, rawRepo, rawBranch);
      const data = {
        coverUrl: result.coverUrl,
        coverImages: result.coverImages,
        screens: result.screens,
      };
      if (result.coverImages.length > 0 || result.screens.length > 0) {
        repoAssetsServerCache.set(cacheKey, { timestamp: Date.now(), data });
      }
      return res.json({ success: true, cached: false, ...data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error?.message || 'Failed to discover repo assets' });
    }
  });

  // Cached Media Proxy for allowlisted GitHub raw screenshots (eliminates repeat multi-MB downloads)
  const MEDIA_CACHE_MAX_ENTRIES = 48;
  const MEDIA_CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
  const mediaServerCache = new Map<
    string,
    { buffer: Buffer; contentType: string; timestamp: number }
  >();

  app.get('/api/media/screen', async (req, res) => {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
    if (!rawUrl) {
      return res.status(400).send('Missing url');
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      return res.status(400).send('Invalid url');
    }

    const isAllowedOrigin =
      parsedUrl.protocol === 'https:' &&
      ((parsedUrl.hostname === 'raw.githubusercontent.com' &&
        parsedUrl.pathname.toLowerCase().startsWith('/ahmed-el-bialy/')) ||
        parsedUrl.hostname === 'avatars.githubusercontent.com');

    if (!isAllowedOrigin) {
      return res.status(403).send('Forbidden media origin');
    }

    const cached = mediaServerCache.get(rawUrl);
    if (cached && Date.now() - cached.timestamp < MEDIA_CACHE_TTL_MS) {
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      res.setHeader('X-Media-Cache', 'HIT');
      return res.send(cached.buffer);
    }

    try {
      const upstream = await fetchWithTimeout(
        rawUrl,
        { headers: { 'User-Agent': 'ahmed-el-bialy-portfolio-media' } },
        12000
      );

      if (!upstream.ok) {
        return res.status(upstream.status).send('Upstream media error');
      }

      const contentType = upstream.headers.get('content-type') || 'image/png';
      const arrayBuf = await upstream.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);

      if (buffer.length > 0 && buffer.length <= 8 * 1024 * 1024) {
        if (mediaServerCache.size >= MEDIA_CACHE_MAX_ENTRIES) {
          const oldestKey = mediaServerCache.keys().next().value;
          if (oldestKey) mediaServerCache.delete(oldestKey);
        }
        mediaServerCache.set(rawUrl, {
          buffer,
          contentType,
          timestamp: Date.now(),
        });
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      res.setHeader('X-Media-Cache', 'MISS');
      return res.send(buffer);
    } catch {
      return res.status(504).send('Media fetch timeout');
    }
  });

  // Consolidated GitHub Portfolio Proxy (reduces 60-100 client requests down to 1 cached call)
  app.get('/api/github/portfolio', async (req, res) => {
    const rawUsername = typeof req.query.username === 'string' ? req.query.username.trim() : 'ahmed-el-bialy';
    const username = rawUsername || 'ahmed-el-bialy';
    if (!/^[a-zA-Z0-9-]+$/.test(username)) {
      return res.status(400).json({ success: false, error: 'Invalid GitHub username' });
    }
    const forceRefresh = req.query.refresh === '1';
    const cacheKey = username.toLowerCase();
    if (forceRefresh) {
      portfolioServerCache.delete(cacheKey);
      mediaServerCache.clear();
    }
    const cached = portfolioServerCache.get(cacheKey);

    if (!forceRefresh && cached && Date.now() - cached.timestamp < GITHUB_CACHE_TTL_MS) {
      return res.json({
        success: true,
        cached: true,
        cachedAt: cached.timestamp,
        ...cached.data,
      });
    }

    try {
      const [userRes, reposRes] = await Promise.all([
        fetchWithTimeout(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers: githubHeaders() }, 10000),
        fetchWithTimeout(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`, {
          headers: githubHeaders(),
        }, 10000),
      ]);

      if (!userRes.ok || !reposRes.ok) {
        if (cached) {
          return res.json({
            success: true,
            cached: true,
            stale: true,
            cachedAt: cached.timestamp,
            ...cached.data,
          });
        }
        return res.status(502).json({
          success: false,
          rateLimited: userRes.status === 403 || reposRes.status === 403,
          status: `${userRes.status}/${reposRes.status}`,
        });
      }

      const userData = await userRes.json();
      const rawRepos = await reposRes.json();
      const reposList: any[] = Array.isArray(rawRepos)
        ? rawRepos.filter((r: any) => r?.name && r.name.toLowerCase() !== username.toLowerCase())
        : [];

      // Fetch raw READMEs, releases, and /screenshots folder contents automatically for top repos
      const targetRepos = reposList.slice(0, 20);
      const rawReadmes: Record<string, string> = {};
      const releasesMap: Record<string, any> = {};
      const screenshotsMap: Record<string, { coverUrl?: string; coverImages: string[]; screens: string[] }> = {};

      await Promise.all(
        targetRepos.map(async (r: any) => {
          const branch = r.default_branch || 'main';
          const [readme, release, screensInfo] = await Promise.all([
            fetchRawReadmeTextServer(username, r.name, branch),
            fetchSingleRepoReleaseServer(username, r.name),
            fetchRepoScreenshotsServer(username, r.name, branch),
          ]);
          if (readme) {
            rawReadmes[r.name] = readme;
          }
          releasesMap[r.name] = release;
          screenshotsMap[r.name] = screensInfo;
        })
      );

      const payload = {
        user: userData,
        repos: reposList,
        rawReadmes,
        releasesMap,
        screenshotsMap,
      };

      portfolioServerCache.set(cacheKey, {
        timestamp: Date.now(),
        data: payload,
      });

      return res.json({
        success: true,
        cached: false,
        cachedAt: Date.now(),
        ...payload,
      });
    } catch (error: any) {
      if (cached) {
        return res.json({
          success: true,
          cached: true,
          stale: true,
          cachedAt: cached.timestamp,
          ...cached.data,
        });
      }
      return res.status(500).json({ success: false, error: error?.message || 'GitHub proxy failure' });
    }
  });

  // GitHub Webhook Receiver API Route
  app.post('/api/webhook/github', (req, res) => {
    try {
      const event = req.headers['x-github-event'] || 'push';
      const payload = req.body;
      
      pushEventsCount++;
      lastPushTimestamp = new Date().toISOString();
      lastPushRepo = payload?.repository?.full_name || payload?.repository?.name || 'unknown';

      portfolioServerCache.clear();
      console.log(`[GitHub Webhook] Received ${event} event for repo: ${lastPushRepo} at ${lastPushTimestamp}`);

      return res.json({
        success: true,
        message: 'GitHub webhook received successfully and portfolio cache invalidated.',
        event,
        repository: lastPushRepo,
        timestamp: lastPushTimestamp,
        pushEventsCount
      });
    } catch (error) {
      console.error('[GitHub Webhook Error]', error);
      return res.status(500).json({ success: false, error: 'Internal webhook error' });
    }
  });

  // Endpoint to check last push status for auto-refetching
  app.get('/api/github/status', (_req, res) => {
    return res.json({
      lastPushTimestamp,
      lastPushRepo,
      pushEventsCount,
      serverTime: new Date().toISOString()
    });
  });

  // In-memory TTL cache for live Google Drive CV verification & optional Gemini parsing
  const CV_CACHE_TTL_MS = 1000 * 60 * 20; // 20 minutes
  const cvParseCache = new Map<string, { timestamp: number; payload: any }>();

  // Endpoint to verify live Google Drive CV PDF and parse structured fields when GEMINI_API_KEY is available
  app.post('/api/parse-cv', async (req, res) => {
    try {
      const { pdfUrl, linkedinUrl, githubUsername, forceRefresh } = req.body || {};
      const cacheKey = `${String(pdfUrl || 'default')}::${String(githubUsername || 'ahmed-el-bialy')}`;
      const cached = cvParseCache.get(cacheKey);

      if (!forceRefresh && cached && Date.now() - cached.timestamp < CV_CACHE_TTL_MS) {
        return res.json({
          ...cached.payload,
          cached: true,
        });
      }

      let downloadUrl = typeof pdfUrl === 'string' ? pdfUrl.trim() : '';
      if (downloadUrl && downloadUrl.includes('drive.google.com')) {
        const idMatch =
          downloadUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
          downloadUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
          downloadUrl = `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
        }
      }

      let pdfBase64 = '';
      let pdfHash: string | undefined;
      let pdfByteLength = 0;
      let pdfLastModified: string | undefined;
      let verifiedDrive = false;

      try {
        if (downloadUrl) {
          const pdfRes = await fetchWithTimeout(
            downloadUrl,
            {
              redirect: 'follow',
              headers: {
                'User-Agent': 'ahmed-el-bialy-portfolio-server',
              },
            },
            12000
          );
          if (pdfRes.ok) {
            const contentType = (pdfRes.headers.get('content-type') || '').toLowerCase();
            const lastMod = pdfRes.headers.get('last-modified');
            if (lastMod) pdfLastModified = lastMod;

            const arrayBuf = await pdfRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuf);
            const looksLikePdf =
              buffer.byteLength > 1000 &&
              (contentType.includes('pdf') ||
                contentType.includes('octet-stream') ||
                buffer.subarray(0, 4).toString('utf8') === '%PDF');

            if (looksLikePdf) {
              verifiedDrive = true;
              pdfByteLength = buffer.byteLength;
              pdfHash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
              pdfBase64 = buffer.toString('base64');
            }
          }
        }
      } catch {
        console.warn('Could not download PDF directly from Drive, serving cached/verified metadata');
      }

      const checkedAt = new Date().toISOString();
      const basePayload = {
        success: true,
        verifiedDrive,
        pdfHash,
        pdfByteLength,
        pdfLastModified,
        checkedAt,
        aiEnriched: false,
      };

      const ai = getAiClient();
      if (!ai) {
        cvParseCache.set(cacheKey, { timestamp: Date.now(), payload: basePayload });
        return res.json(basePayload);
      }

      try {
        const prompt = `Analyze this candidate's resume/CV (PDF attached if available, github username: ${githubUsername || 'ahmed-el-bialy'}, linkedin: ${linkedinUrl || 'https://www.linkedin.com/in/ahmedel-bialy'}) and extract structured portfolio data as a JSON object with:
        {
          "name": "...",
          "title": "...",
          "about": "...",
          "skills": [{"category": "...", "items": ["..."]}],
          "experience": [
            {
              "organization": "...",
              "role": "...",
              "period": "...",
              "description": "..."
            }
          ],
          "projects": [
            {
              "name": "...",
              "description": "...",
              "technologies": ["..."]
            }
          ]
        }
        Return ONLY valid JSON.`;

        const contents: any[] = [prompt];
        if (pdfBase64) {
          contents.push({
            inlineData: {
              mimeType: 'application/pdf',
              data: pdfBase64,
            },
          });
        }

        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0]);
          const enrichedPayload = {
            ...basePayload,
            aiEnriched: true,
            data: parsedData,
          };
          cvParseCache.set(cacheKey, { timestamp: Date.now(), payload: enrichedPayload });
          return res.json(enrichedPayload);
        }
      } catch (aiErr: any) {
        if (!isGeminiAuthError(aiErr)) {
          console.warn('CV AI enrichment fallback:', aiErr?.message || aiErr);
        }
      }

      cvParseCache.set(cacheKey, { timestamp: Date.now(), payload: basePayload });
      return res.json(basePayload);
    } catch (error: any) {
      console.warn('CV Parse Error:', error?.message || error);
      return res.status(500).json({ success: false, error: error?.message || 'CV parse failed' });
    }
  });

  // Grounded Developer Portfolio AI CLI Assistant Endpoint
  app.post('/api/ai/cli', async (req, res) => {
    try {
      const rawQuestion = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
      const lang = req.body?.lang === 'ar' ? 'ar' : 'en';

      if (!rawQuestion) {
        return res.status(400).json({ success: false, error: 'Question is required.' });
      }

      const question = rawQuestion.slice(0, 400);
      const ai = getAiClient();

      if (!ai) {
        return res.json({
          success: false,
          fallback: true,
          keyInvalid: true,
          error: 'GEMINI_API_KEY is not configured in Settings > Secrets.',
        });
      }

      const systemInstruction = `You are the interactive Developer CLI Assistant inside Ahmed El-Bialy's official Flutter Mobile Developer portfolio.
Answer concisely in plain terminal-friendly text (no bloated markdown headings, under 120 words). Reply in ${lang === 'ar' || /[\u0600-\u06FF]/.test(question) ? 'Arabic (matching the user language cleanly)' : 'English'}.

Strict verified facts only:
- Name: Ahmed El-Bialy (أحمد البيلي), Flutter Mobile Developer based in El Mansoura, Egypt.
- Status: Open to Work (Full-time Junior Flutter Developer, Remote/Relocation, or Freelance MVP contracts).
- Education: B.Sc. in Artificial Intelligence, Faculty of Artificial Intelligence, Kafrelsheikh University (Oct 2023 – Jun 2027).
- Core Stack: Flutter, Dart, Clean Architecture, BLoC & Cubit state management, Hive offline storage, Dio, Retrofit, REST APIs, Firebase Auth & Cloud Firestore, Python, C++.
- Flagship Live App: Revio (Flashcard & active-recall study app published live on Google Play Store: https://play.google.com/store/apps/details?id=com.ahmed.revio&hl=en_US, Repo: https://github.com/ahmed-el-bialy/Revio, APK release v1.0.0).
- Production Apps: Movura (TMDB movie/series client with BLoC & Slivers), Vibrant-Store (DummyJSON e-commerce), Sky-Cast (WeatherAPI adaptive weather), News-Cloud (Bilingual Arabic RTL news with Retrofit & WebView), Shaats (Firebase Firestore real-time chat), Nihon-Seed (Japanese kana trainer), NBN-Basketball (scoreboard), Quotely, piano-tunes.
- Training & Experience: CodeAlpha Flutter Trainee (June 2026 – July 2026: built Revio & Quotely), Sprints x Microsoft Summer Camp (June 2025 – July 2025: 45+ hours Flutter/Dart), Udemy Complete Flutter & Dart Certificate (April 2026).
- Contact: Email ah.elbialy.dev@gmail.com | Phone/WhatsApp +20 102 212 1573 | GitHub https://github.com/ahmed-el-bialy | LinkedIn https://www.linkedin.com/in/ahmedel-bialy/.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: question,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const answer = (response.text || '').trim();
      if (!answer) {
        return res.json({ success: false, fallback: true, error: 'Empty AI response' });
      }

      return res.json({
        success: true,
        model: 'gemini-4-hydrogen',
        answer,
      });
    } catch (error: any) {
      if (isGeminiAuthError(error)) {
        return res.json({
          success: false,
          fallback: true,
          keyInvalid: true,
          error: 'GEMINI_API_KEY in Settings > Secrets is missing or invalid; serving portfolio advisor.',
        });
      }
      console.warn('CLI AI transient error:', error?.message || 'AI request failed');
      return res.json({
        success: false,
        fallback: true,
        error: 'Live AI temporarily unavailable; serving portfolio advisor.',
      });
    }
  });

  // Endpoint to fetch Study Case markdown with smart multi-filename checking from GitHub
  app.get('/api/study-case', async (req, res) => {
    try {
      const rawRepo = typeof req.query.repo === 'string' ? req.query.repo.trim() : '';
      const lang = req.query.lang === 'ar' ? 'ar' : 'en';
      if (!rawRepo || !/^[a-zA-Z0-9._-]+$/.test(rawRepo)) {
        return res.status(400).json({ success: false, error: 'Valid repository name required' });
      }

      const enFiles = [
        'CASE_STUDY.md',
        'STUDY_CASE.md',
        'case-study.md',
        'study-case.md',
        'CASE_STUDY_EN.md',
        'docs/CASE_STUDY.md',
        'docs/STUDY_CASE.md',
        'docs/case-study.md',
        'docs/study-case.md',
      ];
      const arFiles = [
        'CASE_STUDY_AR.md',
        'STUDY_CASE_AR.md',
        'case-study-ar.md',
        'study-case-ar.md',
        'CASE_STUDY.ar.md',
        'STUDY_CASE.ar.md',
        'docs/CASE_STUDY_AR.md',
        'docs/STUDY_CASE_AR.md',
        'docs/case-study-ar.md',
        'docs/study-case-ar.md',
        'docs/CASE_STUDY.ar.md',
      ];
      const branches = ['main', 'master'];

      async function fetchFirstValid(filenames: string[]) {
        for (const branch of branches) {
          const batch = await Promise.all(
            filenames.map(async (filename) => {
              const url = `https://raw.githubusercontent.com/ahmed-el-bialy/${encodeURIComponent(
                rawRepo
              )}/${branch}/${filename}`;
              try {
                const r = await fetchWithTimeout(url, {}, 7000);
                if (r.ok) {
                  const text = await r.text();
                  if (text && text.trim().length > 15) {
                    return { content: text, filename };
                  }
                }
              } catch {}
              return null;
            })
          );
          const hit = batch.find((item): item is { content: string; filename: string } => Boolean(item));
          if (hit) return hit;
        }
        return null;
      }

      const [enResult, arResult] = await Promise.all([
        fetchFirstValid(enFiles),
        fetchFirstValid(arFiles),
      ]);

      const existsEn = Boolean(enResult);
      const existsAr = Boolean(arResult);
      const exists = existsEn || existsAr;

      if (!exists) {
        return res.json({ success: false, exists: false, message: 'Case study markdown not found' });
      }

      const requestedLang = lang === 'ar' && existsAr ? 'ar' : (existsEn ? 'en' : 'ar');
      const activeResult = requestedLang === 'ar' ? arResult : enResult;
      const content = activeResult ? activeResult.content : (enResult?.content || arResult?.content || '');

      return res.json({
        success: true,
        exists: true,
        existsEn,
        existsAr,
        contentEn: enResult?.content || '',
        contentAr: arResult?.content || '',
        content,
        activeLang: requestedLang
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Cached Google Play Store Metadata Proxy (zero API keys required, 1h TTL + honest fallback)
  const PLAYSTORE_CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
  const playStoreCache = new Map<string, { timestamp: number; data: any }>();

  app.get('/api/playstore/app', async (req, res) => {
    const hasIdParam = req.query.id !== undefined;
    const rawId = typeof req.query.id === 'string' ? req.query.id.trim() : '';
    const appId = hasIdParam ? rawId : 'com.ahmed.revio';
    if (!appId || !/^[a-zA-Z0-9._-]+$/.test(appId)) {
      return res.status(400).json({ success: false, error: 'Invalid Google Play package id' });
    }

    const forceRefresh = req.query.refresh === '1';
    const cached = playStoreCache.get(appId);

    if (!forceRefresh && cached && Date.now() - cached.timestamp < PLAYSTORE_CACHE_TTL_MS) {
      return res.json({
        success: true,
        cached: true,
        ...cached.data,
      });
    }

    const storeUrl = `https://play.google.com/store/apps/details?id=${encodeURIComponent(appId)}&hl=en&gl=US`;

    try {
      const response = await fetchWithTimeout(
        storeUrl,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        },
        9000
      );

      if (!response.ok) {
        if (cached) {
          return res.json({ success: true, cached: true, stale: true, ...cached.data });
        }
        return res.json({
          success: true,
          appId,
          title: appId === 'com.ahmed.revio' ? 'Revio' : appId,
          storeUrl,
          isLive: false,
          downloads: null,
          rating: null,
          reviewsCount: null,
          version: null,
          fallback: true,
          fetchedAt: new Date().toISOString(),
        });
      }

      const html = await response.text();

      // Extract structured fields safely from Google Play public HTML
      const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
      const title =
        titleMatch?.[1]?.replace(/\s*-\s*Apps on Google Play$/i, '').trim() ||
        (appId === 'com.ahmed.revio' ? 'Revio' : appId);

      // Star rating from aria-label or aggregateRating JSON
      const ratingAriaMatch = html.match(/aria-label="Rated\s+([0-9]+(?:\.[0-9]+)?)\s+stars\s+out\s+of\s+five/i);
      const ratingJsonMatch = html.match(/"ratingValue"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)"?/i);
      const rating = ratingAriaMatch?.[1] || ratingJsonMatch?.[1] || null;

      // Review count from aria-label or ratingCount JSON
      const reviewsJsonMatch = html.match(/"ratingCount"\s*:\s*"?([0-9,]+)"?/i);
      const reviewsTextMatch = html.match(/([0-9,.]+[KMB]?)\s+reviews/i);
      const reviewsCount = reviewsJsonMatch?.[1] || reviewsTextMatch?.[1] || null;

      // Downloads count (e.g., 50+, 100+, 500+, 1K+, 10K+)
      const downloadsDomMatch = html.match(/>([0-9,.]+[KMB]?\+)<\/div>\s*<div[^>]*>\s*Downloads/i);
      const downloadsAltMatch = html.match(/Downloads<\/div>\s*<\/div>|>([0-9,.]+[KMB]?\+)\s*<\/div>\s*<div[^>]*>Downloads/i);
      const downloadsDataMatch = html.match(/\[\["([0-9,.]+[KMB]?\+)",[0-9]+,[0-9]+,"[0-9,.]+[KMB]?\+"\]/);
      const downloads =
        downloadsDomMatch?.[1] ||
        downloadsAltMatch?.[1] ||
        downloadsDataMatch?.[1] ||
        null;

      // Current version or Updated on date
      const updatedMatch = html.match(/Updated on<\/div>\s*<div[^>]*>([^<]+)<\/div>/i);
      const updatedAt = updatedMatch?.[1]?.trim() || null;

      const payload = {
        appId,
        title,
        storeUrl,
        isLive: true,
        downloads,
        rating,
        reviewsCount,
        updatedAt,
        fallback: false,
        fetchedAt: new Date().toISOString(),
      };

      playStoreCache.set(appId, {
        timestamp: Date.now(),
        data: payload,
      });

      return res.json({
        success: true,
        cached: false,
        ...payload,
      });
    } catch {
      if (cached) {
        return res.json({ success: true, cached: true, stale: true, ...cached.data });
      }
      return res.json({
        success: true,
        appId,
        title: appId === 'com.ahmed.revio' ? 'Revio' : appId,
        storeUrl,
        isLive: false,
        downloads: null,
        rating: null,
        reviewsCount: null,
        updatedAt: null,
        fallback: true,
        fetchedAt: new Date().toISOString(),
      });
    }
  });

  // Immediate health readiness route (never blocks on Vite warm-up)
  app.get('/healthz', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  // Setup Vite middleware in development or static serving in production
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vitePromise = createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });

    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        return vite.middlewares(req, res, next);
      } catch (err) {
        return next(err);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
