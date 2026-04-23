-- Supabase Schema Migration
-- Run this in Supabase SQL Editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users profile table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vision Ideas table
CREATE TABLE IF NOT EXISTS public.vision_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Strategic Intelligence table
CREATE TABLE IF NOT EXISTS public.strategic_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles (id) ON DELETE CASCADE,
  category TEXT,
  title TEXT NOT NULL,
  content TEXT,
  source TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stress Test Results
CREATE TABLE IF NOT EXISTS public.stress_test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES public.vision_ideas (id) ON DELETE CASCADE,
  scenario TEXT NOT NULL,
  survived BOOLEAN DEFAULT FALSE,
  verdict TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily Digests
CREATE TABLE IF NOT EXISTS public.daily_digests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles (id) ON DELETE CASCADE,
  content TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contact Inquiries
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stress_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create RLS policies for vision_ideas
CREATE POLICY "Users can view own ideas"
  ON public.vision_ideas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ideas"
  ON public.vision_ideas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas"
  ON public.vision_ideas FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indices for performance
CREATE INDEX idx_vision_ideas_user_id ON public.vision_ideas (user_id);
CREATE INDEX idx_strategic_intelligence_user_id ON public.strategic_intelligence (user_id);
CREATE INDEX idx_stress_test_results_idea_id ON public.stress_test_results (idea_id);
CREATE INDEX idx_daily_digests_user_id ON public.daily_digests (user_id);
CREATE INDEX idx_contact_inquiries_email ON public.contact_inquiries (email);