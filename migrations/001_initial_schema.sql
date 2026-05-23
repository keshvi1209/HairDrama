-- ============================================================
-- HairDrama Tasks — Initial Schema Migration
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- Mirrors auth.users; auto-populated via trigger on signup
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    full_name  = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TASKS TABLE
-- ============================================================
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE IF NOT EXISTS public.tasks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT,
  status       task_status NOT NULL DEFAULT 'todo',
  priority     task_priority NOT NULL DEFAULT 'medium',
  creator_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignee_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date     DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_creator_id  ON public.tasks(creator_id);
CREATE INDEX idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX idx_tasks_status      ON public.tasks(status);
CREATE INDEX idx_tasks_created_at  ON public.tasks(created_at DESC);

-- Row-Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks they created or are assigned to"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    auth.uid() = creator_id OR auth.uid() = assignee_id
  );

CREATE POLICY "Authenticated users can create tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators and assignees can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id OR auth.uid() = assignee_id);

CREATE POLICY "Only creators can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
