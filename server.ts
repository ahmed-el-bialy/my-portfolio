import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
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

  async function fetchRepoScreenshotsServer(
    username: string,
    repoName: string,
    defaultBranch: string
  ): Promise<{ coverUrl?: string; screens: string[] }> {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/contents/screenshots`,
        { headers: githubHeaders() }
      );
      if (!res.ok) return { screens: [] };
      const files = await res.json();
      if (!Array.isArray(files)) return { screens: [] };

      const imageRegex = /\.(png|jpe?g|webp)$/i;
      let coverUrl: string | undefined;
      const screens: string[] = [];

      for (const file of files) {
        if (file?.type !== 'file' || typeof file?.name !== 'string') continue;
        if (!imageRegex.test(file.name)) continue;

        const rawUrl =
          file.download_url ||
          `https://raw.githubusercontent.com/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/${encodeURIComponent(
            defaultBranch || 'main'
          )}/screenshots/${encodeURIComponent(file.name)}`;

        if (/^cover\.(png|jpe?g|webp)$/i.test(file.name)) {
          coverUrl = rawUrl;
        } else {
          screens.push(rawUrl);
        }
      }

      return { coverUrl, screens };
    } catch {
      return { screens: [] };
    }
  }

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
      (parsedUrl.hostname === 'raw.githubusercontent.com' &&
        parsedUrl.pathname.toLowerCase().startsWith('/ahmed-el-bialy/')) ||
      parsedUrl.hostname === 'avatars.githubusercontent.com';

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const upstream = await fetch(rawUrl, {
        headers: { 'User-Agent': 'ahmed-el-bialy-portfolio-media' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

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

      // Fetch raw READMEs, releases, and /screenshots folder contents automatically for top repos
      const targetRepos = reposList.slice(0, 20);
      const rawReadmes: Record<string, string> = {};
      const releasesMap: Record<string, any> = {};
      const screenshotsMap: Record<string, { coverUrl?: string; screens: string[] }> = {};

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

      const ai = getAiClient();
      if (!ai) {
        return res.status(503).json({ success: false, error: 'GEMINI_API_KEY is not configured.' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
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
      if (isGeminiAuthError(error)) {
        return res.status(401).json({
          success: false,
          keyInvalid: true,
          error: 'Gemini API key is invalid or unauthorized. Please check GEMINI_API_KEY in Settings > Secrets.',
        });
      }
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
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
