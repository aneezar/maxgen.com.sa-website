-- ============================================================
-- MAXGEN — Supabase schema (Next.js / SEO build)
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- Products catalog
create table if not exists products (
  id text primary key,
  cat text not null,
  name text not null,
  spec text,
  price numeric not null,
  stock integer not null default 0,
  status text default 'active',
  image text,
  created_at timestamptz default now()
);

-- Services / Group Verticals (replaces the JSON blob used in the artifact version
-- with real rows, each one becomes its own server-rendered, SEO-indexable page)
create table if not exists services (
  slug text primary key,
  division text not null,
  category text,
  title text not null,
  description text not null,
  detail text,
  image text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Major Customers (shown on /customers, dynamically editable from that page)
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text,
  note text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Partners (shown on /partners, dynamically editable from that page)
create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  focus text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Site content (CMS text: hero, about, contact, branches) — single row, id = 1
create table if not exists site_content (
  id int primary key default 1,
  data jsonb not null,
  updated_at timestamptz default now()
);
insert into site_content (id, data) values (1, '{}') on conflict (id) do nothing;

-- Orders
create table if not exists orders (
  id text primary key,
  items jsonb not null,
  subtotal numeric not null,
  vat numeric not null,
  grand_total numeric not null,
  placed_at timestamptz default now()
);

-- Contact form submissions
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  message text,
  submitted_at timestamptz default now()
);

-- Leads (email/phone capture)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  captured_at timestamptz default now()
);

-- Job applications
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  role text,
  name text,
  email text,
  phone text,
  applied_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- Open policies for a small storefront without user accounts.
-- Tighten later if you add authenticated staff accounts instead
-- of the PIN-gated admin panel.
-- ============================================================

alter table products enable row level security;
alter table services enable row level security;
alter table customers enable row level security;
alter table partners enable row level security;
alter table site_content enable row level security;
alter table orders enable row level security;
alter table messages enable row level security;
alter table leads enable row level security;
alter table applications enable row level security;

create policy "public read products" on products for select using (true);
create policy "public write products" on products for all using (true) with check (true);

create policy "public read services" on services for select using (true);
create policy "public write services" on services for all using (true) with check (true);

create policy "public read customers" on customers for select using (true);
create policy "public write customers" on customers for all using (true) with check (true);

create policy "public read partners" on partners for select using (true);
create policy "public write partners" on partners for all using (true) with check (true);

create policy "public read content" on site_content for select using (true);
create policy "public write content" on site_content for all using (true) with check (true);

create policy "public insert orders" on orders for insert with check (true);
create policy "public read orders" on orders for select using (true);

create policy "public insert messages" on messages for insert with check (true);
create policy "public read messages" on messages for select using (true);

create policy "public insert leads" on leads for insert with check (true);
create policy "public read leads" on leads for select using (true);

create policy "public insert applications" on applications for insert with check (true);
create policy "public read applications" on applications for select using (true);
