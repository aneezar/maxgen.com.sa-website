// Runner for sprint7 migrations (security, indexes, product updated_at).
// Usage: node scripts/run-sprint7.mjs <sbp_token> [dev|prod]
//
// Idempotent — safe to run twice (uses IF EXISTS / IF NOT EXISTS throughout).

const TOKEN = process.argv[2];
const REF_ARG = process.argv[3] ?? "prod";

const PROJECTS = {
  dev:  "dmggdqlkbigyttojisve",
  prod: "rityquzzjwmueveukipg",
};

if (!TOKEN || !TOKEN.startsWith("sbp_")) {
  console.error("Usage: node scripts/run-sprint7.mjs <sbp_token> [dev|prod]");
  console.error("  Get your token at: https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}

const ref = PROJECTS[REF_ARG] ?? REF_ARG;
const label = Object.entries(PROJECTS).find(([, v]) => v === ref)?.[0] ?? ref;

const SECURITY_SQL = `
drop policy if exists "public write products"      on products;
drop policy if exists "public write services"      on services;
drop policy if exists "public write customers"     on customers;
drop policy if exists "public write partners"      on partners;
drop policy if exists "public write content"       on site_content;
drop policy if exists "public update quotes"       on quotes;
drop policy if exists "public read messages"       on messages;
drop policy if exists "public read leads"          on leads;
drop policy if exists "public read applications"   on applications;
drop policy if exists "public read orders"         on orders;
SELECT 'security policies applied' AS result;
`.trim();

const INDEXES_SQL = `
CREATE INDEX IF NOT EXISTS idx_products_cat    ON products(cat);
CREATE INDEX IF NOT EXISTS idx_products_brand  ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_quotes_status   ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_email    ON quotes(email);
SELECT 'indexes created' AS result;
`.trim();

const UPDATED_AT_SQL = `
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
UPDATE products SET updated_at = created_at WHERE updated_at IS NULL;
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
SELECT 'updated_at trigger created' AS result;
`.trim();

async function runSql(label, sql) {
  console.log(`\nRunning: ${label}...`);
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  const body = await res.json();
  if (!res.ok) {
    console.error(`  FAILED:`, JSON.stringify(body, null, 2));
    process.exit(1);
  }
  const rows = Array.isArray(body) ? body : [];
  const result = rows[0]?.result ?? "ok";
  console.log(`  ✓ ${result}`);
}

console.log(`Target: ${label} (${ref})`);
await runSql("sprint7_security", SECURITY_SQL);
await runSql("sprint7_indexes", INDEXES_SQL);
await runSql("sprint7_product_updated_at", UPDATED_AT_SQL);
console.log("\nAll sprint7 migrations complete.");
