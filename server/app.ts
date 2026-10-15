import express from 'express';
import cors from 'cors';
import { config } from './src/config/env.js';
import { errorHandler } from './src/middleware/error.js';
import { connectDB } from './src/db/connection.js';
import { seedAdminAccount } from './src/services/adminSeed.js';

import authRoutes from './src/routes/authRoutes.js';
import articleRoutes from './src/routes/articleRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import announcementRoutes from './src/routes/announcementRoutes.js';
import interviewRoutes from './src/routes/interviewRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import commentRoutes from './src/routes/commentRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import miscRoutes from './src/routes/miscRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import supabaseRoutes from './src/routes/supabaseRoutes.js';
import { verifySupabaseConnection } from './src/db/supabase.js';

let initPromise: Promise<void> | null = null;

export async function ensureInitialized(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      await connectDB();
      await seedAdminAccount();
      const supabaseHealth: any = await verifySupabaseConnection().catch(e => ({ connected: false, message: e.message }));
      if (supabaseHealth.connected) {
        console.log(`✅ [Supabase] Connected: ${supabaseHealth.projectId} (${supabaseHealth.url})`);
      }
    } catch (err: any) {
      console.warn('⚠️ Serverless initialization warning:', err.message || err);
    }
  })();
  return initPromise;
}

export function createApp() {
  const app = express();

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Ensure database initialization on incoming requests (serverless cold-start safe)
  app.use(async (_req, _res, next) => {
    await ensureInitialized().catch(() => {});
    next();
  });

  // API Health Check
  const healthHandler = async (_req: express.Request, res: express.Response) => {
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
  };

  app.get('/api/health', healthHandler);
  app.get('/health', healthHandler);

  // REST API Routes with /api prefix
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
  app.use('/api/ai', aiRoutes);
  app.use('/api', miscRoutes);

  // Fallback routes without /api prefix for flexible Vercel rewrites
  app.use('/auth', authRoutes);
  app.use('/articles', articleRoutes);
  app.use('/events', eventRoutes);
  app.use('/announcements', announcementRoutes);
  app.use('/interviews', interviewRoutes);
  app.use('/categories', categoryRoutes);
  app.use('/comments', commentRoutes);
  app.use('/users', userRoutes);
  app.use('/notifications', notificationRoutes);
  app.use('/supabase', supabaseRoutes);
  app.use('/ai', aiRoutes);

  // Global Error Handler for API routes
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
