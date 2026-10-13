import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'bca_campus_news_portal_jwt_secret_key_2026',
  mongodbUri: process.env.MONGODB_URI || '',
  dbName: (process.env.DB_NAME || 'campusnews').trim().replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase() || 'campusnews',
  adminName: process.env.ADMIN_NAME || 'Aman',
  adminEmail: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  supabase: {
    url: (process.env.SUPABASE_URL || 'https://rkntdmyptrpzowfdejzl.supabase.co').replace(/\/rest\/v1\/?$/, '').replace(/\/$/, ''),
    anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbnRkbXlwdHJwem93ZmRlanpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4NTU3MDksImV4cCI6MjEwNzQzMTcwOX0.fE2C0qercvfWYsQJfyNukobDE-Z7wG6-D75v46sPv3Y',
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_SptAb0ZQDZajz2LrIzaWaA__8aXLT26',
    projectId: 'rkntdmyptrpzowfdejzl',
  },
};
