import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://eebvsatjdxxtprnajgbv.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlYnZzYXRqZHh4dHBybmFqZ2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NjkzNjMsImV4cCI6MjA2NDM0NTM2M30.nQSGcY_jc-DFNgANpEzUZ8WxwGp7R9_lxF_GePFuQKk";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Get auth token for API requests
export function getAuthToken(): string | null {
  const session = supabase.auth.getSession();
  return session ? 'will-be-implemented' : null;
}

// Set up auth headers for fetch requests
export function getAuthHeaders(): HeadersInit {
  const session = localStorage.getItem('supabase.auth.token');
  if (session) {
    try {
      const parsed = JSON.parse(session);
      const token = parsed.access_token;
      if (token) {
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
      }
    } catch (e) {
      console.error('Error parsing auth token:', e);
    }
  }
  return {
    'Content-Type': 'application/json'
  };
}