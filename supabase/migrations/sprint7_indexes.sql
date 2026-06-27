-- ============================================================
-- Sprint 7 — Performance: indexes on frequently filtered columns
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- Products: filtered by category, brand, and stock status on every shop page load
CREATE INDEX IF NOT EXISTS idx_products_cat    ON products(cat);
CREATE INDEX IF NOT EXISTS idx_products_brand  ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Quotes: filtered by status in the admin panel; looked up by email for customer history
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_email  ON quotes(email);

-- Note: services.slug is already a PRIMARY KEY and therefore implicitly indexed.
