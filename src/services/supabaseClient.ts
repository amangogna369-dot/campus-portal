import { createClient } from '@supabase/supabase-js';

// Default Supabase configuration from environment or provided credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rkntdmyptrpzowfdejzl.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbnRkbXlwdHJwem93ZmRlanpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4NTU3MDksImV4cCI6MjEwNzQzMTcwOX0.fE2C0qercvfWYsQJfyNukobDE-Z7wG6-D75v46sPv3Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
