import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface User {
  id: string;
  email?: string;
  anonymous_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: number[];
  created_at: string;
}

export interface CommunityMessage {
  id: string;
  user_id: string;
  channel_id: string;
  content: string;
  anonymous_username: string;
  flagged: boolean;
  created_at: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  member_count: number;
  created_at: string;
}

export interface CounselingSession {
  id: string;
  user_id: string;
  therapist_id?: string;
  type: 'professional' | 'ai_voice';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_time?: string;
  duration_minutes?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Therapist {
  id: string;
  name: string;
  specialty: string;
  credentials: string;
  availability: string;
  bio?: string;
  created_at: string;
}

export interface Resource {
  id: string;
  type: 'article' | 'video' | 'audio' | 'tool';
  title: string;
  description: string;
  category: string;
  duration_minutes: number;
  content_url?: string;
  thumbnail_url?: string;
  created_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  concerns: string[];
  preferred_formats: string[];
  updated_at: string;
}

export interface SavedResource {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: string;
}

export interface CitationSource {
  id: string;
  title: string;
  author: string;
  url: string;
  publication_date?: string;
  category: string;
  created_at: string;
}
