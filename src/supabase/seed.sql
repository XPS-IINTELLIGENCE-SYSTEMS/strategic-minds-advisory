-- ============================================
-- SUPABASE SEED DATA
-- Initial demo data for system setup
-- ============================================

-- Insert demo workspace
INSERT INTO public.workspaces (name, owner_email, description)
VALUES (
  'Strategic Minds Advisory',
  'demo@strategicminds.ai',
  'AI-powered strategic consulting platform'
) ON CONFLICT DO NOTHING;

-- Insert demo user profile
INSERT INTO public.user_profiles (email, full_name, role)
VALUES (
  'demo@strategicminds.ai',
  'Demo User',
  'admin'
) ON CONFLICT DO NOTHING;

-- Insert demo automation templates
INSERT INTO public.automation_tasks (user_email, name, automation_type, config, enabled)
VALUES
  ('demo@strategicminds.ai', 'Weekly Stress Test Runner', 'stress_test', '{"frequency": "weekly"}', true),
  ('demo@strategicminds.ai', 'Daily Intelligence Scraper', 'scraping', '{"urls": [], "depth": 2}', true),
  ('demo@strategicminds.ai', 'Investor Status Sync', 'pipeline', '{"source": "crm"}', true)
ON CONFLICT DO NOTHING;

-- Insert demo vision idea
INSERT INTO public.vision_ideas (user_email, title, description, business_model, status)
VALUES (
  'demo@strategicminds.ai',
  'AI Consulting Platform',
  'Intelligent strategic advisory powered by multi-agent AI systems',
  'SaaS',
  'analyzing'
) ON CONFLICT DO NOTHING;

-- Insert demo investor
INSERT INTO public.investors (workspace_id, name, email, company, stage, status)
VALUES (
  (SELECT id FROM public.workspaces WHERE owner_email = 'demo@strategicminds.ai' LIMIT 1),
  'John Doe',
  'john@ventures.fund',
  'Venture Partners',
  'series_a',
  'new'
) ON CONFLICT DO NOTHING;

-- Insert demo content items
INSERT INTO public.content_items (user_email, title, body, content_type, status)
VALUES (
  'demo@strategicminds.ai',
  'Market Analysis: Q1 2026 Tech Landscape',
  'Key findings: AI adoption accelerating, investment flowing to B2B solutions...',
  'market_analysis',
  'published'
),
(
  'demo@strategicminds.ai',
  'Pitch Deck: Strategic AI Platform',
  'Comprehensive investment thesis and go-to-market strategy...',
  'pitch_deck',
  'draft'
) ON CONFLICT DO NOTHING;