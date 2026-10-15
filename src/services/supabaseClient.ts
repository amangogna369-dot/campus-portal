import { createClient } from '@supabase/supabase-js';

// Safe environment variable getter across Vite, SSR, and serverless environments
const getEnvVar = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.[key]) {
      return (import.meta as any).env[key];
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process?.env?.[key]) {
      return process.env[key] as string;
    }
  } catch {}
  return '';
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL') || 'https://rkntdmyptrpzowfdejzl.supabase.co';
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbnRkbXlwdHJwem93ZmRlanpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4NTU3MDksImV4cCI6MjEwNzQzMTcwOX0.fE2C0qercvfWYsQJfyNukobDE-Z7wG6-D75v46sPv3Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

