import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
