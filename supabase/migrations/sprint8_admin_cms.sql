-- ============================================================
-- Sprint 8 — Admin CMS enhancements
--
-- 1. products: add tags (text[]) and images (jsonb gallery)
-- 2. orders:   add status workflow, notes, customer contact fields
--
-- Idempotent — safe to run twice (IF NOT EXISTS / IF EXISTS).
-- ============================================================

-- Products: tags (e.g. {"fire-rated","din-rail"})
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Products: additional image gallery URLs beyond the primary image
ALTER TABLE products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]';

-- Orders: workflow status
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Orders: admin notes / tracking reference
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes text;

-- Orders: customer contact (for notification on status change)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone text;

-- Backfill existing orders to pending status
UPDATE orders SET status = 'pending' WHERE status IS NULL;

-- Index for order status filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

SELECT 'sprint8_admin_cms applied' AS result;
