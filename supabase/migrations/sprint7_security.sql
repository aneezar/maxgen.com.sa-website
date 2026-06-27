-- ============================================================
-- Sprint 7 — Security: remove public write access from
-- admin-controlled tables.
--
-- After running this migration, all writes to these tables
-- MUST come from the Supabase service role key (used in
-- server-side code via lib/supabaseServer.js).
-- Customer-submitted tables (messages, leads, applications,
-- orders, quotes insert) retain their public insert policies.
--
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- Products — admin-only writes
drop policy if exists "public write products" on products;

-- Services — admin-only writes
drop policy if exists "public write services" on services;

-- Customers — admin-only writes
drop policy if exists "public write customers" on customers;

-- Partners — admin-only writes
drop policy if exists "public write partners" on partners;

-- Site content — admin-only writes
drop policy if exists "public write content" on site_content;

-- Quotes status/note updates — admin-only (insert remains public for RFQ submissions)
drop policy if exists "public update quotes" on quotes;
