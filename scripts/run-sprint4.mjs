const TOKEN = process.argv[2];
const REF   = process.argv[3];

const PROJECTS = {
  dev:  "dmggdqlkbigyttojisve",
  prod: "rityquzzjwmueveukipg",
};

if (!TOKEN || !TOKEN.startsWith("sbp_") || TOKEN.length < 10) {
  console.error("Usage: node scripts/run-sprint4.mjs <sbp_token> [dev|prod]");
  process.exit(1);
}

const ref   = REF ? (PROJECTS[REF] ?? REF) : PROJECTS.dev;
const label = Object.entries(PROJECTS).find(([, v]) => v === ref)?.[0] ?? ref;

const SQL = `
create table if not exists quotes (
  id            text primary key,
  status        text not null default 'pending',
  contact_name  text not null,
  company       text,
  phone         text not null,
  email         text,
  project_ref   text,
  delivery_date date,
  notes         text,
  items         jsonb not null,
  subtotal      numeric not null,
  boq_url       text,
  admin_note    text,
  quoted_at     timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table quotes enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'quotes' and policyname = 'public insert quotes') then
    create policy "public insert quotes" on quotes for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'quotes' and policyname = 'public read quotes') then
    create policy "public read quotes" on quotes for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'quotes' and policyname = 'public update quotes') then
    create policy "public update quotes" on quotes for update using (true);
  end if;
end $$;
select table_name, column_name, data_type
from information_schema.columns
where table_name = 'quotes'
order by ordinal_position;
`.trim();

console.log(`Targeting: ${label} (${ref})`);

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: SQL }),
});

const body = await res.json();

if (!res.ok) {
  console.error("API error:", JSON.stringify(body, null, 2));
  process.exit(1);
}

const rows = Array.isArray(body) ? body : [];
if (rows.length > 0) {
  console.log("✓ quotes table columns:");
  rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));
} else {
  console.log("Done.", JSON.stringify(body));
}
