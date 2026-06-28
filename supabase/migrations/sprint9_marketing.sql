-- ============================================================
-- Sprint 9 — Marketing Platform
--
-- 1. posts  — blog, news, case-study, success-story
-- 2. jobs   — dynamic career listings
-- ============================================================

CREATE TABLE IF NOT EXISTS posts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type         text        NOT NULL DEFAULT 'blog',
  slug         text        NOT NULL UNIQUE,
  title        text        NOT NULL,
  excerpt      text,
  body         text,
  cover_image  text,
  author       text        DEFAULT 'Maxgen Team',
  tags         text[]      DEFAULT '{}',
  status       text        DEFAULT 'draft',
  published_at timestamptz,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  location     text,
  type         text        DEFAULT 'Full-time',
  department   text,
  description  text,
  requirements text,
  status       text        DEFAULT 'active',
  sort_order   integer     DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs  ENABLE ROW LEVEL SECURITY;

-- Public can read published posts and active jobs
CREATE POLICY IF NOT EXISTS "public read published posts" ON posts
  FOR SELECT USING (status = 'published');

CREATE POLICY IF NOT EXISTS "public read active jobs" ON jobs
  FOR SELECT USING (status = 'active');

-- Public can insert leads (newsletter — uses existing leads table, no change needed)

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_type       ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_status     ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_slug       ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published  ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status      ON jobs(status);

SELECT 'sprint9_marketing applied' AS result;
