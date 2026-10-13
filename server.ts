import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { config } from './server/src/config/env.js';
import { errorHandler } from './server/src/middleware/error.js';
import { connectDB } from './server/src/db/connection.js';
import { seedAdminAccount } from './server/src/services/adminSeed.js';

import authRoutes from './server/src/routes/authRoutes.js';
import articleRoutes from './server/src/routes/articleRoutes.js';
import eventRoutes from './server/src/routes/eventRoutes.js';
import announcementRoutes from './server/src/routes/announcementRoutes.js';
import interviewRoutes from './server/src/routes/interviewRoutes.js';
import categoryRoutes from './server/src/routes/categoryRoutes.js';
import commentRoutes from './server/src/routes/commentRoutes.js';
import userRoutes from './server/src/routes/userRoutes.js';
import notificationRoutes from './server/src/routes/notificationRoutes.js';
import miscRoutes from './server/src/routes/miscRoutes.js';
import aiRoutes from './server/src/routes/aiRoutes.js';
import supabaseRoutes from './server/src/routes/supabaseRoutes.js';
import { verifySupabaseConnection } from './server/src/db/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // 1. Connect to MongoDB Atlas (or local resilient instance)
  await connectDB();

  // 2. Initialize real administrator account from environment variables
  await seedAdminAccount();

  // 3. Connect and verify Supabase Backend Integration
  let supabaseHealth: any = null;
  try {
    supabaseHealth = await verifySupabaseConnection();
    if (supabaseHealth.connected) {
      console.log(`✅ [Supabase] Connected to project: ${supabaseHealth.projectId} (${supabaseHealth.url})`);
      console.log(`⚡ [Supabase Auth] GoTrue ${supabaseHealth.authVersion} active with PostgREST & Storage ready (${supabaseHealth.latencyMs}ms)`);
    } else {
      console.warn(`⚠️ [Supabase] Notice: ${supabaseHealth.message}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [Supabase] Connection notice:`, err.message || err);
  }

  const app = express();
  const PORT = config.port || 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Health Check
  app.get('/api/health', async (_req, res) => {
    const liveSupabase: any = await verifySupabaseConnection().catch(e => ({ connected: false, message: e.message }));
    res.json({
      status: 'ok',
      service: 'Campus News Portal API',
      database: 'MongoDB (campusnews)',
      auth: 'JWT & Bcrypt with Role-Based Access Control',
      supabase: {
        connected: liveSupabase.connected,
        projectId: config.supabase.projectId,
        url: config.supabase.url,
        authStatus: liveSupabase.authStatus || 'unknown',
        storageStatus: liveSupabase.storageStatus || 'unknown',
        authVersion: liveSupabase.authVersion || 'GoTrue',
        latencyMs: liveSupabase.latencyMs || 0,
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/articles', articleRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/interviews', interviewRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/supabase', supabaseRoutes);
  app.use('/api', miscRoutes);
  app.use('/api/ai', aiRoutes);

  // Global Error Handler for API routes
  app.use(errorHandler);

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
    console.log(`🗄️  Database: MongoDB (campusnews)`);
    console.log(`⚡ Supabase: Connected to ${config.supabase.projectId} (Auth + Storage + REST)`);
    console.log(`🔐 Auth: Real MongoDB Authentication with JWT + Bcrypt & Supabase Auth`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting Campus News Portal server:', err);
  process.exit(1);
});
