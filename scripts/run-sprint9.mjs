// Runner for Sprint 9 migration: posts table (blog/news/case-studies) + jobs table.
// Usage: node scripts/run-sprint9.mjs <sbp_token> [dev|prod]
// Idempotent — safe to run twice.

const TOKEN = process.argv[2];
const REF_ARG = process.argv[3] ?? "prod";

const PROJECTS = {
  dev:  "dmggdqlkbigyttojisve",
  prod: "rityquzzjwmueveukipg",
};

if (!TOKEN || !TOKEN.startsWith("sbp_")) {
  console.error("Usage: node scripts/run-sprint9.mjs <sbp_token> [dev|prod]");
  process.exit(1);
}

const ref = PROJECTS[REF_ARG] ?? REF_ARG;
const label = Object.entries(PROJECTS).find(([, v]) => v === ref)?.[0] ?? ref;

const SQL = `
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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'public read published posts') THEN
    CREATE POLICY "public read published posts" ON posts FOR SELECT USING (status = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'public read active jobs') THEN
    CREATE POLICY "public read active jobs" ON jobs FOR SELECT USING (status = 'active');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_type      ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_status    ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_slug      ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status     ON jobs(status);

SELECT 'sprint9_marketing applied' AS result;
`.trim();

async function run() {
  console.log(`Target: ${label} (${ref})`);
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: SQL }),
  });
  const body = await res.json();
  if (!res.ok) { console.error("FAILED:", JSON.stringify(body, null, 2)); process.exit(1); }
  const rows = Array.isArray(body) ? body : [];
  console.log("✓", rows[0]?.result ?? "ok");
  console.log("\nSprint 9 migration complete.");
}

run();
