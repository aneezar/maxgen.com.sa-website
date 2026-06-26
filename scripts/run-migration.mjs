const TOKEN = process.argv[2];
const REF   = process.argv[3]; // optional: override project ref

const PROJECTS = {
  dev:  "dmggdqlkbigyttojisve",
  prod: "rityquzzjwmueveukipg",
};

if (!TOKEN || !TOKEN.startsWith("sbp_") || TOKEN.length < 10) {
  console.error("Usage: node scripts/run-migration.mjs <sbp_token> [dev|prod|<ref>]");
  console.error("  dev  -> dmggdqlkbigyttojisve");
  console.error("  prod -> rityquzzjwmueveukipg");
  process.exit(1);
}

const ref = REF ? (PROJECTS[REF] ?? REF) : PROJECTS.dev;
const label = Object.entries(PROJECTS).find(([,v]) => v === ref)?.[0] ?? ref;

// Schema-only migration (safe for any environment)
const SCHEMA_SQL = `
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand        text    DEFAULT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured     boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS applications text    DEFAULT NULL;
SELECT column_name FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position;
`.trim();

// Seed data — only applied to dev (hardcoded SKUs from the dev seed)
const SEED_SQL = `
UPDATE products SET brand = 'Legrand'            WHERE id IN ('MG-SW-216M','MG-SW-SOC6','MG-SW-DIM1','MG-SW-USB2','MG-WD-CONN','MG-WD-CT16','MG-WD-GLBOX','MG-WD-TERM');
UPDATE products SET brand = 'Schneider Electric' WHERE id IN ('MG-MCB-C32','MG-MCB-RCCB','MG-MCB-ISO','MG-MCB-SPD','MG-DB-4WSP','MG-DB-8WSP','MG-DB-12WTP','MG-DB-MET');
UPDATE products SET brand = 'Panduit'            WHERE id IN ('MG-CT-50P','MG-CT-100T','MG-CT-LADD');
UPDATE products SET brand = 'Maxgen'             WHERE id IN ('MG-LT-LEDDR','MG-LT-PIRSEN','MG-LT-EMRG');
UPDATE products SET featured = true              WHERE id IN ('MG-SW-SOC6','MG-MCB-C32','MG-MCB-RCCB','MG-DB-8WSP','MG-CT-LADD','MG-LT-EMRG');
`.trim();

const sql = ref === PROJECTS.dev ? `${SCHEMA_SQL}\n${SEED_SQL}` : SCHEMA_SQL;

console.log(`Targeting: ${label} (${ref})`);

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});

const body = await res.json();

if (!res.ok) {
  console.error("API error:", JSON.stringify(body, null, 2));
  process.exit(1);
}

// Last statement is the SELECT — shows final column list
const rows = Array.isArray(body) ? body : [];
console.log("Done. Products columns now:", rows.map(r => r.column_name).join(", "));
