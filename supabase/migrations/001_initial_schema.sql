-- Meridian Project — Phase 5 Schema
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'investigator'
    CHECK (role IN ('admin', 'investigator', 'viewer')),
  avatar_color TEXT DEFAULT '#4A6A9A',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Invites table
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  invited_by UUID REFERENCES public.profiles(id),
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days')
);

-- Annotations table
CREATE TABLE public.annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'note'
    CHECK (type IN ('note', 'highlight', 'comment')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_annotations_case ON public.annotations(case_id);

-- ACH Votes table
CREATE TABLE public.ach_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  evidence TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('C', 'I', 'N', '-')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, case_id, hypothesis, evidence)
);

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_target ON public.comments(case_id, target_id);

-- ========================================
-- Row Level Security (RLS)
-- ========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ach_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles: all authenticated users can read all profiles
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Profiles: users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Invites: only admins can create and view invites
CREATE POLICY "Admins can manage invites"
  ON public.invites FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Annotations: authenticated users can read all annotations for collaboration
CREATE POLICY "Annotations are viewable by authenticated users"
  ON public.annotations FOR SELECT
  TO authenticated
  USING (true);

-- Annotations: users can create their own
CREATE POLICY "Users can create annotations"
  ON public.annotations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Annotations: users can update/delete their own
CREATE POLICY "Users can update own annotations"
  ON public.annotations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own annotations"
  ON public.annotations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ACH Votes: same pattern as annotations
CREATE POLICY "Votes are viewable by authenticated users"
  ON public.ach_votes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create votes"
  ON public.ach_votes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON public.ach_votes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Comments: same pattern
CREATE POLICY "Comments are viewable by authenticated users"
  ON public.comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
