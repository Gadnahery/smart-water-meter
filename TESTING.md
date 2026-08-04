# SafeWater testing checklist

## 1) Flash firmware and confirm ingest
- Flash the firmware from the Arduino sketch or PlatformIO project to the ESP32.
- Confirm the device connects to Wi-Fi and boots cleanly.
- Verify that new rows appear in `meter_readings` in Supabase after a live upload.
- Confirm `last_seen` updates and `status` is set to `online` on the meter row.

## 2) Confirm real-time usage aggregation
- With the meter actively flowing, watch `daily_usage` and `monthly_usage` update without a manual refresh.
- Confirm each new reading creates a delta-based increase rather than a full cumulative reset.
- Verify totals rise in near real time as water flows.

## 3) Confirm pending bill updates live
- Ensure a bill for the current billing period exists in `bills` with status `pending`.
- While water is flowing, confirm the pending bill's `consumption` and `total` increase in real time.
- Confirm the bill total reflects the new usage without reloading the page.

## 4) Confirm Supabase Realtime UI updates
- Open the customer Home page and verify the chart values update automatically as new readings arrive.
- Open the customer Usage page and verify the daily/monthly usage charts update live without a refresh.
- Open the admin Dashboard and Consumption pages and confirm totals and charts update live.
- Open the customer Bills page and admin Billing page and confirm pending totals/bill rows update without a manual refresh.

## 5) Confirm offline detection
- Power off the ESP32 or disconnect it from Wi‑Fi.
- Wait ~30–60 seconds and confirm the meter flips to `Offline` in the UI based on `last_seen` recency.
- Reconnect power or Wi‑Fi and confirm the meter is back to `Online` within one heartbeat of reconnecting.

## 6) Final smoke test
- Verify no blank or stale charts remain after fresh data appears.
- Verify the `daily_usage`/`monthly_usage` triggers are writing rows correctly after the DB migration.
- Verify bill data remains in sync with the live usage totals.
- Verify there are no stale `status === 'online'` checks left in the frontend source.

> Do not run `supabase db push` against the live project until you explicitly confirm you want to apply the migration to the production ref `ueeskinlxggnxqnymiqg`.
