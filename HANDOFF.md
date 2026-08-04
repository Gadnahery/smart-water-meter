# SafeWater — progress so far / what's left

## Root causes found (confirmed by reading your actual schema, edge function, and frontend code)

1. **No usage aggregation.** `meter_readings` insert fine, but NOTHING ever
   rolled them into `daily_usage` / `monthly_usage` — which is what every
   chart, the Home/Usage pages, admin Consumption, admin Dashboard, and
   bill generation actually read from. That's why everything showed "No
   usage data yet" even with a reading in the DB.
2. **Bills never appeared / stuck at 0.** The bill trigger only fired on
   the very first `monthly_usage` insert and used `ON CONFLICT DO
   NOTHING` — so with #1 broken, it never ran at all, and even fixed, it
   wouldn't update live as usage grew during the month.
3. **"Online" wasn't real.** `smart_meters.status` gets set to `'online'`
   on every reading/heartbeat but is NEVER set back to `'offline'` when a
   device goes quiet. So once a device talked to Supabase once, it shows
   "Online" forever, disconnected or not.
4. **No realtime on the tables that matter.** `daily_usage`,
   `monthly_usage`, `bills` weren't in the Supabase Realtime publication
   and nothing subscribed to them, so even fixed data wouldn't push to
   the browser live.
5. Demo/seed rows in `meter_readings`/etc. needed clearing for a clean
   real-data baseline.

## What's already done (in the attached zip)

**`supabase/migrations/20260804000001_realtime_usage_and_billing.sql`**
(also attached standalone) — new trigger `apply_reading_to_usage()` that
diffs each new cumulative reading against the previous one for that
meter and upserts the delta into `daily_usage` + `monthly_usage` in real
time; rewrote the bill trigger to fire on insert **or** update and keep
a `pending` bill's numbers live; added `daily_usage`/`monthly_usage`/
`bills` to the realtime publication.

**`supabase/migrations/20260804000002_reset_demo_data.sql`** (also
attached standalone) — truncates all readings/usage/bills/alerts/logs,
resets every meter to `offline` / `last_seen = null`. Customers, meter
registrations, and system settings are untouched.

**Frontend (already edited in the zip):**
- `frontend/src/lib/meterStatus.ts` (new) — `isMeterOnline(lastSeen)`,
  online = last_seen within 150s (2.5× the firmware's 60s heartbeat).
- `services/admin.ts` — admin counts now derive active/offline from
  `last_seen`, not the stale `status` column.
- `pages/customer/Home.tsx`, `pages/admin/Meters.tsx` — online/offline
  badge now derived live from `last_seen` instead of the stored status.
- `hooks/useMeter.ts`, `hooks/useAdminMeters.ts`, `hooks/useAdminDashboard.ts`
  — added `refetchInterval: 30_000` so a device going quiet flips to
  "Offline" within ~30s even with no new row to trigger a realtime push.
- Added `useRealtimeInvalidate` subscriptions for `daily_usage`,
  `monthly_usage`, and `bills` on: `Home.tsx`, `Usage.tsx` (customer),
  `Bills.tsx` (customer), `Dashboard.tsx`, `Consumption.tsx`, `Billing.tsx`
  (admin) — so charts/bills update live with no manual refresh.

Run order once you're in VS Code:
```bash
cd supabase
npx supabase link --project-ref ueeskinlxggnxqnymiqg
npx supabase db push   # applies both new migrations
cd ../frontend && npm install && npm run dev
```

## Still to do (not done yet — ran out of turn budget)

1. **Firmware → Arduino IDE `.ino`.** Your firmware is currently a
   PlatformIO project (`firmware/src/*.cpp/.h` + `platformio.ini`). It's
   functionally solid (cumulative litres persisted in NVS, real
   flow-sensor interrupt counting, offline buffering, LCD/LEDs, valve
   command polling) but uploads on a flat 60s timer — need to change to
   upload on **whichever comes first: ~1L accumulated or ~15s elapsed**
   so the dashboard gets small, frequent increments instead of one big
   jump per minute. Then repackage as an Arduino-IDE sketch folder
   (`.ino` + tabs — Arduino IDE compiles all `.cpp`/`.h` in the sketch
   folder same as PlatformIO's `src/`, so this is mostly a rename +
   folder restructure, not a rewrite).
2. **Master `.md` spec for Copilot** — a single file with the "why" +
   exact diffs for every change above, written so you can paste it into
   VS Code and have Copilot apply/verify each piece, plus a test
   checklist (flash firmware → confirm `meter_readings` grows → confirm
   `daily_usage`/`monthly_usage` grow → confirm bill's `pending` total
   increases → confirm Home/Usage/Consumption/Dashboard update without
   refresh → confirm meter flips to Offline ~150s after power-off).
3. Double-check `npm run build` / `tsc` cleanly compiles the edited
   frontend (install was still running in the sandbox when the turn
   ended — worth running yourself first).

Ping me and I'll finish the firmware `.ino` + the full MD spec next.
