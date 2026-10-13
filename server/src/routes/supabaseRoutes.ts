import { Router, Request, Response } from 'express';
import {
  verifySupabaseConnection,
  getSupabaseSQLSchema,
  getSupabaseClient,
  syncUserWithSupabaseAuth,
} from '../db/supabase.js';
import { config } from '../config/env.js';

const router = Router();

/**
 * GET /api/supabase/status
 * Returns real-time health and connection status of Supabase
 */
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const health = await verifySupabaseConnection();
    res.json({
      success: true,
      data: {
        ...health,
        config: {
          projectUrl: config.supabase.url,
          projectId: config.supabase.projectId,
          hasAnonKey: Boolean(config.supabase.anonKey),
          hasPublishableKey: Boolean(config.supabase.publishableKey),
          publishableKeyPrefix: config.supabase.publishableKey ? config.supabase.publishableKey.substring(0, 16) + '...' : null,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify Supabase status',
      error: err.message,
    });
  }
});

/**
 * GET /api/supabase/schema
 * Returns the ready-to-execute PostgreSQL DDL schema for Supabase SQL Editor
 */
router.get('/schema', (_req: Request, res: Response) => {
  try {
    const sql = getSupabaseSQLSchema();
    res.json({
      success: true,
      data: {
        projectId: config.supabase.projectId,
        schemaSql: sql,
        instructions: [
          '1. Log into your Supabase Dashboard: https://supabase.com/dashboard/project/' + config.supabase.projectId,
          '2. Go to the "SQL Editor" tab on the left navigation bar.',
          '3. Click "New Query", paste this schema, and click "Run".',
          '4. All tables, UUID primary keys, and Row Level Security (RLS) policies will be generated immediately.',
        ],
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate Supabase schema',
      error: err.message,
    });
  }
});

/**
 * POST /api/supabase/ping
 * Performs a fresh real-time ping to test connection and measure response time
 */
router.post('/ping', async (_req: Request, res: Response) => {
  const start = Date.now();
  try {
    const health = await verifySupabaseConnection();
    const duration = Date.now() - start;
    res.json({
      success: health.connected,
      message: health.connected ? 'Supabase ping successful!' : 'Supabase ping encountered errors',
      latencyMs: duration,
      data: health,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Ping failed: ' + (err.message || 'Network error'),
    });
  }
});

/**
 * POST /api/supabase/test-signup
 * Verifies Supabase Auth registration
 */
router.post('/test-signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name = 'Test User' } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'email and password are required',
      });
      return;
    }

    const result = await syncUserWithSupabaseAuth({
      email,
      password,
      name,
      role: 'student',
    });

    res.json({
      success: result.success,
      message: result.success ? 'Supabase Auth registration successful!' : 'Supabase Auth registration notice: ' + result.error,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Auth test failed: ' + err.message,
    });
  }
});

/**
 * GET /api/supabase/profiles
 * Fetches all user profiles directly stored in Supabase public.profiles table
 */
router.get('/profiles', async (_req: Request, res: Response) => {
  try {
    const { getSupabaseProfiles } = await import('../db/supabase.js');
    const result = await getSupabaseProfiles();
    res.json({
      success: result.success,
      count: result.count,
      data: result.data,
      error: result.error,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve Supabase profiles: ' + err.message,
    });
  }
});

/**
 * POST /api/supabase/sync-all-profiles
 * Bulk synchronizes all portal accounts into Supabase public.profiles
 */
router.post('/sync-all-profiles', async (_req: Request, res: Response) => {
  try {
    const { syncAllUsersToSupabase } = await import('../db/supabase.js');
    const result = await syncAllUsersToSupabase();
    res.json({
      success: result.success,
      message: `Successfully synchronized ${result.syncedCount} of ${result.totalUsers} profiles into Supabase!`,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to bulk sync profiles: ' + err.message,
    });
  }
});

/**
 * GET /api/supabase/fix-permissions-sql
 * Returns the exact 1-click SQL fix for Row Level Security (RLS) in Supabase SQL editor
 */
router.get('/fix-permissions-sql', (_req: Request, res: Response) => {
  const fixSql = `-- ============================================================
-- CAMPUS NEWS PORTAL - SUPABASE PERMISSION FIX
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/${config.supabase.projectId}/sql/new
-- ============================================================

-- Disable RLS on profiles so backend and anon API can read & write:
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on other operational tables:
ALTER TABLE public.articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_qas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
`;

  res.json({
    success: true,
    data: {
      projectId: config.supabase.projectId,
      sql: fixSql,
    },
  });
});

export default router;
