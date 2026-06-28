// Runner for Sprint 8 migration: tags/images on products, status/notes on orders.
// Usage: node scripts/run-sprint8.mjs <sbp_token> [dev|prod]
// Idempotent — safe to run twice.

const TOKEN = process.argv[2];
const REF_ARG = process.argv[3] ?? "prod";

const PROJECTS = {
  dev:  "dmggdqlkbigyttojisve",
  prod: "rityquzzjwmueveukipg",
};

if (!TOKEN || !TOKEN.startsWith("sbp_")) {
  console.error("Usage: node scripts/run-sprint8.mjs <sbp_token> [dev|prod]");
  process.exit(1);
}

const ref = PROJECTS[REF_ARG] ?? REF_ARG;
const label = Object.entries(PROJECTS).find(([, v]) => v === ref)?.[0] ?? ref;

const SQL = `
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags   text[]  DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS images jsonb   DEFAULT '[]';
ALTER TABLE orders   ADD COLUMN IF NOT EXISTS status text    DEFAULT 'pending';
ALTER TABLE orders   ADD COLUMN IF NOT EXISTS notes  text;
ALTER TABLE orders   ADD COLUMN IF NOT EXISTS customer_name  text;
ALTER TABLE orders   ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE orders   ADD COLUMN IF NOT EXISTS customer_phone text;
UPDATE orders SET status = 'pending' WHERE status IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
SELECT 'sprint8_admin_cms applied' AS result;
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
  console.log("\nSprint 8 migration complete.");
}

run();
