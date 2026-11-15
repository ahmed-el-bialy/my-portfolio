import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '' });

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

  async function fetchRawReadmeTextServer(username: string, repoName: string, defaultBranch: string): Promise<string | null> {
    const branches = Array.from(new Set([defaultBranch || 'main', 'main', 'master']));
    for (const branch of branches) {
      try {
        const res = await fetch(`https://raw.githubusercontent.com/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/${branch}/README.md`);
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
      const listRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/releases?per_page=1`,
        { headers: githubHeaders() }
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

  // Consolidated GitHub Portfolio Proxy (reduces 60-100 client requests down to 1 cached call)
  app.get('/api/github/portfolio', async (req, res) => {
    const username = String(req.query.username || 'ahmed-el-bialy').trim() || 'ahmed-el-bialy';
    const forceRefresh = req.query.refresh === '1';
    const cacheKey = username.toLowerCase();
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
        fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers: githubHeaders() }),
        fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`, {
          headers: githubHeaders(),
        }),
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

      // Fetch raw READMEs from raw.githubusercontent.com (0 REST API rate-limit cost) and single release check for top repos
      const targetRepos = reposList.slice(0, 20);
      const rawReadmes: Record<string, string> = {};
      const releasesMap: Record<string, any> = {};

      await Promise.all(
        targetRepos.map(async (r: any) => {
          const [readme, release] = await Promise.all([
            fetchRawReadmeTextServer(username, r.name, r.default_branch || 'main'),
            fetchSingleRepoReleaseServer(username, r.name),
          ]);
          if (readme) {
            rawReadmes[r.name] = readme;
          }
          releasesMap[r.name] = release;
        })
      );

      const payload = {
        user: userData,
        repos: reposList,
        rawReadmes,
        releasesMap,
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
  app.get('/api/github/status', (req, res) => {
    return res.json({
      lastPushTimestamp,
      lastPushRepo,
      pushEventsCount,
      serverTime: new Date().toISOString()
    });
  });

  // Endpoint to parse CV PDF & LinkedIn automatically using Gemini
  app.post('/api/parse-cv', async (req, res) => {
    try {
      const { pdfUrl, linkedinUrl, githubUsername } = req.body;
      
      let downloadUrl = pdfUrl;
      if (pdfUrl && pdfUrl.includes('drive.google.com')) {
        const match = pdfUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          downloadUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
      }

      let pdfBase64 = '';
      try {
        if (downloadUrl) {
          const pdfRes = await fetch(downloadUrl);
          if (pdfRes.ok) {
            const buffer = await pdfRes.arrayBuffer();
            pdfBase64 = Buffer.from(buffer).toString('base64');
          }
        }
      } catch (e) {
        console.warn('Could not download PDF directly from Drive, relying on search grounding & AI synthesis');
      }

      const prompt = `Analyze this candidate's resume/CV (PDF attached if available, github username: ${githubUsername || 'ahmed-el-bialy'}, linkedin: ${linkedinUrl || 'https://www.linkedin.com/in/ahmedel-bialy'}) and extract structured portfolio data as a JSON object with:
      {
        "name": "...",
        "title": "...",
        "about": "...",
        "skills": ["..."],
        "experience": [
          {
            "company": "...",
            "role": "...",
            "period": "...",
            "description": "...",
            "technologies": ["..."]
          }
        ],
        "projects": [
          {
            "name": "...",
            "description": "...",
            "tech": ["..."],
            "github": "...",
            "demo": "..."
          }
        ]
      }
      Return ONLY valid JSON.`;

      const contents: any[] = [prompt];
      if (pdfBase64) {
        contents.push({
          inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return res.json({ success: true, data: parsedData });
      }

      return res.json({ success: false, raw: text });
    } catch (error: any) {
      console.error('CV Parse Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Endpoint to fetch Study Case markdown with smart multi-filename checking from GitHub
  app.get('/api/study-case', async (req, res) => {
    try {
      const { repo, lang = 'en' } = req.query;
      if (!repo) {
        return res.status(400).json({ success: false, error: 'Repository name required' });
      }

      const enFiles = ['CASE_STUDY.md', 'case-study.md', 'STUDY_CASE.md'];
      const arFiles = ['CASE_STUDY_AR.md', 'case-study-ar.md', 'STUDY_CASE_AR.md'];
      const branches = ['main', 'master'];

      async function fetchFirstValid(filenames: string[]) {
        for (const branch of branches) {
          for (const filename of filenames) {
            const url = `https://raw.githubusercontent.com/ahmed-el-bialy/${repo}/${branch}/${filename}`;
            try {
              const r = await fetch(url);
              if (r.ok) {
                const text = await r.text();
                if (text && text.trim().length > 0) {
                  return { content: text, filename };
                }
              }
            } catch (e) {}
          }
        }
        return null;
      }

      const enResult = await fetchFirstValid(enFiles);
      const arResult = await fetchFirstValid(arFiles);

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
    const appId = String(req.query.id || 'com.ahmed.revio').trim() || 'com.ahmed.revio';
    if (!/^[a-zA-Z0-9._-]+$/.test(appId)) {
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
      const response = await fetch(storeUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        if (cached) {
          return res.json({ success: true, cached: true, stale: true, ...cached.data });
        }
        return res.json({
          success: true,
          appId,
          storeUrl,
          isLive: true,
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
      const title = titleMatch?.[1]?.replace(/\s*-\s*Apps on Google Play$/i, '').trim() || 'Revio';

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
        storeUrl,
        isLive: true,
        downloads: null,
        rating: null,
        reviewsCount: null,
        updatedAt: null,
        fallback: true,
        fetchedAt: new Date().toISOString(),
      });
    }
  });

  // Setup Vite middleware in development or static serving in production
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
