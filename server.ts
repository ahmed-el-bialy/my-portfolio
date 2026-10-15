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

  // GitHub Webhook Receiver API Route
  app.post('/api/webhook/github', (req, res) => {
    try {
      const event = req.headers['x-github-event'] || 'push';
      const payload = req.body;
      
      pushEventsCount++;
      lastPushTimestamp = new Date().toISOString();
      lastPushRepo = payload?.repository?.full_name || payload?.repository?.name || 'unknown';

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

  // Setup Vite middleware in development or static serving in production
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
