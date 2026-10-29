# BuildLab 60

A growth campaign web app promoting the free workshop "Build Your First AI Project in 60 Minutes."

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Demo mode

Demo mode is enabled by default (see src/lib/config.ts). A banner indicates demo data. No real registrations, attendance, or winners are claimed.

## Configure Supabase

1. Create a Supabase project.
2. Run supabase/migrations/0001_init.sql.
3. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.
4. Replace src/lib/supabase.ts with a createClient implementation.
5. Implement RLS policies restricting privileged writes to server-side/admin.

## Configure workshop

Use the Admin dashboard (/admin, sign in as demo admin) Config tab to set workshop date, trainer, deadlines, prizes approval, demo mode.

## Create first admin

Add your email to adminEmails via the config tab, or sign in with an email listed there. In demo mode, use "Sign in as demo admin".

## Deploy

Build and deploy the dist/ folder to any static host (Vercel, Netlify, Cloudflare Pages).
