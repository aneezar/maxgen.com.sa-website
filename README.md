# Maxgen — Next.js (SEO-Optimized) Build for Cloudflare

This is a full rebuild of the Maxgen site as a **server-rendered Next.js application**,
wired to **Supabase** as a real shared database, and configured to deploy on
**Cloudflare Workers** via the official OpenNext adapter.

Every page renders its actual content (products, services, prices) into the HTML
*before* JavaScript runs — that's what makes it indexable by search engines, unlike
the earlier single-page React version.

**This entire build was tested end-to-end before being handed to you** — `npm install`,
`next build`, and the actual `opennextjs-cloudflare build` (the real Cloudflare transform)
all ran successfully against this exact codebase.

---

## A note on what changed to make this Cloudflare-ready

Cloudflare's Next.js adapter (`@opennextjs/cloudflare`) currently requires **Next.js 15.5.18+
or 16.2.6+** — it no longer supports Next.js 14. So this build runs on:
- Next.js 15.5.19
- React 19
- `lucide-react` 1.21.0 (the older 0.x line doesn't support React 19)

Good news: Cloudflare's adapter **fully supports Server Actions**, App Router, SSR, ISR,
and Route Handlers — so nothing about how this site works had to be compromised to run
on Cloudflare instead of Vercel.

---

## STEP 1 — Supabase (database)

1. Go to https://supabase.com → **New Project** (free tier is fine).
2. Open **SQL Editor** → run `supabase/schema.sql` (creates all tables + permissions).
3. Then run `supabase/seed.sql` (populates products, services, and site content —
   safe to re-run, it upserts rather than duplicates).
4. Go to **Project Settings → API** and copy the **Project URL** and **anon public** key.

## STEP 2 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial Maxgen Next.js site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/maxgen-site.git
git push -u origin main
```

## STEP 3 — Connect Cloudflare to your GitHub repo (Workers Builds)

1. Go to the Cloudflare dashboard → **Workers & Pages** → **Create application** →
   **Workers** → **Import a Git repository**.
2. Authorize Cloudflare's GitHub integration and select your `maxgen-site` repo.
3. Cloudflare will detect the `wrangler.jsonc` in this project automatically.
4. **Before the first build**, go to the project's **Settings → Build → Variables and
   secrets** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon public key
   - `NEXT_PUBLIC_SITE_URL` → your real domain, e.g. `https://maxgen.com.sa`

   This step matters: Cloudflare's build needs these as **build-time variables**
   (not just runtime secrets) because Next.js inlines `NEXT_PUBLIC_...` values into
   the build output.
5. Set the build command to: `npm run deploy` (this runs `opennextjs-cloudflare build`
   then deploys) — or use `npm run build` if you only want Cloudflare to build without
   auto-deploying, depending on how you want the pipeline structured. For most cases,
   leave the deploy command as configured in `package.json`.
6. Trigger the first deployment. Cloudflare gives you a live URL on
   `*.workers.dev` immediately.

From this point on, every `git push` to your main branch triggers an automatic
rebuild and redeploy — the same convenience Cloudflare Pages used to offer, now for
a fully server-rendered Next.js app via Workers.

## STEP 4 — Point your domain (STC) at it

1. In the Cloudflare dashboard, open your Worker project → **Settings → Domains &
   Routes** → **Add Custom Domain** → enter `maxgen.com.sa`.
2. If your domain's DNS is already on Cloudflare, this is close to instant.
3. If your domain is still managed at STC (not yet using Cloudflare DNS), Cloudflare
   will show you the DNS records to add — log into your STC domain panel's DNS
   management and add them there instead.

---

## Local development & manual deployment (alternative to Workers Builds)

If you'd rather deploy manually from your own machine instead of connecting GitHub:

```bash
npm install
cp .env.example .env.local
# paste your Supabase URL + anon key into .env.local

npm run dev          # local dev server at localhost:3000

npm run preview      # build + run locally in the actual Workers runtime (most accurate test)

npm run deploy       # build + deploy to Cloudflare directly
```

The first time you run `npm run deploy`, Wrangler will prompt you to log into your
Cloudflare account in the browser.

---

## Before going live

- **Change the Admin PIN** — currently `4490`, hardcoded in `components/AdminClient.jsx`
  (search for `ADMIN_PIN`). Change it and redeploy before this is public.
- **Fill in real branch details** — India, UK, and USA addresses/phones are placeholders
  in `supabase/seed.sql` — edit them via Admin → Content once live, or update the SQL
  before seeding.
- **Set `NEXT_PUBLIC_SITE_URL`** to your real domain — this drives the sitemap, canonical
  tags, and Open Graph URLs.

## What's SEO-specific in this build

- `app/sitemap.js` — auto-generates `sitemap.xml`, including every product and service
- `app/robots.js` — generates `robots.txt`, disallows `/admin`
- Per-page `generateMetadata` — every product and service page gets its own title/description
- JSON-LD structured data: `Organization` (root layout), `Product` (each product page),
  `Service` (each service page), `LocalBusiness` (contact page)
- Real `<h1>`/heading hierarchy, internal links in the footer, canonical URLs

## Project structure

```
app/                  Routes (Home, Shop, Verticals, About, Contact, Career, Admin, etc.)
components/           Shared UI — Nav, Footer, Cart, Admin panel, forms
lib/
  supabaseClient.js   Supabase connection
  db.js               All database reads/writes
  actions.js          Server Actions (form submissions, admin mutations)
  constants.js        Static content that doesn't need a database table
supabase/
  schema.sql          Run first
  seed.sql            Run second
wrangler.jsonc        Cloudflare Workers configuration
open-next.config.ts   OpenNext adapter configuration
```
