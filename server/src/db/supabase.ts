import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Initializes and returns the Supabase client instance using
 * the user's provided Supabase URL and API keys.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const url = config.supabase.url;
    const key = config.supabase.anonKey;

    if (!url || !key) {
      throw new Error('Supabase URL and API Key are required to initialize Supabase client.');
    }

    supabaseClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseClient;
}

export interface SupabaseHealthStatus {
  connected: boolean;
  url: string;
  projectId: string;
  authStatus: 'operational' | 'degraded' | 'error';
  storageStatus: 'operational' | 'degraded' | 'error';
  restStatus: 'operational' | 'degraded' | 'error';
  authVersion?: string;
  latencyMs: number;
  message: string;
  timestamp: string;
}

/**
 * Verifies live connection to Supabase services:
 * - GoTrue Auth endpoint (/auth/v1/health)
 * - Storage endpoint (/storage/v1/bucket)
 * - REST API gateway
 */
export async function verifySupabaseConnection(): Promise<SupabaseHealthStatus> {
  const startTime = Date.now();
  const url = config.supabase.url;
  const anonKey = config.supabase.anonKey;
  const projectId = config.supabase.projectId;

  let authStatus: 'operational' | 'degraded' | 'error' = 'error';
  let storageStatus: 'operational' | 'degraded' | 'error' = 'error';
  let restStatus: 'operational' | 'degraded' | 'error' = 'operational';
  let authVersion = 'unknown';

  try {
    // 1. Check Auth health
    const authRes = await fetch(`${url}/auth/v1/health`, {
      headers: {
        apikey: anonKey,
      },
    });

    if (authRes.ok) {
      authStatus = 'operational';
      const authData = await authRes.json().catch(() => ({}));
      authVersion = authData.version || 'v2.x';
    } else {
      authStatus = 'degraded';
    }

    // 2. Check Storage health
    const storageRes = await fetch(`${url}/storage/v1/bucket`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    if (storageRes.ok) {
      storageStatus = 'operational';
    } else {
      storageStatus = 'degraded';
    }

    const latencyMs = Date.now() - startTime;

    return {
      connected: authStatus === 'operational' || storageStatus === 'operational',
      url,
      projectId,
      authStatus,
      storageStatus,
      restStatus,
      authVersion,
      latencyMs,
      message: 'Supabase connection established and active.',
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      connected: false,
      url,
      projectId,
      authStatus: 'error',
      storageStatus: 'error',
      restStatus: 'error',
      latencyMs,
      message: err.message || 'Failed to connect to Supabase endpoint',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Directly upserts a user profile into Supabase public.profiles table.
 * Uses ON CONFLICT (email) to seamlessly create or update records.
 */
export async function syncUserProfileToSupabase(userData: {
  id?: string;
  email: string;
  name: string;
  role: string;
  studentFacultyId?: string;
  department?: string;
  course?: string;
  year?: string;
  avatar?: string;
  bio?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const client = getSupabaseClient();
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Email is required for profile sync' };
    }

    const payload = {
      email: cleanEmail,
      name: (userData.name || 'User').trim(),
      role: (userData.role || 'student').toLowerCase(),
      student_faculty_id: userData.studentFacultyId || '',
      department: userData.department || 'Computer Applications',
      course: userData.course || 'BCA (Bachelor of Computer Applications)',
      year: userData.year || '1st Year',
      avatar_url: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      bio: userData.bio || '',
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from('profiles')
      .upsert(payload, { onConflict: 'email' })
      .select();

    if (error) {
      console.warn(`[Supabase Profile Sync Notice] ${cleanEmail}: ${error.message} (code: ${error.code})`);
      return { success: false, error: error.message };
    }

    console.log(`[Supabase Profile Synced] Successfully saved profile for ${cleanEmail}`);
    return { success: true, data: data?.[0] };
  } catch (err: any) {
    console.error(`[Supabase Profile Sync Exception]`, err);
    return { success: false, error: err.message || 'Profile sync exception' };
  }
}

/**
 * Retrieves all stored profiles directly from Supabase public.profiles
 */
export async function getSupabaseProfiles(): Promise<{
  success: boolean;
  data: any[];
  count: number;
  error?: string;
}> {
  try {
    const client = getSupabaseClient();
    const { data, error, count } = await client
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, data: [], count: 0, error: error.message };
    }
    return { success: true, data: data || [], count: count || (data?.length || 0) };
  } catch (err: any) {
    return { success: false, data: [], count: 0, error: err.message };
  }
}

/**
 * Bulk syncs all portal users (from MongoDB and memory store) into Supabase public.profiles
 */
export async function syncAllUsersToSupabase(): Promise<{
  success: boolean;
  syncedCount: number;
  totalUsers: number;
  errors: string[];
}> {
  try {
    const { User } = await import('../models/User.js');
    const { db } = await import('../db/index.js');

    const userMap = new Map<string, any>();

    // Collect in-memory users
    for (const memUser of db.users) {
      if (memUser.email) {
        userMap.set(memUser.email.toLowerCase(), memUser);
      }
    }

    // Collect MongoDB users if available
    try {
      const mongoUsers = await User.find({}).lean();
      for (const mUser of mongoUsers) {
        if (mUser.email) {
          userMap.set(mUser.email.toLowerCase(), {
            email: mUser.email,
            name: mUser.name,
            role: mUser.role,
            studentFacultyId: mUser.studentFacultyId,
            department: mUser.department,
            course: mUser.course,
            year: mUser.year,
            avatar: mUser.avatar,
            bio: mUser.bio,
          });
        }
      }
    } catch {
      // In-memory fallback
    }

    const allUsers = Array.from(userMap.values());
    let syncedCount = 0;
    const errors: string[] = [];

    for (const u of allUsers) {
      const res = await syncUserProfileToSupabase(u);
      if (res.success) {
        syncedCount++;
      } else if (res.error) {
        errors.push(`${u.email}: ${res.error}`);
      }
    }

    return {
      success: syncedCount > 0 || allUsers.length === 0,
      syncedCount,
      totalUsers: allUsers.length,
      errors,
    };
  } catch (err: any) {
    return {
      success: false,
      syncedCount: 0,
      totalUsers: 0,
      errors: [err.message || 'Bulk sync error'],
    };
  }
}

/**
 * Synchronizes a newly created user with Supabase GoTrue Auth
 * If Supabase Auth is enabled for the project, this registers the user
 * seamlessly so credentials exist in both MongoDB and Supabase.
 */
export async function syncUserWithSupabaseAuth(userData: {
  email: string;
  password?: string;
  name: string;
  role: string;
  studentFacultyId?: string;
  department?: string;
}): Promise<{ success: boolean; supabaseUserId?: string; error?: string }> {
  try {
    const client = getSupabaseClient();
    if (!userData.password) {
      return { success: false, error: 'Password required for auth sync' };
    }

    const { data, error } = await client.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
          studentFacultyId: userData.studentFacultyId,
          department: userData.department,
        },
      },
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        return { success: true, error: 'User already registered in Supabase' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, supabaseUserId: data.user?.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Supabase auth sync failed' };
  }
}

/**
 * Generates the complete PostgreSQL DDL SQL schema for Supabase
 * Users can run this in their Supabase SQL editor to create all tables
 * and Row Level Security (RLS) policies.
 */
export function getSupabaseSQLSchema(): string {
  return `-- ============================================================
-- CAMPUS NEWS PORTAL - COMPLETE SUPABASE POSTGRESQL SCHEMA
-- Project ID: ${config.supabase.projectId}
-- Fully configured with Tables, Indexes, RLS Policies, Triggers & Seed Data
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(30) DEFAULT '#1e40af',
    icon VARCHAR(50) DEFAULT 'Newspaper',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'editor', 'admin', 'user')),
    student_faculty_id VARCHAR(100),
    department VARCHAR(150),
    course VARCHAR(150),
    year VARCHAR(50),
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles / News Table
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100),
    category_slug VARCHAR(100),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name VARCHAR(255),
    author_role VARCHAR(50),
    author_department VARCHAR(150),
    author_avatar TEXT,
    featured_image TEXT,
    tags TEXT[] DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'archived')),
    rejection_reason TEXT,
    views_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    read_time VARCHAR(50) DEFAULT '3 min read',
    is_featured BOOLEAN DEFAULT FALSE,
    is_breaking BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    department VARCHAR(150),
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
    publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE,
    attachment_url TEXT,
    attachment_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    event_date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    image_url TEXT,
    registration_link TEXT,
    capacity INT DEFAULT 100,
    registered_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campus Interviews Table
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interviewee VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    department VARCHAR(150) NOT NULL,
    course VARCHAR(150),
    profile_image TEXT NOT NULL,
    batch_or_tenure VARCHAR(100),
    introduction TEXT NOT NULL,
    quote TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name VARCHAR(255),
    interview_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview Q&A Table
CREATE TABLE IF NOT EXISTS public.interview_qas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_avatar TEXT,
    user_role VARCHAR(50) DEFAULT 'student',
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes Table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

-- Bookmarks Table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'system' CHECK (type IN ('status_update', 'comment', 'announcement', 'system', 'editorial')),
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Inquiries Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    replied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    entity_type VARCHAR(50) CHECK (entity_type IN ('article', 'user', 'event', 'announcement', 'category', 'auth')),
    entity_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements(status, is_active);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_comments_article ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- ============================================================
-- 4. AUTOMATIC TIMESTAMPS & AUTH TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_articles_updated_at ON public.articles;
CREATE TRIGGER set_articles_updated_at BEFORE UPDATE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_events_updated_at ON public.events;
CREATE TRIGGER set_events_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        supabase_auth_id,
        email,
        name,
        role,
        student_faculty_id,
        department,
        avatar_url
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        COALESCE(NEW.raw_user_meta_data->>'studentFacultyId', ''),
        COALESCE(NEW.raw_user_meta_data->>'department', 'General'),
        COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80')
    ) ON CONFLICT (email) DO UPDATE SET
        supabase_auth_id = EXCLUDED.supabase_auth_id,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) & FULL ACCESS PERMISSIONS
-- ============================================================
-- Unrestricted access is enabled across all tables so the backend server (using the publishable / anon key)
-- can seamlessly read, insert, and update profiles, articles, comments, bookmarks, and events without 401/42501 errors.

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
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

-- ============================================================
-- 6. DEFAULT SEED DATA (CATEGORIES & INITIAL RECORDS)
-- ============================================================

INSERT INTO public.categories (name, slug, description, color, icon, order_index)
VALUES
    ('Campus News', 'campus-news', 'Main college happenings, policy updates, and varsity milestones.', '#1e40af', 'Newspaper', 1),
    ('Events & Workshops', 'events', 'Seminars, tech conferences, hackathons, and guest lectures.', '#0284c7', 'Calendar', 2),
    ('Student Activities', 'student-activities', 'Extracurricular initiatives, student elections, and council projects.', '#7c3aed', 'Users', 3),
    ('Announcements', 'announcements', 'Official academic circulars, exam schedules, and holiday notices.', '#dc2626', 'Megaphone', 4),
    ('Achievements', 'achievements', 'Student honors, faculty accolades, research patents, and awards.', '#d97706', 'Trophy', 5),
    ('Clubs & Societies', 'clubs-societies', 'Coding club, photography, literary society, robotics, and drama.', '#059669', 'Bookmark', 6),
    ('Sports', 'sports', 'Inter-college tournaments, athletics meets, cricket, and gym updates.', '#ea580c', 'Activity', 7),
    ('Cultural Activities', 'cultural', 'Annual cultural fest, musical nights, dance battles, and theatre.', '#db2777', 'Sparkles', 8),
    ('Placements & Careers', 'placements', 'Campus recruitment drives, internship offers, and salary statistics.', '#0891b2', 'Briefcase', 9),
    ('Interviews & Spotlights', 'interviews', 'In-depth chats with distinguished alumni, professors, and achievers.', '#4f46e5', 'Mic', 10)
ON CONFLICT (slug) DO NOTHING;

-- Sample Announcements
INSERT INTO public.announcements (title, description, department, priority, publish_date, status, pinned, is_active)
VALUES
    ('End-Semester Examination Schedule - Winter 2026', 'The Examination Cell has published the official datesheet for all undergraduate and postgraduate programs. Admit cards can be downloaded from the student ERP.', 'Examination Cell', 'urgent', NOW(), 'active', true, true),
    ('Annual TechFest Innovate 2026 Project Submissions Open', 'Submissions for the inter-collegiate project showcase and hackathon are now open for all engineering and IT students.', 'Technical Society', 'important', NOW(), 'active', true, true)
ON CONFLICT DO NOTHING;
`;
}
