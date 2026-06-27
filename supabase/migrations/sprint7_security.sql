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

-- ----------------------------------------------------------------
-- Lock down reads on internal-only tables.
-- These are never queried by the browser — only by server-side
-- code via supabaseAdmin. The corresponding lib/db.js functions
-- (getMessages, getLeads, getApplications, getOrders) have been
-- switched to use supabaseAdmin so they continue to work.
-- quotes read is intentionally kept — /my-quotes needs it.
-- ----------------------------------------------------------------
drop policy if exists "public read messages"     on messages;
drop policy if exists "public read leads"        on leads;
drop policy if exists "public read applications" on applications;
drop policy if exists "public read orders"       on orders;
