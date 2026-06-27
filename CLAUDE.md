# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Maxgen** is a B2B e-commerce platform for electrical accessories and ELV (Extra Low Voltage) systems. It is a full-stack Next.js 15 application deployed on Cloudflare Workers via the OpenNext adapter, with Supabase (PostgreSQL) as the database.

Key capabilities:
- Product catalog with categories (switches, MCBs, distribution boards, wiring, cable trays, lighting)
- Verticals/services pages dynamically rendered from database
- RFQ (Request for Quote) system with PDF export and email delivery
- Shopping cart and order management
- PIN-protected admin dashboard (products, services, CMS content, analytics, quotes, customers, partners)
- SEO-optimised: sitemap.xml, robots.txt, per-page metadata, JSON-LD structured data
- Email notifications via Resend API
- Multi-region presence (India, Saudi Arabia, UK, USA)

**Stack:** Next.js 15.5 · React 19 · Supabase · Cloudflare Workers · Tailwind CSS 3.4 · Resend (email)

---

## Commands

```bash
# Development
npm run dev        # Start Next.js dev server at localhost:3000
npm run build      # Production build

# Cloudflare
npm run preview    # Build + run locally in actual Cloudflare Workers runtime (test before deploy)
npm run deploy     # Build + deploy to Cloudflare Workers
npm run cf-typegen # Regenerate Cloudflare environment types from wrangler.jsonc

# Code quality
npm run lint       # Next.js ESLint
```

---

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=https://maxgen.com.sa
RESEND_API_KEY=       # Optional — email alerts are best-effort and never block form submissions
```

---

## Architecture

### Layers

| Layer | Location | Role |
|-------|----------|------|
| Pages | `app/` | Next.js App Router; SSR/ISR; fetch directly from `lib/db.js` at render time |
| DB access | `lib/db.js` | All Supabase reads and writes — single centralised file |
| Mutations | `lib/actions.js` | Server Actions for form submissions and admin mutations; triggers `revalidatePath` |
| Components | `components/` | React client and server components |
| Email | `lib/email.js` | Resend API; always fire-and-forget — never throws to caller |

**Data flow:**

```
User action
  → Server Action (lib/actions.js)
  → DB mutation (lib/db.js)
  → Email alert (lib/email.js, best-effort)
  → revalidatePath

Public reads:
  Page render → lib/db.js → Supabase
```

### Key Files

| File | Purpose |
|------|---------|
| `lib/db.js` | Every database operation (`getProducts`, `getServiceBySlug`, `saveMessage`, `placeOrder`, etc.) |
| `lib/actions.js` | Every Server Action (contact, leads, jobs, orders, all admin mutations) |
| `lib/constants.js` | Product categories, customer list, partner list, career listings, formatting helpers |
| `lib/supabaseClient.js` | Supabase client initialisation |
| `lib/email.js` | Resend email sending logic |
| `lib/imageUtils.js` | Image validation and resizing before storage |
| `lib/imgix.js` | Image optimisation URL helper |
| `components/AdminClient.jsx` | Full admin dashboard UI (PIN-gated) |
| `components/CartContext.jsx` | Client-side shopping cart context (not persisted to DB) |
| `components/CartDrawer.jsx` | Cart UI |
| `app/api/export/[id]/route.js` | PDF quote export endpoint |
| `app/sitemap.js` | Dynamic sitemap |
| `app/robots.js` | robots.txt |

---

## Database Schema

All tables live in Supabase (PostgreSQL) with Row Level Security (public read/write — no user auth system).

| Table | Purpose | Notable Fields |
|-------|---------|---------------|
| `products` | Product catalog | cat, name, spec, price, stock, status, image, brand, featured, applications |
| `services` | Verticals/divisions | slug, division, title, description, detail, image, sort_order |
| `quotes` | RFQ requests | status, contact_name, company, phone, email, items (JSONB), boq_url, admin_note |
| `orders` | Completed orders | items (JSONB), subtotal, vat, grand_total |
| `customers` | Major client list (CMS-managed) | name, sector, note, sort_order |
| `partners` | Partner list (CMS-managed) | name, type, focus |
| `site_content` | Singleton CMS row (id=1) | data (JSONB) — hero, about, contact, branches text |
| `messages` | Contact form submissions | name, phone, email, message |
| `leads` | Email/phone captures | email, phone |
| `applications` | Job applications | role, name, email, phone |

`items` in `quotes` and `orders` are JSONB arrays of `{ id, name, price, quantity }`.

**Migration order:** `supabase/schema.sql` → `supabase/seed.sql` → files in `supabase/migrations/` (run via scripts in `scripts/`).

---

## Routing

```
app/
  page.js                        # Home
  admin/page.js                  # Admin dashboard (PIN-protected)
  shop/page.js                   # Product listing
  shop/[id]/page.js              # Product detail
  verticals/page.js              # Services listing
  verticals/[slug]/page.js       # Service detail
  about/, contact/, career/      # Static content pages
  customers/, partners/          # CMS-driven list pages
  my-quotes/                     # Customer RFQ history
  api/export/[id]/route.js       # PDF quote export
  sitemap.js                     # Dynamic sitemap (products + services)
  robots.js                      # robots.txt
