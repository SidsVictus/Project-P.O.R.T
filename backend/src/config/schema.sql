-- Journal Deployer Database Schema
-- Run this in Supabase SQL Editor

-- Sites table
CREATE TABLE IF NOT EXISTS sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  template_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deployments table
CREATE TABLE IF NOT EXISTS deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  provider TEXT NOT NULL,
  deploy_url TEXT,
  logs TEXT DEFAULT '',
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credentials table (tokens encrypted server-side)
CREATE TABLE IF NOT EXISTS credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  token_encrypted TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cron_expression TEXT,
  next_run TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks table (GitHub auto-deploy)
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  github_repo TEXT NOT NULL,
  branch TEXT DEFAULT 'main',
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'slack')),
  destination TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  visits INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sites_user ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_site ON deployments(site_id);
CREATE INDEX IF NOT EXISTS idx_deployments_user ON deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_user ON credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_user ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_site ON analytics(site_id);

-- Row Level Security
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only see their own data)
CREATE POLICY "Users can view own sites" ON sites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sites" ON sites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sites" ON sites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sites" ON sites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own deployments" ON deployments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deployments" ON deployments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deployments" ON deployments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own credentials" ON credentials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credentials" ON credentials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own credentials" ON credentials FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own schedules" ON schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own schedules" ON schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedules" ON schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedules" ON schedules FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own templates" ON templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON templates FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own webhooks" ON webhooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own webhooks" ON webhooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own webhooks" ON webhooks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" ON analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
