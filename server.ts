import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { config } from './server/src/config/env.js';
import app, { ensureInitialized } from './server/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Initialize DB, admin seed, and Supabase connection
  await ensureInitialized();

  const PORT = config.port || 3000;

  // Frontend Integration: Dev Mode uses Vite middlewares; Prod serves static dist
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🎓 CAMPUS NEWS PORTAL SERVER RUNNING`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`⚙️  Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: MongoDB / Local Resilient DB (campusnews)`);
    console.log(`⚡ Supabase: Connected to ${config.supabase.projectId} (Auth + Storage + REST)`);
    console.log(`🔐 Auth: Real Authentication with JWT + Bcrypt & Supabase Auth`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting Campus News Portal server:', err);
  process.exit(1);
});