```

---

## Deployment

- **`wrangler.jsonc`** — Cloudflare Workers config: `main: ".open-next/worker.js"`, `nodejs_compat` flag, assets binding, observability enabled
- **`open-next.config.ts`** — OpenNext adapter (default config, no overrides required)
- **`next.config.js`** — Remote image patterns (Unsplash), custom cache headers for `/admin` and `/api/export`
- Deploy via `npm run deploy` or Cloudflare Workers Builds (Git-triggered auto-build)
- Always run `npm run preview` in the Workers runtime before deploying to catch Workers-specific issues

---

## Admin Dashboard

- Route: `/admin`
- PIN hardcoded in `components/AdminClient.jsx` as `ADMIN_PIN = "4490"` — **must be changed before production**
- Tabs: Analytics · Products · Services · Content · Quotes · Customers · Partners · Leads · Messages · Applications · Orders
- Quote workflow: customer submits RFQ → admin views in Quotes tab → updates status → sends quote via email → can upload BOQ file
- Image upload goes through `lib/imageUtils.js` (validation + resizing) before storage

---

## Mandatory Development Workflow

Before starting any task:

1. **Read before writing.** Read the relevant files in `lib/db.js`, `lib/actions.js`, and the affected component before making changes.
2. **Understand the data flow.** Trace the path from UI → Server Action → DB → revalidation before editing any layer.
3. **Check existing utilities.** Check `lib/constants.js`, `lib/imageUtils.js`, `lib/email.js`, and `lib/imgix.js` before adding new utility code — the function may already exist.
4. **Never modify `supabase/schema.sql` directly** for changes after initial setup. Write a new migration file in `supabase/migrations/` and a runner script in `scripts/`.
5. **Test locally first.** Run `npm run dev` for general changes. Run `npm run preview` for anything touching Cloudflare Workers bindings, headers, or edge runtime behaviour.
6. **Lint before finishing.** Run `npm run lint` and resolve all errors before considering a task complete.

---

## Regression Prevention Policy

- **Do not modify `lib/db.js` without checking all callers.** Every function in this file is shared — breaking one call site can affect multiple pages and Server Actions.
- **Do not change Server Action signatures** in `lib/actions.js` without updating every component that calls the action.
- **Do not alter Supabase table column names or types** without a coordinated migration and corresponding update to all `lib/db.js` queries that reference those columns.
- **Do not remove fields from the `site_content` JSONB `data` object** without confirming no page renders them.
- **Cart state is client-only.** `CartContext.jsx` uses React context — do not attempt to persist cart to the database without a full auth system.
- **Email failures must never break form submissions.** All calls in `lib/email.js` are fire-and-forget; keep them wrapped in try/catch.
- **Revalidation is required after every mutation.** Every Server Action that writes to Supabase must call `revalidatePath` on the affected routes.
- After any change to `app/sitemap.js` or `app/robots.js`, verify the output at `/sitemap.xml` and `/robots.txt` locally.

---

## Database Safety Rules

- **Never run raw SQL against the production Supabase instance** without first testing on a local or staging instance.
- **Always write additive migrations.** Add new columns with defaults or as nullable. Never drop or rename columns in a single migration without a transition period.
- **Migration file naming convention:** `supabase/migrations/sprint<N>_<feature>.sql` — e.g. `sprint7_notifications.sql`.
- **Runner scripts** go in `scripts/run-sprint<N>.mjs` and must be idempotent (safe to run twice).
- **Do not change RLS policies** without understanding all tables that will be affected — current policy is public read/write to support the storefront without user accounts.
- **JSONB columns (`items`, `data`):** always validate the shape of data before writing; a malformed JSON write can break the admin dashboard or order display.
- **Never seed production.** `supabase/seed.sql` is for local/staging only.

---

## Deployment Checklist

Before running `npm run deploy`:

- [ ] `ADMIN_PIN` changed from default `"4490"` in `components/AdminClient.jsx`
- [ ] `.env.local` values confirmed and set as Cloudflare Workers environment secrets (not committed to git)
- [ ] `RESEND_API_KEY` set and domain verified with Resend for email delivery
- [ ] `npm run build` passes with no errors
- [ ] `npm run lint` passes with no errors
- [ ] `npm run preview` tested locally in the Workers runtime
- [ ] All Supabase migrations applied to the production database
- [ ] `NEXT_PUBLIC_SITE_URL` set to the correct production domain
- [ ] Sitemap and robots.txt verified at production URL after deploy
- [ ] Admin dashboard tested at `/admin` with the production PIN

---

## Audit Mode

When asked to audit the codebase (security, performance, SEO, or code quality), follow this order:

1. **Security:** Check `ADMIN_PIN` value in `components/AdminClient.jsx`. Verify no secrets in committed files. Check RLS policy coverage in `supabase/schema.sql`.
2. **Data integrity:** Verify all Server Actions in `lib/actions.js` call `revalidatePath` after mutations.
3. **Email resilience:** Verify all `lib/email.js` calls are inside try/catch blocks and failures are only logged, never thrown.
4. **SEO:** Verify `generateMetadata()` is present on all public-facing pages. Check `app/sitemap.js` includes all dynamic routes (products + services). Confirm JSON-LD in `app/layout.js`.
5. **Image handling:** Confirm all image uploads pass through `lib/imageUtils.js` before storage.
6. **Dead code:** Check `lib/constants.js` for unused exports. Check `components/` for components not imported anywhere.
7. **Performance:** Check `next.config.js` cache headers. Confirm ISR or static generation is used where appropriate (product and service pages).

---

## Git Workflow

- **Branch naming:** `feat/<feature>`, `fix/<issue>`, `chore/<task>`, `sprint/<N>-<description>`
- **Commit messages:** Follow the existing convention: `feat(scope): description` — e.g. `feat(quotes): add BOQ upload`, `fix(admin): correct PIN validation`
- **One logical change per commit.** Do not bundle unrelated changes.
- **Never commit `.env.local`** or any file containing Supabase keys, Resend keys, or the admin PIN.
- **Migration files are permanent.** Never edit or delete files in `supabase/migrations/` after they have been applied to any environment.
- **Before pushing:** run `npm run lint` and `npm run build` to confirm the branch is deployable.

---

## Coding Standards

- All database operations belong in `lib/db.js`. Do not write Supabase queries inline in components or pages.
- All form mutations belong in `lib/actions.js` as Server Actions. Do not use API routes for mutations unless there is a specific need (e.g. the PDF export endpoint).
- Client components must be explicitly marked with `"use client"`. Server components fetch data directly from `lib/db.js`.
- Tailwind CSS only — do not introduce a separate CSS file or CSS-in-JS library.
- Do not add new npm dependencies without confirming Cloudflare Workers compatibility (`nodejs_compat` flag is enabled but not all Node APIs are available).
- Keep `lib/constants.js` as the single source of truth for static lists (product categories, regions, careers). Do not hardcode these values in components.
- Email sending must always go through `lib/email.js`. Do not call the Resend SDK directly from actions or components.
- Image processing must always go through `lib/imageUtils.js` before any file is stored.

---

## Testing & Validation Checklist

There is no automated test suite. Manual validation is required for every change:

### After any `lib/db.js` change
- [ ] Verify the affected page renders correctly in `npm run dev`
- [ ] Verify the admin dashboard still loads and displays data correctly at `/admin`
- [ ] Check that no other pages calling the modified function are broken

### After any `lib/actions.js` change
- [ ] Submit the relevant form in the browser and confirm success
- [ ] Confirm the Supabase table received the correct data
- [ ] Confirm `revalidatePath` caused the page to reflect the updated data

### After any admin dashboard change (`components/AdminClient.jsx`)
- [ ] Test all tabs in `/admin` to confirm no regressions
- [ ] Test PIN entry (correct and incorrect)
- [ ] Test image upload flow if image-related code was changed

### After any SEO/metadata change
- [ ] Check page `<title>` and `<meta description>` in browser DevTools
- [ ] Validate `/sitemap.xml` includes expected URLs
- [ ] Validate JSON-LD with Google's Rich Results Test (or browser DevTools)

### After any Cloudflare/deployment config change
- [ ] Run `npm run preview` and confirm the app works in the Workers runtime
- [ ] Check cache headers on `/admin` and `/api/export` routes behave correctly
- [ ] Run `npm run deploy` and smoke-test the production URL

### Before every deploy
- [ ] Run through the [Deployment Checklist](#deployment-checklist) above

---

## Maintenance Notes

- **Sprint history:** Sprint 3 (product catalogue), Sprint 4 (RFQ/quotes + PDF export), Sprint 5 (customer RFQ history + quote status tracking), Sprint 6 (SEO & performance)
- **Admin PIN rotation:** Change `ADMIN_PIN` in `components/AdminClient.jsx` and redeploy. There is no server-side PIN validation — this is enforced client-side only.
- **Adding a new product category:** Update `lib/constants.js` (the category list) — no DB migration needed.
- **Adding a new CMS field:** Add the field to the `data` JSONB in `site_content` via the Supabase dashboard, then update the admin Content tab in `components/AdminClient.jsx` and any page that renders it.
- **Adding a new vertical/service:** Use the admin Services tab — no code change required.

---

*Summary of this file's structure:*
*Project Overview → Commands → Environment Variables → Architecture → Database Schema → Routing → Deployment → Admin Dashboard → Mandatory Development Workflow → Regression Prevention Policy → Database Safety Rules → Deployment Checklist → Audit Mode → Git Workflow → Coding Standards → Testing & Validation Checklist → Maintenance Notes*
