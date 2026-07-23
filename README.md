# SafeWater — Smart Water Meter System

IoT + cloud water metering platform: React/TypeScript customer & admin portals backed by Supabase (Postgres, Auth, Realtime), with ESP32 smart meters reporting readings over HTTPS.

## Structure

- `frontend/` — React 19 + TypeScript + Vite + Tailwind + shadcn/ui app (customer portal, admin portal, auth)
- `supabase/` — Postgres migrations, RLS policies, and (later) Edge Functions
- `firmware/` — ESP32 firmware (not yet implemented — see master spec)
- `docs/` — project documentation

## Status

Phase 1 in progress: project scaffold, database schema + RLS, authentication, and the customer home page. Billing/payments, admin dashboard, valve control, and ESP32 firmware are later phases.

## Local development

```bash
cd frontend
npm install
cp .env.example .env.local   # fill in Supabase URL + anon key
npm run dev
```

## Supabase

Project ref: `ueeskinlxggnxqnymiqg` (`smart water meter`, eu-west-1).

```bash
cd supabase
npx supabase link --project-ref ueeskinlxggnxqnymiqg
npx supabase db push
```
