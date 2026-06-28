# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Maxgen** is a B2B e-commerce platform for electrical accessories and ELV (Extra Low Voltage) systems. Full-stack Next.js 15 app deployed on Cloudflare Workers via the OpenNext adapter, with Supabase (PostgreSQL) as the database.

**Stack:** Next.js 15.5 · React 19 · Supabase · Cloudflare Workers · Tailwind CSS 3.4 · Resend (email) · lucide-react (icons)

---

## Commands

```bash
npm run dev        # Next.js dev server at localhost:3000
npm run build      # Production build (Next.js only)
npm run lint       # ESLint (next/core-web-vitals)
npm run preview    # Build + run in actual Cloudflare Workers runtime (use before deploy)
npm run deploy     # Build + deploy to Cloudflare Workers
npm run cf-typegen # Regenerate Cloudflare env types → cloudflare-env.d.ts
```

There is no automated test suite. All validation is manual.

---

## Environment Variables

`.env.local` (never commit):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Server-only — never prefix NEXT_PUBLIC_
NEXT_PUBLIC_ADMIN_PIN=            # Admin dashboard PIN
NEXT_PUBLIC_SITE_URL=https://maxgen.com.sa
NEXT_PUBLIC_IMGIX_DOMAIN=         # Optional — imgix subdomain for image optimisation
RESEND_API_KEY=                   # Optional — email alerts are fire-and-forget
ALERT_FROM_EMAIL=                 # Optional — defaults to Resend test sender
```

---

## Architecture

### Layer responsibilities

| Layer | File(s) | Rule |
|-------|---------|------|
| DB reads/writes | `lib/db.js` | All Supabase queries live here — nowhere else |
| Mutations | `lib/actions.js` | All Server Actions; always call `revalidatePath` after writes |
| Email | `lib/email.js` | All Resend calls; always fire-and-forget (`.catch()` only, never `await` in actions) |
| Auth | `lib/auth.js` | Single export `ADMIN_PIN` read from `NEXT_PUBLIC_ADMIN_PIN` env |
| Supabase clients | `lib/supabaseClient.js` (anon) · `lib/supabaseServer.js` (service role) | Public reads use `supabase`; all admin writes use `supabaseAdmin` |
| Image processing | `lib/imageUtils.js` | Client-side Canvas resize/validate — runs in browser, not server |
| Image URLs | `lib/imgix.js` | `imgixUrl(src, { w, h, q, fit })` — returns imgix URL if domain set, else original |
| Static data | `lib/constants.js` | `CATEGORIES`, `CLIENTS`, `PARTNERS`, `CAREERS`, `fmt()`, `parseBranches()`, `SITE_URL`, `COMPANY_EMAIL` |
| Components | `components/` | Mix of client (`"use client"`) and server components |
| Admin | `components/AdminClient.jsx` (auth + tab routing) · `components/admin/*.jsx` (tab panels) · `components/QuoteAdminPanel.jsx` · `components/AnalyticsTab.jsx` | |

### Two Supabase clients — critical distinction

- `lib/supabaseClient.js` exports `supabase` (anon key) — used for public reads and customer-submitted inserts (quotes, messages, leads, applications, orders).
- `lib/supabaseServer.js` exports `supabaseAdmin` (service role key) — used exclusively for admin writes (products, services, customers, partners, site_content, quote status updates) and admin reads (orders, messages, leads, applications).
- **Never import `supabaseAdmin` into a client component.** It must only be called from Server Actions or server-side `lib/db.js` functions.

### Data flow

```
Public form → Server Action (lib/actions.js)
              → lib/db.js (supabase anon insert)
              → lib/email.js fire-and-forget alert
              → revalidatePath

Admin mutation → Server Action
               → lib/db.js (supabaseAdmin write)
               → revalidatePath on affected routes

Public page render → lib/db.js (supabase anon read) → Supabase
Admin page render  → lib/db.js (supabaseAdmin read)  → Supabase
```

### Image upload flow

Images are resized and validated **client-side** in the browser (Canvas API in `lib/imageUtils.js`) before being stored as base64 data URLs or uploaded to Supabase Storage. `sharp` and server-side image processing cannot be used — Cloudflare Workers does not support native binaries.

### Admin dashboard

- Route: `/admin` — PIN-gated, no-store cache header set in `next.config.js`
- `AdminClient.jsx`: checks PIN against `ADMIN_PIN`, renders tab bar and delegates to tab components
- Tab components in `components/admin/`: `ProductsTab`, `VerticalsTab`, `ContentTab`, `OrdersTab`, `LeadsTab`, `MessagesTab`, `ApplicationsTab`, `ImageUploadField`
- `AnalyticsTab.jsx` and `QuoteAdminPanel.jsx` live directly in `components/`
- **Customers and Partners** have DB functions and Server Actions but no admin tab yet — data appears only in AnalyticsTab KPI counts
- Quote workflow: customer submits RFQ → admin sets status (pending → reviewed → quoted → accepted → rejected) → status change to "quoted" auto-triggers `notifyCustomerEmail` → admin can also manually trigger `adminSendQuoteEmail`

---

## Database Schema

All tables in Supabase PostgreSQL with RLS enabled.

| Table | Key columns | Notes |
|-------|-------------|-------|
| `products` | `id` (text PK), `cat`, `name`, `spec`, `price`, `stock`, `status`, `image`, `brand`, `featured`, `applications`, `created_at`, `updated_at` | `updated_at` trigger added in sprint7_product_updated_at.sql |
| `services` | `slug` (text PK), `division`, `title`, `description`, `detail`, `image`, `sort_order` | |
| `quotes` | `id` (text, `MG-RFQ-*`), `status`, `contact_name`, `company`, `phone`, `email`, `items` (JSONB), `boq_url`, `admin_note`, `subtotal` | `items` shape: `[{ id, name, price, qty, brand? }]` |
| `orders` | `id`, `items` (JSONB), `subtotal`, `vat`, `grand_total`, `placed_at` | |
| `customers` | `id` (uuid), `name`, `sector`, `note`, `sort_order` | |
| `partners` | `id` (uuid), `name`, `type`, `focus`, `sort_order` | |
| `site_content` | `id=1`, `data` (JSONB) | Singleton CMS row; JSONB keys: `heroTag`, `heroTitle`, `heroBody`, `contactAddress`, `contactPhone`, plus branch/about fields |
| `messages` | `id`, `name`, `phone`, `email`, `message`, `submitted_at` | |
| `leads` | `id`, `email`, `phone`, `captured_at` | |
| `applications` | `id`, `role`, `name`, `email`, `phone`, `applied_at` | |

### RLS posture (after sprint7_security.sql)

- **Public SELECT**: `products`, `services`, `customers`, `partners`, `site_content`, `quotes` (needed by `/my-quotes`)
- **Public INSERT only**: `messages`, `leads`, `applications`, `orders`, `quotes`
- **No public writes**: `products`, `services`, `customers`, `partners`, `site_content`, quote status updates — service role key required
- **No public SELECT**: `messages`, `leads`, `applications`, `orders`

### Migration conventions

- New migrations → `supabase/migrations/sprint<N>_<feature>.sql` (never edit after applying)
- Runner scripts → `scripts/run-sprint<N>.mjs` (must be idempotent: `IF EXISTS` / `IF NOT EXISTS`)
- `supabase/schema.sql` is the initial baseline only — do not modify for post-setup changes
- `supabase/seed.sql` is for local/staging only — never run on production

---

## Routing

```
app/
  page.js                     # Home (ISR 1h) — fetchs featured products + site_content
  layout.js                   # Root layout: fonts, OG metadata, Org JSON-LD, SiteChrome
  admin/page.js               # Admin (no-store) — fetches all tables server-side
  shop/page.js                # Product listing — server-side filtered via URL params
  shop/[id]/page.js           # Product detail
  shop/loading.js             # Skeleton loader
  verticals/page.js           # Services listing
  verticals/[slug]/page.js    # Service detail
  my-quotes/page.js           # Customer RFQ history (localStorage + live status fetch)
  my-quotes/[id]/page.js      # Quote detail with status timeline
  quote/[id]/print/page.js    # Printable/PDF quote page
  api/export/[id]/route.js    # CSV quote export (no-store)
  sitemap.js                  # Dynamic — products (updated_at) + services + static routes
  robots.js                   # robots.txt
  about/, contact/, career/, customers/, partners/
```

---

## SEO Implementation

- `generateMetadata()` on every public page
- Root layout has: OG tags, Twitter card, Organization JSON-LD
- `app/sitemap.js` includes static routes + all products (using `updated_at`) + services
- `SITE_URL` from `lib/constants.js` is the canonical base
- Product and service pages use `alternates: { canonical: ... }` for self-referential canonical URLs
- `metadataBase` set in root layout so relative OG image URLs resolve correctly
- `next.config.js` accepts imgix domain in `remotePatterns` via `NEXT_PUBLIC_IMGIX_DOMAIN`

---

## Email (Resend)

- All email goes through `lib/email.js` → `sendAlertEmail()` → Resend HTTPS API
- Works on Cloudflare Workers (V8 isolates have no TCP, so traditional SMTP is impossible)
- One automatic retry on 5xx or 429 with 1-second delay
- Functions: `alertLeadEmail`, `alertMessageEmail`, `alertApplicationEmail`, `alertRFQEmail`, `notifyCustomerEmail` (auto on status=quoted), `sendQuoteEmailToCustomer` (manual trigger)
- No `RESEND_API_KEY` → silent no-op (logs a warning)

---

## Cloudflare Workers Constraints

- No native Node.js binaries (`sharp`, `canvas`, bcrypt with native addons, etc.)
- `nodejs_compat` flag is enabled — most Node built-ins work via polyfills, but native addons do not
- Run `npm run preview` (OpenNext Cloudflare preview) before `npm run deploy` to catch Workers-specific failures that `npm run build` will not catch
- Secrets go in Cloudflare Workers env (not `.env` files): `wrangler secret put SECRET_NAME`
- Custom domains: `maxgen.com.sa` and `www.maxgen.com.sa` configured in `wrangler.jsonc`

---

## Regression Prevention

- **`lib/db.js` is shared** — changing a function signature breaks every caller silently. Check all usages before editing.
- **`revalidatePath` is mandatory** after every Server Action write — missing it causes stale pages.
- **Never pass `supabaseAdmin` to a client component** — it would expose the service role key in the browser bundle.
- **`lib/constants.js` is the single source of truth** for `CATEGORIES`, `SITE_URL`, `COMPANY_EMAIL` — do not duplicate these values in components.
- **Email calls must never throw to callers** — always `.catch(err => console.error(...))` and never `await` in a way that blocks the response.
- **`site_content.data` JSONB keys** — removing a key breaks any page that renders it. Always add keys; never remove without confirming no page reads them.
- **`CartContext`, `CartDrawer`, `AddToCartButton`** — deleted in Sprint 7. The quote system (`QuoteContext`, `QuoteBasketDrawer`) is the correct replacement.

---

## Sprint History

| Sprint | Theme |
|--------|-------|
| 1–2 | Site scaffold + B2B landing page |
| 3 | Product catalogue: server-side filtering, QuickViewModal, brand/featured/applications columns |
| 4 | RFQ portal: QuoteContext, BOQ upload, Quotes admin tab, email alert |
| 5 | Customer RFQ history: `/my-quotes`, QuoteStatusTimeline, `notifyCustomerEmail` |
| 6 | SEO & performance: metadata, sitemap, JSON-LD, ISR, AnalyticsTab, PDF quote export |
| 7 | Security hardening: service-role client, RLS lockdown, AdminClient split to `components/admin/`, DB indexes, `updated_at` trigger |

**Pending after Sprint 7:** `scripts/run-sprint7.mjs` is untracked (not committed). Sprint 7 DB migrations must be run against production via this script before the RLS security changes take effect.

---

## Deployment Checklist

Before `npm run deploy`:

- [ ] `NEXT_PUBLIC_ADMIN_PIN` set as Cloudflare Workers secret (not the default sentinel)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set as Cloudflare Workers secret
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run build` passes with zero errors
- [ ] `npm run preview` tested in Workers runtime
- [ ] Sprint migrations applied to production Supabase
- [ ] `RESEND_API_KEY` configured and `maxgen.com.sa` verified in Resend dashboard

---

## Coding Standards

- All Supabase queries belong in `lib/db.js`. No inline queries in components or pages.
- All form mutations are Server Actions in `lib/actions.js`. API routes only for special cases (CSV export, PDF).
- Client components must be explicitly marked `"use client"`. Server components fetch from `lib/db.js` directly.
- Tailwind CSS only — no additional CSS files or CSS-in-JS.
- No new npm dependencies without confirming Cloudflare Workers compatibility.
- Image processing must go through `lib/imageUtils.js` (client-side Canvas) before storage.
